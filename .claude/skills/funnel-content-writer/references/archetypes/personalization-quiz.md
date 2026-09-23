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
- **Do not copy the "$1 lead-magnet into hidden recurring subscription" pattern** used by some standalone lead-gen funnels in this space (see Known variants below) — it is the exact mechanic named in a 2026 FTC lawsuit against Nebula/Obrio's subscription network. A cheap front-end offer is fine; an undisclosed or hard-to-cancel auto-renew behind it is a legal exposure, not a growth tactic, and should never be built into an ikame funnel regardless of how well it converts competitors.

## Known variants

- `nebula` (24 screens) — reference implementation; carries A/B copy variants on every screen plus full supporting microcopy (disclaimers, skip links, error states, tooltips).
- `starlyn` (21 screens) — **freemium / honest-brand variant.** The app has guest mode and promises "no timers, price shown first", so: the free Big Three reveal comes *before* the paywall (paywall sells depth, not access); the account gate is soft (Apple/Google + "Continue as guest"); the paywall is dismissible with a single disclosed-trial fallback; no countdown upsell; the second layer is consumable question packs introduced via free questions. Adds a Sun-sign micro-reveal as the bridge right after the birth date, and an optional "someone on your mind" branch that powers a compatibility tease. Use this variant whenever the app itself is freemium or its brand positioning rules out urgency mechanics.
- **Soulmate Sketch lead-magnet (competitive reference only, not implemented)** — a top-of-funnel variant Nebula itself runs at `appnebula.co/soulmate-sketch`, and a pattern shared by standalone competitors (e.g. Cosmic Media's "Soulmate Sketch", drawmysoulmate.org). Shape differs from the main archetype in two ways: (1) **no instant AI reveal** — the "result" is delivered asynchronously by email/app 24-48h later, so the Anticipation stage is a "we're working on it, check back" message instead of a live generation/loading screen; (2) monetization is a **front-end micro-transaction ($1-$10) that either (a) discloses a genuine one-time price with a refund window (the non-deceptive standalone-app version, ~$29.95), or (b) silently enrolls the user in a recurring subscription only revealed when the $39-49.99/mo charge hits their card weeks later** — per Trustpilot complaints, users report a ~30-question quiz (about themselves + desired partner traits: sun sign, ascendant, eye/hair color, face shape) followed by app download, the $1 charge, account creation, and then no visible result at all before the hidden billing starts. Variant (b) is the one flagged in the 2026 FTC lawsuit context — see the Traps note above. If ikame ever builds an async-delivery lead-magnet in this shape, model it on variant (a) only.
