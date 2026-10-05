---
niche: aura-tarot
display_name: Starlyn - Aura and Tarot (What color is your aura?)
archetype: personalization-quiz
subject: person
input: 6 feeling and energy taps, the color you are drawn to, your focus area, birth date (18+), an optional first name, and 3 tarot cards you pick yourself
output: your aura color (Red / Amber / Green / Blue / Indigo / Violet) with a free reading, a 3-card tarot spread you pulled, and a full reading with a 30-day aura plan
screens: 21
monetization: hard web paywall after the email gate: one plan, 1-week intro then monthly auto-renew; no sale or last-chance offer; purchase leads to a get-the-app screen
offer: none
creative_screens:
  hook-a: 1
  hook-b: 9
  reveal: 14
  pull: 16
  teaser: 19
motion: >
  a soft halo of color blooms around a silhouette and shifts hue until it settles on
  one color, then three face-down tarot cards flip one by one in a gold-lit fan
---

# Funnel Content - Starlyn: Aura and Tarot

A Starlyn web2app funnel (Meta ad, web quiz, web paywall, Starlyn app) for the "what color is my aura?" niche. The user gives **six feeling taps, the color they are drawn to, a focus area and their birth date**. They get **an aura color and a free reading**, then **pull three tarot cards by touch** as a second aha, and pay for the full reading. Archetype: **personalization-quiz**. The quiz answers and the color pull decide the aura; the birth date adds the Sun sign and breaks ties. 21 screens.

**Modeled on:**
- Nebula aura ads (3,162 ads, 53 screens in the library; research `nebula-chai.md` section 4): a short feeling quiz, a free reveal of an aura color ("Indigo") plus a breakdown, then a paywall with an upsell report bundle. The screen-level flow comes from the research summary; the live funnel was not re-crawled, so exact copy and order are **unverified**.
- Starlyn `palm-reading` and `witch-power` for the house web paywall, rating gating and one-time pack offer.

**Kept from the reference:**
- A named color result as the free aha ("Your aura is Indigo"), with one line per trait.
- Short tap questions about energy and mood that feel like a mirror, not a test.

**Deliberately changed, and why:**
- **A second aha: a tarot pull the user does with their own hand.** After the aura reveal the user shuffles and taps three face-down cards. The deck is shuffled fresh each session, so the cards are not pre-set and no scratch-card trick is used. The free beat shows the three cards and one line each.
- **Fewer questions.** Six feeling taps, a color pull, a focus area and a birth date. Each one changes the aura or the card reading.
- **No dark patterns.** No "no charge yet" A/B, no timer reset, no fake discount, no fixed outcome, no persona guide, no fake user ticker. There is no sale and no last-chance offer (Starlyn app policy, 2026-10-05).
- **Honest framing.** The aura is a reflective reading from your answers, not a measurement of any field around the body. The FAQ says so plainly, and tarot is described as a prompt for reflection, not prediction.
- **Ad-safe:** the hook is a question ("What color is your aura?"), never a claim about the viewer. 18+ only.
- **Palette:** Starlyn navy `#161A27` + gold `#E9C26B`; the aura color is the one accent that changes per result.

---

## A. Hook

### 1. Hook
**Purpose:** Promise a named color result and a tarot pull, and set the quiz as short.
**Headline A:** What color is your aura?
**Headline B:** See your true color
**Body A:** A two-minute quiz, then three tarot cards.
**Body B:** Your color, your cards, one honest reading.
**Visual:** A soft halo of color around a calm silhouette on a navy star field (`img/hook-aura.jpg`; the demo draws it in CSS until the image exists). A rotating eyebrow cycles "Indigo / Amber / Violet". Row of 3 chips: 2-min quiz · Your color · 3 cards.
**Microcopy:** "By continuing you confirm you're 18+ and agree to our Terms of Use and Privacy Policy. For entertainment purposes only."
**CTA:** Start quiz

---

## B. Your energy

### 2. Energy right now
**Purpose:** Cheap first tap about the present mood; scores two aura colors.
**Headline A:** How do you feel right now?
**Headline B:** Your energy, this minute
**Body A:** Go with your first gut answer.
**Body B:** No wrong answer. Just honest.
**Options:** ⚡ Buzzing · 🌊 Calm · 🌫️ Drained · 🌀 Restless
**Visual:** Pill options, gold fill on tap, auto-advance; small "1 of 6" tag above the question.
**CTA:** (tap, auto-advances)

### 3. Around people
**Purpose:** Social energy; separates warm colors from deep colors.
**Headline A:** After a crowd, you feel…
**Headline B:** Around lots of people…
**Body A:** Think of the last busy event.
**Body B:** Parties, offices, family dinners.
**Options:** ⚡ Charged · 😌 Fine · 🪫 Drained · 🎭 Depends
**Visual:** As #2, tag "2 of 6".
**CTA:** (tap, auto-advances)

### 4. Statement - reading rooms
**Purpose:** First agree/disagree tap; scores the intuitive colors.
**Headline A:** I sense a room's mood
**Headline B:** I feel the mood on entry
**Body A:** Even before anyone speaks.
**Body B:** Be honest. There is no wrong answer.
**Options:** 💯 Totally · 👍 Mostly · 🤷 Not sure · 🙅 Not me
**Visual:** As #2, tag "3 of 6".
**CTA:** (tap, auto-advances)

### 5. Friends call you
**Purpose:** Self-image tap; scores personality-linked colors.
**Headline A:** Friends call you…
**Headline B:** Your role in the group
**Body A:** Pick the one that fits best.
**Body B:** The label that sticks.
**Options:** ⚡ The spark · 🌿 The calm one · 🧠 The thinker · 🌙 The dreamer
**Visual:** As #2, tag "4 of 6".
**CTA:** (tap, auto-advances)

### 6. Statement - alone time
**Purpose:** Second agree/disagree tap; scores the deep colors.
**Headline A:** I need alone time to reset
**Headline B:** Quiet time recharges me
**Body A:** Even a little counts.
**Body B:** Think of a normal week.
**Options:** 💯 Totally · 👍 Mostly · 🤷 Not sure · 🙅 Not me
**Visual:** As #2, tag "5 of 6".
**CTA:** (tap, auto-advances)

### 7. What you crave
**Purpose:** Free-choice question about what the user wants most; there is an Other.
**Headline A:** What do you crave most?
**Headline B:** What are you missing?
**Body A:** Right now, in this season of life.
**Body B:** Pick the closest, or write your own.
**Options:** ⚡ Change · 🏡 Peace · 🎯 Focus · 💞 Connection · ✏️ Other
**Field:** "✏️ Other" opens a one-line input (max 40 characters). CTA stays disabled until it has text. Other adds nothing to the score, so it never blocks or skews.
**Visual:** As #2, tag "6 of 6". Other opens an inline box under the list.
**Error state:** CTA disabled while the Other box is empty.
**CTA:** (tap, auto-advances; Other: Continue)

### 8. Colors showing (bridge)
**Purpose:** A short break after six taps with no invented stat; names the next section.
**Headline A:** Your colors are showing
**Headline B:** Something is taking shape
**Body A:** Next, pick the color you feel drawn to.
**Body B:** Two quick picks, then your birth date.
**Visual:** A soft halo shifting through hues in a round well. No percentage, no meter.
**CTA:** Next

---

## C. Your color and focus

### 9. Color pull
**Purpose:** The color the user is drawn to is the strongest single signal for the aura.
**Headline A:** Which color pulls you in?
**Headline B:** Trust the first color
**Body A:** Don't think. Pick the one you like most.
**Body B:** Your eye knows before you do.
**Options:** 🔴 Red · 🟠 Amber · 🟢 Green · 🔵 Blue · 🟣 Indigo · 💜 Violet
**Visual:** Six large color orbs in a 3x2 grid, each glowing softly in its own color, label under each. Tap fills with a gold ring, auto-advance.
**CTA:** (tap, auto-advances)

### 10. Focus area
**Purpose:** Sets the topic of the tarot reading and the focus line in the full reading.
**Headline A:** What's on your mind most?
**Headline B:** Where do you want clarity?
**Body A:** Your cards will speak to this.
**Body B:** One area, for your tarot spread.
**Options:** 💞 Love · 💼 Work · 🌱 Growth · 🏡 Home and family
**Visual:** Pill options, auto-advance.
**CTA:** (tap, auto-advances)

### 11. Your birth date
**Purpose:** Real Sun-sign input, the aura tie-break and the 18+ gate.
**Headline A:** When were you born?
**Headline B:** Your date of birth
**Body A:** Your Sun sign shades your aura.
**Body B:** Needed to finish your reading.
**Field:** Month / Day / Year selects. Years stop at today minus 18. Sun-sign chip appears once complete.
**Visual:** Three rounded selects in one row, sign chip fades in.
**Microcopy:** "You must be 18 or older."
**Error state:** "Pick your full date of birth" · Under 18 (exact age from month, day and year): a blocking notice "Starlyn is for adults 18+." with a "Change my birth date" button that returns to this screen; the block persists for the session (sessionStorage) until the date is changed.
**CTA:** Continue

### 12. First name
**Purpose:** Personalisation token for the reveal and the reading; optional, so it never blocks.
**Headline A:** What should we call you?
**Headline B:** Your first name
**Body A:** We'll use it in your reading.
**Body B:** Just a first name is fine.
**Field:** One-line text input (max 24 characters). Without a name the copy reads "you".
**Visual:** A single light field, a soft glow behind it.
**Skip link:** Skip
**CTA:** Continue

---

## D. Wait and free aura reveal

### 13. Reading your aura (loader)
**Purpose:** Manufacture a short wait; the reveal moment for ads.
**Headline A:** Reading your aura
**Headline B:** Mixing your colors
**Steps:** Weighing your energy answers… · Blending the color you chose… · Adding your Sun sign… · Naming your aura color…
**Visual:** A halo around a silhouette cycling through hues, progress ring, 4 task rows ticking off.
**CTA:** (auto-advances, ~6 seconds)

### 14. Your aura (free reveal)
**Purpose:** The free aha: the aura color, its name and one line per trait. No meter, no percentage.
**Headline A:** Your aura is {{aura}}
**Headline B:** {{name}}, you glow {{aura}}
**Body A:** Built from your answers and your Sun sign.
**Body B:** This is how your energy reads today.
**Visual:** A large halo in the aura color around a silhouette, aura name in the same color in gold serif, then 3 trait cards (Core, Strength, Watch for), each one line. A chip shows your Sun sign.
**Microcopy:** Per color, one line. Red: "You run on drive and heat." Amber: "You warm every room you enter." Green: "You grow things, and steady people." Blue: "You calm things with clear words." Indigo: "You notice what others miss." Violet: "You live half in imagination." Disclaimer: "A reflective reading for entertainment. No outcome is promised."
**CTA:** Next

---

## E. Tarot pull

### 15. Shuffle (tarot intro)
**Purpose:** A short ritual that frames the pull as a reflection on the focus area and gives the user a beat to commit.
**Headline A:** Now, three cards
**Headline B:** Time to pull your cards
**Body A:** Hold your question in mind, then shuffle.
**Body B:** We'll read them for your {{focus}} question.
**Visual:** A tidy stack of face-down cards with gold-lit backs, the focus area as a chip above it. On tap the stack riffles for a second.
**Microcopy:** "Tarot is a prompt for reflection, not a prediction."
**CTA:** Shuffle

### 16. Pull your cards
**Purpose:** The interactive second aha. The user taps any three of seven face-down cards; each flips on touch.
**Headline A:** Pick three cards
**Headline B:** Choose with your gut
**Body A:** Tap any card. It flips right away.
**Body B:** Roots, Now and Next, in that order.
**Field:** Fan of 7 face-down cards. The deck is shuffled fresh when you tap Shuffle; the card under each tap is whatever is in that position, so nothing is pre-set. Slots labelled Roots, Now, Next fill in order. A card cannot be tapped twice. CTA stays disabled until three cards are open; a "Pull again" link reshuffles and clears the picks.
**Visual:** Seven card backs in a gentle fan on navy. A tapped card lifts, flips with a short turn and glides to its slot above. Three slots with the labels Roots, Now, Next.
**Error state:** CTA disabled until three cards are open.
**CTA:** See my cards

### 17. Your three cards (free)
**Purpose:** The free tarot payoff: the three cards you pulled with one line each, tied to your focus.
**Headline A:** Your three cards
**Headline B:** Here is your spread
**Body A:** Roots, Now and Next for your {{focus}}.
**Body B:** One line each. The full read comes next.
**Visual:** Three card faces side by side (Roots, Now, Next), each with the card name, a glyph and one line. Beneath, a faded "How the three connect" row with a lock.
**Microcopy:** One line per card (22 Major Arcana). Example: "The Star: hope returns, quietly." "Disclaimer: Tarot is a prompt for reflection, not a prediction."
**CTA:** Next

---

## F. Gate and teaser

### 18. Email
**Purpose:** Lead capture, also the app login.
**Headline A:** Where should we send it?
**Headline B:** Save your reading
**Body A:** Get your reading and log in to the app.
**Body B:** One email, no spam.
**Field:** Email (light field), optional marketing checkbox (unticked by default).
**Error state:** "Enter a valid email address"
**Microcopy:** "By continuing, you agree to our Terms of Use and Privacy Policy."
**CTA:** Continue

### 19. Aura and cards teaser
**Purpose:** The last free beat: your aura, your spread and one link line, then locked rows for what the paywall sells.
**Headline A:** Your aura and your cards
**Headline B:** Your color meets your cards
**Body A:** One reading, built from both.
**Body B:** Here is the thread that links them.
**Visual:** The aura halo with the three card backs in a row, one link line in the aura color ("Your {{aura}} aura leans toward {{card}}"). Below: locked rows "How the three connect", "Your 30-day aura plan", "Your {{focus}} guidance", "Your aura in each area of life".
**Microcopy:** Disclaimer: "A reflective reading for entertainment. No outcome is promised."
**CTA:** See full reading

---

## G. Monetization

### 20. Paywall - web landing page
**Purpose:** Sell the reading whose first lines the user just saw, as a web sales page that asks twice, not an app sheet.
**Headline A:** Your aura reading is ready
**Headline B:** See your full reading
**Body A:** Your {{aura}} aura and three cards, in full.
**Body B:** A 30-day plan built around your color.
**Plans:** One plan only, pre-selected: 1 week at `$13.67`, then `$49.99` every month until cancelled. No other tiers, no one-time products, no struck prices, no discount badges.
**Visual:** Long-scroll page with its own sticky bar (brand, mini "Get my reading" CTA after the first plan block, no close X (hard paywall)). Sections:
1. Hero: eyebrow "Your reading is ready", the aura halo with the three card backs, 4 fact chips (aura, Sun sign, focus, cards).
2. Plan block: 3 plans, "Due today", CTA, payment badges, secure/cancel row, renewal line.
3. "Inside your reading": your aura open, then locked rows: Your three cards in depth, Your 30-day aura plan, Your focus guidance, Daily card in the app.
4. "How it works": checkout, read it now, keep going in the app.
5. Rating and reviews: shown only when a real rating and real reviews are configured (hidden while the CONFIG values are tokens).
6. Money-back seal (only shown when the refund policy is real; hidden while `refundDays` is a token).
7. FAQ accordion: When will I get it? · How do I cancel? · Will I be charged again? · Is aura reading scientific? · Is tarot prediction?
8. Plan block again.
9. Footer: legal links, entity, entertainment disclaimer.
Sticky bottom CTA shows the selected plan and today's charge while no plan block is on screen.
**Microcopy:** Renewal line under every CTA: "$13.67 today for your first week, then $49.99 every month until you cancel." FAQ "Will I be charged again?": yes, monthly after the first week unless you cancel. Hard paywall: no close X and no free or "continue" exit. Renewal line: "{{price}} today, then {{renewal}} every {{period}} until you cancel." FAQ on outcomes: "Aura colors here are a reflective reading from your answers. Not a scan, not a measurement."
**CTA:** Get my reading

## H. Payoff

### 21. Get the app
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
- **Reference unverified.** The Nebula aura funnel (3,162 ads, 53 screens) is known from the research summary only; screen order and exact copy are inferred, not captured. Treat the competitor beats as unverified.
- **Scoring (demo, deterministic).** Six aura colors (Red, Amber, Green, Blue, Indigo, Violet). Each option in #2, #3, #5, #7 adds 2 to one color and 1 to another; #4 and #6 add to the intuitive and deep colors by 3/2/1/0; the color pull #9 adds 3 to the picked color. Highest wins; an exact tie goes to the picked color, then the Sun element. "Other" on #7 adds nothing, so it never skews.
- **Tarot pull.** Seven cards from a fresh shuffle of the 22 Major Arcana; the user opens three by touch. Upright only. The result differs each session by design; the reading below the free beat reads whichever cards were opened. No card is pre-set.
- **Real vs placeholder.** Sun sign is exact from the birth date. Card meanings, trait lines and section copy are placeholders to be replaced with the host's content. The aura is not a measurement and the copy never says it is.
- **Drop-off risk:** length of the tap run (#2-#7) and #16 (the pull needs three deliberate taps). Mitigations: #8 as a break, big touch targets in #16 and the free reveals at #14 and #17 as the reward. Measure completion per screen.
- **No dark patterns.** No "no charge yet" A/B, no timer reset, no pre-set pick, no fake ticker, no persona guide.
- **Policy:** Meta personal-attribute rule. Ad copy asks the question ("What color is your aura?") and never says "Your aura is dark" or implies a trait of the viewer. No health or outcome claims.
- **Images:** the demo uses CSS/SVG art plus local gradient placeholders. `gen_images.py` lists prompts for `hook-aura`, `reveal-aura`, `card-back`, `paywall-hero` (JPG, 560x840) to drop into `img/` later.
- **A/B first:** (1) Hook A vs B. (2) #14 aura reveal before vs after the tarot pull. (3) #19 teaser with vs without the link line.
- **Demo (private Artifact):** https://claude.ai/artifact/6n79EDeWAKmFhhg88ryHN2
