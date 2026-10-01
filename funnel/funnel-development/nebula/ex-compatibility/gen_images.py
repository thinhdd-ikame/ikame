"""Generate the ex-compatibility funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
Names match the IMG map in demo.html. Existing files are skipped unless named explicitly.
NOTE: the JPGs currently in img/ are locally drawn placeholders (two chart wheels); running this replaces them.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Mystical premium astrology app art, deep navy #161A27 night sky with fine stars, warm gold #E9C26B and soft blue glow, "
         "elegant, cinematic, vertical 2:3, no text, no logo, no watermark, no people.")
P = {
 "hook-wheels": "Two large glowing astrological birth-chart wheels with fine tick rings, drifting slightly apart in a night sky, a faint gold thread between their centres",
 "result-wheels": "Two birth-chart wheels overlapping so their rings form a glowing lens of light, one gold and one soft blue, small planets as bright dots",
 "paywall-hero": "Two overlapping birth-chart wheels glowing warmly, with a quiet sunrise-coloured horizon line behind them, hopeful and calm mood",
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
