"""Generate the painted character portraits + scene backdrops for the chai-named-character funnel.

Uses ikame's LiteLLM gateway (same as creative-video-generator), model gemini-3.1-flash-image. Key from env only:
    IKAME_AI_KEY=... python3 gen_images.py            # all missing images
    IKAME_AI_KEY=... python3 gen_images.py leo        # just these
Outputs 560x840 JPEGs into img/. Existing real images are skipped unless named explicitly; small placeholder files (<20 KB) are replaced.
Names match the demo's IMG map (img/<name>.jpg). Characters are women, glamour-photo style like chai-dream-girl: clothed, clearly adult.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"  # OpenAI image models 400 on these prompts
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")

STYLE = ("Photorealistic glamour photograph, Instagram-model aesthetic, shot on 85mm, soft cinematic key light, "
         "shallow depth of field, dark moody background with a violet-magenta rim light, natural skin texture. "
         "Glamorous, confident, flirty editorial mood. Clothed (no nudity), clearly an adult woman about 26-30. "
         "Vertical 2:3 composition, subject centered, no text, no logo, no watermark.")
WOMAN = "a stunningly beautiful adult woman, model features, glam makeup, glossy styled hair, confident flirty gaze"
SCENE_STYLE = ("Painted cinematic illustration of an empty interior, atmospheric lighting, shallow depth of field, "
               "no people, vertical 2:3 composition, no text, no logo, no watermark.")

P = {
 "leo":  f"{WOMAN}, long chestnut waves, fitted black off-shoulder knit top and a thin gold necklace, reading glasses pushed up in her hair, leaning on a bookshop counter with warm lamps behind, playful half smile, waist up",
 "mara": f"{WOMAN}, sleek black bob with a silver streak, fitted navy captain's uniform jacket with gold trim unzipped over a black bodysuit, standing on a starship bridge with stars behind, commanding smouldering look, waist up",
 "kai":  f"{WOMAN}, messy high ponytail, fitted black crop top under a loosely tied white chef's apron, towel over her shoulder, teasing smirk, restaurant kitchen at night with copper pans and warm light behind, waist up",
 "scene-leo":  "a cosy rainy bookshop at closing time, warm lamps, tall shelves, a rain-streaked window",
 "scene-mara": "a starship bridge with a huge window full of stars and a nebula, glowing consoles, a captain's chair",
 "scene-kai":  "a restaurant kitchen pass at midnight, copper pans, steam, warm orange lights",
}

def gen(name):
    key = os.environ.get("IKAME_AI_KEY")
    body = json.dumps({"model": MODEL, "prompt": f"{P[name]}. {SCENE_STYLE if name.startswith('scene-') else STYLE}", "n": 1}).encode()
    req = urllib.request.Request(BASE, body, {"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                data = json.load(r)["data"][0]["b64_json"]
            im = Image.open(io.BytesIO(base64.b64decode(data))).convert("RGB").resize((560, 840), Image.LANCZOS)
            im.save(os.path.join(OUT, name + ".jpg"), quality=78, optimize=True, progressive=True)
            return f"ok   {name}"
        except Exception as e:
            err = getattr(e, "read", lambda: b"")()[:200]
            last = f"fail {name}: {e} {err!r}"
    return last

if __name__ == "__main__":
    if not os.environ.get("IKAME_AI_KEY"):
        sys.exit("IKAME_AI_KEY is not set")
    MIN = 20000  # files smaller than this are CSS-drawn placeholders and get replaced
    have = lambda n: os.path.exists(os.path.join(OUT, n + ".jpg")) and os.path.getsize(os.path.join(OUT, n + ".jpg")) > MIN
    names = sys.argv[1:] or [n for n in P if not have(n)]
    with ThreadPoolExecutor(4) as ex:
        for line in ex.map(gen, names):
            print(line, flush=True)
