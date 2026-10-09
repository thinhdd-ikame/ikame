"""Generate the illustrated genre cards, opening-scene (setting) cards and companion portraits for the chai-roleplay funnel.

Uses ikame's LiteLLM gateway (same as creative-video-generator), model gemini-3.1-flash-image. Key from env only:
    IKAME_AI_KEY=... python3 gen_images.py            # all missing images
    IKAME_AI_KEY=... python3 gen_images.py hook       # just these
Outputs JPEGs into img/: genre/hook 560x840, set-<genre>-<0..2> 360x540 (tall setting cards), comp-<genre>-<0..2> 360x360 (portraits). Existing files are skipped unless named explicitly.
Stylised illustration only (no photoreal people). All characters adult, clothed, SFW.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps

BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"  # OpenAI image models 400 on stylised prompts here; gemini returns ~848x1264
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")

STYLE = ("Painterly digital storybook illustration, rich cinematic lighting, dark moody palette with a violet-magenta rim light, "
         "detailed environment, any characters are clothed adults, safe for work, vertical 2:3 card composition, "
         "no text, no logo, no watermark.")

P = {
 "hook":            "an open storybook on a dark table spilling five tiny glowing scenes: a dragon spire, a rainy detective alley, an orbit station, a candlelit ballroom, a fog-wrapped lighthouse",
 "genre-fantasy":   "an ember-lit castle keep on a cliff at dusk, a dragon silhouette in the sky, warm amber glow",
 "genre-mystery":   "a rainy neon alley at night, a lone figure in a trench coat under a streetlamp, teal fog",
 "genre-scifi":     "an orbital space station window looking at a ringed planet, cyan holographic light, a figure in a flight suit from behind",
 "genre-romance":   "a candlelit ballroom with two silhouettes in formal wear almost touching hands, rose and gold light",
 "genre-horror":    "a fog-wrapped lighthouse on a black sea at night, one lit window, crimson moon, suspense not gore",
}

PORTRAIT = ("Painterly digital storybook character portrait, head and shoulders, centered face, rich cinematic lighting, "
            "dark moody background with a violet-magenta rim light, clearly an adult (late 20s to 40s), fully clothed, "
            "safe for work, square composition, no text, no logo, no watermark.")
SCENE = ("Painterly digital storybook illustration of a place, wide establishing view, rich cinematic lighting, dark moody palette "
         "with a violet-magenta rim light, no people or only tiny distant silhouettes, vertical 2:3 card composition, "
         "no text, no logo, no watermark.")
# opening scenes, same order as GENRES[g].set in demo.html
SETS = {
 "fantasy": ["a torch-lit great hall inside an ember-lit castle keep, a glowing brazier of embers, banners, amber light",
             "a misty enchanted forest of huge old trees, floating golden wisps of light, a narrow moss path, amber and green glow",
             "a half-sunken harbour town at dusk, broken masts in the water, lantern-lit wooden piers, amber sunset under storm clouds"],
 "mystery": ["a rainy harbour street at night, wet cobblestones, gas lamps, moored boats, teal fog",
             "an art deco hotel lobby at night, brass elevator doors, a lone reception bell, teal and gold light",
             "a dusty locked library at night, towering shelves, moonlight through tall windows, a single lamp left on, teal shadows"],
 "scifi":   ["a curved space station ring corridor with a huge window onto Earth, cyan lights, panels",
             "the bridge of a sleek starship named Halcyon, glowing cyan consoles, a viewport full of stars",
             "a domed research outpost on the hazy orange surface of Titan, Saturn huge in the sky, cyan dome lights"],
 "romance": ["a grand candlelit ballroom with crystal chandeliers and a polished floor, rose and gold light, empty dance floor",
             "a rooftop garden at night with roses, string lights and a city skyline, rose and gold glow",
             "a cosy cafe at night seen from inside, rain on the window, two cups on a small table, warm rose light"],
 "horror":  ["the lamp room at the top of an old lighthouse at night, a huge dim lens, stormy sea outside, crimson tint",
             "a fog-wrapped abandoned manor house at night, one lit window, dead trees, crimson moon",
             "an abandoned summer camp in a pine forest at night, empty cabins, a flashlight beam in the fog, crimson tint"],
}
# companions, same order as GENRES[g].comps in demo.html
COMPS = {
 "fantasy": ["a sworn knight, man about 30, short dark hair, light stubble, steel plate armour with an amber cloak, watchful calm eyes, warm amber firelight",
             "a rogue mage, woman about 28, dark hooded cloak, silver earrings, a small glowing violet orb hovering by her hand, knowing smirk",
             "a shapeshifter ranger, man about 30, wild ash-grey hair, fur-trimmed leather cloak, amber wolf-like eyes, a faint wolf silhouette in the mist behind him"],
 "mystery": ["a sharp detective, woman about 35, tied-back dark hair, belted trench coat, holding a small notebook, piercing gaze, teal noir lighting",
             "a charming informant, man about 38, fedora hat, waistcoat and loosened tie, sly smile, teal and gold noir lighting",
             "an eager rookie detective partner, woman about 26, short hair, rain jacket, holding a flashlight, curious expression, teal noir lighting"],
 "scifi":   ["a starship AI shown as a calm holographic woman about 30, translucent cyan light, short sleek hair, simple high-collar uniform, faint scan lines",
             "a weary starship pilot, man about 42, stubble, worn flight jacket with patches, headset around neck, tired half smile, cyan cockpit glow",
             "a stranded alien envoy, adult humanoid with smooth silver-blue skin and large gentle dark eyes, elegant high-collared envoy robes, curious expression, cyan light"],
 "romance": ["a charming violinist, man about 28, dark tousled hair, open-collar black formal shirt and jacket, holding a violin, warm smile, rose and gold candlelight",
             "a mysterious ball guest, woman about 30, elegant long-sleeved deep red evening gown with a high neckline, a red rose in her hair, secretive smile, rose and gold light",
             "an old rival, man about 32, slicked hair, tailored black tuxedo with bow tie, raised eyebrow, guarded smirk, rose and gold light"],
 "horror":  ["a nervous lighthouse caretaker, man about 40, knit cap, heavy wool coat, holding a candle lantern near his face, worried eyes, crimson and amber light",
             "an odd local woman about 35, long dark hair, dark knitted shawl, a black cat on her shoulder, calm unsettling gaze, crimson moonlight",
             "a skeptical tour guide, man about 45, glasses, field jacket, holding a flashlight, unimpressed raised eyebrow, crimson fog light"],
}
for g, xs in SETS.items():
    for j, x in enumerate(xs): P[f"set-{g}-{j}"] = x
for g, xs in COMPS.items():
    for j, x in enumerate(xs): P[f"comp-{g}-{j}"] = x

def gen(name):
    key = os.environ.get("IKAME_AI_KEY")
    style = PORTRAIT if name.startswith("comp-") else SCENE if name.startswith("set-") else STYLE
    size = (360, 360) if name.startswith("comp-") else (360, 540) if name.startswith("set-") else (560, 840)
    body = json.dumps({"model": MODEL, "prompt": f"{P[name]}. {style}", "n": 1}).encode()
    req = urllib.request.Request(BASE, body, {"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    last = ""
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                data = json.load(r)["data"][0]["b64_json"]
            im = ImageOps.fit(Image.open(io.BytesIO(base64.b64decode(data))).convert("RGB"), size, Image.LANCZOS, centering=(0.5, 0.35))
            im.save(os.path.join(OUT, name + ".jpg"), quality=78, optimize=True, progressive=True)
            return f"ok   {name}"
        except Exception as e:
            err = getattr(e, "read", lambda: b"")()[:200]
            last = f"fail {name}: {e} {err!r}"
    return last

if __name__ == "__main__":
    if not os.environ.get("IKAME_AI_KEY"):
        sys.exit("IKAME_AI_KEY is not set")
    os.makedirs(OUT, exist_ok=True)
    names = sys.argv[1:] or [n for n in P if not os.path.exists(os.path.join(OUT, n + ".jpg"))]
    with ThreadPoolExecutor(6) as ex:
        for line in ex.map(gen, names):
            print(line, flush=True)
