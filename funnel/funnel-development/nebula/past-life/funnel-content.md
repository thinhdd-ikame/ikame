---
niche: past-life
display_name: Nebula - Past Life (Who were you before?)
archetype: personalization-quiz
subject: person
input: era that feels like home, deja vu and recurring-dream signals, a familiar place, 3 agree/disagree statements, early talent, calling, first name, birth date (18+)
output: a past-life story for reflection - an era and a role (free), a gift you carry (free), then where you lived, your life story, a lesson you carry and who you may have known
screens: 20
monetization: web paywall after an email gate (1-week intro, 4-week pre-selected, 12-week anchor, renewal shown next to every price); dismissible to a one-time last-chance "life card" offer, then a free era, role and gift
creative_screens:
  hook-a: 1
  hook-b: 2
  bridge: 10
  reveal: 15
  teaser: 16
motion: >
  a slow ring of five eras turning in a night sky, a gold light settling on one of them
  as a hooded silhouette fades in behind it
---

# Funnel Content - Nebula: Past Life

A Nebula web2app funnel (Meta ad, web quiz, web paywall, Nebula app) for the "who were you before?" niche. The user gives **the era that feels like home, a handful of deja-vu and dream signals, one talent, one calling and their birth date**. They get **a past-life story for reflection**: an era and a role first, then a gift they carry, then the full story. Archetype: **personalization-quiz**; every answer is used in the result, there is no photo or camera step. 20 screens, one flow with three "Other" escape hatches.

**Modeled on:**
- Nebula past-life funnel (appnebula.co/past-life/prelanding, 3,918 ads in 7 months, 49 screens, crawled via live funnelConfig 2026-10-01) and Astroline past-life (quiz-pp?mode=pastlife, 876 ads, 26 screens, capture stops at palm; paywall not captured), via the AdSpyLab research in `nebula-chai.md` section 3.
- Sibling funnel `nebula/marriage-compatibility` for structure, palette, web paywall, guarantee and rating gating, and the one-time offer pass.
- Stages after the quiz in both competitors (palm scan, onboarding, upsells, phone step) are not copied. The exact competitor paywall copy is **unverified**.

**Kept from the references:**
- An identity hook ("who were you?"), then an era question as the first real tap (Nebula asks it at screen 26 of 49; here it comes second).
- Deja vu, recurring dreams and a familiar place as the quiz spine, then three agree/disagree statements, then birth date, then a loader and a teaser of "your era + your role" before the email gate.

**Deliberately changed, and why:**
- **49 screens down to 20.** Nebula's image test, element, ancestors, 111 signs, nostalgia and self-care rounds are cut; every question left changes the result.
- **No fake "decoding progress".** Competitors stretch a 22% to 34% to 56% "decoding" bar across the quiz. Here one short bridge counts the user's own signals (real count out of 6) and the loader is one brief screen. No percentage claims.
- **Honest frame.** Past lives are a belief, not a fact. A reassurance screen (#3), the teaser, the FAQ and the footer say "for reflection, not proof". No claim that the user was a real historical person, no "karma curses", no fear hooks.
- **No palm scan.** Nebula and Astroline end the quiz with a palm photo; here nothing is uploaded, so there is no camera step and no deletion promise to write.
- **No dark patterns.** No $1 hidden-subscription lead-in, no timer reset, no fake code, no ticker. The last-chance offer shows once, has no timer unless a real deadline exists, and renewal is shown next to every price.
- **Result is one life, not a count.** Competitors tease "how many past lives". A count cannot be derived honestly; we tell one story and do not give a number.
- **Ad-safe:** the ad hook is "Who were you before?", with no claim about the viewer's traits, health or beliefs.
- **Palette:** Nebula navy `#161A27` + gold `#E9C26B`. Hero object is a turning ring of five eras with a hooded silhouette; the gold light rests on the user's era.

---

## A. Hook

### 1. Hook
**Purpose:** Open a quiet, curious question and promise one specific payoff (an era and a role), before asking for anything.
**Headline A:** Who were you before?
**Headline B:** Meet your past self
**Body A:** A few taps. Find your era and your role.
**Body B:** A story from your answers, for reflection.
**Visual:** A ring of five era glyphs turning slowly over a navy star field, a hooded silhouette fading in behind (`img/hook-eras.jpg`; the demo draws the ring in SVG until the image exists). A gold eyebrow rotates Ancient / Medieval / Renaissance / 1800s. Row of 3 chips: 2-min quiz · Your era · Your role.
**Microcopy:** "By continuing you confirm you're 18+ and agree to our Terms of Use and Privacy Policy. Past lives are a belief, not a fact. For entertainment and reflection only."
**CTA:** Start reading

---

## B. Your signals

### 2. Era that feels like home
**Purpose:** First real tap and the main result input: the era the story is set in. Cheap, emotional, one tap.
**Headline A:** Which era feels like home?
**Headline B:** Pick your era
**Body A:** Go with your gut.
**Body B:** There is no wrong answer.
**Options:** 🏛️ Ancient · 🏰 Medieval · 🎨 Renaissance · 🎩 1800s · 📻 1900s
**Visual:** Five pill options, gold fill on tap, auto-advance. The ring in the background lights the picked era.
**CTA:** (tap, auto-advances)

### 3. Honest frame
**Purpose:** Set the expectation before personal data: this is a story for reflection, not proof.
**Headline A:** A story to reflect on
**Headline B:** For reflection, not proof
**Body A:** Past lives are a belief, not a fact.
**Body B:** Read it for insight, not as history.
**Visual:** Soft gold glow, a line-icon of an hourglass in a round well.
**CTA:** Next

### 4. Deja vu
**Purpose:** First signal question, easy to answer and relatable.
**Headline A:** Deja vu: how often?
**Headline B:** Deja vu moments
**Body A:** Think of the last few months.
**Body B:** Honest answers help.
**Options:** 🔁 Often · 🌗 Sometimes · 🌱 Rarely · 🚫 Never
**Visual:** Pill options, auto-advance.
**CTA:** (tap, auto-advances)

### 5. Recurring dreams
**Purpose:** Second signal; the dream theme sets the tone of the life story. Free choice, so there is an Other.
**Headline A:** A dream that keeps returning?
**Headline B:** Recurring dreams
**Body A:** Pick the one that fits most.
**Body B:** Even a faint one counts.
**Options:** 🏠 Same place · 👤 Same person · 🌊 Water or storms · 🚫 None · ✏️ Other
**Field:** "✏️ Other" opens a one-line input (max 40 characters). CTA stays disabled until it has text.
**Visual:** Pill options. Other expands an inline text box under the list.
**Error state:** CTA disabled while the Other box is empty.
**CTA:** (tap, auto-advances; Other: Continue)

### 6. A familiar place
**Purpose:** Third signal; the place picked sets where the story happens. Free choice, so there is an Other.
**Headline A:** Somewhere new feels familiar?
**Headline B:** A place you know
**Body A:** A place you've never been.
**Body B:** Pick the closest feeling.
**Options:** 🏰 Old castles · ⚓ Seaside ports · 🏜️ Desert ruins · 🌲 Forest villages · ✏️ Other
**Field:** "✏️ Other" opens a one-line input (max 40 characters). CTA stays disabled until it has text.
**Visual:** Pill options. Other expands an inline text box.
**Error state:** CTA disabled while the Other box is empty.
**CTA:** (tap, auto-advances; Other: Continue)

### 7. Statement 1 - old friends
**Purpose:** First of three agree/disagree statements; each answer counts as a signal on the bridge.
**Headline A:** Strangers feel like old friends
**Headline B:** Instant connections
**Body A:** Do you agree?
**Body B:** Think of the last time.
**Options:** 👍 Agree · 🤔 Not sure · 👎 Disagree
**Visual:** Large statement card, three pill options, auto-advance.
**CTA:** (tap, auto-advances)

### 8. Statement 2 - old things
**Purpose:** Second statement.
**Headline A:** Old songs stir you strangely
**Headline B:** Music and old things
**Body A:** Songs, antiques, old streets.
**Body B:** A pull you can't explain.
**Options:** 👍 Agree · 🤔 Not sure · 👎 Disagree
**Visual:** Same statement card.
**CTA:** (tap, auto-advances)

### 9. Statement 3 - fears
**Purpose:** Third statement; it is the one that most often sounds spooky, so the copy stays gentle.
**Headline A:** Some fears have no source
**Headline B:** Fears without a cause
**Body A:** Do you agree?
**Body B:** A fear with no story.
**Options:** 👍 Agree · 🤔 Not sure · 👎 Disagree
**Visual:** Same statement card.
**CTA:** (tap, auto-advances)

---

## C. Bridge and calling

### 10. Echoes bridge
**Purpose:** A short real break after six signals: it counts the user's own answers, with no invented progress or user count.
**Headline A:** Your answers echo {{era}}
**Headline B:** Your pattern so far
**Body A:** {{echoes}} of 6 signals point to an old pull.
**Body B:** Counted from your own answers.
**Steps:** Gathering your echoes… · Matching them to your era…
**Visual:** The era ring turns, the picked era glows gold, six small dots fill one by one up to the real count. No percentage.
**Microcopy:** Zero signals: Headline stays, Body A reads "Few signals so far. Your story still waits."
**CTA:** (auto-advances, ~4 seconds)

### 11. Early talent
**Purpose:** Result input: the talent becomes "the gift you carry". Free choice, so there is an Other.
**Headline A:** What came easily as a child?
**Headline B:** An early talent
**Body A:** It hints at the gift you carry.
**Body B:** Pick the closest.
**Options:** 🎶 Music · 🗣️ Words · 🛠️ Making things · 🧭 Leading · ✏️ Other
**Field:** "✏️ Other" opens a one-line input (max 40 characters). CTA stays disabled until it has text.
**Visual:** Pill options. Other expands an inline text box.
**Error state:** CTA disabled while the Other box is empty.
**CTA:** (tap, auto-advances; Other: Continue)

### 12. Your calling
**Purpose:** Result input: the calling sets the role in the story. Free choice, so there is an Other.
**Headline A:** Which role calls to you?
**Headline B:** Your calling
**Body A:** Pick the one you'd choose.
**Body B:** Think of an old story.
**Options:** 🛡️ Protector · 📜 Scholar · 🎨 Artist · 🌿 Healer · ✏️ Other
**Field:** "✏️ Other" opens a one-line input (max 40 characters). CTA stays disabled until it has text.
**Visual:** Pill options. Other expands an inline text box.
**Error state:** CTA disabled while the Other box is empty.
**CTA:** (tap, auto-advances; Other: Continue)

### 13. Your name
**Purpose:** Name capture for personalization; optional so it never blocks.
**Headline A:** What should we call you?
**Headline B:** Your first name
**Body A:** Your reading will use it.
**Body B:** Optional. Skip any time.
**Field:** One-line text "First name" (max 24 characters). CTA stays disabled until it has text, plus link "Skip".
**Visual:** Single light input on the navy field, gold caret.
**Microcopy:** Skip fallback: later screens say "Your past life", not "{{name}}'s past life".
**Error state:** CTA disabled while the field is empty.
**Skip link:** Skip
**CTA:** Continue

### 14. Your birth date
**Purpose:** Last input and the 18+ gate; the Sun sign colours the lesson in the story.
**Headline A:** Your date of birth
**Headline B:** Born on which day?
**Body A:** Your Sun sign colours your story.
**Body B:** Needed for your reading.
**Field:** Month / Day / Year selects. Years stop at today minus 18. Sun-sign chip appears once complete.
**Visual:** Three rounded selects in one row, sign chip fades in.
**Microcopy:** "You must be 18 or older."
**Error state:** "Pick your full date of birth"
**CTA:** Continue

---

## D. Wait and result

### 15. Finding your past life (loader)
**Purpose:** A brief honest wait (about 6 seconds, no inline questions, no percentage claims about "decoding"); the reveal moment for ads.
**Headline A:** Finding your past life
**Headline B:** Reading your echoes
**Steps:** Gathering your echoes… · Placing you in your era… · Shaping your role and gift… · Writing your story…
**Visual:** The era ring turning slowly, a short progress ring, 4 task rows ticking off.
**CTA:** (auto-advances, ~6 seconds)

### 16. Past-life teaser
**Purpose:** The free payoff: the era and the role. Holds back where, the story, the lesson and the people.
**Headline A:** You were {{role}}
**Headline B:** Your past life
**Body A:** Era: {{era}}. The full story is inside.
**Body B:** A story for reflection, not proof.
**Visual:** A round medallion (`img/result-life.jpg`) with the era ring and a hooded silhouette, an era chip and a role chip in gold. Below, 4 blurred locked rows: Where you lived · Your life story · The lesson you carry · Who you may have known.
**Microcopy:** "A story for reflection. Past lives are a belief, not a fact. For entertainment purposes only." Role fallback when "Other" is the calling: "a traveller".
**CTA:** See full story

### 17. Email
**Purpose:** Lead capture, also the app login.
**Headline A:** Where do we send it?
**Headline B:** Save your reading
**Body A:** Get your story and log in to the app.
**Body B:** One email, no spam.
**Field:** Email (light field), optional marketing checkbox (unticked by default).
**Error state:** "Enter a valid email address"
**Microcopy:** "By continuing, you agree to our Terms of Use and Privacy Policy."
**CTA:** Continue

---

## E. Monetization

### 18. Paywall - web landing page
**Purpose:** Sell the story whose first line the user just saw, as a web sales page that asks twice, not an app sheet.
**Headline A:** {{name}}, your story is ready
**Headline B:** See your full past life
**Body A:** Where you lived, your story, your lesson.
**Body B:** Who you knew, and what you carry.
**Plans:** 1 week ({{price_1w}} intro, then {{renewal_1w}}/week) · 4 weeks ({{price_4w}}, then {{renewal_4w}} every 4 weeks, Recommended, pre-selected) · 12 weeks ({{price_12w}}, then {{renewal_12w}} every 12 weeks, best per-week value). Renewal shown on every plan card and in the CTA line. No trial-price picker, no promo code.
**Visual:** Long-scroll page with its own sticky bar (brand, mini "Get my reading" CTA after the first plan block, close X). Sections:
1. Hero: eyebrow "Your reading is ready", the medallion (`img/paywall-hero.jpg`), 4 fact chips (your sign, your era, your role, your gift).
2. Plan block: 3 plans, "Due today", CTA, payment badges, secure/cancel row, renewal line.
3. "Inside your reading": era and role plus the gift you carry open, then locked rows: Where you lived, Your life story, The lesson you carry, Who you may have known, Daily guide in the app.
4. "How it works": checkout, read it now, keep going in the app.
5. Rating and reviews (hidden until real ratings are supplied; placeholder reviews carry no "verified" label).
6. Money-back seal (rendered only once a real refund policy and period exist; hidden while `{{refund_days}}` is unresolved, also in the offer).
7. FAQ accordion: When will I get it? · How do I cancel? · Will I be charged again? · Is this real? · How is my story made?
8. Plan block again.
9. Footer: legal links, entity, entertainment disclaimer.
Sticky bottom CTA shows the selected plan and today's charge while no plan block is on screen.
**Microcopy:** Renewal line: "{{price}} today, then {{renewal}} every {{period}} until you cancel." Without a name the headline reads "Your story is ready". FAQ on reality: "Past lives are a belief with no scientific proof. Your story is written from your answers, for reflection and fun."
**Fallback offer:** #19, shown once. Declining it goes to #20 with era, role and gift open. Buying the pass opens only the full life story and where you lived in #20; the rest stays locked behind the subscription.
**CTA:** Get my reading

### 19. Last-chance offer (on close)
**Purpose:** One second chance after a paywall close, shown once per session.
**Headline A:** Not ready? Get the life card
**Headline B:** One-time offer, shown once
**Body A:** A smaller pass, paid once. No subscription.
**Body B:** Just your life story and where you lived.
**Plans:** One offer card, a different and smaller product than the 1-week plan: {{offer_name}} (life card), {{offer_price}} paid once, no renewal, no strike-through price. Includes the full life story, where you lived and the reading saved to the email. Not included (stated on the card): the lesson you carry, who you may have known, daily guide. Optional {{offer_badge}}.
**Visual:** Web page in the paywall's style: sticky bar with close X, eyebrow "One-time offer", one gold-bordered card with the medallion thumbnail, price row, 3 checks, a "not included" line, CTA, payment badges, a "paid once, nothing to cancel" line.
**Microcopy:** No timer unless a real deadline exists (`CONFIG.offer.expiresMin`). Decline link: "No thanks, show my free reading".
**CTA:** Get the life card

---

## F. Payoff

### 20. Reading and app handoff
**Purpose:** Deliver the reading (all sections if paid, era, role and gift if not) and move the user into the app.
**Headline A:** {{name}}'s past life
**Headline B:** Here is who you were
**Body A:** A story from your answers, for reflection.
**Body B:** Era and role first, then the story.
**Visual:** Medallion with the era ring, era chip and role chip, then section cards: Your past life (open) · The gift you carry (open) · Where you lived · Your life story · The lesson you carry · Who you may have known. Then "Continue in the Nebula app", store badges.
**Microcopy:** "A story for reflection. Past lives are a belief, not a fact. For entertainment purposes only." Without a name the headline reads "Your past life".
**CTA:** Open the app (unpaid: Unlock all + Open the app)

---

## Notes

- **Drop-off risk:** #13 (name) and #14 (birth date, the first personal-data ask), plus quiz fatigue around #7-#9. Mitigations: #3 honest frame first, #10 as a break, name has a skip. Measure completion per screen and the skip rate for #13.
- **Branches:** none by design. "Other" on #5, #6, #11, #12 changes only the wording of the story (a generic place, gift or role) and never blocks. All 20 screens are shown to every user.
- **Honesty:** past lives are a belief; the frame is stated on #1, #3, #16, #20, the FAQ and the footer. The era and role come from the user's own picks (era from #2, role from #12), not from a hidden calculation. Story text in the demo is a deterministic template; production needs the host's text engine. The count on #10 is the real number of signals the user gave.
- **Monetization:** one subscription layer. Pay-per-minute chat credits and Nebula's later upsells are not sold here. Measure paywall-to-checkout and offer acceptance separately.
- **Unverified:** Nebula's and Astroline's paywall ladders, the $1 / $5 / $9 / $13.67 trial price points and the secret $1 offer were not copied and not verified here. Astroline's capture stops before its paywall.
- **Policy:** Meta personal-attribute rules. Ad copy: no "Are you cursed?", no "Do you remember dying?", no claim about the viewer. Use "Who were you before?" and the era framing.
- **Images:** the demo draws the era ring in SVG and ships three generated-style placeholder JPGs. `IKAME_AI_KEY` was not set, so `gen_images.py` was not run; it lists the prompts for `hook-eras`, `result-life`, `paywall-hero` (JPG, 560x840) to drop into `img/` later with the same names.
- **A/B first:** (1) Hook A vs B. (2) #2 era before vs after the dream and place questions. (3) #16 role first vs era first in the headline.
- **Demo (private Artifact):** https://claude.ai/artifact/EGSD64gYBD1V7W3uhMLcoF
