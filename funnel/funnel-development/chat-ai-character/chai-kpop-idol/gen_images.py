"""Generate every image of the Dream Idol funnel: hook, peeking idols, and the reference grid
(18 per gender as real-life photos, the first 12 also as drawn webtoon art). Original fictional idols with
American / European looks and a glamorous, sexy (never nude) styling — owner direction 2026-10-08.

Uses ikame's LiteLLM gateway, model gemini-3.1-flash-image. Key from env only:
    IKAME_AI_KEY=... python3 gen_images.py              # all missing images
    IKAME_AI_KEY=... python3 gen_images.py ref-women    # only names starting with these (regenerates them)
Every character is a clearly adult (25+), fully clothed, SFW; never a real person's likeness.
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps

BASE = "https://core-ai-platform.ikameglobal.com/v1/images/generations"
MODEL = "gemini/gemini-3.1-flash-image"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")

GUARD = ("An original fictional character invented for this image: must NOT resemble any real person, celebrity, actor, model or singer. "
         "Clearly an adult (25 or older), clothed, glamour styling with cleavage or bare shoulders allowed but no nudity, opaque fabric, nothing see-through and no nipple outline, safe for work, "
         "no text, no logo, no watermark.")
SEXY = "flirty, seductive and magnetic, direct eye contact with the camera, effortlessly sexy and glamorous"
REAL = ("Photorealistic intimate glamour portrait, close-up head and shoulders to bust, soft cinematic glow, warm candlelight or soft window light, "
        "shallow depth of field with a softly blurred background, dewy natural skin, film look, " + SEXY + ", "
        "a youthful, fresh-faced and very attractive young adult in their mid-20s, vertical 4:5 composition. " + GUARD)
ANIME = ("Premium semi-realistic webtoon / digital painting, soft glowing light, " + SEXY + ", close-up head and shoulders to bust, "
         "youthful, fresh-faced, very attractive young adult in their mid-20s, softly blurred warm background, vertical 4:5 composition. " + GUARD)
PEEK = ("waist-up, body turned slightly to the left, isolated on a solid pure black background (#000000, never white) with no scenery, "
        "soft studio light from the left, vertical 3:4 composition, the figure filling the frame. " + GUARD)

# archetype -> setting (same for everyone) and a glamorous outfit per gender
PLACE = {
 "Prince": "in a grand hotel lobby with warm chandeliers", "Mysterious": "in a dim bar lit by one red lamp",
 "Rival": "in a dance studio with mirrors", "Sunshine": "in a sunny cafe by the window",
 "Bad boy": "leaning on a car in a neon-lit street at night", "Rebel": "on a neon-lit street at night",
 "Main vocal": "in a recording studio by the microphone", "Bestie": "in a late-night diner booth",
 "Ice queen": "in an empty art gallery with cold light", "Charmer": "in the back seat of a car, smiling at the camera",
 "Leader": "backstage with stage lights behind", "CEO heir": "in a glass penthouse office at dusk with the city behind",
 "CEO heiress": "in a glass penthouse office at dusk with the city behind", "Heir": "on a penthouse balcony at dusk",
 "Athlete": "at a running track at golden hour", "Actor": "on a film set with soft key light", "Actress": "on a film set with soft key light",
 "Producer": "in a home studio with synths and warm lamps", "Biker": "in a parking garage at night, helmet under one arm",
 "Dancer": "on a rooftop at sunset", "Bookworm": "in a quiet bookstore", "Chef": "in a warm restaurant kitchen",
 "Model": "at a fashion-week street shoot with blurred photographers", "Bodyguard": "in a hotel corridor at night",
}
OUTFIT = {
 "men": {"Prince": "an ivory dress shirt unbuttoned halfway, sleeves rolled", "Mysterious": "a black silk shirt unbuttoned low",
         "Rival": "a fitted black tank top showing toned arms", "Sunshine": "a white linen shirt open at the chest",
         "Bad boy": "a leather jacket over a fitted white tank top", "Main vocal": "a black shirt unbuttoned low with a thin chain",
         "Charmer": "a fitted henley with the buttons open", "Leader": "a crisp white shirt open at the collar, sleeves rolled",
         "CEO heir": "a dark suit jacket over a shirt unbuttoned low, no tie", "Athlete": "a fitted sleeveless training top, athletic arms",
         "Actor": "a fitted black t-shirt", "Producer": "a fitted tank top and a chain necklace",
         "Biker": "a moto jacket over a bare-chested fitted tank", "Dancer": "a loose white shirt open to the chest",
         "Bookworm": "glasses and a soft open-collar shirt", "Chef": "a fitted white t-shirt",
         "Model": "a silk shirt unbuttoned low under a blazer", "Bodyguard": "a black suit with the shirt collar open"},
 "women": {"Bestie": "a cream lace-trim satin camisole top", "Ice queen": "a black satin slip dress with thin straps",
           "Rival": "a fitted black spaghetti-strap top", "Sunshine": "a white sundress with thin straps",
           "Rebel": "a red satin camisole under an open leather jacket", "Main vocal": "a deep-red satin slip dress",
           "Charmer": "an off-shoulder knit top", "Leader": "a fitted blazer dress with a plunging neckline",
           "CEO heiress": "a silk camisole under an open ivory blazer", "Athlete": "a fitted athletic tank top",
           "Actress": "a champagne satin slip dress", "Producer": "an oversized shirt slipping off one shoulder over a camisole",
           "Biker": "a black cami top under an open moto jacket", "Dancer": "a fitted wrap top with a deep V neckline",
           "Bookworm": "glasses and a soft cardigan slipping off one shoulder over a camisole", "Chef": "a fitted white tank top",
           "Model": "a cognac-brown satin halter dress with a deep V neckline", "Bodyguard": "a fitted black blazer over a black lace-trim camisole"},
}
OUTFIT["nb"] = {**OUTFIT["men"], "Bestie": "an oversized open shirt over a fitted tank", "Ice queen": "a black satin shirt unbuttoned low",
                "Rebel": "a studded leather vest over a fitted tank", "Heir": "a tailored suit jacket over a bare-collar silk shirt"}
POSE = ["a fingertip touching her lip with a playful smile", "hands behind the head, sultry gaze", "a soft, slightly shy smile",
        "hair falling over one shoulder, glancing at the camera", "chin resting on one hand, warm smile", "lips slightly parted, intense gaze",
        "laughing softly, one hand in the hair", "biting the lip slightly, teasing look", "looking over the shoulder with a smile"]
# American / European mix, one per tile (same order as the roster)
LOOKS = {
 "men": ["white man with short light-brown hair, light stubble and grey eyes", "Mediterranean man with black hair and stubble", "Black man with a short fade",
         "white man with golden blond waves", "Latino man with a dark undercut and stubble", "white man with short black curly hair, a neatly trimmed beard and hazel eyes",
         "mixed-race man with curly hair", "white man with short dark hair and stubble", "Italian man with slicked-back black hair",
         "Black man with short twists, athletic", "white man with wavy dark hair and light stubble", "Latino man with a beanie over dark hair",
         "white man with messy black hair and tattoos on his hands", "Spanish man with long dark hair tied back", "white man with auburn hair and round glasses",
         "Brazilian man with short curly hair", "Scandinavian man with platinum blond hair", "Black man with a shaved head and trimmed beard"],
 "women": ["white woman with long brown waves", "Latina woman with long sleek black hair", "Black woman with long box braids",
           "blonde white woman with beachy waves", "white woman with a black bob and red lips", "white woman with long platinum hair",
           "mixed-race woman with curly hair", "Italian woman with dark glossy hair in a sleek bun", "Spanish woman with long chestnut hair",
           "Black woman with a sleek high ponytail, athletic", "redheaded white woman with long copper waves", "Latina woman with honey balayage",
           "white woman with long dark hair and a leather jacket look", "Brazilian woman with long curly hair", "white woman with auburn hair and glasses",
           "Mediterranean woman with dark wavy hair", "Scandinavian woman with icy blonde hair", "Black woman with a short pixie cut"],
 "nb": ["androgynous white person with a soft mint-dyed crop", "androgynous Mediterranean person with long dark hair", "androgynous Black person with a silver buzz cut",
        "androgynous white person with curly peach hair", "androgynous Latino person with a black wolf cut", "androgynous white person with sleek black hair",
        "androgynous mixed-race person with fluffy curls", "androgynous white person with a short dark crop", "androgynous person with slicked silver hair",
        "androgynous Black person with short locs, athletic", "androgynous white person with wavy brown hair", "androgynous Latino person with a beanie",
        "androgynous white person with messy black hair and tattoos", "androgynous Spanish person with long dark hair", "androgynous redhead with glasses",
        "androgynous Brazilian person with short curls", "androgynous Scandinavian person with platinum hair", "androgynous Black person with a sharp fade"],
}
ROSTER = {"men": ["julian:Prince", "damien:Mysterious", "mason:Rival", "leo:Sunshine", "ryder:Bad boy", "elliot:Main vocal", "caleb:Charmer", "tristan:Leader", "sebastian:CEO heir",
                  "jace:Athlete", "adrian:Actor", "miles:Producer", "dominic:Biker", "luca:Dancer", "oliver:Bookworm", "gabriel:Chef", "rafael:Model", "cole:Bodyguard"],
          "women": ["sienna:Bestie", "valentina:Ice queen", "skye:Rival", "chloe:Sunshine", "raven:Rebel", "aurora:Main vocal", "lily:Charmer", "victoria:Leader", "isabella:CEO heiress",
                    "jade:Athlete", "scarlett:Actress", "nova:Producer", "bianca:Biker", "mila:Dancer", "harper:Bookworm", "ella:Chef", "camila:Model", "ruby:Bodyguard"],
          "nb": ["river:Bestie", "phoenix:Mysterious", "rowan:Rival", "sky:Sunshine", "ash:Rebel", "jules:Main vocal", "indie:Charmer", "sage:Leader", "remy:Heir",
                 "kai:Athlete", "ari:Actor", "quinn:Producer", "rory:Biker", "eden:Dancer", "blair:Bookworm", "lux:Chef", "nico:Model", "jesse:Bodyguard"]}

JOBS = {"hook": ("Semi-realistic premium illustration of four original fictional pop idols bursting toward the camera and pointing at the viewer with excited, "
                 "open-mouthed smiles, like a hype group shot: a glamorous blonde woman in a fitted pink stage jacket, a dark-haired man in a white and gold "
                 "military-style stage jacket worn open at the collar, a Black man in a black leather jacket with chains, and a Latina woman in a sparkly "
                 "black stage outfit reaching out; dynamic foreshortened hands, pure black background, dramatic stage rim light, " + SEXY +
                 ", horizontal 4:3 composition. " + GUARD, (720, 540)),
        "peek-start": ("A glamorous dark-haired man in a white and gold military-style stage jacket worn open at the collar, white glove touching his collar, "
                       "premium western webtoon illustration, " + SEXY + ", " + PEEK, (420, 560))}
PEEKS = {"men": ["a photorealistic Mediterranean man in an unbuttoned black silk shirt", "a webtoon blond man in a fitted black and silver stage jacket",
                 "a photorealistic Black man in a fitted cream knit, warm smile", "a webtoon dark-haired man in an open-collar white stage suit holding a microphone"],
         "women": ["a photorealistic Latina woman in a fitted black satin dress, long dark hair", "a webtoon platinum-blonde woman in an off-shoulder crystal stage dress",
                   "a photorealistic blonde woman in an off-shoulder pastel sweater, smile", "a webtoon redheaded woman in a cropped leather jacket"],
         "nb": ["a photorealistic androgynous person in a long black coat, silver hair", "a photorealistic androgynous person with mint-dyed short hair in an open denim jacket",
                "a photorealistic androgynous Black person in a fitted white suit", "a webtoon androgynous person with a black wolf cut in a stage jacket"]}
for g, ps in PEEKS.items():
    for n, d in enumerate(ps, 1):
        JOBS[f"peek-{g}-{n}"] = (d + ", " + SEXY + ", " + PEEK, (420, 560))
for g, people in ROSTER.items():
    for i, item in enumerate(people):
        name, arch = item.split(":")
        pose = POSE[i % len(POSE)].replace("her ", "his " if g == "men" else "her " if g == "women" else "their ")
        desc = f"a beautiful young {LOOKS[g][i]}, styled like a pop idol, wearing {OUTFIT[g][arch]}, {pose}, softly blurred background hinting {PLACE[arch]}"
        JOBS[f"ref-{g}-p-{name}"] = (f"{desc}. {REAL}", (360, 444))
        if i < 12:
            JOBS[f"ref-{g}-a-{name}"] = (f"{desc}. {ANIME}", (360, 444))


def gen(key):
    prompt, size = JOBS[key]
    body = json.dumps({"model": MODEL, "prompt": prompt, "n": 1}).encode()
    req = urllib.request.Request(BASE, body, {"Authorization": "Bearer " + os.environ["IKAME_AI_KEY"], "Content-Type": "application/json"})
    err = ""
    for attempt in range(3):
        try:
            d = json.load(urllib.request.urlopen(req, timeout=180))["data"][0]
            raw = base64.b64decode(d["b64_json"]) if d.get("b64_json") else urllib.request.urlopen(d["url"], timeout=120).read()
            im = ImageOps.fit(Image.open(io.BytesIO(raw)).convert("RGB"), size, Image.LANCZOS, centering=(0.5, 0.3))
            im.save(os.path.join(OUT, key + ".jpg"), "JPEG", quality=84, optimize=True)
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
            print(f"  {k:26} {r}")
