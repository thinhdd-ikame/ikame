---
niche: testlibrary-personality-mbti
display_name: TestLibrary - 16-type personality test (web)
archetype: assessment-unlock
subject: person
input: age band, reason for testing, 40 agree/disagree statements, email, first name
output: 4-letter personality type with 4 trait percentages, 3 strengths, and a locked report (career fit, relationship style, growth plan)
screens: 16
monetization: web checkout - one-time profile report OR full-library access (disclosed paid trial then 4-weekly renewal); library cross-sell after the reveal
creative_screens:
  hook-a: 1
  hook-b: 2
  hook-c: 4
  reveal: 10
  result: 14
motion: >
  four trait bars filling one by one while four letters flip into place,
  then the type card lifting out of a blurred stack
---

# Funnel Content - TestLibrary (16-type personality test)

This is the personality-test reskin of the TestLibrary flagship in `testlibrary/funnel-content.md` (IQ). It follows that brief's "Reusing this for other tests" note: screens 1-3 and 6-16 carry over, screen 4 becomes a Likert statement and screen 14 becomes a profile. The user gives an age band, a reason, and 40 agree/disagree answers. They get a 4-letter type, four trait percentages and three strengths, and the paid report adds career fit, relationship style and a growth plan. Archetype: **assessment-unlock** (followed as-is). 16 screens. Screens 4 and 5 are templates that repeat (40 statements, 4 checkpoints).

**Reference funnels:** Testora's personality funnel (`ps1tp`, captured via adspylab, see `testlibrary.md` §1 and `testlibrary-captures.md`: 34 steps, 90 questions in 8 parts, mid-test flattery, email gate, a $1 to $39.95 paywall) and 64Personality (`testlibrary.md` §2). TestLibrary's own personality lander (`/personality-test`, fetched 2026-09-28) supplies the brand and the lander pattern. **Deliberately different:** 40 statements instead of 90 so fewer people quit midway; the result is four trait percentages, not a hard label; honest checkpoints with no flattery and no percentile ranking; the renewal price sits next to every trial price; and nothing is billed silently (the hidden $1 to $39.95 trap is not copied). **Naming:** this is a "16-type personality test". The trademarked name of the best-known test is never used on screen, in ads or in the file. The page says it is independent. **Look:** the light "exam paper" look of the IQ brief (white, ink navy, one amber accent), reusing its tokens and fonts; paywall is a long-scroll web page.

---

## A. Hook

### 1. Lander - Discover your type
**Purpose:** Cold traffic arrives curious about "what's my type". The first tap is cheap (age band), and the page says honestly what is free and what is paid.
**Headline A:** Discover your personality type
**Headline B:** Which of 16 types are you?
**Body A:** 40 quick statements. No right or wrong answers.
**Body B:** Pick your age to start. Takes about 8 minutes.
**Options:**
- 🌱 18-24
- 🚀 25-34
- 🧭 35-44
- 🌿 45-59
- 🦉 60+
**Field:** Single select, auto-advance on tap. Under-18: "You must be 18 or older to take this test."
**Visual:** White page, wordmark top-left. Hero: four large letter tiles ("? ? ? ?") over a soft paper background with four thin trait bars underneath, half filled. Age pills stacked full-width beneath, navy outline, navy fill on select. Footer links stay (Cancel subscription · Subscription policy · FAQ · Terms · Privacy).
**Microcopy:** Disclosure directly under the pills, same size as the body: "Free to take · Full report is a paid unlock". Under it: "Independent 16-type test. Not clinical."
**CTA:** (auto-advances on select)

### 2. How it works
**Purpose:** Set honest expectations (length, how to answer) so people who start finish.
**Headline A:** Before you begin
**Headline B:** Here's how it works
**Body A:** Answer how you usually are, not how you wish to be.
**Body B:** Go with your first instinct. Progress saves as you go.
**Visual:** Three icon rows: 🧩 "40 statements · 5-point scale", ⏱ "About 8 minutes", 🔓 "Free to take, report is paid". Beneath, four chips for the four things measured: Energy · Information · Decisions · Lifestyle.
**Microcopy:** "8 minutes" is an estimate for 40 statements; replace with the real median once measured. Under the CTA: "Free to take · Full report is a paid unlock".
**CTA:** Start the test

---

## B. Investment

### 3. Why are you testing?
**Purpose:** One cheap tap before the work. It tunes the paywall headline and the report's focus (career, relationships, self).
**Headline A:** What brings you here?
**Headline B:** What do you want to learn?
**Body A:** We'll focus your report on this.
**Body B:** Pick the one that fits best.
**Options:**
- 💼 Career direction
- 💞 Relationships
- 🪞 Know myself better
- 🌱 Personal growth
- ✏️ Other
**Field:** Single select, auto-advance. "✏️ Other" opens a one-line input (max 40 chars); the CTA stays disabled until it has text.
**Visual:** Same pill list as screen 1, a "Warm-up" hint at the top instead of a number.
**CTA:** (auto-advances on select)

### 4. Statement (template, ×40)
**Purpose:** The product itself. Each answer is effort the paid report pays back. The screen must feel calm and fair, never rushed.
**Headline A:** I plan my week in advance.
**Headline B:** I like keeping my options open.
**Body A:** Statement {{q_index}} of 40
**Body B:** How much do you agree?
**Options:** Five-level agree scale, one tap each:
- 👎 Disagree a lot
- 🙁 Disagree
- 😐 Neutral
- 🙂 Agree
- 👍 Agree a lot
**Field:** Single select, auto-advance after 350 ms. The headline slot holds the statement itself and changes every time (the two above are examples). Statements are interleaved across the four axes, about half worded in each direction. Back goes to the previous statement. Statements cover Energy (E/I), Information (S/N), Decisions (T/F) and Lifestyle (J/P), 10 each.
**Visual:** White card with the statement in the serif face, large. Five stacked pills below (compact, 44 px). Thin four-segment progress bar at the top, honest to answered count. No timer, no percentile, no "you're faster than". No right or wrong feedback.
**Microcopy:** Chip above the statement: "{{axis_name}}" is never shown (it would prime answers). Tiny line under the pills: "No right or wrong answers".
**CTA:** (auto-advances on select)

### 5. Progress checkpoint (template, ×4)
**Purpose:** A breather so fatigue doesn't cause drop-off, using only true progress. Four checkpoints at 25%, 50%, 75% and 90%.
**Headline A:** You're {{percent_done}}% done
**Headline B:** {{left_count}} statements to go
**Body A:** {{answered}} of 40 answered. Your answers are saved.
**Body B:** Keep going with your first instinct.
**Visual:** A segmented ring filled to the real percentage and a small line list of the four things measured, with no result hinted. One honest tip per checkpoint.
**Microcopy:** Tips, true for everyone: "Tip: answer how you are at ease, not at work." · "Tip: skip the urge to be consistent." · "Tip: neutral is fine, but use it sparingly." · "Tip: last few. Trust your first instinct."
**CTA:** Keep going

---

## C. Trust

### 6. Social proof - after the effort
**Purpose:** A trust beat right after the longest effort, before the email ask. No count is claimed, only real reviews.
**Headline A:** See what test-takers say
**Headline B:** Real reviews, real people
**Body A:** Reviews from people who took a TestLibrary test.
**Body B:** Your results are almost ready.
**Visual:** Star row and one review card with first name and country. A review-platform logo only if that platform allows it.
**Microcopy:** The review is a real, current review, or the card is omitted. No tests-taken number and no rating figure unless taken live from analytics or the platform. Never import another company's numbers.
**CTA:** See my results

---

## D. Anticipation

### 7. Scoring
**Purpose:** Make the profile feel computed from their answers (because it is).
**Headline A:** Scoring your answers…
**Headline B:** Building your profile…
**Steps:**
1. Reading your 40 answers…
2. Weighing each of the 4 traits…
3. Matching you to one of 16 types…
4. Writing your profile, almost ready…
**Visual:** Four trait bars fill one by one, each with a % counter and a check; four letter tiles flip on their own as each bar completes, but only after the real scores are known. Rotating real review cards beneath.
**Microcopy:** "Scored from your answers only."
**CTA:** (auto-advances, ~6-8 seconds)

---

## E. Gate

### 8. Email gate
**Purpose:** Capture identity while curiosity peaks. The profile is saved to the account.
**Headline A:** Your results are ready
**Headline B:** Where should we save them?
**Body A:** Enter your email to save your profile.
**Body B:** Your profile lives in your account, anytime.
**Field:** Email input, keyboard `email`, autofocus. Optional "Continue with Google / Apple" above it.
**Visual:** A free summary card above the field with computed facts only: "Completed in {{completion_time}}" · "40/40 answered" · "Clearest trait: {{clearest_trait}}". The type line below is blurred.
**Error state:** "Please enter a valid email."
**Microcopy:** Under the CTA: "No spam. We never sell your email." + Terms · Privacy. No price and no consent is bundled into this click; agreeing to terms here enrolls nobody in anything.
**CTA:** Save my results

### 9. Name for your profile
**Purpose:** Personalizes the next screens so the paywall sells *their* profile.
**Headline A:** What's your first name?
**Headline B:** Whose profile is this?
**Body A:** It appears on your profile and share card.
**Body B:** Printed exactly as you type it.
**Field:** Text input, max 30 chars, letters/spaces/hyphens, autofocus. If skipped or empty, later screens say "you".
**Visual:** Plain input on white, a faint profile-card outline behind it with the name line highlighted.
**Error state:** "Please enter your first name."
**CTA:** Continue

---

## D. Anticipation (tease)

### 10. Profile preview
**Purpose:** Desire before price: your type is real and visible, the depth is behind the unlock.
**Headline A:** {{name}}, your type is ready
**Headline B:** Meet your type, {{name}}
**Body A:** Your four letters are free. The full report is locked.
**Body B:** Everything blurred below unlocks with your report.
**Visual:** Stacked preview on white. (1) The four type letters, clear, large, with the type nickname. (2) A trait card: four bars with the first one (Energy) clear with its real % and the other three blurred. (3) Three locked rows with lock icons: Career fit · Relationship style · Growth plan. The three strengths show as one clear line each.
**Microcopy:** Benefit rows: "🧭 Career fit for {{goal}}" · "💞 Your relationship style" · "🌱 Your growth plan" · "📊 All 4 trait percentages" · "🧩 Full type profile". Line under the type: "Based on your answers. Not clinical."
**CTA:** Unlock my report

---

## F. Monetization

### 11. Paywall (long-scroll web page)
**Purpose:** The ask, with two honest paths: this one report, or the whole library. Renewal terms are visible on the plan itself before any tap.
**Headline A:** Unlock your full report
**Headline B:** {{name}}, read your full profile
**Body A:** One report, or every test in the library.
**Body B:** Choose one report or full library access.
**Plans:** Prices are tokens; the structure is real.
- **One-time report - {{price_report}}.** "This profile's full report. Nothing renews."
- **1-week Full Access - {{price_trial}} today, then {{renewal_trial}} every 4 weeks.** Pre-selected, badge "ALL TESTS". The renewal line is printed on the card at the same size and color as the intro price.
- **4-week Full Access - {{price_4week}}, renews at {{renewal_4week}} every 4 weeks.**
Plan block repeats lower on the page, with the same selection.
**Visual:** One long scroll, web style, light page. In order: (1) brand bar with wordmark and a close X. (2) Personal hero with the four letters, the nickname and the first strength, with the locked rows beneath. (3) Plan block with three stacked radio cards, "today" and "then" in two equal-weight lines, then the CTA. (4) What's inside: Career fit · Relationship style · Growth plan · all 4 trait percentages · all tests (Full Access only). (5) How it works: 1 unlock · 2 read it in your account · 3 take the next test. (6) Proof: a real review card and the rating. (7) Guarantee: the refund window that really exists, in plain words. (8) FAQ accordion: How is my type decided? · What does the trial include? · When will I be charged? · How do I cancel? (9) The plan block again. (10) Sticky bottom CTA that always shows today's charge and the renewal line.
**Microcopy:**
- Above the CTA, changing with the plan: "Today: {{price_trial}}. On {{renewal_date}}: {{renewal_trial}}, then every 4 weeks until you cancel." / "One payment of {{price_report}}. Nothing renews."
- Trust row: "Secure checkout · Cancel anytime in your account · 2-click cancel".
- Reminder promise, only if the reminder email is actually sent (`CONFIG.reminder`, default on): "We'll email you 2 days before your trial ends."
- Disclaimer: "For self-discovery only. Independent 16-type test. Not a clinical or diagnostic assessment."
- Headline B variant by reason: Career → "Your career-fit report is ready"; Relationships → "Read your relationship style".
**Fallback offer:** Screen 12. The close X (and any back or exit) goes to the last-chance offer first, once per session. After it is declined, closing the paywall returns to the preview (10).
**CTA:** Continue to checkout

### 12. Last-chance offer (on close)
**Purpose:** A second chance for people who closed the paywall, most often because they don't want a subscription. It is the one-time report, nothing renews. Shown once per session (sessionStorage `ikf_offer_testlibrary-personality`), then never again.
**Headline A:** {{name}}, just want your report?
**Headline B:** Want only this report?
**Body A:** Your type is scored. Get this one report, no subscription.
**Body B:** One payment. Nothing renews, nothing to cancel.
**Plans:** One offer card: {{offer_name}} (default "This profile report only": one payment, nothing renews). {{offer_price}} today. A struck-through price appears only if it is a real, lower price that checkout charges; if the offer is the one-time report at its listed price, nothing is struck. Optional {{offer_badge}}.
**Visual:** Light page in the paywall's style: wordmark and close X, eyebrow "One-time offer · shown once", one navy-bordered offer card with a mini profile card (letters clear, report blurred), the price row, 3 checks (career fit · relationship style · growth plan), the CTA, payment badges and the line "One payment of {{offer_price}}. Nothing renews, so there's nothing to cancel."
**Microcopy:** No timer by default. A timer appears only if `CONFIG.offer.expiresMin` is set to a real deadline; when it ends the offer is withdrawn (`offer_expired`) and the user returns to the preview. Decline link: "No thanks, back to my free preview". Disclaimer as on the paywall. Events: `offer_view`, `offer_accept` + `checkout_click` (plan `offer`), `offer_decline`, `offer_expired`. Offer CVR is measured separately.
**CTA:** Claim my offer

### 13. Order summary + consent
**Purpose:** The anti-trap screen. It restates what is charged today and later, with an unticked consent box.
**Headline A:** Review your order
**Headline B:** Confirm your plan
**Body A:** Here's exactly what you pay, today and later.
**Body B:** Check the details before you pay.
**Field:** Summary card (plan, today's charge, next charge date, amount and interval, "Cancel anytime before {{renewal_date}} to pay nothing more"). Below it a **consent checkbox, unticked by default**: "I understand my plan renews at {{renewal_trial}} every 4 weeks until I cancel." Required for recurring plans, hidden for One-time. Then card / Apple Pay / Google Pay.
**Visual:** White summary card with two rows, "Today" and "{{renewal_date}}", in equal type. Checkbox and label at body size right above the pay button.
**Error state:** "Please tick the box to confirm renewal terms." · "Card declined. Try another card or PayPal."
**Microcopy:** "Receipt with cancel link sent to {{email}}." Refund wording points to the Subscription policy; the paywall guarantee carries the real refund window.
**CTA:** Pay and see profile

---

## G. Payoff

### 14. Your full profile
**Purpose:** Deliver the whole profile honestly, so the purchase feels justified and refund risk stays low.
**Headline A:** You're {{type_code}}
**Headline B:** {{name}}, you're {{type_code}}
**Body A:** {{type_nickname}}. Here's your full profile.
**Body B:** Your traits, strengths and next steps.
**Visual:** Four big letter tiles with the nickname, then four trait bars with real percentages and their pole labels (e.g. Introverted 68%). Three strengths as cards, picked from the clearest traits. Then three unlocked sections: Career fit (4 fields to explore) · Relationship style · Growth plan (one habit per week for 3 weeks, built from the least clear trait).
**Microcopy:** Method line, always visible: "Based on 40 statements you rated. A trait near 50% means you use both sides." Disclaimer: "For self-discovery only. Independent 16-type test. Not clinical." Every result is shown with the same warmth, including balanced ones.
**CTA:** Get my profile card

### 15. Profile card + share
**Purpose:** Hand over the artifact and turn the peak moment into shares.
**Headline A:** Your profile card is ready
**Headline B:** Share your type, {{name}}
**Body A:** Download a PDF or share a card with friends.
**Body B:** Proudly yours. Download it or share it.
**Visual:** Profile card mockup (name, four letters, nickname, four mini bars, date), Download PDF button, share row (WhatsApp, Instagram story card, copy link).
**Microcopy:** Share text: "I'm {{type_code}} on the TestLibrary 16-type test. Your turn?" Footer: "For personal use. Not an official or clinical result."
**CTA:** Download PDF

### 16. Your next test
**Purpose:** Second layer. Trial users see what else their plan includes; one-time buyers get a clearly priced path to the library.
**Headline A:** What's next, {{name}}?
**Headline B:** Your mind, from new angles
**Body A:** Your plan includes every test below. Start any.
**Body B:** Pair your type with how you feel and relate.
**Visual:** Horizontal cards from the real library, ordered by reason: Career → Career Test, Strengths Finder, DISC. Relationships → Love Style, Attachment Style, Enneagram. Know myself → Big Five, Enneagram, EQ Test. Growth → EQ Test, Mental Age, Strengths Finder. Each card shows question count and minutes.
**Microcopy:**
- Trial users: "Included until {{renewal_date}} · Manage plan".
- One-time buyers: "Unlock all tests - {{price_trial}} for 1 week, then {{renewal_trial}} every 4 weeks." The same consent screen (13) applies.
- Account line: "Log in anytime with {{email}}. Your report stays in your dashboard."
**CTA:** Start next test

---

## Notes

**Reused from the IQ brief (not re-researched):** screens 1-3 and 6-16 keep their jobs and the whole monetization spine (trial plan with renewal on the card, unticked consent, reminder email, one-time alternative, last-chance offer, library cross-sell). Changed: age band stays but gender is not asked; the certificate becomes a profile card; the "score" becomes a type and four percentages; screen 15 is a card, not a certificate. **Verify:** whether a profile card or PDF ships today; the real library question counts; the norm and scoring method (this brief assumes a simple sum of agree answers per axis, with no population norms, so say "based on your answers", not "compared with people").

**Competitor mechanic, recorded only (do NOT implement).** Personality funnels in this niche pair a 90-question test, "you're faster than 93%" style flattery, a $1 "see your type" click that becomes $39.95 every 4 weeks, a resetting timer and fake live tickers. None of it is copied. The renewal price is printed on the plan, the consent box is unticked, there are no timers, and a one-time option exists.

**Honesty rules for the result.** The type is computed from the user's own answers: per axis, the sum of agree scores toward each pole. A tie shows as "balanced". Percentages describe preference strength, not a norm. Never say "scientifically proven", "certified" or "official". Never name the trademarked test. Show every type with equal warmth. Not a clinical or diagnostic assessment, on screens 11, 12, 14 and 15.

**Blocks skipped:** no notification opt-in, no wheel, no countdown upsell, no before/after, no education or gender question.

**Drop-off risk:** (1) screen 4, the 40 statements (measure completion per checkpoint, compare against the 90-question competitor); (2) screen 8, the email ask; (3) screen 13, where the consent box will cost some conversion. The point is lower refunds and chargebacks.

**Monetization, two layers, measured separately:** (1) screens 11-13 by plan (one-time vs trial), with the last-chance offer (12) CVR on its own; (2) trial to first renewal rate and refund/chargeback rate, the health metric; (3) library engagement from screen 16.

**First A/B tests:** 40 vs 60 statements; email gate before the preview vs after; paywall default one-time vs trial pre-selected (both fully disclosed); clear one trait bar vs clear letters only in the teaser.

**Demo link:** https://claude.ai/artifact/Y49RzD81kzepXkY1tmwfD7 (private; placeholder images until gen_images.py runs with IKAME_AI_KEY)
