---
niche: ewa
display_name: EWA (AI learn - languages through movies, books and AI tutor)
archetype: learning-plan
subject: person
input: native + target language, goals, self-rated level, struggles, preferred formats, minutes per day, a 2-grid vocabulary check, optional deadline
output: estimated vocabulary size + level, and a paced personal learning plan with a progress projection
screens: 24
monetization: web subscription paywall (1-month / 3-month pre-selected / 12-month), intro price and renewal price shown together, 3-day disclosed trial as dismiss fallback
creative_screens:
  hook-a: 1
  hook-b: 2
  word-check: 13
  first-scene: 15
  reveal: 21
motion: >
  a movie still with subtitles - one word glows when tapped, a translation
  bubble pops up and the word flies into a flashcard deck, then a progress
  curve draws itself from today to week 4 with milestone chips lighting up
---

# Funnel Content — EWA (AI learn)

EWA (Lithium Lab Pte Ltd, Singapore) teaches English plus 40 other languages through adapted books with audio, short clips from movies and TV series, bite-sized courses, spaced-repetition flashcards, word games and an AI tutor. This is a **web-to-app funnel** of 24 screens. The user tells us who they are as a learner, takes a 30-second word check, taps through one real subtitle line, and gets an **estimated vocabulary size + level** and a **paced plan** before a subscription paywall. After buying, they install the app and log in with the same email. The shape is modeled on **EWA's own live web funnel** (`quiz.appewa.com/sweetboarding/...`, captured Sept 2026 via AdSpyLab, 67 screens, 117 ads pointing at it). That funnel is quiz → level test → email → level result → plan timeline → paywall, and this brief keeps that spine but cuts it by two thirds. None of the registered archetypes fits cleanly, so this is filed as a proposed **learning-plan** archetype. It is close to `personalization-quiz`, but a *skill test* replaces the personal-data inputs, a *first-taste micro-lesson* replaces the reading, and there is one revenue layer, not two. **Verified:** store description, content counts (10,000+ books, 10,000+ clips, 40,000+ flashcards), 41 languages, the 4.7★ / 196K App Store rating, the "70 million users" claim on appewa.com and in the funnel, the real funnel screen order and paywall structure, the 14-day money-back guarantee, App Store and web prices (see Notes). **Assumed / verify before launch:** the AI tutor chat (a third-party summary says EWA has one, and a "SpeakLab AI" page runs ads into the same funnel, but neither the store text nor the captured funnel mention it), and the visual look (no brand file supplied). The look here overrides the repo's dark default: light, warm "edutainment" style, cream/white background, one saturated accent, movie-still and book-cover cards, rounded pill options. Learning is daytime, self-improvement use, and the dark nightlife look doesn't fit it. The social-proof numbers are EWA's own. If this brief ships under a different ikame brand, replace every number and quote tagged *(EWA)* with that app's real ones. Tokens: `{{name}}`, `{{lang}}` (target language, pre-filled from the ad URL, default English), `{{goal}}`, `{{level}}`, `{{next_level}}`, `{{words}}`, `{{minutes}}`, `{{email}}`, plus price tokens on the paywall.

---

## A. Hook

### 1. Hook A — Learn from what you love
**Purpose:** Name the promise (learning that feels like entertainment) against the "before" state of boring textbooks, before asking anything.
**Headline A:** Learn {{lang}} with movies and books
**Headline B:** Fluency you'll actually enjoy
**Body A:** Short daily lessons built from scenes you love.
**Body B:** Stories, clips and a friendly tutor instead of textbooks.
**Visual:** Cream background, a fanned stack of 3 movie-still cards with subtitle lines, one word highlighted with a small translation bubble above it; a book-cover fan peeking behind; accent-color pill CTA pinned at the bottom.
**Microcopy:** Trust line under the cards: "★ 4.7 · 196K ratings on the App Store" *(EWA)*
**CTA:** Get started

### 2. Hook B — Social framing
**Purpose:** Cold ad traffic needs borrowed trust; show scale plus the single feature reviewers love most (tap-to-translate).
**Headline A:** 70 million learners chose this
**Headline B:** Join 70M+ learners worldwide
**Body A:** Tap any word, get its meaning instantly.
**Body B:** Books, clips and games at every level.
**Visual:** Big "70M+" number, a world-map dot pattern behind it, two review cards stacked underneath with avatars and a 5-star row.
**Microcopy:** Review card: "If anything is unclear while reading, just tap a word — the translation is right there." — Maria *(EWA; real review quoted in EWA's own funnel)*
**CTA:** Continue

---

## B. Investment — who you are as a learner

### 3. Native language
**Purpose:** Every translation, hint and helper line depends on it, so it has to come first. It also localizes the rest of the funnel.
**Headline A:** What's your native language?
**Headline B:** Which language do you speak?
**Body A:** We'll translate every word into it.
**Body B:** Translations and hints will use this language.
**Options:**
- 🇪🇸 Español
- 🇧🇷 Português
- 🇹🇷 Türkçe
- 🇻🇳 Tiếng Việt
- ✏️ Other (opens search)
**Field:** Single-select. Pre-selected from device/browser locale; full searchable list of 40+ languages behind "Other". Choosing a language switches the funnel UI into it.
**Visual:** Stacked pill options with flag emoji, search icon on the "Other" row, selected pill fills with the accent color.
**CTA:** Continue

### 4. Target language
**Purpose:** Confirms what the plan is built around; usually pre-filled from the ad, so it's one confirming tap.
**Headline A:** Which language do you want?
**Headline B:** What will you learn first?
**Body A:** You can add more languages later.
**Body B:** Pick one to build your plan around.
**Options:**
- 🇬🇧 English
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇩🇪 German
- ✏️ Other (opens search)
**Field:** Single-select, pre-selected from the ad URL (`/en/`, `/en-es/` style paths, as EWA does). The native language from #3 is hidden from this list.
**Visual:** Same pill list; the pre-selected option already filled so the user only confirms.
**CTA:** Continue

### 5. Goals
**Purpose:** The motivation that decides which content comes first, and the `{{goal}}` token the plan and paywall reuse.
**Headline A:** Why learn {{lang}}?
**Headline B:** What will {{lang}} unlock?
**Body A:** Pick all that apply.
**Body B:** Your goals shape which lessons come first.
**Options:**
- 💼 Career & work
- ✈️ Travel
- 🎬 Movies & books
- 💬 Friends & family
- ✏️ Other
**Field:** Multi-select, CTA disabled until ≥1 pick. The first pick becomes `{{goal}}`.
**Visual:** 2x2 grid of large cards with an illustrated icon each, "Other" as a slim full-width row beneath; selected cards get an accent border and a check.
**Microcopy:** Disabled-CTA hint: "Pick at least one to continue"
**CTA:** Continue

### 6. Name
**Purpose:** Gets `{{name}}` so the level result, the plan and the tutor greeting feel personal.
**Headline A:** What should we call you?
**Headline B:** What's your first name?
**Body A:** Your tutor will greet you by name.
**Body B:** We'll put it on your learning plan.
**Field:** Text input, placeholder "First name", max 30 chars, autofocus.
**Visual:** Plain white input on cream, a small friendly tutor avatar with an empty speech bubble that fills with "Hi, …!" as the user types.
**Error state:** "Please enter a name to continue"
**CTA:** Continue

### 7. Self-rated level
**Purpose:** A cheap first guess at level. It routes true beginners past the word check (#13-14) and sets which word grid comes first.
**Headline A:** How's your {{lang}} today?
**Headline B:** {{name}}, where are you starting?
**Body A:** A rough guess is fine — we'll check soon.
**Body B:** Honest answers get you the right first lesson.
**Options:**
- 🌱 Total beginner
- 🙂 I know the basics
- 💬 I can chat a bit
- 🚀 Pretty confident
**Field:** Single-select. "Total beginner" → skip #13-14, go to #15 with an A0 clip.
**Visual:** Four stacked pills with a small 4-step level meter on the right of each, filling further on each row.
**Microcopy:** Inline reaction after a tap on "Total beginner": "Everyone starts somewhere — we'll begin with the basics."
**CTA:** Continue

### 8. Struggles
**Purpose:** Makes the pain specific. The picks drive the bridge screen (#9) and the order of the plan's first week.
**Headline A:** What's hardest for you?
**Headline B:** What holds you back?
**Body A:** Pick all that apply — we'll target each one.
**Body B:** Everyone has one — pick all that fit.
**Options:**
- 🧠 Remembering words
- 🗣️ Speaking out loud
- 👂 Understanding fast speech
- 📖 Grammar rules
- ✏️ Other
**Field:** Multi-select, ≥1 required.
**Visual:** Stacked pills with checkbox circles; selected fills solid.
**CTA:** Continue

### 9. Bridge — how we fix it
**Purpose:** Answers the struggles just picked with the real feature that fixes each, so the quiz feels like it's already working. Also breaks up the quiz before more questions.
**Headline A:** You're not alone, {{name}}
**Headline B:** That's exactly what we fix
**Body A:** Clips, books and games train it from every angle.
**Body B:** Flashcards bring words back right before you forget.
**Visual:** One small card per struggle picked (max 3), each showing the feature in action: flashcard flipping (words) · AI tutor chat bubble with a mic (speaking) · movie clip with slowed subtitle (listening) · bite-size lesson card (grammar).
**Microcopy:** Card captions, shown only for the picked struggles: "🧠 Flashcards that return before you forget" / "🗣️ Practice speaking with your AI tutor" / "👂 Real speech from movies, at your pace" / "📖 Grammar in 10-minute bites". Progress hint: "Step 1 of 3"
**CTA:** Continue

### 10. Favorite formats
**Purpose:** EWA's real differentiator is choice of format; the picks fill the plan's library and make the paywall list feel chosen, not generic.
**Headline A:** How do you like learning?
**Headline B:** Pick your favorite ways to learn
**Body A:** We'll fill your plan with these.
**Body B:** Mix and match — change anytime.
**Options:**
- 🎬 Movie & series clips
- 📚 Books & audiobooks
- 🤖 Chat with AI tutor
- 🎮 Word games
- ✏️ Other
**Field:** Multi-select, ≥1 required.
**Visual:** 2x2 cards, each with a real thumbnail (movie still, book cover, chat bubble, game tile) instead of an icon.
**Microcopy:** Remove the AI tutor option if the feature doesn't ship in the app version the funnel sells.
**CTA:** Continue

### 11. Minutes per day
**Purpose:** The pacing input: the plan's timeline in #21 is computed from it. It's also a small commitment.
**Headline A:** How much time per day?
**Headline B:** Your daily learning time?
**Body A:** Small daily habits beat long weekend sessions.
**Body B:** Be realistic — you can change it anytime.
**Options:**
- ☕ 5 min · Casual
- 🚶 10 min · Steady
- 🏃 15 min · Serious
- 🔥 20+ min · Intense
**Field:** Single-select, "10 min" highlighted as the suggested default (EWA lessons run 10-20 minutes). Sets `{{minutes}}`.
**Visual:** Four stacked pills, a small clock icon on each that fills to match the minutes.
**Microcopy:** Progress hint: "Step 2 of 3"
**CTA:** Continue

---

## C. Trust

### 12. Social proof
**Purpose:** Trust beat right after the heaviest profiling stretch and right before the word check, the highest-effort screen.
**Headline A:** Rated 4.7 by 196K learners
**Headline B:** Learners love tapping to translate
**Body A:** Real reviews from the App Store.
**Body B:** The feature reviewers mention most, in every language.
**Visual:** Huge "4.7" with a star row, App Store + Google Play badges under it, one quote card with an avatar.
**Microcopy:** Quote card: "The coolest function is that you can immediately tap and translate words." — Anutel *(EWA; real review quoted in EWA's funnel)*. Numbers are EWA-only; replace them for any other brand.
**CTA:** Continue

---

## B. Investment — level check and first taste

### 13. Word check — easy grid
**Purpose:** The skill test is what makes the level result feel measured, not flattered. It also turns the funnel into a small product demo.
**Headline A:** Tap the words you know
**Headline B:** Quick check: which do you know?
**Body A:** Takes 30 seconds and sets your starting level.
**Body B:** No wrong answers — only tap words you're sure of.
**Field:** Multi-select chip grid, 16 words from the A1-A2 band of `{{lang}}`, 2 of them made-up words (not flagged) to correct over-claiming. "None of these" link below. ≥8 real words known → #14; else → #15.
**Visual:** 4x4 grid of rounded word chips on cream, tapped chips fill with the accent and a tiny check; a thin 2-segment progress bar at the top ("Level check 1 of 2").
**Skip link:** "I'm a total beginner" (goes to #15)
**CTA:** Next

### 14. Word check — harder grid (adaptive)
**Purpose:** Only shown to users who aced the easy grid, so it rewards them rather than punishing beginners. It sharpens the estimate at B1-B2.
**Headline A:** Nice! A few harder ones
**Headline B:** You know a lot, {{name}}
**Body A:** Same thing: tap only words you're sure of.
**Body B:** This finds your level more precisely.
**Field:** Same chip grid, 16 words from the B1-B2 band, 2 made-up words. (An optional third C1-C2 grid can follow for ≥10 known, as EWA does. Off by default to protect completion.)
**Visual:** Same layout, progress bar on segment 2.
**CTA:** Next

### 15. First scene — tap to translate
**Purpose:** First taste of the real loop (clip → tap a word → translation → saved to flashcards). The user experiences the product before being asked for email or money.
**Headline A:** Try it: tap any word
**Headline B:** Your first scene, {{name}}
**Body A:** Tap any word in this real line from a show.
**Body B:** Tap an unknown word and we'll save it.
**Field:** One 3-5 second clip (or still + audio) with a one-line subtitle, picked by level (#7/#13-14) and `{{goal}}`. Tapping a word shows the translation in the native language with a play-audio button; the word then flies into a "My words" deck. CTA enables after 1 tap.
**Visual:** Movie still filling the top 60% with a subtitle bar, tapped word glowing, translation bubble above it; a small flashcard-deck icon bottom-right that bumps "+1" when the word lands.
**Microcopy:** Toast after the tap: "Saved to My words · review tomorrow". Legal: the clip must be one the app already licenses for marketing use.
**Skip link:** "Skip"
**CTA:** Continue

### 16. Deadline (optional)
**Purpose:** A real event gives the plan a finish line and the reveal chart a flag. Skippable, because most learners don't have one.
**Headline A:** Anything coming up?
**Headline B:** Got a deadline in mind?
**Body A:** We'll pace your plan to be ready.
**Body B:** A trip, interview or exam sharpens the plan.
**Options:**
- ✈️ A trip
- 💼 Job interview
- 🎓 An exam
- 🏠 Moving abroad
- ✏️ Other
**Field:** Single-select; after a pick, an optional month picker "When?" slides in.
**Visual:** Stacked pills; the month picker appears as a horizontal chip row of the next 12 months.
**Skip link:** "No deadline, just learning"
**CTA:** Continue

### 17. Practice time
**Purpose:** Anchors the daily habit (the real retention product) to a time of day. On web it stores the time; the app asks for push permission on first open.
**Headline A:** When will you practice?
**Headline B:** Pick your daily lesson time
**Body A:** One gentle reminder a day, nothing more.
**Body B:** Same time daily builds the habit fastest.
**Options:**
- 🌅 Morning commute
- ☕ Lunch break
- 🌙 Evening
- ⏰ Pick exact time
**Field:** Single-select, default "Evening"; "Pick exact time" opens a time wheel.
**Visual:** Pills on cream, a phone lock-screen mockup below showing the sample reminder at the chosen time.
**Microcopy:** Sample reminder: "🎬 {{name}}, today's 10-minute scene is ready." Progress hint: "Step 3 of 3 — almost done"
**Skip link:** "I'll decide later"
**CTA:** Set reminder

---

## D. Anticipation

### 18. Building the plan (loading)
**Purpose:** Makes the plan feel crafted from the answers just given; the highest-attention moment before the gate.
**Headline A:** Building {{name}}'s {{lang}} plan…
**Headline B:** Picking scenes for {{name}}…
**Steps:** (4 progress rows, each with % counter, checkmark and bar)
- Matching lessons to your level…
- Choosing clips and books you'll love…
- Pacing it to {{minutes}} minutes daily…
- Almost ready — your plan is waiting…
**Visual:** Top half: the saved word from #15 as a flashcard, with book covers and clip stills orbiting it slowly; four progress rows beneath; one review card rotating under the rows.
**Microcopy:** One optional overlay at ~50%: "Want a free 7-day streak challenge?" → "Yes, I'm in" / "No thanks". It's a free feature. The answer is stored, and neither button adds anything paid. Rotating quotes: reuse the real reviews from #2 and #12 only.
**CTA:** (auto-advances, ~6-8 seconds)

---

## E. Gate

### 19. Email
**Purpose:** Captures identity before the result. On web it's also the login that links the purchase to the app, so it is functional, not just a lead grab.
**Headline A:** Your plan is ready, {{name}}
**Headline B:** Where should we send it?
**Body A:** Enter your email to see it and log in.
**Body B:** You'll log into the app with this email.
**Field:** Email input; "Continue with Apple" / "Continue with Google" above it. Marketing-email checkbox **unchecked** by default.
**Visual:** Plain white input on cream, a blurred preview of the plan card behind a soft frosted panel.
**Error states:** "Enter a valid email address" / "This email already has a plan — log in instead?"
**Microcopy:** Under the field: "No spam. We only send your plan and account emails." Legal line under CTA: "By continuing, you agree to our Terms & Privacy Policy."
**CTA:** See my plan

---

## D. Anticipation — reveal

### 20. Level result
**Purpose:** The measured payoff of the word check: a vocabulary estimate and a level name, framed as a starting point, not a grade.
**Headline A:** You know about {{words}} words
**Headline B:** Your level: {{level}}
**Body A:** Next up: {{next_level}} — everyday conversations.
**Body B:** Most learners at your level move up within weeks.
**Visual:** Horizontal scale 100 · 1,000 · 2,500 · 5,000 · 10,000 words with level bands (Newbie → Advanced) and a marker animating to `{{words}}`; `{{next_level}}` band softly highlighted.
**Microcopy:** Footnote: "Estimate from your word check. It updates as you learn." (Rubric in Notes.)
**CTA:** See my plan

### 21. Plan and progress projection
**Purpose:** The reveal: a plan visibly built from their answers, with an honest, computed timeline to the next level. This is what the paywall sells.
**Headline A:** {{name}}'s path to {{next_level}}
**Headline B:** Your first 4 weeks, planned
**Body A:** At {{minutes}} min a day, here's your likely progress.
**Body B:** Built around {{goal}} and the formats you picked.
**Visual:** Smooth rising curve from "Today" to "Week 4" with milestone chips on it; if a deadline was set in #16, a small flag at that month. Below it, a summary card: level → next level · goal · formats · minutes/day.
**Microcopy:** Milestones (beginner copy; swap per level): "Day 7 · Introduce yourself" / "Day 14 · Everyday phrases" / "Day 28 · Read an adapted book" / "Month 3 · Hold simple chats". Footnote: "Estimate for learners who practice daily. Results vary." The week count comes from level + minutes, never a fixed "4 weeks for everyone".
**CTA:** Start my plan

---

## F. Monetization

### 22. Paywall
**Purpose:** The single ask: unlock the plan just built. The renewal terms are as visible as the price.
**Headline A:** Start your {{lang}} plan today
**Headline B:** Unlock {{name}}'s full plan
**Body A:** Full library, AI tutor and every lesson level.
**Body B:** Cancel anytime, with a 14-day money-back guarantee.
**Plans:**
- **1 month** — `{{price_1m}}` today, then `{{renew_1m}}`/month. Shows per-day price small. No badge.
- **3 months** — **pre-selected**, "MOST POPULAR" badge. `{{price_3m}}` today, then `{{renew_3m}}` every 3 months. Per-day price small.
- **12 months** — "LOWEST PER DAY" badge. `{{price_12m}}` today, then `{{renew_12m}}`/year. Per-day price small.
- On every card the renewal line sits directly under the price, in the same size, not in footer grey. Savings badges compare against the regular monthly price × months, never against an invented "was" price.
**Visual:** Top: compact summary card from #21 (level → next level, goal, minutes). Then 3 stacked plan cards, 3-month highlighted; big CTA; trust row; benefit rows; 2 real reviews; FAQ accordion with "How do I cancel?" open by default.
**Microcopy:** Benefit rows: "🎬 10,000+ movie & series clips" / "📚 10,000+ books with audio" / "🧠 40,000+ spaced-repetition flashcards" / "🤖 AI tutor for speaking practice" (verify) / "🎮 Word games and daily streaks". Trust row: "🔒 Secure payment · Cancel anytime · 14-day money-back". Disclosure directly above the CTA, updated live for the selected plan: "You pay {{price_sel}} today. Renews at {{renew_sel}} every {{period}} until you cancel. Cancel anytime, up to 24h before renewal." Under the CTA: "We'll email you before your first renewal."
**Fallback offer:** On dismiss, the last-chance offer (#23) once per session: a disclosed 3-day free trial on the 3-month plan, then {{renew_3m}} every 3 months. No timer, no second discount.
**CTA:** Start learning

### 23. Last-chance offer (on paywall close)
**Purpose:** Second chance for users who close the paywall without paying: a disclosed 3-day free trial on the 3-month plan, then its regular renewal. No second discount. Shown once per session, then never again.
**Headline A:** Try {{name}}'s plan free first
**Headline B:** Reach {{next_level}}, free for 3 days
**Body A:** Your path to {{next_level}} in {{lang}} is ready. Start with 3 days free.
**Body B:** Keep your saved words and your plan. Cancel anytime.
**Plans:** One offer card: **3-month plan, 3 days free first**, "Full library, AI tutor and every lesson level". {{offer_price}} today for 3 days, with the 3-month plan's real price ({{price_3m}}, `compareAt: '3m'`) struck, then {{renew_3m}} every 3 months until cancelled. Optional {{offer_badge}} only if true.
**Visual:** Same web-page look as #22: sticky bar with the app name and a close ✕, centered eyebrow "One-time offer · shown once", headline and lead, then one orange-bordered offer card holding the dark level summary card ({{level}} → {{next_level}}, goal and minutes chips), the plan name, the price row (struck {{price_3m}} → {{offer_price}} "today"), 3 checks ("Movie and series clips with tap-to-translate", "Books with audio and spaced-repetition flashcards", "A reminder a day before your trial ends"), the CTA, Apple Pay / G Pay / VISA / Mastercard badges and the renewal line. Plain decline link below the card.
**Microcopy:** Renewal line: "{{offer_price}} today for 3 days, then {{renew_3m}} every 3 months until you cancel. We'll remind you a day before. Cancel anytime, up to 24h before renewal." Shown once per session (sessionStorage `ikf_offer_ewa`): a second paywall close goes straight to leaving the funnel. No timer: `CONFIG.offer.expiresMin` is `null`. If the growth team sets a real deadline, a countdown shows and the offer is withdrawn when it ends (`offer_expired`), never reset on reload. Decline (link and ✕): "No thanks, back to my plan", which returns to #21 Plan and progress projection. Accept opens the offer checkout (plan `offer`) and then #24. Events: `paywall_close` (with `offerShown`), `offer_view`, `offer_accept` + `checkout_click` with plan `offer`, `offer_decline`, `offer_expired`.
**CTA:** Claim my offer

---

## G. Payoff

### 24. Get the app
**Purpose:** Web buyers who never open the app refund. This screen gets them to install, log in with the same email and finish day 1.
**Headline A:** You're in, {{name}}!
**Headline B:** Your first scene awaits
**Body A:** Get the app and log in with {{email}}.
**Body B:** Your plan and saved words are already there.
**Visual:** Phone mockup opened on Day 1 of the plan with the word saved in #15 visible in "My words"; App Store / Google Play buttons (auto-detect OS, show one); a 3-step list below.
**Microcopy:** Steps: "1 · Install the app" / "2 · Log in with {{email}}" / "3 · Start Day 1 at your {{practice_time}}". Receipt line: "Receipt and cancel link sent to {{email}}."
**CTA:** Get the app

---

## Notes

**Teardown: EWA's real web funnel** (AdSpyLab captures of `quiz.appewa.com/sweetboarding/en/...`, Sept 2026, variants `termsintroc`, `termsintrob`, `kickstart`; a Spanish-for-English variant runs 134 screens). The order is: mascot intro "Hey! My name is Ewa" → native language → target language → "70 mill. users" → reviews → gender → age → self-rated level → why (multi) → "20 234 140 users achieved the same goal" → aim → method interstitial ("Edutainment") → struggles (multi) → last time learning → app usage → what to improve → listening self-assessment → reading self-assessment → lives in language environment? → word-learning frequency → **five "Is this statement true for you?" screens, each followed by a feature teaser** → preferred learning type → "Special program" counts → procrastination/motivation → **word check (A1-A2, B1-B2, C1-C2 grids)** → loader with yes/no "helpful tip" overlays (streak challenge, adapted books) → **email** → **word-test result ("550 words · Beginner", scale 100-10,000)** → name → "your program is ready — improve your level in 4 weeks" chart → "methodology developed by experts" (CELTA / TESOL / TOEFL logos) → "what you can expect" 7d / 14d / 28d / 3mo → **paywall**. Nearly every answer also shows an echo screen with a reaction bubble ("Don't worry, everyone starts somewhere!"). This brief keeps the spine (languages → goals → level → struggles → word check → loader → email → result → timeline → paywall) and folds the reaction bubbles inline (#7). It cuts gender, age, app history and language environment (the output doesn't use them), the five statement screens and their teasers (one bridge, #9, does that job), and the certification-logo screen (logos imply accreditation the app may not hold). It adds the first-scene taste (#15), which EWA's funnel doesn't have. EWA's funnel only *describes* the clips. Letting the user tap one is the strongest proof of the product.

**Pricing reference (real, for the plan structure only).** App Store US: 1-month $11.99 / $15.99, 6-month $34.99, 1-year $49.99 / $99.99. EWA web paywall (EUR, `termsintroc`): 1 month €18 (then €36), 3 months €39 pre-selected "BEST OFFER" (then €78 every 3 months), 12 months €89.90 (then €179.80). It's labelled "Save 50%" with a promo code "ewa_promo50_autumnsale" and a 10:00 countdown. The `termsintrob` variant is the same shape at -40% (€39 then €59 every 3 months). A third-party review also reports "first 3 days free" on EWA's web pricing page. ikame sets its own prices; the brief uses price tokens.

**Hidden-billing reference — documented, not implemented.** EWA's web paywall uses an **intro price that renews at roughly double** (e.g. €39 → €78). In the `termsintroc` capture that renewal is disclosed in a sentence under the CTA. In the `kickstart` capture the same plans show only "The subscription can be canceled at any time in your profile", with **no renewal price visible**. Complaint sites (Trustpilot for appewa.com, sikayetvar, ComplaintsBoard) repeat the same pattern: charged before the trial ended, renewed without notice, couldn't find how to cancel. ikame's paywall therefore: (1) prints the renewal price on every plan card at the same size as the intro price; (2) repeats the exact charge-today / renews-at sentence above the CTA for the selected plan; (3) has no pre-checked add-ons and no timer; (4) emails a reminder before the first renewal and before a trial converts; (5) keeps "How do I cancel?" open in the FAQ. **Countdown:** EWA's 10-minute promo timer is not copied. Use one only for a real, dated seasonal promo that actually ends, never one that resets per visit.

**Word-check rubric (score must come from the taps).** Each grid is 16 words: 14 real and 2 made-up. Known real words per grid are weighted by band: A1-A2 × 70, B1-B2 × 200, C1-C2 × 400, floor 100. Each made-up word tapped subtracts 15% from the total. Level bands: <500 Newbie (A0) · 500-1,500 Beginner (A1) · 1,500-3,000 Elementary (A2) · 3,000-5,000 Intermediate (B1) · 5,000+ Upper-intermediate and above. The content team should calibrate the weights per language. What must never happen is a fixed "550 words" for everyone. The timeline in #21 is computed from level + `{{minutes}}` (e.g. Beginner at 10 min ≈ 4 weeks to the next milestone, at 5 min ≈ 7 weeks), and it says "estimate".

**Blocks deliberately skipped:** gamified wheel (cheapens a self-improvement promise; the word check + first scene already act as the "earned" moment), before/after split (the #21 projection chart does that job with real inputs), post-purchase upsell (no discrete add-on worth selling yet; a Lifetime or Kids add-on could go after #22 later), secondary revenue (one layer only), gender/age questions (unused by the output; add an age question only if the app needs a kids route to its separate EWA Kids app).

**In-app version (post-install onboarding):** same order, but #19 becomes a soft Apple/Google sign-in with "continue as guest", #17 triggers the real push-permission prompt, and #24 is replaced by dropping straight into Day 1 with the saved word.

**Drop-off risk:** #13-14 (word check) and #19 (email before result). #15 carries the most weight: if the clip loads slowly on mobile web, it loses users. Preload it during #11-12 and fall back to a still + audio.

**Monetization and metrics:** one subscription layer. Measure separately: paywall conversion (#22), fallback-trial take rate, trial → paid, **first-renewal retention at full price** (the honest-renewal test; refund and chargeback rate is the guardrail), and **activation** (#24 install + login within 24h).

**Last-chance offer:** measure offer CVR (#23 `offer_view` → `offer_accept`) separately from paywall CVR (#22).

**First A/B tests:** (1) email gate before the level result (this brief) vs. after the result, just before the plan. (2) The #15 first scene at position 15 vs. right after #4, as an early hook. (3) Word check on vs. off, to see how completion trades against paywall conversion.
