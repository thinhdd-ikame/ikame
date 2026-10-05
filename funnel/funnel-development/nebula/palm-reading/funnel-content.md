---
niche: palm-reading
display_name: Starlyn - Palm Reading (palm photo upload, web2app)
archetype: personalization-quiz
subject: person
input: gender, dominant hand, reading goal, birth date (18+), line depth, finger length, palm texture, past experience, goal feeling, most important line, palm photo upload (gallery first, camera second), 3 inline yes/no
output: a palm reading of the 5 major lines (heart, head, life, fate/money, marriage) traced over the user's own photo, opening with the line they chose, plus Sun-sign context
screens: 22
monetization: hard web paywall after the email gate: one plan, 1-week intro then monthly auto-renew; no sale or last-chance offer; purchase leads to a get-the-app screen
offer: none
creative_screens:
  hook-a: 1
  palm-intro: 8
  upload: 16
  reveal: 18
  teaser: 19
motion: >
  gold dots popping onto each fingertip of a real palm photo, then coloured lines
  tracing the life, head and heart lines one by one while a scan beam sweeps down
---

# Funnel Content — Starlyn: Palm Reading

A Starlyn web2app funnel (Meta ad → web quiz → palm photo upload → web paywall → Starlyn app) for the palm-reading niche. AdSpyLab showed this niche at 5.6K ads and +105% at the time of the soulmate-sketch brief. The user answers a 10-tap quiz and **uploads a photo of their palm**. They get a reading of the five major lines, drawn over their own photo. Archetype: **personalization-quiz** with a single asset upload as the centrepiece. 22 screens.

**Modeled on: Nebula's own `appnebula.co/palmistry/prelanding`**, crawled live on 2026-09-30 up to the email gate. The flow: hook with rotating promises and "1-min quiz · palm scan · personalized guide" → gender → dominant hand → goal → "you set your first goal" → birth date → line depth → education bridge → fingers → texture → experience → goal feeling → Sun-sign social-proof loader → most important line → scan intro with do/don't frames + privacy line → scan screen ("Upload from gallery" / "Take a picture now") → analysis loader with 3 inline yes/no → per-finger / per-line "Analyzing" over the user's photo → "we are preparing your reading" teaser → email → paywall.

**Kept from Starlyn:**
- The quiz order and the cheap-tap questions.
- The scan guide with right and wrong examples, and the privacy promise.
- The analysis loader with inline yes/no questions.
- The strongest mechanic: dots and coloured lines appearing **on the user's own photo**, one finger or line at a time.
- The email gate before the paywall.

**Deliberately changed, and why:**
- **Upload is the primary action.** "Upload from gallery" is the main button and the drop zone. "Take a photo now" is a secondary button using the phone camera through `capture`. This is what the brief asked for, and gallery photos are sharper than live captures.
- **Real photo checks, honest errors.** Non-images, files over 15 MB and images that fail to decode are all rejected with plain messages. A brightness check and a skin-area check on the device warn "It looks dark…" or "We can't clearly see a palm…". The user can still continue, or choose another photo.
- **The line guide is fitted, not faked as vision.** The overlay is a palm template, scaled to the hand box found in the photo and mirrored for a left hand. The screen says "Line guide drawn over your photo". The written reading comes from the answers. Real line detection belongs to the host: `CONFIG.onPalmPhoto(blob, meta)` hands the photo over so the backend can make the real reading, then deletes it.
- **No invented social proof.** Nebula's loader says "We've helped 730,877 men with a Capricorn Sun sign…". We replace it with "{{Sun}} Sun meets your palm" and no number.
- **18+ via date of birth**, not only a legal line.
- **Honest paywall** (same rules as the other Starlyn funnels): renewal on every plan card and in the CTA line, no countdown, placeholders for every price. Closing the paywall goes to the reading with the first line open and the rest blurred, not to a dead end.
- **Palette:** Starlyn navy `#161A27` + gold `#E9C26B`, with `#8A6410` for gold on light surfaces (the email field). The five lines have fixed colours: heart rose, head blue, life green, fate gold, marriage lilac.

---

## A. Hook

### 1. Hook
**Purpose:** Promise a personal palm reading and show the 3-step path before any tap.
**Headline A:** (rotating) Discover your fate / Find your love line / Learn your life path… + "with a palm reading made for you"
**Headline B:** Your hand already knows
**Body A:** A 1-minute quiz, one palm photo, your personal reading.
**Body B:** Upload a palm photo. Get your lines read.
**Visual:** Full-width photo of an open palm with glowing gold lines and tiny constellations at the fingertips (`img/hook-palm.jpg`), fading into the navy. Row of 3 chips: 1-min quiz · Palm scan · Your reading.
**Microcopy:** "By continuing you confirm you're 18+ and agree to our Terms of Use and Privacy Policy. For entertainment purposes only."
**CTA:** Let's begin

---

## B. Investment

### 2. Gender
**Purpose:** Nebula's first tap.
**Headline A:** I am…
**Body A:** Palmistry reads masculine and feminine energy differently.
**Options:** 👨 Male · 👩 Female · ✨ Non-binary
**Visual:** Pill options, gold fill on tap, auto-advance.
**CTA:** (tap, auto-advances)

### 3. Dominant hand
**Purpose:** Sets which hand to photograph, and mirrors the overlay for a left hand.
**Headline A:** Which hand do you use most?
**Body A:** Your dominant hand shows the life you are building.
**Options:** ✋ Right · 🤚 Left · 🙌 Both
**Visual:** Pill options.
**CTA:** (tap, auto-advances)

### 4. Goal
**Purpose:** Focus of the reading.
**Headline A:** What do you most want to learn?
**Body A:** We will focus your reading here.
**Options:** ❤️ Love & emotions · 🧠 Mind & decisions · 🌿 Health & vitality · 💼 Career & destiny · 🔮 Just curious
**Visual:** Pill options.
**CTA:** (tap, auto-advances)

### 5. Goal set
**Purpose:** Nebula's micro-reward after the first goal.
**Headline A:** Great! You just set your first goal.
**Body A:** A few more taps so your reading fits you.
**Visual:** Gold spark in a glowing well.
**CTA:** Next

### 6. Date of birth
**Purpose:** Sun-sign context and the 18+ gate.
**Headline A:** What's your date of birth?
**Body A:** Your Sun sign adds context to your palm lines.
**Field:** Month / Day / Year selects. Years stop at today − 18. Sun-sign chip appears once complete.
**Visual:** Three rounded selects in one row.
**Microcopy:** "You must be 18 or older."
**Error state:** Under 18 (exact age from month, day and year): a blocking notice "Starlyn is for adults 18+." with a "Change my birth date" button that returns to this screen; the block persists for the session (sessionStorage) until the date is changed.
**CTA:** Continue

### 7. Line depth
**Purpose:** First "look at your palm" prompt. It primes the photo.
**Headline A:** Look at your palm. How do most lines look?
**Body A:** Take a quick look now. It sharpens the scan.
**Options:** 〰️ Deep and clear · 🌫️ Faint · ⛓️ Broken or chained · 🌀 A mix of these
**Visual:** Pill options.
**CTA:** (tap, auto-advances)

### 8. Palm intro
**Purpose:** Teach the five lines and their colours, which reappear on the user's photo.
**Headline A:** Your palm holds your fate, personality and potential
**Visual:** Gold palm outline with the five coloured lines drawing in, plus a 2-column colour legend.
**CTA:** Next

### 9. Fingers
**Purpose:** Nebula's step.
**Headline A:** How long are your fingers?
**Body A:** Compared to the palm itself.
**Options:** ☝️ They seem long · 👌 They seem short · 🖐️ About average
**Visual:** Pill options.
**CTA:** (tap, auto-advances)

### 10. Texture
**Purpose:** Nebula's step.
**Headline A:** How does your palm feel?
**Body A:** Texture hints at your element.
**Options:** 🪶 Soft and smooth · 🪨 Rough and dry · 💪 Firm and elastic
**Visual:** Pill options.
**CTA:** (tap, auto-advances)

### 11. Experience
**Purpose:** Nebula's step.
**Headline A:** Have you had a palm reading before?
**Options:** 📖 Yes, on my own · 🧙 Yes, with a reader · 🌱 Never tried
**Visual:** Pill options.
**CTA:** (tap, auto-advances)

### 12. Goal feeling
**Purpose:** Nebula's step.
**Headline A:** When you think about your goals, you feel…
**Options:** 😊 Optimistic · 🤞 Cautious but hopeful · 😬 A little anxious
**Visual:** Pill options.
**CTA:** (tap, auto-advances)

### 13. Sign bridge
**Purpose:** Break before the most important line pick, without a fake user count.
**Headline A:** {{sun}} Sun meets your palm
**Steps:** Matching your answers… → Reading your {{sun}} traits… → Preparing your palm scan…
**Visual:** Gold progress ring counting to 100%.
**CTA:** (auto-advances, ~5 seconds)

### 14. Most important line
**Purpose:** The line the reading and paywall open with.
**Headline A:** Which line matters most to you?
**Body A:** Your reading opens with it.
**Options:** ❤️ Heart line · 🧠 Head line · 🌿 Life line · 💰 Fate & money line · 💍 Marriage line
**Visual:** Pill options.
**CTA:** (tap, auto-advances)

---

## C. Upload

### 15. Scan guide
**Purpose:** Get a usable photo on the first try. Trust beat right before the highest-friction step.
**Headline A:** Let's scan your palm
**Body A:** Upload a clear photo of your dominant palm. It takes a few seconds.
**Visual:** A green "Like this" card with a sample palm photo (`img/scan-hand.jpg`): "Palm open and flat, fingers apart, good light, whole hand in frame". Below it, 3 red "not like this" tiles: Too dark · Fingers closed · Cut off.
**Microcopy:** Shield icon + "We use your palm photo only to create your reading and delete it right after. It is not used as biometric data."
**CTA:** Let's do it

### 16. Upload
**Purpose:** The single asset input. Gallery first.
**Headline A:** Upload your palm photo
**Headline B:** Show us your palm
**Body A:** A photo from your gallery works best.
**Field:** Dashed drop zone (tap or drag) + primary "Upload from gallery" + secondary "Take a photo now" (camera capture). After a pick, a 3:4 preview shows with a "Palm found" / "Checking photo…" tag and the fitted line outline.
**Visual:** Drop zone with a gold palm outline.
**Error states:** "That file isn't a photo. Try a JPG or PNG." · "That photo is over 15 MB. Try a smaller one." · "We couldn't open that photo. Try a JPG or PNG (HEIC may not open in every browser)." · Warnings, still allowed to continue: "It looks dark. Lines read best in bright, even light." · "We can't clearly see a palm. Make sure your whole open hand is in the photo."
**Microcopy:** "Private. Your photo is used for your reading only, then deleted."
**CTA:** Use this photo (secondary: Choose another)

---

## D. Anticipation

### 17. Analysis
**Purpose:** Nebula's wait with three sunk-cost taps.
**Headline A:** Delving into the story of your hand
**Steps:** Analyzing your palm lines · Studying your fingers · Highlighting strengths and passions · Identifying personality traits
**Field:** Modal yes/no at ~22 / 48 / 74%: "Are you an adventurous person?" · "Do you enjoy time spent alone?" · "Have you tried rituals or remedies before?"
**Visual:** The user's photo with a gold scan beam sweeping, a progress ring and 4 task rows ticking off.
**CTA:** (auto-advances)

### 18. Line trace
**Purpose:** The aha moment: their own hand being read.
**Headline A:** Analyzing {{Thumb / Index finger / … / Life line / Head line / Heart line / Marriage line / Fate & money line}}
**Visual:** The user's photo. A gold dot pops onto each fingertip in turn, then each line draws in its colour. A progress bar under the label.
**Microcopy:** "Line guide drawn over your photo for your reading."
**CTA:** (auto-advances, ~11 seconds)

### 19. Report teaser
**Purpose:** Show real value and hold back the rest.
**Headline A:** Your palm reading is ready to unlock
**Body A:** (card) {{Chosen line}}: {{type}}, plus a 2-sentence reading
**Visual:** Their photo with every line traced. One open card, then 4 blurred rows with lock icons in line colours.
**CTA:** Get my full reading

---

## E. Gate

### 20. Email
**Purpose:** Nebula's lead capture, also the app login.
**Headline A:** Where should we send your reading?
**Body A:** Get your full palm reading and log in to the app with it.
**Field:** Email (light field, gold `#8A6410` icon), optional marketing checkbox (unticked by default).
**Error state:** "Enter a valid email address"
**Microcopy:** "By continuing, you agree to our Terms of Use and Privacy Policy."
**CTA:** Continue

---

## F. Monetization

### 21. Paywall — web landing page
**Purpose:** Sell the reading the user just watched being traced, as a web sales page that asks twice, not an app sheet.
**Headline A:** We read 5 lines in your {{right/left}} palm
**Body A:** Starting with your {{chosen line}}, the one you care about most.
**Plans:** One plan only, pre-selected: 1 week at `$13.67`, then `$49.99` every month until cancelled. No other tiers, no one-time products, no struck prices, no discount badges.
**Visual:** Long-scroll page with its own sticky bar (brand · mini "Get my reading" CTA that fades in after the first plan block · no close X (hard paywall)). Sections:
1. Hero: eyebrow "Your palm reading is ready", the traced photo beside 4 fact chips (Sun sign, focus, 5 of 5 lines traced, line type).
2. Plan block: plans + "Due today" + CTA + payment badges + secure/cancel row + renewal line.
3. "Inside your reading": a 7-item table of contents, the chosen line open and the rest locked.
4. "How it works": checkout → read it now → keep going in the app.
5. Rating + reviews (from CONFIG, placeholders until real).
6. Money-back seal (only if the refund policy exists).
7. FAQ accordion.
8. Plan block again.
9. Footer with legal links and entity.

The sticky bottom CTA shows the selected plan and today's charge while no plan block is on screen.
**Microcopy:** Renewal line under every CTA: "$13.67 today for your first week, then $49.99 every month until you cancel." FAQ "Will I be charged again?": yes, monthly after the first week unless you cancel. Hard paywall: no close X and no free or "continue" exit. Renewal line under each CTA: "{{price}} today, then {{price}} every {{period}} until you cancel." FAQ: When will I get my reading? · How do I cancel? · Will I be charged again? · What happens to my palm photo? · Is palm reading accurate? (entertainment disclaimer).
**CTA:** Get my reading

---

## G. Payoff

### 22. Get the app
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
- **Drop-off risk:** #16 upload. Mitigations: guide first (#15), gallery as the default, warnings that never block, "Choose another". Measure pick → confirm rate, and warning rate by type (`upload` event: `ok`, `handFound`, `dark`).
- **What must be real before launch:** the reading copy should come from the host's palm model via `CONFIG.onPalmPhoto`. The prototype's `READ` table is placeholder copy keyed off the answers. Prices, refund days, legal URLs, app links.
- **Photo handling:** in the prototype the photo never leaves the device (object URL, revoked on retake). In production, upload once, generate, delete. The promise is on #15, #16 and the store privacy label.
- **Monetization:** one subscription layer. Paywall view → checkout is measured separately for users whose photo was flagged vs. clean.
- **A/B first:** (1) #16 gallery-first vs. camera-first. (2) #19 one open line vs. two. (3) Hook A vs. B.
