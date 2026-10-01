---
niche: ewa-books
display_name: EWA Books (Read and listen to adapted English books)
archetype: learning-plan
subject: person
input: favorite genre, native language, level, read or listen, one tapped word in an adapted passage, how the passage felt, three "is this true for you?" answers, minutes per day
output: measured English level plus the first 3 adapted books for their genre, and a paced reading plan
screens: 21
monetization: web subscription paywall (1-week intro / 4-week pre-selected / 12-week anchor), intro and renewal price shown together, one-time last-chance offer on paywall close, no permanent sale ribbon
creative_screens:
  hook-a: 1
  hook-b: 2
  passage: 8
  true-card: 10
  reveal: 17
motion: >
  an open book with one highlighted word, a translation bubble pops above it and
  the word flies into a flashcard deck, headphones fade in over the page, then
  three adapted book covers slide out one by one under the reader's level
---

# Funnel Content — EWA Books (Read real books in English)

EWA (Lithium Lab) runs one generic web quiz for every ad (`quiz.appewa.com/sweetboarding`, 55-82 screens depending on the creative; research `ewa-ayahpath.md` §2: red369 page, 105 ads, 55 screens). Its pattern: an echo screen after almost every answer and five "Is this true for you?" statements, each followed by a feature card. The book angle appears only as a feature line and the user never reads a page before the paywall. This brief keeps EWA's spine and swaps it for a **genre-first, web-to-app funnel of 21 screens**. The ad passes the genre as `{{genre}}` (for example `?genre=Mystery`; default "Romance"). The user picks a genre and how they like books (read, listen, both), then **does the product inside the funnel**: reads a short adapted passage at their level and taps an unknown word into a flashcard deck. Telling us how the passage felt measures the level. Three "is this true for you?" screens each end in a feature card. The result is a **level plus the first 3 adapted books for their genre**, then a plan, a web paywall and a one-time offer.

Archetype: **learning-plan**, registered variant of `learning/ewa`. Deliberate differences from EWA's own funnel: 21 screens instead of 55-82; the genre drives every screen; one tappable passage replaces "we have adapted books" statements; no permanent sale ribbon, no oddly precise user counters, no countdown reset; paywall and offer are disclosed (intro and renewal price side by side); ratings, reviews and the guarantee stay hidden until real values are configured. Book titles, passages and covers are original or generic: no real book cover, author, quote or publisher logo appears, and no screen claims to show a text from a real book.

---

## A. Hooks

### 1. Hook A — Your genre
**Purpose:** Match the ad: the promise is reading a real book at the right level, before asking anything.
**Headline A:** Read real books in English
**Headline B:** Your next book is a lesson
**Body A:** Adapted to your level. Tap any word.
**Body B:** Stories, audio and a plan built around you.
**Visual:** Warm cream background; a photo-style still of an open book beside headphones and a cup of tea on linen; a plain pill under it showing the genre name (`{{genre}}`) with an emoji; one highlighted word on the page with a small translation bubble; orange pill CTA.
**Microcopy:** Trust line (rating and count) appears only when real values are configured (`{{app_rating}}`, `{{rating_count}}`), hidden otherwise. *(EWA reference, unverified for this funnel: 4.7 · 196K, captured Sept 2026.)* Small line: "Adapted editions, not the original texts."
**CTA:** Get started

### 2. Hook B — Read, tap, remember
**Purpose:** Cold ad traffic needs the one habit loop it can picture: read, tap, card.
**Headline A:** Read. Tap. Remember.
**Headline B:** A book that teaches you
**Body A:** Tap any word in a story, save it instantly.
**Body B:** Cards bring saved words back at spaced intervals.
**Visual:** Three-step strip "read → tap → card" with small illustrated icons, the book-and-headphones still, and one review card underneath when a real review is configured (hidden otherwise, no placeholder shown to the user).
**Microcopy:** Review text and rating are tokens, hidden while unset. *(EWA reference quote, unverified: "If anything is unclear while reading, just tap a word", Maria.)*
**CTA:** Continue

---

## B. Investment — your genre and how you read

### 3. Favorite genre
**Purpose:** The genre is the personalization key: it picks the passage, the three books and the `{{genre}}` token on every later screen.
**Headline A:** What do you love to read?
**Headline B:** Pick your favorite genre
**Body A:** We'll choose books you'll finish.
**Body B:** Your stories will come from this world.
**Options:**
- 💘 Romance
- 🔍 Mystery
- 🚀 Sci-fi and fantasy
- 🌱 Self-growth
- 🏛️ Classics
- 😄 Short stories
- ✏️ Other
**Field:** Single-select grid of text cards (emoji tile, no cover art). Pre-selected from the ad param `?genre=`. "Other" opens a one-line input; with the field empty the CTA is disabled. Romance, self-growth, short stories and Other map to the everyday-life passage; mystery, sci-fi and classics to the suspense-adventure passage.
**Visual:** 2-column grid, each card a gradient tile with an emoji and the genre as text; selected card gets an accent border and a check.
**Microcopy:** Disabled-CTA hint: "Pick a genre to continue"
**CTA:** Continue

### 4. Native language
**Purpose:** Every translation bubble and card uses it, so it comes before the passage.
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
**Purpose:** A cheap first guess; it picks the level of the passage. True beginners get the simplest text.
**Headline A:** How's your English today?
**Headline B:** {{name}}, where do you start?
**Body A:** A rough guess is fine. We'll check soon.
**Body B:** Honest answers get you the right first page.
**Options:**
- 🌱 Total beginner
- 🙂 I know the basics
- 💬 I can chat a bit
- 🚀 Pretty confident
**Field:** Single-select. Beginners and basics get the short A1-A2 passage, the others the B1 passage.
**Visual:** Four stacked pills with a four-step level meter on each.
**Microcopy:** After "Total beginner": "Everyone starts somewhere. We'll begin with the basics."
**CTA:** Continue

### 6. Read or listen
**Purpose:** Format decides the demo (text on, or audio first) and the plan's first week; audiobooks are a core part of the offer.
**Headline A:** How do you like books?
**Headline B:** Read, listen, or both?
**Body A:** This sets how your first story looks.
**Body B:** We'll tune the first page to it.
**Options:**
- 📖 Read it
- 🎧 Listen to it
- ✨ Both together
- ✏️ Other
**Field:** Single-select. "Listen" starts the passage with text hidden behind "Show text" and an audio button; "Both" shows the text with the audio button. "Other" opens a one-line input, CTA disabled while it is empty.
**Visual:** Three pills with glyphs (open book, headphones, book plus headphones).
**CTA:** Continue

### 7. Name
**Purpose:** Gets `{{name}}` for the result, plan and offer.
**Headline A:** What should we call you?
**Headline B:** What's your first name?
**Body A:** Your tutor will greet you by name.
**Body B:** It goes on your reading plan.
**Field:** Text input, placeholder "First name", max 30 chars. Empty falls back to the neutral stand-in "friend" (and "your" for possessives) in copy.
**Visual:** White input on cream, a small fox tutor with a speech bubble that fills with "Hi, …!" as they type.
**Error state:** "Please enter a name to continue"
**CTA:** Continue

---

## C. First taste — the passage

### 8. Passage — tap a word
**Purpose:** First taste of the loop (page, tap, translation, saved card) before email or money. Differs from EWA, which only describes it.
**Headline A:** Tap a word you don't know
**Headline B:** Your first page, {{name}}
**Body A:** One tap shows it and saves it.
**Body B:** The word flies into your deck.
**Field:** One short original passage (3-4 sentences) in the genre pool and at the level from #5, with 3 underlined words. Tapping one shows its translation in the native language with an audio button; the word flies into a "My words" deck with a "+1" bump. For "Listen" users the text starts hidden, an audio button reads the passage aloud, and "Show text" reveals it. CTA enables after one tap.
**Visual:** A book-page card on cream with a small illustration strip at the top, large readable serif-free text, the tapped word glowing, translation bubble above it, deck icon top-right; caption "Original passage, adapted for your level".
**Microcopy:** Toast: "Saved to My words · review tomorrow". Skip link below.
**Skip link:** "Skip"
**CTA:** Continue

### 9. How did it read?
**Purpose:** The measured part of the level result. The answer moves the self-rated level one step up or down; it is honest feedback, not a test.
**Headline A:** How did that read?
**Headline B:** Was the page easy to follow?
**Body A:** Honest answers set your level.
**Body B:** We'll adjust your books to it.
**Options:**
- 😅 Too hard
- 👌 Just right
- 😴 Too easy
**Field:** Single-select. Too hard lowers the estimate one step (floor Starter), too easy raises it one step (cap Upper-intermediate).
**Visual:** Three large pills with a three-step ease dial.
**Microcopy:** After a pick: "Noted. Your books will match this."
**CTA:** Continue

---

## D. Is this true for you?

### 10. True for you 1 — unknown words
**Purpose:** Names the first reading pain; the feature card answers it right away.
**Headline A:** Is this true for you?
**Headline B:** Does this sound like you?
**Body A:** "I stop reading at unknown words."
**Body B:** "Looking words up breaks my flow."
**Options:**
- ✅ Yes, often
- 🤔 Sometimes
- 🙂 Not really
**Field:** Single-select. After any pick, a feature card slides in: "Tap any word, keep reading" with a mini page and a translation bubble. CTA enables after the pick.
**Visual:** Large quote card, then a feature card with an animated tap on a word.
**Microcopy:** Echo line after the pick: "Got it. Here's what helps."
**CTA:** Continue

### 11. True for you 2 — forgetting
**Purpose:** Names the second pain (words that vanish); the card shows spaced review.
**Headline A:** And what about this?
**Headline B:** Is this true too?
**Body A:** "I forget new words within days."
**Body B:** "Words I look up never stick."
**Options:**
- ✅ Yes, often
- 🤔 Sometimes
- 🙂 Not really
**Field:** Single-select. Feature card: "Cards that come back on time", a flashcard with a "review tomorrow" chip.
**Visual:** Quote card, then a flashcard flipping between English and the native word.
**Microcopy:** Echo line after the pick: "Got it. Here's what helps."
**CTA:** Continue

### 12. True for you 3 — wrong level
**Purpose:** Names the third pain (books too hard or too easy); the card shows adapted levels and audio.
**Headline A:** One more, {{name}}
**Headline B:** Does this sound familiar?
**Body A:** "Real books are too hard for me."
**Body B:** "I'd read more at my level."
**Options:**
- ✅ Yes, often
- 🤔 Sometimes
- 🙂 Not really
**Field:** Single-select. Feature card: "Adapted books at your level" with a four-step level ladder (A1 to B2) and a small headphones chip "Listen along".
**Visual:** Quote card, then a stack of three covers on a level ladder.
**Microcopy:** Echo line after the pick: "Got it. Here's what helps."
**CTA:** Continue

---

## E. Trust

### 13. Social proof
**Purpose:** Trust beat after the highest-effort stretch, before the pace question.
**Headline A:** Rated by {{rating_count}} learners
**Headline B:** What readers say
**Body A:** Ratings from the App Store.
**Body B:** The feature reviewers mention most.
**Visual:** Large rating number with star row, App Store and Google Play badges, real review cards. All of it appears only when real values are configured. While unset, the screen shows a dashed internal placeholder ("Real App Store rating and reviews go here") that is never part of the shipped page.
**Microcopy:** Numbers are tokens (`{{app_rating}}`, `{{rating_count}}`), hidden while unset. EWA reference (unverified for this funnel): 4.7 · 196K. Do not reuse these numbers for any other brand.
**CTA:** Continue

---

## F. Pace and anticipation

### 14. Minutes per day
**Purpose:** The pacing input; the plan length in #18 is computed from it.
**Headline A:** How much time per day?
**Headline B:** Your daily reading time?
**Body A:** One chapter a day beats a weekend binge.
**Body B:** Be realistic. You can change it anytime.
**Options:**
- ☕ 5 min · Casual
- 🚶 10 min · Steady
- 🏃 15 min · Serious
- 🔥 20+ min · Intense
**Field:** Single-select, 10 min suggested.
**Visual:** Four pills with a clock icon that fills to match the minutes.
**CTA:** Continue

### 15. Building the plan (loading)
**Purpose:** Makes the plan feel built from the answers, in the highest-attention moment before the gate.
**Headline A:** Building {{name}}'s {{genre}} plan…
**Headline B:** Choosing books for {{name}}…
**Steps:** (4 progress rows, each with % counter, checkmark and bar)
- Browsing adapted {{genre}} books…
- Matching them to your level…
- Pacing it to your minutes daily…
- Almost ready, your plan is waiting…
**Visual:** The first saved word as a flashcard with three book covers orbiting it; four progress rows.
**Microcopy:** One optional overlay at about 50%: "Want a free 7-day streak challenge?" with "Yes, I'm in" / "No thanks"; neither button adds anything paid.
**CTA:** (auto-advances, ~6-8 seconds)

---

## G. Gate

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

## H. Reveal

### 17. Level and your first 3 books
**Purpose:** The result: a measured level and the first 3 adapted books for their genre. Book 1 is open to start, books 2 and 3 are locked, so the full set is what the plan sells.
**Headline A:** Your level: {{level}}
**Headline B:** Your first 3 books, {{name}}
**Body A:** Adapted {{genre}} books, picked for your level.
**Body B:** Next up: {{next_level}}, one chapter at a time.
**Visual:** Top: a five-step level strip with a marker on the estimate. Below: three book covers side by side (wordless cover art) with the title as text under each, a level chip and minutes per chapter; book 1 carries a "Start here" tag, books 2 and 3 show a lock. The two words saved in #8 sit in a small "My words" row.
**Microcopy:** Footnote: "Estimate from your self-rating and how the page felt. It updates as you read." Caption: "Sample titles. The final catalog is set by the content team." *(Unverified: adapted editions, covers and titles are placeholders until a licensed or commissioned catalog is confirmed.)*
**CTA:** See my plan

### 18. Plan and goals
**Purpose:** A plan visibly built from their answers, with an honest computed timeline to the next level.
**Headline A:** {{name}}'s path to {{next_level}}
**Headline B:** Your first weeks, planned
**Body A:** At your pace, here's your likely progress.
**Body B:** Built around {{genre}} and how you read.
**Visual:** Rising curve from "Today" to "Week N" with plan-goal chips labeled "Goal for week N" and derived from level and minutes per day (week 1: read your first chapter and save a number of words, week 2: review cards and finish book 1, week 3: start book 2 and listen along, last week: re-check your level toward the next one); summary card: level to next level, genre, format, minutes per day.
**Microcopy:** Footnote: "Estimate for learners who read daily. Results vary." Week count comes from level and minutes, never a fixed number.
**CTA:** Start my plan

---

## I. Monetization

### 19. Paywall
**Purpose:** The single ask: unlock the three books, audio, cards and the plan. A web sales page; renewal terms are as visible as the price.
**Headline A:** Start your {{genre}} reading plan
**Headline B:** Unlock {{name}}'s full plan
**Body A:** Three books, audio, cards, one daily plan.
**Body B:** Cancel anytime. Renewal price shown up front.
**Plans:**
- **1 week** — intro price `{{price_1w}}` today, then `{{renew_1w}}` every week. No badge.
- **4 weeks** — **pre-selected**, "MOST POPULAR". `{{price_4w}}` today, then `{{renew_4w}}` every 4 weeks. Each card also shows its per-week equivalent (`{{week_equiv_4w}}`).
- **12 weeks** — "LOWEST PER WEEK". `{{price_12w}}` today, then `{{renew_12w}}` every 12 weeks.
- Renewal sits directly under the intro price at the same size, on every card, in the CTA line and on the receipt. Savings compare only against the real weekly price. No countdown, no ribbon that follows the user through the funnel.
**Visual:** Long-scroll web page: sticky brand bar (EWA name text, mini CTA, close); personalized hero (their level strip, the three covers, "for {{genre}}" chip, fact chips: level, books ready, minutes per day); plan block; "What's inside" (first chapter open, three adapted books, tap-to-translate on every page, audio narration marked verify, flashcards, AI tutor marked verify, daily plan); "How it works" (3 steps); proof (rating block and review cards only when real values are configured, otherwise the section is omitted); guarantee seal only when a real refund period is configured (hidden while `{{refund_days}}` is a token); FAQ ("How do I cancel?" open); plan block repeated; legal footer; sticky bottom CTA while no plan block is on screen.
**Microcopy:** Disclosure above each CTA, live for the selected plan: "You pay {{price_sel}} today. Renews at {{renew_sel}} every {{period}} until you cancel." Under the CTA: "We'll email you before your first renewal." Trust row: "🔒 Secure payment · Cancel anytime", plus "{{refund_days}}-day money-back" only when a real refund period is set. Disclaimer: "Adapted editions, not the original texts."
**Fallback offer:** On close, the last-chance offer (#20), shown once per session.
**CTA:** Start reading

### 20. Last-chance offer
**Purpose:** One second chance for users who close the paywall: a smaller 1-week starter (the three adapted books with tap-to-translate; no audio, flashcards, AI tutor or daily plan), then its weekly renewal. Not a discount on the same SKU. Shown once.
**Headline A:** Start smaller with one week
**Headline B:** Try {{genre}} books for a week
**Body A:** Your three books, no long plan.
**Body B:** One-time starter, then weekly renewal.
**Plans:** One offer card: **1-week starter**, `{{offer_price}}` today with the real `{{price_1w}}` (same plan length) struck only if it is lower, then `{{renew_1w}}` every week until cancelled. Checks match its scope: the three adapted books, tap-to-translate on every page, an email before renewal. A "Not included" line lists audio narration, flashcards, AI tutor and the daily plan. Optional `{{offer_badge}}` only if true.
**Visual:** Same web look as #19: sticky bar with a close, eyebrow "One-time offer · shown once", headline, one orange-bordered offer card holding the level summary, the plan name, price row (struck then offer price), three checks, the "Not included" line, CTA, payment badges and the renewal line; plain decline link.
**Microcopy:** Renewal line: "{{offer_price}} today, then {{renew_1w}} every week until you cancel. We'll email you before. Cancel anytime." Shown once per session (sessionStorage `ikf_offer_ewa-books`); no timer (`CONFIG.offer.expiresMin` is `null`). Decline and close return to #18.
**CTA:** Claim my offer

---

## J. Payoff

### 21. Get the app
**Purpose:** Web buyers who never open the app refund. Get them to install, log in with the same email and finish day 1.
**Headline A:** You're in, {{name}}!
**Headline B:** Your first chapter awaits
**Body A:** Get the app and log in with your email.
**Body B:** Your plan and saved words are waiting.
**Visual:** Phone mockup on Day 1 with book 1 and the saved words in "My words"; store button for the detected OS; three-step list.
**Microcopy:** Steps: "1 · Install the app" / "2 · Log in with {{email}}" / "3 · Start Day 1 with {{genre}}". Receipt line: "Receipt and cancel link sent to {{email}}."
**CTA:** Get the app

---

## Notes

**Reference funnel (as captured, research `ewa-ayahpath.md` §2).** EWA page red369: 105 ads, 55 screens, echo screen after most questions, five "Is this true for you?" statements each followed by a feature card, plan build, paywall. The book-first re-weighting of the spine, the audiobook emphasis and the paywall copy are **unverified** (research marks them inferred; no extractable plans were captured). Dark patterns documented, not copied: permanent sale ribbon, oddly precise user counters, timer plus promo code on the paywall.

**Content and copyright.** Passages, book titles and covers are original or generic placeholders; the claim is "adapted edition", never "from <real book>". Production needs either licensed/public-domain adaptations or commissioned originals, cleared by legal, before screen 17 says "your first 3 books". Treat the catalog, and audio narration, as unverified until the content team confirms what ships.

**Level rubric.** Self-rated level sets the start: total beginner Starter (A0), basics Beginner (A1), chat Elementary (A2), confident Intermediate (B1). "How did that read?" moves it one step: too hard minus one (floor Starter), too easy plus one (cap Upper-intermediate), just right no change. One short passage gives a coarse estimate, labeled as one; a vocabulary grid can be added behind a flag to protect completion. Plan weeks come from level and minutes, never a fixed number for everyone.

**Blocks skipped:** goals, deadline and practice-time screens from `learning/ewa` (the genre replaces goals; practice time is asked in the app on first open); gamified wheel; before/after split; post-purchase upsell; gender and age; a vocabulary grid (the passage plus the ease question replaces it).

**Drop-off risk:** #8 if the passage or audio loads slowly on mobile web (preload during #6-7, fall back to a still plus audio); the three "is this true" screens #10-12 if they feel like padding (A/B test one vs. three); #16 email before the result.

**Monetization and metrics:** one subscription layer. Measure separately: paywall CVR (#19), offer CVR (#20 `offer_view` to `offer_accept`), trial or intro to paid, first-renewal retention at full price, refund rate (guardrail) and activation (install plus login plus first chapter within 24h). Intro to renewal jumps are category default (EWA 2x); the renewal is shown next to every intro price.

**First A/B tests:** (1) genre first (this brief) vs. level first; (2) three "is this true" screens vs. one; (3) email before the result vs. after the three-book reveal.

**Plan goals (unverified):** the week 1-3 goals are targets set from level and minutes (words per day by pace), not measured outcomes; the content team must confirm the numbers.

**Demo:** private Artifact: https://claude.ai/artifact/3Wvn4RT1GCnXiHjL9tKgqg (inlined-image copy; the repo `demo.html` references `img/` through the `IMG` map). Images: no `IKAME_AI_KEY` was set, so the three book covers, the hook still, the passage illustration and the tutor are copies of the wordless `learning/ewa` stills (original art, no text); run `gen_images.py` to replace them with books-specific art under the same names.
