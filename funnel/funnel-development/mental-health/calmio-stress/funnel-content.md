---
niche: calmio-stress
display_name: Calmio - Stress Reset (AI wellbeing companion - 18+)
archetype: personalization-quiz
subject: person
input: age (18+ gate), stress sources, how stress shows up, four Likert statements, when it peaks, what they tried, main goal, name, email
output: a stress pattern (Sprinter, Carrier or Juggler) plus a 4-week micro-reset plan and a first 2-minute reset chat
screens: 22
monetization: one plan subscription (1-week intro / 4-week pre-selected / 12-week anchor, renewal shown on every price, pre-renewal email), dismissible web paywall, one smaller one-time fallback pack on close (7 micro-resets, paid once, no timer), no other upsell layer
creative_screens:
  hook-a: 1
  hook-b: 2
  loader: 16
  reveal: 17
  first-chat: 19
motion: >
  a tangle of tight looping lines above a desk slowly relaxes into one calm curve
  while a sage flower bud opens petal by petal and a soft chat bubble types
  "Rough day? I'm here."
---

# Funnel Content - Calmio: Stress Reset

Calmio is a chat-based AI companion for reflective conversation (18+, "a companion, not a therapist"). This is the **everyday stress** niche: the user who feels always on and cannot come down. They give a handful of gentle answers about what weighs on them and how it shows up. They get a **stress pattern** (Sprinter, Carrier or Juggler), a **4-week micro-reset plan** (one two-minute reset chat plus one tiny reset a day) and a real first 2-minute reset chat before the paywall. **Archetype: personalization-quiz** (Calmio mental-health variant, as in `mental-health/calmio` and `calmio-overthinking`): money is a plan subscription sold after a data quiz, not a per-message meter. It borrows the first live conversation from companion-chat. 22 screens, A/B copy on every one.

**Reference funnels (competitor teardown, AdSpyLab research in `calmio.md`, captured 2026-09):** Formula "cortisol" funnel (section 9, in practice a diet and "cortisol belly" offer), the BB Fasting advertorial aimed at women 45+ (section 10) and Liven "Cortisol detox 35+" (section 4). Calmio does not run this niche today, so this is a first app-side funnel for it. The four Likert statements follow the quiz shape those funnels use. Section 9 to 10 mechanics are reference only (see Notes). Unverified: screen-by-screen details of those funnels come from the research summary, not a fresh live walk.

**Deliberately different from the references:** no diet, fasting, "belly fat" or weight angle; no claim to lower, balance or "detox" cortisol and no measure or promise of any biological marker (the pattern is a reflection with three soft traits, never a score). No medication or supplement questions. No fake MD byline, no "% faster / % improved" claims, no timer, no promo code, no scratch card, no invented "-60%" anchor: there is no struck price anywhere. A real 2-minute chat runs before the paywall, and renewal terms sit next to every price. A "Need help now?" link is on every screen and is never paywalled. Ad copy never implies a personal attribute ("Are you stressed?" style).

**Visual override (same as `mental-health/calmio`):** soft light theme, warm off-white, sage green and muted lavender, rounded sans, lots of air, the flower as the one hero object. The hook uses a lavender morning scene with a desk, a tangle of lines that smooths out, and a weather-style answer scale (calm sky to storm). Confirm against the real brand kit.

---

## A. Hook

### 1. Hook A - Always on
**Purpose:** Meet the "wired, never switching off" state with the brand promise, without asking for anything.
**Headline A:** Always on, never calm?
**Headline B:** Stress won't switch off?
**Body A:** A calm companion for when stress won't ease.
**Body B:** Short chats and tiny resets, any time of day.
**Visual:** Lavender morning sky fading to warm off-white over a tidy desk photo, a tangle of thin looping lines that slowly relax into one gentle curve. A sage flower bud breathes (in 4s, out 6s) beneath. One soft bubble: "Rough day? I'm here." Sage button pinned bottom. "Need help now?" link top-right, persistent on every screen to #22.
**Microcopy:** Under CTA: "18+ · Calmio is AI and not a substitute for professional care". "Need help now?" opens the crisis sheet: "Call or text 988 (US) · Outside the US: findahelpline.com · In danger now? Call your local emergency number." One tap, no sign-in, no paywall.
**CTA:** Get started

### 2. Hook B - Two-minute reset
**Purpose:** Show the core surface (a short reset chat plus one tiny exercise) so the user knows what they would be doing.
**Headline A:** Two minutes to reset.
**Headline B:** Small resets, any time.
**Body A:** Chat it out, breathe once, set one thing down.
**Body B:** A short chat and one tiny reset a day.
**Visual:** Card on off-white with three chat bubbles fading in (user: "Back-to-back meetings again." / Calmio: "That sounds heavy. What's pressing most?" / user typing dots). "AI companion" chip above, a mug-and-journal photo on the card.
**CTA:** Continue

---

## B. Investment

### 3. Age check
**Purpose:** The app is rated 18+. The check goes before any personal question so no minor discloses anything first.
**Headline A:** First, a quick age check
**Headline B:** What year were you born?
**Body A:** Calmio is for adults 18 and over.
**Body B:** We ask everyone. It keeps Calmio safe.
**Field:** Year wheel picker with no default. The CTA stays disabled until a year is picked.
**Visual:** Plain year wheel in a rounded white card, small sprout icon above.
**Error state:** Under 18 -> a blocking screen, no way back in. Headline: "Calmio is for adults only". Body: "Free support for young people is available now." Buttons: "Call or text 988 (US)" · "Find a helpline near you" (findahelpline.com).
**CTA:** Continue

### 4. What Calmio is (and isn't)
**Purpose:** The honest expectations beat and the safety net, placed before any question about stress or the body. It is also where the "no cortisol claims" promise is made explicit.
**Headline A:** A companion, not a therapist
**Headline B:** Before we begin, one promise
**Body A:** It helps you reflect. It doesn't diagnose or treat.
**Body B:** For crisis or medical care, please reach real people.
**Visual:** Four icon rows on a white card (chat bubble, lock, lifebuoy, heart). Sage icons, generous spacing, nothing else on screen.
**Microcopy:** Rows: "Calmio is AI, and always says so" · "You choose what you share" · "In crisis? Call or text 988 (US) or visit findahelpline.com" · "Calmio can't measure or change stress hormones. If stress feels too heavy, a doctor can help." Footer: "Calmio does not provide medical advice, diagnosis or treatment."
**CTA:** I understand

### 5. What's weighing on you
**Purpose:** The first cheap tap. It names the sources of stress in the user's words and sets `{{sources}}`, reused in the chat, the plan and as a tie-breaker.
**Headline A:** What's weighing on you?
**Headline B:** What's pressing hardest?
**Body A:** Pick all that apply.
**Body B:** Choose any. Nothing here is judged.
**Options:**
- 💼 Work
- 🏠 Family
- 💸 Money
- 🩺 Health
- ✏️ Other
**Field:** Multi-select, min 1 to enable the CTA. "Other" opens a one-line input; the CTA stays disabled until it has text. Any free text passes through crisis-language detection before continuing.
**Visual:** Two-column soft chip grid, selected chips get a sage border and a check. A small closed bud sits at the top.
**Microcopy:** Disabled-CTA hint: "Pick at least one". Crisis detection on "Other": if matched, show the crisis sheet from #1 with "Talk to a person now" first and "Continue with Calmio" second. Never block the user, never ask them to explain.
**CTA:** Continue

### 6. How stress shows up
**Purpose:** Names the daily signs in neutral words so the user feels understood. Used only to word the plan, never as urgency or a health read-out.
**Headline A:** How does stress show up?
**Headline B:** Where do you notice it?
**Body A:** Pick all that fit.
**Body B:** Choose any. We're just noticing.
**Options:**
- 😴 Restless sleep
- 💪 Tight body
- 😤 Short fuse
- 🍫 Stress snacking
- ✏️ Other
**Field:** Multi-select, min 1 to enable the CTA. "Other" opens a one-line input, checked for crisis language.
**Visual:** Soft pill list with a small line icon each, selected ones fill sage.
**Microcopy:** Disabled-CTA hint: "Pick at least one". Signs are never summed, scored or linked to a body marker.
**CTA:** Continue

### 7. Likert 1 - On edge
**Purpose:** The core felt-experience statement; its answer sets the pacing of the plan, not a score shown to the user.
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** Think about a typical week.
**Body B:** Pick the closest. No wrong answers.
**Field:** Statement card: "I feel on edge even when nothing is wrong." Five-step weather scale: 🍃 Never · 🌤️ Rarely · ⛅ Sometimes · 🌥️ Often · ⛈️ Always. Single select, auto-advances.
**Visual:** Quote card on off-white, the five weather icons as one row of round buttons with labels under them. A "1 of 4" chip above.
**Microcopy:** Progress hint: "1 of 4". The answer is never shown as a number or label to the user.
**CTA:** (auto-advances on tap)

### 8. Likert 2 - Push then crash
**Purpose:** Feeds the Sprinter trait.
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** Think about the last month.
**Body B:** The closest answer is fine.
**Field:** Statement card: "I push hard, then run out of steam." Same five-weather scale, single select, auto-advances.
**Visual:** Same as #7, chip "2 of 4".
**Microcopy:** Progress hint: "2 of 4".
**CTA:** (auto-advances on tap)

### 9. Likert 3 - Carrying
**Purpose:** Feeds the Carrier trait.
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** Go with your first instinct.
**Body B:** Nothing here is judged.
**Field:** Statement card: "I carry other people's problems as my own." Same five-weather scale, single select, auto-advances.
**Visual:** Same as #7, chip "3 of 4".
**Microcopy:** Progress hint: "3 of 4".
**CTA:** (auto-advances on tap)

### 10. Likert 4 - Too many things
**Purpose:** Feeds the Juggler trait. The last statement, then the practical questions open up.
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** Last statement. Then a few easy taps.
**Body B:** Pick the closest, as always.
**Field:** Statement card: "Too many things pull at me at once." Same five-weather scale, single select, auto-advances.
**Visual:** Same as #7, chip "4 of 4".
**Microcopy:** Progress hint: "4 of 4".
**CTA:** (auto-advances on tap)

### 11. When it peaks
**Purpose:** Sets `{{peak}}` and the daily reset time, so the micro-reset lands where the day is hardest.
**Headline A:** When does stress peak?
**Headline B:** When is it hardest?
**Body A:** Pick the one that happens most.
**Body B:** We'll time your daily reset.
**Options:**
- 🌅 Morning rush
- ☀️ Midday crunch
- 🌆 After work
- 🔄 All day long
- ✏️ Other
**Field:** Single select, auto-advances on tap. Sets `{{reset}}` (8:30 a.m. · 12:30 p.m. · 6:00 p.m. · 3:00 p.m.). "Other" opens a one-line input, CTA disabled until it has text, checked for crisis language; reset time then defaults to 3:00 p.m.
**Visual:** Stacked soft pill rows whose backgrounds warm from dawn peach to evening lavender down the list.
**Microcopy:** Progress hint: "Three more questions"
**CTA:** (auto-advances on tap)

### 12. What you've tried
**Purpose:** Shows respect for effort and lets the plan build on what already helps. No question touches medication or supplements.
**Headline A:** What have you tried?
**Headline B:** What has helped, even a little?
**Body A:** Pick any. We'll build on it.
**Body B:** Choose all that apply.
**Options:**
- 🚶 Walks
- 🧘 Meditation apps
- 📓 Journaling
- 🗣️ Talking to someone
- 🙅 Nothing yet
- ✏️ Other
**Field:** Multi-select, min 1. "Nothing yet" clears the other picks. "Other" opens a one-line input, checked for crisis language.
**Visual:** Stacked pills with a small line icon each, selected ones fill sage.
**Microcopy:** Never list or ask about medication, supplements, diets or alcohol. Disabled-CTA hint: "Pick at least one".
**CTA:** Continue

### 13. What would feel better
**Purpose:** The user states their own goal; the plan is worded around it. Goals are the user's, never outcomes Calmio promises.
**Headline A:** What would feel better?
**Headline B:** What do you want most?
**Body A:** Pick one. Your plan leans toward it.
**Body B:** You can change it anytime.
**Options:**
- 😮‍💨 Switching off
- 🫁 Feeling steadier
- 🧭 Handling pressure
- 🌙 Winding down
- ✏️ Other
**Field:** Single select, auto-advances on tap. Sets `{{goal}}`. "Other" opens a one-line input, CTA disabled until it has text, checked for crisis language.
**Visual:** Four soft cards with a line icon each; selected card fills sage. A small bud above.
**Microcopy:** Progress hint: "One more question"
**CTA:** (auto-advances on tap)

### 14. Name
**Purpose:** Captures `{{name}}`, which Calmio uses in the pattern and the first chat. A skipped name falls back to "you".
**Headline A:** What should Calmio call you?
**Headline B:** What's your first name?
**Body A:** A nickname is fine. Change it anytime.
**Body B:** So your conversations feel like yours.
**Field:** Text input, 1-20 chars, placeholder "Your name". Skippable: empty falls back to "you" everywhere.
**Visual:** Plain white input on off-white, small bud icon above.
**Error state:** "Add a name so Calmio knows what to call you"
**Skip link:** Skip for now
**CTA:** Continue

---

## C. Trust

### 15. Real people, real ratings
**Purpose:** The trust beat right after the investment stage and before the reveal. Proof has to be real; this category is where fake experts and fake stats do the most harm.
**Headline A:** {{app_rating}}★ from real people
**Headline B:** Private. Judgment-free. Yours.
**Body A:** {{rating_count}} ratings from people who've been there.
**Body B:** You choose what you share. Sharing is always your choice.
**Visual:** A: large rating number and sage star row, plus one real store review quoted as shown. B: three line rows (lock, eye-off, trash; trash row gated) on a white card. A renders only when `{{app_rating}}` and `{{rating_count}}` hold real store values; while either is still a token, every viewer sees B (no placeholder card, no dashed "review goes here" box).
**Microcopy:** Rating, count and reviews are unverified: route through `CONFIG` tokens, pull live from this app's own store listing, never hardcode, and never print "from real people" or "been there" over an unset token (fallback = B). Review cards are real store reviews only. No press logos, no "expert" or staff photos unless each is a real, named, credentialed person. B's "delete" row renders only when `CONFIG.deletion` is true (default off); no developer notes appear in the UI.
**CTA:** Continue

---

## D. Anticipation

### 16. Reading your pattern (loading)
**Purpose:** The wait makes the pattern feel built from the answers, and gives the strongest ad frame (the blooming flower as the tangle relaxes).
**Headline A:** Reading {{name}}'s stress pattern…
**Headline B:** Building {{name}}'s reset plan…
**Steps:**
1. Listening back to your answers… - 0→100%
2. Finding how stress moves through you… - 0→100%
3. Shaping your four-week reset plan… - 0→100%
4. Almost ready, your pattern awaits… - 0→100%
**Visual:** The flower bud blooms in the top half, the one hero object with depth and slow 3D motion, a tangle of lines smoothing behind it. Everything else fades. Four progress rows beneath: label left, % right, check when done, thin sage bars. With no name, "Reading your stress pattern…".
**Microcopy:** Chips from their answers ("Work", "After work") float up and fade.
**CTA:** (auto-advances, ~6-8 seconds)

### 17. Your stress pattern
**Purpose:** The personalized result, shown as a reflection and a plan, never a verdict or a score. It makes the paywall's "what you get" concrete and traceable to the answers.
**Headline A:** Your stress pattern: the {{pattern}}
**Headline B:** Here's how stress moves
**Body A:** {{pattern_line}}
**Body B:** A reflection, not a diagnosis. You can change it.
**Visual:** Top: flower illustration card with the pattern name. Under it three soft trait bars (Sprinting · Carrying · Juggling), the strongest highlighted, labelled "How stress moves through you". Below: a vertical path of four week cards, week 1 open (the sample: "2-minute reset chat + one micro-reset"), weeks 2-4 titles only. Weeks are goals for the plan, labelled as such.
**Microcopy:** Patterns: Sprinter ("You push hard, then crash.") · Carrier ("You hold everyone's load as your own.") · Juggler ("Too many things pull at you at once."). Pick = highest of Likert 2/3/4, ties broken by #5 (Work → Sprinter, Family → Carrier, Money or Health → Juggler), default Sprinter. Plan sample (Sprinter): "Spotting the sprint" · "Pausing before the push" · "Recovering well" · "Your reset rhythm". Sample prompt: "What is one task you can do at 80% today?" Footer: "Not a diagnosis. A starting point you can change." Never a severity score, gauge, stress-level number, hormone or body-marker reference.
**CTA:** Continue

### 18. Save your plan (email)
**Purpose:** Captures identity so the pattern, plan and chats persist, while the result is still warm.
**Headline A:** Where should we send it?
**Headline B:** Save your reset plan
**Body A:** Your pattern and first reset, kept safe.
**Body B:** No spam. Unsubscribe anytime.
**Field:** Email input. Marketing opt-in checkbox, unchecked by default: "Send me tips by email (optional)".
**Visual:** White input on off-white, the small bud above the headline. "Need help now?" still visible top-right.
**Error states:** "Enter a valid email address" · "That email has an account, sign in instead?"
**Microcopy:** Legal line: "By continuing you agree to the Terms and Privacy Policy."
**CTA:** Continue

### 19. First reset chat
**Purpose:** A taste of the loop before the paywall: two real exchanges (about two minutes), using `{{name}}` and the pattern. It proves the product before the price.
**Headline A:** Your first 2-minute reset
**Headline B:** Try a reset chat
**Body A:** Tap a reply or write your own.
**Body B:** Say as much or as little as you like.
**Options:** (sample for Sprinter)
- A deadline
- Always saying yes
- I'm not sure
- ✏️ Type your own
**Visual:** Chat screen on off-white, a "2 min" chip. AI-disclosure banner pinned top, opening bubble ("Hi {{name}}. Let's take two minutes. What's pressing on you right now?"), reply-idea rows above the composer. After the first reply Calmio reflects one line, offers one slow breath ("in for 4, out for 6") and asks: "What could you set down for today?" After the second it closes warmly ("That can wait. That's a reset: two minutes, one breath, one thing set down. Tomorrow we go a little further.") and the paywall opens.
**Microcopy:** Banner: "Calmio is an AI companion, not a therapist. In crisis? Call or text 988." Crisis language in any message pauses the scripted flow and shows the crisis sheet, human resources first; that path shows no sales line and, if the paywall is later closed, no fallback offer. After a crisis the screen shows a quiet "Skip to my plan" link. Calmio never says "I miss you" or "don't leave".
**Skip link:** Skip to my plan (shown only after a crisis message)
**CTA:** (auto-advances after 2 exchanges)

---

## F. Monetization

### 20. Paywall (web sales page)
**Purpose:** The one ask, as a long-scroll web page, placed right after the first chat. It sells the reset programme; every price and renewal term sits on the page in readable type.
**Headline A:** Your reset plan is ready
**Headline B:** {{name}}, start your first reset
**Body A:** Four weeks of resets and chats, made for you.
**Body B:** Price shown upfront. We remind you before renewing.
**Plans:** 1-week intro · **4-week, pre-selected** (matches the 4-week plan, ribbon "Matches your plan") · 12-week anchor. Every card shows `{{price_*}}` big and `then {{renewal_*}} / period` right under it, plus a per-week equivalent `{{week_*}}`. No percent-off badge, no struck price, no decoy.
**Visual:** Sticky brand bar with close (×) and the persistent "Need help now?" link. Sections in order: personal hero (their pattern card and four fact chips: pattern, peaks, goal, plan length) · plan block (cards, "Due today" row, CTA, payment badges, secure/cancel row, renewal line) · what's inside (the four weeks as a TOC) · how it works (3 steps) · proof ("What people say": rating and real store reviews only; the whole block is hidden while the values are tokens) · FAQ (is this therapy, does it lower cortisol or stress hormones, how to cancel, will I be charged again, who sees my chats, what if I'm in crisis) · plan block again · legal. A sticky bottom CTA slides up while no plan block is visible.
**Microcopy:** Each stat or review is gated on a real value (not a `{{token}}`); no dashed placeholders are shown. Under the CTA at body size: "Renews at {{renewal_4w}} every 4 weeks until you cancel. Cancel anytime in your account." Reminder line: "We'll email you before every renewal." No guarantee or refund block is shown until `{{refund_days}}` and its full terms exist (gated on tokens). Always shown: "Crisis resources are always free." Not shown on this page: timers, promo codes, "no charge yet" wording, usage counters, hormone or health-outcome claims.
**Fallback offer:** #21 (a smaller one-time pack, not a cheaper copy of a tier). Every way off this page without paying (× and "Not now") goes to #21 first, once per session. Declining it, or closing the paywall a second time, leads to #22 in free mode.
**CTA:** Start my plan

### 21. A smaller step (one-time offer, shown on close)
**Purpose:** A second, softer chance for people who closed #20 because a subscription felt like a lot: a genuinely smaller product, paid once. Shown once, never after crisis language.
**Headline A:** A smaller step, {{name}}
**Headline B:** Start with a smaller step
**Body A:** A 7-day starter pack, paid once. No subscription.
**Body B:** Seven micro-resets. Nothing to cancel.
**Plans:** One offer card, a different and smaller product than every #20 tier: `{{offer_name}}` (demo: "Starter reset pack"), `{{offer_price}}` paid once, no renewal, no strike-through price, no comparison to the plans. Includes: 7 guided micro-resets (one a day), the user's stress pattern saved to their email, a reminder at `{{reset}}`. Not included (stated on the card): the 4-week plan, daily reset chats, journaling prompts. Optional `{{offer_badge}}`. Buying it unlocks only the 7 micro-resets in #22; the rest stays behind the subscription.
**Visual:** Same web look as #20: sticky bar with close ×, Calmio wordmark and "Need help now?". Centered eyebrow "One-time offer · shown once", one sage-bordered card with a calm thumbnail, pack name, price row ("{{offer_price}} paid once"), 3 checks, a "Not included" line, CTA, payment badges and a "paid once, nothing to cancel" line. Below: "Crisis resources are always free."
**Microcopy:** Price line at body size: "{{offer_price}} paid once. No renewal, nothing to cancel." No timer: `CONFIG.offer.expiresMin` stays null, and there is no "last chance", "offer ends" or "don't miss out" wording. Never shown after crisis language (free text or the #19 chat, which opens the crisis sheet). Merely opening "Need help now?" does not suppress it. Decline link: "No thanks, keep the free reset". Events: `offer_view`, `offer_accept` + `checkout_click`, `offer_decline`.
**CTA:** Get the starter pack

---

## G. Payoff

### 22. Today's first reset
**Purpose:** Close the loop and drop the user into the first real daily reset, so the first session ends inside the product.
**Headline A:** Your reset starts now
**Headline B:** Welcome in, {{name}}
**Body A:** Your daily reset opens at {{reset}}. Or start now.
**Body B:** Come back anytime. Calmio is here.
**Visual:** Calm garden photo header fading to off-white, the 3D flower fully open as the hero. A "Today's reset · 2 min" card with the pattern prompt, a reminder row (toggle off by default) "Remind me at {{reset}}", tab bar below (Today, Chat, Journal, Me).
**Microcopy:** Subscribers get the full reset and week 1. Free mode shows the 2-minute reset and a quiet "Unlock your plan" row, never a pop-up. No rating prompt here; ask only after a completed reset on day 3 or later. Reminder push text carries no topic words (no "stress", no theme names), max one a day, no guilt.
**CTA:** Start today's reset

---

## Notes

- **Archetype call.** Plan subscription after a data quiz -> personalization-quiz, Calmio variant (see Known variants in `archetypes/personalization-quiz.md`). Borrowed from companion-chat: the first live chat before the paywall (#19). Skipped from the default: decoy tier, countdown upsell, before/after screen, separate premium-preview screen (the plan on #17 does that job), gamified wheel.
- **Mental-health safety, built in.** "Need help now?" on all 22 screens and on the web paywall and offer bars · expectations screen (#4) before any stress or body question, with an explicit "can't measure or change stress hormones" row · crisis detection on every free-text field (#5, #6, #11, #12, #13, #19) · minors blocked with youth resources (#3) · no medication, supplement, diet or alcohol questions · no clinical labels, scores or gauges. Crisis help is never behind the paywall. Clinical and legal review should cover #3, #4, #17 and the crisis sheet, including non-US helplines.
- **Competitor mechanics - reference only, NOT implemented:** diet and fasting offers, "cortisol belly" and weight framing, "cortisol detox" and hormone-balancing claims, any biomarker or "cortisol level" read-out, fake MD or nutritionist bylines, advertorial "women 45+" testimonial stories, "% improved" stats, personalised promo codes, countdown timers, scratch-card discount, discount against a never-charged anchor, renewal far above the intro price.
- **Plans are placeholders.** The structure (1-week / 4-week pre-selected / 12-week anchor) mirrors the competitor layout. All prices are `{{price_*}}` / `{{renewal_*}}` tokens; the offer is a separate one-time SKU (`{{offer_price}}`, no renewal) to be created in the store. The real Calmio store lists 1-month and 3-month SKUs (see `mental-health/calmio`); align SKUs before launch. Renewal is shown beside every price and a pre-renewal email is promised, so it must be built.
- **Unverified.** Calmio's real in-app onboarding and tone settings, the free-tier scope (the demo assumes the 2-minute reset stays free), the app-store rating, reviews and any refund window were not viewable; those blocks are placeholders behind tokens and hidden or dashed until real values exist. Competitor flows come from the `calmio.md` research summary, not a live capture. Plan weeks are goals derived from answers, not promised outcomes. **Privacy copy is unverified:** "You choose what you share" and "Sharing is always your choice" are not confirmed by product; the "delete your data/chats anytime" row is hidden unless `CONFIG.deletion` is true (only when in-app deletion exists).
- **Likert-to-pattern mapping is our own design,** not taken from a competitor: the highest of statements 2, 3 and 4 picks the type, #5 sources break ties. It needs clinical review. Statement 1 only sets plan pacing.
- **Free text is not diagnosed.** Likert answers only pick one of three reflective pattern types. They are never summed into a score shown to the user.
- **Drop-off risk:** #3 age gate · #7-10 four statements in a row (one tap each, with a weather scale and an "x of 4" chip) · #18 email · #20 paywall. Keep #16 at 6-8 s.
- **Measure separately:** paywall CVR at #20 · offer CVR at #21 (apart from #20) · free-mode to subscribe later · D1/D7 return at the reset time · refund and chargeback rate (the honesty metric).
- **A/B first:** (1) #1 "Always on, never calm?" vs "Stress won't switch off?" (2) #19 chat before vs after #18. (3) #17 with vs without the three trait bars. (4) #20 4-week pre-selected vs 12-week pre-selected.
- **Demo (private Artifact):** https://claude.ai/artifact/Y24WWiUN3yGW1pCeMtdVs1
