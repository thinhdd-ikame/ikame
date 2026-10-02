# Archetype — diagnostic-utility

**Shape:** User answers a short self-assessment → gets a computed score/diagnosis naming the problems they have → each problem is paired with a feature of a utility app → subscription (often sold on the web before install).
**Signals:** Utility whose value is invisible until something goes wrong: authenticator/2FA, VPN, password manager, antivirus/cleaner, backup, parental control, call blocker. Nobody is excited to buy it, so the funnel has to make the user *own a problem* first. The quiz is short (3-5 questions); it is a diagnosis, not the product.
**Modeled on:** `funnel/funnel-development/authenticator/funnel-content.md` (Figma "Funnel / Web Funnel", 12 designed screens + 2 added). Category pattern, unverified against competitor teardowns.

## Default flow (11-14 screens)

**A. Hook** (2-3) — social proof · the product in one glance (real service logos) · answer the first objection (backup / privacy).
**B. Investment** (4-6) — threat-naming quiz intro with a testimonial · 3-5 quiz questions, the first one being the answer that drives the score most. One multi-select "what's at stake" question makes the risk personal.
**D. Anticipation** (1) — calculating screen, with "based on your answers, not your device data".
**E. Gate** (1) — email (web funnel) before the score is revealed.
**D. Reveal** (1) — score + band + only the risk cards the answers triggered, each with a "FIX:" line naming a shipped feature.
**F. Monetization** (1) — long-scroll paywall: mockup, 3 plans (annual pre-selected, monthly decoy), payment logos, feature list, review, FAQ.
**G. Payoff** (1) — download handoff: install, sign in with the same email, first action.

## Monetization

Usually one layer: subscription. On web funnels, measure **activation (install + sign-in)** separately from paywall conversion, because unactivated web buyers refund and charge back.

## Traps

- **The score must be computed from the answers,** with a published rubric and a low band that exists. A fixed "72/100 High Risk" for everyone is a fake diagnosis, and users who are already protected will see through it.
- **Every FIX line must be a feature the app actually ships.** Promising a vault or VPN the app doesn't have means guaranteed refunds.
- **No fake countdowns or invented "was" prices.** A security/trust brand that looks scammy loses more than urgency gains, and it's deceptive-pricing exposure (see the no-hidden-billing rule in personalization-quiz.md).
- No absolute claims ("un-hackable", "100% secure").
- A question's framing must match the threat the product fixes (SIM swap ≠ "someone got your phone").
- Put the answer colors the right way round: green = safe answer.

## Known variants

- `authenticator` (13 screens) — reference implementation; iOS 2FA, web checkout, email gate before score.
