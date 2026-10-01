"""Generate the ewa-latam funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
The demo ships with stand-ins copied from learning/ewa/img (same file names); pass names to overwrite them.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Warm cinematic film still, soft natural light, cream and orange palette #FFF8EF #E04A1F, original scene, "
         "no real actors, no text, no logo, no watermark, landscape 3:2.")
P = {
 "still-door": "Two friends talking at an apartment doorway at night, Latin American city, warm hallway light",
 "still-cafe": "Two friends laughing over coffee in a warm cafe, Latin American city",
 "still-dusk": "A woman on a city rooftop watching the sunset, mexican city skyline",
 "still-library": "A young man whispering on the phone inside a quiet public library, books behind him, warm light",
 "book-1": "A flat illustrated book cover, purple abstract shapes, no title text",
 "book-2": "A flat illustrated book cover, green abstract shapes, no title text",
 "book-3": "A flat illustrated book cover, amber abstract shapes, no title text",
 "tutor": "A friendly cartoon fox tutor avatar, round, orange fur, smiling, cream background, flat illustration",
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
    with ThreadPoolExecutor(4) as ex:
        for line in ex.map(gen, names): print(line, flush=True)
