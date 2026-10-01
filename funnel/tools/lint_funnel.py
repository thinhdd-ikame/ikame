#!/usr/bin/env python3
"""Lint funnel-content.md files against the format contract and copy rules."""
import re
import sys

REQUIRED = ["niche", "display_name", "archetype", "subject", "input", "output",
            "screens", "monetization", "creative_screens", "motion"]
LIMITS = (("Headline", 6), ("Body", 12))


def lint(text):
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        return ["missing frontmatter"]
    fm = m.group(1)
    errs = []
    keys = set(re.findall(r"^([a-z_]+):", fm, re.M))
    errs += [f"frontmatter missing '{k}'" for k in REQUIRED if k not in keys]

    nums = [int(n) for n in re.findall(r"^### (\d+)\.", text, re.M)]
    if nums != list(range(1, len(nums) + 1)):
        errs.append(f"screens not numbered 1..N continuously: {nums}")
    sm = re.search(r"^screens:\s*(\d+)", fm, re.M)
    if sm and int(sm.group(1)) != len(nums):
        errs.append(f"frontmatter screens={sm.group(1)} but {len(nums)} screen headings")

    for label, limit in LIMITS:
        for var, val in re.findall(rf"^\*\*{label} ([AB]):\*\*\s*(.+)$", text, re.M):
            n = len(re.sub(r"\{\{[^}]+\}\}", "X", val).split())
            if n > limit:
                errs.append(f"{label} {var} has {n} words (>{limit}): {val.strip()}")

    heads = " ".join(re.findall(r"^### \d+\..*$", text, re.M)).lower()
    if "paywall" not in heads:
        errs.append("no Paywall screen")
    if not re.search(r"offer|upsell|last.chance", heads):
        errs.append("no fallback/last-chance offer screen")
    if re.search(r"\b(TBD|TODO|lorem ipsum)\b", text, re.I):
        errs.append("placeholder text (TBD/TODO/lorem)")
    return errs


if __name__ == "__main__":
    failed = 0
    for path in sys.argv[1:]:
        errs = lint(open(path, encoding="utf-8").read())
        for e in errs:
            print(f"{path}: {e}")
        failed += bool(errs)
    print("OK" if not failed else f"{failed} file(s) failed")
    sys.exit(1 if failed else 0)
