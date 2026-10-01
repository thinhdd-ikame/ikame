---
niche: witch-power
display_name: Nebula - Witch Power (What's your witch power?)
archetype: personalization-quiz
subject: person
input: your gender, 8 agree/disagree statements, whether witches run in your family, one image test, birth date (18+), birth time and birth city
output: your witch power type (Seer / Healer / Dreamwalker / Moon Weaver / Earth Keeper), your free Sun, Moon and Rising signs, and a full reading with a 30-day ritual and a moon-timed practice
screens: 24
monetization: web paywall after an email gate (1-week intro, 4-week pre-selected, 12-week anchor, renewal shown next to every price); dismissible to a one-time last-chance offer (a smaller one-time Power pack, no renewal), then your power type plus one open section for free
creative_screens:
  hook-a: 1
  hook-b: 2
  bridge: 9
  reveal: 19
  teaser: 21
motion: >
  a night sky where a birth-chart wheel ignites ring by ring, three gold glyphs
  (Sun, Moon, Rising) lift out of it, then a crescent moon glows over a faint
  witch's silhouette
---

# Funnel Content - Nebula: Witch Power

A Nebula web2app funnel (Meta ad, web quiz, web paywall, Nebula app) for the "what is my witch power?" niche. The user gives **a short intuition quiz, a family-lineage answer, one image test and their birth data**. They get **a witch power type and their real Big Three (Sun, Moon, Rising) for free**, and pay for the full reading. Archetype: **personalization-quiz**; the birth data is real and powers the free reveal, the quiz answers decide the power type. 24 screens.

**This brief replaces the older, never-demoed `nebula/funnel-content.md` (generic 25-screen horoscope brief).** That file stays in the repo for history; do not build from it.

**Modeled on:**
- Nebula `appnebula.co/witch-power/prelanding` (live funnelConfig, read 2026-10-01; 2,720 ads in 7 months; 55 screens, about 41 questions: Likert statements, goal, empath questions, element, witches in family with a lineage branch, ambiguous-image test, lifestyle, DOB, palm photo, email, paywall, upsells).
- Astroline `sub.astroline.today/quiz-pp?mode=witch` and `mode=birth-chart` (about 3,900 ads in 7 months; "Discover your witch power", DOB, birth time, birthplace, loader, free Big Three reveal, "accuracy" meter). Their flow is **unverified** at screen level (the library has no capture; SPA shell only), so it is inferred from the shared quiz engine.
- The Nebula paywall and Astroline paywall are not copied; the paywall here follows the house web-paywall standard from `nebula/palm-reading`.

**Kept from the references:**
- Short agree/disagree statements first (intuition, dreams, deja vu), then empath questions.
- "Witches in your family?" with a lineage follow-up, and an ambiguous-image test.
- A real, free Big Three reveal as the aha before the gate (Astroline's best idea), then a named power type.

**Deliberately changed, and why:**
- **41 questions cut to 14 taps.** Nebula asks about candles, scents and self-care; none of it feeds the result. Every question here changes the power type (see Notes, scoring).
- **A real birth chart is the free aha.** Nebula gates its chart; Astroline reveals it but then adds a rising "accuracy" meter. Here the Big Three is shown with no meter and no percentage.
- **No dark patterns.** No accuracy meter that climbs to sell, no Likert "lying detection" that pretends to catch the user, no trial-price picker ($1/$5/$9/$13.67), no secret discount, no renewal that rises when a timer ends, no persona "guide" page. The last-chance offer shows once, has no timer unless a real deadline exists, and renewal is on it.
- **Palm photo dropped.** Not needed for this result; one less upload ask.
- **Honest framing.** The reading is a reflective practice built on a birth chart and your answers. The FAQ says plainly it is not prediction and needs no purchase of supplies.
- **Birth data skips have fallbacks** (no birth time: midday chart; no birth city: Rising shown as an estimate).
- **Ad-safe:** the ad hook is "What's your witch power?", not a claim about the viewer ("You are a witch"). 18+ only.
- **Palette:** Nebula navy `#161A27` + gold `#E9C26B`, as in the other Nebula funnels. Hero object is a crescent over a birth-chart wheel; the power type gets one glyph and one accent colour.

---

## A. Hook

### 1. Hook
**Purpose:** Promise a named result (a power type) plus a real chart, and set the quiz as short.
**Headline A:** What's your witch power?
**Headline B:** Find your hidden power
**Body A:** Two minutes, your birth chart, one honest result.
**Body B:** A short quiz, your chart, your power revealed.
**Visual:** Crescent moon over a glowing birth-chart wheel on a navy star field (`img/hook-moon.jpg`; the demo draws it in SVG until the image exists). A rotating gold eyebrow cycles "Seer / Healer / Dreamwalker". Row of 3 chips: 2-min quiz · Your chart · Your power.
**Microcopy:** "By continuing you confirm you're 18+ and agree to our Terms of Use and Privacy Policy. For entertainment purposes only."
**CTA:** Start quiz

---

## B. Your intuition

### 2. Your gender
**Purpose:** Cheap first tap; used to read your chart.
**Headline A:** I am…
**Headline B:** Who's asking?
**Body A:** Used to read your chart.
**Body B:** One tap, then we begin.
**Options:** 👩 Female · 👨 Male · ✨ Non-binary
**Visual:** Pill options, gold fill on tap, auto-advance.
**CTA:** (tap, auto-advances)

### 3. Statement - intuition
**Purpose:** First agree/disagree tap; scores the Seer axis. Statement screens share one layout.
**Headline A:** I often just know things
**Headline B:** My gut is rarely wrong
**Body A:** Be honest. There is no wrong answer.
**Body B:** Go with your first reaction.
**Options:** 💯 Totally · 👍 Mostly · 🤷 Not sure · 🙅 Not me
**Visual:** Pill options, auto-advance; small "1 of 6" tag above the statement.
**CTA:** (tap, auto-advances)

### 4. Statement - dreams
**Purpose:** Scores the Dreamwalker axis.
**Headline A:** My dreams sometimes come true
**Headline B:** I remember vivid dreams
**Body A:** Think of the last few months.
**Body B:** Dreams you can still recall count.
**Options:** 💯 Totally · 👍 Mostly · 🤷 Not sure · 🙅 Not me
**Visual:** As #3, tag "2 of 6".
**CTA:** (tap, auto-advances)

### 5. Statement - deja vu
**Purpose:** Scores the Seer axis.
**Headline A:** I get strong deja vu
**Headline B:** I have lived moments before
**Body A:** That odd feeling of having been here.
**Body B:** Trust your first reaction.
**Options:** 💯 Totally · 👍 Mostly · 🤷 Not sure · 🙅 Not me
**Visual:** As #3, tag "3 of 6".
**CTA:** (tap, auto-advances)

### 6. Statement - signs
**Purpose:** Scores the Seer and Dreamwalker axes through synchronicity.
**Headline A:** I see signs in numbers
**Headline B:** Repeating numbers follow me
**Body A:** Like 11:11 or the same date twice.
**Body B:** Or a song that shows up at odd times.
**Options:** 💯 Totally · 👍 Mostly · 🤷 Not sure · 🙅 Not me
**Visual:** As #3, tag "4 of 6".
**CTA:** (tap, auto-advances)

### 7. Statement - the moon
**Purpose:** Scores the Moon Weaver axis and sets up the moon-timed practice.
**Headline A:** The moon changes my mood
**Headline B:** I feel the full moon
**Body A:** Sleep, energy, feelings, anything.
**Body B:** Even a little counts.
**Options:** 💯 Totally · 👍 Mostly · 🤷 Not sure · 🙅 Not me
**Visual:** As #3, tag "5 of 6".
**CTA:** (tap, auto-advances)

### 8. Statement - nature
**Purpose:** Scores the Earth Keeper axis.
**Headline A:** Nature calms me fastest
**Headline B:** I feel at home outdoors
**Body A:** Woods, water, storms, a garden.
**Body B:** Any wild place counts.
**Options:** 💯 Totally · 👍 Mostly · 🤷 Not sure · 🙅 Not me
**Visual:** As #3, tag "6 of 6".
**CTA:** (tap, auto-advances)

### 9. Gift is showing (bridge)
**Purpose:** A break after eight taps with no invented stat; names the next section so the quiz feels shorter.
**Headline A:** Your gift is showing
**Headline B:** Something is taking shape
**Body A:** Next, a few questions about feelings.
**Body B:** A few more taps, then your chart.
**Visual:** Soft gold glow, a single crescent line icon in a round well. No percentage, no meter.
**CTA:** Next

---

## C. Empath and lineage

### 10. Empath - moods
**Purpose:** Scores the Healer axis.
**Headline A:** I absorb other people's moods
**Headline B:** I feel what others feel
**Body A:** In a room, you pick up the mood.
**Body B:** Even people you barely know.
**Options:** 💯 Totally · 👍 Mostly · 🤷 Not sure · 🙅 Not me
**Visual:** As #3, tag "Feelings 1 of 2".
**CTA:** (tap, auto-advances)

### 11. Empath - confiding
**Purpose:** Second Healer-axis tap.
**Headline A:** People confide in me quickly
**Headline B:** Strangers tell me everything
**Body A:** Friends, coworkers, the person next to you.
**Body B:** Even on a train or in a queue.
**Options:** 💯 Totally · 👍 Mostly · 🤷 Not sure · 🙅 Not me
**Visual:** As #3, tag "Feelings 2 of 2".
**CTA:** (tap, auto-advances)

### 12. Witches in the family
**Purpose:** Lineage question; the answer opens a branch and adds a small lineage line to the reading.
**Headline A:** Any witches in your family?
**Headline B:** Does it run in the family?
**Body A:** Rumors and old stories count too.
**Body B:** Think grandmothers, healers, odd tales.
**Options:** 👵 Yes, I know one · 🤫 Family rumors · 🌿 Healers, herbalists · 🙅 None I know
**Visual:** Pill options, auto-advance. A faint family-tree line art behind the list.
**CTA:** (tap, auto-advances; "None I know" skips #13)

### 13. Whose side (branch)
**Purpose:** Shown only after any answer except "None I know". Personalises the lineage line.
**Headline A:** Whose side of the family?
**Headline B:** Which side carries it?
**Body A:** It shapes how we word your reading.
**Body B:** Pick the closest.
**Options:** 👩 Mother's side · 👨 Father's side · 🌳 Both sides · 🤷 Not sure
**Visual:** Pill options, auto-advance.
**CTA:** (tap, auto-advances)

---

## D. Image test and birth data

### 14. Image test
**Purpose:** Nebula's ambiguous-image beat. Free-choice, so there is an Other. It breaks ties between power types.
**Headline A:** What do you see first?
**Headline B:** Trust your first glance
**Body A:** No right answer. Look, don't think.
**Body B:** Whatever you see is right.
**Options:** 🦋 A butterfly · 🌙 A crescent moon · 👁️ An eye · ✏️ Other
**Field:** "✏️ Other" opens a one-line input (max 40 characters). CTA stays disabled until it has text.
**Visual:** A symmetrical ink-blot shape in gold on navy (`img/inkblot.jpg`; the demo draws it in SVG until the image exists), options under it.
**Error state:** CTA disabled while the Other box is empty.
**CTA:** (tap, auto-advances; Other: Continue)

### 15. Your birth date
**Purpose:** Real chart input and the 18+ gate.
**Headline A:** When were you born?
**Headline B:** Your date of birth
**Body A:** Your Sun sign anchors your chart.
**Body B:** Needed to draw your chart.
**Field:** Month / Day / Year selects. Years stop at today minus 18. Sun-sign chip appears once complete.
**Visual:** Three rounded selects in one row, sign chip fades in.
**Microcopy:** "You must be 18 or older."
**Error state:** "Pick your full date of birth"
**CTA:** Continue

### 16. Your birth time
**Purpose:** Sharper Moon and Rising; needs a skip so users without it don't drop.
**Headline A:** What time were you born?
**Headline B:** Know your birth time?
**Body A:** It places your Moon and Rising signs.
**Body B:** Check your birth certificate if unsure.
**Field:** Hour / minute / AM-PM selects (optional) + link "I don't know my time".
**Visual:** Clock-face line art with tiny zodiac glyphs on the rim.
**Microcopy:** Skip fallback: "No worries. We'll read your chart at midday."
**Skip link:** I don't know my time
**CTA:** Continue

### 17. Your birth place
**Purpose:** Needed for the Rising sign; skippable with an honest fallback.
**Headline A:** Where were you born?
**Headline B:** Your birth city
**Body A:** It places your Rising sign.
**Body B:** A town or city is enough.
**Field:** One-line city input with a short suggestion list as you type (min 2 characters).
**Visual:** Dark map-line art, a small gold pin dropping onto a coastline.
**Microcopy:** Skip fallback: "No problem. Your Rising sign will be an estimate."
**Error state:** "Enter a city, or skip"
**Skip link:** I don't know
**CTA:** Continue

---

## E. Wait and free reveal

### 18. Drawing your sky (loader)
**Purpose:** Manufacture a short wait; the reveal moment for ads.
**Headline A:** Drawing your sky
**Headline B:** Reading your birth chart
**Steps:** Placing your Sun and Moon… · Finding your Rising sign… · Weighing your witch signs… · Naming your power…
**Visual:** A single chart wheel igniting ring by ring, progress ring, 4 task rows ticking off.
**CTA:** (auto-advances, ~6 seconds)

### 19. Your Big Three (free reveal)
**Purpose:** The free aha: your real Sun, Moon and Rising, each with one line. No meter, no percentage.
**Headline A:** Your Big Three
**Headline B:** Your sky, revealed
**Body A:** Drawn from your birth date, time and place.
**Body B:** This is the sky you were born under.
**Visual:** Three gold glyph cards in a row (Sun, Moon, Rising) lifting out of the chart wheel, each with the sign name and one witchy line ("Sun in {{sun}}: your core fire"). If time or place was skipped, the Rising card carries an "Estimate" tag.
**Microcopy:** "Rising is an estimate without your birth time and city." (shown only when skipped)
**CTA:** Next

---

## F. Gate and teaser

### 20. Email
**Purpose:** Lead capture, also the app login.
**Headline A:** Where should we send it?
**Headline B:** Save your reading
**Body A:** Get your reading and log in to the app.
**Body B:** One email, no spam.
**Field:** Email (light field), optional marketing checkbox (unticked by default).
**Error state:** "Enter a valid email address"
**Microcopy:** "By continuing, you agree to our Terms of Use and Privacy Policy."
**CTA:** Continue

### 21. Power teaser
**Purpose:** The named payoff and the last free beat: your power type with one line, then locked rows for what the paywall sells.
**Headline A:** Your power: {{power}}
**Headline B:** You are a {{power}}
**Body A:** Your Big Three points the same way.
**Body B:** Here is what makes you one.
**Visual:** One large glyph for the power type on a glowing disc, the power name in gold serif, a one-line description, and your three signs as chips. Below: locked rows "Your 30-day ritual", "Your moon-timed practice", "What your Moon says about your craft", "Your lineage line".
**Microcopy:** Per power type, one line. Seer: "You sense what is coming before words do." Healer: "You carry other people's weather, and can calm it." Dreamwalker: "Your sleep is a second library." Moon Weaver: "Your energy follows the Moon's tide." Earth Keeper: "You find your power in soil, storm and season." Disclaimer: "A reflective reading for entertainment. No outcome is promised."
**CTA:** See full reading

---

## G. Monetization

### 22. Paywall - web landing page
**Purpose:** Sell the reading whose first line the user just saw, as a web sales page that asks twice, not an app sheet.
**Headline A:** Your witch reading is ready
**Headline B:** See your full craft
**Body A:** Your {{power}} ritual, timed to the Moon.
**Body B:** Thirty days of practice built around you.
**Plans:** 1 week ({{price_1w}} intro, then {{renewal_1w}}/week) · 4 weeks ({{price_4w}}, then {{renewal_4w}} every 4 weeks, MOST POPULAR, pre-selected) · 12 weeks ({{price_12w}}, then {{renewal_12w}} every 12 weeks, best per-week value). Renewal shown on every plan card and in the CTA line. No trial-price picker, no promo code.
**Visual:** Long-scroll page with its own sticky bar (brand, mini "Get my reading" CTA after the first plan block, close X). Sections:
1. Hero: eyebrow "Your reading is ready", the power glyph on the chart wheel, 4 fact chips (power, Sun, Moon, Rising).
2. Plan block: 3 plans, "Due today", CTA, payment badges, secure/cancel row, renewal line.
3. "Inside your reading": the power type open, then locked rows: Your 30-day ritual, Moon-timed practice, What your Moon says about your craft, Your lineage line, Daily moon guide in the app.
4. "How it works": checkout, read it now, keep going in the app.
5. Rating and reviews: shown only when a real rating and real reviews are configured (hidden while the CONFIG values are tokens).
6. Money-back seal (only shown when the refund policy is real; hidden while `refundDays` is a token).
7. FAQ accordion: When will I get it? · How do I cancel? · Will I be charged again? · Is this real magic or prediction? · Do I need candles or supplies?
8. Plan block again.
9. Footer: legal links, entity, entertainment disclaimer.
Sticky bottom CTA shows the selected plan and today's charge while no plan block is on screen.
**Microcopy:** Renewal line: "{{price}} today, then {{renewal}} every {{period}} until you cancel." FAQ on outcomes: "It is a reflective practice built on your chart and answers. It does not predict or change events."
**Fallback offer:** #23, shown once. Declining it goes to #24 with your power type and one section open.
**CTA:** Get my reading

### 23. Last-chance offer (on close)
**Purpose:** One second chance after a paywall close, shown once per session. A smaller, different product from the subscription tiers.
**Headline A:** Not ready? Get the pack
**Headline B:** One-time offer, shown once
**Body A:** A smaller pack, paid once. No subscription.
**Body B:** Just your power and moon practice.
**Plans:** One offer card, a different and smaller product than the 1-week plan: {{offer_name}} (Power pack), {{offer_price}} paid once, no renewal, no strike-through price. Includes your power type in full, your moon-timed practice and the reading saved to your email. Not included (stated on the card): the 30-day ritual, what your Moon says about your craft, your lineage line, the daily moon guide. Optional {{offer_badge}}.
**Visual:** Web page in the paywall's style: sticky bar with close X, eyebrow "One-time offer", one gold-bordered card with a chart-wheel thumbnail, price row, 3 checks, a "not included" line, CTA, payment badges, a "paid once, nothing to cancel" line.
**Microcopy:** No timer unless a real deadline exists (`CONFIG.offer.expiresMin`). Money-back line only when the refund policy is real. Buying the pack opens only the power type and the moon practice in #24; the rest stays locked behind the subscription. Decline link: "No thanks, show my free reading".
**CTA:** Get the power pack

---

## H. Payoff

### 24. Reading and app handoff
**Purpose:** Deliver the reading (all sections if paid; power type plus one section if not) and move the user into the app.
**Headline A:** Your witch power reading
**Headline B:** Here is your craft
**Body A:** Your chart, your answers, your practice.
**Body B:** Power first, then what to do next.
**Visual:** Power glyph and name, three sign chips, section cards: Your power (open), What your Moon says about your craft, Your 30-day ritual, Your moon-timed practice (next new moon date, real), Your lineage line. Then "Continue in the Nebula app", store badges.
**Microcopy:** "A reflective reading for entertainment. No outcome is promised."
**CTA:** Open the app (unpaid: Unlock all + Open the app)

---

## Notes

- **Replaces `nebula/funnel-content.md`.** The old 25-screen generic horoscope brief (never demoed) is superseded by this one for the witch/birth-chart angle. Do not build a demo from the old file.
- **Scoring (demo, deterministic).** Five axes, each scaled to its own maximum: Seer (#3, #5, #6, image eye), Dreamwalker (#4, #6, image butterfly), Moon Weaver (#7, image moon), Earth Keeper (#8), Healer (#10, #11). Options score 3/2/1/0. Highest wins; an exact tie goes to the Sun element (water Healer, earth Earth Keeper, air Seer, fire Moon Weaver). "Other" on #14 adds nothing, so Other never blocks or skews.
- **Branch:** #12 any answer except "None I know" opens #13; "None I know" jumps to #14. Lineage only affects one line of the reading.
- **Ephemeris required.** No copy may claim a "real chart" in production until the host's ephemeris and house engine replace the demo's Moon and Rising approximations (the demo tags Moon and Rising "Estimate" when the birth time is unknown).
- **Real vs placeholder.** Sun sign is exact from the birth date. The demo estimates the Moon sign from the Moon's mean orbit and the Rising sign from birth time (about one sign per two hours); production must use the host's ephemeris. The "next new moon" date in #24 uses the real 29.53-day cycle. Score weights and section copy are placeholders.
- **Drop-off risk:** #16 and #17 (birth time and city), plus the length of the statement run (#3-#8). Mitigations: skip links with fallbacks, #9 as a break, and the free reveal at #19 as the reward. Measure completion per screen and skip rate for #16 and #17.
- **No accuracy meter, no "lying detection".** Both are dark patterns in the references (a rising accuracy %, Likert trap questions). Not used.
- **Monetization:** one subscription layer. Nebula's post-purchase report upsells and pay-per-minute chat are deliberately not sold here. Measure paywall-to-checkout and offer acceptance separately.
- **Unverified:** Astroline's witch-mode screens (inferred from the shared quiz engine) and both paywalls. Nebula's pricing ladder ($1/$5/$9/$13.67 trial picker, secret $1 to $20.99 discount, $49.99/30d renewal) is knowingly not copied.
- **Policy:** Meta personal-attribute rule. Ad copy asks the question ("What's your witch power?") and never says "You are a witch" or "You have powers". No health or outcome claims.
- **Images:** the demo uses SVG/CSS art. `gen_images.py` lists prompts for `hook-moon`, `inkblot`, `reveal-sky`, `paywall-hero` (JPG, 560x840) to drop into `img/` later.
- **A/B first:** (1) Hook A vs B. (2) #19 free Big Three before the email vs after it. (3) #21 power type teaser with vs without the lineage row.
- **Demo (private Artifact):** https://claude.ai/artifact/CYnaYiEhAhQjfoTSWxxfda
