---
niche: soulmate-sketch
display_name: Starlyn - Soulmate Sketch + Palm Heart Line (web2app)
archetype: personalization-quiz
subject: person
input: partner gender and age, love-life status, name, birth date, birth time (optional), birth place, partner look and traits, optional left-palm photo
output: AI soulmate sketch + partner sign + optional heart-line palm reading
screens: 24
monetization: hard web paywall after the email gate: one plan, 1-week intro then monthly auto-renew; no sale or last-chance offer; purchase leads to a get-the-app screen; then one optional add-on report ($19.99, paid once in its own Paddle one-time checkout, skippable) before the get-the-app screen
offer: none
creative_screens:
  hook-a: 1
  hook-b: 2
  venus: 7
  palm: 16
  reveal: 19
  tease: 20
motion: >
  a portrait drawing itself in gold graphite on cream paper - pencil strokes
  tracing a face line by line over a slow star field, eyes appearing last
---

# Funnel Content — Starlyn · Soulmate Sketch

A web2app funnel (Meta ad → web quiz → web paywall → Starlyn app) for the biggest astrology niche on Meta right now. AdSpyLab counted 78.5K "soulmate sketch" ads in 03-08/2026, 14.6K of them in August, up 54% over the last three months. Hint (53K ads, still growing) is filling the space Nebula left when it stopped these ads in August because of the FTC case. Target is US women 28-45. The user gives partner preferences, birth data and optionally a palm photo. They get an AI-drawn sketch, their partner sign and a heart-line reading. The palm step is a side test that rides on the main hook, since palm reading is a small but growing niche (5.6K ads, +105%). This is the **personalization-quiz** archetype, built as the honest "variant (a)" of the Soulmate Sketch lead magnet described in `references/archetypes/personalization-quiz.md`. **Modeled on:** Hint `hint.app/soulmate` (39 screens, €1 front-end plus a "93% promo code") and Nebula's own `appnebula.co/soulmate-sketch/prelanding` (33 screens, paid trial of €49.99/7d renewing at €13.67/30d). **What I deliberately changed:**

- The first screen is the first tap ("who should we sketch?"), not two info screens.
- The quiz is cut from ~20 partner questions to 7. Each one we keep feeds something the sketch or reading actually shows.
- Instead of an ethnicity question, the user picks hair and eye color, with "let the chart decide" as the default.
- Birth time is used to find the Descendant (partner sign), so the most-skipped input has a visible payoff.
- The live sketch is generated right away. There is no 24-48h async delivery and no fake "your artist has started" persona.
- Nothing is charged before the price is shown. One plan only: a 1-week intro that renews monthly, stated on the card and the CTA line.
- Renewal price appears on every plan card and in the CTA line.
- No promo codes, countdowns or fake tickers.

The visual system is the base `nebula/` house look (dark, purple-pink gradient CTAs), plus a cream-paper and gold-graphite sketch motif for the hero object. 24 screens.

---

## A. Hook

### 1. Hook A — Who we sketch (first tap)
**Purpose:** Picks up the ad's "see your soulmate's face" promise and makes the very first screen a cheap tap that the sketch actually uses.
**Headline A:** See your soulmate's face
**Headline B:** Who is your soulmate?
**Body A:** Your chart and answers become one sketch.
**Body B:** A few questions, then you see them.
**Options:**
- 👨 A man
- 👩 A woman
- 💞 Anyone
**Field:** Single-select, auto-advance on tap; sets `{{partner_pronoun}}` and the sketch's base face model
**Visual:** Dark star field; a half-drawn pencil portrait on a tilted cream-paper card in a rounded frame, the finished strokes glowing gold. Three gradient pills below. Trust badge in the top bar only if real press exists.
**Microcopy:** Under options: "3-minute quiz · For entertainment". Legal line: "By continuing, you agree to our Terms & Privacy Policy"
**CTA:** (auto-advances on selection)

### 2. Hook B — How the sketch is made
**Purpose:** Sets honest expectations (chart + answers → AI illustration) and introduces the palm side test as a bonus, not a hurdle.
**Headline A:** Drawn from your stars
**Headline B:** Three steps to their face
**Body A:** Your chart, your answers, then your sketch.
**Body B:** Plus a free palm read of your heart line.
**Visual:** Three stacked step rows, each with a glowing icon (chart wheel → heart → pencil portrait); a fourth, smaller "bonus" row with a palm outline. Simple fade-in per row, no 3D.
**Microcopy:** Step rows: "1. Your birth chart" / "2. What you're drawn to" / "3. Your sketch". Bonus chip: "Bonus: heart-line palm read". Small line: "Your sketch is an AI illustration."
**CTA:** Start my sketch

---

## B. Investment

### 3. Love life now
**Purpose:** Frames the reading. Single users get the "where and when you may meet" section, and dating or committed users get "is it them?" (the compare feature in the app).
**Headline A:** Where's your love life now?
**Headline B:** How's your heart lately?
**Body A:** This decides what your reading focuses on.
**Options:**
- 🌱 Single
- 💞 Dating someone
- 💍 Committed
- 💔 Healing from someone
- 🌀 It's complicated
**Field:** Single-select, auto-advance. Closed set, so no "Other"
**Visual:** Stacked pill buttons on dark background, selected pill fills solid gradient.
**CTA:** (auto-advances on selection)

### 4. Their age
**Purpose:** Sets the apparent age of the sketch. The sketch visibly uses it, so it earns its screen.
**Headline A:** How old are they?
**Headline B:** Their age range?
**Body A:** Sets the age of your sketch.
**Options:**
- 🌿 20-30
- 🌸 30-40
- 🍂 40-50
- ❄️ 50+
**Field:** Single-select, auto-advance
**Visual:** Four pills; a faint pencil outline above them subtly matures as each option is hovered or pressed.
**CTA:** (auto-advances on selection)

### 5. Name
**Purpose:** Captures `{{name}}`. The finished sketch is "signed" for them, and every later screen uses it.
**Headline A:** What's your name?
**Headline B:** Who's this sketch for?
**Body A:** We'll sign your sketch with it.
**Body B:** First name is all we need.
**Field:** Text input, placeholder "Your first name", max 30 chars, keyboard opens on load
**Visual:** Plain white input on dark background; a gold signature line on a small paper card previews the name as they type.
**Error state:** "Add your name to continue"
**CTA:** Continue

### 6. Date of birth
**Purpose:** First real astrology input. Finds the Venus sign (love style), which pays off right away on #7.
**Headline A:** When were you born?
**Headline B:** Your birthday, {{name}}?
**Body A:** Your date finds your Venus, your love sign.
**Body B:** Your birthday shapes how you love.
**Field:** Date wheel (month / day / year); age gate 18+
**Visual:** Plain scrollable date wheel on the star-field backdrop.
**Error state:** "Pick a full date to continue". Under 18: a blocking notice, "Starlyn is for adults 18+." / "You must be 18 or older to use Starlyn. Entered the wrong date? Change it below.", with a "Change my birth date" button that clears the date and returns here. The block persists for the session (sessionStorage `ikf_age_block`) and fires `age_block`.
**CTA:** Continue

### 7. Your Venus (micro-reveal bridge)
**Purpose:** Gives value back straight after the first hard input, so the next two harder inputs feel worth it. This is Starlyn's Sun-sign bridge, retuned to love.
**Headline A:** Your Venus is in {{venus_sign}}
**Headline B:** {{name}}, you love like {{venus_sign}}
**Body A:** Two more details find your partner sign.
**Body B:** Time and place reveal who you attract.
**Visual:** Chart wheel with only the Venus glyph lit rose-gold, sign glyph large in the center, a single soft pulse on load.
**Microcopy:** One-line trait under headline, e.g. "Venus in Taurus — you fall slowly, then for good." Progress hint: "Your chart: 1 of 3 details"
**CTA:** Continue

### 8. Time of birth
**Purpose:** The biggest drop-off cliff. Tying it to a concrete output (the Descendant, i.e. the partner sign) gives a reason to find it, and the skip still keeps a real fallback.
**Headline A:** What time were you born?
**Headline B:** Know your birth time?
**Body A:** Time finds your Descendant — your partner sign.
**Body B:** A birth certificate or parent can tell you.
**Field:** Time wheel + text link
**Visual:** Time wheel sheet; a ring around the chart wheel with the 7th-house slot outlined in gold.
**Skip link:** "I don't know my birth time"
**Microcopy:** Shown after skip: "No problem — we'll read your partner sign from Venus."
**CTA:** Continue

### 9. Place of birth
**Purpose:** Completes the chart. Place fixes the chart angles, which the partner sign depends on.
**Headline A:** Where were you born?
**Headline B:** Your birth city, please
**Body A:** City is enough. It fixes your chart's angles.
**Body B:** No address needed, just the city.
**Field:** City search with autocomplete ("City, country")
**Visual:** Search field on dark background, glowing pin on a stylized world map.
**Error state:** "We couldn't find that place. Try a nearby city."
**Microcopy:** "We never share or sell your details."
**CTA:** Continue

---

## C. Trust

### 10. Your details stay yours
**Purpose:** Trust beat right after the three birth inputs. For this niche the fear is being charged by surprise, so answer that here, well before the paywall.
**Headline A:** Your details stay yours
**Headline B:** {{sketch_count}} sketches drawn so far
**Body A:** Used only for your chart and sketch. Never sold.
**Body B:** Real people, real sketches, real reviews.
**Visual:** Lock icon in a glowing icon well, three promise rows beneath. Variant B: huge stat number, star row, one quote card.
**Microcopy:** Promise rows: "Never shared or sold" / "Price shown before you pay" / "Delete your data anytime". **Fill `{{sketch_count}}` and any quote from real ikame data only. Ship variant A until it exists.**
**CTA:** Continue

---

## B. Investment (continued) — what they're drawn to

### 11. Their look
**Purpose:** Feeds the only visual attributes the sketch needs. It replaces competitors' ethnicity question and defaults to "chart decides", so the screen costs one tap.
**Headline A:** Any look you're drawn to?
**Headline B:** What catches your eye?
**Body A:** Optional. Or let your chart decide.
**Field:** Two chip rows, single-select each, both default to "✨ Chart decides" so the CTA is enabled on load.
- Hair: 🖤 Dark · 🤎 Brown · 💛 Light · 🧡 Red · ✨ Chart decides
- Eyes: 🟤 Brown · 🔵 Blue · 🟢 Green · ✨ Chart decides
**Visual:** Small pencil portrait at top; hair and iris strokes tint softly as chips are picked.
**Microcopy:** "Your sketch is an illustration, not a real person."
**CTA:** Continue

### 12. What they must have
**Purpose:** Shapes the sketch's expression (warm eyes, easy smile) and writes the "their nature" section of the reading.
**Headline A:** What must they have?
**Headline B:** Your non-negotiables?
**Body A:** Pick up to three. They shape the expression.
**Options:**
- 😇 Kindness
- 🤝 Loyalty
- 😂 Humor
- 🔥 Passion
- ✏️ Other
**Field:** Multi-select, 1-3 picks, CTA enabled on ≥1; "Other" opens a one-line input
**Visual:** Stacked pills, selected ones fill solid with a small check.
**Microcopy:** Disabled-CTA hint: "Pick at least one"
**CTA:** Continue

### 13. Your pattern
**Purpose:** Feeds the "what to watch for" section, which gives the reading a use beyond the picture.
**Headline A:** What keeps going wrong?
**Headline B:** Your pattern in love?
**Body A:** Your reading shows how to break it.
**Options:**
- 🙈 Wrong people
- 🧊 Hard to trust
- 🔁 Same old fights
- 🕰️ Bad timing
- ✏️ Other
**Field:** Single-select, auto-advance (Other opens input + Continue)
**Visual:** 4 large tappable cards with a glowing icon each, purple border on select.
**CTA:** (auto-advances on selection)

### 14. Love language
**Purpose:** Matches the user's love language to the partner sign's style in the reading ("how they show it").
**Headline A:** How do you feel loved?
**Headline B:** Your love language?
**Body A:** We'll match it to their style.
**Options:**
- 💬 Kind words
- 🤲 Helpful acts
- 🫂 Touch
- ⏳ Quality time
- 🎁 Gifts
**Field:** Single-select, auto-advance. Closed set, so no "Other"
**Visual:** Stacked pills, heart-shaped selection glow.
**CTA:** (auto-advances on selection)

### 15. Sketch has begun (bridge)
**Purpose:** Breaks up quiz fatigue by showing the product starting to form, and frames the optional palm step as the last thing left.
**Headline A:** Your sketch has begun
**Headline B:** First lines are down, {{name}}
**Body A:** One optional step adds your heart line.
**Visual:** Cream-paper card with only the face outline and hair drawn in gold graphite, the rest blank; progress ring at ~70%.
**Microcopy:** Progress hint: "Almost there — 2 steps left". No "your artist" wording: the sketch is AI, and we don't imply a human illustrator.
**CTA:** Continue

---

## B2. Side test — palm heart line

### 16. Palm offer
**Purpose:** The side test from the media plan. It adds a second, fast-growing hook (palm reading) to the soulmate promise. It's opt-in, so users who don't want to use the camera lose nothing.
**Headline A:** Read your heart line too?
**Headline B:** Your palm holds a clue
**Body A:** One palm photo adds your love-line reading.
**Body B:** Your heart line shows how you love.
**Visual:** Left palm outline in thin gold line on dark; heart line glowing rose, head and life lines faint. Simple fade-in.
**Microcopy:** Chip row: "Optional · 20 seconds · Photo deleted after reading"
**Skip link:** "Skip — sketch only"
**CTA:** Scan my palm

### 17. Palm scan (conditional)
**Purpose:** The funnel's only asset upload. A guide overlay and auto-capture keep retakes low.
**Headline A:** Show us your left palm
**Headline B:** Hold your palm flat
**Body A:** Flat hand, good light, fingers together.
**Field:** Camera view with palm-outline overlay; auto-captures when aligned; "Upload a photo instead" fallback; browser camera permission prompt on load
**Value line:** "Used only for your reading, then deleted."
**Visual:** Full-bleed camera feed dimmed around a palm-shaped cutout; outline turns gold when aligned.
**Error states:** "We can't see your lines — try brighter light" / "Please show your whole palm" / "Camera blocked — upload a photo instead"
**Skip link:** "Skip palm reading"
**CTA:** Take photo

### 18. Palm read (trust beat)
**Purpose:** Trust beat right after the hardest input (a photo of your body). It proves the privacy promise was kept before anything else is asked.
**Headline A:** Heart line read, photo deleted
**Headline B:** Your heart line is in
**Body A:** We kept the lines, not the picture.
**Body B:** No palm? Your chart covers the heart side.
**Visual:** Palm photo fades out while traced vector lines stay, then a check mark. Skip path (Body B): Venus glyph instead of palm.
**Microcopy:** Path rule: Body A if #17 captured, Body B if skipped. **Product requirement:** the photo really is deleted after line extraction. Do not ship this copy until engineering confirms it.
**CTA:** Continue

---

## D. Anticipation

### 19. Drawing your soulmate (loading)
**Purpose:** Makes the sketch feel drawn for this user, and gives the best ad-creative screen in the funnel.
**Headline A:** Drawing your soulmate, {{name}}…
**Headline B:** Sketching {{name}}'s soulmate…
**Steps:** (4 rows, each with % counter, checkmark, progress bar)
- Reading your Venus and Descendant…
- Shaping the face you described…
- Adding the look in their eyes…
- Almost done — signing it for you…
**Visual:** Hero top half: portrait drawing itself in gold graphite on cream paper, stroke by stroke, eyes last. This is the only 3D/hero motion in the funnel (slight paper tilt). Progress rows beneath.
**Microcopy:** Small line: "AI illustration · For entertainment". No rotating testimonials unless they come from real reviews.
**CTA:** (auto-advances, ~8 seconds)

### 20. Sketch ready (tease)
**Purpose:** Gives away one real result (partner sign, plus heart-line type if scanned) so the paywall sells something the user already believes in. The face itself stays gated.
**Headline A:** {{name}}, your sketch is ready
**Headline B:** Meet them, almost
**Body A:** Your partner sign is free. Their face is next.
**Visual:** Sketch behind frosted glass, with only the silhouette and hairline readable. Unlocked card: "Partner sign: {{partner_sign}}" + one line. Heart-line chip if scanned. Four locked rows beneath with lock icons.
**Microcopy:** Free card sample: "Partner sign: Scorpio — deep, loyal, slow to open." Locked rows: "Full HD sketch" / "Their nature" / "Where and when you may meet" / "Your pattern, and how to break it". Footnote: "Sketch is an AI illustration for entertainment."
**CTA:** Unlock my sketch

---

## E. Gate

### 21. Where to send it
**Purpose:** Captures email, which is both the delivery address for the sketch and the Starlyn app login (web2app handoff). It comes after the tease, so the user already knows what they're getting.
**Headline A:** Where should we send it?
**Headline B:** Save your sketch, {{name}}
**Body A:** Your sketch and app login go here.
**Body B:** One email. Your sketch waits inside.
**Field:** Email input only, required: no skip, no guest path, no Google/Apple sign-in buttons (the email activates the subscription and is the app login). Marketing opt-in checkbox, **unchecked by default**. Emits `lead` (method `email`).
**Visual:** Plain white input on dark background, mini blurred sketch card above the field.
**Error states:** "Enter a valid email address" (Continue stays on this screen until the email is valid) / "This email already has a sketch — log in instead?"
**Microcopy:** Legal line: "By continuing, you agree to our Terms & Privacy Policy." Reassurance: "Nothing is charged on this step."
**CTA:** Continue

---

## F. Monetization

### 22. Paywall (hard, honest variant)
**Purpose:** Primary ask and a hard gate: the HD sketch and the full reading open only after purchase. One plan, and the card and the CTA line say exactly what renews and when. Modeled on archetype variant (a) only.
**Headline A:** Unlock your soulmate sketch
**Headline B:** {{name}}, see their face
**Body A:** One plan. You see the price first.
**Body B:** Your sketch and full reading, in the app.
**Plans:** (prices are tokens for the ikame pricing team; do not invent numbers)
- **1 week, then monthly**: the only plan, pre-selected. `$13.67` for the first week, then `$49.99` every month. Card line: "`$13.67` first week, then `$49.99`/month, renews monthly". No other tiers, no badge, no struck price.
**Visual:** Web long-scroll landing page in its own scroll container: sticky brand bar with a mini CTA (no close ✕), personal hero with their frosted sketch card and fact chips, plan block (one pre-selected plan, Due today, CTA, payment badges, secure/cancel row, renewal line), what's inside, how it works (checkout · get the app · open your reading), FAQ, the plan block again, footer, and a sticky bottom CTA while no plan block is visible. Proof and guarantee stay hidden until real. No "continue free" link: this is a hard paywall.
**Microcopy:** Benefit rows: "Your soulmate sketch in full HD" / "Their nature, and where you may meet" / "Daily love forecast in the app". CTA line: "`$13.67` today for your first week, then `$49.99` every month until you cancel." Trust row: "🔒 Secure checkout · Cancel anytime in your account · `{{refund_days}}`-day money-back". "We email you 3 days before any renewal." Legal: "For entertainment. Your sketch is an AI illustration, not a real person."
**CTA:** Unlock my sketch
---

### 23. Add-on report (post-purchase upsell)
**Purpose:** Offer one add-on report while purchase intent is hot, at its listed price, then hand off to the app either way.
**Headline A:** Add your meeting guide
**Headline B:** When and where you'll meet
**Body A:** The months and places where love is likeliest to find you.
**Body B:** Your best months and settings to meet them.
**Plans:** One add-on, paid once: "Soulmate Meeting Guide" at `$19.99`. No subscription, no struck price, no countdown, no bundle. The CTA opens the add-on's own Paddle one-time checkout: a hidden plan `addon` in `CONFIG.plans` (label "Soulmate Meeting Guide", `$19.99`, `oneTime`, `hidden`, never listed on the paywall) opened with the normal `checkout('addon')`. In FunnelFox that is the native screen `checkout_addon (one-time)`; its × goes to get_app (`CONFIG.declineFlow = {addon:'get_app'}`). Paid: `IkFunnel.completePurchase('addon')` marks the guide added and lands on get_app.
**Visual:** Green pill "Payment complete. Your plan is active." Eyebrow "Add-on · paid once". Report cover card (`img/sky-dusk.jpg` under a dark fade, "Starlyn report" label, the report name), three gold checks (Your 3 strongest months for meeting · The places and settings that suit you · Saved with your sketch in the app), price row "$19.99 · Paid once · no subscription". No back button, no close X.
**Microcopy:** Under the card: "One-time charge in a secure checkout. No subscription." Skip link: "No thanks, take me to the app". Closing the add-on checkout without paying lands on the get-the-app screen without the report line. Events: `upsell_view`, `upsell_accept` (+ `checkout_click` with plan `addon`), `purchase_complete` with plan `addon`, `upsell_decline`, `checkout_decline` with plan `addon` on close.
**CTA:** Add for $19.99

## G. Payoff

### 24. Get the app (after purchase)
**Purpose:** Purchase confirmation and the web2app handoff. The HD sketch, the partner sign, the heart-line reading and the daily love forecast live in the Starlyn app; there is no free web result and no offer screen.
**Headline A:** You're in, {{name}}
**Body A:** Your full reading is waiting in the Starlyn app.
**Visual:** Gold check badge on the star field, a three-step card (1 Download Starlyn: Daily Astrology · 2 Log in with {{email}} · 3 Open your reading), App Store and Google Play badges. If they bought the add-on, a green line "Soulmate Meeting Guide added. It opens in the app." sits above the steps.
**Microcopy:** "For entertainment purposes only." The store badges and the CTA fire `app_handoff`. Reached only from a confirmed purchase: checkout returns with `?paid=weekly`, or the host calls `IkFunnel.completePurchase()`.
**CTA:** Open the app

---

## Notes

- **Add-on report (2026-10-06):** after the plan purchase, screen 23 offers one add-on, "Soulmate Meeting Guide", at $19.99 paid once (same price on all 10 Starlyn funnels, one Paddle one-time price). It fits the no-sale policy: listed price, no timer, no struck price, always skippable. Measured on its own (upsell take rate = `purchase_complete` with plan `addon` / `upsell_view`), separate from paywall CVR. The app has to grant the report from the Paddle transaction.
- **Starlyn app policy (2026-10-05):** hard paywall (no close ✕, no "continue free"), exactly one plan (`$13.67` first week, then `$49.99` every month), no sale of any kind (no last-chance offer, struck price, badge or promo code), and a confirmed purchase lands on a get-the-app screen. Under 18 shows a blocking notice with a "Change my birth date" way back. The one-time "sketch only" plan was removed with the other tiers.
- **Deliberately not built: the $1 → hidden recurring subscription mechanic.** This is the version flagged in the 2026 FTC case. Here, nothing is charged before #22, and the one plan states its renewal on the card and in the CTA line. Hint's "exclusive 93% promo code" screen and struck-through anchors are skipped too, because they're a fake-discount pattern.
- **Instant, not async.** The sketch is generated live (#19); after payment the HD sketch and full reading open in the app (#23 hands over). If engineering can't render instantly, the only allowed fallback is an honest "ready in N minutes, we'll email you" message *after* a disclosed purchase, never a charge with no visible result.
- **What was cut from Hint/Nebula's ~20 partner questions:** the ethnicity preference (sensitive, and hair and eye color cover what the drawing needs), elements, head vs. heart, red flags, similar vs. contrast, dynamic, fears, life goals and spirituality. None of them visibly changes the sketch or the reading. The user's own gender was also cut: target is women, but nothing in the output depends on it.
- **Palm side test (#16-#18):** opt-in, placed after the sketch has started (#15), so the user has sunk cost and the step reads as a bonus. Measure the palm opt-in rate and paywall CVR for palm vs. no-palm users separately. If palm users convert clearly better, test moving the palm offer into the hook (#2 Headline B).
- **Trust beats:** #10 after the birth data and #18 after the palm photo (the hardest input). Neither uses invented numbers. #10B and any quotes need real ikame data.
- **Drop-off risk:** #8 birth time (payoff framing + Venus fallback), #17 camera permission (upload fallback + skip), #21 email, #22 paywall.
- **One monetization layer:** the hard paywall (#22) with one plan. No offer, no one-time plan, no sale. Purchase → #23 get the app. Track first-week → monthly renewal as its own number.
- **A/B first:** (1) #22 Headline A vs. B. (2) #1 Headline A vs. B. (3) Palm offer on vs. off. (4) #7 Venus bridge on vs. off, to measure its lift on #8-#9 completion.
