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

STYLE_SQ = STYLE.replace("vertical 2:3 card composition", "square avatar composition, face centred in the upper half")
P = {
 "hook":             "three tilted vertical drama story frames side by side: a rainy wedding terrace at night, a neon detective office at 3am, a torchlit royal court, with thin progress bars on top of each frame",
 "series-romance":   "a rainy wedding terrace at night, a woman in a green dress and a stranger in a navy suit seated close at a candlelit table, a small brass key between them, rose and gold light",
 "series-thriller":  "Detective Nora Vale, a woman in her early 30s with dark shoulder-length hair in a belted trench coat, standing at a neon-lit night-shift office window holding a case file, a red string board behind her, teal fog, tense; she is clearly the only main figure and clearly a woman",
 "series-fantasy":   "a young duke in dark armour and a scholar in a ember-lit throne hall, a crown cracked and smoking on a stone table, amber torchlight",
 # lead portraits (square avatars): adults 25+, clothed, head-and-shoulders, same painterly style as the posters
 "lead-romance":     "head-and-shoulders portrait of Leo, a man around 30 with short dark wavy hair and light stubble, wearing a navy suit and white shirt, warm candle and string-light bokeh behind, rose and gold light, looking at the viewer with a half smile",
 "lead-thriller":    "head-and-shoulders portrait of Detective Nora Vale, a woman around 32 with dark shoulder-length hair, wearing a belted beige trench coat, teal neon office light and rain-streaked window behind, calm intense gaze at the viewer",
 "lead-fantasy":     "head-and-shoulders portrait of Alden, a young duke around 28 with dark swept hair, wearing dark ornate armour with a fur collar, amber torchlit stone hall behind, serious gaze at the viewer",
}
SQUARE = {"lead-romance", "lead-thriller", "lead-fantasy"}

def gen(name):
    key = os.environ.get("IKAME_AI_KEY")
    body = json.dumps({"model": MODEL, "prompt": f"{P[name]}. {STYLE_SQ if name in SQUARE else STYLE}", "n": 1}).encode()
    req = urllib.request.Request(BASE, body, {"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    last = ""
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                data = json.load(r)["data"][0]["b64_json"]
            im = Image.open(io.BytesIO(base64.b64decode(data))).convert("RGB")
            if name in SQUARE:   # centre-crop the top of the frame (face) to a square avatar
                w, h = im.size; d = min(w, h); im = im.crop(((w - d) // 2, 0, (w - d) // 2 + d, d)).resize((400, 400), Image.LANCZOS)
            else:
                im = im.resize((560, 840), Image.LANCZOS)
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
