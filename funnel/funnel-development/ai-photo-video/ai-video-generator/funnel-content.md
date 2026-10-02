---
niche: ai-video-generator
display_name: AI Video Generator & AI Editor (photo-to-video trend templates)
archetype: ai-transformation
subject: person
input: one photo (self, pet or baby) plus a trend template pick
output: a short trend video (dance, viral trend, concert, champion moment)
screens: 16
monetization: weekly subscription paywall + consumable coin packs
creative_screens:
  hook-a: 1
  hook-b: 2
  hook-c: 3
  generation: 10
  preview: 11
motion: >
  a still photo springing to life - the person starts dancing to the beat,
  hair and clothes moving, camera slowly pushing in, a video timeline strip
  sliding underneath
---

# Funnel Content — AI Video Generator & AI Editor

ikame app (App Store id6779853381, seller BEGAMOB): the user uploads one photo and picks a trend template, and the AI turns it into a short video. The store screenshots show the actual catalog: AI Dance / King of Pop, Recreate Viral Trends, Funny Pet Daily, Baby Dance, AI Concert and AI Champion effects, plus a template browser (Girl Dance, Videos, Photos). The store also mentions text-to-video, but every screenshot sells photo-to-video templates, so the funnel sells that and leaves text-to-video as an in-app extra.

This is the **ai-transformation** archetype, with two deviations:

1. **Multi-subject catalog.** Unlike `dancing/self-dancing`, the app isn't one niche, so screen 4 asks *what* to animate (me, my pet, my baby, a star moment). That choice picks the name token, the style options and the example art for the rest of the flow.
2. **Two revenue layers.** A weekly subscription plus coin packs. Coins are introduced after the first video, never mixed into the paywall.

16 screens. Real prices come from the App Store listing (US storefront, 2026-09-25).

**Visual system (from the store screenshots):**
- Black background, purple-to-magenta gradient headline words, white second line in heavy caps.
- The signature device: a round "original" photo bubble with a hand-drawn arrow pointing at the animated result.
- Purple gradient pill "✦ Generate" button, and a video timeline strip under hero results.

---

## A. Hook

### 1. Hook A — Photo comes alive
**Purpose:** Show the transformation in one glance before asking for anything.
**Headline A:** Your photo, now dancing
**Headline B:** One photo. A whole video.
**Body A:** Turn any selfie into a viral video.
**Body B:** Watch a still photo start to move.
**Visual:** Store shot 1: full-bleed cinematic result (dancer on a beach at sunset), "original" selfie bubble bottom-right with a curved arrow, 0:06 timeline strip of frames along the bottom.
**Microcopy:** Tiny caption on the bubble: "original"
**CTA:** Continue

### 2. Hook B — Viral trends
**Purpose:** Social framing. These are the trends people already see in their feed, and now they can star in them.
**Headline A:** Recreate any viral trend
**Headline B:** Star in the trend
**Body A:** The looks everyone's posting, starring you.
**Body B:** New trend templates added every week.
**Visual:** Phone mockup with a 2x2 grid of trend thumbnails (stadium fan, concert stage, King of Pop, champion trophy), each with a small play badge and duration.
**Microcopy:** Only keep "every week" in Body B if product confirms the template cadence.
**CTA:** Continue

### 3. Hook C — Speed
**Purpose:** Remove the "editing is hard" objection.
**Headline A:** One photo. One tap.
**Headline B:** No editing skills needed
**Body A:** Pick a trend, upload, done in minutes.
**Body B:** AI handles the motion, music and camera.
**Visual:** Three-step row: photo icon → template card → play button, connected by the hand-drawn arrow style from the store shots.
**CTA:** Let's go

---

## B. Investment

### 4. What to animate
**Purpose:** The branch point. It sets the subject, the name token and which templates appear on screens 6 and 11. It's a cheap tap that also segments ad traffic.
**Headline A:** Who's the star?
**Headline B:** What should we animate?
**Body A:** Pick one — you can make more later.
**Body B:** We'll show templates made for it.
**Options:**
- 💃 Me
- 🐶 My pet
- 👶 My baby
- 🎤 Me as a star
- ✏️ Other
**Field:** Single-select, 4 large image cards (each a thumbnail from the matching store shot) plus the Other row
**Visual:** 2x2 photo cards with a bottom label, selected card gets a magenta glow border.
**CTA:** Continue

### 5. Star's name
**Purpose:** Captures the name token so later screens say "{{name}} is dancing". The token depends on #4: `{{user_name}}` / `{{pet_name}}` / `{{baby_name}}`, written below as `{{name}}`.
**Headline A:** What's their name?
**Headline B:** Name your star
**Body A:** We'll put it on the video.
**Body B:** Their first name is plenty.
**Field:** Text input, max 20 chars; placeholder changes with #4 ("Your name" / "Pet's name" / "Baby's name")
**Visual:** Plain white input on black, the chosen #4 card shrunk to a round avatar above it.
**Error state:** "Add a name to continue"
**CTA:** Continue

### 6. Pick a template
**Purpose:** Perceived control and a clear expectation of the output. Options come from the real catalog for the branch chosen in #4.
**Headline A:** Pick {{name}}'s trend
**Headline B:** Choose a vibe
**Body A:** Tap a preview to see it move.
**Body B:** You can try the others after.
**Options:** (per #4 branch)
- Me: 💃 Girl Dance · 🕺 King of Pop · 🏟️ Stadium Fan · 🔥 Surprise me · ✏️ Other
- My pet: 😹 Funny Pet · 💃 Pet Dance · 🏆 Champion Pet · 🔥 Surprise me · ✏️ Other
- My baby: 👶 Baby Dance · 🎂 Birthday Dance · 😂 Funny Moves · 🔥 Surprise me · ✏️ Other
- Me as a star: 🎤 Concert Stage · 🏆 Champion · 🕺 King of Pop · 🔥 Surprise me · ✏️ Other
**Field:** Single-select; "✏️ Other" opens a one-line prompt input (routes to text-to-video)
**Visual:** Vertical template cards with an autoplaying muted preview and a "▶ 0:15" duration badge, like store shot 7.
**CTA:** Continue

### 7. Where it's going
**Purpose:** Second cheap tap. It sets the export format (9:16 for Reels/TikTok) and banks one more commitment before the upload ask.
**Headline A:** Where will you post it?
**Headline B:** What's it for?
**Body A:** We'll size it to fit perfectly.
**Body B:** We'll match the format and length.
**Options:**
- 📱 TikTok / Reels
- 🎁 Send as a gift
- 😂 Just for fun
- 🎉 Party / birthday
- ✏️ Other
**Visual:** Stacked purple gradient pills, emoji + label.
**CTA:** Continue

### 8. Upload photo
**Purpose:** The highest-friction ask, placed after four taps of investment. The tips cut failed generations, which are the real churn driver in this category.
**Headline A:** Add {{name}}'s photo
**Headline B:** Upload one clear photo
**Body A:** One face, good light, looking at camera.
**Body B:** A clear, well-lit photo works best.
**Field:** Tall dashed upload box with "+" and "UPLOAD PHOTO"; opens camera roll or camera; a row of 3 good/bad example thumbs (✓ clear face · ✗ group · ✗ dark)
**Value line:** Every trend template included — make as many as you like.
**Visual:** Dashed box, solid purple "CREATE NOW" button below, arc collage of finished results (dancer, cat, baby, concert) curving along the bottom edge.
**Error state:** "We couldn't find a face — try a clearer photo" (for pet: "We couldn't find your pet — try a closer photo")
**Microcopy:** Privacy line under the value line: "Your photo is only used to make your video."
**CTA:** CREATE NOW

---

## C. Trust

### 9. Made with the app
**Purpose:** Trust beat right after the upload, at peak "is this worth it?" doubt. The app has almost no store ratings yet (5.0 from 2), so the proof is example output, not a big number.
**Headline A:** Made in one tap
**Headline B:** Real photos, real results
**Body A:** Every one started as a single photo.
**Body B:** Same app, same one-photo start.
**Visual:** Masonry grid of 6 before/after tiles, each with the small "original" bubble in the corner, gently autoplaying.
**Microcopy:** Optional stat line, **only with real analytics**: "{{videos_created}} videos made this week". Omit the line until the number exists. Don't borrow counts from other funnels.
**CTA:** Continue

---

## D. Anticipation

### 10. Generating (loading)
**Purpose:** Makes the render feel crafted, and it's the best ad-creative screen in the flow. It auto-advances, and the real render runs behind it.
**Headline A:** Bringing {{name}} to life…
**Headline B:** Making {{name}}'s video…
**Steps:** (4 rows with % counter, checkmark, bar)
- Studying {{name}}'s face and pose…
- Matching moves to the beat…
- Adding light, camera and motion…
- Almost ready — your first look awaits
**Visual:** Uploaded photo in the top half with a glowing magenta ring scanning over it; progress rows beneath; the video timeline strip filling frame by frame as rows complete.
**CTA:** (auto-advances when the render finishes, ~8-15 seconds; rows pace to the real job)

### 11. First look (preview tease)
**Purpose:** Proves the video exists and is good, without handing it over. The payoff stays gated. A muted 2-second loop is enough to create desire.
**Headline A:** {{name}}'s video is ready
**Headline B:** Look at {{name}} go
**Body A:** Unlock the full video in HD.
**Body B:** Full length, HD, no watermark.
**Visual:** The real generated video looping its first ~2s, muted, soft blur plus a centered watermark; the "original" bubble beside it; a lock icon on the timeline past 0:02.
**Microcopy:** Tag under the video: "Preview · 2s of {{video_length}}"
**CTA:** Unlock my video

### 12. Bonus spin (gamified reward)
**Purpose:** Makes the price feel earned, not asked for. This archetype's substitute for a discount. The prize must be something real in the product: bonus coins.
**Headline A:** Spin for a bonus
**Headline B:** One free spin, {{name}}
**Body A:** Every spin wins coins for more videos.
**Body B:** Win bonus coins to use anytime.
**Prize:** Every segment is a coin bonus added with Pro (e.g. +100 / +200 / +300 / +500). Amounts are set by product, and the wheel always lands on a real, deliverable amount.
**Visual:** Colorful segmented wheel on black, pointer at top, magenta glow, coin icons on segments.
**Microcopy:** Result line: "+{{bonus_coins}} coins added to your Pro plan"
**CTA:** Spin now

---

## E. Gate

### 13. Save your video
**Purpose:** Capture identity before the value is handed over, and give a way to deliver the video if they leave. It also links web checkout to the app account.
**Headline A:** Where should we send it?
**Headline B:** Save {{name}}'s video
**Body A:** We'll keep it safe in your account.
**Body B:** Get your video and bonus coins here.
**Field:** Email input + "Continue with Apple" / "Continue with Google"
**Visual:** Small looping preview thumbnail at the top, plain white input, social buttons stacked.
**Error states:** "Enter a valid email address" / "This email already has an account — log in?"
**Microcopy:** Legal line: "By continuing, you agree to our Terms & Privacy Policy"
**CTA:** Continue

---

## F. Monetization

### 14. Paywall
**Purpose:** The primary ask: unlock the HD video and unlimited trend creation.
**Headline A:** Unlock {{name}}'s video
**Headline B:** Go Pro, create unlimited
**Body A:** HD, no watermark, every trend template.
**Body B:** Make as many videos as you want.
**Plans:** (from the App Store IAP list; confirm the mapping with product)
- **Weekly** — $14.99 / week, pre-selected, "MOST POPULAR" badge
- **Unlimited Access** — listed at $10.00 on the store; period and entitlement unconfirmed. If it's a discounted first week or an intro offer, use it as the Fallback offer below instead of a second card. Don't show it as a plan until product confirms what it is.
**Visual:** Benefit rows with icons (HD export · No watermark · All trend templates · Faster renders · +{{bonus_coins}} coins from the spin), blurred video frame behind the plan card, purple gradient CTA, Apple Pay button prominent.
**Microcopy:** Trust row: "🔒 Secure payment · Cancel anytime". Fine print: "Renews weekly at $14.99 unless canceled at least 24h before renewal." If a trial or intro price is shown, state the renewal price in the same font size right next to it.
**CTA:** Continue
**Fallback offer:** On dismiss, one sheet only, and only if product confirms the $10.00 "Unlimited Access" as an intro/discounted offer: "First week $10.00, then $14.99/week". Otherwise no fallback, and the video stays locked with a "Unlock anytime" button.

### 15. More videos (coin packs)
**Purpose:** Second revenue layer, introduced after the first video is unlocked and trust is highest. Coins pay for extra renders beyond the plan, and they're measured separately from paywall conversion.
**Headline A:** Want more trends?
**Headline B:** Keep the videos coming
**Body A:** Coins unlock extra videos anytime.
**Body B:** Top up once, use whenever you like.
**Plans:** (real store prices)
- **1,000 coins** — $11.99
- **1,500 coins** — $14.99, "MOST POPULAR"
- **2,000 coins** — $19.99, "BEST VALUE", with the per-coin saving shown small
**Visual:** Three stacked coin-pack cards with stacked-coin art growing left to right, current balance (including spin bonus) at the top.
**Microcopy:** Line under the packs: "{{coins_per_video}} coins per video · coins never expire". Confirm the rate and the expiry rule with product before shipping this line. No countdown timer.
**CTA:** Get coins
**Skip link:** "Not now — show my video"

---

## G. Payoff

### 16. Your video
**Purpose:** Deliver the video, then turn the first creation into the next one and into a share.
**Headline A:** {{name}} is a star
**Headline B:** Your video is ready
**Body A:** Save it, post it, make another.
**Body B:** Full HD, no watermark, all yours.
**Visual:** Full video playing with sound toggle, "original" bubble in the corner; action row: Save to Photos · TikTok · Instagram · More; below it a horizontal "Try another trend" rail filtered by the #4 branch.
**Microcopy:** Share caption prefill: "Made with AI Video Generator ✨"; rating prompt after the first successful save (system prompt, not a custom star screen).
**CTA:** Save video

---

## Notes

- **Deviations from `ai-transformation`:**
  - **#4 "Who's the star?" branch** added, because this app is a multi-subject catalog, not one niche. It drives the name token, #6's options and the example art. A single-subject ad (e.g. a baby-dance creative) can deep-link past #4 with the branch preset.
  - **Name capture moved after the subject pick** (#5), so the placeholder and token match the subject.
  - **Preview tease (#11)** added before the wheel. For video output a 2-second muted loop is the strongest desire trigger, and the payoff stays gated.
  - **Paywall is weekly-only** (no annual on the store). The validated weekly-vs-annual comparison doesn't apply.
  - **Coin packs (#15)** added as a second layer after purchase.
- **Unknowns to confirm with product before building:**
  1. What the $10.00 "Unlimited Access" IAP is (period, entitlement). It decides whether #14 has a fallback.
  2. Coins per video, whether Pro includes coins, and whether coins expire (#12, #15).
  3. How many templates exist and how often new ones ship (#2 Body B, #8 value line).
  4. Whether the web funnel renders a real video, which needs a backend. If it can't, #10-#11 need a pre-rendered sample per template instead, and the copy must stop saying "{{name}}'s video" at #11.
- **No invented proof.** The store rating is 5.0 from 2 reviews, too thin to quote. #9 uses example output, and `{{videos_created}}` stays out until analytics provides it.
- **Two monetization layers, two metrics:**
  - Weekly subscription conversion at #14 (+ fallback take-rate, if any).
  - Coin-pack attach rate and revenue per payer from #15.
  Don't report them as one number.
- **Drop-off risk:** #8 upload (mitigated by the tips and a real error state), #10 render time if the backend is slow (steps pace to the real job, never fake-complete), #14 paywall.
- **A/B first:**
  1. #11 preview tease on vs. off.
  2. #12 spin on vs. off, now that the prize is coins rather than a discount.
  3. #4 branch cards vs. skipping #4 with an ad-preset branch.
  4. #14 Headline A vs. B.
