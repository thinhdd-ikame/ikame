---
niche: calmio-life-planner
display_name: Calmio - Life Planner for the Overwhelmed (AI wellbeing companion - 18+)
archetype: personalization-quiz
subject: person
input: age (18+ gate), where it piles up, how it feels, what is left undone, real free time, best energy time, how they put things off, what a good week looks like, name, email
output: an overwhelm profile (Sprinter, Planner, Juggler or Freezer) plus "this week, 3 things" and a 4-week reset plan, and a first chat that breaks one big task into small steps
screens: 21
monetization: one plan subscription (1-week intro / 4-week pre-selected / 12-week anchor, renewal shown on every price, pre-renewal email), dismissible web paywall, one one-time "Reset Week" pass on close (paid once, no renewal, no timer), no other upsell layer
creative_screens:
  hook-a: 1
  hook-b: 2
  loader: 15
  reveal: 16
  first-chat: 18
motion: >
  a pile of scattered sticky notes and floating to-do lines slowly sorts itself
  into three neat cards while a sage flower bud opens, and a soft chat bubble
  types "Let's make it smaller."
---

# Funnel Content - Calmio: Life Planner for the Overwhelmed

Calmio is a chat-based AI companion for reflective conversation (18+, "a companion, not a therapist"). This is the **overwhelm / life-admin** niche: the user whose to-do list has outgrown their week (work, home, family, money, health) and who is stuck on where to start. They give a handful of easy taps. They get an **overwhelm profile** (Sprinter, Planner, Juggler or Freezer), a list of **"this week, 3 things"** sized to their real free time, and a **4-week reset plan**. Before the paywall they do a real 3-minute chat in which Calmio breaks one big task into small steps. **Archetype: personalization-quiz** (Calmio mental-health variant, as in `mental-health/calmio` and `mental-health/calmio-overthinking`): money is a plan subscription sold after a data quiz, not a per-message meter. It borrows the first live conversation from companion-chat. 21 screens, A/B copy on every one.

**Reference funnels (competitor teardown, AdSpyLab Funnels Library, via `calmio.md` section 6-7 and `gaps.md` section 4):** Chillio house-ai (37/54 screens) and Chillio life-ai-assistant (46 screens). Their spine (overload areas, what is left undone, available time, how you procrastinate, name, loader, profile, email, chat, paywall) is kept. Competitor screens are verified from AdSpyLab captures, not live.

**Deliberately different from the references:** no pre-set scratch-card discount, no 10-minute countdown, no promo code, no "-60% applied" against a never-charged anchor, no PhD or "expert coach" persona. No "overwhelm score", gauge or clinical label: the profile is a reflection with four soft styles. No outcome claims ("get 10 hours back"). Plan items are suggested goals sized to the user's own free time, never promises. A real chat runs before the paywall, renewal terms sit next to every price, and "Need help now?" is on every screen and never paywalled.

**Visual override (same as `mental-health/calmio`):** soft light theme, warm off-white, sage green and muted lavender, rounded sans, lots of air, the flower as the one hero object. The overwhelm feel comes from a drifting pile of sticky notes in the hook, not from a dark or loud UI.

---

## A. Hook

### 1. Hook A - Too much
**Purpose:** Meet the "everything at once" before-state with the brand promise, without asking for anything.
**Headline A:** Too much on your plate?
**Headline B:** Where do you even start?
**Body A:** A calm companion that makes big things small.
**Body B:** Talk it out. Get three small steps.
**Visual:** Warm off-white with a lavender wash. A loose pile of sticky notes and thin to-do lines drifts at the top, then slowly lines up into three tidy cards. A sage flower bud breathes beneath. One soft bubble: "Let's make it smaller." Sage button pinned bottom. "Need help now?" link top-right, persistent on every screen to #21.
**Microcopy:** Under CTA: "18+ · Calmio is AI and not a substitute for professional care". "Need help now?" opens the crisis sheet: "Call or text 988 (US) · Outside the US: findahelpline.com · In danger now? Call your local emergency number." One tap, no sign-in, no paywall.
**CTA:** Get started

### 2. Hook B - Big to small
**Purpose:** Show the core surface (one chat that shrinks a task) so the user knows what they would be doing.
**Headline A:** Big task, tiny steps.
**Headline B:** Make it smaller together.
**Body A:** Pick one thing. Calmio breaks it down.
**Body B:** A short chat and a three-step start.
**Visual:** Card on off-white with three chat bubbles fading in (user: "I haven't opened the paperwork in weeks." / Calmio: "Let's start with one stack. Just 10 minutes." / user typing dots). "AI companion" chip above, a small desk photo on the card.
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
**Purpose:** The honest expectations beat and the safety net, placed before the questions about feelings. It is also the trust screen the category most needs.
**Headline A:** A companion, not a therapist
**Headline B:** Before we begin, one promise
**Body A:** It helps you sort and reflect. It doesn't diagnose or treat.
**Body B:** For crisis or medical care, please reach real people.
**Visual:** Four icon rows on a white card (chat bubble, lock, lifebuoy, list). Sage icons, generous spacing, nothing else on screen.
**Microcopy:** Rows: "Calmio is AI, and always says so" · "Your chats stay private" · "In crisis? Call or text 988 (US) or visit findahelpline.com" · "Calmio helps you plan. It does not give medical, legal or financial advice." Footer: "Calmio does not provide medical advice, diagnosis or treatment."
**CTA:** I understand

### 5. Where it piles up
**Purpose:** The first cheap tap. It frames the problem in the user's own life and sets `{{areas}}`, reused in the profile and the paywall hero.
**Headline A:** What feels like too much?
**Headline B:** Where is it piling up?
**Body A:** Pick all that weigh on you.
**Body B:** Choose any. Nothing here is judged.
**Options:**
- 💼 Work
- 🏠 Home
- 👨‍👩‍👧 Family
- 💸 Money
- 🩺 Health
- ✏️ Other
**Field:** Multi-select, min 1 to enable the CTA. "Other" opens a one-line input; the CTA stays disabled until it has text. Free text passes through crisis-language detection before continuing.
**Visual:** Two-column soft chip grid, selected chips get a sage border and a check. A small closed bud sits at the top.
**Microcopy:** Disabled-CTA hint: "Pick at least one". Crisis detection on "Other": if matched, show the crisis sheet from #1 with "Talk to a person now" first and "Continue with Calmio" second. Never block the user, never ask them to explain.
**CTA:** Continue

### 6. How it feels
**Purpose:** Names the feeling in neutral words so the user feels understood. Used only to word the plan tone, never as urgency.
**Headline A:** What's it like inside?
**Headline B:** How does it feel?
**Body A:** Pick the closest one.
**Body B:** No wrong answer. Just right now.
**Options:**
- 🪨 Heavy
- 🌪️ Scattered
- 😶 Flat
- ⚡ Wired
- ✏️ Other
**Field:** Single select, auto-advances on tap. "Other" opens a one-line input, CTA disabled while empty, crisis-checked.
**Visual:** Stacked soft pill rows, white fill, selected row fills sage with a check.
**CTA:** (auto-advances on tap)

### 7. What's undone
**Purpose:** The personalization core. The picks become the three things for this week and the big task in the chat. Phrased as "sitting undone", never as failure.
**Headline A:** What are you putting off?
**Headline B:** What's sitting undone?
**Body A:** Pick all that apply.
**Body B:** Choose any. No guilt here.
**Options:**
- 📬 Messages & emails
- 🧾 Paperwork & bills
- 🧺 Chores & home
- 📅 Appointments
- 💳 Money tasks
- ✏️ Other
**Field:** Multi-select, min 1. "Other" opens a one-line input, CTA disabled while empty, crisis-checked.
**Visual:** Stacked pills with a small line icon each, selected ones fill sage.
**Microcopy:** Disabled-CTA hint: "Pick at least one".
**CTA:** Continue

### 8. Bridge - not lazy
**Purpose:** A reassurance beat after the heaviest question and before the practical ones. It lowers shame so the next answers are honest. No claim, no statistic.
**Headline A:** You're not lazy.
**Headline B:** Too much is just too much.
**Body A:** A full plate is hard to start. Let's size it.
**Body B:** Next: your real time and your style.
**Visual:** Centered flower bud opening slowly, one soft line of text, nothing else. Plenty of air.
**CTA:** Continue

### 9. Real free time
**Purpose:** Sets `{{free_time}}`, which sizes every item in the plan so it fits real life.
**Headline A:** Real free time per day?
**Headline B:** How much time is truly yours?
**Body A:** Be honest. We plan around it.
**Body B:** Not what you wish you had.
**Options:**
- ⏱️ Under 30 min
- 🕐 30-60 min
- 🕑 1-2 hours
- 🌊 It changes daily
**Field:** Single select, auto-advances. Sets task size: 10 · 15 · 20 · 15 minutes.
**Visual:** Four pills with a small clock-fill that grows down the list.
**CTA:** (auto-advances on tap)

### 10. Best time of day
**Purpose:** Sets `{{best_time}}`, used for the one-thing slot and the optional reminder.
**Headline A:** When do you have energy?
**Headline B:** When are you at your best?
**Body A:** We'll nudge you then.
**Body B:** Your one-thing slot lands here.
**Options:**
- 🌅 Mornings
- ☀️ Midday
- 🌆 Evenings
- 🔀 It varies
**Field:** Single select, auto-advances. Sets `{{nudge}}`: 8:00 AM · 12:30 PM · 6:30 PM · 9:00 AM.
**Visual:** Four pills with a sun-to-dusk gradient down the list.
**CTA:** (auto-advances on tap)

### 11. How you put things off
**Purpose:** Picks the profile. The answer is a soft style, never a diagnosis.
**Headline A:** How do you put things off?
**Headline B:** What does stalling look like?
**Body A:** Pick the closest one.
**Body B:** Everyone has a pattern.
**Options:**
- ⏳ Wait till it's urgent
- 📝 Plan, never start
- 🤹 Start many, finish few
- 🧊 Freeze at the start
- ✏️ Other
**Field:** Single select, auto-advances. "Other" opens a one-line input (CTA disabled while empty, crisis-checked) and maps to the Juggler default.
**Visual:** Stacked pills with a small line icon each.
**Microcopy:** Mapping: wait -> Sprinter, plan -> Planner, many -> Juggler, freeze -> Freezer, other -> Juggler.
**CTA:** (auto-advances on tap)

### 12. A good week
**Purpose:** Sets `{{goal}}` so the plan is aimed at what the user wants, not at a generic ideal.
**Headline A:** A good week looks like…
**Headline B:** What would help most?
**Body A:** Pick the one that matters.
**Body B:** This shapes your plan.
**Options:**
- ✅ Catching up
- 🎈 Feeling lighter
- 📋 Staying on top
- 🌿 Space for me
- ✏️ Other
**Field:** Single select, auto-advances. "Other" opens a one-line input, CTA disabled while empty, crisis-checked.
**Visual:** Stacked pills, selected fills sage. "Two more steps" chip below.
**CTA:** (auto-advances on tap)

### 13. Name
**Purpose:** Captures `{{name}}`, which Calmio uses in the profile and the first chat. A skipped name falls back to "you".
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

### 14. Private by design
**Purpose:** The trust beat after the investment stage and before the reveal. Proof has to be real; this category is where fake experts and fake stats do the most harm. The rating block ships only when real store data exists.
**Headline A:** Private. Judgment-free. Yours.
**Headline B:** Your list stays yours.
**Body A:** Your chats stay private. Nothing is ever public.
**Body B:** No judging, no streak guilt.
**Visual:** Three lucide rows (lock, eye-off, trash) on a white card. The row "delete" ships only if in-app deletion exists. When `{{app_rating}}` and `{{rating_count}}` are real, a rating card with a real store review appears above the rows; while they are tokens the card is hidden.
**Microcopy:** Pull rating and count live from this app's own store listing, never hardcode, never in the headline. Review cards are real store reviews only, quoted as shown. No press logos, no "expert" or staff photos unless each is a real, named, credentialed person.
**CTA:** Continue

---

## D. Anticipation

### 15. Sorting your plate (loading)
**Purpose:** The wait makes the profile feel built from the answers and gives the strongest ad frame (notes sorting into cards under a blooming flower).
**Headline A:** Sorting {{name}}'s plate…
**Headline B:** Building {{name}}'s reset plan…
**Steps:**
1. Reading what's on your plate… - 0→100%
2. Finding where to start… - 0→100%
3. Sizing steps to your time… - 0→100%
4. Almost ready, your plan awaits… - 0→100%
**Visual:** The flower bud blooms in the top half, the one hero object with depth and slow 3D motion. Everything else fades. Four progress rows beneath: label left, % right, check when done, thin sage bars. Chips from their answers ("Work", "Paperwork & bills", "Under 30 min") float up and fade. With no name, "Sorting your plate…".
**CTA:** (auto-advances, ~6-8 seconds)

### 16. Your overwhelm profile
**Purpose:** The personalized result: a reflection and three small goals, never a verdict or a score. It makes the paywall's "what you get" concrete and traceable to the answers.
**Headline A:** You're a {{profile}}
**Headline B:** This week, three things
**Body A:** {{profile_line}}
**Body B:** Goals sized to your time. Change them anytime.
**Visual:** Top: flower illustration card with the profile name and four fact chips (heaviest area, how it feels, time per day, best time). Under it a vertical list of three numbered cards, "This week, 3 things", each with a task and a size ("10 min"). Below: the four week titles of the reset plan, week 1 open. Footer: "A reflection, not a diagnosis. A starting point you can change."
**Microcopy:** Profiles: Sprinter ("You work best at the deadline, but it wears you out.") · Planner ("Your lists are great. Starting is the hard part.") · Juggler ("Lots of things open, few of them closed.") · Freezer ("Big tasks feel like walls, so you wait."). The three things come from #7 (one per picked area, then defaults), sized by #9; they are suggested goals, never promises. Never a score, gauge, percentage or clinical label.
**CTA:** Continue

### 17. Save your plan (email)
**Purpose:** Captures identity so the profile, plan and chats persist, while the result is still warm.
**Headline A:** Where should we send it?
**Headline B:** Save your reset plan
**Body A:** Your profile and three things, kept safe.
**Body B:** No spam. Unsubscribe anytime.
**Field:** Email input. Marketing opt-in checkbox, unchecked by default: "Send me tips by email (optional)".
**Visual:** White input on off-white, the small bud above the headline. "Need help now?" still visible top-right.
**Error states:** "Enter a valid email address" · "That email has an account, sign in instead?"
**Microcopy:** Legal line: "By continuing you agree to the Terms and Privacy Policy."
**CTA:** Continue

### 18. First chat - make it smaller
**Purpose:** A taste of the product before the paywall: two real exchanges (about three minutes) in which Calmio shrinks one big task into steps, using `{{name}}`, the user's own undone items and `{{free_time}}`. It proves the product before the price.
**Headline A:** Make one thing smaller
**Headline B:** Your first 3-minute chat
**Body A:** Tap a reply or write your own.
**Body B:** Say as much or as little as you like.
**Options:** (replies come from #7)
- the user's first two picks from #7 (for example "My messages", "The paperwork")
- Everything at once
- ✏️ Type your own
**Visual:** Chat screen on off-white, a "3 min" chip. AI-disclosure banner pinned top, opening bubble ("Hi {{name}}. Pick one thing that feels too big. I'll help shrink it."), reply-idea rows above the composer. After the first reply Calmio names three tiny steps, sizes the first to `{{free_time}}` and asks "Could you do that?" (replies: "Yes, I could" · "Still too big"). After the second it closes warmly with the steps listed ("Tomorrow we take the next one.") and the paywall opens.
**Microcopy:** Banner: "Calmio is an AI companion, not a therapist. In crisis? Call or text 988." Crisis language in any message pauses the scripted flow and shows the crisis sheet, human resources first; that path shows no sales line and, if the paywall is later closed, no one-time offer. After a crisis the screen shows a quiet "Skip to my plan" link. Calmio never says "I miss you" or "don't leave".
**Skip link:** Skip to my plan (shown only after a crisis message)
**CTA:** (auto-advances after 2 exchanges)

---

## F. Monetization

### 19. Paywall (web sales page)
**Purpose:** The one ask, as a long-scroll web page, placed right after the first chat. It sells the 4-week reset plan; every price and renewal term sits on the page in readable type.
**Headline A:** Your reset plan is ready
**Headline B:** {{name}}, start your reset
**Body A:** Four weeks of small steps and chats, made for you.
**Body B:** Price shown upfront. We remind you before renewing.
**Plans:** 1-week intro · **4-week, pre-selected** (matches the 4-week plan, ribbon "Matches your plan") · 12-week anchor. Every card shows `{{price_*}}` big and `then {{renewal_*}} / period` right under it, plus a per-week equivalent `{{week_*}}`. No percent-off badge, no struck price, no decoy.
**Visual:** Sticky brand bar with close (×) and the persistent "Need help now?" link. Sections in order: personal hero (their profile card and four fact chips: heaviest area, free time per day, best time, plan length) · plan block (cards, "Due today" row, CTA, payment badges, secure/cancel row, renewal line) · what's inside (the four weeks as a TOC) · how it works (3 steps) · proof (rating and reviews, shown only when real, hidden while tokens) · refund block (shown only when `refundDays` and terms are real) · FAQ (is this therapy, does it do my tasks for me, how to cancel, will I be charged again, are chats private, what if I'm in crisis) · plan block again · legal. A sticky bottom CTA slides up while no plan block is visible.
**Microcopy:** Under the CTA at body size: "Renews at {{renewal_4w}} every 4 weeks until you cancel. Cancel anytime in your account." Reminder line: "We'll email you before every renewal." Always shown: "Crisis resources are always free." Not shown on this page: timers, promo codes, "no charge yet" wording, usage counters, outcome claims.
**Fallback offer:** #20. Every way off this page without paying (× and "Not now") goes to #20 first, once per session. Declining it, or closing the paywall a second time, leads to #21 in free mode.
**CTA:** Start my plan

### 20. One-time offer - Reset Week pass (shown on close)
**Purpose:** A second, smaller chance for people who closed #19 because a subscription felt like a lot. Shown once, never after crisis language.
**Headline A:** Just need a reset week?
**Headline B:** One-time offer, shown once
**Body A:** A smaller pass, paid once. No subscription.
**Body B:** One week, your three things.
**Plans:** One offer card, a different and smaller product than any paywall tier: `{{offer_name}}` (the Reset Week pass), `{{offer_price}}` paid once, 7 days, no renewal, no strike-through price (there is no same-length plan to compare to). Includes this week's three things, Calmio chats to break tasks down for the week, and the plan saved to the email. Not included (stated on the card): the 4-week reset plan, weekly resets, reminders. Optional `{{offer_badge}}`. It is not the 1-week intro tier, which auto-renews.
**Visual:** Same web look as #19: sticky bar with close ×, Calmio wordmark and "Need help now?". Centered eyebrow "One-time offer · shown once", one sage-bordered card with a calm thumbnail, offer name, price row ("once"), 3 checks, a "Not included" line, CTA, payment badges, a "paid once, nothing to cancel" line (and a refund line only when `refundDays` is real). Below: "Crisis resources are always free."
**Microcopy:** No timer: `CONFIG.offer.expiresMin` stays null, and there is no "last chance", "offer ends" or "don't miss out" wording. Never shown after crisis language (free text or the #18 chat). Merely opening "Need help now?" does not suppress it. Decline link: "No thanks, keep the free plan". Events: `offer_view`, `offer_accept` + `checkout_click`, `offer_decline`.
**CTA:** Get the reset week

---

## G. Payoff

### 21. Your week starts now
**Purpose:** Close the loop and drop the user into the first of their three things, so the first session ends inside the product.
**Headline A:** Your week starts now
**Headline B:** Welcome in, {{name}}
**Body A:** First up, one small thing. Start when ready.
**Body B:** Come back anytime. Calmio is here.
**Visual:** Calm light photo header fading to off-white, the 3D flower fully open as the hero. A "Today's one thing · {{free_time}}" card with the first task, a reminder row (toggle off by default) "Remind me at {{nudge}}", tab bar below (Today, Chat, Plan, Me).
**Microcopy:** Subscribers get the full plan and the weekly reset. Free mode shows the first task and a quiet "Unlock your plan" row, never a pop-up. No rating prompt here; ask only after a finished task on day 3 or later. Reminder push text carries no topic words (no "overwhelmed", no task names), max one a day, no guilt.
**CTA:** Start my first step

---

## Notes

- **Archetype call.** Plan subscription after a data quiz -> personalization-quiz, Calmio variant (see Known variants in `archetypes/personalization-quiz.md`). Borrowed from companion-chat: the first live chat before the paywall (#18). Skipped from the default: decoy tier, countdown upsell, before/after screen, separate premium-preview screen (the three things on #16 do that job), gamified wheel.
- **Mental-health safety, built in.** "Need help now?" on all 21 screens and on the web paywall and offer bars · expectations screen (#4) before any feeling question · crisis detection on every free-text field (#5, #6, #7, #11, #12, #18) · minors blocked with youth resources (#3) · no medication questions · no clinical labels, scores or gauges. Crisis help is never behind the paywall. Clinical and legal review should cover #3, #4, #16 and the crisis sheet, including non-US helplines.
- **Competitor mechanics - reference only, NOT implemented:** pre-set scratch-card discount, 10-minute countdown, personalised promo codes, "-60% applied" against a never-charged anchor, a PhD or "expert coach" persona, fake social-proof tickers.
- **Plans are placeholders.** The structure (1-week / 4-week pre-selected / 12-week anchor) mirrors the competitor layout. All prices are `{{price_*}}` / `{{renewal_*}}` tokens. The real Calmio store lists 1-month and 3-month SKUs (see `mental-health/calmio`); align SKUs before launch. The offer's one-time SKU `{{offer_price}}` must exist as a non-renewing product at checkout. Renewal is shown beside every price and a pre-renewal email is promised, so it must be built.
- **Unverified.** Calmio's real in-app onboarding, the free-tier scope (the demo assumes one task and the 3-minute chat stay free), the app-store rating, the refund window and the review texts were not viewable; rating, reviews and refund blocks are token-gated and hidden until real values exist. Competitor flows are verified from AdSpyLab captures, not live. The question order after #5 follows the research summary; the exact Chillio screen order is partly inferred (unverified).
- **Style mapping is our own design,** not taken from a competitor: one answer (#11) picks one of four reflective styles; it needs clinical review. It is never shown as a number or label of severity.
- **Images:** `gen_images.py` is ready, but no `IKAME_AI_KEY` was available when this demo was built, so `img/` holds calm stand-in photos copied from `mental-health/calmio-stress` under the same names. Run `IKAME_AI_KEY=... python3 gen_images.py --force` to replace them.
- **Drop-off risk:** #3 age gate · #5-#12 eight taps in a row (kept to one tap each, bridge at #8) · #17 email · #19 paywall. Keep #15 at 6-8 s.
- **Measure separately:** paywall CVR at #19 · offer CVR at #20 (apart from #19) · free-mode to subscribe later · D1/D7 return at the nudge time · refund and chargeback rate (the honesty metric).
- **A/B first:** (1) #1 "Too much on your plate?" vs "Where do you even start?" (2) #18 chat before vs after #17. (3) #16 with vs without the fact chips. (4) #19 4-week pre-selected vs 12-week pre-selected.
- **Demo (private Artifact):** https://claude.ai/artifact/LYRbQzoGj6vmLzoAUzaNay
