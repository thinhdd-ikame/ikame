"""Generate the mygrowth-charisma funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Friendly flat vector illustration for a communication-skills app, white background, lavender #EBE9F7 panels, "
         "violet #7D73E3 and orange #FF9F00 accents, soft shapes, vertical 2:3, no text, no logo, no watermark.")
P = {
 "hook-talk": "Two friendly people trading speech bubbles, a third empty bubble filling in with a soft violet glow",
 "hook-chat": "A phone showing a chat card with one friendly line and three reply chips, one chip highlighted",
 "sim-party": "Two people chatting by a snack table at a cheerful house party, warm lights",
 "sim-work": "Two colleagues meeting at an office coffee machine, one new and smiling",
 "sim-date": "Two people at a candle-lit cafe table, relaxed first date, warm tones",
 "style-listener": "A person leaning in with a big ear-shaped speech bubble and a heart, calm and attentive",
 "style-storyteller": "A person gesturing with a colourful comic-style speech bubble full of tiny scenes, lively",
 "style-connector": "Two speech bubbles linking like puzzle pieces between two people, balanced and warm",
 "paywall-hero": "A confident smiling person holding a phone showing flip-style script cards, soft violet backdrop",
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
