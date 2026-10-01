---
niche: testlibrary-autism-traits
display_name: TestLibrary - Adult traits self-check (health, web)
archetype: assessment-unlock
subject: person
input: age band, reason for checking, 30 agree/disagree statements, email, first name
output: a five-area trait profile (social, sensory, routine, detail, communication) with no condition label, plus a locked report with everyday ideas and a "how to talk to a professional" guide
screens: 16
monetization: web checkout - one-time profile report OR full-library access (disclosed paid trial then 4-weekly renewal); support page and library cross-sell after the result
creative_screens:
  hook-a: 1
  hook-b: 2
  hook-c: 4
  reveal: 10
  result: 14
motion: >
  five calm trait bars filling one by one while five soft icon tiles turn over,
  then the profile card lifting out of a blurred stack
---

# Funnel Content - TestLibrary (Adult traits self-check)

This is the health-adjacent reskin of the TestLibrary flagship in `testlibrary/funnel-content.md` and the sibling `testlibrary/personality-mbti/`. The user gives an age band, a reason and 30 agree/disagree statements about everyday experience. They get a profile across five areas (social, sensory, routine, detail, communication) as plain "lighter / mixed / stronger" bands. They get **no condition label and no score cut-off**. The paid report adds where each area shows up day to day, everyday ideas, and a guide to talking to a professional. Archetype: **assessment-unlock** (followed as-is, plus the health guardrails below). 16 screens. Screens 4 and 5 are templates that repeat (30 statements, 3 checkpoints).

**Reference funnels:** Testora's IQ-and-autism funnel (46 steps, see `testlibrary.md` §6-7 and `testlibrary-captures.md` §1, adspylab captures) and TestLibrary's own brand and lander pattern (`testlibrary.md`, fetched 2026-09-28). **Deliberately different:** 30 statements, not 46 steps; honest checkpoints with no flattery and no percentile; a "this is not a diagnosis" screen *before* the first sensitive statement; no total score and no "likely / unlikely" verdict; the renewal price sits beside every trial price; nothing is billed silently; a support route is on every screen. **Policy posture (high risk, Meta health rules):** ad copy and creative must never imply a personal attribute ("Are you autistic?", "You might be on the spectrum"). Lead with curiosity and self-knowledge ("Understand how you experience the world"). The default landing headline stays neutral; the topic-naming variant is organic/search only. The result never names a condition, never says "you have", and never ranks the user against a cut-off. **Look:** the light "exam paper" look of the sibling brief (white, ink navy, one amber accent), calmer and with more air; paywall is a long-scroll web page.

**Health guardrails (apply to every screen):**
- A persistent **"Need help now?"** link on every screen opens a support sheet: "In danger now? Call your local emergency number. Call or text 988 (US) · Outside the US: findahelpline.com. A doctor or GP can also help." One tap, no sign-in, never paywalled.
- **"Not a diagnosis"** is stated on the landing (1), expectations (2), preview (10), paywall (11), offer (12), result (14) and talking points (15).
- No medical claims, no advice to start, stop or change any treatment.

---

## A. Hook

### 1. Lander - Self-check
**Purpose:** Cold traffic arrives wanting to understand itself. The first tap is cheap (age band), and the page says honestly what the check is, what it is not, and what is free.
**Headline A:** Understand your own traits
**Headline B:** Adult autism traits self-check
**Body A:** Pick your age to start. Free to take.
**Body B:** 30 statements. Not a diagnosis. About 6 minutes.
**Options:**
- 🌱 18-24
- 🚀 25-34
- 🧭 35-44
- 🌿 45-59
- 🦉 60+
**Field:** Single select, auto-advance on tap. Under-18: "You must be 18 or older to take this check."
**Visual:** White page, wordmark top-left. Hero: five soft paper tiles in a row with thin bars beneath, half filled, in navy and one amber accent, a pencil beside them. Age pills stacked full-width beneath. Footer links (Cancel subscription · Subscription policy · FAQ · Terms · Privacy) and a "Need help now?" link in a strip along the bottom.
**Microcopy:** **Variant use:** A (the default) is the only variant for paid traffic and ads. B names the topic and is for organic and search landings only. Directly under the pills: "Free to take · Full report is a paid unlock". Under it: "A self-check, not a diagnosis. Independent, not clinical."
**CTA:** (auto-advances on select)

### 2. What this is, and isn't
**Purpose:** The expectations screen before any sensitive question. It sets the frame (self-check, not therapy, not a diagnosis), the length and the pause-any-time promise, so people who start feel safe and finish.
**Headline A:** Before you begin
**Headline B:** What this check is
**Body A:** A self-check for reflection. Not a diagnosis or therapy.
**Body B:** Only a qualified clinician can diagnose anything.
**Visual:** Three icon rows: 🪞 "A self-check for reflection", 🩺 "Not a diagnosis, not medical advice", ⏱ "30 statements · about 6 minutes · pause any time". Beneath, five chips for the five areas covered: Social · Sensory · Routine · Detail · Communication. A soft notice card: "If any statement feels hard, skip ahead or stop. Your answers are saved."
**Microcopy:** "6 minutes" is an estimate for 30 statements; replace with the real median once measured. Under the CTA: "Free to take · Full report is a paid unlock".
**CTA:** I understand, start

---

## B. Investment

### 3. Why are you checking?
**Purpose:** One cheap tap before the work. It tunes the paywall headline and which guide the report leads with. It asks for a reason, never for a suspected condition.
**Headline A:** What brings you here?
**Headline B:** What do you want to learn?
**Body A:** We'll focus your report on this.
**Body B:** Pick the one that fits best.
**Options:**
- 🔍 Curious about myself
- 💼 Work and study
- 💞 Relationships
- 🗣️ Prepare for a doctor visit
- ✏️ Other
**Field:** Single select, auto-advance. "✏️ Other" opens a one-line input (max 40 chars); the CTA stays disabled until it has text.
**Visual:** Same pill list as screen 1, a "Warm-up" hint at the top instead of a number.
**CTA:** (auto-advances on select)

### 4. Statement (template, ×30)
**Purpose:** The product itself. Each answer is effort the paid report pays back. The screen must feel calm, private and unhurried.
**Headline A:** I notice background sounds others ignore.
**Headline B:** Surprise changes can unsettle me.
**Body A:** Statement {{q_index}} of 30
**Body B:** How much does this fit you?
**Options:** Five-level scale, one tap each:
- 👎 Not me at all
- 🙁 Not really me
- 😐 Sometimes
- 🙂 Mostly me
- 👍 Very much me
**Field:** Single select, auto-advance after 350 ms. The headline slot holds the statement itself and changes every time (the two above are examples). Five areas interleaved, 6 statements each, about a third worded in the reverse direction. Back goes to the previous statement. Area names are never shown (they would prime answers).
**Visual:** White card with the statement in the serif face, large. Five stacked pills below (compact, 44 px). Thin three-segment progress bar at the top, honest to answered count. No timer, no percentile, no right-or-wrong feedback.
**Microcopy:** Tiny line under the pills: "No right or wrong answers. Skip back any time." "Need help now?" stays on the bottom strip.
**CTA:** (auto-advances on select)

### 5. Progress checkpoint (template, ×3)
**Purpose:** A breather so fatigue does not cause drop-off, using only true progress, with a gentle wellbeing note. Three checkpoints at 10, 20 and 27 answers.
**Headline A:** You're {{percent_done}}% through
**Headline B:** {{left_count}} statements to go
**Body A:** {{answered}} of 30 answered. Your answers are saved.
**Body B:** Take a breath, then keep going.
**Visual:** A segmented ring filled to the real percentage and the five area chips, with no result hinted. One honest tip per checkpoint.
**Microcopy:** Tips, true for everyone: "Tip: answer for most days, not your best or worst." · "Tip: it's fine to pause. Your answers stay saved." · "Tip: last few. Stop any time if it feels like too much."
**CTA:** Keep going

---

## C. Trust

### 6. How it's built - after the effort
**Purpose:** A trust beat right after the longest effort, before the email ask. It builds trust through honest method, not numbers. A real review is added only when one exists.
**Headline A:** How your check works
**Headline B:** How your answers are used
**Body A:** Statements in the style of public self-report checks.
**Body B:** Your results are almost ready.
**Visual:** Three short rows: "Scored from your answers only", "No total score, no verdict", "Not a clinical tool". Below, one review card with first name and country, or a dashed placeholder.
**Microcopy:** The review is a real, current review, or the card is omitted. No tests-taken number and no rating figure unless taken live from analytics or the platform. Never import another company's numbers. Wording "in the style of public self-report checks" is **unverified**: confirm with a clinical advisor before launch.
**CTA:** See my results

---

## D. Anticipation

### 7. Scoring
**Purpose:** Make the profile feel computed from their answers (because it is).
**Headline A:** Scoring your answers…
**Headline B:** Building your profile…
**Steps:**
1. Reading your 30 answers…
2. Weighing each of the 5 areas…
3. Finding your clearest areas…
4. Writing your profile, almost ready…
**Visual:** Five icon tiles turn over one by one as the bars complete (two on the last step), each with a % counter and a check, but only after the real scores are known. Rotating real review cards beneath.
**Microcopy:** "Scored from your answers only."
**CTA:** (auto-advances, ~6-8 seconds)

---

## E. Gate

### 8. Email gate
**Purpose:** Capture identity while curiosity peaks. The profile is saved to the account, not shared.
**Headline A:** Your results are ready
**Headline B:** Where should we save them?
**Body A:** Enter your email to save your profile.
**Body B:** Private to you, in your account.
**Field:** Email input, keyboard `email`, autofocus. Optional "Continue with Google / Apple" above it.
**Visual:** A free summary card above the field with computed facts only: "Completed in {{completion_time}}" · "30/30 answered" · "Clearest area: {{clearest_area}}". The profile line below is blurred.
**Error state:** "Please enter a valid email."
**Microcopy:** Under the CTA: "Private. We never sell your email." + Terms · Privacy. No price and no consent is bundled into this click.
**CTA:** Save my results

### 9. Name for your profile
**Purpose:** Personalizes the next screens so the paywall sells *their* profile. Skippable, because some people want privacy here.
**Headline A:** What's your first name?
**Headline B:** Whose profile is this?
**Body A:** It appears on your profile and notes.
**Body B:** Printed exactly as you type it.
**Field:** Text input, max 30 chars, letters/spaces/hyphens, autofocus. If skipped or empty, later screens say "you".
**Visual:** Plain input on white, a faint profile-card outline behind it with the name line highlighted.
**Error state:** "Please enter your first name."
**Skip link:** "Skip for now"
**CTA:** Continue

---

## D. Anticipation (tease)

### 10. Profile preview
**Purpose:** Desire before price: your clearest area is real and visible, the depth is behind the unlock. The preview names no condition.
**Headline A:** {{name}}, your profile is ready
**Headline B:** Meet your profile, {{name}}
**Body A:** Your clearest area is free. The rest is locked.
**Body B:** Everything blurred below unlocks with your report.
**Visual:** Stacked preview on white. (1) Five icon tiles, clear. (2) A trait card: five bars with the clearest one clear with its band word, the other four blurred. No percentages anywhere. (3) Three locked rows with lock icons. "Not a diagnosis" line right under the card.
**Microcopy:** Benefit rows: "🧭 Where each area shows up in daily life" · "💡 Everyday ideas for {{goal_phrase}}" · "🗣️ How to talk to a professional" · "📝 Notes to bring to a visit" · "📊 All 5 areas". Line under the card: "Bands only group your answers. Not a screening result, not a diagnosis."
**CTA:** Unlock my report

---

## F. Monetization

### 11. Paywall (long-scroll web page)
**Purpose:** The ask, with two honest paths: this one report, or the whole library. Renewal terms are visible on the plan itself before any tap. The support link and not-a-diagnosis line are on the page.
**Headline A:** Unlock your full report
**Headline B:** {{name}}, read your full profile
**Body A:** One report, or every test in the library.
**Body B:** Choose one report or full library access.
**Plans:** Prices are tokens; the structure is real.
- **One-time report - {{price_report}}.** "This profile's full report. Nothing renews."
- **1-week Full Access - {{price_trial}} today, then {{renewal_trial}} every 4 weeks.** Pre-selected, badge "ALL TESTS". The renewal line is printed on the card at the same size and color as the intro price.
- **4-week Full Access - {{price_4week}}, renews at {{renewal_4week}} every 4 weeks.**
Plan block repeats lower on the page, with the same selection.
**Visual:** One long scroll, web style, light page. In order: (1) brand bar with wordmark and a close X. (2) Personal hero with the five icon tiles and the clearest-area line, with the locked rows beneath. (3) Plan block with three stacked radio cards, "today" and "then" in two equal-weight lines, then the CTA. (4) What's inside: where each area shows up · everyday ideas · how to talk to a professional · notes to bring · all 5 areas · all tests (Full Access only). (5) How it works: 1 unlock · 2 read it in your account · 3 bring your notes to a professional if you choose. (6) Proof: a real review card and the rating, hidden while unset. (7) Guarantee: the refund window that really exists, hidden while unset. (8) FAQ accordion: Is this a diagnosis? · How is my profile decided? · When will I be charged? · How do I cancel? (9) The plan block again. (10) A support box: "Need help now?" with the support sheet link, and "Not a diagnosis". (11) Sticky bottom CTA that always shows today's charge and the renewal line.
**Microcopy:**
- Above the CTA, changing with the plan: "Today: {{price_trial}}. On {{renewal_date}}: {{renewal_trial}}, then every 4 weeks until you cancel." / "One payment of {{price_report}}. Nothing renews."
- Trust row: "Secure checkout · Cancel anytime in your account".
- Reminder promise, only if the reminder email is actually sent (`CONFIG.reminder`, default on): "We'll email you 2 days before your trial ends."
- Disclaimer: "A self-check for reflection. Not a diagnosis, not medical advice, not a clinical assessment. Talk to a qualified professional about any concerns."
- {{goal_phrase}} by reason: curious → "knowing yourself", work → "work and study", relationships → "your relationships", doctor visit → "your doctor visit", other → the user's own words in lower case. Headline B variant by reason: Prepare for a doctor visit → "Get your visit notes ready".
**Fallback offer:** Screen 12. The close X (and any back or exit) goes to the last-chance offer first, once per session. After it is declined, closing the paywall returns to the preview (10).
**CTA:** Continue to checkout

### 12. Last-chance offer (on close)
**Purpose:** A second chance for people who closed the paywall, most often because they don't want the full report or a subscription. It is a genuinely smaller product: one area in detail plus the talking guide, paid once, nothing renews. It is not the paywall's one-time report. Shown once per session (sessionStorage `ikf_offer_testlibrary-autism`), then never again.
**Headline A:** {{name}}, want a smaller option?
**Headline B:** Just one area in detail?
**Body A:** One area in detail, plus a guide for talking to a professional.
**Body B:** One payment. Nothing renews, nothing to cancel.
**Plans:** One offer card: {{offer_name}} (default "Clearest-area summary + talking guide": your single clearest area in detail, how it shows up day to day, and the how-to-talk-to-a-professional guide; one payment, nothing renews). {{offer_price}} today, lower than the one-time report. A struck-through price appears only if it is a real, lower price that checkout charges. Optional {{offer_badge}}. **Not included**, listed on the card: the other four areas in detail, everyday ideas, visit notes, library access.
**Visual:** Light page in the paywall's style: wordmark and close X, eyebrow "One-time offer · shown once", one navy-bordered offer card with the single clearest-area tile, the price row, 3 checks (clearest area in detail · how it shows up day to day · how to talk to a professional), a dashed "Not included" box, the CTA, payment badges and the line "One payment of {{offer_price}}. Nothing renews, so there's nothing to cancel." After purchase, screen 14 shows only the clearest area, the day-to-day note and the professional guide, with a "Not in your offer" note; visit notes (15) are skipped.
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
**Microcopy:** "Receipt with cancel link sent to {{email}}." Refund wording points to the Subscription policy; the paywall guarantee carries the real refund window. Billing descriptor is neutral and shows "TestLibrary", never a health term.
**CTA:** Pay and see profile

---

## G. Payoff

### 14. Your full profile
**Purpose:** Deliver the whole profile honestly and gently, so the purchase feels justified and refund risk stays low. No label, no verdict, no total score.
**Headline A:** Your trait profile
**Headline B:** {{name}}, here's your profile
**Body A:** Five areas, in plain words. Not a diagnosis.
**Body B:** Where each area shows up for you.
**Visual:** Five icon tiles, then five relative bars with a neutral label ("Shows up more for you" · "In between" · "Shows up less for you"), no percentages, and ends "Less" / "More". Three strengths as cards from the clearest areas. Then sections: Where it shows up day to day (two clearest areas) · Everyday ideas (one per clearest area) · **Talking to a professional**: 1 write down examples (notes sheet), 2 book with a GP or an adult-assessment clinician, 3 bring this profile and your questions; "Only a qualified clinician can say whether any condition applies. This check cannot." · A support box with the "Need help now?" sheet.
**Microcopy:** Method line, always visible: "Based on 30 statements you rated. Bands only group your answers. They are not a screening result, and not a condition." Disclaimer: "A self-check for reflection. Not a diagnosis, not medical advice." Every result is shown with the same warmth, including "Shows up less" across the board.
**CTA:** Get my visit notes

### 15. Talking points for a professional
**Purpose:** Hand over a useful, private artifact (not a social card: this topic is not for ad-style sharing). The notes help the user start a real conversation with a professional.
**Headline A:** Your visit notes are ready
**Headline B:** Bring this to a professional
**Body A:** Download your notes, or email them to yourself.
**Body B:** Private by default. Share only if you choose.
**Visual:** A notes page mockup: name, date, five mini bars, "Examples I noticed" with three blank lines, "Questions to ask" with three prompts ("What does an adult assessment involve?" · "How long is the wait?" · "What support exists meanwhile?"). Buttons: Download PDF, Email me a copy.
**Microcopy:** Footer: "For your own use. Not a clinical report, not a diagnosis." No share-to-social buttons by design.
**CTA:** Download PDF

### 16. Support and next steps
**Purpose:** Second layer plus care. Support first (where to get real help), then the library. Trial users see what else their plan includes; one-time buyers get a clearly priced path to the library.
**Headline A:** What's next, {{name}}?
**Headline B:** Support and next steps
**Body A:** Real help is one step away. Then explore more.
**Body B:** Pair your profile with other self-checks.
**Visual:** First a support card: "Talk to a professional" · "Need help now?" (opens the support sheet) · "Find a clinician near you". Then horizontal cards from the real library, ordered by reason: Work and study → Career Test, Strengths Finder, DISC. Relationships → Attachment Style, Love Style, EQ Test. Curious / Doctor visit → Big Five, EQ Test, Mental Age. Each card shows minutes.
**Microcopy:**
- Trial users: "Included until {{renewal_date}} · Manage plan".
- One-time buyers: "Unlock all tests - {{price_trial}} for 1 week, then {{renewal_trial}} every 4 weeks." The same consent screen (13) applies.
- Account line: "Log in anytime with {{email}}. Your report stays in your dashboard."
**CTA:** Start next test

---

## Notes

**Reused from the sibling briefs (not re-researched):** the whole monetization spine (trial plan with renewal on the card, unticked consent, reminder email, one-time alternative, last-chance offer, library cross-sell) from `testlibrary/funnel-content.md`. Changed: the test is 30 statements across five areas with three checkpoints; a "not a diagnosis" expectations screen sits before the first statement; the result is a trait profile with bands and no label; the certificate becomes private visit notes; there is no share-to-social screen; a support sheet is on every screen.

**Unverified (`[I]` in research for some steps of the 46-step reference):** the exact order and wording of Testora's autism flow, any in-flow disclaimers it shows, and its price ladder. Unverified in this brief: the "in the style of public self-report checks" wording, the 6-minute length, the statement bank (original wording, 6 per area, not clinically validated), the band thresholds (internal only, never shown: below 34% "shows up less", 34-66% "in between", 67% and up "shows up more"; chosen for plain-language grouping) and the support wording. **A clinical or compliance reviewer must read every screen before launch.**

**Competitor mechanic, recorded only (do NOT implement).** Personality and brain-health funnels in this niche pair a long test with "you're faster than 93%" flattery, a $1 "see your result" click that becomes a large 4-weekly charge, a resetting timer and fake live tickers, and ads that ask "Are you autistic?". None of it is copied. The renewal price is printed on the plan, the consent box is unticked, there are no timers, ads never imply a personal attribute, and a one-time option exists.

**Honesty rules for the result.** Bands come from the user's own answers: per area, the sum of fit scores (reverse-keyed items flipped) over the maximum, shown only as a relative bar and a neutral label. There is no cross-area total, no cut-off and no percentage on screen. Never say "autistic", "likely", "high risk", "screened positive", "certified", "validated" or "clinical". Never say "you have". Never advise starting, stopping or changing treatment. Not a diagnosis, on screens 1, 2, 10, 11, 12, 14 and 15. "Need help now?" on every screen.

**Blocks skipped:** no notification opt-in, no wheel, no countdown upsell, no before/after, no gender or education question, no share-to-social.

**Drop-off risk:** (1) screen 4, 30 statements (measure completion per checkpoint); (2) screen 2, the expectations screen (some people may leave, which is acceptable here); (3) screen 8, the email ask; (4) screen 13, where the consent box will cost some conversion. The aim is lower refunds, chargebacks and policy risk.

**Monetization, two layers, measured separately:** (1) screens 11-13 by plan (one-time vs trial), with the last-chance offer (12) CVR on its own; (2) trial to first renewal rate and refund/chargeback rate, the health metric; (3) library engagement from screen 16. Ad account policy review is a launch gate, not a metric.

**First A/B tests:** screen 2 before vs after screen 3; 30 vs 40 statements; email gate before the preview vs after; one-time vs trial pre-selected (both fully disclosed).

**Demo link:** https://claude.ai/artifact/CNxnyaxuyUhzKQ98gSnSeJ (private; placeholder images copied from the personality-mbti sibling until gen_images.py runs with IKAME_AI_KEY)
