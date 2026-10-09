"""Generate the tarot funnel art via ikame's LiteLLM gateway (gemini-3.1-flash-image).
    IKAME_AI_KEY=... python3 gen_images.py [names...]      # e.g. card-00 hook-tarot
The 22 Major Arcana faces and the card back are one deck shared with ../aura-tarot: every card-*.jpg
is written to both img/ folders. Existing files are skipped unless named explicitly.
"""
import base64, io, json, os, shutil, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "img")
SHARE = os.path.join(HERE, "..", "aura-tarot", "img")

DECK = ("One card from a premium illustrated tarot deck, all cards in the same style: elegant Art Nouveau line work in warm gold #E9C26B "
        "on deep midnight navy #161A27, soft violet and teal glow, fine stars, painterly texture, stylized illustrated figures with simple, calm, softly drawn facial features (never blank faces, never photoreal), "
        "full-bleed: the artwork fills the entire image edge to edge, it is the flat card face itself, not a photo or mockup of a card, no white or cream background around it, "
        "a thin ornamental gold frame inset from the edge, the scene centered, vertical 2:3 card, "
        "no text, no letters, no numbers, no card title, no watermark.")
SCENE = ("Mystical premium tarot app photography and art, deep navy night, warm gold candle light, fine stars, cinematic, soft depth of field, "
         "vertical 2:3, no text, no logo, no watermark, no visible faces.")
CARDS = [
 "The Fool: a young traveler with a small bundle on a stick steps lightly toward a cliff edge at dawn, a small white dog at their heels, a rising sun",
 "The Magician: a robed figure raises a glowing wand to the sky, a table before them holds a cup, a sword, a gold coin and a wand, a ribbon of light shaped like an infinity sign above the head",
 "The High Priestess: a veiled woman sits calmly between a dark pillar and a light pillar, a crescent moon at her feet, a scroll on her lap, a curtain of pomegranates behind",
 "The Empress: a woman crowned with twelve stars rests on a cushioned throne in a golden wheat field, a forest and a stream behind her",
 "The Emperor: a stern ruler on a stone throne carved with ram heads, holding an orb and a scepter, red desert mountains behind",
 "The Hierophant: a robed teacher seated between two pillars raises a hand in blessing to two kneeling students, two crossed golden keys at his feet",
 "The Lovers: two figures stand apart beneath a radiant angel in the sun, a fruit tree behind one and a tree of flames behind the other",
 "The Chariot: an armored charioteer stands in a chariot under a starry canopy, pulled by one black and one white sphinx, a city behind",
 "Strength: a calm woman in white gently holds a lion's jaws, an infinity sign of light above her head, flowers in her hair",
 "The Hermit: a cloaked old figure stands on a snowy mountain peak holding up a lantern with a six-pointed star glowing inside",
 "Wheel of Fortune: a great golden wheel with mystic symbols floats in clouds, a sphinx on top, four winged creatures reading books in the corners",
 "Justice: a figure seated between two pillars holds balanced golden scales in one hand and an upright sword in the other",
 "The Hanged Man: a calm figure hangs upside down by one foot from a living T-shaped tree, hands behind the back, a glowing halo around the head",
 "Death: a skeletal rider in dark armor on a white horse carries a black banner with a white rose, the sun rising between two towers, symbolic and gentle, not gory",
 "Temperance: a winged angel pours glowing water between two golden cups, one foot on land and one in a pool, a path leading to a sunrise crown",
 "The Devil: a horned goat-headed figure sits on a dark pedestal holding a torch, two small figures loosely chained below, symbolic and theatrical, not gory or scary",
 "The Tower: a tall stone tower on a rocky peak is struck by lightning, its crown toppling, flames from the windows, a dark night sky",
 "The Star: a kneeling figure pours water from two jugs into a pool and onto the land under one large eight-pointed star and seven small stars, an ibis on a tree",
 "The Moon: a full moon with a calm face in profile glows between two towers, a wolf and a dog howl at it, a crayfish rises from a pool, a winding path",
 "The Sun: a radiant smiling sun shines over a joyful child riding a white horse, tall sunflowers along a garden wall",
 "Judgement: an angel blows a golden trumpet from the clouds, figures rise below with open arms to greet the call",
 "The World: a dancing figure wrapped in a sash floats inside a laurel wreath, a lion, a bull, an eagle and an angel in the four corners, the cosmos behind",
]
P = {f"card-{i:02d}": f"{c}. {DECK}" for i, c in enumerate(CARDS)}
P.update({
 "card-back": f"The back of a tarot card: a symmetrical ornate gold geometric pattern of a sun, a crescent moon and fine stars around a central diamond on deep navy, top-down, flat, filling the frame. {DECK}",
 "hook-tarot": f"Close-up of two hands hovering over a dark velvet table with three gold-edged tarot cards fanned face down, a lit candle, a small crystal and a few scattered gold stars. {SCENE}",
 "topic-love": f"Two hands almost touching over a dark velvet table, a single red rose and a tarot card face down between them, warm candle glow. {SCENE}",
 "topic-work": f"A dark wooden desk at night with an open notebook, a small brass lantern, a golden key and a tarot card face down. {SCENE}",
 "topic-money": f"A few gold coins and a tarot card face down on dark velvet beside a candle, soft golden reflections. {SCENE}",
 "topic-self": f"A silhouette of a person seen from behind, sitting cross-legged under a large crescent moon and a sky of stars, a candle beside them. {SCENE}",
})
SIZES = {"card": (420, 630), "default": (560, 840)}


def trim_corners(im):
    """The model often draws a rounded card on white: cut inward past the light corner."""
    g = im.convert("L"); w, h = g.size; k = 0
    for x, y in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        dx, dy = (1 if x == 0 else -1), (1 if y == 0 else -1); i = 0
        while i < min(w, h) // 6 and g.getpixel((x + dx * i, y + dy * i)) > 150: i += 1
        k = max(k, i)
    if not k: return im
    k += 2; kx = k; ky = round(k * h / w)
    return im.crop((kx, ky, w - kx, h - ky))


def save(name, raw):
    w, h = SIZES["card"] if name.startswith("card-") else SIZES["default"]
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    sw, sh = im.size  # crop to 2:3 before resizing, the model ignores size
    tw = min(sw, round(sh * 2 / 3)); th = min(sh, round(sw * 3 / 2))
    im = im.crop(((sw - tw) // 2, (sh - th) // 2, (sw - tw) // 2 + tw, (sh - th) // 2 + th)).resize((w, h), Image.LANCZOS)
    if name.startswith("card-"):
        im = trim_corners(im).resize((w, h), Image.LANCZOS)
    path = os.path.join(OUT, name + ".jpg")
    im.save(path, quality=80, optimize=True, progressive=True)
    if name.startswith("card-") and os.path.isdir(SHARE):
        shutil.copyfile(path, os.path.join(SHARE, name + ".jpg"))


def gen(name):
    body = json.dumps({"model": MODEL, "prompt": P[name], "n": 1}).encode()
    req = urllib.request.Request(BASE, body, {"Authorization": f"Bearer {os.environ['IKAME_AI_KEY']}", "Content-Type": "application/json"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                save(name, base64.b64decode(json.load(r)["data"][0]["b64_json"]))
            return f"ok   {name}"
        except Exception as e:
            err = e
    return f"fail {name}: {err}"


if __name__ == "__main__":
    if not os.environ.get("IKAME_AI_KEY"):
        sys.exit("IKAME_AI_KEY is not set")
    os.makedirs(OUT, exist_ok=True)
    names = sys.argv[1:] or [n for n in P if not os.path.exists(os.path.join(OUT, n + ".jpg"))]
    with ThreadPoolExecutor(4) as ex:
        for line in ex.map(gen, names):
            print(line, flush=True)
