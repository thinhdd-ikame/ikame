---
niche: ayahpath-arabic
display_name: AyahPath (Learn Quranic Arabic)
archetype: learning-plan
subject: person
input: Arabic reading level, learning goal, name, six Al-Fatiha word meanings, daily minutes, email
output: personalized "% of Al-Fatiha you know" plus a goal-dated word-by-word path starting with the words they missed
screens: 21
monetization: web subscription paywall (1/4/12-week plans, 4-week pre-selected, renewal price on every plan) plus one-time smaller "Al-Fatiha pass" as the last-chance offer
creative_screens:
  hook-a: 1
  hook-b: 2
  word: 8
  reveal: 13
motion: >
  Gold light sweeps across the 29 words of Al-Fatiha on a deep emerald
  geometric pattern, lighting each word you know one by one while the
  percentage counts up beside them
---

# Funnel Content — AyahPath (Learn Quranic Arabic)

A web2app funnel for a Quranic-Arabic learner. The user tells us how well they read Arabic and what they want from the Quran, then identifies the meaning of six real Al-Fatiha words. From their own answers we compute **"the % of Al-Fatiha's words you already know"** (every one of its 29 words is counted, repeats included, and only words from correctly answered items count), then turn it into a dated path: the words they have left, at the pace they chose. One subscription unlocks the path (sold on the web, then app sign-in by the same email). **Shape:** `learning-plan` archetype, faith/devotional variant (21 screens). The "mini test → measured level → dated plan" spine is the archetype's; the test is six word-meaning taps and the measured level is a real percentage of a surah the user recites daily.

**Reference funnel:** there is no web funnel for this lane. It is modeled on the placement-assessment hook of Kalaam (App Store id6446328873: "you understand X% of the Quran") and on AyahPath's own web quiz (`quiz.ayahpath.com`, cohort `ap_quran_313_c`, AdSpyLab capture 2026-09-27), see `funnel/research/squad1m-niches-2026-10/ewa-ayahpath.md` §9. The brand base is `learning/ayahpath/` (deep emerald, cream parchment, muted gold, faint 8-point geometric pattern, Uthmani Arabic set in Amiri Quran, Lora headings). **Deliberately different from the competitors:** the percentage is computed from the user's own answers (not a fixed claim, not "300 words = 70% of the Quran"); the test is built from Al-Fatiha so the aha is about a surah they already say 17 times a day; no guilt questions, no promo codes, no scratch card, no countdown, no intro-price-to-10x renewal trap, no "reviewed by scholars" claim; the paywall is a web page with renewal printed next to every intro price. **Visual override:** calm devotional look, no people, no Prophets or Companions depicted, Arabic is always live text (never baked into images). Copy follows the mobile limits: headline ≤6 words, body ≤12. Every screen has A/B copy (A = control).

---

## A. Hooks

### 1. Hook A — The surah you say daily
**Purpose:** Opens on a fact every practicing Muslim recognises: you recite Al-Fatiha constantly. The gap between reciting and understanding is the emotional "before" state, with no blame.
**Headline A:** Understand what you recite
**Headline B:** Know every word you pray
**Body A:** Al-Fatiha is in every rak'ah. Learn its words.
**Body B:** Word by word, in minutes a day.
**Visual:** Emerald hero card with a faint drifting gold geometric pattern and a soft glow; live Uthmani text "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ" in gold over it (Copy A caption "You say it 17 times a day", Copy B "Part of every rak'ah"). AyahPath logo top-left. Emerald full-width CTA pinned at the bottom.
**Microcopy:** Footnote: "17 = the rak'ahs of the five daily fard prayers." Rating strip under the logo ("★ {{store_rating}} · {{rating_count}} {{store_name}} ratings") renders only when all three are real values; hidden otherwise.
**CTA:** Start my path

### 2. Hook B — Six words, your number
**Purpose:** Names the payoff (a real number about a real surah) and previews exactly which words will be checked, so the quiz feels small and fair.
**Headline A:** Six words. Your real number.
**Headline B:** How much do you understand?
**Body A:** See how much of Al-Fatiha you already know.
**Body B:** Takes about two minutes. No sign-up yet.
**Visual:** The whole surah laid out in lines as live Arabic text (right-to-left, Uthmani), the six words to be checked glowing gold, the rest faded.
**Microcopy:** Under the surah: "Gold = the six words we'll check with you." Under CTA: "About 2 minutes · No Arabic needed to begin".
**CTA:** Continue

---

## B. Investment

### 3. Arabic reading
**Purpose:** The one datum that changes the plan's length: whether letter lessons are added before the word lessons.
**Headline A:** Can you read Arabic script?
**Headline B:** How's your Arabic reading?
**Body A:** Not yet is fine; we'll add letters.
**Body B:** This decides if letters join your plan.
**Options:**
- 🔤 Not yet
- ✋ Letters, slowly
- 📖 Yes, slowly
- ✅ Yes, fluently
**Field:** Single select, auto-advance. Ordered scale, so no "Other".
**Visual:** Pill list on cream; progress bar starts.
**Microcopy:** Under options: "Every lesson also has transliteration and translation."
**CTA:** (auto-advances on select)

### 4. Main goal
**Purpose:** Picks the second stage of the plan (what comes after Al-Fatiha) and a goal phrase reused on the plan and paywall.
**Headline A:** What brings you here?
**Headline B:** What's your main goal?
**Body A:** Pick one; it shapes your plan.
**Body B:** We'll start your path from here.
**Options:**
- 🕌 Understand my salah
- 📖 Read the Quran
- 🧠 Memorize surahs
- 👨‍👩‍👧 Learn with family
- ✏️ Other
**Field:** Single select. "Other" opens a one-line input (max 40 chars); CTA stays disabled until a pill is picked and, for "Other", the input is not empty.
**Visual:** Same pill list; selected pill fills emerald with white text.
**CTA:** Continue

### 5. Name
**Purpose:** Captures `{{name}}` for the plan and paywall; skippable because some users hesitate to share a name in a faith app.
**Headline A:** What should we call you?
**Headline B:** What's your first name?
**Body A:** We'll use it on your path.
**Body B:** First name only, nothing more.
**Field:** Text input, placeholder "First name", max 30 chars, autocapitalize words.
**Visual:** Plain cream input, minimal chrome, keyboard up.
**Error state:** "Please enter a name, or tap Skip."
**Skip link:** "Skip for now". Every later `{{name}}` line has a no-name form ("you" / "Your path…") and never shows the raw token.
**CTA:** Continue

### 6. Word check intro (bridge)
**Purpose:** Expectation setting before the test: it is a starting point, not a grade, and not a measure of faith. This is the one bridge before the quiz.
**Headline A:** Let's check six words
**Headline B:** Six words from Al-Fatiha
**Body A:** Not a grade. Just your starting point.
**Body B:** Every answer shows its meaning.
**Visual:** Small emerald-and-gold hero strip, then an emerald card with "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" (live text) and three steps: See it, Tap it, Learn it.
**Microcopy:** "A self-check for learning, not a judgement of anyone's faith."
**CTA:** Begin

### 7. Word 1 — ٱللَّهِ (Allāh)
**Purpose:** Warm-up on the most familiar word, so the first tap is a win and the format is clear.
**Headline A:** Word 1 of 6
**Headline B:** What does this mean?
**Body A:** Start with the most familiar word.
**Body B:** Tap the meaning you think fits.
**Options:** 🔹 The Day · 🔹 God ✓ · 🔹 The worlds · 🤔 Not sure
**Field:** Single select, answers lock on tap. Right: pill turns green; wrong: soft amber and the right pill is shown; "Not sure": neutral, right pill shown. A feedback card appears: "Allāh means God. It appears twice, in "Bismillah" and "al-ḥamdu lillāh"." Transliteration appears under the word after the tap. No "Other" (the item has a right answer).
**Visual:** Large live Arabic word "ٱللَّهِ" on a parchment card (Amiri Quran, RTL), 6-segment progress dots above, four pills below.
**CTA:** Next word

### 8. Word 2 — رَبِّ (rabbi)
**Purpose:** Second frequent word, a meaning that carries the whole second line.
**Headline A:** Word 2 of 6
**Headline B:** What does this mean?
**Body A:** From the second line of the surah.
**Body B:** Not sure? That's a fine answer.
**Options:** 🔹 Lord ✓ · 🔹 King · 🔹 Praise · 🤔 Not sure
**Field:** Same behavior. Feedback: "Rabb means Lord: the One who creates, owns and sustains." (Distractors are real Al-Fatiha words, so a wrong pick still teaches.)
**Visual:** Same card with "رَبِّ".
**CTA:** Next word

### 9. Word 3 — ٱلرَّحْمَٰنِ (ar-Raḥmān)
**Purpose:** A word users hear daily but may not translate; it appears twice, which raises the percentage honestly if they know it.
**Headline A:** Word 3 of 6
**Headline B:** What does this mean?
**Body A:** It describes Allah, and appears twice.
**Body B:** Not sure? That's a fine answer.
**Options:** 🔹 Praise · 🔹 King · 🔹 Most Merciful ✓ · 🤔 Not sure
**Field:** Same behavior. Feedback: "Ar-Raḥmān means the Most Merciful. It appears twice in the surah."
**Visual:** Same card with "ٱلرَّحْمَٰنِ".
**CTA:** Next word

### 10. Word 4 — إِيَّاكَ (iyyāka)
**Purpose:** The first word that is not a name or noun; a decoy option ("We worship") is a real neighbouring word, which curbs over-claiming.
**Headline A:** Word 4 of 6
**Headline B:** What does this mean?
**Body A:** A short word, repeated twice.
**Body B:** Not sure? That's a fine answer.
**Options:** 🔹 We worship · 🔹 Guide us · 🔹 You alone ✓ · 🤔 Not sure
**Field:** Same behavior. Feedback: "Iyyāka means "You alone". It starts two phrases: worship, and ask for help."
**Visual:** Same card with "إِيَّاكَ".
**CTA:** Next word

### 11. Word 5 — ٱلصِّرَٰطَ (aṣ-ṣirāṭ)
**Purpose:** The word at the heart of the du'a in the last third of the surah.
**Headline A:** Word 5 of 6
**Headline B:** What does this mean?
**Body A:** A word from the du'a near the end.
**Body B:** Not sure? That's a fine answer.
**Options:** 🔹 The path ✓ · 🔹 The Day · 🔹 The worlds · 🤔 Not sure
**Field:** Same behavior. Feedback: "Aṣ-ṣirāṭ means the path. It appears twice: "the straight path" and "the path of…"." (The form صِرَٰطَ in the last line counts as the same word.)
**Visual:** Same card with "ٱلصِّرَٰطَ".
**CTA:** Next word

### 12. Word 6 — عَلَيْهِمْ (ʿalayhim)
**Purpose:** Last item; a small grammatical word that appears twice in the final line, so it carries real weight in the percentage.
**Headline A:** Word 6 of 6
**Headline B:** What does this mean?
**Body A:** It ends two phrases in the last line.
**Body B:** Not sure? That's a fine answer.
**Options:** 🔹 From them · 🔹 Upon them ✓ · 🔹 With them · 🤔 Not sure
**Field:** Same behavior. Feedback: "ʿAlayhim means "upon them". It appears twice in the last line." CTA text is "See my result".
**Visual:** Same card with "عَلَيْهِمْ".
**CTA:** See my result

### 13. Your % of Al-Fatiha
**Purpose:** The aha. A real percentage computed from the six answers: each of the 29 words of the surah that belongs to a correctly answered word is counted (repeats count each time, "Not sure" counts as unknown, unchecked words are not counted). It is an estimate from six answers, not a measurement: a lucky guess counts, so the screen says "from your 6 answers" and the footnote says guesses may count.
**Headline A:** You know {{pct}}% of Al-Fatiha
**Headline B:** Your starting point: {{pct}}%
**Body A:** {{known}} of {{total}} words, from your 6 answers.
**Body B:** Your path covers the rest, word by word.
**Visual:** Big emerald percentage number, then the full surah in right-to-left lines as live Arabic text; the words the user knows light up gold one by one, the rest stay faded. Below, six rows (Arabic word, transliteration, meaning, "× in the surah", a "You know it" or "To learn" tag).
**Microcopy:** Footnote: "{{known}} of 29 words counted from your answers. Repeats count each time. Guesses may count; unchecked words aren't counted." Zero-correct variant: Headline A "A fresh start, {{name}}" (no name: "A fresh start") / Headline B "Starting point: 0%", Body A "Every one of 29 words is a new door." / Body B "Your path starts with the first one." The largest possible value from these six words is 38% (11 of 29); never say more than what was counted.
**CTA:** Build my plan

### 14. Minutes a day
**Purpose:** Pace input; it moves the goal date on the plan (minutes ÷ 2.5 = words per day, an assumption to confirm with the real lesson length).
**Headline A:** How many minutes daily?
**Headline B:** Your daily pace
**Body A:** Short and steady beats long and rare.
**Body B:** You can change it anytime.
**Options:**
- 👍 5 min a day · Light
- 👌 10 min a day · Steady
- 🤲 15 min a day · Committed
- 💪 20 min a day · Dedicated
**Field:** Single select; CTA "Set my pace" stays disabled until a pace is picked. No "Other" (numeric scale).
**Visual:** Large pills with the label as a small second line; progress bar near the end.
**Microcopy:** "Your pace sets your goal date. You can change it anytime."
**CTA:** Set my pace

---

## C. Trust

### 15. How a lesson works (rating-free trust)
**Purpose:** A trust beat after the highest-effort stretch. There is no verified rating for this app yet, so the default is a plain "what a lesson looks like" screen; the rating variant renders only when real values are set.
**Headline A:** One word at a time
**Headline B:** Hear it, see it, check it
**Body A:** Every lesson follows the same three steps.
**Body B:** Meaning first, then a quick check.
**Visual:** Emerald-and-gold star mark, then three cards: Hear it (the word), See it (Arabic and meaning), Check it (a quick quiz).
**Microcopy:** Rating variant (only when `store_rating`, `rating_count` and `store_name` are all real): Headline A "Rated {{store_rating}} on {{store_name}}", Headline B "Learners give it {{store_rating}} stars", Body A "From {{rating_count}} ratings by people like {{name}}.", Body B "Short lessons that fit around prayer.", plus one verbatim store review if one is set. No invented counts, names or photos.
**CTA:** Continue

---

## D. Anticipation

### 16. Building your path (loading)
**Purpose:** Short, honest anticipation; rows name the user's own answers.
**Headline A:** Building {{name}}'s path…
**No-name Headline A:** Building your path…
**Headline B:** Reading your six answers…
**Steps:**
- Counting the words you know…
- Choosing your first lessons…
- Fitting lessons to {{minutes}} minutes…
- Setting your goal date…
**Visual:** Lantern-at-the-end-of-a-path hero, four rows with % counters and thin gold bars that tick to 100%.
**CTA:** (auto-advances, ~6-8 seconds)

---

## E. Gate

### 17. Email
**Purpose:** Capture identity before the plan is revealed; on web the email doubles as the app sign-in (magic link) so there is no separate password to forget.
**Headline A:** Where should we send it?
**Headline B:** Save your path, {{name}}
**No-name Headline B:** Save your path
**Body A:** Your email signs you in to the app.
**Body B:** You'll sign in with this email later.
**Field:** Apple and Google buttons, then an email field (validated), and an optional unchecked "Send me learning tips and offers" checkbox. Marketing opt-in is never pre-checked.
**Visual:** Blurred plan card behind a white bottom sheet.
**Error state:** "Please enter a valid email address" · "This email already has a path. Check your inbox." (account exists).
**Microcopy:** "Used only for your account. No spam. Terms · Privacy".
**CTA:** Show my path

---

## F. Reveal

### 18. Your path
**Purpose:** The dated plan, computed from the answers: words left (23 distinct words minus the ones the user knows) ÷ words per day (minutes ÷ 2.5) plus letter days if they cannot read yet. The user sees the words they will actually learn first.
**Headline A:** {{name}}'s path to Al-Fatiha
**Headline B:** {{words_left}} words to learn
**Body A:** A goal from your answers, not a promise.
**Body B:** Your minutes and level set the pace.
**Visual:** Soft gold-glow strip, then 2-3 stage cards: (optional) Letters first (3 days if "Letters, slowly", 7 days if "Not yet"), Al-Fatiha word by word ({{study_days}} days), then the goal-specific next stage (Short surahs you pray, Reading practice, Memorize with meaning, Learn side by side with family, or the user's own "Other" text). Chips for goal, pace and goal date. Row of the first eight words still to learn (live Arabic + transliteration) and "+N more".
**Microcopy:** No-name Headline A: "Your path to Al-Fatiha". "Dates are goals from your pace (about 2.5 minutes a word), not promised results." Repeated words are taught once, so the plan counts 23 distinct words while the percentage counts 29 occurrences.
**CTA:** Unlock my path

---

## G. Monetization

### 19. Paywall
**Purpose:** The single ask, as a long-scroll web sales page. The personalised hero shows the user's own number and goal date; every price shows its renewal price beside it.
**Headline A:** {{name}}, understand Al-Fatiha
**Headline B:** Your {{minutes}}-minute path
**Body A:** Every price and renewal shown before you pay.
**Body B:** Built around your goal: {{goal}}.
**Plans:** Three web plans by billing period: 1-week, **4-week (pre-selected)**, 12-week (longest). Every plan shows `{{price_Nw}}` first period and `{{renewal_Nw}}` per period afterwards; the renewal price is always visible beside the intro price. Nothing struck through, no discount codes, no timer. Only structure is specified; prices come from growth.
**Visual:** Sections in order: brand bar with ✕ visible from the first frame; emerald hero card (hero art, your "% known today" meter, "Goal: all 23 words by {{goal_date}}", goal and pace chips); plan block; Apple Pay / PayPal / Card row and "Secure checkout · Cancel online anytime"; What's inside; How it works (pick plan, sign in with your email, open your first word lesson); proof; guarantee; Questions (FAQ); plan block again; renewal line; legal links; sticky bottom bar with "{{price_Nw}} today. Then {{renewal_Nw}} every N weeks until you cancel." and CTA.
**Microcopy:**
- No-name Headline A: "Understand Al-Fatiha, word by word".
- What's inside (only shipped features from the store description): "Bite-sized daily lessons" · "Narrated audio stories" · "Quizzes that check understanding" · "Reflection and journal" · "Memorization practice" · "Streaks and gentle reminders".
- Proof block renders only with real values: rating strip ("★ {{store_rating}} · {{rating_count}} {{store_name}} ratings") and verbatim reviews; hidden while tokens.
- Guarantee block ("{{refund_days}}-day money-back guarantee" + conditions in plain words) hidden while `refund_days` is a token.
- FAQ: "How do I cancel?" (Profile → Settings → Manage subscription, or the link in your receipt) · "Will it renew?" (Yes, at the renewal price shown, until you cancel; we email you before every renewal) · "Do I need to read Arabic?" (No; every lesson comes with transliteration and translation) · "Can this replace a teacher?" (No; for recitation rules or rulings, ask a qualified teacher).
- Line above the legal links: "We'll email you before every renewal."
**Fallback offer:** On ✕, the last-chance offer (#20), once per session (sessionStorage flag `ikf_offer_ayahpath-arabic`); closing the paywall a second time leaves the funnel with no offer and no loop.
**CTA:** Start my path

### 20. Last-chance offer
**Purpose:** A genuinely smaller option for someone who only wanted Al-Fatiha: one surah, paid once, no renewal. It is not a markdown of the paywall plans and is not a duplicate SKU.
**Headline A:** Just want Al-Fatiha?
**Headline B:** Start with one surah
**Body A:** One surah, paid once, nothing to cancel.
**Body B:** Your {{words_left}} Al-Fatiha words, no subscription.
**Plans:** One card: **Al-Fatiha pass**, {{offer_price}} paid once, no renewal (`oneTime: true`, `compareAt: null`, no badge). Includes: all {{words_left}} Al-Fatiha word lessons (the words the user still has to learn); meaning, transliteration and a quick check; paid once, nothing to cancel. **Not included:** other surahs, memorization practice, reflection journal, streaks, your full path.
**Visual:** Same web look as #19: brand bar with ✕, centred eyebrow "One-time offer · shown once", headline and lead, one gold-bordered card with a book thumb, "Al-Fatiha · N words", price row ("one time, no renewal"), three checks, the "Not included" box, CTA, payment badges, fine print "{{offer_price}} one time. It does not renew. Your full path stays available as a subscription." Plain decline link below ("No thanks, back to my plan").
**Microcopy:** Shown once per session; decline (✕ or link) returns to the plan reveal and a second paywall close leaves the funnel. `expiresMin: null`: no timer, ever (brand promise). Events: `paywall_close` (with `offerShown`), `offer_view`, `offer_accept` + `checkout_click` with plan `offer`, `offer_decline`. Never labelled free; no price struck through.
**CTA:** Get the Al-Fatiha pass

---

## H. Payoff

### 21. Get the app
**Purpose:** Hand-off after purchase: install, same email, open word lesson 1. The last cliff in web2app is "paid but cannot log in", so the screen names the exact steps.
**Headline A:** You're in, {{name}}!
**Headline B:** Last step: open the app
**Body A:** Get the app and sign in with {{email}}.
**Body B:** Your first word lesson is waiting.
**Visual:** Dawn hero strip, check badge, three numbered steps (download, tap the sign-in link we emailed, open word lesson 1), App Store / Google Play buttons, a QR placeholder for desktop users.
**Microcopy:** No-name Headline A: "You're in!". "Receipt sent to {{email}}" · "Manage or cancel anytime in Profile → Settings."
**CTA:** Open the app

---

## Notes

**Review before launch (blocking).** Every Arabic string, its tashkīl, the transliterations, the six meanings, the "× in the surah" counts and the 29-word / 23-distinct-word tallies must be checked by a qualified scholar and an Arabic linguist before any traffic. The brief and demo count 29 words with the Bismillah as the first line (Hafs convention). Warsh and Maliki usage (northern Nigeria, West Africa) do not count the Bismillah as part of the surah, so for NG traffic the percentage and the word counts need a Warsh variant or a clearly stated convention. Word-form equivalences used in the count (ٱللَّهِ and لِلَّهِ as "Allāh"; ٱلصِّرَٰطَ and صِرَٰطَ as "the path") also need linguist sign-off. Meanings are short glosses; quote the licensed translation verbatim in the live app. Screens 7-12, 13 and 18 are unverified beyond that review.

**Unverified items:**
- "Minutes ÷ 2.5 = words per day" and the 3-day / 7-day letters stages are assumptions; confirm against the real lesson length and the app's letter course before using any date in ads.
- "Hear it" (audio per word) and "transliteration and translation in every lesson" are assumed from the store description (narrated audio stories, quizzes); confirm the app really ships word-level audio.
- The post-Al-Fatiha stages on screen 18 (short surahs, reading practice, memorization, family) must match the app's real catalog.
- The Al-Fatiha pass is a new product: access length, whether it exists in the store and the billing setup are product decisions, not in the app today.
- The research spine (ewa-ayahpath.md §9) lists Allah, Rabb, Rahman, kitab, salat, yawm as the test words and a "300 words = 70% of the Quran" claim, both tagged [I] (inferred). This brief deliberately tests Al-Fatiha words only (kitab and salat are not in the surah) and drops the 300-word claim. No Kalaam rating is reused.
- "We email you before every renewal" (paywall line and FAQ) is a commitment the billing setup must actually fulfil; confirm before launch.
- No rating, review or guarantee is stated anywhere; they are gated behind `store_rating`, `rating_count`, `store_name`, `refund_days` and hidden while those are tokens.

**Blocks deliberately skipped:** gender/age (analytics only); guilt or closeness-to-God questions (never asked); "now vs after 4 weeks" chart (outcome promise, replaced by the dated word plan labelled as a goal); in-quiz commitment "Yes/No" prompts and pledge screens; spin or scratch rewards; commitment add-ons; a separate lesson micro-demo (the six-word test is the first taste).

**Faith guardrails honoured:** no depictions of Prophets or Companions, no Quran text as decoration behind prices (the surah appears only as learning content), no contested rulings as quiz items, no invented scholar or imam personas, only distractors that are real Al-Fatiha words so every wrong pick teaches, and the paywall says plainly that the app does not replace a teacher.

**Monetization layers:** two, measured separately. (1) The subscription (paywall CVR, trial or intro to full-price renewal retention, refund rate, Day-2 return). (2) The one-time Al-Fatiha pass (offer CVR from `offer_view` to `offer_accept`, and whether pass buyers later convert to the subscription).

**Drop-off risk:** screen 3 for non-readers (the body reassures and screen 6 sets the "not a grade" frame); screens 7-12 (six taps in a row; keep decoys honest and feedback short); screen 17 (email gate); screen 19.

**First A/B tests:** (1) Hook A ("17 times") vs Hook B ("six words") as the ad entry; (2) six words vs four words in the check; (3) percentage on screen 13 vs raw "N of 29 words" as the headline; (4) the Al-Fatiha pass vs a lighter 1-week plan as the last-chance offer.

**Demo:** `demo.html` (21 screens, Copy A/B toggle, jump list, live computation of the percentage and goal date). Pictures are generated placeholders until `gen_images.py` runs with `IKAME_AI_KEY` (the images carry no text; all Arabic is live HTML).

**Demo link:** https://claude.ai/artifact/4FqVdcmZ2KZHyMB33amBRA
