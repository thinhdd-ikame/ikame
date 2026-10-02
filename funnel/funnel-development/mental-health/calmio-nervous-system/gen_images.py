"""Generate the calmio-nervous-system funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [--force] [names...]
The demo ships with calm stand-in photos copied from mental-health/calmio-stress under the OLD names
(hook-desk, hook-reset, topic-calm, payoff-park). The demo's IMG map lists both old and new names, so after running
this script (new names: hook-night, hook-calm, topic-calm, payoff-dawn) switch the four IMG entries over. JPG, <=200 KB.
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
 "hook-night": "A quiet bedroom at night with a softly lit lamp, rumpled linen and a glass of water on the nightstand, lavender dusk through the window",
 "hook-calm": "A calm corner of a sunlit room with a folded blanket, a small sage-green plant and a single mug, soft slow light",
 "topic-calm": "A clear light desk with one small sage-green plant and a single neat notepad, lots of empty space",
 "payoff-dawn": "A bright calm sunrise over a quiet meadow, soft lavender and sage tones, dew on grass, open path ahead",
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
