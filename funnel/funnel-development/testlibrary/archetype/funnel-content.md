---
niche: testlibrary-archetype
display_name: TestLibrary - 12-archetype test (web)
archetype: assessment-unlock
subject: person
input: age band, optional gender for pronouns, 24 forced-choice image pairs, email, first name
output: lead archetype with a 12-archetype wheel (percent per archetype), a supporting archetype, a shadow archetype, and a locked report (love, career, suggested growth goals)
screens: 16
monetization: web checkout - one-time profile report OR full-library access (disclosed paid trial then 4-weekly renewal); library cross-sell after the reveal
creative_screens:
  hook-a: 1
  hook-b: 3
  hook-c: 4
  reveal: 10
  result: 14
motion: >
  twelve wheel wedges growing outward one by one as the 24 picks are counted,
  then the lead wedge lighting up amber while the rest settle blurred
---

# Funnel Content - TestLibrary (12-archetype test)

This is the archetype reskin of the TestLibrary flagship (`testlibrary/funnel-content.md`, IQ) and a sibling of `testlibrary/personality-mbti/`. It reuses that brief's spine, brand, tokens and the whole monetization block (screens 6-13 and 15-16); what changes is the test mechanic and the result. Instead of 40 agree/disagree statements, the user makes **24 forced choices between two images**. They get a lead archetype, a supporting archetype and a shadow archetype on a **12-archetype wheel with a percent for each**, and the paid report adds love, career and growth. Archetype: **assessment-unlock** (followed as-is, mechanic variant). 16 screens. Screens 4 and 5 are templates that repeat (24 pairs, 4 checkpoints).

**Reference funnels:** Impulse's archetype-style hook (`testlibrary.md` section 3: a picture-pick quiz that is only a lead-in to brain training, the "result" is a pitch), TestLibrary's own landers (section 7) and the Prayers archetype funnel in `ewa-ayahpath.md` section 7 (captured via adspylab, 2026-09-28). **Deliberately different:** in the competitor the quiz is a hook and the result is generic; here the result is real and computed from the 24 picks, nothing else. No mid-test flattery or percentile ranking, the renewal price sits next to every trial price, and nothing is billed silently. **Naming:** twelve classic archetypes (Innocent, Everyman, Caregiver, Lover, Jester, Explorer, Outlaw, Magician, Hero, Sage, Creator, Ruler). The page says it is an independent self-discovery quiz, not a clinical tool. **Look:** the light "exam paper" look of the IQ brief (white, ink navy, one amber accent), reusing its tokens and fonts; the pair screens use two large illustrated tiles; paywall is a long-scroll web page.

---

## A. Hook

### 1. Lander - Which archetype leads you
**Purpose:** Cold traffic arrives curious about "which archetype am I". The first tap is cheap (age band), and the page says honestly what is free and what is paid.
**Headline A:** Which archetype leads you?
**Headline B:** Find your lead archetype
**Body A:** 24 quick picks between two images. No wrong answers.
**Body B:** Pick your age to start. About 5 minutes.
**Options:**
- 🌱 18-24
- 🚀 25-34
- 🧭 35-44
- 🌿 45-59
- 🦉 60+
**Field:** Single select, auto-advance on tap. Under-18: "You must be 18 or older to take this test."
**Visual:** White page, wordmark top-left. Hero: a ring of twelve small round emblems (one per archetype, all unlabeled) around a "?" with a soft paper background. Age pills stacked full-width beneath, navy outline, navy fill on select. Footer links stay (Cancel subscription · Subscription policy · FAQ · Terms · Privacy).
**Microcopy:** Disclosure directly under the pills, same size as the body: "Free to take · Full report is a paid unlock". Under it: "Independent archetype quiz. Not clinical."
**CTA:** (auto-advances on select)

### 2. Gender (optional)
**Purpose:** The brief's spine asks gender/age. Scoring does not use it; it only prints pronouns on the profile card, and it can be skipped.
**Headline A:** How should we word it?
**Headline B:** Who is this profile for?
**Body A:** Only used for pronouns on your profile card.
**Body B:** Scoring ignores this. Skip anytime.
**Options:**
- 👩 Woman
- 👨 Man
- 🧑 Non-binary
- 🤐 Prefer not to say
- ✏️ Other
**Field:** Single select, auto-advance. "Non-binary" and "Prefer not to say" print no pronouns on the card. "✏️ Other" opens a one-line input for the user's own pronouns (max 20 chars); the CTA stays disabled until it has text.
**Visual:** Same pill list as screen 1.
**CTA:** (auto-advances on select)

### 3. How it works
**Purpose:** Set honest expectations (length, how to answer) so people who start finish.
**Headline A:** Before you begin
**Headline B:** Here's how it works
**Body A:** Pick the image that feels more like you.
**Body B:** Go with your first instinct. Progress saves.
**Visual:** Three icon rows: 🖼️ "24 pairs · tap one image", ⏱ "About 5 minutes", 🔓 "Free to take, report is paid". Beneath, the twelve archetype emblems as unlabeled chips.
**Microcopy:** "5 minutes" is an estimate for 24 taps; replace with the real median once measured. Under the CTA: "Free to take · Full report is a paid unlock".
**CTA:** Start the test

---

## B. Investment

### 4. Image pair (template, x24)
**Purpose:** The product itself. Each tap is effort the paid report pays back. Pairs are quick, so the tone is light and fair.
**Headline A:** Which feels more like you?
**Headline B:** Pick your pull
**Body A:** Pair {{q_index}} of 24
**Body B:** Trust your first instinct.
**Options:** Two large image tiles, each with a 1-3 word caption, e.g. "🧭 Open road" vs "📚 Quiet library", "🎈 Pure play" vs "👑 Head of table".
**Field:** Two tiles, single select, auto-advance after 350 ms. Each tile belongs to one archetype and each archetype appears in exactly 4 of the 24 pairs (4 different scenes), so every archetype has a maximum of 4 picks. Pairs never show the archetype name (it would prime answers) and the left/right order alternates. Back goes to the previous pair.
**Visual:** Two stacked tiles, each about 150 px tall, large emoji-style illustration and a caption in the serif face. Thin four-segment progress bar at the top, honest to the answered count. No timer, no percentile, no right-or-wrong feedback.
**Microcopy:** Tiny line under the tiles: "No right or wrong answers". The tiles are illustration art; 24 pairs need 48 scene illustrations (4 per archetype x 12), which are generated later from the prompt table in `gen_images.py`.
**CTA:** (auto-advances on select)

### 5. Progress checkpoint (template, x4)
**Purpose:** A breather so fatigue doesn't cause drop-off, using only true progress. Four checkpoints after pair 6, 12, 18 and 22 (25%, 50%, 75%, 92%).
**Headline A:** You're {{percent_done}}% done
**Headline B:** {{left_count}} pairs to go
**Body A:** {{answered}} of 24 picked. Your answers are saved.
**Body B:** Keep going with your first instinct.
**Visual:** A segmented ring filled to the real percentage and the twelve unlabeled emblems beneath, with no result hinted. One honest tip per checkpoint.
**Microcopy:** Tips, true for everyone: "Tip: pick what you'd do, not what sounds best." · "Tip: it's fine if both feel true. Pick one." · "Tip: don't count your picks. Just choose." · "Tip: last few. Trust your first instinct."
**CTA:** Keep going

---

## C. Trust

### 6. Social proof - after the effort
**Purpose:** A trust beat right after the longest effort, before the email ask. It shows only real reviews held in `CONFIG.reviews`; with none, a neutral "almost there" beat replaces it.
**Headline A:** See what test-takers say
**Headline B:** Real reviews, real people
**Body A:** Reviews from people who took a TestLibrary test.
**Body B:** Your results are almost ready.
**Fallback (no reviews configured):** Headline A "Your picks are in" · Headline B "Almost there" · Body A "Next, we score all 24 of them." · Body B "Your results are almost ready." No stars, no review claim.
**Visual:** With reviews: star row only if a real rating is configured, plus one review card with first name and country. Without: the twelve unlabeled emblems.
**Microcopy:** Reviews and any rating figure come only from `CONFIG.reviews` (real, current, sourced). While it is unset, no stars, cards or "reviews" wording appear on screens 6, 7 or 11. Never import another company's numbers.
**CTA:** See my results

---

## D. Anticipation

### 7. Scoring
**Purpose:** Make the wheel feel computed from their picks (because it is).
**Headline A:** Scoring your picks…
**Headline B:** Building your wheel…
**Steps:**
1. Counting your 24 picks…
2. Placing you on the 12-archetype wheel…
3. Finding your lead and supporting archetypes…
4. Writing your profile, almost ready…
**Visual:** The wheel is drawn empty, then each wedge grows to its real length one at a time, with the lead wedge turning amber last, but only after the real scores are known. Four progress rows beside it, rotating real review cards beneath only if `CONFIG.reviews` is set.
**Microcopy:** "Scored from your picks only."
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
**Visual:** A free summary card above the field with computed facts only: "Completed in {{completion_time}}" · "24/24 picked" · "Archetypes with a pick: {{archetype_count}} of 12". The lead archetype line below is blurred.
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
**Purpose:** Desire before price: your lead archetype is real and visible, the depth is behind the unlock.
**Headline A:** {{name}}, your archetype is ready
**Headline B:** Meet your lead, {{name}}
**Body A:** Your lead archetype is free. The rest is locked.
**Body B:** Everything blurred below unlocks with your report.
**Visual:** Stacked preview on white. (1) The lead archetype card: emblem, name (e.g. "The Sage"), its percent and a one-line gist, all clear. (2) The 12-archetype wheel with the lead wedge clear and amber, the other eleven wedges and all labels blurred. (3) Two blurred rows with lock icons: "Supporting archetype" and "Shadow archetype". (4) Three locked rows: Love · Career · Growth.
**Microcopy:** Benefit rows: "💞 How you love" · "💼 Career fit for you" · "🌱 Suggested growth goals" · "🎡 All 12 percentages" · "🌓 Your shadow archetype". Line under the card: "Based on your picks. Not clinical."
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
**Visual:** One long scroll, web style, light page. In order: (1) brand bar with wordmark and a close X. (2) Personal hero with the lead archetype emblem, name and percent, a mini wheel, and locked rows beneath. (3) Plan block with three stacked radio cards, "today" and "then" in two equal-weight lines, then the CTA. (4) What's inside: Love · Career · Suggested growth goals · all 12 percentages · supporting and shadow archetypes · all tests (Full Access only). (5) How it works: 1 unlock · 2 read it in your account · 3 take the next test. (6) Proof: real review cards and rating, only when `CONFIG.reviews` is set; the whole section is hidden otherwise. (7) Guarantee: the refund window that really exists, in plain words, shown only when `CONFIG.refundDays` is a real number (hidden while it is a token). (8) FAQ accordion: How is my archetype decided? · What does the trial include? · When will I be charged? · How do I cancel? (9) The plan block again. (10) Sticky bottom CTA that always shows today's charge and the renewal line.
**Microcopy:**
- Above the CTA, changing with the plan: "Today: {{price_trial}}. On {{renewal_date}}: {{renewal_trial}}, then every 4 weeks until you cancel." / "One payment of {{price_report}}. Nothing renews."
- Trust row: "Secure checkout · Cancel anytime in your account · 2-click cancel".
- Reminder promise, only if the reminder email is actually sent (`CONFIG.reminder`, default on): "We'll email you 2 days before your trial ends."
- Disclaimer: "For self-discovery only. Independent archetype quiz. Not a clinical or diagnostic assessment."
**Fallback offer:** Screen 12. The close X (and any back or exit) goes to the last-chance offer first, once per session. After it is declined, closing the paywall returns to the preview (10).
**CTA:** Continue to checkout

### 12. Last-chance offer (on close)
**Purpose:** A second chance for people who closed the paywall, most often because they don't want a subscription. It is a genuinely smaller option than every paywall tier: the **lead archetype summary** only (lead, its percent, three strengths), with no wheel, supporting or shadow archetype, love, career or growth. Nothing renews. Shown once per session (sessionStorage `ikf_offer_testlibrary-archetype`), then never again.
**Headline A:** {{name}}, just want your lead?
**Headline B:** Want a smaller option?
**Body A:** Get your lead archetype summary. No subscription.
**Body B:** One payment. Nothing renews, nothing to cancel.
**Plans:** One offer card: {{offer_name}} (default "Lead archetype summary": one payment, nothing renews). {{offer_price}} today. A struck-through price appears only if it is a real, lower price that checkout charges; if the offer is the one-time report at its listed price, nothing is struck. Optional {{offer_badge}}.
**Visual:** Light page in the paywall's style: wordmark and close X, eyebrow "One-time offer · shown once", one navy-bordered offer card with a mini profile card (lead emblem clear, the rest blurred), the price row, 3 checks (your lead archetype in detail · your 3 core strengths · your lead percent and gist), the CTA, payment badges and the line "One payment of {{offer_price}}. Nothing renews, so there's nothing to cancel."
**Microcopy:** No timer by default. A timer appears only if `CONFIG.offer.expiresMin` is set to a real deadline; when it ends the offer is withdrawn (`offer_expired`) and the user returns to the preview. Decline link: "No thanks, back to my free preview". Disclaimer as on the paywall. Events: `offer_view`, `offer_accept` + `checkout_click` (plan `offer`), `offer_decline`, `offer_expired`. Offer CVR is measured separately.
**After purchase:** screen 14 shows only the lead card and strengths, with one locked row pointing to the full report; screen 15's card shows the lead only.
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
**Headline A:** You lead with {{archetype}}
**Headline B:** {{name}}, you're {{archetype}}
**Body A:** Your wheel, shadow and next steps.
**Body B:** Love, career and growth, all unlocked.
**Visual:** The lead archetype card (emblem, name, percent, 3 strengths), then the full 12-archetype wheel with every wedge and percent clear, then three role cards in order: Lead (percent), Supporting (percent) and Shadow (percent, with a line on what leaning into it can feel like). Then three unlocked sections: Love (how you show and want love) · Career (4 fields to explore) · Suggested growth goals (one habit per week for 3 weeks, from the lead archetype's blind spots, labeled as suggestions).
**Microcopy:** Method line, always visible: "Based on your 24 picks. Each percent is how many of an archetype's 4 scenes you chose." Disclaimer: "For self-discovery only. Independent archetype quiz. Not clinical." Every result is shown with the same warmth, including the shadow.
**CTA:** Get my profile card

### 15. Profile card + share
**Purpose:** Hand over the artifact and turn the peak moment into shares.
**Headline A:** Your profile card is ready
**Headline B:** Share your archetype, {{name}}
**Body A:** Download a PDF or share a card with friends.
**Body B:** Proudly yours. Download it or share it.
**Visual:** Profile card mockup (name, lead emblem and name, lead + supporting + shadow with percents, date), Download PDF button, share row (WhatsApp, Instagram story card, copy link).
**Microcopy:** Share text: "My lead archetype is {{archetype}} on the TestLibrary archetype test. Your turn?" Footer: "For personal use. Not an official or clinical result."
**CTA:** Download PDF

### 16. Your next test
**Purpose:** Second layer. Trial users see what else their plan includes; one-time buyers get a clearly priced path to the library.
**Headline A:** What's next, {{name}}?
**Headline B:** Your mind, from new angles
**Body A:** Your plan includes every test below. Start any.
**Body B:** Pair your archetype with how you feel and relate.
**Visual:** Horizontal cards from the real library, ordered by the lead archetype's group. Seekers (Innocent, Explorer, Outlaw) → Big Five, Career Test, Strengths Finder. Connectors (Everyman, Caregiver, Lover) → Love Style, Attachment Style, EQ Test. Shapers (Jester, Magician, Creator) → Enneagram, Mental Age, Strengths Finder. Leaders (Hero, Sage, Ruler) → Career Test, DISC, IQ Test. Each card shows question count and minutes.
**Microcopy:**
- Trial users: "Included until {{renewal_date}} · Manage plan".
- One-time buyers: "Unlock all tests - {{price_trial}} for 1 week, then {{renewal_trial}} every 4 weeks." The same consent screen (13) applies.
- Account line: "Log in anytime with {{email}}. Your report stays in your dashboard."
**CTA:** Start next test

---

## Notes

**Reused from the personality brief (not re-researched):** screens 6-13 and 15-16 keep their jobs and the whole monetization spine (trial plan with renewal on the card, unticked consent, reminder email, one-time alternative, last-chance offer, library cross-sell). Changed: the test is 24 image pairs (not 40 statements), gender is asked once as optional pronoun wording, the reason question is dropped (the spine has none; cross-sell is keyed to the lead archetype instead), and the result is a 12-wedge wheel with lead, supporting and shadow. **Unverified (competitor):** the Impulse archetype hook and the Prayers archetype funnel are read from captured screens only (`[I]`, inferred from adspylab summaries); the screen order and picture-pair format here are our own design, not a copy. **Verify:** the real library question counts and the 48 scene illustrations.

**The honest difference.** In the competitor funnels the picture quiz is a lead-in and the "result" is a pitch for brain training. Here the result is real: it is computed from the 24 picks and nothing else. Competitor mechanics recorded only (do NOT implement): flattery mid-test, "you're faster than 93%" style ranks, a $1 click that becomes a large 4-weekly charge, a resetting timer, fake live tickers.

**Scoring rules (honesty rules for the result).** Every archetype appears in exactly 4 of the 24 pairs, in 4 different scenes. Each pick adds 1 to its archetype. An archetype's percent is picks/4 (so 0%, 25%, 50%, 75% or 100%): "how many of its 4 scenes you chose", never a norm or a comparison with other people. **Lead** = highest score; **supporting** = second highest; ties are broken by wheel order and shown as "close call" in the profile. **Shadow** = the lowest score; ties go to the archetype farthest around the wheel from the lead. The shadow is framed as "the side you rarely lean on", never as a flaw. Never say "scientifically proven", "certified" or "official". Show every archetype with equal warmth. Not a clinical or diagnostic assessment, on screens 11, 12, 14 and 15.

**Blocks skipped:** no notification opt-in, no countdown upsell, no before/after, no education question, no reason question.

**Drop-off risk:** (1) screens 4-5, the 24 pairs (measure completion per checkpoint); (2) screen 8, the email ask; (3) screen 13, where the consent box will cost some conversion. The point is lower refunds and chargebacks.

**Monetization, two layers, measured separately:** (1) screens 11-13 by plan (one-time vs trial), with the last-chance offer (12) CVR on its own; (2) trial to first renewal rate and refund/chargeback rate, the health metric; (3) library engagement from screen 16.

**First A/B tests:** 24 vs 36 pairs; email gate before the preview vs after; paywall default one-time vs trial pre-selected (both fully disclosed); clear lead only vs clear lead plus its percent in the teaser.

**Demo link:** https://claude.ai/artifact/CSbA2SdLfT7TR1JeGBUnhn (private; placeholder images until gen_images.py runs with IKAME_AI_KEY; pair tiles are emoji art until the 48 scene illustrations exist)
