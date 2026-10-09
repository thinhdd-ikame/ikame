"""Generate the Coursiv AI-career-switch funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
Names match the IMG map in demo.html; drop any generated JPG into img/ with the same name.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Bright modern editorial photo or flat illustration, clean white and soft indigo #3B30C4 accents, calm natural light, "
         "friendly and practical, no text, no logo, no watermark.")
P = {
 "hook-a": "An adult in their 30s at a kitchen table with a laptop and a notebook, thoughtful and hopeful, new start mood, warm daylight, photo",
 "tg-mkt": "Flat illustration of a megaphone and a content calendar with small post cards, indigo and white",
 "tg-ops": "Flat illustration of a project timeline with checklist and gears, indigo and white",
 "tg-sup": "Flat illustration of a headset and friendly chat bubbles, indigo and white",
 "tg-data": "Flat illustration of a bar chart and a magnifying glass over a table, indigo and white",
 "tg-sales": "Flat illustration of a handshake and a small funnel of envelopes, indigo and white",
}
def gen(name):
    body = json.dumps({"model": MODEL, "prompt": f"{P[name]}. {STYLE}", "n": 1}).encode()
    req = urllib.request.Request(BASE, body, {"Authorization": f"Bearer {os.environ['IKAME_AI_KEY']}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            data = json.load(r)["data"][0]["b64_json"]
        Image.open(io.BytesIO(base64.b64decode(data))).convert("RGB").resize((560, 420), Image.LANCZOS).save(
            os.path.join(OUT, name + ".jpg"), quality=78, optimize=True, progressive=True)
        return f"ok   {name}"
    except Exception as e:
        return f"fail {name}: {e}"
if __name__ == "__main__":
    if not os.environ.get("IKAME_AI_KEY"): sys.exit("IKAME_AI_KEY is not set")
    names = sys.argv[1:] or [n for n in P if not os.path.exists(os.path.join(OUT, n + ".jpg"))]
    with ThreadPoolExecutor(4) as ex:
        for line in ex.map(gen, names): print(line, flush=True)
    # register every image present in img/ in demo.html's IMG map (art falls back to CSS/emoji for any that are missing)
    import re
    demo = os.path.join(os.path.dirname(OUT), "demo.html")
    have = sorted(n for n in P if os.path.exists(os.path.join(OUT, n + ".jpg")))
    m = "{" + ",".join(f"'img/{n}.jpg':'img/{n}.jpg'" for n in have) + "}"
    src = open(demo, encoding="utf-8").read()
    open(demo, "w", encoding="utf-8").write(re.sub(r"/\*IMG-START\*/.*?/\*IMG-END\*/", lambda _: "/*IMG-START*/" + m + "/*IMG-END*/", src, flags=re.S))
    print("IMG map:", m)
