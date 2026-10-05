---
niche: marriage-compatibility
display_name: Starlyn - Marriage Compatibility (When will you marry?)
archetype: personalization-quiz
subject: couple
input: your status (single / dating / engaged), gender, birth date (18+), time and place, partner's birth date (if you have one) or your must-have in a partner (if single), first name, 3 marriage-value answers, love language, feeling and hoped timeline, optional palm photo
output: a marriage window (a range of years, never a date) with a match or timing score, one blurred peak season, and a full reading with values, bond and timing axes plus a partner profile (single) or what each chart needs (couple)
screens: 23
monetization: hard web paywall after the email gate: one plan, 1-week intro then monthly auto-renew; no sale or last-chance offer; purchase leads to a get-the-app screen
offer: none
creative_screens:
  hook-a: 1
  hook-b: 2
  bridge: 15
  reveal: 19
  teaser: 20
motion: >
  two birth-chart wheels slowly circling and drawing together, a thin gold arch of light
  opening between them as a year range counts into place
---

# Funnel Content - Starlyn: Marriage Compatibility

A Starlyn web2app funnel (Meta ad, web quiz, optional palm photo, web paywall, Starlyn app) for the "when will I marry?" niche. The user gives **their birth data, a partner's birth date if they have one, and three real marriage-value answers** (children, home, money). They get a **marriage window** (a range of years) plus three axes of fit. Archetype: **personalization-quiz**; the chart inputs are real, the value answers steer the reading, and the one optional upload is a side test, not a gate. 23 screens, two branches.

**Modeled on:**
- Nebula marriage funnel (605 ads, 42 screens) and Hint marriage reading (1,342 ads, 62 screens, paywall captured 2026-09-02), via the AdSpyLab research in `nebula-chai.md` section 1.
- Sibling funnel `nebula/ex-compatibility` for structure, palette, wheel art and the web paywall. Questions here are new; only the birth-data inputs are shared by necessity.
- Stages not captured in the library are **unverified**: the exact Starlyn marriage paywall and sign-up steps. The paywall here follows the house web-paywall standard from `nebula/palm-reading`, not a copy of theirs.

**Kept from the references:**
- A "when" hook, then birth data, then a teaser of a marriage window before the gate.
- Email before the paywall; a free headline result.
- Palm photo as a side test.

**Deliberately changed, and why:**
- **Two branches.** Hint's reading is single-only. Here a partner's date of birth is asked only if the user is dating or engaged; single users get a partner-profile reading built from their own chart and their must-have, not a consolation version.
- **Values, not just stars.** Three real marriage questions (children, home, money) feed a Values axis next to the Bond and Timing axes, so the reading says something a person can talk through.
- **A window, never a date.** The result is a range of years and a peak season, with "astrology for reflection" on the reassurance screen, the teaser, the reading and the FAQ. No wedding date, no guarantee.
- **No dark patterns.** No "MARRIAGE93" style code, no "speed up for 3.99" bump, no secret discount, no renewal that rises when a timer ends. There is no sale and no last-chance offer (Starlyn app policy, 2026-10-05).
- **Palm photo is optional** with a plain skip link. The reading never depends on it.
- **Birth data skips have fallbacks** (no time: midday chart; no place: neutral sky; no partner date: your chart and your answers).
- **Ad-safe:** the ad hook is "When will you marry?", with no claim about the viewer ("Are you still single?") and no guarantee.
- **Palette:** Starlyn navy `#161A27` + gold `#E9C26B`; two wheels plus two rings are the hero objects. The window chip is gold for "window ahead", sage for "steady path".

---

## A. Hook

### 1. Hook
**Purpose:** Promise a clear, honest answer to a question people search quietly, and show it is for single, dating and engaged alike.
**Headline A:** When will you marry?
**Headline B:** See your marriage window
**Body A:** Read your birth chart. Find your timing window.
**Body B:** A chart-based window, not a date. For reflection.
**Visual:** Two glowing birth-chart wheels over a navy star field with two small gold rings between them (`img/hook-rings.jpg`; the demo draws the wheels in SVG until the image exists). A rotating gold eyebrow cycles "Single / Dating / Engaged". Row of 3 chips: 2-min quiz · Birth chart · Marriage window.
**Microcopy:** "By continuing you confirm you're 18+ and agree to our Terms of Use and Privacy Policy. For entertainment and reflection only. No date or outcome is guaranteed."
**CTA:** Start reading

---

## B. Your side

### 2. Status
**Purpose:** Pick the branch. The status decides whether a partner's chart or a partner profile is built.
**Headline A:** Where are you in love?
**Headline B:** Your love life now
**Body A:** It shapes which reading we draw.
**Body B:** One tap, then we begin.
**Options:** 🌙 Single · 💞 Dating · 💍 Engaged
**Visual:** Three pill options, gold fill on tap, auto-advance.
**CTA:** (tap, auto-advances)

### 3. Your gender
**Purpose:** Cheap second tap; used to read your chart.
**Headline A:** I am…
**Headline B:** Who's asking?
**Body A:** Used to read your chart.
**Body B:** It only shapes your chart.
**Options:** 👨 Male · 👩 Female · ✨ Non-binary
**Visual:** Pill options, auto-advance.
**CTA:** (tap, auto-advances)

### 4. Expectation reassurance
**Purpose:** Set an honest frame (a window, not a date) before any personal data, with status-matched wording.
**Headline A:** Good timing starts with you
**Headline B:** A window, not a date
**Body A:** Charts show tendencies, not wedding dates.
**Body B:** Astrology for reflection, never a promise.
**Visual:** Soft gold glow, a line-icon of two rings in a round well.
**Microcopy:** Headline A by status. Single: "Good timing starts with you" · Dating: "Two charts, one honest look" · Engaged: "Congratulations, let's look closer".
**CTA:** Next

### 5. Your birth date
**Purpose:** Real chart input and the 18+ gate.
**Headline A:** Your date of birth
**Headline B:** Born on which day?
**Body A:** Your Sun sign anchors the chart.
**Body B:** Needed to draw your chart.
**Field:** Month / Day / Year selects. Years stop at today minus 18. Sun-sign chip appears once complete.
**Visual:** Three rounded selects in one row, sign chip fades in.
**Microcopy:** "You must be 18 or older."
**Error state:** "Pick your full date of birth" · Under 18 (exact age from month, day and year): a blocking notice "Starlyn is for adults 18+." with a "Change my birth date" button that returns to this screen; the block persists for the session (sessionStorage) until the date is changed.
**CTA:** Continue

### 6. Your birth time
**Purpose:** Sharper Moon and Rising; needs a skip so users without it don't drop.
**Headline A:** Know your birth time?
**Headline B:** Born at what time?
**Body A:** It places your Moon and Rising.
**Body B:** Your birth certificate may list it.
**Field:** Hour / minute / AM-PM selects (optional) + link "I don't know my time".
**Visual:** Clock-face line art with tiny zodiac glyphs on the rim.
**Microcopy:** Skip fallback: "No worries if you don't know it. We'll read your chart at midday."
**Skip link:** I don't know my time
**CTA:** Continue

### 7. Your birthplace
**Purpose:** The third chart input (sets the Rising degree); a skip keeps users who don't know it.
**Headline A:** Where were you born?
**Headline B:** Your birthplace
**Body A:** A city is enough. It sets your sky.
**Body B:** Pick the nearest big city.
**Field:** One-line text "City, country" (max 60 characters). CTA stays disabled until it has text, plus link "I don't know".
**Visual:** Light line-art globe with a gold pin, one input under it.
**Microcopy:** Skip fallback: "Not sure? We'll use a neutral sky."
**Error state:** CTA disabled while the field is empty.
**Skip link:** I don't know
**CTA:** Continue

---

## C. Their side and your values

### 8. Partner must-have (single only)
**Purpose:** Single branch: the one input that draws the partner profile. Skipped for dating and engaged.
**Headline A:** What matters in a partner?
**Headline B:** Your must-have in love
**Body A:** Pick the one you won't compromise on.
**Body B:** This draws your partner profile.
**Options:** 🤝 Loyalty · 😄 Humor · 🏡 Family-minded · 🚀 Ambition · ✏️ Other
**Field:** "✏️ Other" opens a one-line input (max 40 characters). CTA stays disabled until it has text.
**Visual:** Pill options. Other expands an inline text box under the list.
**Error state:** CTA disabled while the Other box is empty.
**CTA:** (tap, auto-advances; Other: Continue)

### 9. Partner birth date (dating and engaged only)
**Purpose:** Couple branch: the second chart. A skip keeps users who never knew the date. Skipped for single.
**Headline A:** Their date of birth?
**Headline B:** When was your partner born?
**Body A:** It draws their chart beside yours.
**Body B:** Needed to compare two charts.
**Field:** Month / Day / Year selects (any adult year) + link "I don't know it".
**Visual:** Same selects as #5, a second wheel appears faintly beside the first.
**Microcopy:** Skip fallback: "Not sure? We'll read your chart and your answers."
**Error state:** "Pick their full date of birth"
**Skip link:** I don't know it
**CTA:** Continue

### 10. Your name
**Purpose:** Name capture for personalization; optional so it never blocks.
**Headline A:** What should we call you?
**Headline B:** Your first name
**Body A:** Your reading will use it.
**Body B:** Optional. Skip any time.
**Field:** One-line text "First name" (max 24 characters). CTA stays disabled until it has text, plus link "Skip".
**Visual:** Single light input on the navy field, gold caret.
**Microcopy:** Skip fallback: later screens say "Your reading", not "{{name}}'s reading".
**Error state:** CTA disabled while the field is empty.
**Skip link:** Skip
**CTA:** Continue

### 11. Children
**Purpose:** First marriage-value question; feeds the Values axis.
**Headline A:** Do you want children?
**Headline B:** Kids in your future?
**Body A:** Honest answers sharpen your values map.
**Body B:** No right answer.
**Options:** 👶 Yes, soon · 🗓️ Maybe later · 🙅 No kids · 🤷 Not sure
**Visual:** Pill options, auto-advance.
**CTA:** (tap, auto-advances)

### 12. Home
**Purpose:** Second value question (where to live). Free choice, so there is an Other.
**Headline A:** Where do you picture home?
**Headline B:** Your dream home base
**Body A:** Pick the closest fit.
**Body B:** Think of where you feel settled.
**Options:** 🏠 Near family · 🌆 Big city · 🌿 Quiet place · ✈️ Abroad · ✏️ Other
**Field:** "✏️ Other" opens a one-line input (max 40 characters). CTA stays disabled until it has text.
**Visual:** Pill options. Other expands an inline text box.
**Error state:** CTA disabled while the Other box is empty.
**CTA:** (tap, auto-advances; Other: Continue)

### 13. Money
**Purpose:** Third value question (finances in a marriage).
**Headline A:** How should money work?
**Headline B:** Money in a marriage
**Body A:** Shared, separate, or both.
**Body B:** Pick your gut answer.
**Options:** 🤝 Fully shared · ⚖️ Shared + own · 🔒 Separate · 🤷 Not sure
**Visual:** Pill options, auto-advance.
**CTA:** (tap, auto-advances)

### 14. Love language
**Purpose:** A warm, low-stakes tap that tunes the Bond axis.
**Headline A:** How do you show love?
**Headline B:** Your love language
**Body A:** It shapes your bond reading.
**Body B:** Pick the strongest.
**Options:** 💬 Words · ⏳ Quality time · 🛠️ Acts of service · 🤗 Touch
**Visual:** Pill options, auto-advance.
**CTA:** (tap, auto-advances)

---

## D. Bridge and feeling

### 15. Chart bridge
**Purpose:** First free, real micro-reveal after ten taps: both Sun signs for a couple, or a forward look for singles. A break, with no invented user count.
**Headline A:** {{sun}} meets {{partner_sun}}
**Headline B:** Reading your chart
**Body A:** Your chart is being read.
**Body B:** Mapping timing, bond and values.
**Steps:** Placing your planets… · Mapping your timing… · Weighing your values…
**Visual:** Couple: the two wheels drift together and overlap. Single: one wheel turns with a faint second outline waiting. If a date was skipped the headline falls back to "Your chart meets theirs" (couple) or "Your chart, read ahead" (single).
**CTA:** (auto-advances, ~5 seconds)

### 16. Feeling about marriage
**Purpose:** Emotional check-in that tunes the tone of the reading.
**Headline A:** How does marriage feel?
**Headline B:** Marriage, in one word
**Body A:** Honest answers make a better reading.
**Body B:** Only you see this.
**Options:** 🥰 Excited · 😬 Nervous · 🤔 Unsure · 😌 Calm
**Visual:** Pill options, auto-advance.
**CTA:** (tap, auto-advances)

### 17. Hoped timeline
**Purpose:** Last tap before the wait; the hoped timeline is compared with the chart in the result.
**Headline A:** When do you hope to marry?
**Headline B:** Your ideal timeline
**Body A:** We'll compare it with your chart.
**Body B:** No pressure. It's just a tap.
**Options:** 🌱 Within a year · 🌿 2-3 years · 🌳 Someday · 🤷 No rush
**Visual:** Pill options, auto-advance.
**CTA:** (tap, auto-advances)

---

## E. Photo and wait

### 18. Palm photo (optional)
**Purpose:** Nebula's palm side test, made optional. Adds investment for those who want it, never blocks the rest.
**Headline A:** Add a palm photo (optional)
**Headline B:** Want a palm read too?
**Body A:** Your marriage line adds detail.
**Body B:** Optional. Skip it any time.
**Field:** Dashed drop zone + primary "Upload from gallery" + secondary "Take a photo". After a pick: 3:4 preview with "Looks good" tag. Only image types, max 15 MB.
**Visual:** Dashed gold palm outline; reassurance row with shield icon.
**Error states:** "That file isn't a photo. Try a JPG or PNG." · "That photo is over 15 MB. Try a smaller one." · "We couldn't open that photo. Try a JPG or PNG."
**Microcopy:** "Private. Used for your reading only, then deleted."
**Skip link:** Skip for now
**CTA:** Use this photo

### 19. Finding your window (loader)
**Purpose:** Manufacture the wait with two inline yes/no taps; the reveal moment for ads.
**Headline A:** Finding your marriage window
**Headline B:** Reading your timing
**Steps:** Aligning your birth chart… · Checking Venus and Saturn links… · Weighing your three values… · Writing your marriage window…
**Field:** Modal yes/no at ~30% and ~65%: "Have you pictured your wedding?" · "Does family expect it soon?"
**Visual:** The wheels turning slowly, progress ring, 4 task rows ticking off.
**CTA:** (auto-advances, ~7 seconds)

---

## F. Result and gate

### 20. Window teaser
**Purpose:** The free payoff: a score and the marriage window as a range of years. Shows real value, holds back the peak season and the axes.
**Headline A:** Your match: {{score}}%
**Headline B:** Your marriage window
**Body A:** Likely window: {{window}}.
**Body B:** Charts show tendencies, not dates.
**Visual:** Wheels over a soft arch of light (`img/result-window.jpg`), a gold gauge arc counting up to the score, a window chip (gold "Window ahead", sage "Steady path"). Below, a locked row "Peak season: {{season}}" with the season blurred, plus 3 more blurred locked rows (axes, what each chart needs or your partner profile, your next step).
**Microcopy:** Single users see "Your timing: {{score}}%" in Headline A. Disclaimer: "Astrology for reflection. No date or outcome is guaranteed. For entertainment purposes only."
**CTA:** See full reading

### 21. Email
**Purpose:** Lead capture, also the app login.
**Headline A:** Where do we send it?
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
**Headline A:** {{name}}, your window is ready
**Headline B:** See your full window
**Body A:** Peak season, three axes, your next step.
**Body B:** What each chart needs, and when.
**Plans:** One plan only, pre-selected: 1 week at `$13.67`, then `$49.99` every month until cancelled. No other tiers, no one-time products, no struck prices, no discount badges.
**Visual:** Long-scroll page with its own sticky bar (brand, mini "Get my reading" CTA after the first plan block, no close X (hard paywall)). Sections:
1. Hero: eyebrow "Your reading is ready", the wheels (`img/paywall-hero.jpg`), 4 fact chips (your sign, partner sign or partner type, window, match or timing).
2. Plan block: 3 plans, "Due today", CTA, payment badges, secure/cancel row, renewal line.
3. "Inside your reading": the window open, then locked rows: Peak season, Values axis (kids, home, money), Bond axis, What each chart needs (couple) or Your partner profile (single), Your next step, Daily guide in the app.
4. "How it works": checkout, read it now, keep going in the app.
5. Rating and reviews (hidden until real ratings are supplied; placeholder reviews carry no "verified" label).
6. Money-back seal (rendered only once a real refund policy and period exist; hidden while `{{refund_days}}` is unresolved, also in the offer).
7. FAQ accordion: When will I get it? · How do I cancel? · Will I be charged again? · Can you predict my wedding date? (No) · What happens to my palm photo?
8. Plan block again.
9. Footer: legal links, entity, entertainment disclaimer.
Sticky bottom CTA shows the selected plan and today's charge while no plan block is on screen.
**Microcopy:** Renewal line under every CTA: "$13.67 today for your first week, then $49.99 every month until you cancel." FAQ "Will I be charged again?": yes, monthly after the first week unless you cancel. Hard paywall: no close X and no free or "continue" exit. Renewal line: "{{price}} today, then {{renewal}} every {{period}} until you cancel." Without a name the headline reads "Your window is ready". FAQ answer on dates: "No. A chart shows a window of tendencies for reflection. It cannot name a day or promise an outcome."
**CTA:** Get my reading

## H. Payoff

### 23. Get the app
**Purpose:** Hand a paying user straight to the Starlyn app, where the full reading lives.
**Headline A:** You're in, {{name}}
**Headline B:** Your reading is ready
**Body A:** Your full reading is waiting in the Starlyn app.
**Body B:** Download Starlyn: Daily Astrology and log in to open it.
**Visual:** A success check in a glowing well, three numbered steps (Download Starlyn: Daily Astrology · Log in with {{email}} · Open your reading), App Store and Google Play badges under the CTA.
**Microcopy:** "For entertainment purposes only. Cancel anytime in your account." Reached only after purchase (or a return with `?paid=`); there is no free path to it.
**CTA:** Open the app

## Notes

- **Starlyn app policy (2026-10-05):** no sale and no last-chance offer; one plan (1-week intro, then monthly auto-renew); hard paywall, no free reading path; purchase leads to the get-the-app screen; under-18 shows a notice with a "Change my birth date" button.
- **Branches:** status (#2) drives #4 copy, skipping #8 (couple) or #9 (single), the result label (match vs timing), the reading card (what each chart needs vs partner profile) and the next-step card. Single and couple readings get the same depth.
- **Honesty:** the window is a range of years and a peak season, never a date. Score, window and axis percentages in the demo are deterministic placeholders; production needs the host's chart engine. The hoped timeline (#17) is collected for tone only; the demo window does not depend on it, and production must not echo it back into the window.
- **Unverified:** Nebula's and Hint's paywall pricing ladders, promo codes (MARRIAGE93) and the EUR 3.99 "speed up" bump were not copied and not verified here.
- **Policy:** Meta relationship and personal-attribute rules. Ad copy: no "guaranteed", no "Are you still single?", no "your husband's name". Use "When will you marry?" and the window framing.
- **Images:** the demo uses SVG/CSS wheels plus three copied placeholder JPGs from `ex-compatibility`. `IKAME_AI_KEY` was not set, so `gen_images.py` was not run; it lists the prompts for `hook-rings`, `result-window`, `paywall-hero` (JPG, 560x840) to drop into `img/` later with the same names.
- **A/B first:** (1) Hook A vs B. (2) #10 name step before vs after the value questions. (3) #20 score first vs window first.
- **Demo (private Artifact):** https://claude.ai/artifact/MAXPo3APbWyGD3bvLHTqko
