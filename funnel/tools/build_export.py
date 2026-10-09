#!/usr/bin/env python3
"""Usage: build_export.py <funnel-folder> <export-name> <out-dir>

demo.html + img/ -> funnel.html (images inlined as base64) and <out-dir>/<export-name>.html.
"""
import base64, mimetypes, os, re, shutil, sys

MIME = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}
MARK = re.compile(r"/\*IMG-START\*/\{.*?\}/\*IMG-END\*/", re.S)


def main(argv):
    if len(argv) != 4:
        print(__doc__, file=sys.stderr)
        return 2
    folder, name, out_dir = argv[1:]
    src = open(os.path.join(folder, "demo.html"), encoding="utf-8").read()
    if not MARK.search(src):
        print(f"ERROR: {folder}/demo.html has no /*IMG-START*/{{...}}/*IMG-END*/ IMG marker", file=sys.stderr)
        return 1
    img_dir = os.path.join(folder, "img")
    files = sorted(f for f in os.listdir(img_dir) if os.path.splitext(f)[1].lower() in MIME) if os.path.isdir(img_dir) else []
    uris = {}
    for f in files:
        data = base64.b64encode(open(os.path.join(img_dir, f), "rb").read()).decode()
        uris["img/" + f] = f"data:{MIME[os.path.splitext(f)[1].lower()]};base64,{data}"
    # honour aliases in the existing map ('img/a.jpg':'img/b.jpg'): key -> data of the value file
    for k, v in re.findall(r"'([^']+)'\s*:\s*'([^']+)'", MARK.search(src).group(0)):
        if v in uris:
            uris[k] = uris[v]
        elif k not in uris and not v.startswith("data:"):
            print(f"WARNING: IMG map entry {k} -> {v} has no file in {img_dir}; dropped (demo falls back to placeholder)", file=sys.stderr)
    entries = ",\n".join(f"'{k}':'{v}'" for k, v in uris.items())
    out = MARK.sub(lambda m: "/*IMG-START*/{" + entries + "}/*IMG-END*/", src, count=1)

    def lit(m):
        return m.group(1) + uris[m.group(2)] + m.group(3) if m.group(2) in uris else m.group(0)

    out = re.sub(r"""(src=["'])(img/[^"']+)(["'])""", lit, out)
    out = re.sub(r"""(url\(["']?)(img/[^"')]+)(["']?\))""", lit, out)

    dst = os.path.join(folder, "funnel.html")
    open(dst, "w", encoding="utf-8").write(out)
    os.makedirs(out_dir, exist_ok=True)
    exp = os.path.join(out_dir, name + ".html")
    shutil.copyfile(dst, exp)
    print(f"{len(uris)} images embedded -> {exp} ({os.path.getsize(dst)//1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
