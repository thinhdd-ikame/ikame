"""Generate the CoinIn notes / stamps / gems funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
The demo draws SVG art until these files exist; keep the same names. cloth.jpg is reused from scanner/coinin.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Premium collector app art, charcoal #151412 background, warm antique gold #D2AE67 accents, "
         "soft museum lighting, macro detail, vertical 2:3, no readable text, no logo, no watermark.")
P = {
 "hero-trio": "A vintage US one-dollar silver certificate banknote, a purple 1930s postage stamp and a cut oval blue sapphire resting together on dark linen cloth",
 "sample-note": "A macro studio photo of a lightly folded vintage US one dollar silver certificate with a blue seal, flat on dark cloth",
 "sample-stamp": "A macro studio photo of a purple 1930s US three-cent postage stamp with perforated edges on dark cloth, tweezers beside it",
 "sample-gem": "A macro studio photo of a loose oval-cut blue sapphire with soft facet highlights on dark cloth",
 "game-glass": "A macro photo of a blue glass imitation gemstone showing small round gas bubbles inside, dark background",
 "game-sapphire": "A macro photo of a natural blue sapphire showing fine needle-like silk inclusions inside, dark background",
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
