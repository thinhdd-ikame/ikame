---
niche: chai-ai-girlfriend
display_name: ChatChi - AI Girlfriend (SFW design-your-girlfriend chat for men - 18+)
archetype: companion-chat
subject: person
input: birth year (18+ gate), her hair colour, age band (21+), hair style, eye colour, fashion style, optional details, her name + his name, goal, 4 personality sliders, meet-cute scenario, one inline yes/no (emojis)
output: a SFW, clearly adult female AI character he designed himself, summarised on a private profile card, who texts first in the meet-cute he picked
screens: 27
monetization: hard paywall, no free tier. 2-message chat taste, then a mandatory email screen (activates the subscription), then the paywall (ChatChi Plus - 1 / 3 / 12 months, Paddle, 12 months pre-selected); tapping a plan opens its checkout; after a subscription purchase a one-time add-on upsell ($22.99 bonus character, the plan stays), then the get-app screen; leaving a checkout opens that plan's sale (lower first period), then the lifetime last step, then back to the paywall; closing the paywall opens the lifetime last step, whose No thanks returns to the paywall. The web chat (#25) is for payers only
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

# Funnel Content — ChatChi: AI Girlfriend

ChatChi is ikame's AI character-chat app, built on the ChatChi flow, content and design system (see `../chatchi/funnel-content.md`, `../chai-ai-boyfriend/funnel-content.md`). This brief is the **AI girlfriend** funnel for Meta ads → web quiz → web paywall → app, aimed at US men 21+ who search "AI girlfriend". The user gives an age, taps a short appearance builder, names her, picks a goal, sets four personality sliders and picks a meet-cute. He gets a named, clearly adult girlfriend character on a private profile card, and she texts first in that scene. Archetype: **companion-chat**, but in the "design her" shape of this search audience, not the catalog-match shape of the ChatChi base. 27 screens.

**2026-10-06 monetization update** (plans and sales as in `../chai-dream-girl/`): the screen order of the previous version is kept (profile card → she texts first → save her → paywall). The chat is one screen with a 2-message taste: after his 2nd message she is "typing" for ~1.5 s, then the email screen opens. Email is mandatory (it activates the subscription and is the login in the app). There is no Google / Apple sign-in and no guest skip. The paywall has real Paddle prices (first period, then renewal). Tapping a plan opens its checkout. Leaving a checkout opens a sale for that plan, then a one-time lifetime last step. Subscription payers get a one-time add-on upsell (a second character, $22.99 once; their plan stays as it is), then a get-the-app screen. Lifetime buyers go straight to the get-the-app screen. The old one-size last-chance offer is off.

**2026-10-06 hard paywall** (owner: "let them try 1-2 messages, then they must buy"): there is no free tier. The taste is the only free chat: 2 messages, then email, then the paywall. No "Continue free" link anywhere. Paywall X → lifetime last step (#22) every time; its "No thanks" / X → back to the paywall. Every checkout close ends on the paywall or a sale screen, never in a chat. Going back into the taste (FunnelFox back, reload, "Let her text first" again) shows it locked and hands off to the email screen again; the taste state is saved per message, so a reload cannot restart it. The chat screens #25-#27 open only after a purchase; any other route to them shows the paywall (event `chat_blocked`).

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
- **Strictly SFW.** Figure, breast and butt questions are cut. Libido, kink and nudity sliders become **warmth, playfulness, flirtiness (sweet) and talkativeness**. "Willing to try" is cut. Honey's fetish and power-dynamic scenarios (doctor/patient, teacher/student, boss/employee, officer/criminal, massage) become **SFW meet-cutes** (coffee-shop regular, travel buddy, gaming partner, new neighbour, fantasy adventure). No "uncensored" or "no limits" wording anywhere, in the funnel or the ads. Reason: brand safety, Meta ad policy, and store review for the ChatChi app.
- **Ethnicity pick removed.** The appearance picks are hair colour, hair style, eye colour, fashion style and optional details. The portrait set is diverse by default instead of asking the user to pick a race.
- **Her age is 21+ only** (21-24 / 25-29 / 30-35 / 36+). Honey offers "18". All portraits are illustrated, fully clothed and visibly adult (about 25+).
- **Age gate 18+ on screen 1**, merged with the hook, before any romance question.
- **Names added** (hers and his), so the profile card and her first text are personal.
- **One first-message taste added before the paywall** (#16): she texts first, in his scene, using his sliders, with reply chips. Honey sells a card; the archetype says the first scene is the demo.
- **Honest paywall.** No struck "50% OFF" anchors on the paywall, no per-day price tricks, no countdowns, wheels or fake tickers. The renewal price and period sit on every plan card ("Then $49.99 every month. Cancel anytime."). The only struck prices are on the sale screens (#19-#21), and they compare the same plan's regular first price. The fair-use cap behind "unlimited" is disclosed. The paywall X is visible from the first frame and opens the lifetime last step; there is no free tier (hard paywall).
- **Visible AI disclosure** on every chat screen, and **never monetizing in her voice**: the paywall and sale screens are the app talking.

Visual: the ChatChi/ChatChi system as-is (near-black, raspberry-pink primary, Plus Jakarta Sans headlines, Inter body, lucide icons). Portraits are painterly romance/game-character illustrations, never photoreal, always fully clothed, relaxed friendly poses. The preview card (portrait + spec chips) is the funnel's hero object and the only 3D element. Confirm against the ChatChi brand kit.

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
**Error state:** Under 18 → blocking screen: "Sorry, ChatChi is for adults" / "You must be 18 or older to continue." No back button.
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

---

## E. Gate and first chat

### 16. She texts first (2-message taste)
**Purpose:** The added taste: she opens in his scene, in his sliders' tone, with reply chips. He sends 2 messages; she is "typing", then the email screen (#17) opens.
**Headline A:** {{gf}}
**Headline B:** New message from {{gf}}
**Body A:** Tap a reply or write your own.
**Body B:** Your move.
**Options:** (sample for Coffee-shop regular)
- 👋 That's me. Hi, {{gf}}.
- 👀 Were you keeping track?
- ☕ Share the window seat?
- ✏️ Type your own
**Visual:** Chat thread over the dimmed scene backdrop. AI disclosure banner on top. Typing dots, then her opener lands: "Hey, {{name}}, right? The barista yells it every morning. I'm {{gf}}." Her second line follows his strongest slider (warmth: "Honestly? I'm really glad you said hi."). After his second reply her hook lands ("Same table tomorrow? I'll tell you why I really moved here.") with a memory toast ("📓 {{gf}} will remember: work keeps you busy"). Then the reply chips hide, the composer locks, a typing bubble shows for ~1.5 s, and the email screen (#17) opens. Above the composer: "Preview · 2 messages left", then "Preview · 1 message left", then "Preview over · Plus keeps her talking".
**Microcopy:** Top banner: "{{gf}} is an AI character. Fictional, and depicted as an adult." With `{{emoji}}` = yes she adds one emoji per text; with no, none. There is no free tier after these 2 messages (hard paywall). `CONFIG.teaserMessages` sets the count. Events: `chat_message`, `chat_teaser_end`. This is the only chat a non-payer ever sees. Re-entered after the taste, it stays locked (no chips, composer off) and hands off to #17 again.
**CTA:** (reply chips / composer; no Continue button)

### 17. Save her (email, mandatory)
**Purpose:** Collect the email that activates ChatChi Plus and logs him in to the app, right after the taste, framed as saving what he built. Restored to its previous place (after the first chat, before the paywall).
**Headline A:** Save {{gf}} to your account.
**Headline B:** Where should we send {{gf}}'s messages?
**Body A:** We use it to activate your Plus and save your chat.
**Body B:** (same as A)
**Field:** One email input (placeholder "you@example.com"), always open. Must be a valid email to continue. No Google / Apple sign-in, no guest skip.
**Visual:** Adapted `s40-acc-02`, with her avatar small above the headline. Input under the body, CTA pinned at the bottom.
**Error states:** "Enter your email to continue" (empty) · "Enter a valid email, like name@example.com"
**Microcopy:** "No spam. By continuing you agree to the Terms and Privacy Policy." Terms of Service and Privacy Policy links. Events: `lead` (method email; FunnelFox build calls `inputs.setEmail`), `email_invalid`. The email is never sent in tracking payloads.
**Skip link:** none
**CTA:** Save my chat

---

## F. Monetization

### 18. Paywall (1 / 3 / 12 months)
**Purpose:** Honey's 3-plan ask at peak investment, right after the taste, made honest. It sells more of the loop in the app's voice, never hers.
**Headline A:** {{gf}} wants to keep talking.
**Headline B:** Keep {{gf}} talking, every day.
**Body A:** Unlimited chat, deeper memory, and every scene.
**Body B:** No coins. No per-message charges. Cancel anytime.
**Plans:** (Paddle, one price per checkout) Each card shows the first-period price, then "Then {{renewal}} {{period}}. Cancel anytime."
- 1 month — $24.99 first month, then $49.99 every month
- 3 months — $49.99 first 3 months, then $109.99 every 3 months
- **12 months — pre-selected**, "Best value" badge, $119.99 first year, then $299.99 every year
**Visual:** A web landing page, long scroll (web2app, 2026-10-06; not an app sheet), the same page wherever the paywall opens. Top to bottom:
1. **Sticky top bar:** ChatChi logo, close (×) visible from the first frame (right), a "Get Plus" mini CTA that fades in once plan block #1 has scrolled away and jumps back to it. "Restore" only when `CONFIG.app.restoreUrl` is set.
2. **Personal hero:** her full-bleed portrait (the painted image for his hair pick, SVG fallback), eyebrow "{{gf}} is waiting" (after the taste) or "Your girlfriend is ready", headline + body, then fact chips from his picks: "{{gf}} · private to {{name}}", Hair, Eyes, Style, Vibe (top slider trait), Scene.
3. **Plan block #1:** one elevated card: "Choose your plan", the 3 plan cards, "Due today" row (selected plan's first price), CTA, "Secure checkout · Cancel anytime", payment badges (Apple Pay · G Pay · VISA · Mastercard · PayPal), and the selected plan's renewal line.
4. **What you get:** eyebrow + "Everything in ChatChi Plus", six benefit rows with gradient icon wells and one honest line each.
5. **Your story so far:** a chat mock with his own last taste messages in his scene, the AI disclosure, and "Her next message is waiting in the app".
6. **How it works:** 3 steps: pick your plan and check out · get the ChatChi app · log in with {{email}} (Plus is already on).
7. **Why go Plus (honest proof):** four product facts, no stats or reviews: "{{n}} picks" (every one is in her), "0 coins" (no per-message fees), "3 plans" (today's and the renewal price shown before paying), "Private" (chats never public).
8. **FAQ accordion:** Can I cancel anytime? · When do I get Plus? · Will I be charged again? · Is it private? · Is she a real person? · What happens after I pay?
9. **Plan block #2:** the same component, titled "Keep {{gf}} talking".
10. **Footer:** logo, renewal + fair-use lines, AI/18+ disclosure, "Support: support@chatchi.co", Terms of Service and Privacy Policy.
11. **Sticky bottom CTA bar:** "{{price}} today" + "{{plan}} · then {{renewal}} {{period}}" + Continue. It shows only while neither plan block is on screen, and the scroll content has bottom padding so it never covers the footer. Picking a plan updates both blocks and the bar in place (no re-render).
Headline A reads "Talk without counting messages." when the paywall opens any other way than after the taste.
**Microcopy:** Benefit rows: "Unlimited chat with {{gf}}" (Talk as long as you like. No coins, no per-message fees. Fair use: up to 300 messages a day.) · "She remembers more" · "Edit her anytime" · "Every scene" · "A daily hello" · "Unlimited reply ideas". FAQ answers: cancel in account or store settings before the next renewal, Plus stays on until the end of the paid period · Plus starts right after checkout, log in to the app with the email saved on #17 · each plan's first price and renewal price · chats are never public, delete her or any chat anytime · she is an AI character, fictional, depicted as an adult, SFW · after paying you see how to get the app and pick up the chat. Fair-use: "Unlimited means normal use — capped at 300 messages a day to stop abuse." Legal: "Auto-renews at the price and period shown until cancelled. Cancel anytime in account or store settings." Terms of Service and Privacy Policy links (squad-xteam.com). No stats or reviews block: there are no sourced numbers or real reviews yet.
**Checkout flow:** Tapping a plan card opens that plan's checkout straight away (the CTA does the same for the selected plan). Leaving a checkout without paying opens the sale screen of the same plan (#19-#21). Closing the paywall (X) opens the lifetime last step (#22), every time. Its "No thanks" / X brings him back here. There is no free path.
**Skip link:** none (hard paywall; the X opens #22)
**CTA:** Continue — $119.99 first year (follows the selected plan: "Continue — $24.99 first month", "Continue — $49.99 first 3 months")

### 19. Sale - 1 month (after leaving the 1-month checkout)
**Purpose:** A second, cheaper first period for the plan he already chose, instead of a generic downsell.
**Headline A:** Keep {{gf}} for less
**Body A:** Your 1 month plan at a lower first price.
**Plans:** ChatChi Plus · 1 month: $22.99 for the first month with the regular first-month $24.99 struck (same plan length only), then $49.99 every month until cancelled.
**Visual:** Same look as the paywall: top bar with the ChatChi logo and close X, eyebrow "Special offer · 1 month", headline and body, then one pink-bordered, softly glowing card: her avatar, "ChatChi Plus · 1 month", price row (struck regular → sale, "first month"), 3 checks (Unlimited chat with {{gf}} · Deeper memory of your chats · Every scene, plus a daily hello), CTA, renewal line. AI disclosure under the card, then a plain "No thanks" link and legal links.
**Microcopy:** Renewal line: "$22.99 for the first month, then $49.99 every month until you cancel. Cancel anytime in account or store settings." Accept → checkout of the `m1_sale` price. "No thanks", the X, or leaving that sale checkout without paying → #22 lifetime. Events: `sale_view`, `sale_accept` + `checkout_click` (plan `m1_sale`), `sale_decline`, `checkout_decline`.
**CTA:** Claim 1 month offer

### 20. Sale - 3 months (after leaving the 3-month checkout)
**Purpose:** Same as #19 for the 3-month plan.
**Headline A:** Keep {{gf}} for less
**Body A:** Your 3 months plan at a lower first price.
**Plans:** ChatChi Plus · 3 months: $44.99 for the first 3 months, regular $49.99 struck, then $109.99 every 3 months.
**Visual:** As #19, eyebrow "Special offer · 3 months".
**Microcopy:** Accept → `m3_sale` checkout. Decline or leave → #22.
**CTA:** Claim 3 months offer

### 21. Sale - 12 months (after leaving the 12-month checkout)
**Purpose:** Same as #19 for the 12-month plan.
**Headline A:** Keep {{gf}} for less
**Body A:** Your 12 months plan at a lower first price.
**Plans:** ChatChi Plus · 12 months: $105.99 for the first year, regular $119.99 struck, then $299.99 every year.
**Visual:** As #19, eyebrow "Special offer · 12 months".
**Microcopy:** Accept → `y12_sale` checkout. Decline or leave → #22.
**CTA:** Claim 12 months offer

### 22. Lifetime - last-chance offer
**Purpose:** The last ask after a paywall close or a declined sale: one payment, no subscription. Replaces the old one-size last-chance offer (`CONFIG.offer.enabled` is now false).
**Headline A:** Keep {{gf}} forever
**Body A:** One payment. No subscription, nothing to renew.
**Plans:** ChatChi Plus · Lifetime: $99.99 paid once, no renewal (a one-time product, not a subscription SKU).
**Visual:** As #19, eyebrow "Last offer · pay once", price row "$99.99 · paid once", checks "Unlimited chat with {{gf}}, forever · Deeper memory of your chats · Every scene, every update".
**Microcopy:** Fine print: "$99.99 once. No renewal, nothing to cancel." Accept → `lifetime` checkout. "No thanks", the X, or leaving the lifetime checkout (`CONFIG.declineFlow.lifetime` = `paywall`, FunnelFox native × too) → back to the #18 paywall. Shown after every paywall close and every declined sale.
**CTA:** Get lifetime access

---

## G. Payoff

### 23. Add-on upsell (after a subscription purchase)
**Purpose:** One more ask while intent is highest: a one-time extra on top of the plan he just bought. The plan is not touched.
**Headline A:** Add a second girlfriend
**Body A:** One more story, one more voice. Yours to keep.
**Plans:** ChatChi · Bonus character, $22.99 paid once (a one-time product with its own Paddle price, hidden plan key `addon`, its own checkout). The subscription just bought stays as it is.
**Visual:** The #19 offer look. Eyebrow "You're in · one more thing", her avatar with "ChatChi · Bonus character / One-time add-on · {{gf}} stays yours", price row "$22.99 paid once", 3 checks (Create a second girl from scratch · Her own memory and chats · Paid once, no renewal), CTA, fine print, "No thanks". All copy lives in `CONFIG.upsell`.
**Microcopy:** Fine print: "$22.99 once. Your plan stays as it is." Accept → `addon` checkout; paid → #24 with the add-on line; left or "No thanks" / X → #24 without it. Lifetime buyers (#22) skip this screen. Events: `upsell_accept` (plan `addon`), `upsell_decline`, `checkout_decline`, `purchase_complete` (plan `addon`).
**CTA:** Add for $22.99
**Screen name in code stays `upsell_lifetime`** (the FunnelFox build and tests key on it).

### 24. Get the app
**Purpose:** Hand payers to the app, where the product lives.
**Headline A:** You're in. {{gf}} is waiting.
**Body A:** Your chat continues in the ChatChi app.
**Add-on line (only when the #23 add-on was paid):** "Bonus character added. Create her in the app."
**Visual:** Gradient check well, 3 numbered steps (Download ChatChi: AI Roleplay Chat · Log in with {{email}} (falls back to "your checkout email") · Open your chat with {{gf}}), "Open the app" CTA, App Store and Google Play badges, "Keep chatting here" link to #25 (unlimited, payers only).
**Microcopy:** Step hints: "From the App Store or Google Play." · "The email you saved your chat with." (fallback "The one you paid with.") · "Plus is already on." Store links and the deep link come from `CONFIG.app`, not set yet. Event: `app_handoff`.
**CTA:** Open the app

### 25. Back in the chat
**Purpose:** Payers only (hard paywall): "Keep chatting here" on #24 lands inside the scene, right after her hook line, not on a catalog grid. A non-payer who reaches it any other way sees the #18 paywall.
**Headline A:** {{gf}}
**Headline B:** {{gf}} · online
**Body A:** Pick up right where you left off.
**Body B:** Unlimited chat is on.
**Visual:** `s18-chat-01`: same thread. No counter; an "Open the ChatChi app" pill under the thread. "Ideas · 3" and "Persona: Default" chips. AI banner on top.
**Microcopy:** A one-time toast after the purchase: "Unlimited chat is on. Enjoy." Top note: "Unlimited chat is on."
**CTA:** (send a message)

### 26. Daily hello (notification opt-in)
**Purpose:** Payers only. Locks the daily loop after the purchase, capped and never needy (romance-stories placement).
**Headline A:** Want a daily hello?
**Headline B:** Let her text first.
**Body A:** One message a day, at your time.
**Body B:** Max one a day. Turn off anytime.
**Field:** Pre-permission sheet with time pills (7 pm default, 12 pm / 7 pm / 9 pm / 10 pm), system prompt only on "Turn on".
**Visual:** Bottom sheet over the dimmed chat, sample lock-screen push with her avatar.
**Microcopy:** Sample push (Coffee-shop): "{{gf}}: Saved the window seat. How was your day? ☕" · Rules: story-flavoured only. Never "you didn't reply", "I miss you", "where are you?", and never payment. Pushes pause after 3 unopened days, no escalation.
**Skip link:** Not now
**CTA:** Turn on

### 27. Daily limit reached (off: hard paywall)
**Purpose:** Not shown. There is no free tier, so no free user ever reaches a message limit. The screen stays in code (`daily_limit` = 21) but a non-payer who lands on it sees the #18 paywall, and payers have no daily counter (fair-use cap only, 300 a day).
**Visual:** Not shown.
**CTA:** none

---

## Notes

- **Screen ids in code** (`demo.html` / `funnel.html` `SCREENS`, unchanged event names): #16 she_texts_first = 16, #17 save_her = 17, #18 paywall = 18, #19-#22 sale_m1 / sale_m3 / sale_y12 / sale_lifetime = 23-26, #23 upsell_lifetime = 27, #24 get_app = 28, #25 back_in_chat = 19, #26 daily_hello = 20, #27 daily_limit = 21. The old last_chance_offer (22) is off and not in the FunnelFox design.
- **Honey 4202-2 mapping (theirs → ours):** 1 ethnicity + hook → #1 hook + age gate, #2 hair colour · 2 age 18-26+ → #3 age 21+ · 3-5 figure/breast/butt → cut, replaced by #4 hair style, #5 eyes, #6 fashion · 6 hair colour → #2 · 7 preferences multi → #7 little details · 9 bridge → #8 · 10 looking for → #10 · 12-18 libido/kink/nudity sliders → #11 warmth/playfulness/flirtiness/talkativeness · 22 "willing to try" → cut · 24 scenarios → #12 SFW meet-cutes · 26 loader + Yes/No → #14 with the emoji question · 29 private summary → #15 · 30 paywall → #18. New: #9 names, #13 trust, #16 first-message taste, #17 email gate, #19-#22 sales and lifetime, #23-#27 payoff.
- **Honey paywall, for reference only (not reused):** 1 month $49.99 → $24.99, 3 months $109.99 → $49.99, 12 months $299.99 → $119.99, all as struck "50% OFF" prices with per-day breakdowns and "Unlock your fantasy". We keep the 1/3/12 structure, the 12-month recommendation and Honey's price points, shown honestly as first-period price then renewal price ("Then $49.99 every month"). We drop the "50% OFF" anchors and per-day framing.
- **Pricing (Paddle, 2026-10-06):** 1 month $24.99 → $49.99/month · 3 months $49.99 → $109.99 / 3 months · 12 months $119.99 → $299.99/year. Sales: $22.99 / $44.99 / $105.99 first period, same renewals. Lifetime $99.99 once (`lifetime`, from #22 only). Add-on $22.99 once (`addon`, from #23 only, its own Paddle price; it does not replace or cancel the plan). No free tier (hard paywall). `CONFIG.declineFlow` maps each checkout's close to its next screen.
- **SFW by construction:** no body-part, figure, libido, kink or nudity inputs; no power-dynamic or age-gap scenarios; her age is 21+ only and every portrait is illustrated, fully clothed and visibly 25+; flirtiness is labeled "sweet flirt" and says so under the sliders; "slow down" works in chat; the 18+ app setting is never shown in the funnel or ads.
- **Compliance:** age gate first; AI banner on #16, #19-#22, #25, #26; no monetization in her voice (paywall and sale screens are the app; pushes are story-flavoured with a 3-day silence rule); fair-use cap disclosed; renewal price and period on every plan card and under every sale CTA; no countdown, wheel or fake ticker; paywall X visible from the first frame; it opens the lifetime last step, which returns to the paywall (hard paywall, no free tier, no free chat after the 2-message taste).
- **Where the live preview lives:** #1 (float), #2-#9 (updates on every tap, small from #9), #11 (trait line), #14 (sketch → colour), #15 (lands as the full profile), #16/#18 (small). It is the only 3D element; screen changes are simple fades.
- **Drop-off risk:** #1 (year wheel on the first screen), #9 (two text inputs; the prefilled suggestion keeps it one tap), #11 (sliders are slower than taps; default 50 means Continue works untouched), #17 email (mandatory, needed to activate Plus), #18. Keep #14 under ~10 s including the question.
- **Monetization:** one subscription with one trigger (#18 paywall after the taste, CVR by plan mix), plus the sale screens (#19-#21), the lifetime last step (#22) and the add-on upsell (#23, take rate among subscription payers). Report each separately. Plan-mix share of 12 months is the key metric for the 3-plan layout.
- **Content ops:** 5 hair-colour portraits × 4 age bands at launch (start with the 25-29 set), 5 scene backdrops, and per scene: an opener, 2 × 3 reply chips, 5 slider-tone lines (warm / playful / flirty / chatty / neutral), a hook line, a memory line per chip, a push line. Everything else (style, eyes, details) is carried by chips until per-style art exists.
- **Skipped on purpose:** photo "moments" and any selfie reward (the SFW line is easier to hold without them at launch; revisit as a hearts reward), and the notification opt-in before the paywall (moved to #26). The only discounts are the per-plan sales (#19-#21) and the lifetime last step (#22), with real terms.
- **A/B first:** (1) Hook A "Design your AI girlfriend" vs. B "She's your type. She texts first." (2) #16 taste on vs. off (straight from #15 to #17, as Honey does) — this measures the change we added. (3) 3-plan 1/3/12 months vs. the ChatChi 2-plan weekly/yearly. (4) #7 details on vs. cut (one screen shorter). (5) #2 before #1's year wheel (first tap is hair colour, age gate on the next screen) — only if legal agrees the gate still precedes any romance content.
