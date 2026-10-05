#!/usr/bin/env python3
"""Lint funnel-content.md files against the format contract and copy rules."""
import re
import sys

REQUIRED = ["niche", "display_name", "archetype", "subject", "input", "output",
            "screens", "monetization", "creative_screens", "motion"]
LIMITS = (("Headline", 6), ("Body", 12))


def lint(text):
    # Accept both LF and CRLF line endings
    m = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n", text, re.S)
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
            # Replace tokens with placeholder, then count words
            cleaned = re.sub(r"\{\{[^}]+\}\}", "X", val)
            # Split on whitespace and filter out standalone punctuation tokens
            tokens = cleaned.split()
            words = [w for w in tokens if w and not re.fullmatch(r"[—\-/|&+]+", w)]
            n = len(words)
            if n > limit:
                errs.append(f"{label} {var} has {n} words (>{limit}): {val.strip()}")

    screen_heads = [h.lower() for h in re.findall(r"^### \d+\..*$", text, re.M)]
    if not any("paywall" in h for h in screen_heads):
        errs.append("no Paywall screen")
    # Offer screen must exist and not be the paywall, unless the app's policy forbids one
    # (frontmatter `offer: none`, e.g. Nebula 2026-10-05: no sale, hard paywall)
    no_offer_policy = re.search(r"^offer:\s*none\s*$", fm, re.M)
    has_offer = any(re.search(r"offer|upsell|last.chance", h) and "paywall" not in h for h in screen_heads)
    if not has_offer and not no_offer_policy:
        errs.append("no fallback/last-chance offer screen")
    if re.search(r"\b(TBD|TODO)\b", text) or re.search(r"\blorem ipsum\b", text, re.I):
        errs.append("placeholder text (TBD/TODO/lorem)")
    return errs


if __name__ == "__main__":
    if not sys.argv[1:]:
        print("Usage: python3 lint_funnel.py <funnel-content.md> ...")
        sys.exit(2)
    failed = 0
    for path in sys.argv[1:]:
        errs = lint(open(path, encoding="utf-8").read())
        for e in errs:
            print(f"{path}: {e}")
        failed += bool(errs)
    print("OK" if not failed else f"{failed} file(s) failed")
    sys.exit(1 if failed else 0)
