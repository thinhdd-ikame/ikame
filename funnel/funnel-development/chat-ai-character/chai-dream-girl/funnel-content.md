---
niche: chai-dream-girl
display_name: ChatChi - Dream AI Girl (close SFW clone of Honey 4202-2 - 18+)
archetype: companion-chat
subject: person
input: her ethnicity, age band (21+), figure, hair colour, looks multi-pick, what he is looking for, 3 trait sliders, things to do together, favourite scenarios, 3 inline yes/no (selfies, voice notes, good-morning texts)
output: a SFW, clearly adult AI girl built from his picks, revealed on a long-scroll paywall landing page, who texts first in the scenario he picked
screens: 21
monetization: 2-message chat taste (1 chat screen), then a mandatory email screen (the account the subscription is activated on, no Google/Apple sign-in), then a long-scroll paywall (ChatChi Plus - 1 / 3 / 12 months, Paddle); tapping a plan opens its checkout; after a subscription purchase a one-time add-on upsell (Bonus character, $22.99 paid once, the subscription stays), then the get-app screen; leaving a checkout opens that plan's sale (lower first period), then a one-time lifetime last step, then back to the paywall. HARD PAYWALL, no free tier: after the 2-message taste the only way to keep chatting is to pay (updated 2026-10-06)
creative_screens:
  hook-a: 1
  figure: 3
  scenarios: 10
  loader: 11
  reveal: 12
motion: >
  a 2x2 grid of painted portrait cards where each tap lights one up with a violet glow,
  then a blurred portrait slowly sharpens behind three filling progress bars
---

# Funnel Content — ChatChi: Dream AI Girl

ChatChi is ikame's AI character-chat app. This brief is the **Dream AI Girl** funnel for Meta ads → web quiz → web paywall → app, aimed at US men 21+. It is a **close clone of Honey `get-honey.today/4202-2`**. We re-crawled the live flow on 2026-09-30: 12 quiz steps, a 3-row loader with 3 inline yes/no questions, then a long-scroll landing-page paywall. We keep Honey's order, screen count, photo-card grids and paywall section stack. Every sexual input is stripped. Archetype: **companion-chat**, "design her" variant. Honey's 12 steps plus a 2-message chat taste, a mandatory email, per-plan sales, a lifetime last step, the add-on upsell, get-app and the paid web chat. Hard paywall since 2026-10-06: no free tier.

This is a sibling of `../chai-ai-girlfriend/`, which was also modeled on Honey but rebuilt it into a 22-screen, first-chat-before-paywall flow. The two funnels test the same question from different sides. **Dream Girl** tests Honey's shape: short, photo-first, paywall straight after the loader. **Girlfriend** tests ours: longer, names, a first-chat taste, a soft gate.

**Honey 4202-2 as crawled (2026-09-30), step by step → what we do:**

| # | Honey | ChatChi Dream Girl |
|---|---|---|
| 0 | "Create your Dream AI Girl · No limits" + ethnicity (4 photo cards + Choose randomly) | Same layout. "No limits" removed. 18+ confirmation added to the legal line |
| 1 | Her age: 18 / 19-21 / 22-25 / 26+ | 21-24 / 25-29 / 30-35 / 36+ |
| 2 | Figure: Extra skinny / Skinny / Curvy / Thick | Slim / Athletic / Curvy / Petite, all fully clothed |
| 3 | Breast size | **Cut** |
| 4 | Butt | **Cut** |
| 5 | Hair colour (6 photo cards) | Same, 6 cards |
| 6 | "Any specific preferences?" multi: tattoos, freckles, high heels, makeup, stockings, no makeup | Multi: tattoos, freckles, glasses, makeup, natural look, sporty. Heels and stockings cut |
| 7 | Bridge: "Hey handsome, now let me match your freak" (full-bleed photo) | "Now let me match your vibe" |
| 8 | Looking for (multi) | Same 5 options, SFW wording |
| 9 | Sliders at 50%: libido, kink openness, comfort with nudity | Sliders at 50%: warmth, playfulness, sweet flirtiness |
| 10 | "What are you willing to try?" (sexual) | "What would you do together?" (dates, games, travel…) |
| 11 | Favourite scenarios, 8 photo cards (doctor/patient, teacher/student, boss/employee, officer/criminal, royalty, superhero, repairman, massage) | 8 SFW photo cards. Royalty and superhero kept. Power-dynamic and fetish pairs replaced with barista, travel buddies, gaming, neighbours, fantasy, coworkers-at-the-bar |
| 12 | Loader "Analyzing your desires" · "Creating an uncensored version" + inline yes/no: spicy photos / voice messages / special videos | Loader "Getting to know your type" + inline yes/no: selfies / voice notes / good-morning texts |
| 13 | Paywall: countdown "FIRST SUBSCRIPTION DISCOUNT 09:58", "UP TO 70% OFF", struck prices, $/day, match %, 6 benefits, 3 stats, chat mock, 3 "Real review" cards, plans again, 3-day money-back | Same section stack. Countdown, struck anchors and $/day headline cut. Stats and reviews are placeholders until real ones exist. Money-back only if ChatChi actually offers it |

**Deliberately changed, and why:**
- **SFW everywhere.** No breast or butt questions, no libido, kink or nudity sliders, no "willing to try", no power-dynamic or fetish scenarios. No "uncensored", "no limits", "spicy" or "worship" wording. Reason: brand safety, Meta ad policy, store review. **Imagery is the exception:** on request (2026-09-30) the photo cards match Honey's look (photoreal glamour: lingerie-style tops, bodycon, crop tops), never nude, every model visibly adult (about 25+). Before running Meta ads, check the creatives and landing images against Meta's adult-content policy.
- **Age gate.** Honey has none. We add the lightest one that keeps Honey's first-tap hook: the legal line under the cards reads "By continuing you confirm you're 18+". Her age starts at 21. If policy review wants a hard gate, swap in the birth-year wheel from `chai-ai-girlfriend` #1 (see Notes).
- **Ethnicity kept**, as the user asked for a close Honey clone. The labels match Honey's, and "Choose randomly" stays.
- **Honest paywall.** No countdown, no "70% OFF", no struck prices, no per-day price as the big number. Price and renewal period sit on every card and in the CTA line. The fair-use cap behind "unlimited" is disclosed. **Hard paywall (2026-10-06, owner request):** there is no free tier. Closing the paywall opens the lifetime last step, and declining that returns to the paywall. No "Continue free" link anywhere.
- **Placeholder proof.** Stats and reviews render as dashed amber placeholders in the prototype. They must be replaced with real, sourced numbers and real reviews before launch. Never invent them.
- **After the paywall:** only payers chat again: get-app "Keep chatting here" opens the unlimited web chat (#18). Honey drops the user into a chat after checkout. We do the same for payers only. A non-payer who goes back into the taste chat (back button, reload, restore) sees it locked ("Preview ended · unlock ChatChi Plus to keep chatting", no composer, no reply ideas) and is forwarded to the email or paywall.
- **Visible AI disclosure** in the chat. We never monetize in her voice.

Visual: Honey's layout (2x2 photo-card grids with a label bar, segmented progress bar, full-width CTA pinned at the bottom) in the ChatChi system. Near-black ground, primary `#B62CB5`, gradient `#9A2ACB → #D82F99` on icons and the selected-card glow, Plus Jakarta Sans headlines, Inter body. Portraits and scenes are photoreal glamour shots like Honey's: dark moody backgrounds with a violet rim light. There are 33 images, generated with `gemini/gemini-3.1-flash-image` via `gen_images.py`. The OpenAI image models on the gateway return 400 on these prompts.

---

## A. Hook

### 1. Hook + ethnicity
**Purpose:** Mirror the ad and get the first tap on screen one, as Honey does. The tap is the hook.
**Headline A:** Create your Dream AI Girl
**Headline B:** Design her. She texts first.
**Body A:** Pick her look. Then she's all yours.
**Body B:** Two minutes. Private. Fully yours.
**Options:** (2x2 photo cards) Caucasian · Asian · Latina · Black. Full-width ghost button: 🎲 Choose randomly
**Visual:** Centered two-line headline, subline, "Select her ethnicity" label, 2x2 photo portrait cards with a dark label bar at the bottom of each. A tapped card gets a gradient ring and auto-advances.
**Microcopy:** Legal line: "By continuing you confirm you're 18+ and agree to our Terms of Use | Privacy Policy", pinned at the bottom of the screen (always visible before a card tap, also on 375x667). Terms/Privacy are real links (new tab), underlined in light pink, 13px, 40px tap height.
**CTA:** (tap a card, auto-advances)

---

## B. Investment

### 2. Her age
**Purpose:** Honey's step 1, adults only.
**Headline A:** How old should she be?
**Headline B:** Pick her age.
**Body A:** Every character is 21 or older.
**Options:** 21-24 · 25-29 · 30-35 · 36+ (2x2 portrait cards, tall)
**Visual:** Top bar: back chevron, "Create my AI Girl", 9-segment progress bar (one per quiz step, screens 2-10). Tall portrait cards of the same woman at different ages.
**CTA:** (tap, auto-advances)

### 3. Her figure
**Purpose:** Honey's body-type pick, SFW and fully clothed.
**Headline A:** What figure do you prefer?
**Headline B:** Pick her build.
**Body A:** Every body type is beautiful.
**Options:** Slim · Athletic · Curvy · Petite (2x2 full-body cards, casual outfits)
**Visual:** Full-body painted cards, relaxed standing poses, jeans or dresses.
**CTA:** (tap, auto-advances)

### 4. Hair colour
**Purpose:** Honey's step 5, 6 cards.
**Headline A:** Which hair colour on her?
**Body A:** Tap the one that catches your eye.
**Options:** Blonde · Brunette · Black · Red · Pastel · No preference (2x3 cards, the last one a mini collage)
**Visual:** Same card grid, 3 rows, scrolls.
**CTA:** (tap, auto-advances)

### 5. Her look (multi)
**Purpose:** Honey's "Any specific preferences?", SFW details.
**Headline A:** Any specific preferences?
**Body A:** Choose all that you like.
**Options:** Tattoos · Freckles · Glasses · Makeup · Natural look · Sporty (2x3 close-up cards with a checkbox corner)
**Visual:** Checkbox in the bottom-right of each label bar. CTA disabled until one is picked.
**CTA:** Continue

### 6. Bridge
**Purpose:** Honey's pivot line from look to personality, with one full-bleed image.
**Headline A:** Hey handsome, now let me match your vibe
**Headline B:** Nice taste. Now, her personality.
**Body A:** A few taps and she's ready.
**Visual:** Big headline on top, a full-height painted portrait (fully clothed, smiling, holding a notebook), CTA over the bottom fade.
**CTA:** Continue

### 7. Looking for (multi)
**Purpose:** Honey's step 8. Shapes her opening tone.
**Headline A:** What are you looking for?
**Body A:** Choose all that fit.
**Options:** 💘 Romantic stories · 🤝 Friendship · 😊 Sweet flirting · 🫶 A safe, judgement-free space · 🤖 Exploring AI
**Visual:** Full-width option rows, check on the right.
**CTA:** Continue

### 8. Personality sliders
**Purpose:** Honey's 3 sliders at 50%, SFW traits.
**Headline A:** What should she be like?
**Body A:** Drag each one. She'll act like this.
**Field:** 3 sliders, default 50%, each with an icon and a live % chip: Warmth · Playfulness · Sweet flirtiness
**Visual:** Rows in one surface card, gradient icon on the left, % chip on the right.
**Microcopy:** "Flirting stays sweet and SFW."
**CTA:** Continue

### 9. Things to do together (multi)
**Purpose:** Replaces Honey's "willing to try" with SFW shared activities. Seeds her first chat topics.
**Headline A:** What would you do together?
**Body A:** Choose all that sound fun.
**Options:** 🌙 Late-night talks · 🎬 Movie nights · 🎮 Gaming duo · ✈️ Travel plans · 🍝 Cooking dates · ✏️ Other
**CTA:** Continue

### 10. Favourite scenarios (multi)
**Purpose:** Honey's 8-card scenario grid, SFW. The first pick becomes the scene she opens in.
**Headline A:** Any favourite scenarios?
**Body A:** Choose all that excite you.
**Options:** Barista & Regular · Travel Buddies · Royalty & Commoner · Superhero & Villain · Gaming Partners · New Neighbours · Fantasy Quest · Coworkers at the Bar (2x4 scene cards, checkbox corners)
**CTA:** Continue

---

## D. Anticipation

### 11. Getting to know your type
**Purpose:** Honey's 3-row loader with a yes/no card over a blurred portrait at each row. Three more sunk-cost taps that also set real features.
**Headline A:** Getting to know your type
**Steps:**
- Understanding your preferences… → pauses at ~60% for Q1
- Creating your AI girl's personality… → pauses at ~25% for Q2
- Crafting her to your taste… → pauses at ~5% for Q3, then runs to 100%
**Field:** Inline cards: "Would you like her to send selfies?" · "Would you like voice notes from her?" · "Would you like good-morning texts?" Yes / No
**Visual:** A blurred portrait of her fills the top half and sharpens as the bars fill. The question card slides up from the bottom, with "selfies" / "voice notes" / "good-morning texts" in gradient text.
**CTA:** (auto-advances to the first chat at 100%)

### 11b. First chat - 2-message taste (added 2026-10-06)
**Purpose:** Let him feel her before the ask. She texts first in his scenario, he sends 2 messages, and the paywall opens while she is "typing".
**Body A:** (chat) Her opening line, then her scenario hook as the first reply.
**Field:** 3 reply ideas, then one generic reply after his 2nd message.
**Visual:** The #18 chat UI. The counter reads "Free preview". After his 2nd message and her reply, the reply ideas hide, a typing bubble shows for ~1.5 s, then the email screen (#12). This is the only chat screen before the paywall, and he sends at most 2 messages in it.
**Microcopy:** The composer and reply ideas lock as soon as his 2nd message is sent; after the taste the chat never unlocks again without a purchase (it forwards to email / paywall if he comes back to it). `CONFIG.teaserMessages` sets the count. Events: `chat_message`, `chat_teaser_end`, `paywall_view` with placement `chat_teaser`.
**CTA:** (reply chips / composer)

### 12. Email - mandatory (added 2026-10-06)
**Purpose:** Capture the email the subscription is activated on. He logs in to the app with it, so it is required and there is no skip. Email only: no "Continue with Google / Apple" buttons.
**Headline A:** Where should we send {{gf}}'s messages?
**Body A:** We use it to activate your Plus and save your chat.
**Field:** One email input (placeholder "you@example.com", email keyboard, autocomplete). The CTA is disabled while the field is empty. On tap, an invalid address shows "Enter a valid email, like name@example.com" under the field and he stays on the screen.
**Visual:** Her round portrait with a violet ring at the top, headline with her name in gradient text, the input with a mail icon, a small lock line "Private. No spam. You log in to the app with it.", CTA pinned at the bottom.
**Microcopy:** On a valid email: `S.email` is set, `emit('lead',{method:'email',placement:'pre_paywall'})` fires (the FunnelFox build hooks it and calls `inputs.setEmail`), then the paywall (#13) opens. Tracking sends only `hasEmail`, never the address. Screen name `email`.
**CTA:** Save my chat

---

## F. Monetization

### 13. Paywall — long scroll
**Purpose:** A web landing page, not an app sheet (web2app; long scroll, updated 2026-10-06): his girl, the plans, what he gets, how it works, honest proof, FAQ, the plans again.
**Eyebrow:** Your AI girl is ready
**Headline A:** Your AI girl is ready for you
**Headline B:** {{gf}} is ready for you
**Body:** {{gf}} wants to keep talking. (after the chat taste) / Built from every pick you made. (when opened any other way)
**Plans:** 1 month · 3 months · 12 months (12 months pre-selected, "Most popular" ribbon). Each card: radio, plan name, "Then {{renewal}} every {{period}}. Cancel anytime.", and the first-period price on the right with "first {{period}}" under it. 1 month $24.99, then $49.99/month · 3 months $49.99, then $109.99 every 3 months · 12 months $119.99, then $299.99/year (Paddle, one price per checkout).
**Visual:** One scroll container, sections ~34px apart, each with a pink uppercase eyebrow + bold H2. Top to bottom:
1. **Sticky top bar:** ChatChi logo, a mini CTA "Meet {{gf}}" that fades in once the hero scrolls away (scrolls to plan block 1), close X.
2. **Personal hero:** her portrait (his ethnicity + hair colour picks: the ethnicity card when the hair matches its default or "No preference", else the matching ethnicity x hair portrait, `img/her-<ethnicity>-<hair>.jpg`; same portrait on loader, chat, email, sales, add-on), eyebrow + headline over the bottom fade; under it 4 fact tiles from his answers (Her look: ethnicity · hair, Age, Figure, First story: his first scenario) and vibe chips from his sliders and looks.
3. **Plan block 1:** one elevated card: eyebrow "Choose your plan", "Keep talking with {{gf}}", the 3 plan cards, "Due today {{price}} today", CTA "Get my AI girl", payment badges (Apple Pay · G Pay · VISA · Mastercard · PayPal), "Secure checkout · Cancel anytime", the selected plan's renewal line, auto-renew and fair-use fine print.
4. **What you get:** "Everything in ChatChi Plus", 2-column tiles with gradient icons (Unlimited chat · Selfies · Voice notes · Every scenario · She remembers · Good-morning texts).
5. **A taste of Plus:** "She texts first" chat mock with her opening line in his scenario and the AI disclosure.
6. **How it works:** Checkout → Get the app (ChatChi: AI Roleplay Chat, App Store / Google Play) → Log in with {{email}}.
7. **Why go Plus:** product facts, not social proof: 24/7 (she texts back, day or night) · 8 (scenarios, switch anytime) · 1 of 1 (built from your own picks). No invented stats or reviews; a reviews block shows only if `CONFIG.reviews` holds real store reviews.
8. **FAQ (accordion, first open):** When do I get her? · Can I cancel anytime? · Will I be charged again? · Is it private? · What happens after I pay? · Is {{gf}} a real person?
9. **Plan block 2:** the same card again. Money-back block only if the policy exists (`CONFIG.moneyBack`).
10. **Footer:** logo, Terms of Use · Privacy Policy, "Support: support@chatchi.co", AI/adult disclosure, 18+.
11. **Sticky bottom CTA:** "{{plan}} plan · {{price}} today" + "Get my AI girl"; solid background; shown from the first view whenever no plan-block CTA is on screen (so price + CTA are visible on first view at 375x667 and 430x932), hidden while a plan-block CTA is visible. The footer has bottom padding so the bar never covers its last line.
The same page opens from every entry (onboarding, the lifetime step's "No thanks", a closed lifetime checkout, the retired daily-limit sheet).
**Microcopy:** Renewal line for the selected plan: "{{price}} today for your first {{period}}, then {{renewal}} {{every period}} until you cancel." Under it: "Auto-renews at the price and period shown until cancelled. Cancel anytime in account or store settings. Unlimited = normal use, capped at {{cap}} messages a day." FAQ answers: get it right after checkout in the app with the same email; cancel in account/store settings or via support@chatchi.co before renewal; yes it renews at the regular price unless cancelled; the chat is private to his account, email only for login and receipts, no spam; after paying he sees how to get the app and can also keep chatting on the web; she is an AI character, fictional, depicted as an adult, SFW. No "Continue free" link.
**Checkout flow:** tapping a plan card opens that plan's checkout straight away (the CTA does the same for the selected plan). Leaving a checkout without paying opens the sale screen of the same plan (#14-#16). Closing the paywall (X) opens the lifetime last step (#17) every time; declining #17 returns here. There is no free path.
**CTA:** Get my AI girl

### 14. Sale - 1 month (after leaving the 1-month checkout)
**Purpose:** A second, cheaper first period for the plan he already chose, instead of a generic downsell.
**Headline A:** Keep {{gf}} for less
**Body A:** Your 1 month plan at a lower first price.
**Plans:** ChatChi Plus · 1 month: $22.99 for the first month with the regular first-month $24.99 struck (same plan length only), then $49.99 every month until cancelled.
**Visual:** Same web look as the paywall: top bar with the ChatChi logo and close X, eyebrow "Special offer · 1 month", her portrait thumbnail, price row (struck regular → sale, "first month"), 3 checks, CTA, renewal line, plain "No thanks" link, legal links, AI disclosure.
**Microcopy:** Accept → checkout of the `m1_sale` price. "No thanks", the X, or leaving that sale checkout without paying → #17 lifetime. Events: `sale_view`, `sale_accept` + `checkout_click` (plan `m1_sale`), `sale_decline`, `checkout_decline`.
**CTA:** Claim 1 month offer

### 15. Sale - 3 months (after leaving the 3-month checkout)
**Purpose:** Same as #14 for the 3-month plan.
**Headline A:** Keep {{gf}} for less
**Body A:** Your 3 months plan at a lower first price.
**Plans:** ChatChi Plus · 3 months: $44.99 for the first 3 months, regular $49.99 struck, then $109.99 every 3 months.
**Visual:** As #14, eyebrow "Special offer · 3 months".
**Microcopy:** Accept → `m3_sale` checkout. Decline or leave → #17.
**CTA:** Claim 3 months offer

### 16. Sale - 12 months (after leaving the 12-month checkout)
**Purpose:** Same as #14 for the 12-month plan.
**Headline A:** Keep {{gf}} for less
**Body A:** Your 12 months plan at a lower first price.
**Plans:** ChatChi Plus · 12 months: $105.99 for the first year, regular $119.99 struck, then $299.99 every year.
**Visual:** As #14, eyebrow "Special offer · 12 months".
**Microcopy:** Accept → `y12_sale` checkout. Decline or leave → #17.
**CTA:** Claim 12 months offer

### 17. Lifetime - last-chance offer
**Purpose:** The last ask before he returns to the paywall: one payment, no subscription.
**Headline A:** Keep {{gf}} forever
**Body A:** One payment. No subscription, nothing to renew.
**Plans:** ChatChi Plus · Lifetime: $99.99 paid once, no renewal (a one-time product, not a subscription SKU).
**Visual:** As #14, eyebrow "Last offer · pay once", price row "$99.99 · paid once", checks "Unlimited chat with {{gf}}, forever · Selfies and voice notes · Every scenario, every update".
**Microcopy:** Accept → `lifetime` checkout. "No thanks", the X, or leaving the lifetime checkout (FunnelFox native × too, `declineFlow.lifetime: 'paywall'`) → back to the paywall (#13). Shown every time the paywall is closed. Fine print: "$99.99 once. No renewal, nothing to cancel."
**CTA:** Get lifetime access

---

## G. Payoff

### 20. Add-on upsell (after a subscription purchase)
**Purpose:** One more ask while intent is highest: a second companion, paid once. The plan he just bought stays as it is.
**Headline A:** Add a second companion
**Body A:** One more story, one more voice. Yours to keep.
**Plans:** Bonus character, $22.99 paid once (one-time add-on, its own Paddle price, checkout `addon`; hidden on every plan list). Screen name stays `upsell_lifetime` for the FunnelFox build.
**Visual:** The #14 offer look. Eyebrow "You're in · one more thing", "Bonus character / Add-on to your ChatChi Plus" beside her thumbnail, price row "$22.99 paid once", 3 checks (Create a second companion from scratch · Their own memory and chats · Paid once, no renewal), CTA, fine print, "No thanks". All copy lives in `CONFIG.upsell`.
**Microcopy:** Fine print: "$22.99 once. Your plan stays as it is." Accept → `addon` checkout; paid or left → #21 (paid adds the line "Bonus character added. Create them in the app."). Lifetime buyers (#17) skip this screen. Events: `upsell_accept` (plan `addon`), `upsell_decline`, `purchase_complete` (plan `addon`).
**CTA:** Add for $22.99

### 21. Get the app
**Purpose:** Hand payers to the app, where the product lives.
**Headline A:** You're in. {{gf}} is waiting.
**Body A:** Your chat continues in the ChatChi app.
**Visual:** Gradient check well, 3 numbered steps (Download ChatChi: AI Roleplay Chat · Log in with {{email}}, the address from #12, "The email you gave us, where Plus is active." · Open your chat with {{gf}}), "Open the app" CTA, the official black App Store ("Download on the App Store") and Google Play ("GET IT ON Google Play") badge artwork, both calling openApp(), "Keep chatting here" link back to #18 (unlimited). After a paid add-on (#20) a check line under the body: "Bonus character added. Create them in the app."
**Microcopy:** Store links come from `CONFIG.app`, not set yet.
**CTA:** Open the app

### 18. She texts first
**Purpose:** Paid only. The same chat as #11b, continued, for payers (via #21 "Keep chatting here"): unlimited, no counter. A non-payer can't reach it; any route that would land him here goes to the paywall.
**Headline A:** {{gf}}
**Body A:** (chat) Her opening line, in the first scenario he picked, shaped by his sliders and the yes/no answers
**Visual:** Chat UI, scene image behind the messages, AI disclosure pinned at the top, 3 reply ideas, "Open the ChatChi app" link instead of a counter.
**Microcopy:** "{{gf}} is an AI character. Fictional, and depicted as an adult."
**CTA:** (reply chips / composer)

### 19. Daily limit (retired: unreachable since the hard paywall)
**Purpose:** Was the free tier's second paywall trigger. The code stays in the demo, but a non-payer is never in a chat after the taste and payers have no daily count, so it never shows.
**Headline A:** You've used today's {{n}}.
**Body A:** Resets at midnight. Or chat without limits.
**Visual:** Card inside the chat, crown icon in gradient.
**CTA:** Upgrade to ChatChi Plus

---

## Notes

- **Why this exists beside `chai-ai-girlfriend`:** it is the Honey-shaped control. Run them against the same ad set. Measure quiz completion, paywall view → checkout, and D1 retention separately for each.
- **Drop-off risk** sits at #1 (no year gate means low friction but weak age assurance). Since 2026-10-06 the girlfriend funnel's 2-message taste (#11b) and the mandatory email (#12) sit between the loader (#11) and the paywall (#13), so the two funnels now differ mainly in quiz length and photo-first design.
- **Age gate A/B:** A = legal-line confirmation (Honey-like). B = birth-year wheel before #1. Keep B ready for policy review.
- **Monetization:** hard paywall, no free tier. One subscription, one trigger: the onboarding paywall (#13), plus the per-plan sales (#14-#16), the lifetime last step (#17) and the post-purchase one-time add-on (#20, Bonus character $22.99). Report each separately. Every paywall view comes after the email (#12), so each lead is reachable for activation and win-back.
- **Inline yes/no answers are real settings** (selfies, voice notes, good-morning texts). They must map to app features or notification opt-ins, not be decorative.
- **Before launch:** real prices, real stats and reviews (or cut those sections), money-back policy confirmed or the block removed, legal URLs.
