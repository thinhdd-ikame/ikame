---
niche: nebula
display_name: Nebula (Astrology / Horoscope)
archetype: personalization-quiz
subject: person
input: birth date, birth time, birth place and a short personalization quiz
output: personalized birth-chart reading
screens: 24
monetization: subscription paywall (3-tier, annual pre-selected) + post-purchase report upsell + pay-per-minute astrologer chat
creative_screens:
  hook-a: 1
  hook-b: 2
  hook-c: 3
  reveal: 19
motion: >
  a slow cosmic reveal - a drifting star field, a birth-chart wheel igniting
  line by line, constellations lighting up one after another
---

# Funnel Content — Nebula (Astrology / Horoscope)

AI-personalized astrology app funnel. Different shape from the photo/video generator funnels in this repo: instead of "upload one photo → AI transforms it," this is "answer a long personalization quiz → AI generates a reading" — the quiz itself IS the product demo, and monetization has two layers (subscription paywall + a secondary paid astrologer-chat upsell). Structure is modeled on the real Nebula: Horoscope & Astrology app's competitive teardown (23-screen onboarding, hard paywall, post-purchase upsell, chat upsell), reskinned for ikame. Every screen below has 2 copy variants (A/B-ready) plus the supporting microcopy (disclaimers, skip links, error/empty states, tooltips) needed to actually build it — not just a headline/body brief. Mobile-length rules apply throughout: headline ≤6 words, body ≤12 words.

---

## A. Hooks (value prop + trust)

### 1. Hook A — Welcome
**Purpose:** Emotional "before" state + core promise — you're not alone, the stars have answers.
**Headline A:** Your stars, decoded
**Headline B:** Answers are in your stars
**Body A:** Personal guidance made just for you.
**Body B:** Clarity for love, career, and life.
**Visual:** Dark background, glowing nebula/star field, rounded card, trophy/award badge top bar, purple-pink gradient CTA.
**Microcopy:** Top-left small badge text: "Featured in Vogue · Forbes · Cosmopolitan"
**CTA:** Continue

### 2. Hook B — Social framing
**Purpose:** Reinforce promise via relatable social proof ("millions already trust this").
**Headline A:** Millions ask the stars
**Headline B:** You're not doing this alone
**Body A:** Join others finding clarity daily.
**Body B:** 20M+ people already trust their chart.
**Visual:** Dark background, collage of star signs/zodiac wheel, purple gradient CTA.
**Microcopy:** Small caption under collage: "New readings generated every second"
**CTA:** Continue

### 3. Hook C — Speed/ease expectation
**Purpose:** Set expectation that a personalized reading takes almost no effort.
**Headline A:** Ready in 2 minutes
**Headline B:** A few taps to clarity
**Body A:** A few questions. One accurate reading.
**Body B:** No experience with astrology needed.
**Visual:** Dark background, single glowing birth-chart illustration, warm tone, purple gradient CTA.
**Microcopy:** Progress hint under CTA: "Step 1 of 3" (hooks count as their own mini-stage)
**CTA:** Continue

---

## B. Personalization quiz (the core differentiator — this data-collection sequence IS the funnel's main body)

### 4. Goals
**Purpose:** Multi-select goals to segment intent and start investment.
**Headline A:** What do you need guidance on?
**Headline B:** Where do you want clarity?
**Body A:** Pick all that apply.
**Body B:** Select as many as you'd like.
**Options:**
- 💖 Love & relationships
- 💼 Career & money
- 🌙 Self-discovery
- ✨ Life purpose
**Field:** Multi-select, min 1 required to enable Continue
**Visual:** Dark background, stacked multi-select purple gradient pill buttons, selected state fills solid.
**Microcopy:** Disabled-CTA hint: "Pick at least one to continue"
**CTA:** Continue

### 5. Main reason
**Purpose:** Narrow multi-select goals down to one primary driver — sharpens personalization.
**Headline A:** What brings you here today?
**Headline B:** What's on your mind right now?
**Body A:** Choose the one that fits most.
**Body B:** We'll focus your reading around this.
**Options:**
- 💔 Going through something hard
- 🔍 Curious about myself
- ❤️ Understanding someone I love
- 📅 Just checking my day-to-day
**Field:** Single-select, 4 large tappable cards
**Visual:** Dark background, glowing icon per card, selected card highlights with purple border.
**CTA:** Continue

### 6. Personalization reassurance
**Purpose:** Bridge screen — reinforces that every next answer sharpens accuracy (keeps quiz fatigue low).
**Headline A:** Every answer sharpens your reading
**Headline B:** You're building something personal
**Body A:** The more we know, the more accurate.
**Body B:** No two readings are ever the same.
**Visual:** Dark background, animated chart lines converging into a single glowing point.
**Microcopy:** Small progress hint: "Step 2 of 3"
**CTA:** Continue

### 7. Date of birth
**Purpose:** Core astrology input — anchors every later screen's personalization.
**Headline A:** When were you born?
**Headline B:** Your birth date, please
**Body A:** Your birth date shapes your chart.
**Body B:** This is the base of everything.
**Field:** Date picker (month / day / year), min age gate 18+
**Visual:** Dark background, plain scrollable date wheel, star field backdrop.
**Error state:** "Please select a valid date" if incomplete; "You must be 18 or older" if under age gate
**CTA:** Continue

### 8. Time of birth
**Purpose:** Sharper chart precision; must offer a skip to avoid drop-off from users who don't know it.
**Headline A:** What time were you born?
**Headline B:** Know your birth time?
**Body A:** Exact time gives a sharper reading.
**Body B:** Check your birth certificate if unsure.
**Field:** Time picker + "I don't know my birth time" link
**Visual:** Dark background, clock-face illustration with zodiac symbols around the rim.
**Microcopy:** Skip-link fallback copy: "No worries — we'll estimate it for you"
**CTA:** Continue

### 9. Place of birth
**Purpose:** Completes the three birth-chart inputs (date/time/place).
**Headline A:** Where were you born?
**Headline B:** Your birth city, please
**Body A:** Location fine-tunes your chart.
**Body B:** City is enough — no address needed.
**Field:** Location search/autocomplete
**Visual:** Dark background, glowing pin on a stylized world map.
**Error state:** "We couldn't find that place — try a nearby city"
**CTA:** Continue

### 10. Social proof #1
**Purpose:** Trust interstitial right after the highest-friction inputs, before asking anything more personal.
**Headline A:** 93% say it's spot-on
**Headline B:** Rated accurate, again and again
**Body A:** Rated accurate by real users.
**Body B:** Based on 50,000+ verified reviews.
**Visual:** Large stat number on black, star-rating row, small press-logo strip.
**Microcopy:** Quote card beneath stat: "It described my week better than I could." — Sarah, 29
**CTA:** Continue

### 11. Gender
**Purpose:** Personalizes relationship/compatibility content later in the funnel.
**Headline A:** What's your gender?
**Headline B:** How do you identify?
**Body A:** Helps us tailor your readings.
**Body B:** Used only to personalize content.
**Options:**
- ♀️ Woman
- ♂️ Man
- ⚧️ Non-binary
- ✏️ Prefer to self-describe
**Visual:** Dark background, stacked pill buttons.
**CTA:** Continue

### 12. Name
**Purpose:** Captures the name used to personalize every remaining screen via `{{name}}`.
**Headline A:** What's your name?
**Headline B:** What should we call you?
**Body A:** We'll use it in your reading.
**Body B:** First name is all we need.
**Field:** Text input, placeholder "Enter name", max 30 chars
**Visual:** Dark background, plain white input field, star field backdrop.
**Error state:** "Please enter a name to continue"
**CTA:** Continue

### 13. Social proof #2
**Purpose:** Second trust beat — accuracy claim reinforced with a bigger usage number, keeps momentum before the relationship questions.
**Headline A:** 20M+ readings and counting
**Headline B:** Trusted by millions, {{name}}
**Body A:** Loved by people just like {{name}}.
**Body B:** New readings generated every minute.
**Visual:** Huge bold stat number, press-logo row (Cosmopolitan, Vogue, Marie Claire-style placements).
**CTA:** Continue

### 14. Relationship status
**Purpose:** Segments for compatibility content and the later chat-upsell targeting.
**Headline A:** What's your relationship status?
**Headline B:** {{name}}, what's your love life like?
**Body A:** {{name}}, this shapes your love reading.
**Body B:** Helps us tailor your compatibility insights.
**Options:**
- 💑 In a relationship
- 💍 Married
- 🙋 Single
- 🌀 It's complicated
**Visual:** 3x3-style grid of tappable cards, dark background.
**CTA:** Continue

### 15. Life focus
**Purpose:** Final personalization input — deepens the category weighting of the generated reading.
**Headline A:** What matters most right now?
**Headline B:** {{name}}, what's your top priority?
**Body A:** {{name}}, pick your top focus.
**Body B:** We'll weight your reading toward this.
**Options:**
- 💰 Money
- 👪 Family
- 💼 Career
- 💞 Love
**Visual:** Grid of glowing icon cards, dark background.
**Microcopy:** Small progress hint: "Step 3 of 3 — almost done"
**CTA:** Continue

---

## C. Pre-paywall bridge (build desire, lower perceived risk, warm up before the ask)

### 16. Premium preview
**Purpose:** Flashes what's behind the paywall before asking for anything — builds desire early.
**Headline A:** Unlock your full potential
**Headline B:** See everything the stars know
**Body A:** Deeper insights, daily guidance, more.
**Body B:** Full chart, love match, career forecast.
**Visual:** VIP badge, 4-5 icon benefit rows (daily horoscope, full birth chart, compatibility, tarot), dark background, glowing gold/purple accents.
**Microcopy:** Benefit rows: "🌙 Daily personalized horoscope" / "🔮 Full birth chart breakdown" / "💞 Compatibility reports" / "🃏 Daily tarot card" / "💬 1 free minute with an astrologer"
**CTA:** Continue

### 17. Notification opt-in
**Purpose:** Locks in the daily-open retention habit before the account even exists.
**Headline A:** Never miss your daily sign
**Headline B:** Get your horoscope each morning
**Body A:** We'll send it each morning.
**Body B:** One gentle nudge, every day.
**Field:** Time picker, default 9:00 AM; system permission prompt follows on tap
**Visual:** Dark background, phone mockup showing a sample push notification.
**Microcopy:** Sample push preview text: "🌙 Nebula: Your Sun and Moon align today — here's what it means"
**CTA:** Enable notifications
**Skip link:** "Maybe later" (small, low-contrast, bottom of screen)

### 18. Before / after
**Purpose:** Contrast life without vs. with the app — final emotional push before account creation.
**Headline A:** Confused vs. clear
**Headline B:** Guessing vs. knowing
**Body A:** See the difference guidance makes.
**Body B:** {{name}}, which side do you want?
**Visual:** Split screen — dim/cluttered "before" side vs. glowing/organized "after" side.
**Microcopy:** Before-side label: "Without Nebula: uncertain, reactive, alone" / After-side label: "With Nebula: clear, guided, supported"
**CTA:** Continue

### 19. Creating your profile (loading)
**Purpose:** Builds anticipation while "reading" is generated; testimonial rotation keeps attention during the wait, right before the paywall.
**Headline A:** Reading the stars for {{name}}...
**Headline B:** Building {{name}}'s chart...
**Steps:** (4 progress rows, each with % counter, checkmark and progress bar)
- Calculating your birth chart...
- Mapping your planetary alignments...
- Matching your relationship patterns...
- Almost ready — your first insight awaits
**Visual:** Hero birth-chart illustration filling top half, glowing purple ring animating over it; four progress rows beneath; testimonial quote card rotating between rows.
**Microcopy:** Rotating testimonial cards: "This felt like it actually knew me." — Priya, 34 / "I check it every single morning now." — Jake, 27 / "Scary accurate about my relationship." — Mei, 31
**CTA:** (auto-advances, ~6-8 seconds)

---

## D. Account + monetization (paywall, upsell, payoff, secondary revenue)

### 20. Registration
**Purpose:** Hard gate — capture email before revealing the generated reading.
**Headline A:** Save your reading
**Headline B:** {{name}}, don't lose this
**Body A:** Create an account to unlock it.
**Body B:** Takes 10 seconds, keeps your data safe.
**Field:** Email, Password (min 8 chars); social sign-in buttons: "Continue with Apple" / "Continue with Google"
**Visual:** Dark background, plain white input fields, minimal chrome.
**Error states:** "Enter a valid email address" / "Password must be at least 8 characters" / "This email is already registered — log in instead?"
**Microcopy:** Small legal line under CTA: "By continuing, you agree to our Terms & Privacy Policy"
**CTA:** Continue

### 21. Paywall
**Purpose:** Primary monetization gate — hard paywall, no app access without subscribing. 3-tier structure with the middle tier as a deliberate price decoy so the annual plan looks cheap by comparison.
**Headline A:** {{name}}, your reading is ready
**Headline B:** One step from your full reading
**Body A:** Choose a plan to see it now.
**Body B:** Cancel anytime, no questions asked.
**Plans:**
- **Weekly** — highest per-unit price, lowest commitment, no badge
- **3-Month** — decoy tier, priced close enough to Annual that Annual reads as the obvious value pick, no badge
- **Annual** — pre-selected by default, "BEST VALUE" badge, per-week price shown small under the total to look cheap
**Visual:** 3 stacked plan cards, Annual pre-highlighted with a savings badge, Apple Pay button prominent below.
**Microcopy:** Trust row under plans: "🔒 Secure payment · Cancel anytime · 7-day money-back"; fine print under CTA: "Subscription auto-renews unless canceled 24h before the period ends"
**CTA:** Continue with Apple Pay / Continue
**Fallback offer:** If declined, show a secondary paywall — 3-day trial at the Annual price, single "Try Free for 3 Days" CTA

### 22. One-time offer (post-purchase upsell)
**Purpose:** Immediate upsell while purchase intent is still hot — discounted add-on report, urgency via countdown.
**Headline A:** One more thing, {{name}}
**Headline B:** Don't miss this offer
**Body A:** Unlock your full compatibility report.
**Body B:** 50% off — only available right now.
**Visual:** Countdown timer at top (starts at 5:00), discounted report card showing original price struck through, "Get My Reading" CTA.
**Microcopy:** Timer label: "This offer expires when the timer hits 0"; skip link below CTA: "No thanks, take me to my reading"
**CTA:** Get my reading

### 23. Your reading (payoff)
**Purpose:** The actual value delivery — interactive birth chart the user can explore, reinforcing that the purchase was worth it.
**Headline A:** {{name}}'s birth chart
**Headline B:** Here's what the stars say
**Body A:** Tap a planet to learn more.
**Body B:** Explore your full chart below.
**Visual:** Interactive chart wheel, tappable planet/house icons with short explainer tooltips.
**Microcopy:** Sample tooltip: "☉ Sun in Leo — your core identity shines through confidence and warmth."; share prompt at bottom: "Share your chart" (icon row: Instagram, Messages, Copy Link)
**CTA:** Continue

### 24. Astrologer chat upsell
**Purpose:** Secondary revenue stream — introduces the paid live-chat marketplace right after the user has just seen (and trusted) their AI reading.
**Headline A:** Get a real astrologer's take
**Headline B:** Talk to someone who gets it
**Body A:** Chat live, first minute free.
**Body B:** Real advisors, online right now.
**Visual:** Scrollable row of advisor profile cards (photo, rating, "online now" green dot), chat bubble preview.
**Microcopy:** Advisor card sample: "Luna · ★4.9 · Love & Relationships · Online now"; price disclosure under CTA: "$2.99/min after your free minute"
**CTA:** Start free chat
**Skip link:** "Not now" (bottom, low-contrast — this screen should never feel mandatory)

---

## Notes on funnel psychology vs. the photo/video template

- **No "upload photo" step at all** (unless a future version adds palm-reading — if so, insert it as its own screen between #19 and #20, don't retrofit it into the quiz).
- **Quiz is ~9 screens deep** (#4–#15), far longer than the 2-question pattern used in photo/video funnels — this is intentional: birth-chart accuracy genuinely depends on real data, and each answer is also what makes the eventual reading feel "impossible to fake."
- **Two monetization layers, not one**: screen #21 is the primary subscription paywall (hard-gated), but #24 opens a completely separate pay-per-minute revenue stream — size these as two different success metrics, not one paywall-conversion number.
- **No lucky wheel / gamified spin** — astrology's own "reveal" mechanic (the generated reading itself) already serves the role a lucky wheel plays in photo/video funnels, so adding a wheel on top would be redundant rather than additive.
- **Copy variants (A/B)**: every screen above has a Headline A/B and Body A/B pair — treat A as the default/control when first shipping, and queue B as the first test once baseline conversion data exists per screen (start testing at the highest-drop-off screens first: #7–9 birth-data inputs and #21 paywall are the likeliest candidates based on the competitive research).
