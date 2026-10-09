"""Generate the mygrowth-genealogy funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Friendly flat vector illustration for a micro-learning history app, white background, lavender #EBE9F7 panels, "
         "violet #7D73E3 and orange #FF9F00 accents, soft shapes, vertical 2:3, no text, no logo, no watermark.")
P = {
 "hook-roots": "A hand-drawn world map with dotted migration routes between continents, small orange pins, a compass in the corner",
 "cover-origins": "A ship, a suitcase and a compass over an old map, calm and curious",
 "cover-traditions": "A family table with a festival lantern, a recipe card and handmade textiles",
 "cover-lands": "Rolling hills, a small village and a folded paper map with a route line",
 "kc-ellis": "A ferry approaching a large red-brick hall on an island, seagulls, early morning light",
 "kc-famine": "An empty field at dusk and a tall ship on the horizon, quiet and respectful, no people",
 "paywall-hero": "A smiling learner on a sofa holding a phone showing a lesson card, a framed old family photo and a map on the wall",
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
    os.makedirs(OUT, exist_ok=True)
    names = sys.argv[1:] or [n for n in P if not os.path.exists(os.path.join(OUT, n + ".jpg"))]
    with ThreadPoolExecutor(4) as ex:
        for line in ex.map(gen, names): print(line, flush=True)
