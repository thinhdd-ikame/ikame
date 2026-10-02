# Archetype — assessment-unlock

**Shape:** User takes a real test (graded answers or scored self-report) for free → the computed result they earned is unlocked by payment → one-time report or subscription to a multi-test library.
**Signals:** IQ, EQ, Big Five, 16 types, Enneagram, DISC, career, attachment/love style, trait quizzes. Traffic lands on a single-test page; the test itself is the investment (20-100 items); the output is a score/profile + report/certificate. The effort is the sunk cost, so the funnel sells "see what you earned", not a transformation or a utility.
**Modeled on:** testlibrary.com landers/pricing (2026-09-28), Testora (funnel.testora.space) and Impulse (iq.mental-impulse.com) captures via adspylab → `funnel/funnel-development/testlibrary/funnel-content.md`.

## Default flow (13-16 numbered screens; test items are one repeated template)
**A. Hook** (1-2) — lander with a cheap first tap that the result uses (age band) · how-it-works (length, rules). Disclose "free to take, report is paid" here.
**B. Investment** (3-4 templates) — one segmentation tap (reason) · test item template ×N · section checkpoint ×(sections-1) with honest progress only.
**C. Trust** (1) — social proof right after the test, before the email.
**D. Anticipation** (1) — scoring loader.
**E. Gate** (1-2) — email with a small free computed summary · name for the certificate/report.
**D. Tease** (1) — report preview with the name and the value blurred.
**F. Monetization** (2) — paywall (one-time report vs. library access, renewal on the card) · order summary + unticked consent.
**G. Payoff** (2-3) — result reveal · certificate/share · next test from the library.

## Monetization
Two paths on one paywall: a clean one-time report, and library access (paid trial → 4-weekly renewal, or lifetime). Measure plan mix, trial→renewal, refund/chargeback rate (the real health metric), and library tests started per subscriber separately.

## Traps
- **The niche's default is a hidden-billing lead magnet** ($1-2 "see your result" that silently becomes $30-55 every 4 weeks). Never build it: renewal price on the plan card, unticked consent box, reminder email, easy cancel, a real one-time option.
- **No fake mid-test rankings** ("faster than 93%"), resetting timers, fake live tickers, Einstein scales.
- **The score must be computed** against a stated norm group; show every band including below average; say "estimated", "not clinical", never "certified/official".
- Don't ask gender unless the scoring genuinely uses gendered norms; don't ask education unless the report uses it.
- Keep the stated test duration consistent with the real one — mid-test abandonment is the biggest leak.
- Trait quizzes (ADHD, autism, mood) need a visible not-a-diagnosis line and extra ad/policy review.
- No gamified wheel or countdown upsell; the library cross-sell replaces the upsell.

## Known variants
- `testlibrary` (15 screens) — reference implementation, IQ test; notes cover the Likert/profile reskin for personality tests.
- **testlibrary/personality-mbti** (2026-10-01): Likert reskin of the IQ brief; 40 statements over 4 traits give 4-letter type plus trait percentages; profile card replaces certificate; trademarked test never named.
- **testlibrary/archetype** (2026-10-01): 24 forced-choice image pairs instead of Likert; 12-archetype wheel with lead, supporting and shadow; optional gender screen only for card pronouns.
- **testlibrary/autism-traits, adhd-traits, relationship-patterns** (2026-10-01): health trait self-checks; expectations screen before first item, banded results with no total, label or cut-off, persistent Need-help strip, support sheet; neutral landing headline (condition named only for organic); one-area offer smaller than the report. autism-traits: 30 items/5 areas, private visit-notes artifact instead of share card. adhd-traits: 18 frequency items/3 areas. relationship-patterns: 24 items/4 areas, describes own experience never labels others, DV hotline.
- **testlibrary/brain-memory** (2026-10-01): five playable mini-games replace question items; own 0-100 per game, no norm or age scale; not-a-medical-test and Need-help on every screen; plan goals derived from own scores; offer is score summary.
