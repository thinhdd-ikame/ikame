---
niche: coinin
display_name: CoinIdentify Coin Scanner (scan-first identifier)
archetype: scanner-identifier
subject: coin
input: 4 quick collector answers + 2 photos of one real coin (front and back)
output: coin ID card (name, year, country, mint, metal) shown free before the email gate; value range by grade, condition grade and error check unlocked by the subscription in the CoinIdentify app
screens: 18
monetization: hard web paywall after a mandatory email gate; 3 plans 1w $12.99→$39.99/4w, 4w $14.99→$39.99/4w (pre-selected), 12w $39.99→$59.99/12w; no offer on decline; post-purchase one-time add-on (price pending) → get_app
offer: none
creative_screens:
  hook-a: 1
  hook-b: 2
  spot-error: 8
  reveal: 14
motion: >
  a worn silver coin slowly tilting in 3D under a gold scanning ring, then
  flipping from front to back as an ID card slides up with year and mint
---

# Funnel Content — CoinIdentify: Coin Scanner (scan-first)

**2026-10-07:** rebranded from the prototype modeled on CoinIn (competitor) to **CoinIdentify: Coin Scanner** and moved to the Starlyn-shape web2app flow (mandatory email → hard paywall → one-time add-on → get the app).

CoinIdentify is a coin identifier. The user photographs a coin, AI names it (country, year, mint, metal), estimates its condition grade and a market value range, checks for known errors and varieties, and saves it to a collection. This is a **web2app funnel** (Meta ad → web quiz and scan → web paywall → CoinIdentify app). The key difference from the CoinIn (competitor) web funnel is that the user **scans their own coin before the paywall**. They see what the coin *is* for free on the web, and the subscription sells what it's *worth* (value range, grade, error check), plus unlimited scans and the collection, all delivered in the app. No registered archetype fits: the output is *information about the object*, so accuracy and honesty carry the funnel, not novelty. It's proposed as a new archetype, **scanner-identifier** (Notes). There are 18 screens. **Rules** (app-rules.md → CoinIdentify): brand "CoinIdentify: Coin Scanner" (short "CoinIdentify"), mandatory email, hard paywall with no close X, no free path and no offer, 3 plans with `4w` pre-selected, a one-time add-on after purchase, then get_app. **No invented proof:** CoinIdentify has no verified rating, review or database figure yet, so none appear on screen (the 4.7★ / 101K / 270,000+ figures in earlier drafts were CoinIn's (competitor) and are research only). The look: charcoal background, antique-gold accents, a serif display face for coin names, and macro coin photography. All values are framed as **estimates**, never as "your coin is worth $X".

---

## A. Hook

### 1. Hook A — The coin jar
**Purpose:** Name the everyday "before" state (a jar, a drawer, an inherited album of unknown coins) and promise an instant answer before asking for anything.
**Headline A:** What's in your coin jar?
**Headline B:** That old coin might matter
**Body A:** Snap a photo and know it in seconds.
**Body B:** Identify any coin and see its estimated value.
**Visual:** Charcoal background, "CoinIdentify" brand row on top, overhead macro photo of a glass jar tipped over with mixed worn coins spilling out (`img/jar.jpg`). Three small chips: 2-min quiz · One coin scan · Free coin ID. No rating badge (no verified CoinIdentify rating yet). Gold CTA pinned at the bottom.
**Microcopy:** Under CTA: "By continuing you agree to our Terms of Use and Privacy Policy. Values are estimates only." (real links: https://squad-xteam.com/termofuse.html · https://squad-xteam.com/policy.html)
**CTA:** Get started

### 2. Hook B — The product in one glance
**Purpose:** Show the output (one photo becomes a full ID card) so the user knows exactly what the scan returns.
**Headline A:** One photo, the full story
**Headline B:** Scan it. Know it. Keep it.
**Body A:** Name, year, mint, grade and value estimate on one card.
**Body B:** From pennies to ancient silver, one scan each.
**Visual:** Phone mockup: camera circle around a coin → an arrow → a coin card (serif coin name, year · mint · metal rows, a grade chip, a value range bar with no numbers). 3D tilt only on the coin itself; everything else fades in flat.
**Microcopy:** No database figure until CoinIdentify has a verified one (the 270,000+ figure is CoinIn's, competitor).
**CTA:** Continue

### 3. Hook C — Honest expectation
**Purpose:** Set trust early. Values arrive as a condition-based range, not a jackpot promise. This heads off the "it said $10,000, the dealer said $2" refund and review spiral.
**Headline A:** Honest estimates, not hype
**Headline B:** Know before you sell
**Body A:** Values shown as a range by condition, never one number.
**Body B:** Don't let a rare coin go for face value.
**Visual:** Single large coin, below it a horizontal range bar labeled by grade (Good · Fine · Extremely Fine · Uncirculated), a marker sliding along it. No dollar figures anywhere on the screen.
**CTA:** Continue

---

## B. Investment

### 4. Q1 — Where the coins came from
**Purpose:** Cheap first tap. It segments the emotional motive (heir, pocket-change hunter, traveler, collector), and later screens choose examples and paywall copy from it.
**Headline A:** Where are your coins from?
**Headline B:** How did you find them?
**Body A:** We'll show examples that match your coins.
**Body B:** Every collection starts somewhere.
**Options:**
- 🧓 Inherited from family
- 🫙 Pocket change jar
- ✈️ Travel & foreign
- 🗂️ My own collection
- ✏️ Other
**Field:** Single select, auto-advance on tap. Other opens a one-line input and a Continue button (disabled while empty).
**Visual:** Thin gold progress bar (1/5) under the CoinIdentify brand row, stacked full-width dark pills with a gold border, selected pill fills gold with dark text.
**CTA:** (auto-advances on select)

### 5. Q2 — What they want to know
**Purpose:** Multi-select intent. It decides the paywall headline and the order of the paywall feature list.
**Headline A:** What do you want to know?
**Headline B:** What matters most to you?
**Body A:** Pick all that apply.
**Body B:** Choose as many as you like.
**Options:**
- 💰 What it's worth
- 🔍 Rare errors
- 📜 Its history
- 🗂️ Track my collection
- 🤝 Buy or sell
- ✏️ Other
**Field:** Multi-select with gold check circles; CTA disabled until ≥1 pick.
**Visual:** Same pill list as Q1, check circle right-aligned, progress 2/5.
**CTA:** Continue

### 6. Q3 — Which coins
**Purpose:** Personalizes the example coins on screens 8 and 10 and the sample coin offered on screen 10. It's also a quiet signal of how often the user will scan.
**Headline A:** Which coins do you have?
**Headline B:** What's mostly in your pile?
**Body A:** Pick all that apply. Mixed is fine.
**Body B:** Helps us pick examples you'll recognize.
**Options:**
- 🇺🇸 US coins
- 🌍 World coins
- 🏛️ Ancient coins
- 🥈 Silver & gold
- 🤷 Not sure
- ✏️ Other
**Field:** Multi-select, CTA gated on ≥1 pick. "Not sure" deselects the others.
**Visual:** Pills with a small coin-photo thumbnail where art exists (`img/obv.jpg` cent, `img/world.jpg` bimetallic, `img/ancient.jpg` silver head, `img/bullion.jpg` silver eagle round), progress 3/5. The first group picked seeds the demo's sample coin.
**CTA:** Continue

### 7. Q4 — Experience level
**Purpose:** Low-effort tap that lets the result screen explain jargon for beginners. It also flags pros and dealers, who may prefer the 12-week plan.
**Headline A:** How much do you know?
**Headline B:** Your coin experience?
**Body A:** No wrong answer. We'll explain the jargon.
**Body B:** Beginners and pros both welcome here.
**Options:**
- 🌱 Complete beginner
- 📘 Know the basics
- 🏅 Serious collector
- 💼 Dealer or pro
**Field:** Single select, auto-advance.
**Visual:** Same pill list, progress 4/5. Beginner adds a one-line jargon tip on screen 14.
**CTA:** (auto-advances on select)

### 8. Spot the rare one — mini game
**Purpose:** An interactive teaching beat. It shows *why* a scan beats eyeballing (tiny details decide value) without promising the user's coin is a jackpot. It's the honest replacement for CoinIn's (competitor) "could this be worth $12,000?" true/false screens.
**Headline A:** Spot the rare one
**Headline B:** Which penny is special?
**Body A:** Tiny details can change what a coin is.
**Body B:** Look closely at the letters.
**Options:**
- 🅰️ Coin A
- 🅱️ Coin B
**Field:** Two tappable coin close-ups side by side (for US picks: a normal 1955 Lincoln cent vs. the 1955 doubled-die obverse; for world/ancient picks, swap in a documented variety from that group). Either tap flips to the answer.
**Visual:** Two macro coin crops on charcoal, a magnifier loupe over the date and lettering. After the tap, a gold outline circles the doubled letters on Coin B and the other coin dims. Progress 5/5.
**Microcopy:** Answer reveal (both taps): "Coin B: doubled letters, a famous error." · "A scan checks details like this for you." Small caption: "Drawn illustration of the 1955 doubled-die cent." Use licensed reference photos only when swapping the drawing, and put **no dollar figure** on this screen.
**CTA:** Continue

---

## C. Trust

### 9. Why scan — honest product facts
**Purpose:** The scan is the highest-friction step, so a trust beat goes right before it. CoinIdentify has no verified rating or reviews yet, so this screen uses honest product facts instead of borrowed proof (no invented proof rule).
**Headline A:** Honest answers, by design
**Headline B:** What a scan tells you
**Body A:** What CoinIdentify checks on every coin you scan.
**Body B:** Facts first, estimates clearly marked.
**Visual:** Four stacked fact rows with gold line icons: "Two sides, one match — Front and back confirm the exact variety." · "Value as a range — Set by condition grade, never one number." · "Errors and varieties — Known errors checked for you." · "Your collection — Every scan saved to your account." A dashed chip below: "Values are estimates, not appraisals".
**Microcopy:** Swap in a real rating block only once CoinIdentify has a verified store rating (source + date under it). Never reuse CoinIn's (competitor) rating or reviews.
**CTA:** Continue

---

## D. Scan (asset input + anticipation)

### 10. Camera primer
**Purpose:** Pre-permission screen, so the iOS/Android camera prompt comes with a reason. It also teaches the four capture rules that decide scan success, and gives a no-coin escape so users without a coin don't drop.
**Headline A:** Let's scan your first coin
**Headline B:** Grab a coin nearby
**Body A:** Use your camera or a photo you have.
**Body B:** Any coin works — even one from your pocket.
**Visual:** Hand placing a coin on a plain dark cloth (`img/cloth.jpg`), four tip chips with line icons, a privacy line ("Your photos are used to identify this coin only."), gold verb CTA, skip link under it.
**Microcopy:** Tip chips: "One coin · Good light · Flat surface · Fill the circle"
**Skip link:** "No coin handy? Try a sample coin" → runs screens 13-14 with a sample coin matched to the Q3 picks
**CTA:** Scan my coin

### 11. Scan the front
**Purpose:** The core input. Auto-capture and live quality hints keep failed scans (the main source of "it doesn't work" reviews) low.
**Headline A:** Front side first
**Headline B:** Show us the face
**Body A:** Center the coin in the circle and hold steady.
**Body B:** Lay it flat on a plain surface.
**Field:** Web capture: "Take a photo" (opens the phone camera) and "Upload from photos"; a dashed circular guide over a dark cloth texture (`img/cam.jpg`); the captured photo previews in the circle with "Choose another photo". In the app, a live viewfinder with auto-capture replaces this.
**Value line:** "Step 1 of 2 · Two sides = a sharper match"
**Visual:** Dashed gold circle on charcoal; after capture the photo fills the circle.
**Error states:**
- "Too dark. Find more light." (brightness check on the photo)
- "That file isn't a photo. Try a JPG or PNG."
- "That photo is over 15 MB. Try a smaller one."
- "We couldn't open that photo. Try another."
**CTA:** Scan front

### 12. Scan the back
**Purpose:** The second side confirms the variety and the date or mint details. It's the last input before the payoff.
**Headline A:** Now flip it over
**Headline B:** One more side
**Body A:** The back helps confirm the exact variety.
**Body B:** Two sides make the match more accurate.
**Field:** Same capture block. A thumbnail of the captured front sits below with "Retake".
**Value line:** "Step 2 of 2"
**Visual:** As screen 11, with a small flip animation on the corner thumbnail when the screen opens.
**Error states:** Same four as screen 11.
**Skip link:** "Skip, use the front only" (small, grey; the result shows lower confidence)
**CTA:** Identify coin

### 13. Identifying
**Purpose:** Manufacture the wait around the user's *own* coin, and the best ad-creative screen in the funnel. The real API call runs underneath it. Advance when the result is back, with a ~5 s minimum, and never pad a finished result beyond that.
**Headline A:** Identifying your coin…
**Headline B:** Checking our coin database…
**Steps:**
1. Reading the design and lettering… (0→100%, ✓)
2. Matching the year and mint mark… (0→100%, ✓)
3. Checking known errors and varieties… (0→100%, ✓)
4. Your coin card is almost ready… (0→100%, ✓)
**Visual:** The user's front photo fills the top half and tilts slowly in 3D (the only 3D element in the funnel), with a gold scanning ring sweeping around its rim. Four stacked rows beneath: label left, % right, check when done, thin gold bar.
**Microcopy:** Under the coin: "Two sides scanned" (or "Front side scanned"). Add "Usually under 10 seconds" only if true for the real API.
**CTA:** (auto-advances when the result returns, minimum ~5 seconds)

### 14. Your coin — identity reveal (free)
**Purpose:** Deliver real value free: *what* the coin is. That proves the scanner works and makes the gated part, *what it's worth*, feel one tap away. The locked cards must tease the category, never a number.
**Headline A:** It's a {{coin_name}}
**Headline B:** We found your coin
**Body A:** {{country}} · {{year}} · {{mint}} · {{metal}}
**Body B:** Value and grade are one tap away.
**Visual:** Coin card with both captured photos side by side, coin name in serif, fact rows (country, year, mint, metal, denomination). Below, three blurred locked cards with a gold lock icon: "Estimated value range", "Condition grade", "Errors & varieties check". The blur is neutral grey, with no fake "$$,$$$" silhouettes.
**Microcopy:**
- Confidence line: "Match confidence: {{confidence}}" + link "Not right? Try another photo"
- Beginner tip (Q4 = beginner): "Mint = where the coin was made, often a tiny letter."
- Demo chip: "Sample data: this demo can't identify real photos" (prototype only)
- No-match state: headline "We couldn't match this one yet" · body "Try brighter light and a plain background." · buttons "Retake photos" / "Try a sample coin"
**CTA:** See value & grade

---

## E. Gate

### 15. Email — save to your collection
**Purpose:** Capture the email at the moment the user owns something worth keeping (their first scanned coin), framed as saving it to the collection. The email is mandatory: it is how the backend activates the subscription in the app and logs the user in.
**Headline A:** Save it to your collection
**Headline B:** Keep your scans safe
**Body A:** Your coin card, saved to your account.
**Body B:** Use this email to log in to the app.
**Field:** One email input (email keyboard, autocomplete email), validated on Continue. No skip, no guest, no "Maybe later", no Google or Apple sign-in. Optional unchecked box: "Send me coin tips and news by email (optional)".
**Visual:** The coin photo from screen 14 sits in the first slot of an empty 4-slot collection grid (other slots dashed), the white email field below.
**Error states:**
- "Please enter a valid email."
**Microcopy:** Legal line: "By continuing, you agree to our Terms of Use and Privacy Policy. We never sell your email." (real underlined links). Emits `lead` with the email so FunnelFox pre-fills checkout.
**CTA:** Save coin

---

## F. Monetization

### 16. Paywall — web landing page
**Purpose:** Sell what's still locked on *their* coin (value range, grade, error check), then the ongoing tools (unlimited scans, the collection). Hard paywall: no close X, no free path, no offer on decline.
**Headline A:** See what it's worth
**Headline B:** Unlock your {{coin_name}}'s story
**Body A:** Value range, grade and error check for every scan.
**Body B:** Unlimited scans, values and your whole collection.
**Plans:** Three plans, `4w` pre-selected with the "Recommended" ribbon. The price today and the renewal are on every card and in the fine print at the same size as the plan line.
- `1w` · 1 week · "Intro week" · **$12.99** · then $39.99 / 4 weeks
- `4w` · 4 weeks · **Recommended** · **$14.99** · then $39.99 / 4 weeks
- `12w` · 12 weeks · "Lowest per week" · **$39.99** · then $59.99 / 12 weeks
- The 1-week plan renews every **4 weeks**, not weekly. No struck prices, no timer, no trial.
**Visual:** Long-scroll web page (not an app sheet). Sticky top bar: "CoinIdentify" brand + a mini "Unlock my coin" button after scrolling; **no close X**. Hero: eyebrow "Your coin card is ready", headline, the user's coin in a gold circle with three fact chips (coin name, year, "Still locked: 3 of 3 parts"), the three locked rows glowing gold. Then the plan block (plans, "Due today", gold CTA, payment marks, "Secure checkout · Cancel anytime", renewal line); "Inside your plan" list (coin ID card open, then the features ordered by Q2 picks, locked); "How it works" (3 steps); "Why CoinIdentify" honest facts (Two-sided scan · Ranges, not hype · Your collection); FAQ; a second plan block; footer legal. A sticky bottom bar (plan name, "$14.99 today", CTA) shows from first view whenever no plan-block CTA is on screen. Rating, reviews and the money-back block stay hidden while their values are tokens.
**Microcopy:**
- Renewal line (exact, follows the selected plan): 1w "$12.99 today for your first week, then $39.99 every 4 weeks until you cancel." · 4w "$14.99 today for your first 4 weeks, then $39.99 every 4 weeks until you cancel." · 12w "$39.99 today for your first 12 weeks, then $59.99 every 12 weeks until you cancel."
- How it works: "Checkout — Secure payment, takes a few seconds." · "Get the app — Download CoinIdentify: Coin Scanner from the App Store or Google Play." · "Open your report — Log in with your email. Your scan is saved there."
- Feature list, ordered by Q2 picks, only shipped features: "Value range by condition" · "Condition grade estimate" · "Error & variety check" · "Unlimited coin scans" · "Collection tracker" · "Coin history & facts".
- FAQ: What's included? · When do I get my report? ("Right after checkout, in the CoinIdentify: Coin Scanner app. Log in with {{email}}.") · How is value estimated? · How do I cancel? (account settings or {{support_email}}) · Will I be charged again? ("Yes, unless you cancel." + the selected plan's renewal line).
- Footer: Terms of Use · Privacy Policy · Subscription terms · "Values are estimates, not appraisals or purchase offers." Company name `{{legal_entity}}` hidden while it is a token.
- Q2-segmented headline A variants: 💰 → "See what it's worth" · 🔍 → "Check it for rare errors" · 📜 → "Read your coin's story" · 🗂️ → "Build your coin collection" · 🤝 → "Know its value before selling"
- Checkout: the CTA opens the selected plan's checkout (`checkout(plan)`; FunnelFox native checkout per plan key). Closing a plan checkout without paying stays on the paywall. Events: `paywall_view`, `plan_select`, `checkout_click`, `checkout_decline`, `purchase_complete`.
**CTA:** Unlock my coin

### 17. Add-on upsell
**Purpose:** Offer one add-on report about the coin they just scanned while purchase intent is hot, at its listed price, then hand off to the app either way.
**Headline A:** Add a deep error check
**Headline B:** Could it be a rare variety?
**Body A:** A closer look at this coin for known errors.
**Body B:** Doubling, mint marks and varieties, in plain words.
**Plans:** One add-on, paid once: "Error & Variety Deep Check" at `{{addon_price}}` (name, price and Paddle IDs pending from the owner). No subscription, no struck price, no countdown, no bundle. The CTA opens its own one-time checkout: a hidden plan `addon` in `CONFIG.plans` (`oneTime`, `hidden`, never shown on the paywall) opened with `checkout('addon')`. Paying runs `completePurchase('addon')` → get_app with the added line. Closing it without paying → get_app without it (`CONFIG.declineFlow = {addon:'get_app'}`). The demo shows a stand-in sheet (Pay / Close without paying) when no checkout URL is set.
**Visual:** Green chip "Payment complete. Your plan is active." Eyebrow "Add-on · paid once". Report cover card (the user's coin in a gold circle, "CoinIdentify report" label, the report name), three gold checks (Date, lettering and mint mark checked for doubling · Known varieties for this coin type, side by side · Saved with your coin card in the app), price row `{{addon_price}}` (dashed token style until set) "Paid once · no subscription". No back button, no close X.
**Microcopy:** Under the card: "One-time payment at a secure checkout. No subscription." Skip link: "No thanks, take me to the app". Events: `upsell_view`, `upsell_accept` (+ `checkout_click` with plan `addon`), `upsell_decline`, `purchase_complete` with plan `addon`, `checkout_decline` with plan `addon`. The CTA carries no price while the price is a token.
**CTA:** Add to my plan

---

## G. Payoff

### 18. Get the app
**Purpose:** Hand a paying user straight to the CoinIdentify app, where the full report (value range, grade, error check) and the collection live.
**Headline A:** You're in
**Headline B:** Your report is ready
**Body A:** Your full report is waiting in the CoinIdentify app.
**Body B:** Download CoinIdentify and log in to open it.
**Visual:** A success check in a glowing well, three numbered steps (Download CoinIdentify: Coin Scanner · Log in with {{email}} · Open your report), "Open the app" CTA, and black App Store / Google Play badges that look like the official ones. If they bought the add-on, a green line "Error & Variety Deep Check added. It opens in the app." sits above the steps.
**Microcopy:** "Values are estimates, not appraisals. Cancel anytime in your account." App links are pending (`CONFIG.appUrl` / `appUrlAndroid` empty → toast "App link coming soon"). Reached only after purchase (or a return with `?paid=1`, which lands on the add-on screen); there is no free path to it.
**CTA:** Open the app

---

## Notes

**CoinIn (competitor) web funnel (reference teardown, AdSpyLab capture of `funnel.coininapp.com/coin-cio-black-better-c-ww`, ~1.5K ads, Sep 2026).** Its 20 captured screens run: welcome ("Identify 330,000+ coins · 6M+ user's choice · 4.5 rating") → "Are you ready to become rich with CoinIn? 💰" → 6 single-select attitude questions ("Do you know some coins can be worth thousands?", "Ever thought about selling coins for profit?") → "Over 6 million collectors trust CoinIn" → a live counter ("Right now, 43,598 users are scanning") → **3 "Your turn to guess" true/false screens** ("Could this 1972 Eisenhower Dollar be worth a $12,000 payday?") → secure-marketplace question → "What would you do if a coin was worth $10,000?" → testimonial ("scanned it… worth $6,000… sold on the CoinIn marketplace with zero commission") → one-app question → loader "Tailoring your CoinIn experience" → email gate "Never lose access to your coins collection" → long paywall. There is **no scan before paying**. coininapp.com also offers a web photo upload (front → back → identify) with the same four capture tips used on screen 10.

**What we took from CoinIn (competitor):** a short self-identifying quiz, the two-sided capture tips, the "never lose your collection" gate framing, and a paywall FAQ that includes "How do I cancel?".

**Reference only. Do not implement (FTC / deceptive-pricing exposure, and CoinIn's own reviews show the cost):**
- The paywall opens with a **04:55 "TRY NOW!" countdown** and **struck-through anchor prices** (€39.99 → €15.99, €201 → €99.99) with no evidence those prices were ever charged.
- The headline plan is **"PREMIUM FOR 3 DAYS — BEST — €1.99"**, but the fine print under the button reads **"Trial for $14.99, then $29.99 every payment period"**. The price in the fine print doesn't match the price on the card, and the "payment period" is never named.
- An older capture and the live `coininapp.com/subscription-list` show a **paid "1-Week Trial" at $12.99 that auto-renews at $39.99 every 4 weeks**, a "4-Week Plan" at $19.99 then $39.99/4 weeks, and a 12-week plan at $79.99 then $99.99/12 weeks. That's the low-entry-price-into-a-much-higher-recurring-charge pattern.
- Third-party review roundups report users charged during "free" trials, moved from annual to weekly without consent, and unable to cancel.
- **"Become rich"** framing and dollar-figure true/false guesses on common dates. Most 1972/1976/1974 Eisenhower dollars trade near face value, and only specific varieties or top grades bring large sums, so this sets expectations the scan will disappoint.
- A **fake live user counter**, and testimonials built around atypical windfalls ($4,200–$10,000) with no typicality disclosure (an FTC Endorsement Guides issue).
- The email gate says the email is "not stored on our server" while creating an account.

This funnel replaces each of these: the renewal price sits next to every plan price and in the fine print, no trial, no timer, no strike prices, no dollar figures before the user's own result, and no reviews until CoinIdentify has real ones. **Policy (2026-10-07):** CoinIdentify plan prices are set by the owner (app-rules.md); the 1-week plan's renewal every 4 weeks is stated on the card and in the renewal line, so the low entry price never hides the recurring charge. The 2026-09-30 last-chance offer is removed (no sale, no offer on decline).

**Comparable, CoinSnap (Next Vision Ltd):** screensdesign.com describes a near-passive onboarding straight into a 7-day free trial → annual soft paywall. Appllama lists 13 onboarding steps, but they're locked, so this is unverified. The category splits between "paywall first" (CoinSnap) and "long web quiz, no scan" (CoinIn web). This brief tests a third option: **scan first, gate the value**.

**Blocks deliberately skipped:**
- Name capture: the subject is a coin, and `{{coin_name}}` comes from the scan.
- Notification opt-in: there's no daily loop.
- Gamified wheel: a spin next to money expectations reads as a casino. The mini-game on screen 8 is educational instead.
- Social sign-in and "Maybe later" on the gate: removed (email-only, mandatory, per app-rules.md).
- Last-chance offer and the free full-card screen: removed 2026-10-07 (hard paywall, no free path; the full card lives in the app).

**Screens map (2026-10-07 rework):** 1-14 unchanged in order (9 changed from a CoinIn rating screen to honest product facts) · 15 save-to-collection (Apple/Google/email, skippable) → mandatory email · 16 soft paywall (weekly/annual, close X) → hard paywall (3 plans) · 17 last-chance offer → add-on upsell · 18 free/paid full coin card → get the app.

**Drop-off risk:**
- The scan (10–12). The sample-coin path and photo checks exist for this. Track the scan success rate (a match at or above the confidence threshold) as its own metric.
- The mandatory email gate (15) and the hard paywall (16): there is no free exit, so watch the email → paywall → checkout rates closely.

**Monetization and measurement:** subscription conversion **by plan** (1w / 4w / 12w share and conversion), add-on attach rate (`upsell_accept` → `purchase_complete` addon ÷ main purchases), checkout decline rate per plan, first-scan success, app install and login rate from get_app, refund rate, and D7 second-scan rate in the app.

**First A/B test:** scan-before-paywall (this brief) vs. the paywall right after screen 9 (CoinSnap-style), measured to D7 net revenue after refunds, not just initial conversion.

**Pending before launch:**
- Add-on name and price (`{{addon_price}}`) and its Paddle price IDs; Paddle price IDs for `1w`, `4w`, `12w`.
- Support email (`{{support_email}}`) and legal entity (`{{legal_entity}}`).
- App links: `CONFIG.appUrl` / `appUrlAndroid` (Adjust web2app link) and store URLs.
- Real images: licensed reference photos for screen 8 (the doubled-die crop is drawn) and real sample coins; the jar, cloth and coin photos are AI-generated illustrations.
- A verified CoinIdentify rating and reviews before any proof block is shown.
- Grade/error-check coverage per coin group (the in-app report must degrade gracefully when there's no variety data).
