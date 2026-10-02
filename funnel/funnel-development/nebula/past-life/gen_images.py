"""Generate the past-life funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
Names match the IMG map in demo.html. Existing files are skipped unless named explicitly.
NOTE: the JPGs currently in img/ are drawn placeholders (era ring + hooded silhouette); running this replaces them.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Mystical premium astrology app art, deep navy #161A27 night sky with fine stars, warm gold #E9C26B and soft blue glow, "
         "elegant, cinematic, vertical 2:3, no text, no logo, no watermark, no faces, no people except one faceless hooded silhouette.")
P = {
 "hook-eras": "A slow ring of five small glowing era emblems (an ancient column, a castle tower, a renaissance compass, a top hat, a vintage radio) turning in a night sky, a faint hooded silhouette behind the ring, mysterious and warm",
 "result-life": "A round golden medallion floating in a navy night sky, a hooded traveller silhouette inside it with an old road behind, fine constellations around, calm and mystical",
 "paywall-hero": "A hooded silhouette standing before a glowing ring of five eras, golden light on the horizon, old stone road leading into mist, quiet and hopeful mood",
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
    names = sys.argv[1:] or list(P)
    with ThreadPoolExecutor(3) as ex:
        for line in ex.map(gen, names): print(line, flush=True)
