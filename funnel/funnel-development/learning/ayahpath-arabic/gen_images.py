"""Generate the AyahPath Arabic funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
Images must contain NO text, letters or calligraphy: all Arabic in the demo is live HTML text
(AI image models garble Arabic script). The demo overlays the real Uthmani text on top of the picture.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Calm devotional learning-app art, deep emerald #0F3D2E background, muted gold #C9A55C and cream parchment accents, "
         "faint 8-point Islamic geometric pattern, soft light, elegant, horizontal 4:3, no people, no faces, "
         "no text, no letters, no calligraphy, no logo, no watermark.")
P = {
 "hook-fatiha": "A softly glowing gold light rising behind a deep emerald geometric lattice, quiet and reverent, empty space in the middle for text",
 "hook-words": "Rows of small cream parchment word tiles on emerald, a few tiles glowing gold, abstract, no writing on the tiles",
 "lantern-path": "A winding path of cream stepping-stones rising toward a small glowing brass lantern at dusk, emerald and gold",
 "result-glow": "A warm gold glow spreading across an emerald geometric pattern like sunrise, abstract, empty center",
 "paywall-hero": "Concentric gold arcs like a mihrab-inspired archway of light over deep emerald, abstract, no figures",
 "payoff-dawn": "A quiet dawn horizon with a soft gold sun behind emerald hills, a single small lantern in the foreground",
}
def gen(name):
    body = json.dumps({"model": MODEL, "prompt": f"{P[name]}. {STYLE}", "n": 1}).encode()
    req = urllib.request.Request(BASE, body, {"Authorization": f"Bearer {os.environ['IKAME_AI_KEY']}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            data = json.load(r)["data"][0]["b64_json"]
        Image.open(io.BytesIO(base64.b64decode(data))).convert("RGB").resize((560, 420), Image.LANCZOS).save(
            os.path.join(OUT, name + ".jpg"), quality=78, optimize=True, progressive=True)
        return f"ok   {name}"
    except Exception as e:
        return f"fail {name}: {e}"
if __name__ == "__main__":
    if not os.environ.get("IKAME_AI_KEY"): sys.exit("IKAME_AI_KEY is not set")
    names = sys.argv[1:] or list(P)
    with ThreadPoolExecutor(4) as ex:
        for line in ex.map(gen, names): print(line, flush=True)
