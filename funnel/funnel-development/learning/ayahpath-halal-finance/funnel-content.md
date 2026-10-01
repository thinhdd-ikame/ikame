---
niche: ayahpath-halal-finance
display_name: AyahPath (Quran Study for Mindful Wealth)
archetype: learning-plan
subject: person
input: money concerns, three money habits, main goal, name, minutes per day, prayer anchor, optional intention, email
output: a 30-day Quran study plan on wealth (four weekly themes, one ayah a day) plus a free Day 1 lesson on the word rizq
screens: 22
monetization: web subscription (3 plans, 1-week intro / 4-week pre-selected / 12-week anchor, renewal shown beside every intro price); one-time 30-day pass (no renewal) as last-chance offer; activation (install + sign-in) measured separately
creative_screens:
  hook-a: 1
  hook-b: 2
  ayah: 4
  reveal: 18
  lesson: 19
motion: >
  an Arabic ayah on a cream card lighting up word by word in gold while its
  English meaning fades in beneath, then four weekly cards sliding into a
  30-day calendar strip over a slowly drifting emerald geometric pattern
---

# Funnel Content — AyahPath (Quran Study for Mindful Wealth)

Same app and brand as `learning/ayahpath` (AyahPath Daily, SCALENCE LIMITED: bite-sized Quran lessons, narrated audio stories, quizzes, reflection and journaling, streaks, memorization techniques). This variant sells one thing: a 30-day habit of studying what the Quran says about wealth, one short ayah at a time. **Reference (adspylab, captured 2026-09-27):** AyahPath `ap_finance_313_c` at `quiz.ayahpath.com/?lang=en&cohort=ap_finance_313_c` (1,627 ads, 33 unique screens, the "30 Days Rizq Challenge"), marked verified in the research. The shape is the shared learning-plan archetype: situation and habit quiz, two ayah cards, goal and pace, a dated plan, one web paywall. **Deliberate differences from the competitor:** (1) the "-90% New promo code applied" banner and 10-minute timer are gone, plans show their real intro and renewal side by side; (2) "cancel only by emailing support" is replaced by self-serve cancel in the app and a link in every receipt; (3) the intro-to-10x auto-renew is replaced by a renewal price shown next to every intro price and an email before each renewal; (4) the 1-week plan is no longer labelled BEST VALUE and "4 weeks = 2x better results" is dropped; (5) no 1M+ users / 400,000+ users / "72% feel money anxiety" statistics, no "1103 people began today" ticker; (6) no Yes/No micro-commitments inside the loader and no imam-persona pages; (7) the quiz never grades the user's finances or promises money results: the product is Quran study and reflection, stated as **not financial advice** on the hooks, the bridge, the plan, the paywall and the FAQ. **Look:** identical to `learning/ayahpath`: deep emerald `#0F5A43`, cream parchment `#F3EFE4` cards, muted gold accent, low-opacity geometric pattern, correctly vowelled Uthmani Arabic, no depictions of Prophets or Companions. **Tone:** sincere and gentle, no guilt about debt or salah. Copy rules apply throughout: headline ≤6 words, body ≤12 words, A/B on every screen. This brief is written for the **web** funnel (web checkout, then app sign-in).

Tokens: `{{name}}`, `{{focus}}`, `{{goal}}`, `{{minutes}}`, `{{anchor}}`, `{{intention}}`, `{{email}}`, `{{price_1w}}`, `{{renewal_1w}}`, `{{price_4w}}`, `{{renewal_4w}}`, `{{price_12w}}`, `{{renewal_12w}}`, `{{offer_price}}`, `{{store_rating}}`, `{{rating_count}}`, `{{store_name}}`, `{{refund_days}}`. Unset personal tokens fall back to: name "you", focus "saving", goal "mindful spending", minutes "10", anchor "at your chosen time" (anchor reads as a phrase: "after Fajr", "before work"), intention "mindful with what I have".

**Religious content rule:** every ayah is shown with its surah and ayah number, in Sahih International wording, with Uthmani Arabic. All Arabic, translations and the reflection prompts must be approved by a qualified scholar before launch (see Notes).

---

## A. Hook

### 1. Hook A — 30 days of Rizq
**Purpose:** Cold traffic from the "Rizq challenge" ads sees the same promise, framed as a Quran study habit and not as a money fix.
**Headline A:** 30 days of Rizq
**Headline B:** Rizq, through the Quran
**Body A:** A daily Quran study habit for mindful money.
**Body B:** Five minutes a day, one ayah on wealth.
**Visual:** Deep emerald backdrop with a faint gold geometric pattern drifting slowly. A cream parchment card holds the quote below, Arabic first, English fading in beneath. Rating badge in the top bar only when real. Gold-outlined emerald CTA pinned at the bottom.
**Microcopy:** Quote under the card: "And whoever fears Allah - He will make for him a way out. And will provide for him from where he does not expect." Surah At-Talaq 65:2-3. Top-bar badge "★ {{store_rating}} on {{store_name}}" shown only when both are real in CONFIG, hidden otherwise.
**CTA:** Start my 30 days

### 2. Hook B — Study, not advice
**Purpose:** Sets the frame honestly before any question: reflection on what the Quran says, with no financial advice and no product to buy.
**Headline A:** Quran study, not financial advice
**Headline B:** Reflect on money, one ayah daily
**Body A:** Understand what the Quran teaches about wealth.
**Body B:** Reflection, not rulings. No product advice.
**Visual:** Same emerald backdrop. Three stacked cream cards fan out (🌾 Earn · 🧺 Spend · 🤲 Give), each with a one-line ayah topic, joined by a thin gold path.
**Microcopy:** Under CTA: "About 2 minutes · No Arabic needed"
**CTA:** Continue

---

## B. Investment

### 3. Money on your mind
**Purpose:** Names where money weighs most; the first pick becomes `{{focus}}` and tilts the reflections. It gives the user a voice and reads as care, never as a diagnosis.
**Headline A:** What's on your mind?
**Headline B:** Where does money weigh most?
**Body A:** Pick all that apply.
**Body B:** We'll shape your 30 days around these.
**Options:**
- 💳 Debt
- 🏦 Saving
- 🤔 Halal income doubts
- 🤲 Giving enough
- ✏️ Other
**Field:** Multi-select, CTA disabled until one pick (Other needs text). The first pick in tap order becomes `{{focus}}`.
**Visual:** Stacked pills with right-side check circles on a cream background, Other as a full-width pill.
**Microcopy:** Other placeholder: "e.g. Rent". Disabled-CTA hint: "Pick at least one to continue"
**CTA:** Continue

### 4. Ayah card — Wealth as a trust
**Purpose:** First ayah on wealth, shown whole and referenced, to anchor the funnel in the Quran and slow the pace after the first question.
**Headline A:** You are a steward
**Headline B:** Wealth, held in trust
**Body A:** Read it slowly, then reflect.
**Body B:** A short reflection, no ruling.
**Visual:** Cream parchment card with the ayah in large Uthmani script, English beneath, reference in gold. Soft lantern image above.
**Microcopy:** Arabic: آمِنُوا بِاللَّهِ وَرَسُولِهِ وَأَنفِقُوا مِمَّا جَعَلَكُم مُّسْتَخْلَفِينَ فِيهِ. English: "Believe in Allah and His Messenger and spend out of that in which He has made you successors." Surah Al-Hadid 57:7 (Sahih International). Reflection prompt: "What is one thing you hold that you could use more mindfully?" Footer: "A study prompt, not a fatwa."
**CTA:** Continue

### 5. Habit 1 — Income
**Purpose:** First of three neutral habit questions; sets a starting point, never a grade.
**Headline A:** When money comes in…
**Headline B:** Your income habit
**Body A:** Pick what's closest.
**Body B:** No wrong answer, just a starting point.
**Options:**
- 📝 Plan it first
- 🛒 Spend as needed
- 🏦 Save what's left
- 🌀 Lose track
- ✏️ Other
**Field:** Single-select, CTA disabled until a pick (Other needs text).
**Visual:** Same pill style as #3, single-select radio circles.
**Microcopy:** Other placeholder: "What do you do?"
**CTA:** Continue

### 6. Habit 2 — Spending
**Purpose:** Second habit, about the moment before a purchase.
**Headline A:** Before buying something…
**Headline B:** Your spending habit
**Body A:** Pick what's closest.
**Body B:** Nothing is scored.
**Options:**
- ⏸️ Pause and think
- 🔍 Compare options
- 😅 Buy, then wonder
- 🧾 Check my budget
- ✏️ Other
**Field:** Single-select, CTA disabled until a pick (Other needs text).
**Visual:** Same as #5.
**Microcopy:** Other placeholder: "What do you do?"
**CTA:** Continue

### 7. Habit 3 — Giving
**Purpose:** Third habit, about sadaqah and zakat; closed list, phrased with no guilt.
**Headline A:** Giving, in your month
**Headline B:** Sadaqah and zakat
**Body A:** Pick what's closest.
**Body B:** Where are you today?
**Options:**
- 🤲 Planned and regular
- 🎁 When I can
- 🌱 Rarely so far
- ❓ Not sure how
**Field:** Single-select, CTA disabled until a pick.
**Visual:** Same as #5.
**Microcopy:** "For rulings on zakat, ask a qualified scholar."
**CTA:** Continue

### 8. Bridge — A habit, not a verdict
**Purpose:** Expectation-setting before the personal plan: companion for study, no judgement, no financial advice, and the way out to real professionals.
**Headline A:** A habit, not a verdict
**Headline B:** Three answers, no judgement
**Body A:** This is Quran study, not financial advice.
**Body B:** For money decisions, ask a qualified adviser.
**Visual:** Cream card with three small dots (the three habits), the first three lit, a gold line beneath.
**Microcopy:** "Verses shown with their surah and ayah numbers." Progress hint: "Step 1 of 3 done"
**CTA:** Keep going

### 9. Ayah card — Effort and reliance
**Purpose:** Second ayah on provision, paired with a guardrail line so it is never read as a promise of income.
**Headline A:** Effort, then reliance
**Headline B:** A way out
**Body A:** Read it slowly, then reflect.
**Body B:** Reflect on trust and effort together.
**Visual:** Same card as #4 with the stones-and-lantern image above.
**Microcopy:** Arabic: وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ۝ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ. English: "And whoever fears Allah - He will make for him a way out. And will provide for him from where he does not expect." Surah At-Talaq 65:2-3 (Sahih International). Reflection prompt: "Where could you act with care and trust together?" Footer: "A reflection prompt. It is not a promise of any financial result."
**CTA:** Continue

### 10. Main goal
**Purpose:** The one study focus the plan leans toward; becomes `{{goal}}` and picks the Week 4 theme. A study focus, not a financial target.
**Headline A:** Your main goal?
**Headline B:** What matters most now?
**Body A:** Your 30 days will lean here.
**Body B:** Pick the one that matters most.
**Options:**
- 🛟 Emergency buffer
- 💳 Clear debt
- 🌾 Halal income
- 🧺 Mindful spending
- 🤲 Give more
- ✏️ Other
**Field:** Single-select. Other opens a one-line input and routes to the general Week 4 theme; CTA disabled while Other is empty.
**Visual:** 2-column grid of cream goal cards, Other as a full-width pill.
**Microcopy:** Other placeholder: "e.g. Teach my kids about money"
**CTA:** Continue

### 11. Name
**Purpose:** Gets `{{name}}` for the loader, the plan, the paywall hero and the offer.
**Headline A:** What should we call you?
**Headline B:** Your first name?
**Body A:** We'll put it on your plan.
**Body B:** First name is all we need.
**Field:** Text input, placeholder "First name", max 30 chars, autofocus. Empty tap shows the error and does not advance.
**Visual:** Plain cream input with an emerald focus ring.
**Error state:** "Please enter a name to continue"
**CTA:** Continue

### 12. Minutes a day
**Purpose:** The commitment tap; sets `{{minutes}}` and makes the 30-day total a calculation.
**Headline A:** Minutes a day?
**Headline B:** Your daily pace
**Body A:** Short and steady beats long and rare.
**Body B:** You can change it anytime in the app.
**Options:**
- 👍 Casual · 5 min/day
- 👌 Regular · 10 min/day
- 🤘 Serious · 15 min/day
- 💪 Determined · 20 min/day
**Field:** Single-select, nothing pre-selected.
**Visual:** Four wide cards, minutes in a small grey line.
**Microcopy:** "Most lessons take 5-15 minutes."
**CTA:** Set my pace

### 13. Anchor to a prayer
**Purpose:** Ties the habit to a routine the user already keeps; sets `{{anchor}}` for reminders.
**Headline A:** Anchor it to a prayer
**Headline B:** When fits your day?
**Body A:** Pair your study with a prayer you keep.
**Body B:** Habits stick when tied to a routine.
**Options:**
- 🌅 After Fajr
- ☀️ After Dhuhr
- 🌤️ After Asr
- 🌇 After Maghrib
- 🌙 After Isha
- ✏️ Other time
**Field:** Single-select, CTA disabled until a pick (Other needs text).
**Visual:** Vertical list on cream, each row with a small sky icon, prayer-mat image above.
**Microcopy:** Other placeholder: "e.g. Before work". "Prayer times are never assumed. You can change the reminder anytime."
**CTA:** Continue

### 14. Set your intention
**Purpose:** Optional personal line (niyyah) that makes the plan feel owned; skippable so it adds no friction.
**Headline A:** Set your intention
**Headline B:** Why these 30 days?
**Body A:** One line, just for you.
**Body B:** It stays on your plan.
**Field:** One-line text input, max 80 chars, placeholder "e.g. To handle money mindfully". Optional: empty or skipped falls back to "mindful with what I have".
**Visual:** Parchment card with a small lantern, input beneath.
**Skip link:** "Skip for now"
**CTA:** Continue

---

## C. Trust

### 15. Social proof
**Purpose:** Trust beat before the loader. Rating and review blocks render only from real store data in CONFIG; with none, the screen falls back to a proof-free habit message.
**Headline A:** Rated {{store_rating}} on {{store_name}}
**Headline B:** Learners give it {{store_rating}} stars
**Body A:** From {{rating_count}} ratings by people like {{name}}.
**Body B:** Lessons short enough to finish after prayer.
**Fallback (no real rating):** Headline A "Small steps, every day" / B "One ayah, one reflection"; Body A "A few minutes of study, after a prayer." / B "Study the Quran's guidance on wealth, daily." No rating, laurel or count shown.
**Visual:** Rating with star row and laurel (rating version) or a lantern (fallback), store badges, one review card only if a real review is in CONFIG.
**Microcopy:** No rating, count, quote or user number is shown until the growth team supplies verified store data; the competitor's "1M+ users", "400,000+ users" and 4.9 and the sibling brief's store numbers are unverified for this funnel and are not used.
**CTA:** Continue

---

## D. Anticipation

### 16. Building the plan (loading)
**Purpose:** Makes the plan feel assembled from the answers; rows name the user's own picks. No questions inside the loader.
**Headline A:** Building {{name}}'s 30 days…
**Headline B:** Choosing your ayahs…
**Steps:**
- Reading your goal and pace…
- Choosing ayahs on {{focus}}…
- Setting reminders {{anchor}}…
- Almost ready, your plan awaits…
**Visual:** Four progress rows over a drifting emerald pattern; a gold ayah-number medallion turns slowly.
**Microcopy:** Optional rotating review cards only when CONFIG holds real reviews; otherwise nothing.
**CTA:** (auto-advances, ~6 seconds)

---

## E. Gate

### 17. Email
**Purpose:** Web checkout needs an identity that later unlocks the app; asked after the loader at peak curiosity.
**Headline A:** Where should we send it?
**Headline B:** Save your plan, {{name}}
**Body A:** Your email unlocks your plan in the app.
**Body B:** You'll sign in with this email later.
**Field:** Email input (email keyboard, autofocus), "Continue with Apple" / "Continue with Google" above. Separate **unchecked** marketing checkbox.
**Visual:** Blurred plan card behind a cream sheet holding the field.
**Error states:** "Please enter a valid email address" / "This email already has a plan. Check your inbox."
**Microcopy:** Under CTA: "Used only for your account. No spam." + Terms · Privacy links.
**CTA:** Show my plan

---

## D. Reveal

### 18. Quran Study for Mindful Wealth
**Purpose:** The result: the dated 30-day plan with four weekly themes and a now-versus-goal chart, all labelled as study goals, never as money outcomes.
**Headline A:** {{name}}'s 30-day plan
**Headline B:** Quran Study for Mindful Wealth
**Body A:** One ayah a day, in four weekly themes.
**Body B:** Built around {{goal}}, reminders {{anchor}}.
**Visual:** Four week rows with a 7-dot strip each and a theme: Week 1 "Wealth as a trust", Week 2 "Earning with care", Week 3 "Spending with balance", Week 4 the goal's theme (see #10). Below, a now-versus-week-4 bar pair: "Study sessions: 0 now, goal 30" and "Reflection minutes: 0 now, goal = `{{minutes}}` x 30". Chips: Focus · Goal · Pace `{{minutes}}` min. A parchment line shows `{{intention}}`.
**Microcopy:** Every bar is labelled "Goal". "Goals for your study habit, not money results. Not financial advice." No "financial control" or "wellbeing" gauge.
**CTA:** Try Day 1

### 19. Day 1 lesson — What is Rizq?
**Purpose:** Free taste of the product: one word and one ayah, taught in about a minute; days 2-30 stay behind the paywall.
**Headline A:** Day 1: What is Rizq?
**Headline B:** Your first lesson
**Body A:** Learn one word, then one ayah.
**Body B:** Unlocked before you pay.
**Visual:** Three flip cards: the word "رِزْق · rizq: provision, sustenance"; the ayah; a reflection prompt. A blurred stack follows, labelled "29 more days in your plan".
**Microcopy:** Arabic: وَمَا مِن دَابَّةٍ فِي الْأَرْضِ إِلَّا عَلَى اللَّهِ رِزْقُهَا. English: "And there is no creature on [or within] the earth but that upon Allah is its provision." Surah Hud 11:6 (Sahih International). Reflection prompt: "Name one provision you noticed today." Footer: "Study notes, not a ruling."
**CTA:** Unlock all 30 days

---

## F. Monetization

### 20. Paywall
**Purpose:** Long-scroll web sales page. Intro and renewal prices sit side by side on every plan; no "-90%" banner, no timer, no struck-through prices. Final prices are the growth team's call, so the page shows tokens.
**Headline A:** {{name}}, begin your 30 days
**Headline B:** Your Mindful Wealth plan
**Body A:** Every price and renewal shown before you pay.
**Body B:** 30 daily ayahs, built around {{goal}}.
**Plans:** (structure only, prices are tokens)
- **1-week plan** intro `{{price_1w}}`, then `{{renewal_1w}}` per week. No BEST VALUE label.
- **4-week plan**: **pre-selected**, intro `{{price_4w}}`, then `{{renewal_4w}}` every 4 weeks. Fits the 30-day challenge. "MOST POPULAR" only if sales data backs it.
- **12-week plan**: anchor, intro `{{price_12w}}`, then `{{renewal_12w}}` every 12 weeks.
- Plans are named by the period they bill. No fake "was" price, no per-day framing.
**Page structure (top to bottom):** brand bar (logo + close ✕) · personal hero (plan card, goal, `{{minutes}}` min/day chips) · plan block · what's inside · how it works (3 steps) · proof (rating and reviews, only when real) · guarantee (only when refund days are real) · FAQ · plan block repeated · sticky CTA.
**Visual:** Same web look as the rest of the funnel. Proof hidden until real data exists. Radio plan cards, emerald border on the selected one, payment-method row (Apple Pay / PayPal / card), safe-checkout badges. No countdown bar.
**Microcopy:**
- Line above the sticky CTA: "{{price_4w}} today. Then {{renewal_4w}} every 4 weeks until you cancel." (follows the selected plan)
- Trust row: "🔒 Secure checkout · Cancel online anytime"
- What's inside (shipped features only, confirm against the app): "Bite-sized daily Quran lessons" · "Narrated audio stories" · "Quizzes after each lesson" · "Reflection and journaling" · "Streaks and reminders"
- How it works: 1 "Pick your plan" · 2 "Sign in with {{email}}" · 3 "Open Day 2 of your plan"
- Guarantee: hidden while `refundDays` is a token; shown only once real terms are filled in.
- FAQ: "How do I cancel?" → "Profile → Settings → Manage subscription, or the link in your receipt. No email needed." · "Will it renew?" → "Yes, at the renewal price shown, until you cancel. We email you before every renewal." · "Is this financial advice?" → "No. It's Quran study and reflection. For money decisions, ask a qualified adviser. For religious rulings, ask a qualified scholar."
**Fallback offer:** On close, the last-chance offer (#21) once per session. No timer.
**CTA:** Start my plan

### 21. Last-chance offer (on close)
**Purpose:** Second chance for users who close the page without paying: a smaller, one-time option than the three tiers, the 30-day challenge only, paid once, no renewal. Shown once per session, then never again.
**Headline A:** Not ready? Take 30 days
**Headline B:** Just the 30-day challenge
**Body A:** Pay once. It never renews.
**Body B:** Your 30 daily ayahs, nothing more.
**Plans:** One offer card: **30-day Rizq pass**, `{{offer_price}}` one time, no renewal, access for 30 days. Includes the user's 30 daily ayah sessions and four weekly reflections. **Not included:** audio stories, memorization techniques, the rest of the lesson library, renewals (there are none). The full plan stays on the paywall. Not labelled "free". No struck-through price.
**Visual:** Same web look as #20: sticky bar with logo and ✕, eyebrow "One-time offer · shown once", one emerald-bordered card with the 30-day strip, three checks that match the scope, a grey "Not included" list, text link "No thanks, back to my plan".
**Microcopy:** "{{offer_price}} once for 30 days. It does not renew, so there is nothing to cancel." Shown once (sessionStorage `ikf_offer_ayahpath-halal-finance`); `CONFIG.offer.expiresMin` is `null`, no timer.
**CTA:** Get the 30-day pass

---

## G. Payoff

### 22. Get the app
**Purpose:** Web buyers who never sign in refund; the first job after paying is Day 2 with the same email.
**Headline A:** You're in, {{name}}!
**Headline B:** Last step: open the app
**Body A:** Get the app and sign in with {{email}}.
**Body B:** Your Day 2 ayah is waiting.
**Visual:** Green check over the logo, 3 numbered steps (Download · Tap the sign-in link we emailed · Open Day 2), store badges, QR for desktop, phone mockup of an ayah card.
**Microcopy:** "Receipt sent to {{email}}" · "Manage or cancel anytime" link.
**CTA:** Open the app

---

## Notes

- **Scholar review required before launch:** every Arabic text, every Sahih International translation (57:7, 65:2-3, 11:6), the week themes and every reflection prompt were written from well-known texts without a scholar's review. A qualified scholar must check wording, diacritics and verse boundaries, and must confirm that the reflection prompts do not read as a ruling (fatwa) or as a promise of provision. Nothing here is a fabricated hadith, an imam persona or a scholar endorsement; do not add any.
- **No financial advice:** no product, return, loan, insurance or investment is named, no ruling on halal or haram of any financial product is given, and nothing tells the user what to do with money. The plan is study. The paywall FAQ points to qualified advisers and scholars. Ads must not target debt or hardship ("Are you in debt?") or imply personal circumstances.
- **Unverified:** the research marks `ap_finance_313_c` as observed (V). The question order here is condensed from it (competitor's gender, age, income stability and stress-frequency questions are dropped as intrusive and unneeded), the two-ayah structure is kept, the three habit questions, the Day 1 lesson and the 4-week themes are this brief's own design. The 1-week / 4-week / 12-week structure mirrors the sibling briefs, not the competitor's live plans. Prices are tokens.
- **Dropped competitor mechanics:** "-90% promo_Sep26" and the 10-minute timer, BEST VALUE on the 1-week plan, "4 weeks = 2x better results", per-day framing of the intro, 1M+ and 400,000+ user claims, the "72% feel money anxiety" statistic, the "1103 people began today" ticker, five Yes/No micro-commitments inside the loader, imam-persona ad pages, the "financial control / wellbeing" now-versus-after gauge, email-only cancellation, and the intro-to-~10x monthly renewal.
- **Honesty guardrails:** weeks and bars are goals for the study habit, never money results; no rating, count or review until real store data is set in CONFIG; the guarantee stays hidden until refund days are real.
- **Measure:** quiz completion by screen, habit-answer split (#5-7), #18 to #20 reach, paywall conversion per plan, one-time pass accept rate, activation (install + sign-in + Day 2 within 48 h), first-renewal retention at full price, refund rate.
- **Images:** reused from the sibling `learning/ayahpath/img` (same brand) until `gen_images.py` is run with `IKAME_AI_KEY`.
- **Demo (private Artifact):** https://claude.ai/artifact/4yvvumecRRTRJ6g97GRRML
