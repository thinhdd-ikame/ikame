"""Generate the ewa-speak-ai funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
Original illustrated avatars only: no real people, shows or logos. tutor-fox.jpg is a copy of the learning/ewa tutor still.
After generating tutor-owl / tutor-spark / hero-speak, add them to the IMG map in demo.html (the demo shows emoji stand-ins until then).
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Friendly flat-illustration mascot avatar, warm cream and orange palette, soft shading, centered head-and-shoulders, "
         "plain soft background, original character, square 1:1, no text, no logo, no watermark.")
P = {
 "tutor-fox": "A friendly fox AI tutor wearing small headphones, warm smile",
 "tutor-owl": "A calm precise owl AI tutor wearing round glasses and small headphones",
 "tutor-spark": "An upbeat lightning-bolt shaped spark mascot AI tutor with a cheerful face and small headphones",
 "hero-speak": "A smiling young person speaking into a phone with soft sound-wave rings around them, warm cafe light, cream and orange palette, 3:2, original illustration",
}
def gen(name):
    body = json.dumps({"model": MODEL, "prompt": f"{P[name]}. {STYLE}", "n": 1}).encode()
    req = urllib.request.Request(BASE, body, {"Authorization": f"Bearer {os.environ['IKAME_AI_KEY']}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            data = json.load(r)["data"][0]["b64_json"]
        Image.open(io.BytesIO(base64.b64decode(data))).convert("RGB").resize((520, 520) if name.startswith("tutor") else (780, 520), Image.LANCZOS).save(
            os.path.join(OUT, name + ".jpg"), quality=78, optimize=True, progressive=True)
        return f"ok   {name}"
    except Exception as e:
        return f"fail {name}: {e}"
if __name__ == "__main__":
    if not os.environ.get("IKAME_AI_KEY"): sys.exit("IKAME_AI_KEY is not set")
    names = sys.argv[1:] or [n for n in P if not os.path.exists(os.path.join(OUT, n + ".jpg"))]
    with ThreadPoolExecutor(4) as ex:
        for line in ex.map(gen, names): print(line, flush=True)
