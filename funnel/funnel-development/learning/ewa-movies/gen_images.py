"""Generate the ewa-movies funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
Original illustrated scenes only: no real shows, actors, posters or logos.
scene-door / scene-cafe / scene-dusk / tutor start as copies of the learning/ewa stills (already original art);
scene-night (suspense genre) has no file yet, the demo shows a CSS placeholder until it is generated.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Warm cinematic TV-series still, soft film grain, cream and orange palette, shallow depth of field, "
         "original fictional characters, horizontal 3:2, no text, no subtitles, no logo, no watermark.")
P = {
 "scene-door": "Two friends talking at an apartment doorway at night, warm hallway light, relaxed sitcom mood",
 "scene-cafe": "Two friends laughing over coffee in a warm cafe, afternoon light, sitcom mood",
 "scene-dusk": "A woman on a city rooftop watching the sunset, calm, cinematic",
 "scene-night": "Two people whispering in a dark alley under a flickering streetlamp, one glancing over a shoulder, tense suspense-drama mood, deep teal shadows with one orange light",
}
def gen(name):
    body = json.dumps({"model": MODEL, "prompt": f"{P[name]}. {STYLE}", "n": 1}).encode()
    req = urllib.request.Request(BASE, body, {"Authorization": f"Bearer {os.environ['IKAME_AI_KEY']}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            data = json.load(r)["data"][0]["b64_json"]
        Image.open(io.BytesIO(base64.b64decode(data))).convert("RGB").resize((780, 520), Image.LANCZOS).save(
            os.path.join(OUT, name + ".jpg"), quality=78, optimize=True, progressive=True)
        return f"ok   {name}"
    except Exception as e:
        return f"fail {name}: {e}"
if __name__ == "__main__":
    if not os.environ.get("IKAME_AI_KEY"): sys.exit("IKAME_AI_KEY is not set")
    names = sys.argv[1:] or [n for n in P if not os.path.exists(os.path.join(OUT, n + ".jpg"))]
    with ThreadPoolExecutor(4) as ex:
        for line in ex.map(gen, names): print(line, flush=True)
