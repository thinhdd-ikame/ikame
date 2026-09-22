# Archetype — personalization-quiz

**Shape:** User answers a long sequence of questions about themselves → AI returns a personalized reading/plan → hard paywall, usually with a second revenue layer behind it.
**Signals:** Astrology, personality, compatibility, fitness plans, diet, mental health, sleep. Output accuracy genuinely depends on real inputs, so the quiz is not friction to minimize — it *is* the product demo, and every answer makes the eventual result feel impossible to fake. No asset upload at all.
**Modeled on:** Nebula: Horoscope & Astrology teardown (23-screen onboarding, hard paywall, post-purchase upsell, pay-per-minute chat) → `funnel/funnel-development/nebula/funnel-content.md`.

## Default flow (20-25 screens)

**A. Hook** (3) — emotional promise · social framing · speed/ease ("a few questions, one accurate reading").
**B. Investment** (9-12) — goals multi-select → single primary driver → bridge/reassurance → the real data inputs (date, time with a skip link, place) → demographic/segmentation questions → name capture → remaining preference questions. Interleave, don't stack all the hard inputs together.
**C. Trust** (2) — one interstitial right after the hardest inputs, a second before the account gate. Accuracy % first, usage count second.
**D. Anticipation** (3-4) — premium preview (benefit rows) · notification opt-in (the daily loop is the retention product) · before/after · generation/loading with rotating testimonials.
**E. Gate** (1) — registration before the reading is visible.
**F. Monetization** (2) — 3-tier paywall with a decoy middle tier and a dismissal fallback offer · post-purchase upsell with a countdown.
**G. Payoff** (1-2) — interactive result the user can explore · secondary revenue introduction.

## Monetization

**Two layers, two metrics.** The subscription paywall is the primary gate (hard — no app access without it). The second layer (pay-per-minute advisor chat, consumable credits, marketplace) opens right after the user has seen and trusted the AI result, and is sized separately — never fold it into paywall-conversion reporting.

Paywall structure: weekly / mid-tier decoy / annual pre-selected with a savings badge and a small per-week price. Fallback after dismiss: short free trial at the annual price.

## Traps

- **No gamified wheel.** The generated reading is already the reveal mechanic; a spin on top cheapens a credibility-dependent promise.
- **Every hard data input needs a skip with a reassuring fallback** ("we'll estimate it for you") — birth time, exact weight, etc. are the biggest drop-off cliffs in the funnel.
- **Quiz fatigue is the real enemy**, not quiz length: add a bridge/reassurance screen and a progress hint every ~5 screens.
- **Don't ask for anything the output doesn't use.** Analytics-only questions here cost real conversion.
- **Match proof to audience** — lifestyle press for astrology, clinical/press credibility for health.
- Age/legal gates and disclaimers belong in `Microcopy` and `Error state`, not in the headline.

## Known variants

- `nebula` (24 screens) — reference implementation; carries A/B copy variants on every screen plus full supporting microcopy (disclaimers, skip links, error states, tooltips).
