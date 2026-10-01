"""Generate the ewa-books funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
Original art only: no real books, covers, authors, publishers or logos, and no text on any image.
Without a key the demo uses wordless stand-ins copied from learning/ewa (book-1..3, hook-books, reading, reading-night, tutor);
running this script overwrites only the names listed in P that do not exist yet (pass names to force a re-gen).
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Warm paper-cut illustration, cream and orange palette, soft grain, original fictional design, "
         "no text, no letters, no title, no logo, no watermark.")
P = {
 "book-1": ("Vertical book cover art, a small paper boat on calm purple waves under a big pale moon, romantic mood", (300, 450)),
 "book-2": ("Vertical book cover art, a dark forest path with one warm lit window far away, mystery mood", (300, 450)),
 "book-3": ("Vertical book cover art, a hot-air balloon over golden hills at sunrise, adventure mood", (300, 450)),
 "hook-books": ("Photo-style still life, an open paperback beside cream headphones and a cup of tea on linen, warm window light, horizontal 3:2", (480, 320)),
 "reading": ("Cozy cafe reading scene, a person smiling over a book at a window table, afternoon light, horizontal 3:2", (780, 520)),
 "reading-night": ("A dim hallway at night with one warm lamp and a half-open door, quiet suspense mood, horizontal 3:2", (780, 520)),
}
def gen(name):
    prompt, size = P[name]
    body = json.dumps({"model": MODEL, "prompt": f"{prompt}. {STYLE}", "n": 1}).encode()
    req = urllib.request.Request(BASE, body, {"Authorization": f"Bearer {os.environ['IKAME_AI_KEY']}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            data = json.load(r)["data"][0]["b64_json"]
        Image.open(io.BytesIO(base64.b64decode(data))).convert("RGB").resize(size, Image.LANCZOS).save(
            os.path.join(OUT, name + ".jpg"), quality=78, optimize=True, progressive=True)
        return f"ok   {name}"
    except Exception as e:
        return f"fail {name}: {e}"
if __name__ == "__main__":
    if not os.environ.get("IKAME_AI_KEY"): sys.exit("IKAME_AI_KEY is not set")
    names = sys.argv[1:] or [n for n in P if not os.path.exists(os.path.join(OUT, n + ".jpg"))]
    with ThreadPoolExecutor(4) as ex:
        for line in ex.map(gen, names): print(line, flush=True)
