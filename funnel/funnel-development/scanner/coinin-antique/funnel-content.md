---
niche: coinin-antique
display_name: CoinIn Antique (Heirloom and Estate Appraisal Web Quiz, Antique Scanner)
archetype: scanner-identifier
subject: antique or heirloom item
input: 4 quick answers (item, where it came from, maker's mark, goal), one auction guessing game, 1 photo of one item (or a sample item)
output: free item ID card (era, style, material); value range, where to sell and a real-or-reproduction read behind the paywall
screens: 18
monetization: web paywall after an email gate (1-week intro, 4-week pre-selected, 12-week anchor, renewal shown next to every price); dismissible to a one-time single-item value check, then the free item ID
creative_screens:
  hook-a: 1
  game: 9
  scan: 12
  reveal: 13
motion: >
  a dusty attic vase turns on a shelf, a gold scan frame sweeps across it,
  then its ID card (era, style, material) slides up beside it
---

# Funnel Content — CoinIn Antique (Heirloom and Estate Appraisal Web Quiz, Antique Scanner)

A web2app funnel for the CoinIn scanner, antique branch. The hook is "Don't sell grandma's vase for $5": the user inherited, cleared out or found something and does not know what it is. They answer four quick questions (what item, where it came from, is there a maker's mark, what they want to know), play one honest "which one sold for more" auction game, **scan one real item (or tap "Use a sample item" when nothing or no camera is at hand)** and get a **free ID card (era, style, material)** before any paywall. The paywall then sells what is still locked on that item: value range, where to sell, and a real-or-reproduction read. Archetype: `scanner-identifier`, web variant (18 screens), same spine as `scanner/coinin-cards` and `scanner/coinin-collector`. **Reference funnel:** none for antiques. Research §4 of `coursiv-coinin.md` found no antique web funnel on Meta (adjacent apps: Antique Identifier by Picture, Vintiq, Relic are store-native photo → ID → paywall), so the flow is **unverified** and adapted from the CoinIn coin funnel. **Deliberate difference:** the **inheritance and house-clearing angle**, which no CoinIn funnel or competitor uses: "Where did it come from?" is a real question, and when the answer is inherited or estate clearing the bridge screen calms the user ("Don't clear it all yet") instead of pushing a jackpot. Also different from the coin reference: personalized free result before the paywall, no "get rich" framing, no countdown, no struck anchor prices, no dollar testimonials, no live counter. **Branch:** Q2 = inherited or estate clearing turns screen 8 into the family-home bridge. **Palette** follows `scanner/coinin` (charcoal, antique gold, serif display). **Reuse:** all niche data (item types, sample items, game pair, sample values) sits in one `ITEMS` block in the demo. Every value is an **estimate**, never "your item is worth $X", and never a formal appraisal.

---

## A. Hook

### 1. Hook — Don't sell grandma's vase for $5
**Purpose:** Name the "before" state (a house full of things nobody can price) with a warning, not a jackpot, and promise one clear answer.
**Headline A:** Don't sell grandma's vase for $5
**Headline B:** Clearing out a family home?
**Body A:** Scan one piece and see what you have.
**Body B:** Quick quiz, then your free item ID.
**Visual:** Charcoal ground. Macro of a vase and a silver bowl on a dusty attic shelf under a warm shaft of light (`img/hook-attic.jpg`), fading into the ground. Below, three trio chips with line icons: "2-min quiz", "Free item ID", "Value range inside". Gold CTA pinned bottom.
**Microcopy:** Under CTA: "By continuing you agree to our Terms and Privacy Policy. Values are estimates only."
**CTA:** Start the quiz

### 2. How it works
**Purpose:** Set the honest frame: three steps, and that results are estimates, not an appraisal.
**Headline A:** Three steps, one piece
**Headline B:** Here's how it works
**Body A:** Quick questions, one scan, your free item ID.
**Body B:** Estimates only, never a formal appraisal.
**Visual:** Three numbered rows with line icons: "1 Answer a few questions", "2 Scan one item", "3 Get its ID card". Chip: "Estimates only, not an appraisal".
**Microcopy:** "For insurance or legal matters, ask a qualified appraiser."
**CTA:** Continue

---

## B. Investment

### 3. Name
**Purpose:** Capture a first name for later screens. Optional, with a fallback.
**Headline A:** What should we call you?
**Headline B:** First, your name
**Body A:** Just a first name or nickname.
**Body B:** It makes your item report personal.
**Field:** Text input, max 20 characters, placeholder "First name". Skip link below. Empty or skipped: later screens say "you".
**Skip link:** "Skip"
**CTA:** Continue

### 4. Q1 — What item
**Purpose:** Cheap first tap. It picks the sample item, the game pair and the ID card variant.
**Headline A:** What did you find?
**Headline B:** What are you holding?
**Body A:** Pick the closest match.
**Body B:** Several? Pick the one to scan first.
**Options:**
- 🏺 Vase or pottery
- 🪑 Furniture
- 🥄 Silver or jewelry
- 🕰️ Clock or lamp
- ✏️ Other
**Field:** Single select, auto-advance on tap (Other opens a one-line input; CTA "Continue" disabled until text is typed).
**Visual:** Progress bar 1/4 in gold, full-width dark pills with gold border, selected pill fills gold.
**Error state:** Other chosen, field empty: CTA disabled, hint "Type a few words to continue."
**CTA:** (auto-advances on select; Continue for Other)

### 5. Q2 — Where it came from
**Purpose:** The inheritance and house-clearing angle. It picks the bridge variant (family-home branch) and the paywall hero line.
**Headline A:** Where did it come from?
**Headline B:** How did you get it?
**Body A:** Pick the closest match.
**Body B:** This shapes your report.
**Options:**
- 💝 Inherited
- 🏚️ Attic or basement
- 🛍️ Flea market
- 🏠 Estate clearing
- ✏️ Other
**Field:** Single select, auto-advance (Other opens a one-line input).
**Visual:** As screen 4, progress 2/4.
**Error state:** Other chosen, field empty: CTA disabled, hint "Type a few words to continue."
**CTA:** (auto-advances on select; Continue for Other)

### 6. Q3 — Maker's mark
**Purpose:** Plant the idea that a small mark can change the story, and tell the primer whether to push the underside photo.
**Headline A:** Any maker's mark?
**Headline B:** Is there a stamp?
**Body A:** Often on the bottom or back.
**Body B:** Look underneath, then pick.
**Options:**
- 🔎 Yes, I see one
- 🙈 No mark
- 🤷 Not sure where
**Field:** Single select, auto-advance.
**Visual:** As screen 4, progress 3/4. A small line icon of an upturned base with a stamp ring beside the options.
**CTA:** (auto-advances on select)

### 7. Q4 — What they want to know
**Purpose:** Multi-select intent. It reorders the paywall "what's inside" list.
**Headline A:** What do you want to know?
**Headline B:** What matters most?
**Body A:** Pick all that apply.
**Body B:** Choose as many as you like.
**Options:**
- 💰 What it's worth
- 🔍 Real or reproduction
- 🛒 Where to sell
- 📖 Its history
- ✏️ Other
**Field:** Multi-select, CTA disabled until at least one pick; Other needs text.
**Visual:** Same pill list, check circle right, progress 4/4.
**Error state:** Other picked, field empty: CTA disabled, hint "Type a few words to continue."
**CTA:** Continue

### 8. Bridge — slow down (branch: family home)
**Purpose:** Reassurance and one teaching beat before the game. The family-home branch tells the user nothing has to be decided today.
**Headline A:** Check underneath first
**Headline B:** Marks hide on the base
**Body A:** Maker's marks often sit on the bottom.
**Body B:** One quick guess, then your scan.
**Visual:** Default: two upturned bases side by side, one plain and one with a stamp, label "Same shape, different base". **If Q2 = inherited or estate clearing:** headline A "Don't clear it all yet", headline B "A family piece{{, name}}?", body A "Nothing needs deciding today. Check each piece first.", body B "Old things carry stories. Value comes second." with a small house icon and the same base pair below.
**Microcopy:** "Four clues we look for: marks, wear, construction, materials."
**CTA:** Let's play

---

## C. Game

### 9. Game — Which one sold for more?
**Purpose:** A short teaching beat with a real answer: one small detail changes what a piece sells for. It uses a past auction result, not the user's item, so it never reads as "your item is worth $X".
**Headline A:** Which one sold for more?
**Headline B:** Guess the auction winner
**Body A:** Same style. One has a maker's mark.
**Body B:** Check the underside of each.
**Options:**
- 🅰️ Piece A
- 🅱️ Piece B
**Field:** Two tappable item pictures of the type picked in Q1, each with a small "underside" circle: A plain, B stamped. Tap reveals the answer; no penalty.
**Visual:** Two generic pieces side by side on charcoal, a loupe over the underside of B after the tap. The winner gets a gold ring and the other dims.
**Microcopy:** Reveal: "Piece B. The maker's mark made the difference." · "A scan looks for details like this." · Sold prices for both pieces from one verified, dated auction result with source (demo: labelled "Illustrative sample, not a real sale").
**CTA:** Scan my item

---

## D. Scan

### 10. Camera primer
**Purpose:** Pre-permission screen with a reason, four capture rules and the sample-item escape so users without an item or camera never drop. If Q3 is "not sure", the underside tip is highlighted.
**Headline A:** Pick one piece
**Headline B:** Let's scan your first item
**Body A:** Any item works, even a plain one.
**Body B:** A clear look gives a better match.
**Visual:** A vase on dark cloth (`img/item-sample.jpg`), four tip chips with line icons.
**Microcopy:** Tip chips: "Whole item · Good light · Show the base · Close-up of marks". Privacy line: "Your photo is used to identify this item only." Skip link: "No item handy? Use a sample item".
**Skip link:** "Use a sample item" (sample matched to the Q1 pick)
**CTA:** Continue

### 11. Scan the item
**Purpose:** The core input: gallery upload or camera shot with plain error messages, plus the sample-item fallback.
**Headline A:** Show us the piece
**Headline B:** Scan your item
**Body A:** Fit the whole item in the frame.
**Body B:** Place it on a plain surface.
**Field:** Upload from gallery, Take a photo now (device camera), drag-and-drop. Preview with "Use this photo" and "Choose another". Link "Use a sample item" always visible.
**Visual:** Dashed gold drop zone (4:5). After upload the photo shows in a rounded frame with a gold edge.
**Error states:**
- "That file isn't a photo. Try a JPG or PNG."
- "That photo is over 15 MB. Try a smaller one."
- "We couldn't open that photo. Try another."
- "It looks dark. Antiques read best in bright light." (warning, can continue)
**Skip link:** "Use a sample item"
**CTA:** Identify item

### 12. Identifying
**Purpose:** Manufacture the wait around the user's own item (best ad-creative screen). Advance only when the result is back, minimum about 5 seconds.
**Headline A:** Identifying your item…
**Headline B:** Checking the style database…
**Steps:**
1. Reading shape and material… (0 to 100%, check)
2. Dating the style and era… (0 to 100%, check)
3. Looking for maker's marks… (0 to 100%, check)
4. Building your item report… (0 to 100%, check)
**Visual:** The user's item (or the sample) tilts slowly in 3D, the only 3D in the funnel, with a gold scan line sweeping down it. Four rows beneath: label, percent, check, gold bar.
**Microcopy:** Panel footnote: the demo cannot identify real photos and shows the sample result.
**CTA:** (auto-advances when the result returns, minimum about 5 seconds)

### 13. Your item — free ID card
**Purpose:** Deliver real value free: what it is, its estimated era, style and material. Proves the scanner works and makes the locked part feel one tap away. Locked rows tease the category, never a number.
**Headline A:** We found your {{item_type}}
**Headline B:** Your item, identified
**Body A:** {{era}}, {{style}}, {{material}}.
**Body B:** Era and style free. Value is one tap away.
**Visual:** Item photo beside ID rows (type, estimated era, style, material, mark status from Q3). Below, three locked rows with a gold lock: "Value range", "Where to sell", "Real or reproduction". Neutral grey blur, no fake "$$$" shapes.
**Microcopy:** "Era is estimated from your photo. Estimate, not an appraisal." · "Match confidence: {{confidence}}" with link "Not right? Try another photo." No-match state: headline "We couldn't match this one yet" · body "Try brighter light and a plain background." · buttons "Retake photo" / "Use a sample item".
**CTA:** See what it's worth

### 14. Authenticity — teaser
**Purpose:** Plant the question every inheritor asks ("is it real?") with the four clues shown but not scored, so the paywall hero has a reason.
**Headline A:** Real, or a reproduction?
**Headline B:** Your authenticity read
**Body A:** We check four clues. Your result is ready.
**Body B:** Unlock the read for this item.
**Visual:** Item photo with four chips on its edges: "Marks", "Wear", "Construction", "Materials", each with a gold lock. A neutral grey locked band reading "Authenticity read: locked". No verdict shown.
**Microcopy:** "An estimate from your photo, not an expert authentication."
**CTA:** Save my result

---

## E. Gate

### 15. Email gate
**Purpose:** Capture the email before the value reveal, framed as saving the item and starting an inventory.
**Headline A:** Where should we send it?
**Headline B:** Save your item report
**Body A:** Get your result and keep your finds safe.
**Body B:** One email, no spam.
**Field:** Email input (email keyboard), optional marketing consent checkbox (off).
**Visual:** The scanned item shrinks into the first slot of an empty inventory grid (other slots dashed), email field beneath.
**Error state:** "Enter a valid email address."
**Microcopy:** "By continuing you agree to our Terms and Privacy Policy." · "We never sell your email."
**CTA:** Continue

---

## F. Monetization

### 16. Paywall
**Purpose:** Long web sales page selling what is still locked: value range for this item, where to sell, real-or-reproduction. Renewal shown at the same size as the price.
**Headline A:** See what it's worth
**Headline B:** Unlock your whole inventory
**Body A:** Value range, where to sell, real or reproduction.
**Body B:** Scan every piece in the house.
**Plans:** Structure only, no invented numbers.
- 1-week intro: intro price token, then weekly renewal shown beside it. Never called free.
- **4-week: pre-selected**, "MOST POPULAR", price and renewal tokens.
- 12-week: anchor, price and renewal tokens.
- Every plan shows its own renewal price and period next to the price.
**Visual:** Sticky brand bar with a close X. Hero: the user's item with three locked rows glowing gold as "unlocking". Plan block. "What's inside" list (ordered by Q4 picks). "How it works" (3 steps). Proof block (rating and reviews, hidden while tokens are unset). Guarantee seal (hidden while the refund-days token is unset). FAQ. Plan block repeated. Sticky bottom CTA after the first plan block scrolls away.
**Microcopy:**
- Under the selected plan: "{{price}} today, then {{renewal}} every period until you cancel."
- What's inside: "Estimated value range" · "Where to sell it" · "Real or reproduction read" · "History and style notes" · "Unlimited item scans" · "Rare-piece flags" · "Saved inventory".
- Value disclaimer: "Values are estimates, not appraisals. For insurance or legal use, ask a qualified appraiser."
- FAQ: What's included? · How is value estimated? · How do I cancel? · Will I be charged again? · Is this a formal appraisal?
- Footer: Terms · Privacy · Subscription terms.
**Fallback offer:** Close X goes to screen 17 once per session (sessionStorage `ikf_offer_coinin-antique`), then to the free item ID on any later close.
**CTA:** Unlock my item

### 17. Last-chance offer — one-item value check
**Purpose:** A genuinely smaller option for people who closed the paywall: a one-time, non-recurring value check for just the item they scanned. Not a duplicate of a paywall plan.
**Headline A:** Just this piece?
**Headline B:** Get one value check
**Body A:** Pay once for this item's value range.
**Body B:** No subscription, no renewal.
**Plans:** One item: "One-item value check", one-time price token, **paid once, never renews**, no strike price. Includes this item's estimated value range by condition. Does **not** include unlimited scans, where to sell, the real-or-reproduction read, history notes or other items.
**Visual:** Web page in the paywall's look: brand bar with a close X, gold eyebrow "One-time offer, shown once", one gold-bordered card with the item thumbnail, price row, two checks, a muted "Not included" list, CTA, payment badges, one-line terms note.
**Microcopy:**
- Terms line: "{{offer_price}} once. No renewal. Cancel nothing."
- No timer (`expiresMin` is null; none until a real deadline exists).
- Decline link: "No thanks, keep the free item ID"
- Events: `offer_view`, `offer_accept` + `checkout_click` (plan `offer`), `offer_decline`.
**CTA:** Get my value check

---

## G. Payoff

### 18. Your item report
**Purpose:** Land the user on their own result. Free path: ID card and locked rows with a way back to the paywall. Paid: value range, where to sell, authenticity read and "scan next". Offer-only: the value range for this item.
**Headline A:** Your piece, {{name}}
**Headline B:** Your item, decoded
**Body A:** Saved to your inventory.
**Body B:** Scan the next piece any time.
**Visual:** Item photo, ID rows. Free: three locked rows with an "Unlock" button. Paid: estimated value range with a low-to-high bar, "Where to sell" list (channel types: specialist auction, online marketplace, local dealer), authenticity read with the four clues marked, inventory counter "1 item". App handoff buttons below.
**Microcopy:** Under the range: "Estimate only. For a possibly valuable piece, get a qualified appraisal before selling."
**CTA:** Scan next item

---

## Notes

**Reference.** None. Research §4 of `coursiv-coinin.md`: no antique web2app funnel found on Meta; store apps (Antique Identifier, Vintiq, Relic) are photo → ID → paywall. This flow is **unverified** and adapted from the CoinIn coin funnel and its card sibling. Also unverified: the in-app antique database coverage, the value and where-to-sell data source, and the authenticity model.

**Inheritance branch.** Q2 = inherited or estate clearing turns screen 8 into the "Don't clear it all yet" bridge. Measure its drop-off and paywall conversion against the other sources. The wording is deliberately calm: no urgency, no "treasure in your attic" framing.

**Auction game data.** Screen 9 needs one verified, dated, sourced past auction result per item type before launch. The demo shows labelled illustrative figures ("Illustrative sample, not a real sale"); they are not real sales. The game never shows a value for the user's own item.

**Blocks deliberately skipped.** Persona host (the coin funnel's collector guide), social proof screen (no verified numbers; proof lives in the paywall behind tokens), notification opt-in, wheel or scratch card, post-purchase upsell, fear-of-loss statistic ("most heirlooms sell below value" has no source, not used).

**Dark patterns not copied.** Countdown, struck anchor prices, fine-print "payment period", live user counter, dollar testimonials, "get rich" framing, an email gate that claims no storage.

**Drop-off risk.** Screen 11 (upload): heavy furniture is hard to photograph, so the sample-item link and camera or gallery choice exist for this. Screen 15 (email) is required in the web variant.

**Monetization.** One layer, the subscription, plus a one-time single-item value check on decline. Measure separately: first-scan success, paywall conversion by plan, offer accept rate, refund rate.

**First A/B test.** Hook "Don't sell grandma's vase for $5" vs. "Clearing out a family home?" **Second:** authenticity teaser (screen 14) shown vs. skipped.

**Verify before build.** Real plan periods and prices; refund terms; rating and reviews; antique database source and coverage; the real identify API; real sold-lot data for the game; legal review of "$5" in the hook (a cautionary example, not a value claim).

**Demo notes.** The demo cannot identify real photos: any upload (or the sample link) shows the same seeded sample result for the chosen item type, with value range figures marked "Sample data". Item art in the demo is drawn SVG; images in `img/` are drawn placeholders and `gen_images.py` is ready (set `IKAME_AI_KEY`, not set during this build).

**Demo (Artifact, private).** https://claude.ai/artifact/23Pg6ezErm8BYS2t83FqU9
