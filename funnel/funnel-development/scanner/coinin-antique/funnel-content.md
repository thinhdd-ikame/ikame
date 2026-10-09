---
niche: coinin-antique
display_name: CoinIdentify Antique (Heirloom and Estate Appraisal Web Quiz, Antique Scanner)
archetype: scanner-identifier
subject: antique or heirloom item
input: 4 quick answers (item, where it came from, maker's mark, goal), one auction guessing game, 1 photo of one item (or a sample item)
output: free item ID card (era, style, material); value range, where to sell and a real-or-reproduction read in the CoinIdentify app after purchase
screens: 18
monetization: hard web paywall after a mandatory email gate; 3 plans 1w $12.99→$39.99/4w, 4w $14.99→$39.99/4w (pre-selected), 12w $39.99→$59.99/12w; no offer on decline; post-purchase one-time add-on (price pending) → get_app
offer: none
creative_screens:
  hook-a: 1
  game: 9
  scan: 12
  reveal: 13
motion: >
  a dusty attic vase turns on a shelf, a gold scan frame sweeps across it,
  then its ID card (era, style, material) slides up beside it
---

# Funnel Content — CoinIdentify Antique (Heirloom and Estate Appraisal Web Quiz, Antique Scanner)

On 2026-10-07 this funnel was rebranded to CoinIdentify: Coin Scanner and moved to the Starlyn-shape monetization (hard paywall, no offer, add-on upsell, get-the-app).

A web2app funnel for the CoinIdentify: Coin Scanner app, antique branch. The hook is "Don't sell grandma's vase for $5": the user inherited, cleared out or found something and does not know what it is. They answer four quick questions (what item, where it came from, is there a maker's mark, what they want to know), play one honest "which one sold for more" auction game, **scan one real item (or tap "Use a sample item" when nothing or no camera is at hand)** and get a **free ID card (era, style, material)** before any paywall. The hard paywall then sells what is still locked on that item: value range, where to sell, and a real-or-reproduction read, all opened in the CoinIdentify app. Archetype: `scanner-identifier`, web variant (18 screens), same spine as `scanner/coinin-cards` and `scanner/coinin-collector`. **Reference funnel:** none for antiques. Research §4 of `coursiv-coinin.md` found no antique web funnel on Meta (adjacent apps: Antique Identifier by Picture, Vintiq, Relic are store-native photo → ID → paywall), so the flow is **unverified** and adapted from the CoinIdentify coin funnel (`scanner/coinin`). **Deliberate difference:** the **inheritance and house-clearing angle**, which no CoinIdentify funnel or competitor uses, CoinIn (competitor) included: "Where did it come from?" is a real question, and when the answer is inherited or estate clearing the bridge screen calms the user ("Don't clear it all yet") instead of pushing a jackpot. Also different from the coin reference: personalized free result before the paywall, no "get rich" framing, no countdown, no struck anchor prices, no dollar testimonials, no live counter. **Branch:** Q2 = inherited or estate clearing turns screen 8 into the family-home bridge. **Palette** follows `scanner/coinin` (charcoal, antique gold, serif display). **Reuse:** all niche data (item types, sample items, game pair, sample values) sits in one `ITEMS` block in the demo. Every value is an **estimate**, never "your item is worth $X", and never a formal appraisal.

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
**Visual:** Default: two upturned bases side by side, one plain and one with a stamp, label "Same shape, different base". **If Q2 = inherited or estate clearing:** headline A "Don't clear it all yet", headline B "A family piece, {{name}}?" (no name: "A family piece?"), body A "Nothing needs deciding today. Check each piece first.", body B "Old things carry stories. Value comes second." with a small house icon and the same base pair below.
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
**Microcopy:** Panel footnote: "Demo: we can't identify real photos; showing a sample result." (demo only)
**CTA:** (auto-advances when the result returns, minimum about 5 seconds)

### 13. Your item — free ID card
**Purpose:** Deliver real value free: what it is, its estimated era, style and material. Proves the scanner works and makes the locked part feel one tap away. Locked rows tease the category, never a number.
**Headline A:** We found your {{item_type}}
**Headline B:** Your item, identified
**Body A:** {{era}}, {{style}}, {{material}}.
**Body B:** Era and style free. Value is one tap away.
**Visual:** Item photo beside ID rows (type, estimated era, style, material, mark status from Q3). Below, three locked rows with a gold lock: "Value range", "Where to sell", "Real or reproduction". Neutral grey blur, no fake "$$$" shapes.
**Microcopy:** "Era is estimated from your photo. Estimate, not an appraisal." · link "Not right? Try another photo." (a "Match confidence" line appears only for real identify results, never for the demo sample) No-match state: headline "We couldn't match this one yet" · body "Try brighter light and a plain background." · buttons "Retake photo" / "Use a sample item".
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
**Purpose:** Hard web sales page selling what is still locked: value range for this item, where to sell, real-or-reproduction. Renewal shown at the same size as the price. No way past it without paying.
**Headline A:** See what it's worth
**Headline B:** Unlock your whole inventory
**Body A:** Value range, where to sell, real or reproduction.
**Body B:** Scan every piece in the house.
**Plans:** Three plans, `4w` pre-selected with the badge "Recommended":
- 1 week: `$12.99` for the first week, then `$39.99` every 4 weeks (sub-line "Intro week"). It renews every 4 weeks, not weekly.
- **4 weeks (pre-selected):** `$14.99` for the first 4 weeks, then `$39.99` every 4 weeks.
- 12 weeks: `$39.99` for the first 12 weeks, then `$59.99` every 12 weeks (sub-line "Lowest per week").
- Each card shows its renewal beside the price: "then $39.99 / 4 weeks", "then $59.99 / 12 weeks". No struck prices, no discount badges.
**Visual:** Sticky brand bar ("CoinIdentify", mini "Unlock my item" CTA after scrolling, **no close X**). Hero: the user's item with three locked rows glowing gold. Plan block. "What's inside" list (ordered by Q4 picks). "How it works" (3 steps). Proof block (rating and reviews, hidden while tokens are unset). Guarantee seal (hidden while the refund-days token is unset). FAQ. Plan block repeated. The sticky bottom bar (plan name, "$14.99 today", CTA) shows from the first view whenever no plan-block CTA is on screen, so a CTA and today's price are visible at 375×667 and 430×932.
**Microcopy:**
- Renewal line under the plan CTA, per plan: "$12.99 today for your first week, then $39.99 every 4 weeks until you cancel." · "$14.99 today for your first 4 weeks, then $39.99 every 4 weeks until you cancel." · "$39.99 today for your first 12 weeks, then $59.99 every 12 weeks until you cancel."
- What's inside: "Estimated value range" · "Where to sell it" · "Real or reproduction read" · "History and style notes" · "Unlimited item scans" · "Rare-piece flags" · "Saved inventory".
- How it works: "Checkout" (secure payment, takes a few seconds) · "Get the app" (Download CoinIdentify: Coin Scanner from the App Store or Google Play) · "Open your report" (Log in with your email. Your scan is saved there.)
- FAQ: When do I get my report? ("Right after checkout, in the CoinIdentify: Coin Scanner app. Log in with {{email}}.") · What's included? · How is value estimated? · How do I cancel? · Will I be charged again? ("Yes, unless you cancel. The 1-week and 4-week plans renew at $39.99 every 4 weeks. The 12-week plan renews at $59.99 every 12 weeks.") · Is this a formal appraisal?
- Value disclaimer: "Values are estimates, not appraisals. For insurance or legal use, ask a qualified appraiser."
- Footer: Terms of Use (https://squad-xteam.com/termofuse.html) · Privacy Policy (https://squad-xteam.com/policy.html) · Subscription terms. Legal entity hidden while `{{legal_entity}}` is unset.
- Hard paywall: no close X, no "continue free", no "maybe later", no sale or offer on decline.
**CTA:** Unlock my item

### 17. Add-on upsell — Maker's Mark & Provenance Report
**Purpose:** Right after the plan purchase, offer one add-on about the piece they just scanned, at its listed price, then hand off to the app either way.
**Headline A:** Who made your piece?
**Headline B:** Trace its maker and past
**Body A:** Read its maker's mark and trace its past.
**Body B:** A deeper look at the item you scanned.
**Plans:** One add-on, paid once: "Maker's Mark & Provenance Report" at `{{addon_price}}` (name and price pending from the owner). No subscription, no struck price, no countdown. The CTA opens its own one-time checkout: a hidden plan `addon` in `CONFIG.plans` (`oneTime`, `hidden`, never on the paywall) opened with `checkout('addon')`. Paying runs `completePurchase('addon')` and lands on Get the app with the "added" line; closing the checkout without paying goes to Get the app without it (`CONFIG.declineFlow = {addon:'get_app'}`). The demo shows a stand-in sheet (Pay / Close without paying) while no checkout URL is set.
**Visual:** Green pill "Payment complete. Your plan is active." Eyebrow "Add-on · paid once". Report cover card ("CoinIdentify report" label, report name, the user's item beside a stamped base), three gold checks, price row with the price token and "Paid once · no subscription". No back button, no close X.
**Microcopy:**
- Checks: "Maker's mark read from a close-up photo" · "Likely maker, region and period, as an estimate" · "Provenance checklist: papers and history to gather".
- Under the card: "One-time payment at a secure checkout. No subscription."
- Skip link: "No thanks, take me to the app"
- The CTA carries no price while the price is a token.
- Events: `upsell_view`, `upsell_accept` (+ `checkout_click` with plan `addon`), `upsell_decline`, `purchase_complete` with plan `addon`, `checkout_decline` with plan `addon`.
**CTA:** Add to my plan

---

## G. Payoff

### 18. Get the app
**Purpose:** Hand a paying user straight to the CoinIdentify app, where the full item report lives. Reached only after purchase (or a return with `?paid=`); there is no free path to it.
**Headline A:** You're in, {{name}}
**Headline B:** You're in
**Body A:** Your full report is waiting in the CoinIdentify app.
**Body B:** Your full report is waiting in the CoinIdentify app.
**Visual:** A success check in a glowing well, three numbered steps (Download CoinIdentify: Coin Scanner · Log in with {{email}} · Open your report), "Open the app" button, black App Store and Google Play badges. If the add-on was bought, a green line "Maker's Mark & Provenance Report added. It opens in the app." sits above the steps.
**Microcopy:** "Values are estimates, not appraisals. For insurance or legal use, ask a qualified appraiser. Cancel anytime in your account." App links pending: "Open the app" and the badges show "App link coming soon" until `CONFIG.appUrl` / `appStoreUrl` / `appUrlAndroid` are set.
**CTA:** Open the app

---

## Notes

**Reference.** None. Research §4 of `coursiv-coinin.md`: no antique web2app funnel found on Meta; store apps (Antique Identifier, Vintiq, Relic) are photo → ID → paywall. This flow is **unverified** and adapted from the CoinIdentify coin funnel and its card sibling. CoinIn (competitor) research lives in `coursiv-coinin.md`. Also unverified: the in-app antique database coverage, the value and where-to-sell data source, and the authenticity model.

**Inheritance branch.** Q2 = inherited or estate clearing turns screen 8 into the "Don't clear it all yet" bridge. Measure its drop-off and paywall conversion against the other sources. The wording is deliberately calm: no urgency, no "treasure in your attic" framing.

**Auction game data.** Screen 9 needs one verified, dated, sourced past auction result per item type before launch. The demo shows labelled illustrative figures ("Illustrative sample, not a real sale"); they are not real sales. The game never shows a value for the user's own item.

**Blocks deliberately skipped.** Persona host (the coin funnel's collector guide), social proof screen (no verified numbers; proof lives in the paywall behind tokens), notification opt-in, wheel or scratch card, last-chance offer (CoinIdentify policy: no sale, no offer), free result screen (hard paywall), fear-of-loss statistic ("most heirlooms sell below value" has no source, not used).

**Dark patterns not copied.** Countdown, struck anchor prices, fine-print "payment period", live user counter, dollar testimonials, "get rich" framing, an email gate that claims no storage.

**Drop-off risk.** Screen 11 (upload): heavy furniture is hard to photograph, so the sample-item link and camera or gallery choice exist for this. Screen 15 (email) is mandatory: one email input, no skip, guest, Google or Apple sign-in; it emits `lead` with the email so the checkout is prefilled and the app can activate the plan. Screen 16 is a hard paywall, so expect a lower paywall pass rate than the old dismissible version.

**Monetization (CoinIdentify, 2026-10-07).** Hard paywall with three plans (1w $12.99 then $39.99 / 4 weeks, 4w $14.99 then $39.99 / 4 weeks pre-selected, 12w $39.99 then $59.99 / 12 weeks); no sale or offer on decline; after purchase one optional add-on (Maker's Mark & Provenance Report, paid once) and then Get the app. Measure separately: first-scan success, email gate pass rate, subscription conversion by plan (`purchase_complete` by plan / `paywall_view`), add-on attach rate (`purchase_complete` with plan `addon` / `upsell_view`), app hand-off clicks, refund rate.

**Pending from the owner.** Add-on name confirmation and price (`{{addon_price}}`); Paddle price IDs for `1w`, `4w`, `12w` and `addon`; support email (`{{support_email}}`); App Store / Google Play / app links; legal entity; real images (`gen_images.py` not run).

**First A/B test.** Hook "Don't sell grandma's vase for $5" vs. "Clearing out a family home?" **Second:** authenticity teaser (screen 14) shown vs. skipped.

**Verify before build.** Refund terms; rating and reviews; antique database source and coverage; the real identify API; real sold-lot data for the game; the cancel path and "how to cancel" FAQ wording (unverified); legal review of "$5" in the hook (a cautionary example, not a value claim).

**Demo notes.** The demo cannot identify real photos: any upload (or the sample link) shows the same seeded sample result for the chosen item type, with the ID card, value range and authenticity verdict all marked "Sample data". Images in `img/` are real generated art (gemini-3.1-flash-image via `gen_images.py`, 2026-10-07), including one photo per sample item (`item-sample` = vase, `sample-furn`, `sample-silver`, `sample-clock`) shown on the ID card and paywall; the drawn SVG item stays only as a fallback.

**Demo (Artifact, private).** https://claude.ai/artifact/23Pg6ezErm8BYS2t83FqU9
