"""demo.html (img/ links) -> funnel.html (images embedded as base64) + funnelfox-export copy."""
import base64, os, re, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
EXPORT = os.path.join(HERE, "..", "..", "..", "funnelfox-export", "chai-create-your-ai.html")

src = open(os.path.join(HERE, "demo.html"), encoding="utf-8").read()
imgs = sorted(f for f in os.listdir(os.path.join(HERE, "img")) if f.endswith(".jpg"))
auds = sorted(f for f in os.listdir(os.path.join(HERE, "audio")) if f.endswith(".mp3"))
entries = ",\n".join(
    [f"'img/{f}':'data:image/jpeg;base64,{base64.b64encode(open(os.path.join(HERE, 'img', f), 'rb').read()).decode()}'" for f in imgs] +
    [f"'audio/{f}':'data:audio/mpeg;base64,{base64.b64encode(open(os.path.join(HERE, 'audio', f), 'rb').read()).decode()}'" for f in auds])
out = re.sub(r"/\*IMG-START\*/\{.*?\}/\*IMG-END\*/", lambda m: "/*IMG-START*/{" + entries + "}/*IMG-END*/", src, flags=re.S)
dst = os.path.join(HERE, "funnel.html")
open(dst, "w", encoding="utf-8").write(out)
shutil.copyfile(dst, EXPORT)
print(f"{len(imgs)} images + {len(auds)} voice clips embedded -> funnel.html ({os.path.getsize(dst)//1024} KB) + funnelfox-export/chai-create-your-ai.html")
