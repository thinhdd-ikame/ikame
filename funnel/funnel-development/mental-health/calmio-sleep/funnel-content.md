---
niche: calmio-sleep
display_name: Calmio - Sleep Sounds (AI wellbeing companion - 18+)
archetype: personalization-quiz
subject: person
input: age (18+ gate), what keeps them from sleep, how often, time to fall asleep, three Likert statements, preferred sounds, their room, bedtime, name, email
output: a sleep profile (Slow Drifter, Night Waker, Early Riser or Light Sleeper) plus a personal soundscape with a 30-second listen and a 4-week wind-down plan
screens: 22
monetization: one plan subscription (1-week intro / 4-week pre-selected / 12-week anchor, renewal shown on every price, pre-renewal email), dismissible web paywall, one one-time sound pass on close (paid once, no timer), no other upsell layer
creative_screens:
  hook-a: 1
  hook-b: 2
  loader: 16
  reveal: 17
  listen: 19
motion: >
  a tangle of restless lines above a crescent moon smooths into one slow wave
  while rain ripples and a sage flower bud opens petal by petal, with three
  soft sound-layer bars rising one after another
---

# Funnel Content - Calmio: Sleep Sounds

Calmio is a chat-based AI companion for reflection (18+, "a companion, not a therapist"). This is the **sleep sound** niche: the user who lies awake, wakes at 3 a.m. or wakes too early, and wants a gentler way to wind down. They answer a few easy questions about their nights and the sounds they like. They get a **sleep profile** (Slow Drifter, Night Waker, Early Riser or Light Sleeper), a **personal soundscape** they can actually hear for 30 seconds before the paywall, and a **4-week wind-down plan** of goals they can change. **Archetype: personalization-quiz** (Calmio mental-health variant, as in `mental-health/calmio`): money is a plan subscription sold after a data quiz, not a per-message meter. It borrows a "hear it first" preview from the generator family in place of the live chat used by `calmio-overthinking`. 22 screens, A/B copy on every one.

**Reference funnels (competitor teardown, AdSpyLab Funnels Library, captured 2026-09-28/29):** Innerflo Sleep Cards (`innerflo.me/sleepcards/1`, 1,303 ads, 44 screens) and the healthhorizon.news sleep advertorial that feeds it (879 ads, 40 screens). Calmio itself runs only the advertorial route here, so this is the first app-side funnel for it. The funnel keeps their strongest honest mechanics (a problem-first question, a frequency question, Likert statements, a sound-preference step) and drops the rest.

**Deliberately different from the references:** no insomnia severity score or any clinical label (the profile is a reflection with four soft types). No question or advice about sleeping pills or medication. No "% improved / % faster" claims, no fake MD or neuroscientist byline, no binaural or "brainwave" efficacy claims (binaural tones are only an option the user may like). No timer, no promo code, no scratch card, no struck anchor price. The user hears a real 30-second soundscape before paying, and renewal terms sit next to every price. The last-chance screen is a different, smaller product (a paid-once sound pass), not a cheaper copy of a plan tier. A "Need help now?" link is on every screen and is never paywalled. Does not repeat the questions of `calmio-overthinking` (when the mind is loud, what thoughts circle, next-day impact, what they tried): this funnel asks about the *sleep itself* and the *room*.

**Visual override (same as `mental-health/calmio`):** soft light theme, warm off-white, sage green and muted lavender, rounded sans, lots of air, the flower as the one hero object. The night feel comes from a dusk-lavender hook scene with a crescent moon and from moon-phase answer scales, not from a dark UI. Confirm against the real brand kit.

---

## A. Hook

### 1. Hook A - Fall asleep without fighting
**Purpose:** Meet the "lying awake" before-state with the brand promise, without asking for anything.
**Headline A:** Fall asleep without fighting
**Headline B:** Sleep sounds, made for you
**Body A:** A personal soundscape for nights that won't switch off.
**Body B:** Tell us your nights. We'll tune the sound.
**Visual:** Dusk-lavender sky fading to warm off-white, a crescent moon, a tangle of thin restless lines that slowly relax into one gentle wave. A sage flower bud breathes (in 4s, out 4s) beneath. One soft bubble: "Still awake? Let's find your sound." Sage button pinned bottom. "Need help now?" link top-right, persistent on every screen to #22.
**Microcopy:** Under CTA: "18+ · Calmio is AI and not a substitute for professional care". "Need help now?" opens the crisis sheet: "Call or text 988 (US) · Outside the US: findahelpline.com · In danger now? Call your local emergency number." One tap, no sign-in, no paywall.
**CTA:** Get started

### 2. Hook B - Your mix
**Purpose:** Show the core surface (a sound mix built from layers) so the user knows what they would hear.
**Headline A:** Sound, tuned to you
**Headline B:** Your nights, your mix
**Body A:** Pick sounds, set bedtime, get a mix made for you.
**Body B:** Rain, brown noise, a soft voice. Your blend.
**Visual:** Card on off-white with a calm photo and three sound-layer rows fading in (🌧️ Rain · 🟤 Brown noise · 🎙️ Soft voice), each with a slim level bar that rises one after another. "AI companion" chip above. A small moon-and-flower mark on the card photo.
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
**Purpose:** The honest expectations beat and the safety net, placed before any question about sleep. States plainly that this is a companion and sound tool, not a treatment.
**Headline A:** Sound support, not treatment
**Headline B:** Before we begin, one promise
**Body A:** It helps you wind down. It doesn't diagnose or treat.
**Body B:** If sleep trouble lasts, a doctor can help.
**Visual:** Four icon rows on a white card (chat bubble, lock, lifebuoy, moon). Sage icons, generous spacing, nothing else on screen.
**Microcopy:** Rows: "Calmio is AI, and always says so" · "Your chats stay private" · "In crisis? Call or text 988 (US) or visit findahelpline.com" · "Calmio is not a treatment for insomnia or any sleep condition." Footer: "Calmio does not provide medical advice, diagnosis or treatment."
**CTA:** I understand

### 5. What goes wrong
**Purpose:** The first cheap tap. It frames the problem in the user's own words and sets `{{problem}}`, which picks the profile type.
**Headline A:** What keeps you from sleep?
**Headline B:** Where do nights go wrong?
**Body A:** Pick the one that happens most.
**Body B:** No wrong answer. Just your nights.
**Options:**
- 😮‍💨 Falling asleep
- 🌙 Staying asleep
- 🌅 Waking too early
- 🔀 A bit of all
- ✏️ Other
**Field:** Single select, auto-advances on tap. "Other" opens a one-line input; the CTA stays disabled until it has text. Any free text passes through crisis-language detection before continuing.
**Visual:** Stacked soft pill rows, white fill, selected row fills sage with a check. A small closed bud sits at the top.
**Microcopy:** Crisis detection on "Other": if matched, show the crisis sheet from #1 with "Talk to a person now" first and "Continue with Calmio" second. Never block the user, never ask them to explain. "Other" or "A bit of all" maps to the Light Sleeper profile.
**CTA:** (auto-advances on tap)

### 6. How often
**Purpose:** Sets how gentle the plan's pacing is. Never shown back as a severity grade.
**Headline A:** How often is this?
**Headline B:** How many nights a week?
**Body A:** Think about the last month.
**Body B:** A rough guess is fine.
**Options:**
- 🌤️ Once in a while
- 📅 1-2 nights a week
- 🌙 3-5 nights a week
- 🌑 Almost every night
**Field:** Single select, auto-advances on tap.
**Visual:** Four stacked pills, the background deepening from dawn to deep night down the list.
**Microcopy:** The answer is never shown as a score, grade or label. No "insomnia" wording anywhere.
**CTA:** (auto-advances on tap)

### 7. Time to fall asleep
**Purpose:** Sets the length of the first sound session so the soundscape lasts about as long as it takes.
**Headline A:** How long to drift off?
**Headline B:** Time to fall asleep?
**Body A:** On a typical night.
**Body B:** Your best guess is fine.
**Options:**
- ⏱️ Under 15 minutes
- 🕒 15-30 minutes
- 🕑 30-60 minutes
- ⏳ Over an hour
**Field:** Single select, auto-advances on tap. Sets `{{session}}` (30 · 45 · 60 · 90 minutes of sound).
**Visual:** Four pills with a slim clock-hand icon turning one step further each row.
**CTA:** (auto-advances on tap)

### 8. Likert 1 - Waiting for sleep
**Purpose:** The core felt-experience statement; feeds the "Trying hard" trait that shapes the wind-down.
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** Think about a typical night.
**Body B:** Pick the closest. No wrong answers.
**Field:** Statement card: "I lie in bed waiting for sleep to come." Five-step scale: 🌑 Never · 🌘 Rarely · 🌗 Sometimes · 🌖 Often · 🌕 Always. Single select, auto-advances.
**Visual:** Quote card on off-white, the five moon phases as one row of round buttons with labels under them. A "1 of 3" chip above.
**Microcopy:** Progress hint: "1 of 3". The answer is never shown as a number or label.
**CTA:** (auto-advances on tap)

### 9. Likert 2 - Tense body
**Purpose:** Feeds the "Tense body" trait (a slow-breath cue in the wind-down).
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** Think about the last week.
**Body B:** The closest answer is fine.
**Field:** Statement card: "My body feels tense when I lie down." Same five-moon scale, single select, auto-advances.
**Visual:** Same as #8, chip "2 of 3".
**Microcopy:** Progress hint: "2 of 3".
**CTA:** (auto-advances on tap)

### 10. Likert 3 - Clock check
**Purpose:** Feeds the "Clock-watching" trait (a no-clock wind-down for night wakings).
**Headline A:** How true is this?
**Headline B:** Does this sound like you?
**Body A:** Last statement. Then the fun part.
**Body B:** Go with your first instinct.
**Field:** Statement card: "When I wake at night, I check the clock." Same five-moon scale, single select, auto-advances.
**Visual:** Same as #8, chip "3 of 3".
**Microcopy:** Progress hint: "3 of 3".
**CTA:** (auto-advances on tap)

### 11. Sounds you like
**Purpose:** The personalization core. The picks become the layers of the soundscape.
**Headline A:** What sounds soothe you?
**Headline B:** Which sounds feel calm?
**Body A:** Pick all you'd like to hear.
**Body B:** Choose any. We'll blend them.
**Options:**
- 🌧️ Rain
- 🟤 Brown noise
- 🎙️ Soft voice
- 🎧 Binaural tones
- ✏️ Other
**Field:** Multi-select, min 1 to enable the CTA. "Other" opens a one-line input, checked for crisis language as on #5.
**Visual:** Two-column soft chip grid, selected chips get a sage border and a check.
**Microcopy:** Disabled-CTA hint: "Pick at least one". Binaural tones are offered as a taste, never described as treating anything.
**CTA:** Continue

### 12. Your room
**Purpose:** Lets the mix sit properly in the room (masking street noise, shared rooms, light).
**Headline A:** What's your room like?
**Headline B:** Tell us about your room
**Body A:** So the sound sits right in it.
**Body B:** Pick all that fit.
**Options:**
- 🤫 Very quiet
- 🚗 Street noise
- 🛏️ Shared room
- 💡 Some light
- ✏️ Other
**Field:** Multi-select, min 1. "Other" opens a one-line input, checked for crisis language.
**Visual:** Stacked pills with a small line icon each, selected ones fill sage.
**CTA:** Continue

### 13. Bedtime
**Purpose:** Sets `{{bedtime}}` and the wind-down time (about 45 minutes before).
**Headline A:** When do you aim for bed?
**Headline B:** What's your usual bedtime?
**Body A:** Your wind-down will start before it.
**Body B:** We'll time your evening sound.
**Options:**
- 🌆 Before 10 p.m.
- 🌃 10-11 p.m.
- 🌙 11 p.m.-midnight
- 🦉 After midnight
**Field:** Single select. Sets `{{bedtime}}` and `{{winddown}}` (9:00 p.m. · 10:00 p.m. · 11:00 p.m. · 11:30 p.m.).
**Visual:** Four pills whose background shifts from dusk to deep night down the list.
**Microcopy:** Progress hint: "One more question"
**CTA:** Continue

### 14. Name
**Purpose:** Captures `{{name}}`, used in the profile and the plan. A skipped name falls back to "you".
**Headline A:** What should Calmio call you?
**Headline B:** What's your first name?
**Body A:** A nickname is fine. Change it anytime.
**Body B:** So your sleep plan feels like yours.
**Field:** Text input, 1-20 chars, placeholder "Your name". Skippable: empty falls back to "you" everywhere.
**Visual:** Plain white input on off-white, small bud icon above.
**Error state:** "Add a name so Calmio knows what to call you"
**Skip link:** Skip for now
**CTA:** Continue

---

## C. Trust

### 15. Real people, real ratings
**Purpose:** The trust beat after the investment stage and before the reveal. Proof has to be real; this category is where fake experts and fake stats do the most harm.
**Headline A:** {{app_rating}}★ from real people
**Headline B:** Private. Judgment-free. Yours.
**Body A:** {{rating_count}} ratings from people who've been there.
**Body B:** Your chats stay private. Nothing is ever public.
**Visual:** A: large rating number, sage star row, one dashed "real review goes here" card. B: three lucide rows (lock, eye-off, trash) on a white card.
**Microcopy:** Pull rating and count live from this app's own store listing, never hardcode. While the rating, count or reviews are unset (tokens), A falls back to B's privacy content and the paywall proof block is hidden. Review cards are real store reviews only, quoted as shown. No press logos, no "expert" or staff photos unless each is a real, named, credentialed person. B's "delete" row ships only if in-app deletion exists.
**CTA:** Continue

---

## D. Anticipation

### 16. Tuning your sound (loading)
**Purpose:** The wait makes the profile and mix feel built from the answers, and gives the strongest ad frame (the blooming flower under the moon, layers rising).
**Headline A:** Tuning {{name}}'s soundscape…
**Headline B:** Building {{name}}'s sleep profile…
**Steps:**
1. Listening back to your answers… - 0→100%
2. Blending your sound layers… - 0→100%
3. Shaping your four-week plan… - 0→100%
4. Almost ready, your profile awaits… - 0→100%
**Visual:** The flower bud blooms in the top half under a small crescent moon, the one hero object with depth and slow 3D motion. Everything else fades. Four progress rows beneath: label left, % right, check when done, thin sage bars. With no name, "Tuning your soundscape…".
**Microcopy:** Chips from their answers ("Falling asleep", "Rain", "Street noise") float up and fade.
**CTA:** (auto-advances, ~6-8 seconds)

### 17. Your sleep profile
**Purpose:** The personalized result, shown as a reflection, a soundscape and a plan of goals, never a verdict or a score. It makes the paywall's "what you get" concrete and traceable to the answers.
**Headline A:** Your profile: the {{profile}}
**Headline B:** Here's how your nights go
**Body A:** {{profile_line}}
**Body B:** A reflection, not a diagnosis. You can change it.
**Visual:** Top: moon-and-flower illustration card with the profile name. Under it three soft trait bars (Trying hard · Tense body · Clock-watching), the strongest highlighted, labelled "What shapes your wind-down". Below: a "Your soundscape" card listing the layers from #11 (for example "Soft rain · Brown-noise bed · Calm voice"), then a vertical path of four goal cards, week 1 open ("Evening sound · {{session}} min" + one wind-down habit), weeks 2-4 titles only.
**Microcopy:** Profiles from #5: Slow Drifter (falling asleep: "Sleep takes a while to arrive.") · Night Waker (staying asleep: "Your nights come in more than one piece.") · Early Riser (waking too early: "Your mornings start before you do.") · Light Sleeper (a bit of all, or Other: "Your sleep is easily disturbed."). Strongest trait = highest of Likert 1-3 (ties: Trying hard). Week goals, for example Slow Drifter: "Easing into evenings" · "A softer lights-out" · "Settling the body" · "Your night routine". Label above the path: "Your 4-week goals. Change them anytime." Footer: "Not a diagnosis. A starting point you can change." Never a severity score, gauge or clinical label, and no promised outcome ("you will sleep better").
**CTA:** Continue

### 18. Save your plan (email)
**Purpose:** Captures identity so the profile, soundscape and plan persist, while the result is still warm.
**Headline A:** Where should we send it?
**Headline B:** Save your sleep plan
**Body A:** Your profile and soundscape, kept safe.
**Body B:** No spam. Unsubscribe anytime.
**Field:** Email input. Marketing opt-in checkbox, unchecked by default: "Send me tips by email (optional)".
**Visual:** White input on off-white, the small bud above the headline. "Need help now?" still visible top-right.
**Error states:** "Enter a valid email address" · "That email has an account, sign in instead?"
**Microcopy:** Legal line: "By continuing you agree to the Terms and Privacy Policy."
**CTA:** Continue

### 19. Hear your soundscape
**Purpose:** A taste of the product before the price: a real 30-second preview of the user's own mix, using their picks. It proves the product before the ask.
**Headline A:** Hear your soundscape
**Headline B:** Try tonight's sound
**Body A:** Thirty seconds. Headphones help. Keep volume low.
**Body B:** Tap play. Stop whenever you like.
**Visual:** Centered ring player on off-white: a round play button inside a thin sage progress ring (30 s), the flower bud breathing above, and below it the mix as layer chips with slim level bars moving (for example "Rain · Brown-noise bed"). Small caption: "Your mix · preview". The CTA is always available; listening is optional.
**Microcopy:** Volume line: "Keep the volume low. Stop anytime." No sleep-onset promise, no "fall asleep in minutes". A binaural layer, if picked, plays as a plain tone pair with no claim. In the demo the sound is synthesised in the browser.
**CTA:** Continue

---

## F. Monetization

### 20. Paywall (web sales page)
**Purpose:** The one ask, as a long-scroll web page, placed right after the soundscape preview. It sells the 4-week plan; every price and renewal term sits on the page in readable type.
**Headline A:** Your sleep plan is ready
**Headline B:** {{name}}, start tonight's sound
**Body A:** Four weeks of soundscapes and wind-downs, made for you.
**Body B:** Price shown upfront. We remind you before renewing.
**Plans:** 1-week intro · **4-week, pre-selected** (matches the 4-week plan, ribbon "Matches your plan") · 12-week anchor. Every card shows `{{price_*}}` big and `then {{renewal_*}} / period` right under it, plus a per-week equivalent `{{week_*}}`. No percent-off badge, no struck price, no decoy.
**Visual:** Sticky brand bar with close (×) and the persistent "Need help now?" link. Sections in order: personal hero (their profile card and four fact chips: sleep profile, main trouble, bedtime, plan length) · plan block (cards, "Due today" row, CTA, payment badges, secure/cancel row, renewal line) · what's inside (the four weeks as a TOC plus the soundscape) · how it works (3 steps) · proof (rating and review placeholders, dashed) · FAQ (is this therapy, does it treat insomnia, how to cancel, will I be charged again, are chats private, what if I'm in crisis) · plan block again · legal. A sticky bottom CTA slides up while no plan block is visible.
**Microcopy:** Under the CTA at body size: "Renews at {{renewal_4w}} every 4 weeks until you cancel. Cancel anytime in your account." Reminder line: "We'll email you before every renewal." No guarantee or refund block is shown until a real refund window and its full terms exist. Always shown: "Crisis resources are always free." Not shown on this page: timers, promo codes, "no charge yet" wording, usage counters.
**Fallback offer:** #21. Every way off this page without paying (× and "Not now") goes to #21 first, once per session. Declining it, or closing the paywall a second time, leads to #22 in free mode.
**CTA:** Start my plan

### 21. One-time sound pass (offer, shown on close)
**Purpose:** A smaller second chance for people who closed #20 because a four-week plan felt like too much: just the sound, paid once, nothing to cancel.
**Headline A:** Keep just your soundscape
**Headline B:** One-time offer, shown once
**Body A:** Your mix for seven nights. Paid once.
**Body B:** No plan, no renewal. Just the sound.
**Plans:** One offer card: `{{offer_name}}` (demo: "Soundscape pass"): paid once, `{{offer_price}}`, no renewal. It is not a plan tier and not a shorter subscription. Includes: your personal soundscape, a wind-down sound timer for seven nights. Not included: the 4-week plan, weekly goals, new soundscapes after the seven nights. No struck price and no "was" anchor (it is a different product).
**Visual:** Same web look as #20: sticky bar with close ×, Calmio wordmark and "Need help now?". Centered eyebrow "One-time offer · shown once", one sage-bordered card with a calm thumbnail, offer name, price row (price "once"), 3 checks ("Your personal soundscape" · "Wind-down timer for seven nights" · "Paid once, never renews"), a "Not included" line, CTA, payment badges and the line "Pay once. Nothing to cancel." Below: "Crisis resources are always free."
**Microcopy:** Line at body size: "{{offer_price}} once. No renewal, nothing to cancel." No timer: `CONFIG.offer.expiresMin` stays null, and there is no "last chance", "offer ends" or "don't miss out" wording. Never shown after crisis language in any free-text field. Merely opening "Need help now?" does not suppress it. Decline link: "No thanks, keep the free preview". Events: `offer_view`, `offer_accept` + `checkout_click`, `offer_decline`.
**CTA:** Get the pass

---

## G. Payoff

### 22. Tonight's first sound
**Purpose:** Close the loop and drop the user into tonight's wind-down, so the first session ends inside the product.
**Headline A:** Tonight starts now
**Headline B:** Welcome in, {{name}}
**Body A:** Your wind-down opens at {{winddown}}. Or start now.
**Body B:** Come back anytime. Calmio is here.
**Visual:** Calm dawn-sea photo header fading to off-white, the 3D flower fully open as the hero. A "Tonight's wind-down · {{session}} min" card with the soundscape name, a reminder row (toggle off by default) "Remind me at {{winddown}}", tab bar below (Tonight, Sounds, Journal, Me).
**Microcopy:** Subscribers get the full soundscape and week 1. The pass opens the soundscape and seven nights only. Free mode shows the 30-second preview and a quiet "Unlock your plan" row, never a pop-up. No rating prompt here; ask only after a completed wind-down on day 3 or later. Reminder push text carries no topic words (no "insomnia", no "can't sleep"), max one a day, no guilt.
**CTA:** Start tonight's sound

---

## Notes

- **Archetype call.** Plan subscription after a data quiz -> personalization-quiz, Calmio variant (see Known variants in `archetypes/personalization-quiz.md`). Borrowed from the generator family: a real "hear it first" preview (#19) in place of the live chat. Skipped from the default: decoy tier, countdown upsell, before/after screen, gamified wheel, live companion chat (the sibling `calmio-overthinking` owns that mechanic).
- **Mental-health safety, built in.** "Need help now?" on all 22 screens and on the web paywall and offer bars · expectations screen (#4) before any sleep question, saying plainly "not a treatment for insomnia" · crisis detection on every free-text field (#5, #11, #12) · minors blocked with youth resources (#3) · no medication, sleeping-pill or supplement questions anywhere · no clinical labels, scores or gauges · no promised outcomes. Crisis help is never behind the paywall. Clinical and legal review should cover #3, #4, #17 and the crisis sheet, including non-US helplines.
- **Competitor mechanics - reference only, NOT implemented:** insomnia severity score, pill-use and dependence questions, pill-fear and dementia claims, fake MD or neuroscientist bylines, "93% improved / 53% faster" stats, Oxford and Stanford name-drops, brainwave and EMDR-style claims, personalised promo codes, 10-minute countdown, scratch-card discount, "-60% applied" against a never-charged anchor, renewal 2.5x the intro price.
- **Plans are placeholders.** The structure (1-week / 4-week pre-selected / 12-week anchor) mirrors the competitor layout. All prices are `{{price_*}}` / `{{renewal_*}}` tokens. The real Calmio store lists 1-month and 3-month SKUs (see `mental-health/calmio`); align SKUs before launch. Renewal is shown beside every price and a pre-renewal email is promised, so it must be built. The sound pass is a new non-renewing product (consumable or fixed-term entitlement) that must exist in the store; its seven-night length is a proposal.
- **Unverified.** Calmio's real in-app onboarding, any existing sound library, the free-tier scope (the demo assumes the 30-second preview and a short wind-down stay free) and the app-store rating were not viewable; rating and review blocks are placeholders. Competitor flows are verified from AdSpyLab captures (2026-09-28/29), not live. Whether Calmio can ship an in-app sound library is unverified and the whole funnel depends on it.
- **Profile mapping is our own design.** The problem answer (#5) picks one of four soft types; Likert 1-3 pick the strongest trait for the wind-down. Nothing is summed into a score shown to the user. Needs clinical review.
- **Free text is not diagnosed.** Likert answers only choose a trait label. They are never shown as a score.
- **Drop-off risk:** #3 age gate · #5-#7 three problem questions up front (single tap each, auto-advance) · #8-#10 three statements in a row (moon scale, "x of 3" chip) · #18 email · #20 paywall. Keep #16 at 6-8 s.
- **Measure separately:** paywall CVR at #20 · offer CVR at #21 (apart from #20) · preview play rate at #19 · free-mode to subscribe later · D1/D7 return at the wind-down time · refund and chargeback rate (the honesty metric).
- **A/B first:** (1) #1 "Fall asleep without fighting" vs "Sleep sounds, made for you". (2) #19 preview before vs after #18. (3) #17 with vs without the three trait bars. (4) #20 4-week pre-selected vs 12-week pre-selected.
- **Demo (private Artifact):** https://claude.ai/artifact/XjwMDHUJdDN29j6w9KKpLe
