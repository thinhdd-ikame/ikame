"""demo.html (img/ links) -> funnel.html (images embedded as base64)."""
import base64, os, re

HERE = os.path.dirname(os.path.abspath(__file__))

src = open(os.path.join(HERE, "demo.html"), encoding="utf-8").read()
imgs = sorted(f for f in os.listdir(os.path.join(HERE, "img")) if f.endswith(".jpg"))
entries = ",\n".join(
    f"'img/{f}':'data:image/jpeg;base64,{base64.b64encode(open(os.path.join(HERE, 'img', f), 'rb').read()).decode()}'"
    for f in imgs)
out = re.sub(r"/\*IMG-START\*/\{.*?\}/\*IMG-END\*/", lambda m: "/*IMG-START*/{" + entries + "}/*IMG-END*/", src, flags=re.S)
dst = os.path.join(HERE, "funnel.html")
open(dst, "w", encoding="utf-8").write(out)
print(f"{len(imgs)} images embedded -> funnel.html ({os.path.getsize(dst)//1024} KB)")
