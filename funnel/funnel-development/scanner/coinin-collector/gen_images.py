"""Generate the CoinIn collector funnel images (Edward avatar, extra coin pictures) via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Premium coin-collector app art, charcoal #151412 background, warm antique gold #D2AE67 accents, "
         "soft museum lighting, macro detail, vertical 2:3, no text, no logo, no watermark.")
P = {
 # Edward: an ILLUSTRATED guide (drawn character), never a photo of a real person. Label it as illustrative in the UI.
 "edward": "A warm hand-drawn illustration of a friendly elderly man with white hair, round glasses and a flat cap, smiling, shoulders-up, flat vector style, not a photograph",
 "quarter-1964": "A macro studio photo of a worn 1964 US Washington quarter, silver, front side, centered on dark cloth",
 "quarter-edge": "A macro studio photo of the edge of a silver US quarter showing a solid silver edge, dark background",
 "cent-1943": "A macro studio photo of a worn 1943 US steel cent, silver-gray, front side, centered on dark cloth",
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
