---
niche: mygrowth
display_name: MyGrowth (Daily Micro-Learning)
archetype: learning-plan
subject: person
input: subject pick, goals, level, 2 knowledge-check answers, learning style, schedule, daily minutes, email
output: personalized 4-week micro-learning plan (matched course + daily lesson target + reminder slot)
screens: 26
monetization: web subscription (3 intro-priced plans, renewal price shown on every card) + optional recurring add-on after purchase; activation (install + sign-in) measured separately
creative_screens:
  hook-a: 1
  hook-b: 2
  quiz: 10
  loading: 19
  reveal: 22
motion: >
  a lesson card flipping open on a Berlin Wall illustration, the right answer
  lighting up green with a one-line fact sliding in, then a violet 4-week plan
  line climbing to a goal flag
---

# Funnel Content — MyGrowth (Daily Micro-Learning)

MyGrowth (EXTRAMILE LIMITED, Cyprus) sells short daily lessons you can read or listen to, 5-15 minutes each, in general-knowledge subjects. The subjects are History, Biology, Math, Art and Communication, and Psychology according to one third-party review. Lessons come with quizzes, animations, mini-games (Match It, True or False, Spot the Fake), streaks and achievements, in 12 languages. **Correction to the brief:** the verified catalogue is *general knowledge*, not "psychology / productivity / habits". Psychology & habits is written here as one subject among six, and its course should be confirmed before launch. The user gives a subject, goals, level, schedule and daily minutes, and gets a 4-week plan with a matched course. The flow is modeled on **MyGrowth's own live web funnel** (`quiz.mygrowth.one`, Web2Wave, Meta/Pinterest pixels). Its full 37-screen config and paywall were read directly on 2026-09-28. That funnel is: history-led hook → 20+ questions (including trivia) → plan loader → course match → email → plan graph → Stripe paywall → recurring add-on upsell → app deep link. This brief keeps that shape and cuts it from 37 to 26 screens. It fixes the dishonest parts: praise that ignores your answers, the fake "Top app in {country}" line, the masked-email ticker, a 10-minute timer that resets, email-only cancellation, and plan names that don't match the billing period. It adds what the real funnel lacks, which is **instant, honest feedback on the knowledge-check questions**, so the quiz doubles as a 30-second sample lesson. The shape doesn't fit an existing archetype cleanly, so it's filed as a proposed new one, **learning-plan** (see the report). Headway, Imprint and Coursiv were not torn down for this file. **Look:** follows the real funnel, not the repo's dark default. White background, lavender panels `#EBE9F7`, violet gradient `#8488F4 → #7D73E3` on CTAs and selected pills, blue `#007BFF` chart line, orange `#FF9F00` highlight dot, friendly flat illustrations. The copy rules apply throughout: headline ≤6 words, body ≤12 words, A/B on every screen.

Tokens: `{{name}}`, `{{ad_subject}}` (from the ad set's URL param, default `history`), `{{subject}}`, `{{course_title}}`, `{{score}}`, `{{daily_minutes}}`, `{{lessons_4wk}}`, `{{reminder_time}}`, `{{email}}`, `{{intro_price}}`, `{{renewal_price}}`, `{{period}}`, `{{addon_price}}`, `{{portal_link}}`.

---

## A. Hook

### 1. Hook A — Subject-led promise
**Purpose:** Cold Meta traffic arrives from a subject-specific ad (the live funnel runs History), so the first screen names that subject and appeals to identity before asking anything.
**Headline A:** Smart people know {{ad_subject}}
**Headline B:** Know the stories that shaped us
**Body A:** Learn in 15 minutes a day, anywhere.
**Body B:** Bite-sized lessons you can read or hear.
**Visual:** White background, MyGrowth logo top-left, rounded card with a flat illustration matched to `{{ad_subject}}` (three historical leaders for History), last headline word in violet, full-width violet gradient CTA pinned bottom.
**Microcopy:** Rating strip under the logo: "★ 4.5 · 2,400+ App Store ratings" (re-check the live number at launch; never the "4.9 · Top app in {country}" line the real funnel fills in from the visitor's IP).
**CTA:** Start my quiz

### 2. Hook B — Learning, fun again
**Purpose:** Answer the "school was boring" objection and set the ease expectation, using real app footage because store reviewers complain the ads promised more than the app has.
**Headline A:** Learning, fun again
**Headline B:** Swap scrolling for learning
**Body A:** Short lessons, quizzes and games, no lectures.
**Body B:** Fifteen minutes beats an hour of doom-scrolling.
**Visual:** Phone frame looping real screens: a lesson card, the audio player, one round of "True or False". Lavender panel behind the phone.
**Microcopy:** Under CTA: "Takes about 2 minutes"
**CTA:** Continue

---

## B. Investment

### 3. Age
**Purpose:** Cheapest possible first tap; sets example choice and starting tone. Not a gate (the app is rated 4+).
**Headline A:** How old are you?
**Headline B:** What's your age group?
**Body A:** We match examples to your stage of life.
**Body B:** Helps us pick the right starting point.
**Options:**
- 🎓 18-24
- 💼 25-34
- 🏡 35-44
- 🌿 45-54
- 🌅 55+
**Field:** Single-select, auto-advance. Closed range, no Other.
**Visual:** Thin violet progress bar top, stacked white pills with grey border, selected pill fills violet.
**CTA:** (auto-advances on select)

### 4. Subject
**Purpose:** The answer that picks the course, the knowledge-check set (#10-11), the paywall cover and the ad-to-funnel match. Pre-highlighted from the ad set.
**Headline A:** What do you want to learn?
**Headline B:** Pick your first subject
**Body A:** Start with one, switch subjects anytime.
**Body B:** Your plan starts here; change it whenever.
**Options:**
- 🏛️ History
- 🧬 Biology
- 🧠 Psychology & habits
- 💬 Communication
- ➗ Everyday math
- 🎨 Art
- ✏️ Other
**Field:** Single-select, `{{ad_subject}}` pre-highlighted. "Other" opens a one-line input and routes to a mixed plan.
**Visual:** 2-column grid of illustrated subject cards, violet border + check on select, Other as a full-width pill below.
**Microcopy:** Other placeholder: "e.g. Space, economics"
**CTA:** Continue

### 5. Goals
**Purpose:** Multi-select motive; drives plan framing and the paywall "what you get" order.
**Headline A:** Why do you want to learn?
**Headline B:** What's your learning goal?
**Body A:** Pick all that apply.
**Body B:** Select as many as fit.
**Options:**
- 🧐 Think more critically
- 🔍 Feed my curiosity
- 📵 Replace social media
- 🚀 Grow my career
- 🗣️ Better conversations
- ✏️ Other
**Field:** Multi-select, CTA disabled until ≥1 pick.
**Visual:** Stacked pills with right-side check circles.
**Microcopy:** Disabled-CTA hint: "Pick at least one to continue"
**CTA:** Continue

### 6. Bridge — Your goals shape your plan
**Purpose:** Says out loud that the answers build something, and sets a finish line (the 4-week plan). Replaces the live "Our goal is to help you achieve yours!" (a 40-word subtitle).
**Headline A:** Your goals shape your plan
**Headline B:** We build it around you
**Body A:** A few more questions, then your 4-week plan.
**Body B:** Every answer tunes what you learn first.
**Visual:** Flat illustration of a winding path with four week-markers and a flag at week 4, on a lavender panel.
**Microcopy:** Progress hint: "Step 1 of 3 done"
**CTA:** Continue

### 7. Name
**Purpose:** Gets `{{name}}` for the plan, loader and paywall. The live funnel never asks, so this is new.
**Headline A:** What should we call you?
**Headline B:** What's your first name?
**Body A:** We'll put it on your plan.
**Body B:** First name is all we need.
**Field:** Text input, placeholder "First name", max 30 chars, autofocus.
**Visual:** Plain white input with violet focus ring, minimal chrome.
**Error state:** "Please enter a name to continue"
**CTA:** Continue

### 8. Interests within the subject
**Purpose:** Picks the first lessons inside the course; options switch with the #4 subject.
**Headline A:** {{name}}, what grabs you most?
**Headline B:** Which topics sound fun?
**Body A:** We'll open your plan with these.
**Body B:** Pick all that spark your curiosity.
**Options:** (per subject, multi-select, always ending in ✏️ Other)
| Subject | Options |
|---|---|
| History | ⚔️ War & peace · 👑 Great leaders · 🏺 Ancient worlds · 🔭 Big discoveries |
| Biology | 🧬 DNA & cells · 🫀 How bodies work · 🦠 Microbes · 🌍 Ecosystems |
| Psychology & habits | 🔁 Building habits · 😤 Emotions & stress · 🧲 How we decide · 💞 Relationships |
| Communication | 🙋 Body language · 👂 Active listening · 🎯 Persuasion · 📖 Storytelling |
| Everyday math | 💵 Money & bills · 🧩 Logic puzzles · 📊 Stats in news · 🧠 Mental math |
| Art | 🖼️ Famous masterpieces · 🎨 Color psychology · 🖌️ Artists' lives · 🏛️ Art movements |
**Field:** Multi-select, ≥1 required. Other opens a one-line input.
**Visual:** Stacked pills, small subject illustration pinned top-right.
**CTA:** Continue

### 9. Starting level
**Purpose:** Sets lesson difficulty, and makes a beginner feel welcome before the knowledge check.
**Headline A:** How much do you know already?
**Headline B:** Where are you starting from?
**Body A:** No wrong answer; we'll set your level.
**Body B:** Beginners welcome, we start from zero if needed.
**Options:**
- 🌱 Total beginner
- 📘 Know the basics
- 🎓 Pretty confident
**Field:** Single-select, auto-advance.
**Visual:** Three pills with a small level-bar icon (1/2/3 bars) on the right.
**CTA:** (auto-advances on select)

### 10. Knowledge check 1 — sample lesson
**Purpose:** The product demo. One real question, then the actual answer and a one-line fact, so the user *feels* a micro-lesson. The live funnel asks trivia but never reveals the answer.
**Headline A:** {{q1}} (question from the set below)
**Headline B:** Quick check, {{name}}
**Body A:** Tap your best guess; no pressure.
**Body B:** {{q1}}
**Options:** (3 per set; after a tap the right answer turns green, a wrong pick turns amber, never red)
| Subject | Q1 (headline) | Options | Answer | Fact card |
|---|---|---|---|---|
| History | When did the Berlin Wall fall? | 1961 · 1989 · 1999 | 1989 | Nov 9, 1989: a fumbled press briefing opened the border. |
| Biology | How many cells make you? | 37 million · 37 billion · 37 trillion | 37 trillion | About 37 trillion, and most are red blood cells. |
| Psychology & habits | How long to form a habit? | 21 days · 66 days · 1 year | 66 days | One study found 66 days on average, not 21. |
| Communication | Is 93% of talk nonverbal? | ✅ True · ❌ Myth | Myth | Myth: that study measured feelings, not everyday speech. |
| Everyday math | What's a 15% tip on $40? | $4 · $6 · $8 | $6 | Take 10% ($4), then add half of it ($2). |
| Art | Who painted The Starry Night? | Monet · Van Gogh · Picasso | Van Gogh | Painted in 1889 from his window at Saint-Rémy. |
**Field:** Single-select; CTA appears only after the fact card lands.
**Visual:** Subject illustration fills the top half (Berlin Wall with crowd for History). Three pills beneath. After a tap, a lavender fact card slides up from the bottom with a 💡 icon.
**Microcopy:** Feedback label on the fact card: right = "✅ Nailed it" / wrong = "💡 Here's the story"
**CTA:** Next question

### 11. Knowledge check 2 — sample lesson
**Purpose:** Second fact locks in "I learned something in 30 seconds"; gives the #12 bridge a real score.
**Headline A:** {{q2}}
**Headline B:** One more, {{name}}
**Body A:** Last one before your plan.
**Body B:** {{q2}}
**Options:**
| Subject | Q2 (headline) | Options | Answer | Fact card |
|---|---|---|---|---|
| History | Who said "I know nothing"? | Pythagoras · Aristotle · Socrates | Socrates | Socrates, via his student Plato: wisdom starts with doubt. |
| Biology | Which organ can regrow itself? | Heart · Liver · Brain | Liver | Your liver regrows even after surgeons remove over half. |
| Psychology & habits | Why do unfinished tasks nag? | Zeigarnik effect · Placebo effect · Halo effect | Zeigarnik effect | Unfinished tasks tend to stick in memory: the Zeigarnik effect. |
| Communication | Best way to show you're listening? | Nod a lot · Say it back · Give advice | Say it back | Paraphrasing shows you understood, so people feel heard. |
| Everyday math | Double 1¢ daily for 30 days? | About $10 · About $5,000 · Over $5 million | Over $5 million | Day 30 alone pays $5.37 million: that's compounding. |
| Art | How big is the Mona Lisa? | Poster-size · Door-size · Wall-size | Poster-size | Just 77 × 53 cm, smaller than most visitors expect. |
**Field:** Same as #10. History Q2 shows the quote in a card above the options.
**Visual:** Same layout as #10, second illustration (Socrates bust for History).
**Microcopy:** Same feedback labels as #10.
**CTA:** See my result

### 12. Result bridge (computed from #10-11)
**Purpose:** Honest score, then the lesson ("that's what every lesson feels like"). Replaces the live funnel's "Great job! / Excellent knowledge!", which it shows no matter what was answered.
**Headline A:** {{score_line}} (band table below)
**Headline B:** You just learned two facts
**Body A:** That's how every lesson feels: quick and surprising.
**Body B:** Now imagine that, fifteen minutes every day.
**Visual:** The two fact cards stacked like flashcards, each with its ✅ or 💡 icon; light confetti only on 2/2.
**Microcopy:** Score bands: 2/2 → "Two for two, {{name}}!" · 1/2 → "One right, one new fact" · 0/2 → "Two new facts, zero effort". Progress hint: "Step 2 of 3 done"
**CTA:** Keep going

### 13. Learning style
**Purpose:** Sets which formats the plan leads with. Every option is a format the app actually ships.
**Headline A:** How do you like to learn?
**Headline B:** Read, listen, or play?
**Body A:** Pick all you enjoy; lessons come in each.
**Body B:** Every lesson works as text or audio.
**Options:**
- 📖 Reading
- 🎧 Listening
- 🎬 Short animations
- 🎮 Games & quizzes
- ✏️ Other
**Field:** Multi-select, ≥1 required.
**Visual:** 2×2 grid of icon cards plus Other pill; the Games card shows a tiny "True or False" chip.
**CTA:** Continue

### 14. Motivation statement
**Purpose:** One Likert statement (the live funnel runs three) that sets reminder intensity and whether streak nudges are on by default.
**Headline A:** Does this sound like you?
**Headline B:** Be honest: relatable?
**Body A:** "I start strong, then lose motivation."
**Body B:** "I start strong, then lose motivation."
**Field:** 5-point scale, left label "Not me", right label "So me", auto-advance on tap.
**Visual:** Quote card with the statement in large type, row of five numbered circles beneath.
**CTA:** (auto-advances on select)

### 15. Distractions
**Purpose:** Names the enemy (usually the phone) so the plan can promise short lessons and a reminder slot; feeds the #22 summary chips.
**Headline A:** What pulls you off track?
**Headline B:** Your biggest learning distraction?
**Body A:** Pick all that apply; we'll plan around them.
**Body B:** Knowing this helps us keep lessons short.
**Options:**
- 📱 Phone notifications
- 🙈 Mindless scrolling
- 😴 Tired after work
- 🥱 Getting bored
- ✏️ Other
**Field:** Multi-select, ≥1 required.
**Visual:** Stacked pills with check circles.
**CTA:** Continue

---

## C. Trust

### 16. Social proof
**Purpose:** Trust beat after ~12 taps and the knowledge check, right before the commitment questions. It uses only public, checkable numbers.
**Headline A:** Rated 4.5 on the App Store
**Headline B:** Learners give it 4.5 stars
**Body A:** From 2,400+ ratings by people like {{name}}.
**Body B:** Lessons short enough to finish over coffee.
**Visual:** Huge "4.5" with a star row and laurel, App Store + Google Play badges beneath, one quote card.
**Microcopy:** Quote card (from mygrowth.one testimonials; confirm reuse rights): "It beats mindless scrolling. You learn while you scroll!" — Kare. Don't use the live funnel's "214,560 users" / "200,000+" unless internal data confirms them.
**CTA:** Continue

---

## B. Investment (commitment)

### 17. Learning moment
**Purpose:** Anchors the habit to an existing routine and sets the in-app reminder time (web funnel, so no push permission yet).
**Headline A:** When will you learn?
**Headline B:** When's your learning moment?
**Body A:** We'll remind you then, inside the app.
**Body B:** Pick a moment you already have daily.
**Options:**
- ☕ Morning coffee
- 🚌 My commute
- 🍱 Lunch break
- 🛏️ Before bed
- ✏️ Other
**Field:** Single-select (one reminder needs one slot; the live funnel's multi-select can't set a time). Sets `{{reminder_time}}` default 08:00 / 08:30 / 12:30 / 21:30. Other opens a time picker.
**Visual:** Pills with a small clock time on the right of each.
**CTA:** Continue

### 18. Daily goal
**Purpose:** The commitment tap; it sets `{{daily_minutes}}`, which makes the plan graph a calculation and not a stock image.
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

## D. Anticipation

### 19. Building the plan (loading)
**Purpose:** Makes the plan feel assembled from the answers; rotating real reviews are the second trust beat before the gate.
**Headline A:** Building {{name}}'s learning plan…
**Headline B:** Picking {{name}}'s first lessons…
**Steps:** (4 rows, % counter, checkmark, bar; violet → orange gradient bar)
- Matching lessons to your goals…
- Setting your starting level…
- Choosing {{subject}} stories you'll love…
- Almost ready, your plan awaits…
**Visual:** Top half: three lesson cards shuffling into a stack with the `{{subject}}` illustration on top. Four progress rows beneath. Review carousel at the bottom.
**Microcopy:** Carousel header: "★ 4.5 on the App Store". Cards (mygrowth.one testimonials, confirm reuse): "I feel more accomplished than when I just sit on my phone." — Sherri H. / "Short and sweet and to the point." — Heidi B.
**CTA:** (auto-advances, ~6 seconds)

### 20. Course match (tease)
**Purpose:** Shows *which* course they got, before the gate, but keeps the lesson list locked. Desire before email.
**Headline A:** This course fits you best
**Headline B:** {{name}}, meet your first course
**Body A:** Picked from your answers about {{subject}}.
**Body B:** Chosen for your goals and {{daily_minutes}}-minute days.
**Visual:** Big course cover card (`{{course_title}}`, lesson count, level chip from #9), small "BASED ON YOUR ANSWERS" eyebrow in violet, lesson list below blurred with a lock icon, two small "You might also like" cards.
**Microcopy:** `{{course_title}}` from the real catalogue: History "Events That Shaped the World" · Biology "Discover the Science of Life and Yourself" · Math "Boost Your Brain, Handle Your Bills" · Art "See the World Through a Different Lens" · Communication "Say the Right Thing at the Right Time" · Psychology: confirm the course exists and its title.
**CTA:** Get my plan

---

## E. Gate

### 21. Email
**Purpose:** Web checkout needs an identity that later unlocks the app. It's captured at peak curiosity, between the course tease and the full plan.
**Headline A:** Where should we send it?
**Headline B:** Save your plan, {{name}}
**Body A:** Your email unlocks your plan in the app.
**Body B:** You'll sign in with this email later.
**Field:** Email input (keyboard type email, autofocus), "Continue with Apple" / "Continue with Google" above it. Separate **unchecked** checkbox for marketing emails.
**Visual:** Blurred plan graph silhouette behind a white sheet holding the field.
**Error states:** "Please enter a valid email address" / "This email already has a plan. Check your inbox."
**Microcopy:** Under CTA: "Used only for your account. No spam." + Terms · Privacy links.
**CTA:** Show my plan

---

## D. Anticipation (reveal)

### 22. Your 4-week plan
**Purpose:** The reveal. The graph and numbers are calculated from #18, so the paywall reads as "start this", not "buy something".
**Headline A:** {{name}}'s 4-week plan
**Headline B:** Your plan is ready
**Body A:** {{lessons_4wk}} lessons in 4 weeks, {{daily_minutes}} minutes a day.
**Body B:** Built around {{subject}}, your goals and schedule.
**Visual:** Upward blue line chart, x-axis Week 1-4, start dot "Now", orange end dot labelled "{{lessons_4wk}} lessons", violet pill "{{daily_minutes}} MIN/DAY" above the line. Beneath: 4 summary chips (Subject · Level · Style · Reminder `{{reminder_time}}`). No "before/after" stock photo and no "42 people started today" email ticker.
**Microcopy:** `lessons_4wk` = 28 days × `daily_minutes` ÷ 10 (avg lesson), rounded: 5 → 14 · 10 → 28 · 15 → 42 · 20 → 56.
**CTA:** Start my plan

---

## F. Monetization

### 23. Paywall
**Purpose:** Close while the plan is fresh. Every card states its intro price *and* its renewal price in the same type size; nothing important is only in fine print.
**Headline A:** Start {{name}}'s plan today
**Headline B:** Your {{subject}} plan is ready
**Body A:** Every price and renewal shown before you pay.
**Body B:** Lessons, audio, quizzes and games, all included.
**Plans:** (structure mirrors the live paywall; numbers in brackets are MyGrowth's live Stripe prices, read 2026-09-28, for reference. Final prices are the growth team's call.)
- **1-month plan**: intro first month, then monthly renewal [$9.99 → $24.99/month]. **Pre-selected** (lowest commitment, fewest refunds). "MOST POPULAR" badge only if sales data backs it.
- **3-month plan**: intro first 3 months, then 3-month renewal [$19.99 → $44.99 every 3 months].
- **6-month plan**: intro first 6 months, then 6-month renewal [$29.99 → $74.99 every 6 months]. "BEST VALUE" badge (true: lowest renewal cost per day).
- Name each plan by the period it **bills** ("1-month", not the live "4-WEEK PLAN" that bills monthly). Per-day price shown small, for both intro and renewal.
**Visual:** Course cover thumbnail + headline top, 3 stacked plan cards with radio circles (selected = violet border). Each card has two lines: "{{intro_price}} first {{period}}" and "then {{renewal_price}} / {{period}}". Violet CTA, then Apple Pay / PayPal / card row and a safe-checkout badge row. Lavender "What you get" panel, 3 review cards, FAQ accordion. No countdown bar.
**Microcopy:**
- Dynamic line directly above CTA: "{{intro_price}} today. Then {{renewal_price}} every {{period}} until you cancel."
- Trust row: "🔒 Secure checkout · Cancel online anytime · 30-day money-back"
- Guarantee conditions shown on the page, in plain words (the live one pays out only if you used it for a week and saw "no noticeable progress", and says that only in Terms).
- What you get (shipped features only): "15-minute lessons in 6 subjects" · "Read or listen to every lesson" · "Quizzes and games: True or False, Spot the Fake" · "Streaks and achievements" · "Learn in 12 languages"
- FAQ "How do I cancel?": "Profile → Settings → Manage subscription, or the link in your receipt." (live answer: email support only)
- Renewal reminder: "We'll email you before every renewal."
**Fallback offer:** On back/exit, the last-chance offer (#24) once per session: the store app's 7-day free trial with its terms shown. No extra discount, no timer.
**CTA:** Start my plan

### 24. Last-chance offer (on paywall close)
**Purpose:** Second chance for users who close the paywall without paying: the store app's own 7-day free trial, with its terms shown. No extra discount. Shown once per session, then never again.
**Headline A:** Wait, {{name}}: try it free first
**Headline B:** Try your {{subject}} plan free
**Body A:** Your {{subject}} plan is ready. Start with 7 days free in the app.
**Body B:** Seven days of lessons before you pay anything.
**Plans:** One offer card: **7-day free trial in the app**, "Every lesson, audio and game, billed by the store". {{offer_price}} for 7 days, with the 1-month plan's real intro price ($9.99, `compareAt: 'm1'`) struck, then {{offer_renew_price}} / month until cancelled (the App Store listing read "then $24.99/month" on 2026-09-28). Optional {{offer_badge}} only if true.
**Visual:** Same web-page look as #23: sticky bar with the logo and a close ✕, centered eyebrow "One-time offer · shown once", headline and lead, then one violet-bordered offer card holding the course cover thumbnail ("Your course" · {{course_title}}), the plan name, the price row (struck $9.99 → {{offer_price}} "today"), 3 checks ("15-minute lessons in 6 subjects", "Read or listen to every lesson", "Quizzes and games: True or False, Spot the Fake"), the CTA, App Store / Google Play badges and the renewal line. Plain decline link below the card.
**Microcopy:** Renewal line: "{{offer_price}} for 7 days, then {{offer_renew_price}} / month until you cancel. Cancel anytime in your store subscriptions." Shown once per session (sessionStorage `ikf_offer_mygrowth`): a second paywall close goes straight to leaving the funnel. No timer: `CONFIG.offer.expiresMin` is `null`. If the growth team sets a real deadline, a countdown shows and the offer is withdrawn when it ends (`offer_expired`), never reset on reload. Decline (link and ✕): "No thanks, back to my plan", which returns to #22 Your 4-week plan. Accept deep-links to the store listing / trial (`CONFIG.offer.checkoutUrl`); the add-on (#25) is not shown on this path. Events: `paywall_close` (with `offerShown`), `offer_view`, `offer_accept` + `checkout_click` with plan `offer`, `offer_decline`, `offer_expired`.
**CTA:** Claim my offer

### 25. Optional add-on (post-purchase)
**Purpose:** A second revenue layer while intent is warm, copied in shape from the live `/paywall/main-upsell`. That page is headed "Conquer laziness with smart visual habits", has an "Add infographics" button for a separate $9.49/month subscription, and a pulsing close ×. Here it's opt-in, with the recurring price next to the button and an equal-weight decline. Build it only if the add-on really ships.
**Headline A:** Add visual lesson summaries?
**Headline B:** Remember more with infographics
**Body A:** A one-page visual recap after every lesson.
**Body B:** See each lesson in one picture.
**Visual:** Sample infographic card for lesson 1 of `{{course_title}}`, two full-width buttons of equal size (violet Add, outlined No thanks). No pulsing close icon.
**Microcopy:** Line under the Add button: "Separate subscription: {{addon_price}}/month, renews monthly, cancel anytime." · "Not charged unless you tap Add."
**Skip link:** "No thanks, take me to my plan" (outlined button, same size as CTA)
**CTA:** Add for {{addon_price}}/mo

---

## G. Payoff

### 26. Get the app
**Purpose:** Web buyers who never sign in refund and charge back, and Trustpilot shows exactly that ("paid… never able to log in"). The first job after paying is getting them into lesson 1 with the same email.
**Headline A:** You're in, {{name}}!
**Headline B:** Last step: open the app
**Body A:** Get the app and sign in with {{email}}.
**Body B:** Your {{subject}} plan is waiting inside.
**Visual:** Green check over the MyGrowth logo, 3 numbered steps (1 Download · 2 Tap the sign-in link we emailed · 3 Start lesson 1), App Store + Google Play badges, QR code for desktop visitors. Phone mockup showing lesson 1 of `{{course_title}}`.
**Microcopy:** "Receipt sent to {{email}}" · "Manage or cancel anytime: {{portal_link}}" · "Your {{reminder_time}} reminder turns on in the app." · "Can't sign in? support@mygrowth.one"
**CTA:** Open MyGrowth

---

## Notes

**Source and verification (2026-09-28).**
- *Verified from the store listings.* App Store: EXTRAMILE LIMITED, Education, 4.5★ with 2,400+ ratings. In-app plans: Monthly $24.99 with a 7-day trial, Yearly $69.99. Google Play: ~4.3★, 100K+ downloads (third-party mirror).
- *Verified from the live web funnel.* `quiz.mygrowth.one` (Web2Wave project "MyGrowth New", default quiz 21938, paywall `default-v4-up`) was read from its page config: 37 screens, a History-only quiz, then the Stripe paywall and the add-on upsell. The deep link is an AppsFlyer OneLink carrying user id, course and email.
- *Not verified.* The other subject quizzes (only the History quiz is the default), the in-app onboarding (a third-party library lists 30 onboarding steps, but they're locked), and whether a Psychology course ships.
- *Observation.* Quiz and paywall images sit under `/projects/gismart/…`, so the template may be shared with or cloned from Gismart's funnels. It has no bearing on this brief.

**Live funnel, compressed (reference):**
- welcome ("An intelligent person should know history") · learning-is-fun
- age · gender · goals (multi) · "our goal is yours"
- periods · themes · when · school memories · "develop practical skills"
- Osiris y/n · America rating · mummies y/n · "Great job!"
- studied before · rate knowledge · Likert (push) · info sources · method
- Churchill · Berlin Wall · quote author · "Excellent knowledge!"
- Likert (mistakes) · distraction · Likert (motivation) · regions · learning kind · "214,560 users"
- self-growth reason · daily goal · loader + reviews · course match · email · plan graph · before/after + email ticker
- paywall → add-on → app

**Cut and why:**
- Gender: only swaps the paywall image.
- School memories, info sources, learning method, regions: no downstream use.
- Two of the three Likert statements.
- The trivia run went from 6 questions to 2, now *with answers*.
- The before/after + masked-email ticker screen.
- The "practical skills" filler.

**Added:** name capture (#7), an interest screen per subject (#8, replacing the History-only periods/themes), honest answer feedback (#10-12), a single reminder slot (#17), and the app handoff (#26).

**Competitor mechanics documented as reference only, never built into an ikame funnel:**
- A **10-minute "51% discount reserved for you" timer**, shown twice on the paywall. It restarts on reload.
- **Intro-price plans that renew at 2.2-2.5× the intro price.** The renewal line is disclosed only in small payment terms.
- Plans labelled "4-WEEK / 12-WEEK / 26-WEEK" that actually bill monthly, every 3 months and every 6 months.
- **Cancellation only by emailing support** (the FAQ says to cancel ≥24h before renewal).
- A 30-day money-back guarantee with conditions that appear only in Terms.
- A **post-purchase add-on that is its own recurring $9.49/month subscription**, with a pulsing close ×.
- A geo-injected "Top app in {visitor's country} · 4.9★" line, where the real store rating is 4.5.
- A masked-email "42 people started today" ticker.
- Praise screens shown whatever the user answered.

Trustpilot (4.4★, ~2,000 reviews) shows the cost: "Offer $9.99 for 4 weeks then want $45", unexpected renewals, "no way to see your subscription", and buyers who paid but couldn't log in. The ikame paywall (#23) states renewal on every card and above the CTA, allows self-serve cancel, and uses no timer. The add-on (#25) states its recurring price and is opt-in. This follows the no-hidden-billing rule in `personalization-quiz.md`.

**Monetization, three metrics:**
1. Paywall conversion (#23).
2. Add-on attach rate (#25), reported separately and never folded into paywall CVR.
3. **Activation rate**: install + sign-in within 48h of #26, the web-funnel metric that predicts refunds.
4. Last-chance offer CVR (#24, `offer_view` → `offer_accept`), measured separately from paywall CVR (#23).

Also track refund and chargeback rate per plan. If the 1-month intro plan refunds heavily at first renewal, the gap between intro and renewal price is the cause, not the copy.

**Blocks deliberately skipped:**
- No gamified wheel: the knowledge check is the reward mechanic.
- No notification opt-in: it's a web funnel before install, so #17 sets the reminder time and the app asks for permission.
- No registration password: use a magic link. The live funnel generates a random 6-digit password in the browser, which is a likely cause of the "can't log in" reviews.

**Drop-off risks:** #7 name (first typing) and #21 email.

**First A/B tests:**
1. Knowledge check with answers revealed (#10-11 as written) vs. the live-style check with no feedback. Hypothesis: the reveal raises #12 → #21 completion.
2. Pre-select 1-month vs. 3-month on #23. Judge on refund-adjusted revenue, not first-charge CVR.
3. Email gate before #22 (as written) vs. after it.

**Verify before launch:**
- Psychology course exists (else drop it from #4, #8, #10-11).
- Add-on contents (#25).
- Current store rating and count (#1, #16).
- Rights to reuse the mygrowth.one testimonials.
- That in-app "Manage subscription" really cancels web (Stripe) purchases. If it doesn't, ship a Stripe customer-portal link (the live config leaves `customer_portal_link` empty).
