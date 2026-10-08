# Funnel Content — Dancing (Standard)

AI video generator funnel: user uploads a photo of themselves (or a friend/couple), AI turns it into a fun dancing video. 13-screen flow, modeled on the reference funnel (hook → personalization quiz → generation → social proof → paywall → payment → last-chance offer on close → success).

---

## 1. Welcome Hook A
**Purpose:** Grab attention with an emotional "before" state and introduce the promise.
**Headline:** Turn your photo into a dancing video in seconds
**Body:** Your favorite photo, brought to life — fun, expressive, shareable.
**Visual:** Background collage of people/couples photos.
**CTA:** Continue

## 2. Welcome Hook B
**Purpose:** Reinforce the promise with social framing (relatable use case).
**Headline:** Follow the steps, and it's ready
**Body:** Upload a photo, answer a few quick questions, and get your dancing video.
**Visual:** Two overlapping photos (friends/couple).
**CTA:** Continue

## 3. Welcome Hook C
**Purpose:** Set expectation for time savings / ease.
**Headline:** Remember this moment, and enjoy it forever
**Body:** In just a minute, turn a still photo into a moving memory.
**Visual:** Single portrait photo, warm tone.
**CTA:** Continue

## 4. Q1 — Occasion / Goal
**Purpose:** Segment intent, increase investment before the ask.
**Headline:** What's the occasion?
**Options:**
- 🎉 Party / Celebration
- 💃 Just for fun
- 🎁 Gift for someone
- 📱 Post on social media
**CTA:** Continue

## 5. Q2 — Your Name
**Purpose:** Personalize the rest of the funnel with the user's name.
**Headline:** What's your name?
**Field:** Text input, placeholder "Enter name"
**CTA:** Continue

## 6. Q3 — Dance Style
**Purpose:** Let user pick the dance style used in generation (personalization + perceived control).
**Headline:** What kind of dance would {{user_name}} love?
**Options:**
- 💃 Fun & Energetic
- 🕺 Smooth & Cool
- 🔥 Viral TikTok Style
- 🎶 Surprise me
**CTA:** Continue

## 7. Video Generation (Loading)
**Purpose:** Build anticipation while AI "works," reduce perceived wait.
**Headline:** Creating {{user_name}}'s dance video...
**Body:** Analyzing photo → applying motion → rendering video
**Visual:** Animated grid of photos morphing, progress bar.
**CTA:** (auto-advances)

## 8. Testimonial / Social Proof
**Purpose:** Build trust right before the reveal/paywall.
**Headline:** 1,486,000+ dancing videos created
**Body:** Loved by people everywhere.
**Visual:** Download counter + press logos (placeholder: Forbes, Rolling Stone, TechCrunch).
**CTA:** Continue

## 9. Landing Hug (Emotional Preview)
**Purpose:** Show a blurred/teaser preview of the result to trigger desire before the paywall.
**Headline:** {{user_name}}'s video is ready!
**Body:** Sign up to watch and download it.
**Visual:** Blurred video thumbnail, dark overlay.
**CTA:** Continue

## 10. Registration
**Purpose:** Hard gate — capture email before showing the result.
**Headline:** Create your account to continue
**Fields:** Email, Password
**CTA:** Continue

## 11. Payment
**Purpose:** Convert to paid plan to unlock the video/download.
**Headline:** Unlock {{user_name}}'s dancing video
**Body:** Choose your plan
**Plans:** Weekly / Annual (highlight savings on annual)
**Fallback offer:** #12 last-chance offer, shown once. Declining it leaves the locked preview with an "Unlock anytime" button.
**CTA:** Continue with Apple Pay / Continue

## 12. Last-chance offer (on paywall close)
**Purpose:** Second chance for users who closed the paywall without paying. Shown once per session, then never again.
**Headline A:** Wait — keep {{user_name}}'s dance for less
**Headline B:** One-time price for {{user_name}}'s dance
**Body A:** {{user_name}}'s dance video is ready. Unlock it for less today.
**Plans:** One offer card: {{offer_name}} (first week). {{offer_price}} today, with the regular {{week_price}} struck (the real current price of the Weekly plan it undercuts), then {{week_price}}/week. Optional {{offer_badge}}. Terms and prices are placeholders until the app supplies them.
**Visual:** Web page in the paywall's style (dark background, purple accent): sticky top bar with a close X, centered eyebrow "One-time offer · shown once", the headline, then a single offer card holding {{user_name}}'s generated dancing video (first frame, soft blur, lock on the play button), the price row (struck {{week_price}} → {{offer_price}} "today"), 3 checks ("Full dance video, no watermark" · "Download and share anywhere" · "Every dance style, cancel anytime"), the CTA, payment badges (Apple Pay · Google Pay · cards) and the renewal line. Below the card, a plain decline link.
**Microcopy:** Shown once per session (sessionStorage flag); a second paywall close skips it. Timer only if `CONFIG.offer.expiresMin` is set: it is a real deadline, the offer is withdrawn when it ends and it never resets on reload. Renewal line: "{{offer_price}} today, then {{week_price}}/week. Cancel anytime." Decline link: "No thanks, keep the locked preview".
**CTA:** Claim my offer

## 13. Success / Download
**Purpose:** Deliver the payoff, drive sharing (viral loop).
**Headline:** Your video is ready!
**Body:** Download or share {{user_name}}'s dancing video.
**CTA:** Download video / Share

---

## Notes

- **Last-chance offer:** measure offer CVR (`offer_accept` / `offer_view`) separately from paywall CVR; also log `offer_decline` and `offer_expired`.
