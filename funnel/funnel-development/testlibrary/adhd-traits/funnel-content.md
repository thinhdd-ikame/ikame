---
niche: testlibrary-adhd-traits
display_name: TestLibrary - Adult focus traits self-check (health, web)
archetype: assessment-unlock
subject: person
input: age band, reason for checking, 18 frequency statements, email, first name
output: a three-area focus profile (attention, impulsivity, restlessness) with no condition label, plus a locked report with everyday ideas and a "talking to a professional" guide
screens: 16
monetization: web checkout - one-time profile report OR full-library access (disclosed paid trial then 4-weekly renewal); smaller one-area last-chance offer; support page and library cross-sell after the result
creative_screens:
  hook-a: 1
  hook-b: 2
  hook-c: 4
  reveal: 10
  result: 14
motion: >
  three calm focus bars filling one by one while three soft icon tiles turn over,
  then the profile card lifting out of a blurred stack
---

# Funnel Content - TestLibrary (Adult focus traits self-check)

This is the ADHD-adjacent reskin of the TestLibrary flagship in `testlibrary/funnel-content.md`, built on the shape of the sibling `testlibrary/autism-traits/` and `testlibrary/personality-mbti/`. The user gives an age band, a reason and 18 short statements about how often something happens in everyday life (a frequency format, in the spirit of public adult self-report checks, with original wording). They get a profile across three areas (attention, impulsivity, restlessness) as plain relative bars grouped into neutral bands. They get **no condition label, no score cut-off and no percentage**. The paid report adds where each area shows up day to day, everyday ideas, and a guide to talking to a professional. Archetype: **assessment-unlock** (followed as-is, plus the health guardrails below). 16 screens. Screens 4 and 5 are templates that repeat (18 statements, 2 checkpoints).

**Reference funnel:** testlibrary.com/adhd-test (1,155 ads; only the landing is verified, everything after it is inferred, see `gaps.md` section 1; captured 2026-09). **Deliberately different:** 18 statements, not a long test; a neutral landing headline instead of the condition label; honest checkpoints with no flattery and no percentile; a "this is not a diagnosis" screen *before* the first statement; no total score, no percentage and no "likely / unlikely" verdict; the renewal price sits beside every trial price; nothing is billed silently; a smaller one-area last-chance offer; a support route is on every screen. **Policy posture (high risk, Meta health rules):** ad copy and creative must never imply a personal attribute ("Do you have ADHD?", "Can't focus? You might have..."). Lead with curiosity ("Understand your focus style"). The default landing headline is neutral. **Headline B, which names the condition ("Adult ADHD traits self-check"), is for organic / search landings only and is never used on paid social traffic**; this split is a launch rule, not a test arm for ads. The result never names a condition, never says "you have", and never ranks the user against a cut-off. **Look:** the light "exam paper" look of the sibling briefs (white, ink navy, one amber accent), calm and with air; the paywall is a long-scroll web page.

**Health guardrails (apply to every screen):**
- A persistent **"Need help now?"** link on every screen opens a support sheet: "In danger now? Call your local emergency number. Call or text 988 (US) · Outside the US: findahelpline.com. A doctor or GP can also help." One tap, no sign-in, never paywalled.
- **"Not a diagnosis"** is stated on the landing (1), expectations (2), preview (10), paywall (11), offer (12), result (14) and talking points (15).
- No medical claims, no advice to start, stop or change any treatment or medication.

---

## A. Hook

### 1. Lander - Self-check
**Purpose:** Cold traffic arrives wanting to understand how it focuses. The first tap is cheap (age band), and the page says honestly what the check is, what it is not, and what is free.
**Headline A:** Understand your focus style
**Headline B:** Adult ADHD traits self-check
**Body A:** Pick your age to start. Free to take.
**Body B:** 18 statements. Not a diagnosis. About 4 minutes.
**Options:**
- 🌱 18-24
- 🚀 25-34
- 🧭 35-44
- 🌿 45-59
- 🦉 60+
**Field:** Single select, auto-advance on tap. Under-18: "You must be 18 or older to take this check."
**Visual:** White page, wordmark top-left. Hero: three soft paper tiles in a row with thin bars beneath, half filled, in navy and one amber accent, a pencil and a cup of tea beside them. Age pills stacked full-width beneath. Footer links (Cancel subscription · Subscription policy · FAQ · Terms · Privacy) and a "Need help now?" strip along the bottom.
**Microcopy:** Directly under the pills: "Free to take · Full report is a paid unlock". Under it: "A self-check, not a diagnosis. Independent, not clinical." Headline B is organic / search only, never on paid social.
**CTA:** (auto-advances on select)

### 2. What this is, and isn't
**Purpose:** The expectations screen before any sensitive statement. It sets the frame (self-check, not therapy, not a diagnosis), the length and the pause-any-time promise.
**Headline A:** Before you begin
**Headline B:** What this check is
**Body A:** A self-check for reflection. Not a diagnosis or therapy.
**Body B:** Only a qualified clinician can diagnose anything.
**Visual:** Three icon rows: 🪞 "A self-check for reflection", 🩺 "Not a diagnosis, not medical advice", ⏱ "18 statements · about 4 minutes · pause any time". Beneath, three chips for the areas covered: Attention · Impulsivity · Restlessness. A soft notice card: "If any statement feels hard, skip ahead or stop. Your answers are saved."
**Microcopy:** "4 minutes" is an estimate for 18 statements (unverified); replace with the real median once measured. Under the CTA: "Free to take · Full report is a paid unlock".
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
**Field:** Single select, auto-advance. "✏️ Other" opens a one-line input (max 40 chars); the CTA stays disabled until it has text. The goal token `{{goal}}` is always a noun phrase: "knowing yourself", "work and study", "your relationships", "your doctor visit", and "your day to day" for Other (typed text is stored, not inserted into sentences).
**Visual:** Same pill list as screen 1, a "Warm-up" hint at the top instead of a number.
**CTA:** (auto-advances on select)

### 4. Statement (template, x18)
**Purpose:** The product itself. Each answer is effort the paid report pays back. Calm, private, unhurried.
**Headline A:** I lose focus during long tasks.
**Headline B:** I fidget when I must sit.
**Body A:** Statement {{q_index}} of 18 · past six months
**Body B:** How often does this fit you?
**Options:** Five-level frequency scale, one tap each:
- 🚫 Never
- 🌤️ Rarely
- 😐 Sometimes
- 🔁 Often
- 🔥 Very often
**Field:** Single select, auto-advance after 350 ms. The headline slot holds the statement itself (the two above are examples). Three areas interleaved, 6 statements each, a third worded in the reverse direction. Area names are never shown (they would prime answers). Back goes to the previous statement.
**Visual:** White card with the statement in the serif face, large. Five stacked pills below (compact, 44 px). Thin three-segment progress bar at the top, honest to the answered count (6 per segment). No timer, no percentile, no right-or-wrong feedback.
**Microcopy:** Tiny line under the pills: "No right or wrong answers. Skip back any time." Statement bank is original wording, not clinically validated, not copied from any published scale (unverified).
**CTA:** (auto-advances on select)

### 5. Progress checkpoint (template, x2)
**Purpose:** A breather using only true progress, with a gentle wellbeing note. Two checkpoints, at 6 and at 12 answers. The ring shows the count (6/18, 12/18), not a percentage.
**Headline A:** A third of the way
**Headline B:** {{left_count}} statements to go
**Body A:** {{answered}} of 18 answered. Your answers are saved.
**Body B:** Take a breath, then keep going.
**Visual:** A segmented ring filled to the real fraction with the count in the middle, and the three area chips, no result hinted. One honest tip per checkpoint. (The second checkpoint's Headline A reads "Two thirds done".)
**Microcopy:** Tips, true for everyone: "Tip: think of the past six months, not just today." · "Tip: it's fine to pause. Your answers stay saved."
**CTA:** Keep going

---

## C. Trust

### 6. How it's built - after the effort
**Purpose:** A trust beat right after the effort, before the email ask. It builds trust through honest method, not numbers. A real review is added only when one exists.
**Headline A:** How your check works
**Headline B:** Your answers, scored fairly
**Body A:** Statements in a common self-report format.
**Body B:** Your results are almost ready.
**Visual:** Three short rows: "Scored from your answers only", "No total score, no verdict", "Not a clinical tool". Below, one review card with first name and country, or nothing while no real review exists.
**Microcopy:** No tests-taken number and no rating figure unless taken live from analytics or the platform. Never import another company's numbers. Wording "a common self-report format" is **unverified**: confirm with a clinical advisor before launch.
**CTA:** See my results

---

## D. Anticipation

### 7. Scoring
**Purpose:** Make the profile feel computed from their answers (because it is).
**Headline A:** Scoring your answers…
**Headline B:** Building your profile…
**Steps:**
1. Reading your 18 answers…
2. Weighing each of the 3 areas…
3. Finding your clearest area…
4. Writing your profile, almost ready…
**Visual:** Three icon tiles turn over one by one as the steps complete, each bar showing a check at the end (no percent counter), only after the real scores are known. Real review cards beneath, only if they exist.
**Microcopy:** "Scored from your answers only."
**CTA:** (auto-advances, ~6 seconds)

---

## E. Gate

### 8. Email gate
**Purpose:** Capture identity while curiosity peaks. The profile is saved to the account, not shared.
**Headline A:** Your results are ready
**Headline B:** Where should we save them?
**Body A:** Enter your email to save your profile.
**Body B:** Private to you, in your account.
**Field:** Email input, keyboard `email`, autofocus. Optional "Continue with Google / Apple" above it.
**Visual:** A free summary card above the field with computed facts only: "Completed in {{completion_time}}" · "18/18 answered" · "Clearest area: {{clearest_area}}". The profile line below is blurred.
**Error state:** "Please enter a valid email."
**Microcopy:** Under the CTA: "Private. We never sell your email." + Terms · Privacy. No price and no consent is bundled into this click.
**CTA:** Save my results

### 9. Name for your profile
**Purpose:** Personalizes the next screens so the paywall sells *their* profile. Skippable.
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
**Purpose:** Desire before price: your clearest area is real and visible, the depth is behind the unlock. The preview names no condition and shows no percentage.
**Headline A:** {{name}}, your profile is ready
**Headline B:** Meet your profile, {{name}}
**Body A:** Your clearest area is free. The rest is locked.
**Body B:** Everything blurred below unlocks with your report.
**Visual:** Stacked preview on white. (1) Three icon tiles, clear. (2) A card with three neutral relative bars (Less ... More): the clearest bar is clear, the other two blurred. No numbers, no percent, no "stronger / high". (3) Locked rows with lock icons. A line right under the card: "Bands only group your answers. Not a screening result, not a diagnosis."
**Microcopy:** Benefit rows: "🧭 Where each area shows up in daily life" · "💡 Everyday ideas for {{goal}}" · "🗣️ How to talk to a professional" · "📝 Notes to bring to a visit". Bands (neutral words): "Shows up less" · "In between" · "Shows up more", chosen only to group answers.
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
**Visual:** One long scroll, web style, light page. In order: (1) brand bar with wordmark and a close X. (2) Personal hero with the three icon tiles and the clearest-area line, locked rows beneath. (3) Plan block with three stacked radio cards, "today" and "then" in two equal-weight lines, then the CTA. (4) What's inside: where each area shows up · everyday ideas · how to talk to a professional · notes to bring · all 3 areas · all tests (Full Access only). (5) How it works: 1 unlock · 2 read it in your account · 3 bring your notes to a professional if you choose. (6) Proof: a real review card, hidden while unset. (7) Guarantee: the refund window that really exists, hidden while unset. (8) FAQ accordion: Is this a diagnosis? · How is my profile decided? · When will I be charged? · How do I cancel? (9) The plan block again. (10) A support box: "Need help now?" with the support sheet link, and "Not a diagnosis". (11) Sticky bottom CTA that always shows today's charge and the renewal line.
**Microcopy:**
- Above the CTA, changing with the plan: "Today: {{price_trial}}. On {{renewal_date}}: {{renewal_trial}}, then every 4 weeks until you cancel." / "One payment of {{price_report}}. Nothing renews."
- Trust row: "Secure checkout · Cancel anytime in your account".
- Reminder promise, only if the reminder email is actually sent (`CONFIG.reminder`, default on): "We'll email you 2 days before your trial ends."
- Disclaimer: "A self-check for reflection. Not a diagnosis, not medical advice, not a clinical assessment. Talk to a qualified professional about any concerns."
- Headline B variant by reason: Prepare for a doctor visit -> "Get your visit notes ready".
**Fallback offer:** Screen 12. The close X (and any back or exit) goes to the last-chance offer first, once per session. After it is declined, closing the paywall returns to the preview (10).
**CTA:** Continue to checkout

### 12. Last-chance offer (on close)
**Purpose:** A second chance for people who closed the paywall. It is deliberately **smaller than the one-time report on the paywall**: a single-area summary plus the talking guide, paid once, nothing renews. Shown once per session (sessionStorage `ikf_offer_testlibrary-adhd`), then never again.
**Headline A:** {{name}}, want a smaller option?
**Headline B:** Just one area, in detail?
**Body A:** One area in detail, plus a talking guide.
**Body B:** One payment. Nothing renews, nothing to cancel.
**Plans:** One offer card: {{offer_name}} (default "Clearest-area summary + talking guide"). {{offer_price}} today, a price below the full one-time report. A struck-through price appears only if it is a real, lower price that checkout charges. Optional {{offer_badge}}.
**Visual:** Light page in the paywall's style: wordmark and close X, eyebrow "One-time offer · shown once", one navy-bordered offer card with the clearest-area tile, the price row and 3 checks (your clearest area in detail · how it shows up day to day · how to talk to a professional). A dashed **Not included** box: the other two areas in detail · everyday ideas · visit notes · library access, "Get these with the full report". CTA, payment badges and the line "One payment of {{offer_price}}. Nothing renews, so there's nothing to cancel."
**Microcopy:** No timer by default. A timer appears only if `CONFIG.offer.expiresMin` is set to a real deadline; when it ends the offer is withdrawn (`offer_expired`) and the user returns to the preview. Decline link: "No thanks, back to my free preview". Disclaimer as on the paywall. Events: `offer_view`, `offer_accept` + `checkout_click` (plan `offer`), `offer_decline`, `offer_expired`. Offer CVR is measured separately. A buyer of this offer sees a one-area result on screen 14 with an upgrade note.
**CTA:** Claim my offer

### 13. Order summary + consent
**Purpose:** The anti-trap screen. It restates what is charged today and later, with an unticked consent box.
**Headline A:** Review your order
**Headline B:** Confirm your plan
**Body A:** Here's exactly what you pay, today and later.
**Body B:** Check the details before you pay.
**Field:** Summary card (plan, today's charge, next charge date, amount and interval, "Cancel anytime before {{renewal_date}} to pay nothing more"). Below it a **consent checkbox, unticked by default**: "I understand my plan renews at {{renewal_trial}} every 4 weeks until I cancel." Required for recurring plans, hidden for One-time and the offer. Then card / Apple Pay / Google Pay.
**Visual:** White summary card with two rows, "Today" and "{{renewal_date}}", in equal type. Checkbox and label at body size right above the pay button.
**Error state:** "Please tick the box to confirm renewal terms." · "Card declined. Try another card or PayPal."
**Microcopy:** "Receipt with cancel link sent to {{email}}." Refund wording points to the Subscription policy; the paywall guarantee carries the real refund window. The billing descriptor is neutral and shows "TestLibrary", never a health term.
**CTA:** Pay and see profile

---

## G. Payoff

### 14. Your full profile
**Purpose:** Deliver the whole profile honestly and gently, so the purchase feels justified and refund risk stays low. No label, no verdict, no total score, no percentage.
**Headline A:** Your focus profile
**Headline B:** {{name}}, here's your profile
**Body A:** Three areas, in plain words. Not a diagnosis.
**Body B:** Where each area shows up for you.
**Visual:** Three icon tiles, then three neutral relative bars with a band word (Shows up less · In between · Shows up more) and ends "Less" / "More". Strengths as cards. Then sections: Where it shows up day to day (two clearest areas) · Everyday ideas (one per clearest area) · **Talking to a professional**: 1 write down examples, 2 book with a GP or an adult-assessment clinician, 3 bring this profile and your questions; "Only a qualified clinician can say whether any condition applies. This check cannot." · A support box with the "Need help now?" sheet. Offer buyers see only the clearest area, a "Not in your offer" note and an upgrade path.
**Microcopy:** Method line, always visible: "Based on 18 statements you rated. Bands only group your answers. They are not a screening result, and not a condition." Disclaimer: "A self-check for reflection. Not a diagnosis, not medical advice." Every result is shown with the same warmth, including "Shows up less" across the board.
**CTA:** Get my visit notes

### 15. Talking points for a professional
**Purpose:** Hand over a useful, private artifact (not a social card: this topic is not for ad-style sharing).
**Headline A:** Your visit notes are ready
**Headline B:** Bring this to a professional
**Body A:** Download your notes, or email them to yourself.
**Body B:** Private by default. Share only if you choose.
**Visual:** A notes page mockup: name, date, three mini bars, "Examples I noticed" with three blank lines, "Questions to ask" with three prompts ("What does an adult assessment involve?" · "How long is the wait?" · "What support exists meanwhile?"). Buttons: Download PDF, Email me a copy.
**Microcopy:** Footer: "For your own use. Not a clinical report, not a diagnosis." No share-to-social buttons by design.
**CTA:** Download PDF

### 16. Support and next steps
**Purpose:** Second layer plus care. Support first, then the library. Trial users see what else their plan includes; one-time buyers get a clearly priced path to the library.
**Headline A:** What's next, {{name}}?
**Headline B:** Support and next steps
**Body A:** Real help is one step away. Then explore more.
**Body B:** Pair your profile with other self-checks.
**Visual:** First a support card: "Talk to a professional" · "Need help now?" (opens the support sheet). Then horizontal cards from the real library, ordered by reason: Work and study -> Career Test, Strengths Finder, DISC. Relationships -> Attachment Style, Love Style, EQ Test. Curious / Doctor visit -> Big Five, EQ Test, Mental Age. Each card shows minutes.
**Microcopy:**
- Trial users: "Included until {{renewal_date}} · Manage plan".
- One-time buyers: "Unlock all tests - {{price_trial}} for 1 week, then {{renewal_trial}} every 4 weeks." The consent screen (13) applies.
- Account line: "Log in anytime with {{email}}. Your report stays in your dashboard."
**CTA:** Start next test

---

## Notes

**Reused from sibling briefs (not re-researched):** the monetization spine from `testlibrary/funnel-content.md` and the guardrail structure from `testlibrary/autism-traits/`. Changed: 18 frequency statements across three areas with two checkpoints; ring shows counts, not percentages; neutral relative bars with no on-screen percentages and no "stronger / high" wording; a neutral default landing headline; the last-chance offer is a one-area summary smaller than the paywall's one-time report, with a Not-included list.

**Unverified (`[I]` in research):** only the testlibrary.com/adhd-test landing is verified; the flow after it (item count and format, email gate, price ladder) is inferred and unverified. Also unverified: the "common self-report format" wording, the 4-minute length, the statement bank (original wording, not clinically validated, not an ASRS copy), the grouping thresholds (below 34 / 34-66 / 67 and up of the area maximum, internal only and never shown as numbers) and the support wording. **A clinical or compliance reviewer must read every screen before launch.**

**Competitor mechanic, recorded only (do NOT implement).** Brain-health funnels in this niche pair a long test with "you're faster than 93%" flattery, a $1 "see your result" click that becomes a large 4-weekly charge, a resetting timer, fake live tickers, and ads that ask "Do you have ADHD?". None of it is copied.

**Honesty rules for the result.** Bands come from the user's own answers: per area, the sum of fit scores (reverse-keyed items flipped) over the maximum, shown only as a relative bar and a neutral band word. There is no cross-area total and no cut-off. Never say "ADHD" in a result, "likely", "high risk", "screened positive", "certified", "validated" or "clinical". Never say "you have". Never advise starting, stopping or changing treatment or medication. Not a diagnosis on screens 1, 2, 10, 11, 12, 14 and 15. "Need help now?" on every screen.

**Blocks skipped:** no notification opt-in, no wheel, no countdown, no before/after, no gender or education question, no share-to-social.

**Drop-off risk:** (1) screen 4 (measure completion per checkpoint); (2) screen 2; (3) screen 8, the email ask; (4) screen 13, where the unticked consent box will cost some conversion. The aim is lower refunds, chargebacks and policy risk.

**Monetization, two layers, measured separately:** (1) screens 11-13 by plan (one-time vs trial), with the last-chance offer (12) CVR on its own; (2) trial to first renewal rate and refund/chargeback rate, the health metric; (3) library engagement from screen 16. Ad account policy review is a launch gate, not a metric.

**First A/B tests:** screen 2 before vs after screen 3; 18 vs 24 statements; email gate before vs after the preview; one-time vs trial pre-selected (both fully disclosed). The condition-named landing headline is tested only on organic / search traffic.

**Demo link:** https://claude.ai/artifact/FD4ReqdosHtZiUvZWVvpCA (private; placeholder images copied from the autism-traits sibling until gen_images.py runs with IKAME_AI_KEY)
