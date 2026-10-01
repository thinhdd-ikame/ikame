"""Generate the illustrated series poster cards for the chai-short-drama funnel.

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
 "hook":             "three tilted vertical drama story frames side by side: a rainy wedding terrace at night, a neon detective office at 3am, a torchlit royal court, with thin progress bars on top of each frame",
 "series-romance":   "a rainy wedding terrace at night, a woman in a green dress and a stranger in a navy suit seated close at a candlelit table, a small brass key between them, rose and gold light",
 "series-thriller":  "a night-shift detective in a rain coat at a neon-lit office window, a case file with a red string board behind, teal fog, tense",
 "series-fantasy":   "a young duke in dark armour and a scholar in a ember-lit throne hall, a crown cracked and smoking on a stone table, amber torchlight",
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
