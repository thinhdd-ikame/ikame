---
niche: mygrowth-anatomy
display_name: MyGrowth (Anatomy / Human Body)
archetype: learning-plan
subject: person
input: reason to learn, name, level, 3 quiz answers, body systems of interest, formats, reminder time, daily minutes, email
output: quiz score + matched course (Body Systems 101) + 4-week schedule built from the chosen body systems
screens: 22
monetization: web subscription (3 plans, 1-week intro / 4-week pre-selected / 12-week anchor, renewal shown beside every intro price); one-time single-system pass as last-chance offer; activation (install + sign-in) measured separately
creative_screens:
  hook-a: 1
  hook-b: 2
  quiz: 7
  loading: 16
  reveal: 19
motion: >
  a friendly flat skeleton and heart pulsing in violet, a lesson card flipping
  open on "206 bones", the right answer lighting green with a one-line fact,
  then four weekly body-system tiles lining up on a 4-week schedule
---

# Funnel Content — MyGrowth (Anatomy / Human Body)

Same app and brand as `learning/mygrowth` (MyGrowth, EXTRAMILE LIMITED: 5-15 minute lessons in general-knowledge subjects). This variant sells **one subject, the human body**, to people who are curious about how they work, want to answer their kids' questions, or study it. **References (adspylab, captured 2026-09-28):** MyGrowth `app.mygrowth.one/?cohort=anatomy-bau` (31 screens, 5,233 ads, capture stops at the email gate, **paywall not captured**) and Nibble biology (`nibble-app.com/biology`, 37 steps, offer + upsell). Funnel shape is the registered `learning-plan` archetype: reason + level → three quiz items that each show the right answer and a fact → systems the user wants to learn → format / time / minutes → loader → course match → email → plan → paywall → offer. Deliberately different from the reference: no "300,000+ men under 25" or "1.5M users" proof, no Stanford / Oxford / Cambridge authority strip, no gender or age question, no yes/no "did you know" filler, no promo timer, no scratch card. The quiz is **3 items with real feedback** (the reference runs 3 trivia items and shows "Excellent knowledge!" whatever you answer). **Education, not medical advice:** every lesson is general-knowledge anatomy; the funnel never diagnoses, never answers symptom questions and never recommends treatment, and says so on the hook, a bridge screen, the paywall and the FAQ.

Tokens: `{{name}}`, `{{reason}}`, `{{level}}`, `{{score_line}}`, `{{systems}}`, `{{first_system}}`, `{{course_title}}`, `{{reminder_time}}`, `{{daily_minutes}}`, `{{lessons_4wk}}`, `{{email}}`, `{{price_1w}}`, `{{renewal_1w}}`, `{{price_4w}}`, `{{renewal_4w}}`, `{{price_12w}}`, `{{renewal_12w}}`, `{{offer_price}}`, `{{refund_days}}`, `{{app_rating}}`, `{{rating_count}}`. Unset personal tokens fall back to: name "you", systems "Heart & blood, Skeleton & muscles, Brain & nerves, Digestion", level "Know the basics", daily_minutes 10.

---

## A. Hook

### 1. Hook A — Know your body
**Purpose:** Cold traffic from anatomy / "how your body works" ads sees the exact promise and the time cost before any question.
**Headline A:** Know your body in 5 minutes
**Headline B:** Your body, explained simply
**Body A:** Bite-sized lessons on bones, heart, brain and more.
**Body B:** Short lessons you can read or listen to.
**Visual:** White background, MyGrowth logo top-left, rating strip. Friendly flat illustration of a skeleton and heart on a lavender card with a "206 bones" chip, last headline word in violet, violet CTA pinned bottom.
**Microcopy:** Rating strip: "★ {{app_rating}} · {{rating_count}} App Store ratings" (tokens until the real store rating and count are confirmed; the strip hides while they are tokens; never a geo-injected "Top app in {country}"). Under the card: "General-knowledge anatomy. Not medical advice."
**CTA:** Start my quiz

### 2. Hook B — Learning, made fun
**Purpose:** Shows what a lesson actually feels like (real app footage) and sets the ease expectation.
**Headline A:** Anatomy, without the textbook
**Headline B:** Learn how you work
**Body A:** Short lessons, quizzes and quick facts.
**Body B:** Five minutes a day is enough to start.
**Visual:** Lavender panel, small phone loop cycling three real app screens: a lesson card, the audio player, a quiz round. Mock screens until real app footage exists.
**Microcopy:** Under CTA: "Takes about 2 minutes"
**CTA:** Continue

---

## B. Investment

### 3. Reason
**Purpose:** The motive tap. It picks the framing of the plan and the tone of the first lessons; kids' questions and study motives get different examples.
**Headline A:** Why learn about your body?
**Headline B:** What brings you here?
**Body A:** We'll shape your first lessons around it.
**Body B:** Pick the closest one.
**Options:**
- 🤔 Curious how I work
- 🍎 Understand my body better
- 🧒 Answer my kids' questions
- 🎓 Study or exams
- ✏️ Other
**Field:** Single-select, auto-advance except Other, which opens a one-line input (CTA disabled until filled).
**Visual:** Stacked white pills with grey border, selected pill fills violet, thin progress bar on top.
**Microcopy:** Other placeholder: "e.g. First-aid course"
**CTA:** (auto-advances on select)

### 4. Name
**Purpose:** Gets `{{name}}` for the plan, loader and paywall.
**Headline A:** What should we call you?
**Headline B:** What's your first name?
**Body A:** We'll put it on your plan.
**Body B:** First name is all we need.
**Field:** Text input, placeholder "First name", max 30 chars, autofocus.
**Visual:** Plain white input with violet focus ring, minimal chrome.
**Error state:** "Please enter a name to continue"
**CTA:** Continue

### 5. Starting level
**Purpose:** Sets lesson difficulty and makes a beginner feel welcome before the quiz.
**Headline A:** How much do you know already?
**Headline B:** Where are you starting from?
**Body A:** No wrong answer; we'll set your level.
**Body B:** Beginners welcome, we start from zero if needed.
**Options:**
- 🌱 Total beginner
- 📘 Know the basics
- 🎓 Pretty confident
**Field:** Single-select, auto-advance. Closed range, no Other.
**Visual:** Three pills with a 1/2/3-bar level icon on the right.
**CTA:** (auto-advances on select)

### 6. Bridge — Learn it, don't diagnose it
**Purpose:** The expectation screen. It says what the lessons are (general anatomy education) and what they are not, before any quiz about the body.
**Headline A:** Learning, not medical advice
**Headline B:** Lessons teach, doctors treat
**Body A:** Lessons explain how the body works, nothing more.
**Body B:** For health concerns, talk to a qualified professional.
**Visual:** Lavender card with a simple book-and-body icon and a small 🩺 chip labelled "Ask a professional for health questions". Calm, no alarm colours.
**Microcopy:** Progress hint: "Step 1 of 3 done"
**CTA:** Got it

### 7. Quiz 1 — Bones
**Purpose:** The product demo. One real question, then the real answer and a one-line fact, so the user feels a micro-lesson. Right answer turns green, a wrong pick turns amber (never red).
**Headline A:** How many bones in an adult?
**Headline B:** Quick check, {{name}}
**Body A:** Tap your best guess; no pressure.
**Body B:** How many bones in an adult?
**Options:**
- 106
- 206
- 306
**Field:** Single-select; CTA appears only after the fact card lands. Answer: 206.
**Visual:** Top half: flat skeleton illustration on a lavender card. Three pills beneath. After a tap, a lavender fact card slides up with a 💡 icon.
**Microcopy:** Fact card: "Adults have 206. Babies are born with about 300 that fuse as they grow." Feedback label: right = "✅ Nailed it" / wrong = "💡 Here's the story"
**CTA:** Next question

### 8. Quiz 2 — Biggest organ
**Purpose:** Second fact; the answer is surprising on purpose, which is what makes lessons feel worth a daily slot.
**Headline A:** Your largest organ is…
**Headline B:** One more, {{name}}
**Body A:** Think bigger than the heart.
**Body B:** Your largest organ is…
**Options:**
- 🫀 Heart
- 🧴 Skin
- 🫁 Lungs
**Field:** Same as #7. Answer: Skin.
**Visual:** Same layout as #7, flat illustration of layered skin on a peach card.
**Microcopy:** Fact card: "Skin is your largest organ, roughly two square metres on an adult." Same feedback labels as #7.
**CTA:** Next question

### 9. Quiz 3 — Body water
**Purpose:** Third and last item (cap trivia at three); gives the result bridge a real score out of 3.
**Headline A:** How much of you is water?
**Headline B:** Last one, {{name}}
**Body A:** Roughly, for a typical adult.
**Body B:** How much of you is water?
**Options:**
- 💧 About 30%
- 💧 About 60%
- 💧 About 90%
**Field:** Same as #7. Answer: about 60%.
**Visual:** Same layout as #7, flat water-drop and body-silhouette illustration on a blue card.
**Microcopy:** Fact card: "Adults are roughly 50-60% water, a little less in older age." Same feedback labels as #7.
**CTA:** See my result

### 10. Result bridge (computed from #7-9)
**Purpose:** Honest score, then the lesson ("that's what every lesson feels like"). Praise follows the answers; there is no "Excellent!" for 0/3.
**Headline A:** {{score_line}} (band table below)
**Headline B:** You just learned three facts
**Body A:** That's how every lesson feels: quick and surprising.
**Body B:** Now imagine that, a few minutes every day.
**Visual:** The three fact cards stacked like flashcards, each with its ✅ or 💡 icon; light confetti only on 3/3.
**Microcopy:** Score bands: 3/3 → "Three for three, {{name}}!" · 2/3 → "Two right, one new fact" · 1/3 → "One right, two new facts" · 0/3 → "Three new facts, zero effort". Progress hint: "Step 2 of 3 done"
**CTA:** Keep going

### 11. Body systems
**Purpose:** The answer that builds the plan: each pick becomes a week of the 4-week schedule (#19). Multi-select; up to four are scheduled, in the order picked.
**Headline A:** Which systems to learn first?
**Headline B:** What do you want to explore?
**Body A:** Pick all that interest you.
**Body B:** We'll build your weeks from these.
**Options:**
- 🦴 Skeleton & muscles
- ❤️ Heart & blood
- 🧠 Brain & nerves
- 🫁 Lungs & breathing
- 🍽️ Digestion
- 🛡️ Immune system
- ✏️ Other
**Field:** Multi-select grid, ≥1 required (CTA disabled until a pick; Other counts only when filled). Other opens a one-line input.
**Visual:** 2-column grid of illustrated system cards, violet border + check on select, Other as a full-width pill below.
**Microcopy:** Disabled-CTA hint: "Pick at least one to continue". Other placeholder: "e.g. Eyes, skin"
**CTA:** Continue

### 12. Format
**Purpose:** Sets which formats the plan leads with. Every option is a format the app ships.
**Headline A:** How do you like to learn?
**Headline B:** Read, listen, or quiz?
**Body A:** Pick all you enjoy; lessons come in each.
**Body B:** Every lesson works as text or audio.
**Options:**
- 📖 Reading
- 🎧 Listening
- 🧩 Quizzes
- ✏️ Other
**Field:** Multi-select, ≥1 required. Other opens a one-line input.
**Visual:** Large icon cards stacked, check circle on the right; Other pill below.
**CTA:** Continue

### 13. Reminder time
**Purpose:** Anchors the habit to a time of day and sets the in-app reminder slot (web funnel, so no push permission yet).
**Headline A:** When will you learn?
**Headline B:** Pick your learning time
**Body A:** We'll remind you then, inside the app.
**Body B:** Pick a moment you already have daily.
**Options:**
- ☕ Morning · 08:00
- 🍱 Lunch · 12:30
- 🌆 After work · 18:30
- 🌙 Evening · 21:00
- ✏️ Other time
**Field:** Single-select. Sets `{{reminder_time}}`. Other opens a time picker (CTA disabled until a time is set).
**Visual:** Pills with the clock time at the right of each.
**Microcopy:** Under options: "Reminder shows inside the app, not as a push yet."
**CTA:** Continue

### 14. Daily minutes
**Purpose:** The commitment tap; it sets `{{daily_minutes}}` and makes the schedule a calculation.
**Headline A:** Set your daily goal
**Headline B:** How much time per day?
**Body A:** A clear target keeps you going.
**Body B:** You can change it anytime in the app.
**Options:**
- 👍 Casual · 5 min/day
- 👌 Regular · 10 min/day
- 🤘 Serious · 15 min/day
- 💪 Determined · 20 min/day
**Field:** Single-select, nothing pre-selected.
**Visual:** Four wide cards, minutes in a small grey line under each label, selected card fills violet.
**Microcopy:** Under options: "Most lessons take 5-15 minutes."
**CTA:** Set my goal

---

## C. Trust

### 15. Social proof
**Purpose:** Trust beat after the longest run of taps, right before the loader. Rating-free copy until a real store rating is confirmed.
**Headline A:** Made for curious people
**Headline B:** Lessons that fit your day
**Body A:** Short lessons you can finish over coffee.
**Body B:** Lessons short enough to finish over coffee.
**Visual:** App Store + Google Play badges beneath; when `{{app_rating}}` / `{{rating_count}}` are real, a huge rating with star row and laurel is added above and the headline becomes "Rated {{app_rating}} on the App Store". No review quote until real, reusable store reviews are supplied.
**Microcopy:** Numbers come from `CONFIG.rating` (`{{app_rating}}` / `{{rating_count}}` until confirmed); the rating block and every rating strip hide while they are tokens. No "300,000+ learners" or "1.5M users" unless internal data confirms them.
**CTA:** Continue

---

## D. Anticipation

### 16. Building the plan (loading)
**Purpose:** Makes the plan feel assembled from the answers; rotating real anatomy facts are the wait-time reward.
**Headline A:** Building {{name}}'s body plan…
**Headline B:** Picking {{name}}'s first lessons…
**Steps:**
- Setting your starting level…
- Lining up your body systems…
- Fitting lessons to {{daily_minutes}}-minute days…
- Almost ready, your plan awaits…
**Visual:** Top half: flat skeleton and heart cards shuffling into a stack. Four progress rows beneath. Fact carousel at the bottom with a "Did you know?" label.
**Microcopy:** Facts: "Your heart beats about 100,000 times a day." · "You have over 600 muscles." · "Your brain uses about 20% of your energy."
**CTA:** (auto-advances, ~6 seconds)

### 17. Course match (tease)
**Purpose:** Shows which course they got, before the gate, with the lesson list locked. Desire before email.
**Headline A:** This course fits you best
**Headline B:** {{name}}, meet your first course
**Body A:** Picked from your answers about the body.
**Body B:** Chosen for your goals and {{daily_minutes}}-minute days.
**Visual:** Big course cover card ("Body Systems 101", lesson count, level chip from #5), small "BASED ON YOUR ANSWERS" eyebrow, lesson list below blurred with a lock icon, the user's chosen systems as chips.
**Microcopy:** "Body Systems 101" is a working title: unverified, confirm the course exists in the catalogue (the verified biology course is "Discover the Science of Life and Yourself").
**CTA:** Get my plan

---

## E. Gate

### 18. Email
**Purpose:** Web checkout needs an identity that later unlocks the app; asked at peak curiosity, between the course tease and the plan.
**Headline A:** Where should we send it?
**Headline B:** Save your plan, {{name}}
**Body A:** Your email unlocks your plan in the app.
**Body B:** You'll sign in with this email later.
**Field:** Email input (email keyboard, autofocus), "Continue with Apple" / "Continue with Google" above. Separate **unchecked** marketing checkbox.
**Visual:** Blurred 4-week schedule silhouette behind a white sheet holding the field.
**Error states:** "Please enter a valid email address" / "This email already has a plan. Check your inbox."
**Microcopy:** Under CTA: "Used only for your account. No spam." + Terms · Privacy links.
**CTA:** Show my plan

---

## D. Reveal

### 19. Your 4-week plan
**Purpose:** The reveal: quiz score, matched course and a dated schedule built from the user's own systems and minutes, so the paywall reads as "start this".
**Headline A:** {{name}}'s 4-week body plan
**Headline B:** Your plan is ready
**Body A:** Body Systems 101, built around your picks.
**Body B:** {{lessons_4wk}} lessons, {{daily_minutes}} minutes each.
**Visual:** Top: score chip ("Quiz 2/3") and course chip. Four week rows, each tile named after one chosen system (Week 1 = first pick; the user's level adds a short "big picture" warm-up to Week 1 for total beginners), 5 lesson dots per week. Chips: Level · Format · Reminder `{{reminder_time}}`. Footer line: "20 lessons · X hours in 4 weeks".
**Microcopy:** `lessons_4wk` is a goal: 5 lessons a week × 4 = 20, each `{{daily_minutes}}` minutes. Labelled "Your goal", never a promised outcome. If fewer than four systems are picked, the remaining weeks are filled from the default order (Heart & blood, Skeleton & muscles, Brain & nerves, Digestion).
**CTA:** Start my plan

---

## F. Monetization

### 20. Paywall
**Purpose:** Long-scroll web sales page. Intro and renewal prices sit side by side on every plan; no struck-through "reference" prices, no timer. Final prices are the growth team's call, so the page shows tokens.
**Headline A:** {{name}}, start your plan today
**Headline B:** Your body plan is ready
**Body A:** Every price and renewal shown before you pay.
**Body B:** Lessons, audio and quizzes, all included.
**Plans:** (structure only, prices are tokens)
- **1-week plan** intro `{{price_1w}}`, then `{{renewal_1w}}` per week.
- **4-week plan**: **pre-selected**, intro `{{price_4w}}`, then `{{renewal_4w}}` every 4 weeks. Matches the 4-week schedule length.
- **12-week plan**: anchor, intro `{{price_12w}}`, then `{{renewal_12w}}` every 12 weeks.
- Plans are named by the period they bill. No fake "was" price, no "MOST POPULAR" unless sales data backs it.
**Page structure (top to bottom):** brand bar (logo + close ✕) · personal hero (course cover "Body Systems 101", chosen systems, `{{reminder_time}}` · `{{daily_minutes}}` min/day) · plan block · what's inside · how it works (3 steps) · proof (store rating; review cards only when real ones exist) · guarantee (only when `{{refund_days}}` is set) · FAQ · plan block repeated · sticky CTA.
**Visual:** Same web look as the rest of the funnel. Radio plan cards, violet border on the selected one, payment-method row (Apple Pay / PayPal / card), safe-checkout badges. No countdown bar.
**Microcopy:**
- Line above the sticky CTA: "{{price_4w}} today. Then {{renewal_4w}} every 4 weeks until you cancel." (follows the selected plan)
- Trust row: "🔒 Secure checkout · Cancel online anytime" (money-back appears only when `{{refund_days}}` is set)
- What's inside (shipped features only): "5-15 minute lessons, 6 subjects" · "Read or listen to every lesson" · "Quizzes and quick facts" · "Streaks and achievements" · "In-app reminder at {{reminder_time}}"
- How it works: 1 "Pick your plan" · 2 "Sign in with {{email}}" · 3 "Start week 1: {{first_system}}"
- FAQ: "How do I cancel?" → "Profile → Settings → Manage subscription, or the link in your receipt." · "Will it renew?" → "Yes, at the renewal price shown, until you cancel. We email you before every renewal." · "Is this medical advice?" → "No. Lessons are general anatomy education. For health concerns, ask a qualified professional."
- Under FAQ: "Education only. Not medical advice."
**Fallback offer:** On close, the last-chance offer (#21) once per session. No timer.
**CTA:** Start my plan

### 21. Last-chance offer (on close)
**Purpose:** Second chance for users who close the page without paying: a smaller, different product, a one-time pass for only the first system they picked, not a cheaper copy of a subscription tier. Shown once per session, then never again.
**Headline A:** Wait, {{name}}: just start with one
**Headline B:** Try one system, no subscription
**Body A:** Get your first system as a one-time pass.
**Body B:** Pay once. No renewal, no subscription.
**Plans:** One offer card: **Single-system pass** for `{{first_system}}`, `{{offer_price}}` one-time, no auto-renewal. Lessons for that one system only, not the other weeks of the plan. No struck-through price.
**Visual:** Same web look as #20: bar with logo and ✕, eyebrow "One-time offer · shown once", one violet-bordered card with the system's tile, 3 checks scoped to one system ("Every lesson on {{first_system}}", "Read or listen to each lesson", "Quiz after each lesson"), store-agnostic checkout button, text link "No thanks, back to my plan".
**Microcopy:** "{{offer_price}} once. No subscription, no renewal." Shown once (sessionStorage `ikf_offer_mygrowth-anatomy`); `CONFIG.offer.expiresMin` is `null`, no timer. Unverified: whether a single-system pass exists as a product; if not, swap for the store-app trial and rewrite the benefits to match.
**CTA:** Get this system

---

## G. Payoff

### 22. Get the app
**Purpose:** Web buyers who never sign in refund; the first job after paying is lesson 1 with the same email.
**Headline A:** You're in, {{name}}!
**Headline B:** Last step: open the app
**Body A:** Get the app and sign in with {{email}}.
**Body B:** Your first body system is waiting inside.
**Visual:** Green check over the logo, 3 numbered steps (Download · Tap the sign-in link we emailed · Start lesson 1), store badges, QR for desktop, phone mockup of lesson 1 of `{{first_system}}`.
**Microcopy:** "Receipt sent to {{email}}" · "Your {{reminder_time}} reminder turns on in the app." · "Manage or cancel anytime in Profile → Settings."
**CTA:** Open the app

---

## Notes

- **Unverified:** the capture of the anatomy cohort stops at the email gate (research §1), so the paywall, offer and post-email screens are not observed; this brief borrows the sibling MyGrowth paywall *structure* only. "Body Systems 101", the 3 quiz items, the per-system weekly schedule and the single-system pass are this brief's own design. The 1-week / 4-week / 12-week ladder mirrors the repo's learning funnels, not MyGrowth's live 4/12/26-week Stripe plans; prices are tokens.
- **Dropped competitor mechanics (reference only):** "300,000+ men under 25" and "1.5M users" proof, university authority strip (Stanford / Oxford / Cambridge), 10-minute promo timer, scratch card, "950+ started today" ticker, email-only cancellation, conditional money-back disclosed only in Terms, gender / age questions that change nothing, "Excellent knowledge!" shown whatever was answered, 3 yes/no "did you know" cards.
- **Honesty guardrails:** quiz feedback follows the answer; the 4-week schedule is a goal derived from systems and minutes; no outcome promise, no income or grade claim; no symptom, diagnosis or treatment content; "not medical advice" on #1 microcopy, #6, #20 FAQ and the line under it. Money-back is hidden until `{{refund_days}}` is real.
- **Blocks skipped:** no gamified wheel (the quiz is the reward), no notification opt-in (web funnel; #13 sets the in-app slot), no password (magic link at the handoff).
- **Drop-off risks:** #4 name (first typing) and #18 email.
- **Measure:** quiz completion by screen, #19 to #20 reach, paywall conversion per plan, offer accept rate, activation (install + sign-in + first lesson within 48 h), first-renewal retention at full price, refund rate.
- **First A/B tests:** (1) hook "Know your body in 5 minutes" vs "Anatomy, without the textbook" (#1 Headline A vs #2 Headline A as hook); (2) email gate before #19 (as written) vs after; (3) pre-select the 4-week plan vs the 1-week plan, judged on refund-adjusted revenue.
- **Verify before launch:** course title and catalogue, current store rating and count (tokens until then), the "6 subjects" and "Streaks and achievements" claims in the paywall copy, whether a single-system pass can be sold, guarantee terms and `{{refund_days}}`, and a qualified review of the anatomy facts in #7-9 and #16.
- **Demo (private Artifact):** https://claude.ai/artifact/DZZzdXVTTFx7FSa5wR3zjG
