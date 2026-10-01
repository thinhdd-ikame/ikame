---
niche: ewa-travel-work
display_name: EWA Travel & Work (English for a trip, an interview or a new job)
archetype: learning-plan
subject: person
input: event type (trip, interview, new job, meeting, other), event date, first name, self-rated level, what worries them, 3 one-tap situation replies, minutes per day
output: a measured starting level, a phrase kit for their event, and a paced plan with a goal to be ready by their date
screens: 19
monetization: web subscription paywall (1-week intro / 4-week / 12-week anchor; the plan that fits the event date is pre-selected), intro and renewal price shown together, a smaller one-time event kit (paid once, no renewal) as the dismiss fallback
creative_screens:
  hook-a: 1
  event: 2
  situation: 8
  reveal: 15
motion: >
  a boarding-pass style card with a date counts down the days, an agent asks
  "Window or aisle seat?", three reply bubbles pop up and one lights up as the
  natural one, then a phrase card flips and a "ready by" timeline draws to the date
---

# Funnel Content — EWA Travel & Work

EWA (Lithium Lab Pte Ltd, Singapore) teaches English through adapted books, clips, flashcards and an AI tutor. This is a **deadline-led, web-to-app funnel of 19 screens** for people who need English for one real moment: a trip, a job interview, a new job or a work meeting. The user says what the moment is and **when it happens**, answers **three one-tap situation questions** taken from that moment (what would you say at check-in, in the interview, in the meeting), and gets a **starting level, a phrase kit for their event and a plan with a goal of being ready by their date**, before a web subscription paywall. After buying they install the app and log in with the same email. Archetype: **learning-plan** (registered variant of `learning/ewa`).

**Reference funnel:** no dedicated travel/work web funnel exists in the market (AdSpyLab text search "English for work" = 0 rows, research `ewa-ayahpath.md` §5). The pattern is a branch inside generic funnels: Praktika's "important events soon? (new job, move, interview, exams, travel)", Jumpspeak's deadline line ("By Oct 19 you'll navigate new cities") and Lola's "Week 4: order at a restaurant". The spine below is the research's *suggested* spine, which is inferred, not captured. Captured Sept 2026 via AdSpyLab; the screen order here is unverified.

**Deliberate differences from the competitors and from `learning/ewa`:**
- **The event and its date lead the funnel** and drive every later screen: the phrases, the three situation questions, the loader, the plan length and the plan that is pre-selected on the paywall. EWA's generic funnel asks goals as a vague multi-select.
- **"Ready by {{date}}" is a goal, never a promise.** The plan is built backwards from the date and says so: if the date is close, it tells the user the plan covers the essentials first. No "you will be fluent by" claim.
- **Three real situation questions replace the generic word check**, so the user tries the product (a natural reply versus a stiff one) before the email gate. The feedback is truthful to what they picked.
- No fake persona, no timer, no promo code, no "faster than 93%". The renewal price sits next to every intro price. Ratings and reviews copied from sibling EWA briefs are unverified: they are tokens and the blocks stay hidden until they are set.
- The paywall suggests the **short plan that fits the date** (a trip in 5 days gets the 1-week plan), instead of pushing the longest plan.

---

## A. Hook

### 1. Hook A — Ready before your trip?
**Purpose:** Name the deadline and the fear in one line, before asking anything. The ad passes the event (`?event=interview`); the default when no parameter is given is "trip".
**Headline A:** Ready before your {{event}}?
**Headline B:** English for your big day
**Body A:** Tell us the date. We plan backwards from it.
**Body B:** Phrases, practice and a plan for one real moment.
**Visual:** Cream background. A boarding-pass style card (ticket notch, dashed tear line) with the event emoji, the event name as text and a "date" slot reading "Pick your date next"; a small speech bubble with one English line above it ("Window or aisle seat?"). Orange pill CTA pinned at the bottom.
**Microcopy:** Trust line under the card: "★ {{app_rating}} · {{rating_count}} ratings on the App Store". It renders only when the rating is a real number (hidden while it is the token). Small line: "Takes about 2 minutes."
**CTA:** Get started

---

## B. Investment — your moment

### 2. Event
**Purpose:** The personalization key: it sets the three situations, the phrase kit and the `{{event}}` token on every later screen.
**Headline A:** What's the big moment?
**Headline B:** What do you need English for?
**Body A:** We'll practice that exact situation.
**Body B:** Your phrases will come from it.
**Options:**
- ✈️ A trip
- 💼 Job interview
- 🏢 New job
- 🗣️ Work meetings
- ✏️ Other
**Field:** Single-select, pre-selected from the ad parameter. "Other" opens a one-line input ("Moving abroad, an exam…"); with the field empty the CTA is disabled. Other uses the everyday-situations set. Sets `{{event}}` to: trip / interview / new job / meeting / the typed text (fallback "big day").
**Visual:** Stacked large cards with an icon tile each (airport tag, handshake, badge, screen share); selected card gets an orange border and a check.
**Microcopy:** Disabled-CTA hint: "Pick one to continue"
**CTA:** Continue

### 3. Event date
**Purpose:** The deadline. It sets `{{date}}`, the plan length and which plan the paywall pre-selects. Skippable, because some people have no date yet.
**Headline A:** When is it happening?
**Headline B:** When's your {{event}}?
**Body A:** We'll plan backwards from that day.
**Body B:** A closer date means a tighter plan.
**Options:**
- 📅 This week
- ⏳ In 2 weeks
- 🗓️ In a month
- 🌴 In 3 months
- ✏️ Pick a date
**Field:** Single-select. Each quick option resolves to a real calendar date from today and shows it under the pill (for example "≈ Oct 15"). "Pick a date" opens a date input (today or later); with it empty the CTA is disabled. The date becomes `{{date}}` (short form, "Oct 15").
**Visual:** Stacked pills on cream; a ticket-style date chip appears under the selected pill; the date input opens as a one-line field.
**Microcopy:** Disabled-CTA hint: "Choose a date to continue"
**Skip link:** "No date yet"
**CTA:** Continue

### 4. Name
**Purpose:** Gets `{{name}}` so the result, plan and tutor greeting feel personal.
**Headline A:** What should we call you?
**Headline B:** What's your first name?
**Body A:** Your tutor will greet you by name.
**Body B:** It goes on your plan.
**Field:** Text input, placeholder "First name", max 30 chars, autofocus. Empty falls back to the neutral stand-in "friend" (and "your" for possessives) in copy.
**Visual:** White input on cream, a small fox tutor with a speech bubble that fills with "Hi, …!" as they type.
**Error state:** "Please enter a name to continue"
**CTA:** Continue

### 5. Self-rated level
**Purpose:** A cheap first guess at level. It also caps the measured level in #15 for people who rate themselves as beginners.
**Headline A:** How's your English today?
**Headline B:** {{name}}, where do you start?
**Body A:** A rough guess is fine. We'll check soon.
**Body B:** Honest answers get you the right start.
**Options:**
- 🌱 Total beginner
- 🙂 I know the basics
- 💬 I can chat a bit
- 🚀 Pretty confident
**Field:** Single-select.
**Visual:** Four stacked pills with a four-step level meter on each, filling further per row.
**Microcopy:** Reaction after "Total beginner": "Everyone starts somewhere. We'll begin with the basics."
**CTA:** Continue

### 6. What worries you
**Purpose:** Makes the pain specific to the moment. The picks drive the bridge (#7) and the plan's early goals.
**Headline A:** What worries you most?
**Headline B:** Where do you get stuck?
**Body A:** Pick all that apply. We'll train each.
**Body B:** Everyone has one. Pick all that fit.
**Options:**
- 🗣️ Speaking up
- 👂 Understanding fast
- 📚 Finding the words
- 😰 Nerves
- ✏️ Other
**Field:** Multi-select, at least one required; "Other" opens a one-line input and blocks the CTA while it is empty.
**Visual:** Stacked pills with checkbox circles; selected fills solid.
**Microcopy:** Disabled-CTA hint: "Pick at least one to continue"
**CTA:** Continue

### 7. Bridge — how we fix it
**Purpose:** Answers each worry with the real feature that fixes it, and breaks up the questions before the situations.
**Headline A:** Practice it before it happens
**Headline B:** That's exactly what we fix
**Body A:** Rehearse your {{event}} until it feels familiar.
**Body B:** Each worry gets its own training.
**Visual:** One small card per worry picked (max 3): a reply-bubble demo (speaking up) · a waveform slowed to 0.75x (understanding fast) · a phrase card that flips (finding the words) · a rehearsal run with a progress ring (nerves).
**Microcopy:** Captions, shown only for picked worries: "🗣️ Role-play it with your AI tutor" / "👂 Hear real speed, then slowed down" / "📚 A phrase kit for your {{event}}" / "😰 Rehearse until it feels familiar". Progress hint: "Step 1 of 2"
**CTA:** Continue

---

## C. Investment — three situations

### 8. Situation 1
**Purpose:** First taste of the product: one real moment from their event, one tap. It is not a quiz and nothing is graded out loud.
**Headline A:** What would you say?
**Headline B:** Pick your reply
**Body A:** Choose the reply that sounds right.
**Body B:** This only sets your starting point.
**Options:** Three reply lines plus "🤷 Not sure" (dialogue lines, exempt from the 1-3 word option rule). Trip example: the agent asks "Window or aisle seat?" and the replies are "Window, please." / "I want sit window." / "Yes."
**Field:** Single-select; the pick lights up and a feedback card slides in that is truthful to the pick. Natural pick: "Natural. That's what a native speaker would say." Understandable pick: "Understood. A smoother reply: “{{best}}”." Off-topic pick: "That doesn't answer it. Try: “{{best}}”." "Not sure": "No problem. A good reply: “{{best}}”." The best reply is saved to the phrase kit either way. Scoring: natural 2, understandable 1, other or not sure 0. CTA enables after one pick.
**Visual:** A chat card: speaker avatar and the line in a bubble, a tag chip with the place ("✈️ Check-in desk"), three reply pills under it, a thin 3-segment progress bar ("Situation 1 of 3"). After the pick a small "+1 to your phrase kit" chip.
**Microcopy:** Sets by event: trip (check-in seat, hotel desk, ordering food), interview ("Tell me about yourself", "Why this job?", "Any questions for us?"), new job (meeting the team, a deadline request, "Do you understand the task?"), meetings ("Can everyone hear me?", clarifying a deadline, taking an action), other (introductions, asking for directions, "Where are you from?"). All lines are original demo lines to be reviewed by the content team.
**CTA:** Continue

### 9. Situation 2
**Purpose:** Second data point and a second taste; asks something harder than #8 in the same moment.
**Headline A:** And in this one?
**Headline B:** Next, your reply
**Body A:** Same idea. Pick what sounds right.
**Body B:** Two more, then your plan.
**Options:** As #8, second situation of the set (trip: hotel desk, "Do you have a reservation?").
**Field:** As #8.
**Visual:** As #8, progress bar on segment 2.
**CTA:** Continue

### 10. Situation 3
**Purpose:** Third data point; it also closes the loop so the user feels the sequence is short.
**Headline A:** One more situation
**Headline B:** Last one, {{name}}
**Body A:** Then we build your plan.
**Body B:** Pick what sounds natural to you.
**Options:** As #8, third situation of the set (trip: restaurant, "Are you ready to order?").
**Field:** As #8. After the pick, CTA reads "Continue".
**Visual:** As #8, progress bar on segment 3.
**CTA:** Continue

---

## D. Trust

### 11. Rehearse before the real thing
**Purpose:** Trust beat after the highest-effort stretch and right before the commitment questions: shows the method (role-play with a tutor, phrase kit) instead of a made-up number.
**Headline A:** Rehearse before the real thing
**Headline B:** Practice makes the day easier
**Body A:** Role-play your {{event}} with a patient tutor.
**Body B:** Repeat as often as you like.
**Visual:** A mini chat with the fox tutor: tutor line ("Welcome! Do you have a reservation?"), a mic button with a sound wave, a soft "Try again" chip. Beneath it a rating row (stars, `{{app_rating}}`, `{{rating_count}}` ratings, store badges) that renders only when the rating is real; hidden while it is the token. No review cards while reviews are placeholders.
**Microcopy:** "AI tutor: verify availability and role-play scope with EWA before launch."
**CTA:** Continue

---

## E. Investment — pacing

### 12. Minutes per day
**Purpose:** The pacing input: the plan's goals in #16 are computed from it. It is also a small commitment.
**Headline A:** How much time per day?
**Headline B:** Your daily practice time?
**Body A:** A little each day beats one long night.
**Body B:** Be realistic. You can change it anytime.
**Options:**
- ☕ 5 min · Casual
- 🚶 10 min · Steady
- 🏃 15 min · Serious
- 🔥 20+ min · Intense
**Field:** Single-select, 10 min suggested. Sets `{{minutes}}`.
**Visual:** Four stacked pills, a clock icon on each that fills to match the minutes. When a date is set, a line under the list: "{{date}} is N days away."
**Microcopy:** Progress hint: "Step 2 of 2"
**CTA:** Continue

---

## F. Anticipation

### 13. Building the plan (loading)
**Purpose:** Makes the plan feel built from the answers in the highest-attention moment before the gate.
**Headline A:** Building {{name}}'s {{event}} plan…
**Headline B:** Counting the days to {{date}}…
**Steps:** (4 progress rows, each with % counter, checkmark and bar)
- Choosing phrases for your {{event}}…
- Matching them to your level…
- Pacing it around {{date}}…
- Almost ready, your plan is waiting…
**Visual:** Top half: a phrase flashcard with three event-scene cards orbiting it slowly; four progress rows beneath. With no date the third row reads "Pacing it to {{minutes}} minutes daily…".
**CTA:** (auto-advances, ~6-8 seconds)

---

## G. Gate

### 14. Email
**Purpose:** Captures identity before the result. On web it is also the login that links the purchase to the app, so it is functional, not just a lead grab.
**Headline A:** Your plan is ready, {{name}}
**Headline B:** Where should we send it?
**Body A:** Enter your email to see it and log in.
**Body B:** You'll log into the app with this email.
**Field:** Email input with "Continue with Apple" and "Continue with Google" above it. Marketing checkbox unchecked by default.
**Visual:** White input on cream, a frosted preview of the plan card behind a soft panel.
**Error states:** "Enter a valid email address" / "This email already has a plan. Log in instead?"
**Microcopy:** "No spam. We only send your plan and account emails." Legal under CTA: "By continuing, you agree to our Terms and Privacy Policy."
**CTA:** See my plan

---

## H. Reveal

### 15. Level and your phrase kit
**Purpose:** The measured payoff of the three situations: a starting level and the first phrases from the kit for their event. Only the first three are open, so the full kit is what the plan sells.
**Headline A:** You're at {{level}}
**Headline B:** Here's your starting point
**Body A:** Next up: {{next_level}}, one situation at a time.
**Body B:** Your first phrases for the {{event}}.
**Visual:** Top: a level strip with four bands (Beginner A1 to Upper-intermediate B2) and a marker on the measured one, the next band softly highlighted. Under it a three-row "How you did" card, one row per situation, each with a plain label (Natural / Understood / Needs practice). Then the phrase kit as a two-column wall of 8 cards: three open with a short "when to say it", five with the meaning blurred and a lock. The phrases saved from #8-10 carry a "Saved" tag.
**Microcopy:** Footnote: "Estimate from three situations. It updates as you learn." Phrase note (unverified): "Demo phrases; the content team replaces them with reviewed phrase sets per event."
**CTA:** See my plan

### 16. Plan and goal
**Purpose:** The reveal: a plan visibly built backwards from their date, with goals labeled as goals, and an honest note when the date is close.
**Headline A:** Your goal: ready by {{date}}
**Headline B:** Your path to {{date}}
**Body A:** At {{minutes}} min a day, here's your plan.
**Body B:** Built around your {{event}} and level.
**Visual:** A rising curve from "Today" to the date (or "Week N" when no date), with plan-goal chips labeled "Goal for week N", derived from level, minutes and days left: week 1 learn a number of key phrases for the event, week 2 practice the three situations with the tutor, the last week a full run-through of the event, or a re-check toward the next level when there is no date. A "Date is close" note appears when the plan needed would be longer than the days left: "{{date}} is close. We'll start with the essentials." A summary card: level to next level, event, date, minutes per day.
**Microcopy:** Footnote: "A goal, not a promise. Results depend on your practice." With no date the headline falls back to "Your goal: ready in N weeks". The week count comes from the date or from level plus minutes, never a fixed number.
**CTA:** Start my plan

---

## I. Monetization

### 17. Paywall
**Purpose:** The single ask: unlock the phrase kit, the practice and the plan built for the date. It is a long-scroll web sales page, not an app sheet. The renewal terms are as visible as the price, and the plan that fits the date is the one pre-selected.
**Headline A:** Start your {{event}} plan today
**Headline B:** Unlock {{name}}'s full plan
**Body A:** Phrase kit, practice and a daily plan.
**Body B:** Cancel anytime. Renewal price shown up front.
**Plans:**
- **1 week** — `{{price_1w}}` today, then `{{renew_1w}}` every week. Pre-selected when the event is 7 days away or less; ribbon "FITS YOUR DATE".
- **4 weeks** — `{{price_4w}}` today, then `{{renew_4w}}` every 4 weeks. Pre-selected when the event is 8-28 days away, or no date, or further out; ribbon "FITS YOUR DATE" when the event is within 28 days, otherwise "SUGGESTED".
- **12 weeks** — ribbon is the token `{{badge_12w}}` ("lowest per week" is only true once the real prices are set; verify before showing), the anchor. `{{price_12w}}` today, then `{{renew_12w}}` every 12 weeks. Never pre-selected by the date logic.
- Renewal sits directly under the intro price at the same size on every card, in the CTA line and on the receipt. Per-week equivalents are tokens (`{{week_equiv_*}}`). Savings compare only against the real weekly price. No "most popular" claim and no countdown.
**Visual:** Long-scroll web page: sticky brand bar (EWA name text, mini CTA, close ✕); personalised hero (level to next level, chips for event, date, minutes per day and weeks, the first phrases of the kit); plan block; "What's inside" (first 3 phrases open, full kit, situation drills, tap-to-translate lessons, AI tutor marked verify, daily plan to the date); "How it works" (3 steps); proof (rating block and review cards, rendered only when real; hidden while they are tokens); guarantee seal only when a real refund period is configured (hidden while `{{refund_days}}` is a token); FAQ ("How do I cancel?" open, "Will I be ready by my date?" answered honestly); plan block repeated; legal footer; sticky bottom CTA while no plan block is on screen.
**Microcopy:** Disclosure above each CTA, live for the selected plan: "You pay {{price_sel}} today. Renews at {{renew_sel}} every {{period}} until you cancel." Cancel cutoff is the token `{{renew_cancel_cutoff}}` (placeholder until the real store/billing rule is confirmed). Under the CTA: "We'll email you before your first renewal." Trust row: "🔒 Secure payment · Cancel anytime", plus "{{refund_days}}-day money-back" only when a real refund period is set. FAQ answer on readiness: "We can't promise a result. Your plan is a goal built from your date, level and minutes."
**Fallback offer:** On close, the last-chance offer (#18), shown once per session.
**CTA:** Start learning

### 18. Last-chance offer
**Purpose:** One second chance for users who close the paywall: a smaller one-week event kit (the phrase kit and situation drills, without the AI tutor, lessons or daily plan), paid once, no renewal. Not a discount on the same SKU, and not a subscription. Shown once.
**Headline A:** Start smaller with a kit
**Headline B:** Just the {{event}} essentials
**Body A:** Phrase kit and drills, no long plan.
**Body B:** Paid once. No renewal, no subscription.
**Plans:** One offer card: **Event kit, paid once** (`oneTime: true`): `{{offer_price}}` charged once, no renewal and no recurring price (so no `{{renew_*}}` token). Nothing struck (`compareAt: null`, a smaller scope is not a fair comparison with any plan). Checks match its scope: the full phrase kit for the event, drills for the three situations, "Paid once, no renewal". A "Not included" line: "AI tutor, lessons and daily plan." Optional `{{offer_badge}}` only if true. Growth to confirm a one-time SKU exists in checkout.
**Visual:** Same web look as #17: sticky bar with a close, eyebrow "One-time offer · shown once", headline, one orange-bordered offer card holding the level summary, the kit name, price row, three checks, the "Not included" line, CTA, payment badges and a one-time-charge line; plain decline link.
**Microcopy:** Charge line: "{{offer_price}} once. No renewal, no subscription. A receipt is emailed to you." Shown once per session (sessionStorage `ikf_offer_ewa-travel-work`); no timer (`CONFIG.offer.expiresMin` is `null`). Decline and close return to #16. Events: `paywall_close`, `offer_view`, `offer_accept`, `checkout_click`, `offer_decline`.
**CTA:** Claim my offer

---

## J. Payoff

### 19. Get the app
**Purpose:** Web buyers who never open the app refund. Get them to install, log in with the same email and finish Day 1.
**Headline A:** You're in, {{name}}!
**Headline B:** Your first phrase awaits
**Body A:** Get the app and log in with your email.
**Body B:** Your plan and phrase kit are waiting.
**Visual:** Phone mockup on Day 1 with the first saved phrase as a flashcard; store button for the detected OS; three-step list.
**Microcopy:** Steps: "1 · Install the app" / "2 · Log in with {{email}}" / "3 · Start Day 1 for your {{event}}". Receipt line: "Receipt and cancel link sent to {{email}}."
**CTA:** Get the app

---

## Notes

**Unverified / inferred.** The whole spine is the research's suggested spine (`ewa-ayahpath.md` §5, marked inferred); no live competitor funnel for travel/work was captured. Praktika's event question (screen 29 of 35) and Jumpspeak's deadline line are the only verified pieces. The AI-tutor role-play, the phrase kits, the drills and the money-back guarantee (refund days not confirmed, hidden behind `{{refund_days}}`) are product claims to confirm with EWA before launch. The generic EWA rating (4.7 / 196K) and review quotes are **not used**: ratings and reviews are tokens and stay hidden until real values are set.

**Situation sets and scoring.** Five sets of three situations (trip, interview, new job, meetings, other). Each situation has three reply lines scored natural 2, understandable 1, off-topic 0, plus "Not sure" 0. Total 0-6 maps to a level: 0-1 Beginner (A1), 2-3 Elementary (A2), 4-5 Intermediate (B1), 6 Upper-intermediate (B2). "Total beginner" in #5 caps the level at Elementary. The content team calibrates the lines per event before launch. Plan weeks: base by level (4, 5, 6, 8) scaled by minutes (5 min x1.75, 10 x1, 15 x0.8, 20+ x0.65); with a date the plan spans the days left (1 to 12 weeks) and a close date triggers the "essentials first" note.

**Plan goals (unverified).** The goals in #16 are targets set from level, minutes and days left, not measured outcomes; the content team must confirm the numbers.

**Blocks deliberately skipped:** native-language picker (the funnel is English-UI; add it with the LATAM variant), goals multi-select (the event replaces it), gender and age, gamified wheel, scratch card, before/after split, post-purchase upsell, and a ratings-led social proof screen (replaced by the method beat in #11 until real ratings exist).

**Drop-off risk:** #3 (a date is a commitment; the skip link protects completion), #8-10 (three questions in a row; they are one tap each), #14 email before the result.

**Monetization and metrics:** one subscription layer plus a one-time offer SKU. Measure separately: paywall CVR (#17) split by days-to-event bucket and by which plan was pre-selected, offer CVR (#18 `offer_view` to `offer_accept`, one-time charge), intro to paid, first-renewal retention at full price (refund and chargeback rate is the guardrail; deadline buyers may stop after the event), and activation (install plus login plus Day 1 within 24h). Intro to renewal jumps are category default; the renewal is shown next to every intro price.

**First A/B tests:** (1) date asked second (this brief) vs. after the situations; (2) pre-select the plan that fits the date vs. always the 4-week plan; (3) three situations vs. one.

**Images:** no `IKAME_AI_KEY` was set, so scene art is CSS/SVG placeholders and the tutor avatar is a copy of the `learning/ewa` fox. Run `gen_images.py` to generate `scene-airport.jpg`, `scene-office.jpg`, `scene-meeting.jpg` and add them to the `IMG` map (build.py does this from the `img/` folder).

**Demo:** private Artifact: https://claude.ai/artifact/8vNJq9ihbwwY7ndZDQstdW (inlined tutor image; the repo `demo.html` references `img/` through the `IMG` map).
