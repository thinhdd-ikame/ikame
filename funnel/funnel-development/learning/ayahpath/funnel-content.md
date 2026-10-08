---
niche: ayahpath
display_name: AyahPath (Daily Quran Learning)
archetype: learning-plan
subject: person
input: learning goal, Quran journey stage, Arabic reading level, one warm-up quiz answer, barrier, preferred formats, daily minutes, prayer-anchored time
output: personalized daily Quran learning path (first week syllabus) plus a free first lesson (Bismillah, word by word)
screens: 24
monetization: single subscription paywall (store billing, 2 plans, yearly pre-selected, renewal price shown on the plan card), dismissible, one disclosed fallback
creative_screens:
  hook-a: 1
  hook-b: 2
  hook-c: 3
  path: 17
  reveal: 18
motion: >
  Arabic calligraphy of the Bismillah writing itself stroke by stroke on a cream
  card, then each word lifting and glowing gold as its English meaning fades in
  beneath, over a slowly drifting emerald geometric pattern
---

# Funnel Content — AyahPath (Daily Quran Learning)

AyahPath Daily is a Quran micro-learning app (developer SCALENCE LIMITED, iOS "Education", subtitle "Islam Quranic Lessons & Audio"). It offers bite-sized lessons, narrated audio stories, quizzes, reflection and journaling, streaks and reminders, and memorization techniques. It ships in English, Arabic, French, German, Indonesian and Turkish, and is free to install with an "AyahPath Plus" subscription. The user tells us their goal (understand, read, memorize, habit), where they are on their Quran journey, how well they read Arabic and when they can give five minutes. They get a daily path fitted to their level and prayer routine, plus a real first lesson before the paywall. **Shape:** this is the **learning-plan** archetype (faith/devotional variant). It borrows the long quiz and plan reveal from `personalization-quiz`, but it is really a learning app. The quiz places the user on a curriculum, one real micro-lesson replaces the "generated reading", the product is a daily habit, and there is one monetization layer. There are **24 screens**. The flow is modeled on a teardown of AyahPath's own web funnel (`quiz.ayahpath.com`, cohort `ap_quran_313_c`, 41 screens, captured in AdSpyLab in 2026-09, plus cohorts `flow_ayah_313`, `ap_sd_313_c`, `ap_finance_313_c` and `ap_parenting_313_c`). Its question order and plan-reveal logic were kept. Its guilt questions, micro-"yes" loader prompts, scratch-card "90% promo" and intro-price-to-10x auto-renew checkout were **deliberately not copied** (listed in Notes). It is written as **in-app onboarding with Google Play / App Store billing**, because the store link targets Nigeria (Android-first, local-currency store pricing, cancellation in the store). The web-funnel variant is in Notes. **Visual override:** no dark purple house theme. It uses a calm devotional look: deep emerald, cream parchment cards, muted gold, low-opacity Islamic geometric pattern, correctly vowelled Uthmani Arabic, and no depictions of Prophets or Companions. **Tone:** sincere and gentle. No urgency, no guilt about salah or faith, no fabricated hadith or scholar endorsements. Every religious citation is a well-known authenticated text with its reference, and all of it must pass a qualified reviewer before launch. Copy follows the mobile limits: headline ≤6 words, body ≤12 words. Every screen has A/B copy (A = control).

---

## A. Hook

### 1. Hook A — The surah you already know
**Purpose:** Open on a true, personal fact every practicing Muslim recognizes. The gap between reciting and understanding is the emotional "before" state, and it carries no blame.
**Headline A:** You recite it 17 times daily
**Headline B:** Understand every word you pray
**Body A:** Learn the meaning of Al-Fatihah, the surah in every rak'ah.
**Body B:** Short daily lessons turn recitation into understanding.
**Visual:** Deep emerald background with a faint gold geometric pattern drifting slowly. A cream parchment card in the center shows "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ" in Uthmani script, with its English meaning fading in word by word beneath. Small rating badge in the top bar. Gold-outlined emerald CTA pinned at the bottom.
**Microcopy:** Footnote under the card: "17 = the rak'ahs of the five daily fard prayers." Top-bar badge: "★ {{store_rating}} on {{store_name}}" (live store value only; US App Store showed 4.7 from 834 ratings on 2026-09-28).
**CTA:** Start my path

### 2. Hook B — Made easy
**Purpose:** Social/ease framing through the Quran's own promise instead of a borrowed user-count claim, and name the three things the app actually teaches.
**Headline A:** Made easy to remember
**Headline B:** The Quran, one ayah daily
**Body A:** Understand, read and memorize, five minutes at a time.
**Body B:** Bite-sized lessons, audio stories and quizzes that fit your day.
**Visual:** Same emerald backdrop. Three stacked rounded cards fan out gently (📖 Understand · 🔤 Read · 🧠 Memorize), each showing a small lesson snippet, with a thin gold progress path linking them.
**Microcopy:** Quote strip above the CTA, verbatim from the translation the app ships: "And We have certainly made the Qur'an easy for remembrance, so is there any who will remember?" — Surah Al-Qamar 54:17
**CTA:** Continue

### 3. Hook C — Every level welcome
**Purpose:** Remove the two biggest silent objections before the quiz ("I can't read Arabic", "I'm too far behind"), and promise a short setup.
**Headline A:** Start wherever you are
**Headline B:** Built for every level
**Body A:** New to Arabic or returning after years, your path adapts.
**Body B:** A few questions shape a path made for you.
**Visual:** A winding path of soft stepping-stones rising up the screen toward a small glowing lantern, with cream stones on emerald. No people.
**Microcopy:** Under CTA: "About 1 minute · No Arabic needed to begin"
**CTA:** Build my path

---

## B. Investment

### 4. Main goal
**Purpose:** The single answer that picks the curriculum track (meaning / reading / memorization / habit). Every later screen and the Day 1-7 syllabus branch on it.
**Headline A:** What brings you here?
**Headline B:** What's your main goal?
**Body A:** Pick one; it sets your first lessons.
**Body B:** We'll start your path from here.
**Options:**
- 📖 Understand the meaning
- 🔤 Learn to read
- 🧠 Memorize surahs
- 📅 A daily habit
- ✏️ Other
**Field:** Single select, auto-advance on tap; "Other" opens a one-line input (max 60 chars) and maps to the habit track.
**Visual:** Emerald background, stacked cream pill buttons with a gold outline; the selected pill fills solid gold with emerald text. Thin progress bar at the top.
**CTA:** (auto-advances on select)

### 5. Name
**Purpose:** Captures `{{name}}` early so the placement questions and the path feel personal; skippable because some users hesitate to share a name in a faith app.
**Headline A:** What should we call you?
**Headline B:** What's your first name?
**Body A:** We'll use it on your path.
**Body B:** Only your first name, nothing more.
**Field:** Text input, placeholder "First name", max 30 chars, autocapitalize.
**Visual:** Plain cream input field on emerald, minimal chrome, keyboard up.
**Error state:** "Please enter a name, or tap Skip."
**Skip link:** "Skip for now". If skipped, every later `{{name}}` line uses its no-name A/B form (each screen below reads correctly without the token).
**CTA:** Continue

### 6. Quran journey
**Purpose:** Placement. It separates beginners, returners and new Muslims, who each need a different first week. Reverts are a real, vocal segment in the app's reviews.
**Headline A:** {{name}}, where are you now?
**Headline B:** How's your Quran journey?
**Body A:** No wrong answer; this just sets your pace.
**Body B:** Honest answers give you the right first lesson.
**Options:**
- 🌱 Just beginning
- 📘 Know some surahs
- 🔄 Coming back
- 🤍 New to Islam
- ✏️ Other
**Field:** Single select, auto-advance.
**Visual:** Same pill list; the progress bar advances.
**CTA:** (auto-advances on select)

### 7. Arabic reading
**Purpose:** The one datum the curriculum really depends on: whether to add letter and reading lessons or go straight to meaning.
**Headline A:** Can you read Arabic?
**Headline B:** How's your Arabic reading?
**Body A:** Not yet is fine; we'll teach the letters.
**Body B:** This decides if we add reading lessons.
**Options:**
- 🔤 Not yet
- ✋ Letters, slowly
- 📖 Yes, slowly
- ✅ Yes, fluently
**Field:** Single select, auto-advance.
**Visual:** Pill list, with a small row of Arabic letters (ا ب ت ث) in faint gold behind the headline.
**Microcopy:** Under options: "Every ayah also comes with transliteration and translation."
**CTA:** (auto-advances on select)

### 8. Meaning in salah
**Purpose:** Turns Hook A's fact into the user's own answer. This is the strongest motivation line on the paywall, and it is asked without judgment.
**Headline A:** Know what you recite in salah?
**Headline B:** Your salah, word by word?
**Body A:** Most of us learned the words before the meaning.
**Body B:** This helps us pick your first surahs.
**Options:**
- ✅ Yes, fully
- 🌗 The general idea
- 🔹 Short surahs only
- 🌱 Not yet
**Field:** Single select, auto-advance.
**Visual:** Pill list; a faint prayer-mat geometric motif (no figure) in the background corner.
**CTA:** (auto-advances on select)

### 9. Warm-up question
**Purpose:** A first taste of the in-app quiz format and a light placement signal. It uses an uncontested meaning question and replaces AyahPath's halal/haram quiz on contested fiqh issues.
**Headline A:** Quick one: what's "Al-ḥamdu lillāh"?
**Headline B:** What does "Al-ḥamdu lillāh" mean?
**Body A:** Just a warm-up; this is how lessons feel.
**Body B:** No score, just a taste of a lesson quiz.
**Options:**
- 🔹 Praise to Allah
- 🔹 In Allah's name
- 🔹 Peace upon you
- 🔹 If Allah wills
**Field:** Single select. On tap, the chosen pill turns green (correct) or soft amber (other), the correct pill is highlighted, and a feedback card slides up. No "Other" option (it has a right answer).
**Visual:** Cream quiz card with the Arabic "ٱلْحَمْدُ لِلَّهِ" large at the top and four answer pills beneath; the feedback card rises from the bottom.
**Microcopy:** Correct: "Yes! It opens Surah Al-Fatihah: "All praise is due to Allah, Lord of the worlds."" · Other picks: "Close! It means "All praise is due to Allah," from Surah Al-Fatihah." (Distractors are the real meanings of Bismillah, As-salāmu ʿalaykum and In shā' Allāh, so a wrong pick still teaches something.)
**CTA:** Continue

---

## C. Trust

### 10. Real reviews
**Purpose:** Trust beat right after the placement block (the most effortful stretch). It uses the store's real rating and real review lines, with no invented user counts.
**Headline A:** {{store_rating}}★ from real learners
**Headline B:** Loved by learners like you
**Body A:** Rated by Muslims learning one ayah at a time.
**Body B:** Real reviews from the {{store_name}}.
**Visual:** Large gold rating number on emerald, a five-star row beneath, two cream quote cards stacked with a slight offset.
**Microcopy:** Quote cards (verbatim App Store review lines, attributed only as "App Store review", no invented names or photos): "As a revert it can be overwhelming to find resources that break down being Muslim in simple and digestible terms" · "I really like the way everything is structured and very easy to follow". Refresh from the live store before launch and use the NG storefront if it has reviews.
**CTA:** Continue

---

## B. Investment (continued)

### 11. What gets in the way
**Purpose:** Names the practical barrier the path is designed around (time, stop-start, Arabic, direction). It asks what gets in the way, never how strong the user's faith is.
**Headline A:** What usually gets in the way?
**Headline B:** What makes consistency hard?
**Body A:** Your path will be built around this.
**Body B:** Everyone has something; pick what fits most.
**Options:**
- ⏱️ Not enough time
- 🔁 Start, then stop
- 🔤 Arabic feels hard
- 🧭 Where to start?
- ✏️ Other
**Field:** Single select, auto-advance.
**Visual:** Pill list, progress bar about 60%.
**CTA:** (auto-advances on select)

### 12. Small and steady (bridge)
**Purpose:** Bridge/reassurance midway through the quiz. It answers the barrier just named with an authentic hadith on consistency and explains why lessons are minutes long.
**Headline A:** Small and steady is beloved
**Headline B:** Consistency beats intensity
**Body A:** That's why your lessons take minutes, not hours.
**Body B:** {{name}}, a few minutes daily is how this works.
**Visual:** Cream card centered on emerald with the hadith in serif type, a thin gold rule above and below, and the geometric pattern very faint behind.
**Microcopy:** Hadith card: "The most beloved deeds to Allah are those done consistently, even if they are small." — Prophet Muhammad ﷺ, narrated by ʿĀ'ishah (RA) · Sahih al-Bukhari 6464, Sahih Muslim 783. Line under the card, conditional on screen 11: Time → "Five minutes fits after one salah." · Start-stop → "Missed a day? Your path simply waits." · Arabic → "Transliteration and audio on every ayah." · Where to start → "Your first week is already mapped." Progress hint: "Almost there: 3 quick questions left".
**CTA:** Continue

### 13. How you like to learn
**Purpose:** Picks the lesson mix from features the app really ships (lessons, audio stories, quizzes, journaling), and previews them before the paywall lists them.
**Headline A:** How do you like to learn?
**Headline B:** Pick your favourite formats
**Body A:** Choose all that apply; we'll mix them in.
**Body B:** Your daily lesson blends what you pick.
**Options:**
- 📖 Short lessons
- 🎧 Audio stories
- ❓ Quick quizzes
- ✍️ Reflection journal
- ✏️ Other
**Field:** Multi-select, checkmark on each selected pill; CTA disabled until ≥1 pick.
**Visual:** Pill list with a gold check circle on the right of each pill.
**Microcopy:** Disabled-CTA hint: "Pick at least one to continue"
**CTA:** Continue

### 14. Daily minutes
**Purpose:** Sets `{{minutes}}`, the lesson length and the realistic pace shown on the path screen. Smaller commitments convert and retain better, so 5 minutes is shown first.
**Headline A:** How much time each day?
**Headline B:** Your daily learning goal
**Body A:** Even five minutes builds a real habit.
**Body B:** You can change this anytime.
**Options:**
- 🌱 5 min · Easy
- 📘 10 min · Steady
- 📚 15 min · Focused
- 🌟 20+ min · Deep
**Field:** Single select, auto-advance.
**Visual:** Four large cream cards in a 2×2 grid, each with a small clock arc filled to its length; the selected card gets a gold border.
**CTA:** (auto-advances on select)

### 15. Anchor to a prayer
**Purpose:** Habit anchoring. Tying the lesson to a salah the user already performs is the retention mechanic, and it sets `{{anchor_prayer}}` and the reminder time.
**Headline A:** When fits best for you?
**Headline B:** Pair it with a prayer
**Body A:** Linking lessons to a salah makes them stick.
**Body B:** We'll remind you at this time.
**Options:**
- 🌅 After Fajr
- ☀️ After Dhuhr
- 🌇 After Maghrib
- 🌙 Before sleep
- ✏️ Other
**Field:** Single select, auto-advance. "Other" opens a time picker. If the app has local prayer times, the reminder follows the chosen prayer. Otherwise it defaults to a fixed clock time the user can edit on screen 19 (After Fajr 6:00, After Dhuhr 13:30, After Maghrib 19:00, Before sleep 21:30).
**Visual:** Horizontal sky-gradient strip across the top (dawn → noon → dusk → night) with a small gold marker sliding to the chosen moment; pill list beneath.
**CTA:** (auto-advances on select)

---

## D. Anticipation

### 16. Preparing your path (loading)
**Purpose:** Makes the path feel built from the user's answers, and fills the wait with real reviews as a second trust beat before the gate.
**Headline A:** Preparing {{name}}'s path…
**Headline B:** Choosing your first ayat…
**Steps:** (4 progress rows, each with a % counter, checkmark and progress bar)
- Matching lessons to your level…
- Choosing your first surahs with care…
- Fitting it into {{minutes}} a day…
- Almost ready, your first ayah awaits…
**Visual:** The top half shows the Bismillah in gold calligraphy, drawing itself stroke by stroke inside a slowly turning 8-point geometric star ring. Four rows beneath (label left, % right, gold check when done, thin full-width bar). A review card rotates under the rows.
**Microcopy:** Rotating cards (verbatim App Store lines, attributed "App Store review"): "The explanations and insights are clear and to the point" · "I really like the way everything is structured and very easy to follow". No questions inside the loader (see Notes: AyahPath's "Ready to grow closer to Allah? No / Yes" prompts are not copied).
**CTA:** (auto-advances, ~6-7 seconds)

### 17. Your path is ready (preview)
**Purpose:** Preview/tease. Shows a concrete first-week syllabus on the chosen track, so the paywall sells a plan the user has already seen rather than a vague promise. It makes no outcome predictions.
**Headline A:** {{name}}, your path is ready
**Headline B:** Your first week, planned
**Body A:** Starting with Al-Fatihah, the surah you know best.
**Body B:** {{minutes}} minutes a day, after {{anchor_prayer}}.
**Visual:** Profile chips row at the top (Goal · Level · {{minutes}} min · {{anchor_prayer}}), then a vertical path of 7 stepping-stones, Day 1 glowing gold and "unlocked", Days 2-7 cream with a small lock.
**Microcopy:** Syllabus by track (Day 1 is always the free Bismillah lesson):
- **Meaning:** Day 1 Bismillah · Day 2 Al-ḥamdu lillāh · Day 3 Ar-Raḥmān, Ar-Raḥīm · Day 4 Māliki yawm id-dīn · Day 5 Iyyāka naʿbudu · Day 6 Ihdinā aṣ-ṣirāṭ · Day 7 Review + reflection
- **Reading:** Day 1 Bismillah · Days 2-6 letters and short vowels, practiced on Al-Fatihah's words · Day 7 Read Bismillah aloud
- **Memorize:** Day 1 Bismillah · Days 2-6 Al-Ikhlāṣ, Al-Falaq, An-Nās with meaning and audio repetition · Day 7 Recall check
- **Habit / Other:** Day 1 Bismillah · Days 2-6 one daily ayah + story · Day 7 Your first week's journal
Journey stage adjusts the tone: "New to Islam" adds a short "What is the Quran?" lesson on Day 2; "Coming back" starts with review.
**CTA:** Try lesson 1

### 18. Lesson 1: Bismillah (first taste)
**Purpose:** The reveal. A real, complete micro-lesson before any gate or payment. For a learning product, one delivered lesson proves more than any loading screen, and it is the main ad-creative screen.
**Headline A:** Lesson 1: Bismillah
**Headline B:** Your first lesson, explained
**Body A:** Tap each word to see its meaning.
**Body B:** Listen, then tap a word to understand it.
**Visual:** Large cream card: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" in Uthmani script, each word a tappable chip that glows gold and shows a tooltip. Transliteration and translation beneath, audio play button with a gentle waveform. A one-question check and a reflection field follow on scroll. Hero motion (calligraphy writing in, words lighting up) lives here only.
**Microcopy:**
- Translation (verbatim from the app's shipped translation): "In the name of Allah, the Entirely Merciful, the Especially Merciful."
- Word tooltips: "Bismi: in the name of" · "Allāh: God, the One" · "Ar-Raḥmān: the Entirely Merciful" · "Ar-Raḥīm: the Especially Merciful". Footnote: "Both names come from r-ḥ-m, the root of mercy."
- Check: "Which two names share one root?" (Ar-Raḥmān & Ar-Raḥīm)
- Reflection prompt: "What will you begin with Bismillah today?" (optional, saved to the journal)
- Completion toast: "Lesson 1 complete · Day 1 of your path"
**CTA:** Complete lesson

### 19. Daily reminder
**Purpose:** Notification opt-in at peak goodwill, right after the first lesson is completed. It locks the prayer-anchored daily loop, which is the retention product.
**Headline A:** Your daily ayah, on time
**Headline B:** A gentle reminder after {{anchor_prayer}}
**Body A:** One reminder a day, at the time you chose.
**Body B:** Keep your streak without having to remember.
**Field:** Time picker prefilled from screen 15; the system permission prompt follows on tap.
**Visual:** Phone lock-screen mockup on emerald showing one sample notification card; the time pill sits beneath it.
**Microcopy:** Sample push: "📖 {{name}}, today's ayah is ready: 5 minutes after {{anchor_prayer}}." Rule for all pushes: invitations to learn only. Never comment on the user's salah, never "you missed…", never fear of the ākhirah.
**Skip link:** "Not now"
**CTA:** Turn on reminders

### 20. Set your intention
**Purpose:** An optional commitment device framed as niyyah (a sincere personal intention). It turns the plan into the user's own choice, is fully skippable and makes no promise to the app.
**Headline A:** Set your intention
**Headline B:** Make your niyyah
**Body A:** A quiet intention to keep learning, one ayah daily.
**Body B:** Tap to set it; you can change it anytime.
**Field:** One tappable cream card, prefilled from goal + minutes: "I intend to {{goal_verb}} the Quran, {{minutes}} minutes a day, in shā' Allāh." Edit pencil on the card. A single tap sets it (no hold-to-promise, no timer).
**Visual:** Card centered on emerald with a small lantern icon; on tap the card border fills gold and a soft glow spreads once.
**Skip link:** "Skip"
**CTA:** Set my intention

---

## E. Gate

### 21. Save your path
**Purpose:** Soft identity gate. It saves the path, streak and journal before the paywall, and the promise is progress, not the "result", which the user already has.
**Headline A:** Save your path
**Headline B:** {{name}}, keep your progress safe
**Body A:** Sign in to keep your streak on any phone.
**Body B:** Your lessons, notes and streak stay with you.
**Field:** "Continue with Google" (first on Android) · "Continue with Apple" (first on iOS) · "Use email" (email + password, min 8 chars).
**Visual:** Emerald background, small path illustration with Day 1 checked at the top, three full-width cream sign-in buttons, minimal chrome.
**Error states:** "Enter a valid email address" / "Password must be at least 8 characters" / "This email already has an account. Log in instead?"
**Microcopy:** Legal line under the buttons: "By continuing, you agree to our Terms & Privacy Policy." Privacy line: "We never sell your data."
**CTA:** Continue

---

## F. Monetization

### 22. Paywall
**Purpose:** The single ask. It sells the full path the user has seen and started, with a plain, store-billed price and renewal terms visible at the moment of choice.
**Headline A:** Unlock your full path
**Headline B:** Keep going, {{name}}
**Body A:** Every lesson, story and quiz, with a clear price, cancel anytime.
**Body B:** Your {{minutes}}-minute path, every day, with nothing locked.
**Plans:**
- **Yearly**: pre-selected, badge "BEST VALUE". The card shows the full yearly price in local currency, with the per-month equivalent small beneath. Any savings badge is computed honestly against 12× the monthly price.
- **Monthly**: full monthly price, no badge.
- Prices come from Google Play / App Store in local currency (₦ for NG). No invented prices, no struck-through "was" prices. (Reference only: the US App Store lists "AyahPath Plus" price points $9.99, $13.99, $14.99, $22.49, $39.99, $45.49, $69.99; the mapping to durations is not public.)
- Optional free trial on Yearly only, and only if the store product actually has one: "Free for {{trial_days}} days, then {{yearly_price}}/year."
**Visual:** Emerald background, a mini version of the 7-day path at the top (Day 1 checked). Benefit rows. Two stacked cream plan cards; the selected one has a gold border, filled radio and the renewal price printed inside the card. Full-width gold CTA. The close ✕ is visible top-left from the first frame (no delayed ✕).
**Microcopy:**
- Benefit rows (only shipped features): "📖 Bite-sized daily lessons" · "🎧 Narrated audio stories" · "❓ Quizzes that check understanding" · "✍️ Reflection & journal" · "🧠 Memorization practice" · "🔥 Streaks & gentle reminders"
- Line under the plan cards, always visible and not collapsed: "{{plan_price}} per {{period}}. Renews automatically until you cancel."
- If trial: "Free for {{trial_days}} days, then {{plan_price}}/{{period}}. We'll remind you {{n}} days before you're charged."
- Trust row: "Billed by {{store_name}} · Cancel anytime in your subscriptions · Restore purchase"
- One review line: "The explanations and insights are clear and to the point" (App Store review)
- No countdown, no promo code, no "offer expires".
**Fallback offer:** On ✕, the last-chance offer (#23) once per session: the Yearly store trial if the product has one, else the lighter Monthly tier at its listed price. Nothing struck, no timer. Declining goes to the free experience (#24), never back into the paywall loop.
**CTA:** Start my path (trial variant: Start free trial)

### 23. Last-chance offer (on paywall close)
**Purpose:** Second chance for users who close the paywall (✕) without paying, within the brand promise in #22: store prices only, nothing struck, no urgency. It is not a markdown: the store's own Yearly free trial at the listed yearly renewal, or, when the store product has no trial, the lighter Monthly tier at its listed price. Shown once per session, then never again.
**Headline A:** {{name}}, keep your path going (no name: "Keep your path going")
**Headline B:** Try the full path first (lighter tier: "A lighter way to begin")
**Body A:** Trial: "Day 1 is done. Try every lesson {{prayer_anchor}} before you pay." Lighter tier: "Start month by month, with no yearly commitment."
**Plans:** One offer card, nothing struck (`compareAt: null`), no badge. Trial (store product has one): **Yearly, free trial first**, {{offer_price}} today (free for {{trial_days}} days), then {{yearly_price}}/year. No trial: **Monthly**, {{monthly_price}} per month, renews monthly.
**Visual:** Same look as #22: emerald background, bar with the octagram logo, app name and a close ✕, centered gold eyebrow "One-time offer · shown once", headline and lead, then one cream parchment card with a gold border holding the 7-day path (Day 1 checked), the plan name ("Your {{minutes}}-minute {{track}} path, nothing locked"), the price row, 3 checks ("Bite-sized daily lessons", "Narrated audio stories", "Quizzes that check understanding"), the gold CTA, the renewal line and "Billed by {{store_name}} · Cancel anytime in your subscriptions". Plain decline link below the card. No payment badges (store billing).
**Microcopy:** Renewal line, trial: "{{offer_price}} today: free for {{trial_days}} days, then {{yearly_price}}/year. We'll remind you {{n}} days before you're charged." Lighter tier: "{{monthly_price}} per month. Renews automatically until you cancel." Shown once per session (sessionStorage `ikf_offer_ayahpath`): a second paywall close goes straight to #24 Day 1 complete (free). No timer: `expiresMin` must stay `null` (brand promise, no urgency). Decline (link and ✕): "No thanks, continue with today's free ayah" (app has a free tier) or "No thanks, keep my free first lesson", which goes to #24 Day 1 complete on the free path, never back into the paywall. Accept starts the store purchase for the offer's `productId` (`checkoutUrl` stays empty), then #24. Events: `paywall_close` (with `offerShown`), `offer_view`, `offer_accept` + `checkout_click` with plan `offer`, `offer_decline`, `offer_expired`.
**CTA:** Claim my offer

---

## G. Payoff

### 24. Day 1 complete
**Purpose:** Confirms the purchase (or free start), shows the streak begun, and points to tomorrow's lesson so the second open is already set.
**Headline A:** Your path begins today
**Headline B:** Day 1 complete, {{name}}
**Body A:** Next up: "Al-ḥamdu lillāh", with audio and a quick quiz.
**Body B:** Your streak starts now; see you after {{anchor_prayer}}.
**Visual:** Emerald background, a single gold flame / crescent streak marker showing "1", the 7-stone path with Day 1 filled and Day 2 glowing, and a small reminder-time chip beneath.
**Microcopy:** Secondary link: "Learn with family: invite someone" (share sheet, optional). No rating prompt here; ask for a store rating only after a 3-day streak.
**CTA:** Open my path

---

## Notes

**Verified (2026-09-28):**
- App Store listing: SCALENCE LIMITED, Education, iOS 17+, 4.7★ / 834 ratings (US), 6 languages, "AyahPath Plus" in-app purchases $9.99-$69.99 (7 price points), v1.9 (Sep 11), released 2025-12-23. The feature list (bite-sized lessons, audio stories, quizzes, reflection & journaling, streaks/reminders, memorization techniques) comes from the store description.
- MWM (third-party): 100K+ downloads. Its aggregate of 1.9/5 across 467 written reviews points to serious billing complaints.
- Real web funnel: AdSpyLab captures of `quiz.ayahpath.com`, cohorts listed in the intro. Checkout is run by "Extramile Limited" on Stripe. Ads run from Facebook pages named "Advice From Imam Malik", "Advice from Imam Ibrahim", "Imam Advice Daily" and "Quran Noor".

**Not verified / assumed:**
- Google Play content couldn't be fetched (page truncated), so Android pricing and whether a free tier exists are unknown.
- Whether the store products include a free trial is unknown.
- Whether the app has local prayer times, word-by-word tooltips or a Warsh mushaf option is unknown.
- Screen 18 assumes the app can render a word-by-word lesson. If it can't, drop the word chips and keep ayah + audio + translation + one-line explanation.

**Competitor teardown (AyahPath web funnel, `ap_quran_313_c`). What was kept:**
- Gender/age dropped. They are analytics-only for this output.
- Kept the placement logic ("how long Muslim", "meaning in salah", "Al-Fatihah" framing) and the barrier question.
- Kept the authentic citations they use (Bukhari 6464 / Muslim 783, Ash-Sharḥ 94:5-6) and the translation choice.
- Kept prayer-anchored timing ("After Fajr / After Maghrib"), the plan-summary reveal and the email/progress save.

**Reference only, never build for ikame:**
- **Hidden-cost checkout.** A scratch card "reveals" a "90% discount" whose promo code is the user's own first name + month (e.g. "Thomas_Sep26"), next to a ~10:00 countdown. The plans are 1-Week / 4-Week "MOST POPULAR" / 12-Week at intro prices (€0.92 / €2.79 / €4.66, shown against €9.20 / €27.98 / €46.64). The fine print then auto-renews at the full €27.98 every 4 weeks (10× the intro price) "until you cancel by contacting support@ayahpath.com". Email is the only cancellation route. The terms say "1-month introductory period" even under the 1-week plan. The "100% Money-Back Guarantee" only applies if you "demonstrate that you followed our plan".
- **Complaints about that checkout.** Store and Trustpilot reviews report surprise charges ("Charged even with no account", €27; charged after a "7 day only trial", $29.99), and the developer replies that renewal is disclosed on the purchase screen. This is the same "cheap front-end into full-price recurring" mechanic flagged in `personalization-quiz.md` Traps.
- **Other patterns not copied:**
  - Static "1103 people began today · @peter*** 8 minutes ago" feed.
  - Unverifiable "1,300,000 Muslims" and "Every translation is reviewed by qualified scholars" claims.
  - Imam-persona ad pages.
  - Guilt/fear questions ("How is your salah right now?", "Who needs to see stronger iman in you?", "When do you feel most distant?", akhirah "Anxious, if I'm honest").
  - Micro-"yes" prompts inside the loader ("Ready to grow closer to Allah? No / Yes").
  - Hold-to-promise pledge ("I promise to put Allah first…").
  - Halal/haram quiz on contested issues (tattoo, non-alcoholic beer, coffee).
  - The `ap_sd_313_c` cohort's "Your spiritual profile is 75% revealed: Maryam (AS), Sabr 95%, Tawakkul 99%". Scoring a user's virtues against a Prophet's family is disrespectful and is a paywall-locked fake reveal.

**Religious content review (required before launch):**
- A qualified reviewer must check every Arabic string (full tashkīl, Uthmani font), transliteration, translation and citation.
- Quote translations verbatim from the one translation the app licenses, and check the licence for marketing use.
- Hook A's "17" = rak'ahs of the five fard prayers.
- The UI deliberately uses surah names without verse numbers for Al-Fatihah. Hafs numbering counts the Bismillah as 1:1; Warsh and Maliki usage (common in West Africa, including northern Nigeria) does not. Screen 18 is therefore titled "Bismillah", not "Ayah 1".
- Consider a Warsh recitation/mushaf option for NG traffic if the app supports it.
- Imagery: no depictions of Prophets or Companions, no mushaf on floors or near feet, and no Quran text used as decoration behind prices.
- Honorifics: ﷺ after the Prophet's name, (RA) after Companions.

**Blocks deliberately skipped:**
- Gender and age: not used by the output.
- Gamified wheel/scratch: cheapens a devotional promise and was the vehicle for the fake discount.
- Post-purchase upsell with countdown: no add-on exists, and countdowns contradict the tone.
- Before/after split: implies the user's current faith is the "bad" side.
- Second revenue layer: none known.
- Translation-choice question: default to the device language and let the user change it in settings. AyahPath asks this, but the answer barely changes week 1.

**Drop-off risk:**
- Screen 7 (Arabic) for non-readers, which is why the body reassures and screen 3 pre-empts it.
- Screen 9, a quiz can feel like a test. It is framed as a warm-up and every answer teaches.
- Screen 22. The free lesson on screen 18 carries the paywall.
- The gate (21) sits after the free lesson on purpose: the user has something to save.

**Monetization:** one layer, the store subscription. Track paywall conversion, trial-to-paid conversion if a trial exists, and **Day-2 lesson completion** as the leading retention metric. For a habit product, Day 2 predicts renewal better than install-to-pay. Track refund/chargeback rate separately; given the competitor's complaint profile, a low one is a positioning advantage worth showing in ads ("Cancel anytime in Google Play").

**Last-chance offer:** measure offer CVR (#23 `offer_view` → `offer_accept`) separately from paywall CVR (#22).

**First A/B tests:**
1. First lesson (18) before vs after the paywall. Expect "before" to win on trust and on Day-2 retention.
2. Hook A "17 times" fact vs Hook B's Quran-promise framing as the ad entry.
3. Intention screen (20) on vs off.
4. Yearly + Monthly vs adding a Weekly plan for NG price sensitivity. Show real store prices, no decoy.

**Web-funnel variant** (if ikame runs pre-install web traffic like the competitor):
- Remove screens 19-20.
- Swap screen 21 for an email gate ("Save your path").
- Paywall on web checkout with the same renewal line printed on the plan card, and self-serve cancellation (a link, not "email support").
- Add a download handoff screen after payment ("Sign in with {{email}} to open Day 2"), as in `authenticator/funnel-content.md`.

**Localization:** English first for NG. Arabic is already in the app. Queue Hausa copy as a separate test (not in the app's current language list; verify before promising it in ads).
