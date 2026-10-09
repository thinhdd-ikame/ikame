"""Generate the CoinIn trading-cards funnel images via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]
Names match the IMG map in demo.html. Existing files are skipped unless named explicitly.
NOTE: the JPGs currently in img/ are drawn placeholders (drawn card fan); running this replaces them.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
STYLE = ("Premium collectibles app art, warm charcoal #141311 background, antique gold #C9A45C light, soft macro photography, "
         "vertical 2:3, no text, no logos, no watermark, no real brands or characters, generic invented card art only.")
P = {
 "hook-cards": "A loose fan of three generic collectible trading cards (a dragon-like creature, a basketball player silhouette, a wizard) resting on dark cloth under warm light, a shoebox of old cards behind them, gold rim light",
 "card-sample": "A single generic collectible trading card on dark cloth seen from above, slightly worn corners, a fierce ember-colored dragon illustration in the art window, blank name bar, no readable text",
 "card-sports": "A single generic collectible basketball rookie trading card on dark cloth seen from above, a dynamic invented player silhouette mid-dunk in blue tones in the art window, blank name bar, no readable text, no real player or team",
 "card-fantasy": "A single generic fantasy strategy trading card on dark cloth seen from above, a hooded mage casting a violet mirror spell in the art window, blank name bar, no readable text",
 "paywall-hero": "A neat stack of trading cards in clear protective sleeves beside a magnifying loupe on dark cloth, gold light, calm and organised mood",
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
