---
niche: calmio
display_name: Calmio Companion (AI wellbeing companion - 18+)
archetype: personalization-quiz
subject: person
input: age (18+ gate), what they are carrying (grief, breakup, drinking, smoking, stress, loneliness), how long, how it shows up, today's mood, name, what would help, talk style, daily quiet time
output: a personalized 4-week self-guided programme plus a first conversation with Calmio
screens: 23
monetization: one per-programme subscription (3-month pre-selected / 1-month), dismissible, renewal price and reminder stated on the paywall - one gentle one-time fallback offer on paywall close (#22, a trial / lighter tier at a listed price, no timer), no other upsell layer
creative_screens:
  hook-a: 1
  hook-b: 2
  hook-c: 3
  reveal: 16
  programme: 17
  first-chat: 18
motion: >
  a single flower bud slowly opening petal by petal on a soft sage background
  while a calm chat bubble types a gentle hello beneath it
---

# Funnel Content — Calmio Companion

Calmio Companion ("Breathe - you're not alone", Calmio, UAB, 18+) is a chat-based AI companion for reflective conversation, plus short self-understanding lessons. Each finished lesson makes a new flower bloom in a progress window. The public site sells it as **personalised daily programmes** ("chat with Calmio about 15 minutes a day"). The App Store lists one subscription per programme: **Calmio Grief, Divorce, Alcohol and Smoking**, each at $70.99/month or $132.99/3 months (US store, checked 2026-09-28). Acquisition runs through web quizzes like "Discover your grieving type", "Alcohol reset for functioning drinkers" and "Breakup & divorce quiz". The user gives a topic, a few gentle answers and a daily time. They get a programme and a first conversation. Chat is the product surface, but this is **not** companion-chat, because nothing is metered per message. The money is a plan subscription sold after a quiz, which is the **personalization-quiz** monetization shape, so this funnel follows that archetype (per the README's "follow the monetization shape" rule). It borrows two things from companion-chat: a first live conversation before the gate, and the AI-disclosure rules. It also adds a mental-health layer no other funnel in this repo has. A persistent "Need help now?" link sits on every screen and is never paywalled, and an expectations screen ("a companion, not a therapist") comes *before* any sensitive question. There is no fear copy. Stress/anxiety and loneliness paths are included because the product positioning (and Trustpilot company text) covers them. They have no store SKU yet, so confirm or cut them (see Notes). 23 screens, every one with A/B copy. **Verified:** store listing, IAP names and prices, 18+ rating, the disclaimer, the flower mechanic, onboarding added in v2.1.4, App Store 4.7 from 1.1K ratings, Trustpilot 4.6 from 451 reviews, and review complaints (see Notes). **Not verified:** the in-app onboarding screen by screen, because the web quizzes are JS-rendered and couldn't be fetched, plus tone settings, free-tier scope and chat memory. Those are flagged where used. The screenshots weren't seen either. **Visual override:** this funnel drops the repo's default dark purple/pink look. It uses a soft light theme: warm off-white, sage green and muted lavender, rounded sans, lots of air, and a flower motif as the one hero object. Confirm it against the real brand kit.

---

## A. Hook

### 1. Hook A — Breathe
**Purpose:** Meet the "before" state (carrying something heavy, alone) with the brand's own promise, without asking for anything.
**Headline A:** Breathe. You're not alone.
**Headline B:** Heavy day? Let's talk.
**Body A:** A calm companion to talk things through, anytime.
**Body B:** Share what's on your mind, at your own pace.
**Visual:** Warm off-white background, one closed flower bud centered as the hero with a slow breathing scale (in 4s, out 4s). Beneath it, one soft chat bubble: "I'm here. What's on your mind?" Sage primary button pinned bottom. Small "Need help now?" text link in the top-right corner. It persists on every screen from here to #23.
**Microcopy:** Under CTA: "18+ · Calmio is AI and not a substitute for professional care" · "Need help now?" opens the crisis sheet: "Call or text 988 (US) · Outside the US: findahelpline.com · In danger now? Call your local emergency number." One tap, no sign-in, no paywall.
**CTA:** Get started

### 2. Hook B — Talk it through
**Purpose:** Show the core surface (a gentle, non-judging conversation) so the user knows what they're signing up to do.
**Headline A:** Talk it through, anytime.
**Headline B:** No judgment. Just listening.
**Body A:** Calmio listens, asks gentle questions, and helps you reflect.
**Body B:** A private space to say what's hard to say.
**Visual:** Three chat bubbles fading in one after another on the off-white card (user: "I can't switch my head off." / Calmio: "That sounds exhausting. What's looping most?" / user typing dots). "AI companion" chip above the thread.
**CTA:** Continue

### 3. Hook C — Small daily steps
**Purpose:** Set an effort expectation that feels doable, and introduce the real progress mechanic (flowers bloom per lesson).
**Headline A:** Fifteen minutes a day.
**Headline B:** Small steps, every day.
**Body A:** Short chats and lessons. Watch your garden bloom.
**Body B:** Each lesson you finish grows a new flower.
**Visual:** A rounded "progress window" card with a row of five flowers, the first two open and the rest buds, opening in sequence. A small clock chip reads "15 min".
**CTA:** Continue

---

## B. Investment

### 4. Age check
**Purpose:** The app is rated 18+. The check goes before any sensitive question so no minor discloses anything first.
**Headline A:** First, a quick age check
**Headline B:** What year were you born?
**Body A:** Calmio is for adults 18 and over.
**Body B:** We ask everyone. It keeps Calmio safe.
**Field:** Year wheel picker with no default. The CTA stays disabled until a year is picked.
**Visual:** Plain year wheel in a rounded white card, small sprout icon above.
**Error state:** Under 18 → a blocking screen, no way back in. Headline: "Calmio is for adults only". Body: "Free support for young people is available now." Buttons: "Call or text 988 (US)" · "Find a helpline near you" (findahelpline.com).
**CTA:** Continue

### 5. What you're carrying
**Purpose:** The branch point. It sets `{{path}}` and picks the programme and store SKU, so it comes first and stays one tap.
**Headline A:** What are you carrying right now?
**Headline B:** What brings you to Calmio?
**Body A:** Pick the one that weighs most today.
**Body B:** This shapes your daily programme.
**Options:**
- 🕊️ Losing someone
- 💔 Breakup or divorce
- 🍷 Drinking less
- 🚭 Quitting smoking
- 🌧️ Stress and worry
- 🫂 Feeling lonely
- ✏️ Other
**Field:** Single select, auto-advances on tap. It sets `{{path}}` (grief · breakup · drinking · smoking · stress · lonely) and `{{path_label}}` (Grief · Breakup · Alcohol reset · Quit smoking · Calm mind · Connection). "Other" opens a one-line input. Any free text passes through crisis-language detection before continuing.
**Visual:** Stacked soft pill rows with a white fill. The selected row fills sage and shows a check. The flower bud from #1 stays small at the top.
**Microcopy:** Crisis detection on "Other": if matched, show the crisis sheet from #1 with "Talk to a person now" first and "Continue with Calmio" second. Never block the user, and never ask them to explain.
**CTA:** (auto-advances on tap)

### 6. What Calmio is (and isn't)
**Purpose:** An honest expectations beat and the safety net, placed *before* the heavier questions. It is also the trust screen the category most needs.
**Headline A:** A companion, not a therapist
**Headline B:** Before we begin, one promise
**Body A:** Calmio helps you reflect. It doesn't diagnose or treat.
**Body B:** For crisis or medical care, please reach real people.
**Visual:** Three icon rows on a white card (chat bubble, lock, lifebuoy). Sage icons, generous spacing, nothing else on screen.
**Microcopy:** Rows: "💬 Calmio is AI, and always says so" · "🔒 Your chats stay private" · "🆘 In crisis? Call or text 988 (US) or visit findahelpline.com". Extra row shown only when `{{path}}` = drinking: "Stopping heavy drinking suddenly can be risky. Check with a doctor first." Footer: "Calmio does not provide medical advice, diagnosis or treatment." (the app's own disclaimer)
**CTA:** I understand

### 7. How long
**Purpose:** A cheap tap that paces the programme (early vs. long-standing). It is the gentlest way in before the "how it shows up" question.
**Headline A:** How long have you carried this?
**Headline B:** When did this begin?
**Body A:** Helps us pace your programme gently.
**Body B:** There's no right or wrong answer.
**Options:**
- 🌱 Under a month
- 🌿 1-6 months
- 🌳 6-12 months
- 🏔️ Over a year
- 🤷 Not sure
**Field:** Single select, auto-advances
**Visual:** Stacked pills, each emoji growing slightly larger down the list (a small "growth" motif).
**CTA:** (auto-advances on tap)

### 8. How it shows up
**Purpose:** The personalization core. Answers map straight to week-one lessons, so the programme on #17 visibly comes from here.
**Headline A:** How does it show up?
**Headline B:** What's been hardest lately?
**Body A:** Pick all that fit. We'll start there.
**Body B:** Choose any. Nothing here is judged.
**Options:** (set per `{{path}}`, 4 + Other)
- grief: 🌊 Waves of sadness · 🌙 Trouble sleeping · 😶 Feeling numb · 💭 Guilt or regret · ✏️ Other
- breakup: 🔁 Replaying the past · 📱 Checking their socials · 🧩 Lost sense of self · 😤 Anger or hurt · ✏️ Other
- drinking: 🌆 Evening habit · 😣 Drinking to cope · 🥂 Social pressure · 🍷 Hard to stop · ✏️ Other
- smoking: ☕ Routine triggers · 😣 Stress cravings · 👥 Social smoking · 🔁 Past quit attempts · ✏️ Other
- stress: 🌀 Racing thoughts · 🌙 Trouble sleeping · 💼 Work pressure · 😮‍💨 Tense body · ✏️ Other
- lonely: 🏠 Evenings alone · 🗣️ Nobody to tell · 🌍 New place · 👥 Lonely in crowds · ✏️ Other
**Field:** Multi-select, min 1 to enable the CTA. "Other" opens a one-line input, and that text is checked for crisis language as on #5.
**Visual:** Two-column soft chip grid. Selected chips get a sage border and a check.
**Microcopy:** Disabled-CTA hint: "Pick at least one"
**CTA:** Continue

### 9. First mood check-in
**Purpose:** Demo a real daily feature (mood check-in) inside the quiz, and give a safe exit for anyone having a very hard day.
**Headline A:** How are you feeling today?
**Headline B:** Quick check-in: how's today?
**Body A:** Your first check-in. You'll do this daily.
**Body B:** Be honest. Only you see this.
**Options:**
- 😣 Really low
- 😔 Low
- 😐 Okay
- 🙂 Good
- 😊 Great
**Field:** Single select on a horizontal 5-face scale, auto-advances. The answer is stored as day 1 of the mood history.
**Visual:** Five large round faces on one row, a soft color wash behind the selected face (muted blue → sage → warm yellow). No red anywhere.
**Microcopy:** On "Really low", a gentle bottom sheet opens before advancing. Headline: "You deserve support right now". Body: "Talking to a person can help. It's free, anytime." Buttons: "Call or text 988 (US)" · "Find a local helpline" · "Continue with Calmio". Never a dead end, never a sales line. Mood is not used for any urgency copy later in the funnel.
**CTA:** (auto-advances on tap)

### 10. Name
**Purpose:** Captures `{{name}}`, which Calmio uses in the first chat. That is the moment the product feels personal.
**Headline A:** What should Calmio call you?
**Headline B:** What's your first name?
**Body A:** A nickname is fine. Change it anytime.
**Body B:** So your conversations feel like yours.
**Field:** Text input, 1-20 chars, placeholder "Your name"
**Visual:** Plain white input on off-white, small bud icon above.
**Error state:** "Add a name so Calmio knows what to call you"
**CTA:** Continue

### 11. Your first seed
**Purpose:** Bridge after the heavier inputs. It uses the real flower mechanic as a micro-reward and shows how many questions remain.
**Headline A:** Your first seed is planted
**Headline B:** Thank you, {{name}}.
**Body A:** Every answer shapes a programme made for you.
**Body B:** Three quick questions, then your plan.
**Visual:** A seed dropping into a small pot of soil, then a green shoot pushing up (about 1.5 s). It is the same flower that blooms on #23.
**Microcopy:** Progress hint: "3 questions left"
**CTA:** Continue

### 12. What would help
**Purpose:** Weights the programme mix (chat vs. lessons vs. journaling) and previews the feature set without a feature list.
**Headline A:** What would help most, {{name}}?
**Headline B:** What do you need right now?
**Body A:** Pick all that apply.
**Body B:** Choose any. We'll weave them in.
**Options:**
- 💬 Someone to talk to
- 🧠 Understand my feelings
- 🧰 Practical coping tools
- 📅 A daily routine
- 📓 Space to journal
- ✏️ Other
**Field:** Multi-select, min 1
**Visual:** Stacked pills with a small line icon each. Selected ones fill sage.
**CTA:** Continue

### 13. How Calmio should talk
**Purpose:** Sets the companion's tone for the first chat on #18, the one taste-pick companion apps have shown users enjoy.
**Headline A:** How should Calmio talk?
**Headline B:** What kind of support fits you?
**Body A:** This sets the tone of your conversations.
**Body B:** Change it anytime in settings.
**Options:**
- 🤍 Gentle listener
- 🧭 Practical guide
- ❓ Curious questions
- 🌗 A bit of each
**Field:** Single select
**Visual:** Four soft cards, each with a one-line sample reply in small grey text under the label (e.g. Gentle: "That sounds really hard.").
**Microcopy:** Unverified that the app exposes a tone setting. If it doesn't, keep the screen as a prompt parameter for the first chat, and drop Body B.
**CTA:** Continue

### 14. Your quiet moment
**Purpose:** Picks the daily session time, which prefills the reminder on #19 and sets `{{quiet_time}}`. The daily loop is the retention product.
**Headline A:** When's your quiet moment?
**Headline B:** When can you give 15 minutes?
**Body A:** We'll save your daily session for then.
**Body B:** Pick a time you usually have to yourself.
**Options:**
- 🌅 Morning
- ☀️ Midday
- 🌆 Evening
- 🌙 Before bed
**Field:** Single select. Sets `{{quiet_time}}` (default times: 8:00 · 12:30 · 19:00 · 22:00, editable on #19).
**Visual:** Four pills with a sky gradient that shifts from dawn to night down the list.
**Microcopy:** Progress hint: "Last question"
**CTA:** Continue

---

## C. Trust

### 15. Real people, real ratings
**Purpose:** The trust beat right after the investment stage and before the reveal. Proof has to be real and path-matched. This category is where fake experts and fake stats do the most harm.
**Headline A:** {{app_rating}}★ from real people
**Headline B:** Private. Judgment-free. Yours.
**Body A:** {{rating_count}} ratings from people who've been there.
**Body B:** Your chats stay private. Nothing is ever public.
**Visual:** A: large rating number, a sage star row, and one real store review card below, chosen to match `{{path}}`. B: three lucide rows (lock, eye-off, trash) on a white card.
**Microcopy:** Values as of 2026-09-28: App Store 4.7★ from 1.1K ratings, Trustpilot 4.6 from 451 reviews. Pull them live and never hardcode. Review cards are real store reviews only, quoted as shown and path-matched (a grief review for grief, a drinking review for drinking). No press logos, because none were found. No "expert" or staff photos unless each is a real, named, credentialed person. B's "delete" row ships only if in-app deletion exists.
**CTA:** Continue

---

## D. Anticipation

### 16. Shaping the programme (loading)
**Purpose:** The wait makes the programme feel built from their answers. It's the strongest ad frame (the blooming flower).
**Headline A:** Shaping {{name}}'s programme…
**Headline B:** Planting {{name}}'s garden…
**Steps:**
1. Listening back to your answers… — 0→100%
2. Choosing your first gentle lessons… — 0→100%
3. Tuning how Calmio talks to you… — 0→100%
4. Almost ready — your first bud awaits… — 0→100%
**Visual:** The #11 shoot grows into a bud in the top half, with the petals starting to part. This is the one hero object with depth and slow 3D motion. Everything else simply fades. Four progress rows beneath: label left, % right, check when done, thin sage bars.
**Microcopy:** Chips from their answers ("Evenings alone", "Gentle listener") float up and fade. Optional rotating card: one real path-matched store review, never invented.
**CTA:** (auto-advances, ~6-8 seconds)

### 17. Your programme
**Purpose:** The personalized result, shown as a plan rather than a verdict. It makes the paywall's "what you get" concrete and traceable to their answers.
**Headline A:** {{name}}'s {{path_label}} programme
**Headline B:** Your first four weeks
**Body A:** Built from your answers. Starts {{quiet_time}}.
**Body B:** Fifteen minutes a day, at your own pace.
**Visual:** A vertical path of four week cards, each with a flower. Week 1 is open and lists 3 lesson titles tied to their #8 picks. Weeks 2-4 show titles only, softly dimmed. Their #9 mood face sits as "Day 1" on a tiny mood strip.
**Microcopy:** Sample week titles, grief: "Naming the loss" · "Riding the waves" · "Anniversaries and memories" · "Carrying love forward". Drinking: "Knowing your cues" · "Evenings, rewritten" · "Cravings, explained" · "Your new normal". Footer: "Not a diagnosis. A starting point you can change." Optional A/B arm: a soft "pattern" line like the web quizzes' "grieving type". It must read as reflection ("You tend to carry it quietly"), never as a clinical label or a severity score.
**CTA:** Meet Calmio

### 18. First conversation
**Purpose:** A taste of the loop before any gate, two real exchanges, using `{{name}}`, `{{path}}` and the #13 tone. It proves the product before the price.
**Headline A:** Calmio
**Headline B:** Calmio · your first chat
**Body A:** Tap a reply or write your own.
**Body B:** Say as much or as little as you like.
**Options:** (sample for grief + gentle, generated per path)
- I miss them a lot
- I don't know where to start
- Some days are okay
- ✏️ Type your own
**Visual:** Chat screen on off-white. AI-disclosure banner pinned to the top, one opening bubble ("Hi {{name}}. I'm really glad you're here. Grief often comes in waves. How has today been?"), and reply-idea rows above the composer. After 2 exchanges Calmio reflects back one line and closes warmly ("Thank you for sharing that. Let's take Week 1 together at {{quiet_time}}."), then #19 slides up.
**Microcopy:** Banner: "Calmio is an AI companion, not a therapist. In crisis? Call or text 988." Crisis language in any message pauses the scripted flow and shows the crisis sheet with human resources first. That path never shows a gate, a paywall or a sales line. Calmio never says "I miss you" or "don't leave", on this screen or anywhere else.
**CTA:** (auto-advances after 2 exchanges)

### 19. Daily reminder
**Purpose:** Locks the daily habit at the time they chose, before the account exists.
**Headline A:** Keep your quiet moment
**Headline B:** A gentle nudge, once a day
**Body A:** One reminder at {{quiet_time}}. Turn it off anytime.
**Body B:** Never more than once a day. Promise.
**Field:** Pre-permission bottom sheet with the time prefilled from #14 (editable). The system prompt fires only on "Turn on reminders".
**Visual:** Bottom sheet over the dimmed chat, with a sample lock-screen push card showing a small flower icon.
**Microcopy:** Sample push: "🌸 Your 15 minutes are ready when you are." Push rules: max one a day, no guilt ("Calmio misses you", "you broke your streak"), and never any topic words on the lock screen ("grief", "drinking"), because others can see it.
**Skip link:** Not now
**CTA:** Turn on reminders

---

## E. Gate

### 20. Save your programme
**Purpose:** Captures identity so the programme, mood history and chats persist, while the first conversation is still warm.
**Headline A:** Save your programme
**Headline B:** Keep your garden growing
**Body A:** Create an account so your progress stays yours.
**Body B:** Your chats and progress, saved securely.
**Field:** Continue with Apple · Continue with Google · Use email (email + 8-char password)
**Visual:** White Apple button, outlined Google and email buttons, the small bud from #16 above the headline. "Need help now?" still visible top-right.
**Error states:** "Enter a valid email address" · "Password needs at least 8 characters" · "That email has an account — sign in instead?" · "Sign-in didn't finish. Try again?"
**Microcopy:** Legal line: "By continuing you agree to the Terms and Privacy Policy."
**CTA:** Continue with Apple

---

## F. Monetization

### 21. Paywall
**Purpose:** The one ask, placed right after the first conversation and the saved programme. It sells the programme, and every price and renewal term sits on this screen in readable type.
**Headline A:** {{name}}, your programme is ready
**Headline B:** Start your {{path_label}} programme
**Body A:** Daily chats, lessons and check-ins, made for you.
**Body B:** Price shown upfront. We remind you before renewing.
**Plans:** (one SKU family per programme: Calmio Grief / Divorce / Alcohol / Smoking)
- **3 Months — pre-selected**, "Save 37%" badge, $132.99 every 3 months, small "≈ $10.23/week"
- 1 Month — $70.99 / month, small "≈ $16.38/week"
- Prices are the US App Store IAP list as of 2026-09-28. Render from StoreKit/Play Billing at runtime, never hardcode. No decoy middle tier: the store only has two, and a decoy reads as manipulation in this category.
**Visual:** Close (×) visible from the first frame. Four benefit rows with sage line icons, two stacked plan cards (3 Months highlighted), and a small 3-step renewal timeline under the cards (Today → reminder 3 days before → renews). Full-width sage CTA. "Restore purchase" top-right.
**Microcopy:** Benefit rows: "💬 Daily conversations with Calmio" · "🌸 Short lessons that grow your garden" · "📓 Guided journaling prompts" · "🙂 Daily mood check-ins". Directly under the CTA, at body size (not fine print): "Renews at $132.99 every 3 months until you cancel. Cancel anytime in App Store settings." Reminder line: "We'll notify and email you 3 days before each renewal." This has to be built, since it answers the #1 review complaint. Refund terms: state any condition in full here (e.g. usage-day requirements) or don't advertise a money-back guarantee. Always shown: "Crisis resources are always free."
**Skip link:** Not now
**Fallback offer:** #22, a gentle one-time offer (shown once per session, never after a safety event). Every way off this screen without paying (close × and "Not now") goes to #22 first; declining it, or a second close, leads to #23 in free mode. This replaces the earlier "no dismissal discount" rule (user direction, 2026-09-30). The free-tier scope is unverified: at minimum crisis resources and the mood check-in, ideally lesson one. Optional A/B arm (needs store config): a disclosed 7-day free trial on 3 Months. Timeline on the same screen: "Today: free · Day 5: reminder · Day 7: $132.99, then every 3 months". The trial toggle is **off** by default and never pre-checked.
**CTA:** Start my programme

### 22. A gentler first step (one-time offer, on paywall close)
**Purpose:** A second, softer chance for people who closed #21 because 3 months felt like too much. Shown once per session, then never again. Added 2026-09-30 by user direction, overriding the brief's earlier "no discount-on-close" rule, and kept gentle on purpose.
**Headline A:** Start gently, {{name}}
**Headline B:** Try your {{path_label}} programme first
**Body A:** Your {{path_label}} programme is saved. If three months feels like a big step, you can try it first for less.
**Body B:** No rush. Here is a smaller first step, if it helps.
**Plans:** One offer card: {{offer_name}} (demo: "7-day trial"), a trial or lighter tier the store actually lists. {{offer_price}} today, with the regular 3 Months price ($132.99) struck, then {{offer_renews}} until cancelled. Optional {{offer_badge}}. Never a fake markdown: the struck price is the real current 3-Month price, and the offer price is what checkout charges.
**Visual:** Same soft light look as #21: a top bar with the close ×, the Calmio wordmark, and the persistent "Need help now?" link. A centered sage eyebrow "One-time offer · shown once", then one sage-bordered card with the topic photo thumbnail, the offer name, the price row (struck $132.99 → {{offer_price}} "today"), 3 checks ("Your 4-week {{path_label}} programme, from lesson one" · "Daily conversations with Calmio" · "A reminder 3 days before it renews"), the CTA and the renewal line. Below the card: "Crisis resources are always free."
**Microcopy:** Renewal line at body size: "{{offer_price}} today, then {{offer_renews}} until you cancel. Cancel anytime in App Store settings." Reminder line: "We'll notify and email you 3 days before it renews." No timer: `CONFIG.offer.expiresMin` stays null in this category, and there is no "offer ends", "last chance" or "don't miss out" wording. **Never shown** on the crisis path: after the crisis sheet, crisis language in the #18 chat, the "Really low" mood support sheet on #9 or a "Need help now?" tap, closing #21 goes straight to #23. Decline link: "No thanks, keep lesson one and daily check-ins free". Events: `offer_view`, `offer_accept` + `checkout_click` (plan `offer`), `offer_decline`, `offer_expired` (only if a real deadline is ever set).
**CTA:** Claim my offer

---

## G. Payoff

### 23. Your first flower
**Purpose:** Close the loop with the real reward mechanic and drop the user into lesson one, so the first session ends inside the product.
**Headline A:** Your first flower bloomed
**Headline B:** Welcome in, {{name}}.
**Body A:** Week one opens at {{quiet_time}}. Or start now.
**Body B:** Come back anytime. Calmio is here.
**Visual:** The garden progress window with the #16 bud fully open as the first flower and four buds waiting. A "Lesson 1 · 5 min" card below, and the chat icon in the tab bar.
**Microcopy:** Subscribers see the full Week 1. Free mode shows lesson one (if the product allows) and today's check-in, with a quiet "Unlock your programme" row, never a pop-up. No rating prompt here. Ask for a store rating only after a completed lesson on day 3+, never after a low mood check-in.
**CTA:** Start lesson one

---

## Notes

- **Archetype call.** Monetization = one plan subscription sold after a data quiz → **personalization-quiz** (follows the README tie-break rule). companion-chat half-fits on the surface (chat) but not on money (no message meter, no intimacy). Borrowed from companion-chat: a first live conversation before the gate (#18), AI disclosure on every chat screen, and "never monetize in the companion's voice". Skipped from personalization-quiz: the decoy tier (the store has 2 SKUs, and a decoy is manipulative here), the countdown upsell, the before/after screen (a "miserable vs. happy" split exploits distress), and the separate premium-preview screen (the programme on #17 does that job).
- **Mental-health safety, built into the flow rather than bolted on:** a persistent "Need help now?" link on all 23 screens · the expectations screen (#6) before any sensitive question · crisis detection on every free-text field (#5, #8, #18) · the "Really low" mood sheet (#9) · minors blocked with youth resources (#4) · the medical-withdrawal line on the drinking path (#6). Crisis help is never behind the gate or paywall. Copy never claims therapy, diagnosis, treatment or outcomes ("heal", "cure", "fix your anxiety"). Mood answers never feed urgency or sales copy. Clinical/legal should review #4, #6, #9 and the crisis sheet before launch, including non-US helpline localization.
- **Paths vs. SKUs.** The store has 4 programmes (Grief, Divorce, Alcohol, Smoking). Stress and Lonely in #5 have no SKU. Either map them to a real programme or a general plan, or cut them before launch. `{{path}}` drives the options on #8, the lessons on #17, the opening line on #18 and the SKU on #21. Every path needs a week plan, 3 reply ideas and a first-chat opener.
- **Competitor / incumbent mechanics — reference only, NOT implemented.** Found in Calmio's own public reviews (App Store, Trustpilot, 2026-09):
  - a web-quiz → intro-price → auto-renew flow ("what you pay now and after the 3 month trial")
  - users reporting surprise ~$99 and $55.99 charges with **no pre-renewal reminder**
  - cancellations "not fully processed" before the trial ended
  - a 14-day money-back guarantee with an **undisclosed condition** (7+ separate days of use)
  - "aggressive" post-purchase add-on pop-ups
  - a reviewer questioning **AI-generated "staff" photos** in onboarding
  - a 2000-word journaling minimum that blocks progress

  This is the same family as the "$1 lead-magnet into hidden recurring sub" pattern flagged in `personalization-quiz.md`. ikame's version does the opposite on purpose: renewal price under the CTA at body size, a built reminder 3 days before renewal, any refund condition stated in full, no pre-checked trial or add-on, no post-purchase upsell, no fake experts, no word-count gates. Selling to people in grief or recovery makes all of this a legal and store-review exposure, not just an ethics point.
- **Fallback offer override (2026-09-30, user direction).** The brief originally ruled out any discount-on-close. The user has overridden that: every funnel now carries a one-time fallback offer on paywall close, so #22 was added. It stays gentle here: a trial or lighter tier at a price the store actually lists (placeholders until confirmed), the struck price is only the real 3-Month price, no timer, no pressure wording, shown once per session, and never after any safety event (crisis sheet, crisis chat, "Really low" mood sheet, help link). Measure its CVR and its refund/chargeback rate separately from #21.
- **No urgency.** No countdowns, no "offer ends", no "spots left". Nothing in the product supports them, and pressure contradicts "Breathe". No gamified wheel, because the flower mechanic is the real reward (#11, #16, #23).
- **No invented numbers.** `{{app_rating}}` / `{{rating_count}}` come live from the store. Review quotes are real and path-matched. The "Save 37%" badge is computed from the live prices (3 × monthly vs. 3-month), so recompute it if the prices change.
- **Price risk.** At $70.99/month this is ~10x Wysa premium (~$74.99/yr, public reviews). Expect the paywall (#21) to be the biggest drop. Test a yearly SKU before testing copy.
- **Drop-off risk:** #4 age gate · #8 (the most emotionally loaded tap, so keep it multi-select and optional-feeling) · #20 sign-in · #21 paywall. Keep #16 at 6-8 s. People in distress have little patience for theatre.
- **Measure separately:** paywall CVR at #21 · offer CVR at #22 (separate from #21) · free-mode → subscribe later (from the #23 in-app row) · D1/D7 return at `{{quiet_time}}` (the reminder opt-in on #19) · refund and chargeback rate per path. That last one is the honesty metric, and a spike means the paywall is being misread.
- **Comparables (category reasoning, not live teardowns):** Ash asks what brings you in and how you prefer to talk, then drops you into a first conversation (the source of #13 and #18). Wysa is freemium with a premium self-care tier and a free trial. Earkick is mood-tracking first (the source of #9). Calmio's real in-app onboarding (added v2.1.4, "a few compassionate questions") wasn't viewable, so screen-level parity with it is unverified.
- **A/B first:** (1) #21 3-Month vs. a yearly SKU, if the store adds one. (2) #18 first chat before vs. after #20. (3) #15 A (rating) vs. B (privacy). (4) #17 with vs. without the reflective "pattern" line. (5) Hook order: #1 "Breathe" vs. #2 chat-first.
