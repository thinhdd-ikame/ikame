"""Generate the autism-traits funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
Names match the keys in demo.html's IMG map (img/<name>.jpg). Placeholder JPGs ship in img/ until this is run.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Calm, gentle editorial still life on warm off-white paper, ink navy #15233F and one amber #E39B2D accent, soft daylight, "
         "overhead view, minimal, 3:2 landscape, no text, no letters, no logo, no watermark.")
P = {
 "hero": "Five soft rounded paper tiles in a row in muted navy, sage and sand tones, with five thin horizontal bars beneath them half filled, a pencil and a small cup of tea beside them",
 "howto": "A quiet desk with a notebook, a pencil, a small clock and a soft lamp, calm and unhurried, a few paper circles from empty to filled",
 "report": "A sealed navy report folder with an amber ribbon, five small paper tiles fanned beside it and a sprig of greenery",
 "profile": "A single tall paper notes page with five short bars and three blank lines, leaning on a navy notebook with a pencil",
 "next": "A stack of five small paper cards fanned like a deck, navy, sage and amber edges",
}
def gen(name):
    body = json.dumps({"model": MODEL, "prompt": f"{P[name]}. {STYLE}", "n": 1}).encode()
    req = urllib.request.Request(BASE, body, {"Authorization": f"Bearer {os.environ['IKAME_AI_KEY']}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            data = json.load(r)["data"][0]["b64_json"]
        Image.open(io.BytesIO(base64.b64decode(data))).convert("RGB").resize((720, 480), Image.LANCZOS).save(
            os.path.join(OUT, name + ".jpg"), quality=78, optimize=True, progressive=True)
        return f"ok   {name}"
    except Exception as e:
        return f"fail {name}: {e}"
if __name__ == "__main__":
    if not os.environ.get("IKAME_AI_KEY"): sys.exit("IKAME_AI_KEY is not set")
    names = sys.argv[1:] or list(P)
    with ThreadPoolExecutor(4) as ex:
        for line in ex.map(gen, names): print(line, flush=True)
