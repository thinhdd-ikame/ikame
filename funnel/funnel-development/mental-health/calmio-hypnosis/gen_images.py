"""Generate the calmio-hypnosis funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [--force] [names...]
The demo currently ships with calm stand-in photos copied from mental-health/calmio-sleep under the same
names; run with --force to replace them with the hypnosis versions below. JPG, <=200 KB.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Soft calm wellbeing app photography, warm off-white, sage green and muted lavender palette, gentle morning light, "
         "airy, quiet, no people, no faces, no text, no logo, no watermark, vertical 2:3.")
P = {
 "hook-calm": "A quiet softly lit living room corner at dusk, a pair of headphones resting on a cushion beside a mug of tea and a small plant, lavender and sage tones",
 "hook-session": "A calm bedroom nook with a folded blanket, a pair of headphones on the pillow and a glass of water on the nightstand, warm low light",
 "topic-pack": "A tidy wooden shelf with a small green plant, a candle and a pair of headphones, lots of empty space, soft evening light",
 "payoff-dawn": "A bright calm sunrise over a quiet hillside, soft lavender and sage tones, mist in the valley, open path ahead",
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
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    force = "--force" in sys.argv
    names = args or [n for n in P if force or not os.path.exists(os.path.join(OUT, n + ".jpg"))]
    with ThreadPoolExecutor(4) as ex:
        for line in ex.map(gen, names): print(line, flush=True)
