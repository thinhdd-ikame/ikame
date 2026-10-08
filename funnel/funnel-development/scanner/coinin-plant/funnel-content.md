---
niche: coinin-plant
display_name: CoinIdentify Plant (Persona Web Funnel, Plant Care Check)
archetype: scanner-identifier
subject: plant
input: name, 4 quick plant answers, 2 guess-the-cause games, 2 photos of one plant (or a sample plant)
output: free plant ID card, a likely-cause indication and days 1 and 2 of a 7-day care plan; full cause check, days 3 to 7 and a watering and light schedule open in the CoinIdentify app after purchase
screens: 20
monetization: hard web paywall after a mandatory email gate; 3 plans 1w $12.99→$39.99/4w, 4w $14.99→$39.99/4w (pre-selected), 12w $39.99→$59.99/12w; no offer on decline; post-purchase one-time add-on (price pending) → get_app
offer: none
creative_screens:
  hook-a: 1
  hook-b: 2
  game: 9
  scan: 14
  reveal: 15
motion: >
  a drooping yellow-leafed houseplant on a dark wall while a green scan ring
  sweeps its leaves and a plant ID card with a care-plan checklist slides up
---

# Funnel Content — CoinIdentify Plant (Persona Web Funnel, Plant Care Check)

**2026-10-07:** rebranded to CoinIdentify: Coin Scanner and moved to the Starlyn-shape monetization (hard paywall, 3 plans, add-on upsell, get the app).

A web2app funnel for the CoinIdentify: Coin Scanner app's plant identifier and care guide, led by a persona host: **Fern**, an illustrated potted-sprout guide who talks the user through the flow. **Fern is clearly labeled "Illustrative guide, not a real botanist" on the hook and meet screens, in the paywall and in the footnote.** Fern has no credentials, no years-of-experience claim and gives no expert advice. The user answers four quick questions (which plant, watering, what looks wrong, light), plays two honest "spot the cause" games, **photographs one real plant (whole plant, then a close-up of the worrying leaf, or taps "Use a sample plant" when no plant or camera is at hand)** and gets a **free plant ID card, a likely-cause indication and days 1 and 2 of a 7-day care plan** before the mandatory email gate and a hard paywall. The paywall sells what is still locked on that plant (the full cause check, days 3 to 7, and a watering and light schedule), which opens in the CoinIdentify app after purchase. Archetype: `scanner-identifier`, web variant (20 screens, same flow as `scanner/coinin-collector`, which this folder forks; the plan spine of about 16 screens kept the 2 games and bridge so the persona flow stays comparable across the CoinIdentify family).

**Brand.** CoinIdentify: Coin Scanner (short: "CoinIdentify") on every screen, by the owner's rule that all `scanner/coinin*` funnels carry it, including this plant niche. The folder name still says `coinin`. Research context: PlantIn (`coursiv-coinin.md` section 7) runs on the same funnel template as CoinIn (competitor).

**Reference funnel:** PlantIn pre-lander and 14-screen funnel (AdSpyLab capture, research section 7 of `coursiv-coinin.md`) plus `funnel.coininapp.com` (CoinIn (competitor), the coin version the sibling folder models). Unverified in this brief: PlantIn's exact copy and the real plant-ID and diagnosis data source. **Deliberate differences from the reference:** a free plant ID card, likely cause and plan days 1 and 2 on screen 15, before the email gate and paywall; a persona labeled as illustrative; games with real, hedged answers; no countdown, no struck anchor prices, no live counter; **the diagnosis is an indication, never expert advice**; **no pesticide or toxicity safety claims, only "check the product label or ask a professional"**. **Palette:** charcoal ground with a leaf-green accent in place of the coin funnel's antique gold; serif display for plant names (Latin names read well in it). **Reuse:** the niche data (host, Q1 to Q4 options, samples, likely causes with 7-day plans, games, level names) sits in one `COLLECT` block in the demo; the screen copy was rewritten for plants, not swapped by data alone.

---

## A. Hook (persona + expectation)

### 1. Hook — Why is my plant dying?
**Purpose:** Name the everyday "before" state (a houseplant going yellow and limp) in the host's voice and promise one clear answer.
**Headline A:** Why is my plant dying?
**Headline B:** Meet Fern, your plant guide
**Body A:** Fern helps you find out what it needs.
**Body B:** Photograph one plant and get a care check.
**Visual:** Charcoal ground. Top: a houseplant with drooping, yellowing leaves (`img/hero.jpg`), fading into the ground. Over it, Fern's illustrated avatar (a smiling potted sprout) in a speech bubble: "Let's find out what's wrong." Small chip under the avatar: "Illustrative guide, not a real botanist". Green CTA pinned bottom.
**Microcopy:** Under CTA: "By continuing you agree to our Terms of Use and Privacy Policy. Results are an indication, not expert advice." Terms and Privacy are real underlined links (https://squad-xteam.com/termofuse.html, https://squad-xteam.com/policy.html).
**CTA:** Let's check

### 2. Meet Fern — how this works
**Purpose:** Set the honest frame: what the guide is, the three steps, and that results are an indication, not a diagnosis.
**Headline A:** Here's how it works
**Headline B:** Three steps, one plant
**Body A:** Quick questions, one plant photo, your free care check.
**Body B:** Fern walks you through each step.
**Visual:** Fern avatar left with bubble "I'm an illustrated guide. I can't diagnose plants, but the scan can spot likely causes." Below: three numbered rows with line icons: "1 Answer a few questions", "2 Photograph your plant", "3 Get its care check". Chip: "An indication, not expert advice".
**Microcopy:** Avatar label: "Fern · illustrative guide". Persona rule for all later screens: Fern speaks in one short bubble per screen, never claims experience or credentials.
**CTA:** Continue

---

## B. Investment

### 3. Name
**Purpose:** Capture a first name so Fern can use it. Optional, with a fallback, so nobody stalls.
**Headline A:** What should Fern call you?
**Headline B:** First, your name
**Body A:** Just a first name or nickname.
**Body B:** It makes your plant card personal.
**Field:** Text input, max 20 characters, placeholder "Your first name". Skip link below. Empty or skipped: later screens say "you" / "friend".
**Visual:** Fern bubble: "Nice to meet you!" Name field on a dark card, green underline when focused.
**Skip link:** "Skip, call me friend"
**CTA:** Continue

### 4. Q1 — Which plant
**Purpose:** Cheap first tap. It picks the sample plant and Fern's tone on the bridge screen.
**Headline A:** Which plant is it?
**Headline B:** What are we checking?
**Body A:** Fern will pick examples to match.
**Body B:** Pick the closest match.
**Options:**
- 🪴 Leafy houseplant
- 🌵 Succulent or cactus
- 🌸 Flowering plant
- 🌿 Herb or veg
- ✏️ Other
**Field:** Single select, auto-advance on tap (Other opens a one-line input; CTA "Continue" disabled until text is typed).
**Visual:** Progress bar 1/4 in green, full-width dark pills with a green border, selected pill fills green.
**Error state:** Other chosen, field empty: CTA disabled, hint "Type a few words to continue."
**CTA:** (auto-advances on select; Continue for Other)

### 5. Q2 — Watering routine
**Purpose:** The strongest cause signal (too much or too little water) and an honest, judgment-free question.
**Headline A:** How often do you water?
**Headline B:** What's your water routine?
**Body A:** A rough guess is fine.
**Body B:** No schedule? That's okay.
**Options:**
- 💧 Every few days
- 🗓️ About weekly
- 😅 When I remember
- ❓ No set routine
**Field:** Single select, auto-advance.
**Visual:** As screen 4, progress 2/4. A small watering-can icon beside each pill.
**CTA:** (auto-advances on select)

### 6. Q3 — What do you see
**Purpose:** Multi-select symptoms. The first pick sets the likely cause and the paywall hero line.
**Headline A:** What do you see?
**Headline B:** What looks wrong?
**Body A:** Pick all that apply.
**Body B:** Mixed is fine.
**Options:**
- 🟡 Yellow leaves
- 🥀 Drooping or limp
- 🟤 Brown tips or spots
- 🐛 Pests or webbing
- ✏️ Other
**Field:** Multi-select, CTA disabled until at least one pick. If Other is picked its input must be non-empty. If only Other is picked, the cause shows as a neutral "Not sure yet" with a general check-the-basics plan.
**Visual:** Same pill list, check circle right, progress 3/4.
**Error state:** Other picked, field empty: CTA disabled, hint "Type a few words to continue."
**CTA:** Continue

### 7. Q4 — Light
**Purpose:** The second cause signal and an input for the locked watering and light schedule.
**Headline A:** How much light does it get?
**Headline B:** Where does it sit?
**Body A:** A rough guess is fine.
**Body B:** Your best guess is fine.
**Options:**
- ☀️ Direct sun
- 🌤️ Bright, indirect
- 🌥️ Low light
- ❓ Not sure
**Field:** Single select, auto-advance.
**Visual:** As screen 4, progress 4/4. A small window icon beside each pill.
**CTA:** (auto-advances on select)

### 8. Fern's bridge — many causes, similar signs
**Purpose:** Reassurance and one real teaching beat before the games. It shifts expectation from "one magic answer" to "look at the clues together".
**Headline A:** Many causes, similar signs
**Headline B:** Symptoms can mislead
**Body A:** Water, light and pests can look alike. Fern checks all three.
**Body B:** Two quick guesses, then your photo.
**Visual:** Fern bubble, personalized by Q1: leafy "Leaves give the first clues, {{name}}." · succulent "Succulents like to dry out between drinks." · flowering "Flowering plants can be fussy about light." · herb "Herbs love light and a regular trim." (other: "Every plant has its own rhythm."). Below, two drawn plants side by side: one with soft yellow leaves, one with crisp brown tips.
**Microcopy:** Line under the plants: "Same plant, different problems. Fern weighs the clues together."
**CTA:** Let's play

---

## C. Games (anticipation with real answers)

### 9. Game 1 — Which plant is overwatered?
**Purpose:** A short interactive teaching beat with a hedged, real answer. It replaces the reference funnel's dollar-figure style teasers.
**Headline A:** Which plant is overwatered?
**Headline B:** Spot the soggy one
**Body A:** Both look unhappy. Only one drank too much.
**Body B:** Tap the plant you think is too wet.
**Options:**
- 🟡 Soft yellow leaves
- 🟤 Crispy brown edges
**Field:** Two tappable drawn plants side by side. Either tap reveals the answer; no wrong-answer penalty. Score counts for the badge.
**Visual:** Two plants on charcoal, a magnifier on each. After the tap the yellow-leaved plant gets a green ring and the other dims.
**Microcopy:** Reveal: "Soft, yellow leaves often mean too much water. Crispy brown edges often mean too little." · "A scan looks at more clues for you."
**CTA:** Next

### 10. Game 2 — Which plant needs more light?
**Purpose:** A second hedged real-answer guess that rewards looking at stems and color, and plants the "light" reason to scan.
**Headline A:** Which plant needs more light?
**Headline B:** Spot the light-starved one
**Body A:** Both are the same kind of plant.
**Body B:** Look at the stems and the leaf color.
**Options:**
- 🪴 Long, pale stems
- 🪴 Compact, dark leaves
**Field:** Two tappable drawn plants; tap reveals. Score counts for the badge.
**Visual:** One tall plant with long pale stems and tiny leaves, one compact dark-green bush. After the tap the leggy plant gets a green ring.
**Microcopy:** Reveal: "Long, pale, stretched stems often mean the plant is reaching for light." · "The scan looks for clues like this in your photo."
**CTA:** Photo my plant

---

## D. Scan (asset input + anticipation)

### 11. Camera primer
**Purpose:** Pre-permission screen with a reason, four capture rules and the sample-plant escape so users without a plant or camera never drop.
**Headline A:** Grab your plant
**Headline B:** Let's photograph your plant
**Body A:** Any plant works, even a sad one.
**Body B:** Fern needs a clear look.
**Visual:** Fern bubble: "Natural light, leaves in focus." A potted plant on a windowsill (`img/window.jpg`), four tip chips in a row with line icons.
**Microcopy:** Tip chips: "One plant · Good light · Leaf close-up · Fill the frame". Privacy line: "Your photos are used to check this plant only." Skip link: "No plant handy? Use a sample plant".
**Skip link:** "Use a sample plant" runs the same flow with a sample matched to the Q1 pick.
**CTA:** Continue

### 12. Photo 1 — whole plant
**Purpose:** The core input. It takes a gallery upload or a camera shot with plain error messages, plus the sample-plant fallback.
**Headline A:** Whole plant first
**Headline B:** Show us the plant
**Body A:** Step back so the whole plant shows.
**Body B:** Natural light works best.
**Field:** Upload from gallery, Take a photo now (device camera), drag-and-drop. Preview with "Use this photo" and "Choose another". Link "Use a sample plant" always visible.
**Value line:** "Step 1 of 2 · Two photos give a sharper check"
**Visual:** Dashed green circle drop zone with a sprout outline. After upload the photo shows inside a round mask with a green ring.
**Error states:**
- "That file isn't a photo. Try a JPG or PNG."
- "That photo is over 15 MB. Try a smaller one."
- "We couldn't open that photo. Try another."
- "It looks dark. Plants read best in bright light." (warning, can continue)
**Skip link:** "Use a sample plant"
**CTA:** Use this photo

### 13. Photo 2 — close-up
**Purpose:** A close-up of the worrying leaf confirms spots, color and pests. It is the last input before the payoff.
**Headline A:** Now a close-up
**Headline B:** One more look
**Body A:** Show the leaf that worries you.
**Body B:** Close-ups reveal spots and pests.
**Field:** Same upload block. A thumbnail of the captured whole-plant photo sits in a corner. Link "Use a sample plant" and a small grey "Skip, whole plant only".
**Value line:** "Step 2 of 2"
**Visual:** As screen 12, with a corner thumbnail flip when the screen opens.
**Error states:** Same as screen 12.
**Skip link:** "Skip, whole plant only" (the card shows lower match confidence)
**CTA:** Check my plant

### 14. Checking
**Purpose:** Manufacture the wait around the user's own plant (best ad-creative screen). Advance only when the result is back, minimum ~5 seconds.
**Headline A:** Checking your plant…
**Headline B:** Reading your plant's leaves…
**Steps:**
1. Reading leaf shape and color… (0 to 100%, check)
2. Matching it to known plants… (0 to 100%, check)
3. Checking common care problems… (0 to 100%, check)
4. Fern is preparing your plan… (0 to 100%, check)
**Visual:** The user's whole-plant photo (or the sample plant) fills a round frame, tilts slowly in 3D (the only 3D in the funnel) with a green scanning ring sweeping its rim. Four rows beneath: label, percent, check, green bar.
**Microcopy:** Under headline: "Photos received". Visible demo note on screens 14, 15, 20 and the paywall hero: "Demo only: this prototype can't identify real photos, so it shows a sample result." (prototype only, not shipped copy)
**CTA:** (auto-advances when the result returns, minimum ~5 seconds)

### 15. Your plant — free ID card and likely cause
**Purpose:** Deliver real value free: what the plant is, the likely cause and the first two days of the plan. Proves the scan works and makes the locked part feel one tap away. Locked rows tease the category, never a promise.
**Headline A:** It's a {{plant_name}}
**Headline B:** We found your plant
**Body A:** Likely cause: {{issue}}.
**Body B:** Care plan days 1 and 2 are free.
**Visual:** Plant card with the captured photos side by side, plant name in serif, fact rows (common name, family, native to, light, water). Below, a "Your 7-day plan · days 1 and 2 free" card with Day 1 and Day 2 steps, then three locked rows with a green lock: "Care plan, days 3 to 7", "Full cause check", "Watering and light schedule". Fern bubble: "Here's your plant, {{name}}."
**Microcopy:** "Match confidence: {{confidence}}" with link "Not right? Try another photo." Chip "Sample data" under the card (prototype only). Under the plan: "An indication from your photos, not expert advice." No-match state: headline "We couldn't match this one yet" · body "Try brighter light and a plain background." · buttons "Retake photos" / "Use a sample plant".
**CTA:** See my badge

### 16. Plant parent level badge
**Purpose:** A personalized free reward built only from the user's own answers and game score, so the paywall hero can speak to them. It is a fun label, never a diagnosis.
**Headline A:** You're a {{level}}
**Headline B:** Your plant parent level
**Body A:** Based on your answers and your two guesses.
**Body B:** A fun badge, not a diagnosis.
**Visual:** A green badge medallion with the level name and four small stars showing level (1 to 4), the user's name under it, Fern bubble with one line tied to the level. Level names: Seedling, Sprout, Green Thumb, Leaf Keeper.
**Microcopy:** Level rule (shown in the panel footnote): points from knowing the light and the water routine (Q2, Q4), more than one symptom (Q3) and the two game answers; no outcome is promised for the level. Share row: "Share my badge" (image of the badge only).
**CTA:** Save my plan

---

## E. Gate

### 17. Email gate
**Purpose:** Mandatory email right before the paywall, framed as saving the plan and plant. The email is how the app finds the purchase.
**Headline A:** Where should Fern send it?
**Headline B:** Save your plant card
**Body A:** Get your care plan and keep your scans safe.
**Body B:** One email, no spam.
**Field:** One email input (email keyboard), validated, required. No skip, guest, Google or Apple option. Optional marketing consent checkbox (off). On submit emit `lead` with the email (FunnelFox fills the checkout email).
**Visual:** The plant card from screen 15 shrinks into the first slot of an empty plant grid (other slots dashed), email field beneath.
**Error state:** "Enter a valid email address."
**Microcopy:** "By continuing you agree to our Terms of Use and Privacy Policy. We never sell your email." (real links)
**CTA:** Continue

---

## F. Monetization

### 18. Paywall
**Purpose:** Hard web paywall: a long sales page selling what is still locked on their plant (full cause check, days 3 to 7, watering and light schedule), then the ongoing tools. No close X, no free path. Renewal shown at the same size as the price.
**Headline A:** Plan for the {{symptom}}
**Headline B:** Save your {{plant_name}}
**Body A:** Full cause check and a care plan, for every scan.
**Body B:** Check unlimited plants and track them in one place.
**Plans:** Three plans, `4w` pre-selected with the badge "Recommended". Each card shows its price and a small line "then {{renewal}} / {{period}}".
- `1w` "1 week" · "Intro week": **$12.99** today, then **$39.99 every 4 weeks** (it renews every 4 weeks, not weekly).
- `4w` "4 weeks" · Recommended: **$14.99** today, then **$39.99 every 4 weeks**.
- `12w` "12 weeks" · "Lowest per week": **$39.99** today, then **$59.99 every 12 weeks**.
**Visual:** Sticky brand bar ("CoinIdentify", mini CTA after scrolling, **no close X**). Hero: the user's plant card (photo, name, level) with three locked rows glowing green. The hero headline uses the first symptom picked ("Plan for the yellow leaves", "...the drooping", "...the brown tips", "...the pests"); default "Get your full care plan". Plan block. "What's inside" list (pest check first if the user picked pests). "How it works" (3 steps). Proof block (rating and reviews, hidden while tokens are unset). Guarantee seal (hidden while the refund-days token is unset). FAQ. Plan block repeated. Sticky bottom bar (plan name, "$14.99 today", CTA) shows from the first view whenever no plan-block CTA is on screen, so a CTA and today's price are visible at 375×667 and 430×932.
**Microcopy:**
- Renewal line under the CTA, per selected plan: "$12.99 today for your first week, then $39.99 every 4 weeks until you cancel." · "$14.99 today for your first 4 weeks, then $39.99 every 4 weeks until you cancel." · "$39.99 today for your first 12 weeks, then $59.99 every 12 weeks until you cancel."
- What's inside: "Full cause check" · "Care plan, days 3 to 7" · "Watering and light schedule" · "Pest and leaf check" · "Unlimited plant scans" · "Plant tracker".
- How it works: Checkout ("Secure payment, takes a few seconds.") → Get the app ("Download CoinIdentify: Coin Scanner from the App Store or Google Play.") → Open your report ("Log in with your email. Your scan is saved there.").
- Fern line near the hero: "Fern is an illustrated guide, not a botanist."
- Disclaimer (footer): "Results are an indication from your photos, not expert advice. For sprays or toxicity questions, check the product label or ask a professional." Legal entity hidden while `{{legal_entity}}` is unset.
- FAQ: When do I get my report? ("Right after checkout, in the CoinIdentify: Coin Scanner app. Log in with {{email}}. Your scan is saved there.") · What's included? · Is this a diagnosis? ("No. It is an indication from your photos, not expert advice.") · What about sprays or toxic plants? ("Fern gives no safety advice. Check the product label or ask a professional.") · How do I cancel? (account settings or `{{support_email}}`) · Will I be charged again? ("Yes, unless you cancel. The 1-week and 4-week plans renew at $39.99 every 4 weeks. The 12-week plan renews at $59.99 every 12 weeks.") · Is Fern a real person? ("No. Fern is an illustrated guide, not a botanist.")
- Footer: Terms of Use · Privacy Policy · Subscription terms (squad-xteam links).
- No "continue free", "maybe later" or close link. Closing the plan checkout without paying stays on the paywall.
**CTA:** Unlock my plan

### 19. Add-on upsell — 30-day recovery plan
**Purpose:** Right after the plan purchase, offer one add-on for the plant they just scanned at its listed price, then hand off to the app either way.
**Headline A:** Add a 30-day recovery plan
**Headline B:** Keep it recovering past day 7
**Body A:** Week-by-week steps after your 7-day plan.
**Body B:** General care steps, built from your answers.
**Plans:** One add-on, paid once: "30-Day Recovery Plan" at `{{addon_price}}` (price pending from the owner, shown as a token). No subscription, no struck price, no countdown. The CTA runs `checkout('addon')`: a hidden one-time plan `addon` in `CONFIG.plans` (`oneTime`, `hidden`, never listed on the paywall) with its own checkout. Paying runs `completePurchase('addon')` → get_app with the "added" line. Closing it without paying goes to get_app without it (`CONFIG.declineFlow = {addon:'get_app'}`). The demo shows a stand-in sheet (Pay / Close without paying) while no checkout URL is set.
**Visual:** Green chip on top "Payment complete. Your plan is active." Eyebrow "Add-on · paid once". Cover card with the user's plant photo in a round frame, label "CoinIdentify plan" and the name "30-Day Recovery Plan". Three green checks: "Weekly care steps for days 8 to 30" · "Check-ins to see if it is recovering" · "Saved with your plant card in the app". Price row: `{{addon_price}}` · "Paid once · no subscription". No back button, no close X.
**Microcopy:** Under the card: "One-time payment at a secure checkout. No subscription." Skip link: "No thanks, take me to the app". Events: `upsell_view`, `upsell_accept` (+ `checkout_click` with plan `addon`), `upsell_decline`, `purchase_complete` with plan `addon`, `checkout_decline` with plan `addon`.
**CTA:** Add to my plan

---

## G. Payoff

### 20. Get the app
**Purpose:** Hand a paying user straight to the CoinIdentify app, where the full report lives.
**Headline A:** You're in, {{name}}
**Headline B:** You're in
**Body A:** Your full report is waiting in the CoinIdentify app.
**Body B:** Your full report is waiting in the CoinIdentify app.
**Visual:** Success check in a glowing well, then three numbered steps: "Download CoinIdentify: Coin Scanner" (From the App Store or Google Play.) · "Log in with {{email}}" (Use the email you gave us.) · "Open your report" (Your plant scan is saved to your account.). "Open the app" button with official-looking black App Store and Google Play badges under it. If the add-on was bought, a green line above the steps: "30-Day Recovery Plan added. It opens in the app."
**Microcopy:** "Results are an indication, not expert advice. Cancel anytime in your account." App links are pending (`CONFIG.appUrl` / store URLs empty), so the button and badges show the toast "App link coming soon". Reached only after purchase (or a return with `?paid=`); there is no free path to it. `complete` fires here.
**CTA:** Open the app

---

## Notes

**Reference.** PlantIn (research section 7 of `coursiv-coinin.md`: 14 screens, care-guide pre-lander, same template as CoinIn (competitor)) and the coin funnel this folder forks. Exact PlantIn copy is **unverified**; only the pattern (symptom and care questions, upload, paywall with a sheet) is taken. The plan spine of about 16 screens was kept at 20 on purpose: the two games and the bridge are reused from the approved coin flow.

**Brand (2026-10-07).** CoinIdentify: Coin Scanner on every screen ("CoinIdentify" in the brand bars). The folder keeps its `coinin-plant` name; CoinIn appears only as a competitor in the research notes.

**Persona and safety rules.** The host is a drawn guide with no credentials. Labels: hook chip, meet-screen bubble, paywall bubble and FAQ ("Is Fern a real person?"), demo footnote. The diagnosis is always worded as "likely cause" and "an indication", never "diagnosis" as a promise. No pesticide dosing, no "safe for pets or kids", no "toxic or edible" claims: the only safety line is "check the product label or ask a professional". Day-plan steps are general care (check soil, drainage, light, isolate, wipe leaves) and contain no product advice.

**Blocks deliberately skipped.** Social proof screen (no verified numbers for this listing; proof lives in the paywall behind tokens), notification opt-in, wheel or scratch card, last-chance offer or sale (CoinIdentify policy: no sale, no offer on decline).

**Dark patterns not copied.** Countdown timer, strike-through anchor prices, "payment period" fine print, live user counter, fake expert testimonials, and an email gate that claims no storage.

**Drop-off risk.** Screens 12 to 13 (upload). The sample-plant link, camera or gallery choice and "whole plant only" skip exist for this. Screen 17 (email) is mandatory and the paywall is hard, so expect a sharper drop at 17 and 18 than in the old free-card version. Users who cannot find a symptom pick Other, which shows "Not sure yet" and a general plan.

**Monetization (2026-10-07, Starlyn shape).** Hard paywall after the mandatory email gate; three plans (1w $12.99 then $39.99 every 4 weeks, 4w $14.99 then $39.99 every 4 weeks, pre-selected, 12w $39.99 then $59.99 every 12 weeks); no sale or offer on decline; after purchase a one-time add-on ("30-Day Recovery Plan"), then get_app. The old last-chance one-plant offer and the free result screen were removed (screens 19 and 20 now hold the add-on and get_app). Measure separately: first-scan success, email submit rate, subscription conversion by plan (`purchase_complete` by plan / `paywall_view`), add-on attach rate (`purchase_complete` with plan `addon` / `upsell_view`), app hand-off rate and refund rate.

**Pending from the owner.** Add-on name and price (`{{addon_price}}`, "30-Day Recovery Plan" is a working name), Paddle price IDs for `1w`, `4w`, `12w` and `addon`, support email (`{{support_email}}`), app links (App Store, Google Play, web2app), legal entity, refund terms, real ratings.

**First A/B test.** Persona host (this brief) vs. no host (same flow, plain copy). **Second:** badge screen before vs. after the email gate.

**Verify before build.** Refund terms; rating and reviews; the real plant-ID and cause-check API and a reviewed cause-to-plan table (the demo's four causes and 7-day plans are general placeholders, unverified by a horticulturist); that the app grants the add-on from its one-time transaction.

**Demo notes.** The demo cannot identify real photos: any upload (or the sample link) shows the same seeded sample (by Q1 pick) with the cause chosen by the first symptom, and a visible "Demo only" note plus "Sample data" chips (cards, paywall hero) say so. Checkout is a stand-in sheet (Pay / Close without paying) while no checkout URL is set. Images in `img/` are real generated art (gemini-3.1-flash-image via `gen_images.py`, 2026-10-07).

**Demo (Artifact, private):** https://claude.ai/artifact/XF56cAX6rchhcghwa3PQ5w
