# Archetype — scanner-identifier

**Shape:** User photographs a real object they own → AI identifies it and returns facts; the free tier shows *what* it is, the subscription unlocks *what it's worth / what to do* (value, grade, diagnosis, care) plus unlimited scans and a collection.
**Signals:** Coin, plant, rock/crystal, mushroom, insect, antique, banknote, stamp, wine-label identifiers. Output is information, not a new image; accuracy and trust decide retention; repeat use (next object, collection) is the business. Often sold with "your object may be valuable/rare".
**Modeled on:** `scanner/coinin` (17 screens). Teardown of CoinIn web funnel (long attitude quiz, no scan, hard paywall) and CoinSnap (near-passive onboarding → 7-day trial paywall).

## Default flow (14-18 screens)

**A. Hook** (2-3) — Hook: the "unknown object" before-state · product in one glance (photo → ID card) · honest-expectation hook (ranges/estimates, not jackpots).
**B. Investment** (3-5) — 3-4 quiz questions (where it's from, what they want to know [multi-select → paywall order], which types, experience level) · optional educational mini-game showing why details matter (no value figures).
**C. Trust** (1) — Social proof right before the camera ask, real store rating + real review only.
**D. Scan** (4-5) — camera primer with capture tips + "try a sample" escape · asset upload as live capture (1-2 angles, auto-capture, quality error states) · generation/loading on the user's own photo · partial reveal: identity free, value/grade/diagnosis locked with neutral blur + no-match state.
**E. Gate** (1) — Registration framed as "save to your collection", skippable (App Store 5.1.1).
**F. Monetization** (1) — Soft paywall: weekly + annual pre-selected, optional trial toggle off by default, renewal price at plan size, visible close.
**G. Payoff** (1) — full result on the object already scanned + "scan next" loop; rating ask after the 2nd successful scan.

## Monetization

One layer by default: subscription (unlimited scans + gated detail + collection). Marketplace, expert chat or appraisal are separate layers — measure separately if monetized. Track first-scan success rate as its own metric; it predicts refunds.

## Traps

- **Never promise a value.** Show ranges by condition + "estimate, not appraisal". Dollar-figure hooks ("could this be worth $12,000?") set expectations the scan disappoints → refunds, 1-star reviews, FTC endorsement risk.
- The category's incumbents lean on countdowns, strike-through anchors and low-entry "trials" renewing at a much higher recurring price. Document, never copy.
- A failed first scan kills the funnel: pre-permission primer, live quality hints, sample-object path, and a no-match state are required, not polish.
- Locked cards must not tease fake numbers ("$$,$$$" silhouettes).
- Proof must be this app's real store numbers; no live "X people scanning now" counters.
- No wheel/spin: next to money or safety (mushrooms, plants for pets) it reads as a casino.

## Known variants

- `scanner/coinin` (17) — reference; two-sided capture, educational error mini-game.
- **scanner/coinin-collector** (2026-10-01): web variant with labelled illustrated persona host, scan with sample-item fallback, free ID card plus level badge before email gate, one-time single-item report as offer; base for the other collectibles funnels (swap the `COLLECT` block).
- **scanner/coinin-cards** (2026-10-01): trading cards; one "which card grades higher" game with no value figures, raw range plus grade-potential teaser, sports-card branch at bridge; descriptive text instead of game/grader trademarks.
- **scanner/coinin-antique** (2026-10-01): heirlooms/estates; inherited/estate-clearing answer drives a calming "Don't clear it all yet" bridge; free ID card, paywall holds value range, where to sell and real-or-reproduction read.
- **scanner/coinin-notes-stamps-gems** (2026-10-01): three object branches picked on screen 2 with branch-specific questions, game and sample; no persona host; "real or fake" is an indication, never certification; value always a range.
- **scanner/coinin-plant** (2026-10-01): living subject; free plant ID plus likely-cause indication plus days 1-2 of a 7-day plan; whole-plant then leaf close-up photos; diagnosis is an indication, no pesticide or toxicity claims.
