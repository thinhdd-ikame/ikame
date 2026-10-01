"""Generate the illustrated genre / scene cards for the chai-roleplay funnel.

Uses ikame's LiteLLM gateway (same as creative-video-generator), model gemini-3.1-flash-image. Key from env only:
    IKAME_AI_KEY=... python3 gen_images.py            # all missing images
    IKAME_AI_KEY=... python3 gen_images.py hook       # just these
Outputs 560x840 JPEGs into img/. Existing files are skipped unless named explicitly.
Stylised illustration only (no photoreal people). All characters adult, clothed, SFW.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"  # OpenAI image models 400 on stylised prompts here; gemini returns ~848x1264
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")

STYLE = ("Painterly digital storybook illustration, rich cinematic lighting, dark moody palette with a violet-magenta rim light, "
         "detailed environment, any characters are clothed adults, safe for work, vertical 2:3 card composition, "
         "no text, no logo, no watermark.")

P = {
 "hook":            "an open storybook on a dark table spilling five tiny glowing scenes: a dragon spire, a rainy detective alley, an orbit station, a candlelit ballroom, a fog-wrapped lighthouse",
 "genre-fantasy":   "an ember-lit castle keep on a cliff at dusk, a dragon silhouette in the sky, warm amber glow",
 "genre-mystery":   "a rainy neon alley at night, a lone figure in a trench coat under a streetlamp, teal fog",
 "genre-scifi":     "an orbital space station window looking at a ringed planet, cyan holographic light, a figure in a flight suit from behind",
 "genre-romance":   "a candlelit ballroom with two silhouettes in formal wear almost touching hands, rose and gold light",
 "genre-horror":    "a fog-wrapped lighthouse on a black sea at night, one lit window, crimson moon, suspense not gore",
}

def gen(name):
    key = os.environ.get("IKAME_AI_KEY")
    body = json.dumps({"model": MODEL, "prompt": f"{P[name]}. {STYLE}", "n": 1}).encode()
    req = urllib.request.Request(BASE, body, {"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    last = ""
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
    os.makedirs(OUT, exist_ok=True)
    names = sys.argv[1:] or [n for n in P if not os.path.exists(os.path.join(OUT, n + ".jpg"))]
    with ThreadPoolExecutor(4) as ex:
        for line in ex.map(gen, names):
            print(line, flush=True)
