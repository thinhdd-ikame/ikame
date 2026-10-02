---
niche: ewa-speak-ai
display_name: EWA Speak (Speaking practice with an AI tutor)
archetype: learning-plan
subject: person
input: speaking fears, situation they need English for, how often they speak now, self-rated level, one spoken (or typed) sentence, AI tutor pick, minutes per day
output: speaking level (CEFR estimate) plus a pronunciation tip (a personal note only when a word was actually missed, otherwise a tip for the trickiest word in the sentence), and a paced speaking plan
screens: 21
monetization: web subscription paywall (1-week intro / 4-week pre-selected / 12-week anchor), intro and renewal price shown together, one-time last-chance offer on paywall close, no permanent sale ribbon
creative_screens:
  hook-a: 1
  fear-pick: 3
  say-it: 11
  ai-feedback: 12
  reveal: 17
motion: >
  a sound-wave ring pulses around a mic while a sentence appears word by word,
  each word lights up green as it is matched, one word glows orange and a small
  model-voice bubble plays it back, then a tutor avatar waves and a level strip
  slides to the user's estimate
---

# Funnel Content — EWA Speak (Speaking practice with AI)

Reference funnels: Lola Speak (1,273 ads, 62 screens, CEFR level plus a "Lexical Access Score") and Jumpspeak (1,264 ads, 30 screens, fear-of-speaking angle), captured Sept 2026 via AdSpyLab (research `ewa-ayahpath.md` §3). EWA (Lithium Lab) already has an AI-tutor mention on its main funnel (`learning/ewa`) but never lets you speak before paying. This brief keeps the learning-plan spine and adds a **real speaking check before the paywall**: the user says one sentence into the mic (or types it if the mic is unavailable or denied), the AI marks which words it matched, and gives **one pronunciation tip with a model voice** (a personal note only when a word was actually missed). The result is a **CEFR speaking estimate plus a pronunciation tip plus a plan**, then a web paywall and a one-time offer.

Archetype: **learning-plan**, registered variant of `learning/ewa`. Deliberate differences from the competitors: feedback is real and arrives before any email or payment; the mic is optional on every path (explain screen with "Type instead", skip link on the test, typed fallback that is labelled honestly); no invented score name, no lifetime "€229 (was €459)" anchor, no scratch card, no countdown reset, no fake expert persona (tutors are labelled AI voices, not people). Fear-of-speaking questions use soft, normalising copy and never imply a disorder.

---

## A. Hooks

### 1. Hook A — Speak out loud
**Purpose:** Match the ad: the promise is speaking, not studying, and a first sentence in under two minutes.
**Headline A:** Speak English out loud
**Headline B:** Say it. Hear what to fix.
**Body A:** Practice with an AI tutor. Get feedback in minutes.
**Body B:** One sentence now. A plan built around you.
**Visual:** Cream background, a large mic orb with two soft sound-wave rings, a subtitle-style sentence under it with one word highlighted and a small "model voice" bubble; orange pill CTA.
**Microcopy:** Trust line: "★ {{app_rating}} · {{rating_count}} ratings on the App Store" *(EWA reference: 4.7 · 196K, captured Sept 2026; unverified for this product; hidden while the tokens are unset)*. Small line: "AI tutor voices are not real people."
**CTA:** Get started

### 2. Hook B — Normalise the fear
**Purpose:** Cold traffic who freeze when speaking need permission to be imperfect before the first tap.
**Headline A:** Knowing English is not speaking it
**Headline B:** Freezing is normal
**Body A:** Speaking is a skill. It grows with practice.
**Body B:** An AI tutor never judges or sighs.
**Visual:** Two-bubble strip: a thought bubble full of grammar rules, then a speech bubble with one confident short sentence; a real review card only when set.
**Microcopy:** Review card and rating number show only when real values are set in `CONFIG` (hidden while they are tokens). No placeholder review is shown to users.
**CTA:** Continue

---

## B. Investment — what holds you back

### 3. Fears when speaking
**Purpose:** The fear picks drive the bridge, the tutor tone and the first plan week. Opens with the cheapest, most relatable tap.
**Headline A:** What stops you speaking?
**Headline B:** What makes you freeze?
**Body A:** Pick all that apply. We'll train each.
**Body B:** Everyone has one. Pick all that fit.
**Options:**
- 😬 Fear of mistakes
- 🧊 I freeze up
- 🐢 Slow to find words
- 👂 Can't follow replies
- ✏️ Other
**Field:** Multi-select, at least one required; "Other" opens a one-line input and blocks the CTA while empty.
**Visual:** Stacked pills with checkbox circles.
**Microcopy:** Disabled-CTA hint: "Pick at least one to continue"
**CTA:** Continue

### 4. Where you need it
**Purpose:** The situation sets the test sentence and the plan's first topics.
**Headline A:** Where will you speak English?
**Headline B:** What do you need it for?
**Body A:** We'll practice real moments like these.
**Body B:** Your first sentence comes from this.
**Options:**
- 💼 Work and meetings
- ✈️ Travel
- 🧑‍🤝‍🧑 Friends and dating
- 🎓 Study and exams
- ✏️ Other
**Field:** Single-select. "Other" opens a one-line input (CTA disabled while empty) and uses the friends-and-dating sentence.
**Visual:** Four stacked pills with small scene icons.
**CTA:** Continue

### 5. How often you speak
**Purpose:** Honest baseline; a person who never speaks gets a gentler first week.
**Headline A:** How often do you speak?
**Headline B:** Speaking English right now?
**Body A:** Out loud, with a real person.
**Body B:** Honest answers give a better plan.
**Options:**
- 🚫 Almost never
- 📆 A few times a month
- 🗓️ Weekly
- 🔁 Most days
**Field:** Single-select.
**Visual:** Four pills with a small frequency dot strip.
**CTA:** Continue

### 6. Level
**Purpose:** A cheap first guess; combined with the sentence to estimate the CEFR band.
**Headline A:** How's your English today?
**Headline B:** {{name}}, where do you start?
**Body A:** A rough guess is fine. We'll check soon.
**Body B:** Honest answers get you the right first lesson.
**Options:**
- 🌱 Total beginner
- 🙂 I know the basics
- 💬 I can chat a bit
- 🚀 Pretty confident
**Field:** Single-select.
**Visual:** Four stacked pills with a four-step level meter on each.
**Microcopy:** After "Total beginner": "Everyone starts somewhere. We'll begin with the basics."
**CTA:** Continue

### 7. Bridge — how AI practice helps
**Purpose:** Answers each fear pick with a real feature and breaks up the quiz before the mic.
**Headline A:** Practice without the pressure
**Headline B:** That's exactly what we fix
**Body A:** Speak as often as you like. No audience.
**Body B:** Each session trains what you picked.
**Visual:** One card per pick (max 3): "Mistakes are private, retry as often as you like"; "Short prompts that start you off"; "Slow replies you can replay"; "Your pace, one word at a time".
**Microcopy:** Captions: "😬 Mistakes stay private. Retry freely." / "🧊 Short prompts get you started." / "🐢 Take your time, the tutor waits." / "👂 Replies you can slow down and replay." Progress hint: "Step 1 of 3"
**CTA:** Continue

### 8. Name
**Purpose:** Gets `{{name}}` for the tutor greeting, result, plan and offer.
**Headline A:** What should we call you?
**Headline B:** What's your first name?
**Body A:** Your tutor will greet you by name.
**Body B:** It goes on your speaking plan.
**Field:** Text input, placeholder "First name", max 30 chars. Empty falls back to the neutral stand-in "friend" (and "your" for possessives).
**Visual:** White input on cream, a small tutor face with a speech bubble that fills with "Hi, …!" as they type.
**Error state:** "Please enter a name to continue"
**CTA:** Continue

---

## C. Trust

### 9. Social proof
**Purpose:** Trust beat right before the highest-friction ask (the mic).
**Headline A:** Rated by {{rating_count}} learners
**Headline B:** Speak, listen, fix one thing
**Body A:** Ratings from the App Store.
**Body B:** The feature reviewers mention most.
**No-rating fallback (while `{{app_rating}}`/`{{rating_count}}` are unset):** Headline A and B both read "Speak, listen, fix one thing"; Body A "Feedback on your own words.", Body B "Instant feedback, every session."; the rating number is hidden and a three-step strip replaces it.
**Visual:** Large rating number with star row, App Store and Google Play badges, real review cards only when set; with no rating yet the screen shows a three-step strip (Speak, Listen, Fix one thing).
**Microcopy:** Numbers are tokens (`{{app_rating}}`, `{{rating_count}}`); hidden while unset. EWA reference: 4.7 · 196K. Do not reuse for any other brand.
**CTA:** Continue

---

## D. Investment — your first sentence

### 10. Microphone check
**Purpose:** Explain before the browser asks, and give a no-pressure way out so denial never ends the funnel.
**Headline A:** Let's hear you speak
**Headline B:** Ready for one sentence?
**Body A:** We use your mic only for this test.
**Body B:** Audio is not saved in this demo.
**Field:** Primary button "Allow microphone" requests mic access (getUserMedia and the browser's speech recognition when available). A granted, denied or unavailable result all move to #11; denied or unavailable switches #11 to typed mode with a short toast. Link "Type instead" goes to #11 in typed mode.
**Visual:** Mic orb with a soft ring, a three-line privacy list (only for the test / you control it / typing works too).
**Microcopy:** "No mic? You can type the sentence instead." Production note: state retention of audio truthfully (unverified, the team must confirm).
**Skip link:** "Type instead"
**CTA:** Allow microphone

### 11. Say it
**Purpose:** The test: one sentence chosen from #4, spoken (or typed). Differs from competitors who only describe speaking.
**Headline A:** Say this sentence
**Headline B:** Read it out loud, {{name}}
**Body A:** Tap the mic and read it. Take your time.
**Body B:** Slow and clear is better than fast.
**Field:** The target sentence shown large with a "Listen" button (model voice). Mic mode: a big mic button toggles recording; the transcript appears live; CTA "Check it" enables once any words were heard. Typed mode (mic denied, unavailable or chosen): a one-line input to type what you would say, CTA disabled while empty. Link "Skip this step" goes to #13 (no feedback shown).
**Visual:** Sentence card, mic orb with pulsing rings while recording, live transcript under it; typed mode shows an input and a "Typing mode" chip.
**Microcopy:** Sentences by situation: work "Could we schedule a meeting for Thursday?", travel "Excuse me, where is the nearest pharmacy?", friends "Nice to meet you, I've heard a lot about you.", study "I think the answer is thirteen, not thirty." Hint: "Allowed the mic but nothing shows? Use Type instead."
**Skip link:** "Skip this step"
**CTA:** Check it

### 12. AI feedback
**Purpose:** The thing no competitor shows before the paywall: real feedback on the user's own words, with one concrete pronunciation note and a model voice.
**Headline A:** Here's what we heard
**Headline B:** Your first feedback, {{name}}
**Body A:** Green words matched. One tip to try.
**Body B:** Listen, then say the word again.
**Field:** The target sentence with each word marked matched (green) or missed (orange) by comparing the transcript to the target. One tip card: the first missed word (labelled "Word to fix"), otherwise the sentence's trickiest word labelled "Tip for the trickiest word" (never presented as a personal note), with how to say it and a "Hear it" model-voice button. Typed mode is labelled honestly: "You typed this, so we can't judge sound. Tip is for the trickiest word." Tip words: Thursday, pharmacy, heard, thirteen. Shown only if #11 was not skipped.
**Visual:** Word chips in a wrapped line, a tip card with the word large and syllable breaks, a small wave icon on the Hear it button.
**Microcopy:** Footnote: "Demo uses word matching. Production uses a pronunciation model (unverified)." CTA label stays "Continue".
**CTA:** Continue

### 13. Choose your tutor
**Purpose:** Personal investment: an AI tutor voice and style that will carry the plan. The AI tutor feature itself is unverified for EWA (see Notes).
**Headline A:** Pick your AI tutor
**Headline B:** Who should coach you?
**Body A:** Same lessons, different style. Change anytime.
**Body B:** These are AI voices, not real people.
**Options:**
- 🦊 Fox · Friendly and patient
- 🦉 Owl · Precise and calm
- ⚡ Spark · Upbeat and quick
**Field:** Single-select of three avatar cards (name, one style line, a "Preview" voice line that plays a short English greeting with the browser voice). Default Fox.
**Visual:** Three vertical cards with avatar, style line and a small play button; selected card gets an accent border.
**Microcopy:** "AI voices, not real people."
**CTA:** Continue

### 14. Minutes per day
**Purpose:** The pacing input; the plan length in #18 is computed from it.
**Headline A:** How much time per day?
**Headline B:** Your daily speaking time?
**Body A:** A few minutes aloud beat one long session.
**Body B:** Be realistic. You can change it anytime.
**Options:**
- ☕ 5 min · Casual
- 🚶 10 min · Steady
- 🏃 15 min · Serious
- 🔥 20+ min · Intense
**Field:** Single-select, 10 min suggested.
**Visual:** Four pills with a clock icon that fills to match the minutes.
**Microcopy:** Progress hint: "Step 3 of 3"
**CTA:** Continue

---

## E. Anticipation

### 15. Building the plan (loading)
**Purpose:** Makes the plan feel built from the answers, in the highest-attention moment before the gate.
**Headline A:** Building {{name}}'s speaking plan…
**Headline B:** Tuning {{tutor}} for {{name}}…
**Steps:** (4 progress rows, each with % counter, checkmark and bar)
- Setting up {{situation}} practice…
- Matching it to your level…
- Pacing it to your minutes daily…
- Almost ready, your plan is waiting…
**Visual:** Mic orb with orbiting word chips and the tutor avatar; four progress rows; nothing else (no review block while reviews are unset).
**Microcopy:** One optional overlay at about 50%: "Want a 7-day speaking streak challenge?" with "Yes, I'm in" / "No thanks"; neither button adds anything paid.
**CTA:** (auto-advances, ~6-8 seconds)

---

## F. Gate

### 16. Email
**Purpose:** Captures identity before the result; on web it is also the app login that links the purchase.
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

## G. Reveal

### 17. Your speaking level
**Purpose:** The result: a CEFR speaking estimate, a pronunciation tip and the situation they picked. The card is titled "Your pronunciation note" only when a word was actually missed in a scored mic sentence; otherwise "Tip for the trickiest word in this sentence", with "You typed this, so we can't judge sound" in typed mode.
**Headline A:** Your speaking level: {{level}}
**Headline B:** You're at {{level}}, {{name}}
**Body A:** One word to polish: {{tip_word}}.
**Body B:** Next up: {{next_level}}, one session at a time.
**Visual:** CEFR strip (A1 to C1) with a marker moving to the estimate; below it a tip card showing the word with its how-to line and a Hear it button (label per the rule above); chips for situation, tutor and minutes. If #11 was skipped the note card is replaced by "Say a sentence in the app to get your first note."
**Microcopy:** Footnote: "Estimate from your self-rating and one sentence. It updates as you practice." Mic mode: "Your sentence matched N of M words."
**CTA:** See my plan

### 18. Plan and goals
**Purpose:** A plan visibly built from their answers, with honest goals, not promised outcomes.
**Headline A:** {{name}}'s path to {{next_level}}
**Headline B:** Your first speaking weeks
**Body A:** Goals set from your answers. Results vary.
**Body B:** Built around {{situation}} and your minutes.
**Visual:** Rising curve from "Today" to "Week N" with goal chips labeled "Goal for week N", derived from level and minutes per day (week 1: speak aloud a few short sentences a day; week 2: practice the {{situation}} phrases; week 3: hold a short back-and-forth with the tutor; last week: re-check your speaking level); summary card: level to next level, tutor, minutes per day.
**Microcopy:** Footnote: "Goals, not guarantees. Week count comes from level and minutes, never a fixed number."
**CTA:** Start my plan

---

## H. Monetization

### 19. Paywall
**Purpose:** The single ask: unlock the speaking plan and unlimited tutor sessions. A web sales page; renewal terms are as visible as the price.
**Headline A:** Start speaking with {{tutor}}
**Headline B:** Unlock {{name}}'s speaking plan
**Body A:** Daily sessions and feedback in one plan.
**Body B:** Cancel anytime. Renewal price shown up front.
**Plans:**
- **1 week** — intro price `{{price_1w}}` today, then `{{renew_1w}}` every week. No badge.
- **4 weeks** — **pre-selected**, "Recommended". `{{price_4w}}` today, then `{{renew_4w}}` every 4 weeks. Each card also shows its per-week equivalent (`{{week_equiv_4w}}`).
- **12 weeks** — "LOWEST PER WEEK". `{{price_12w}}` today, then `{{renew_12w}}` every 12 weeks.
- Renewal sits directly under the intro price at the same size, on every card, in the CTA line and on the receipt. Savings compare only against the real weekly price. No countdown, no ribbon that follows the user through the funnel, no lifetime anchor.
**Visual:** Long-scroll web page: sticky brand bar (EWA name text, mini CTA, close); personalized hero (their level strip, the pronunciation tip with the same label rule, tutor chip, fact chips: level, situation, minutes per day); plan block; "What's inside" (daily speaking sessions, instant feedback with model voice, situation phrase packs, progress check, AI tutor marked verify); "How it works" (3 steps); proof (rating block plus review cards, hidden while tokens); guarantee seal only when a real refund period is configured (hidden while `{{refund_days}}` is a token); FAQ ("How do I cancel?" open, "Is my voice saved?" marked verify); plan block repeated; legal footer; sticky bottom CTA while no plan block is on screen.
**Microcopy:** Disclosure above each CTA, live for the selected plan: "You pay {{price_sel}} today. Renews at {{renew_sel}} every {{period}} until you cancel." Under the CTA: "We'll email you before your first renewal." Trust row: "🔒 Secure payment · Cancel anytime", plus "{{refund_days}}-day money-back" only when a real refund period is set. Disclaimer: "AI tutor voices are not real people."
**Fallback offer:** On close, the last-chance one-time pass (#20), shown once per session.
**CTA:** Start speaking

### 20. Last-chance offer
**Purpose:** One second chance for users who close the paywall: a one-time 7-day speaking pass, paid once, no auto-renew, with a reduced scope. A different and smaller product than the 1-week plan, not a discount on it. Shown once.
**Headline A:** Try a 7-day pass
**Headline B:** Try {{tutor}} for 7 days
**Body A:** Paid once. No subscription.
**Body B:** Daily sessions with feedback, no long plan.
**Plans:** One offer card: **7-day speaking pass**, `{{offer_price}}` paid once, no renewal, no strike-through price. Includes 7 days of speaking sessions with the tutor, instant feedback with a model voice and a receipt by email. Not included (stated on the card): phrase packs, progress checks, the full plan, any renewal. Optional `{{offer_badge}}` only if true.
**Visual:** Same web look as #19: sticky bar with a close, eyebrow "One-time offer · shown once", headline, one orange-bordered offer card holding the level summary, the pass name, price row ("paid once"), three checks, a "Not included" line, CTA, payment badges and a "paid once, nothing to cancel" line; plain decline link.
**Microcopy:** Line under the CTA: "{{offer_price}} paid once for 7 days. No subscription, no auto-renew, nothing to cancel." Shown once per session (sessionStorage `ikf_offer_ewa-speak-ai`); no timer (`CONFIG.offer.expiresMin` is `null`). Decline and close return to #18.
**CTA:** Get the 7-day pass

---

## I. Payoff

### 21. Get the app
**Purpose:** Web buyers who never open the app refund. Get them to install, log in with the same email and finish Day 1.
**Headline A:** You're in, {{name}}!
**Headline B:** Your first session awaits
**Body A:** Get the app and log in with your email.
**Body B:** Your plan and tutor are waiting.
**Visual:** Phone mockup on Day 1 with the tutor avatar and the tip word; store button for the detected OS; three-step list.
**Microcopy:** Steps: "1 · Install the app" / "2 · Log in with {{email}}" / "3 · Start Day 1 with {{tutor}}". Receipt line: "Receipt and cancel link sent to {{email}}."
**CTA:** Get the app

---

## Notes

**Reference funnels (as captured Sept 2026, AdSpyLab, research `ewa-ayahpath.md` §3).** Lola Speak: 1,273 ads, 62 screens, CEFR level and a "Lexical Access Score". Jumpspeak: 1,264 ads, 30 screens, fear-of-speaking angle. The EWA-specific speaking spine is **unverified**: the research marks the AI-tutor flow as inferred. Dark patterns documented, not copied: invented proprietary scores, lifetime "€229 (was €459)" anchor, scratch card, resetting timers, persona experts.

**AI tutor feature (unverify before launch).** EWA's AI tutor and speaking feedback in the app must be confirmed with the product team. The paywall bullet and FAQ item carry "verify". The demo's feedback is browser-side word matching, not a pronunciation model; production must use the real engine and state audio retention truthfully (unverified).

**Mic handling.** Mic is optional on every path: #10 explain screen with "Type instead", #11 typed mode and "Skip this step", denial or missing support switches to typed mode automatically. The funnel never blocks on mic permission. Typed feedback is labelled as not judging sound.

**CEFR estimate rubric (demo).** Base band from self-rating (total beginner A1, basics A2, chat B1, confident B2); if the mic sentence matched under 60% of the words, one band lower (not below A1); if a mic sentence matched every word and the user speaks weekly or more, one band higher up to B2. Typed or skipped adds no adjustment. Plan weeks come from level and minutes, never a fixed number for everyone.

**Blocks skipped:** native-language question (feedback is in English with a short tip; add later if the tip must be translated), goals and deadline screens, gamified wheel, before/after split, post-purchase upsell, gender and age.

**Health/safety.** Fear-of-speaking is framed as a normal skill gap, not an anxiety or medical claim; copy never names a condition. No therapy claims.

**Drop-off risk:** #10 mic permission and #11 speaking aloud (mitigated by typed mode and skip); #16 email before the result.

**Monetization and metrics:** one subscription layer. Measure separately: mic-granted rate (#10), say-it completion (#11), paywall CVR (#19), offer CVR (#20 `offer_view` to `offer_accept`), intro to paid, first-renewal retention at full price, refund rate (guardrail), and activation (install plus login plus Day 1 within 24h). Intro to renewal jumps are category default (EWA 2x); renewal is shown next to every intro price.

**First A/B tests:** (1) mic test before email (this brief) vs. after the level result; (2) fear question first vs. situation first; (3) tutor pick before vs. after the plan.

**Plan goals (unverified):** goals are targets set from level and minutes, not measured outcomes; the content team must confirm the numbers.

**Demo:** private Artifact: https://claude.ai/artifact/MvtMeKzjn66Kakm6oGS9Hr (inlined-image copy; the repo `demo.html` references `img/` through the `IMG` map). Images: no `IKAME_AI_KEY` was set; `tutor-fox` is a copy of the `learning/ewa` tutor still, the owl and spark avatars are emoji stand-ins and `hero-speak` is unused. Run `gen_images.py` and add the new files to the `IMG` map.
