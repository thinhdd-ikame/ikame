---
niche: calmio-burnout
display_name: Calmio - Burnout Recovery (AI wellbeing companion - 18+)
archetype: personalization-quiz
subject: person
input: age (18+ gate), nine Likert statements (energy, connection, confidence), what drains them, time off lately, name, email
output: a burnout stage (Stretched, Worn thin or Running on empty), one boundary script and a 4-week recovery plan
screens: 22
monetization: one plan subscription (1-week intro / 4-week pre-selected / 12-week anchor, renewal shown on every price, pre-renewal email), dismissible web paywall, one smaller one-time fallback pack on close (7 boundary scripts, paid once, no timer), no other upsell layer
creative_screens:
  hook-a: 1
  hook-b: 1
  loader: 17
  reveal: 18
motion: >
  a tight tangle of lines over a tidy desk slowly relaxes into one calm curve
  while a sage flower bud opens petal by petal and a soft chat bubble types
  "Long week? I'm here."
---

# Funnel Content - Calmio: Burnout Recovery

Calmio is a chat-based AI companion for reflective conversation (18+, "a companion, not a therapist"). This is the **work burnout** niche: the user who is tired in a way rest does not fix and has started to care less. They answer nine short statements across three axes (**exhaustion, cynicism, efficacy**), say what drains them and whether they have had any time off. They get a **burnout stage** (Stretched, Worn thin, Running on empty), **one boundary script** they can use this week and a **4-week recovery plan**. **Archetype: personalization-quiz** (Calmio mental-health variant, as in `mental-health/calmio` and `calmio-stress`): money is a plan subscription sold after a data quiz, not a per-message meter. 22 screens, A/B copy on every one.

**Reference funnels (competitor teardown, AdSpyLab research, captured 2026-09):** Chillio "house-ai" funnel (54 screens, `gaps.md` section 4) and Liven "Anti-burnout 35+" (`gaps.md` section 4, `calmio.md` sections 3 and 11). Calmio does not run this niche today. The three-axis structure follows the shape of burnout self-checks (exhaustion, cynicism, efficacy) in our own wording; it is not a validated instrument. Unverified: screen-by-screen details of those funnels come from the research summary, not a fresh live walk.

**Deliberately different from the references and from `calmio-stress` (Task 16):** no diet, supplement or "cortisol" angle; no medical claim; no score, gauge or percentage shown. The stage is a soft label with a reflective line, never a verdict. No fake MD byline, no "% improved" claims, no timer, no promo code, no scratch card, no invented struck price. No chat before the paywall (stress has one): this funnel's proof beat is the **boundary script** on the result screen, a concrete thing to say at work. Questions do not repeat stress: no body-signs list, no peak-time or tried-methods questions, no goal pick. Calmio never tells anyone to quit a job, take leave or change treatment. A "Need help now?" link is on every screen and is never paywalled. Ad copy never implies a personal attribute ("Are you burnt out?" style).

**Visual override (same as `mental-health/calmio`):** soft light theme, warm off-white, sage green and muted lavender, rounded sans, lots of air, the flower as the one hero object. The hook is a lavender morning scene with a desk and a tangle of lines that smooths out; the answer scale runs from a leaf (never) to a low battery (always). Confirm against the real brand kit.

---

## A. Hook

### 1. Hook - Running on empty
**Purpose:** Meet the "tired and still going" state with the brand promise, without asking for anything. One hook screen only: the surface (short chats, small boundaries) is named in the body and shown on the result screen.
**Headline A:** Running on empty?
**Headline B:** Tired, but still going on?
**Body A:** A calm companion for when work wears you down.
**Body B:** Short chats and small boundaries, any time.
**Visual:** Lavender morning sky fading to warm off-white over a tidy desk photo, a tangle of thin looping lines that slowly relax into one gentle curve. A sage flower bud breathes (in 4s, out 6s) beneath. One soft bubble: "Long week? I'm here." Sage button pinned bottom. "Need help now?" link top-right, persistent on every screen to #22.
**Microcopy:** Under CTA: "18+ · Calmio is AI and not a substitute for professional care". "Need help now?" opens the crisis sheet: "Call or text 988 (US) · Outside the US: findahelpline.com · In danger now? Call your local emergency number." One tap, no sign-in, no paywall.
**CTA:** Get started

---

## B. Investment

### 2. Age check
**Purpose:** The app is rated 18+. The check goes before any personal question so no minor discloses anything first.
**Headline A:** First, a quick age check
**Headline B:** What year were you born?
**Body A:** Calmio is for adults 18 and over.
**Body B:** We ask everyone. It keeps Calmio safe.
**Field:** Year wheel picker with no default. The CTA stays disabled until a year is picked.
**Visual:** Plain year wheel in a rounded white card, small sprout icon above.
**Error state:** Under 18 -> a blocking screen, no way back in. Headline: "Calmio is for adults only". Body: "Free support for young people is available now." Buttons: "Call or text 988 (US)" · "Find a helpline near you" (findahelpline.com).
**CTA:** Continue

### 3. What Calmio is (and isn't)
**Purpose:** The honest expectations beat and the safety net, placed before any question about energy or mood. It is where "burnout is not a diagnosis here" and "we will not tell you to quit" are promised.
**Headline A:** A companion, not a therapist
**Headline B:** Before we begin, one promise
**Body A:** It helps you reflect. It doesn't diagnose or treat.
**Body B:** For crisis or medical care, please reach real people.
**Visual:** Five icon rows on a white card (chat bubble, lock, lifebuoy, sprout, check). Sage icons, generous spacing, nothing else on screen.
**Microcopy:** Rows: "Calmio is AI, and always says so" · "Your chats stay private" · "In crisis? Call or text 988 (US) or visit findahelpline.com" · "Burnout isn't a diagnosis here. If exhaustion or low mood lingers, a doctor can help." · "Calmio won't tell you to quit your job or change treatment." Footer: "Calmio does not provide medical advice, diagnosis or treatment."
**CTA:** I understand

### 4. Energy 1 - Drained
**Purpose:** First exhaustion statement. Answers feed the Drained axis only; the user never sees a number.
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** Think about a typical week.
**Body B:** Pick the closest. No wrong answers.
**Field:** Statement card: "I'm drained before the day even starts." Five-step scale: 🌿 Never · 🌤️ Rarely · ⛅ Sometimes · 🌥️ Often · 🪫 Always. Single select, auto-advances.
**Visual:** Quote card on off-white, the five icons as one row of round buttons with labels under them. Chip "Energy · 1 of 3" above. Progress note "1 of 9".
**Microcopy:** The answer is never shown as a number or label to the user.
**CTA:** (auto-advances on tap)

### 5. Energy 2 - Rest does not refill
**Purpose:** Second exhaustion statement; separates tiredness from burnout (rest that does not help).
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** Think about your days off.
**Body B:** The closest answer is fine.
**Field:** Statement card: "Rest doesn't seem to refill me." Same scale, single select, auto-advances.
**Visual:** Same as #4, chip "Energy · 2 of 3", note "2 of 9".
**CTA:** (auto-advances on tap)

### 6. Energy 3 - Heavy tasks
**Purpose:** Third exhaustion statement.
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** Go with your first instinct.
**Body B:** Nothing here is judged.
**Field:** Statement card: "Small tasks feel heavy lately." Same scale, single select, auto-advances.
**Visual:** Same as #4, chip "Energy · 3 of 3", note "3 of 9".
**CTA:** (auto-advances on tap)

### 7. Connection 1 - Caring less
**Purpose:** First cynicism statement. The axis changes here, so the chip and body say so.
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** Next, how you feel toward work.
**Body B:** Same scale. Take your time.
**Field:** Statement card: "I've stopped caring the way I used to." Same scale, single select, auto-advances.
**Visual:** Same as #4, chip "Connection · 1 of 3", note "4 of 9".
**CTA:** (auto-advances on tap)

### 8. Connection 2 - Distant
**Purpose:** Second cynicism statement.
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** Think about the last month.
**Body B:** Pick the closest, as always.
**Field:** Statement card: "I feel distant from the people around me." Same scale, single select, auto-advances.
**Visual:** Same as #4, chip "Connection · 2 of 3", note "5 of 9".
**CTA:** (auto-advances on tap)

### 9. Connection 3 - Pointless
**Purpose:** Third cynicism statement. Crisis-adjacent wording is avoided on purpose: no "hopeless" or "worthless" statements.
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** No right answer, just yours.
**Body B:** Nothing here is judged.
**Field:** Statement card: "Work feels pointless more often than not." Same scale, single select, auto-advances.
**Visual:** Same as #4, chip "Connection · 3 of 3", note "6 of 9".
**CTA:** (auto-advances on tap)

### 10. Confidence 1 - Difference
**Purpose:** First efficacy statement, worded negatively so every axis scores the same direction.
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** Last set. Then a few easy taps.
**Body B:** Same scale, one more set.
**Field:** Statement card: "I doubt my work makes a difference." Same scale, single select, auto-advances.
**Visual:** Same as #4, chip "Confidence · 1 of 3", note "7 of 9".
**CTA:** (auto-advances on tap)

### 11. Confidence 2 - Behind
**Purpose:** Second efficacy statement.
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** Think about a typical week.
**Body B:** The closest answer is fine.
**Field:** Statement card: "I feel behind, whatever I do." Same scale, single select, auto-advances.
**Visual:** Same as #4, chip "Confidence · 2 of 3", note "8 of 9".
**CTA:** (auto-advances on tap)

### 12. Confidence 3 - Second-guessing
**Purpose:** Third efficacy statement; the last of nine, so the practical questions open up.
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** Last statement. Almost there.
**Body B:** Pick the closest, as always.
**Field:** Statement card: "I second-guess things I used to do easily." Same scale, single select, auto-advances.
**Visual:** Same as #4, chip "Confidence · 3 of 3", note "9 of 9".
**CTA:** (auto-advances on tap)

### 13. What's draining you
**Purpose:** The user names the source in their own words. Sets `{{source}}` for the plan wording and breaks axis ties (Team or boss leans to Detached).
**Headline A:** What's draining you most?
**Headline B:** Where's it coming from?
**Body A:** Pick all that apply.
**Body B:** Choose any. Nothing here is judged.
**Options:**
- 💼 Workload
- 👥 Team or boss
- 🏠 Caregiving
- 🔁 No off-switch
- ✏️ Other
**Field:** Multi-select, min 1 to enable the CTA. "Other" opens a one-line input; the CTA stays disabled until it has text. Any free text passes through crisis-language detection before continuing.
**Visual:** Two-column soft chip grid, selected chips get a sage border and a check. A small closed bud sits at the top.
**Microcopy:** Disabled-CTA hint: "Pick at least one". Crisis detection on "Other": if matched, show the crisis sheet from #1 with "Talk to a person now" first and "Continue with Calmio" second. Never block the user, never ask them to explain.
**CTA:** Continue

### 14. Any time off lately
**Purpose:** Whether they have rested at all shapes the first week of the plan. It never judges and never advises leave.
**Headline A:** Have you taken a break?
**Headline B:** Any time off lately?
**Body A:** Pick the closest.
**Body B:** No judgment either way.
**Options:**
- 🏖️ Took leave
- 🗓️ A few days off
- ⏸️ Weekends only
- 🙅 No break yet
- ✏️ Other
**Field:** Single select, auto-advances on tap. Sets `{{rest}}`. "Other" opens a one-line input, CTA disabled until it has text, checked for crisis language.
**Visual:** Four soft cards with a line icon each; selected card fills sage. A small bud above.
**Microcopy:** Progress hint: "One more question". Never suggests taking leave or quitting.
**CTA:** (auto-advances on tap)

### 15. Name
**Purpose:** Captures `{{name}}`, which Calmio uses in the result and the plan. A skipped name falls back to "you".
**Headline A:** What should Calmio call you?
**Headline B:** What's your first name?
**Body A:** A nickname is fine. Change it anytime.
**Body B:** So your conversations feel like yours.
**Field:** Text input, 1-20 chars, placeholder "Your name". Skippable: empty falls back to "you" everywhere.
**Visual:** Plain white input on off-white, small bud icon above.
**Error state:** "Add a name so Calmio knows what to call you"
**Skip link:** Skip for now
**CTA:** Continue

---

## C. Trust

### 16. Real people, real ratings
**Purpose:** The trust beat right after the long Likert run and before the reveal. Proof has to be real; this category is where fake experts and fake stats do the most harm.
**Headline A:** {{app_rating}}★ from real people
**Headline B:** Private. Judgment-free. Yours.
**Body A:** {{rating_count}} ratings from people who've been there.
**Body B:** Your chats stay private.
**Visual:** A: large rating number and sage star row, plus one real store review quoted as shown. B: three line rows (lock, eye-off, trash) on a white card. A renders only when `{{app_rating}}` and `{{rating_count}}` hold real store values; while either is still a token, every viewer sees B (no placeholder card, no dashed "review goes here" box).
**Microcopy:** Rating, count and reviews are unverified: route through `CONFIG` tokens, pull live from this app's own store listing, never hardcode, and never print "from real people" or "been there" over an unset token (fallback = B). Review cards are real store reviews only. No press logos, no "expert" or staff photos unless each is a real, named, credentialed person. B's "delete" row ships only if in-app deletion exists, and its "Sharing is always your choice" row is unverified until product confirms it.
**CTA:** Continue

---

## D. Anticipation

### 17. Reading your stage (loading)
**Purpose:** The wait makes the stage feel built from the nine answers, and gives the strongest ad frame (the blooming flower as the tangle relaxes).
**Headline A:** Reading {{name}}'s burnout stage…
**Headline B:** Building {{name}}'s recovery plan…
**Steps:**
1. Listening back to your answers… - 0→100%
2. Weighing energy, care and confidence… - 0→100%
3. Shaping your four-week recovery plan… - 0→100%
4. Almost ready, your stage awaits… - 0→100%
**Visual:** The flower bud blooms in the top half, the one hero object with depth and slow 3D motion, a tangle of lines smoothing behind it. Everything else fades. Four progress rows beneath: label left, % right, check when done, thin sage bars. With no name, "Reading your burnout stage…".
**Microcopy:** Chips from their answers ("Workload", "No break yet") float up and fade.
**CTA:** (auto-advances, ~6-8 seconds)

### 18. Your burnout stage and a script
**Purpose:** The personalized result, shown as a reflection, one usable boundary script and a plan, never a verdict or a score. The script is the proof beat: the user leaves this screen with something real to say, before any payment.
**Headline A:** Your burnout stage: {{stage}}
**Headline B:** Where you are right now
**Body A:** {{stage_line}}
**Body B:** A reflection, not a diagnosis. You can change it.
**Visual:** Top: flower illustration card with the stage name and three soft chips (Drained · Detached · Doubting), the strongest highlighted, labelled "Where it weighs most". Under it a lavender script card: "One boundary script, for this week" with the script in quotes and a "Copy script" link. Below: a "Goals for your 4-week plan" label over a vertical path of four week-goal cards, week 1 open ("Check-in chat · 2 min", "One boundary script, in your words", "A daily reminder at 6:00 PM"), weeks 2-4 titles only. Weeks are goals for the plan, labelled as such.
**Microcopy:** Stage = sum of the nine answers, bands set by us and unverified (low: Stretched "You're running low, but there's still some give." · middle: Worn thin "Rest isn't refilling you the way it used to." · high: Running on empty "You've been giving from an empty tank for a while."); the sum is never shown. Strongest axis = highest of the three three-statement sums, ties go to Drained (Detached if #13 includes Team or boss). Scripts: Drained "I'm at capacity this week. I can take this on Monday, not today." · Detached "I'm pulling back from extra threads for now. Please send me only what's urgent." · Doubting "Before I commit, can we agree which one comes first? I'll do that well." Plan weeks are shown under the label "Goals for your 4-week plan" and are phrased as goals (Drained): "Goal: protect your energy" · "Goal: take small, real rests" · "Goal: try a smaller yes" · "Goal: find your recovery rhythm". Footer: "Not a diagnosis. A starting point you can change." Never a severity score, gauge, percentage or "burnout level" number.
**CTA:** Continue

### 19. Save your plan (email)
**Purpose:** Captures identity so the stage, script and plan persist, while the result is still warm.
**Headline A:** Where should we send it?
**Headline B:** Save your recovery plan
**Body A:** Your stage and first script, kept safe.
**Body B:** No spam. Unsubscribe anytime.
**Field:** Email input. Marketing opt-in checkbox, unchecked by default: "Send me tips by email (optional)".
**Visual:** White input on off-white, the small bud above the headline. "Need help now?" still visible top-right.
**Error states:** "Enter a valid email address" · "That email has an account, sign in instead?"
**Microcopy:** Legal line: "By continuing you agree to the Terms and Privacy Policy."
**CTA:** Continue

---

## F. Monetization

### 20. Paywall (web sales page)
**Purpose:** The one ask, as a long-scroll web page, placed right after the email. It sells the recovery programme; every price and renewal term sits on the page in readable type.
**Headline A:** Your recovery plan is ready
**Headline B:** {{name}}, start your recovery
**Body A:** Four weeks of check-ins and boundaries, made for you.
**Body B:** Price shown upfront. We remind you before renewing.
**Plans:** 1-week intro · **4-week, pre-selected** (matches the 4-week plan, ribbon "Matches your plan") · 12-week anchor. Every card shows `{{price_*}}` big and `then {{renewal_*}} / period` right under it, plus a per-week equivalent `{{week_*}}`. No percent-off badge, no struck price, no decoy.
**Visual:** Sticky brand bar with close (×) and the persistent "Need help now?" link. Sections in order: personal hero (their stage card and four fact chips: stage, weighs most, last break, plan length that follows the selected tier) · plan block (cards, "Due today" row, CTA, payment badges, secure/cancel row, renewal line) · what's inside (the four weeks plus check-in chat and boundary scripts as a TOC) · how it works (3 steps) · proof ("What people say": rating and real store reviews only; the whole block is hidden while the values are tokens) · FAQ (is this therapy, does it diagnose burnout, will Calmio tell me to quit, how to cancel, will I be charged again, what if I'm in crisis) · plan block again · legal. A sticky bottom CTA slides up while no plan block is visible.
**Microcopy:** Each stat or review is gated on a real value (not a `{{token}}`); no dashed placeholders are shown. Under the CTA at body size: "Renews at {{renewal_4w}} every 4 weeks until you cancel. Cancel anytime in your account." Reminder line: "We'll email you before every renewal." No guarantee or refund block is shown until `{{refund_days}}` and its full terms exist (gated on tokens). Always shown: "Crisis resources are always free." Not shown on this page: timers, promo codes, "no charge yet" wording, usage counters, health-outcome claims.
**Fallback offer:** #21 (a smaller one-time pack, not a cheaper copy of a tier). Every way off this page without paying (× and "Not now") goes to #21 first, once per session. Declining it, or closing the paywall a second time, leads to #22 in free mode.
**CTA:** Start my plan

### 21. A smaller step (one-time offer, shown on close)
**Purpose:** A second, softer chance for people who closed #20 because a subscription felt like a lot: a genuinely smaller product, paid once. Shown once, never after crisis language.
**Headline A:** A smaller step, {{name}}
**Headline B:** Start with a smaller step
**Body A:** A 7-day boundary pack, paid once. No subscription.
**Body B:** Seven small scripts. Nothing to cancel.
**Plans:** One offer card, a different and smaller product than every #20 tier: `{{offer_name}}` (demo: "Starter boundary pack"), `{{offer_price}}` paid once, no renewal, no strike-through price, no comparison to the plans. Includes: 7 boundary scripts for the user's strongest axis (one a day), the burnout stage saved to their email, a reminder at 6:00 PM. Not included (stated on the card): the 4-week plan, daily check-in chats, journaling prompts. Optional `{{offer_badge}}`, shown only once it holds a real value. Buying it unlocks only the 7 scripts in #22; the rest stays behind the subscription.
**Visual:** Same web look as #20: sticky bar with close ×, Calmio wordmark and "Need help now?". Centered eyebrow "One-time offer · shown once", one sage-bordered card with a calm thumbnail, pack name, price row ("{{offer_price}} paid once"), 3 checks, a "Not included" line, CTA, payment badges and a "paid once, nothing to cancel" line. Below: "Crisis resources are always free."
**Microcopy:** Price line at body size: "{{offer_price}} paid once. No renewal, nothing to cancel." No timer: `CONFIG.offer.expiresMin` stays null, and there is no "last chance", "offer ends" or "don't miss out" wording. Never shown after crisis language in a free-text field. Merely opening "Need help now?" does not suppress it. Decline link: "No thanks, keep the free check-in". Events: `offer_view`, `offer_accept` + `checkout_click`, `offer_decline`.
**CTA:** Get the starter pack

---

## G. Payoff

### 22. Today's first check-in
**Purpose:** Close the loop and drop the user into the first real daily check-in, so the first session ends inside the product.
**Headline A:** Your recovery starts now
**Headline B:** Welcome in, {{name}}
**Body A:** Your daily check-in opens at 6:00 PM. Or start now.
**Body B:** Come back anytime. Calmio is here.
**Visual:** Calm garden photo header fading to off-white, the 3D flower fully open as the hero. A "Today's check-in · 2 min" card with the axis prompt (Drained: "What is one thing you can say 'not today' to?"), a reminder row (toggle off by default) "Remind me at 6:00 PM", tab bar below (Today, Chat, Journal, Me).
**Microcopy:** Subscribers get the full check-in and week 1. Free mode shows the 2-minute check-in and a quiet "Unlock your plan" row, never a pop-up. Pack buyers see "Starter pack unlocked · 7 boundary scripts". No rating prompt here; ask only after a completed check-in on day 3 or later. Reminder push text carries no topic words (no "burnout", no theme names), max one a day, no guilt.
**CTA:** Start today's check-in

---

## Notes

- **Archetype call.** Plan subscription after a data quiz -> personalization-quiz, Calmio variant (see Known variants in `archetypes/personalization-quiz.md`). Skipped from the default: decoy tier, countdown upsell, before/after screen, separate premium-preview screen (the result screen does that job), gamified wheel. Skipped from the Calmio siblings: the live chat before the paywall (spine has none; the boundary script carries the proof beat) and the second hook screen.
- **Mental-health safety, built in.** "Need help now?" on all 22 screens and on the web paywall and offer bars · expectations screen (#3) before any energy or mood question, with explicit "not a diagnosis" and "won't tell you to quit" rows · crisis detection on every free-text field (#13, #14) · minors blocked with youth resources (#2) · no medication, supplement or diagnosis wording · no clinical labels, scores or gauges · no statement wording about hopelessness or self-worth. Crisis help is never behind the paywall. Clinical and legal review should cover #2, #3, #18 and the crisis sheet, including non-US helplines.
- **Competitor mechanics - reference only, NOT implemented:** very long 35-54 screen flows, anti-burnout "35+" age targeting, fake expert bylines, "% improved" stats, personalised promo codes, countdown timers, scratch-card discount, discount against a never-charged anchor, renewal far above the intro price, any clinical burnout "score" read-out.
- **Plans are placeholders.** The structure (1-week / 4-week pre-selected / 12-week anchor) mirrors the competitor layout. All prices are `{{price_*}}` / `{{renewal_*}}` tokens; the offer is a separate one-time SKU (`{{offer_price}}`, no renewal) to be created in the store. The real Calmio store lists 1-month and 3-month SKUs (see `mental-health/calmio`); align SKUs before launch. Renewal is shown beside every price and a pre-renewal email is promised, so it must be built.
- **Unverified.** Calmio's real in-app onboarding and tone settings, the free-tier scope (the demo assumes a 2-minute daily check-in stays free), the app-store rating, reviews and any refund window were not viewable; those blocks are placeholders behind tokens and hidden until real values exist. Competitor flows come from the research summary, not a live capture. Plan weeks are goals derived from answers, not promised outcomes.
- **Stage and axis mapping is our own design.** It is not the MBI or any validated instrument and the nine statements are our wording. The sum bands (low 9-20, middle 21-32, high 33-45) and the tie-break need clinical review. Answers are never shown as a number or percentage and never named as a diagnosis.
- **Drop-off risk:** #2 age gate · #4-12 nine statements in a row (one tap each, axis chip and "x of 9" note; the biggest risk in the funnel, test 6 vs 9) · #19 email · #20 paywall. Keep #17 at 6-8 s.
- **Measure separately:** paywall CVR at #20 · offer CVR at #21 (apart from #20) · free-mode to subscribe later · D1/D7 return at the reminder time · refund and chargeback rate (the honesty metric).
- **A/B first:** (1) #1 "Running on empty?" vs "Tired, but still going on?" (2) nine statements vs six (two per axis). (3) #18 with vs without the boundary script card. (4) #20 4-week pre-selected vs 12-week pre-selected.
- **Demo (private Artifact):** https://claude.ai/artifact/FnxF8BmS3ELur7rEmXpVkS
