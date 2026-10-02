"""Generate the ayahpath-halal-finance funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
Existing files in img/ are skipped (img/ currently holds the sibling learning/ayahpath images under these names).
Delete a file, or pass its name explicitly, to regenerate it.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Calm devotional photographic illustration for a Quran study app, deep emerald and cream parchment with muted gold, "
         "soft natural light, vertical 2:3, no people, no faces, no text, no calligraphy, no logo, no watermark.")
P = {
 "hook-dawn": "Dawn light through an arched window with a carved geometric lattice, empty room, gentle gold glow",
 "lantern": "A brass lantern glowing at dusk among faint stars, emerald background",
 "stones": "Soft stepping stones winding up toward a small glowing lantern, emerald dusk",
 "prayer-mat": "A folded prayer mat and a small book on a wooden floor in morning light, no people",
 "fajr-tea": "A cup of tea and a closed book on a windowsill at first light, quiet and warm",
 "payoff-sunrise": "A calm sunrise over desert dunes, gold and emerald sky, serene",
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
