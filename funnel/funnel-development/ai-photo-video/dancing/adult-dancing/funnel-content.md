---
niche: adult-dancing
display_name: Adult Dancing (AI Video Generator)
archetype: ai-transformation
subject: person
input: one photo of an adult - themselves, a partner, a friend or a parent
output: a short AI dance video of that adult
screens: 17
monetization: weekly subscription paywall + one-time last-chance offer on paywall close + consumable coin packs
creative_screens:
  hook-a: 1
  hook-b: 2
  hook-c: 3
  generation: 10
  preview: 11
motion: >
  a still photo of a grown-up springing to life - they break into a confident
  dance to the beat, shoulders and hips moving, hair and clothes swinging,
  camera slowly pushing in while a video timeline strip slides underneath
---

# Funnel Content — Adult Dancing (AI Video Generator)

Single-niche dance funnel for the ikame **AI Video Generator & AI Editor** app (App Store id6779853381). The user uploads one photo of an adult — themselves, their partner, a friend, or Mom/Dad — picks a dance style, and the AI turns the photo into a short dance video. It's the dance-only cut of `ai-photo-video/ai-video-generator`: ad traffic arrives already wanting a dancing-adult video, so the catalog's "Who's the star?" branch (me / pet / baby / star) is replaced by a narrower "Who's dancing?" pick between adults. That pick matters here because gifting (making Mom dance for her birthday, surprising a partner) is a big adult use case that `dancing/self-dancing` doesn't serve.

This is the **ai-transformation** archetype in the catalog-app variant: preview tease before the wheel, coins as the wheel prize, a weekly-only paywall, and coin packs as a second layer. Prices come from the app's App Store IAP list (US, 2026-09-25). The audience skews 25-45, so the styles are adult-themed (wedding, office party, salsa, 90s throwback) instead of the baby/pet "funny & bouncy" set, and the copy teases gently without talking down.

**Visual system:** the same one the app's store shots use. Black background, purple-to-magenta gradient headline words, white second line in heavy caps, the round "original" photo bubble with a hand-drawn arrow to the result, a purple gradient "✦ Generate" pill and a video timeline strip under hero results. Example art shows **adults aged 25-60** in real settings (living room, wedding hall, office, rooftop). No teen or influencer models.

---

## A. Hook

### 1. Hook A — Photo comes alive
**Purpose:** Show the transformation in one glance before asking for anything.
**Headline A:** Your photo, now dancing
**Headline B:** Grown-ups dance better with AI
**Body A:** One photo becomes a dance video.
**Body B:** No moves needed. The AI dances for you.
**Visual:** Full-bleed result: a man in his 30s in a shirt and blazer mid-spin in a living room, warm lamp light. "original" bubble bottom-right shows the same man standing stiffly in a still photo, with a curved arrow to the result. 0:06 timeline strip along the bottom.
**Microcopy:** Tiny caption on the bubble: "original"
**CTA:** Continue

### 2. Hook B — Make someone dance
**Purpose:** Social framing. The gifting angle is what sets this funnel apart: surprising someone you love with a video of them dancing.
**Headline A:** Make Mom dance. Seriously.
**Headline B:** Surprise someone you love
**Body A:** Partner, friend or parents — they'll love it.
**Body B:** The birthday gift nobody sees coming.
**Visual:** 2x2 grid of result thumbnails, each with a play badge: a mom in her 50s doing a disco point, a couple slow-dancing, a bearded friend doing the robot, a dad in a polo doing a twist. Every tile has a small "original" bubble in the corner.
**CTA:** Continue

### 3. Hook C — Speed
**Purpose:** Remove the "I can't dance / I can't edit" objection in one line.
**Headline A:** Zero dance skills needed
**Headline B:** One photo. One tap.
**Body A:** Upload a photo, pick a style, done.
**Body B:** AI adds the moves, music and camera.
**Visual:** Three-step row: photo icon → dance style card → play button, joined by the hand-drawn arrows from the store shots.
**CTA:** Let's go

---

## B. Investment

### 4. Who's dancing
**Purpose:** A cheap first tap that splits self vs. gift intent. It sets the name placeholder and the example art on #6 and #8, and separates the two ad audiences in analytics.
**Headline A:** Who's dancing?
**Headline B:** Who's the dancer today?
**Body A:** Pick one — you can make more later.
**Body B:** We'll tune the video to them.
**Options:**
- 💃 Me
- 💑 My partner
- 🤝 A friend
- 👵 Mom or Dad
- ✏️ Other
**Field:** Single-select, 2x2 image cards (each a result thumbnail of that person type) plus the Other row; Other opens a one-line input ("My boss, my coach…")
**Visual:** Photo cards with a bottom label; the selected card gets a magenta glow border.
**CTA:** Continue

### 5. Dancer's name
**Purpose:** Name capture so later screens say "{{user_name}} is dancing". For gift branches, seeing the recipient's name on screen raises desire.
**Headline A:** What's their name?
**Headline B:** Name the dancer
**Body A:** We'll put it on the video.
**Body B:** A first name or nickname works.
**Field:** Text input, max 20 chars; placeholder follows #4 ("Your name" / "Partner's name" / "Friend's name" / "Mom, Dad or a name")
**Visual:** Plain white input on black, the chosen #4 card shrunk to a round avatar above it.
**Error state:** "Add a name to continue"
**CTA:** Continue

### 6. Dance style
**Purpose:** Perceived control plus a clear picture of the output. The styles are adult-themed so the result feels made for grown-ups, not kids.
**Headline A:** Pick {{user_name}}'s moves
**Headline B:** How should {{user_name}} dance?
**Body A:** Tap a preview to see it move.
**Body B:** You can try the others after.
**Options:**
- 🕺 Disco Classic
- 💃 Salsa & Latin
- 🔥 Viral TikTok Dance
- 🪩 90s Throwback
- 🎶 Surprise me
- ✏️ Other
**Field:** Single-select; "✏️ Other" opens a one-line prompt ("dancing tango in the rain") that routes to text-to-video
**Visual:** Vertical template cards with an autoplaying muted preview of an adult doing that style and a "▶ 0:15" badge.
**CTA:** Continue

### 7. Occasion
**Purpose:** Second cheap tap. It banks one more commitment before the upload and sets the music mood and export format.
**Headline A:** What's the occasion?
**Headline B:** What's it for?
**Body A:** We'll match the music to it.
**Body B:** We'll set the mood and format.
**Options:**
- 🎂 Birthday
- 💍 Wedding / anniversary
- 🏢 Office party
- 📱 TikTok / Reels
- ✏️ Other
**Visual:** Stacked purple gradient pills, emoji + label.
**CTA:** Continue

### 8. Upload photo
**Purpose:** The highest-friction ask, after four taps of investment. Adults often pick group or old photos, so the tips do real work against failed renders.
**Headline A:** Add {{user_name}}'s photo
**Headline B:** Upload one clear photo
**Body A:** Full body or waist-up works best.
**Body B:** One person, good light, face visible.
**Field:** Tall dashed upload box with "+" and "UPLOAD PHOTO"; opens camera roll or camera; a row of 3 example thumbs (✓ waist-up, clear · ✗ group photo · ✗ too dark)
**Value line:** Every dance style included — make as many as you like.
**Visual:** Dashed box, solid purple "CREATE NOW" button below, arc collage of finished adult dance results (disco dad, salsa couple, office dancer, wedding guest) curving along the bottom edge.
**Error state:** "We couldn't find one clear person — try another photo"
**Microcopy:** Privacy line under the value line: "Your photo is only used to make your video."
**CTA:** CREATE NOW

---

## C. Trust

### 9. Made with the app
**Purpose:** Trust beat right after the upload, at peak "will this look silly?" doubt. The app has almost no store ratings yet, so the proof is real before/after output.
**Headline A:** Real photos, real moves
**Headline B:** Made from one photo
**Body A:** Every one started as a single still.
**Body B:** Same app, same one-photo start.
**Visual:** Masonry grid of 6 before/after tiles of adults 25-60 (bride's dad, coworkers, grandma, couple), each with the "original" bubble in the corner, gently autoplaying.
**Microcopy:** Optional stat line, **only with real analytics**: "{{videos_created}} dance videos made this week". Omit the line until the number exists.
**CTA:** Continue

---

## D. Anticipation

### 10. Generating (loading)
**Purpose:** Makes the render feel crafted, and it's the strongest ad-creative screen. It auto-advances, and the real render runs behind it.
**Headline A:** Teaching {{user_name}} to dance…
**Headline B:** Making {{user_name}}'s video…
**Steps:** (4 rows with % counter, checkmark, bar)
- Studying {{user_name}}'s pose and style…
- Choreographing moves to the beat…
- Adding lights, camera and groove…
- Almost ready — the dance floor awaits
**Visual:** Uploaded photo in the top half with a glowing magenta ring scanning over it; disco-ball light specks drifting across; progress rows beneath; timeline strip filling frame by frame as rows complete.
**CTA:** (auto-advances when the render finishes, ~8-15 seconds; rows pace to the real job)

### 11. First look (preview tease)
**Purpose:** Proves the video exists and is funny/good without handing it over. The payoff stays gated.
**Headline A:** Look at {{user_name}} go
**Headline B:** {{user_name}} has moves!
**Body A:** Unlock the full video in HD.
**Body B:** Full length, HD, no watermark.
**Visual:** The real generated video looping its first ~2s, muted, soft blur plus a centered watermark; "original" bubble beside it; lock icon on the timeline past 0:02.
**Microcopy:** Tag under the video: "Preview · 2s of {{video_length}}"
**CTA:** Unlock my video

### 12. Bonus spin (gamified reward)
**Purpose:** Makes the price feel earned. The prize is real bonus coins, which also sets up the coin layer on #16.
**Headline A:** Spin for bonus coins
**Headline B:** One free spin
**Body A:** Every spin wins coins for more dances.
**Body B:** Make {{user_name}} dance again, free.
**Prize:** Every segment is a coin bonus added with Pro (e.g. +100 / +200 / +300 / +500). Product sets the amounts; the wheel always lands on a real, deliverable amount.
**Visual:** Segmented wheel on black styled like a disco ball, pointer at top, magenta glow, coin icons on segments.
**Microcopy:** Result line: "+{{bonus_coins}} coins added to your Pro plan"
**CTA:** Spin now

---

## E. Gate

### 13. Save your video
**Purpose:** Capture identity before the value is handed over. For gift branches, this is also where the video gets sent from.
**Headline A:** Where should we send it?
**Headline B:** Save {{user_name}}'s video
**Body A:** We'll keep it safe in your account.
**Body B:** Your video and coins, saved here.
**Field:** Email input + "Continue with Apple" / "Continue with Google"
**Visual:** Small looping preview thumbnail at the top, plain white input, social buttons stacked.
**Error states:** "Enter a valid email address" / "This email already has an account — log in?"
**Microcopy:** Legal line: "By continuing, you agree to our Terms & Privacy Policy"
**CTA:** Continue

---

## F. Monetization

### 14. Paywall
**Purpose:** The primary ask: unlock the HD video and unlimited dance creation.
**Headline A:** Unlock {{user_name}}'s dance
**Headline B:** Go Pro, dance unlimited
**Body A:** HD, no watermark, every dance style.
**Body B:** Make everyone you know dance.
**Plans:** (from the app's App Store IAP list; confirm mapping with product)
- **Weekly** — $14.99 / week, pre-selected, "MOST POPULAR" badge
- **Unlimited Access** — $10.00 on the store; period and entitlement unconfirmed. Don't show it as a second card until product confirms it. If it's an intro/discount offer, it is the candidate {{offer_price}} for the #15 last-chance offer.
**Visual:** Benefit rows with icons (HD export · No watermark · All dance styles · Faster renders · +{{bonus_coins}} coins from the spin), blurred dance frame behind the plan card, purple gradient CTA, Apple Pay button prominent.
**Microcopy:** Trust row: "🔒 Secure payment · Cancel anytime". Fine print: "Renews weekly at $14.99 unless canceled at least 24h before renewal."
**Fallback offer:** #15 last-chance offer, shown once. Declining it leaves the #11 locked preview with an "Unlock anytime" button.
**CTA:** Continue

### 15. Last-chance offer (on paywall close)
**Purpose:** Second chance for users who closed the paywall without paying. Shown once per session, then never again.
**Headline A:** Wait — keep {{user_name}}'s dance for less
**Headline B:** One-time price for {{user_name}}'s dance
**Body A:** {{user_name}}'s dance is ready. Unlock it for less today.
**Plans:** One offer card: {{offer_name}} (first week). {{offer_price}} today, with the regular $14.99 struck (the real current Weekly price it undercuts), then $14.99/week. Candidate offer: the $10.00 store IAP, only if product confirms it is an intro offer on the weekly plan. Until then, price, period and renewal stay placeholders.
**Visual:** Web page in the paywall's style (black background, purple-to-magenta accent): sticky top bar with a close X, centered eyebrow "One-time offer · shown once", the headline, then a single offer card holding {{user_name}}'s generated dance video (the #11 preview frame, soft blur, lock on the play button, "original" bubble), the price row (struck $14.99 → {{offer_price}} "today"), 3 checks ("HD video, no watermark" · "Every dance style" · "+{{bonus_coins}} spin coins kept"), the CTA, payment badges (Apple Pay · Google Pay · cards) and the renewal line. Below the card, a plain decline link.
**Microcopy:** Shown once per session (sessionStorage flag); a second paywall close skips it. Timer only if `CONFIG.offer.expiresMin` is set: it is a real deadline, the offer is withdrawn when it ends and it never resets on reload. Renewal line: "{{offer_price}} today, then $14.99/week. Cancel anytime." Decline link: "No thanks, keep the preview".
**CTA:** Claim my offer

### 16. More dances (coin packs)
**Purpose:** Second revenue layer, after the first unlock when trust is highest. Adults who make one person dance usually want the whole family next. Measured separately from paywall conversion.
**Headline A:** Make the whole family dance
**Headline B:** Keep the party going
**Body A:** Coins unlock extra videos anytime.
**Body B:** Top up once, use whenever you like.
**Plans:** (real store prices)
- **1,000 coins** — $11.99
- **1,500 coins** — $14.99, "MOST POPULAR"
- **2,000 coins** — $19.99, "BEST VALUE", per-coin saving shown small
**Visual:** Three stacked coin-pack cards with coin art growing left to right; current balance (including spin bonus) at the top; a row of small avatars (partner, mom, dad, friend) with "+" to hint at the next dancers.
**Microcopy:** "{{coins_per_video}} coins per video · coins never expire". Confirm the rate and expiry with product first. No countdown timer.
**CTA:** Get coins
**Skip link:** "Not now — show my video"

---

## G. Payoff

### 17. Your video
**Purpose:** Deliver the video, then turn it into a share (the gift moment) and the next creation.
**Headline A:** {{user_name}} owns the floor
**Headline B:** Your video is ready
**Body A:** Save it, send it, make another.
**Body B:** Full HD, no watermark, all yours.
**Visual:** Full video playing with sound toggle, "original" bubble in the corner; action row: Save · WhatsApp · Instagram · TikTok · More (WhatsApp first because gift videos go to family chats); below it a "Make someone else dance" rail with the #4 options.
**Microcopy:** Share caption prefill: "Look who's dancing 🕺 Made with AI Video Generator"; system rating prompt after the first successful save.
**CTA:** Save video

---

## Notes

- **Base:** `ai-photo-video/ai-video-generator`, cut to dance only. Same pricing, coins, preview tease and gate. Deliberate differences:
  - **#4 "Who's dancing?"** replaces the catalog's "Who's the star?" (me/pet/baby/star). All options are adults. The split is self vs. gift, which is the main adult use case.
  - **#6 styles are adult-themed** (disco, salsa, 90s throwback, viral). If the real catalog has different dance templates, swap the labels but keep 4 + Surprise me + Other.
  - **#7 Occasion** replaces "Where will you post it?". For adults, birthday/wedding/office party sets the music mood better than the platform does.
  - **#16 and #17** lean on "make the next person dance", which is the natural repeat loop for this niche.
- **Token:** `{{user_name}}` everywhere, even on gift branches (it holds the dancer's name). The creative pipeline resolves it to "you"/"your", which reads right in ads.
- **Unknowns to confirm with product** (the same ones as the base funnel): what the $10.00 IAP is (it decides the #15 offer), coins per video / coin expiry, which dance templates exist, and whether the web funnel renders a real video. If it can't, #10-#11 need a pre-rendered sample per style, and #11 must stop saying "{{user_name}}".
- **No invented proof.** #9 uses example output; `{{videos_created}}` stays out until analytics has it.
- **Two monetization layers, two metrics:** weekly conversion at #14, and coin-pack attach rate / revenue per payer at #16.
- **Last-chance offer (#15):** measure offer CVR (`offer_accept` / `offer_view`) separately from paywall CVR; also log `offer_decline` and `offer_expired`.
- **Drop-off risk:** #8 upload (adults pick group or old photos, hence the tips and error state), #10 render time, #14 paywall.
- **A/B first:**
  1. Hook B A vs. B: "Make Mom dance" gift angle vs. generic surprise.
  2. #4 on vs. off (ad-preset to "Me").
  3. #11 preview tease on vs. off.
  4. #14 Headline A vs. B.
