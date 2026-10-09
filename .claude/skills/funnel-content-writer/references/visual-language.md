# Visual language

The default house look for `Visual:` notes. It is a **default, not a law** — if the app has its own brand, a different audience (clinical, kids, premium/minimal), or the user supplies art direction, write to that instead and say so in the file's intro paragraph.

`../assets/reference-funnel-screens.png` is the screenshot of the validated 12-screen mockup this default comes from. Look at it when writing `Visual:` so the notes stay grounded in a real design rather than generic guesses.

## Default theme

- Dark/black background throughout, purple-to-pink gradient accents on primary buttons and option pills.
- Small award/trophy badge in the top bar on early screens — a trust signal, not literal store branding.
- One idea per screen, content centered, CTA pinned at the bottom.

## Per-block visual patterns

| Block | Pattern |
|---|---|
| Hook | Photo collage or two overlapping photos in a rounded card, tall aspect ratio, gradient CTA |
| Quiz question | Stacked pill-shaped option buttons, one emoji + short label; selected state fills solid |
| Cards variant | 4 large tappable cards with a glowing icon each, purple border on select |
| Personal-data input | Plain scrollable picker (date wheel, time clock face, location map pin) on the dark backdrop |
| Name / email input | Plain white input field on dark background, minimal chrome |
| Asset upload | Tall dashed-border box with a "+" and an uppercase label, solid purple action button below, small value line under it, arc/fan collage of finished results curving across the bottom edge |
| Social proof | Huge bold number on black, star row or press-logo strip beneath, optional quote card |
| Generation / loading | Hero result image filling the top half with a glowing ring animating over it; four stacked progress rows beneath — label left, % right, checkmark when done, full-width progress bar |
| Preview / tease | VIP badge, 4-5 icon benefit rows, gold/purple glow |
| Before / after | Split screen, dim cluttered left vs. glowing organized right |
| Gamified reward | Colorful segmented wheel centered on black, pointer at top, glow behind it, single CTA below |
| Paywall | **Web landing page, long scroll** (see "Web paywall" below): sticky brand bar, personal hero with their artifact + fact chips, plan block, what's-inside TOC, how-it-works, proof, guarantee, FAQ, plan block again, sticky bottom CTA |
| Fallback offer (upsell on decline) | Same web look as the paywall: sticky bar + close, "One-time offer · shown once" eyebrow, one glowing offer card with their artifact thumbnail, struck real price → offer price "today", 3 checks, CTA, payment badges, renewal line, decline link. Timer only for a real deadline |
| Post-purchase upsell | Countdown only for a real deadline, add-on card with the original price struck through |
| Reveal / result | Interactive artifact (chart wheel, result gallery) with tappable elements and short tooltips |
| Success / download | App logo centered, short confirmation line, single CTA |

## Web paywall

The funnels in this repo are web2app, so the paywall is designed like a **sales landing page**, not an app sheet (user direction, 2026-09-30). Reference: `funnel/funnel-development/nebula/palm-reading/demo.html` screen 21.

- **Layout:** full-bleed scroll container with its own sticky top bar. No phone-style nav or progress bar. Sections are separated by generous vertical rhythm (~28px), each with an uppercase eyebrow + serif H2.
- **Plan block** is one elevated card holding the plans, the due-today row, the CTA, payment badges (Apple Pay · G Pay · VISA · Mastercard · PayPal), the secure/cancel row and the renewal line. The block repeats near the bottom.
- **Plan cards:** radio left, name + one-line sub, price right with the per-week equivalent under it, a ribbon on the pre-selected plan. Changing plan updates every block and the sticky bar in place, and never re-renders (that would lose the scroll position).
- **Hero** shows the user's own artifact (their photo with lines, their chart, their character). Never a stock image.
- **Sticky bottom CTA** slides up only while no plan block is visible (IntersectionObserver). The top-bar mini CTA scrolls to plan block #1.
- **Proof, guarantee and entity** come from CONFIG. Empty = the block hides; placeholder = dashed token, so nothing fake ships.

## Writing the `Visual:` field

One phrase, concrete enough for a designer to lay out without asking: background, the hero element, the control layout, the CTA treatment. Name motion only where it matters (the glowing ring on the loading screen, the wheel spin). Don't describe copy that's already in the Headline/Body fields.
