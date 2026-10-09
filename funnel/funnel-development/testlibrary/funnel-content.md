---
niche: testlibrary
display_name: TestLibrary (IQ test + personality test library - web)
archetype: assessment-unlock
subject: person
input: age band, reason for testing, 38 graded reasoning questions, email, first name
output: estimated IQ score with age-group comparison, section breakdown and a named certificate
screens: 16
monetization: web checkout - one-time single report OR full-library access (disclosed paid trial then 4-weekly renewal); library cross-sell after the reveal
creative_screens:
  hook-a: 1
  hook-b: 2
  hook-c: 4
  reveal: 7
  result: 14
motion: >
  a pattern-matrix puzzle assembling tile by tile, then a bell curve drawing
  left to right and a glowing marker sliding to the user's score
---

# Funnel Content — TestLibrary (IQ test)

TestLibrary (testlibrary.com) is a web library of about 27 self-discovery tests: IQ, EQ, Big Five/OCEAN, 16 Personalities, Enneagram, DISC, Attachment Style, Love Style, Career, Mental Age, ADHD/autism trait quizzes and more. Paid traffic lands on a single-test page (`/iq-test`, `/eq-test`, `/adhd-test`…). The user takes the whole test for free, then pays to unlock the report. This brief covers the **IQ test**, the flagship. The user gives an age band, a reason, and 38 graded answers. They get an estimated IQ score, an age-group comparison, a breakdown by section and a named certificate. The shape is new to this repo, so it's registered as **assessment-unlock**. The quiz here is not *about* the user, as in personalization-quiz: it's a real test with right answers, and the effort of taking it is the sunk cost. The score doesn't sell a separate utility either, as in diagnostic-utility: the result *is* the product. 16 screens. Screens 4 and 5 are templates that repeat (38 questions, 3 checkpoints). **Modeled on:** TestLibrary's own landers, fetched 2026-09-28 (`/iq-test`, `/personality-test`, `/eq-test`, `/career-test` and others all use "Discover your X · Complete this 5-minute X test… · Select your gender to begin"), its `/library`, `/pricing`, `/faq` and `/legal/subscription-policy` pages, and two IQ-funnel teardowns from the adspylab Funnels Library: **Testora** (`funnel.testora.space`: 44-step timed test, mid-test "faster than 93%" flattery, loader with micro-questions, email gate, "name for your certificate", Einstein comparison paywall, 09:59 timer) and **Impulse** (`iq.mental-impulse.com`: a brain-training plan quiz rather than a real test, 4/12/24-week auto-renew plans). **Not verified:** the live test screens past the lander (they're rendered in JS and couldn't be fetched), whether a certificate ships today, the brand colors, and the scoring/norm method. These are marked "verify" where they matter. **Deliberately different from the competitors:** the test is labeled free-to-take-but-paid-report on screen 1, no percentile is shown during the test, the score is computed and never flattering by default, and the renewal price sits next to every trial price (see Notes on the hidden-billing mechanic common in this niche). Visuals move away from the repo's dark default to a light, calm "exam paper" look (white, ink navy, one accent). The brand palette still needs confirming.

---

## A. Hook

### 1. Lander — Start the test
**Purpose:** Cold ad traffic arrives curious about "my IQ". Make the first tap cheap (age band) and tell them honestly what's free and what isn't.
**Headline A:** Discover your IQ score
**Headline B:** How sharp is your mind?
**Body A:** 38 reasoning puzzles, compared with people your age.
**Body B:** Patterns, numbers, words and shapes — pick your age to start.
**Options:**
- 🌱 18-24
- 🚀 25-34
- 🧭 35-44
- 🌿 45-59
- 🦉 60+
**Field:** Single select, auto-advance on tap. Replaces the site's gender picker (see Notes). Under-18: "You must be 18 or older to take this test."
**Visual:** White page, TestLibrary wordmark top-left. Hero shows a 3×3 pattern-matrix puzzle with the ninth tile missing, and beside it a small bell-curve card with a "?" marker. Age pills stacked full-width beneath, navy outline, fill navy on select. Footer links stay (Cancel subscription · Subscription policy · FAQ · Terms · Privacy), because the live site shows them and they build trust.
**Microcopy:** Disclosure line directly under the pills, same size as the body text, not in the footer: "Free to take · Full report is a paid unlock"
**CTA:** (auto-advances on select)

### 2. How it works
**Purpose:** Set honest effort expectations (length, rules) so people who start actually finish. Mid-test abandonment is the biggest leak in this niche.
**Headline A:** Before you begin
**Headline B:** Here's how it works
**Body A:** One correct answer per question, no trick questions.
**Body B:** Find a quiet spot — your progress saves as you go.
**Visual:** Three icon rows on white: 🧩 "38 questions · 4 sections", ⏱ "About {{est_minutes}} minutes", ✅ "One correct answer each". Then a thin rule and the section chips (Patterns · Numbers · Words · Shapes).
**Microcopy:** "{{est_minutes}}" must be the real median completion time. The live landers say "5-minute test" while `/library` lists the IQ test at 38 questions / 20 mins, so fix one of them before launch. Under the CTA: "Free to take · Full report is a paid unlock"
**CTA:** Start the test

---

## B. Investment

### 3. Why are you testing?
**Purpose:** One cheap tap before the hard work. It segments the paywall headline and picks which library test to suggest after the reveal.
**Headline A:** What brings you here?
**Headline B:** Why test your IQ today?
**Body A:** We'll tailor your report's tips to this.
**Body B:** Pick the one that fits best.
**Options:**
- 🤔 Pure curiosity
- 🎓 School or job prep
- 🧠 Keep my mind sharp
- 👥 Compare with friends
- ✏️ Other
**Field:** Single select, auto-advance. "✏️ Other" opens a one-line input (max 40 chars).
**Visual:** Same pill list as screen 1, a progress hint "Warm-up" at the top instead of a number.
**CTA:** (auto-advances on select)

### 4. Test question (template, ×38)
**Purpose:** The product itself. Every answered question is real effort that the paid report pays back, so the screen must feel fair and calm, not rushed.
**Headline A:** Which tile completes the pattern?
**Headline B:** Find the missing piece
**Body A:** Question {{q_index}} of 38 · {{section_name}}
**Body B:** Take your time and trust your first instinct.
**Options:** 6 answer tiles (image or text, depending on section). Section item types: **Patterns** matrix tiles · **Numbers** sequences ("8, 12, __, 20, 24") · **Words** analogies ("Car is to wheel as bird is to…") · **Shapes** rotation/folding.
**Field:** Single select, auto-advance after 400 ms. "Back" allowed within the current section only. The headline changes per item type (e.g. "Which number comes next?", "Pick the best match").
**Visual:** White card holding the puzzle, 2×3 grid of answer tiles below, thin segmented progress bar at the top (4 segments = 4 sections). No ticking clock on screen. If the test is timed, show "Time used" small in the corner and never a countdown.
**Microcopy:** No right/wrong feedback and no percentile during the test. Section header chip: "{{section_name}} · {{section_index}}/4"
**CTA:** (auto-advances on select)

### 5. Section checkpoint (template, ×3)
**Purpose:** Bridge/reassurance between sections so fatigue doesn't cause drop-off, using honest progress and no fake ranking.
**Headline A:** Section {{section_index}} complete
**Headline B:** Nice work, keep going
**Body A:** {{answered}} of 38 answered — next up: {{next_section}}.
**Body B:** Take a breather — your answers are saved.
**Visual:** Four-segment progress ring with the finished segments filled navy, the next section's icon lit in the accent color, a small illustration of that item type.
**Microcopy:** Tip line, one per checkpoint, true for everyone: "Tip: skip nothing — a guess beats a blank." · "Tip: rotate shapes in your head, not the phone." · "Tip: last section is words — read each option."
**CTA:** Next section

---

## C. Trust

### 6. Social proof — after the effort
**Purpose:** The test is the highest-effort moment in the funnel. A trust beat right after it, before the email ask, answers "is this site legit?"
**Headline A:** {{tests_taken}} tests taken
**Headline B:** Rated {{review_rating}} by test-takers
**Body A:** People use TestLibrary to understand how they think.
**Body B:** Real reviews from people who took this test.
**Visual:** Large navy number on white, star row beneath, one quote card with a reviewer first name + country, and the review-platform logo only if that platform allows its use.
**Microcopy:** Quote card (use a real, current review; the ones below are verbatim from TestLibrary's public Trustpilot page, 2026-09-28): ★★★★★ "The questions were easy to answer and were relatable." Numbers: `{{tests_taken}}` = real count from analytics; `{{review_rating}}` = live platform rating (Trustpilot showed 4.1 / 30,074 reviews at fetch time). Never import Testora's "30M+" or anyone else's figure.
**CTA:** See my results

---

## D. Anticipation

### 7. Scoring
**Purpose:** Make the score feel computed from *their* answers (because it is) and build the wait that makes the report feel worth unlocking.
**Headline A:** Scoring your answers…
**Headline B:** Building your IQ report…
**Steps:**
1. Checking your 38 answers…
2. Comparing with your age group…
3. Mapping strengths by section…
4. Preparing your certificate, almost ready…
**Visual:** The bell curve from the lander draws itself left to right in navy, and a faint marker pulses under it without settling on a number. Four progress rows beneath, each with a % counter, a bar and a check when done.
**Microcopy:** Under the headline: "Scored from your answers only." Rotating quote card (real reviews only), 2-3 cards.
**CTA:** (auto-advances, ~6-8 seconds)

---

## E. Gate

### 8. Email gate
**Purpose:** Capture identity while curiosity peaks. A web purchase also needs an account the report is saved to (the site keeps reports on a dashboard).
**Headline A:** Your results are ready
**Headline B:** Where should we save them?
**Body A:** Enter your email to save your report.
**Body B:** Your report lives in your account, anytime.
**Field:** Email input, keyboard type `email`, autofocus. Optional "Continue with Google / Apple" above it.
**Visual:** A small free summary card sits above the field, showing only computed values: "Completed in {{completion_time}}" · "{{answered}}/38 answered" · "Strongest section: {{strongest_section}}". The score line below it is blurred.
**Error state:** "Please enter a valid email."
**Microcopy:** Under the CTA: "No spam. We never sell your email." + Terms · Privacy. No pricing or consent is bundled into this click. Agreeing to terms here must not enroll anyone in anything.
**CTA:** Save my results

### 9. Name for the certificate
**Purpose:** Personalizes the report and certificate preview on the next screen, so the paywall sells *their* document.
**Headline A:** What's your first name?
**Headline B:** Whose name goes on it?
**Body A:** It appears on your report and certificate.
**Body B:** Printed exactly as you type it.
**Field:** Text input, max 30 chars, letters/spaces/hyphens, autofocus.
**Visual:** Plain input on white, a faint certificate outline behind it with the name line highlighted.
**Error state:** "Please enter your first name."
**CTA:** Continue

---

## D. Anticipation (tease)

### 10. Report preview
**Purpose:** Desire before price: show exactly what's inside the paid report, with their name on it, so the paywall reads as "unlock this" rather than "subscribe".
**Headline A:** {{name}}, your report is ready
**Headline B:** Here's what's inside, {{name}}
**Body A:** Your score, rank and strengths — one tap away.
**Body B:** Everything below unlocks with your full report.
**Visual:** Stacked preview on white. (1) Bell curve with a blurred marker and "IQ ··" blurred. (2) A section-bars card: Patterns / Numbers / Words / Shapes, bars visible but values blurred, {{strongest_section}} labeled as the only clear bar. (3) Certificate thumbnail with `{{name}}` and today's date, and the score field blurred.
**Microcopy:** Benefit rows: "📈 Your estimated IQ score" · "👥 How you compare by age" · "🧩 Strengths in 4 sections" · "📜 Named certificate (PDF)" · "💡 Tips for {{goal}}". The certificate row stays only if the certificate ships (verify).
**CTA:** Unlock my report

---

## F. Monetization

### 11. Paywall
**Purpose:** The ask, with two honest paths: buy this one report outright, or get the whole library. The renewal terms are visible on the card itself, before any tap.
**Headline A:** Unlock your full report
**Headline B:** {{name}}, see your score
**Body A:** One report, or every test in the library.
**Body B:** Choose one report or full library access.
**Plans:** (prices as listed on testlibrary.com/pricing, fetched 2026-09-28; re-confirm before launch)
- **One-time report — $57.00.** "This test's full report. No subscription."
- **7-day Full Access — $1.95 today, then $39.95 every 4 weeks.** Pre-selected, badge "ALL 27 TESTS". The renewal line is printed on the card at the same size and color as "$1.95", never in the fine print only.
- **28-day Full Access — $39.95, renews at $39.95 every 4 weeks.**
- Lifetime: the site's FAQ describes a one-time Lifetime plan (all tests, no recurring fee), but it isn't on `/pricing` today. If it is re-offered, add it as a fourth card with its real price. It's the cleanest non-recurring library option.
**Visual:** Light page. Report-preview strip at the top (from screen 10), three stacked plan cards with radio circles (selected = navy border + filled radio), each card showing "today" and "then" prices in two equal-weight lines. Full-width navy CTA, payment logos, a "What's included" checklist, 1 review card, and an FAQ accordion (How is my score calculated? · What does the trial include? · When will I be charged? · How do I cancel?).
**Microcopy:**
- Directly above the CTA, changing with the selected plan: "Today: $1.95. On {{renewal_date}}: $39.95, then every 4 weeks until you cancel." / "One payment of $57.00. Nothing renews."
- Trust row: "Secure checkout · Cancel anytime in your account · 2-click cancel at testlibrary.com/cancel-sub"
- Reminder promise, only if actually sent: "We'll email you 2 days before your trial ends."
- Disclaimer: "For self-discovery only. Not a clinical or diagnostic assessment."
- Headline B variant by goal: School/job prep → "Your prep report is ready"; Compare with friends → "Get your shareable certificate".
**Fallback offer:** Screen 12. The close X (and any back/exit) goes to the last-chance offer first, once per session. After it is declined, closing the paywall returns to the report preview (10).
**CTA:** Continue to checkout

### 12. Last-chance offer (on paywall close)
**Purpose:** Second chance for users who closed the paywall, most often because they don't want a subscription. It replaces the earlier "Just want this report?" bottom sheet: same idea (this one report, nothing renews), now its own screen. Shown once per session (sessionStorage `ikf_offer_testlibrary`), then never again.
**Headline A:** {{name}}, just want your IQ report?
**Body A:** All 38 answers are scored and {{strongest_section}} is your strongest section. Get this one report, with no subscription.
**Plans:** One offer card: {{offer_name}} (default "This IQ report only": this test's full report, one payment, nothing renews). {{offer_price}} today. The One-time report's real price ($57.00) is struck **only** if {{offer_price}} is a real, lower single-report price that checkout charges. If the offer is the One-time report at its listed $57.00, nothing is struck (no fake markdown). Alternative the app may configure instead: a library trial at its listed price with its renewal line (the consent box on 13 then applies). Optional {{offer_badge}}.
**Visual:** Light "exam paper" page in the paywall's style: wordmark + close X, centered eyebrow "One-time offer · shown once", then one navy-bordered offer card with the named mini-certificate thumbnail (score blurred), the price row, 3 checks (IQ score + age comparison · strengths in 4 sections · named certificate PDF), the CTA, payment badges and the renewal line "One payment of {{offer_price}}. Nothing renews, so there's nothing to cancel."
**Microcopy:** No timer by default, as the brief promises no timers. A timer appears only if `CONFIG.offer.expiresMin` is set to a real deadline; when it ends the offer is withdrawn (event `offer_expired`) and the user returns to the preview. Decline link: "No thanks, back to my free preview". Disclaimer: "For self-discovery only. Not a clinical or diagnostic assessment." Events: `offer_view`, `offer_accept` + `checkout_click` (plan `offer`), `offer_decline`, `offer_expired`. Offer CVR is measured separately from paywall CVR.
**CTA:** Claim my offer

### 13. Order summary + consent
**Purpose:** The anti-trap screen. It restates exactly what is charged today and later, with an unticked consent box, so nobody can say "I didn't know it renews" (the #1 complaint about this niche).
**Headline A:** Review your order
**Headline B:** Confirm your plan
**Body A:** Here's exactly what you pay, today and later.
**Body B:** Check the details before you pay.
**Field:** Summary card (plan name, today's charge, next charge date + amount + interval, "Cancel anytime before {{renewal_date}} to pay nothing more"). Below it a **consent checkbox, unticked by default**: "I understand my plan renews at $39.95 every 4 weeks until I cancel." It's required for recurring plans and hidden for One-time. Then the card / Apple Pay / Google Pay fields.
**Visual:** White summary card with two rows, "Today" and "{{renewal_date}}", in equal type. Checkbox + label in body size directly above the pay button. Payment fields below.
**Error state:** "Please tick the box to confirm renewal terms." · "Card declined. Try another card or PayPal."
**Microcopy:** "Receipt with cancel link sent to {{email}}." · The subscription policy says fees are generally non-refundable once access starts. Show that line here in plain words, together with any refund window that actually exists.
**CTA:** Pay and see score

---

## G. Payoff

### 14. Your IQ result
**Purpose:** Deliver the score honestly and clearly, including for below-average results, so the purchase feels justified and the refund/chargeback risk stays low.
**Headline A:** Your estimated IQ: {{score}}
**Headline B:** {{name}}, you scored {{score}}
**Body A:** Higher than {{percentile}}% of people your age.
**Body B:** Here's how you compare, and where you shine.
**Visual:** Bell curve (mean 100) with the marker gliding to `{{score}}` and the shaded area = `{{percentile}}`. Beneath it, the four section bars with real values, the strongest one highlighted. Then an age-group chip "{{age_band}}". Tap a bar → one-line tooltip explaining that section.
**Microcopy:**
- Band label, computed: "Above average" / "Average" / "Below average" with a supportive line for each (e.g. average: "Right where most people land — and it's trainable.").
- Method line, always visible: "Estimated from 38 reasoning items, compared with {{norm_group}}. Not a clinical IQ assessment."
- Goal tip card: 2 tips for `{{goal}}`.
**CTA:** Get my certificate

### 15. Certificate + share
**Purpose:** Hand over the artifact and turn the peak moment into shares (organic reach for a web funnel).
**Headline A:** Your certificate is ready
**Headline B:** Share your score, {{name}}
**Body A:** Download a PDF or share a card with friends.
**Body B:** Proudly yours — download it or share it.
**Visual:** Certificate mockup (name, score, date, test name, a TestLibrary seal that is not a fake institutional one), Download PDF button, share row (WhatsApp, Instagram story card, copy link).
**Microcopy:** Share card text: "I scored {{score}} on the TestLibrary IQ test. Your turn?" Certificate footer: "For personal use. Not an official or clinical certification." Show this screen only if the certificate ships (verify).
**CTA:** Download PDF

### 16. Your next test
**Purpose:** Second layer. Trial users see what else their plan includes, so they actually use what they pay for. One-time buyers get a clearly priced path to the library.
**Headline A:** What's next, {{name}}?
**Headline B:** Your mind, from new angles
**Body A:** Your plan includes every test below — start any.
**Body B:** Pair your IQ with how you feel and relate.
**Visual:** Horizontal cards from the real library, ordered by `{{goal}}`: School/job prep → Career Test, Strengths Finder, DISC. Curiosity → Big Five, 16 Personalities, Enneagram. Keep sharp → EQ Test, Mental Age. Compare with friends → Love Style, Attachment Style, Spirit Animal. Each card shows question count + minutes.
**Microcopy:**
- Trial users: "Included until {{renewal_date}} · Manage plan" (link to account/cancel).
- One-time buyers: "Unlock all tests — $1.95 for 7 days, then $39.95 every 4 weeks." Same consent screen (13) applies.
- Account line: "Log in anytime with {{email}}. Your report stays in your dashboard."
**CTA:** Start next test

---

## Notes

**Competitor mechanic, recorded for reference only (do NOT implement).** The dominant monetization in web IQ/personality funnels is a lead-magnet: a long free test, then "pay $1-2 to see your result", and that click silently enrolls the user in a 4-weekly subscription (~$30-55) that shows up weeks later. TestLibrary's own pricing is $1.95 for 7 days, then $39.95 every 4 weeks. Its public Trustpilot page (4.1 / 30,074 reviews) and 2026 review sites (thinkitsascam.com, sensorstechforum.com) are full of "Didn't know it cost $ until it was over" and "hidden monthly subscription". The worst versions pair it with fake mid-test rankings (Testora shows "faster than 93%" after 5 questions), a resetting 09:59 timer, fake "Oliver just scored 93" tickers and Einstein comparisons. That's deceptive-pricing exposure under the FTC's negative-option rules, the same mechanic named in the 2026 Nebula/Obrio action (see personalization-quiz.md Traps). This brief keeps the trial *plan* because it is the real product structure. It removes the *trap*: disclosure on screens 1-2, the renewal price on the plan card, an unticked consent box (13), the reminder email, an honest one-time alternative, and no timers.

**Honesty rules for the result.** The score is computed from the correct answers against a stated norm table (`{{norm_group}}`). If there's no real norming data, call it "estimated score" and say what it's compared against. No percentile or flattery during the test. Every band exists and gets shown, including below average. No Einstein/celebrity scale. No "certified"/"official" claims. The live site already says its tests are "for personal discovery and educational purposes only… not… clinical diagnosis". Keep that line on screens 11, 12, 14 and 15.

**Changes vs. the live TestLibrary lander:**
| Screen | Live today | Change |
|---|---|---|
| 1 | "Select your gender to begin" | Age band. Age is what the comparison actually uses; gender implies a gender-scored IQ, which the report shouldn't do. Personality tests with gendered norms can keep gender |
| 1-2 | "5-minute test" vs. 38 Qs / 20 mins in `/library` | One real duration everywhere |
| 1 | No price hint until the end | "Free to take · Full report is a paid unlock" |
| 11, 13 | Renewal terms on checkout / policy page | On the plan card + unticked consent box |

**Blocks skipped:** no notification opt-in (web, no daily loop), no gamified wheel (cheapens a "measure my mind" promise), no post-purchase countdown upsell (the library cross-sell on 16 does that job without urgency), no before/after (this is not an outcome app). Education level (Testora asks it) is skipped because nothing in the report uses it.

**Reusing this for other tests in the library:** screens 1-3 and 6-16 carry over. Screen 4 becomes a Likert statement ("I enjoy meeting new people" → 5-point agree scale) for personality tests, and "correct answer" copy is dropped. Screen 14 becomes a profile (type + trait bars) instead of a score. For ADHD/autism/mood trait quizzes, add a visible "not a diagnosis, talk to a professional" line on screens 1, 14, and a support link. Those tests need extra review before any paid ads run.

**Drop-off risk:** (1) screen 4, the 38-question body, where mid-test abandonment happens (measure completion per section); (2) screen 8, the email ask; (3) screen 13, where the consent box *will* cost some conversion versus the trap version. That is the point, and it should be offset by lower refunds and chargebacks.

**Monetization, two layers, measured separately:** (1) screen 11-13 conversion, split by plan (one-time vs trial), with the last-chance offer (12) CVR tracked on its own; (2) trial → first renewal rate and **refund/chargeback rate**, the true health metric here; (3) library engagement from screen 15 (tests started per trial user), the leading indicator of renewal.

**First A/B tests:** email gate before the preview (this brief) vs. after; paywall default One-time vs. Trial pre-selected (both fully disclosed); screen 1 disclosure wording A vs. B, never with vs. without.
