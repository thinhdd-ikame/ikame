# Archetype — ai-transformation

**Shape:** User uploads one asset (photo, video, voice) → AI returns a transformed version → a hard paywall stands between them and the result.
**Signals:** Novelty/entertainment value, one-shot output, impulse purchase, the subject is someone or something the user loves (their pet, baby, partner, self). No real data collection needed.
**Modeled on:** The repo's validated 12-screen mobile flow — `../../assets/reference-funnel-screens.png` and the `dancing/`, `halloween/`, `photo-bw/` funnels.

## Default flow (12 screens)

**A. Hook** (3) — Hook A emotional promise · Hook B social framing · Hook C speed/ease.
**B. Investment** (3) — Name capture (before any preference question) · Quiz: style, 4 presets incl. a "Surprise me" plus `✏️ Other` · Quiz: occasion/goal, same pill layout.
**B. Investment** (1) — Asset upload: dashed box, `CREATE NOW` CTA, value line under it, arc collage of finished results across the bottom.
**C. Trust** (1) — Social proof: big usage count + press logos, placed right before generation.
**D. Anticipation** (2) — Generation/loading with 4 progress rows and a hero result image · Gamified reward (lucky wheel) right before the paywall.
**E. Gate** (1) — Registration: email + password, no result visible before it.
**F. Monetization** (1) — Paywall: weekly vs. annual, savings highlighted on annual, Apple Pay CTA.

Two short quiz questions beat one long one — each tap is investment banked before the upload ask. The upload is deliberately late: by then the user has named their subject and picked a style.

## Monetization

Single layer: hard subscription paywall at the end, weekly vs. annual. No upsell screen in the validated flow. The lucky wheel exists to make the price feel earned; it is this archetype's substitute for a discount offer.

## Traps

- **Don't move the upload earlier.** It's the highest-friction ask and it converts only after investment.
- **Don't use "Continue" on the upload screen** — a verb CTA (`CREATE NOW`) measurably belongs to the action.
- **Press logos and stat numbers must match the subject.** Pet press for pets, parenting press for babies.
- **Options that are too long break the layout** — emoji + 1-3 words, always with an `✏️ Other` escape hatch.
- **Personalization token per subject** (`{{cat_name}}`, `{{baby_name}}`, `{{user_name}}`) — the creative pipeline resolves these per funnel, so keep the `<entity>_name` convention.

## Calibration — how much changes per niche

The *shape* stays (4 options, one emoji each, last one a wildcard); only the wording adapts:

| Niche | Occasion options | Style options |
|---|---|---|
| baby-dancing | 🎉 Birthday · 👶 Just for fun · 🎁 Gift for family · 📱 Post on social media | 🕺 Funny & Bouncy · 🩰 Cute & Gentle · 🔥 Viral TikTok Style · 🎶 Surprise me |
| pet-dancing | 🎉 Pet's birthday · 🐾 Just for fun · 🎁 Gift for a pet lover · 📱 Post on social media | 🐕 Funny & Bouncy · 🐈 Smooth & Sassy · 🔥 Viral TikTok Style · 🎶 Surprise me |

## Frontmatter defaults

```yaml
archetype: ai-transformation
screens: 12
creative_screens: {hook-a: 1, hook-b: 2, hook-c: 3, generation: 9}
```

Keep the slug `generation` (not `reveal`) for funnels in this archetype — the existing creative output is already named after it.

## Known variants

- `cat-royal-portrait` — same 12 screens, portrait-styling wording.
- `baby-dancing-v2` — iteration on copy only, structure unchanged.
- Any funnel needing a payoff/download screen adds it after the paywall as screen 13 — the validated flow ends at the paywall because the app takes over there.
- `ai-photo-video/ai-video-generator` (16 screens) — **multi-template catalog variant**, for apps selling many effects (dance, trends, pet, baby, concert) rather than one niche. Changes:
  - A "Who's the star?" subject pick comes first in Investment, and it drives the name token, style options and art.
  - Name capture moves after that pick.
  - A 2-second watermarked preview-tease sits before the wheel.
  - The wheel prize is bonus coins (real consumable) instead of a discount.
  - The paywall is weekly-only (no annual IAP exists).
  - A coin-pack screen is added as a second revenue layer after purchase.

  Use it whenever the app's store listing shows a template catalog plus coins.
