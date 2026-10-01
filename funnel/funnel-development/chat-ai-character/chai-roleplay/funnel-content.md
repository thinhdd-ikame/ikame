---
niche: chai-roleplay
display_name: Chai - AI Roleplay (any genre - 18+)
archetype: companion-chat
subject: person
input: birth year (18+ gate), genre, your role, setting, companion, tone, character name, three in-scene actions, email
output: a live roleplay scene already in progress, with a companion who remembers every choice you made
screens: 19
monetization: web subscription paywall (1-week intro / 4-week pre-selected / 12-week anchor, price tokens) after the first cliffhanger; second trigger is the in-chat daily message limit card
creative_screens:
  hook-a: 1
  genre-pick: 3
  companion-pick: 6
  reveal: 11
  first-scene: 12
  cliffhanger: 15
motion: >
  a closed storybook cracks open into a lit scene, a chat bubble types in from the
  companion, three action chips slide up and the picked one glows before the scene shifts
---

# Funnel Content - Chai: AI Roleplay

Chai is ikame's AI character-chat app. This is the **roleplay niche** funnel for Meta ads, then web quiz, then web paywall, then app, aimed at US/UK adults 18-34 who already play character chat and tabletop-style stories. The user gives an age, a genre, a role, a setting, a companion, a tone and a name, then plays three real turns of a scene and ends on a cliffhanger. They get a roleplay that is already running, with a companion who remembers what they chose. Archetype: **companion-chat**, variant "scene first": the unit of value is a live scene, so the first-scene taste sits *before* the gate and paywall. 19 screens.

**Reference funnels (research `nebula-chai.md` section 5, captured 2026-09-27/28, AdSpyLab):**
- **Whisper Stories** `getmywhisper.com/quiz-landing` (8,110 ads, 33 screens): ROLEPLAY is only one option on a format screen. The quiz is scenario hooks, setting, dynamic, pacing, then a loader with yes/no popups, an email gate and a countdown paywall with struck-through prices.
- **Honey** `get-honey.today/4902-2` (21 screens): a "favourite roleplay scenarios" card grid, then a loader, then a paywall.
- **Market gap:** Talkie, PolyBuzz, Character AI, Chai, Janitor and similar run app-install ads only. Rolechat, the one roleplay quiz funnel, has been dead since 2026-03-22. No roleplay web funnel is live today. Reading is [V] for Whisper and Honey; the "open lane" claim rests on a brand search done 2026-10-01, so treat it as unverified for brands outside the library.

**Kept:** scenario/setting card picks (Honey), the loader with one inline yes/no (Whisper), the named-character match card.

**Deliberately changed:**
- **All genres, not just romance.** Fantasy, mystery, sci-fi, romance and horror sit side by side. Whisper and Honey are sexual in every branch.
- **SFW end to end.** No explicit, taboo, kink or dynamic inputs, no "uncensored" claim. Horror means suspense, not gore.
- **18+ gate first** (real birth year, blocking under-18), where Whisper asks age as question three.
- **Play before paying:** three real turns in the scene, then the paywall. The competitors paywall straight after a loader.
- **No countdown, no struck-through prices, no fake personas, no fake match percentages.** Renewal price sits next to every price.
- **AI disclosure** visible on every chat screen.

Visual: the Chai system (near-black, magenta-violet gradient primary, Plus Jakarta Sans headlines, Inter body, lucide icons, same tokens as `../chai-dream-girl/`). Genre cards carry a per-genre accent (amber fantasy, teal mystery, cyan sci-fi, rose romance, crimson horror) and a storybook framing so it reads as "a story you play", not a dating app. Image set is stylised illustration, never photoreal people. Confirm against the Chai brand kit.

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
**Body A:** Chai roleplay is for people 18 and older.
**Body B:** We only use this to confirm your age.
**Field:** Birth month + year selects, no default. CTA stays disabled until both are picked. A failed check is persisted for the session (`sessionStorage`), so a reload does not clear the block.
**Visual:** Dimmed storybook cover behind a rounded `surface` box holding the year select. Pink CTA pinned at the bottom.
**Microcopy:** "AI-generated stories · All characters are fictional and 18+" · Footer: Terms of Service · Privacy Policy
**Error state:** Under 18 gives a blocking screen: "Sorry, Chai is for adults" / "You must be 18 or older to continue." No back button, no way in.
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
**Visual:** Three lucide icon rows (lock, trash, sparkles) on near-black with a faint paper texture. B variant swaps in a real store rating and one real review once Chai has them.
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
**Purpose:** The demo in one tap. The companion opens the scene by name, and three action chips mean nobody faces a blank box.
**Headline A:** The scene begins.
**Headline B:** {{comp}} speaks first.
**Body A:** Pick an action, or type your own.
**Body B:** Three ways forward. Or write yours.
**Options:** (sample for Fantasy, generated per genre)
- 🗡️ Draw your blade
- 🕯️ Step into the light
- 🤐 Say nothing
**Field:** Tap a chip or type in the composer. Any typed line counts as the action. Counter reads "10 messages left today".
**Visual:** Genre scene art in the top 35% fading into the chat. AI disclosure pill pinned on top. Companion bubble: "{{name}}. You came. Stay close to the wall." Chips sit above the composer.
**Microcopy:** Top pill: "{{comp}} is an AI character. Fictional, and depicted as an adult."
**CTA:** (tap an action)

### 13. Scene, turn 2
**Purpose:** Prove the paid differentiator live: the companion remembers turn 1, and the plot bends.
**Headline A:** {{comp}} will remember that.
**Headline B:** Your choice changed things.
**Body A:** Each action reshapes what happens next.
**Body B:** Turn two. The scene already shifted.
**Options:** (three new actions for the genre)
- 🚪 Open the door
- 🗣️ Ask what they know
- 🏃 Run for cover
**Visual:** Same scene. After the first action a toast slides in from a notebook icon: "Kael will remember: you drew your blade". A thin "Story path" ribbon fills ("Wary → ?"). Counter drops 10 → 8, visibly.
**Microcopy:** If the loader answer was "Fresh each time", the toast reads "This scene only" and nothing is remembered.
**CTA:** (tap an action)

### 14. Scene, turn 3
**Purpose:** The last live exchange. It raises the stakes so the cliffhanger lands.
**Headline A:** The stakes just rose.
**Headline B:** {{comp}} leans in.
**Body A:** One more move before the scene turns.
**Body B:** Choose carefully. This one sticks.
**Options:** (three final actions for the genre)
- ⚔️ Stand your ground
- 🤝 Trust {{comp}}
- 🔥 Strike first
**Visual:** Scene tint shifts darker or brighter by `{{tone}}`. The ribbon is nearly full. Counter reads 8 → 7. AI pill still on top.
**CTA:** (tap an action)

### 15. Cliffhanger
**Purpose:** The scene stops mid-reveal, and a real collectible (a scene card) rewards the finish. The email gate and paywall follow.
**Headline A:** The scene stops here.
**Headline B:** {{comp}} left something unsaid.
**Body A:** Your next scene is written from your choices.
**Body B:** Pick up exactly where you left off.
**Visual:** The scene freezes on the last line, set large in the serif. Below it a story card flips from blank to revealed, with a "Scene 1 of 12" progress line.
**Microcopy:** Sample cliffhanger (Fantasy): "{{comp}} lowers the lantern. 'The keep isn't what you think, {{name}}. Under the hall is—' The bell rings." · Card caption: "Scene card 1 saved to your story"
**CTA:** Save my story

---

## E. Gate (soft)

### 16. Save your story
**Purpose:** Capture identity at peak curiosity, straight after the cliffhanger and after a played scene. Soft, because Chai has guest mode.
**Headline A:** Save {{story_title}}.
**Headline B:** Keep your place in the story.
**Body A:** Add your email so the scene finds you.
**Body B:** Guest stories live only on this device.
**Field:** Email, validated. Under it: Continue with Apple · Continue with Google. Guest skip.
**Visual:** The scene card sits small above the headline. Email field, then two outline buttons.
**Error state:** "That email doesn't look right. Check it?"
**Microcopy:** Legal: "By continuing you agree to the Terms and Privacy Policy. We only email about your story."
**Skip link:** Continue as guest
**CTA:** Continue

---

## F. Monetization

### 17. Paywall
**Purpose:** The primary ask, as a long-scroll web sales page right after the cliffhanger. It sells the rest of the story in the app's voice, never the companion's.
**Headline A:** Your story, unlocked.
**Headline B:** Keep playing {{story_title}}.
**Body A:** Chat without counting. Every genre, every scene.
**Body B:** One plan. No coins. No per-message charges.
**Plans:**
- **1-week intro**, {{price_1w}}, renews at {{renew_1w}} per week
- **4-week, pre-selected**, "Most popular" badge, {{price_4w}}, renews at {{renew_4w}} every 4 weeks
- **12-week, anchor**, {{price_12w}}, renews at {{renew_12w}} every 12 weeks
Renewal price shows on every card and on the sticky CTA. No struck-through prices, no countdown.
**Visual:** Long-scroll web page. (1) Brand bar with logo, close X from the first frame and Restore. (2) Personal hero: the story cover with `{{story_title}}`, the companion portrait, the user's role, setting and tone chips. (3) Plan block with the 4-week pre-selected. (4) "What's inside": unlimited chat (fair-use cap), every genre and scene, companion memory, voice notes, switch role and tone anytime. (5) "How it works": three steps (pick, play, it remembers). (6) Proof: store rating, user count and review cards as `{{rating}}`, `{{review_*}}` config placeholders, hidden until real. (7) Guarantee: shown only when `{{refund_days}}` is a real number, hidden otherwise. (8) FAQ: "Is it free to start?", "What does unlimited mean?", "Is this safe and private?", "How do I cancel?", "Is it explicit?" (No, SFW). (9) Plan block repeated with the same selection. (10) Sticky bottom CTA with plan, price and renewal line. Close button visible throughout.
**Microcopy:** Sticky CTA line: "{{price_4w}} today, renews at {{renew_4w}} every 4 weeks" · Fair-use: "Unlimited means normal use, capped at 300 messages a day." · Legal: "Auto-renews at the price shown until cancelled. Cancel anytime in account or store settings." · Free tier: "Free: this scene + 10 messages a day." · Disclosure: "{{comp}} is an AI character."
**Skip link:** Continue free, 10 messages a day
**Fallback offer:** #18 last-chance offer (a smaller one-time story pass, not a discounted tier), shown once per session (also after closing the #19 limit paywall). Declining it drops the user back into the live scene (#19).
**CTA:** Continue with 4 weeks

### 18. Last-chance offer (on close)
**Purpose:** One honest second chance for users who close the paywall without paying: a smaller product, not a discount on a paywall tier. Shown once per session (`sessionStorage` key `ikf_offer_chai-roleplay`), then never again; a second close goes straight to the free path.
**Headline A:** Finish this story, once.
**Headline B:** A smaller pass, paid once.
**Body A:** {{comp}} is mid-sentence. Finish this scene and chapter 2.
**Body B:** No subscription. No renewal. Paid once.
**Plans:** One offer card, a different and smaller product than the 1-week plan: {{offer_name}} (story pass), {{offer_price}} paid once, no renewal, no strike-through price. Includes this scene to its end, chapter 2 of this story and the story saved to the email. Not included (stated on the card): unlimited chat, other genres and stories, companion memory beyond this story, voice notes. Optional {{offer_badge}}.
**Visual:** Same web look as the paywall: top bar with logo and close X, eyebrow "One-time pass", headline and body, one pink-bordered card with the companion avatar, the pass name, the price row ("paid once"), a "Included" list (finish this scene, chapter 2, story saved) and a muted "Not included" list, the CTA and the "Paid once. No renewal." line. Under it: "{{comp}} is an AI character. Fictional, and depicted as an adult." Plain decline link and legal links below.
**Microcopy:** No timer unless `CONFIG.offer.expiresMin` holds a real deadline (null here). Line under CTA: "{{offer_price}} once. No renewal. Cancel nothing." Decline link: "No thanks, continue free · 10 messages a day". The offer is the app talking, never the companion. Events: `offer_view`, `offer_accept`, `offer_decline`. Measure offer CVR apart from paywall CVR.
**CTA:** Get the story pass

---

## G. Payoff

### 19. Back in the scene
**Purpose:** The funnel ends inside the product, mid-scene. Plus users continue unlimited, and free users stay in the scene with the counter visible and the limit card as the second ask.
**Headline A:** Right where you left off.
**Headline B:** {{comp}} is waiting.
**Body A:** The scene picks up mid-sentence.
**Body B:** Free: 7 messages left today.
**Visual:** Same scene art and chat thread. The AI pill stays on top, and the counter sits under the action chips. When messages hit zero, the app (not the companion) shows a limit card with a crown, "Out of messages · resets at midnight", Upgrade and "Come back at midnight". Upgrade opens the paywall sheet; closing it can hit the once-only offer.
**Microcopy:** The companion's last bubble never mentions payment, limits or leaving. Plus users get a one-time toast: "Unlimited chat is on. Enjoy."
**CTA:** (type or tap an action)

---

## Notes

- **Not shown in the funnel, but required in the product:** a notification opt-in (one nightly "your scene is ready" push in the app voice) belongs after purchase in the app, so nothing sits between cliffhanger and ask. Never "Kael misses you" copy.
- **Skipped on purpose:** stat interstitials (Whisper's "87% / 649,000+" claims can't be verified here), a spin wheel (scene cards are the real reward), countdowns and struck-through intro prices (renewal is on every card), explicit/taboo/dynamic/kink inputs, a fake match percentage, named fake-persona ad pages.
- **Compliance:** 18+ gate first, real year picker. Hooks, illustrations and ad creative stay SFW; horror is suspense only. AI disclosure on #12-#14, #18, #19. The paywall and offer hero are the story cover, not the companion pleading. Pushes use the app voice. The fair-use cap is disclosed behind "unlimited".
- **Unverified:** the "open lane" claim (brand search only), the 10 free messages/day and 300 fair-use cap (reused from the Chai base, confirm), and every price, rating, review and refund term (all tokens). "Other" genre matching is a product assumption.
- **Content ops:** each genre needs 3 settings, 3 companions, an opening line, three action sets with replies, and a cliffhanger. Start with fantasy and romance from ad data. The demo scripts all five.
- **Drop-off risk:** #2 (year gate on screen two), #10 (keep it at about 7 s), #12 (users who don't act: chips are the safety net), #17.
- **Monetization:** one subscription, two triggers, measured separately: onboarding paywall CVR at #17 and limit-card CVR at #19 (day 0 and day 1+). Scene cards drive completion, not revenue.
- **A/B first:** (1) Hook A vs B on #1. (2) Scene taste before the paywall (#12-#14) vs a loader straight to the paywall. (3) Genre-first vs role-first order. (4) The loader memory question on vs off.
- **Demo:** `demo.html` next to this file. Images are CSS/gradient placeholders under the real names in `img/` (no `IKAME_AI_KEY` at build time); regenerate with `gen_images.py <name>`. Artifact (private): https://claude.ai/artifact/2kKyvLjSRi7N9kYkUvR5Lp
