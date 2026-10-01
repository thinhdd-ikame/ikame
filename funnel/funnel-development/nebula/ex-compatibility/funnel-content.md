---
niche: ex-compatibility
display_name: Nebula - Ex Compatibility (Is it really over?)
archetype: personalization-quiz
subject: couple
input: your gender and birth date (18+) and time, your ex's gender and birth date and time, who ended it, why, contact since, length, feeling now, 2 fate questions, optional palm photo
output: a two-chart compatibility score with an honest one-line verdict (door still open / closure season / new chapter), one blurred key timing window, and a full reading with a next-step path matched to your goal
screens: 24
monetization: web paywall after an email gate (1-week intro, 4-week pre-selected, 12-week anchor, renewal shown next to every price); dismissible to a one-time last-chance offer, then a free verdict plus one open section
creative_screens:
  hook-a: 1
  hook-b: 3
  bridge: 14
  reveal: 19
  teaser: 20
motion: >
  two birth-chart wheels drifting apart in a dark star field, then sliding together
  until their rings overlap, a gold thread tying them as a match score counts up
---

# Funnel Content - Nebula: Ex Compatibility

A Nebula web2app funnel (Meta ad, web quiz, optional palm photo, web paywall, Nebula app) for the "is it really over?" niche. The user gives **their own birth data, their ex's birth data and the story of the breakup**. They get a **two-chart compatibility score with an honest verdict**. Archetype: **personalization-quiz**; the chart inputs are real, the story questions steer the reading, and the one optional upload is a side test, not a gate. 24 screens.

**Modeled on:**
- Nebula `appnebula.co/ex-compatibility/prelanding` (live funnel config read 2026-10-01; 5,196 ads in 7 months; 38 screens: goal, both charts, breakup history, fate yes/no, palm scan, analysing, email, paywall, phone, sign-up).
- Astroline `mode=moon` "Is Your Relationship Truly Over?" (7,377 ads in 7 months; 14 steps, verdict framing).
- Stages not captured in the library (paywall, phone and sign-up steps of Nebula; the Astroline paywall) are **unverified**; the paywall here follows the house web-paywall standard from `nebula/palm-reading`, not a copy of theirs.

**Kept from the references:**
- Goal first, then both charts, then the breakup story.
- A fate/coincidence yes-no beat before the wait, and a loader with inline questions.
- Email before the paywall; a verdict as the free result.

**Deliberately changed, and why:**
- **A real "move on" branch.** Goals are second chance, closure, move on, understand why. Move on is a first-class path with its own reassurance, verdict and reading, not a consolation prize for users the quiz could not "win back".
- **Honest verdict.** The score comes from the two charts and the answers. Copy never promises the ex returns; "charts show patterns, not promises" is on the reassurance screen, the teaser and the reading.
- **No dark patterns.** No trial-price picker ($1/$5/$9/$13), no secret discount or promo code, no renewal that rises when a timer ends, no hidden downsell, no paid chat-credit upsell inside the web funnel. The last-chance offer shows once, has no timer unless a real deadline exists, and renewal is on it.
- **Palm photo is optional** and sits after the story, with a plain skip link. The reading never depends on it.
- **Birth data skips have fallbacks** (no birth time: midday chart; no ex birthday: we lean on your chart and the story).
- **Ad-safe:** the ad hook is "Is it really over?", with no claim about the viewer ("Do you miss your ex?") and no guarantee.
- **Palette:** Nebula navy `#161A27` + gold `#E9C26B`, as in the other Nebula funnels. Two overlapping chart wheels are the hero object; the "door" verdict chip is rose for closure, gold for open, sage for new chapter.

---

## A. Hook

### 1. Hook
**Purpose:** Promise a clear, honest answer to the question people actually Google at 2am, and show all three outcomes (not only "win them back").
**Headline A:** Is it really over?
**Headline B:** Read what your charts say
**Body A:** Compare two birth charts. Get an honest verdict.
**Body B:** Two charts, one honest reading. Clarity, not false hope.
**Visual:** Two glowing birth-chart wheels, one slightly apart from the other, over a navy star field (`img/hook-wheels.jpg`; the demo draws them in SVG until the image exists). A rotating gold eyebrow cycles "Closure / A second chance / A fresh start". Row of 3 chips: 2-min quiz · Two charts · Honest verdict.
**Microcopy:** "By continuing you confirm you're 18+ and agree to our Terms of Use and Privacy Policy. For entertainment purposes only. No outcome is guaranteed."
**CTA:** Start reading

---

## B. Your side

### 2. Your gender
**Purpose:** Cheap first tap; used to read your chart.
**Headline A:** I am…
**Headline B:** Who's asking?
**Body A:** Used to read your chart.
**Body B:** One tap, then we begin.
**Options:** 👨 Male · 👩 Female · ✨ Non-binary
**Visual:** Pill options, gold fill on tap, auto-advance.
**CTA:** (tap, auto-advances)

### 3. Goal
**Purpose:** Pick the branch. The goal changes the reassurance, the verdict wording and the reading.
**Headline A:** What do you need most?
**Headline B:** What are you hoping for?
**Body A:** We'll shape your reading around it.
**Body B:** There is no wrong answer here.
**Options:** 💞 Second chance · 🕊️ Closure · 🌱 Move on · 🔍 Understand why · ✏️ Other
**Field:** "✏️ Other" opens a one-line input (max 40 characters). CTA stays disabled until it has text.
**Visual:** Pill options. Other expands an inline text box under the list.
**Error state:** CTA disabled while the Other box is empty.
**CTA:** (tap, auto-advances; Other: Continue)

### 4. Goal reassurance
**Purpose:** An honest promise matched to the goal, before any sensitive question. Moving on is treated as a strong goal.
**Headline A:** Clarity is a good start
**Headline B:** Let's look at it honestly
**Body A:** Understanding what happened can lighten the load.
**Body B:** Charts show patterns, not promises.
**Visual:** Soft gold glow, single line icon in a round well.
**Microcopy:** Branch copy. Second chance: "Hope is welcome here" / "We'll also show what charts can't promise." Move on: "Moving on is brave" / "We'll look at what to keep and what to leave."
**CTA:** Next

### 5. Your birth date
**Purpose:** Real chart input and the 18+ gate.
**Headline A:** When were you born?
**Headline B:** Your date of birth
**Body A:** Your Sun sign anchors your chart.
**Body B:** Needed to draw your chart.
**Field:** Month / Day / Year selects. Years stop at today minus 18. Sun-sign chip appears once complete.
**Visual:** Three rounded selects in one row, sign chip fades in.
**Microcopy:** "You must be 18 or older."
**Error state:** "Pick your full date of birth"
**CTA:** Continue

### 6. Your birth time
**Purpose:** Sharper Moon and Rising; needs a skip so users without it don't drop.
**Headline A:** What time were you born?
**Headline B:** Know your birth time?
**Body A:** It places your Moon and Rising signs.
**Body B:** Check your birth certificate if unsure.
**Field:** Hour / minute / AM-PM selects (optional) + link "I don't know my time".
**Visual:** Clock-face line art with tiny zodiac glyphs on the rim.
**Microcopy:** Skip fallback: "No worries. We'll read your chart at midday."
**Skip link:** I don't know my time
**CTA:** Continue

---

## C. Their side and your story

### 7. Ex gender
**Purpose:** Needed to draw the ex's chart. Neutral wording, no "he/she".
**Headline A:** And your ex is…
**Headline B:** Who was your ex?
**Body A:** Used to draw their chart.
**Body B:** Think of the one on your mind.
**Options:** 👨 Male · 👩 Female · ✨ Non-binary
**Visual:** Pill options, auto-advance.
**CTA:** (tap, auto-advances)

### 8. Ex birth date
**Purpose:** The second chart. A skip keeps users who never knew the date.
**Headline A:** Their date of birth?
**Headline B:** When was your ex born?
**Body A:** Even a rough date draws a chart.
**Body B:** Needed to compare the two charts.
**Field:** Month / Day / Year selects (any adult year) + link "I don't know their birthday". Skipping skips #9.
**Visual:** Same selects as #5, a second wheel appears faintly beside the first.
**Microcopy:** Skip fallback: "No problem. We'll lean on your chart and your story."
**Error state:** "Pick their full date of birth"
**Skip link:** I don't know their birthday
**CTA:** Continue

### 9. Ex birth time
**Purpose:** Optional precision for their chart. Skipped when #8 was skipped.
**Headline A:** Their birth time?
**Headline B:** Know their birth time?
**Body A:** Optional. A guess is fine.
**Body B:** Skip it if you're not sure.
**Field:** Hour / minute / AM-PM selects (optional) + link "Not sure".
**Visual:** Clock face as in #6, second wheel glows.
**Microcopy:** Skip fallback: "We'll read their chart at midday."
**Skip link:** Not sure
**CTA:** Continue

### 10. Who ended it
**Purpose:** First story tap; who left changes the Moon and Mars reading.
**Headline A:** Who ended it?
**Headline B:** How did it end?
**Body A:** No wrong answer. This shapes your reading.
**Body B:** Pick the closest fit.
**Options:** 💔 They did · ✂️ I did · 🤝 Both of us · 🌫️ It faded
**Visual:** Pill options, auto-advance.
**CTA:** (tap, auto-advances)

### 11. Why it ended
**Purpose:** The main reason sets the "why" section of the reading. Free choice, so there is an Other.
**Headline A:** Why did it end?
**Headline B:** What broke it?
**Body A:** Pick the biggest reason.
**Body B:** Choose what feels truest.
**Options:** 💬 Communication · 🚪 Distance or timing · 💔 Trust · 🔥 Different goals · ✏️ Other
**Field:** "✏️ Other" opens a one-line input (max 40 characters). CTA stays disabled until it has text.
**Visual:** Pill options. Other expands an inline text box.
**Error state:** CTA disabled while the Other box is empty.
**CTA:** (tap, auto-advances; Other: Continue)

### 12. Contact since
**Purpose:** Contact changes which timing window matters.
**Headline A:** Are you still in touch?
**Headline B:** Any contact since?
**Body A:** It changes which window matters.
**Body B:** Be honest, it sharpens your reading.
**Options:** 💬 Yes, often · 📱 Now and then · 🔕 No contact · 🧱 Cut off
**Visual:** Pill options, auto-advance.
**CTA:** (tap, auto-advances)

### 13. Time together
**Purpose:** Relationship length weights the Saturn (long-term bond) part of the reading.
**Headline A:** How long were you together?
**Headline B:** How long did it last?
**Body A:** A rough guess works.
**Body B:** Pick the closest.
**Options:** ⏳ Under a year · 💞 1-3 years · 🏡 3-7 years · 🕰️ 7+ years
**Visual:** Pill options, auto-advance.
**CTA:** (tap, auto-advances)

---

## D. Bridge and feeling

### 14. Two charts meet
**Purpose:** First free, real micro-reveal: both Sun signs, side by side. A break after ten taps, with no invented user count.
**Headline A:** {{sun}} meets {{ex_sun}}
**Headline B:** Two charts, one story
**Body A:** Your charts are being read side by side.
**Body B:** Placing both skies on one wheel.
**Steps:** Placing your planets… · Placing theirs… · Comparing where they meet…
**Visual:** The two wheels drift together and overlap, sign chips appear under each. If either date was skipped the headline falls back to "Your chart meets theirs".
**CTA:** (auto-advances, ~5 seconds)

### 15. How you feel
**Purpose:** Emotional check-in that tunes the tone of the reading, with a human exit for heavy feelings.
**Headline A:** How do you feel today?
**Headline B:** Right now, you feel…
**Body A:** Honest answers make a better reading.
**Body B:** Only you and your reading see this.
**Options:** 💔 Hurting · 😶 Numb · 🤔 Confused · 😌 Mostly okay
**Visual:** Pill options, auto-advance.
**Microcopy:** "If it feels heavy, talk to someone you trust."
**CTA:** (tap, auto-advances)

### 16. Fate 1
**Purpose:** Nebula's yes/no belief beat; adds sunk cost with a cheap tap.
**Headline A:** Do you believe in fate?
**Headline B:** Is love written in stars?
**Body A:** A quick gut check.
**Body B:** No right answer.
**Options:** ✨ Yes · 🤷 Not sure · 🙅 Not really
**Visual:** Pill options, auto-advance.
**CTA:** (tap, auto-advances)

### 17. Fate 2
**Purpose:** Second belief tap; feeds the "fated or familiar" line of the reading.
**Headline A:** Did it feel fated?
**Headline B:** Was it a rare connection?
**Body A:** Trust your first instinct.
**Body B:** Think back to how it began.
**Options:** 🔮 Very · 🌗 A bit · 🧊 Not really
**Visual:** Pill options, auto-advance.
**CTA:** (tap, auto-advances)

---

## E. Photo and wait

### 18. Palm photo (optional)
**Purpose:** Nebula's palm side test, made optional. Adds investment for those who want it, never blocks the rest.
**Headline A:** Add a palm photo (optional)
**Headline B:** Want a palm read too?
**Body A:** Your heart line sharpens the reading.
**Body B:** Optional. Skip it any time.
**Field:** Dashed drop zone + primary "Upload from gallery" + secondary "Take a photo". After a pick: 3:4 preview with "Looks good" tag. Only image types, max 15 MB.
**Visual:** Dashed gold palm outline; reassurance row with shield icon.
**Error states:** "That file isn't a photo. Try a JPG or PNG." · "That photo is over 15 MB. Try a smaller one." · "We couldn't open that photo. Try a JPG or PNG."
**Microcopy:** "Private. Used for your reading only, then deleted."
**Skip link:** Skip for now
**CTA:** Use this photo

### 19. Reading your charts (loader)
**Purpose:** Manufacture the wait with two inline yes/no taps; the reveal moment for ads.
**Headline A:** Comparing your two charts
**Headline B:** Reading where they meet
**Steps:** Aligning both birth charts… · Weighing Venus and Moon links… · Checking the timing windows… · Writing your honest verdict…
**Field:** Modal yes/no at ~30% and ~65%: "Did you talk about a future?" · "Do you replay the last talk?"
**Visual:** The two wheels overlapping and rotating slowly, progress ring, 4 task rows ticking off.
**CTA:** (auto-advances, ~7 seconds)

---

## F. Result and gate

### 20. Result teaser
**Purpose:** The free payoff: match score, a one-line verdict and one blurred timing window. Shows real value, holds back the rest.
**Headline A:** Your match: {{score}}%
**Headline B:** Your charts, compared
**Body A:** Door still open. Timing matters.
**Body B:** Charts show patterns, not promises.
**Visual:** Two overlapping wheels with a gold gauge arc counting up to the score. A verdict chip (gold / rose / sage). Below, a locked row "Key window: {{window}}" with the date blurred, plus 3 more blurred locked rows.
**Microcopy:** Verdict lines by result. Open: "Door still open. Timing matters." · Closure: "Closure season. This chapter is closing." · Move on goal: "A new chapter is calling you." Disclaimer: "A chart shows patterns, not promises. For entertainment purposes only."
**CTA:** See full reading

### 21. Email
**Purpose:** Lead capture, also the app login.
**Headline A:** Where should we send it?
**Headline B:** Save your reading
**Body A:** Get your reading and log in to the app.
**Body B:** One email, no spam.
**Field:** Email (light field), optional marketing checkbox (unticked by default).
**Error state:** "Enter a valid email address"
**Microcopy:** "By continuing, you agree to our Terms of Use and Privacy Policy."
**CTA:** Continue

---

## G. Monetization

### 22. Paywall - web landing page
**Purpose:** Sell the reading whose first line the user just saw, as a web sales page that asks twice, not an app sheet.
**Headline A:** Your chart reading is ready
**Headline B:** See the full picture
**Body A:** Your {{score}}% match, the key window, what to do.
**Body B:** Why it ended, what each chart needs.
**Plans:** 1 week ({{price_1w}} intro, then {{renewal_1w}}/week) · 4 weeks ({{price_4w}}, then {{renewal_4w}} every 4 weeks, MOST POPULAR, pre-selected) · 12 weeks ({{price_12w}}, then {{renewal_12w}} every 12 weeks, best per-week value). Renewal shown on every plan card and in the CTA line. No trial-price picker, no promo code.
**Visual:** Long-scroll page with its own sticky bar (brand, mini "Get my reading" CTA after the first plan block, close X). Sections:
1. Hero: eyebrow "Your reading is ready", the two wheels, 4 fact chips (your sign, their sign, match score, verdict).
2. Plan block: 3 plans, "Due today", CTA, payment badges, secure/cancel row, renewal line.
3. "Inside your reading": the verdict open, then locked rows: Why it ended, Key window, What each chart needs, Your next step, Daily guide in the app.
4. "How it works": checkout, read it now, keep going in the app.
5. Rating and reviews (hidden while {{app_rating}}/{{rating_count}}/review text are unresolved; no hard-coded stars or counts).
6. Money-back seal (hidden while {{refund_days}} is unresolved; shown only once a real refund policy and period exist).
7. FAQ accordion: When will I get it? · How do I cancel? · Will I be charged again? · Can a chart bring them back? (No) · What happens to my palm photo?
8. Plan block again.
9. Footer: legal links, entity, entertainment disclaimer.
Sticky bottom CTA shows the selected plan and today's charge while no plan block is on screen.
**Microcopy:** Renewal line: "{{price}} today, then {{renewal}} every {{period}} until you cancel." FAQ answer on outcomes: "No. A chart shows patterns for reflection. It cannot bring anyone back."
**Fallback offer:** #23, shown once. Declining it goes to #24 with the verdict and one section open. Buying the pass opens only the key window in #24; the rest stays locked behind the subscription.
**CTA:** Get my reading

### 23. Last-chance offer (on close)
**Purpose:** One second chance after a paywall close, shown once per session.
**Headline A:** Not ready? Get the window
**Headline B:** One-time offer, shown once
**Body A:** A smaller pass, paid once. No subscription.
**Body B:** Just your key window, in full.
**Plans:** One offer card, a different and smaller product than the 1-week plan: {{offer_name}} (key window pass), {{offer_price}} paid once, no renewal, no strike-through price. Includes the key window in full, what it means for both charts, and the reading saved to the email. Not included (stated on the card): what each chart needs, next step, daily guide. Optional {{offer_badge}}.
**Visual:** Web page in the paywall's style: sticky bar with close X, eyebrow "One-time offer", one gold-bordered card with the wheels thumbnail, price row, 3 checks, a "not included" line, CTA, payment badges, a "paid once, nothing to cancel" line. The money-back line shows only once {{refund_days}} is resolved.
**Microcopy:** No timer unless a real deadline exists (`CONFIG.offer.expiresMin`). Decline link: "No thanks, show my free reading".
**CTA:** Get the window pass

---

## H. Payoff

### 24. Reading and app handoff
**Purpose:** Deliver the reading (all sections if paid, verdict plus one section if not) and move the user into the app.
**Headline A:** Your compatibility reading
**Headline B:** Here is your reading
**Body A:** Honest, chart-based, and yours to use.
**Body B:** Verdict first, then what to do next.
**Visual:** Wheels with score, verdict chip, section cards: Why it ended (open), Key window, What each chart needs, Your next step (branch: reconnect path / closure ritual / move-forward plan). Then "Continue in the Nebula app", store badges.
**Microcopy:** "A chart shows patterns, not promises. For entertainment purposes only."
**CTA:** Open the app (unpaid: Unlock all + Open the app)

---

## Notes

- **Drop-off risk:** #8 and #9 (the ex's data) and #10-#11 (the story). Mitigations: skip links with fallbacks, #4 reassurance first, #14 as a break. Measure completion per screen and skip rate for #6, #8, #9.
- **Branches:** goal (#3) drives #4 copy, the verdict wording (#20) and the next-step card (#24). Skipping #8 skips #9. The "move on" branch gets the same quality of reading as "second chance".
- **Verdict honesty:** score is deterministic from both charts and answers. The demo's score, key window and section copy are placeholders; production needs the host's chart engine.
- **Monetization:** one subscription layer. Pay-per-minute chat credits exist in Nebula's app flow; they are deliberately not sold here. Measure paywall-to-checkout and offer acceptance separately.
- **Unverified:** Nebula's paywall, phone and sign-up steps and Astroline's paywall were not captured in AdSpyLab. Their pricing ladder ($1/$5/$9/$13.67 trial picker, secret $5 discount, $19 downsell, $49.99 credits) is knowingly not copied.
- **Policy:** Meta relationship claims. Ad copy: no "guaranteed", no "get your ex back", no address to a personal attribute ("Do you miss your ex?"). Use "Is it really over?" and the three outcomes.
- **Images:** the demo uses SVG/CSS art. `gen_images.py` lists the prompts for `hook-wheels`, `result-wheels`, `paywall-hero` (JPG, 560x840) to drop into `img/` later.
- **A/B first:** (1) Hook A vs B. (2) #18 optional palm photo vs none. (3) #20 verdict first vs score first.
- **Demo (private Artifact):** https://claude.ai/artifact/Ls3P52xuzxs33HMu3CUEGY
