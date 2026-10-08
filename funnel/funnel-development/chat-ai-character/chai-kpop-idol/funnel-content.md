---
niche: chai-kpop-idol
display_name: ChatChi - Create Your Dream Idol (Chai quiz v2 clone, idol imagery)
archetype: companion-chat
subject: person
input: who you like, chat style, webtoon or real-life idol look, idol personality, meet place, shared facts, your name and background
output: a custom fictional K-pop-style idol companion with a written opening scenario and a chosen voice
screens: 26
monetization: hard web paywall (1/4/52-week intro plans) + one-time add-on upsell
creative_screens:
  hook-a: 1
  hook-b: 7
  reveal: 17
  voice: 19
motion: >
  a stage-lit idol portrait sharpening as a pink progress ring fills, then the
  first message typing out while a voice waveform pulses
---

# Funnel Content — ChatChi: Create Your Dream Idol

Same flow, copy and monetization as `chai-create-your-ai` (the 1:1 clone of Chai's live `quiz.chai-ai.com/v2`, walked 2026-10-07). Only the imagery and a few words change. The owner asked on 2026-10-08 for "idols" on every screen, as Chai does: Chai shows a K-pop star and a webtoon prince peeking in from the bottom-right of its quiz screens.

**Every idol here is an original, fictional character.** Chai uses a real K-pop star's photo, and we deliberately don't: likeness rights, Meta ad risk, and our "AI-generated fictional adults" line. **Look (owner, 2026-10-08, from reference stills):** American / European, young-looking and beautiful (always clearly adult, 25+), sexy and seductive: intimate glamour close-ups, warm candle or window light, softly blurred background, direct eye contact, flirty poses (fingertip to lip, hands behind head, shy smile); satin camisoles, slip dresses, spaghetti straps, deep necklines, off-shoulder tops; men in shirts unbuttoned low or fitted tanks. Clothed, opaque fabric, no nudity. The names are Western and avoid real celebrities: Julian, Damien, Mason, Leo, Ryder, Elliot, Caleb, Tristan, Sebastian, Jace, Adrian, Miles, Dominic, Luca, Oliver, Gabriel, Rafael, Cole / Sienna, Valentina, Skye, Chloe, Raven, Aurora, Lily, Victoria, Isabella, Jade, Scarlett, Nova, Bianca, Mila, Harper, Ella, Camila, Ruby / River, Phoenix, Rowan, Sky, Ash, Jules, Indie, Sage, Remy, Kai, Ari, Quinn, Rory, Eden, Blair, Lux, Nico, Jesse. The K-pop "Maknae" archetype became "Charmer". The earlier East Asian K-pop set (2026-10-08 morning) is replaced.

**Differences from `chai-create-your-ai`:**

| Where | Change |
|---|---|
| 1. Hook | Chai layout (see create-your-ai screen 1). "CREATE YOUR DREAM IDOL"; badges "54 IDOLS · All original" and "TWO STYLES · Drawn or real"; hero = four original idols pointing at the viewer on black |
| 2-6, 14-15 | An idol peeks in from the bottom-right (Chai layout): a webtoon prince on screen 2, then one idol per screen matching the picked gender, then the user's chosen look |
| 6. Style | "Webtoon / anime" vs "Real-life idol look" |
| 7. Reference grid | **18 idols per gender** (Chai shows 18). Real-life look: 18 candid photos that read like an off-duty idol's Instagram or a behind-the-scenes shot (natural skin, real places: cafe, van, studio, track, kitchen, fashion week). Webtoon: the first 12. No preference: all 18, drawn and photo alternating. **Sorted by the chat kinds picked on screen 5**: each archetype maps to the kinds it suits (e.g. slow burn → mysterious, rebel, heir, actor), the best fits come first with a ♥ Match badge (up to 6), and a pill says "♥ 6 matched to slow burn". Tile shows name + archetype. |
| 20 / 21 / 22 / 26 | The chosen idol's portrait on the email, spin, paywall hero and get-app screens |

The screen-by-screen copy below is inherited from `chai-create-your-ai`. Read "character" as "idol"; the names in examples (Kade) become the idol tiles above.

---

## A. Hook

### 1. Landing — Create your perfect AI
**Purpose:** The ad promise ("create your perfect AI") restated, with the first quiz tap on the landing itself, so the first click is already investment.
**Headline:** Create your perfect AI
**Body:** Have you ever chatted with an AI before?
**Options:** ✅ Yes · ❌ No (both continue; the answer is stored as `ai_experience`)
**Visual:** Top bar: ChatChi logo. Two pill badges replace Chai's proof badges: "🎭 Any character you imagine" and "🔒 Private chats". Hero: a group of 4 characters (2 anime, 2 photoreal; female-led per brand rule; adult, clothed), dark background, pink accent (#F6A8D6-like) on the primary pill button. YES is pink-filled, NO is dark outlined.
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
**Field:** 5 voice rows ("Voice 1"…"Voice 5"), each a play button + waveform + duration. Voice 1 autoplays. Single select (pink outline). Voices are TTS of the chosen first message (5 per gender), generated during screen 18. Fallback: 5 pre-recorded generic greetings per gender.
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
- Paddle sandbox IDs are set. Live IDs are pending, so published (live) checkouts won't charge until they are added.
- iOS/desktop "Open the app" goes to `https://chatchi-app.squad-xteam.com/payment/funnel?...`.
