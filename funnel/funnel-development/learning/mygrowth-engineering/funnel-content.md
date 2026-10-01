---
niche: mygrowth-engineering
display_name: MyGrowth (Think Like an Engineer)
archetype: learning-plan
subject: person
input: reasons to learn, level, 3 circuit puzzle answers, first topic, reminder time, daily minutes, email
output: puzzle score + "How Things Work" course match + 4-week plan that starts on the user's chosen topic
screens: 22
monetization: web subscription (3 plans, 1-week intro / 4-week pre-selected / 12-week anchor, renewal shown beside every intro price); store one-time starter module (paid once, no renewal) as the last-chance offer; activation (install + sign-in) measured separately
creative_screens:
  hook-a: 1
  hook-b: 2
  quiz: 7
  loading: 16
  reveal: 18
motion: >
  a bulb flickering on as a wire loop closes, a switch flipping open and one of
  two bulbs going dark, then a violet course card "How Things Work" sliding in
  with a score badge
---

# Funnel Content — MyGrowth (Think Like an Engineer)

Same app and brand as `learning/mygrowth` (MyGrowth, EXTRAMILE LIMITED: 5-15 minute lessons). This variant sells the "think like an engineer" angle to curious adults. **References (adspylab, source-extracted 2026-10-01):** Smartyme `start.smartymeapp.com/quiz` engineering (q118-eng, 1,241 ads, 47 screen configs) and electricity (q130-ele, 267 ads, 48 configs), headline "Master electricity knowledge". Their skeleton is age and gender, reasons, yes/no knowledge checks, trivia, a long habit quiz, role models (Franklin, Faraday, Tesla, Edison), a "skills plan" with percent bars, loader, email, a scratch card with timer, then a paywall with two upsells. This brief reuses the shared learning-plan shape and the `learning/mygrowth` palette, and swaps in **three visual circuit puzzles** ("which bulb lights?") as the quiz, where the competitor asks text trivia. **Deliberate differences:** (1) every puzzle shows the right answer plus one fact straight away, and the score on screen #10 and #18 comes from those answers, not from a stock "74% ready" percentage; (2) no scratch card, timer, role-model persona or percent skills bars; (3) no gender or age questions, since nothing downstream uses them; (4) the course match is a single honest course, "How Things Work", whose first module follows the topic the user picks; (5) **safety:** the course explains how things work, it is not a guide to doing electrical work. Screen #12 says so before the plan is built, and the course card, paywall and FAQ repeat it. **Look:** identical to `learning/mygrowth`: white background, lavender panels `#EBE9F7`, violet gradient `#8488F4 → #7D73E3`, blue `#007BFF` line, orange `#FF9F00` accent. Copy rules apply throughout: headline ≤6 words, body ≤12 words, A/B on every screen.

Tokens: `{{name}}`, `{{reason}}`, `{{level}}`, `{{score}}`, `{{score_line}}`, `{{topic}}`, `{{course_title}}`, `{{reminder_time}}`, `{{daily_minutes}}`, `{{lessons_4wk}}`, `{{hours_4wk}}`, `{{email}}`, `{{price_1w}}`, `{{renewal_1w}}`, `{{price_4w}}`, `{{renewal_4w}}`, `{{price_12w}}`, `{{renewal_12w}}`, `{{offer_price}}`, `{{offer_renew_price}}`, `{{app_rating}}`, `{{rating_count}}`. Unset personal tokens fall back to: name "you", reason "curiosity", topic "Electricity", level "Know the basics", `{{course_title}}` is always "How Things Work".

---

## A. Hook

### 1. Hook A — Think like an engineer
**Purpose:** Cold traffic from "how the world works" ads gets the identity promise and a first picture of the quiz (a circuit), before any question.
**Headline A:** Think like an engineer
**Headline B:** See how things really work
**Body A:** Ten minutes a day, no maths degree needed.
**Body B:** Bite-sized lessons on circuits, machines and structures.
**Visual:** White background, MyGrowth logo top-left, rating strip. Flat illustration of a battery, a switch and a glowing bulb joined by a loop of wire, last headline word in violet, violet CTA pinned bottom.
**Microcopy:** Rating strip: "★ {{app_rating}} · {{rating_count}} App Store ratings". Real store data only: hidden while `CONFIG.rating` / `CONFIG.ratingCount` are unset; never a geo-injected "Top app in {country}".
**CTA:** Start my quiz

### 2. Hook B — Learn it by picture
**Purpose:** Sets the expectation that this quiz is visual puzzles, not a test, using real app footage.
**Headline A:** Puzzles first, theory later
**Headline B:** Spot it, then learn why
**Body A:** Quick visual puzzles, with the answer explained.
**Body B:** No lectures. One picture, one idea.
**Visual:** Lavender panel with three small circuit diagrams, one with a green check. Real lesson footage, not a stock phone.
**Microcopy:** Under CTA: "Takes about 3 minutes"
**CTA:** Continue

---

## B. Investment

### 3. Why you're here
**Purpose:** Cheap first tap that sets the tone of examples. Multi-select. The first pick becomes `{{reason}}`.
**Headline A:** Why learn how things work?
**Headline B:** What brings you here?
**Body A:** Pick all that fit.
**Body B:** We'll pick examples that match.
**Options:**
- 🏠 Fix things at home
- 💼 Boost my career
- 👧 Teach my kids
- 🔍 Pure curiosity
- ✏️ Other
**Field:** Multi-select, CTA disabled until one pick (Other needs text).
**Visual:** Stacked pills with right-side check circles. Progress bar top.
**Microcopy:** Other placeholder: "e.g. Building a robot". Disabled-CTA hint: "Pick at least one to continue"
**CTA:** Continue

### 4. Bridge — Curiosity is enough
**Purpose:** Removes the "I'm not technical" objection before the puzzles.
**Headline A:** Curiosity is all you need
**Headline B:** No degree required
**Body A:** Engineers just ask how things work.
**Body B:** Every lesson starts from everyday objects.
**Visual:** Lavender panel with a toaster, a bike and a bridge, each with a small question mark.
**Microcopy:** "Step 1 of 3 done"
**CTA:** Continue

### 5. Name
**Purpose:** Gets `{{name}}` for the loader, course card, paywall hero and offer.
**Headline A:** What should we call you?
**Headline B:** What's your first name?
**Body A:** We'll put it on your plan.
**Body B:** First name is all we need.
**Field:** Text input, placeholder "First name", max 30 chars, autofocus. Empty tap shows the error and does not advance.
**Visual:** Plain white input with violet focus ring.
**Error state:** "Please enter a name to continue"
**CTA:** Continue

### 6. Starting level
**Purpose:** Sets the first lesson and makes beginners welcome before the puzzles. Becomes `{{level}}`.
**Headline A:** How much do you know already?
**Headline B:** Where are you starting from?
**Body A:** No wrong answer; we'll set your level.
**Body B:** Beginners welcome, we start from zero if needed.
**Options:**
- 🌱 Total beginner
- 📘 Know the basics
- 🎓 Pretty confident
**Field:** Single-select, auto-advance.
**Visual:** Three pills with a 1/2/3-bar level icon.
**CTA:** (auto-advances on select)

### 7. Puzzle 1 — Which bulb lights?
**Purpose:** The product demo: a picture puzzle, the real answer and one fact straight away. Right = green, wrong = amber, never red. Three circuit diagrams (A, B, C) are drawn as vector art; all bulbs are unlit until the user answers, then the correct circuit's bulb lights up.
**Headline A:** Which bulb will light?
**Headline B:** Quick puzzle, {{name}}
**Body A:** Tap the circuit you think works.
**Body B:** Which circuit lights its bulb?
**Options:** (three diagrams, battery + bulb on every one)
| Option | Circuit | Result |
|---|---|---|
| A | Loop with an open switch | Stays dark |
| B | Complete loop, switch closed | **Lights (answer)** |
| C | Loop with a break in the wire | Stays dark |
**Fact card:** Right "✅ Nailed it" / wrong "💡 Here's the story": "Current needs a complete loop. An open switch or a gap stops it."
**Field:** Single-select; CTA appears only after the fact card lands.
**Visual:** Three white diagram cards in a row, letters A B C beneath, lavender fact card slides up with a 💡 icon. All circuits are low-voltage batteries.
**Microcopy:** "Battery circuits only"
**CTA:** Next puzzle

### 8. Puzzle 2 — Switch is open
**Purpose:** Second puzzle: parallel branches, where the intuitive "everything goes dark" answer is wrong.
**Headline A:** One switch is open
**Headline B:** One more, {{name}}
**Body A:** Which bulbs are lit?
**Body B:** Look at the two branches.
**Options:** (one diagram: battery feeding two parallel branches, the top branch has an open switch)
- Top bulb
- Bottom bulb (answer)
- Both bulbs
**Fact card:** "Each branch works alone. The open switch only cuts its own branch."
**Field:** Same as #7. The bottom bulb lights after answering.
**Visual:** One wide diagram on top, three pills beneath, same fact card.
**CTA:** Next puzzle

### 9. Puzzle 3 — Brightest bulb
**Purpose:** Third puzzle: how batteries add up, a bridge from circuits to "why".
**Headline A:** Which bulb is brightest?
**Headline B:** Last puzzle, {{name}}
**Body A:** Compare the batteries.
**Body B:** Same bulb, different batteries.
**Options:** (three diagrams with the same bulb)
| Option | Batteries | Result |
|---|---|---|
| A | One battery | Medium |
| B | Two batteries facing the same way | **Brightest (answer)** |
| C | Two batteries facing opposite ways | Dark |
**Fact card:** "Batteries facing the same way add up. Opposite ones cancel out."
**Field:** Same as #7. The bulbs show brightness after answering.
**Visual:** Same as #7.
**CTA:** See my result

### 10. Result bridge (computed from #7-9)
**Purpose:** Honest score from the user's own three answers, then the point: they just reasoned like an engineer.
**Headline A:** {{score_line}} (band table below)
**Headline B:** That's how engineers think
**Body A:** You just traced current through a circuit.
**Body B:** Every lesson works like these puzzles.
**Visual:** Three stacked flashcards, each ✅ or 💡 with the fact; light confetti only on 3/3.
**Microcopy:** Bands: 3/3 "Three for three, {{name}}!" · 2/3 "Two of three, nicely done" · 1/3 "One lit, two new facts" · 0/3 "Three new facts, zero effort". Progress hint: "Step 2 of 3 done"
**CTA:** Keep going

### 11. First topic
**Purpose:** Picks the plan's first module and the paywall cover. Becomes `{{topic}}`.
**Headline A:** Where should we start?
**Headline B:** Pick your first topic
**Body A:** Start with one, explore the rest later.
**Body B:** Your plan starts here; change it anytime.
**Options:**
- ⚡ Electricity
- ⚙️ Mechanics
- 🏗️ Structures
- ✏️ Other
**Field:** Single-select. Other opens a one-line input and routes to a mixed starter plan; CTA disabled while Other is empty.
**Visual:** Three illustrated cards (bulb, gears, bridge), Other as a full-width pill.
**Microcopy:** Other placeholder: "e.g. Cars, robots, flight"
**CTA:** Continue

### 12. Bridge — Learn it, don't wire it
**Purpose:** Safety expectation before the user commits to electricity: the course teaches concepts, not electrical work.
**Headline A:** Learn it, don't wire it
**Headline B:** Understand first, always
**Body A:** Lessons explain how things work, not how to repair them.
**Body B:** For real wiring, always call a licensed electrician.
**Visual:** Lavender panel with a battery-powered bulb diagram and a small shield icon.
**Microcopy:** "Concepts and battery-scale examples only. Never a guide to mains or home wiring." Progress hint: "Step 3 of 3 done"
**CTA:** Got it

### 13. Reminder time
**Purpose:** One in-app reminder at the time the user picks (web funnel, so no push permission yet). Becomes `{{reminder_time}}`.
**Headline A:** Pick your reminder time
**Headline B:** When should we nudge you?
**Body A:** One nudge, when you have ten minutes.
**Body B:** Change or switch it off anytime.
**Options:**
- 🌅 07:30
- 🍱 12:30
- 🌆 19:00
- 🌙 21:00
- ✏️ Other time
**Field:** Single-select; "Other time" opens a time picker, CTA disabled until a time is set.
**Visual:** Pills with a clock on the right.
**Microcopy:** "Reminder shows inside the app, not as a push yet."
**CTA:** Continue

### 14. Daily minutes
**Purpose:** The commitment tap; sets `{{daily_minutes}}`, which makes the plan hours a calculation.
**Headline A:** How much time per day?
**Headline B:** Your daily lesson
**Body A:** A small habit beats a big plan.
**Body B:** You can change it anytime in the app.
**Options:**
- 👍 Quick · 5 min/day
- 👌 Regular · 10 min/day
- 💪 Deep · 15 min/day
**Field:** Single-select, nothing pre-selected.
**Visual:** Three wide cards, minutes in a small grey line.
**Microcopy:** "Most lessons take 5-15 minutes."
**CTA:** Set my pace

---

## C. Trust

### 15. Social proof
**Purpose:** Trust beat before the loader, public checkable numbers only.
**Headline A:** Rated {{app_rating}} on the App Store
**Headline B:** Learners give it {{app_rating}} stars
**Body A:** From {{rating_count}} ratings by people like {{name}}.
**Body B:** Lessons short enough to finish over coffee.
**Visual:** Large "{{app_rating}}" with star row and laurel, App Store and Google Play badges, one real review card.
**Microcopy:** Rating and review card come from real store data only (`CONFIG.reviews`, verbatim, reuse rights confirmed). While rating or reviews are unset the demo shows the fallback copy "Made for ten-minute breaks" / "Every lesson works as text or audio." and hides the rating hero and review card. No invented user counts.
**CTA:** Continue

---

## D. Anticipation

### 16. Building the plan (loading)
**Purpose:** Makes the plan feel assembled from the answers; rows name the user's own picks.
**Headline A:** Building {{name}}'s course…
**Headline B:** Starting with {{topic}}…
**Steps:**
- Checking your puzzle answers…
- Matching a course to your level…
- Lining up {{topic}} lessons…
- Almost ready, your plan awaits…
**Visual:** A wire loop closing and a bulb glowing; four progress rows; real reviews rotating beneath (hidden while reviews or rating are unset).
**Microcopy:** Carousel header: "★ {{app_rating}} on the App Store"
**CTA:** (auto-advances, ~6 seconds)

---

## E. Gate

### 17. Email
**Purpose:** Web checkout needs an identity that later unlocks the app; asked after the loader at peak curiosity.
**Headline A:** Where should we send it?
**Headline B:** Save your plan, {{name}}
**Body A:** Your email unlocks your course in the app.
**Body B:** You'll sign in with this email later.
**Field:** Email input (email keyboard, autofocus), "Continue with Apple" / "Continue with Google" above. Separate **unchecked** marketing checkbox.
**Visual:** Blurred course card behind a white sheet holding the field.
**Error states:** "Please enter a valid email address" / "This email already has a plan. Check your inbox."
**Microcopy:** Under CTA: "Used only for your account. No spam." + Terms · Privacy links.
**CTA:** Show my course

---

## F. Reveal

### 18. Course match
**Purpose:** The result: one course, "How Things Work", with the user's score and first module. Lessons beyond module 1 are teased as locked.
**Headline A:** Your match: How Things Work
**Headline B:** {{name}}, meet your course
**Body A:** Starts with {{topic}}, matched to your level.
**Body B:** Built from your puzzles and your goals.
**Visual:** Course cover card with violet badge "{{score}}/3 puzzles". Chips: Topic · Level · Reason · Reminder `{{reminder_time}}`. Module list: Module 1 (the chosen topic, unlocked preview of lesson 1 title), then two locked modules.
**Microcopy:** Safety line shown whenever the topic is Electricity or Other: "Concepts and battery-scale examples. Not a guide to electrical work." "Course content is a placeholder until the real catalogue is confirmed."
**CTA:** See my plan

### 19. Your 4-week plan
**Purpose:** Turns the course into a ramp tied to the user's topic and daily minutes, labelled as goals.
**Headline A:** {{name}}'s 4-week plan
**Headline B:** Built around {{topic}}
**Body A:** Short lessons, week by week.
**Body B:** Goals, shaped by what you told us.
**Visual:** Four week rows, each with a theme (for Electricity: Circuits and current · Voltage and resistance · Series and parallel · Everyday devices), a day dot strip and "goal: N lessons". Goals ramp 3/5/7/7 (22 lessons of `{{daily_minutes}}` min). Eyebrow "Your goal, from your answers"; footer "Goal: 22 lessons · {{hours_4wk}} hours in 4 weeks. A target set from your answers, not a promise of results." The ramp is this brief's own design.
**CTA:** Start my plan

---

## G. Monetization

### 20. Paywall
**Purpose:** Long-scroll web sales page. Intro and renewal prices sit side by side on every plan; no struck-through "reference" prices, no timer. Final prices are the growth team's call, so the page shows tokens.
**Headline A:** {{name}}, start your course today
**Headline B:** Your {{topic}} plan
**Body A:** Every price and renewal shown before you pay.
**Body B:** Your goal: 22 lessons in 4 weeks.
**Plans:** (structure only, prices are tokens)
- **1-week plan** intro `{{price_1w}}`, then `{{renewal_1w}}` per week.
- **4-week plan**: **pre-selected**, intro `{{price_4w}}`, then `{{renewal_4w}}` every 4 weeks. Badge: "Recommended" (no popularity claim).
- **12-week plan**: anchor, intro `{{price_12w}}`, then `{{renewal_12w}}` every 12 weeks.
- Plans are named by the period they bill. No fake "was" price.
**Page structure (top to bottom):** brand bar (logo + close ✕) · personal hero (course cover, "{{topic}} first" chip, `{{daily_minutes}}` min/day, goal chip) · plan block · what's inside · how it works (3 steps) · proof (real rating + real review cards; hidden while unset) · guarantee (hidden while `CONFIG.refundDays` is unset) · FAQ · plan block repeated · sticky CTA.
**Visual:** Same web look as the rest of the funnel. Radio plan cards, violet border on the selected one, payment-method row (Apple Pay / PayPal / card), safe-checkout badges. No countdown bar.
**Microcopy:**
- Line above the sticky CTA: "{{price_4w}} today. Then {{renewal_4w}} every 4 weeks until you cancel." (follows the selected plan)
- Trust row: "🔒 Secure checkout · Cancel online anytime" plus " · {{refund_days}}-day money-back guarantee" only once `CONFIG.refundDays` holds a confirmed number.
- What's inside (shipped features only): "5-15 minute lessons on how things work" · "Read or listen to every lesson" · "Visual quizzes and games" · "Streaks and achievements" · "In-app reminder at {{reminder_time}}"
- How it works: 1 "Pick your plan" · 2 "Sign in with {{email}}" · 3 "Start lesson 1"
- Safety line above the FAQ: "Lessons explain concepts. They are not instructions for electrical work."
- Guarantee: section and every mention hidden while `CONFIG.refundDays` is a token.
- FAQ: "How do I cancel?" → "Profile → Settings → Manage subscription, or the link in your receipt." · "Will it renew?" → "Yes, at the renewal price shown, until you cancel. We email you before every renewal." · "Will this teach me to do electrical work?" → "No. It explains how things work. For real wiring, hire a licensed electrician."
**Fallback offer:** On close, the last-chance offer (#21) once per session. No timer.
**CTA:** Start my plan

### 21. Last-chance offer (on close)
**Purpose:** Second chance for users who close the page without paying: a smaller, different product from the three plans, a single starter module paid once through the store app. No subscription, not free, no extra discount, no struck-through price. Shown once per session, then never again.
**Headline A:** Wait, {{name}}: start with one module
**Headline B:** Just the {{topic}} starter
**Body A:** One module, paid once. No subscription.
**Body B:** Try {{topic}} first, upgrade whenever.
**Plans:** One offer card, a different and smaller product than the 1-week plan: **{{topic}} starter module** (module 1 of How Things Work, the topic the user picked; "Mixed starter" users get Electricity), {{offer_price}} paid once, no renewal. Includes the module's lessons (read or listen) and its visual quizzes. Not included (stated on the card): other topics, streaks and achievements, the full course, the in-app reminder.
**Visual:** Same web look as #20: sticky bar with logo and ✕, eyebrow "One-time offer · shown once", one violet-bordered card with module thumbnail, price row, 3 checks, a "Not included" line, CTA, store badges, a "Paid once, nothing to cancel" line, text link "No thanks, back to my plan".
**Microcopy:** "{{offer_price}} paid once. No subscription, nothing to cancel." Shown once (sessionStorage `ikf_offer_mygrowth-engineering`); `CONFIG.offer.expiresMin` is `null`, no timer; `CONFIG.offer.oneTime` is `true`.
**CTA:** Get the starter module

---

## H. Payoff

### 22. Get the app
**Purpose:** Web buyers who never sign in refund; the first job after paying is lesson 1 with the same email.
**Headline A:** You're in, {{name}}!
**Headline B:** Last step: open the app
**Body A:** Get the app and sign in with {{email}}.
**Body B:** Your first lesson is waiting inside.
**Visual:** Green check over the logo, 3 numbered steps (Download · Tap the sign-in link we emailed · Start lesson 1), store badges, QR for desktop, phone mockup of lesson 1.
**Microcopy:** "Receipt sent to {{email}}" · "Your {{reminder_time}} reminder turns on in the app." · "Manage or cancel anytime" link.
**CTA:** Open the app

---

## Notes

- **Unverified:** the Smartyme engineering and electricity screens were extracted from page source, not captured live (research marks them source-extracted), so their order is partly inferred. Whether MyGrowth ships a "How Things Work" course, an engineering catalogue or visual circuit lessons is **unverified**: the title, module names and week themes are this brief's own design and must be matched to the real catalogue before launch. The 1-week / 4-week / 12-week structure mirrors the Smartyme ladder, not MyGrowth's live plans, so confirm with growth. Prices are tokens. The 3/5/7/7 ramp and the three puzzles are this brief's own design.
- **Safety:** all circuits are low-voltage battery diagrams. The course is concepts only: screen #12 (before the topic is locked), the course card, paywall safety line and the FAQ all say it is not a guide to electrical work and point to a licensed electrician. No lesson on mains or home wiring repair.
- **Honesty guardrails:** puzzle feedback follows the real answer; the score is the user's own; plan numbers are goals, labelled as such; no percent-ready bars, role-model personas, scratch card or timers.
- **Dropped competitor mechanics:** scratch card and countdown, "74% ready" and skills-plan percent bars, expert personas ("built by experts"), age/gender social proof, two upsells and the lifetime "must-reads" add-on.
- **Measure:** quiz completion by screen, puzzle score vs paywall conversion, #18 to #20 reach, paywall conversion per plan, offer accept rate, activation (install + sign-in + first lesson within 48 h), first-renewal retention at full price, refund rate.
- **Demo (private Artifact):** https://claude.ai/artifact/CJnkJondtm5As146UKEgdd
