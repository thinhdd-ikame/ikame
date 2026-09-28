---
niche: coinin
display_name: Coinin (Coin Scanner / Identifier)
archetype: scanner-identifier
subject: coin
input: 4 quick collector answers + 2 photos of one real coin (front and back)
output: coin ID card (name, year, country, mint, metal) free; value range by grade, condition grade and error check behind the paywall
screens: 17
monetization: soft subscription paywall after the first scan (weekly / annual pre-selected, optional clearly disclosed free trial); marketplace and expert help not monetized in this funnel
creative_screens:
  hook-a: 1
  hook-b: 2
  spot-error: 8
  reveal: 13
motion: >
  a worn silver coin slowly tilting in 3D under a gold scanning ring, then
  flipping from front to back as an ID card slides up with year and mint
---

# Funnel Content — Coinin (Coin Scanner / Identifier)

Coinin is a coin identifier. The user photographs a coin, AI names it (country, year, mint, metal), estimates its condition grade and a market value range, checks for known errors and varieties, and saves it to a collection. The app also has a buy/sell marketplace with in-app chat, and per the brief, expert help. This is an **in-app onboarding** funnel, not a web quiz. The key difference from the real CoinIn web funnel is that the user **scans their own coin before the paywall**. They see what the coin *is* for free, and the paywall sells what it's *worth* (value range, grade, error check), plus unlimited scans and the collection. No registered archetype fits. **ai-transformation** half-fits: one asset in, AI output, a gate before the result. But the output is *information about the object*, not a new image, so accuracy and honesty carry the funnel, not novelty. **diagnostic-utility** half-fits the monetization (a utility subscription), but there's no self-assessment score. This is the "utility/scanner" shape the registry expects, so it's proposed as a new archetype, **scanner-identifier** (Notes). There are 17 screens. **Verified** (App Store US, coininapp.com, AdSpyLab capture of `funnel.coininapp.com`, Sep 2026): 270,000+ coins in the database per the App Store (the web funnel says 330,000+), identification plus condition, rare/foreign/error coins, the collection, the buy/sell marketplace with chats (v1.39.0), 4.7★ from 101K ratings, iOS IAP ranges (weekly $8.99–$17.99, "Premium Access" $7.99–$49.99, "Premium Pro Access" $15.99), and the web plan structure (Notes). **Not verified:** the in-app onboarding screens, what expert help costs, what "Premium Pro" adds, and where the value data comes from. So the brief lists plan *structure* rather than exact in-app prices, and never claims a data source. The look departs from the house purple/pink: charcoal background, antique-gold accents, a serif display face for coin names, and real macro coin photography. The audience is collectors and heirs, and it should feel like a museum label, not a slot machine. All values are framed as **estimates**, never as "your coin is worth $X".

---

## A. Hook

### 1. Hook A — The coin jar
**Purpose:** Name the everyday "before" state (a jar, a drawer, an inherited album of unknown coins) and promise an instant answer before asking for anything.
**Headline A:** What's in your coin jar?
**Headline B:** That old coin might matter
**Body A:** Snap a photo and know it in seconds.
**Body B:** Identify any coin and see its estimated value.
**Visual:** Charcoal background, overhead macro photo of a glass jar tipped over with mixed worn coins spilling out, one coin in focus with a thin gold ring around it. Small "4.7★ App Store" badge top bar. Gold CTA pinned at the bottom.
**Microcopy:** Under CTA: "By continuing you agree to our Terms · Privacy"
**CTA:** Get started

### 2. Hook B — The product in one glance
**Purpose:** Show the output (one photo becomes a full ID card) so the user knows exactly what the scan returns.
**Headline A:** One photo, the full story
**Headline B:** Scan it. Know it. Keep it.
**Body A:** Name, year, mint, grade and value estimate on one card.
**Body B:** 270,000+ coins recognized, from pennies to ancient silver.
**Visual:** Phone mockup: camera circle around a coin → an arrow → a coin card (serif coin name, year · mint · metal rows, a grade chip, a value range bar with no numbers). 3D tilt only on the coin itself; everything else fades in flat.
**Microcopy:** Database number must match screen 13 and the store listing. Use one figure everywhere (App Store: 270,000+).
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
**Field:** Single select, auto-advance on tap. Other opens a one-line input.
**Visual:** Thin gold progress bar (1/5), stacked full-width dark pills with a gold border, selected pill fills gold with dark text.
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
**Body A:** Pick all that apply — mixed is fine.
**Body B:** Helps us pick examples you'll recognize.
**Options:**
- 🇺🇸 US coins
- 🌍 World coins
- 🏛️ Ancient coins
- 🥈 Silver & gold
- 🤷 Not sure
- ✏️ Other
**Field:** Multi-select, CTA gated on ≥1 pick. "Not sure" deselects the others.
**Visual:** Pills with a small real-coin thumbnail in place of emoji where art exists (Lincoln cent, euro, denarius, silver eagle), progress 3/5.
**CTA:** Continue

### 7. Q4 — Experience level
**Purpose:** Low-effort tap that lets the result screen explain jargon for beginners. It also flags pros and dealers, who convert to annual.
**Headline A:** How much do you know?
**Headline B:** Your coin experience?
**Body A:** No wrong answer — we'll explain the jargon.
**Body B:** Beginners and pros both welcome here.
**Options:**
- 🌱 Complete beginner
- 📘 Know the basics
- 🏅 Serious collector
- 💼 Dealer or pro
**Field:** Single select, auto-advance.
**Visual:** Four large cards (cards variant), each with a gold line icon, progress 4/5.
**CTA:** (auto-advances on select)

### 8. Spot the rare one — mini game
**Purpose:** An interactive teaching beat. It shows *why* a scan beats eyeballing (tiny details decide value) without promising the user's coin is a jackpot. It's the honest replacement for CoinIn's "could this be worth $12,000?" true/false screens.
**Headline A:** Spot the rare one
**Headline B:** Which penny is special?
**Body A:** Tiny details can change what a coin is.
**Body B:** Look closely at the letters.
**Options:**
- 🅰️ Coin A
- 🅱️ Coin B
**Field:** Two tappable coin close-ups side by side (for US picks: a normal 1955 Lincoln cent vs. the 1955 doubled-die obverse; for world/ancient picks, swap in a documented variety from that group). Either tap flips to the answer.
**Visual:** Two macro coin crops on charcoal, a magnifier loupe over the date and lettering. After the tap, a gold outline circles the doubled letters on Coin B and the other coin dims. Progress 5/5.
**Microcopy:** Answer reveal (both taps): "Coin B — doubled letters, a famous error." · "A scan checks details like this for you." Use licensed reference photos only, and put **no dollar figure** on this screen.
**CTA:** Continue

---

## C. Trust

### 9. Social proof — before the camera ask
**Purpose:** The camera permission and a real scan are the highest-friction steps. A borrowed-trust beat goes right before them.
**Headline A:** 4.7★ from 101K ratings
**Headline B:** Loved by coin collectors
**Body A:** Used to sort jars, albums and family collections.
**Body B:** Join collectors scanning their coins every day.
**Visual:** Charcoal background, large gold "4.7" with a 5-star row, laurel sprigs, one quote card beneath, a faint coin-edge pattern at the bottom.
**Microcopy:**
- Quote card: a **verbatim, real App Store review** chosen by the team (stars · first line · "App Store user"). Pick one about ease or identification, **not** one about a coin's dollar value.
- Stat source (small, grey): "App Store, US · {{rating_date}}". Refresh it before launch. If ikame ships this funnel on a listing other than CoinIn's, use that listing's own numbers.
**CTA:** Continue

---

## D. Scan (asset input + anticipation)

### 10. Camera primer
**Purpose:** Pre-permission screen, so the iOS/Android camera prompt comes with a reason. It also teaches the four capture rules that decide scan success, and gives a no-coin escape so users without a coin don't drop.
**Headline A:** Let's scan your first coin
**Headline B:** Grab a coin nearby
**Body A:** Allow camera access so we can see it.
**Body B:** Any coin works — even one from your pocket.
**Visual:** Hand placing a coin on a plain dark cloth, four tip chips in a row with line icons, gold verb CTA, skip link under it.
**Microcopy:** Tip chips: "One coin · Good light · Flat surface · Fill the circle"
**Skip link:** "No coin handy? Try a sample coin" → runs screens 13-14 with a sample coin matched to the Q3 picks
**CTA:** Open camera

### 11. Scan the front
**Purpose:** The core input. Auto-capture and live quality hints keep failed scans (the main source of "it doesn't work" reviews) low.
**Headline A:** Front side first
**Headline B:** Show us the face
**Body A:** Center the coin in the circle and hold steady.
**Body B:** Lay it flat on a plain surface.
**Field:** Live viewfinder with a circular guide, auto-capture when sharp and centered, manual shutter, flash toggle, "Upload from photos" link.
**Value line:** "Step 1 of 2 · Two sides = a sharper match"
**Visual:** Full-bleed camera, darkened mask outside a gold circle, the circle turns solid gold when the coin is locked, a small quality chip at the top.
**Error states:**
- "Too dark — find more light."
- "A bit blurry — hold still."
- "One coin at a time, please."
- "Move closer — fill the circle."
**CTA:** SCAN FRONT

### 12. Scan the back
**Purpose:** The second side confirms the variety and the date or mint details. It's the last input before the payoff.
**Headline A:** Now flip it over
**Headline B:** One more side
**Body A:** The back helps confirm the exact variety.
**Body B:** Two sides make the match more accurate.
**Field:** Same viewfinder. A thumbnail of the captured front sits in the corner with a retake option.
**Value line:** "Step 2 of 2"
**Visual:** As screen 11, with a small flip animation on the corner thumbnail when the screen opens.
**Error states:** Same four as screen 11.
**Skip link:** "Skip — use the front only" (small, grey; the result shows lower confidence)
**CTA:** IDENTIFY COIN

### 13. Identifying
**Purpose:** Manufacture the wait around the user's *own* coin, and the best ad-creative screen in the funnel. The real API call runs underneath it. Advance when the result is back, with a ~5 s minimum, and never pad a finished result beyond that.
**Headline A:** Identifying your coin…
**Headline B:** Checking 270,000+ coins…
**Steps:**
1. Reading the design and lettering… (0→100%, ✓)
2. Matching the year and mint mark… (0→100%, ✓)
3. Checking known errors and varieties… (0→100%, ✓)
4. Your coin card is almost ready… (0→100%, ✓)
**Visual:** The user's front photo fills the top half and tilts slowly in 3D (the only 3D element in the funnel), with a gold scanning ring sweeping around its rim. Four stacked rows beneath: label left, % right, check when done, thin gold bar.
**Microcopy:** Under headline: "Two sides scanned · Usually under 10 seconds" (only if true for the real API; otherwise "Two sides scanned")
**CTA:** (auto-advances when the result returns, minimum ~5 seconds)

### 14. Your coin — identity reveal (free)
**Purpose:** Deliver real value free: *what* the coin is. That proves the scanner works and makes the gated part, *what it's worth*, feel one tap away. The locked cards must tease the category, never a number.
**Headline A:** It's a {{coin_name}}
**Headline B:** We found your coin
**Body A:** {{country}} · {{year}} · {{mint}} · {{metal}}
**Body B:** Value and grade are one tap away.
**Visual:** Coin card with both captured photos side by side, coin name in serif, fact rows (country, year, mint, metal, denomination). Below, three blurred locked cards with a gold lock icon: "Estimated value range", "Condition grade", "Errors & varieties check". The blur is neutral grey, with no fake "$$,$$$" silhouettes.
**Microcopy:**
- Confidence line: "Match confidence: {{confidence}}" + link "Not right? See other matches" (top 3 alternatives)
- Beginner tooltip (Q4 = beginner): tap "mint" → "Where the coin was made — a tiny letter."
- No-match state: headline "We couldn't match this one yet" · body "Try brighter light and a plain background." · buttons "Retake photos" / "Try a sample coin"
**CTA:** See value & grade

---

## E. Gate

### 15. Save to collection
**Purpose:** Capture identity at the moment the user owns something worth keeping (their first scanned coin), framed as backing up the collection. It borrows CoinIn's strongest real gate line, "never lose your collection".
**Headline A:** Save it to your collection
**Headline B:** Keep your scans safe
**Body A:** Your coins, backed up and synced across devices.
**Body B:** Sign in so your collection is never lost.
**Field:** Sign in with Apple · Continue with Google · Email (email keyboard, autofocus off).
**Visual:** The coin card from screen 14 shrinks into the first slot of an empty collection grid (other slots dashed), with sign-in buttons stacked below.
**Error states:**
- "Please enter a valid email."
- "Sign-in didn't work. Try again."
**Microcopy:** Legal line: "By continuing you agree to our Terms · Privacy." · "We never sell your email."
**Skip link:** "Maybe later" (the coin stays saved on this device. Account-free use has to stay possible under App Store guideline 5.1.1.)
**CTA:** Save coin

---

## F. Monetization

### 16. Paywall
**Purpose:** Sell what's still locked on *their* coin (value range, grade, error check), then the ongoing tools (unlimited scans, the collection). Renewal price and terms are stated in plain type at the same size as the plan.
**Headline A:** See what it's worth
**Headline B:** Unlock your {{coin_name}}'s story
**Body A:** Value range, grade and error check for every scan.
**Body B:** Unlimited scans, values and your whole collection.
**Plans:** Structure only. The real iOS IAP list shows weekly tiers ($8.99–$17.99) and "Premium Access" tiers ($7.99–$49.99), but which is annual isn't verified. Fill in real store prices at build.
- Weekly: price per week, billed weekly.
- **Annual: pre-selected**, badge "BEST VALUE". The saving is computed honestly against 52× weekly, with the per-week equivalent shown small beside the full annual price. The full annual price is always the larger number.
- Optional third card (monthly) only if that IAP exists. No invented "was" prices.
- Free trial (only if the business runs one): a labeled toggle **off by default** on the annual card only: "Start with {{trial_days}}-day free trial".
**Visual:** Top: the user's coin card with the three locked rows now glowing gold as "unlocking". Below: 2 stacked plan cards (selected = gold border and filled radio), one full-width gold CTA, a feature checklist, one real review card, an FAQ accordion. Close ✕ visible top-left from load (soft paywall).
**Microcopy:**
- Under the selected plan, same size as the plan name: "{{price}} per {{period}}. Renews automatically until you cancel."
- If the trial toggle is on: "Free for {{trial_days}} days, then {{price}}/{{period}} from {{charge_date}}." Add "We'll remind you before you're charged" only if the reminder is actually built.
- Trust row: "Cancel anytime in Settings · Secure payment via App Store / Google Play"
- Feature checklist, ordered by Q2 picks, only shipped features: "Unlimited coin scans" · "Value range by condition" · "Condition grade estimate" · "Error & variety check" · "Collection tracker" · "Coin history & facts". Add "Expert help" only if Premium includes it.
- Value disclaimer (small): "Values are estimates, not appraisals or purchase offers."
- FAQ: What's included? · How is value estimated? · How do I cancel? · Can I use it for free?
- Footer: Restore purchases · Terms · Privacy
- Q2-segmented headline A variants: 💰 → "See what it's worth" · 🔍 → "Check it for rare errors" · 🗂️ → "Build your coin collection" · 🤝 → "Know its value before selling"
**Fallback offer:** ✕ goes back to the app on the free tier (identify only). If a second offer is wanted, show one bottom sheet, once: annual with the trial toggle and the same disclosure lines. No timer, no "offer expires", no new plans.
**CTA:** Unlock full value (reads "Start free trial" when the trial toggle is on)

---

## G. Payoff

### 17. Full coin card
**Purpose:** Pay off the purchase immediately on the coin they already scanned, then open the loop: the next scan and the collection. Retention is a second scan, not a one-shot reveal.
**Headline A:** Your {{coin_name}}, fully decoded
**Headline B:** Here's what it could fetch
**Body A:** Estimated range by condition — grade moves it most.
**Body B:** Condition, errors and history — all in one card.
**Visual:** Expanded coin card: the value range bar by grade with the user's estimated grade marked ("Looks like: {{grade}}"), an error check row (✓ "No known errors found" or ⚠️ "Possible {{variety}} — check with a loupe"), a 2-line history snippet, an "Add to collection" primary action and "Scan next coin" pinned below. The collection counter ticks to "1 coin". Simple fade-ins, no 3D.
**Microcopy:**
- Under the range: "Estimate only. For possibly valuable coins, get a professional grade before selling."
- Beginner (Q4) tooltip on the grade chip: "Grade = how worn the coin is."
- Share row: "Share this coin" (image of the card, no price shown by default)
- Rating prompt: not here. Ask after the second successful scan.
**CTA:** Scan next coin

---

## Notes

**Real CoinIn web funnel (reference teardown, AdSpyLab capture of `funnel.coininapp.com/coin-cio-black-better-c-ww`, ~1.5K ads, Sep 2026).** Its 20 captured screens run: welcome ("Identify 330,000+ coins · 6M+ user's choice · 4.5 rating") → "Are you ready to become rich with CoinIn? 💰" → 6 single-select attitude questions ("Do you know some coins can be worth thousands?", "Ever thought about selling coins for profit?") → "Over 6 million collectors trust CoinIn" → a live counter ("Right now, 43,598 users are scanning") → **3 "Your turn to guess" true/false screens** ("Could this 1972 Eisenhower Dollar be worth a $12,000 payday?") → secure-marketplace question → "What would you do if a coin was worth $10,000?" → testimonial ("scanned it… worth $6,000… sold on the CoinIn marketplace with zero commission") → one-app question → loader "Tailoring your CoinIn experience" → email gate "Never lose access to your coins collection" → long paywall. There is **no scan before paying**. coininapp.com also offers a web photo upload (front → back → identify) with the same four capture tips used on screen 10.

**What we took:** a short self-identifying quiz, the two-sided capture tips, the "never lose your collection" gate framing, and a paywall FAQ that includes "How do I cancel?".

**Reference only. Do not implement (FTC / deceptive-pricing exposure, and CoinIn's own reviews show the cost):**
- The paywall opens with a **04:55 "TRY NOW!" countdown** and **struck-through anchor prices** (€39.99 → €15.99, €201 → €99.99) with no evidence those prices were ever charged.
- The headline plan is **"PREMIUM FOR 3 DAYS — BEST — €1.99"**, but the fine print under the button reads **"Trial for $14.99, then $29.99 every payment period"**. The price in the fine print doesn't match the price on the card, and the "payment period" is never named.
- An older capture and the live `coininapp.com/subscription-list` show a **paid "1-Week Trial" at $12.99 that auto-renews at $39.99 every 4 weeks**, a "4-Week Plan" at $19.99 then $39.99/4 weeks, and a 12-week plan at $79.99 then $99.99/12 weeks. That's the low-entry-price-into-a-much-higher-recurring-charge pattern.
- Third-party review roundups report users charged during "free" trials, moved from annual to weekly without consent, and unable to cancel.
- **"Become rich"** framing and dollar-figure true/false guesses on common dates. Most 1972/1976/1974 Eisenhower dollars trade near face value, and only specific varieties or top grades bring large sums, so this sets expectations the scan will disappoint.
- A **fake live user counter**, and testimonials built around atypical windfalls ($4,200–$10,000) with no typicality disclosure (an FTC Endorsement Guides issue).
- The email gate says the email is "not stored on our server" while creating an account.

ikame's funnel replaces each of these: renewal price at plan size, trial off by default with the charge date, no timer, no strike prices, no dollar figures before the user's own result, and real reviews only.

**Comparable, CoinSnap (Next Vision Ltd):** screensdesign.com describes a near-passive onboarding straight into a 7-day free trial → annual soft paywall, with premium content clearly marked. Appllama lists 13 onboarding steps, but they're locked, so this is unverified. The category splits between "paywall first" (CoinSnap) and "long web quiz, no scan" (CoinIn web). This brief deliberately tests a third option: **scan first, gate the value**.

**Blocks deliberately skipped:**
- Name capture: the subject is a coin, and `{{coin_name}}` comes from the scan.
- Notification opt-in: there's no daily loop. Revisit for marketplace chat messages after install.
- Gamified wheel: a spin next to money expectations reads as a casino. The mini-game on screen 8 is educational instead.
- Post-purchase upsell: "Premium Pro Access" ($15.99 on iOS) exists, but its contents are unverified. Specify it once known.
- Secondary revenue: the marketplace is advertised as commission-free, and expert-help pricing is unknown.

**Drop-off risk:**
- The camera permission (10) and scan quality (11–12). The sample-coin path and live quality hints exist for this. Track the scan success rate (a match at or above the confidence threshold) as its own metric.
- The account gate (15) is skippable by design.

**Monetization:** one layer, the subscription. Measure first-scan success, paywall conversion, trial-to-paid, refund rate, and the D7 second-scan rate separately.

**First A/B test:** scan-before-paywall (this brief) vs. the paywall right after screen 9 (CoinSnap-style), measured to D7 net revenue after refunds, not just initial conversion. **Second test:** account gate before vs. after the paywall.

**Verify before build:**
- Real in-app plan periods and prices.
- Whether a free trial exists.
- Whether expert help is inside Premium.
- Grade/error-check coverage per coin group (screen 17 must degrade gracefully when there's no variety data).
- Licensed reference photos for screen 8.
- One database figure everywhere (App Store 270,000+ vs. web 330,000+).
