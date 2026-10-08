---
niche: coursiv-vibe-coding
display_name: Coursiv - Build Apps with AI (vibe coding / Claude Code for non-developers, web funnel)
archetype: learning-plan
subject: person
input: what they want to build, coding experience, AI builder tools tried, past blockers, reason to build, one-line app idea, device, learning style, daily minutes, name, 2-item builder check, email
output: personalized 4-week build plan that ends in one working app plus a dated certificate of completion, and a first "describe it, watch it build" micro-lesson
screens: 25
monetization: web subscription paywall (1-week / 4-week pre-selected / 12-week, intro price with renewal price shown on every card and in the CTA line), app unlocked by the same email
creative_screens:
  hook-a: 1
  hook-b: 2
  lesson: 15
  reveal: 20
motion: >
  a one-line app idea typing into a prompt box, code lines streaming down a
  dark pane, then a live phone preview snapping together into a working
  habit tracker that switches to dark mode on tap, ending on a 4-week build
  path with a "shipped" flag and certificate date
---

# Funnel Content — Coursiv Build Apps with AI

Niche "Coding với AI / Claude Code / vibe coding": an entry into the Coursiv app for non-developers who have an idea for an app, site or work tool and have heard they can now build it by describing it to AI. The user says what they'd build, their coding background, which AI builders they've tried and what stopped them before. They type their app idea in one line and take a 2-item "builder instincts" check. Then they watch their own idea get built in a preview, and get a 4-week build plan that ends in **one working app they made** plus a dated **certificate of completion**. Market signal (AdSpyLab Meta ads 03-08/2026 + Google Trends US): Kodree's claude-code funnel runs 19K ads, L3M +131%, and Codefinity is active too. Searches for "vibe coding" are up 42% and "learn python" up 89%. Archetype: **learning-plan**, 25 screens. **Modeled on:** Kodree `kodree.com/en/claude-code/get-started` (14 screens, captured 2026-09-06: "tried Claude Code?", tools incl. Lovable / Cursor / Terminal / Git, theory-vs-practice, "AI mentor?", "official certification?", paywall at 14, €1 / 7-day trial) and Jobescape `chat-v3`'s builder branch ("Had an idea for an app but couldn't build it?" → "What stopped you?" → "Possible without coding?"). **What was deliberately changed:** (1) The first tap is "What would you build?", matching a build-something ad and more motivating than Kodree's yes/no. (2) The user's own one-line idea is captured and reused in the lesson, the plan title and Day 1, so the plan is visibly theirs. (3) A real micro-lesson (describe → watch it build → tweak with one tap) replaces Kodree's yes/no add-on questions. (4) A device question routes browser builders (phone-friendly) vs. a laptop track (Claude Code, Cursor), because the honest answer is that some tools need a computer. (5) The promise is honest about the craft: "AI writes the code; you learn to guide, test and fix it". There's no "build a startup / earn from apps" angle, no "official certification", and non-affiliation with Anthropic and the other tool makers is stated. Look: the base Coursiv **light "career" theme** with a **builder accent**: a dark code pane and a live phone preview on the lesson and plan screens, monospace for code only, and green "build passed" states. Tool names appear as plain text chips, not brand logos. Copy follows the mobile limits (headline ≤6 words, body ≤12 words), with A/B on most screens.

---

## A. Hook

### 1. Hook A — What would you build? (first tap)
**Purpose:** The ad shows someone describing an app and watching it appear, so the click lands on the user's own version of that. The answer picks the first project template and the lesson preview.
**Headline A:** What would you build?
**Headline B:** Your idea, built with AI
**Body A:** Pick one. Your 4-week build plan starts here.
**Body B:** No coding background needed. Tap to start.
**Options:**
- 📋 A personal tracker
- 🌐 A simple website
- ⚙️ A work tool
- 📱 My app idea
- ✏️ Other
**Field:** Single-select; "Other" opens a one-line input (max 40 chars)
**Visual:** White background, four image cards in a 2×2 grid, each showing a finished mini-app on a phone (habit tracker, one-page site, expense sheet tool, idea sketch turning into an app), indigo border on tap, small "4-Week AI Build Program" pill above.
**Microcopy:** Footer legal line: "By continuing, you agree to our Terms, Privacy and Subscription Terms"
**CTA:** (tap a card to continue)

### 2. Hook B — Describe it, AI builds it (honest promise)
**Purpose:** States the promise and the honest catch in one beat, so the plan sells a real skill, not magic.
**Headline A:** Describe it. AI writes code.
**Headline B:** You direct. AI does the typing.
**Body A:** You learn to guide, test and fix it.
**Body B:** Plain words in, working app out, step by step.
**Visual:** Split card: a plain-English sentence on the left, an arrow, a live phone preview on the right with a short code strip scrolling behind it. A "[N]+ learners building" chip beneath.
**Microcopy:** Learner count: ikame's verified number only; Kodree's "227,000+" is theirs.
**CTA:** Build my plan

---

## B. Investment (each answer maps to a plan field, see Notes)

### 3. Coding experience
**Purpose:** Sets the starting level and routes real developers to an advanced track instead of boring them.
**Headline A:** Ever written any code?
**Headline B:** Your coding background?
**Body A:** No experience is the most common answer.
**Body B:** Be honest. It sets your first lesson.
**Options:**
- 🌱 Never
- 🧮 Excel formulas only
- 🐍 A little Python
- 💻 I'm a developer
**Field:** Single-select, tap advances; progress "1 / 10" top
**Visual:** Four stacked cards with a 1-4 bar signal icon on the right.
**CTA:** (tap to continue)

### 4. AI builder tools tried
**Purpose:** Picks the Week 1 tool setup and skips what they already know. The tool list mirrors Kodree's capture, which reflects what this audience recognizes.
**Headline A:** Which tools have you tried?
**Headline B:** Used any AI builders yet?
**Body A:** Pick all that apply. We'll skip what you know.
**Body B:** Select all. None is a great start too.
**Options:**
- 💬 ChatGPT or Claude chat
- 🧱 Lovable or Bolt
- 🖱️ Cursor
- ⌨️ Claude Code
- 🚫 None yet
- ✏️ Other
**Field:** Multi-select; "None yet" clears the others; CTA enabled at ≥1
**Visual:** 2×3 tiles with tool names in plain text and neutral icons (no brand logos), check badge on select.
**Microcopy:** Disabled-CTA hint: "Pick at least one"
**CTA:** Continue

### 5. What stopped you before
**Purpose:** Names the blocker, echoing Jobescape's "What's stopped you?". The answer becomes the "You now" row and decides which module gets extra time (setup, debugging, or small daily steps).
**Headline A:** What stopped you before?
**Headline B:** Why isn't it built yet?
**Body A:** Pick up to two. We'll plan around them.
**Body B:** Choose up to two. Most people pick setup.
**Options:**
- 🤷 I can't code
- 🧰 Setup felt technical
- 🐞 Got stuck on errors
- ⏱️ No time
- ✏️ Other
**Field:** Multi-select, max 2, CTA enabled at ≥1
**Visual:** Stacked pills, muted grey icons that turn indigo on select.
**Microcopy:** Only use Body B's "Most people pick setup" if the data shows it; otherwise use Body A.
**CTA:** Continue

### 6. Bridge — The rules changed
**Purpose:** Breaks the quiz right after the blocker question and answers it: the old wall (syntax) is gone, and the new skill is steering and fixing.
**Headline A:** Building got way easier
**Headline B:** You don't need syntax anymore
**Body A:** You describe it, AI drafts it, you steer.
**Body B:** The new skill is clear requests and testing.
**Visual:** Three-step strip: speech bubble → code pane → phone preview with a green check, the user's blocker from screen 5 shown struck through with a soft line.
**Microcopy:** Honest line: "AI code still needs testing. We teach that too." · Progress hint: "4 / 10 · Your build plan is taking shape"
**CTA:** Continue

### 7. Why build
**Purpose:** The motivation driver, echoed on the plan and paywall. Options avoid income framing on purpose.
**Headline A:** Why do you want to build?
**Headline B:** What's your reason to build?
**Body A:** Your final project is shaped by this.
**Body B:** Pick the one that matters most now.
**Options:**
- ⚙️ Automate my work
- 🚀 A side project
- 🧠 Understand tech better
- 📈 A new career skill
- 🎨 Just for fun
- ✏️ Other
**Field:** Single-select; "Other" opens a one-line input
**Visual:** Stacked pills with line icons, selected pill fills indigo.
**CTA:** Continue

### 8. Your app idea (one line)
**Purpose:** The highest-value input: their own idea, reused in the lesson, the plan title and Day 1. It's a free-text field, so it gets suggestion chips and a skip.
**Headline A:** Describe your idea in one line
**Headline B:** What should your app do?
**Body A:** Plain words are perfect. We'll build a preview.
**Body B:** One sentence. You can change it later.
**Field:** Text input, max 80 chars, placeholder "e.g. A tracker for my daily water intake". Three suggestion chips under it, swapped by screen 1: "Habit tracker", "Team lunch poll", "Client price calculator".
**Visual:** Large white input with a blinking cursor and a monospace hint, a small phone outline beside it that shows "Your app" in grey.
**Error state:** "Add a few words, or pick a suggestion"
**Skip link:** "Not sure yet — pick one for me" (assigns the template from screen 1)
**CTA:** Continue

### 9. Where will you build?
**Purpose:** An honest routing question. Browser builders work on a phone, while Claude Code and Cursor need a computer, so the plan's tool track and the Day 1 handoff depend on it.
**Headline A:** Where will you build?
**Headline B:** Laptop, phone, or both?
**Body A:** Some AI tools work best on a computer.
**Body B:** We'll pick tools that fit your setup.
**Options:**
- 💻 Laptop or desktop
- 📱 Phone only
- 🔁 Both
**Field:** Single-select, tap advances
**Visual:** Three horizontal cards with a device illustration each.
**Microcopy:** Under "Phone only": "You'll start with browser builders. Laptop tools come later, optional."
**CTA:** (tap to continue)

### 10. Learning style
**Purpose:** Kodree's theory/practice question, kept because it genuinely routes lesson order (build-first vs. explain-first).
**Headline A:** How do you learn best?
**Headline B:** Build first or explain first?
**Body A:** We'll order each lesson to match.
**Body B:** Both work. Pick what feels natural.
**Options:**
- 🔨 Build, then explain
- 📖 Explain, then build
**Field:** Single-select, two large cards, tap advances
**Visual:** Two tall cards: a hammer-and-phone illustration vs. a notebook-and-phone illustration.
**CTA:** (tap to continue)

### 11. Daily pace
**Purpose:** The commitment device. It moves the "first app shipped" date on screen 20.
**Headline A:** How much time per day?
**Headline B:** Set your daily build time
**Body A:** This sets your ship date. Change it anytime.
**Body B:** Small daily builds beat weekend marathons.
**Options:**
- ☕ 10 min/day
- ⏱️ 15 min/day
- 🔥 30 min/day
**Field:** Single-select; tag the most-picked option only if data shows it
**Visual:** Three large horizontal cards with a clock arc each.
**CTA:** Continue

### 12. Name
**Purpose:** Captures `{{name}}` before the check, the lesson and the plan.
**Headline A:** What should we call you?
**Headline B:** Who's the builder here?
**Body A:** Your name goes on your app and certificate.
**Body B:** First name is enough.
**Field:** Text input, placeholder "First name", max 30 chars
**Visual:** White input with indigo focus ring; the phone outline from screen 8 now reads "{{name}}'s app" as they type.
**Error state:** "Please enter your name to continue"
**CTA:** Continue

---

## B. Skill check + first taste

### 13. Builder check 1 — Errors
**Purpose:** A check item that teaches the real core habit of vibe coding (feed errors back). "Start over" is the decoy. Developers from screen 3 skip 13-14 and go to 15.
**Headline A:** Your app shows an error. Now?
**Headline B:** First move when it breaks?
**Body A:** Two quick questions. Guessing is fine.
**Body B:** No pressure. It just sets your level.
**Options:**
- 🔁 Start over
- 📋 Paste error to AI
- 🙈 Ignore it
- 🤷 Not sure
**Field:** Single-select. After a tap, the correct option turns green and a fact line appears; then the CTA shows.
**Visual:** Question card with a small red error banner mock at the top, "1 / 2" dots, fact line sliding up in soft green.
**Microcopy:** Fact line: "Paste the error back to AI. That's half of vibe coding." · Feedback follows the answer: correct "Exactly!"; otherwise "Common instinct. Here's the pro move."
**CTA:** Next question

### 14. Builder check 2 — Clear requests
**Purpose:** Teaches the other half of the skill (specific requests) and sets up the lesson.
**Headline A:** Which request builds better?
**Headline B:** Which one would AI nail?
**Body A:** Tap the one you'd send.
**Body B:** One is vague. One is buildable.
**Options:**
- 🅰️ "Make a budget app"
- 🅱️ "Budget app: add costs, see weekly total"
- 🤷 Not sure
**Field:** Single-select, same reveal pattern as screen 13. Options quote example requests, so they exceed the 1-3-word option rule on purpose.
**Visual:** Two chat-bubble cards stacked, then a flip showing two tiny previews: a blank shell for A, a working list with a total for B.
**Microcopy:** Fact line: "Say what it does and the key features. AI fills the rest."
**CTA:** Build my idea

### 15. Micro-lesson — Describe it, watch it build
**Purpose:** The demo and the strongest ad-creative screen. The user's own idea from screen 8 is pre-filled, one tap builds a working preview, and one more tap changes it. That's the core loop of the course (describe → build → tweak) felt in 60 seconds.
**Headline A:** {{name}}, let's build it
**Headline B:** Your idea, built live
**Body A:** Tap BUILD. Watch your idea come to life.
**Body B:** One tap to build. One tap to change it.
**Field:** Prompt box pre-filled with {{app_idea}} (editable). Tapping BUILD IT streams ~20 readable code lines down a dark pane, then a phone preview renders a working mini-app from a template bank matched to the idea's category (tracker, list, calculator, one-page site). Two tweak chips appear, "Add dark mode" and "Add a total", and one tap updates the preview. A green chip follows: "Why it worked: what it does + key features".
**Visual:** Top: prompt box. Middle: dark monospace code pane scrolling. Bottom: phone preview snapping together, then flipping to dark mode on the tweak tap. No brand logos of any AI tool.
**Microcopy:** Label on the preview: "Demo preview from a template. In lessons, you build it for real." · Post-tap line: "That's Day 1. Your first build." · Map free-text ideas to the closest template; never show an error here.
**CTA:** BUILD IT (then "Nice — keep going")

---

## C. Trust

### 16. Social proof — Things learners built
**Purpose:** Outcome proof right after the lesson, before the email gate. For builders, "apps shipped" beats install counts.
**Headline A:** [N] projects built by learners
**Headline B:** Rated [X]★ by learners
**Body A:** Real people, zero coding background, real working tools.
**Body B:** Most started exactly where you are now.
**Visual:** A horizontal carousel of 3 real learner projects (screenshot, first name, "built in week 3"), a star row with the store name, and one review card.
**Microcopy:** Real, attributed, dated ikame projects and reviews only. No "earns $X from my app" stories (earnings-claim risk). Don't reuse Kodree's "227,000+ / Mary L." or Jobescape's review cards.
**CTA:** Continue

---

## D. Anticipation

### 17. Building the plan (loading)
**Purpose:** Makes the plan feel crafted, with every row naming an answer.
**Headline A:** Planning {{name}}'s first build...
**Headline B:** Mapping your 4-week build path...
**Steps:** (4 rows, each with % counter, checkmark, progress bar)
- Breaking your idea into small steps…
- Picking tools for your {{device}}…
- Extra help on {{blocker}}, built in…
- Almost ready — your ship date awaits…
**Visual:** The phone preview from screen 15 at the top with a glowing ring, four progress rows beneath, a rotating learner-project card at the bottom.
**Microcopy:** Rotating cards: real, attributed, dated ikame learner projects only
**CTA:** (auto-advances, ~6 seconds)

---

## E. Gate

### 18. Email gate
**Purpose:** Captures identity before the plan is revealed. The email is also the app login, and the copy doubles as a "save your project" hook.
**Headline A:** Save your build, {{name}}
**Headline B:** Where should we send it?
**Body A:** Your plan and preview, saved to this email.
**Body B:** Your email becomes your app login.
**Field:** Email input with typo suggestion ("Did you mean gmail.com?"); one **unchecked** optional box "Send me build tips and product news"
**Visual:** White input with envelope icon, lock icon beside the privacy line, the plan card blurred behind a frosted panel with the phone preview peeking out.
**Error states:** "Enter a valid email address" / "This email already has an account — log in instead?"
**Microcopy:** "We never sell your data. Privacy Policy"
**CTA:** Show my plan

---

## D. Reveal

### 19. Builder profile
**Purpose:** Mirrors the answers back as a computed level. The score from 13-14 is shown here instead of on a separate score screen.
**Headline A:** {{name}}, your builder profile
**Headline B:** Here's where you start
**Body A:** You got {{score}} of 2. Your plan starts there.
**Body B:** Here's what your answers and checks tell us.
**Visual:** Horizontal meter (First build · Tinkerer · Builder) with a marker on the computed band, four summary rows: Project = {{app_idea}}, Tools = {{tool_track}}, Extra help = {{blocker}}, Pace = {{minutes}} min/day.
**Microcopy:** Body A variant for score 0: "Great starting point. Week 1 covers both habits." · Meter caption: "Based on your answers and your 2 checks"
**CTA:** See my plan

### 20. Your build plan + ship date
**Purpose:** The reveal. A dated 4-week path that ends in their own app shipped, with a certificate as the second prize. Pace moves the date.
**Headline A:** Your app ships {{ship_date}}
**Headline B:** Your 4-week build plan
**Body A:** At {{minutes}} min a day, you ship by {{ship_date}}.
**Body B:** Week 4 ends with your app and certificate.
**Visual:** Four stacked week cards, each with a tiny phone preview growing more complete: Week 1 "Set up {{tool_track}} + first screen" → Week 2 "Add features and data" → Week 3 "Test, fix, polish" (extra time if blocker = errors) → Week 4 "Publish {{app_idea}}" + certificate. Below, a before/after: "You now" (grey) vs. "With the plan" (green).
**Microcopy:** Before/after rows. You now: "{{blocker}}" / "Idea stuck in your head" / "Nothing to show". With the plan: "A clear build routine" / "A working app you made" / "Certificate of completion". Footnotes: "Estimated date based on your pace. Scope may change as you build." · "Certificate of completion. Not an accredited degree."
**CTA:** What's included

### 21. What's inside
**Purpose:** A bundle preview right before price. It includes the honest tool note and non-affiliation line.
**Headline A:** Everything to ship your app
**Headline B:** More than a coding course
**Body A:** Guided builds, practice, prompts, and a certificate.
**Body B:** Learn the tools, then ship something real.
**Visual:** 5 icon benefit rows with green checks, a tilted phone mockup of a build lesson (code pane + preview) on the right.
**Microcopy:** Benefit rows (only what the app ships; verify): "🔨 Guided daily builds, 10-30 minutes" / "🧰 Browser builders, Claude Code and Cursor basics" / "📋 Copy-ready build requests" / "🐞 Step-by-step bug fixing" / "🏅 Certificate of completion + project to show". Footer: "Coursiv is not affiliated with Anthropic, Cursor, Lovable or Bolt. Some tools may need their own account." (verify which tools need a paid account and say so)
**CTA:** Get my plan

---

## F. Monetization

### 22. Paywall
**Purpose:** The primary ask. Each card shows today's price and the renewal price and period at equal weight. No timer, no wheel, no promo code, no €1 trial.
**Headline A:** Start building, {{name}}
**Headline B:** Your first app starts today
**Body A:** Pick a plan. Cancel anytime from your account.
**Body B:** Your {{app_type}} ships by {{ship_date}}.
**Plans:**
- **1-week plan** — lowest entry price, for trying it. The card states "then renews at [regular 1-week price] every week". It renews at *its own* period and never rolls silently into a 4-week plan.
- **4-week plan** — pre-selected, covers the full first build, "MOST POPULAR" badge only if true. The card shows "[intro price] today, then [regular price] every 4 weeks".
- **12-week plan** — best per-day value, "BEST VALUE" badge, per-day price shown small, room for 2-3 more projects. The card shows "[intro price] today, then [regular price] every 12 weeks".
- Any struck-through price must be the real regular renewal price. Same structure as the base `learning/coursiv` funnel; use ikame's real prices at launch.
**Visual:** Top: a mini card with the phone preview of their app and the ship date. Three stacked plan cards, the 4-week one with an indigo border. The renewal line uses the same size and colour as the price. Payment row: Apple Pay / Google Pay / card logos.
**Microcopy:** Trust row: "🔒 Secure payment · Cancel anytime in 2 taps · [N]-day refund window". Agreement checkbox **unchecked**: "I agree to the Terms, Subscription and Refund Policy". Line above CTA, from the selected card: "You'll pay [today's price] today. It renews at [renewal price] every [period] until you cancel. We'll email you before each renewal." No "AI mentor" or "official certification" add-on toggles on this screen.
**Fallback offer:** On dismiss (✕ or back), the last-chance offer (#23) once per session: the 4-week plan at a lower first payment, renewal stated on the card. No countdown.
**CTA:** Get my plan

### 23. Last-chance offer (on paywall close)
**Purpose:** Second chance for users who close the paywall (✕ or back) without paying: the same 4-week plan at a lower first payment. Shown once per session, then never again.
**Headline A:** Wait, {{name}}: keep your ship date
**Body A:** Your {{app_type}} still ships by {{ship_date}}. Start building for a lower first payment.
**Plans:** One offer card: **4-week plan**, "The same full plan, a lower first payment". {{offer_price}} today, with the 4-week plan's real intro price ([4-week intro price], `compareAt: '4w'`) struck, then {{offer_renew_price}} every 4 weeks until cancelled. Optional {{offer_badge}} only if true.
**Visual:** Same web-page look as #22: sticky bar with the Coursiv logo and a close ✕, centered eyebrow "One-time offer · shown once", headline and lead, then one indigo-bordered offer card holding a mini build card (phone preview of their app · "{{idea}}" · "Ships by {{ship_date}}"), the plan name, the price row (struck intro price → {{offer_price}} "today"), 3 checks ("Guided daily builds, 10-30 minutes", "Step-by-step bug fixing", "Certificate of completion + project to show"), the CTA, Apple Pay / G Pay / VISA / Mastercard badges and the renewal line. Plain decline link below the card.
**Microcopy:** Renewal line: "{{offer_price}} today, then {{offer_renew_price}} every 4 weeks until you cancel. Cancel anytime in your account." Shown once per session (sessionStorage `ikf_offer_coursiv-vibe-coding`): a second paywall close goes straight to the previous screen (#21 What's inside). No timer: `CONFIG.offer.expiresMin` is `null`. If the growth team sets a real deadline, a countdown shows and the offer is withdrawn when it ends (`offer_expired`), never reset on reload. Decline (link and ✕): "No thanks, back to my build plan", which returns to #21 What's inside. Accept opens the offer checkout (`CONFIG.offer.checkoutUrl` with plan `offer`, email and UTMs); that checkout must show the same receipt rows as #24. Events: `paywall_close` (with `offerShown`), `offer_view`, `offer_accept` + `checkout_click` with plan `offer`, `offer_decline`, `offer_expired`.
**CTA:** Claim my offer

### 24. Checkout summary
**Purpose:** Confirms exactly what is charged today and later, before the card form. That cuts first-renewal refunds and chargebacks.
**Headline A:** Review your order
**Headline B:** Here's what you'll pay
**Body A:** Today's total and your renewal, spelled out.
**Body B:** No surprises. Cancel anytime before renewal.
**Visual:** Receipt-style card: plan name, today's total (incl. tax), next charge amount and **date**, "how to cancel" line; card / Apple Pay form below.
**Microcopy:** Receipt rows: "Today: [price + tax]" / "Renews {{renew_date}}: [renewal price + tax] every [period]" / "Cancel: Account → Subscription, web or app". No add-ons on this screen.
**CTA:** Pay securely

---

## G. Payoff

### 25. Welcome + app handoff
**Purpose:** Activation. Day 1 is "build v0.1 of {{app_idea}}", and the device answer decides whether Day 1 happens in the app or with a laptop link. A web sale that never builds anything turns into a refund.
**Headline A:** Welcome, builder {{name}}!
**Headline B:** Day 1: build v0.1
**Body A:** Get the app and log in with {{email}}.
**Body B:** Your first build lesson is ready now.
**Visual:** Green success check, phone mockup showing "Day 1 · {{app_idea}} v0.1", App Store / Google Play buttons, 3 numbered steps. For "Laptop" users, a secondary "Email me the laptop setup link" button.
**Microcopy:** Steps: "1. Install the app" / "2. Tap the login link in your email" / "3. Build v0.1 today". Receipt line: "Receipt and cancel link sent to {{email}}".
**CTA:** Get the app

---

## Notes

**Market + competitor evidence.** Kodree's claude-code funnel runs 19K ads, L3M +131%, and Codefinity is also active. "vibe coding" search is +42% and "learn python" +89% (US). **Kodree** `claude-code/get-started` (14 screens, 1,605 ads in the capture): "Have you ever tried Claude Code?" → goal → AI skill → tools (ChatGPT/Gemini, Lovable, Cursor, Terminal/CLI, Git) → "Master Claude Code in just 4 weeks" → task size → pace style → minutes (10/15/30/60) → theory vs. practice → "227,000+ people" → **yes/no: hands-on projects? AI mentor? official certification?** → paywall at 14. Prices seen: €79.99, €37.49, €39.99, €19.49, €9.49 and a **€1 / 7-day trial**. **Jobescape** `chat-v3` builder branch: "Had an idea for an app… couldn't build it?" → "What's stopped you? (can't code / developer too expensive / gave up, too technical)" → "Possible without coding?" → "Building an app has never been this easy", then "portfolio site?", "AI mentor?", email at 41 and paywall at 46, with a €6.93 intro for 28 days then €38.95 per 28 days.

**Deliberately not implemented.** Kodree's "official certification" wording (the certificate here is a certificate of completion); the yes/no "AI mentor / hands-on projects / certification" questions, which look like add-on pre-selling (unverified). If an add-on ever exists, it gets its own screen with equal-weight "No thanks" and is declared as its own sub. Also dropped: the €1 / 7-day trial into a recurring plan (hidden-billing exposure), timers, wheels and promo codes. No "build an app and earn" or "replace a developer" claims. The honest craft line ("AI code still needs testing") is kept on 2, 6 and 13.

**Trademark / affiliation.** Claude Code, Cursor, Lovable and Bolt are named only as plain-text tool names, with no logos. The non-affiliation line is on 21; add it to the paywall footer if legal asks. Say truthfully which tools need the user's own (possibly paid) account.

**Answers change the plan.** Screen 1 → `{{app_type}}`, template and lesson preview. Experience → level and dev fast-track. Tools → Week 1 setup, skipping known tools. Blocker → extra module time and "You now" row. Why build → final project framing and paywall echo. Idea → lesson, plan title, Day 1. Device → tool track (browser builders vs. Claude Code / Cursor) and handoff. Style → lesson order. Minutes → date. Level rubric: Never 0 / Excel 1 / Python 2 / Dev 3, plus 1 per correct check item. 0-1 First build, 2-3 Tinkerer, 4-5 Builder. Date: 10 min → today + 42 days, 15 → +28, 30 → +21 (confirm against real lesson lengths).

**Blocks skipped:** separate score bridge (folded into 19 to keep the build momentum), notification opt-in (web, pre-install), gamified wheel, post-purchase upsell, and password registration.

**Drop-off risk:** 8 (free-text idea, so it has chips and a skip), 18 (email), and 24 for "Phone only" users who later need a laptop. Keep browser builders sufficient for the first project.

**First A/B tests:** (1) Lesson with the user's own idea (15) vs. a fixed demo app. (2) First tap "What would you build?" vs. Kodree-style "Tried Claude Code?". (3) Email gate before the plan (18) vs. right after the lesson, framed as "save your build".

**Monetization:** one layer, the web subscription. Track paywall conversion, install + login + first build completed within 48h, and refund/chargeback rate by plan. Watch "Phone only" cohorts separately.

**Last-chance offer:** measure offer CVR (#23 `offer_view` → `offer_accept`) separately from paywall CVR (#22).

**Unverified / assumed:** which builder tools the app actually teaches and whether they need paid accounts; the template bank behind the lesson preview; live prices. All ikame stats are `[N]` placeholders until real.
