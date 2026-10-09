---
niche: self-halloween
display_name: Self Halloween
archetype: ai-transformation
subject: person
input: a selfie of themselves
output: a Halloween costume video
screens: 13
monetization: hard subscription paywall (weekly vs annual), lucky wheel bonus right before it; one-time last-chance offer on paywall close
creative_screens:
  hook-a: 1
  hook-b: 2
  hook-c: 3
  generation: 9
motion: >
  a playful Halloween costume performance, spooky and fun, with clear movement
---

# Funnel Content — Self Halloween

AI video generator funnel: user uploads a selfie of themselves, AI turns it into a Halloween costume video. 13-screen flow, matching the Figma flow board (hooks → name → style → upload → social proof → generation → lucky wheel → email → paywall → last-chance offer on close). Copy kept short to fit mobile screens.

---

## 1. Ob1 — Welcome Hook A
**Purpose:** Grab attention with an emotional "before" state and introduce the promise.
**Headline:** You, now a vampire
**Body:** Turn a selfie into a spooky video.
**Visual:** Dark background, rounded card with collage of costumed selfies, trophy badge top bar, purple-to-orange gradient CTA button.
**CTA:** Continue

## 2. Ob2 — Welcome Hook B
**Purpose:** Reinforce the promise with social framing (relatable use case).
**Headline:** Just a few taps
**Body:** Upload a selfie, answer 2 questions, done.
**Visual:** Dark background, rounded card with two overlapping selfies (before / costumed), purple gradient CTA button.
**CTA:** Continue

## 3. Ob3 — Welcome Hook C
**Purpose:** Set expectation for time savings / ease.
**Headline:** Ready before Halloween night
**Body:** One selfie. One spooky video.
**Visual:** Dark background, rounded card with single selfie, orange jack-o'-lantern glow, purple gradient CTA button.
**CTA:** Continue

## 4. Input Name
**Purpose:** Personalize the rest of the funnel with the user's name.
**Headline:** What's your name?
**Body:** We'll use it in your video.
**Field:** Text input, placeholder "Enter name"
**Visual:** Dark background, plain white input field.
**CTA:** Continue

## 5. Choose Style
**Purpose:** Let user pick the costume used in generation (personalization + perceived control).
**Headline:** Pick a costume
**Body:** This sets {{user_name}}'s costume look.
**Options:**
- 🧛 Vampire
- 🧙 Witch
- 🧟 Zombie
- 🎃 Surprise me
- ✏️ Other
**Visual:** Dark background, stacked purple gradient pill buttons, emoji + label each.
**CTA:** Continue

## 6. Copy of Choose Style — Occasion / Goal
**Purpose:** Segment intent, increase investment before the ask.
**Headline:** What's the occasion?
**Body:** We'll match the vibe to it.
**Options:**
- 🎃 Halloween party
- 🍬 Trick or treat
- 🏆 Costume contest
- 📱 Social media
- ✏️ Other
**Visual:** Dark background, stacked purple gradient pill buttons, emoji + label each.
**CTA:** Continue

## 7. Upload Photo
**Purpose:** Ask for the only real input last, once the user is already invested in the result.
**Headline:** Add {{user_name}}'s photo
**Body:** One clear photo is all we need.
**Field:** Tall dashed box, "+ UPLOAD YOUR PHOTO"
**Value line:** Not just one look — 50 costume styles included 📷
**Visual:** Dark background, tall dashed upload box centered, solid purple CREATE NOW button below, small value line under it, arc collage of finished Halloween videos fanned across the bottom edge.
**CTA:** Create now

## 8. Testimonial / Social Proof
**Purpose:** Build trust right before the reveal/paywall.
**Headline:** 2M+ costume videos created
**Body:** Loved by creators everywhere.
**Visual:** Huge bold stat number on black, press logo row below (BuzzFeed, Rolling Stone, Maxim-style placements).
**CTA:** Continue

## 9. Video Generation (Loading)
**Purpose:** Build anticipation while AI "works," reduce perceived wait.
**Headline:** Conjuring {{user_name}}'s video...
**Steps:** (4 progress rows, each with % counter, checkmark and progress bar)
- Analyzing your photos with care...
- Matching a spooky costume style...
- Preparing {{user_name}}'s Halloween video...
- Almost ready — your first preview awaits
**Visual:** Hero image of {{user_name}} in costume filling the top half, glowing orange ring animating over it; four progress rows beneath, each with label, % counter, checkmark and orange progress bar.
**CTA:** (auto-advances)

## 10. Lucky Wheel
**Purpose:** Gamified spin right before the paywall — winning a bonus makes the price feel earned, not asked for.
**Headline:** Spin your lucky wheel
**Body:** One free spin before you unlock.
**Prize:** Bonus styles, extra Halloween video, or a discount on the plan
**Visual:** Colorful segmented wheel centered on black, orange pointer at the top, glow behind the wheel, single CTA pinned below.
**CTA:** Spin now

## 11. Registration
**Purpose:** Hard gate — capture email before showing the result.
**Headline:** Create your account
**Body:** Create an account to watch it.
**Fields:** Email, Password
**Visual:** Dark background, plain white email/password input fields, minimal chrome.
**CTA:** Continue

## 12. Paywall / Payment
**Purpose:** Convert to paid plan to unlock the video/download.
**Headline:** Unlock {{user_name}}'s video
**Body:** Pick a plan before Halloween.
**Plans:** Weekly / Annual (highlight savings on annual)
**Visual:** Two plan cards side by side (Weekly vs Annual), Apple Pay button prominent below.
**Fallback offer:** #13 last-chance offer, shown once. Declining it leaves the locked preview with an "Unlock anytime" button.
**CTA:** Continue with Apple Pay / Continue

## 13. Last-chance offer (on paywall close)
**Purpose:** Second chance for users who closed the paywall without paying. Shown once per session, then never again.
**Headline A:** Wait — keep {{user_name}}'s Halloween video
**Headline B:** One-time price for {{user_name}}'s costume
**Body A:** {{user_name}}'s costume video is ready. Unlock it for less today.
**Plans:** One offer card: {{offer_name}} (first week). {{offer_price}} today, with the regular {{week_price}} struck (the real current price of the Weekly plan it undercuts), then {{week_price}}/week. Optional {{offer_badge}}. Terms and prices are placeholders until the app supplies them.
**Visual:** Web page in the paywall's style (dark background, orange accent): sticky top bar with a close X, centered eyebrow "One-time offer · shown once", the headline, then a single offer card holding {{user_name}}'s generated Halloween costume video (first frame, soft blur, lock on the play button), the price row (struck {{week_price}} → {{offer_price}} "today"), 3 checks ("Full costume video, no watermark" · "Download and share anywhere" · "Every Halloween style, cancel anytime"), the CTA, payment badges (Apple Pay · Google Pay · cards) and the renewal line. Below the card, a plain decline link.
**Microcopy:** Shown once per session (sessionStorage flag); a second paywall close skips it. Timer only if `CONFIG.offer.expiresMin` is set: it is a real deadline, the offer is withdrawn when it ends and it never resets on reload. If the lucky wheel awarded a plan discount, don't stack it: this card shows one real price. Renewal line: "{{offer_price}} today, then {{week_price}}/week. Cancel anytime." Decline link: "No thanks, keep the locked preview".
**CTA:** Claim my offer

---

## Notes

- **Last-chance offer:** measure offer CVR (`offer_accept` / `offer_view`) separately from paywall CVR; also log `offer_decline` and `offer_expired`.
