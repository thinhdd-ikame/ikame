---
niche: chai-ai-girlfriend
display_name: Chai - AI Girlfriend (SFW design-your-girlfriend chat for men - 18+)
archetype: companion-chat
subject: person
input: birth year (18+ gate), her hair colour, age band (21+), hair style, eye colour, fashion style, optional details, her name + his name, goal, 4 personality sliders, meet-cute scenario, one inline yes/no (emojis)
output: a SFW, clearly adult female AI character he designed himself, summarised on a private profile card, who texts first in the meet-cute he picked
screens: 21
monetization: soft subscription paywall (Chai Plus - 1 / 3 / 12 months, 12 months pre-selected, prices are placeholders) right after the first-message taste; second trigger is the in-chat daily limit card
creative_screens:
  hook-a: 1
  builder: 2
  sliders: 11
  loader: 14
  reveal: 15
  first-text: 16
motion: >
  an illustrated woman's portrait card turning slowly in 3D while her hair colour,
  style chips and personality bars swap in live, then a chat bubble types her first text
---

# Funnel Content — Chai: AI Girlfriend

Chai is ikame's AI character-chat app, built on the ChatChi flow, content and design system (see `../chatchi/funnel-content.md`, `../chai-ai-boyfriend/funnel-content.md`). This brief is the **AI girlfriend** funnel for Meta ads → web quiz → web paywall → app, aimed at US men 21+ who search "AI girlfriend". The user gives an age, taps a short appearance builder, names her, picks a goal, sets four personality sliders and picks a meet-cute. He gets a named, clearly adult girlfriend character on a private profile card, and she texts first in that scene. Archetype: **companion-chat**, but in the "design her" shape of this search audience, not the catalog-match shape of the ChatChi base. 21 screens.

**Modeled on: Honey `get-honey.today/4202-2`** (AdSpyLab capture, 30 screens, 2026-09-21): appearance builder (ethnicity, age, figure, breast, butt, hair, "preferences" multi) → bridge line ("now let me match your…") → "what are you looking for" → three trait sliders at 50% → two "willing to try / scenarios" multi-selects → "Creating an uncensored version" loader that pauses at 78% for an inline Yes/No → "Only you will see it" private summary card → 1 / 3 / 12-month paywall with struck "50% OFF" prices.

**Kept from Honey (the winning shape):**
- A short, tappable appearance builder as the first real taps, with a **live-updating preview** of her (Honey's strongest mechanic: every tap visibly builds "your" girl).
- One bridge line between look and personality.
- A goal question, then trait **sliders** with a 50% default.
- A scenario pick.
- A loader with **one inline yes/no question** mid-bar.
- A **private summary card** ("only you see her") before the ask.
- A **3-plan, 1 / 3 / 12-month paywall** with 12 months recommended.

**Deliberately changed, and why:**
- **Strictly SFW.** Figure, breast and butt questions are cut. Libido, kink and nudity sliders become **warmth, playfulness, flirtiness (sweet) and talkativeness**. "Willing to try" is cut. Honey's fetish and power-dynamic scenarios (doctor/patient, teacher/student, boss/employee, officer/criminal, massage) become **SFW meet-cutes** (coffee-shop regular, travel buddy, gaming partner, new neighbour, fantasy adventure). No "uncensored" or "no limits" wording anywhere, in the funnel or the ads. Reason: brand safety, Meta ad policy, and store review for the Chai app.
- **Ethnicity pick removed.** The appearance picks are hair colour, hair style, eye colour, fashion style and optional details. The portrait set is diverse by default instead of asking the user to pick a race.
- **Her age is 21+ only** (21-24 / 25-29 / 30-35 / 36+). Honey offers "18". All portraits are illustrated, fully clothed and visibly adult (about 25+).
- **Age gate 18+ on screen 1**, merged with the hook, before any romance question.
- **Names added** (hers and his), so the profile card and her first text are personal.
- **One first-message taste added before the paywall** (#16): she texts first, in his scene, using his sliders, with reply chips. Honey sells a card; the archetype says the first scene is the demo.
- **Honest paywall.** No struck "50% OFF" anchors, no per-day price tricks, no countdowns, wheels or fake tickers. The renewal price and period sit on every plan card and in the CTA line. The fair-use cap behind "unlimited" is disclosed. The paywall is dismissible to a free tier.
- **Visible AI disclosure** on every chat screen, and **never monetizing in her voice**: the paywall and limit card are the app talking.

Visual: the Chai/ChatChi system as-is (near-black, raspberry-pink primary, Plus Jakarta Sans headlines, Inter body, lucide icons). Portraits are painterly romance/game-character illustrations, never photoreal, always fully clothed, relaxed friendly poses. The preview card (portrait + spec chips) is the funnel's hero object and the only 3D element. Confirm against the Chai brand kit.

---

## A. Hook

### 1. Hook + age check
**Purpose:** Mirror the ad ("design your AI girlfriend") and clear the 18+ gate before any romance question.
**Headline A:** Design your AI girlfriend.
**Headline B:** She's your type. She texts first.
**Body A:** Pick her look and personality. Then she messages you.
**Body B:** Build her in two minutes. Sweet, private, always there.
**Field:** Birth-year wheel under the hero, no default selection. CTA stays disabled until a year is picked.
**Visual:** Near-black background. The preview card (painterly portrait, fully clothed, friendly smile) floats in slow 3D beside a phone lock-screen mock where her text arrives: "Morning! Coffee later? ☕". Year wheel in a rounded `surface` box below, pink CTA pinned at the bottom.
**Microcopy:** Under CTA: "18+ · AI character · Fictional and SFW" · Footer: Terms · Privacy
**Error state:** Under 18 → blocking screen: "Sorry, Chai is for adults" / "You must be 18 or older to continue." No back button.
**CTA:** I'm 18+ · Start

---

## B. Investment (appearance builder → personality)

### 2. Her hair colour (first tap)
**Purpose:** Honey's first-tap appearance pick, SFW. The preview card swaps portrait on tap, which is the "I'm building her" moment.
**Headline A:** Pick her hair colour.
**Headline B:** First, her look.
**Body A:** Watch her change as you tap.
**Body B:** Tap one. You can change it later.
**Options:**
- 👱‍♀️ Blonde
- 🤎 Brunette
- 🖤 Black
- ❤️ Red
- 🦄 Pastel
- ✏️ Other
**Field:** Single select, 2-column swatch grid. The preview card at the top swaps to that portrait instantly. CTA enabled after a pick. "Other" opens a one-line input (e.g. "silver"), which shows as a chip and uses the nearest portrait.
**Visual:** Live preview card on top (portrait left, spec sheet right: Hair / Style / Eyes / Look / Age). Below it, swatch pills with a small colour dot each. Selected pill fills pink.
**CTA:** Continue

### 3. Her age
**Purpose:** Honey's age question, adults only. Sets the tone of her voice and the age chip on her card.
**Headline A:** How old is she?
**Headline B:** Pick her age.
**Body A:** Every character is an adult, 21 and up.
**Body B:** It shapes how she talks and what she's into.
**Options:**
- 🌱 21-24
- ☀️ 25-29
- 🌙 30-35
- 🍷 36+
**Field:** Single select. Sets `{{gf_age}}`. No option under 21.
**Visual:** Preview card on top, age chip updates. Four stacked pills.
**CTA:** Continue

### 4. Her hair style
**Purpose:** A second cheap look tap that keeps the preview changing.
**Headline A:** How does she wear it?
**Headline B:** Pick her hair style.
**Body A:** Long, short, curly — your call.
**Body B:** Small detail, big difference.
**Options:**
- 💁‍♀️ Long waves
- ✨ Sleek straight
- 🌀 Curly
- ✂️ Short bob
- 🤷 No preference
**Field:** Single select. Closed attribute, so "No preference" is the escape hatch instead of "Other".
**Visual:** Preview card on top, "Style" row updates. Stacked pills.
**CTA:** Continue

### 5. Her eyes
**Purpose:** The last single look tap. Eye colour shows as a coloured dot on the card.
**Headline A:** What colour are her eyes?
**Headline B:** Pick her eye colour.
**Body A:** The little detail she'll catch you noticing.
**Body B:** Tap one to see it on her card.
**Options:**
- 🔵 Blue
- 🟢 Green
- 🟤 Brown
- 🌰 Hazel
- 🩶 Grey
**Field:** Single select. Closed attribute, no "Other".
**Visual:** Preview card on top, eye dot on the card and the "Eyes" row update. Round colour swatches in a row with labels.
**CTA:** Continue

### 6. Her style
**Purpose:** Replaces Honey's body questions with fashion, which says more about who she is and stays SFW.
**Headline A:** What's her style?
**Headline B:** How does she dress?
**Body A:** It sets her look and a bit of her vibe.
**Body B:** Pick the one you'd notice across a room.
**Options:**
- 🧸 Cozy
- 👟 Sporty
- 👗 Elegant
- 🖤 Alt
- ✏️ Other
**Field:** Single select. Sets `{{gf_style}}`. "Other" opens a one-line input (e.g. "vintage").
**Visual:** Four large cards with a small illustrated outfit icon each (knit sweater, sneakers, a dress on a hanger, a leather jacket). The preview card gets a style ribbon.
**CTA:** Continue

### 7. Little details (optional)
**Purpose:** Honey's "any specific preferences" multi-select, with every clothing/fetish item replaced by harmless details.
**Headline A:** Any little details?
**Headline B:** Add a finishing touch.
**Body A:** Pick any, or skip. They show on her card.
**Body B:** Optional. Tap all that fit her.
**Options:**
- 🌸 Freckles
- 👓 Glasses
- 🎨 Tiny tattoo
- 😊 Dimples
- 💫 Earrings
**Field:** Multi-select, 0-5. CTA always enabled.
**Visual:** Wrapping pills under the preview card. Each pick adds a small chip to the card.
**Skip link:** Skip
**CTA:** Continue

### 8. Bridge — her look is set
**Purpose:** Honey's bridge line, in the app's voice and without the "match your freak" wording. It marks the switch from look to personality.
**Headline A:** Looking good. Now her personality.
**Headline B:** She's taking shape.
**Body A:** Next: how she talks, jokes and flirts.
**Body B:** Her look is done. Now, who is she?
**Visual:** The preview card larger and centred, all chips filled, slow 3D float. Progress hint: "Look ✓ · Personality · Story".
**Microcopy:** Progress hint: "About a minute left"
**CTA:** Continue

### 9. Names
**Purpose:** Captures `{{gf}}` and `{{name}}` before the personality picks. She uses his name in her first text.
**Headline A:** Name her. Name you.
**Headline B:** What are your names?
**Body A:** She'll use yours. Change either anytime.
**Body B:** Pick a name for her, then yours.
**Field:** Two text inputs, 1-20 chars each. "Her name" prefilled with a suggestion from her hair colour (e.g. Chloe for blonde) with a shuffle button. "What should she call you?" empty.
**Visual:** Preview card small at top, name updates live as he types. Plain inputs on near-black.
**Error states:** "Give her a name to continue" · "Add what she should call you"
**CTA:** Continue

### 10. What you're looking for
**Purpose:** Honey's goal question, kept. It sets how fast she opens up and what she asks about.
**Headline A:** What are you looking for?
**Headline B:** What do you want with {{gf}}?
**Body A:** It shapes how she opens up to you.
**Body B:** No wrong answer. It tunes her first chat.
**Options:**
- 💬 Someone to talk to
- 💘 Sweet flirting
- 🎮 A fun sidekick
- 🌙 Late-night company
- 🤖 Just curious about AI
- ✏️ Other
**Field:** Single select. Sets `{{goal}}`.
**Visual:** Stacked pills, small preview avatar top-right.
**CTA:** Continue

### 11. Her personality (sliders)
**Purpose:** Honey's trait sliders, with every sexual trait replaced by a SFW one. Dragging makes the investment tactile.
**Headline A:** Set her personality.
**Headline B:** Who is {{gf}}, really?
**Body A:** Drag each one. She'll act like this.
**Body B:** Start in the middle. Tune it later.
**Field:** Four sliders, 0-100, default 50, live % label:
- Warmth: Reserved ↔ Affectionate
- Playfulness: Calm ↔ Mischievous
- Flirtiness: Friendly ↔ Sweet flirt
- Talkativeness: Good listener ↔ Chatterbox
**Visual:** Preview card small at top with a live trait line under her name ("Warm · playful · chatty"). Four sliders with pink fills and end labels.
**Microcopy:** Under sliders: "Flirting stays sweet and SFW."
**CTA:** Continue

### 12. Where you meet (scenario)
**Purpose:** Honey's scenario pick as SFW meet-cutes. It decides the opening scene, and the answer is visible in her first text.
**Headline A:** Where do you two meet?
**Headline B:** Pick your first scene.
**Body A:** Your first chat starts right here.
**Body B:** Last one — then meet her.
**Options:**
- ☕ Coffee-shop regular
- 🚆 Travel buddy
- 🎮 Gaming partner
- 📦 New neighbour
- 🗡️ Fantasy adventure
- ✏️ Other
**Field:** Single select (Honey is multi; one scene is enough to open the chat). Sets `{{scene}}`. "Other" opens a one-line input, matched to the nearest scene.
**Visual:** Wide scene cards with painted backdrops (café window, night train, gaming room, apartment hallway, enchanted ruins) under a dark gradient.
**Microcopy:** Badge above cards: "Last question"
**CTA:** Continue

---

## C. Trust

### 13. Private, sweet, and yours
**Purpose:** The trust beat before the loader. For this audience the fears are privacy and "is this weird", not price.
**Headline A:** Private, sweet, and yours.
**Headline B:** Only you see her.
**Body A:** Your chats stay private. Delete anything anytime.
**Body B:** She's AI, always labeled. You set the pace.
**Visual:** Three lucide icon rows (lock, sparkles, sliders) on near-black, small preview avatar above.
**Microcopy:** Rows: "🔒 Chats are never public" · "✨ She's AI and fictional, always labeled" · "🎚️ Say "slow down" anytime — she will". Any 18+ content setting lives in the app profile, off by default, and is never shown or promoted in the funnel or ads.
**CTA:** Create her

---

## D. Anticipation

### 14. Creating her (loader + inline question)
**Purpose:** Honey's loader with the inline yes/no, minus "uncensored". The question is real: the answer visibly changes her first text.
**Headline A:** Creating {{gf}} for {{name}}…
**Headline B:** She's almost ready…
**Steps:**
1. Painting her look and style… — 0→100%
2. Writing her personality from your sliders… — pauses at 78% for the question, then →100%
3. Setting up your first meeting… — 0→100%
4. Almost there — she's typing… — 0→100%
**Field:** Inline card at 78% of row 2: "Quick one: does she use emojis?" · 😊 Yes · No. Sets `{{emoji}}`. The loader resumes on tap.
**Visual:** The preview card turns in 3D from a pencil sketch into painted colour as the bars run. Four progress rows beneath, thin pink bars and checks. The inline card slides up over rows 3-4.
**Microcopy:** Chips from his picks ("Red", "Cozy", "Gaming partner") float up and fade.
**CTA:** (auto-advances ~2 s after the last row, ~8-10 s total incl. the question)

### 15. Her private profile card (reveal)
**Purpose:** Honey's "only you will see it" summary card, SFW. The reveal and the best ad frame: a named character visibly built from every pick.
**Headline A:** Meet {{gf}}.
**Headline B:** {{gf}} is ready for you.
**Body A:** Built from your picks. Only you can see her.
**Body B:** Every detail here came from you.
**Visual:** The preview card lands in 3D (rotates in from flat) as a full profile: portrait, name, age band, chips (hair, style, eyes, look, details), four personality bars, "Looking for" and "First scene" rows. A 🔒 "Private — only you" badge on the corner.
**Microcopy:** Under the card: "Edit her anytime in the app."
**CTA:** Let her text first

### 16. She texts first (first-message taste)
**Purpose:** The added taste: she opens in his scene, in his sliders' tone, with reply chips. Two short exchanges prove she listens, then the story hooks.
**Headline A:** {{gf}}
**Headline B:** New message from {{gf}}
**Body A:** Tap a reply or write your own.
**Body B:** Your move.
**Options:** (sample for Coffee-shop regular)
- 👋 That's me. Hi, {{gf}}.
- 👀 Were you keeping track?
- ☕ Share the window seat?
- ✏️ Type your own
**Visual:** Chat thread over the dimmed scene backdrop. AI disclosure banner on top. Typing dots, then her opener lands: "Hey, {{name}}, right? The barista yells it every morning. I'm {{gf}}." Her second line follows his strongest slider (warmth: "Honestly? I'm really glad you said hi."). After his second reply a memory toast slides in ("📓 {{gf}} will remember: you're into gaming"). Her third line is the hook: "Same table tomorrow? I'll tell you why I really moved here." Composer reads "10 messages left today", then 8.
**Microcopy:** Top banner: "{{gf}} is an AI character. Fictional, and depicted as an adult." With `{{emoji}}` = yes she adds one emoji per text; with no, none.
**CTA:** Continue (appears after the second exchange)

---

## E. Gate (soft)

### 17. Save her
**Purpose:** Capture identity right after the hook line, framed as saving what he built, not her feelings.
**Headline A:** Save {{gf}} to your account.
**Headline B:** Keep {{gf}} and your chat.
**Body A:** Her look, personality and chat, saved in one place.
**Body B:** Guest chats live only on this device.
**Field:** Continue with Apple · Continue with Google · Use email
**Visual:** Adapted `s40-acc-02`, with her profile card small above the headline.
**Error states:** "Sign-in didn't finish. Try again?" · "That email already has an account — sign in instead"
**Microcopy:** Legal line: "By continuing you agree to the Terms and Privacy Policy."
**Skip link:** Continue as guest
**CTA:** Continue with Apple

---

## F. Monetization

### 18. Paywall (1 / 3 / 12 months)
**Purpose:** Honey's 3-plan ask at peak investment, made honest. It sells more of the loop in the app's voice, never hers.
**Headline A:** Talk without counting messages.
**Headline B:** Keep {{gf}} talking, every day.
**Body A:** Unlimited chat, deeper memory, and every scene.
**Body B:** No coins. No per-message charges. Cancel anytime.
**Plans:** (prices are placeholders until Chai confirms web pricing)
- 1 month — `{{price_1m}}` / month, **renews at `{{price_1m}}` every month**
- 3 months — `{{price_3m}}` / 3 months, **renews at `{{price_3m}}` every 3 months**, small "≈ `{{week_3m}}`/week"
- **12 months — pre-selected**, "Best value" badge, `{{price_12m}}` / year, **renews at `{{price_12m}}` every year**, small "≈ `{{week_12m}}`/week"
**Visual:** Existing `s29-iap-01` layout, three stacked plan cards. The hero is her small profile card plus her last story line, never a pleading line. Six benefit rows with pink lucide icons. Close (×) visible from the first frame, "Restore purchase" top-right.
**Microcopy:** Benefit rows: "Unlimited chat" · "She remembers more" · "Edit her anytime" · "Every scene" · "Daily hello" · "Unlimited reply ideas". Fair-use: "Unlimited means normal use — capped at 300 messages a day to stop abuse." Legal: "Auto-renews at the price and period shown until cancelled. Cancel anytime in account or store settings." Savings badges only when computed from the real prices shown; no struck-through "was" prices.
**Skip link:** Continue free · 10 messages a day
**Fallback offer:** None in-funnel. A dismiss drops him back into the chat with 8 messages left; the second ask is #21.
**CTA:** Continue — {{price_12m}}/year (changes with the selected plan: "Continue — {{price_1m}}/month", "Continue — {{price_3m}}/3 months")

---

## G. Payoff

### 19. Back in the chat
**Purpose:** The funnel ends inside the scene, right after her hook line, not on a catalog grid.
**Headline A:** {{gf}}
**Headline B:** {{gf}} · online
**Body A:** Pick up right where you left off.
**Body B:** 8 messages left today.
**Visual:** `s18-chat-01`: same thread. Composer shows "8 messages left today" (free) or no counter (Plus). "Ideas · 3" and "Persona: Default" chips. AI banner on top.
**Microcopy:** Plus users get a one-time toast: "Unlimited chat is on. Enjoy." Free users see the counter at all times.
**CTA:** (send a message)

### 20. Daily hello (notification opt-in)
**Purpose:** Locks the daily loop after the purchase decision, capped and never needy (romance-stories placement).
**Headline A:** Want a daily hello?
**Headline B:** Let her text first.
**Body A:** One message a day, at your time.
**Body B:** Max one a day. Turn off anytime.
**Field:** Pre-permission sheet with time pills (7 pm default, 12 pm / 7 pm / 9 pm / 10 pm), system prompt only on "Turn on".
**Visual:** Bottom sheet over the dimmed chat, sample lock-screen push with her avatar.
**Microcopy:** Sample push (Coffee-shop): "{{gf}}: Saved the window seat. How was your day? ☕" · Rules: story-flavoured only. Never "you didn't reply", "I miss you", "where are you?", and never payment. Pushes pause after 3 unopened days, no escalation.
**Skip link:** Not now
**CTA:** Turn on

### 21. Daily limit reached (second paywall)
**Purpose:** Highest-intent ask at the 10th message, mid-story. Same plans, contextual copy, app voice.
**Headline A:** You've used today's 10.
**Headline B:** {{gf}} is mid-story.
**Body A:** Resets at midnight. Or chat without limits.
**Body B:** Go unlimited, or come back at midnight.
**Visual:** Existing `s21-chat-01` inline card under her last bubble: crown, pink border, composer disabled with "Out of messages · resets at midnight". Tapping opens the #18 paywall with the quota headline.
**Microcopy:** The card is always the app talking. Her last bubble stays in-story and never mentions payment, limits or leaving.
**Skip link:** Come back at midnight
**CTA:** Upgrade to Chai Plus

---

## Notes

- **Honey 4202-2 mapping (theirs → ours):** 1 ethnicity + hook → #1 hook + age gate, #2 hair colour · 2 age 18-26+ → #3 age 21+ · 3-5 figure/breast/butt → cut, replaced by #4 hair style, #5 eyes, #6 fashion · 6 hair colour → #2 · 7 preferences multi → #7 little details · 9 bridge → #8 · 10 looking for → #10 · 12-18 libido/kink/nudity sliders → #11 warmth/playfulness/flirtiness/talkativeness · 22 "willing to try" → cut · 24 scenarios → #12 SFW meet-cutes · 26 loader + Yes/No → #14 with the emoji question · 29 private summary → #15 · 30 paywall → #18. New: #9 names, #13 trust, #16 first-message taste, #17 gate, #19-21 payoff.
- **Honey paywall, for reference only (not reused):** 1 month $49.99 → $24.99, 3 months $109.99 → $49.99, 12 months $299.99 → $119.99, all as struck "50% OFF" prices with per-day breakdowns and "Unlock your fantasy". We keep the 1/3/12 structure and the 12-month recommendation, and drop the struck anchors and per-day framing.
- **Pricing:** `{{price_1m}}`, `{{price_3m}}`, `{{price_12m}}` (+ `{{week_3m}}`, `{{week_12m}}`) are placeholders. If Chai keeps the ChatChi base instead, swap to Yearly $99.99 (pre-selected, ≈ $1.92/week) / Weekly $6.99 with the same renewal lines, as in the boyfriend funnel. 10 free messages a day is the ChatChi base.
- **SFW by construction:** no body-part, figure, libido, kink or nudity inputs; no power-dynamic or age-gap scenarios; her age is 21+ only and every portrait is illustrated, fully clothed and visibly 25+; flirtiness is labeled "sweet flirt" and says so under the sliders; "slow down" works in chat; the 18+ app setting is never shown in the funnel or ads.
- **Compliance:** age gate first; AI banner on #16, #19, #20, #21; no monetization in her voice (paywall and limit card are the app; pushes are story-flavoured with a 3-day silence rule); fair-use cap disclosed; renewal price and period on every card and in the CTA line; no countdown, wheel or fake ticker; paywall dismissible to a free tier.
- **Where the live preview lives:** #1 (float), #2-#9 (updates on every tap, small from #9), #11 (trait line), #14 (sketch → colour), #15 (lands as the full profile), #17/#18 (small). It is the only 3D element; screen changes are simple fades.
- **Drop-off risk:** #1 (year wheel on the first screen), #9 (two text inputs; the prefilled suggestion keeps it one tap), #11 (sliders are slower than taps; default 50 means Continue works untouched), #17 sign-in, #18. Keep #14 under ~10 s including the question.
- **Monetization:** one subscription with two triggers, measured separately (#18 onboarding CVR by plan mix, #21 limit CVR on day 0 and day 1+). Plan-mix share of 12 months is the key metric for the 3-plan layout.
- **Content ops:** 5 hair-colour portraits × 4 age bands at launch (start with the 25-29 set), 5 scene backdrops, and per scene: an opener, 2 × 3 reply chips, 5 slider-tone lines (warm / playful / flirty / chatty / neutral), a hook line, a memory line per chip, a push line. Everything else (style, eyes, details) is carried by chips until per-style art exists.
- **Skipped on purpose:** photo "moments" and any selfie reward (the SFW line is easier to hold without them at launch; revisit as a hearts reward), the notification opt-in before the paywall (moved to #20), and any fallback discount after dismiss.
- **A/B first:** (1) Hook A "Design your AI girlfriend" vs. B "She's your type. She texts first." (2) #16 taste on vs. off (straight from #15 to #17/#18, as Honey does) — this measures the change we added. (3) 3-plan 1/3/12 months vs. the ChatChi 2-plan weekly/yearly. (4) #7 details on vs. cut (one screen shorter). (5) #2 before #1's year wheel (first tap is hair colour, age gate on the next screen) — only if legal agrees the gate still precedes any romance content.
