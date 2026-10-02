---
niche: coursiv-ai-simple
display_name: Coursiv - AI Made Simple (non-tech office workers 35-55, web funnel)
archetype: learning-plan
subject: person
input: how AI touches their job, coding myth tap, job type, time-eating tasks, tech comfort, AI worry, 28-day goal, daily minutes, learning time of day, name, 1-item AI safety check, email
output: personalized plain-English 28-day AI plan with a dated certificate of completion and a first "AI writes your weekly report" micro-lesson
screens: 24
monetization: web subscription paywall (1-week / 4-week pre-selected / 12-week, intro price with renewal price shown on every card and in the CTA line), app unlocked by the same email via magic link
creative_screens:
  hook-a: 1
  hook-b: 2
  lesson: 15
  reveal: 20
motion: >
  a pile of messy sticky notes on a desk sliding together and turning into
  a clean one-page weekly report line by line, a small "done in 40 seconds"
  stamp, then a 28-day calendar filling and a certificate of completion
  stamping its date
---

# Funnel Content — Coursiv AI Made Simple

Niche "AI đơn giản cho người không rành tech / giữ việc": a plain-English entry into the Coursiv app for US office workers aged 35-55 who are not tech-savvy and quietly worry that AI is changing their job. The user answers ~12 easy taps about their work, the tasks that eat their week and how comfortable they are with new apps. They take a single "can AI be wrong?" check and watch AI turn their messy notes into a weekly report in about 60 seconds. They get a gentle 28-day plan with a dated **certificate of completion**. Market signal (AdSpyLab Meta ads 03-08/2026): Coursiv's own pages AI Simplified, AI Essentials, AI Weekly and AI Made Simple run 50K ads, L3M +226%, with the ad hook "AI sắp thay việc bạn? Lấy chứng chỉ AI trong 28 ngày". Archetype: **learning-plan**, 24 screens. **Modeled on:** Coursiv `coursiv.io/pt/dynamic` (46 screens, email and paywall at 44), Tixu `tixu.ai/api/experiment/t` (41 screens; its best idea for this audience is the "Do you need to write code to use AI?" myth tap) and Jobescape `chat-v3` (the "AI wrote it, then I spent as long fixing it" pain question). **What was deliberately changed:** (1) The job-anxiety hook is kept honest. The first tap asks whether AI is changing their job, the worry is defused with a sourced line and a plain "nobody can promise job safety", and there are no "Easy to Replace" or "never worry again" lines. (2) A "what eats your week?" question drives both the micro-lesson and Weeks 2-3, replacing Coursiv's generic "first use case". (3) A tech-comfort question sets lesson style (extra tap-by-tap steps), and a habit-anchor slot (morning coffee / lunch) is added for a daily routine. (4) The one skill-check item teaches safe use (check AI's facts). (5) Plain words only: no "prompt", "LLM", "workflow" or tool-logo walls. Look: the base Coursiv **light "career" theme** with an **older-audience override**: body text ≥18px, tap targets ≥56px tall, high contrast (no grey-on-white body copy), photos of real 40-55-year-old office workers, one idea per screen and no dense logo strips. Copy follows the mobile limits (headline ≤6 words, body ≤12 words), with A/B on most screens.

---

## A. Hook

### 1. Hook A — Is AI changing your job? (first tap)
**Purpose:** The ad asks "AI coming for your job?", so the click lands on the same question as a calm, one-tap self-report instead of a scare. The answer also sets how much of the plan leans on "keep your skills current".
**Headline A:** Is AI changing your job?
**Headline B:** AI certificate in 28 days
**Body A:** Tap one. We'll build a simple plan around it.
**Body B:** No tech skills needed. Start with one tap.
**Options:**
- 😟 Yes, a lot
- 🤔 A little
- 🙂 Not yet
- 🤷 Not sure
**Field:** Single-select, large pills, tap advances
**Visual:** White background, a warm photo of a ~45-year-old at an office desk with a coffee mug in the top half, four tall (56px) pills below, a small "28-Day AI Made Simple Program" pill above the headline.
**Microcopy:** Footer legal line: "By continuing, you agree to our Terms, Privacy and Subscription Terms"
**CTA:** (tap to continue)

### 2. Myth tap — Do you need tech skills?
**Purpose:** The fear-lowering beat for this audience, taken from Tixu's "do you need to code?" screen but kept to one screen. The user guesses, then learns the answer, so the relief is felt rather than told.
**Headline A:** Do you need tech skills?
**Headline B:** Is AI only for techies?
**Body A:** Guess first. The answer surprises most people.
**Body B:** Tap your guess. We'll show you the truth.
**Options:**
- ✅ Yes
- ❌ No
**Field:** Single-select. After a tap, a green reveal card slides up; then the CTA shows.
**Visual:** Two big square cards side by side; the reveal card has a simple illustration of a person typing a plain sentence into a chat box.
**Microcopy:** Reveal card: "No. If you can type an email, you can use AI."
**CTA:** Good to know

### 3. Social framing — You're not late
**Purpose:** Borrowed trust aimed at the audience's real fear ("I'm too old / too late for this").
**Headline A:** You're not late to this
**Headline B:** Most learners start at zero
**Body A:** Plain-English lessons, one small step a day.
**Body B:** Built for busy adults, not tech experts.
**Visual:** Big indigo "[N]+ learners" number, a strip of three real learner photos in their 40s-50s beneath, star row under it.
**Microcopy:** ikame's own verified count only. Only claim an age mix (e.g. "most are 35+") if the data backs it.
**CTA:** Continue

---

## B. Investment (each answer maps to a plan field, see Notes)

### 4. Your job
**Purpose:** Swaps every example, and the notes in the screen 15 lesson, to their real workday.
**Headline A:** What work do you do?
**Headline B:** Tell us about your job
**Body A:** We'll use examples from your real workday.
**Body B:** Your lessons will look like your job.
**Options:**
- 🗂️ Office & admin
- 🤝 Sales & service
- 👥 Managing people
- 🏫 Teaching or care
- 🧮 Finance & numbers
- ✏️ Other
**Field:** Single-select; "Other" opens a one-line input (max 40 chars); progress "1 / 9" top
**Visual:** Stacked tall pills, selected pill fills indigo with white text, thick progress bar at top.
**CTA:** Continue

### 5. What eats your week
**Purpose:** The niche's core pain and the plan's backbone. The first pick becomes the micro-lesson task and Week 2, the second becomes Week 3.
**Headline A:** What eats your week?
**Headline B:** Which tasks feel like chores?
**Body A:** Pick up to two. AI can speed these up.
**Body B:** Choose up to two. We'll start with these.
**Options:**
- 📝 Weekly reports
- 📧 Long emails
- 🗒️ Meeting notes
- 📊 Spreadsheets
- 📅 Scheduling
- ✏️ Other
**Field:** Multi-select, max 2, CTA enabled at ≥1
**Visual:** 2×3 large tiles, each with a simple flat illustration (stack of papers, inbox, notepad), check badge on select.
**Microcopy:** Disabled-CTA hint: "Pick at least one"
**CTA:** Continue

### 6. Tech comfort
**Purpose:** Sets lesson style, not analytics. "A bit stressful" and "I avoid them" switch on extra tap-by-tap screenshots and a slower Week 1.
**Headline A:** How do new apps feel?
**Headline B:** You and new technology?
**Body A:** Honest answers help us set the right pace.
**Body B:** There's no wrong answer here.
**Options:**
- 😄 Easy for me
- 🙂 Fine with help
- 😬 A bit stressful
- 😣 I avoid them
**Field:** Single-select, tap advances
**Visual:** Stacked tall pills on white, calm blue tint, no alarm colours.
**CTA:** (tap to continue)

### 7. Bridge — Made for people like you
**Purpose:** Breaks the quiz right after the most self-exposing answer, and turns "I'm not a tech person" into "this was built for me".
**Headline A:** Made for people like you
**Headline B:** No jargon, no coding
**Body A:** Short steps, plain words, at your own pace.
**Body B:** Every lesson shows exactly where to tap.
**Visual:** A lesson screenshot with a big finger-tap indicator and a "Step 1 of 3" label, three green chips: "Plain English", "5-15 min", "Replay anytime".
**Microcopy:** Progress hint: "4 / 9 · Your plan is taking shape" · Only list lesson features the app actually ships.
**CTA:** Continue

### 8. AI worry
**Purpose:** Names the emotional driver honestly so the next screen can answer it without exploiting it. The answer becomes the "You now" row on screen 20.
**Headline A:** What worries you most?
**Headline B:** AI and your job, honestly?
**Body A:** No wrong answers. This keeps your plan relevant.
**Body B:** Pick what feels closest right now.
**Options:**
- 🏃 Falling behind others
- 🤖 Tasks getting automated
- 🧩 Missing new skills
- 😐 Not really worried
- ✏️ Other
**Field:** Single-select; "Other" opens a one-line input
**Visual:** Stacked pills, calm blue tint, no red.
**CTA:** Continue

### 9. Bridge — Honest reassurance
**Purpose:** Answers the worry with a real, attributed line and says plainly what the product can't promise. This is the honest version of the ad's job-anxiety hook.
**Headline A:** Skills are your best move
**Headline B:** Learning AI keeps you current
**Body A:** Nobody can promise job safety. New skills help you adapt.
**Body B:** People who adapt best keep learning. Start small.
**Visual:** Large quote card with quote marks, speaker name and title under it, a small green underline on the key phrase.
**Microcopy:** Quote card: "AI won't replace humans — but humans with AI will replace humans without AI." — Karim Lakhani, Harvard Business School (HBR, 2023); verify wording before launch. Or a sourced reskilling stat (e.g. WEF Future of Jobs; verify figure and year). Small line: "We teach skills. We can't guarantee job or income outcomes." Never "you'll never worry about being replaced again".
**CTA:** Continue

### 10. 28-day goal
**Purpose:** A concrete, small finish line. It becomes the Day 28 milestone and the paywall echo.
**Headline A:** What would feel like a win?
**Headline B:** Your goal for 28 days?
**Body A:** Pick one. It becomes your finish line.
**Body B:** Small, clear goals are easier to keep.
**Options:**
- ⏱️ Save time weekly
- 💪 Feel confident with AI
- 📄 Add to my resume
- 👥 Help my team
- ✏️ Other
**Field:** Single-select; "Other" opens a one-line input
**Visual:** Stacked pills, a small flag icon beside the headline.
**CTA:** Continue

### 11. Daily pace
**Purpose:** The commitment device. It moves the certificate date on screen 20. The 5-minute option exists because this audience fears overcommitting.
**Headline A:** How much time per day?
**Headline B:** Pick a pace that's easy
**Body A:** This sets your certificate date. Change it anytime.
**Body B:** Even 5 minutes works if it's daily.
**Options:**
- ☕ 5 min/day
- ⏱️ 10 min/day
- 🔥 15 min/day
**Field:** Single-select; tag the most-picked option only if data shows it
**Visual:** Three large horizontal cards with a clock arc each.
**Microcopy:** Under the 15-min card: "Finishes in 28 days"
**CTA:** Continue

### 12. Habit anchor
**Purpose:** Ties the lesson to an existing routine, the strongest retention lever for a non-habitual learner. It pre-fills the in-app reminder on Day 1.
**Headline A:** When suits you best?
**Headline B:** When will you learn?
**Body A:** We'll set a friendly reminder for that time.
**Body B:** Pair it with something you already do.
**Options:**
- ☕ Morning coffee
- 🥪 Lunch break
- 🚌 Commute
- 🛋️ Evening
**Field:** Single-select, tap advances
**Visual:** Four image cards (mug, sandwich, bus, sofa) in a 2×2 grid.
**Microcopy:** "Reminders are set in the app. Turn them off anytime."
**CTA:** (tap to continue)

### 13. Name
**Purpose:** Captures `{{name}}` before the lesson and plan.
**Headline A:** What should we call you?
**Headline B:** Who's this plan for?
**Body A:** Your name goes on your certificate.
**Body B:** First name is enough.
**Field:** Text input, placeholder "First name", max 30 chars, large field
**Visual:** Large white input with indigo focus ring, faint certificate outline behind it with the name line blank.
**Error state:** "Please enter your name to continue"
**CTA:** Continue

---

## B. Skill check + first taste

### 14. Safety check — Can AI be wrong?
**Purpose:** One check item, chosen because it's the most useful habit for non-tech users and a trust signal ("they teach safe use"). "Use it as is" is the decoy that catches over-trust. Praise follows the answer.
**Headline A:** AI gives you a number. Now?
**Headline B:** Can AI get things wrong?
**Body A:** One quick question. Guessing is fine.
**Body B:** This one habit protects your work.
**Options:**
- ✅ Use it as is
- 🔍 Double-check it
- 🗑️ Ignore AI
- 🤷 Not sure
**Field:** Single-select. After a tap, "Double-check it" turns green and a fact card appears; then the CTA shows.
**Visual:** Question card showing a chat bubble with a confident number ("Sales rose 18%"), options below, the fact card sliding up in soft green.
**Microcopy:** Fact card: "AI can sound sure and still be wrong. Check key facts." · Feedback: correct "Exactly right."; otherwise "Common guess. Here's the safe habit."
**CTA:** Try a real task

### 15. Micro-lesson — AI does your weekly report
**Purpose:** The demo and the strongest ad-creative screen. In one tap the user's own kind of messy notes become a clean weekly report, which proves "AI is simple" instead of claiming it. The task swaps by screen 5 (weekly report is the default; long email and meeting notes are variants).
**Headline A:** {{name}}, try this 60-second task
**Headline B:** Let AI write your report
**Body A:** Tap the request. Watch messy notes become a report.
**Body B:** One tap. Your weekly report, done.
**Options:**
- 📝 "Turn my notes into a short weekly report for my manager."
**Field:** Single big request chip; tap it. The request types into a chat box and a formatted report writes itself below (title, 3 bullets, "Next week" line) from 4 messy notes swapped by screen 4's job (e.g. "vendor call tues — price up 5%", "Q3 numbers late"). An optional second chip, "Make it friendlier", rewrites the tone in one tap. Then a "Done in about 40 seconds" stamp and a green chip: "Why it worked: say who it's for and how long". This is a pre-rendered simulation.
**Visual:** Before/after stack: yellow sticky-note pile on top, clean white document card below that fills line by line, a large pulsing request chip in between. Big readable type, no code or tech chrome.
**Microcopy:** Label: "Demo preview. Always check AI's work before sending." · Post-lesson line: "That's Day 1, Lesson 1. 27 days to go." · The "40 seconds" stamp is elapsed time, not a countdown.
**CTA:** Nice — keep going

---

## C. Trust

### 16. Social proof — People like you
**Purpose:** Peer proof right after the lesson and before the email gate. The reviews come from people who say they're "not techy", which is the objection this audience holds.
**Headline A:** Rated [X]★ by learners
**Headline B:** "Easier than I expected"
**Body A:** Real reviews from busy adults learning AI.
**Body B:** Most started with zero AI experience.
**Visual:** Star row with the store name, two large review cards with first name, age range, job and date, plus a photo if consented.
**Microcopy:** Real, attributed, dated ikame reviews only. Prefer reviews about ease and saved time; don't feature reviews claiming raises or promotions (typicality / earnings-claim risk). Headline B is a verbatim review quote only if a real one says it.
**CTA:** Continue

---

## D. Anticipation

### 17. Building the plan (loading)
**Purpose:** Makes the plan feel crafted, with every row naming their answers.
**Headline A:** Building {{name}}'s simple AI plan...
**Headline B:** Making AI simple for you...
**Steps:** (4 rows, each with % counter, checkmark, progress bar)
- Using {{job}} examples you'll know…
- Starting with your {{chore}} first…
- Pacing it for {{minutes}} minutes a day…
- Almost ready — your certificate date awaits…
**Visual:** A 28-tile calendar filling tile by tile, four large progress rows beneath, a rotating review card at the bottom.
**Microcopy:** Rotating review cards: real, attributed, dated ikame reviews only
**CTA:** (auto-advances, ~6 seconds)

---

## E. Gate

### 18. Email gate
**Purpose:** Captures identity before the plan is revealed. For a non-tech audience it removes the password worry up front, since browser passwords are the known "paid but can't log in" cliff.
**Headline A:** Where should we send it?
**Headline B:** Save your plan, {{name}}
**Body A:** No password needed. We'll email you a login link.
**Body B:** Your email becomes your app login.
**Field:** Large email input with typo suggestion ("Did you mean gmail.com?"); one **unchecked** optional box "Send me simple AI tips"
**Visual:** Large white input with envelope icon, lock icon beside the privacy line, the plan card blurred behind a frosted panel.
**Error states:** "Please check your email address" / "This email already has an account — log in instead?"
**Microcopy:** "We never sell your data. Privacy Policy"
**CTA:** Show my plan

---

## D. Reveal

### 19. Your starting point
**Purpose:** Mirrors the answers back as a computed profile, including a named lesson style, so the "made for me" feeling carries into the plan.
**Headline A:** {{name}}, here's your starting point
**Headline B:** Your AI profile, {{name}}
**Body A:** You're ready. You just need simple, clear steps.
**Body B:** Here's what we learned from your answers.
**Visual:** Horizontal meter (Just starting · Getting comfortable · Confident) with a marker on the computed band, four summary rows: Job = {{job}}, First task = {{chore}}, Pace = {{minutes}} min/day, Style = "Extra step-by-step" or "Standard".
**Microcopy:** Meter caption: "Based on your answers and your safety check"
**CTA:** See my plan

### 20. Your plan + certificate date
**Purpose:** The reveal. A dated 4-week plan built from their chores and job; the date moves with pace. The before/after is about time and confidence, never job security.
**Headline A:** Certificate by {{cert_date}}
**Headline B:** Your simple 28-day plan
**Body A:** At {{minutes}} min a day, you finish {{cert_date}}.
**Body B:** Week two: AI helps with your {{chore}}.
**Visual:** Four stacked week cards: Week 1 "AI basics + safe use" → Week 2 {{chore_1}} with AI → Week 3 {{chore_2}} and {{job}} tasks → Week 4 "Your own AI routine" + certificate. Below, a two-column before/after: "You now" (grey) vs. "With the plan" (green).
**Microcopy:** Before/after rows. You now: "{{worry}}" / "Hours on {{chore}}" / "Not sure where to start". With the plan: "Faster first drafts" / "A simple daily routine" / "Certificate of completion". Footnotes: "Estimated date based on your pace." · "Certificate of completion. Not an accredited degree or job guarantee."
**CTA:** What's included

### 21. What's inside
**Purpose:** A bundle preview right before price, in plain words.
**Headline A:** Everything in your plan
**Headline B:** Simple lessons, real results
**Body A:** Short lessons, ready-made requests, and a certificate.
**Body B:** Learn it, try it, keep it. One app.
**Visual:** 5 large icon benefit rows with green checks, a phone mockup of a tap-by-tap lesson on the right.
**Microcopy:** Benefit rows (only what the app ships; verify): "📚 5-15 minute lessons in plain English" / "👆 Tap-by-tap steps, replay anytime" / "📋 Ready-to-copy requests for {{job}}" / "🧪 Practise safely inside the app" / "🏅 Certificate of completion with your name"
**CTA:** Get my plan

---

## F. Monetization

### 22. Paywall
**Purpose:** The primary ask, written for a cautious buyer: each card spells out today's price, the renewal price and the period in plain words. No timer, no wheel, no promo code.
**Headline A:** Start your plan, {{name}}
**Headline B:** Your certificate starts today
**Body A:** Pick a plan. Cancel anytime from your account.
**Body B:** Goal: {{goal}}. Finish date: {{cert_date}}.
**Plans:**
- **1-week plan** — lowest entry price, for trying it. The card states "then [regular 1-week price] every week". It renews at *its own* period and never rolls silently into a 4-week plan.
- **4-week plan** — pre-selected, covers the full 28-day program, "MOST POPULAR" badge only if true. The card shows "[intro price] today, then [regular price] every 4 weeks".
- **12-week plan** — best per-day value, "BEST VALUE" badge, per-day price shown small. The card shows "[intro price] today, then [regular price] every 12 weeks".
- Any struck-through price must be the real regular renewal price. Same structure as the base `learning/coursiv` funnel; use ikame's real prices at launch.
**Visual:** Top: a mini plan card echoing goal and date. Three large stacked plan cards (≥18px price text), the 4-week one with an indigo border. The renewal line uses the same size and colour as the price. Payment row: Apple Pay / Google Pay / card logos.
**Microcopy:** Trust row: "🔒 Secure payment · Cancel in 2 taps · [N]-day refund window". Agreement checkbox **unchecked**: "I agree to the Terms, Subscription and Refund Policy". Line above CTA, from the selected card: "You'll pay [today's price] today. It renews at [renewal price] every [period] until you cancel. We'll email you before each renewal." A "How do I cancel?" link opens a 3-step sheet.
**Fallback offer:** On dismiss or back, one sheet with one genuine offer (e.g. the 4-week intro price extended once), with the renewal price on the same line. No countdown.
**CTA:** Get my plan

### 23. Checkout summary
**Purpose:** Confirms exactly what is charged today and later, in plain words. Surprise renewals drive this category's refunds, and a cautious 45-year-old buyer is the one who files the chargeback.
**Headline A:** Review your order
**Headline B:** Here's what you'll pay
**Body A:** Today's total and your renewal, spelled out.
**Body B:** No surprises. Cancel anytime before renewal.
**Visual:** Receipt-style card in large type: plan name, today's total (incl. tax), next charge amount and **date**, "how to cancel" line; card / Apple Pay form below.
**Microcopy:** Receipt rows: "Today: [price + tax]" / "Renews {{renew_date}}: [renewal price + tax] every [period]" / "Cancel: Account → Subscription, web or app". No add-ons on this screen.
**CTA:** Pay securely

---

## G. Payoff

### 24. Welcome + app handoff
**Purpose:** Activation for a non-tech user: three very plain steps with no password, and Day 1 is their own chore. A web sale that never opens the app turns into a refund.
**Headline A:** Welcome aboard, {{name}}!
**Headline B:** Day 1 is ready for you
**Body A:** Get the app, then tap the link we emailed.
**Body B:** Your first {{minutes}}-minute lesson is waiting.
**Visual:** Green success check, phone mockup showing "Day 1 · AI basics + safe use", large App Store / Google Play buttons, 3 big numbered steps with icons.
**Microcopy:** Steps: "1. Install the app" / "2. Open our email, tap 'Log in'" / "3. Start Day 1 at {{time_slot}}". Help line: "Stuck? Reply to our email. A real person helps." (only if support is staffed). Receipt line: "Receipt and cancel link sent to {{email}}".
**CTA:** Get the app

---

## Notes

**Market + competitor evidence.** Coursiv's simple-AI pages (AI Simplified, AI Essentials, AI Weekly, AI Made Simple) run 50K ads, L3M +226%, the biggest single cluster in the category. **Coursiv** `coursiv.io/pt/dynamic` (46 screens, captured 2026-09-02, 3,007 ads): work-type tap → 2M+ → age → goal → industry → "overwhelmed by AI?" → comfort → experience → career level → first use → career fear → "nothing to worry about" → other courses → "comfortable online?" → first-week result → minutes → **"How would you celebrate? Pay off bills / retirement fund"** → loader → email → name → summary → plan → paywall at 44. EUR prices: €6.93 (struck €13.86), €19.99 → €39.99, €39.99 → €79.99, plus €8.25 / €23.79 / €47.59 / €95.19 variants. **Tixu** `/t` (41 screens, 6,236 ads): the "Do you need to write code?" myth tap, Ipsos "50% feel nervous" and Pew "52% worry" stats, "Easy to Replace → Valuable to Employers", income and hours questions. **Jobescape** `chat-v3`: "AI wrote it, then you spent as long fixing it?", used here as the reason for the screen 14 safety check.

**Honest job-anxiety framing (the ad hook's guardrails).** Screen 1 asks rather than asserts; screen 9 says "Nobody can promise job safety"; before/after rows talk about time and confidence, never "irreplaceable" or "valuable to employers". Stats on 9 must be sourced and dated. The ad line "Lấy chứng chỉ AI trong 28 ngày" (AI certificate in 28 days) is true only at 15 min/day, so ads should say "at 15 min a day" or "about 4 weeks". Never pair the hook with income, promotion or "keep your job" claims.

**Deliberately not implemented.** Coursiv's money-celebration question and Tixu's income-range question (earnings-claim exposure); duplicate "overwhelmed" / "comfort" / "comfortable online" questions (collapsed into one tech-comfort question that actually routes style); age (the comfort question routes better than an age band, and ads already target 35-55); career level; the spin wheel, 10-minute timer and name-based promo code; any "$1 trial into hidden recurring sub"; and the separate marketing opt-in screen.

**Plain-language rules for this funnel.** Say "request", not "prompt". Say "AI tools", not "LLMs". No "workflow", "automation stack" or tool-logo walls. Every screen gets one idea and ≥18px body text. Tap targets are ≥56px.

**Answers change the plan.** Job → examples and lesson notes. Chores (max 2) → lesson task, Week 2 and Week 3. Tech comfort → "Extra step-by-step" style plus a slower Week 1. Worry → "You now" row. Goal → Day 28 milestone and paywall echo. Minutes → date. Time slot → Day 1 reminder. Screen 1 → how much Week 4 leans on "staying current". Meter rubric: comfort Avoid 0 / Stressful 1 / With help 2 / Easy 3, plus 1 for "Double-check it". 0-1 Just starting, 2-3 Getting comfortable, 4 Confident. Date: 5 min → today + 49 days, 10 → +35, 15 → +28 (confirm against real lesson lengths).

**Blocks skipped:** multi-item knowledge check (one safety item only; quizzes feel like exams to this audience), web notification opt-in (the time slot pre-fills the in-app reminder instead), gamified wheel, post-purchase upsell, and password registration.

**Drop-off risk:** 5 (multi-select can confuse, so keep the ≥1 hint visible), 18 (email), and 24 (install + login is the last cliff for this audience, so magic link only and a support reply path).

**First A/B tests:** (1) Hook A question vs. Hook B "AI certificate in 28 days" promise at screen 1. (2) Myth tap at 2 vs. straight to social proof. (3) 5/10/15 vs. 10/15/20 pace options (does 5 min lift conversion but hurt Day-7 retention?).

**Monetization:** one layer, the web subscription. Track paywall conversion, install + login + Day 1 within 48h (expect this audience to lag, so watch it), and refund/chargeback rate by plan.

**Unverified / assumed:** age mix of real Coursiv/ikame learners; the quote/stat wording on 9; whether support is staffed for the 24 help line; live prices; shipped features on 21. All ikame stats are `[N]` placeholders until real.
