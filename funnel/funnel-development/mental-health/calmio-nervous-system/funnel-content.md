---
niche: calmio-nervous-system
display_name: Calmio - Calm Reset for the Wound-Up and Worn-Out (AI wellbeing companion - 18+)
archetype: personalization-quiz
subject: person
input: age (18+ gate), six everyday signs, when it is hardest, how they feel right now (wired / shut down / a bit of both), what they would try, name, email
output: a regulation profile (Revved up, Powered down or Seesaw) plus "this week, 3 practices", a 4-week calm plan, and a guided 60-second breathing exercise that runs inside the funnel
screens: 21
monetization: one plan subscription (1-week intro / 4-week pre-selected / 12-week anchor, renewal shown on every price, pre-renewal email), dismissible web paywall, one one-time "Calm Week" pass on close (paid once, no renewal, no timer), no other upsell layer
creative_screens:
  hook-a: 1
  hook-b: 2
  loader: 16
  reveal: 17
  breathing: 17
motion: >
  a tight, scribbled knot of lines slowly loosens into one smooth wave while a
  sage-and-lavender flower bud breathes in and out, and a soft chat bubble
  types "Let's slow it down."
---

# Funnel Content - Calmio: Calm Reset (nervous-system regulation niche)

Calmio is a chat-based AI companion for reflective conversation (18+, "a companion, not a therapist"). This is the **stress-response / "can't switch off"** niche: the user who feels wired (racing mind, tense body, on edge), or the opposite (numb, foggy, drained), or a swing between both. They give six easy taps about everyday signs. They get a **regulation profile** (Revved up, Powered down or Seesaw, a soft reflection and never a score), **"this week, 3 practices"**, a **4-week calm plan**, and a **real 60-second breathing exercise** they can do right on the result screen, before any price is shown.

**Reference funnels (research `gaps.md` section 3, unverified):** the brand HarmonyApps has no nervous-system funnel in AdSpyLab (its only capture is an unrelated subscription-tracker quiz, 2026-09-29). The spine is assembled from the closest analogues: Liven (quiz.theliven.com, 62 screens, captured 2026-09-28), InnerFlo's "calm your nervous system" paywall copy, and the app-store "Nervous System Quiz -> state -> plan" pattern (Settle, NEUROFIT). **That spine is inferred (I), not captured screen by screen, so the question order is unverified.** Paywall norm taken from Liven: 1-week intro / 4-week / 12-week.

**Deliberately different from the references:** no "Nervous System Score" or "68/100", no "freeze / fawn / trauma" labels, no vagus-nerve or cortisol science screen, no "detox" or "healing" language, no pre-set scratch-card or timer, no expert persona. The state question is two plain words (wired, shut down) and the result is one of three soft styles. Practices are suggested goals, never outcome promises. A short breathing exercise runs for real before the paywall, renewal terms sit next to every price, and "Need help now?" is on every screen and never paywalled.

**Visual override (same as `mental-health/calmio`):** soft light theme, warm off-white, sage green and muted lavender, rounded sans, lots of air, the flower as the one hero object. The "wound-up" feel comes from a loosening knot of lines in the hook, not from a dark or loud UI.

---

## A. Hook

### 1. Hook A - Fight-or-flight
**Purpose:** Meet the "stuck on high alert" before-state with the brand promise, without asking for anything or naming a condition.
**Headline A:** Stuck in fight-or-flight?
**Headline B:** Can't switch off?
**Body A:** Short guided resets for body and mind.
**Body B:** A few taps, then a 60-second breath.
**Visual:** Warm off-white with a lavender wash. A tight scribbled knot of thin lines drifts at the top, then slowly loosens into one smooth wave. A sage flower bud breathes beneath. One soft bubble: "Let's slow it down." Sage button pinned bottom. "Need help now?" link top-right, persistent on every screen to #21.
**Microcopy:** Under CTA: "18+ · Calmio is AI and not a substitute for professional care". "Need help now?" opens the crisis sheet: "Call or text 988 (US) · Outside the US: findahelpline.com · In danger now? Call your local emergency number." One tap, no sign-in, no paywall. Ad copy never says "you have" anything; the hook names a feeling, not a diagnosis.
**CTA:** Get started

### 2. Hook B - Calm in small doses
**Purpose:** Show the core surface (a short practice plus a companion) so the user knows what they would be doing.
**Headline A:** Calm in small doses.
**Headline B:** Slow down, together.
**Body A:** Short guided practices and a companion to talk to.
**Body B:** Breathe, reflect, reset. One minute at a time.
**Visual:** Card on off-white with a slow breathing ring and three chat bubbles fading in (user: "I can't switch off at night." / Calmio: "Let's slow your breathing first." / user typing dots). "AI companion" chip above, a small calm-room photo on the card.
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
**Purpose:** The honest expectations beat and the safety net, placed before the questions about how the body and mind feel. It is also the trust screen the category most needs.
**Headline A:** A companion, not a therapist
**Headline B:** Before we begin, one promise
**Body A:** It guides calming practices. It doesn't diagnose or treat.
**Body B:** For crisis or medical care, please reach real people.
**Visual:** Five icon rows on a white card (chat bubble, lock, lifebuoy, wind, list). Sage icons, generous spacing, nothing else on screen.
**Microcopy:** Rows: "Calmio is AI, and always says so" · "Your chats stay private" · "In crisis? Call or text 988 (US) or visit findahelpline.com" · "Breathing is gentle. Stop anytime, and breathe normally, if you feel dizzy." · "Calmio shares practices and reflections. It does not give medical advice." Footer: "Calmio does not provide medical advice, diagnosis or treatment. Not for use in place of care for anxiety, panic or trauma."
**CTA:** I understand

### 5. Sign 1 - Racing mind
**Purpose:** First cheap tap, phrased as an everyday feeling. The six sign answers only pick which two signs appear as "You noticed" on the result.
**Headline A:** Mind racing at night?
**Headline B:** Thoughts won't slow down?
**Body A:** Lately, how often does this fit?
**Body B:** Pick the closest. No wrong answer.
**Options:**
- 🔥 Often
- 🌗 Sometimes
- 🌿 Rarely
**Field:** Single select, auto-advances on tap.
**Visual:** Three stacked pills, selected fills sage with a check. A small closed bud sits at the top.
**CTA:** (auto-advances on tap)

### 6. Sign 2 - Tension
**Purpose:** Body-level sign in neutral words.
**Headline A:** Tense jaw or shoulders?
**Headline B:** Body holding tension?
**Body A:** Lately, how often does this fit?
**Body B:** Pick the closest. No wrong answer.
**Options:**
- 🔥 Often
- 🌗 Sometimes
- 🌿 Rarely
**Field:** Single select, auto-advances on tap.
**Visual:** Same pill stack as #5, two-step progress chip "Sign 2 of 6".
**CTA:** (auto-advances on tap)

### 7. Sign 3 - On edge
**Purpose:** Irritability and jumpiness sign, kept to everyday wording.
**Headline A:** Easily on edge?
**Headline B:** Quick to feel irritable?
**Body A:** Lately, how often does this fit?
**Body B:** Pick the closest. No wrong answer.
**Options:**
- 🔥 Often
- 🌗 Sometimes
- 🌿 Rarely
**Field:** Single select, auto-advances on tap.
**Visual:** Same pill stack, chip "Sign 3 of 6".
**CTA:** (auto-advances on tap)

---

## C. Trust

### 8. Private by design
**Purpose:** The trust beat at the middle of the quiz, right after the first sensitive taps. It doubles as the breather before the next three. Proof has to be real; this category is where fake experts and fake stats do the most harm. The rating block ships only when real store data exists.
**Headline A:** Private. Judgment-free. Yours.
**Headline B:** Your answers stay yours.
**Body A:** Your chats stay private. Nothing is ever public.
**Body B:** No judging, no streak guilt.
**Visual:** Three lucide rows (lock, eye-off, trash) on a white card. The row "delete" ships only if in-app deletion exists. When `{{app_rating}}` and `{{rating_count}}` are real, a rating card with a real store review appears above the rows; while they are tokens the card is hidden.
**Microcopy:** Pull rating and count live from this app's own store listing, never hardcode, never in the headline. Review cards are real store reviews only, quoted as shown. No press logos, no "expert" or staff photos unless each is a real, named, credentialed person.
**CTA:** Continue

---

## B2. Investment (continued)

### 9. Sign 4 - Can't unwind
**Purpose:** Wired-side sign about evenings and work.
**Headline A:** Hard to switch off?
**Headline B:** Can't unwind after work?
**Body A:** Lately, how often does this fit?
**Body B:** Pick the closest. No wrong answer.
**Options:**
- 🔥 Often
- 🌗 Sometimes
- 🌿 Rarely
**Field:** Single select, auto-advances on tap.
**Visual:** Same pill stack, chip "Sign 4 of 6".
**CTA:** (auto-advances on tap)

### 10. Sign 5 - Numb or foggy
**Purpose:** Shut-down-side sign, phrased as a feeling and never as "freeze" or "dissociation".
**Headline A:** Feeling numb or foggy?
**Headline B:** Zoning out lately?
**Body A:** Lately, how often does this fit?
**Body B:** Pick the closest. No wrong answer.
**Options:**
- 🔥 Often
- 🌗 Sometimes
- 🌿 Rarely
**Field:** Single select, auto-advances on tap.
**Visual:** Same pill stack, chip "Sign 5 of 6".
**CTA:** (auto-advances on tap)

### 11. Sign 6 - Tired but wired
**Purpose:** The "both" sign that makes the Seesaw profile feel recognised.
**Headline A:** Drained but wired?
**Headline B:** Tired, yet can't rest?
**Body A:** Lately, how often does this fit?
**Body B:** Pick the closest. No wrong answer.
**Options:**
- 🔥 Often
- 🌗 Sometimes
- 🌿 Rarely
**Field:** Single select, auto-advances on tap.
**Visual:** Same pill stack, chip "Sign 6 of 6".
**CTA:** (auto-advances on tap)

### 12. When it's hardest
**Purpose:** Sets `{{worst}}` and the reminder time `{{nudge}}`, used on the result and the payoff.
**Headline A:** When is it hardest?
**Headline B:** When does it peak?
**Body A:** Pick the closest time.
**Body B:** We time your reset around it.
**Options:**
- 🌅 Mornings
- ☀️ During the day
- 🌙 At night
- 🔀 It shifts
- ✏️ Other
**Field:** Single select, auto-advances. Sets `{{nudge}}`: 8:00 AM · 1:00 PM · 9:30 PM · 6:30 PM · 6:30 PM. "Other" opens a one-line input, CTA disabled while empty, crisis-checked.
**Visual:** Stacked soft pill rows with a sunrise-to-night gradient behind the unselected pills.
**CTA:** (auto-advances on tap)

### 13. How you feel now
**Purpose:** The state question. It picks the profile and the breathing pattern. Two plain words, no clinical labels.
**Headline A:** Right now, you feel…
**Headline B:** Where are you today?
**Body A:** Pick the closest one.
**Body B:** It can change. That's fine.
**Options:**
- ⚡ Wired
- 🧊 Shut down
- 🔀 A bit of both
- ✏️ Other
**Field:** Single select, auto-advances. Mapping: wired -> Revved up, shut down -> Powered down, both -> Seesaw, other -> Seesaw. "Other" opens a one-line input, CTA disabled while empty, crisis-checked.
**Visual:** Stacked pill rows, selected row fills sage with a check.
**CTA:** (auto-advances on tap)

### 14. What would help
**Purpose:** The personalization core. The picks become the three practices for this week.
**Headline A:** What would you try?
**Headline B:** What helps you most?
**Body A:** Pick all that appeal.
**Body B:** Choose any. You can change it later.
**Options:**
- 🌬️ Breathing
- 🧘 Body check-ins
- 📓 Writing it out
- 💬 Talking it through
- 🚶 Gentle movement
- ✏️ Other
**Field:** Multi-select, min 1 to enable the CTA. "Other" opens a one-line input; the CTA stays disabled until it has text. Free text passes through crisis-language detection before continuing.
**Visual:** Stacked pills with an emoji each, selected ones fill sage.
**Microcopy:** Disabled-CTA hint: "Pick at least one". Crisis detection on "Other": if matched, show the crisis sheet from #1 with "Talk to a person now" first and "Continue with Calmio" second. Never block the user, never ask them to explain.
**CTA:** Continue

### 15. Name
**Purpose:** Captures `{{name}}`, which Calmio uses in the loader, result and payoff. A skipped name falls back to "you".
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

## D. Anticipation

### 16. Tuning your reset (loading)
**Purpose:** The wait makes the profile feel built from the answers and gives the strongest ad frame (a knot of lines loosening under a breathing flower).
**Headline A:** Tuning {{name}}'s reset…
**Headline B:** Building {{name}}'s calm plan…
**Steps:**
1. Reading what you shared… - 0→100%
2. Matching your pace… - 0→100%
3. Choosing a breathing pattern… - 0→100%
4. Almost ready, your reset awaits… - 0→100%
**Visual:** The flower bud breathes in the top half, the one hero object with depth and slow 3D motion. Everything else fades. Four progress rows beneath: label left, % right, check when done, thin sage bars. Chips from their answers ("At night", "Wired", "Breathing") float up and fade. With no name, "Tuning your reset…".
**CTA:** (auto-advances, ~6-8 seconds)

### 17. Your regulation profile + 60-second breath
**Purpose:** The personalized result: a reflection, three small practices and a **real, running 60-second breathing exercise**. The user feels the product before the price. It is a reflection and never a verdict or a score.
**Headline A:** You're {{profile}}
**Headline B:** Try your first reset
**Body A:** {{profile_line}}
**Body B:** One minute, right here, any time.
**Visual:** Top: flower card with the profile name and four fact chips (you noticed, hardest time, right now, nudge time). Under it a breathing card: a large soft ring that grows for the in-breath and shrinks for the out-breath, a live "Breathe in" / "Breathe out" label, a 60-second countdown and a thin progress bar. Buttons: "Start 60 seconds" and, while running, "Stop". On finish: "Nice. Notice how you feel." with a quiet three-way check ("Calmer" / "The same" / "Not sure") that is only stored, never scored. Under it "This week, 3 practices" as three numbered cards, then the four week titles of the calm plan, week 1 open. Footer: "A reflection, not a diagnosis. A starting point you can change."
**Microcopy:** Profiles: Revved up ("Your mind runs fast and your body follows.") · Powered down ("Things feel dim and heavy, so you pull back.") · Seesaw ("You swing between wired and worn out."). Breathing pattern follows #13: wired = in 4 / out 6, shut down = in 4 / out 4 with "feel your feet on the floor", both = in 4 / out 5. Safety line under the ring: "Feeling dizzy? Stop and breathe normally." The exercise is a general relaxation practice; no copy says it treats, regulates, rewires or heals anything, and no vagus-nerve, cortisol or trauma claim appears. The three practices come from #14 and are suggested goals, never promises. No score, gauge or clinical label. CTA stays enabled while the exercise runs or if skipped.
**CTA:** Continue

### 18. Save your plan (email)
**Purpose:** Captures identity so the profile, plan and chats persist, while the result is still warm.
**Headline A:** Where should we send it?
**Headline B:** Save your calm plan
**Body A:** Your profile and three practices, kept safe.
**Body B:** No spam. Unsubscribe anytime.
**Field:** Email input. Marketing opt-in checkbox, unchecked by default: "Send me tips by email (optional)".
**Visual:** White input on off-white, the small bud above the headline. "Need help now?" still visible top-right.
**Error states:** "Enter a valid email address" · "That email has an account, sign in instead?"
**Microcopy:** Legal line: "By continuing you agree to the Terms and Privacy Policy."
**CTA:** Continue

---

## F. Monetization

### 19. Paywall (web sales page)
**Purpose:** The one ask, as a long-scroll web page, placed right after the breathing exercise. It sells the 4-week calm plan; every price and renewal term sits on the page in readable type.
**Headline A:** Your calm plan is ready
**Headline B:** {{name}}, start your reset
**Body A:** Four weeks of short practices, made for you.
**Body B:** Price shown upfront. We remind you before renewing.
**Plans:** 1-week intro · **4-week, pre-selected** (matches the 4-week plan, ribbon "Matches your plan") · 12-week anchor. Every card shows `{{price_*}}` big and `then {{renewal_*}} / period` right under it, plus a per-week equivalent `{{week_*}}`. No percent-off badge, no struck price, no decoy.
**Visual:** Sticky brand bar with close (×) and the persistent "Need help now?" link. Sections in order: personal hero (their profile card and four fact chips: you noticed, hardest time, nudge time, plan length) · plan block (cards, "Due today" row, CTA, payment badges, secure/cancel row, renewal line) · what's inside (the four weeks as a TOC) · how it works (3 steps) · proof (rating and reviews, shown only when real, hidden while tokens) · refund block (shown only when `refundDays` and terms are real) · FAQ (is this therapy, will it fix my anxiety or stress, how to cancel, will I be charged again, are chats private, what if I'm in crisis) · plan block again · legal. A sticky bottom CTA slides up while no plan block is visible.
**Microcopy:** Under the CTA at body size: "Renews at {{renewal_4w}} every 4 weeks until you cancel. Cancel anytime in your account." Reminder line: "We'll email you before every renewal." Always shown: "Crisis resources are always free." Not shown on this page: timers, promo codes, "no charge yet" wording, usage counters, outcome claims, medical claims.
**Fallback offer:** #20. Every way off this page without paying (× and "Not now") goes to #20 first, once per session. Declining it, or closing the paywall a second time, leads to #21 in free mode.
**CTA:** Start my plan

### 20. One-time offer - Calm Week pass (shown on close)
**Purpose:** A second, smaller chance for people who closed #19 because a subscription felt like a lot. Shown once, never after crisis language.
**Headline A:** Just need a calm week?
**Headline B:** One-time offer, shown once
**Body A:** A smaller pass, paid once. No subscription.
**Body B:** One week, your three practices.
**Plans:** One offer card, a different and smaller product than any paywall tier: `{{offer_name}}` (the Calm Week pass), `{{offer_price}}` paid once, 7 days, no renewal, no strike-through price (there is no same-length plan to compare to). Includes this week's three practices, guided breathing sessions for the week, and the plan saved to the email. Not included (stated on the card): the 4-week calm plan, weekly check-ins, reminders. Optional `{{offer_badge}}`. It is not the 1-week intro tier, which auto-renews.
**Visual:** Same web look as #19: sticky bar with close ×, Calmio wordmark and "Need help now?". Centered eyebrow "One-time offer · shown once", one sage-bordered card with a calm thumbnail, offer name, price row ("once"), 3 checks, a "Not included" line, CTA, payment badges, a "paid once, nothing to cancel" line (and a refund line only when `refundDays` is real). Below: "Crisis resources are always free."
**Microcopy:** No timer: `CONFIG.offer.expiresMin` stays null, and there is no "last chance", "offer ends" or "don't miss out" wording. Never shown after crisis language (free text on #12, #13 or #14). Merely opening "Need help now?" does not suppress it. Decline link: "No thanks, keep the free plan". Events: `offer_view`, `offer_accept` + `checkout_click`, `offer_decline`.
**CTA:** Get the calm week

---

## G. Payoff

### 21. Your reset starts now
**Purpose:** Close the loop and drop the user into the first of their three practices, so the first session ends inside the product.
**Headline A:** Your reset starts now
**Headline B:** Welcome in, {{name}}
**Body A:** First up, one small practice. Start when ready.
**Body B:** Come back anytime. Calmio is here.
**Visual:** Calm light photo header fading to off-white, the 3D flower fully open as the hero. A "Today's one practice · {{practice_size}}" card with the first practice, a reminder row (toggle off by default) "Remind me at {{nudge}}", tab bar below (Today, Chat, Plan, Me).
**Microcopy:** Subscribers get the full plan and weekly check-ins. Free mode shows the first practice and a quiet "Unlock your plan" row, never a pop-up. No rating prompt here; ask only after a finished practice on day 3 or later. Reminder push text carries no topic words (no "stress", "anxiety", no practice names), max one a day, no guilt.
**CTA:** Start my first step

---

## Notes

- **Archetype call.** Plan subscription after a data quiz -> personalization-quiz, Calmio variant (see Known variants in `archetypes/personalization-quiz.md`). Borrowed: a live, interactive micro-practice (the 60-second breath on #17) in place of the companion-chat of `calmio-life-planner`. Skipped from the default: decoy tier, countdown upsell, before/after screen, gamified wheel, score screen.
- **Mental-health safety, built in.** "Need help now?" on all 21 screens and on the web paywall and offer bars · expectations screen (#4) before any feeling question · crisis detection on every free-text field (#12, #13, #14) · minors blocked with youth resources (#3) · dizziness note on the breathing exercise · no medication questions · no clinical labels, scores or gauges · no trauma, panic or anxiety wording in the questions. Crisis help is never behind the paywall. Clinical and legal review should cover #3, #4, #17 and the crisis sheet, including non-US helplines.
- **Claims we do not make (risk list from research).** No vagus nerve, no cortisol, no "rewire", "heal" or "trauma" language, no "nervous system score", no fight/flight/freeze/fawn typology. Fight-or-flight appears only as the everyday phrase in Hook A; clinical review should confirm that wording and decide whether Meta ad policy needs a softer variant. The six sign questions are written as common feelings, not symptoms of a condition.
- **Competitor mechanics - reference only, NOT implemented:** "Nervous System Score" out of 100, a dominant-state label, the "28-day somatic reset" promise, pre-set scratch-card discount, fake testimonials in the loader, "cortisol detox" framing.
- **Plans are placeholders.** The structure (1-week / 4-week pre-selected / 12-week anchor) mirrors the competitor layout. All prices are `{{price_*}}` / `{{renewal_*}}` tokens. The real Calmio store lists 1-month and 3-month SKUs (see `mental-health/calmio`); align SKUs before launch. The offer's one-time SKU `{{offer_price}}` must exist as a non-renewing product at checkout. Renewal is shown beside every price and a pre-renewal email is promised, so it must be built.
- **Unverified.** The entire flow is inferred (research marks the spine "I"): no captured screens exist for a HarmonyApps nervous-system funnel, so the question order, the three-profile split and the breathing patterns are our own design. Calmio's real in-app onboarding, the free-tier scope (the demo assumes the first practice and the breathing exercise stay free), the app-store rating, the refund window and the review texts were not viewable; rating, reviews and refund blocks are token-gated and hidden until real values exist. The style mapping from #13 needs clinical review.
- **Images:** `gen_images.py` is ready, but no `IKAME_AI_KEY` was available when this demo was built, so `img/` holds calm stand-in photos copied from `mental-health/calmio-stress` under their old names. Run `IKAME_AI_KEY=... python3 gen_images.py --force` to produce the final ones (names: hook-night, hook-calm, topic-calm, payoff-dawn; the demo's `IMG` map already lists them).
- **Drop-off risk:** #3 age gate · #5-#14 ten taps (kept to one tap each, #8 trust beat in the middle) · #18 email · #19 paywall. Keep #16 at 6-8 s. The 60-second breath on #17 is optional, so it never blocks the path.
- **Measure separately:** breathing start and completion rate on #17 · paywall CVR at #19 · offer CVR at #20 (apart from #19) · free-mode to subscribe later · D1/D7 return at the nudge time · refund and chargeback rate (the honesty metric).
- **A/B first:** (1) #1 "Stuck in fight-or-flight?" vs "Can't switch off?" (2) #17 with vs without the live breathing card. (3) #5-#11 six sign taps vs two. (4) #19 4-week pre-selected vs 12-week pre-selected.
- **Demo (private Artifact):** https://claude.ai/artifact/15FBSjkagHi3M4m2uJUESX
