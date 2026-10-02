"""Generate the CoinIn antique funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
Names match the IMG map in demo.html. Existing files are skipped unless named explicitly.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Premium antiques app art, warm charcoal #141311 background, antique gold #C9A45C light, soft macro photography, "
         "vertical 2:3, no text, no logos, no watermark, no real brands, generic invented pieces only.")
P = {
 "hook-attic": "A blue-and-white porcelain vase and a tarnished silver bowl on a dusty wooden attic shelf, a warm shaft of light through a small window, boxes blurred behind, nostalgic and quiet",
 "item-sample": "A single blue-and-white glazed porcelain vase on dark cloth seen slightly from above, soft warm light, a few small age marks on the glaze, no readable text",
 "item-underside": "Close macro of the unglazed underside of a porcelain vase base showing a small hand-painted maker's mark ring, warm light, dark cloth, no readable text",
 "paywall-hero": "A neat arrangement of a vase, a small silver bowl and a mantel clock on dark cloth beside a magnifying loupe and a notebook, gold light, calm organised mood",
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
