---
niche: ewa-movies
display_name: EWA Movies (Learn English through movies and series)
archetype: learning-plan
subject: person
input: favorite series, native language, level, subtitle habit, what loses them in scenes, 2 tapped clip words, a 16-word vocabulary check, minutes per day
output: measured English level plus the first 20 words and idioms taken from their series, and a paced plan
screens: 21
monetization: web subscription paywall (1-week intro / 4-week pre-selected / 12-week anchor), intro and renewal price shown together, one-time last-chance offer on paywall close, no permanent sale ribbon
creative_screens:
  hook-a: 1
  hook-b: 2
  clip-word: 11
  idiom-card: 12
  reveal: 17
motion: >
  a sitcom-style scene with a subtitle line, one word glows when tapped, a
  translation bubble pops and the word flies into a flashcard deck, then twenty
  word cards fan out one by one under the series name
---

# Funnel Content — EWA Movies (Learn English from series)

EWA (Lithium Lab) already runs a web funnel for its "Language with Movies & Series" Meta page: it lands on the generic `quiz.appewa.com/sweetboarding` quiz, 82 screens, 117 ads, captured 2026-09-27 (AdSpyLab). Only one screen is movie-specific ("Learn spoken English with characters from your favorite movies and TV shows"), and the funnel never lets you try it. This brief keeps EWA's spine and swaps the generic quiz for a **series-first, web-to-app funnel of 21 screens**. The ad passes the series name as `{{show}}` (for example `?show=Friends`; the default when no parameter is given is "Friends"). The user picks their series, tells us how they watch today, then **does the product twice inside the funnel**: tap an unknown word in a scene, tap a slang phrase in a second scene, and each lands in a flashcard deck. A 16-word check measures the level. The result is a **level plus the first 20 words and idioms from their series**, then a plan, a web paywall and a one-time offer.

Archetype: **learning-plan**, registered variant of `learning/ewa` (24). Deliberate differences from EWA's own funnel: 21 screens instead of 82; the series drives every screen; two tappable clip demos replace "we teach with movies" statements; no permanent "SUMMER SALE -90%" ribbon, no 20,234,140-style counters, no countdown reset; paywall and offer are disclosed (intro and renewal price side by side). Series names appear as **text only**: no posters, logos or stills from a real show. All scenes in the funnel are original illustrated scenes written in the same genre, so no screen claims to be a clip from the chosen show.

---

## A. Hooks

### 1. Hook A — Your series
**Purpose:** Match the ad: the promise is learning from the show they already binge, before asking anything.
**Headline A:** Learn English from {{show}}
**Headline B:** Your favorite show is a teacher
**Body A:** Tap any line. Keep every new word.
**Body B:** Real scenes, word cards and a plan built around you.
**Visual:** Cream background, a fanned stack of three illustrated sitcom-style scene cards (original art, no real show), one subtitle line on the front card with a single word highlighted and a small translation bubble above it; the series name set as plain text on a pill under the cards; orange pill CTA.
**Microcopy:** Trust line: "★ {{app_rating}} · {{rating_count}} ratings on the App Store" *(EWA reference: 4.7 · 196K, captured Sept 2026)*. Small line: "Not affiliated with any show or studio."
**CTA:** Get started

### 2. Hook B — Social framing
**Purpose:** Cold ad traffic needs borrowed trust and the one feature reviewers love: tap-to-translate.
**Headline A:** Watch. Tap. Remember.
**Headline B:** Subtitles that teach you
**Body A:** Tap any word in a scene, save it in one tap.
**Body B:** Words come back right before you forget them.
**Visual:** Large app rating number, three-step strip "watch → tap → card" with tiny illustrated icons, one review card underneath.
**Microcopy:** Review card is a dashed placeholder: "Real App Store review goes here" *(EWA reference quote: "If anything is unclear while reading, just tap a word", Maria)*.
**CTA:** Continue

---

## B. Investment — your series and how you watch

### 3. Favorite series
**Purpose:** The series is the personalization key: it sets the genre of the demo scenes, the word band and the `{{show}}` token on every later screen.
**Headline A:** Which show do you love?
**Headline B:** Pick your comfort series
**Body A:** We'll teach you from scenes like these.
**Body B:** Your words will come from this world.
**Options:**
- 🛋️ Friends
- 🏢 The Office
- 👨‍👩‍👧 Modern Family
- 🔦 Stranger Things
- 🧪 Breaking Bad
- 🐉 Game of Thrones
- ✏️ Other
**Field:** Single-select grid of text cards (title typed in plain text, an emoji instead of a poster). Pre-selected from the ad param `?show=`. "Other" opens a one-line input; with the field empty the CTA is disabled. Sitcom titles map to the everyday-talk word pool, thriller and fantasy titles to the suspense pool, "Other" to everyday talk.
**Visual:** 2-column grid of cards, each with a gradient tile, an emoji and the title as text; selected card gets an accent border and a check. Never a poster or logo.
**Microcopy:** Disabled-CTA hint: "Pick a show to continue"
**CTA:** Continue

### 4. Native language
**Purpose:** Every translation bubble and card uses it, so it comes before the first clip.
**Headline A:** What's your native language?
**Headline B:** Which language do you speak?
**Body A:** Every word gets translated into it.
**Body B:** Bubbles and cards will use this language.
**Options:**
- 🇪🇸 Español
- 🇧🇷 Português
- 🇹🇷 Türkçe
- 🇻🇳 Tiếng Việt
- ✏️ Other (opens search)
**Field:** Single-select, pre-selected from device locale; searchable list behind "Other".
**Visual:** Stacked pills with flag drawings, search icon on the Other row, selected pill fills with the accent.
**CTA:** Continue

### 5. Level
**Purpose:** A cheap first guess; true beginners skip the vocabulary check and get an A0 scene.
**Headline A:** How's your English today?
**Headline B:** {{name}}, where do you start?
**Body A:** A rough guess is fine. We'll check soon.
**Body B:** Honest answers get you the right first scene.
**Options:**
- 🌱 Total beginner
- 🙂 I know the basics
- 💬 I can chat a bit
- 🚀 Pretty confident
**Field:** Single-select. "Total beginner" skips #13 and starts the clips at A0.
**Visual:** Four stacked pills with a four-step level meter on each.
**Microcopy:** After "Total beginner": "Everyone starts somewhere. We'll begin with the basics."
**CTA:** Continue

### 6. How you watch
**Purpose:** Subtitle habit decides the demo (subtitles on or off in the first clip) and the plan's first week; it is also the honest question: most learners rely on their own language.
**Headline A:** How do you watch it now?
**Headline B:** Which subtitles do you use?
**Body A:** This sets how your clips will look.
**Body B:** We'll tune the first scene to it.
**Options:**
- 🙈 No subtitles
- 🇬🇧 English subtitles
- 🌍 My language
- ⏸️ Pause and look up
- ✏️ Other
**Field:** Single-select. "Other" opens a one-line input, CTA disabled while it is empty.
**Visual:** Four pills, each with a tiny subtitle-bar glyph that shows the setting (none, one line, two lines, pause icon).
**CTA:** Continue

### 7. What loses you
**Purpose:** Makes the pain specific; the picks drive the bridge and the first week of the plan.
**Headline A:** What loses you in scenes?
**Headline B:** Where do you get stuck?
**Body A:** Pick all that apply. We'll train each.
**Body B:** Everyone has one. Pick all that fit.
**Options:**
- 🏃 Fast speech
- 🗨️ Slang and idioms
- 🌎 Accents
- 🧠 Remembering words
- ✏️ Other
**Field:** Multi-select, at least one required; "Other" opens a one-line input and blocks the CTA while empty.
**Visual:** Stacked pills with checkbox circles.
**Microcopy:** Disabled-CTA hint: "Pick at least one to continue"
**CTA:** Continue

### 8. Bridge — how scenes fix it
**Purpose:** Answers each pick with the real feature and breaks up the quiz before the demos.
**Headline A:** Scenes teach what books can't
**Headline B:** That's exactly what we fix
**Body A:** Real speech, saved word by word.
**Body B:** Each clip trains the thing you picked.
**Visual:** One card per pick (max 3): slowed subtitle clip for fast speech; idiom card flipping for slang; a "same word, three voices" strip for accents; flashcard with a return date for remembering.
**Microcopy:** Captions: "🏃 Slow it to 0.75x, keep the real voice" / "🗨️ Slang explained the moment it appears" / "🌎 One word, heard in three accents" / "🧠 Cards return right before you forget". Progress hint: "Step 1 of 3"
**CTA:** Continue

### 9. Name
**Purpose:** Gets `{{name}}` for the result, plan and offer.
**Headline A:** What should we call you?
**Headline B:** What's your first name?
**Body A:** Your tutor will greet you by name.
**Body B:** It goes on your learning plan.
**Field:** Text input, placeholder "First name", max 30 chars. Empty falls back to the neutral stand-in "friend" (and "your" for possessives) in copy.
**Visual:** White input on cream, a small fox tutor with a speech bubble that fills with "Hi, …!" as they type.
**Error state:** "Please enter a name to continue"
**CTA:** Continue

---

## C. Trust

### 10. Social proof
**Purpose:** Trust beat before the first demo, the highest-effort stretch so far.
**Headline A:** Rated by {{rating_count}} learners
**Headline B:** Learners love tapping to translate
**Body A:** Real reviews from the App Store.
**Body B:** The feature reviewers mention most.
**Visual:** Huge rating number with star row, App Store and Google Play badges, one dashed review placeholder.
**Microcopy:** Numbers are tokens (`{{app_rating}}`, `{{rating_count}}`). EWA reference: 4.7 · 196K, review "The coolest function is that you can immediately tap and translate words." (Anutel). Do not reuse these numbers for any other brand.
**CTA:** Continue

---

## D. Investment — the first scenes

### 11. Scene 1 — tap a word
**Purpose:** First taste of the loop (scene, tap, translation, saved card) before email or money. Differs from EWA, which only describes it.
**Headline A:** Tap a word you don't know
**Headline B:** Your first scene, {{name}}
**Body A:** One tap shows it and saves it.
**Body B:** The word flies into your deck.
**Field:** One original illustrated scene with a one-line subtitle (genre from #3, level from #5/#6; subtitles shown or hidden per #6). Tapping a word shows the translation in the native language with an audio button; the word flies into a "My words" deck with a "+1" bump. CTA enables after one tap.
**Visual:** Scene fills the top 60% with a subtitle bar, tapped word glowing, translation bubble above it, deck icon top-right; a caption "Original scene, same genre as {{show}}".
**Microcopy:** Toast: "Saved to My words · review tomorrow". Skip link below.
**Skip link:** "Skip"
**CTA:** Continue

### 12. Scene 2 — slang card
**Purpose:** Teaches the part subtitles hide: an idiom. Tapping the phrase turns it into a card with meaning and a second use.
**Headline A:** Now a phrase you'll hear
**Headline B:** Slang, explained
**Body A:** Tap the highlighted phrase.
**Body B:** See what it really means.
**Field:** Second original scene with a subtitle containing one idiom chip ("hang out" for sitcoms, "lay low" for suspense). Tapping it opens a card: meaning, one more example, audio, "Save". Deck counter goes to 2. CTA enables after the tap.
**Visual:** Same layout as #11; the idiom chip pulses once; the card slides up from the bottom.
**Microcopy:** Toast: "2 words saved"
**Skip link:** "Skip"
**CTA:** Continue

### 13. Word check
**Purpose:** The measured part of the level result; also checks over-claiming with two made-up words.
**Headline A:** Tap the words you know
**Headline B:** Quick check: which do you know?
**Body A:** Takes 30 seconds and sets your level.
**Body B:** Only tap words you're sure of.
**Field:** Multi-select chip grid, 16 words from the series' word pool (5 A2, 5 B1, 4 B2, plus 2 made-up words, not flagged). "None of these" link. Beginners from #5 skip this screen.
**Visual:** 4x4 grid of rounded chips; tapped chips fill with the accent and a tiny check.
**Skip link:** "I'm a total beginner"
**CTA:** Next

### 14. Minutes per day
**Purpose:** The pacing input; the plan length in #18 is computed from it.
**Headline A:** How much time per day?
**Headline B:** Your daily watching time?
**Body A:** One scene a day beats a weekend binge.
**Body B:** Be realistic. You can change it anytime.
**Options:**
- ☕ 5 min · Casual
- 🚶 10 min · Steady
- 🏃 15 min · Serious
- 🔥 20+ min · Intense
**Field:** Single-select, 10 min suggested.
**Visual:** Four pills with a clock icon that fills to match the minutes.
**Microcopy:** Progress hint: "Step 3 of 3"
**CTA:** Continue

---

## E. Anticipation

### 15. Building the plan (loading)
**Purpose:** Makes the plan feel built from the answers, in the highest-attention moment before the gate.
**Headline A:** Building {{name}}'s {{show}} plan…
**Headline B:** Picking scenes for {{name}}…
**Steps:** (4 progress rows, each with % counter, checkmark and bar)
- Counting words in {{show}}-style scenes…
- Matching them to your level…
- Pacing it to your minutes daily…
- Almost ready, your plan is waiting…
**Visual:** The first saved word as a flashcard with illustrated scene stills orbiting it; four progress rows; a dashed review placeholder under them.
**Microcopy:** One optional free overlay at about 50%: "Want a free 7-day streak challenge?" with "Yes, I'm in" / "No thanks"; neither button adds anything paid.
**CTA:** (auto-advances, ~6-8 seconds)

---

## F. Gate

### 16. Email
**Purpose:** Captures identity before the result; on web it is also the app login that links the purchase.
**Headline A:** Your plan is ready, {{name}}
**Headline B:** Where should we send it?
**Body A:** Enter your email to see it and log in.
**Body B:** You'll log into the app with this email.
**Field:** Email input with "Continue with Apple" and "Continue with Google" above it. Marketing checkbox unchecked by default.
**Visual:** White input on cream, a frosted preview of the plan card behind a soft panel.
**Error states:** "Enter a valid email address" / "This email already has a plan. Log in instead?"
**Microcopy:** "No spam. We only send your plan and account emails." Legal under CTA: "By continuing, you agree to our Terms and Privacy Policy."
**CTA:** See my plan

---

## G. Reveal

### 17. Level and your first 20 words
**Purpose:** The result: a measured level and the first 20 words and idioms taken from their series. Meanings stay locked past the first six, so the full set is what the plan sells.
**Headline A:** You know about {{words}} words
**Headline B:** Your level: {{level}}
**Body A:** Here are your first 20 words from {{show}}.
**Body B:** Next up: {{next_level}}, one scene at a time.
**Visual:** Top: a level strip with a marker moving to the estimate. Below: 20 word cards in a two-column wall, the first six open with a short meaning, the other fourteen showing the word with the meaning blurred and a small lock; the two words saved in #11-12 carry a "Saved" tag.
**Microcopy:** Footnote: "Estimate from your word check. It updates as you learn." Word list note (unverified): "Words picked from the series' genre; the content team replaces them with a licensed subtitle frequency list."
**CTA:** See my plan

### 18. Plan and projection
**Purpose:** A plan visibly built from their answers, with an honest computed timeline to the next level.
**Headline A:** {{name}}'s path to {{next_level}}
**Headline B:** Your first weeks, planned
**Body A:** At your pace, here's your likely progress.
**Body B:** Built around {{show}} and how you watch.
**Visual:** Rising curve from "Today" to "Week N" with milestone chips (Day 7 · first scene without subtitles, Day 14 · understand a joke, Day 28 · follow a full scene); summary card: level to next level, series, subtitles, minutes per day.
**Microcopy:** Footnote: "Estimate for learners who practice daily. Results vary." Week count comes from level and minutes, never a fixed number.
**CTA:** Start my plan

---

## H. Monetization

### 19. Paywall
**Purpose:** The single ask: unlock the 20 words, the scenes and the plan. A web sales page; renewal terms are as visible as the price.
**Headline A:** Start your {{show}} plan today
**Headline B:** Unlock {{name}}'s full plan
**Body A:** All 20 words, every scene, one daily plan.
**Body B:** Cancel anytime, with a money-back guarantee.
**Plans:**
- **1 week** — intro price `{{price_1w}}` today, then `{{renew_1w}}` every week. No badge.
- **4 weeks** — **pre-selected**, "MOST POPULAR". `{{price_4w}}` today, then `{{renew_4w}}` every 4 weeks. Each card also shows its per-week equivalent (`{{week_equiv_4w}}`).
- **12 weeks** — "LOWEST PER WEEK". `{{price_12w}}` today, then `{{renew_12w}}` every 12 weeks.
- Renewal sits directly under the intro price at the same size, on every card, in the CTA line and on the receipt. Savings compare only against the real weekly price. No countdown, no ribbon that follows the user through the funnel.
**Visual:** Long-scroll web page: sticky brand bar (EWA name text, mini CTA, close); personalized hero (their level strip, the first six words as cards, "for {{show}}" chip, fact chips: level, words ready, minutes per day); plan block; "What's inside" (20 words, scene library, tap-to-translate, flashcards, AI tutor marked verify); "How it works" (3 steps); proof (rating block plus dashed review cards); guarantee seal; FAQ ("How do I cancel?" open); plan block repeated; legal footer; sticky bottom CTA while no plan block is on screen.
**Microcopy:** Disclosure above each CTA, live for the selected plan: "You pay {{price_sel}} today. Renews at {{renew_sel}} every {{period}} until you cancel." Under the CTA: "We'll email you before your first renewal." Trust row: "🔒 Secure payment · Cancel anytime · {{refund_days}}-day money-back". Disclaimer: "Not affiliated with any show or studio."
**Fallback offer:** On close, the last-chance offer (#20), shown once per session.
**CTA:** Start learning

### 20. Last-chance offer
**Purpose:** One second chance for users who close the paywall: the 4-week plan at a lower first price, then its regular renewal. Shown once.
**Headline A:** Keep {{name}}'s plan for less
**Headline B:** Your {{show}} words, lower price
**Body A:** Your 20 words and plan are ready to unlock.
**Body B:** One-time offer, then the regular renewal.
**Plans:** One offer card: **4-week plan**, `{{offer_price}}` today with the real `{{price_4w}}` struck, then `{{renew_4w}}` every 4 weeks until cancelled. Optional `{{offer_badge}}` only if true.
**Visual:** Same web look as #19: sticky bar with a close, eyebrow "One-time offer · shown once", headline, one orange-bordered offer card holding the level summary, the plan name, price row (struck then offer price), three checks, CTA, payment badges and the renewal line; plain decline link.
**Microcopy:** Renewal line: "{{offer_price}} today, then {{renew_4w}} every 4 weeks until you cancel. We'll email you before. Cancel anytime." Shown once per session (sessionStorage `ikf_offer_ewa-movies`); no timer (`CONFIG.offer.expiresMin` is `null`). Decline and close return to #18.
**CTA:** Claim my offer

---

## I. Payoff

### 21. Get the app
**Purpose:** Web buyers who never open the app refund. Get them to install, log in with the same email and finish day 1.
**Headline A:** You're in, {{name}}!
**Headline B:** Your first scene awaits
**Body A:** Get the app and log in with your email.
**Body B:** Your plan and saved words are waiting.
**Visual:** Phone mockup on Day 1 with the two saved words in "My words"; store button for the detected OS; three-step list.
**Microcopy:** Steps: "1 · Install the app" / "2 · Log in with {{email}}" / "3 · Start Day 1 with {{show}}". Receipt line: "Receipt and cancel link sent to {{email}}."
**CTA:** Get the app

---

## Notes

**Reference funnel (as captured, 2026-09-27 via AdSpyLab, research `ewa-ayahpath.md` §1).** EWA page "Language with Movies & Series" points at `quiz.appewa.com/sweetboarding/.../002-start`, 117 ads, 82 screens. Screens seen: language pick, "70 mill. users", a goal fork "Watching movies in English", the feature screen "Learn spoken English with characters from your favorite movies and TV shows", a benefit card "real pronunciation, vocabulary", plan build, paywall. The movie re-weighting of the spine and the paywall copy are **unverified** (research marks them inferred; the capture had no extractable plans). Dark patterns documented, not copied: permanent "-90% SUMMER SALE" ribbon from screen 1, oddly precise user counters, timer plus promo code on the paywall.

**Copyright.** Series names are text only. No posters, stills, logos or real clips. Demo scenes and word lists are original; the claim is "same genre as {{show}}", never "from {{show}}". Production needs either licensed clips or a subtitle frequency analysis cleared by legal before the 20-word list says "from {{show}}". Treat that claim as unverified until then.

**Word-check rubric.** 16 chips: 5 A2 (x100), 5 B1 (x300), 4 B2 (x600), 2 made-up (each tapped subtracts 15% of the total). Floor 100, rounded to 10. Bands: under 500 Newbie (A0), 500-1,500 Beginner (A1), 1,500-3,000 Elementary (A2), 3,000-5,000 Intermediate (B1). One grid caps the estimate near B1; a second harder grid is off by default to protect completion. Plan weeks come from level and minutes, never a fixed number for everyone.

**Blocks skipped:** goals, deadline and practice-time screens from `learning/ewa` (the series replaces goals; practice time is asked in the app on first open); gamified wheel; before/after split; post-purchase upsell; gender and age.

**Drop-off risk:** #11-12 if scenes load slowly on mobile web (preload during #9-10, fall back to a still plus audio); #13 word check; #16 email before the result.

**Monetization and metrics:** one subscription layer. Measure separately: paywall CVR (#19), offer CVR (#20 `offer_view` to `offer_accept`), trial or intro to paid, first-renewal retention at full price, refund rate (guardrail) and activation (install plus login plus Day 1 within 24h). Intro to renewal jumps are category default (EWA 2x); the renewal is shown next to every intro price.

**First A/B tests:** (1) series picked first (this brief) vs. level first; (2) two scene demos vs. one; (3) email before the result vs. after the 20-word wall.

**Demo:** private Artifact: https://claude.ai/artifact/AcgigSyCkLM7sLAWFefSSg (inlined-image copy; the repo `demo.html` references `img/` through the `IMG` map). Images: no `IKAME_AI_KEY` was set, so `scene-door/cafe/dusk` and `tutor` are copies of the `learning/ewa` illustrated stills and the suspense scene is a CSS placeholder; run `gen_images.py` to generate `scene-night.jpg`.
