"""Generate the archetype funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
Names match the keys in demo.html's IMG map (img/<name>.jpg). Placeholder JPGs ship in img/ until this is run.
The 48 pair-tile scene illustrations (12 archetypes x 4 scenes, labels in demo.html AR[].sc) are emoji art for now; add prompts here later.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Calm editorial still life on warm off-white paper, ink navy #15233F and one amber #E39B2D accent, soft daylight, "
         "overhead view, minimal, 3:2 landscape, no text, no letters, no logo, no watermark.")
P = {
 "hero": "A ring of twelve round paper emblems around an empty center, one emblem amber, the rest navy and white",
 "howto": "Four paper image tiles in a two by two grid, one tile in each pair raised and highlighted, a pencil beside them",
 "report": "A sealed navy report folder with an amber wax seal and a few small round emblems fanned out beside it",
 "profile": "A tall paper profile card showing a circular twelve-wedge wheel chart in navy with one amber wedge",
 "next": "A stack of five small paper cards fanned like a deck, navy and amber edges",
}
def gen(name):
    body = json.dumps({"model": MODEL, "prompt": f"{P[name]}. {STYLE}", "n": 1}).encode()
    req = urllib.request.Request(BASE, body, {"Authorization": f"Bearer {os.environ['IKAME_AI_KEY']}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            data = json.load(r)["data"][0]["b64_json"]
        Image.open(io.BytesIO(base64.b64decode(data))).convert("RGB").resize((720, 480), Image.LANCZOS).save(
            os.path.join(OUT, name + ".jpg"), quality=78, optimize=True, progressive=True)
        return f"ok   {name}"
    except Exception as e:
        return f"fail {name}: {e}"
if __name__ == "__main__":
    if not os.environ.get("IKAME_AI_KEY"): sys.exit("IKAME_AI_KEY is not set")
    names = sys.argv[1:] or list(P)
    with ThreadPoolExecutor(4) as ex:
        for line in ex.map(gen, names): print(line, flush=True)
