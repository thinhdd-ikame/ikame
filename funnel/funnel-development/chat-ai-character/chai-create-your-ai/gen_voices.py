"""Generate the voice-pick previews (screen 19): 5 male + 5 female voices, ElevenLabs v3 via ikame's LiteLLM gateway.

    IKAME_AI_KEY=... python3 gen_voices.py            # missing clips
    IKAME_AI_KEY=... python3 gen_voices.py m3 f1      # just these
Writes audio/<id>.mp3 here and in ../chai-kpop-idol/audio/ (both funnels share the set), and prints the
VOICES table for demo.html (label + duration). Each voice says its own short line: a pre-recorded preview can't
say the user's name, so the chat bubble shows the personalised first message and the audio is "how they sound".
"""
import json, os, shutil, sys, time, urllib.request

URL = "https://core-ai-platform.ikameglobal.com/v1/audio/speech"
HERE = os.path.dirname(os.path.abspath(__file__))
OUTS = [os.path.join(HERE, "audio"), os.path.join(HERE, "..", "chai-kpop-idol", "audio")]
# id: (ElevenLabs premade voice, label shown on the row, line with v3 audio tags)
VOICES = {
 "m1": ("cjVigY5qzO86Huf0OWal", "Smooth",  "[softly] Hey… there you are. [warmly] I was hoping you'd come back tonight."),
 "m2": ("nPczCjzI2devNBz1zQrb", "Deep",    "[low, calm] Come here. Sit with me for a while… [softly] I missed you."),
 "m3": ("TX3LPaxmHKxFdv7VOQHJ", "Playful", "[laughs] Okay, don't laugh, but… I've been waiting for you all day."),
 "m4": ("N2lVS1w4EtoT3dr4eOWO", "Husky",   "[whispers] You shouldn't be here this late… [smiles] but I'm really glad you are."),
 "m5": ("iP95p4xoKVk53GoZ742B", "Warm",    "Hey, you. [warmly] Tell me everything about your day. I'm all yours."),
 "f1": ("EXAVITQu4vr4xnSDxMaL", "Soft",    "[softly] Hi… I saved you a seat. [warmly] I had a feeling you'd come."),
 "f2": ("cgSgspJ2msm6clMCkdW9", "Playful", "[giggles] There you are! Okay, I've been dying to tell you something."),
 "f3": ("pFZP5JQG7iQjIQuC4Bku", "Velvet",  "[calm, warm] Long day? Come sit with me… [softly] I'll make it better."),
 "f4": ("9BWtsMINqrJLrRacOk9x", "Husky",   "[whispers] Don't tell anyone… [smiles] but you're my favourite part of today."),
 "f5": ("XrExE9yKIg1WjnnlVkGX", "Sweet",   "Hey! [happy] You came back. I was hoping you would."),
}


def gen(vid):
    voice, label, line = VOICES[vid]
    body = json.dumps({"model": "elevenlabs/eleven_v3", "voice": voice, "input": line}).encode()
    req = urllib.request.Request(URL, body, {"Authorization": "Bearer " + os.environ["IKAME_AI_KEY"], "Content-Type": "application/json"})
    for attempt in range(4):
        try:
            data = urllib.request.urlopen(req, timeout=120).read()
            if len(data) > 2000:
                for o in OUTS:
                    os.makedirs(o, exist_ok=True)
                    open(os.path.join(o, vid + ".mp3"), "wb").write(data)
                return True
        except Exception as e:
            print("  retry", vid, str(e)[:80])
        time.sleep(3 + attempt * 3)   # the gateway 500s on parallel ElevenLabs calls: one at a time
    return False


if __name__ == "__main__":
    want = sys.argv[1:] or [v for v in VOICES if not os.path.exists(os.path.join(OUTS[0], v + ".mp3"))]
    for v in want:
        print(v, "ok" if gen(v) else "FAILED")
    # 128 kbps mp3 -> seconds
    rows = {g: [[v, VOICES[v][1], round(os.path.getsize(os.path.join(OUTS[0], v + ".mp3")) * 8 / 128000)] for v in VOICES if v[0] == g[0]]
            for g in ("male", "female") if all(os.path.exists(os.path.join(OUTS[0], v + ".mp3")) for v in VOICES)}
    print("const VOICES=" + json.dumps(rows) + ";")
