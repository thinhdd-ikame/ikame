---
niche: calmio-overthinking
display_name: Calmio - Overthinking at Night (AI wellbeing companion - 18+)
archetype: personalization-quiz
subject: person
input: age (18+ gate), when the mind gets loud, four Likert statements, recurring themes, next-day impact, what they tried, bedtime, name, email
output: a night-mind profile (Replayer, Planner or Worrier) plus a 4-week evening-unload plan and a first 3-minute wind-down chat
screens: 22
monetization: one plan subscription (1-week intro / 4-week pre-selected / 12-week anchor, renewal shown on every price, pre-renewal email), dismissible web paywall, one gentle one-time fallback offer on close (no timer), no other upsell layer
creative_screens:
  hook-a: 1
  hook-b: 2
  loader: 16
  reveal: 17
  first-chat: 19
motion: >
  a thread of looping thought-lines above a crescent moon slowly smooths into one
  calm curve while a sage flower bud opens petal by petal and a soft chat bubble
  types "Still up? I'm here."
---

# Funnel Content - Calmio: Overthinking at Night

Calmio is a chat-based AI companion for reflective conversation (18+, "a companion, not a therapist"). This is the **night-time overthinking** niche: the user whose mind gets loud the moment the day goes quiet. They give a handful of gentle answers about when it happens and what it circles. They get a **night-mind profile** (Replayer, Planner or Worrier), a **4-week "evening unload" plan** (one journaling prompt plus a 10-minute chat each evening) and a real first 3-minute wind-down chat before the paywall. **Archetype: personalization-quiz** (Calmio mental-health variant, as in `mental-health/calmio`): money is a plan subscription sold after a data quiz, not a per-message meter. It borrows the first live conversation from companion-chat. 22 screens, A/B copy on every one.

**Reference funnels (competitor teardown, AdSpyLab Funnels Library, captured 2026-09-28/29):** Innerflo Sleep Cards (`innerflo.me/sleepcards/1`, 1,303 ads, 44 screens), the healthhorizon.news advertorial that feeds it (879 ads, 40 screens), and Calm `quiz.calm.com/calm-cbe69` (1,557 ads, 31 screens, overthinking / burnout). Calmio itself runs only the advertorial route in this niche, so this is the first app-side funnel for it. The four Likert statements follow the shape those quizzes use ("As soon as it's quiet, I can't escape my thoughts").

**Deliberately different from the references:** no "insomnia severity" score or any clinical label (the profile is a reflection with three soft traits). No questions about sleeping pills or medication, and no pill-fear copy. No "% faster / % improved" claims, no fake MD byline, no EMDR or binaural claims. No timer, no promo code, no scratch card, no "-60%" against an invented anchor: the only struck price is the real current 4-week price on the fallback offer. A real 3-minute chat runs before the paywall, and renewal terms sit next to every price. A "Need help now?" link is on every screen and is never paywalled.

**Visual override (same as `mental-health/calmio`):** soft light theme, warm off-white, sage green and muted lavender, rounded sans, lots of air, the flower as the one hero object. The night feel comes from a dusk-lavender hook scene with a crescent moon and from moon-phase answer scales, not from a dark UI (dark screens at night feel harsh for this audience and break contrast with the sage CTA). Confirm against the real brand kit.

---

## A. Hook

### 1. Hook A - Loud mind
**Purpose:** Meet the 2 a.m. "before" state with the brand promise, without asking for anything.
**Headline A:** Mind loud at 2 a.m.?
**Headline B:** Still awake? Let's unload.
**Body A:** A calm companion for the thoughts that won't switch off.
**Body B:** Talk it out before bed. No judgment.
**Visual:** Dusk-lavender sky fading to warm off-white, a crescent moon, a tangle of thin looping lines that slowly relax into one gentle curve. A sage flower bud breathes (in 4s, out 4s) beneath. One soft bubble: "Still up? I'm here." Sage button pinned bottom. "Need help now?" link top-right, persistent on every screen to #22.
**Microcopy:** Under CTA: "18+ · Calmio is AI and not a substitute for professional care". "Need help now?" opens the crisis sheet: "Call or text 988 (US) · Outside the US: findahelpline.com · In danger now? Call your local emergency number." One tap, no sign-in, no paywall.
**CTA:** Get started

### 2. Hook B - Unload before bed
**Purpose:** Show the core surface (a short evening conversation that sets the day down) so the user knows what they would be doing.
**Headline A:** Set the day down.
**Headline B:** Ten minutes to unload.
**Body A:** Chat through what's looping, then close the day.
**Body B:** A short evening chat and one journaling prompt.
**Visual:** Card on off-white with three chat bubbles fading in (user: "I keep replaying that meeting." / Calmio: "That sounds tiring. What part keeps coming back?" / user typing dots). "AI companion" chip above, a small moon-and-flower mark on the card photo.
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
**Purpose:** The honest expectations beat and the safety net, placed before the questions about thoughts and nights. It is also the trust screen the category most needs.
**Headline A:** A companion, not a therapist
**Headline B:** Before we begin, one promise
**Body A:** It helps you reflect. It doesn't diagnose or treat.
**Body B:** For crisis or medical care, please reach real people.
**Visual:** Four icon rows on a white card (chat bubble, lock, lifebuoy, moon). Sage icons, generous spacing, nothing else on screen.
**Microcopy:** Rows: "Calmio is AI, and always says so" · "Your chats stay private" · "In crisis? Call or text 988 (US) or visit findahelpline.com" · "Calmio is not a treatment for sleep problems. If they last, a doctor can help." Footer: "Calmio does not provide medical advice, diagnosis or treatment."
**CTA:** I understand

### 5. When it gets loud
**Purpose:** The first cheap tap. It frames the problem in the user's own moment and sets `{{when}}`, which the chat opener and the plan reuse.
**Headline A:** When is your mind loudest?
**Headline B:** When do thoughts get loud?
**Body A:** Pick the one that happens most.
**Body B:** No wrong answer. Just your nights.
**Options:**
- 🛏️ Right at bedtime
- 🌙 Waking in the night
- 🌆 Quiet evenings
- 🔄 Any quiet moment
- ✏️ Other
**Field:** Single select, auto-advances on tap. "Other" opens a one-line input; the CTA stays disabled until it has text. Any free text passes through crisis-language detection before continuing.
**Visual:** Stacked soft pill rows, white fill, selected row fills sage with a check. A small closed bud sits at the top.
**Microcopy:** Crisis detection on "Other": if matched, show the crisis sheet from #1 with "Talk to a person now" first and "Continue with Calmio" second. Never block the user, never ask them to explain.
**CTA:** (auto-advances on tap)

### 6. Likert 1 - Can't escape
**Purpose:** The core felt-experience statement; its answer sets the pacing of the plan, not a score shown to the user.
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** Think about a typical night.
**Body B:** Pick the closest. No wrong answers.
**Field:** Statement card: "As soon as it's quiet, I can't escape my thoughts." Five-step scale: 🌑 Never · 🌘 Rarely · 🌗 Sometimes · 🌖 Often · 🌕 Always. Single select, auto-advances.
**Visual:** Quote card on off-white, the five moon phases as one row of round buttons with labels under them. A "1 of 4" chip above.
**Microcopy:** Progress hint: "1 of 4". The answer is never shown as a number or label to the user.
**CTA:** (auto-advances on tap)

### 7. Likert 2 - Replaying
**Purpose:** Feeds the Replayer trait.
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** Think about the last week.
**Body B:** The closest answer is fine.
**Field:** Statement card: "I replay things I said or did today." Same five-moon scale, single select, auto-advances.
**Visual:** Same as #6, chip "2 of 4".
**Microcopy:** Progress hint: "2 of 4".
**CTA:** (auto-advances on tap)

### 8. Likert 3 - Planning
**Purpose:** Feeds the Planner trait.
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** Go with your first instinct.
**Body B:** Nothing here is judged.
**Field:** Statement card: "In bed, I plan tomorrow over and over." Same five-moon scale, single select, auto-advances.
**Visual:** Same as #6, chip "3 of 4".
**Microcopy:** Progress hint: "3 of 4".
**CTA:** (auto-advances on tap)

### 9. Likert 4 - What if
**Purpose:** Feeds the Worrier trait. The last statement, then the question themes open up.
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** Last statement. Then a few easy taps.
**Body B:** Pick the closest, as always.
**Field:** Statement card: "My mind jumps to what could go wrong." Same five-moon scale, single select, auto-advances.
**Visual:** Same as #6, chip "4 of 4".
**Microcopy:** Progress hint: "4 of 4".
**CTA:** (auto-advances on tap)

### 10. What it circles
**Purpose:** The personalization core. The picks set the first-week prompts and break a tie between profile types.
**Headline A:** What do thoughts circle?
**Headline B:** What's your mind busy with?
**Body A:** Pick all that loop most.
**Body B:** Choose any. Nothing here is judged.
**Options:**
- 💼 Work
- 💞 Relationships
- 🩺 Health
- 💸 Money
- ✏️ Other
**Field:** Multi-select, min 1 to enable the CTA. "Other" opens a one-line input, checked for crisis language as on #5.
**Visual:** Two-column soft chip grid, selected chips get a sage border and a check.
**Microcopy:** Disabled-CTA hint: "Pick at least one"
**CTA:** Continue

### 11. The next day
**Purpose:** Names the daytime cost in neutral words so the user feels understood. Used only to word the plan, never as urgency.
**Headline A:** How do mornings feel?
**Headline B:** What does the next day hold?
**Body A:** Pick all that fit.
**Body B:** Choose any. We're just noticing.
**Options:**
- 😴 Tired all day
- 🌫️ Foggy focus
- 😤 Short-tempered
- ☕ Leaning on caffeine
- ✏️ Other
**Field:** Multi-select, min 1 to enable the CTA. "Other" opens a one-line input, checked for crisis language.
**Visual:** Soft chip grid with a sunrise gradient behind the first row.
**Microcopy:** Disabled-CTA hint: "Pick at least one"
**CTA:** Continue

### 12. What you've tried
**Purpose:** Shows respect for effort and lets the plan build on what already helps. No question touches medication.
**Headline A:** What have you tried?
**Headline B:** What has helped, even a little?
**Body A:** Pick any. We'll build on it.
**Body B:** Choose all that apply.
**Options:**
- 🎧 Sleep sounds
- 📓 Journaling
- 🧘 Meditation apps
- 📵 Less screen time
- 🙅 Nothing yet
- ✏️ Other
**Field:** Multi-select, min 1. "Nothing yet" clears the other picks. "Other" opens a one-line input, checked for crisis language.
**Visual:** Stacked pills with a small line icon each, selected ones fill sage.
**Microcopy:** Never list or ask about sleep aids, supplements or medication.
**CTA:** Continue

### 13. Bedtime
**Purpose:** Sets `{{bedtime}}` and the wind-down time, so the evening unload lands before bed.
**Headline A:** When do you aim for bed?
**Headline B:** What's your usual bedtime?
**Body A:** Your evening unload will land before it.
**Body B:** We'll time your wind-down chat.
**Options:**
- 🌆 Before 10 p.m.
- 🌃 10-11 p.m.
- 🌙 11 p.m.-midnight
- 🦉 After midnight
**Field:** Single select. Sets `{{bedtime}}` and `{{winddown}}` (about 45 minutes before: 9:00 p.m. · 10:00 p.m. · 11:00 p.m. · 11:30 p.m.).
**Visual:** Four pills whose background shifts from dusk to deep night down the list.
**Microcopy:** Progress hint: "Two more questions"
**CTA:** Continue

### 14. Name
**Purpose:** Captures `{{name}}`, which Calmio uses in the profile and the first chat. A skipped name falls back to "you".
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
**Body B:** Your chats stay private. Nothing is ever public.
**Visual:** A: large rating number, sage star row, one dashed "real review goes here" card. B: three lucide rows (lock, eye-off, trash) on a white card.
**Microcopy:** Pull rating and count live from this app's own store listing, never hardcode. Review cards are real store reviews only, quoted as shown. No press logos, no "expert" or staff photos unless each is a real, named, credentialed person. B's "delete" row ships only if in-app deletion exists.
**CTA:** Continue

---

## D. Anticipation

### 16. Reading your night (loading)
**Purpose:** The wait makes the profile feel built from the answers, and gives the strongest ad frame (the blooming flower under the moon).
**Headline A:** Reading {{name}}'s night mind…
**Headline B:** Building {{name}}'s evening plan…
**Steps:**
1. Listening back to your answers… - 0→100%
2. Finding how your mind loops… - 0→100%
3. Shaping your four-week evening unload… - 0→100%
4. Almost ready, your profile awaits… - 0→100%
**Visual:** The flower bud blooms in the top half under a small crescent moon, the one hero object with depth and slow 3D motion. Everything else fades. Four progress rows beneath: label left, % right, check when done, thin sage bars. With no name, "Reading your night mind…".
**Microcopy:** Chips from their answers ("Right at bedtime", "Work") float up and fade.
**CTA:** (auto-advances, ~6-8 seconds)

### 17. Your night-mind profile
**Purpose:** The personalized result, shown as a reflection and a plan, never a verdict or a score. It makes the paywall's "what you get" concrete and traceable to the answers.
**Headline A:** Your night mind: the {{profile}}
**Headline B:** Here's how your night goes
**Body A:** {{profile_line}}
**Body B:** A reflection, not a diagnosis. You can change it.
**Visual:** Top: moon-and-flower illustration card with the profile name. Under it three soft trait bars (Replaying · Planning · What-if), the strongest highlighted, labelled "How your mind spends the night". Below: a vertical path of four week cards, week 1 open (the evening-unload sample: "10-minute chat + one prompt"), weeks 2-4 titles only.
**Microcopy:** Profiles: Replayer ("Your mind rewinds the day, again and again.") · Planner ("Your mind drafts tomorrow while you try to rest.") · Worrier ("Your mind scans for what could go wrong."). Pick = highest of Likert 2/3/4, ties broken by #10 (Relationships → Replayer, Work → Planner, Health or Money → Worrier), default Replayer. Plan sample (Replayer): "Closing the day" · "Letting the replay rest" · "Kinder self-talk" · "Your night routine". Evening unload sample prompt: "What is one thing from today you can leave until morning?" Footer: "Not a diagnosis. A starting point you can change." Never a severity score, gauge or clinical label.
**CTA:** Continue

### 18. Save your plan (email)
**Purpose:** Captures identity so the profile, plan and chats persist, while the result is still warm.
**Headline A:** Where should we send it?
**Headline B:** Save your night plan
**Body A:** Your profile and first unload, kept safe.
**Body B:** No spam. Unsubscribe anytime.
**Field:** Email input. Marketing opt-in checkbox, unchecked by default: "Send me tips by email (optional)".
**Visual:** White input on off-white, the small bud above the headline. "Need help now?" still visible top-right.
**Error states:** "Enter a valid email address" · "That email has an account, sign in instead?"
**Microcopy:** Legal line: "By continuing you agree to the Terms and Privacy Policy."
**CTA:** Continue

### 19. First wind-down chat
**Purpose:** A taste of the loop before the paywall: two real exchanges (about three minutes), using `{{name}}`, `{{when}}` and the profile. It proves the product before the price.
**Headline A:** Your first 3-minute unload
**Headline B:** Try a wind-down chat
**Body A:** Tap a reply or write your own.
**Body B:** Say as much or as little as you like.
**Options:** (sample for Replayer)
- That conversation today
- Something I said
- I'm not sure
- ✏️ Type your own
**Visual:** Chat screen on off-white, a "3 min" chip. AI-disclosure banner pinned top, opening bubble ("Hi {{name}}. Let's set the day down together. What's your mind on tonight?"), reply-idea rows above the composer. After the first reply Calmio reflects one line and asks: "If you could park one thought until morning, which one?" After the second it closes warmly ("Parked. That's the rhythm: three minutes, then rest. Tomorrow evening we go a little further.") and the paywall opens.
**Microcopy:** Banner: "Calmio is an AI companion, not a therapist. In crisis? Call or text 988." Crisis language in any message pauses the scripted flow and shows the crisis sheet, human resources first; that path shows no sales line and, if the paywall is later closed, no fallback offer. After a crisis the screen shows a quiet "Skip to my plan" link. Calmio never says "I miss you" or "don't leave".
**Skip link:** Skip to my plan (shown only after a crisis message)
**CTA:** (auto-advances after 2 exchanges)

---

## F. Monetization

### 20. Paywall (web sales page)
**Purpose:** The one ask, as a long-scroll web page, placed right after the first chat. It sells the evening-unload programme; every price and renewal term sits on the page in readable type.
**Headline A:** Your evening unload is ready
**Headline B:** {{name}}, start tonight's unload
**Body A:** Four weeks of evening chats and prompts, made for you.
**Body B:** Price shown upfront. We remind you before renewing.
**Plans:** 1-week intro · **4-week, pre-selected** (matches the 4-week plan, ribbon "Matches your plan") · 12-week anchor. Every card shows `{{price_*}}` big and `then {{renewal_*}} / period` right under it, plus a per-week equivalent `{{week_*}}`. No percent-off badge, no struck price, no decoy.
**Visual:** Sticky brand bar with close (×) and the persistent "Need help now?" link. Sections in order: personal hero (their profile card and four fact chips: night-mind type, loudest at, bedtime, plan length) · plan block (cards, "Due today" row, CTA, payment badges, secure/cancel row, renewal line) · what's inside (the four weeks as a TOC) · how it works (3 steps) · proof (rating and review placeholders, dashed) · FAQ (is this therapy, how to cancel, will I be charged again, are chats private, what if I'm in crisis) · plan block again · legal. A sticky bottom CTA slides up while no plan block is visible.
**Microcopy:** Under the CTA at body size: "Renews at {{renewal_4w}} every 4 weeks until you cancel. Cancel anytime in your account." Reminder line: "We'll email you before every renewal." No guarantee or refund block is shown until a real refund window and its full terms exist. Always shown: "Crisis resources are always free." Not shown on this page: timers, promo codes, "no charge yet" wording, usage counters.
**Fallback offer:** #21. Every way off this page without paying (× and "Not now") goes to #21 first, once per session. Declining it, or closing the paywall a second time, leads to #22 in free mode.
**CTA:** Start my plan

### 21. A gentler first step (one-time offer, shown on close)
**Purpose:** A second, softer chance for people who closed #20 because four weeks felt like a lot. Shown once, never after crisis language.
**Headline A:** Start gently, {{name}}
**Headline B:** Start tonight for less
**Body A:** Same 4-week plan, at a gentler first price.
**Body B:** No rush. A lower first price, if it helps.
**Plans:** One offer card: `{{offer_name}}` (demo: "Intro 4-week plan"): the same 4-week plan at an introductory first-period price that the store or checkout actually offers. `{{offer_price}}` today, the regular 4-week price `{{price_4w}}` struck (same duration, the real current price, never an invented anchor), then `{{offer_renews}}` until cancelled. It is not a shorter product and not a copy of the 1-week tier. Optional `{{offer_badge}}`.
**Visual:** Same web look as #20: sticky bar with close ×, Calmio wordmark and "Need help now?". Centered eyebrow "One-time offer · shown once", one sage-bordered card with a calm thumbnail, offer name, price row (struck → price "today"), 3 checks ("Your 4-week plan, from night one" · "Evening chats with Calmio" · "A reminder before it renews"), CTA, payment badges and the renewal line. Below: "Crisis resources are always free."
**Microcopy:** Renewal line at body size: "{{offer_price}} today, then {{offer_renews}} until you cancel." No timer: `CONFIG.offer.expiresMin` stays null, and there is no "last chance", "offer ends" or "don't miss out" wording. Never shown after crisis language (free text or the #19 chat, which opens the crisis sheet). Merely opening "Need help now?" does not suppress it. Decline link: "No thanks, keep the free unload". Events: `offer_view`, `offer_accept` + `checkout_click`, `offer_decline`.
**CTA:** Claim my offer

---

## G. Payoff

### 22. Tonight's first conversation
**Purpose:** Close the loop and drop the user into the first real evening unload, so the first session ends inside the product.
**Headline A:** Tonight starts now
**Headline B:** Welcome in, {{name}}
**Body A:** Your wind-down chat opens at {{winddown}}. Or start now.
**Body B:** Come back anytime. Calmio is here.
**Visual:** Calm sea photo header fading to off-white, the 3D flower fully open as the hero. A "Tonight's unload · 10 min" card with the profile prompt, a reminder row (toggle off by default) "Remind me at {{winddown}}", tab bar below (Tonight, Chat, Journal, Me).
**Microcopy:** Subscribers get the full 10-minute unload and week 1. Free mode shows the 3-minute unload and a quiet "Unlock your plan" row, never a pop-up. No rating prompt here; ask only after a completed unload on day 3 or later. Reminder push text carries no topic words (no "overthinking", no theme names), max one a day, no guilt.
**CTA:** Start tonight's unload

---

## Notes

- **Archetype call.** Plan subscription after a data quiz -> personalization-quiz, Calmio variant (see Known variants in `archetypes/personalization-quiz.md`). Borrowed from companion-chat: the first live chat before the paywall (#19). Skipped from the default: decoy tier, countdown upsell, before/after screen, separate premium-preview screen (the plan on #17 does that job), gamified wheel.
- **Mental-health safety, built in.** "Need help now?" on all 22 screens and on the web paywall and offer bars · expectations screen (#4) before any thought or night question · crisis detection on every free-text field (#5, #10, #11, #12, #19) · minors blocked with youth resources (#3) · no medication questions anywhere · not positioned as insomnia treatment · no clinical labels, scores or gauges. Crisis help is never behind the paywall. Clinical and legal review should cover #3, #4, #17 and the crisis sheet, including non-US helplines.
- **Competitor mechanics - reference only, NOT implemented:** insomnia severity score, pill-use and dependence questions, pill-fear and dementia claims, fake MD or neuroscientist bylines, "93% improved / 53% faster" stats, Oxford and Stanford name-drops, EMDR-inspired claims, personalised promo codes, 10-minute countdown, scratch-card discount, "-60% applied" against a never-charged anchor, renewal 2.5x the intro price.
- **Plans are placeholders.** The structure (1-week / 4-week pre-selected / 12-week anchor) mirrors the competitor layout. All prices are `{{price_*}}` / `{{renewal_*}}` tokens; the offer's struck price is the real 4-week price. The real Calmio store lists 1-month and 3-month SKUs (see `mental-health/calmio`); align SKUs before launch. Renewal is shown beside every price and a pre-renewal email is promised, so it must be built.
- **Unverified.** Calmio's real in-app onboarding and tone settings, the free-tier scope (the demo assumes the 3-minute unload stays free), and the app-store rating were not viewable; the rating and review blocks are placeholders. Competitor screen flows are verified from AdSpyLab captures (2026-09-28/29), not live.
- **Likert-to-profile mapping is our own design,** not taken from a competitor: the highest of statements 2, 3 and 4 picks the type, themes break ties. It needs clinical review.
- **Free text is not diagnosed.** Likert answers only pick one of three reflective profile types. They are never summed into a score shown to the user.
- **Drop-off risk:** #3 age gate · #6-9 four statements in a row (kept to one tap each, with a moon scale and a "x of 4" chip) · #18 email · #20 paywall. Keep #16 at 6-8 s.
- **Measure separately:** paywall CVR at #20 · offer CVR at #21 (apart from #20) · free-mode to subscribe later · D1/D7 return at the wind-down time · refund and chargeback rate (the honesty metric).
- **A/B first:** (1) #1 "Mind loud at 2 a.m.?" vs "Still awake? Let's unload." (2) #19 chat before vs after #18. (3) #17 with vs without the three trait bars. (4) #20 4-week pre-selected vs 12-week pre-selected.
- **Demo (private Artifact):** https://claude.ai/artifact/NLiCHSVjbVkz3BjaQgPqVS
