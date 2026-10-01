---
niche: testlibrary-brain-memory
display_name: TestLibrary - Memory check, 5 mini-games (web)
archetype: assessment-unlock
subject: person
input: age band, reason for checking, five short memory mini-games (word recall, digit span, pattern, reaction, faces), email, first name
output: an overall memory score out of 100 plus five game-domain scores, and a locked report with a 4-week training plan built from the user's own results
screens: 16
monetization: web checkout - one-time report OR full-library access (disclosed paid trial then 4-weekly renewal); last-chance score summary; library cross-sell after the plan
creative_screens:
  hook-a: 1
  hook-b: 2
  hook-c: 5
  reveal: 11
  result: 15
motion: >
  a grid of tiles lighting up in sequence as a hand taps them back in order,
  then five score rings filling one by one around a single overall number
---

# Funnel Content - TestLibrary (Memory check)

This is the brain-training reskin of the TestLibrary flagship (`testlibrary/funnel-content.md`) and a sibling of `testlibrary/autism-traits/` (health-adjacent, same guardrails). The user gives an age band, a reason and plays **five short mini-games** (word recall, digit span, pattern, reaction, faces). They get an **overall memory score out of 100** and a score per game area. The paid report adds the full breakdown and a **4-week training plan built from their own results**. Archetype: **assessment-unlock** (followed as-is, mechanic variant: games instead of statements). 16 screens. Screen 5 (the games) repeats five times, screen 6 (checkpoint) twice.

**Reference funnels:** memoryOS "new-h" (34 screens) and Impulse brain training (31 screens), both in `testlibrary.md` sections 5 and 3 (captured via adspylab, 2026-09-28), plus TestLibrary's own brand and lander pattern. **Deliberately different:** in the competitors the quiz is mostly a lead-in and the result is a now-to-goal chart that is not scored; here the five games are real and the score is computed from what the user actually did. No "faster than 93% of people" mid-test, no percentile, no age-decline story, no verdict about health. The score is "your own number out of 100 for today", not a norm. The renewal price sits next to every trial price and nothing is billed silently. **Look:** the light "exam paper" look of the sibling briefs (white, ink navy, one amber accent); the games are plain, large and tappable; the paywall is a long-scroll web page.

**Health guardrails (apply to every screen):**
- A persistent **"Need help now?"** link on every screen opens a support sheet: "Worried about your memory or health? A doctor or GP can help, and you don't need a result to ask. In danger now? Call your local emergency number. Outside the US: findahelpline.com." One tap, no sign-in, never paywalled.
- **"Not a medical test"** is stated on the landing (1), expectations (4), preview (11), paywall (12), offer (13), report (15) and plan (16). The page says the check is "for curiosity and training".
- Never mention dementia, Alzheimer's, cognitive decline, "memory loss", diagnosis, screening, risk or "brain age". No claim that the games or the plan prevent, treat or slow anything. No advice to start, stop or change any treatment. A tip that says "talk to a doctor if you are worried" is allowed and is in the support sheet only.
- Ads and the lander do not hint at a personal condition ("Is your memory failing?" is banned). The promise is a playful check and training.

---

## A. Hook

### 1. Lander - How sharp is your memory
**Purpose:** Cold traffic arrives curious about its own memory. The first tap is cheap (age band), and the page says honestly what is free, what is paid and that this is not medical.
**Headline A:** How sharp is your memory?
**Headline B:** Play 5 quick memory games
**Body A:** Five mini-games, about 5 minutes. Free to play.
**Body B:** Pick your age to start. Free to play.
**Options:**
- 🌱 18-24
- 🚀 25-34
- 🧭 35-44
- 🌿 45-59
- 🦉 60+
**Field:** Single select, auto-advance on tap. Under-18: "You must be 18 or older to play."
**Visual:** White page, wordmark top-left. Hero: five soft paper tiles (a word card, a digit tile, a 3x3 grid, a lightning tile, a face tile) in a row. Age pills stacked full-width beneath, navy outline, navy fill on select. Footer links (Cancel subscription · Subscription policy · FAQ · Terms · Privacy) and the "Need help now?" strip along the bottom.
**Microcopy:** Disclosure directly under the pills, same size as the body: "Free to play · Full report is a paid unlock". Under it: "For curiosity and training. Not a medical test."
**CTA:** (auto-advances on select)

### 2. Age band is not the score
**Purpose:** Be upfront that age does not change the score, so nobody expects a verdict about their age. Used only to pick plan examples.
**Headline A:** Your score is just yours
**Headline B:** No age scale here
**Body A:** Age doesn't change it. Nothing compares you to others.
**Body B:** Your number is only about today's games.
**Visual:** One calm card with a single circle that reads "0-100" and two rows: "🎮 Scored from your own results" · "🙅 Not compared with other people". Plain, no chart.
**Microcopy:** Line under the card: "Age only picks examples in your plan." "Need help now?" stays on the bottom strip.
**CTA:** Continue

### 3. Why are you here
**Purpose:** One segmentation tap with a free-choice escape. The answer only changes plan wording and cross-sell order.
**Headline A:** What brings you here?
**Headline B:** Why check your memory?
**Body A:** We'll shape your plan around it.
**Body B:** Pick the closest. No wrong answer.
**Options:**
- 🧠 Stay sharp
- 📚 Study or work
- 🧩 Train my memory
- 🔍 Just curious
- ✏️ Other
**Field:** Single select, auto-advance on tap. "✏️ Other" opens a one-line input (max 40 chars); the CTA stays disabled until it has text. An empty "Other" never crashes and never advances.
**Visual:** Same pill list as screen 1.
**CTA:** (auto-advances on select; "Other" shows a Continue CTA)

### 4. Before you play
**Purpose:** The expectations screen, before the first game: what the games are, how long, and that this is not a medical test.
**Headline A:** Before you play
**Headline B:** Here's how it goes
**Body A:** Five short games for curiosity and training.
**Body B:** Go at your pace. Skip back anytime.
**Visual:** Three icon rows: 🎮 "5 mini-games · about 5 minutes" · 🧠 "Scored from your own results" · 🔓 "Free to play, report is paid". A calm card below: "Not a medical test. It can't tell you anything about your health." Beneath, the five game tiles unlabeled.
**Microcopy:** "5 minutes" is an estimate; replace it with the real median once measured. Under the CTA: "Free to play · Full report is a paid unlock". Support link stays visible.
**CTA:** Play game 1

---

## B. Investment

### 5. Mini-game (template, x5)
**Purpose:** The product itself. Each game is effort the paid report pays back. Short, fair, no pressure, no timer except the games' own.
**Headline A:** (per game, see Field)
**Headline B:** (per game, see Field)
**Body A:** (per game, see Field)
**Body B:** (per game, see Field)
**Field:** Five games in this order. Each has a "study/watch" phase and a "your turn" phase on the same screen. The CTA is disabled until the game ends, then enables.
1. **Word recall.** A: "Remember these words" / "Eight words. Ten seconds." B: "Memorize the list" / "Then pick them out of 16." Eight words show for 10 seconds; then 16 word chips appear (the 8 shown plus 8 new). The user taps the ones they saw and taps Done. Score = (right picks minus wrong picks, floor 0) / 8 x 100.
2. **Digit span.** A: "Watch the digits" / "Then type them back." B: "Hold the numbers" / "Longer each time you get it." Digits flash one at a time; the user types them back on a keypad. Starts at 3 digits, +1 on a correct answer, stops after 2 misses or at 7. Score = (longest length cleared minus 2) / 5 x 100, floor 0.
3. **Pattern.** A: "Watch the pattern" / "Tap it back in order." B: "Copy the sequence" / "Tiles light up. You repeat." A 3x3 grid lights tiles one at a time; the user repeats them. Starts at 3, +1 on a correct answer, stops after 2 misses or at 6. Score = (longest length cleared minus 2) / 4 x 100, floor 0.
4. **Reaction.** A: "Tap on green" / "Three quick taps." B: "Be quick" / "Wait for the green circle." The circle turns green after a random 1-3 seconds; the user taps. Tapping early shows "Too early. Wait for green." and repeats the round with no penalty. Score from the average of 3 taps: 100 at 200 ms or faster, 0 at 600 ms or slower, linear between.
5. **Faces.** A: "Match faces to names" / "Four faces. Eight seconds." B: "Faces and names" / "Remember who is who." Four faces with first names show for 8 seconds; then each face reappears with 3 name choices. Score = correct / 4 x 100.
All five scores are 0-100 and shown as "your score", never as a percentile.
**Visual:** Large, plain, white play area on the paper grid; one game on screen at a time, nothing else competing. Thin five-segment progress bar at the top, honest to games finished. No timer or ranking beyond the game's own countdown, no right-or-wrong sound, no streak.
**Microcopy:** Under the play area: "Your score is just yours". Games work with taps only; every game has a "Skip this game" link that gives it no score (the overall is then the mean of the games played, with a note on the result). The 5-minute estimate is unverified.
**CTA:** Next game

### 6. Checkpoint (template, x2)
**Purpose:** A breather so fatigue doesn't cause drop-off, using only true progress. Two checkpoints, after game 2 (40%) and after game 4 (80%).
**Headline A:** You're {{percent_done}}% done
**Headline B:** {{left_count}} games to go
**Body A:** {{played}} of 5 played. Your results are saved.
**Body B:** Keep going at your own pace.
**Visual:** A ring filled to the real percentage and the five unlabeled game tiles beneath (finished ones solid, the rest dashed), no scores shown. One honest tip per checkpoint.
**Microcopy:** Tips, true for everyone: "Tip: a quiet spot helps. No score for rushing." · "Tip: last two. Take a breath first."
**CTA:** Keep going

---

## C. Trust

### 7. Trust beat - after the games
**Purpose:** A trust beat right after the longest effort, before the email ask. It shows only real reviews held in `CONFIG.reviews`; with none, a neutral "almost there" beat replaces it.
**Headline A:** See what players say
**Headline B:** Real players, real words
**Body A:** Reviews from people who took a TestLibrary test.
**Body B:** Your results are almost ready.
**Fallback (no reviews configured):** Headline A "Your games are in" · Headline B "Almost there" · Body A "Next, we score all five." · Body B "Your results are almost ready." No stars, no review claim.
**Visual:** With reviews: star row only if a real rating is configured, plus one review card with first name and country. Without: the five game tiles, all solid.
**Microcopy:** Reviews and any rating figure come only from `CONFIG.reviews` (real, current, sourced). While it is unset, no stars, cards or "reviews" wording appear on screens 7, 8 or 12. Never import another company's numbers.
**CTA:** See my results

---

## D. Anticipation

### 8. Scoring
**Purpose:** Make the score feel computed from their games (because it is).
**Headline A:** Scoring your games…
**Headline B:** Working out your score…
**Steps:**
1. Reading your five games…
2. Scoring each memory area…
3. Working out your overall score…
4. Writing your report, almost ready…
**Visual:** Five empty rings; each fills to its real score as its row completes, the strongest turns amber last, but only after the real scores are known. Four progress rows beside it, rotating real review cards beneath only if `CONFIG.reviews` is set.
**Microcopy:** "Scored from your games only."
**CTA:** (auto-advances, ~6-8 seconds)

---

## E. Gate

### 9. Email gate
**Purpose:** Capture identity while curiosity peaks. The report is saved to the account.
**Headline A:** Your results are ready
**Headline B:** Where should we save them?
**Body A:** Enter your email to save your report.
**Body B:** Your report lives in your account, anytime.
**Field:** Email input, keyboard `email`, autofocus. Optional "Continue with Google / Apple" above it.
**Visual:** A free summary card above the field with computed facts only: "Completed in {{completion_time}}" · "Games played: {{games_played}} of 5" · "Words recalled: {{words_recalled}}". The overall score line below is blurred.
**Error state:** "Please enter a valid email."
**Microcopy:** Under the CTA: "No spam. We never sell your email." + Terms · Privacy. No price and no consent is bundled into this click; agreeing to terms here enrolls nobody in anything.
**CTA:** Save my results

### 10. Name for your report
**Purpose:** Personalizes the next screens so the paywall sells *their* report.
**Headline A:** What's your first name?
**Headline B:** Whose report is this?
**Body A:** It appears on your report and plan.
**Body B:** Printed exactly as you type it.
**Field:** Text input, max 30 chars, letters/spaces/hyphens, autofocus. If skipped or empty, later screens say "you".
**Visual:** Plain input on white, a faint report-card outline behind it with the name line highlighted.
**Error state:** "Please enter your first name."
**CTA:** Continue

---

## D. Anticipation (tease)

### 11. Score preview
**Purpose:** Desire before price: your overall score and your strongest area are real and visible; the other four areas and the plan are behind the unlock.
**Headline A:** {{name}}, your score is ready
**Headline B:** Here's your score, {{name}}
**Body A:** Overall score and strongest area are free.
**Body B:** The rest unlocks with your full report.
**Visual:** Stacked preview on white. (1) The overall score card: a big "{{overall}} / 100" with the line "Based on today's five games". (2) The strongest area card, clear: icon, name, score and a one-line gist. (3) Four blurred area rows with lock icons. (4) Two locked rows: "Your 4-week training plan" and "Where to focus first".
**Microcopy:** Line under the card: "For curiosity and training. Not a medical test." No percentile, no "above average" wording anywhere.
**CTA:** Unlock my report

---

## F. Monetization

### 12. Paywall (long-scroll web page)
**Purpose:** The ask, with two honest paths: this one report, or the whole library. Renewal terms are visible on the plan itself before any tap.
**Headline A:** Unlock your full report
**Headline B:** {{name}}, read your full report
**Body A:** One report, or every test in the library.
**Body B:** Choose one report or full library access.
**Plans:** Prices are tokens; the structure is real.
- **One-time report - {{price_report}}.** "This report and plan. Nothing renews."
- **1-week Full Access - {{price_trial}} today, then {{renewal_trial}} every 4 weeks.** Pre-selected, badge "ALL TESTS". The renewal line is printed on the card at the same size and color as the intro price.
- **4-week Full Access - {{price_4week}}, renews at {{renewal_4week}} every 4 weeks.**
Plan block repeats lower on the page, with the same selection.
**Visual:** One long scroll, web style, light page. In order: (1) brand bar with wordmark and a close X. (2) Personal hero with the overall score and strongest area clear, the other four areas blurred. (3) Plan block with three stacked radio cards, "today" and "then" in two equal-weight lines, then the CTA. (4) What's inside: all five area scores · where to focus first · your 4-week training plan (goals) · retest idea for week 4 · all tests (Full Access only). (5) How it works: 1 unlock · 2 read it in your account · 3 follow the plan and replay. (6) Proof: real review cards and rating, only when `CONFIG.reviews` is set; hidden otherwise. (7) Guarantee: the refund window that really exists, shown only when `CONFIG.refundDays` is a real number (hidden while it is a token). (8) FAQ accordion: Is this a medical test? · How is my score worked out? · When will I be charged? · How do I cancel? (9) The plan block again. (10) A support box: "Need help now?" with the support sheet link and "Not a medical test". (11) Sticky bottom CTA that always shows today's charge and the renewal line.
**Microcopy:**
- Above the CTA, changing with the plan: "Today: {{price_trial}}. On {{renewal_date}}: {{renewal_trial}}, then every 4 weeks until you cancel." / "One payment of {{price_report}}. Nothing renews."
- Trust row: "Secure checkout · Cancel anytime in your account · 2-click cancel".
- Reminder promise, only if the reminder email is actually sent (`CONFIG.reminder`, default on): "We'll email you 2 days before your trial ends."
- Disclaimer: "For curiosity and training. Not a medical test, not a diagnosis. Talk to a doctor about any health concern."
**Fallback offer:** Screen 13. The close X (and any back or exit) goes to the last-chance offer first, once per session. After it is declined, closing the paywall returns to the preview (11).
**CTA:** Continue to checkout

### 13. Last-chance offer (on close)
**Purpose:** A second chance for people who closed the paywall, most often because they don't want a subscription. It is a genuinely smaller option than every paywall tier: the **score summary** only (overall score, your strongest area in detail, a 3-day starter practice), with no other area scores, no 4-week plan, no retest. Nothing renews. Shown once per session (sessionStorage `ikf_offer_testlibrary-brain-memory`), then never again.
**Headline A:** {{name}}, just want your score?
**Headline B:** Want a smaller option?
**Body A:** Get your score summary. No subscription.
**Body B:** One payment. Nothing renews, nothing to cancel.
**Plans:** One offer card: {{offer_name}} (default "Score summary": one payment, nothing renews). {{offer_price}} today. A struck-through price appears only if it is a real, lower price that checkout charges; if the offer is the one-time report at its listed price, nothing is struck. Optional {{offer_badge}}.
**Visual:** Light page in the paywall's style: wordmark and close X, eyebrow "One-time offer · shown once", one navy-bordered offer card with a mini score card (overall clear, the rest blurred), the price row, 3 checks (your overall score · your strongest area in detail · a 3-day starter practice), the CTA, payment badges and the line "One payment of {{offer_price}}. Nothing renews, so there's nothing to cancel." "Need help now?" strip stays.
**Microcopy:** No timer by default. A timer appears only if `CONFIG.offer.expiresMin` is set to a real deadline; when it ends the offer is withdrawn (`offer_expired`) and the user returns to the preview. Decline link: "No thanks, back to my free preview". Disclaimer as on the paywall. Events: `offer_view`, `offer_accept` + `checkout_click` (plan `offer`), `offer_decline`, `offer_expired`. Offer CVR is measured separately.
**After purchase:** screen 15 shows the overall score and the strongest area only, with one locked row pointing to the full report; screen 16 shows the 3-day starter only.
**CTA:** Claim my offer

### 14. Order summary + consent
**Purpose:** The anti-trap screen. It restates what is charged today and later, with an unticked consent box.
**Headline A:** Review your order
**Headline B:** Confirm your plan
**Body A:** Here's exactly what you pay, today and later.
**Body B:** Check the details before you pay.
**Field:** Summary card (plan, today's charge, next charge date, amount and interval, "Cancel anytime before {{renewal_date}} to pay nothing more"). Below it a **consent checkbox, unticked by default**: "I understand my plan renews at {{renewal_trial}} every 4 weeks until I cancel." Required for recurring plans, hidden for One-time. Then card / Apple Pay / Google Pay.
**Visual:** White summary card with two rows, "Today" and "{{renewal_date}}", in equal type. Checkbox and label at body size right above the pay button.
**Error state:** "Please tick the box to confirm renewal terms." · "Card declined. Try another card or PayPal."
**Microcopy:** "Receipt with cancel link sent to {{email}}." Refund wording points to the Subscription policy; the paywall guarantee carries the real refund window.
**CTA:** Pay and see report

---

## G. Payoff

### 15. Your memory report
**Purpose:** Deliver the whole report honestly, so the purchase feels justified and refund risk stays low.
**Headline A:** Your memory score: {{overall}}
**Headline B:** {{name}}, here's your report
**Body A:** Five areas, from your own games.
**Body B:** Your strongest area and where to focus.
**Visual:** The overall score ring ("{{overall}} / 100"), then five area rows with a bar and a score each: Word recall (verbal memory) · Digit span (working memory) · Pattern (visual memory) · Reaction (processing speed) · Faces (face-name memory), the strongest marked "Your strongest" and the lowest "Most room to train", every area in the same warm tone. Then a card per area with one line on what the game measures and one everyday example. A short "Where to focus first" card with the lowest area. A support box with "Need help now?".
**Microcopy:** Method line, always visible: "Each score is 0-100 from your own results today. It is not compared with other people." Disclaimer: "For curiosity and training. Not a medical test or diagnosis." A skipped game is shown as "Skipped" and left out of the overall.
**CTA:** See my training plan

### 16. Your 4-week training plan
**Purpose:** Turn the result into something to do, and hand off to the library. Goals come from the user's own scores and are labeled as goals, never as promised outcomes.
**Headline A:** Your 4-week training plan
**Headline B:** {{name}}, here's your plan
**Body A:** Short practice goals, built from your results.
**Body B:** Adjust them to your week.
**Visual:** A four-row plan card. Week 1: practise your lowest area, 3 sessions of 5 minutes; goal: reach {{goal_score}} (your score plus 10, max 100). Week 2: the second-lowest area, same shape. Week 3: keep your strongest area warm, 2 sessions. Week 4: replay all five games and compare with today. Each row has one everyday habit idea. Under the plan, horizontal library cards ordered by the reason from screen 3 (Stay sharp → Mental Age, EQ Test; Study or work → Strengths Finder, Career Test; Train my memory → IQ Test, Mental Age; Just curious → Big Five, Mental Age) with minutes.
**Microcopy:**
- "Goals are suggestions, not promises. Skip or change any of them."
- Trial users: "Included until {{renewal_date}} · Manage plan".
- One-time buyers: "Unlock all tests - {{price_trial}} for 1 week, then {{renewal_trial}} every 4 weeks." The same consent screen (14) applies.
- Account line: "Log in anytime with {{email}}. Your report stays in your dashboard."
**CTA:** Start next test

---

## Notes

**Reused from sibling briefs (not re-researched):** screens 7-14 keep their jobs and the whole monetization spine of `testlibrary/autism-traits/` and `testlibrary/archetype/` (trial plan with renewal on the card, unticked consent, reminder email, one-time alternative, last-chance offer, library cross-sell) and the support sheet from autism-traits. **Unverified:** the competitor flows (memoryOS, Impulse) are read from captured screens only; the order and the five game formats here are our own design. The "about 5 minutes" estimate, the 8-word, 4-face and sequence-length settings, and the score formulas are unvalidated product choices until real data exists. **Verify:** the real library test names and minutes on screen 16.

**The honest difference.** The competitors show a Now-to-Goal chart that is not computed from anything and sell brain training on it. Here every number comes from the games the user just played, the scale is the user's own 0-100, and the plan goals are derived from those numbers and labeled goals. Competitor mechanics recorded only (do NOT implement): percentile and "faster than 93%" lines, "brain age", decline scare framing, the $1 click that becomes a large 4-weekly charge, resetting timers, fake live tickers.

**Scoring rules (honesty rules for the result).** Each game gives a 0-100 score by the formulas on screen 5. Overall = the mean of the games played, rounded. No norm group, no percentile, no age adjustment, no band such as "low", "normal" or "high", no cut-off, no total health-style verdict. "Your strongest" is the highest game score (ties go to game order); "Most room to train" is the lowest (ties go to the later game). Never say "diagnose", "screen", "detect", "decline", "dementia", "memory loss", "brain age", "clinically proven", "certified" or "scientific". Not a medical test, on screens 1, 4, 11, 12, 13, 15 and 16. "Need help now?" on every screen.

**Blocks skipped:** no notification opt-in (the retest reminder email is a plain promise only if sent), no countdown upsell, no before/after, no education question, no gamified wheel.

**Drop-off risk:** (1) screen 5, the five games (measure completion per game; the digit and pattern games are the hardest); (2) screen 9, the email ask; (3) screen 14, where the consent box will cost some conversion. The point is lower refunds and chargebacks. Policy risk: memory and brain ads draw extra review; keep the creative playful and never imply a personal condition.

**Monetization, two layers, measured separately:** (1) screens 12-14 by plan (one-time vs trial), with the last-chance offer (13) CVR on its own; (2) trial to first renewal rate and refund/chargeback rate, the health metric; (3) library engagement from screen 16, and games replayed in week 4.

**First A/B tests:** 5 games vs 3 games; email gate before the preview vs after; paywall default one-time vs trial pre-selected (both fully disclosed); showing the overall only vs overall plus strongest area in the teaser.

**Demo link:** https://claude.ai/artifact/FU4u1MGWBA18o2K2mFXbto (private; placeholder images until gen_images.py runs with IKAME_AI_KEY; the five mini-games are playable, game tiles are emoji art)
