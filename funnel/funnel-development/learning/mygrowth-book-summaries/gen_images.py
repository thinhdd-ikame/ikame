"""Generate the mygrowth-book-summaries funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
    Existing placeholder art in img/ is skipped unless you pass names, e.g. python3 gen_images.py hook-book hook-card idea-card shelf paywall-hero
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Friendly flat vector illustration for a reading and key-ideas app, white background, lavender #EBE9F7 panels, "
         "violet #7D73E3 and orange #FF9F00 accents, soft shapes, vertical 2:3, no text, no logo, no watermark.")
P = {
 "hook-book": "A thick open book closing into one glowing idea card that floats up, soft violet glow",
 "hook-card": "A single clean idea card with three labelled rows, a small lightbulb, on a lavender panel",
 "idea-card": "A tall idea card flipping open to reveal a short sentence, soft shadow",
 "shelf": "Three colourful book spines standing on a flat minimal shelf, violet and orange accents",
 "paywall-hero": "A person relaxing with a phone showing an idea card, three books stacked beside them, soft violet backdrop",
}
def gen(name):
    body = json.dumps({"model": MODEL, "prompt": f"{P[name]}. {STYLE}", "n": 1}).encode()
    req = urllib.request.Request(BASE, body, {"Authorization": f"Bearer {os.environ['IKAME_AI_KEY']}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            data = json.load(r)["data"][0]["b64_json"]
        Image.open(io.BytesIO(base64.b64decode(data))).convert("RGB").resize((560, 840), Image.LANCZOS).save(
            os.path.join(OUT, name + ".jpg"), quality=78, optimize=True, progressive=True)
        return f"ok   {name}"
    except Exception as e:
        return f"fail {name}: {e}"
if __name__ == "__main__":
    if not os.environ.get("IKAME_AI_KEY"): sys.exit("IKAME_AI_KEY is not set")
    names = sys.argv[1:] or [n for n in P if not os.path.exists(os.path.join(OUT, n + ".jpg"))]
    with ThreadPoolExecutor(4) as ex:
        for line in ex.map(gen, names): print(line, flush=True)
