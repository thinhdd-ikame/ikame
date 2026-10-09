"""Generate the hook group shot and the reference-look grid (men / women / non-binary x anime / photoreal, 6 each) for chai-create-your-ai.

Uses ikame's LiteLLM gateway, model gemini-3.1-flash-image. Key from env only:
    IKAME_AI_KEY=... python3 gen_images.py            # all missing images
    IKAME_AI_KEY=... python3 gen_images.py ref-men    # only names starting with these
Outputs JPEGs into img/: hook 720x660, ref-<gender>-<a|p>-<name> 360x444. Existing files are skipped unless named explicitly.
Every character is a clearly adult (25+), fully clothed, SFW. Photoreal = glamour-photo lighting (ChatChi imagery rule).
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps

BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")

ANIME = ("High-quality modern anime / webtoon character illustration, clean line art, soft cel shading, cinematic moody lighting, "
         "head and upper body portrait, looking at the viewer, dark atmospheric background, clearly an adult in their mid-to-late 20s, "
         "fully clothed, safe for work, vertical 4:5 composition, no text, no logo, no watermark.")
PHOTO = ("Photorealistic glamour portrait photograph, 85mm lens, shallow depth of field, cinematic moody lighting with a soft magenta rim light, "
         "head and upper body, looking at the camera, dark atmospheric background, clearly an adult in their late 20s, fully clothed, "
         "safe for work, vertical 4:5 composition, no text, no logo, no watermark.")
# archetype per tile name (same order as REF in demo.html)
LOOK = {
 "men": {
  "kade":   "a soft-spoken best-friend type man, messy dark hair over his eyes, silver ear cuffs, black shirt, gentle half smile",
  "lucien": "a mysterious elegant man, long black hair tied back, high-collared dark coat, piercing grey eyes, candlelight",
  "ryo":    "a cocky rival athlete man, short spiky hair, sports jacket, confident smirk, stadium lights bokeh",
  "theo":   "a warm sunshine golden-retriever type man, wavy light brown hair, cream knit sweater, big open smile, warm cafe light",
  "dante":  "a bad-boy man, undercut hair, leather jacket, faint scar on his eyebrow, neon city night",
  "elias":  "a bookworm man, round glasses, tousled hair, cardigan over a shirt, library shelves behind",
 },
 "women": {
  "mia":    "a cheerful best-friend type woman, shoulder-length brown hair, oversized hoodie, warm teasing smile",
  "selene": "a mysterious elegant woman, long silver-white hair, dark velvet dress with a high neckline, moonlight",
  "yuna":   "a competitive rival woman, high black ponytail, varsity jacket, confident smirk, city lights",
  "ivy":    "a sunshine woman, wavy strawberry-blonde hair, floral sundress with a cardigan, freckles, golden hour light",
  "raven":  "a rebel woman, black bob with a red streak, leather jacket, silver rings, neon street at night",
  "clara":  "a bookworm woman, auburn hair in a loose braid, glasses, cosy turtleneck, library lamp light",
 },
 "nb": {
  "rowan":  "an androgynous best-friend type person, short tousled hair, denim jacket over a hoodie, kind smile",
  "sky":    "an androgynous mysterious person, pale lavender hair, long dark coat, calm knowing gaze, fog",
  "ash":    "an androgynous rival, sharp undercut, sporty windbreaker, cocky grin, rooftop at dusk",
  "quinn":  "an androgynous sunshine person, curly hair, pastel overshirt, bright laugh, warm light",
  "river":  "an androgynous rebel, shaggy black mullet, band tee under a leather jacket, eyeliner, neon bar",
  "nico":   "an androgynous bookworm, wire glasses, soft sweater, holding a book, warm lamp light",
 },
}
JOBS = {"hook": ("Semi-realistic premium illustration of four original fictional AI companion characters bursting toward the camera and pointing at the viewer with excited, open-mouthed expressions, like a hype group shot: a cute anime-style girl in a pink frilly jacket pointing up, a fantasy warrior man in dark leather armour, a basketball player man in a plain white jersey with no lettering or numbers reaching out, and a K-pop style idol man in a sparkly black jacket; dynamic foreshortened hands, pure black background, dramatic rim light, everyone clearly adult and fully clothed, horizontal 4:3 composition, no text, no logo, no watermark. ", (1080, 810))}
for g, people in LOOK.items():
    for name, desc in people.items():
        JOBS[f"ref-{g}-a-{name}"] = (f"{desc}. {ANIME}", (720, 888))
        JOBS[f"ref-{g}-p-{name}"] = (f"{desc}. {PHOTO}", (720, 888))


def gen(key):
    prompt, size = JOBS[key]
    body = json.dumps({"model": MODEL, "prompt": prompt, "n": 1}).encode()
    req = urllib.request.Request(BASE, body, {"Authorization": "Bearer " + os.environ["IKAME_AI_KEY"], "Content-Type": "application/json"})
    for attempt in range(3):
        try:
            d = json.load(urllib.request.urlopen(req, timeout=180))["data"][0]
            raw = base64.b64decode(d["b64_json"]) if d.get("b64_json") else urllib.request.urlopen(d["url"], timeout=120).read()
            src = Image.open(io.BytesIO(raw)).convert("RGB")
            # never upscale: if the source is smaller than the target, keep the target aspect at the source resolution
            k = min(1.0, src.width / size[0], src.height / size[1])
            im = ImageOps.fit(src, (round(size[0] * k), round(size[1] * k)), Image.LANCZOS, centering=(0.5, 0.3))
            im.save(os.path.join(OUT, key + ".jpg"), "JPEG", quality=86, optimize=True, progressive=True)
            return key, "ok"
        except Exception as e:
            err = str(e)[:120]
    return key, "FAILED " + err


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    want = sys.argv[1:]
    keys = [k for k in JOBS if (any(k.startswith(w) for w in want) if want else not os.path.exists(os.path.join(OUT, k + ".jpg")))]
    print(len(keys), "images")
    with ThreadPoolExecutor(6) as ex:
        for k, r in ex.map(gen, keys):
            print(f"  {k:24} {r}")
