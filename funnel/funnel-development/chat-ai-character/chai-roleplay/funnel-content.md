---
niche: chai-roleplay
display_name: ChatChi - AI Roleplay (any genre - 18+)
archetype: companion-chat
subject: person
input: birth year (18+ gate), genre, your role, setting, companion, tone, character name, two in-scene actions, email (required)
output: a live roleplay scene already in progress, with a companion who remembers every choice you made
screens: 23
monetization: 2-message scene taste, the cliffhanger, a required email screen (the account Plus is activated on), then a long-scroll paywall (ChatChi Plus - 1 / 3 / 12 months, 12 months pre-selected, Paddle); tapping a plan opens its checkout; after a subscription purchase a one-time $22.99 bonus-character add-on (the plan stays), then the get-app screen; leaving a checkout opens that plan's sale (lower first period), then a one-time lifetime last step whose decline returns to the paywall. Hard paywall: no free tier, no free chat after the 2-message taste; the web chat (#21) is for payers only
creative_screens:
  hook-a: 1
  genre-pick: 3
  companion-pick: 6
  reveal: 11
  first-scene: 12
  cliffhanger: 14
  paywall: 16
motion: >
  a closed storybook cracks open into a lit scene, a chat bubble types in from the
  companion, three action chips slide up and the picked one glows before the scene shifts
---

# Funnel Content - ChatChi: AI Roleplay

ChatChi is ikame's AI character-chat app. This is the **roleplay niche** funnel for Meta ads, then web quiz, then web paywall, then app, aimed at US/UK adults 18-34 who already play character chat and tabletop-style stories. The user gives an age, a genre, a role, a setting, a companion, a tone and a name, then plays two real turns of a scene, hits a cliffhanger and saves the story with an email before the paywall opens. They get a roleplay that is already running, with a companion who remembers what they chose. Archetype: **companion-chat**, variant "scene first": the unit of value is a live scene, so the first-scene taste sits *before* the gate and paywall. 23 screens (updated 2026-10-06: 2-message taste, cliffhanger and required email restored, no social sign-in, 1/3/12-month plans, per-plan sales, lifetime last step, add-on upsell, get-app).

**Reference funnels (research `nebula-chai.md` section 5, captured 2026-09-27/28, AdSpyLab):**
- **Whisper Stories** `getmywhisper.com/quiz-landing` (8,110 ads, 33 screens): ROLEPLAY is only one option on a format screen. The quiz is scenario hooks, setting, dynamic, pacing, then a loader with yes/no popups, an email gate and a countdown paywall with struck-through prices.
- **Honey** `get-honey.today/4902-2` (21 screens): a "favourite roleplay scenarios" card grid, then a loader, then a paywall.
- **Market gap:** Talkie, PolyBuzz, Character AI, Chai, Janitor and similar run app-install ads only. Rolechat, the one roleplay quiz funnel, has been dead since 2026-03-22. No roleplay web funnel is live today. Reading is [V] for Whisper and Honey; the "open lane" claim rests on a brand search done 2026-10-01, so treat it as unverified for brands outside the library.

**Kept:** scenario/setting card picks (Honey), the loader with one inline yes/no (Whisper), the named-character match card.

**Deliberately changed:**
- **All genres, not just romance.** Fantasy, mystery, sci-fi, romance and horror sit side by side. Whisper and Honey are sexual in every branch.
- **SFW end to end.** No explicit, taboo, kink or dynamic inputs, no "uncensored" claim. Horror means suspense, not gore.
- **18+ gate first** (real birth year, blocking under-18), where Whisper asks age as question three.
- **Play before paying:** two real turns in the scene, then the paywall. The competitors paywall straight after a loader.
- **No countdown, no fake personas, no fake match percentages.** Renewal price sits next to every price. The only struck price is a plan's own regular first period on its sale screen.
- **AI disclosure** visible on every chat screen.

Visual: the ChatChi system (near-black, magenta-violet gradient primary, Plus Jakarta Sans headlines, Inter body, lucide icons, same tokens as `../chai-dream-girl/`). Genre cards carry a per-genre accent (amber fantasy, teal mystery, cyan sci-fi, rose romance, crimson horror) and a storybook framing so it reads as "a story you play", not a dating app. Image set is stylised illustration, never photoreal people. Confirm against the ChatChi brand kit.

---

## A. Hook

### 1. Hook
**Purpose:** Mirror the ad promise and sell the open door: any genre, any role, you are the main character.
**Headline A:** Step into any story.
**Headline B:** Play the story. Live.
**Body A:** Pick a genre. Your companion plays the rest.
**Body B:** AI roleplay where your choices change the scene.
**Visual:** Near-black ground. A closed storybook in the centre cracks open and spills five small genre scenes (dragon spire, rainy alley, orbit station, candlelit ballroom, fog lighthouse) as a fan of tilted cards, with a soft violet-magenta glow. Logo and a slim "AI roleplay" tag on top.
**Microcopy:** Under the CTA: "18+ · AI-generated · All characters are fictional"
**CTA:** Start my story

---

## B. Investment

### 2. Age gate
**Purpose:** Clear the legal gate before any genre or role question. A real year picker, not a tick box, and under-18 is a hard stop.
**Headline A:** Adults only. Quick check.
**Headline B:** When were you born?
**Body A:** ChatChi roleplay is for people 18 and older.
**Body B:** We only use this to confirm your age.
**Field:** Birth month + year selects, no default. CTA stays disabled until both are picked. A failed check is persisted for the session (`sessionStorage`), so a reload does not clear the block.
**Visual:** Dimmed storybook cover behind a rounded `surface` box holding the year select. Pink CTA pinned at the bottom.
**Microcopy:** "AI-generated stories · All characters are fictional and 18+" · Footer: Terms of Service · Privacy Policy
**Error state:** Under 18 gives a blocking screen: "Sorry, ChatChi is for adults" / "You must be 18 or older to continue." No back button, no way in.
**CTA:** Continue

### 3. Genre (first story tap)
**Purpose:** The first real choice. The genre sets the cast, the setting and the voice of the whole scene.
**Headline A:** Pick your genre.
**Headline B:** What kind of story?
**Body A:** It sets the world, the cast, the stakes.
**Body B:** You can switch genres anytime later.
**Options:**
- 🐉 Fantasy
- 🔍 Mystery
- 🚀 Sci-fi
- 💘 Romance
- 👻 Horror
- ✏️ Other
**Field:** Single select, tap advances. "Other" opens a one-line input ("pirates", "post-apocalypse"). The CTA is disabled while it is empty, and a non-empty value is matched to the nearest of the five genres. Sets `{{genre}}`.
**Visual:** Two-column grid of tall storybook-style cards, one per genre, with its accent colour and a small scene illustration. The sixth tile is a plain dashed "Other" card. The picked card lifts and flips its page.
**CTA:** (advances on tap, or Continue after Other)

### 4. Your role
**Purpose:** Casts the user inside the story. A role gives the companion something to react to.
**Headline A:** Who are you here?
**Headline B:** Pick your role.
**Body A:** The scene is written around you.
**Body B:** Change it anytime in the app.
**Options:**
- 🦸 The hero
- ⚔️ The rival
- 🧳 A stranger
- ✏️ Other
**Field:** Single select. "Other" opens a one-line input ("the detective", "stowaway"); the CTA is disabled while it is empty. Sets `{{role}}`.
**Visual:** Four wide rows with a small silhouette icon each, tinted in the genre accent. The selected row fills pink.
**CTA:** Continue

### 5. Setting
**Purpose:** Where the scene opens. Three settings per genre keep the choice cheap and the world concrete.
**Headline A:** Where does it begin?
**Headline B:** Choose your opening scene.
**Body A:** Three places. Each starts differently.
**Body B:** Tap a card to set the scene.
**Options:** (sample for Fantasy)
- 🏰 Ember Keep
- 🌲 Whisperwood
- 🌊 Drowned Harbour
**Field:** Single select, tap advances. Cards change with `{{genre}}`. Sets `{{setting}}`.
**Visual:** Three tall setting cards stacked as a horizontal swipe row, each a painted scene in the genre palette with the place name in a serif.
**CTA:** (advances on tap)

### 6. Companion
**Purpose:** Who plays opposite the user. Three named characters per genre, and the pick is the persona moment.
**Headline A:** Who's by your side?
**Headline B:** Meet your companion.
**Body A:** They stay with you and remember everything.
**Body B:** Pick one. They play the story with you.
**Options:** (sample for Fantasy)
- 🛡️ Kael · sworn knight
- 🔮 Mira · rogue mage
- 🐺 Fenn · shapeshifter
**Field:** Single select, tap advances. Each card shows a portrait, a name and a one-line voice sample. Sets `{{comp}}`.
**Visual:** Three portrait cards (illustrated, adult, clothed) with a name plate and a short quote under each. The picked card glows pink.
**Microcopy:** Small caption: "AI characters. Illustrations only."
**CTA:** (advances on tap)

### 7. Tone
**Purpose:** The last cheap tap. It sets how the companion talks and how the scene escalates.
**Headline A:** Set the tone.
**Headline B:** How should it feel?
**Body A:** Last choice before your name.
**Body B:** It changes how your companion speaks.
**Options:**
- 😄 Playful
- 🌑 Dark
- ⚡ Epic
**Field:** Single select, tap advances. Sets `{{tone}}`.
**Visual:** Three large cards, each with a mini storybook spread in a different mood (bright, shadowed, golden sky). Cards use the genre accent.
**CTA:** (advances on tap)

### 8. Your character name
**Purpose:** Captures `{{name}}` before the story is written. The companion says it aloud in scene one, which is the moment the story becomes yours.
**Headline A:** What's your name here?
**Headline B:** Name your character.
**Body A:** Your companion will use it. Change it anytime.
**Body B:** Real name or a character name. Your call.
**Field:** Text, 1-20 chars, with a shuffle button for fitting names ("Wren", "Ash", "Juno"). CTA disabled while empty. If the user skips, the fallback name is "Traveler".
**Visual:** Plain input on near-black, pink shuffle icon, the picked companion's portrait blurred behind.
**Skip link:** Choose one for me
**Error state:** "Add a name so your companion can use it"
**CTA:** Continue

---

## C. Trust

### 9. Fiction, and yours
**Purpose:** Trust beat before the story is written. Privacy and "it is fiction" are the category's first worries, and this needs no stats.
**Headline A:** Fiction. Private. Yours.
**Headline B:** Your story stays yours.
**Body A:** No one else reads your choices. Delete anytime.
**Body B:** Every line is written by AI, for you.
**Visual:** Three lucide icon rows (lock, trash, sparkles) on near-black with a faint paper texture. B variant swaps in a real store rating and one real review once ChatChi has them.
**Microcopy:** Rows: "Your chats are never public" · "Delete your story anytime" · "Characters are AI and fictional" · Footer: "You can read the rules any time: Terms · Privacy"
**CTA:** Write my story

---

## D. Anticipation

### 10. Writing your scene (loader)
**Purpose:** Manufacture the wait and make the scene feel built from the answers. One inline yes/no (Whisper pattern) changes the companion's behaviour for real.
**Headline A:** Writing {{name}}'s scene...
**Headline B:** Your story is taking shape...
**Steps:**
1. Reading your genre and role...
2. Casting your companion's voice...
3. Building the opening scene...
4. Almost ready, curtain rising...
**Visual:** The storybook from the hook closes, then its cover inks in with `{{genre}}` art. Four progress rows beneath: label left, % right, check when done, thin gradient bars.
**Microcopy:** At about 50% one inline question slides up: "Should your companion remember your choices?" · "Yes, remember" / "Fresh each time". Default Yes. It sets a real memory setting, and the demo shows it in scene two.
**CTA:** (auto-advances, ~7 seconds)

### 11. Story reveal
**Purpose:** The payoff frame and the best ad image: a titled story with a named cast, visibly built from the picks. Replaces a fake "match %".
**Headline A:** {{story_title}}
**Headline B:** Meet {{comp}}.
**Body A:** You are {{role}}. {{comp}} plays opposite you.
**Body B:** Built from your genre, role and tone.
**Visual:** Full-bleed illustrated cover with the title, the companion portrait, the user's role tag, the setting name and tone chip. A small "Chapter 1 · live scene" pill. No catalog grid below it.
**Microcopy:** Sample for Fantasy + Kael + Ember Keep: title "The Last Ember". Bio: "Sworn to guard the keep. Notices more than he says." · Caption: "Illustration. {{comp}} is an AI character."
**CTA:** Begin the scene

### 12. Scene, turn 1
**Purpose:** The demo in one tap. The companion opens the scene by name, and three action chips mean nobody faces a blank box. Engine screen `scene_turn_1`.
**Headline A:** The scene begins.
**Headline B:** {{comp}} speaks first.
**Body A:** Pick an action, or type your own.
**Body B:** Three ways forward. Or write yours.
**Options:** (sample for Fantasy, generated per genre)
- 🗡️ Draw your blade
- 🕯️ Step into the light
- 🤐 Say nothing
**Field:** Tap a chip or type in the composer. Any typed line counts as the action. Message 1 of the 2-message taste (`CONFIG.teaserMessages: 2`); it is one of the only two free messages (hard paywall, no free daily quota). Input locks until the next turn loads, so no extra message slips in.
**Visual:** Genre scene art in the top 35% fading into the chat. AI disclosure pill pinned on top. Companion bubble: "{{name}}. You came. Stay close to the wall." Chips sit above the composer.
**Microcopy:** Top pill: "{{comp}} is an AI character. Fictional, and depicted as an adult." Counter: "Free preview · 2 messages left".
**CTA:** (tap an action)

### 13. Scene, turn 2
**Purpose:** Prove the paid differentiator live: the companion remembers turn 1, and the plot bends. This is the last free exchange before the cliffhanger, email and paywall. Engine screen `scene_turn_2`.
**Headline A:** {{comp}} will remember that.
**Headline B:** Your choice changed things.
**Body A:** Each action reshapes what happens next.
**Body B:** Turn two. The scene already shifted.
**Options:** (three new actions for the genre)
- 🚪 Open the door
- 🗣️ Ask what they know
- 🏃 Run for cover
**Visual:** Same scene. After the first action a note with a notebook icon slides into the thread under the last reply (never over the chat header): "Kael will remember: you drew your blade". A thin "Story path" ribbon fills to the end. Counter drops "2 messages left" → "1 message left" → "Preview over · your story continues with ChatChi Plus", visibly.
**Microcopy:** If the loader answer was "Fresh each time", the toast reads "This scene only" and nothing is remembered. After the user's second message and the companion's reply, the chips go and the composer locks; a typing bubble shows for about 1.5 s, then the cliffhanger opens (event `chat_teaser_end`). The companion's bubble never mentions payment. Hand-off is forward only: if the user comes back to #12 or #13 later (browser/FunnelFox back, reload), the full thread shows with the chips gone and the composer locked, a typing bubble plays, and the funnel forwards to the cliffhanger again (event `taste_locked`). No further message can be sent without a purchase.
**CTA:** (tap an action)

---

### 14. Cliffhanger
**Purpose:** The scene stops mid-reveal, and a real collectible (a scene card) rewards the finish. The email screen and paywall follow. Engine screen `cliffhanger` (restored from the pre-port version).
**Headline A:** The scene stops here.
**Headline B:** {{comp}} left something unsaid.
**Body A:** Your next scene is written from your choices.
**Body B:** Pick up exactly where you left off.
**Visual:** The scene freezes on the last line, set large in the serif. Below it a story card flips from blank to revealed, with a "Scene 1 of 12" progress line.
**Microcopy:** Sample cliffhanger (Fantasy): "{{comp}} lowers the lantern. 'The ember was not stolen, {{name}}. It was fed to...' The bell rings." · Card caption: "Scene card 1 saved to your story · Scene 1 of 12"
**CTA:** Save my story

---

## E. Gate (email, required)

### 15. Save your story (email)
**Purpose:** Collect the email the subscription is activated on, at peak curiosity right after the cliffhanger. Required: no skip, no guest path, no social sign-in. Engine screen `save_story` (restored from the pre-port version, now mandatory).
**Headline A:** Where should we send {{comp}}'s messages?
**Headline B:** Save {{story_title}}.
**Body A:** We use it to activate your Plus and save your story.
**Body B:** We use it to activate your Plus and save your story.
**Field:** One email input, validated (`name@domain.tld`). Enter submits. On a valid email: `S.email` is set and event `lead` fires (the FunnelFox build calls `inputs.setEmail(S.email)` on it), then the paywall opens.
**Visual:** ChatChi logo, headline and body, one email field. No Apple / Google buttons.
**Error state:** "That email doesn't look right. Check it?" (the user stays on the screen).
**Microcopy:** Legal: "By continuing you agree to the Terms and Privacy Policy. We only email about your story and your account." Terms · Privacy links.
**Skip link:** none
**CTA:** Save my story

---

## F. Monetization

### 16. Paywall
**Purpose:** The primary ask, as a long-scroll web sales page right after the 2-message taste, the cliffhanger and the email screen. It sells the rest of the story in the app's voice, never the companion's. Engine screen `paywall` (`paywall_view` placement `chat_teaser`). Hard paywall: there is no free tier and no skip link.
**Headline A:** Your story, unlocked.
**Headline B:** Keep playing {{story_title}}.
**Body A:** {{comp}} wants to keep talking. Chapter 2 is written from your choices.
**Body B:** One plan. No coins. No per-message charges.
**Plans:** Exactly three visible plans, 12 months pre-selected with a "★ MOST POPULAR ★" badge. Each card shows the first-period price, then "Then {{renew}} {{renews}}. Cancel anytime."
- **1 month**, $24.99 first month, then $49.99 every month
- **3 months**, $49.99 first 3 months, then $109.99 every 3 months
- **12 months, pre-selected**, $119.99 first year, then $299.99 every year
Paddle, one price per checkout. The old 1-week / 4-week / 12-week price tokens are gone.
**Visual:** A web landing page, long scroll, not an app sheet (rebuilt 2026-10-06, owner: "some places are a bit simple, like an app"). Every section has an uppercase pink eyebrow and a bold H2, with about 44px between sections. Top to bottom:
1. **Sticky top bar:** close X (left), ChatChi logo (centre), and a "Get Plus" mini CTA (right) that shows only after plan block #1 has scrolled off; it scrolls back to plan block #1.
2. **Personal hero, full-bleed:** their genre's story art under the bar, the companion avatar top-right, the eyebrow "Scene 1 saved · {{comp}} is waiting", the headline, body, and chips from their picks: genre, "You: {{role}}", setting, tone, "Name: {{name}}".
3. **Plan block #1:** one elevated card with eyebrow "ChatChi Plus" and "Choose your plan", the 3 plan cards, a "Due today $119.99" row (follows the selected plan), CTA "Continue with 12 months", a trust row "Secure checkout · Cancel anytime", the renewal line for the selected plan, and the auto-renew / fair-use fine print.
4. **Built from your picks:** "{{story_title}} is waiting for you": a 2-column recap (story, genre, you are, opening scene, companion, tone, your name, memory on/off), then "Your scene so far": the real taste thread from #12-#13 and the frozen cliffhanger line, with a lock line "Chapter 2 continues with ChatChi Plus".
5. **What you get:** "Everything in ChatChi Plus" with icons: unlimited chat (fair use), every genre and scene, companion memory, voice notes (NEW), change role and tone.
6. **How it works (after checkout):** 1 Check out securely (pay on this page, Plus turns on right away) → 2 Get the ChatChi app (ChatChi: AI Roleplay Chat) → 3 Log in with {{email}} ({{comp}} and {{story_title}} are waiting where the scene stopped).
7. **Product facts, "Why go Plus":** "24/7 · your companion is always in the scene", "300 · messages a day, fair use" (the fair-use cap from config), "5 · genres to play, switch anytime". No reviews and no invented stats (`reviews: null`) until real store reviews exist. Guarantee block hidden (`refundDays: null`).
8. **FAQ, "Questions, answered":** Is there a free plan? (No. The opening scene was a free preview. To keep playing, pick a plan.) · When do I get access? (Right after checkout. Download the ChatChi app and log in with {{email}}.) · What happens after I pay? (Plus turns on for your account; your story, {{comp}} and your choices are waiting in the app.) · Will I be charged again? (Yes, unless you cancel; after the first period the plan renews at the regular price on its card.) · How do I cancel? · Is this safe and private? · What does unlimited mean? · Is it explicit? (No, SFW).
9. **Plan block #2:** the same block, headed "Ready to keep playing?".
10. **Footer:** logo, Terms of Use · Privacy Policy, "Questions? support@chatchi.co", AI disclosure and "Subscriptions auto-renew until cancelled."
11. **Sticky bottom CTA bar:** the selected plan's name, "$119.99 today", a "Continue" button and "then $299.99 every year · cancel anytime". It shows from the first view (so price + Continue are visible at once on small phones) and hides only while a plan block's own CTA or the footer is on screen; solid background, and the footer has bottom padding so nothing at the end sits under it.
Changing plan updates every block and the sticky bar in place (no re-render, the scroll position stays). The same page opens from every route that leads to the paywall (email screen, lifetime "No thanks", a reload after the taste, an unpaid route into the chat).
**Microcopy:** Renewal line: "$119.99 today for the first year, then $299.99 every year until you cancel." · Fair-use: "Unlimited means normal use, capped at 300 messages a day." · Legal: "Auto-renews at the price and period shown until cancelled. Cancel anytime in account or store settings." Terms https://squad-xteam.com/termofuse.html · Privacy https://squad-xteam.com/policy.html · Support support@chatchi.co · Disclosure: "{{comp}} is an AI character. Fictional, and depicted as an adult."
**Skip link:** none (hard paywall). The close X is the only way off the page and it opens #20.
**Checkout flow:** tapping a plan card opens that plan's checkout straight away (both block CTAs and the sticky CTA do the same for the selected plan). Leaving a checkout without paying opens the sale screen of the same plan (#17-#19). Closing the paywall (X) opens the lifetime last step (#20) every time; its "No thanks", its X, or leaving the lifetime checkout returns to the paywall. There is no path to chat without a purchase. The old story-pass offer is switched off (`CONFIG.offer.enabled: false`) and no longer in the flow.
**CTA:** Continue with 12 months

### 17. Sale - 1 month (after leaving the 1-month checkout)
**Purpose:** A second, cheaper first period for the plan the user already chose, instead of a generic downsell. Engine screen `sale_m1`.
**Headline A:** Keep playing for less
**Body A:** Your 1 month plan at a lower first price. {{comp}} is mid-scene.
**Plans:** ChatChi Plus · 1 month (`m1_sale`): $22.99 for the first month with the regular first-month $24.99 struck (same plan length only), then $49.99 every month until cancelled.
**Visual:** Same web look as the paywall: top bar with the ChatChi logo and close X, eyebrow "Special offer · 1 month", the companion avatar in the genre colours, "With {{comp}} · {{story_title}}", price row (struck regular → sale, "first month"), 3 checks (unlimited chat with {{comp}} · every genre and scene · companion memory and voice notes), CTA, renewal line, plain "No thanks" link, legal links, AI disclosure.
**Microcopy:** Accept → checkout of the `m1_sale` price. "No thanks", the X, or leaving that sale checkout without paying → #20 lifetime. Events: `sale_view`, `sale_accept` + `checkout_click` (plan `m1_sale`), `sale_decline`, `checkout_decline`.
**CTA:** Claim 1 month offer

### 18. Sale - 3 months (after leaving the 3-month checkout)
**Purpose:** Same as #17 for the 3-month plan. Engine screen `sale_m3`.
**Headline A:** Keep playing for less
**Body A:** Your 3 months plan at a lower first price. {{comp}} is mid-scene.
**Plans:** ChatChi Plus · 3 months (`m3_sale`): $44.99 for the first 3 months, regular $49.99 struck, then $109.99 every 3 months.
**Visual:** As #17, eyebrow "Special offer · 3 months".
**Microcopy:** Accept → `m3_sale` checkout. Decline or leave → #20.
**CTA:** Claim 3 months offer

### 19. Sale - 12 months (after leaving the 12-month checkout)
**Purpose:** Same as #17 for the 12-month plan. Engine screen `sale_y12`.
**Headline A:** Keep playing for less
**Body A:** Your 12 months plan at a lower first price. {{comp}} is mid-scene.
**Plans:** ChatChi Plus · 12 months (`y12_sale`): $105.99 for the first year, regular $119.99 struck, then $299.99 every year.
**Visual:** As #17, eyebrow "Special offer · 12 months".
**Microcopy:** Accept → `y12_sale` checkout. Decline or leave → #20.
**CTA:** Claim 12 months offer

### 20. Lifetime - last-chance offer
**Purpose:** The last ask after a decline: one payment, no subscription. Declining it returns to the paywall. Engine screen `sale_lifetime`.
**Headline A:** Keep {{story_title}} forever
**Body A:** One payment. No subscription, nothing to renew.
**Plans:** ChatChi Plus · Lifetime (`lifetime`): $99.99 paid once, no renewal (a one-time product, not a subscription SKU).
**Visual:** As #17, eyebrow "Last offer · pay once", price row "$99.99 · paid once", checks "Unlimited chat with {{comp}}, forever · Every genre and scene · Companion memory, kept".
**Microcopy:** Accept → `lifetime` checkout. "No thanks", the X, or leaving the lifetime checkout (FunnelFox native × too, `CONFIG.declineFlow.lifetime: 'paywall'`) → #16 paywall. Shown on every paywall close.
**CTA:** Get lifetime access

---

## G. Payoff

### 21. Back in the scene (paid only)
**Purpose:** The web chat for payers, reached only from #23 "Keep chatting here": unlimited, no counter. Engine screen `back_in_scene`. Any route here without a purchase (debug jump, restore, FunnelFox screen, old fallbacks) lands on the paywall #16.
**Headline A:** Right where you left off.
**Headline B:** {{comp}} is waiting.
**Body A:** Unlimited chat is on.
**Visual:** Same scene art and the chat thread from #12-#13. The AI pill stays on top. No counter and no daily-limit card (the old free-tier limit card, "Come back at midnight" and the in-chat paywall sheet are removed: hard paywall).
**Microcopy:** The companion's last bubble never mentions payment, limits or leaving. Plus users get a one-time toast: "Unlimited chat is on. Enjoy." and an "Open the ChatChi app" link under the chat.
**CTA:** (type or tap an action)

### 22. Bonus character add-on (after a subscription purchase)
**Purpose:** One more ask while intent is highest: a one-time add-on next to the plan just bought, which stays as it is. Engine screen `upsell_lifetime` (name kept: the FunnelFox build and tests rely on it); plan key `addon`.
**Headline A:** Add a second companion
**Body A:** One more story, one more voice. Yours to keep.
**Plans:** ChatChi · Bonus character (`addon`), $22.99 paid once, its own one-time Paddle price (ChatChi $22.99 upsell: `pri_01m47nmvmmav229fqtc2hepwem`, `pri_01m47nqdb1wh61skfrhjcb4ye1`). Hidden on every plan list.
**Visual:** The #17 offer look. Eyebrow "You're in · one more thing", "Add-on · {{comp}} stays with you" under the companion avatar, price row "$22.99 paid once", 3 checks (Create a second companion from scratch · Their own memory and scenes · Paid once, no renewal), CTA, fine print, "No thanks".
**Microcopy:** Fine print: "$22.99 once. Your plan stays as it is." All copy lives in `CONFIG.upsell` (name, title, lead, checks, cta, note, decline). Accept → `addon` checkout; paid → #23 with the line "Bonus character added. Create them in the app."; left without paying or "No thanks" → #23 without it. Lifetime buyers (#20) skip this screen. Events: `upsell_accept` {plan: addon}, `upsell_decline`, `purchase_complete` {plan: addon}.
**CTA:** Add for $22.99

### 23. Get the app
**Purpose:** Hand payers to the app, where the product lives. Engine screen `get_app`.
**Headline A:** You're in. {{comp}} is waiting.
**Body A:** {{story_title}} continues in the ChatChi app.
**Visual:** Gradient check well, "Bonus character added. Create them in the app." under the body when the add-on was paid, 3 numbered steps (Download ChatChi: AI Roleplay Chat · Log in with {{email}} (the email from #15; "your checkout email" if unknown) · Open your chat with {{comp}}), "Open the app" CTA, App Store and Google Play badges, "Keep chatting here" link back to #21 (unlimited, premium).
**Microcopy:** Store links come from `CONFIG.app`, not set yet. Event `app_handoff` on the CTA and badges.
**CTA:** Open the app

---

## Notes

- **Changed 2026-10-06 (monetization port from `../chai-dream-girl/`):** the scene taste is now 2 user messages (#12-#13), then a typing bubble; the old turn 3 left the flow. **Changed again 2026-10-06 (PO feedback):** the cliffhanger (#14) and the email screen (#15, `save_story`) are back from the pre-port flow; the email is now required (it is the account Plus is activated on, and #23 asks the user to log in with it); Continue with Apple / Google and the guest skip are removed. Plans are 1 / 3 / 12 months with real Paddle prices; per-plan sales (#17-#19), a lifetime last step (#20), a post-purchase upsell (#22, now the $22.99 bonus-character add-on) and a get-app screen (#23) replace the old one-time story pass. `CONFIG.declineFlow` maps each checkout to its "left without paying" screen: m1 → `sale_m1`, m3 → `sale_m3`, y12 → `sale_y12`, any sale → `sale_lifetime`, lifetime → `paywall`, addon → `get_app`. FunnelFox's native checkout close button follows the same map.
- **Changed 2026-10-06 (owner: hard paywall):** the free tier is gone. No "Continue free · 10 messages a day" link, no free chat after a decline, no daily-limit card. Paywall X → lifetime (every time) → No → paywall. Only the 2-message taste is free; going back into it shows it locked and forwards again; a reload after the taste resumes on the paywall.
- **Not shown in the funnel, but required in the product:** a notification opt-in (one nightly "your scene is ready" push in the app voice) belongs after purchase in the app, so only the cliffhanger and the email screen sit between the taste and the ask. Never "Kael misses you" copy.
- **Skipped on purpose:** stat interstitials (Whisper's "87% / 649,000+" claims can't be verified here), a spin wheel, countdowns, explicit/taboo/dynamic/kink inputs, a fake match percentage, named fake-persona ad pages, invented ratings or reviews (the paywall shows product facts until real store reviews exist).
- **Compliance:** 18+ gate first, real year picker. Hooks, illustrations and ad creative stay SFW; horror is suspense only. AI disclosure on #12, #13, #17-#21. The paywall and sale heroes are the story cover or the app voice, not the companion pleading. Pushes use the app voice. The fair-use cap is disclosed behind "unlimited".
- **Changed 2026-10-06 (owner decision):** the post-purchase upsell (#22) is no longer "upgrade to lifetime $99.99" (plan `lifetime_up`, which needed the backend to cancel the plan just bought). It is a one-time $22.99 bonus-character add-on (plan `addon`, its own Paddle price); the subscription just bought stays as it is.
- **Backend:** paying `addon` grants one extra character slot on the account; it does not touch the subscription.
- **Unverified:** the "open lane" claim (brand search only), the 300 fair-use cap (reused from the ChatChi base, confirm). Store URLs in `CONFIG.app` are not set yet. "Other" genre matching is a product assumption.
- **Content ops:** each genre needs 3 settings, 3 companions, an opening line and two action sets with replies (the demo still carries a third set and a cliffhanger line per genre, unused). Start with fantasy and romance from ad data. The demo scripts all five.
- **Drop-off risk:** #2 (year gate on screen two), #10 (keep it at about 7 s), #12 (users who don't act: chips are the safety net), #15 (required email, no skip), #16.
- **Monetization:** hard paywall, one trigger: paywall CVR at #16 (`paywall_view` placement `chat_teaser`); there is no free tier and no limit card. Report sale CVR (#17-#19), lifetime last-step CVR (#20) and add-on take rate (#22) apart from the paywall.
- **A/B first:** (1) Hook A vs B on #1. (2) Scene taste before the paywall (#12-#13) vs a loader straight to the paywall. (3) Genre-first vs role-first order. (4) The loader memory question on vs off.
- **Demo:** `demo.html` next to this file; `python3 build.py` embeds `img/` into `funnel.html`. `?debug=1#s=N` jumps to engine screen N with sample picks. Images are painted illustrations from `gen_images.py` (gemini-3.1-flash-image): hook + 5 genre cards, 15 opening-scene cards `set-<genre>-<n>` and 15 companion portraits `comp-<genre>-<n>` (adults, clothed); regenerate one with `gen_images.py <name>`. Artifact (private): https://claude.ai/artifact/2kKyvLjSRi7N9kYkUvR5Lp
