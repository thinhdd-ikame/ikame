---
niche: mygrowth-genealogy
display_name: MyGrowth (Genealogy / Heritage History)
archetype: learning-plan
subject: person
input: what to explore, what they know about grandparents, name, places the family may come from, 2 migration-history answers, learning time, daily minutes, email
output: matched Heritage Path course (origins, traditions or ancestral lands) + 4-week lesson goals built from their own picks
screens: 20
monetization: web subscription (3 plans, 1-week intro / 4-week pre-selected / 12-week anchor, renewal shown beside every intro price); one-time single-track pass as last-chance offer; activation (install + sign-in) measured separately
creative_screens:
  hook-a: 1
  hook-b: 2
  quiz: 8
  loading: 14
  reveal: 16
motion: >
  a hand-drawn world map with dotted migration routes drawing themselves
  between continents, a lesson card flipping open on "Ellis Island, 1892",
  then three course tiles sliding into a four-week schedule
---

# Funnel Content — MyGrowth (Genealogy / Heritage History)

Same app and brand as `learning/mygrowth` (MyGrowth, EXTRAMILE LIMITED: 5-15 minute lessons in general-knowledge subjects). This variant sells **a history course for people curious about their family's roots**: why families moved, how traditions travel, how to read a place on a map. **References (adspylab, captured 2026-09-28):** Nibble `nibble-app.com/funnels/genealogy` (28 screens, 887 ads, landing "Discover Your Heritage in 3 Minutes"; capture stops at the selfie camera, **result and paywall not captured**) and the sibling MyGrowth funnels. Shape is the registered `learning-plan` archetype: curiosity + level quiz → 2 knowledge checks → email gate → course match + 4-week plan → web paywall → one-time offer.

**Deliberate differences from the competitor:** (1) **no face scan and no ethnicity percentages**: a selfie cannot reveal ancestry, and ethnicity from a face is sensitive biometric data and against Meta's personal-attributes policy; the funnel never asks for a photo and never infers anyone's ethnicity, race or origin; (2) **not a DNA or ancestry test**: we sell history lessons, and say so on the hook, bridge, paywall FAQ and offer; (3) places the user names are **their own words**, used only as chips and lesson hints, never as a "result" about them; (4) the two knowledge checks are the same migration-history facts for everyone and show the right answer at once; (5) no "78% found answers" or "top 12%" statistics, no fake discount, timer or scratch card; plans show intro and renewal together. **Look:** identical to `learning/mygrowth`: white background, lavender panels `#EBE9F7`, violet gradient `#8488F4 → #7D73E3`, orange `#FF9F00` accent. Copy rules apply: headline ≤6 words, body ≤12 words, A/B on every screen.

Tokens: `{{name}}`, `{{interests}}`, `{{know}}`, `{{regions}}`, `{{score_line}}`, `{{learn_time}}`, `{{daily_minutes}}`, `{{first_track}}`, `{{course_title}}`, `{{lessons_4wk}}`, `{{email}}`, `{{price_1w}}`, `{{renewal_1w}}`, `{{price_4w}}`, `{{renewal_4w}}`, `{{price_12w}}`, `{{renewal_12w}}`, `{{offer_price}}`, `{{refund_days}}`, `{{app_rating}}`, `{{rating_count}}`. Unset personal tokens fall back to: name "you", regions "your family's places", first_track "Origins & migrations", daily_minutes 10.

---

## A. Hook

### 1. Hook A — Where from?
**Purpose:** Cold traffic from heritage ads meets the curiosity question, with an honest "history lessons" frame.
**Headline A:** Where does your family come from?
**Headline B:** Explore your family's roots
**Body A:** Learn the history behind where families come from.
**Body B:** Short history lessons, built around your questions.
**Visual:** White background, MyGrowth logo top-left. Hand-drawn world map with dotted routes drawing between continents, last headline word in violet, violet CTA pinned bottom.
**Microcopy:** Under CTA: "History lessons, not a DNA test. No photo needed." Rating strip hidden while `CONFIG.rating` / `CONFIG.rating_count` are unset.
**CTA:** Start my quiz

### 2. Hook B — Every family has a story
**Purpose:** Sets the frame: we teach the history around your family's story; you bring the story.
**Headline A:** Every family has a story
**Headline B:** History helps tell yours
**Body A:** Understand why families moved and what they carried.
**Body B:** Start with the questions you already have.
**Visual:** Lavender panel with a simple timeline of migration eras, one dot glowing violet. Real lesson card footage when available.
**Microcopy:** Under CTA: "Takes about 2 minutes"
**CTA:** Continue

---

## B. Investment

### 3. What to explore
**Purpose:** Interest signal that routes the course track (origins / traditions / ancestral lands).
**Headline A:** What do you want to explore?
**Headline B:** Where should we start?
**Body A:** Pick all that fit.
**Body B:** Your first pick sets your course.
**Options:**
- 🧭 Where families came from
- 🎎 Traditions and customs
- 🏞️ Ancestral lands
- ✏️ Other
**Field:** Multi-select, CTA disabled until one pick (Other needs text). First pick in tap order sets `{{first_track}}`: origins, traditions or lands; Other-only routes to origins.
**Visual:** Stacked pills with right-side check circles.
**Microcopy:** Other placeholder: "e.g. Family recipes"; disabled hint: "Pick at least one to continue"
**CTA:** Continue

### 4. What you know
**Purpose:** Sets the starting level honestly; "very little" is welcome, not a gap to shame.
**Headline A:** What do you know about them?
**Headline B:** How much do you know?
**Body A:** Grandparents and earlier. No wrong answer.
**Body B:** Most families start with a few stories.
**Options:**
- 🌳 Names and places
- 📖 A few stories
- 🌫️ Very little
- ✏️ Other
**Field:** Single-select, auto-advance. Other opens a one-line input, CTA disabled while empty. Sets `{{know}}` and the starting level.
**Visual:** Stacked pills, small family-tree icon.
**Microcopy:** Other placeholder: "e.g. Only one photo"
**CTA:** Continue

### 5. Bridge — Roots are more than DNA
**Purpose:** Expectation screen before sensitive-feeling questions: lessons, not a test, no photo, no origin verdict.
**Headline A:** History, not a DNA test
**Headline B:** We won't guess your ancestry
**Body A:** You name the places. We teach the history.
**Body B:** No photo scan, no ethnicity percentages.
**Visual:** Lavender panel: a book icon and a map pin, a crossed-out camera icon labelled "No photo needed".
**Microcopy:** "MyGrowth teaches history. It cannot confirm where your family is from." Progress hint: "Step 1 of 3 done"
**CTA:** Continue

### 6. Name
**Purpose:** Gets `{{name}}` for the course, loader, paywall hero and offer.
**Headline A:** What should we call you?
**Headline B:** What's your first name?
**Body A:** We'll put it on your plan.
**Body B:** First name is all we need.
**Field:** Text input, placeholder "First name", max 30 chars, autofocus. Empty tap shows the error and does not advance.
**Visual:** Plain white input with violet focus ring.
**Error state:** "Please enter a name to continue"
**CTA:** Continue

### 7. Places in your family
**Purpose:** The "suspected countries" signal, self-reported; becomes chips and lesson hints only.
**Headline A:** Which places run in your family?
**Headline B:** Where might they be from?
**Body A:** Pick any you think apply. Guesses are fine.
**Body B:** Your words, not our verdict.
**Options:**
- 🇮🇪 Ireland
- 🇮🇹 Italy
- 🇩🇪 Germany
- 🇵🇱 Poland
- 🇲🇽 Mexico
- 🇮🇳 India
- 🇨🇳 China
- 🇳🇬 Nigeria
- 🤷 Not sure yet
- ✏️ Other
**Field:** Multi-select, CTA disabled until one pick (Other needs text). "Not sure yet" is a valid pick. Picks become `{{regions}}`; nothing is scored or inferred.
**Visual:** 2-column grid of flag cards, "Not sure" and Other as full-width pills.
**Microcopy:** Other placeholder: "e.g. Lebanon, Philippines"; line under list: "Only what you tell us. We never guess."
**CTA:** Continue

### 8. Migration check 1 — sample lesson
**Purpose:** The product demo: one question, the real answer, one fact. Same for everyone, not tied to places picked. Right = green, wrong = amber, never red.
**Headline A:** Where did millions of immigrants land?
**Headline B:** Quick check, {{name}}
**Body A:** Tap your best guess; no pressure.
**Body B:** Which island processed millions arriving in the US from 1892?
**Options:**
- Ellis Island
- Alcatraz
- Liberty Island
**Field:** Single-select, answer Ellis Island; CTA appears only after the fact card lands.
**Visual:** Illustration of a ferry approaching a brick hall, pills beneath, lavender fact card slides up with a 💡 icon.
**Microcopy:** Fact: "Ellis Island opened in 1892 and processed about 12 million arrivals by 1954." Labels: right "✅ Nailed it" / wrong "💡 Here's the story"
**CTA:** Next question

### 9. Migration check 2 — sample lesson
**Purpose:** Second fact locks in "I learned something in 30 seconds" and gives #10 a real score.
**Headline A:** What pushed many to leave Ireland?
**Headline B:** One more, {{name}}
**Body A:** Last one before your course.
**Body B:** What drove over a million Irish to emigrate in the 1840s?
**Options:**
- The Great Famine
- A gold rush
- A railway boom
**Field:** Same as #8; answer The Great Famine.
**Visual:** Same layout, second illustration (empty potato field, a ship on the horizon).
**Microcopy:** Fact: "The Great Famine (1845-52) drove over a million people to emigrate." Same feedback labels as #8.
**CTA:** See my result

### 10. Result bridge (computed from #8-9)
**Purpose:** Honest score, then the point: that took under a minute, a taste of the course.
**Headline A:** {{score_line}} (band table below)
**Headline B:** That took thirty seconds
**Body A:** That's one lesson: short and surprising.
**Body B:** Your course works just like this.
**Visual:** Two fact cards stacked like flashcards, each with ✅ or 💡; light confetti only on 2/2.
**Microcopy:** Bands: 2/2 "Two for two, {{name}}!" · 1/2 "One right, one new fact" · 0/2 "Two new facts, zero effort". Progress hint: "Step 2 of 3 done"
**CTA:** Keep going

### 11. Learning time
**Purpose:** Anchors the habit to a time of day; sets `{{learn_time}}` for the in-app reminder.
**Headline A:** When will you learn?
**Headline B:** Your best time for this?
**Body A:** One reminder, at a time that suits you.
**Body B:** Change or switch it off anytime.
**Options:**
- 🌅 Morning
- 🍱 Lunch break
- 🛋️ Evening
- 🌙 Before bed
- ✏️ Other time
**Field:** Single-select; each option sets a default time (08:00 / 12:30 / 19:30 / 21:30). "Other time" opens a time picker, CTA disabled until a time is set.
**Visual:** Pills with a clock on the right.
**Microcopy:** "Reminder shows inside the app, not as a push yet."
**CTA:** Continue

### 12. Daily minutes
**Purpose:** The commitment tap; sets `{{daily_minutes}}`, which makes the plan a calculation.
**Headline A:** How many minutes a day?
**Headline B:** Your daily pace
**Body A:** A small habit beats a big plan.
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

---

## C. Trust

### 13. Social proof
**Purpose:** Trust beat before the loader, public checkable numbers only.
**Headline A:** Rated {{app_rating}} on the App Store
**Headline B:** Learners give it {{app_rating}} stars
**Body A:** From {{rating_count}} ratings by people like {{name}}.
**Body B:** Lessons short enough to finish over coffee.
**Visual:** Large "{{app_rating}}" with star row and laurel, store badges, one real review card.
**Microcopy:** Rating and review card come from real store data only (`CONFIG.rating`, `CONFIG.reviews`). While unset the demo shows the fallback copy "Made for five-minute breaks" / "Every lesson works as text or audio." and hides the rating hero and review card. No invented user counts, no download totals.
**CTA:** Continue

---

## D. Anticipation

### 14. Building your path (loading)
**Purpose:** Makes the course feel assembled from the answers; rows name the user's own picks.
**Headline A:** Building {{name}}'s Heritage Path…
**Headline B:** Matching lessons to your questions…
**Steps:**
- Reading what you want to explore…
- Mapping history to your places…
- Choosing {{first_track}} lessons first…
- Almost ready, your path awaits…
**Visual:** A map with dotted routes drawing between pins; four progress rows; real reviews rotating beneath (hidden while reviews or rating are unset).
**Microcopy:** Carousel header: "★ {{app_rating}} on the App Store"
**CTA:** (auto-advances, ~6 seconds)

---

## E. Gate

### 15. Email
**Purpose:** Web checkout needs an identity that later unlocks the app; asked after the loader at peak curiosity.
**Headline A:** Where should we send it?
**Headline B:** Save your path, {{name}}
**Body A:** Your email unlocks your course in the app.
**Body B:** You'll sign in with this email later.
**Field:** Email input (email keyboard, autofocus), "Continue with Apple" / "Continue with Google" above. Separate **unchecked** marketing checkbox.
**Visual:** Blurred course card behind a white sheet holding the field.
**Error states:** "Please enter a valid email address" / "This email already has a plan. Check your inbox."
**Microcopy:** Under CTA: "Used only for your account. No spam." + Terms · Privacy links.
**CTA:** Show my path

---

## F. Reveal

### 16. Your Heritage Path
**Purpose:** The result: the matched course, built from #3, #4, #7 and #11. A course match, not a verdict about their ancestry.
**Headline A:** Your Heritage Path is ready
**Headline B:** {{name}}'s Heritage Path
**Body A:** A course matched to what you want to explore.
**Body B:** Built from your picks, not a DNA result.
**Visual:** One large course card (cover by track), eyebrow "Matched to your answers", three module rows (Why families moved · How traditions travel · Reading the map), chips for Explore · Level · Places (`{{regions}}`) · Time `{{learn_time}}`.
**Microcopy:** Tracks by first pick: origins → "Where Families Come From", traditions → "Traditions That Travel", lands → "Ancestral Lands and Maps". Footer line: "A history course. It can't confirm your family's origins."
**CTA:** See my plan

### 17. Your 4-week plan
**Purpose:** Turns the course into a ramp tied to the user's own pace.
**Headline A:** {{name}}'s 4-week plan
**Headline B:** Built around {{first_track}}
**Body A:** One short lesson a day, at your pace.
**Body B:** Week by week, building to a daily habit.
**Visual:** Four week rows with a day dot strip: Week 1 lesson 3 days, Week 2 five, Weeks 3 and 4 every day (22 lessons, each `{{daily_minutes}}` min). Eyebrow "Your goal, from your answers"; each row reads "goal: N lessons"; footer "Goal: 22 lessons · X hours in 4 weeks. A target set from your answers, not a promise of results." (computed). The 3/5/7/7 ramp is this brief's own design.
**CTA:** Start my path

---

## G. Monetization

### 18. Paywall
**Purpose:** Long-scroll web sales page. Intro and renewal sit side by side on every plan; no struck-through prices, no timer. Final prices are the growth team's call, so the page shows tokens.
**Headline A:** {{name}}, start your path today
**Headline B:** Your Heritage Path course
**Body A:** Every price and renewal shown before you pay.
**Body B:** Your goal: {{lessons_4wk}} lessons in 4 weeks.
**Plans:** (structure only, prices are tokens)
- **1-week plan** intro `{{price_1w}}`, then `{{renewal_1w}}` per week.
- **4-week plan**: **pre-selected**, intro `{{price_4w}}`, then `{{renewal_4w}}` every 4 weeks.
- **12-week plan**: anchor, intro `{{price_12w}}`, then `{{renewal_12w}}` every 12 weeks.
- Plans are named by the period they bill. No fake "was" price.
**Page structure (top to bottom):** brand bar (logo + close ✕) · personal hero (course cover, goal chip, `{{learn_time}}` · `{{daily_minutes}}` min/day) · plan block · what's inside · how it works (3 steps) · proof (real rating + real review cards; hidden while unset) · guarantee (hidden while `CONFIG.refundDays` is unset) · FAQ · plan block repeated · sticky CTA.
**Visual:** Same web look as the rest of the funnel. Radio plan cards, violet border on the selected one, payment-method row, safe-checkout badges. No countdown bar.
**Microcopy:**
- Line above the sticky CTA: "{{price_4w}} today. Then {{renewal_4w}} every 4 weeks until you cancel." (follows the selected plan)
- Trust row: "🔒 Secure checkout · Cancel online anytime" plus " · {{refund_days}}-day money-back guarantee" only once `CONFIG.refundDays` holds a confirmed number.
- What's inside (unverified: confirm the genealogy course catalog before launch): "Heritage Path lessons, 5-15 minutes each" · "Read or listen to every lesson" · "Quizzes after lessons" · "Streaks and achievements" · "In-app reminder at {{learn_time}}"
- How it works: 1 "Pick your plan" · 2 "Sign in with {{email}}" · 3 "Start your first lesson"
- FAQ: "Is this a DNA test?" → "No. It's a history course. We never scan photos or guess ancestry." · "How do I cancel?" → "Profile → Settings → Manage subscription, or the link in your receipt." · "Will it renew?" → "Yes, at the renewal price shown, until you cancel. We email you before every renewal."
**Fallback offer:** On close, the last-chance offer (#19) once per session. No timer.
**CTA:** Start my path

### 19. Last-chance offer (on close)
**Purpose:** Second chance for users who close without paying: a smaller, different product, a one-time pass for only their first track, paid once, not a cheaper copy of a plan tier. Shown once per session, then never again.
**Headline A:** Wait, {{name}}: just start with one
**Headline B:** Try one track, no subscription
**Body A:** Get your first track as a one-time pass.
**Body B:** Pay once. No renewal, no subscription.
**Plans:** One offer card: **Single-track pass** for `{{first_track}}`, `{{offer_price}}` one-time, no auto-renewal. Not included: the other two tracks, the 4-week plan reminders and streak history. Checks scoped to one track: "Every lesson on {{first_track}}", "Read or listen to each lesson", "A quiz after each lesson". No "free" wording, no struck-through price.
**Visual:** Same web look as #18: bar with logo and ✕, eyebrow "One-time offer · shown once", one violet-bordered card with the track cover, 3 checks, a "Not included" list, text link "No thanks, back to my plan".
**Microcopy:** "{{offer_price}} once. No subscription, no renewal." Shown once (sessionStorage `ikf_offer_mygrowth-genealogy`); `CONFIG.offer.expiresMin` is `null`, no timer. Unverified: whether a single-track pass exists as a product; if not, swap for the store-app paid intro and rewrite the benefits to match.
**CTA:** Get this track

---

## H. Payoff

### 20. Get the app
**Purpose:** Web buyers who never sign in refund; the first job after paying is lesson 1 with the same email.
**Headline A:** You're in, {{name}}!
**Headline B:** Last step: open the app
**Body A:** Get the app and sign in with {{email}}.
**Body B:** Your first lesson is waiting inside.
**Visual:** Green check over the logo, 3 numbered steps (Download · Tap the sign-in link we emailed · Start lesson 1), store badges, QR for desktop (placeholder).
**Microcopy:** "Receipt sent to {{email}}" · "Your {{learn_time}} reminder turns on in the app." · "Manage or cancel anytime" link.
**CTA:** Open the app

---

## Notes

- **Unverified:** the research marks the Nibble genealogy screens 1-11 as observed; result and paywall were never captured, so #16-19 are this brief's design. The two migration facts (#8-9), the 3/5/7/7 plan ramp, the three track names and the single-track pass are this brief's own; confirm the genealogy course catalog and the one-time pass with the MyGrowth team. Prices are tokens; the 1/4/12-week structure mirrors the sibling MyGrowth briefs, not live Stripe plans.
- **Policy guardrails:** no photo upload, no face scan, no ethnicity percentages, no inference of race, ethnicity or origin from any input. Region picks are self-reported chips. Ad copy must not imply personal attributes ("Are you Irish?"); lead with the history ("Why did families leave Ireland?"). Add a "history course, not a DNA test" line to every ad landing.
- **Honesty guardrails:** plan hours are goals labeled as goals; ratings and review counts copied from sibling briefs are unverified and sit behind CONFIG tokens, hidden while unset; no "78% found answers" or "top 12%" claims.
- **Dropped competitor mechanics:** selfie camera and AI ethnicity breakdown, sample ethnicity bars as a promise, percent-curiosity badges, resetting timers, scratch cards, expert personas.
- **Measure:** quiz completion by screen, #16 to #18 reach, paywall conversion per plan, offer accept rate, activation (install + sign-in + first lesson within 48 h), first-renewal retention at full price, refund rate.
- **Demo (private Artifact):** https://claude.ai/artifact/Dn1ufuCJHazWaW9BARibbz
