---
niche: chai-create-your-ai
display_name: ChatChi - Create Your Perfect AI (clone of Chai quiz v2)
archetype: companion-chat
subject: person
input: who you like, chat style, reference look, character personality, meet place, shared facts, your name and background
output: a custom AI companion with a written opening scenario and a chosen voice
screens: 26
monetization: hard web paywall (1/4/52-week intro plans) + one-time add-on upsell
creative_screens:
  hook-a: 1
  hook-b: 7
  reveal: 17
  voice: 19
motion: >
  a character portrait sharpening as a progress ring fills, then the first
  message typing out in a chat bubble while a voice waveform pulses
---

# Funnel Content — ChatChi: Create Your Perfect AI

A near 1:1 clone of Chai's live ad funnel `quiz.chai-ai.com/v2`. It was walked end to end on 2026-10-07 on an iPhone 13 viewport, and 54 of Chai's 64 active Meta ads point at it. The user builds their own companion: who they like, the look (from a reference image), the name, age, personality, where they meet and what the character remembers. Then they describe themselves. ChatChi writes 4 opening scenarios for that pair, and the user picks one. They pick 1 of 5 voices and hear the first line read aloud. Then come the mandatory email, a spin-to-win discount wheel, and a hard paywall with a 10-minute timer and 1/4/52-week intro plans. The owner chose three things on 2026-10-07:

- **Chai's weekly plans** instead of ChatChi's m1/m3/y12.
- **No chat taste**: the scenario and voice screens replace it. This is an exception to the ChatChi flow rule, for this funnel only.
- **The spin wheel, timer and promo code are kept as Chai has them.**

Copy is rewritten in ChatChi's brand. Chai's unverifiable proof ("15M+ users", "4.5★ App Store") is replaced with honest product facts, per the no-invented-proof rule.

---

## A. Hook

### 1. Landing — Create your perfect AI
**Purpose:** The ad promise ("create your perfect AI") restated, with the first quiz tap on the landing itself, so the first click is already investment.
**Headline:** Create your perfect AI
**Body:** Have you ever chatted with an AI before?
**Options:** ✅ Yes · ❌ No (both continue; the answer is stored as `ai_experience`)
**Visual:** Chai layout (2026-10-08): logo centred on top; two badges with a pink outline, a ringed check icon and a pink star ("ANY CHARACTER · You imagine it", "4 STORIES · Written for you"; Chai's "15M+ users" / "4.5 stars" are not copied until ChatChi has sourced numbers, see `CONFIG.hookBadges`); 4:3 hero card on black: four original characters (anime girl in pink, fantasy warrior, basketball player, idol) bursting toward the viewer and pointing; white uppercase headline; uppercase question; YES = light-pink pill with dark text, NO = dark pill, both with ›.
**Microcopy:** "By proceeding, you agree with [Terms](https://squad-xteam.com/termofuse.html), [Privacy Policy](https://squad-xteam.com/policy.html), Subscription Terms" — real links, underlined, ≥13px. Footer: "ChatChi: AI Roleplay Chat".
**CTA:** YES › / NO ›

## B. Investment — the character

Every quiz screen has a top bar (back chevron, logo, `n/15` counter) and a thin pink progress bar.

### 2. Who do you enjoy chatting with
**Purpose:** Decides the character's gender, the image grid on screen 7 and the pronouns used from here on (`{{he}}` / `{{she}}` / `{{they}}`).
**Headline:** Who do you enjoy chatting with?
**Body:** We'll personalize everything to your answers.
**Options:** ♂ I prefer men · ♀ I prefer women · ⚧ I prefer non-binary
**Visual:** Full-width dark option cards with gender glyphs. Counter 1/15. A cut-out portrait peeks in from the bottom-right (it switches to a woman if "women" is picked on later screens).
**CTA:** (auto-advances on tap)

### 3. Your own gender
**Purpose:** Lets the character address the user correctly in the scenario.
**Headline:** What is your gender?
**Body:** We'll personalize everything to your answers.
**Options:** ♂ I am male · ♀ I am female · ⚧ I am non-binary
**Visual:** Same layout, 2/15.
**CTA:** (auto-advances on tap)

### 4. Your age
**Purpose:** Age bracket for tone; every bracket is 18+, so it doubles as the adult confirmation.
**Headline:** What is your age?
**Body:** We'll personalize everything to your answers.
**Options:** 18-24 · 25-34 · 35-44 · 45-54 · 55+
**Visual:** Narrow left-aligned pills, portrait bottom-right, 3/15.
**CTA:** (auto-advances on tap)

### 5. Kind of chat
**Purpose:** Sets the scenario genre that screen 17 writes in.
**Headline:** What kind of chat do you want?
**Body:** Select all that apply.
**Options:** 🧸 Comfort characters · 😂 Upbeat and funny · 🕯️ Slow burn · 🤝 Friendship · 📖 Stories
**Visual:** Emoji option cards, multi-select with a pink border when selected, 4/15. A sticky CONTINUE appears after the first pick.
**CTA:** CONTINUE

### 6. Anime or photorealistic
**Purpose:** Filters the reference grid; the single biggest taste split in this category.
**Headline:** Anime or photorealistic?
**Body:** We'll match your character's style to this.
**Options:** ✨ Anime / fan art · 📸 Photorealistic · ⭕ No preference
**Visual:** Same card style, 5/15.
**CTA:** (auto-advances on tap)

### 7. Pick a reference image
**Purpose:** The emotional commitment moment: the user picks a face. Everything after this shows it.
**Headline:** Pick a look you like
**Body:** You can tweak {{him}} however you want next.
**Field:** 3×4 grid of 12 portrait tiles, single select. The set depends on screens 2 and 6 (men/women/non-binary × anime/photoreal/mixed = 9 sets). Each tile carries a default name and archetype tag used on screen 8 (e.g. "Kade · Bestie").
**Visual:** Square rounded tiles, varied archetypes (soft, dark, glasses/nerd, sporty, elegant, rebel). All real generated art (gemini-3.1-flash-image), clearly adult 25+, clothed, glamour-photo lighting for the photoreal set. 6/15.
**Microcopy:** "All images are AI-generated fictional adults (18+) and do not depict real people."
**CTA:** (auto-advances on tap)

### 8. Name your character
**Purpose:** Naming creates ownership, and the name becomes `{{char}}` everywhere after.
**Headline:** Let's refine {{him}}!
**Body:** What should {{his}} name be?
**Field:** Text input "Character name", prefilled with the tile's default ("Kade - Bestie"), max 24 chars.
**Visual:** The picked portrait large at top, 7/15.
**Error state:** "Give {{him}} a name first"
**CTA:** CONTINUE

### 9. Character age
**Purpose:** A cheap tactile input that keeps the character an adult.
**Headline:** Let's set the scene with {{char}}!
**Body:** What is {{his}} age?
**Field:** Wheel picker 18-80, default 22, label "Years old".
**Visual:** Portrait card at top, {{char}} in pink in the headline, 8/15.
**CTA:** CONTINUE

### 10. Character personality
**Purpose:** Personality traits feed the scenario prompt and make the four plots feel different.
**Headline:** Let's set the scene with {{char}}!
**Body:** What is {{his}} personality like? Select up to 4.
**Options:** 💖 Kind · 😃 Outgoing · 💪 Brave · 🎨 Creative · 😂 Funny · 🛡️ Protective · ☀️ Cheerful · 🌸 Gentle · 🤗 Empathetic · 🎯 Focused · 🌟 Charming · 🧘 Calm · 🤓 Nerdy · 😏 Sarcastic · 🌶️ Sassy · 🃏 Witty · 🤠 Adventurous · 🤪 Goofy · 📚 Bookish · 🎧 Chill · 🧠 Smart · 💅 Confident · 🔥 Ambitious · 💚 Jealous · 🌙 Mysterious · ✏️ Other
**Visual:** Three rows of pill chips scrolling sideways in a slow marquee (alternating directions), paused while touched. Selected chips turn pink. Small portrait at top, 9/15. CONTINUE is muted until 1 pick.
**CTA:** CONTINUE

### 11. Where you meet
**Purpose:** Sets the opening scene's location.
**Headline:** Let's set the scene with {{char}}!
**Body:** Where would you two like to meet?
**Options:** 🌲 In the woods · 🏰 Dungeon · 🏠 At your home · ☕ Coffee shop · 🏖️ Beach · 🌃 Rooftop bar · ✈️ On a plane · 🌊 On a yacht · 🏚️ Abandoned mansion · 🏡 At {{his}} home · 🏥 Hospital · 🏫 School · 🎓 College dorm · ⚔️ Battlefield · 🎵 Club · 🏢 Office · 🎡 Amusement park · 🏊 Swimming pool · 🛸 Alien planet · ✏️ Other
**Visual:** Same marquee chips, single select, 10/15.
**CTA:** (auto-advances on tap)

### 12. Shared memories
**Purpose:** Gives the character a history with the user. This is the hook the scenario lands on ("he remembers").
**Headline:** Let's set the scene with {{char}}!
**Body:** Anything {{he}} must remember? Select up to 4.
**Options:** You grew up together · {{He}} has a secret identity · You once betrayed {{him}} · You were childhood rivals · You can tell {{him}} anything · You met at summer camp · {{He}} always makes you laugh · You're teammates · You share an inside joke · {{He}} saved your life · You share a dark past · {{He}} has a nickname for you · {{He}}'s your only friend · {{He}} never trusts easily · You never expected to meet again · ✏️ Write your own
**Visual:** Marquee chips, 11/15. "Write your own" opens a one-line input whose text appears as a removable chip ("You never expected t… ✕").
**Microcopy:** Fix Chai's grammar bug: pronouns are filled in properly ("betrayed him", not "betrayed he").
**CTA:** CONTINUE

### 13. Bridge — now about you
**Purpose:** A pause and a reward for finishing the character half before the user describes themselves.
**Headline:** You're doing great!
**Body:** Now, let's talk about you.
**Visual:** Full-bleed upper half: the picked portrait fading into black. Headline in pink caps.
**CTA:** CONTINUE

### 14. Your name
**Purpose:** The character will say it in the first message and on the paywall.
**Headline:** What is your name?
**Field:** Text input "Your name", max 20 chars → `{{name}}`.
**Visual:** Minimal, 12/15.
**Error state:** "Tell {{char}} your name"
**CTA:** CONTINUE

### 15. Your background
**Purpose:** The user's own role in the story; makes the plots feel written for them.
**Headline:** Your own background
**Body:** Select up to 8.
**Options:** *Your personalities:* 🧠 Smart · 😃 Outgoing · 💪 Brave · 🎨 Creative · 😂 Funny · 💖 Kind · 🌙 Mysterious · 😈 Mischievous · 🔥 Ambitious · 🎯 Focused · 🦋 Free spirit · 🌊 Laid-back · 🌟 Charming · 💡 Introverted · 🎭 Playful · 🧘 Calm. *Facts about you:* You're a billionaire · You're a famous athlete · You're royalty · You're {{his}} boss · You're untouchable · You're unbelievably strong · You have a perfect smile · You're new in town · ✏️ Write your own
**Visual:** Two labelled groups of marquee chips, 13/15.
**CTA:** CONTINUE

## D. Anticipation

### 16. Generating scenario
**Purpose:** A wait that tells the user something is being made only for them.
**Headline:** You're doing great!
**Steps:** Single pink ring counter 0→100% over ~6 s; subline "Writing your scenario…". Behind it, an LLM call builds 4 plots from screens 2-15.
**Visual:** The picked portrait full-bleed, desaturated, a pink progress ring centered.
**CTA:** (auto-advances at 100%, ~6-8 seconds)

### 17. Pick your scenario
**Purpose:** The demo of the product: the user reads a scene and a first message written for them before paying.
**Headline:** Pick your story with {{char}}
**Body:** Swipe through 4 plots, choose one.
**Field:** Carousel of 4 plot cards, `< Previous` / `Next >`. Each card: "Plot n: <title>" · 🎬 Scene description (3-4 sentences, second person, set at the screen 11 place) · 💬 First message (in {{char}}'s voice, uses {{name}}, nods to one screen 12 memory) · 🖤 {{char}}'s backstory (age from screen 9, 2 sentences).
**Visual:** 14/15. Dark cards, pink section icons, portrait thumbnail on the card header.
**Microcopy:** "AI-generated story. {{char}} is a fictional AI character." Fallback if the LLM call fails or takes over 12 s: 4 pre-written plots per meeting place, filled with the name tokens.
**CTA:** SELECT THIS SCENARIO

### 18. Generating audio
**Purpose:** A second short wait that sets up the voice reveal.
**Headline:** Almost there!
**Steps:** Pink ring 0→100% over ~4 s; subline "Creating {{char}}'s voice…".
**Visual:** Same as screen 16.
**CTA:** (auto-advances at 100%, ~4 seconds)

### 19. Pick a voice
**Purpose:** Hearing the character say the first line is the strongest attachment moment before the ask.
**Headline:** Choose {{char}}'s voice
**Body:** {{char}}'s first message, as a chat bubble with the portrait avatar.
**Field:** Two tabs, "♂ Male voices" / "♀ Female voices" (default follows screen 2: men → male, otherwise female). Each tab has 5 rows "Voice n · <style>" (male: Smooth, Deep, Playful, Husky, Warm; female: Soft, Playful, Velvet, Husky, Sweet) with play button, waveform and duration. Clips are pre-recorded ElevenLabs v3 previews (`gen_voices.py`), each voice saying its own short warm line with v3 emotion tags; a recording can't say the user's name, so the bubble shows the personalised first message and the audio is "how they sound". Voice 1 autoplays unless the user already tapped one. Switching tab clears the pick.
**Visual:** 15/15, progress bar full.
**Microcopy:** "AI voice. Not a real person."
**CTA:** SELECT THIS VOICE

## E. Gate

### 20. Email
**Purpose:** Mandatory identity capture; the email activates the subscription in the app.
**Headline:** Get your personal companion
**Body:** Enter your email to save {{char}}.
**Field:** Email input "Your email", validated; no skip, no guest, no social sign-in. Emits `lead` with the email (fills the checkout email).
**Visual:** Lock note under the field. A gift card row: 🎁 "Use a real email so you don't miss your bonus."
**Microcopy:** "We respect your privacy. Your data is processed under our [Privacy Policy](https://squad-xteam.com/policy.html)."
**Error state:** "Please enter a valid email"
**CTA:** CONTINUE

## F. Monetization

### 21. Spin for a discount
**Purpose:** A gamified reward right before the ask, so the discount feels won rather than offered.
**Headline:** Spin & save on {{char}}!
**Body:** A personalized offer to start chatting 🎁
**Prize:** Wheel segments 10% · 15% · 20% · 30% · 40% · 50% off. It always lands on 50%, as Chai's does. Result modal with confetti: "Woo hoo! 🥳 {{name}}, you won the maximum discount — 50% off. Applied automatically."
**Visual:** Gold wheel, dotted bulb ring, pointer at top; ~4 s spin with ease-out. The modal slides up from the bottom.
**CTA:** SPIN → CLAIM MY DISCOUNT

### 22. Paywall
**Purpose:** The ask, wrapped in the user's own character, name and won discount.
**Headline:** Endless chats with {{char}}
**Body:** Plus every other character on ChatChi.
**Plans:** Three cards, `4w` pre-selected:

| Plan | First period | Renews at | Badge |
|---|---|---|---|
| `1w` 1-week plan | **$9.99** | $18.99/week | 47% OFF |
| `4w` 4-week plan | **$29.99** | $49.99 every 4 weeks | 👍 MOST POPULAR · 40% OFF |
| `52w` 52-week plan | **$117.99** | $235.99/year | 50% OFF |

Each card shows the struck regular price (the real renewal price), the intro price, and a badge box on the right. Badge percentages are computed from the real prices. Chai shows "60% OFF" on a 40% cut; we don't copy that. Tapping a card selects it; GET MY PLAN opens that plan's checkout.
**Visual:** Sections in Chai's order:
1. Sticky top bar: "DISCOUNT EXPIRES IN 10:00" countdown + pink "GET MY PLAN" button.
2. Hero card: "🎁 Special discount: 50%" red tag, headline, pink pill "Your story starts the moment you join".
3. Two tiles: "Personalized access to — ChatChi Plus" · "Your entitlement — 50% discount".
4. Promo card: "% Your promo code is applied!" with field "✓ {{name}}_oct2026" and a green 10:00 timer.
5. Plan cards.
6. Consent checkbox.
7. Disclosure box.
8. Big GET MY PLAN.
9. Trust tiles: "Pay safe & secure" · "24/7 support" · payment marks (Apple Pay, PayPal, card) · Visa/Amex/Discover.
10. Footer: ChatChi: AI Roleplay Chat · support@chatchi.co.
**Microcopy:**
- Consent: "I agree to the [Terms and Conditions](https://squad-xteam.com/termofuse.html), [Privacy Policy](https://squad-xteam.com/policy.html) and Refund Policy". Unticked and required. Chai pre-ticks it; we don't, for consent validity.
- Disclosure (per selected plan): "By clicking Get My Plan, I agree to pay $29.99 for my first 4 weeks. If I don't cancel before the intro period ends, it renews at $49.99 every 4 weeks until I cancel. I can cancel anytime in my account settings."
- "Endless chats" carries a fair-use footnote: "Fair-use limits apply."
- When the timer hits 0:00, the prices stay. Only the timer row turns into "Your discount is reserved". A fake price jump is not built.
**Fallback offer:** See screen 24.
**CTA:** GET MY PLAN

### 23. Checkout
**Purpose:** Payment for the selected plan.
**Headline:** (Paddle overlay checkout)
**Body:** Plan name, today's price, renewal line; email prefilled from screen 20.
**Visual:** Paddle overlay on top of the paywall; Apple Pay / Google Pay / card.
**CTA:** Subscribe

### 24. Checkout closed
**Purpose:** Recover a decline.
**Headline:** (owner decision pending)
**Body:** Chai's decline behaviour was not captured (the walk stopped at Stripe). The ChatChi decline flow (per-plan sale → lifetime → back to paywall) uses m1/m3/y12 sale prices that don't map to weekly plans. Until the owner sets weekly sale prices, a closed checkout returns to the paywall with the timer still running.
**Visual:** —
**CTA:** —

## G. Payoff

### 25. Add-on upsell
**Purpose:** Second revenue layer, after the subscription is paid.
**Headline:** Add a bonus character
**Body:** One-time $22.99, your subscription stays the same.
**Visual:** ChatChi's existing add-on screen (plan key `addon`, own one-time checkout).
**CTA:** ADD FOR $22.99 · "No thanks" link

### 26. Get the app
**Purpose:** Hand-off into the app, where {{char}} and the chosen scenario are waiting.
**Headline:** {{char}} is waiting for you
**Body:** 3 steps: download the app · log in with {{email}} · open your story.
**Visual:** ChatChi get_app screen with the official black store badges; "Open the app" uses `CONFIG.app` (Android web2app link, iOS/desktop web2web).
**CTA:** OPEN THE APP

---

## Notes

- **Source:** Chai `quiz.chai-ai.com/v2` (arms `v2` and `v12` share this structure; session id `quiz_arm_sep28:*`). The walk was captured 2026-10-07 by a headless walker; screenshots are in the session scratchpad. Chai's step 10 (an 8/16 screen, probably an appearance tweak promised by "you can tweak him") never rendered in our walks, so it's omitted and the counter runs `/15`.
- **Owner exceptions to the ChatChi rules (2026-10-07), this funnel only:**
  - weekly plans instead of m1/m3/y12;
  - no chat taste: scenario + voice play that role;
  - a spin wheel, a countdown and a name-based promo code are kept.
- **Deliberate deviations from Chai:**
  - honest product facts instead of "15M+ users" / "4.5★";
  - real discount percentages;
  - an unticked consent box;
  - no price jump at 0:00;
  - pronoun grammar fixed;
  - AI disclosure on the scenario and voice screens.
- **Pending before build:**
  - Paddle price IDs for `1w` / `4w` / `52w`;
  - weekly sale prices if the decline flow should use sales;
  - an LLM endpoint for screen 17 and TTS for screen 19 (or the pre-written fallbacks);
  - 9 reference-image sets × 12 tiles.
- **Drop-off risk:** screens 10-12 and 15 are four chip screens in a row, and the marquee chips are hard to tap while moving (our walker needed a force click). Pause the marquee on touch. Screen 16's LLM wait is the other risk, so keep the fallback under 12 s.
- **Monetization layers:** subscription (3 plans) + one-time add-on. Track separately. Also track spin → paywall view → plan picked, so we know whether the wheel lifts conversion over a straight paywall.
- **First A/B:** spin wheel on vs off (same prices); `4w` vs `52w` pre-selected.

## Update 2026-10-08: flat pricing

Paddle prices are flat, so screens 21-22 no longer promise a discount (this overrides the copy above):
- Plans `1w` $9.99 every week, `4w` $29.99 every 4 weeks, `52w` $117.99 every year. No struck price, no % OFF badge, and the disclosure states the same price for every period.
- Spin wheel prizes are ChatChi Plus features (voice notes, selfies, unlimited chat, memory, every scenario, morning texts). It always lands on voice notes, framed as "included with ChatChi Plus".
- No countdown and no promo code (nothing expires). The sticky top bar shows "Due today" and the renewal line.
- Paddle live and sandbox IDs are set for all three plans.
- Plan cards: the right side shows price per day (e.g. $1.07 per day, cents raised) and per week ($7.5/wk); the left side shows the real recurring price, with no struck price.
- The consent checkbox is pre-ticked (owner, 2026-10-08).
- "Your own background" shows the chosen idol under the write-your-own input, in the page flow, so the chip rows never cover it.
- iOS/desktop "Open the app" goes to `https://chatchi-app.squad-xteam.com/payment/funnel?...`.

## Update 2026-10-08 (later): 50% off the in-app price

The in-app prices are $19.99 / $59.99 / $235.99 and the web always charges half, so the discount is real and permanent. This brings back:
- the spin wheel (10-50% off, always 50%, "applied automatically, on every renewal");
- "Special discount 50%", "Your entitlement 50% discount" and the name promo code;
- the in-app price struck on each plan card, next to the web price, with the price per day and per week on the right;
- a line under the plans: "Crossed-out prices are ChatChi's in-app prices. On the web you pay 50% less, every renewal."

The disclosure adds "(50% off the in-app price of $X)". There is still no countdown, since the web price never expires.
