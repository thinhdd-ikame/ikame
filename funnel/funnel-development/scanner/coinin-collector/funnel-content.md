---
niche: coinin-collector
display_name: CoinIn Collector (Persona Web Funnel, Core Coin)
archetype: scanner-identifier
subject: coin
input: name, 4 quick collector answers, 2 guess-the-value games, 2 photos of one coin (or a sample coin)
output: free coin ID card plus a collector level badge; value range by grade, error check and collection tracker behind the paywall
screens: 20
monetization: web paywall after an email gate (1-week intro, 4-week pre-selected, 12-week anchor, renewal shown next to every price); dismissible to a one-time single-coin report offer, then the free ID card
creative_screens:
  hook-a: 1
  hook-b: 2
  game: 9
  scan: 14
  reveal: 15
motion: >
  a tipped glass jar spilling worn coins while a gold ring locks onto one
  coin, which flips front to back as an ID card slides up beside the guide
---

# Funnel Content — CoinIn Collector (Persona Web Funnel, Core Coin)

A web2app funnel for the CoinIn coin identifier, led by a persona host: **Edward**, a friendly illustrated guide who talks the user through the whole flow. **Edward is clearly labeled "Illustrative guide, not a real person" on the hook and meet screens and in the footnote.** He has no credentials, no years-of-experience claim and gives no appraisals. He is a voice, not an expert. The user answers four quick questions, plays two honest "which is worth more" games, **scans one real coin (front and back, or taps "Use a sample coin" when no coin or camera is at hand)** and gets a **free ID card plus a collector level badge** before any paywall. The paywall then sells what is still locked on that coin: value range by grade, condition grade, error check and a collection tracker. Archetype: `scanner-identifier`, web variant (20 screens, plan in the file). **Reference funnel:** `funnel.coininapp.com` (AdSpyLab capture, 20 screens, Sep 2026) plus the "Wisest Collector" persona pages (~25 variants, research §3 of `coursiv-coinin.md`). Unverified in this brief: the persona pages' exact copy (taken only as a pattern: persona hook, then a coin-origin question) and the in-app value data source. **Deliberate differences from the reference:** a personalized result (ID card and badge) before the paywall, where the original gives none; a persona labeled as illustrative instead of a fake expert; games with real answers and no dollar figures; no "become rich" framing; no countdown, no struck anchor prices, no dollar testimonials, no live user counter. **Palette** follows `scanner/coinin`: charcoal ground, antique gold, serif display for coin names. **Reuse plan:** all niche data (the object word, host, types, sample coins, games, level names) sits in one `COLLECT` block in the demo and one set of per-screen fields here, so the card, antique, banknote/stamp/gem and plant funnels can swap that block and keep the flow. Every value is an **estimate**, never "your coin is worth $X".

---

## A. Hook (persona + expectation)

### 1. Hook — Grandpa's coin jar
**Purpose:** Name the everyday "before" state (an inherited jar, a drawer of unknown coins) in the host's voice and promise one clear answer.
**Headline A:** Grandpa's coin jar?
**Headline B:** Meet Edward, your coin guide
**Body A:** Edward helps you find out what's inside.
**Body B:** Scan one coin and get its ID card.
**Visual:** Charcoal ground. Top: macro photo of a tipped glass jar spilling worn coins (`img/jar.jpg`), fading into the ground. Over it, Edward's illustrated avatar (white hair, round glasses, flat cap, warm smile) in a speech bubble: "Let's see what you've got." Small chip under the avatar: "Illustrative guide, not a real person". Gold CTA pinned bottom.
**Microcopy:** Under CTA: "By continuing you agree to our Terms and Privacy Policy. Values are estimates only."
**CTA:** Let's look

### 2. Meet Edward — how this works
**Purpose:** Set the honest frame: what the guide is, the three steps, and that results are estimates.
**Headline A:** Here's how it works
**Headline B:** Three steps, one coin
**Body A:** Quick questions, one coin scan, your free ID card.
**Body B:** Edward walks you through each step.
**Visual:** Edward avatar left with bubble "I'm an illustrated guide. I can't appraise coins, but the scan can identify them." Right or below: three numbered rows with line icons: "1 Answer a few questions", "2 Scan one coin", "3 Get its ID card". Honest-estimate chip: "Values are estimates, not appraisals".
**Microcopy:** Avatar label: "Edward · illustrative guide". Persona rule for all later screens: Edward speaks in one short bubble per screen, never claims experience or credentials.
**CTA:** Continue

---

## B. Investment

### 3. Name
**Purpose:** Capture a first name so Edward can use it. Optional, with a fallback, so nobody stalls.
**Headline A:** What should Edward call you?
**Headline B:** First, your name
**Body A:** Just a first name or nickname.
**Body B:** It makes your coin card personal.
**Field:** Text input, max 20 characters, placeholder "Your first name". Skip link below. Empty or skipped: later screens say "you" / "friend".
**Visual:** Edward bubble: "Nice to meet you!" Name field on a dark card, gold underline when focused.
**Skip link:** "Skip, call me friend"
**CTA:** Continue

### 4. Q1 — Where the coins came from
**Purpose:** Cheap first tap. It segments the motive (heir, change hunter, collector) and sets Edward's tone on the bridge and result screens.
**Headline A:** Where did they come from?
**Headline B:** How did you get them?
**Body A:** Edward will pick examples to match.
**Body B:** Every collection starts somewhere.
**Options:**
- 🧓 Inherited
- 🫙 Found in change
- 🗂️ I collect
- 🎁 Gift or purchase
- ✏️ Other
**Field:** Single select, auto-advance on tap (Other opens a one-line input; CTA "Continue" disabled until text is typed).
**Visual:** Progress bar 1/4 in gold, full-width dark pills with a gold border, selected pill fills gold.
**Error state:** Other chosen, field empty: CTA disabled, hint "Type a few words to continue."
**CTA:** (auto-advances on select; Continue for Other)

### 5. Q2 — How many coins
**Purpose:** Sizes the collection, which later drives the badge and the "track your collection" paywall line.
**Headline A:** How many coins is that?
**Headline B:** How big is the pile?
**Body A:** A rough guess is fine.
**Body B:** No counting needed.
**Options:**
- 🪙 Under 20
- 🫙 20 to 100
- 📦 100 to 500
- 🧰 500 or more
**Field:** Single select, auto-advance.
**Visual:** As screen 4, progress 2/4. Each pill has a small stack-of-coins icon that grows with the number.
**CTA:** (auto-advances on select)

### 6. Q3 — Which coins
**Purpose:** Picks the sample coin and game examples, and flags silver and foreign holders for the paywall copy.
**Headline A:** Which coins do you have?
**Headline B:** What's in the pile?
**Body A:** Pick all that apply.
**Body B:** Mixed is fine.
**Options:**
- 🟤 US cents
- 🪙 Quarters and dimes
- 🌍 Foreign coins
- 🥈 Silver coins
- ✏️ Other
**Field:** Multi-select, CTA disabled until at least one pick. If Other is picked its input must be non-empty.
**Visual:** Same pill list, check circle right, small real-coin thumbnails where available (`img/obv.jpg`, `img/world.jpg`, `img/bullion.jpg`), progress 3/4.
**Error state:** Other picked, field empty: CTA disabled, hint "Type a few words to continue."
**CTA:** Continue

### 7. Q4 — What they want to know
**Purpose:** Multi-select intent. It reorders the paywall "what's inside" list and picks the paywall hero line.
**Headline A:** What do you want to know?
**Headline B:** What matters most?
**Body A:** Pick all that apply.
**Body B:** Choose as many as you like.
**Options:**
- 💰 Value estimate
- 🔍 Rare errors
- 📜 History
- 🗂️ Track my collection
- ✏️ Other
**Field:** Multi-select, CTA disabled until at least one pick; Other needs text.
**Visual:** Same pill list, progress 4/4.
**CTA:** Continue

### 8. Edward's bridge — condition matters
**Purpose:** Reassurance and one real teaching beat before the games. It shifts expectation from "jackpot" to "condition and details decide".
**Headline A:** Condition beats age
**Headline B:** Details decide everything
**Body A:** Worn and common is normal. Edward will show you why.
**Body B:** Two quick guesses, then your scan.
**Visual:** Edward bubble, personalized by Q1: inherited "Family coins carry stories, {{name}}." · found "Pocket change can surprise you." · collect "You already know the hobby." Below, one coin shown worn on the left and sharp on the right, with the label "Same coin, different condition".
**Microcopy:** Line under the coins: "Most coins you find are common. That's normal."
**CTA:** Let's play

---

## C. Games (anticipation with real answers)

### 9. Game 1 — Which 1943 cent is rare?
**Purpose:** A short interactive teaching beat with a real answer: tiny details change what a coin is. It is the honest replacement for the reference funnel's dollar-figure true/false screens.
**Headline A:** Which 1943 cent is rare?
**Headline B:** Guess the rare one
**Body A:** Both say 1943. Only one is unusual.
**Body B:** Tap the coin you think is worth more.
**Options:**
- ⚪ Silver-gray coin
- 🟤 Copper coin
**Field:** Two tappable coin pictures side by side. Either tap reveals the answer; no wrong-answer penalty. Score counts for the badge.
**Visual:** Two 1943 cents on charcoal, a magnifier loupe over the date. After the tap the copper coin gets a gold ring and the other dims.
**Microcopy:** Reveal: "Copper. 1943 cents were made of steel, so a copper one is a rare error." · "A scan checks details like this for you." No dollar figure on this screen.
**CTA:** Next

### 10. Game 2 — Which quarter has silver?
**Purpose:** A second real-answer guess that rewards looking at the edge and the date, and plants the "silver" reason to scan.
**Headline A:** Which quarter has silver?
**Headline B:** Which is worth more?
**Body A:** One is 1964, one is 1965.
**Body B:** Silver makes it worth more than face value.
**Options:**
- 🅰️ The 1964 quarter
- 🅱️ The 1965 quarter
**Field:** Two tappable quarter pictures; tap reveals. Score counts for the badge.
**Visual:** Two quarters edge-on and face-up. After the tap the 1964 edge shows a solid silver line and the 1965 edge a copper stripe.
**Microcopy:** Reveal: "1964. Quarters made through 1964 are 90% silver. From 1965 they are copper-nickel." · "Silver coins are worth more than face value as metal, and a scan can tell them apart."
**CTA:** Scan my coin

---

## D. Scan (asset input + anticipation)

### 11. Camera primer
**Purpose:** Pre-permission screen with a reason, four capture rules and the sample-coin escape so users without a coin or camera never drop.
**Headline A:** Grab one coin
**Headline B:** Let's scan your first coin
**Body A:** Any coin works, even one from your pocket.
**Body B:** Edward needs a clear look.
**Visual:** Edward bubble: "Plain surface, good light." Hand placing a coin on dark cloth (`img/cloth.jpg`), four tip chips in a row with line icons.
**Microcopy:** Tip chips: "One coin · Good light · Flat surface · Fill the frame". Privacy line: "Your photos are used to identify this coin only." Skip link: "No coin handy? Use a sample coin".
**Skip link:** "Use a sample coin" runs the same flow with a sample matched to the Q3 pick.
**CTA:** Continue

### 12. Scan the front
**Purpose:** The core input. It takes a gallery upload or a camera shot with plain error messages, plus the sample-coin fallback.
**Headline A:** Front side first
**Headline B:** Show us the face
**Body A:** Center the coin and hold steady.
**Body B:** Lay it flat on a plain surface.
**Field:** Upload from gallery, Take a photo now (device camera), drag-and-drop. Preview with "Use this photo" and "Choose another". Link "Use a sample coin" always visible.
**Value line:** "Step 1 of 2 · Two sides give a sharper match"
**Visual:** Dashed gold circle drop zone with a coin outline. After upload the photo shows inside a round mask with a gold ring.
**Error states:**
- "That file isn't a photo. Try a JPG or PNG."
- "That photo is over 15 MB. Try a smaller one."
- "We couldn't open that photo. Try another."
- "It looks dark. Coins read best in bright light." (warning, can continue)
**Skip link:** "Use a sample coin"
**CTA:** Use this photo

### 13. Scan the back
**Purpose:** The second side confirms the variety and the mint details. It is the last input before the payoff.
**Headline A:** Now flip it over
**Headline B:** One more side
**Body A:** The back confirms the exact variety.
**Body B:** Two sides make the match sharper.
**Field:** Same upload block. A thumbnail of the captured front sits in a corner. Link "Use a sample coin" and a small grey "Skip, front only".
**Value line:** "Step 2 of 2"
**Visual:** As screen 12, with a corner thumbnail flip when the screen opens.
**Error states:** Same as screen 12.
**Skip link:** "Skip, front only" (the card shows lower match confidence)
**CTA:** Identify coin

### 14. Identifying
**Purpose:** Manufacture the wait around the user's own coin (best ad-creative screen). Advance only when the result is back, minimum ~5 seconds.
**Headline A:** Identifying your coin…
**Headline B:** Checking the coin database…
**Steps:**
1. Reading the design and lettering… (0 to 100%, check)
2. Matching the year and mint mark… (0 to 100%, check)
3. Checking known errors and varieties… (0 to 100%, check)
4. Edward is preparing your card… (0 to 100%, check)
**Visual:** The user's front photo (or the sample coin) fills a round frame, tilts slowly in 3D (the only 3D in the funnel) with a gold scanning ring sweeping its rim. Four rows beneath: label, percent, check, gold bar.
**Microcopy:** Under headline: "Two sides scanned". Honest-demo note in the panel footnote: the demo cannot identify real photos and shows the sample result.
**CTA:** (auto-advances when the result returns, minimum ~5 seconds)

### 15. Your coin — free ID card
**Purpose:** Deliver real value free: what the coin is. Proves the scanner works and makes the locked part feel one tap away. Locked rows tease the category, never a number.
**Headline A:** It's a {{coin_name}}
**Headline B:** We found your coin
**Body A:** {{country}}, {{year}}, {{metal}}.
**Body B:** Value and grade are one tap away.
**Visual:** Coin card with the captured photos side by side, coin name in serif, fact rows (country, year, mint, metal, denomination). Below, three locked rows with a gold lock: "Estimated value range", "Condition grade", "Errors and varieties check". Neutral grey blur, no fake "$$$" shapes. Edward bubble: "Here's your coin, {{name}}."
**Microcopy:** "Match confidence: {{confidence}}" with link "Not right? Try another photo." Beginner tooltip on "mint": "Where the coin was made, shown as a tiny letter." No-match state: headline "We couldn't match this one yet" · body "Try brighter light and a plain background." · buttons "Retake photos" / "Use a sample coin".
**CTA:** See my badge

### 16. Collector level badge
**Purpose:** A personalized free reward built only from the user's own answers and game score, so the paywall hero can speak to them. It is a fun label, never an appraisal.
**Headline A:** You're a {{level}}
**Headline B:** Your collector level
**Body A:** Based on your answers and your two guesses.
**Body B:** A fun badge, not an appraisal.
**Visual:** A gold badge medallion with the level name and four small stars showing level (1 to 4), the user's name under it, Edward bubble with one line tied to the level. The coin card thumbnail sits beside it. Level names: Curious Finder, Jar Sorter, Keen Collector, Seasoned Hunter.
**Microcopy:** Level rule (shown in the panel footnote): points from collection size (Q2), types (Q3) and the two game answers; no outcome is promised for the level. Share row: "Share my badge" (image of the badge only, no values).
**CTA:** Save my card

---

## E. Gate

### 17. Email gate
**Purpose:** Capture the email before the value reveal, framed as saving the card and collection.
**Headline A:** Where should Edward send it?
**Headline B:** Save your coin card
**Body A:** Get your card and keep your scans safe.
**Body B:** One email, no spam.
**Field:** Email input (email keyboard), optional marketing consent checkbox (off).
**Visual:** The coin card from screen 15 shrinks into the first slot of an empty collection grid (other slots dashed), email field beneath.
**Error state:** "Enter a valid email address."
**Microcopy:** "By continuing you agree to our Terms and Privacy Policy." · "We never sell your email."
**CTA:** Continue

---

## F. Monetization

### 18. Paywall
**Purpose:** Long web sales page selling what is still locked on their coin (value range by grade, grade, error check, collection value), then the ongoing tools. Renewal shown at the same size as the price.
**Headline A:** See what it's worth
**Headline B:** Unlock your {{coin_name}}
**Body A:** Value range, grade and error check, for every scan.
**Body B:** Scan unlimited coins and track your collection.
**Plans:** Structure only, no invented numbers.
- 1-week intro: intro price token, then weekly renewal shown beside it. Never called free.
- **4-week: pre-selected**, "MOST POPULAR", price and renewal tokens.
- 12-week: anchor, price and renewal tokens.
- Every plan shows its own renewal price and period next to the price.
**Visual:** Sticky brand bar with a close X. Hero: the user's coin card (photo, name, badge level) with three locked rows glowing gold as "unlocking". Plan block. "What's inside" list (ordered by Q4 picks). "How it works" (3 steps). Proof block (rating and reviews, hidden while tokens are unset). Guarantee seal (hidden while the refund-days token is unset). FAQ. Plan block repeated. Sticky bottom CTA after the first plan block scrolls away.
**Microcopy:**
- Under the selected plan: "{{price}} today, then {{renewal}} every period until you cancel."
- What's inside: "Value range by grade" · "Condition grade estimate" · "Error and variety check" · "Unlimited coin scans" · "Collection tracker" · "Coin history and facts".
- Edward line near the hero: "Edward is an illustrated guide, not an appraiser."
- Value disclaimer: "Values are estimates, not appraisals or purchase offers."
- FAQ: What's included? · How is value estimated? · How do I cancel? · Will I be charged again? · Is Edward a real person? (answer: "No. Edward is an illustrated guide.")
- Footer: Terms · Privacy · Subscription terms.
**Fallback offer:** Close X goes to screen 19 once per session (sessionStorage `ikf_offer_coinin-collector`), then to the free card on any later close.
**CTA:** Unlock my coin

### 19. Last-chance offer — one-coin report
**Purpose:** A genuinely smaller option for people who closed the paywall: a one-time, non-recurring report for just the coin they scanned. Not a duplicate of a paywall plan.
**Headline A:** Just this coin?
**Headline B:** Get one coin report
**Body A:** Pay once for this coin's full report.
**Body B:** No subscription, no renewal.
**Plans:** One card: "One-coin report", one-time price token, **paid once, never renews**, no strike price. It lists what it includes (this coin's value range by grade, condition grade, error and variety check) and what it does **not** include (unlimited scans, collection tracker, other coins).
**Visual:** Web page in the paywall's look: brand bar with a close X, gold eyebrow "One-time offer, shown once", then one gold-bordered card with the coin thumbnail, price row, three checks, a muted "Not included" list, CTA, payment badges and a one-line terms note.
**Microcopy:**
- Terms line: "{{offer_price}} once. No renewal. Cancel nothing."
- No timer (`expiresMin` is null; none until a real deadline exists).
- Decline link: "No thanks, keep the free ID card"
- Events: `offer_view`, `offer_accept` + `checkout_click` (plan `offer`), `offer_decline`.
**CTA:** Get my report

---

## G. Payoff

### 20. Your coin card
**Purpose:** Land the user on their own result. Free path: ID card, badge and locked rows with a way back to the paywall. Paid: full card with grade, error check and "scan next".
**Headline A:** Your coin card, {{name}}
**Headline B:** Your coin, decoded
**Body A:** Edward saved it to your collection.
**Body B:** Scan your next coin any time.
**Visual:** Coin card with the user's photos, badge medallion, fact rows. Free: three locked rows with an "Unlock" button. Paid: value range bar by grade with the estimated grade marked, error row ("No known errors found" or "Possible variety, check with a loupe"), a short history line, collection counter "1 coin". App handoff buttons below.
**Microcopy:** Under the range bar: "Estimate only. For a possibly valuable coin, get a professional grade before selling." · Edward bubble: "Nice work. Bring me the next one."
**CTA:** Scan next coin (paid) / Unlock my coin (free path, with "Scan next coin" as a link)

---

## Notes

**Reference.** `funnel.coininapp.com` (AdSpyLab capture, Sep 2026, 20 screens: attitude quiz, 3 dollar-figure guess screens, email gate, long paywall, no result before paying) and the ~25 "Wisest Collector" persona pages (research §3). The persona pages' exact copy is **unverified**; only the pattern (a persona host, then a coin-origin question) is taken.

**Persona risk and rule.** The host is a drawn guide with no credentials. Labels: hook chip, meet-screen bubble, paywall FAQ ("Is Edward a real person?"), and the demo footnote. No "40 years collecting", no "expert", no appraisals. The original brief's "Edward, 40 years collecting" was changed for this reason.

**Reuse for the 4 later collectibles funnels (cards, antique, notes/stamps/gems, plant).** Keep screens 1 to 20 and swap the data: object word, host name and avatar, Q1 to Q4 options, 2 games with real answers, sample item, level names, ID-card fact rows. In the demo this is the single `COLLECT` object. Plant needs a safety line on any "edible/toxic" claim; gems and stamps need their own licensed reference photos.

**Blocks deliberately skipped.** Social proof screen (no verified numbers for this listing; proof lives in the paywall behind tokens), notification opt-in, wheel or scratch card (casino feel next to money), post-purchase upsell (Premium Pro contents unverified).

**Dark patterns not copied.** The reference countdown, strike-through anchor prices, "payment period" fine print, live user counter, dollar testimonials, "become rich" framing, and an email gate that claims no storage.

**Drop-off risk.** Screens 12 to 13 (upload). The sample-coin link, camera or gallery choice and "front only" skip exist for this. Screen 17 (email) is required in the web variant (the in-app `scanner/coinin` brief keeps it skippable for App Store 5.1.1).

**Monetization.** One layer, the subscription, plus a one-time single-coin report on decline. Measure separately: first-scan success, paywall conversion by plan, offer accept rate and refund rate.

**First A/B test.** Persona host (this brief) vs. no host (same flow, plain copy). **Second:** badge screen before vs. after the email gate.

**Verify before build.** Real plan periods and prices; refund terms; rating and reviews; one database figure; licensed photos for games 1 and 2; the real identify API.

**Demo notes.** The demo cannot identify real photos: any upload (or the sample link) shows the same seeded sample result, and the footnote says so. Images are reused from `scanner/coinin/img` (jar, 1955 cent front and back) plus drawn art; `gen_images.py` is ready for Edward and the other pictures.

**Demo (Artifact, private):** https://claude.ai/artifact/6KFCPFAKXQFsTdAsqLV8qb
