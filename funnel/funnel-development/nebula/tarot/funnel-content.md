---
niche: tarot
display_name: Starlyn - Tarot Reading (Ask the cards one question)
archetype: personalization-quiz
subject: person
input: a topic, where they stand, one question in their own words, how they feel about it, birth date (18+), an optional first name, a spread (1, 3 or 5 cards), and the cards they shuffle, cut and pull themselves
output: their birth card (free, computed from the birth date), the cards they pulled with one line each (free), and a full reading of their question card by card plus 30 days of daily cards
screens: 19
monetization: hard web paywall after the email gate: one plan, 1-week intro then monthly auto-renew; no sale or last-chance offer; purchase leads to a get-the-app screen
offer: none
creative_screens:
  hook-a: 1
  hook-b: 8
  ritual: 12
  reveal: 14
  teaser: 17
motion: >
  hands-free close-up of a gold-edged tarot deck riffling on a dark velvet table, the deck
  splits into three piles, then three face-down cards slide out and flip one by one under
  candlelight
---

# Funnel Content - Starlyn: Tarot Reading

A Starlyn web2app funnel (Meta ad, web quiz, web paywall, Starlyn app) for people who want **a tarot reading about one real question**. The user picks a topic, says where they stand, writes the question in their own words, says how they feel about it, gives a birth date, picks a spread, then **shuffles, cuts and pulls the cards with their own hand**. They get their **birth card** and **the cards they pulled, one line each, for free**, and pay for the full reading of their question plus 30 days of daily cards. Archetype: **personalization-quiz**, the interactive-ritual variant. 19 screens.

**Modeled on (unverified):** the AdSpyLab funnels library holds no pure tarot funnel today (search 2026-10-05: tarot shows up only inside Nordastro, Hint and Spirio, and in Nebula's psychic-chat landing). The flow is derived from category reasoning, the tarot reading apps' own in-app flow (topic, question, spread, draw) and our `nebula/aura-tarot` funnel, which already proved the pull-by-touch mechanic.

**How it differs from `aura-tarot`:** no aura color and no feeling quiz. The whole funnel is about one question the user cares about. The spread size is the user's choice, the deck is cut by them, and the birth card (a real tarot tradition computed from the birth date) is the first free aha instead of an aura color.

**Deliberately honest, and why:**
- **The cards are never pre-set.** The deck is shuffled fresh each session and the user's taps decide the cards. Orientation (upright or reversed) is drawn at the same moment.
- **Tarot is framed as reflection, not prediction**, on the bridge, the reveal, the FAQ and the reading. No "will he come back" promises; love answers talk about what the user can do.
- **No dark patterns:** no countdown, no fake discount, no fake user ticker, no psychic persona. There is no sale and no last-chance offer (Starlyn app policy, 2026-10-05).
- **The typed question never leaves the page in analytics.** Events carry the topic and spread, never the text.
- **Money and health questions** get a line in the reading: "Not financial or medical advice."
- **Palette:** Starlyn navy `#161A27` + gold `#E9C26B`, Fraunces serif headlines, Inter body, canvas starfield. One deck art set (`img/card-00`…`card-21`, `img/card-back`) is shared with `nebula/aura-tarot`.

---

## A. Hook

### 1. Hook
**Purpose:** Promise a reading of the user's own question and set the effort as small.
**Headline A:** Ask the cards one question
**Headline B:** What do the cards say?
**Body A:** Pull your own cards. Get a clear reading.
**Body B:** Your question, your cards, one honest reading.
**Visual:** Full-bleed `img/hook-tarot.jpg`: hands over a dark velvet table, three gold-edged cards fanned, one candle, starfield fading in at the top. Logo row "✦ Starlyn". Chips: 2-min · Your question · You pull the cards.
**Microcopy:** "By continuing you confirm you're 18+ and agree to our Terms of Use and Privacy Policy. For entertainment and reflection."
**CTA:** Start my reading

---

## B. Your question

### 2. Topic
**Purpose:** The first cheap tap; it picks the question chips, the spread positions and the reading's frame.
**Headline A:** What is on your mind?
**Headline B:** Pick your topic
**Body A:** The cards answer one topic at a time.
**Body B:** Choose what you want clarity on.
**Options:** 💞 Love · 💼 Work · 💰 Money · 🌱 Myself · ✏️ Other
**Field:** Single select, auto-advance. Other opens a one-line input (max 40 chars).
**Visual:** Four tall picture cards in a 2x2 grid (`img/topic-love/work/money/self.jpg`), gold border on select.
**CTA:** (auto-advances)

### 3. Where you stand
**Purpose:** Situational context so the reading talks to their real case. Options switch with the topic.
**Headline A:** Where do you stand?
**Headline B:** Your situation, briefly
**Body A:** It changes how each card reads.
**Body B:** Pick the closest one.
**Options:** Love: 🙋 Single · 💬 Seeing someone · 💍 In a relationship · 💔 It's over · ✏️ Other. Work: 🚀 Want a change · 😮‍💨 Stuck · 🌱 Starting out · 🤔 A decision · ✏️ Other. Money: 📉 Tight right now · 📈 Growing · 🧾 A big choice · 🔄 Changing · ✏️ Other. Myself: 🧭 Lost · 🌙 Restless · ✨ Changing · 🌿 Healing · ✏️ Other.
**Field:** Single select, auto-advance.
**Visual:** Stacked pill options with emoji, gold fill on select. Topic chip above the headline.
**CTA:** (auto-advances)

### 4. Your question
**Purpose:** The heart of the funnel. A question in their own words makes the reading theirs.
**Headline A:** Ask your question
**Headline B:** Write it in one line
**Body A:** Open questions get the clearest answers.
**Body B:** "What should I…" works better than "Will…"
**Field:** One-line text, 6-90 chars, with 3 suggestion chips per topic that fill the field when tapped (Love: "What should I know about us?" · "How do I move on?" · "What is blocking love for me?"). Skip link fills a general question.
**Visual:** Large serif input on a glass card, chips under it, a soft candle glow behind.
**Error state:** "Add a few words, or tap a suggestion."
**Skip link:** Let the cards choose
**Microcopy:** "Your question stays private. It is never shared or used in ads."
**CTA:** That's my question

### 5. How you feel about it
**Purpose:** Sets the tone of the reading (gentle vs direct) and makes the reveal feel heard.
**Headline A:** How does it feel?
**Headline B:** And how do you feel?
**Body A:** Your reading adjusts its tone to this.
**Body B:** No wrong answer here.
**Options:** 🌤 Hopeful · 😟 Anxious · 🧱 Stuck · 🔎 Curious
**Field:** Single select, auto-advance.
**Visual:** Pills on the starfield, the user's question shown small in quotes above.
**CTA:** (auto-advances)

### 6. A mirror, not a verdict (bridge)
**Purpose:** Honest framing before data, and a breather after the typed question.
**Headline A:** Tarot is a mirror
**Headline B:** How a reading works
**Body A:** The cards show patterns. You decide what to do.
**Body B:** You pull the cards. We explain what they mean.
**Visual:** One card-back image tilting slowly, three numbered rows: 1 You shuffle and cut · 2 You pull the cards · 3 We read them for your question.
**Microcopy:** Progress hint "Halfway there".
**CTA:** Continue

### 7. Birth date
**Purpose:** Gives the birth card and Sun sign that color the reading; also the 18+ gate.
**Headline A:** When were you born?
**Headline B:** Your birth date
**Body A:** It reveals your birth card.
**Body B:** Tarot links every birth date to a card.
**Field:** Month · day · year selects. Under-18 blocks with a persisted sessionStorage flag.
**Visual:** Three selects in a glass row, a faint card outline behind.
**Error state:** "Pick a real date." · Under 18 (exact age from month, day and year): a blocking notice "Starlyn is for adults 18+." with a "Change my birth date" button that returns to this screen; the block persists for the session (sessionStorage) until the date is changed.
**CTA:** Reveal my birth card

### 8. Your birth card (free aha #1)
**Purpose:** A real, computed micro-reveal that proves the reading uses their data.
**Headline A:** Your birth card: {{birth_card}}
**Headline B:** You were born under {{birth_card}}
**Body A:** {{birth_card_line}}
**Body B:** Your lifelong card, from your birth date.
**Visual:** The birth card art (`img/card-NN.jpg`) flips in, Sun sign chip under it. Method line: "Month + day + year, added and reduced to 0-21."
**Microcopy:** "A tradition, not a fact about you."
**CTA:** Continue

### 9. First name
**Purpose:** Personal tokens for the reveal and the reading.
**Headline A:** What should we call you?
**Headline B:** Your first name
**Body A:** Used only on your reading.
**Body B:** Optional, but it reads better.
**Field:** Text, max 24 chars.
**Visual:** Plain input on a glass card.
**Skip link:** Skip
**CTA:** Continue

### 10. Your spread
**Purpose:** Lets the user choose how deep to go, which sets how many cards they pull.
**Headline A:** Choose your spread
**Headline B:** How deep should we go?
**Body A:** More cards, more detail.
**Body B:** Three cards is the classic.
**Options:** 1 card · Clear answer · 3 cards · Past, now, next (Recommended) · 5 cards · The full picture
**Field:** Single select, 3 cards pre-selected.
**Visual:** Three wide cards with mini card-back fans (1, 3, 5), position names listed under each.
**CTA:** Continue

---

## C. Trust

### 11. Every card is yours
**Purpose:** Trust beat right before the ritual: proves nothing is pre-set.
**Headline A:** You draw every card
**Headline B:** No card is chosen for you
**Body A:** The deck is shuffled fresh, just for you.
**Body B:** Your taps decide your cards.
**Visual:** Three checks on glass: Fresh shuffle every time · Upright or reversed, drawn live · Read for {{question_short}}. Rating row only when `{{app_rating}}` is real.
**CTA:** Shuffle the deck

---

## D. The ritual and the free reveal

### 12. Shuffle and cut
**Purpose:** The signature moment and the best ad creative; physical ritual raises investment.
**Headline A:** Shuffle, then cut
**Headline B:** Hold to shuffle
**Body A:** Think of your question while you hold.
**Body B:** Then pick one of three piles.
**Field:** Press-and-hold button riffles the deck (min 1.5 s, progress ring). Then the deck splits into 3 piles; tapping one cuts it.
**Visual:** Card-back deck centered under candlelight, riffle animation, three piles sliding apart.
**CTA:** (hold, then tap a pile)

### 13. Pull your cards
**Purpose:** The user picks N face-down cards from a fan of 22.
**Headline A:** Pull {{n}} cards
**Headline B:** Trust your hand
**Body A:** Tap the ones that call to you.
**Body B:** Don't think too hard.
**Field:** Arc fan of 22 card backs; each tap lifts a card into the next empty slot (position labels from the spread). Counter "2 of 3".
**Visual:** Fan across the lower half, slots on top with position names.
**CTA:** Turn them over (enabled when all slots are filled)

### 14. Your cards (free aha #2)
**Purpose:** The main free value: the cards they pulled, named, positioned, one line each.
**Headline A:** Your cards, {{name}}
**Headline B:** What you pulled
**Body A:** One line each. The full meaning is next.
**Body B:** Here is what came up for you.
**Visual:** Slots flip one by one (card art, Roman numeral, name, "Reversed" tag when drawn), position label above, one plain line under each. A locked bar under them: "The answer to your question" (blurred).
**Microcopy:** "Tarot is a prompt for reflection, not a prediction."
**CTA:** See what they mean

### 15. A card a day
**Purpose:** Plants the daily loop the subscription is built on.
**Headline A:** Want a card each morning?
**Headline B:** Your daily card
**Body A:** One card, one line, every day.
**Body B:** A small check-in, at a time you pick.
**Field:** Time picker (8:00 default), applied in the app.
**Visual:** A lock-screen mock with a push: "Today's card: The Star. Rest and trust."
**Skip link:** Not now
**Microcopy:** "Reminders start once you open the app."
**CTA:** Save my time

---

## E. Gate and teaser

### 16. Email
**Purpose:** Capture identity before the meaning is revealed.
**Headline A:** Where should we send it?
**Headline B:** Save your reading
**Body A:** Your reading and app login go here.
**Body B:** So your cards are never lost.
**Field:** Email, validated. Optional marketing opt-in checkbox.
**Visual:** Mini spread thumbnail above the field.
**Error state:** "Enter a valid email address"
**Microcopy:** "Nothing is charged on this step."
**CTA:** Continue

### 17. Reading teaser
**Purpose:** Show the table of contents of the full reading, built from their inputs.
**Headline A:** Your reading is ready
**Headline B:** {{n}} cards, one answer
**Body A:** Built from your question and your cards.
**Body B:** Here is what is inside.
**Visual:** Spread thumbnail + chips (topic, feeling, birth card), then 5 rows, first open: Your cards, one line each (open) · Each card for {{question_short}} (locked) · The answer, in plain words (locked) · What to do this week (locked) · Your birth card guidance (locked).
**CTA:** See my full reading

---

## F. Monetization

### 18. Paywall - web landing page
**Purpose:** The ask, as a long-scroll sales page that sells the reading they built.
**Headline A:** Your reading is ready
**Headline B:** Read what your cards mean
**Body A:** Your question, answered card by card.
**Body B:** Plus a new card every day.
**Plans:** One plan only, pre-selected: 1 week at `$13.67`, then `$49.99` every month until cancelled. No other tiers, no one-time products, no struck prices, no discount badges.
**Visual:** Sticky bar with no close X (hard paywall) and mini CTA. Hero: their spread (card art), question in quotes, chips (topic, spread, birth card). Plan block #1. What's inside (5 rows from screen 17, first open). How it works (3 steps: checkout, download Starlyn, log in with your email). Proof (hidden while tokens). Guarantee only if `{{refund_days}}` is real. FAQ. Plan block #2. Sticky bottom CTA.
**Microcopy:** Renewal line under every CTA: "$13.67 today for your first week, then $49.99 every month until you cancel." FAQ "Will I be charged again?": yes, monthly after the first week unless you cancel. Hard paywall: no close X and no free or "continue" exit. Renewal line under every CTA. FAQ: "Are the cards really random? Yes, shuffled fresh and picked by your taps." · "Can tarot predict the future? No. It is a prompt for reflection." · "How do I cancel?" · "Will I be charged again?" · "Is my question private?"
**CTA:** Get my reading

## G. Payoff

### 19. Get the app
**Purpose:** Hand a paying user straight to the Starlyn app, where the full reading lives.
**Headline A:** You're in, {{name}}
**Headline B:** Your reading is ready
**Body A:** Your full reading is waiting in the Starlyn app.
**Body B:** Download Starlyn: Daily Astrology and log in to open it.
**Visual:** A success check in a glowing well, three numbered steps (Download Starlyn: Daily Astrology · Log in with {{email}} · Open your reading), App Store and Google Play badges under the CTA.
**Microcopy:** "For entertainment purposes only. Cancel anytime in your account." Reached only after purchase (or a return with `?paid=`); there is no free path to it.
**CTA:** Open the app

## Notes

- **Starlyn app policy (2026-10-05):** no sale and no last-chance offer; one plan (1-week intro, then monthly auto-renew); hard paywall, no free reading path; purchase leads to the get-the-app screen; under-18 shows a notice with a "Change my birth date" button.
- **Skipped on purpose:** feeling/aura quiz (aura-tarot owns it), social-proof numbers (tokens until real), gamified wheel (the ritual is the reveal), countdown and struck prices, psychic persona.
- **Monetization:** one subscription layer measured at screen 18 (paywall CVR); screen 19 marks completion. Nebula's live psychic chat is the in-app second layer and is not sold in this funnel.
- **A/B first:** hook A vs B; spread default 3 vs 1 (1 card = faster funnel, 3 = more value to unlock); question typed (4) vs topic-only.
- **Shared art:** the 22 Major Arcana faces and the card back are the same files as `nebula/aura-tarot`; regenerate them once for both.
