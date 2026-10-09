---
niche: coinin-notes-stamps-gems
display_name: CoinIdentify Notes, Stamps and Gems (One Funnel, Three Object Branches)
archetype: scanner-identifier
subject: banknote, stamp or gem (user picks one)
input: object type, 3 quick answers, 1 branch-specific guess game, 1-2 photos of one item (or a sample item)
output: ID card plus a collector level badge before the paywall; real-or-fake indication, value range and condition grade in the CoinIdentify app after purchase
screens: 18
monetization: hard web paywall after a mandatory email gate; 3 plans 1w $12.99→$39.99/4w, 4w $14.99→$39.99/4w (pre-selected), 12w $39.99→$59.99/12w; no offer on decline; post-purchase one-time add-on (price pending) → get_app
offer: none
creative_screens:
  hook-a: 1
  hook-b: 2
  game: 8
  scan: 10
  reveal: 12
motion: >
  a banknote, a stamp and a cut gem slide into three rings, a gold scan line
  sweeps the one the user picked, and an ID card rises beside it
---

# Funnel Content - CoinIdentify Notes, Stamps and Gems

**Rebrand 2026-10-07:** the funnel is now branded CoinIdentify: Coin Scanner and uses the Starlyn monetization shape (hard paywall, add-on upsell, get the app).

A web2app funnel for the CoinIdentify: Coin Scanner app, built as **one funnel with three object branches** (banknote / stamp / gem) instead of three tiny funnels, because each niche is small and its search volume is flat. The user answers one question to pick the object, then gets two short quiz questions and one "real answer" guess game written for that object, scans **one real item (one or two photos, or taps "Use a sample" when no item or camera is at hand)** and gets a **free ID card plus a collector level badge** before any paywall. The paywall then sells what is still locked: **a real-or-fake indication, a value range by condition, a condition grade** and unlimited scans with a collection tracker. Archetype: `scanner-identifier`, web variant (18 screens). **Reuses Task 21** (`scanner/coinin-collector`, 20 screens): same engine, one data block per object, same palette (charcoal ground, antique gold, serif display for item names), same paywall structure. **Reference funnels:** the Coin&Note Scanner and Crystal Collector tests that CoinIn (competitor) ran (research section 6 of `coursiv-coinin.md`), NoteScan and Rock Identifier; their exact copy and flows are **unverified**, only the product pattern is taken. **Deliberate differences:** no persona host (a host per object would be three personas to label); a personal result (ID card and badge) before the paywall; games with real answers and no dollar figures; no "become rich" framing; no countdown, no struck anchor prices, no dollar testimonials, no live user counter. **Two rules for the whole funnel:** every value is an **estimate**, never "your item is worth $X"; and "real or fake" is an **indication from photos, never a certification or authentication**. **Branching:** screens 4, 5, 7, 8, 9, 10, 11, 13 change their options or picture by object; headline and CTA stay the same unless a `(banknote)` / `(stamp)` / `(gem)` variant is listed. The main Headline and Body fields below are the banknote default.

---

## A. Hook and object

### 1. Hook - Real, rare, or nothing?
**Purpose:** Name the everyday "before" state (a note from a drawer, an old album, a stone nobody can name) and promise one clear answer.
**Headline A:** Real, rare, or nothing?
**Headline B:** Worth a second look?
**Body A:** Scan a note, stamp or gem.
**Body B:** Get a free ID card in minutes.
**Visual:** Charcoal ground. Top: a banknote, a stamp and a cut blue gem on dark cloth (`img/hero-trio.jpg`), fading into the ground. Three small chips beneath: "2-min quiz", "One scan", "Free ID card". Gold CTA pinned bottom.
**Microcopy:** Under CTA: "By continuing you agree to our Terms of Use and Privacy Policy. Values are estimates only." (both are real links: Terms https://squad-xteam.com/termofuse.html, Privacy https://squad-xteam.com/policy.html)
**CTA:** Let's look

### 2. Object picker
**Purpose:** The branch switch. One tap sets the quiz, game, sample and paywall copy for the rest of the funnel.
**Headline A:** What did you find?
**Headline B:** Pick your object
**Body A:** One funnel for notes, stamps and gems.
**Body B:** The next questions fit your pick.
**Options:**
- 💵 Banknote
- ✉️ Stamp
- 💎 Gem or stone
**Field:** Single select, auto-advance on tap. No "Other": all three branches need a defined quiz, game and sample, so a fourth object would have nowhere to go. Under the options a link "Something else? Join the waitlist" is NOT shown in the demo (no waitlist exists).
**Visual:** Three tall cards (banknote, stamp, gem) with a gold ring on the selected one, progress bar 1/6 in gold.
**CTA:** (auto-advances on select)

### 3. Name
**Purpose:** Capture a first name for later personalization. Optional, with a fallback, so nobody stalls.
**Headline A:** What's your first name?
**Headline B:** First, your name
**Body A:** Just a first name or nickname.
**Body B:** It makes your ID card personal.
**Field:** Text input, max 20 characters, placeholder "Your first name". Skip link below. Empty or skipped: later screens say "you" / "friend".
**Visual:** Name field on a dark card, gold underline when focused.
**Skip link:** "Skip, call me friend"
**CTA:** Continue

---

## B. Branch quiz

### 4. Q1 - What kind
**Purpose:** Cheap first tap in the branch. It sets the sample item and the examples used in the bridge.
**Headline A:** What kind is it?
**Headline B:** Tell us what it is
**Body A:** Your best guess is fine.
**Body B:** The scan will confirm it.
**Options (banknote):**
- 🇺🇸 US dollar note
- 🌍 Foreign note
- 🕰️ Old or vintage
- ⭐ Odd serial number
- ✏️ Other
**Options (stamp):**
- 🇺🇸 US stamp
- 🌍 World stamp
- 🕰️ Before 1940
- ✉️ Still on a letter
- ✏️ Other
**Options (gem):**
- 🔵 Blue stone
- 🔴 Red or pink stone
- 🟢 Green stone
- ⚪ Clear or white stone
- ✏️ Other
**Field:** Single select, auto-advance on tap (Other opens a one-line input; CTA "Continue" disabled until text is typed).
**Visual:** Progress bar 2/6, full-width dark pills with a gold border, selected pill fills gold. Small branch icon in the header.
**Error state:** Other chosen, field empty: CTA disabled, hint "Type a few words to continue."
**CTA:** (auto-advances on select; Continue for Other)

### 5. Q2 - How many
**Purpose:** Sizes the collection, which later drives the badge and the "track your collection" paywall line.
**Headline A:** How many do you have?
**Headline B:** One, or a whole box?
**Body A:** A rough guess is fine.
**Body B:** No counting needed.
**Options (banknote):**
- 💵 Just one
- 🗂️ 2 to 10
- 📦 10 to 50
- 🧰 50 or more
**Options (stamp):**
- ✉️ Just a few
- 🗂️ 20 to 100
- 📦 100 to 500
- 📚 A full album
**Options (gem):**
- 💎 Just one
- 🗂️ 2 to 10
- 📦 10 to 50
- 🧰 50 or more
**Field:** Single select, auto-advance.
**Visual:** As screen 4, progress 3/6. Each pill has a small stack icon that grows with the number.
**CTA:** (auto-advances on select)

### 6. Q3 - What they want to know
**Purpose:** Multi-select intent. It reorders the paywall "what's inside" list and picks the paywall hero line.
**Headline A:** What do you want to know?
**Headline B:** What matters most?
**Body A:** Pick all that apply.
**Body B:** Choose as many as you like.
**Options:**
- 🔎 Real or fake
- 💰 Value estimate
- ⭐ Rare or error
- 🗂️ Track my collection
- ✏️ Other
**Field:** Multi-select, CTA disabled until at least one pick; Other needs text.
**Visual:** Same pill list, progress 4/6.
**Error state:** Other picked, field empty: CTA disabled, hint "Type a few words to continue."
**CTA:** Continue

---

## C. Bridge and game

### 7. Bridge - details decide
**Purpose:** One teaching beat that shifts expectation from "jackpot" to "details and condition decide", with the honest rule for this object.
**Headline A:** Details decide everything
**Headline B:** Look closer
**Body A:** Common is normal. Small details change a lot.
**Body B:** One quick guess, then your scan.
**Branches (visual):**
- Banknote: one crisp note beside one folded and creased copy, label "Same note, different condition". Line: "Serial numbers, seals and folds all count."
- Stamp: one stamp with clean edges beside one with a torn corner, label "Same stamp, different condition". Line: "Perforations, centering and gum all count."
- Gem: one clear stone beside one cloudy stone, label "Same color, different clarity". Line: "Color alone never proves a gem is real."
**Visual:** Two drawn items side by side (left dimmed and worn), caption under them, honest-expectation line beneath: "Most items you find are common. That's normal."
**CTA:** Let's play

### 8. Game - spot the real detail
**Purpose:** One short interactive teaching beat with a real answer, written per object. Honest replacement for dollar-figure guessing screens; no price appears anywhere on it.
**Headline A:** Which note has an error?
**Headline B:** Spot the odd note
**Body A:** Check the two serial numbers on each.
**Body B:** Tap the one you think is wrong.
**Headline A (stamp):** Which stamp is the famous error?
**Headline B (stamp):** Spot the upside-down plane
**Body A (stamp):** Both show a 1918 airmail plane.
**Body B (stamp):** Tap the one that looks wrong.
**Headline A (gem):** Which blue stone is glass?
**Headline B (gem):** Can you spot the glass?
**Body A (gem):** Look inside each one closely.
**Body B (gem):** Tap the one you think is glass.
**Options (banknote):**
- ✅ Serials match
- ❌ Serials differ
**Options (stamp):**
- ✈️ Plane upright
- 🙃 Plane upside down
**Options (gem):**
- 🫧 Round bubbles inside
- 🪡 Fine needle lines inside
**Field:** Two tappable drawn pictures side by side. Either tap reveals the answer; no wrong-answer penalty. Score counts for the badge.
**Visual:** Two pictures on charcoal, a magnifier loupe in the corner. After the tap the right one gets a gold ring and the other dims.
**Microcopy:** Reveal text per object, no dollar figure on this screen:
- Banknote: "The note with different serials. A note should print the same number twice, so a mismatch is a known collectible error." / "A scan checks details like this for you."
- Stamp: "The upside-down plane. On the 1918 24-cent airmail stamp, one sheet of 100 slipped out with the plane flipped: the Inverted Jenny." / "A scan checks details like this for you."
- Gem: "Round bubbles. Round bubbles can point to glass or a lab-grown stone; natural sapphire usually shows fine needle-like lines." / "Never judge by eye alone. A scan gives an indication, a gem lab confirms."
**CTA:** Next (scan my item once answered)

---

## D. Scan (asset input + anticipation)

### 9. Camera primer
**Purpose:** Pre-permission screen with a reason, four capture rules and the sample escape, so users without an item or camera never drop.
**Headline A:** Grab one item
**Headline B:** Let's scan your first one
**Body A:** Any one will do, even a common one.
**Body B:** We need a clear look.
**Branches (tips):**
- Banknote: "Flat note, Good light, Plain surface, Fill the frame". Visual: a note flat on dark cloth.
- Stamp: "One stamp, Good light, Plain surface, Fill the frame". Visual: a stamp on dark cloth, tweezers.
- Gem: "Loose stone, Daylight, Plain surface, No flash glare". Visual: a stone on dark cloth.
**Visual:** Photo of the object type on dark cloth (`img/cloth.jpg`), four tip chips in a 2x2 grid with line icons.
**Microcopy:** Privacy line: "Your photos are used to identify this item only." Skip link: "No item handy? Use a sample".
**Skip link:** "Use a sample" runs the same flow with a sample of the picked object.
**CTA:** Continue

### 10. Scan - first photo
**Purpose:** The core input. It takes a gallery upload or a camera shot with plain error messages, plus the sample fallback.
**Headline A:** Front side first
**Headline B:** Show us the face
**Body A:** Center it and hold steady.
**Body B:** Lay it flat on a plain surface.
**Headline A (gem):** Top view first
**Headline B (gem):** Show us the top
**Field:** Upload from gallery, Take a photo now (device camera), drag-and-drop. Preview with "Use this photo" and "Choose another". Link "Use a sample" always visible.
**Value line:** "Step 1 of 2 - Two views give a sharper match"
**Visual:** Dashed gold frame drop zone with an outline of the picked object (rectangle for note, small stamp frame, diamond for gem). After upload the photo shows in the frame with a gold edge.
**Error states:**
- "That file isn't a photo. Try a JPG or PNG."
- "That photo is over 15 MB. Try a smaller one."
- "We couldn't open that photo. Try another."
- "It looks dark. Items read best in bright light." (warning, can continue)
**Skip link:** "Use a sample"
**CTA:** Use this photo

### 11. Scan - second photo
**Purpose:** A second view confirms details (back of a note, back and gum of a stamp, side of a gem). It is the last input before the payoff.
**Headline A:** Now flip it over
**Headline B:** One more view
**Body A:** The back confirms the details.
**Body B:** Two views make the match sharper.
**Headline A (gem):** Now the side view
**Headline B (gem):** One more angle
**Field:** Same upload block. A thumbnail of the first photo sits in a corner. Link "Use a sample" and a small grey "Skip, one photo".
**Value line:** "Step 2 of 2"
**Visual:** As screen 10, with a corner thumbnail of the first photo.
**Error states:** Same as screen 10.
**Skip link:** "Skip, one photo" (the card shows lower match confidence)
**CTA:** Identify it

### 12. Identifying
**Purpose:** Manufacture the wait around the user's own item (best ad-creative screen). Advance only when the result is back, minimum about 5 seconds.
**Headline A:** Identifying your item...
**Headline B:** Checking the database...
**Steps:**
1. Reading the design and details... (0 to 100%, check)
2. Matching series, year or material... (0 to 100%, check)
3. Looking for known errors and flaws... (0 to 100%, check)
4. Preparing your ID card... (0 to 100%, check)
**Visual:** The user's first photo (or the sample drawing) fills a frame, tilts slowly in 3D (the only 3D in the funnel) with a gold scanning line sweeping it. Four rows beneath: label, percent, check, gold bar.
**Microcopy:** Under headline: "Two views scanned". Demo only: a footnote on this screen and on screen 13 says photos are not analyzed and results are sample data.
**CTA:** (auto-advances when the result returns, minimum about 5 seconds)

### 13. Your item - free ID card
**Purpose:** Deliver real value free: what the item is. Proves the scanner works and makes the locked part feel one tap away. Locked rows tease the category, never a number.
**Headline A:** It's a {{item_name}}
**Headline B:** We found your item
**Body A:** {{origin}}, {{year}}.
**Body B:** Real-or-fake and value are one tap away.
**Branches (fact rows):**
- Banknote: Country, Series, Denomination, Seal, Printer. Locked: "Real or fake indication", "Estimated value range", "Condition grade".
- Stamp: Country, Year, Denomination, Series, Perforation. Locked: "Real or fake indication", "Estimated value range", "Condition and centering".
- Gem: Type, Material, Hardness, Color, Cut. Locked: "Real or fake indication", "Estimated value range", "Clarity and cut estimate".
**Visual:** Card with the captured photos side by side, item name in serif, five fact rows. Below, three locked rows with a gold lock. Neutral grey blur, no fake "$$$" shapes.
**Microcopy:** Demo only: chip "Sample data: this demo can't identify real photos" plus a "Sample data" label on the card. "Match confidence: {{confidence}}" with link "Not right? Try another photo." No-match state: headline "We couldn't match this one yet" - body "Try brighter light and a plain background." - buttons "Retake photos" / "Use a sample".
**CTA:** See my badge

### 14. Collector level badge
**Purpose:** A personalized free reward built only from the user's own answers and game result, so the paywall hero can speak to them. It is a fun label, never an appraisal.
**Headline A:** You're a {{level}}
**Headline B:** Your collector level
**Body A:** Based on your answers and your guess.
**Body B:** A fun badge, not an appraisal.
**Visual:** Gold badge medallion with the level name and four small stars showing level (1 to 4), the user's name under it, the item thumbnail beside it. Level names: Curious Finder, Keen Spotter, Sharp Collector, Seasoned Hunter.
**Microcopy:** Level rule (panel footnote): points from collection size (Q2), number of interests (Q3) and the game answer; no outcome is promised for the level. Share row: "Share my badge" (image of the badge only, no values).
**CTA:** Save my card

---

## E. Gate

### 15. Email gate
**Purpose:** Capture the email before the value reveal, framed as saving the card and collection.
**Headline A:** Where should we send it?
**Headline B:** Save your ID card
**Body A:** Get your card and keep your scans safe.
**Body B:** One email, no spam.
**Field:** Email input (email keyboard), required and validated; no skip, guest, Google or Apple option. Optional marketing consent checkbox (off). Emits `lead` with the email so the checkout email is filled.
**Visual:** The ID card shrinks into the first slot of an empty collection grid (other slots dashed), email field beneath.
**Error state:** "Enter a valid email address."
**Microcopy:** "By continuing you agree to our Terms of Use and Privacy Policy." (real links) - "We never sell your email."
**CTA:** Continue

---

## F. Monetization

### 16. Paywall
**Purpose:** Hard web sales page selling what is still locked on their item (real-or-fake indication, value range by condition, grade), then the ongoing tools. Renewal shown at the same size as the price. No close X, no free exit.
**Headline A:** Is it real? See the range
**Headline B:** Unlock your {{item_name}}
**Body A:** Indication, value range and grade, for every scan.
**Body B:** Scan unlimited items and track your collection.
**Plans:** Three plans, `4w` pre-selected with the "Recommended" badge. The 1-week plan renews every 4 weeks, not weekly.
- 1 week ("Intro week"): $12.99 today, then $39.99 every 4 weeks.
- **4 weeks (pre-selected, Recommended):** $14.99 today, then $39.99 every 4 weeks.
- 12 weeks ("Lowest per week"): $39.99 today, then $59.99 every 12 weeks.
- Each card's small line: "then $39.99 / 4 weeks" (1w and 4w), "then $59.99 / 12 weeks" (12w).
**Visual:** Sticky brand bar ("CoinIdentify", mini CTA after scrolling, no close X). Hero: the user's ID card (photo, name, badge level) with three locked rows glowing gold. Plan block. "What's inside" list (ordered by Q3 picks, wording per object). "How it works" (3 steps). Proof block (rating and reviews, hidden while tokens are unset). Guarantee seal (hidden while the refund-days token is unset). FAQ. Plan block repeated. Sticky bottom bar (selected plan, today's price, CTA) shows from first view whenever no plan-block CTA is on screen.
**Microcopy:**
- Renewal line under the CTA, per selected plan: "$12.99 today for your first week, then $39.99 every 4 weeks until you cancel." / "$14.99 today for your first 4 weeks, then $39.99 every 4 weeks until you cancel." / "$39.99 today for your first 12 weeks, then $59.99 every 12 weeks until you cancel."
- What's inside: "Real-or-fake indication" - "Value range by condition" - "Condition grade estimate" - "Rare and error check" - "Unlimited scans" - "Collection tracker".
- How it works: Checkout ("Secure payment, takes a few seconds.") - Get the app ("Download CoinIdentify: Coin Scanner from the App Store or Google Play.") - Open your report ("Log in with your email. Your scan is saved there.").
- Indication disclaimer (near the hero and in the FAQ): "Real or fake is an indication from photos, not a certificate."
- Value disclaimer: "Values are estimates, not appraisals or purchase offers."
- FAQ: What's included? - Is "real or fake" guaranteed? ("No. It is an indication from your photos. For a valuable item, get an expert or lab opinion.") - How is value estimated? - When do I get my report? ("Right after checkout, in the CoinIdentify app. Log in with {{email}}.") - How do I cancel? (account settings; the support email `{{support_email}}` shows once supplied) - Will I be charged again? ("Yes, unless you cancel. After your first period your plan renews automatically: 1 week at $39.99 every 4 weeks; 4 weeks at $39.99 every 4 weeks; 12 weeks at $59.99 every 12 weeks.").
- Footer: Terms of Use - Privacy Policy - Subscription terms (squad-xteam links); legal entity hidden while `{{legal_entity}}` is unset.
- No offer on decline: there is no close X, and nothing routes to a sale, offer or free result.
- Events: `paywall_view`, `plan_select`, `checkout_click`, `purchase_complete`.
**CTA:** Unlock my item

---

## G. After purchase

### 17. Add-on upsell - Rarity Deep Report
**Purpose:** One optional add-on while purchase intent is hot, at its listed price, then hand off to the app either way. Shown once, right after the plan purchase.
**Headline A:** Go deeper on this item
**Headline B:** Is it rarer than it looks?
**Body A:** A one-time deep check of the item you just scanned.
**Body B:** Varieties, errors and rare signs, in plain words.
**Plans:** One add-on, paid once: "Rarity Deep Report" (working name) at `{{addon_price}}` (pending from the owner). No subscription, no struck price, no countdown. The CTA opens its own one-time checkout: hidden plan `addon` in `CONFIG.plans` (`oneTime`, `hidden`, never listed on the paywall), opened with `checkout('addon')`. Paid → `completePurchase('addon')` → screen 18 with the "added" line. Closed without paying → screen 18 without it (`CONFIG.declineFlow = {addon:'get_app'}`). The demo shows a stand-in sheet (Pay / Close without paying) while no checkout URL is set.
**Branches (three checks):**
- Banknote: Serial, seal and print error check - Star note and fancy serial check - Saved with your ID card in the app.
- Stamp: Perforation and watermark variety check - Inverted, missing or shifted color check - Saved with your ID card in the app.
- Gem: Inclusion review: natural, lab or glass signs - Common treatment signs, as indications - Saved with your ID card in the app.
**Visual:** Green chip "Payment complete. Your plan is active." Eyebrow "Add-on · paid once". Report cover card (the user's photo or the drawn item, "CoinIdentify report" label, the report name), three gold checks, price row "{{addon_price}} · Paid once · no subscription". No back button, no close X.
**Microcopy:** Under the card: "One-time payment at a secure checkout. No subscription." Skip link: "No thanks, take me to the app". Events: `upsell_view`, `upsell_accept` (+ `checkout_click` with plan `addon`), `upsell_decline`, `purchase_complete` with plan `addon`, `checkout_decline` with plan `addon`.
**CTA:** Add to my plan

### 18. Get the app
**Purpose:** Hand a paying user straight to the CoinIdentify app, where the full report lives. Reached only after purchase (or a return with `?paid=`); there is no free path to it.
**Headline A:** You're in, {{name}}
**Headline B:** You're in, {{name}}
**Body A:** Your full report is waiting in the CoinIdentify app.
**Body B:** Your full report is waiting in the CoinIdentify app.
**Visual:** A success check in a glowing well, three numbered steps (Download CoinIdentify: Coin Scanner · Log in with {{email}} · Open your report), "Open the app" button, official-style black App Store and Google Play badges. If they bought the add-on, a green line "Rarity Deep Report added. It opens in the app." sits above the steps. Without a name the headline reads "You're in".
**Microcopy:** "Values are estimates. Cancel anytime in your account." App links are pending: until set, "Open the app" and the badges show "App link coming soon".
**CTA:** Open the app

---

## Notes

**Reference.** Research section 6 of `coursiv-coinin.md`: CoinIn (competitor) tested Coin&Note Scanner and Crystal Collector; NoteScan and Rock Identifier are the standalone competitors. Their exact flows and copy are **unverified**; only the pattern (one object, scan, ID, locked value) is taken. The in-app report layout and data source are also unverified.

**Why one funnel for three objects.** Each niche is small and search is flat. One funnel pools the ad spend, and the picker on screen 2 is also a free segmentation signal (note / stamp / gem) for later retargeting. Screens 1 to 3 and 12 to 18 are shared; 4 to 11, 13 and the add-on checks on 17 branch by object.

**No host persona.** The collector brief used an illustrative guide. Here a host per branch would be three characters to label and review, so the funnel speaks in plain product voice.

**Honesty rules.** Value is always a range by condition, labeled as an estimate. "Real or fake" is an indication from photos, never certification; the wording appears on the free card, the paywall hero and the FAQ. A gem looks fine in a photo and still can't be proven real: the gem game says so. No outcome promise, no dollar figure on any game screen, no "could be worth $X" hooks.

**Blocks deliberately skipped.** Social proof screen (no verified numbers for this listing; proof lives in the paywall behind tokens), notification opt-in, wheel or scratch card (casino feel next to money), last-chance offer and free result (CoinIdentify policy), "Other" on the object picker (every branch needs its own quiz and sample).

**Dark patterns not copied.** Countdown, strike-through anchor prices, "payment period" fine print, live user counter, dollar testimonials, "become rich" framing, an email gate that claims no storage.

**Drop-off risk.** Screens 10 to 11 (upload): sample link, camera or gallery choice and "skip, one photo". Screen 2 if the user's object is not covered (a coin or card goes to a sibling funnel by ad, not here). Screen 15 (email) is required in the web variant.

**Monetization (2026-10-07, Starlyn shape).** Hard paywall after a mandatory email: three plans (1w $12.99 then $39.99 every 4 weeks; 4w $14.99 then $39.99 every 4 weeks, pre-selected; 12w $39.99 then $59.99 every 12 weeks). No close X, no sale or offer on decline, no free result. Purchase → one-time add-on upsell → get the app. Measure separately: picker split (note / stamp / gem), first-scan success per branch, subscription conversion by plan and by object, add-on attach rate (`purchase_complete` plan `addon` / `upsell_view`), refund rate. The gem branch is the likeliest refund source (indication disappointment), so watch it first.

**Pending (owner).** Add-on name (working name "Rarity Deep Report") and price (`{{addon_price}}`); Paddle price IDs for `1w`, `4w`, `12w` and `addon`; support email (`{{support_email}}`); App Store / Google Play / app links; real images (hero, cloth, three samples).

**First A/B test.** Object picker on screen 2 (this brief) vs. three separate ad-to-branch links skipping the picker. **Second:** badge before vs. after the email gate.

**Verify before build.** Real plan periods and prices; refund terms; rating and reviews; the real identify API per object; licensed photos for the three game screens and samples; a gem expert's review of the bubbles vs needle-lines claim and of "real or fake" wording; that the sample items match real catalog entries.

**Demo notes.** The demo cannot identify real photos: any upload (or the sample link) shows the seeded sample for the picked object (1957 US $1 Silver Certificate, 1932 Washington 3-cent stamp, an oval blue sapphire), and "Sample data" labels sit on the ID card and the paywall hero. Pictures are drawn SVG art wired through the `IMG` map; `gen_images.py` is ready to produce the photos (hero, cloth, three samples) and the demo picks them up when the files exist.

**Demo (Artifact, private):** https://claude.ai/artifact/Fdimi8jevrUFYRdf2Ufzbg
