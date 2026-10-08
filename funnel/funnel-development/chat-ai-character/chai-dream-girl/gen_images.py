"""Generate the painted portrait/scene cards for the chai-dream-girl funnel.

Uses ikame's LiteLLM gateway (same as creative-video-generator), model gemini-3.1-flash-image. Key from env only:
    IKAME_AI_KEY=... python3 gen_images.py            # all missing images
    IKAME_AI_KEY=... python3 gen_images.py eth-asian  # just these
Outputs 560x840 JPEGs into img/. Existing files are skipped unless named explicitly.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"  # OpenAI image models 400 on these prompts; gemini returns ~848x1264
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")

STYLE = ("Photorealistic glamour photograph, Instagram-model aesthetic, shot on 85mm, soft cinematic key light, "
         "shallow depth of field, dark moody background with a violet-magenta rim light, natural skin texture. "
         "Glamorous confident fashion editorial mood, trendy going-out outfit. Clearly an adult woman about 25-28. "
         "Vertical 2:3 card composition, subject centered, no text, no logo, no watermark.")
SCENE_STYLE = ("Photorealistic cinematic glamour still, 35mm, moody warm and violet lighting, shallow depth of field, "
               "glamorous flirty mood, clearly adult, vertical 2:3 composition, no text, no logo, no watermark.")
WOMAN = "a stunningly beautiful adult woman, model features, glam makeup, glossy styled hair, confident flirty gaze"

P = {
 # 1 ethnicity
 "eth-caucasian": f"{WOMAN}, Caucasian, platinum blonde waves, black lace bralette under an open silk robe, arms raised behind her head, waist up",
 "eth-asian":     f"{WOMAN}, East Asian, long straight black hair, low-cut satin slip dress, looking over her shoulder, waist up",
 "eth-latina":    f"{WOMAN}, Latina, long dark curls, cropped corset top, hand in her hair, waist up",
 "eth-black":     f"{WOMAN}, Black, long braids, emerald off-shoulder bodycon top, eyes half closed, waist up",
 # 2 age
 "age-a21": f"{WOMAN}, 23 years old, long honey-blonde hair, pink crop top, playful bite of the lip, head and shoulders",
 "age-a25": f"{WOMAN}, 26 years old, honey-blonde hair, white off-shoulder top, head and shoulders",
 "age-a30": f"{WOMAN}, 31 years old, honey-blonde hair, cream silk camisole, head and shoulders",
 "age-a36": f"{WOMAN}, 37 years old, elegant honey-blonde hair, black plunging blazer with nothing visible underneath but fully covered, choker, head and shoulders",
 # 3 figure (full body)
 "fig-slim":     f"{WOMAN}, slim model figure, full body, tiny black mini dress and heels, leaning on a wall",
 "fig-athletic": f"{WOMAN}, fit toned athletic body, full body, sports bra and high-waisted leggings, standing alone in an empty gym, no mirror, no other people in frame",
 "fig-curvy":    f"{WOMAN}, curvy hourglass figure, full body, tight red bodycon dress and heels",
 "fig-petite":   f"{WOMAN}, petite figure, full body, denim hot pants and a knotted crop top, sunset",
 # 4 hair colour
 "hair-blonde":   f"{WOMAN}, long wavy blonde hair, white lace top, head and shoulders",
 "hair-brunette": f"{WOMAN}, long glossy brunette hair, black satin camisole, head and shoulders",
 "hair-black":    f"{WOMAN}, sleek long black hair, red lipstick, black off-shoulder top, head and shoulders",
 "hair-red":      f"{WOMAN}, long copper-red hair, freckles, green silk slip, head and shoulders",
 "hair-pastel":   f"{WOMAN}, pastel pink dyed hair, e-girl style, choker, crop top, head and shoulders",
 # 5 looks (close-ups)
 "look-tattoos":  f"{WOMAN}, tattoos on her shoulder and arm, black bralette, close-up",
 "look-freckles": f"{WOMAN}, lots of natural freckles, red hair, bare shoulders, close-up face",
 "look-glasses":  f"{WOMAN}, black cat-eye glasses, unbuttoned white shirt, biting a pen, close-up",
 "look-makeup":   f"{WOMAN}, dramatic glam makeup, smoky eyes, glossy red lips, close-up",
 "look-natural":  f"{WOMAN}, no makeup natural beauty, messy bun, oversized shirt slipping off one shoulder, morning bed light, close-up",
 "look-sporty":   f"{WOMAN}, high ponytail, sports bra, glistening skin after a workout, waist up",
 # 6 bridge
 "bridge": f"{WOMAN}, long dark hair, glasses, tight black latex-look dress and choker, holding a notebook and pen, teasing smile, three-quarter body",
 # 10 scenarios
 "scn-coffee":    "a cozy coffee shop at night, a glamorous adult barista woman in a low-cut top and apron leaning over the counter handing a latte, flirty smile",
 "scn-travel":    "a luxury train compartment at golden hour, a glamorous adult woman in a short summer dress lounging by the window, flirty look",
 "scn-royalty":   "a candle-lit palace chamber, a glamorous adult princess in a revealing silk gown and tiara on a velvet chaise",
 "scn-superhero": "a night city rooftop in the rain, a glamorous adult heroine in a tight glossy suit, confident pose, city lights",
 "scn-gaming":    "a gamer bedroom lit by purple RGB light, a glamorous adult gamer girl in shorts and a crop top with a headset, holding a controller",
 "scn-neighbour": "an apartment doorway, a glamorous adult woman in a short robe leaning on the door frame with a package, flirty smile",
 "scn-fantasy":   "an enchanted forest at night with glowing lanterns, a glamorous adult elf woman in a revealing fantasy outfit",
 "scn-bar":       "an upscale cocktail bar, a glamorous adult woman in a little black dress at the counter holding a martini, looking at the camera",
 # her portrait for each ethnicity x hair colour pick (paywall/email/chat/sales); the ethnicity card covers its own default hair
 **{f"her-{e}-{h}": f"{WOMAN}, about 26 years old, {ed}, {hd}, {o}, alone in frame, waist up"
    for e, ed, o in [("caucasian", "Caucasian", "black satin camisole under an open silk blazer"),
                     ("asian", "East Asian", "satin slip dress"),
                     ("latina", "Latina", "cropped corset top with a jacket"),
                     ("black", "Black", "emerald off-shoulder top")]
    for h, hd in [("blonde", "long wavy golden blonde hair"), ("brunette", "long glossy chestnut-brown hair"),
                  ("black", "long sleek jet-black hair"), ("red", "long copper-red hair"), ("pastel", "long pastel pink dyed hair")]
    if (e, h) not in {("caucasian", "blonde"), ("asian", "black"), ("latina", "brunette"), ("black", "black")}},
 # paywall hero
 "hero": f"{WOMAN}, long wavy chestnut hair, black lace lingerie-style top under an open blazer, sitting on a bed edge, looking at the viewer, three-quarter body",
}

def gen(name):
    key = os.environ.get("IKAME_AI_KEY")
    body = json.dumps({"model": MODEL, "prompt": f"{P[name]}. {SCENE_STYLE if name.startswith('scn-') else STYLE}", "n": 1}).encode()
    req = urllib.request.Request(BASE, body, {"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                data = json.load(r)["data"][0]["b64_json"]
            im = Image.open(io.BytesIO(base64.b64decode(data))).convert("RGB").resize((560, 840), Image.LANCZOS)
            im.save(os.path.join(OUT, name + ".jpg"), quality=78, optimize=True, progressive=True)
            return f"ok   {name}"
        except Exception as e:
            err = getattr(e, "read", lambda: b"")()[:200]
            last = f"fail {name}: {e} {err!r}"
    return last

if __name__ == "__main__":
    if not os.environ.get("IKAME_AI_KEY"):
        sys.exit("IKAME_AI_KEY is not set")
    names = sys.argv[1:] or [n for n in P if not os.path.exists(os.path.join(OUT, n + ".jpg"))]
    with ThreadPoolExecutor(4) as ex:
        for line in ex.map(gen, names):
            print(line, flush=True)
