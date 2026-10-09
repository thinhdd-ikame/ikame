"""Generate the ewa-travel-work scene images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
The demo draws CSS placeholder art for scene-*.jpg until these exist; after generating, run build.py-style inlining
or add the names to the IMG map (build.py embeds every img/*.jpg). tutor.jpg is a copy of learning/ewa/img/tutor.jpg.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Warm illustrated scene, soft natural light, cream and orange palette #FFF8EF #E04A1F, original scene, "
         "no real people likenesses, no text, no logo, no watermark, landscape 3:2.")
P = {
 "scene-airport": "A bright airport check-in hall, a traveler with a small suitcase talking to a friendly desk agent",
 "scene-office": "A bright modern office, a candidate and an interviewer shaking hands across a desk",
 "scene-meeting": "A small team meeting around a table with a laptop and a wall screen, friendly mood",
}
def gen(name):
    body = json.dumps({"model": MODEL, "prompt": f"{P[name]}. {STYLE}", "n": 1}).encode()
    req = urllib.request.Request(BASE, body, {"Authorization": f"Bearer {os.environ['IKAME_AI_KEY']}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            data = json.load(r)["data"][0]["b64_json"]
        im = Image.open(io.BytesIO(base64.b64decode(data))).convert("RGB")
        im.thumbnail((720, 720))
        im.save(os.path.join(OUT, name + ".jpg"), quality=76, optimize=True, progressive=True)
        return f"ok   {name}"
    except Exception as e:
        return f"fail {name}: {e}"
if __name__ == "__main__":
    if not os.environ.get("IKAME_AI_KEY"): sys.exit("IKAME_AI_KEY is not set")
    names = sys.argv[1:] or [n for n in P if not os.path.exists(os.path.join(OUT, n + ".jpg"))]
    with ThreadPoolExecutor(3) as ex:
        for line in ex.map(gen, names): print(line, flush=True)
