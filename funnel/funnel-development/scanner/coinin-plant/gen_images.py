"""Generate the CoinIn plant funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Premium plant-care app art, charcoal #151412 background, fresh leaf green #8FCB8B accents, "
         "soft natural window light, macro detail, vertical 2:3, no text, no logo, no watermark.")
P = {
 # names match the placeholder JPGs drawn for the demo; running this overwrites them. Fern stays a DRAWN guide (built in SVG in the demo).
 "hero": "A lush houseplant with drooping, yellowing leaves against a dark wall, moody natural light",
 "window": "A potted houseplant on a wooden windowsill with soft morning light, plain background",
 "leafy-front": "A healthy-looking Monstera in a terracotta pot, whole plant, centered on a plain dark background",
 "leafy-close": "A close-up of a green leaf with a few small brown spots and a yellowing edge, macro, dark background",
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
    names = sys.argv[1:] or list(P)
    with ThreadPoolExecutor(4) as ex:
        for line in ex.map(gen, names): print(line, flush=True)
