---
niche: coinin-cards
display_name: CoinIdentify Cards (Trading-Card Web Quiz, Card Scanner)
archetype: scanner-identifier
subject: trading card
input: 4 quick collector answers, one guess-the-grade game, 1 photo of one card (or a sample card)
output: free card ID plus a raw (ungraded) value range; grade potential, top cards to grade and collection value behind the hard paywall, opened in the CoinIdentify app
screens: 18
monetization: hard web paywall after a mandatory email gate; 3 plans 1w $12.99→$39.99/4w, 4w $14.99→$39.99/4w (pre-selected), 12w $39.99→$59.99/12w; no offer on decline; post-purchase one-time add-on (price pending) → get_app
offer: none
creative_screens:
  hook-a: 1
  game: 9
  scan: 12
  reveal: 13
motion: >
  a shoebox of old cards tips open, one card slides out into a gold scan frame,
  tilts under a light sweep, then its ID card and value range slide up beside it
---

# Funnel Content — CoinIdentify Cards (Trading-Card Web Quiz, Card Scanner)

Rebranded 2026-10-07 to **CoinIdentify: Coin Scanner** ("CoinIdentify"), with Starlyn-shape monetization: mandatory email, hard paywall with 3 plans, no offer, a one-time add-on after purchase, then get the app.

A web2app funnel for the CoinIdentify card scanner: **the first web quiz in its category** (Ludex and Collectr are scan-first with no quiz). The hook asks "Which cards are worth grading?" The user answers four quick questions, plays one honest "which card grades higher" game, **scans one real card (or taps "Use a sample card" when no card or camera is at hand)** and gets a **free card ID plus a raw (ungraded) value range** before any paywall. The paywall then sells what is still locked on that card: grade potential, the top cards in the pile to send for grading, and collection value. Archetype: `scanner-identifier`, web variant (18 screens). **Reference funnel:** none for cards. Research §5 of `coursiv-coinin.md` found no card web funnel from CoinIn (competitor); the flow is **unverified** and modelled on our coin funnels (`scanner/coinin`, `scanner/coinin-collector`) and the scan-first card apps. **Deliberate differences from the coin reference:** a personalized result (ID plus raw range) before the paywall, no dollar-figure guessing games, no "become rich" framing, no countdown, no struck anchor prices, no dollar testimonials, no live user counter. **Branch:** if Q1 is sports cards, screen 8 becomes the "sports-card dad" nostalgia bridge. **Trademark rule:** brand and game names (Pokémon, MTG, PSA) are not used as UI labels. Options say "monster-battle cards", "sports cards", "fantasy strategy cards", the bridge says "pro grading", and all card art is generic, invented art. **Palette** follows `scanner/coinin`: charcoal ground, antique gold, serif display. **Reuse plan:** all niche data (card types, sample cards, game pair, level words) sits in one `CARDS` block in the demo, so the sibling collectibles funnels swap that block and keep the flow. Every value is an **estimate**, never "your card is worth $X".

---

## A. Hook

### 1. Hook — Which cards are worth grading?
**Purpose:** Name the everyday "before" state (a shoebox or binder of cards, no idea which matter) and promise one clear answer.
**Headline A:** Which cards are worth grading?
**Headline B:** Shoebox full of cards?
**Body A:** Scan one card and see what you have.
**Body B:** Quick quiz, then your free card ID.
**Visual:** Charcoal ground. Macro of a tipped shoebox and a loose fan of three generic cards under warm light (`img/hook-cards.jpg`), fading into the ground. Below, three trio chips with line icons: "2-min quiz", "Free card ID", "Raw value range". Gold CTA pinned bottom.
**Microcopy:** Under CTA: "By continuing you agree to our Terms of Use and Privacy Policy. Values are estimates only." Both are real links (squad-xteam Terms and Privacy).
**CTA:** Start the quiz

### 2. How it works
**Purpose:** Set the honest frame: three steps and that results are estimates, not appraisals or grades.
**Headline A:** Three steps, one card
**Headline B:** Here's how it works
**Body A:** Quick questions, one scan, your free card ID.
**Body B:** Values are estimates, never a grade.
**Visual:** Three numbered rows with line icons: "1 Answer a few questions", "2 Scan one card", "3 Get its ID and range". Chip: "Estimates only, not an official grade".
**Microcopy:** "Not affiliated with any card publisher or grading company."
**CTA:** Continue

---

## B. Investment

### 3. Name
**Purpose:** Capture a first name for later screens. Optional, with a fallback.
**Headline A:** What should we call you?
**Headline B:** First, your name
**Body A:** Just a first name or nickname.
**Body B:** It makes your card report personal.
**Field:** Text input, max 20 characters, placeholder "First name". Skip link below. Empty or skipped: later screens say "you".
**Skip link:** "Skip"
**CTA:** Continue

### 4. Q1 — Which cards
**Purpose:** Cheap first tap. It picks the sample card, the game pair and the bridge variant (sports branch).
**Headline A:** Which cards do you have?
**Headline B:** What's in the pile?
**Body A:** Pick the closest match.
**Body B:** Mixed? Pick the biggest part.
**Options:**
- 🐉 Monster-battle cards
- 🏀 Sports cards
- 🧙 Fantasy strategy cards
- ✏️ Other
**Field:** Single select, auto-advance on tap (Other opens a one-line input; CTA "Continue" disabled until text is typed).
**Visual:** Progress bar 1/4 in gold, full-width dark pills with gold border, selected pill fills gold.
**Error state:** Other chosen, field empty: CTA disabled, hint "Type a few words to continue."
**CTA:** (auto-advances on select; Continue for Other)

### 5. Q2 — Which era
**Purpose:** Sets the sample card's age and tells the paywall copy whether it is a vintage or modern pile.
**Headline A:** From which years?
**Headline B:** When were they made?
**Body A:** A rough guess is fine.
**Body B:** Check the corner or the back.
**Options:**
- 📼 Before 1990
- 💿 1990s
- 📀 2000s
- 📱 2010s and later
- 🤷 Not sure
**Field:** Single select, auto-advance.
**Visual:** As screen 4, progress 2/4.
**CTA:** (auto-advances on select)

### 6. Q3 — How many cards
**Purpose:** Sizes the collection. It drives the "top cards to grade" and "collection value" lines on the paywall.
**Headline A:** How many cards is that?
**Headline B:** How big is the pile?
**Body A:** No counting needed.
**Body B:** A rough guess is fine.
**Options:**
- 🃏 Under 50
- 🗂️ 50 to 500
- 📦 500 to 2,000
- 🧰 2,000 or more
**Field:** Single select, auto-advance.
**Visual:** As screen 4, progress 3/4. Each pill has a small stack icon that grows with the number.
**CTA:** (auto-advances on select)

### 7. Q4 — What they want to know
**Purpose:** Multi-select intent. It reorders the paywall "what's inside" list and picks the paywall hero line.
**Headline A:** What do you want to know?
**Headline B:** What matters most?
**Body A:** Pick all that apply.
**Body B:** Choose as many as you like.
**Options:**
- 💰 What each is worth
- 🏅 Which to grade
- 🗂️ Sort my collection
- 🔍 Spot rare ones
- ✏️ Other
**Field:** Multi-select, CTA disabled until at least one pick; Other needs text.
**Visual:** Same pill list, check circle right, progress 4/4.
**Error state:** Other picked, field empty: CTA disabled, hint "Type a few words to continue."
**CTA:** Continue

### 8. Bridge — condition decides (branch: sports-card dad)
**Purpose:** Reassurance and one teaching beat before the game: grade comes from condition, not age. The sports branch adds a nostalgia beat.
**Headline A:** Condition beats age
**Headline B:** Details decide the grade
**Body A:** Most cards are common. That's normal.
**Body B:** One quick guess, then your scan.
**Visual:** Default: one card shown worn on the left and sharp on the right, label "Same card, different condition". **If Q1 = sports cards:** the bridge reads "Dad's shoebox, {{name}}?" with a faded 1990s-style shoebox and the line "Old sports cards carry stories. Condition decides the rest." Same worn/sharp pair below.
**Microcopy:** "Four things graders look at: centering, corners, edges, surface."
**CTA:** Let's play

---

## C. Game

### 9. Game — Which card grades higher?
**Purpose:** A short teaching beat with a real answer: tiny condition details decide the grade. It is the honest replacement for a "guess the top-grade price" screen (no dollar figures, per the trap list).
**Headline A:** Which card grades higher?
**Headline B:** Spot the sharper card
**Body A:** Same card, two conditions. Tap one.
**Body B:** Look at corners and centering.
**Options:**
- 🅰️ Card A
- 🅱️ Card B
**Field:** Two tappable card pictures. Card A: sharp corners, even borders. Card B: soft corners, off-centre art. Tap reveals the answer; no penalty.
**Visual:** Two generic cards side by side on charcoal, a loupe over the top-left corner. After the tap Card A gets a gold ring and the other dims.
**Microcopy:** Reveal: "Card A. Sharp corners and even borders score higher." · "A scan checks these details for you." No dollar figure on this screen.
**CTA:** Scan my card

---

## D. Scan

### 10. Camera primer
**Purpose:** Pre-permission screen with a reason, four capture rules and the sample-card escape so users without a card or camera never drop.
**Headline A:** Grab one card
**Headline B:** Let's scan your first card
**Body A:** Any card works, even a common one.
**Body B:** A clear look gives a better match.
**Visual:** A card on dark cloth (`img/card-sample.jpg`), four tip chips with line icons.
**Microcopy:** Tip chips: "One card · Good light · Flat surface · Fill the frame". Privacy line: "Your photo is used to identify this card only." Skip link: "No card handy? Use a sample card".
**Skip link:** "Use a sample card" (sample matched to the Q1 pick)
**CTA:** Continue

### 11. Scan the card
**Purpose:** The core input: gallery upload or camera shot with plain error messages, plus the sample-card fallback.
**Headline A:** Show us the front
**Headline B:** Scan your card
**Body A:** Center the card and hold steady.
**Body B:** Lay it flat on a plain surface.
**Field:** Upload from gallery, Take a photo now (device camera), drag-and-drop. Preview with "Use this photo" and "Choose another". Link "Use a sample card" always visible.
**Visual:** Dashed gold card-shaped (5:7) drop zone. After upload the photo shows in a rounded card frame with a gold edge.
**Error states:**
- "That file isn't a photo. Try a JPG or PNG."
- "That photo is over 15 MB. Try a smaller one."
- "We couldn't open that photo. Try another."
- "It looks dark. Cards read best in bright light." (warning, can continue)
**Skip link:** "Use a sample card"
**CTA:** Identify card

### 12. Identifying
**Purpose:** Manufacture the wait around the user's own card (best ad-creative screen). Advance only when the result is back, minimum about 5 seconds.
**Headline A:** Identifying your card…
**Headline B:** Checking the card database…
**Steps:**
1. Reading the name and number… (0 to 100%, check)
2. Matching set and year… (0 to 100%, check)
3. Looking at edges and corners… (0 to 100%, check)
4. Building your card report… (0 to 100%, check)
**Visual:** The user's card (or the sample) tilts slowly in 3D, the only 3D in the funnel, with a gold scan line sweeping down it. Four rows beneath: label, percent, check, gold bar.
**Microcopy:** Panel footnote: the demo cannot identify real photos and shows the sample result.
**CTA:** (auto-advances when the result returns, minimum about 5 seconds)

### 13. Your card — free ID and raw range
**Purpose:** Deliver real value free: what the card is and a raw (ungraded) value range. Proves the scanner works and makes the locked part feel one tap away. Locked rows tease the category, never a number.
**Headline A:** It's {{card_name}}
**Headline B:** We found your card
**Body A:** {{set_name}}, {{year}}, number {{card_number}}.
**Body B:** Raw range below. Grade is one tap away.
**Visual:** Card photo beside fact rows (name, set, year, number, type). A raw-range bar with the text "Raw estimate range" and two figures from the in-app data source (demo: labelled sample data). Below, three locked rows with a gold lock: "Grade potential", "Top cards to grade", "Collection value". Neutral grey blur, no fake "$$$" shapes.
**Microcopy:** "Raw means ungraded, in the condition scanned. Estimate, not an appraisal." · "Match confidence: {{confidence}}" with link "Not right? Try another photo." No-match state: headline "We couldn't match this one yet" · body "Try brighter light and a plain background." · buttons "Retake photo" / "Use a sample card".
**CTA:** See grade potential

### 14. Grade potential — teaser
**Purpose:** Plant the one question the quiz opened ("worth grading?") with the four criteria shown but not scored, so the paywall hero has a reason.
**Headline A:** Is it worth grading?
**Headline B:** Your grade potential
**Body A:** We check four things. Your result is ready.
**Body B:** Unlock the grade band for this card.
**Visual:** Card photo with four chips on its edges: "Centering", "Corners", "Edges", "Surface", each with a gold lock. A neutral grey locked band reading "Grade band: locked". No grade shown.
**Microcopy:** "An estimate from your photo, not an official grade."
**CTA:** Save my result

---

## E. Gate

### 15. Email gate
**Purpose:** Capture the email before the paywall, framed as saving the card and collection. Mandatory: one validated input, no skip, guest, Google or Apple sign-in. The app activates the subscription from this email; emits `lead` with the email.
**Headline A:** Where should we send it?
**Headline B:** Save your card report
**Body A:** Get your result and keep your scans safe.
**Body B:** One email, no spam.
**Field:** Email input (email keyboard), optional marketing consent checkbox (off).
**Visual:** The scanned card shrinks into the first slot of an empty collection grid (other slots dashed), email field beneath.
**Error state:** "Enter a valid email address."
**Microcopy:** "By continuing, you agree to our Terms of Use and Privacy Policy." (real links) · "We never sell your email."
**CTA:** Continue

---

## F. Monetization

### 16. Paywall
**Purpose:** Hard web paywall, a long sales page selling what is still locked: grade potential for this card, then the top cards to grade and collection value. No close X, no free path.
**Headline A:** See its grade potential
**Headline B:** Unlock your whole collection
**Body A:** Grade band, top cards to grade, collection value.
**Body B:** Scan unlimited cards and track the pile.
**Plans:** Three plans, 4 weeks pre-selected. Every card shows its renewal next to the price.
- 1 week ("Intro week"): $12.99, then $39.99 / 4 weeks.
- **4 weeks: pre-selected**, "Recommended": $14.99, then $39.99 / 4 weeks.
- 12 weeks ("Lowest per week"): $39.99, then $59.99 / 12 weeks.
**Visual:** Sticky brand bar ("CoinIdentify", mini CTA after scrolling, no close X). Hero: the user's card with its raw range (demo: marked "Sample data") and three locked rows glowing gold. Plan block. "What's inside" list (ordered by Q4 picks). "How it works" (3 steps). Proof block (rating and reviews, hidden while tokens are unset). Guarantee seal (hidden while the refund-days token is unset). FAQ. Plan block repeated. The sticky bottom bar (plan name, today's price, CTA) shows from first view whenever no plan-block CTA is on screen.
**Microcopy:**
- Renewal line under the CTA, per selected plan: "$12.99 today for your first week, then $39.99 every 4 weeks until you cancel." · "$14.99 today for your first 4 weeks, then $39.99 every 4 weeks until you cancel." · "$39.99 today for your first 12 weeks, then $59.99 every 12 weeks until you cancel."
- What's inside: "Grade potential estimate" · "Top cards to grade" · "Collection value" · "Unlimited card scans" · "Rare-card flags" · "Sorted collection".
- How it works: Checkout (secure payment) → Get the app (Download CoinIdentify: Coin Scanner from the App Store or Google Play) → Open your report (Log in with your email. Your scan is saved there.).
- FAQ: What's included? · How is the grade estimated? · When do I get my report? (in the CoinIdentify: Coin Scanner app, log in with {{email}}) · How do I cancel? · Will I be charged again? (yes unless you cancel: 1-week and 4-week plans renew at $39.99 every 4 weeks, the 12-week plan at $59.99 every 12 weeks) · Is this an official grade?
- Value disclaimer: "Values and grades are estimates, not appraisals or official grades."
- Footer: Terms · Privacy · Subscription terms · "Not affiliated with any card publisher or grading company." Legal entity hidden while `{{legal_entity}}` is unset.
- No offer on decline: CoinIdentify policy is no sale and no last-chance offer.
**CTA:** Unlock my card

### 17. Add-on upsell — Grading Submission Plan
**Purpose:** Right after the plan purchase, offer one add-on for the card they just scanned, at its listed price, then hand off to the app either way.
**Headline A:** Plan your grading submission
**Headline B:** Send this card in right
**Body A:** A step-by-step plan for grading the card you scanned.
**Body B:** Fees, prep and packing, in plain words.
**Plans:** One add-on, paid once: "Grading Submission Plan" at `{{addon_price}}` (pending from the owner). No subscription, no struck price, no countdown. It is a hidden one-time plan `addon` in `CONFIG.plans`, opened with `checkout('addon')` (FunnelFox: its own native `checkout_addon` screen). Paying runs `completePurchase('addon')` and lands on Get the app with the "added" line; closing the checkout goes to Get the app without it (`CONFIG.declineFlow = {addon:'get_app'}`). The demo shows a stand-in sheet (Pay / Close without paying).
**Visual:** Green pill "Payment complete. Your plan is active." Eyebrow "Add-on · paid once". Report cover card ("CoinIdentify report", the add-on name, the user's card), three gold checks: Whether this card is worth the grading fee · How to prep, sleeve and ship it safely · Saved with your card report in the app. Price row with the price token and "Paid once · no subscription". No back button, no close X.
**Microcopy:** "One-time payment at a secure checkout. No subscription." Skip link: "No thanks, take me to the app". Events: `upsell_view`, `upsell_accept` (+ `checkout_click` plan `addon`), `upsell_decline`, `purchase_complete` plan `addon`, `checkout_decline` plan `addon`.
**CTA:** Add to my plan

---

## G. Payoff

### 18. Get the app
**Purpose:** Hand a paying user to the CoinIdentify app, where the full card report lives. Reached only after purchase (or a return with `?paid=`); there is no free result screen.
**Headline A:** You're in, {{name}}
**Headline B:** Your report is ready
**Body A:** Your full report is waiting in the CoinIdentify app.
**Body B:** Download the app and log in to open it.
**Visual:** Success check in a glowing well, three numbered steps (Download CoinIdentify: Coin Scanner · Log in with {{email}} · Open your report), "Open the app" button, black App Store and Google Play badges. If the add-on was bought, a green line "Grading Submission Plan added. It opens in the app." sits above the steps.
**Microcopy:** Value disclaimer and "Cancel anytime in your account." App links are pending: tapping shows "App link coming soon".
**CTA:** Open the app

---

## Notes

**Reference.** None. Research §5 of `coursiv-coinin.md`: no card web funnel from CoinIn (competitor) found; Ludex and Collectr are scan-first. This flow is **unverified** and adapted from our coin funnel. Also unverified: the in-app card database coverage and the value data source.

**Trademark and risk.** Pokémon, MTG and PSA are trademarks. The UI uses descriptive text only ("monster-battle cards", "pro grading", "official grade") and the footer says "Not affiliated with any card publisher or grading company". All card art is generated and generic. No official-grade claim: the funnel only estimates a grade band.

**Sports-card dad branch.** Q1 = sports cards turns screen 8 into the shoebox nostalgia bridge and picks a sports sample card. Measure its drop-off and paywall conversion against the other branches.

**Blocks deliberately skipped.** Persona host (the coin funnel's guide), social proof screen (no verified numbers; proof lives in the paywall behind tokens), notification opt-in, wheel or scratch card, last-chance offer (CoinIdentify policy), free result screen (hard paywall).

**Dark patterns not copied.** Countdown, struck anchor prices, fine-print "payment period", live user counter, dollar testimonials, "get rich" framing, an email gate that claims no storage.

**Drop-off risk.** Screen 11 (upload). The sample-card link and the camera or gallery choice exist for this. Screen 15 (email) is mandatory and screen 16 is a hard paywall, so watch email-to-paywall and paywall exits closely.

**Monetization (2026-10-07, CoinIdentify policy).** Hard paywall, three plans (1w $12.99 then $39.99 every 4 weeks; 4w $14.99 then $39.99 every 4 weeks, pre-selected; 12w $39.99 then $59.99 every 12 weeks), no sale or offer on decline, then a one-time add-on and the app hand-off. Measure separately: first-scan success, email-gate completion, subscription conversion by plan, add-on attach rate (`purchase_complete` plan `addon` / `upsell_view`), app open rate from Get the app, refund rate.

**Pending from the owner.** Add-on name and price (`{{addon_price}}`; "Grading Submission Plan" is a working name), Paddle price IDs for the 3 plans and the add-on, support email (`{{support_email}}`), App Store / Google Play links, legal entity, refund terms, and real generated images.

**First A/B test.** Quiz hook "Which cards are worth grading?" vs. "Shoebox full of cards?" with the sports branch on in both. **Second:** grade-potential teaser (screen 14) shown vs. skipped.

**Verify before build.** Refund terms; rating and reviews; card database source and coverage; licensed or generated photos for the game; the real identify API.

**Demo notes.** The demo cannot identify real photos: any upload (or the sample link) shows the same seeded sample result for the chosen card type, with raw range figures marked "sample data". Card images in `img/` are real generated art (gemini-3.1-flash-image via `gen_images.py`, 2026-10-07): hook fan, paywall hero and one invented sample card per type (`card-sample` = Ember Drake, `card-sports`, `card-fantasy`), shown on the ID card and paywall when the sample is used; the drawn card stays only as a fallback.

**Demo link (private Artifact):** https://claude.ai/artifact/XhpHge1WxEHMpxkmxx2zzA
