"""Generate the aura-tarot funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
Names match the IMG map in demo.html. Existing files are skipped unless named explicitly.
NOTE: the JPGs currently in img/ are locally drawn placeholders (halo / card back); running this replaces them.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Mystical premium aura and tarot app art, deep navy #161A27 night sky with fine stars, warm gold #E9C26B and soft glowing color, "
         "elegant, cinematic, vertical 2:3, no text, no logo, no watermark, no real faces.")
P = {
 "hook-aura": "The dark silhouette of a calm person from behind, surrounded by a large soft glowing halo of indigo, violet and amber light",
 "reveal-aura": "A radiant indigo aura glowing around a faint silhouette, soft particles of light drifting up, calm and awe-inspiring",
 "card-back": "The back of a single tarot card, ornate gold geometric pattern with a central diamond and tiny stars on deep navy, symmetrical, top-down",
 "paywall-hero": "A calm moonlit table with three tarot cards fanned out, a soft aura halo of violet light above them, a single candle, no people",
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
