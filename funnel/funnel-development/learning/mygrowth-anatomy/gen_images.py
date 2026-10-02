"""Generate the mygrowth-anatomy funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
After generating, set each value in demo.html's IMG map to its own path (e.g. 'img/hook-body.jpg':'img/hook-body.jpg').
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Friendly flat vector illustration for a micro-learning app about the human body, white background, lavender #EBE9F7 panels, "
         "violet #7D73E3 and orange #FF9F00 accents, soft rounded shapes, non-graphic and educational, no text, no logo, no watermark.")
P = {
 "hook-body": "A cheerful stylised skeleton waving next to a red heart and a pink brain, small floating lesson cards around them",
 "kc-bones": "A simple friendly skeleton standing in front of a lavender lesson card, calm and clean",
 "kc-skin": "A smooth stylised body silhouette with a soft layered cross-section of skin beside it, warm peach palette",
 "kc-water": "A stylised body silhouette filled about sixty percent with blue water and a few water drops, soft blue palette",
 "course-cover": "Abstract course cover with a heart, a lung, a brain and a bone arranged in a ring on a violet gradient",
 "paywall-hero": "A smiling learner on a sofa holding a phone showing an anatomy lesson card, a small skeleton figure on the screen",
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
