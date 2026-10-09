---
niche: calmio-hypnosis
display_name: Calmio - Hypnosis for Habits (guided relaxation audio + AI companion - 18+)
archetype: personalization-quiz
subject: person
input: age (18+ gate), focus (drink less, quit smoking, eat calmer, other), three branch questions per focus, reasons, what they tried, best listening time, name, email
output: a habit profile (Stress Soother, Social Joiner, Routine Rider or Autopilot) plus "this week, 3 things" and a 4-week calm plan, after a real 60-second sample session
screens: 21
monetization: one plan subscription (1-week intro / 4-week pre-selected / 12-week anchor, renewal shown on every price, pre-renewal email), dismissible web paywall, one one-time "Calm Start" pass on close (paid once, no renewal, no timer, 3 sessions only), no other upsell layer
creative_screens:
  hook-a: 1
  hook-b: 2
  loader: 15
  reveal: 16
  sample: 18
motion: >
  a soft sage flower bud breathes at the centre while pale sound rings ripple
  outward from it, then a headphones card plays a gentle waveform and a
  caption reads "Breathe in. Let go."
---

# Funnel Content - Calmio: Hypnosis for Habits

Calmio is a chat-based AI companion for reflective conversation (18+, "a companion, not a therapist"). This is the **guided-hypnosis / relaxation-audio** niche: the adult who wants to change one habit (drinking, smoking, stress-eating) and is curious whether relaxing helps. They give easy taps. They get a **habit profile** (a soft style, never a verdict), **"this week, 3 things"**, a **4-week calm plan** and a real **60-second sample session** before the paywall. **Archetype: personalization-quiz** (Calmio mental-health variant, as in `mental-health/calmio-stress` and `calmio-life-planner`): money is a plan subscription sold after a data quiz. It borrows the "taste before the price" beat from companion-chat, as audio. 21 screens, A/B copy on every one. The branch (#6-#8) changes with the focus picked at #5.

**Reference funnel (competitor teardown, AdSpyLab Funnels Library, via `calmio.md` section 8):** Hypnozio landing-alc (alcohol, 29 screens, 1,976 ads, captured 2026-09-28) and its weight-loss and smoking siblings (landing-wl 44 screens, landing-smk). Its spine (why change, tried before, trigger, frequency, quantity, limiting beliefs, listening time, email, result, checkout) is kept in shorter form. Competitor screens are verified from AdSpyLab captures, not live.

**Deliberately different from the references:** no "likely to work for you" candidacy verdict, no dependence meter (Low/High/Severe), no "metabolic age", no "93% success" or "surpasses psychotherapy" claim, no "89% similar users succeeded" graph, no 15-minute NEWSTART promo timer, no fake doctor pages, no "recommended by psychologists" quiz question. No weight or height inputs and no weight-loss promise: "eat calmer" is about the moment of eating, not the scale. No promise to quit or cut down: copy says "support" and "relax", never "stop for good". Where the reference collected alcohol withdrawal symptoms and then sold audio with no safety redirect, this funnel asks the same question only to **redirect**: heavy-drinking answers show a "talk to a professional" screen (#8) and the same note on the profile, the paywall and the FAQ, and the one-time offer is not shown. "Need help now?" is on every screen and never paywalled.

**Visual override (same as `mental-health/calmio`):** soft light theme, warm off-white, sage green and muted lavender, rounded sans, lots of air, the flower as the one hero object. The hypnosis feel comes from slow sound rings and a headphones card, not from spirals, swinging watches or a dark UI.

---

## A. Hook

### 1. Hook A - Change a habit
**Purpose:** Meet the "I want to change this, willpower is not enough" before-state with the brand promise, without asking for anything.
**Headline A:** Change a habit while relaxed
**Headline B:** Slow down the habit moment
**Body A:** Guided audio for the moments habits happen.
**Body B:** Short sessions, made around your day.
**Visual:** Warm off-white with a lavender wash. A sage flower bud breathes at the centre while pale concentric sound rings ripple outward. One soft bubble: "Breathe in. Let go." Sage button pinned bottom. "Need help now?" link top-right, persistent on every screen to #21.
**Microcopy:** Under CTA: "18+ · Calmio is AI and not a substitute for professional care". "Need help now?" opens the support sheet: "Call or text 988 (US) · Substance use support (US): 1-800-662-4357 · Outside the US: findahelpline.com · In danger now? Call your local emergency number." One tap, no sign-in, no paywall.
**CTA:** Get started

### 2. Hook B - How a session works
**Purpose:** Show the core surface (a guided audio session) so the user knows what they would be doing, and set honest framing early.
**Headline A:** Listen. Relax. Notice.
**Headline B:** Guided audio, not willpower
**Body A:** A guided session, plus a companion to chat with.
**Body B:** Calmio is AI relaxation support, not treatment.
**Visual:** Card on off-white with a calm photo, an "AI companion" chip, a headphones row "Guided session · 15 min" with a gently moving waveform, and two chat bubbles (user: "I reach for it every evening." / Calmio: "Let's slow that moment down together.").
**CTA:** Continue

---

## B. Investment

### 3. Age check
**Purpose:** The app is rated 18+. The check goes before any personal question so no minor discloses anything first.
**Headline A:** First, a quick age check
**Headline B:** What year were you born?
**Body A:** Calmio is for adults 18 and over.
**Body B:** We ask everyone. It keeps Calmio safe.
**Field:** Year wheel picker with no default. The CTA stays disabled until a year is picked.
**Visual:** Plain year wheel in a rounded white card, small sprout icon above.
**Error state:** Under 18 -> a blocking screen, no way back in. Headline: "Calmio is for adults only". Body: "Free support for young people is available now." Buttons: "Call or text 988 (US)" · "Find a helpline near you" (findahelpline.com).
**CTA:** Continue

### 4. What Calmio is (and isn't)
**Purpose:** The honest expectations beat and the safety net, placed before any question about habits. It carries the "no promise of results" line the category most needs.
**Headline A:** Relaxation support, not treatment
**Headline B:** Before we begin, one promise
**Body A:** Sessions help you relax. They can't promise results.
**Body B:** Results vary. For medical care, see a professional.
**Visual:** Five icon rows on a white card (chat bubble, lifebuoy, pill, headphones, book). Sage icons, generous spacing, nothing else on screen.
**Microcopy:** Rows: "Calmio is AI, and always says so" · "Sessions support relaxation. They don't treat or cure." · "Never change or stop medication without your doctor" · "Never listen while driving or using machinery" · "In crisis? Call or text 988 (US) or visit findahelpline.com". Footer: "Calmio does not provide medical advice, diagnosis or treatment."
**CTA:** I understand

### 5. Your focus
**Purpose:** The branching question. It sets `{{goal}}` and decides the three questions that follow. Goal wording is the user's own aim, never a promised outcome.
**Headline A:** What do you want to change?
**Headline B:** Pick your focus
**Body A:** Choose the one that matters most.
**Body B:** You can add more later.
**Options:**
- 🍷 Drink less
- 🚬 Quit smoking
- 🍽️ Eat calmer
- ✏️ Other
**Field:** Single select, auto-advances on tap. "Other" opens a one-line input; the CTA stays disabled until it has text; the text passes through crisis-language detection. "Other" runs the generic branch.
**Visual:** Stacked soft pill rows with a large emoji, selected row fills sage with a check. A small closed bud sits at the top.
**CTA:** (auto-advances on tap)

### 6. Branch question 1
**Purpose:** Branch-specific. For drinking and eating this is the trigger moment; for smoking it is what they use.
**Headline A:** When does it happen most?
**Headline B:** What sets it off?
**Branch headlines (A / B):** drink: "When do you drink most?" / "What sets it off?" · smoke: "What do you smoke?" / "Choose what you use." · eat: "When does it happen?" / "What sets it off?" · other: "When does it happen most?" / "What sets it off?"
**Body A:** Pick the closest one.
**Body B:** No judgment here.
**Options:** drink: 🛋️ Evenings at home · 🥂 Social events · 😮‍💨 After stressful days · 🍽️ With meals · ✏️ Other. smoke: 🚬 Cigarettes · 💨 Vape · 🔀 Both · ✏️ Other. eat: 🌙 Late at night · 😮‍💨 When stressed · 🥱 When bored · 📺 While distracted · ✏️ Other. other: 😮‍💨 When stressed · 🥱 When bored · 🛋️ Evenings · 🥂 With others · ✏️ Other.
**Field:** Single select, auto-advances. "Other" opens a one-line input, CTA disabled while empty, crisis-checked.
**Visual:** Stacked pills, selected fills sage.
**CTA:** (auto-advances on tap)

### 7. Branch question 2
**Purpose:** How often or how much, in neutral words. For drinking, "most days" and "every day" are safety signals (see #8).
**Headline A:** How often does it happen?
**Headline B:** Be honest. It stays private.
**Branch headlines (A / B):** drink: "How often do you drink?" / "Be honest. It stays private." · smoke: "How much per day?" / "A rough guess is fine." · eat: "What are you reaching for?" / "No judgment here." · other: "How often does it happen?" / "Be honest. It stays private."
**Body A:** A rough guess is fine.
**Body B:** No right answer. Just yours.
**Options:** drink: 🗓️ A few times a month · 📆 Weekly · 🔁 Most days · 🌙 Every day. smoke: 🌱 1-5 · 🌿 6-10 · 🌳 11-20 · 🏔️ 20 or more. eat: 🍫 Sweets · 🍟 Salty snacks · 🥤 Anything nearby · ✏️ Other. other: 📆 Weekly · 🔁 Most days · ⏰ Many times a day · 🌊 It varies.
**Field:** Single select, auto-advances (the eat list has an "Other" input, crisis-checked). No amounts, units or targets are shown back to the user.
**Visual:** Stacked pills with a small growing bar beside the frequency rows.
**CTA:** (auto-advances on tap)

### 8. Branch question 3 (and care check)
**Purpose:** The third branch question, which doubles as the safety gate. For drinking it asks about feeling unwell when cutting back; for eating it asks how they feel afterwards. A safety answer shows the care check before the funnel continues.
**Headline A:** How do you feel after?
**Headline B:** One question for your safety
**Branch headlines (A / B):** drink: "Unwell when you cut back?" / "One question for your safety" · smoke: "What sets it off?" / "Which moments pull you?" · eat: "How do you feel after?" / "Pick the closest one." · other: "How strong is the pull?" / "Pick the closest one."
**Body A:** Pick the closest one.
**Body B:** Pick the closest one.
**Branch bodies:** drink (A): "Shaky, sweaty or anxious? We ask for safety."; all others "Pick the closest one."
**Options:** drink: ✅ Never · 🤔 Sometimes · ⚠️ Often · 🙅 Haven't tried. smoke: ☕ Coffee or breaks · 😮‍💨 Stress · 🥂 Social moments · 🥱 Boredom · ✏️ Other. eat: 🙂 Fine · 😕 A bit guilty · 😣 Out of control · 😶 Numb. other: 🪶 A little · 🪨 Some · 🏔️ A lot.
**Care check (state 8b, shown once):** Triggered when (drink) the answer at #7 is "Most days" or "Every day", or the answer at #8 is "Sometimes" or "Often"; or (eat) the answer at #8 is "Out of control".
 - **Headline A:** Talk to a professional first
 - **Headline B:** A doctor can help safely
 - **Body A (drink):** Cutting back suddenly can be unsafe. Please check with a doctor. · **Body B (drink):** A doctor can help you change this safely.
 - **Body A (eat):** Feeling out of control around food deserves real support. · **Body B (eat):** A professional can help you feel steadier.
 - Rows: "Talk to your doctor or a licensed professional" · "Substance use support (US): 1-800-662-4357, free, 24/7" (drink only) · "findahelpline.com for other countries" · "In danger now? Call your local emergency number."
 - Footer: "Calmio sessions support relaxation. They are not treatment, and they don't replace medical care."
 - **CTA:** Continue with Calmio. Secondary: Back to my answers. It is a recommendation, not a block: the user may continue.
**Soft note (eat only):** "A bit guilty" or "Numb" at #8 does not open the care check or suppress the offer; it adds a gentle "A gentle note" card on #16 and #19: "Feeling guilty or numb after eating is common. If it keeps happening, a doctor or licensed professional can help. Calmio is not a substitute for care."
**Microcopy:** Once the care check has fired, the profile (#16), the paywall (#19) and its FAQ carry the same "talk to a professional" note, and the one-time offer (#19 close) is not shown. Never "you are dependent", never a score or a meter.
**Visual:** Stacked pills; the care check is a calm white card with a lifebuoy icon, sage and lavender only, no red alert colours.
**CTA:** (auto-advances on tap; the care check has its own button)

### 9. Bridge - not weakness
**Purpose:** A reassurance beat after the heaviest questions and before the personal ones. It lowers shame so the next answers are honest. No claim, no statistic.
**Headline A:** Habits aren't weakness.
**Headline B:** It's not a willpower test.
**Body A:** Calm can help you pause. Next: your reasons.
**Body B:** Next: your reasons and your story.
**Visual:** Centered flower bud opening slowly, one soft line of text, nothing else. Plenty of air.
**CTA:** Continue

### 10. Your reasons
**Purpose:** Sets `{{reasons}}`, reused on the profile, the plan and the paywall hero. Motivation in the user's own words.
**Headline A:** Why does this matter?
**Headline B:** What do you want back?
**Body A:** Pick all that fit.
**Body B:** Choose any. This shapes your sessions.
**Options:**
- 💪 Feel healthier
- 💰 Save money
- 👨‍👩‍👧 For my family
- 😌 Feel in control
- 🌅 Better mornings
- ✏️ Other
**Field:** Multi-select, min 1. "Other" opens a one-line input, CTA disabled while empty, crisis-checked.
**Visual:** Two-column soft chip grid, selected chips get a sage border and a check.
**Microcopy:** Disabled-CTA hint: "Pick at least one".
**CTA:** Continue

### 11. What you've tried
**Purpose:** Sets the starting pace. A neutral history, not "have you failed".
**Headline A:** Tried changing it before?
**Headline B:** What have you tried?
**Body A:** No wrong answer. Just your story.
**Body B:** It helps us pick your pace.
**Options:**
- 🆕 First time trying
- 🔁 On my own
- 📱 With an app
- 🧑‍⚕️ With a professional
- ✏️ Other
**Field:** Single select, auto-advances. "Other" opens a one-line input, CTA disabled while empty, crisis-checked.
**Visual:** Stacked pills with a small line icon each.
**CTA:** (auto-advances on tap)

### 12. When you'll listen
**Purpose:** Sets `{{best_time}}` for the daily session slot and the optional reminder. Carries the "never while driving" safety line.
**Headline A:** When will you listen?
**Headline B:** Pick a quiet moment
**Body A:** About 15 minutes. Never while driving.
**Body B:** We'll nudge you then. Never while driving.
**Options:**
- 🌅 Mornings
- ☀️ Midday break
- 🌙 Bedtime
- 🔀 It varies
**Field:** Single select, auto-advances. Sets `{{nudge}}`: 7:30 AM · 1:00 PM · 9:30 PM · 8:00 PM.
**Visual:** Four pills with a sun-to-dusk gradient down the list.
**CTA:** (auto-advances on tap)

### 13. Name
**Purpose:** Captures `{{name}}`, which Calmio uses in the profile and the sessions. A skipped name falls back to "you".
**Headline A:** What should Calmio call you?
**Headline B:** What's your first name?
**Body A:** A nickname is fine. Change it anytime.
**Body B:** So your sessions feel like yours.
**Field:** Text input, 1-20 chars, placeholder "Your name". Skippable: empty falls back to "you" everywhere.
**Visual:** Plain white input on off-white, small bud icon above.
**Error state:** "Add a name so Calmio knows what to call you"
**Skip link:** Skip for now
**CTA:** Continue

---

## C. Trust

### 14. Private by design
**Purpose:** The trust beat after the investment stage and before the reveal. Answers about drinking, smoking and eating are sensitive; proof must be real. The rating block ships only when real store data exists.
**Headline A:** Private. Judgment-free. Yours.
**Headline B:** What you share stays yours.
**Body A:** Your answers stay private. Sharing is always your choice.
**Body B:** No judging. No streak guilt.
**Visual:** Rows (lock, eye-off) on a white card: "Your answers stay private" and "Sharing is always your choice". A third row (trash) "Delete your data anytime" renders only when `CONFIG.deletion` is true (default off); no developer notes appear in the UI. When `{{app_rating}}` and `{{rating_count}}` are real, a rating card with a real store review appears above the rows; while they are tokens the card is hidden.
**Microcopy:** Pull rating and count live from this app's own store listing, never hardcode, never in the headline. Review cards are real store reviews only. No press logos, no "doctor" or "hypnotherapist" photos unless each is a real, named, credentialed person.
**CTA:** Continue

---

## D. Anticipation

### 15. Tuning your session (loading)
**Purpose:** The wait makes the plan feel built from the answers and gives the strongest ad frame (sound rings and a blooming flower).
**Headline A:** Tuning {{name}}'s session…
**Headline B:** Building {{name}}'s calm plan…
**Steps:**
1. Reading what you shared… - 0→100%
2. Matching a session to your goal… - 0→100%
3. Setting your listening time… - 0→100%
4. Almost ready, your plan awaits… - 0→100%
**Visual:** The flower bud blooms in the top half, the one hero object with depth and slow 3D motion, pale sound rings behind it. Four progress rows beneath: label left, % right, check when done, thin sage bars. Chips from their answers ("Drink less", "Evenings at home", "Bedtime") float up and fade. With no name, "Tuning your session…".
**CTA:** (auto-advances, ~6-8 seconds)

### 16. Your habit profile
**Purpose:** The personalized result: a reflection and three small goals, never a verdict, a score or a prediction. It makes the paywall's "what you get" concrete and traceable to the answers.
**Headline A:** Your style: {{profile}}
**Headline B:** This week, three things
**Body A:** {{profile_line}}
**Body B:** Goals sized to your day. Change them anytime.
**Visual:** Top: flower card with the profile name and four fact chips (focus, what sets it off, listening time, best time). Under it a vertical list of three numbered cards, "This week, 3 things". Below: the four week titles of the calm plan, week 1 open. If the care check fired, a calm "Talk to a professional" card sits at the very top. Footer: "A reflection, not a diagnosis. A starting point you can change."
**Microcopy:** Profiles (from the trigger answer): Stress Soother ("It shows up when the day feels heavy.") · Social Joiner ("It tends to appear around other people.") · Routine Rider ("It's woven into parts of your day.") · Autopilot ("It happens before you notice.", also the default for "Other"). The three things are suggested goals, never promises. Never a score, gauge, percentage, "likely to work" verdict or severity label.
**CTA:** Continue

### 17. Save your plan (email)
**Purpose:** Captures identity so the profile, plan and sessions persist, while the result is still warm.
**Headline A:** Where should we send it?
**Headline B:** Save your calm plan
**Body A:** Your profile and sessions, kept safe.
**Body B:** No spam. Unsubscribe anytime.
**Field:** Email input. Marketing opt-in checkbox, unchecked by default: "Send me tips by email (optional)".
**Visual:** White input on off-white, the small bud above the headline. "Need help now?" still visible top-right.
**Error states:** "Enter a valid email address" · "That email has an account, sign in instead?"
**Microcopy:** Legal line: "By continuing you agree to the Terms and Privacy Policy."
**CTA:** Continue

### 18. Try a 60-second session
**Purpose:** A taste of the product before the paywall: a real 60-second sample so the user hears what they would pay for. Proof of product before the price.
**Headline A:** Try a 60-second session
**Headline B:** Hear it before you decide
**Body A:** Use headphones. Never while driving.
**Body B:** A short sample. Pause anytime.
**Visual:** (Prototype: the sample is a mock, a silent progress bar. A real recorded 60-second audio clip is required before launch.) Soft card with the calm photo, a big round play button, a waveform that moves while playing, a 0:00 / 1:00 progress line and a breathing circle that reads "Breathe in…" and "Let go…". Labeled "Sample session". "Need help now?" stays visible. No claim on the screen about what the user will feel.
**Microcopy:** Safety line under the player: "Stop any time. Never listen while driving or using machinery." After the sample ends: "That was a taste. Full sessions run about 15 minutes." No "you should feel calmer already" claim.
**Skip link:** Skip the sample
**CTA:** Continue

---

## F. Monetization

### 19. Paywall (web sales page)
**Purpose:** The one ask, as a long-scroll web page, placed right after the sample. It sells the 4-week calm plan; every price and renewal term sits on the page in readable type.
**Headline A:** Your calm plan is ready
**Headline B:** {{name}}, start your first week
**Body A:** Guided sessions and check-ins, built for you.
**Body B:** Price shown upfront. We remind you before renewing.
**Plans:** 1-week intro · **4-week, pre-selected** (ribbon "Matches your plan") · 12-week anchor. Every card shows `{{price_*}}` big and `then {{renewal_*}} / period` right under it, plus a per-week equivalent `{{week_*}}`. No percent-off badge, no struck price, no decoy.
**Visual:** Sticky brand bar with close (×) and the persistent "Need help now?" link. Sections in order: personal hero (their profile card and four fact chips: focus, listening time, best time, plan length) · care note (only when the care check fired: "Talk to a professional before you change how much you drink or eat") · plan block (cards, "Due today" row, CTA, payment badges, secure/cancel row, renewal line) · what's inside (the four weeks as a TOC) · how it works (3 steps) · proof (rating and reviews, shown only when real, hidden while tokens) · refund block (shown only when `refundDays` and terms are real) · FAQ (is this therapy, will it make me quit, can I listen while driving, is it safe if I drink often, can I stop my medication, how to cancel, will I be charged again, what if I'm in crisis) · plan block again · legal. A sticky bottom CTA slides up while no plan block is visible.
**Microcopy:** Under the CTA at body size: "Renews at {{renewal_4w}} every 4 weeks until you cancel. Cancel anytime in your account." Reminder line: "We'll email you before every renewal." Always shown: "Crisis resources are always free." Not shown on this page: timers, promo codes, "no charge yet" wording, usage counters, outcome claims, success percentages, "quit for good".
**Fallback offer:** #20. Every way off this page without paying (× and "Not now") goes to #20 first, once per session, unless the care check or crisis language fired. Declining it, or closing the paywall a second time, leads to #21 in free mode.
**CTA:** Start my plan

### 20. One-time offer - Calm Start pass (shown on close)
**Purpose:** A second, smaller chance for people who closed #19 because a subscription felt like a lot. Shown once, never after the care check or crisis language.
**Headline A:** Just want to try sessions?
**Headline B:** One-time offer, shown once
**Body A:** A smaller pass, paid once. No subscription.
**Body B:** Three guided sessions, yours for a week.
**Plans:** One offer card, a different and smaller product than any paywall tier: `{{offer_name}}` (the Calm Start pass), `{{offer_price}}` paid once, 7 days, no renewal, no strike-through price. Includes three guided sessions for the user's focus and the plan saved to the email. Not included (stated on the card): the 4-week calm plan, chat check-ins, weekly check-ins, reminders. Optional `{{offer_badge}}`. It is not the 1-week intro tier, which auto-renews and includes the full plan.
**Visual:** Same web look as #19: sticky bar with close ×, Calmio wordmark and "Need help now?". Centered eyebrow "One-time offer · shown once", one sage-bordered card with a calm thumbnail, offer name, price row ("once"), 3 checks, a "Not included" line, CTA, payment badges, a "paid once, nothing to cancel" line (and a refund line only when `refundDays` is real). Below: "Crisis resources are always free."
**Microcopy:** No timer: `CONFIG.offer.expiresMin` stays null, and there is no "last chance", "offer ends" or "don't miss out" wording. Never shown after the care check or crisis language. Decline link: "No thanks, keep the free plan". Events: `offer_view`, `offer_accept` + `checkout_click`, `offer_decline`.
**CTA:** Get the Calm Start pass

---

## G. Payoff

### 21. Your first session
**Purpose:** Close the loop and drop the user into the first session, so the first visit ends inside the product.
**Headline A:** Your first session awaits
**Headline B:** Welcome in, {{name}}
**Body A:** Start when you're ready. Take it slowly.
**Body B:** Come back anytime. Calmio is here.
**Visual:** Calm light photo header fading to off-white, the 3D flower fully open as the hero. A "Today's session · 15 min" card with the first session title, a reminder row (toggle off by default) "Remind me at {{nudge}}", tab bar below (Today, Sessions, Plan, Me).
**Microcopy:** Subscribers get the full plan and weekly check-ins. Free mode shows the 60-second sample again and a quiet "Unlock your plan" row, never a pop-up. No rating prompt here; ask only after a finished session on day 3 or later. Reminder push text carries no topic words (no "drink", "smoking", "cravings"), max one a day, no guilt.
**CTA:** Start my first session

---

## Notes

- **Archetype call.** Plan subscription after a data quiz -> personalization-quiz, Calmio variant (see Known variants in `archetypes/personalization-quiz.md`). Borrowed from companion-chat: a real "taste" before the paywall (#18, audio instead of chat). Skipped from the default: decoy tier, countdown upsell, before/after screen, separate premium-preview screen, gamified wheel, prediction graph.
- **Mental-health and substance safety, built in.** "Need help now?" on all 21 screens and on the web paywall and offer bars (with a US substance-use line) · expectations screen (#4) before any habit question, including "never change medication" and "never while driving" · care check at #8 for heavy-drinking and out-of-control-eating answers, repeated on #16, #19 and in the FAQ · one-time offer suppressed after a care check · crisis detection on every free-text field (#5, #6, #7, #8, #10, #11) · minors blocked with youth resources (#3) · no medication questions · no clinical labels, scores, meters or "candidacy" verdicts · no weight or height. Crisis help is never behind the paywall. Clinical and legal review should cover #3, #4, #8, #16, the FAQ and the support sheet, including non-US helplines and the claims allowed for hypnosis audio.
- **Competitor mechanics - reference only, NOT implemented:** "likely to work" candidacy result, dependence meter, "metabolic age", "93% success surpassing psychotherapy", "89% similar users" graph, NEWSTART promo with a 15-minute timer, fake doctor pages, "recommended by psychologists" question, conditional money-back tied to listening at least six sessions.
- **No outcome promise.** Nowhere does the funnel promise to quit, cut down or lose weight. Plan weeks are labeled goals derived from answers. The unverified claim "hypnosis helps with habits" is not made; copy says guided relaxation audio and "support".
- **Plans are placeholders.** The structure (1-week / 4-week pre-selected / 12-week anchor) mirrors the competitor layout. All prices are `{{price_*}}` / `{{renewal_*}}` tokens. The real Calmio store lists 1-month and 3-month SKUs (see `mental-health/calmio`); align SKUs before launch. The offer's one-time SKU `{{offer_price}}` must exist as a non-renewing product at checkout. Renewal is shown beside every price and a pre-renewal email is promised, so it must be built.
- **Unverified.** Calmio's real hypnosis content (session library, length, voice), the free-tier scope (the demo assumes the 60-second sample stays free), the app-store rating, the refund window and the review texts were not viewable; rating, reviews and refund blocks are token-gated and hidden until real values exist. Competitor flows are verified from AdSpyLab captures, not live. The branch questions are our own design from the research summary (unverified against Hypnozio's exact order). The profile mapping (trigger -> style) is our own and needs clinical review.
- **Sample is a mock.** The #18 demo plays no sound. A real recorded and reviewed 60-second audio clip is required before launch.
- **Clinical review flags.** The eating branch (#6-#8) has no "Big meals" trigger option and routes "A bit guilty"/"Numb" to a soft professional note; the soft-note rule and the full care-check rule need clinical review before launch.
- **Images:** `gen_images.py` is ready, but no `IKAME_AI_KEY` was available when this demo was built, so `img/` holds calm stand-in photos copied from `mental-health/calmio-sleep` under the new names. Run `IKAME_AI_KEY=... python3 gen_images.py --force` to replace them.
- **Drop-off risk:** #3 age gate · #5-#8 branch questions (one tap each) · #8 care check (a recommendation, not a block) · #17 email · #19 paywall. Keep #15 at 6-8 s.
- **Measure separately:** paywall CVR at #19 · offer CVR at #20 (apart from #19) · care-check shown rate and continue rate · free-mode to subscribe later · D1/D7 return at the nudge time · refund and chargeback rate (the honesty metric).
- **A/B first:** (1) #1 "Change a habit while relaxed" vs "Slow down the habit moment" (2) #18 sample before vs after #17 (3) #16 with vs without the fact chips (4) #19 4-week pre-selected vs 12-week pre-selected.
- **Demo (private Artifact):** https://claude.ai/artifact/Wi2hTGuUw13JawBEuPUxtz
