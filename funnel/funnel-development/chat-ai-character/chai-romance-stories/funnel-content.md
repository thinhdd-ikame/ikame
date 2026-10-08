---
niche: chai-romance-stories
display_name: ChatChi - Romance Stories (interactive audio romance - 18+)
archetype: companion-chat
subject: person
input: birth year (18+ gate), romance trope, story name, love interest, narrator voice, burn pace
output: a chapter-one romance story narrated by its lead, who then chats with the user inside the scene and remembers their choices
screens: 23
monetization: 2-reply chat taste inside chapter 1, then the chapter-1 cliffhanger card and a mandatory email screen (activates Plus), then the paywall (ChatChi Plus - 1 / 3 / 12 months, 12 months pre-selected, Paddle); tapping a plan opens its checkout; after a subscription purchase a one-time $22.99 bonus-character add-on (the plan stays), then the get-app screen; leaving a checkout opens that plan's sale (lower first period), then a lifetime last step; HARD PAYWALL, no free tier: declining the lifetime step or closing its checkout returns to the paywall, closing the paywall opens the lifetime step every time, and the chat after the taste is paid-only
creative_screens:
  hook-a: 1
  trope-pick: 2
  voice-pick: 5
  reveal: 9
  first-chapter: 10
  cliffhanger: 12
motion: >
  an illustrated book cover swings open into a candlelit scene while a narrator
  waveform pulses, captions highlight word by word and a chat bubble types in below
---

# Funnel Content — ChatChi: Romance Stories

ChatChi is ikame's AI character-chat app. It reuses the ChatChi flow, content and design system (see `../chatchi/funnel-content.md`). This brief is the **romance-stories niche** funnel for Meta ads → web quiz → web paywall → app, aimed at US women 18-34 who read romantasy and follow BookTok. The niche signal is Whisper (audio romance stories, ~50K Meta ads 03-08/2026, L3M +84%, persona-led pages) plus Google Trends US ("romance stories" +46%, "romantasy books" +18%). The ad hook is *"The character from the story you love now texts you."* So the user picks a trope, gets a chapter one **narrated by its lead in an AI voice**, and then **chats with that lead inside the scene**. The user gives an age, a trope, a name and three cheap taste picks, and gets a playable, remembered story. Archetype: **companion-chat**, a variant of it. The unit of value is a *chapter* rather than an open-ended chat, so the cliffhanger is the end of chapter 1. Hard paywall (2026-10-06): the 2-reply taste is the only free chat; after it the user must buy to keep chatting. 23 screens (13 before the paywall, 7 money screens, 3 payoff screens).

**Modeled on:**
- **Whisper `quiz-landing`** (32 screens): gender → attraction → age buckets → narrator voice pick → "who is he" archetype → stat interstitials → about 15 scenario/role questions → loader with inline yes/no questions → email gate → checkout "we matched you with 4,782 stories" with struck-through intro prices shown per day.
- **Candy AI series landing**: a story episode plays as visual-novel frames, EP.1 → EP.2 cliffhanger → paywall.

**Kept:** the voice pick as the persona moment (Whisper), the one inline question inside the loader (Whisper), and the episode-ending cliffhanger right before the paywall (Candy).

**Deliberately changed:**
- Everything is **SFW**. Tropes are BookTok tropes, not sex scenarios.
- A real 18+ birth-year gate comes **first**. Whisper asks age as the 4th question.
- The quiz is cut from about 20 taps to **5**.
- Whisper's unverifiable "87% / 94% of members" stats are dropped.
- The email gate comes **after** a played chapter, not before any value, and it is email only (no Apple / Google sign-in, no guest skip). The email is mandatory because it is how the subscription is activated in the app; the get-app screen says to log in with it.
- There are no invented anchor prices. Every plan card shows the first-period price and its renewal price. The only strike-through is on a sale screen, against the same plan's regular first price.
- The story is interactive (the user replies) rather than passive listening.

Visual: the ChatChi/ChatChi system (near-black, raspberry-pink primary, bold geometric headlines, Inter body, lucide icons), with one niche override. Story screens add a warm candlelit accent (amber glow, a serif for narration captions, faint paper texture) so they read as a book, not a dating app. Confirm against the ChatChi brand kit.

---

## A. Hook

### 1. Hook + age check
**Purpose:** Mirror the ad promise and clear the 18+ gate before any romance question. The promise and the legal gate land on one screen, so the gate costs no extra screen.
**Headline A:** Your favorite story texts back.
**Headline B:** Step inside the romance.
**Body A:** Pick a trope. Its lead narrates, then talks to you.
**Body B:** Listen to chapter one. Then answer as yourself.
**Field:** Birth-year wheel under the hero, no default selection. CTA stays disabled until a year is picked.
**Visual:** Near-black background. Three tilted illustrated book covers (fae court, rival academy, rainy bookshop), with a slim pink voice waveform pulsing over the centre cover. The year wheel sits in a rounded `surface` box below, with the pink CTA pinned at the bottom. All covers SFW: clothed leads, no bedrooms.
**Microcopy:** Under CTA: "18+ · AI-generated stories · All characters fictional" · Footer: Terms of Service · Privacy Policy
**Error state:** Under 18 → blocking screen: "Sorry, ChatChi is for adults" / "You must be 18 or older to continue." No back button, no way in.
**CTA:** I'm 18+ · Start

---

## B. Investment

### 2. Pick your trope (first tap)
**Purpose:** The first tap mirrors the ad. The user picks the trope the creative sold, and it becomes the spine of the story.
**Headline A:** Pick your trope.
**Headline B:** Which trope ruins you?
**Body A:** Your whole story is built around it.
**Body B:** BookTok favorites. Switch anytime later.
**Options:**
- ⚔️ Enemies to lovers
- 🧚 Fae court
- ☕ Grumpy x sunshine
- 💍 Fake dating
- 👑 Forbidden royal
- ✏️ Other
**Field:** Single select, auto-advances on tap. Sets `{{trope}}`. "Other" opens a one-line input (e.g. "second chance"), which is matched to the nearest catalog trope.
**Visual:** Two-column grid of tall mini book covers with the trope as the cover title. The picked cover lifts and gives a quick page-flick. When traffic comes from a trope-specific ad, that trope's cover sits first and pre-highlighted (not pre-selected).
**CTA:** (auto-advances on tap)

### 3. Your name in the story
**Purpose:** Captures `{{name}}` before the preference picks. The lead says it aloud in chapter 1, which is the moment the story becomes *yours*.
**Headline A:** Your name in the story?
**Headline B:** What should they call you?
**Body A:** Your lead will say it. Change it anytime.
**Body B:** Real name or a heroine name. Your call.
**Field:** Display name, text, 1-20 chars, with a shuffle button for a story name ("Wren", "Isolde", "Mara")
**Visual:** Plain input on near-black, pink shuffle icon, faint `{{trope}}` cover blurred behind.
**Error state:** "Add a name so your lead can use it"
**CTA:** Continue

### 4. Love interest
**Purpose:** Whisper's "attracted to" question, reframed as a story choice (who the lead is) rather than a question about the user's orientation. It's cheap, and it halves the catalog.
**Headline A:** Who's the love interest?
**Headline B:** Who are you falling for?
**Body A:** They narrate your story and talk back.
**Body B:** You can read every lead later.
**Options:**
- 👨 A man
- 👩 A woman
- 🌈 Surprise me
**Field:** Single select, auto-advances on tap. Sets `{{lead_gender}}`.
**Visual:** Three tall pills, each with a blurred silhouette tinted in the chosen trope's palette. The selected pill fills pink.
**CTA:** (auto-advances on tap)

### 5. Narrator voice
**Purpose:** The Whisper lesson: in audio romance the voice *is* the persona. Hearing it early is the strongest preview of the product. All descriptors stay SFW.
**Headline A:** Pick the voice.
**Headline B:** How should they sound?
**Body A:** Tap to hear. This voice reads your story.
**Body B:** Headphones on? Tap each one to listen.
**Options:**
- 🖤 Low and steady
- 🔥 Warm and teasing
- 🌙 Soft and close
- 🎭 Surprise me
**Field:** Single select. Each row has a ▶ button that plays a 3-second line with captions. Nothing autoplays with sound. CTA is enabled after a pick.
**Visual:** Stacked rows with a small waveform thumbnail each. The playing row's waveform animates pink, and the caption appears under it in the narration serif.
**Microcopy:** Every voice reads the same preview line: "You came back. Good. The story's not finished." · Small caption: "Voices are AI-generated"
**CTA:** Continue

### 6. Burn pace (last tap)
**Purpose:** The last cheap tap. It sets how fast chapter 1 escalates, and it replaces Whisper's run of about 10 explicit scenario questions with one SFW pacing choice.
**Headline A:** How slow is the burn?
**Headline B:** Pick your pace.
**Body A:** Last one. It sets how chapter one moves.
**Body B:** Last question, then your story begins.
**Options:**
- 🕯️ Slow burn
- ⏳ Tension first
- 💥 Drama now
- 🎚️ Mix it up
**Field:** Single select. This is pacing only. Story content stays SFW in the funnel. Any 18+ content setting stays opt-in in the app profile, off by default, and is never shown here.
**Visual:** Four large cards, each with a candle at a different burn height as its icon.
**Microcopy:** Progress hint above cards: "Last question"
**CTA:** Continue

---

## C. Trust

### 7. Your story stays yours
**Purpose:** Trust beat right before the story is written. Privacy is the category's first worry, and this promise needs no stats (Whisper's "87% discovered…" claims aren't reusable).
**Headline A:** Your story stays yours.
**Headline B:** Private. Fictional. Yours.
**Body A:** No one else reads your choices. Delete anytime.
**Body B:** Every line is AI-written for you alone.
**Visual:** Three lucide icon rows (lock, trash, sparkles) over a faint paper texture on near-black. B variant: huge `{{stories_count}}` number plus star row, only once the data exists.
**Microcopy:** Rows: "Your chats are never public" · "Delete your story anytime" · "Every voice and line is AI". B variant: `{{app_rating}}` ★ plus one real store review.
**CTA:** Write my story

---

## D. Anticipation

### 8. Writing chapter one (loading)
**Purpose:** Manufacture the wait and make the story feel written from the answers. The single inline question borrows Whisper's loader pattern, softened into a BookTok-native HEA pick.
**Headline A:** Writing {{name}}'s chapter one…
**Headline B:** Your story is taking shape…
**Steps:**
1. Reading your trope and pace… — 0→100%
2. Casting your lead's voice… — 0→100%
3. Writing a scene just for you… — 0→100%
4. Almost ready — chapter one awaits… — 0→100%
**Visual:** A book cover assembling itself: the title letters ink in and the illustration fades up. Four progress rows beneath: label left, % right, check when done, thin pink bars.
**Microcopy:** At ~50%, one inline tap slides up without pausing the progress: "Happy ending guaranteed?" · "💛 Yes, HEA please" · "🎲 Surprise me". Default is HEA, and it sets `{{hea}}`.
**CTA:** (auto-advances, ~7 seconds)

### 9. Story reveal
**Purpose:** The payoff frame and the best ad image: a titled story with a named lead and a voice, visibly built from their picks.
**Headline A:** {{story_title}}
**Headline B:** Meet {{lead}}.
**Body A:** {{lead}} narrates. You decide what happens.
**Body B:** Picked for your love of {{trope}}.
**Visual:** Full-bleed illustrated cover with the title, the lead's portrait, a trope tag, a "Voice: Warm · ▶ Preview" pill and "Chapter 1 · ~4 min". Below it, two small "Or read" alternate covers (next-best matches) instead of a catalog grid.
**Microcopy:** Sample for Enemies to lovers + man + warm voice: title "Ashes & Oaths". `{{lead}}` = Kael, rival knight of the Ember Court. Bio: "Sworn to beat you at the tournament. Keeps losing on purpose?"
**CTA:** Start chapter 1

### 10. Chapter 1 — narration, then your reply
**Purpose:** The demo in one tap. The lead narrates the scene (audio + captions), then turns and speaks to the user by name. Reply ideas mean nobody faces a blank box.
**Headline A:** Chapter 1 · {{story_title}}
**Headline B:** {{lead}} is talking to you.
**Body A:** Listen, then reply as yourself.
**Body B:** Tap a reply or write your own.
**Options:** (sample for Ashes & Oaths, generated per story)
- 😤 I do hate you.
- 😏 Only on Tuesdays.
- 🗡️ Then why stay?
- ✏️ Type your own
**Visual:** Scene illustration in the top 40% (a tournament ring at dusk). Narration captions in the serif highlight word by word as the audio plays, with ▶/❚❚ and 1x speed. Then Kael's chat bubble lands: "Draw. Again. You fight like you hate me, {{name}}." AI disclosure banner pinned on top. Composer reads "Free preview · 2 replies left".
**Microcopy:** Top banner: "AI-generated story. All characters are fictional and depicted as adults 18 or older." Audio never autoplays with sound, and muted users get captions only. While the lead narrates or types, the composer and Send stay locked with a reason in the placeholder ("Kael speaks first…", "Listening… tap the story to skip", "Kael is typing…"), so Send is never a button that does nothing; tapping the narration (playing or paused) skips to its end.
**CTA:** (tap a reply)

### 11. Your choice bends the story (2-reply chat taste)
**Purpose:** The chat taste before the ask. The lead remembers and the plot bends, inside two replies, then the chapter breaks off on the cliffhanger and the paywall opens.
**Headline A:** {{lead}} will remember that.
**Headline B:** Your choice changed the story.
**Body A:** Every reply bends the plot your way.
**Body B:** Two replies in, the chapter turns.
**Visual:** Mid-scene. After the first reply a toast slides in from the notebook icon ("📓 Kael will remember: you said you hate him"). A thin "Story path" ribbon at the top fills ("Rivals → ?"). A short voiced narration line plays after the lead's first answer. The composer counter drops "2 replies left" → "1 reply left" → "Preview over · Chapter 2 needs ChatChi Plus". There are no free daily messages (hard paywall).
**Microcopy:** After the 2nd reply (`CONFIG.teaserMessages: 2`) the lead answers, the narrator delivers the cliffhanger ("Kael steps closer. 'The king didn't send me to beat you, {{name}}. He sent me to—' The bell rings."), the composer locks, the lead's typing bubble shows for about 1.5 s, and the end-of-chapter card (#12) slides up. Event: `chat_teaser_end`. These two screens (#10, #11) are the whole chat taste before the paywall: 2 chat screens, 2 messages. Hard paywall: if a non-premium user comes back to #10/#11 (Back, FunnelFox back, reload), the composer and reply ideas stay locked, a line reads "The free preview is over · Chapter 2 unlocks with ChatChi Plus" with a Continue button, and it hands off forward again (email if missing, else the paywall). A reload after the taste lands on the email / paywall, never on a fresh chat.
**CTA:** (auto-advances after 2 replies)

### 12. End of chapter 1 (cliffhanger)
**Purpose:** The Candy AI episode break, done honestly. The chapter stops mid-reveal, and a real collectible (chapter card) rewards the finish instead of a spin wheel. Restored 2026-10-06 (it had been cut when the paywall moved onto the cliffhanger).
**Headline A:** End of Chapter 1.
**Headline B:** {{lead}} left something unsaid.
**Body A:** Chapter 2 is written from your choices.
**Body B:** Your next chapter is already taking shape.
**Visual:** The last narrated line set large in the serif, with the story title as an amber badge above it. Below it, a SFW illustrated "chapter card" flips from blank to revealed with an amber glow, with a progress line "1 of 12 chapters".
**Microcopy:** Sample cliffhanger: "Kael steps closer. 'The king didn't send me to beat you, {{name}}. He sent me to—' The bell rings." · Card caption: "Chapter card 1/12 saved to your library"
**CTA:** Read Chapter 2

---

## E. Gate

### 13. Save your story (email, mandatory)
**Purpose:** The email is required: it is how ChatChi Plus gets activated in the app after the web checkout, and how the chat is saved. Asked at peak curiosity, straight after the cliffhanger and right before the paywall. Email only: there are no Apple / Google sign-in buttons and no guest skip.
**Headline A:** Where should we send {{lead}}'s messages?
**Headline B:** Save {{story_title}}.
**Body A:** We use it to activate your Plus and save your story.
**Body B:** We use it to activate your Plus and save your story.
**Field:** Email (one input, `type=email`, placeholder "you@example.com", hint "Log in with it in the app. No spam.")
**Visual:** Paper background as #12, the chapter card small above the headline, the email field with a mail icon, CTA pinned at the bottom with the legal line and Terms / Privacy links.
**Error states:** empty: "Enter your email to continue" · invalid: "Enter a valid email, like name@example.com". The error clears as soon as the user types.
**Microcopy:** Legal line: "By continuing you agree to the Terms and Privacy Policy." On a valid email: `S.email` is set and event `lead` fires (FunnelFox calls `inputs.setEmail` with it), then the paywall (#14) opens.
**Skip link:** none
**CTA:** Save my story

---

## F. Monetization

### 14. Paywall
**Purpose:** The primary ask, right after the chapter 1 cliffhanger and the email. A web landing page (web2app, 2026-10-06 owner: "check the paywall UI so it looks like the web, not an app"), not an app sheet: it sells *the rest of their story* in the app's voice, never the lead's, and asks twice.
**Headline A:** {{lead}} is waiting for you, {{name}}.
**Headline B:** Chapter 2 is ready.
**Body A:** {{lead}} wants to keep talking. Chapter 2 is written from your choices.
**Body B:** {{lead}} wants to keep talking. Chapter 2 is written from your choices.
**Plans:** three visible plans, each card showing the first-period price and "Then {{renew}} {{period}}. Cancel anytime.":
- 1 month: $24.99 first month, then $49.99 every month
- 3 months: $49.99 first 3 months, then $109.99 every 3 months
- **12 months, pre-selected**, "★ MOST POPULAR ★" badge: $119.99 first year, then $299.99 every year
**Visual:** One long scroll, sections ~36px apart, each with an amber uppercase eyebrow and a Lora serif H2 with a gradient accent word:
1. **Sticky top bar:** close (×) top-right from the first frame; it turns solid with the ChatChi logo once the hero scrolls, and a small "Get Plus" pill appears once plan block 1 has scrolled away (scrolls back to it).
2. **Personal hero:** their lead's painted portrait full-bleed (~440px, fades into the page), eyebrow chip "Your story is ready", headline + body above. Under it, fact chips from their picks: trope, narrator voice, burn pace, "Happy ending" (if picked), "Starring {{name}}".
3. **Plan block 1** ("ChatChi Plus" · "Unlock Chapter 2 and every story after it"): one elevated card with the 3 plan cards, a "Due today" row (selected plan's first price), CTA, payment badges (Apple Pay · G Pay · VISA · Mastercard · PayPal), "Secure checkout · Cancel anytime", and the selected plan's renewal line.
4. **What you get** ("Everything in ChatChi Plus"): 6 benefit cards, gradient icon well + title + one line.
5. **Your story** ("{{story_title}}, chapter by chapter"): the story cover beside a chapter list (Chapter 1 · {{chapter_card}} ✓ Read · Chapter 2 🔒 Written from your choices · Chapters 3 to 12 🔒), then "Where you left off" with the cliffhanger line as a quote.
6. **How it works** ("Chapter 2 in three steps"): Choose your plan → Get the ChatChi app → Log in with {{email}}.
7. **Why go Plus** ("Made for romance readers"): product facts only: 12 chapters in every story · 5 tropes · 10 leads · 3 narrator voices, plus "No coins. No per-chapter charges. One plan unlocks everything." A rating / review row shows only when `CONFIG.proof` holds real data (empty today, so hidden).
8. **FAQ** (accordion, first open): When do I get Chapter 2? · How do I cancel? · Will I be charged again? · Is my story private? · What happens after I pay? · Are the characters real?
9. **Plan block 2** ("Ready when you are" · "{{lead}} is mid-sentence"): the same block again.
10. **Footer:** logo, Terms of Service · Privacy Policy · support@chatchi.co, the auto-renew + fair-use line, the AI disclosure.
11. **Sticky bottom CTA:** selected plan + "{{price}} today" + "Continue"; slides up only while neither plan block is on screen; the footer has bottom padding so the bar never covers the end of the page.
No free-tier line and no skip link (hard paywall). Same page when opened from any other place (the paid chat's limit card uses the same component).
**Microcopy:** Benefits: "Every chapter, every story" (All 12 chapters of {{story_title}}, plus every other trope) · "Unlimited chat with {{lead}}" (Normal use, up to 300 messages a day) · "All narrator voices" (Low, warm or soft. Switch anytime) · "{{lead}} remembers" (Your replies shape every next chapter) · "Collect chapter cards" (One for every chapter you finish) · "Reply ideas" (Tap one when you are stuck, or write your own). Renewal line (selected plan): "{{price}} today, then {{renew}} {{period}} until you cancel. Cancel anytime in account or store settings." FAQ answers: access right after checkout in the app, logged in with their email · cancel anytime in account or store settings · renews at the regular price on its card, same period, no coins or per-chapter charges · chats never public, delete anytime · story, lead, voice and choices saved to the email · every story, voice and line is AI-generated, characters fictional and 18+. No invented stats and no reviews: ChatChi has no sourced numbers yet. Event: `paywall_view` with placement `chat_teaser`.
**Checkout flow:** tapping a plan card (either block) opens that plan's checkout straight away; every CTA (block 1, block 2, sticky bar) does the same for the selected plan. Leaving a checkout without paying opens the sale screen of the same plan (#15-#17). Closing the paywall (X) opens the lifetime last step (#18) every time; declining #18 comes back here. There is no way to keep chatting without paying.
**CTA:** Continue with 12 months

### 15. Sale - 1 month (after leaving the 1-month checkout)
**Purpose:** A second, cheaper first period for the plan the reader already chose, instead of a generic downsell.
**Headline A:** Keep reading {{story_title}} for less
**Body A:** Your 1 month plan at a lower first price.
**Plans:** ChatChi Plus · 1 month: $22.99 for the first month with the regular first-month $24.99 struck (same plan length only), then $49.99 every month until cancelled.
**Visual:** Same web look as the paywall: top bar with the ChatChi logo and close X, eyebrow "Special offer · 1 month", then one pink-bordered, softly glowing card: the story's cover thumbnail, "ChatChi Plus · 1 month", "{{story_title}} · chapter 2 with {{lead}} is ready", the price row (struck regular → sale, "first month"), 3 checks (Every chapter of every story · Unlimited chat with {{lead}} · All narrator voices), CTA and renewal line. Under it the AI disclosure, a plain "No thanks" link and legal links.
**Microcopy:** Renewal line: "$22.99 for the first month, then $49.99 every month until you cancel. Cancel anytime in account or store settings." Accept → `m1_sale` checkout. "No thanks", the X, or leaving that sale checkout without paying → #18 lifetime. Events: `sale_view`, `sale_accept` + `checkout_click` (plan `m1_sale`), `sale_decline`, `checkout_decline`.
**CTA:** Claim 1 month offer

### 16. Sale - 3 months (after leaving the 3-month checkout)
**Purpose:** Same as #15 for the 3-month plan.
**Headline A:** Keep reading {{story_title}} for less
**Body A:** Your 3 months plan at a lower first price.
**Plans:** ChatChi Plus · 3 months: $44.99 for the first 3 months, regular $49.99 struck, then $109.99 every 3 months.
**Visual:** As #15, eyebrow "Special offer · 3 months".
**Microcopy:** Accept → `m3_sale` checkout. Decline or leave → #18.
**CTA:** Claim 3 months offer

### 17. Sale - 12 months (after leaving the 12-month checkout)
**Purpose:** Same as #15 for the 12-month plan.
**Headline A:** Keep reading {{story_title}} for less
**Body A:** Your 12 months plan at a lower first price.
**Plans:** ChatChi Plus · 12 months: $105.99 for the first year, regular $119.99 struck, then $299.99 every year.
**Visual:** As #15, eyebrow "Special offer · 12 months".
**Microcopy:** Accept → `y12_sale` checkout. Decline or leave → #18.
**CTA:** Claim 12 months offer

### 18. Lifetime - last-chance offer
**Purpose:** The last ask: one payment, no subscription. Declining it returns to the paywall (no free path).
**Headline A:** Keep {{story_title}} forever
**Body A:** One payment. No subscription, nothing to renew.
**Plans:** ChatChi Plus · Lifetime: $99.99 paid once, no renewal (a one-time product, not a subscription SKU).
**Visual:** As #15, eyebrow "Last offer · pay once", price row "$99.99 · paid once", checks "Every chapter of every story, forever · Unlimited chat with {{lead}} · All narrator voices".
**Microcopy:** Fine print: "$99.99 once. No renewal, nothing to cancel." Accept → `lifetime` checkout. "No thanks", the X, or leaving the lifetime checkout (FunnelFox native × too) → #14 paywall. Shown every time the paywall is closed.
**CTA:** Get lifetime access

---

## G. Payoff

### 19. Bonus character add-on (after a subscription purchase)
**Purpose:** One more ask while intent is highest: a one-time extra on top of the plan just bought. The subscription stays as it is.
**Headline A:** Add a second story lead
**Body A:** One more story, one more voice. Yours to keep.
**Plans:** Bonus character, $22.99 paid once (its own one-time Paddle price, checkout `addon`; hidden on every plan list). All copy lives in `CONFIG.upsell`.
**Visual:** The #15 offer look. Eyebrow "You're in · one more thing", "Bonus character" + "On top of ChatChi Plus · {{plan}}" under the cover thumbnail, price row "$22.99 paid once", 3 checks (Create a second lead from scratch · Their own memory and chats · Paid once, no renewal), CTA, fine print, "No thanks".
**Microcopy:** Fine print: "$22.99 once. Your plan stays as it is." Accept → `addon` checkout; paid → #20 with the line "Bonus character added. Create them in the app."; checkout left without paying or "No thanks" / X → #20 without that line. Lifetime buyers (#18) skip this screen. Events: `upsell_accept` (plan `addon`), `upsell_decline`, `purchase_complete` (plan `addon`). Engine screen name stays `upsell_lifetime` (FunnelFox build + tests rely on it).
**CTA:** Add for $22.99

### 20. Get the app
**Purpose:** Hand payers to the app, where the rest of the story lives.
**Headline A:** You're in. {{lead}} is waiting.
**Body A:** Chapter 2 of {{story_title}} continues in the ChatChi app.
**Visual:** Gradient check well, 3 numbered steps (Download ChatChi: AI Roleplay Chat · Log in with {{email}} (the email from #13; "Log in with your email" if unknown) · Open your chat with {{lead}}), "Open the app" CTA, App Store and Google Play badges, "Keep chatting here" link to #21, the paid web chat (unlimited, chapter 2 unlocked).
**Microcopy:** After a paid add-on (#19) an extra line under the body: "Bonus character added. Create them in the app." Store links come from `CONFIG.app`, not set yet. Event: `app_handoff`.
**CTA:** Open the app

### 21. Chapter 2 begins
**Purpose:** PAID ONLY (hard paywall). The funnel ends inside the product: Plus users reach it from #20 "Keep chatting here" and hear chapter 2 pick up at the bell. A non-premium user who lands here by any route is sent to the paywall.
**Headline A:** Chapter 2 · {{story_title}}
**Headline B:** Right where you left off.
**Body A:** {{lead}} picks up mid-sentence.
**Visual:** Same scene art and narrator bar. Plus users: chapter 2 narration resumes with "—to bring you home." Counter reads "ChatChi Plus · unlimited". The AI banner stays on top.
**Microcopy:** Plus users get a one-time toast: "Every chapter is unlocked. Enjoy."
**CTA:** (tap play or send a message)

### 22. Nightly chapter reminder (notification opt-in)
**Purpose:** Paid web chat only (hard paywall). Locks the read-at-bedtime habit. It sits after the paywall here (not before the gate as in ChatChi), so nothing stands between the cliffhanger and the ask.
**Headline A:** A new chapter each night?
**Headline B:** Get a nudge at bedtime.
**Body A:** One reminder when your next chapter is ready.
**Body B:** One a day, max. Turn off anytime.
**Field:** Pre-permission sheet with a time picker (default 10 pm), then the system prompt only on "Turn on"
**Visual:** Bottom sheet over the dimmed story, with a sample lock-screen push card showing the chapter card thumbnail.
**Microcopy:** Sample push (app voice): "ChatChi · Chapter 2 of Ashes & Oaths is ready 📖" · Max one push a day. Never in the lead's voice, and never "Kael misses you" or "don't leave him hanging".
**Skip link:** Not now
**CTA:** Turn on

### 23. Limit or chapter lock (REMOVED from the flow, hard paywall)
**Status:** Unreachable. There is no free tier, so free users never get a daily counter or this card. The engine screen (`limit_chapter_lock`) stays only as the end of the paid chat ("ChatChi Plus is on" + Open the app); a non-premium user who lands on it goes to the paywall. The copy below is kept for reference only.
**Purpose (old):** Highest-intent ask in the app, fired at the 10th message or on tapping a locked chapter. Same plans, contextual copy.
**Headline A:** You've used today's 10.
**Headline B:** Chapter 2 is ready.
**Body A:** Resets at midnight. Or read and chat without limits.
**Body B:** Unlock every chapter, or keep chatting free.
**Visual:** Existing `s21-chat-01` inline card under the lead's last bubble: crown, pink border, composer disabled with "Out of messages · resets at midnight". Tapping it opens the #14 paywall with the matching headline.
**Microcopy:** The card is always the app talking. The lead's last bubble stays in-story and never mentions payment, limits or leaving. Closing that paywall opens #18 once per session (if not seen yet), else returns to the chat.
**Skip link:** Come back at midnight
**CTA:** Upgrade to ChatChi Plus

---

## Notes

- **What changed vs. the ChatChi base:** the base's "who to meet / genres / connection / vibe" picks become **trope → name → love interest → voice → pace**. The match reveal becomes a **story cover**, and the opening scene becomes a **narrated chapter** with chat inside it. The "first photo moment" becomes a **chapter card**, and the chat after the 2-reply taste is paid-only (hard paywall, no daily free messages). The notification opt-in moves after the paywall. The save-story gate is email only (2026-10-06: Apple / Google sign-in and the guest skip removed; the email is mandatory because it activates Plus). The hook and age gate are merged into one screen, so the first *choice* tap is the trope.
- **Why so short compared with Whisper:** Whisper's 20+ questions work because its quiz *is* the fantasy, and that content is explicit. Here the SFW chapter is the demo, and every extra question delays it. Five taps is the cap. If the data asks for more, add them *inside* the story as choices, not before it.
- **Skipped on purpose:** the stat interstitials (Whisper's 87% / 94% / 649K claims can't be verified and don't transfer), the spin wheel (chapter cards are the real reward), countdowns (no fake urgency; the sale screens strike only the same plan's own regular first price, and the renewal price is on every card), and any email gate before value (the email screen #13 comes after a played chapter).
- **Compliance:**
  - The age gate comes first.
  - Hooks, covers and ad creative stay SFW.
  - The 18+ content setting is opt-in in the app and never promoted.
  - The AI banner stays on #10, #11 and #21, and the AI disclosure line sits under every offer card (#15-#18).
  - The paywall hero shows the lead's portrait under app-voice copy; the lead never asks for payment.
  - Pushes use the app voice.
  - The fair-use cap is disclosed behind "unlimited".
- **Pricing (2026-10-06, Paddle):** 1 month $24.99 then $49.99 · 3 months $49.99 then $109.99 · 12 months $119.99 then $299.99. Sales (first period only): $22.99 / $44.99 / $105.99. Lifetime $99.99 once. Post-purchase add-on (bonus character) $22.99 once, its own Paddle price. Hard paywall: no free tier (2026-10-06, owner: "let them try chatting 1-2 messages, then the user must buy").
- **Drop-off risk:** #1 (the year wheel on the very first screen, so the hero must sell hard), #5 (users who don't tap ▶ miss the persona, so autoplay captions show silently), #8 (keep it ≤7 s), and #14.
- **Monetization:** three subscription lengths plus a lifetime product, one paywall trigger (hard paywall after the 2-reply taste): onboarding paywall CVR at #14 (`paywall_view` placement `chat_teaser`). Report sale CVR (#15-#17), lifetime last-step CVR (#18) and add-on take rate (#19) on their own. Chapter cards drive completion, not revenue.
- **Money flow (hard paywall; the lifetime decline differs from `chai-dream-girl`):** `CONFIG.declineFlow` = m1 → sale_m1, m3 → sale_m3, y12 → sale_y12, every `*_sale` → sale_lifetime, lifetime → paywall, addon → get_app. Paywall X → sale_lifetime every time; sale_lifetime "No thanks" / X → paywall. Nothing leads to a free chat; any route that would (old fallbacks, restore, debug) is bounced to the paywall. A subscription purchase lands on the add-on upsell (#19), a lifetime or add-on purchase on get-app (#20); the add-on never replaces the plan bought. The old one-time last-chance offer (`CONFIG.offer`) is switched off (`enabled:false`) and no longer in the flow.
- **Engine screen ids** (`demo.html` / `funnel.html`, FunnelFox screen titles): 1-14 as numbered here (12 `chapter1_cliffhanger`, 13 `save_story`, 14 `paywall`), 18-20 `sale_m1` / `sale_m3` / `sale_y12`, 21 `sale_lifetime`, 22 `upsell_lifetime` (now the $22.99 add-on; name kept), 23 `get_app`, 15 `chapter2_begins`, 16 `nightly_reminder`, 17 `limit_chapter_lock`. Doc #15-#23 map to engine ids 18-23 and 15-17 in that order.
- **Legal:** Terms https://squad-xteam.com/termofuse.html · Privacy https://squad-xteam.com/policy.html · support support@chatchi.co.
- **Content ops:** every trope × lead gender needs a chapter 1 script, audio in all 4 voices, 3 reply ideas per beat, one cliffhanger line and one SFW chapter card. Start with the top 3 tropes from ad data.
- **A/B first:** (1) Hook A vs. B on #1. (2) Voice pick (#5) on vs. off, testing whether audio lifts #14. (3) The HEA inline question on vs. off. (4) 2-reply taste vs. 1 reply (`CONFIG.teaserMessages`).
