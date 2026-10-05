---
niche: moon-reading
display_name: Starlyn - Moon Sign + Moon Phase Rituals (web2app)
archetype: personalization-quiz
subject: person
input: full-moon feeling, intention, name, birth date, birth time (optional), birth place, what throws you off, ritual time and style, optional second person's birthday, phase reminder preference
output: natal Moon sign + birth moon phase + 30-day moon phase calendar with personalized rituals (+ optional Moon-to-Moon match)
screens: 22
monetization: hard web paywall after the email gate: one plan, 1-week intro then monthly auto-renew; no sale or last-chance offer; purchase leads to a get-the-app screen
offer: none
creative_screens:
  hook-a: 1
  hook-b: 2
  birth-phase: 6
  tonight: 13
  reveal: 17
  moon-sign: 18
motion: >
  a luminous moon turning slowly in a dark sky while its shadow sweeps
  through every phase, a ring of thirty day-dots filling in around it
---

# Funnel Content — Starlyn · Moon Reading

A web2app funnel (Meta ad → web quiz → web paywall → Starlyn app) for the moon / moonology niche. AdSpyLab counted 23.8K ads in 03-08/2026, up 63% over the last three months, from Astroline's moon mode, Moongrade, Moonly and many new persona pages like "Moon Energy Daily". The user gives birth date, time and place plus how they want to use the moon cycle. They get their natal Moon sign, the phase they were born under, and a 30-day phase calendar with rituals sized to their real day. It's the **personalization-quiz** archetype with a monthly-rhythm product at its core, so retention (phase reminders) matters more than in the one-shot sketch or map funnels. **Modeled on:** Astroline `quiz-pp?mode=moon` ("Is your relationship truly over?" → birth date/time/place → chart mapping → a "forecast accuracy" meter climbing to 67% → relationship status, goals, favorite color and element filler → a palm photo before the paywall). **What I deliberately changed:**

- The first tap is "does the full moon get to you?", which matches the broad moonology ad angle. Astroline's relationship angle is kept as an optional branch (#14-#15), not the whole funnel.
- Two free micro-reveals come from real data: the birth phase (#6) and tonight's live Moon (#13).
- Birth time is framed honestly: the Moon changes sign every ~2.5 days. If the user skips it on a sign-change day, we show both possible signs and never guess.
- The quiz questions set ritual length and style, so the output fits the user's real day.
- A phase-reminder preference is collected on web and applied on first app open.
- No fake accuracy meter, color or element filler, palm photo, countdown or ticker. No invented "moon guide" personas. Renewal price on every card.

The visual system is the base `nebula/` house look, with the moon as the single 3D hero object. 22 screens.

---

## A. Hook

### 1. Hook A — Does the full moon get you? (first tap)
**Purpose:** Matches the moonology ad angle with a cheap, self-recognising tap. The answer sets the tone of the full-moon rituals.
**Headline A:** Does the full moon get you?
**Headline B:** Feel different at full moon?
**Body A:** Your Moon sign explains why. We'll show you.
**Body B:** Many people do. Your chart says why.
**Options:**
- 🌕 Restless
- 😴 Drained
- ✨ Energized
- 🤷 Never noticed
**Field:** Single-select, auto-advance; sets `{{full_moon_feel}}`
**Visual:** Dark sky, a large glowing 3D moon (hero) with its shadow slowly sweeping; four gradient pills beneath.
**Microcopy:** Under options: "2-minute quiz · For entertainment". Legal line: "By continuing, you agree to our Terms & Privacy Policy"
**CTA:** (auto-advances on selection)

### 2. Hook B — What you'll get
**Purpose:** Names the three-part product (Moon sign + today's phase + ritual) so the quiz reads as building it.
**Headline A:** Your Moon sign runs your moods
**Headline B:** Move with the Moon's rhythm
**Body A:** Your Moon sign plus today's phase, one ritual daily.
**Body B:** Know when to start, rest and let go.
**Visual:** Moon glyph centered, a ring of 8 phase icons around it with today's phase highlighted; three rows fade in below. Fades only.
**Microcopy:** Rows: "☽ Your birth Moon sign" / "🌓 Tonight's phase, for you" / "🕯️ A ritual that fits your day"
**CTA:** Find my Moon

---

## B. Investment

### 3. Intention
**Purpose:** The theme every ritual in the calendar is written around.
**Headline A:** What should this cycle bring?
**Headline B:** What are you calling in?
**Body A:** Your rituals will focus on this.
**Options:**
- 💞 Love
- 💰 Money
- 🕊️ Calm
- 🍂 Letting go
- 🌟 Self-worth
- ✏️ Other
**Field:** Single-select, auto-advance (Other opens input + Continue); sets `{{intention}}`
**Visual:** 4-6 large cards with a glowing icon each, purple border on select.
**CTA:** (auto-advances on selection)

### 4. Name
**Purpose:** Captures `{{name}}`. Rituals, reminders and the reveal all use it.
**Headline A:** What's your name?
**Headline B:** What should we call you?
**Body A:** We'll write your rituals for you.
**Field:** Text input, placeholder "Your first name", max 30 chars
**Visual:** Plain white input, a crescent glyph above it.
**Error state:** "Add your name to continue"
**CTA:** Continue

### 5. Date of birth
**Purpose:** First real input. It finds the birth phase (instant payoff on #6) and a first estimate of the Moon sign.
**Headline A:** When were you born?
**Headline B:** Your birthday, {{name}}?
**Body A:** Your date finds the Moon you were born under.
**Field:** Date wheel (month / day / year); age gate 18+
**Visual:** Plain date wheel on the star field; a small moon above it changes phase as the day wheel scrolls.
**Error state:** "Pick a full date to continue". Under 18: a blocking notice, "Starlyn is for adults 18+." / "You must be 18 or older to use Starlyn. Entered the wrong date? Change it below.", with a "Change my birth date" button that clears the date and returns here. The block persists for the session (sessionStorage `ikf_age_block`) and fires `age_block`.
**CTA:** Continue

### 6. Your birth phase (micro-reveal bridge)
**Purpose:** Real, date-only data given back immediately. It's unique to this niche and makes the next two inputs feel worth it.
**Headline A:** Born under a {{birth_phase}}
**Headline B:** {{name}}, your Moon at birth
**Body A:** Two details pin down your exact Moon sign.
**Body B:** Time and place finish your Moon.
**Visual:** Single large moon rendered at the birth phase's real illumination, phase name beneath, birth date small.
**Microcopy:** One-line trait, e.g. "Waxing Crescent — you start quietly, then build fast." Progress hint: "Your Moon: 1 of 3 details"
**CTA:** Continue

### 7. Time of birth
**Purpose:** The drop-off cliff. The honest reason (the Moon moves fast) motivates the input, and a skip still gives a correct answer: one sign, or both possible signs.
**Headline A:** What time were you born?
**Headline B:** Know your birth time?
**Body A:** The Moon changes signs every two or three days.
**Body B:** Time pins your Moon sign exactly.
**Field:** Time wheel + text link
**Visual:** Time wheel sheet; behind it the moon glyph slides slightly along a zodiac band as time scrolls.
**Skip link:** "I don't know my birth time"
**Microcopy:** Shown after skip: "No problem. If your Moon changed signs that day, we'll show both."
**CTA:** Continue

### 8. Place of birth
**Purpose:** Sets the birth time zone, which decides the Moon's exact position on sign-change days.
**Headline A:** Where were you born?
**Headline B:** Your birth city, please
**Body A:** Your time zone sets the Moon's position.
**Field:** City search with autocomplete ("City, country")
**Visual:** Search field, pin on a stylized map under a crescent.
**Error state:** "We couldn't find that place. Try a nearby city."
**Microcopy:** "We never share or sell your details."
**CTA:** Continue

---

## C. Trust

### 9. Real moon data
**Purpose:** Trust beat after the three birth inputs. It separates the product from "moon energy" content pages by grounding it in real astronomy.
**Headline A:** Real moon data, not guesses
**Headline B:** {{reader_count}} moons read so far
**Body A:** Phases and signs come from astronomical tables.
**Body B:** People use it to plan their month.
**Visual:** Phase strip with exact times morphing into the calendar ring; three promise rows beneath. Variant B: huge stat number, star row, one quote card.
**Microcopy:** Promise rows: "Calculated from astronomical data" / "Your details never sold" / "Price shown before you pay". **`{{reader_count}}` and quotes come from real ikame data only. Ship A until then.**
**CTA:** Continue

---

## B. Investment (continued) — how the rituals should fit you

### 10. What throws you off
**Purpose:** The target of the daily tip and the dark-moon rest rituals.
**Headline A:** What throws you off most?
**Headline B:** What drains you lately?
**Body A:** Your daily tip will target this.
**Options:**
- 🌀 Overthinking
- 🙇 People-pleasing
- 🎢 Mood swings
- 🌙 Restless sleep
- ✏️ Other
**Field:** Single-select, auto-advance (Other opens input + Continue)
**Visual:** Stacked pills.
**CTA:** (auto-advances on selection)

### 11. Ritual time
**Purpose:** Sets ritual length, which is the main reason moon apps get abandoned (rituals too long for real life).
**Headline A:** How long for a ritual?
**Headline B:** How much time tonight?
**Body A:** We'll fit rituals to your real day.
**Options:**
- ⏱️ 2 minutes
- 🕯️ 5 minutes
- 🛁 15 minutes
- 🌕 Big nights only
**Field:** Single-select, auto-advance; sets `{{ritual_minutes}}`
**Visual:** Four cards, each with a small arc showing duration.
**CTA:** (auto-advances on selection)

### 12. Ritual style
**Purpose:** Picks the ritual formats mixed through the month.
**Headline A:** Which rituals feel like you?
**Headline B:** How do you like to reset?
**Body A:** Pick any. We'll mix them through the month.
**Options:**
- ✍️ Journaling
- 🌬️ Breathwork
- 💬 Affirmations
- 🕯️ Candle
- ✏️ Other
**Field:** Multi-select, ≥1 to enable CTA; "Other" opens a one-line input
**Visual:** Stacked pills, selected ones fill solid with a check.
**Microcopy:** Disabled-CTA hint: "Pick at least one"
**CTA:** Continue

### 13. Tonight's Moon (live bridge)
**Purpose:** A second free reveal from real, live data. It proves the product is tied to the actual sky and bridges into the last questions.
**Headline A:** Tonight's Moon is in {{today_moon_sign}}
**Headline B:** Tonight: {{today_phase}} Moon
**Body A:** {{today_phase}}, {{illumination}}% lit. Your first ritual starts here.
**Visual:** Moon rendered at tonight's real illumination with the sign glyph; local date small. Fade in, no spin.
**Microcopy:** "Live from astronomical data for {{local_date}}" (uses device time zone, so no location ask). Progress hint: "2 quick questions left"
**CTA:** Continue

### 14. Someone on your mind (optional)
**Purpose:** Keeps Astroline's relationship moon angle as an opt-in branch. A Moon-to-Moon emotional match is a strong, personal tease for #19.
**Headline A:** Whose moods confuse you?
**Headline B:** Someone on your mind?
**Body A:** We'll compare your Moons — your emotional match.
**Options:**
- 💞 Partner
- ✨ Crush
- 💔 An ex
- 👪 Family member
- 🙂 Just me
**Field:** Single-select, auto-advance; "Just me" skips #15
**Visual:** Two overlapping crescents, one filled (you), one outlined (?).
**CTA:** (auto-advances on selection)

### 15. Their birthday (conditional)
**Purpose:** The minimum needed for their Moon sign. Name + date only.
**Headline A:** When's their birthday?
**Headline B:** Tell us about them
**Body A:** A birthday usually finds their Moon sign.
**Field:** Name (text, sets `{{person}}`) + date wheel
**Visual:** Compact form; the outlined crescent fills as the date is set.
**Error state:** "Add their name and birthday"
**Skip link:** "I'll add them later"
**Microcopy:** "They won't be notified."
**CTA:** Continue

### 16. Phase reminders
**Purpose:** Collects the retention preference on the web while intent is high, and applies it on first app open. For a monthly-rhythm product, this is the habit loop.
**Headline A:** Want a nudge each phase?
**Headline B:** Never miss a full moon
**Body A:** We'll remind you before new and full moons.
**Field:** Three toggles: 🌑 New moon · 🌕 Full moon · ☀️ Daily moon line (first two on by default); time chip default 8:00 PM
**Visual:** Lock-screen mock with one sample push over a dim calendar ring.
**Microcopy:** Sample push: "🌕 Full Moon in Aries tonight, {{name}}. Your 5-minute release ritual is ready." Note: "Reminders start once you open the app."
**Skip link:** "Not now"
**CTA:** Save my reminders

---

## D. Anticipation

### 17. Reading your Moon (loading)
**Purpose:** Makes the calendar feel built for this user. This is the best ad-creative screen.
**Headline A:** Reading your Moon, {{name}}…
**Headline B:** Building {{name}}'s moon month…
**Steps:** (4 rows, each with % counter, checkmark, progress bar)
- Finding your Moon at birth…
- Lining it up with tonight's sky…
- Writing rituals around {{intention}}…
- Almost ready — your first ritual awaits…
**Visual:** Hero top half: 3D moon turning, shadow sweeping through the phases, a ring of 30 day-dots filling in around it. Progress rows beneath.
**Microcopy:** Small line: "For entertainment". Testimonials only if real.
**CTA:** (auto-advances, ~7 seconds)

### 18. Your Moon sign (free reveal)
**Purpose:** Gives the headline result free (Starlyn-style proof before the ask), because the calendar and rituals are the depth the paywall sells.
**Headline A:** {{name}}, your Moon is {{moon_sign}}
**Headline B:** Meet your Moon sign
**Body A:** How you feel, what soothes you, what drains you.
**Visual:** Moon-sign card with a large glyph and three short lines (feel / soothe / drain). On the "both signs" path, two cards side by side with "Add your birth time to choose".
**Microcopy:** Sample: "Moon in Cancer — you feel everything first, then protect it."
**CTA:** See my moon month

### 19. Your moon month (tease)
**Purpose:** Shows the real calendar structure with dates visible and rituals locked, so the user sees exactly what they're paying for.
**Headline A:** Your moon month, mapped
**Headline B:** Your next 30 nights
**Body A:** Dates are yours. Rituals unlock with Premium.
**Visual:** 30-day calendar with real phase icons and dates. The next full and new moon are highlighted, and ritual text on each key date is blurred. If #15 was completed, a locked "You + {{person}}" Moon-match tile.
**Microcopy:** Highlight sample: "{{next_full_date}} — Full Moon in {{next_full_sign}}: your release night." Locked rows: "Tonight's ritual" / "Full moon release" / "New moon intention" / "You + {{person}}: Moon match" (person path only). Footnote: "For entertainment."
**CTA:** Unlock my rituals

---

## E. Gate

### 20. Where to send it
**Purpose:** Email = calendar delivery + Starlyn app login (web2app handoff).
**Headline A:** Where should we send it?
**Headline B:** Save your moon month
**Body A:** Your calendar and app login go here.
**Field:** Email input; "Continue with Google" / "Continue with Apple"; marketing opt-in checkbox, **unchecked by default**
**Visual:** Plain white input, a small blurred calendar card above.
**Error states:** "Enter a valid email address" / "This email already has an account — log in instead?"
**Microcopy:** Legal line: "By continuing, you agree to our Terms & Privacy Policy." Reassurance: "Nothing is charged on this step."
**CTA:** Continue

---

## F. Monetization

### 21. Paywall (hard)
**Purpose:** Primary ask and a hard gate: the moon month, rituals and reminders open only after purchase. One plan, renewal disclosed on the card and in the CTA line.
**Headline A:** Live with your Moon
**Headline B:** {{name}}, unlock your moon month
**Body A:** Rituals for every phase, every month.
**Body B:** Your calendar, rituals and daily moon line.
**Plans:** (prices are tokens for the ikame pricing team; do not invent numbers)
- **1 week, then monthly**: the only plan, pre-selected. `$13.67` for the first week, then `$49.99` every month. Card line: "`$13.67` first week, then `$49.99`/month, renews monthly". No other tiers, no badge, no struck price.
**Visual:** Web long-scroll landing page in its own scroll container: sticky brand bar with a mini CTA (no close ✕), personal hero with their blurred moon calendar and fact chips, plan block (one pre-selected plan, Due today, CTA, payment badges, secure/cancel row, renewal line), what's inside, how it works (checkout · get the app · open your reading), FAQ, the plan block again, footer, and a sticky bottom CTA while no plan block is visible. Proof and guarantee stay hidden until real. No "continue free" link: this is a hard paywall.
**Microcopy:** Benefit rows: "Rituals for every new and full moon" / "Daily moon line for your {{moon_sign}} Moon" / "Moon match for anyone you add". CTA line: "`$13.67` today for your first week, then `$49.99` every month until you cancel." Trust row: "🔒 Secure checkout · Cancel anytime in your account · `{{refund_days}}`-day money-back". "We email you 3 days before any renewal." Legal: "For entertainment only. Not medical or mental-health advice."
**CTA:** Unlock my rituals
---

## G. Payoff

### 22. Get the app (after purchase)
**Purpose:** Purchase confirmation and the web2app handoff. The moon calendar, rituals, reminders from #16 and the Moon match live in the Starlyn app; there is no free web result and no offer screen.
**Headline A:** You're in, {{name}}
**Body A:** Your full reading is waiting in the Starlyn app.
**Visual:** Gold check badge on the star field, a three-step card (1 Download Starlyn: Daily Astrology · 2 Log in with {{email}} · 3 Open your reading), App Store and Google Play badges.
**Microcopy:** "For entertainment purposes only." The store badges and the CTA fire `app_handoff`. Reached only from a confirmed purchase: checkout returns with `?paid=weekly`, or the host calls `IkFunnel.completePurchase()`.
**CTA:** Open the app

---

## Notes

- **Starlyn app policy (2026-10-05):** hard paywall (no close ✕, no "continue free"), exactly one plan (`$13.67` first week, then `$49.99` every month), no sale of any kind (no last-chance offer, struck price, badge or promo code), and a confirmed purchase lands on a get-the-app screen. Under 18 shows a blocking notice with a "Change my birth date" way back.
- **Two free micro-reveals + one free result** (#6 birth phase, #13 tonight's Moon, #18 Moon sign) are deliberate. Moon content is widely available for free, so the paywall has to sell the *personal rhythm* (calendar + rituals + reminders), not the sign. The free reveals stay before the gate; the paywall itself is hard, with no free path past it.
- **Cut from Astroline's moon quiz:** the "forecast accuracy %" meter (fake metric), favorite color, element, modality/polarity cards and the palm photo. None of them feeds the output. Relationship status is replaced by the optional #14 branch, which only appears when it powers a real Moon match.
- **No location ask for tonight's Moon:** the device time zone is enough for phase times, so the funnel keeps three data inputs.
- **Trust beat** #9 sits after the birth data. There's no second interstitial because #13 (live sky data) plays that role without invented numbers.
- **Retention is the product:** #16 reminders are collected on web and applied in the app. Measure reminder opt-in → day-30 retention separately from paywall CVR.
- **One monetization layer:** the hard paywall (#21) with one plan. No offer, no sale, no countdown, no advisor chat or "moon guide" personas. Purchase → #22 get the app.
- **Ad-angle routing:** traffic from relationship-angle creatives ("Is it really over?") should land on a variant where #14 comes first, with Hook A "Is it really over?" and the same flow after it.
- **A/B first:** (1) #1 Headline A vs. B. (2) #18 free Moon sign vs. gated (does giving it away raise or lower #21 CVR?). (3) #13 on vs. off. (4) #21 Headline A vs. B.
