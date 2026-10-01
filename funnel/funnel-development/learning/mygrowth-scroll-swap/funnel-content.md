---
niche: mygrowth-scroll-swap
display_name: MyGrowth (Scroll-to-Learn Swap)
archetype: learning-plan
subject: person
input: daily screen time, biggest time app, after-scroll feeling, subject, level, 2 knowledge-check answers, scroll moment, reminder time, swap minutes, email
output: hours of scrolling redirected per month + 4-week plan slotted into the user's scroll window
screens: 23
monetization: web subscription (3 plans, 1-week intro / 4-week pre-selected / 12-week anchor, renewal shown beside every intro price); store-trial last-chance offer; activation (install + sign-in) measured separately
creative_screens:
  hook-a: 1
  hook-b: 2
  quiz: 4
  loading: 17
  reveal: 19
motion: >
  a thumb flicking an endless feed, one card flipping into a lesson, a five-minute
  ring filling, then a weekly bar dropping while a violet "hours repurposed"
  counter climbs
---

# Funnel Content — MyGrowth (Scroll-to-Learn Swap)

Same app and brand as `learning/mygrowth` (MyGrowth, EXTRAMILE LIMITED: 5-15 minute lessons in History, Biology, Psychology & habits, Communication, Everyday math, Art). This variant is the "swap doomscrolling for learning" angle. **References (adspylab, captured 2026-09-28):** Headway `/onboarding/start` (61 screens, paywall copy "Swap doomscrolling for bite-sized learning"), Deepstash `/growth-plan` (48 screens, doomscrolling in screen text), Nibble ads "Replace scrolling with <topic>" and the healthpost advertorial into Playa. The structure follows the shared learning-plan shape and reuses the `learning/mygrowth` quiz, knowledge checks, palette and verified store rating. **Deliberate differences from the competitors:** (1) the result is *calculated from the screen time the user states*, not a stock "72% ready" percentage; (2) no pseudo-science: no "dopamine detox", "brain rot" or "attention is broken" claims, and no shaming of the user's habit; (3) knowledge checks show the right answer and a fact straight away; (4) no fake discount, timer or "-60% applied" banner: plans show intro and renewal prices together; (5) the plan is built around the user's own scroll moment, one swap per day, not "quit scrolling". **Look:** identical to `learning/mygrowth`: white background, lavender panels `#EBE9F7`, violet gradient `#8488F4 → #7D73E3`, blue `#007BFF` chart line, orange `#FF9F00` accent. Copy rules apply throughout: headline ≤6 words, body ≤12 words, A/B on every screen.

Tokens: `{{name}}`, `{{screen_hours}}`, `{{top_app}}`, `{{subject}}`, `{{score_line}}`, `{{scroll_window}}`, `{{reminder_time}}`, `{{swap_minutes}}`, `{{hours_month}}`, `{{hours_week}}`, `{{email}}`, `{{price_1w}}`, `{{renewal_1w}}`, `{{price_4w}}`, `{{renewal_4w}}`, `{{price_12w}}`, `{{renewal_12w}}`, `{{offer_price}}`, `{{offer_renew_price}}`, `{{app_rating}}`, `{{rating_count}}`. Unset personal tokens fall back to: name "you", screen_hours "3", top_app "your feed", subject "History".

---

## A. Hook

### 1. Hook A — Swap 5 minutes
**Purpose:** Cold traffic from "replace scrolling" ads sees the exact swap promised in the ad, with no moralising.
**Headline A:** Swap 5 minutes of scrolling
**Headline B:** Scroll less, learn more
**Body A:** One quick lesson instead of one more feed.
**Body B:** Five-minute lessons that fit your day.
**Visual:** White background, MyGrowth logo top-left, rating strip. Phone-feed illustration on the left sliding into a lesson card on the right, last headline word in violet, violet CTA pinned bottom.
**Microcopy:** Rating strip: "★ {{app_rating}} · {{rating_count}} App Store ratings" (verified 4.5 / 2,400+ in the sibling brief; re-check at launch, never a geo-injected "Top app in {country}").
**CTA:** Start my quiz

### 2. Hook B — Small swaps add up
**Purpose:** Sets an honest, low-effort frame: swap one session, keep the rest.
**Headline A:** Small swaps add up
**Headline B:** Your scroll time, repurposed
**Body A:** Trade one scroll session a day for a lesson.
**Body B:** No detox, no rules. Just a better default.
**Visual:** Lavender panel with a day timeline; one scroll block highlighted violet and relabelled "lesson". Real app footage of a lesson card, not a stock phone.
**Microcopy:** Under CTA: "Takes about 2 minutes"
**CTA:** Continue

---

## B. Investment

### 3. Daily screen time
**Purpose:** The number the whole result is computed from. Asked early, taken from the user's own phone settings.
**Headline A:** How long are you scrolling?
**Headline B:** Daily screen time?
**Body A:** Check Settings, Screen Time. A guess is fine.
**Body B:** Roughly, on a normal day.
**Options:**
- 🌤️ Under 2 hours
- 📱 2-4 hours
- 🔥 4-6 hours
- 🌀 6+ hours
- ✏️ Other
**Field:** Single-select, auto-advance. Midpoints used in the calculation: 1.5 / 3 / 5 / 7 hours. "Other" opens a one-line hours input (0.5-16); CTA disabled while empty.
**Visual:** Stacked pills, small clock icon. Progress bar top.
**Microcopy:** Other placeholder: "Hours per day, e.g. 4.5"
**CTA:** Continue

### 4. Biggest time sink
**Purpose:** Names what the swap replaces; the answer becomes `{{top_app}}` in later copy.
**Headline A:** What eats most of your time?
**Headline B:** Your biggest time sink?
**Body A:** The one you open without thinking.
**Body B:** Pick the biggest, not the guiltiest.
**Options:**
- 🎬 Short videos
- 📸 Social feeds
- 📰 News & forums
- 💬 Messaging
- 🎮 Mobile games
- ✏️ Other
**Field:** Single-select, auto-advance. Other opens a one-line input, CTA disabled while empty.
**Visual:** 2-column grid of illustrated cards, Other as a full-width pill.
**Microcopy:** Other placeholder: "e.g. Online shopping"
**CTA:** Continue

### 5. After the scroll
**Purpose:** Lets the user say how it feels, in their words, without a verdict from us.
**Headline A:** How do you feel afterwards?
**Headline B:** After a long scroll, you feel…
**Body A:** Pick all that fit. No judgement here.
**Body B:** Pick all that fit.
**Options:**
- 😵 Drained
- 😬 A bit guilty
- 🕳️ Time vanished
- 😌 Totally fine
- ✏️ Other
**Field:** Multi-select, CTA disabled until one pick (Other needs text).
**Visual:** Stacked pills with right-side check circles.
**Microcopy:** Disabled-CTA hint: "Pick at least one to continue"
**CTA:** Continue

### 6. Bridge — Scrolling isn't the problem
**Purpose:** Reassurance: we are not asking them to quit. Sets the one-session swap expectation.
**Headline A:** Scrolling isn't the problem
**Headline B:** You don't need willpower
**Body A:** Keep what you enjoy. Swap just one session.
**Body B:** Lessons slot into scroll moments you already have.
**Visual:** Lavender panel, a feed card and a lesson card sitting side by side, both ticked.
**Microcopy:** "No detoxes. No brain-science claims. Just a small swap." Progress hint: "Step 1 of 3 done"
**CTA:** Continue

### 7. Name
**Purpose:** Gets `{{name}}` for the plan, loader, paywall hero and offer.
**Headline A:** What should we call you?
**Headline B:** What's your first name?
**Body A:** We'll put it on your plan.
**Body B:** First name is all we need.
**Field:** Text input, placeholder "First name", max 30 chars, autofocus. Empty tap shows the error and does not advance.
**Visual:** Plain white input with violet focus ring.
**Error state:** "Please enter a name to continue"
**CTA:** Continue

### 8. Subject to swap in
**Purpose:** Picks the course, the knowledge-check set (#10-11) and the paywall cover.
**Headline A:** What will you swap it for?
**Headline B:** Pick your first subject
**Body A:** Start with one, switch anytime.
**Body B:** Your plan starts here; change it whenever.
**Options:**
- 🏛️ History
- 🧬 Biology
- 🧠 Psychology & habits
- 💬 Communication
- ➗ Everyday math
- 🎨 Art
- ✏️ Other
**Field:** Single-select. Other opens a one-line input and routes to a mixed plan with the History checks; CTA disabled while Other is empty.
**Visual:** 2-column grid of illustrated subject cards, Other as a full-width pill.
**Microcopy:** Other placeholder: "e.g. Space, economics"
**CTA:** Continue

### 9. Starting level
**Purpose:** Sets difficulty and makes beginners welcome before the check.
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

### 10. Knowledge check 1 — sample lesson
**Purpose:** The product demo and the swap in miniature: one question, the real answer, one fact. Right = green, wrong = amber, never red.
**Headline A:** {{q1}} (question from the set below)
**Headline B:** Quick check, {{name}}
**Body A:** Tap your best guess; no pressure.
**Body B:** {{q1}}
**Options:** (3 per set)
| Subject | Q1 | Options | Answer | Fact card |
|---|---|---|---|---|
| History | When did the Berlin Wall fall? | 1961 · 1989 · 1999 | 1989 | Nov 9, 1989: a fumbled press briefing opened the border. |
| Biology | How many cells make you? | 37 million · 37 billion · 37 trillion | 37 trillion | About 37 trillion, and most are red blood cells. |
| Psychology & habits | How long to form a habit? | 21 days · 66 days · 1 year | 66 days | One study found 66 days on average, not 21. |
| Communication | Is 93% of talk nonverbal? | ✅ True · ❌ Myth | Myth | Myth: that study measured feelings, not everyday speech. |
| Everyday math | What's a 15% tip on $40? | $4 · $6 · $8 | $6 | Take 10% ($4), then add half of it ($2). |
| Art | Who painted The Starry Night? | Monet · Van Gogh · Picasso | Van Gogh | Painted in 1889 from his window at Saint-Rémy. |
**Field:** Single-select; CTA appears only after the fact card lands.
**Visual:** Subject illustration on top, pills beneath, lavender fact card slides up with a 💡 icon.
**Microcopy:** Fact label: right "✅ Nailed it" / wrong "💡 Here's the story"
**CTA:** Next question

### 11. Knowledge check 2 — sample lesson
**Purpose:** Second fact locks in "I learned something in 30 seconds" and gives #12 a real score.
**Headline A:** {{q2}}
**Headline B:** One more, {{name}}
**Body A:** Last one before your plan.
**Body B:** {{q2}}
**Options:**
| Subject | Q2 | Options | Answer | Fact card |
|---|---|---|---|---|
| History | Who said "I know nothing"? | Pythagoras · Aristotle · Socrates | Socrates | Socrates, via his student Plato: wisdom starts with doubt. |
| Biology | Which organ can regrow itself? | Heart · Liver · Brain | Liver | Your liver regrows even after surgeons remove over half. |
| Psychology & habits | Why do unfinished tasks nag? | Zeigarnik effect · Placebo effect · Halo effect | Zeigarnik effect | Unfinished tasks tend to stick in memory: the Zeigarnik effect. |
| Communication | Best way to show you're listening? | Nod a lot · Say it back · Give advice | Say it back | Paraphrasing shows you understood, so people feel heard. |
| Everyday math | Double 1¢ daily for 30 days? | About $10 · About $5,000 · Over $5 million | Over $5 million | Day 30 alone pays $5.37 million: that's compounding. |
| Art | How big is the Mona Lisa? | Poster-size · Door-size · Wall-size | Poster-size | Just 77 × 53 cm, smaller than most visitors expect. |
**Field:** Same as #10.
**Visual:** Same layout, second illustration.
**Microcopy:** Same feedback labels as #10.
**CTA:** See my result

### 12. Result bridge (computed from #10-11)
**Purpose:** Honest score, then the point: that took under a minute, about one swap.
**Headline A:** {{score_line}} (band table below)
**Headline B:** That took thirty seconds
**Body A:** That's one swap: quick and surprising.
**Body B:** Scroll time can feel like this.
**Visual:** Two fact cards stacked like flashcards, each with ✅ or 💡; light confetti only on 2/2.
**Microcopy:** Bands: 2/2 "Two for two, {{name}}!" · 1/2 "One right, one new fact" · 0/2 "Two new facts, zero effort". Progress hint: "Step 2 of 3 done"
**CTA:** Keep going

### 13. Scroll moment
**Purpose:** Finds the window where the swap happens: the heart of the personalisation. Becomes `{{scroll_window}}`.
**Headline A:** When do you scroll most?
**Headline B:** Your biggest scroll moment?
**Body A:** That's where your lesson goes.
**Body B:** We'll swap in that slot first.
**Options:**
- 🛏️ Waking up
- 🚌 Commute
- 🍱 Lunch break
- 🛋️ Evening couch
- 🌙 In bed at night
- ✏️ Other
**Field:** Single-select. Other opens a one-line input ("e.g. Waiting rooms"), CTA disabled while empty.
**Visual:** A day-clock with the chosen window glowing violet.
**Microcopy:** Other placeholder: "e.g. Waiting rooms"
**CTA:** Continue

### 14. Reminder slot
**Purpose:** One in-app reminder inside that window (web funnel, so no push permission yet).
**Headline A:** Pick your reminder time
**Headline B:** When should we nudge you?
**Body A:** One nudge, right when you'd scroll.
**Body B:** Change or switch it off anytime.
**Options:** (three times per window, set by #13)
| Window | Times |
|---|---|
| Waking up | 07:30 · 08:00 · 08:30 |
| Commute | 08:00 · 08:30 · 17:30 |
| Lunch break | 12:15 · 12:45 · 13:15 |
| Evening couch | 19:00 · 20:00 · 21:00 |
| In bed at night | 21:30 · 22:00 · 22:30 |
| Other | 08:00 · 12:30 · 20:00 |
- ✏️ Other time
**Field:** Single-select; "Other time" opens a time picker, CTA disabled until a time is set. Sets `{{reminder_time}}`.
**Visual:** Pills with a clock on the right.
**CTA:** Continue

### 15. Swap size
**Purpose:** The commitment tap; sets `{{swap_minutes}}`, which makes the result a calculation.
**Headline A:** How many minutes will you swap?
**Headline B:** Your daily swap
**Body A:** A small swap beats a big plan.
**Body B:** You can change it anytime in the app.
**Options:**
- 👍 Casual · 5 min/day
- 👌 Regular · 10 min/day
- 🤘 Serious · 15 min/day
- 💪 Determined · 20 min/day
**Field:** Single-select, nothing pre-selected.
**Visual:** Four wide cards, minutes in a small grey line.
**Microcopy:** "Most lessons take 5-15 minutes."
**CTA:** Set my swap

---

## C. Trust

### 16. Social proof
**Purpose:** Trust beat before the loader, public checkable numbers only.
**Headline A:** Rated 4.5 on the App Store
**Headline B:** Learners give it 4.5 stars
**Body A:** From 2,400+ ratings by people like {{name}}.
**Body B:** Lessons short enough to finish over coffee.
**Visual:** Large "{{app_rating}}" with star row and laurel, App Store and Google Play badges, one real review card.
**Microcopy:** Quote from the sibling brief (confirm reuse rights): "It beats mindless scrolling. You learn while you scroll!" — Kare. No invented user counts.
**CTA:** Continue

---

## D. Anticipation

### 17. Building the plan (loading)
**Purpose:** Makes the plan feel assembled from the answers; rows name the user's own picks.
**Headline A:** Building {{name}}'s swap plan…
**Headline B:** Slotting lessons into {{scroll_window}}…
**Steps:**
- Counting your daily scroll minutes…
- Matching lessons to your slot…
- Choosing {{subject}} lessons you'll love…
- Almost ready, your plan awaits…
**Visual:** A feed stack shuffling into lesson cards; four progress rows; two real reviews rotating beneath.
**Microcopy:** Carousel header: "★ {{app_rating}} on the App Store"
**CTA:** (auto-advances, ~6 seconds)

---

## E. Gate

### 18. Email
**Purpose:** Web checkout needs an identity that later unlocks the app; asked after the loader at peak curiosity.
**Headline A:** Where should we send it?
**Headline B:** Save your plan, {{name}}
**Body A:** Your email unlocks your plan in the app.
**Body B:** You'll sign in with this email later.
**Field:** Email input (email keyboard, autofocus), "Continue with Apple" / "Continue with Google" above. Separate **unchecked** marketing checkbox.
**Visual:** Blurred swap chart behind a white sheet holding the field.
**Error states:** "Please enter a valid email address" / "This email already has a plan. Check your inbox."
**Microcopy:** Under CTA: "Used only for your account. No spam." + Terms · Privacy links.
**CTA:** Show my plan

---

## D. Reveal

### 19. Your scroll-to-learn swap
**Purpose:** The result: hours of scrolling redirected per month, calculated from #3 and #15, drawn as a before/after weekly bar.
**Headline A:** {{hours_month}} hours a month, repurposed
**Headline B:** Your swap, in hours
**Body A:** Based on your {{screen_hours}} hours and {{swap_minutes}} minutes.
**Body B:** An estimate from what you told us.
**Visual:** Two vertical bars, "Today {{screen_hours}} h/day" and "With swap", the cut segment in violet labelled "{{swap_minutes}} min → lessons"; below it a big violet "{{hours_month}} h / month" and a small "{{hours_week}} h / week".
**Microcopy:** Formula, shown on screen: "{{swap_minutes}} min × 30 days ÷ 60. Hours redirected from what you already spend, not extra free time. Your real screen time will vary." No "brain", "dopamine" or "attention" claims.
**CTA:** See my plan

### 20. Your 4-week plan
**Purpose:** Turns the number into a ramp tied to the user's own scroll moment.
**Headline A:** {{name}}'s 4-week swap plan
**Headline B:** Built around {{scroll_window}}
**Body A:** One lesson a day, right where you scroll.
**Body B:** Week by week, building to a daily swap.
**Visual:** Four week rows with a day dot strip: Week 1 swap 3 days, Week 2 swap 5, Weeks 3 and 4 every day (22 swaps, each `{{swap_minutes}}` min). Chips: Subject · Level · Window · Reminder `{{reminder_time}}`. Footer line "22 swaps · X hours in 4 weeks" computed.
**CTA:** Start my plan

---

## F. Monetization

### 21. Paywall
**Purpose:** Long-scroll web sales page. Intro and renewal prices sit side by side on every plan; no struck-through "reference" prices, no timer. Final prices are the growth team's call, so the page shows tokens.
**Headline A:** {{name}}, start your swap today
**Headline B:** Your {{subject}} swap plan
**Body A:** Every price and renewal shown before you pay.
**Body B:** {{hours_month}} hours a month, one lesson a day.
**Plans:** (structure only, prices are tokens)
- **1-week plan** intro `{{price_1w}}`, then `{{renewal_1w}}` per week.
- **4-week plan**: **pre-selected**, intro `{{price_4w}}`, then `{{renewal_4w}}` every 4 weeks. "MOST POPULAR" only if sales data backs it.
- **12-week plan**: anchor, intro `{{price_12w}}`, then `{{renewal_12w}}` every 12 weeks.
- Plans are named by the period they bill. No fake "was" price.
**Page structure (top to bottom):** brand bar (logo + close ✕) · personal hero (course cover, "{{hours_month}} h a month" chip, `{{scroll_window}}` · `{{swap_minutes}}` min/day) · plan block · what's inside · how it works (3 steps) · proof (rating + real review cards) · guarantee · FAQ · plan block repeated · sticky CTA.
**Visual:** Same web look as the rest of the funnel. Radio plan cards, violet border on the selected one, payment-method row (Apple Pay / PayPal / card), safe-checkout badges. No countdown bar.
**Microcopy:**
- Line above the sticky CTA: "{{price_4w}} today. Then {{renewal_4w}} every 4 weeks until you cancel." (follows the selected plan)
- Trust row: "🔒 Secure checkout · Cancel online anytime · Money-back guarantee"
- What's inside (shipped features only): "5-15 minute lessons in 6 subjects" · "Read or listen to every lesson" · "Quizzes and games" · "Streaks and achievements" · "In-app reminder at {{reminder_time}}"
- How it works: 1 "Pick your plan" · 2 "Sign in with {{email}}" · 3 "Swap your first scroll"
- Guarantee: conditions written in plain words on the page (the sibling funnel's live guarantee is 30-day; confirm the exact terms before launch).
- FAQ: "How do I cancel?" → "Profile → Settings → Manage subscription, or the link in your receipt." · "Will it renew?" → "Yes, at the renewal price shown, until you cancel. We email you before every renewal." · "Do I have to quit scrolling?" → "No. You swap one session."
**Fallback offer:** On close, the last-chance offer (#22) once per session. No timer.
**CTA:** Start my plan

### 22. Last-chance offer (on close)
**Purpose:** Second chance for users who close the page without paying: the store app's own 7-day free trial, terms shown. No extra discount. Shown once per session, then never again.
**Headline A:** Wait, {{name}}: try it free first
**Headline B:** Try your swap plan free
**Body A:** Start with 7 days free in the app.
**Body B:** Seven days of lessons before you pay anything.
**Plans:** One offer card: **7-day free trial in the app**, billed by the store; {{offer_price}} for 7 days, then {{offer_renew_price}} until cancelled. No struck-through price.
**Visual:** Same web look as #21: sticky bar with logo and ✕, eyebrow "One-time offer · shown once", one violet-bordered card with course thumbnail, checks, store badges, renewal line, text link "No thanks, back to my plan".
**Microcopy:** "{{offer_price}} for 7 days, then {{offer_renew_price}} until you cancel. Cancel anytime in your store subscriptions." Shown once (sessionStorage `ikf_offer_mygrowth-scroll-swap`); `CONFIG.offer.expiresMin` is `null`, no timer.
**CTA:** Claim my offer

---

## G. Payoff

### 23. Get the app
**Purpose:** Web buyers who never sign in refund; the first job after paying is lesson 1 with the same email.
**Headline A:** You're in, {{name}}!
**Headline B:** Last step: open the app
**Body A:** Get the app and sign in with {{email}}.
**Body B:** Your first swap is waiting inside.
**Visual:** Green check over the logo, 3 numbered steps (Download · Tap the sign-in link we emailed · Start lesson 1), store badges, QR for desktop, phone mockup of lesson 1.
**Microcopy:** "Receipt sent to {{email}}" · "Your {{reminder_time}} reminder turns on in the app." · "Manage or cancel anytime" link.
**CTA:** Open the app

---

## Notes

- **Unverified:** the research marks the Headway, Deepstash and Nibble screens as observed (V); nothing here is inferred, but the plan-ramp (3/5/7/7 days) and the hours formula are this brief's own design, not a competitor's. Prices are tokens; the 1-week / 4-week / 12-week structure mirrors the Skillsta/Headway-style ladder, not MyGrowth's live 1/3/6-month Stripe plans, so confirm with growth before launch.
- **Honesty guardrails:** hours are "redirected", not "gained"; the formula and the estimate caveat are on screen #19; no dopamine, brain-rot, attention-damage or "93% faster" claims; the knowledge-check feedback follows the real answer.
- **Dropped competitor mechanics:** "-60% applied" banner and struck reference prices, percent-ready bars, expert personas, resetting timers.
- **Measure:** quiz completion by screen, #19 to #21 reach, paywall conversion per plan, offer accept rate, activation (install + sign-in + first lesson within 48 h), first-renewal retention at full price, refund rate.
- **Demo (private Artifact):** https://claude.ai/artifact/SCiW4BcC8SDmDdZDdPWxLC
