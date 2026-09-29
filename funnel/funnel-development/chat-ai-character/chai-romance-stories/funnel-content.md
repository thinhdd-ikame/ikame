---
niche: chai-romance-stories
display_name: Chai - Romance Stories (interactive audio romance - 18+)
archetype: companion-chat
subject: person
input: birth year (18+ gate), romance trope, story name, love interest, narrator voice, burn pace
output: a chapter-one romance story narrated by its lead, who then chats with the user inside the scene and remembers their choices
screens: 17
monetization: soft subscription paywall (Chai Plus - yearly pre-selected / weekly, pricing reused from the chatchi base) right after the chapter 1 cliffhanger; second trigger is the in-chat daily message / chapter lock card
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

# Funnel Content — Chai: Romance Stories

Chai is ikame's AI character-chat app. It reuses the ChatChi flow, content and design system (see `../chatchi/funnel-content.md`). This brief is the **romance-stories niche** funnel for Meta ads → web quiz → web paywall → app, aimed at US women 18-34 who read romantasy and follow BookTok. The niche signal is Whisper (audio romance stories, ~50K Meta ads 03-08/2026, L3M +84%, persona-led pages) plus Google Trends US ("romance stories" +46%, "romantasy books" +18%). The ad hook is *"The character from the story you love now texts you."* So the user picks a trope, gets a chapter one **narrated by its lead in an AI voice**, and then **chats with that lead inside the scene**. The user gives an age, a trope, a name and three cheap taste picks, and gets a playable, remembered story. Archetype: **companion-chat**, a variant of it. The unit of value is a *chapter* rather than an open-ended chat, so the cliffhanger is the end of chapter 1 and there's a chapter lock next to the message limit. 17 screens.

**Modeled on:**
- **Whisper `quiz-landing`** (32 screens): gender → attraction → age buckets → narrator voice pick → "who is he" archetype → stat interstitials → about 15 scenario/role questions → loader with inline yes/no questions → email gate → checkout "we matched you with 4,782 stories" with struck-through intro prices shown per day.
- **Candy AI series landing**: a story episode plays as visual-novel frames, EP.1 → EP.2 cliffhanger → paywall.

**Kept:** the voice pick as the persona moment (Whisper), the one inline question inside the loader (Whisper), and the episode-ending cliffhanger right before the paywall (Candy).

**Deliberately changed:**
- Everything is **SFW**. Tropes are BookTok tropes, not sex scenarios.
- A real 18+ birth-year gate comes **first**. Whisper asks age as the 4th question.
- The quiz is cut from about 20 taps to **5**.
- Whisper's unverifiable "87% / 94% of members" stats are dropped.
- The email gate moves **after** the user has played chapter 1.
- There are no struck-through anchor prices, and the renewal price sits on every plan card.
- The story is interactive (the user replies) rather than passive listening.

Visual: the Chai/ChatChi system (near-black, raspberry-pink primary, bold geometric headlines, Inter body, lucide icons), with one niche override. Story screens add a warm candlelit accent (amber glow, a serif for narration captions, faint paper texture) so they read as a book, not a dating app. Confirm against the Chai brand kit.

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
**Error state:** Under 18 → blocking screen: "Sorry, Chai is for adults" / "You must be 18 or older to continue." No back button, no way in.
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
**Visual:** Scene illustration in the top 40% (a tournament ring at dusk). Narration captions in the serif highlight word by word as the audio plays, with ▶/❚❚ and 1x speed. Then Kael's chat bubble lands: "Draw. Again. You fight like you hate me, {{name}}." AI disclosure banner pinned on top. Composer reads "10 messages left today".
**Microcopy:** Top banner: "AI-generated story. All characters are fictional and depicted as adults 18 or older." Audio never autoplays with sound, and muted users get captions only.
**CTA:** (tap a reply)

### 11. Your choice bends the story
**Purpose:** Prove the paid-for differentiators live inside three replies: the lead remembers, and the plot bends to the user's choices.
**Headline A:** {{lead}} will remember that.
**Headline B:** Your choice changed the story.
**Body A:** Every reply bends the plot your way.
**Body B:** Three replies in, the chapter turns.
**Visual:** Mid-scene. After the first reply a toast slides in from the notebook icon ("📓 Kael will remember: you said you hate him"). A thin "Story path" ribbon at the top fills ("Rivals → ?"). Short voiced narration lines play between replies. The composer counter drops 10 → 7, visible and honest.
**Microcopy:** After the 3rd exchange the narrator delivers the cliffhanger, and the next screen slides up.
**CTA:** (auto-advances after 3 exchanges)

### 12. End of chapter 1 (cliffhanger)
**Purpose:** The Candy AI episode break, done honestly. The chapter stops mid-reveal, and a real collectible (chapter card) rewards the finish instead of a spin wheel. The paywall follows this screen.
**Headline A:** End of Chapter 1.
**Headline B:** {{lead}} left something unsaid.
**Body A:** Chapter 2 is written from your choices.
**Body B:** Your next chapter is already taking shape.
**Visual:** The scene freezes on the last narrated line, set large in the serif. Below it, a SFW illustrated "chapter card" flips from blank to revealed with an amber glow, with a progress line "1 of 12 chapters".
**Microcopy:** Sample cliffhanger: "Kael steps closer. 'The king didn't send me to beat you, {{name}}. He sent me to—' The bell rings." · Card caption: "Chapter card 1/12 saved to your library"
**CTA:** Read Chapter 2

---

## E. Gate (soft)

### 13. Save your story
**Purpose:** Capture identity at peak curiosity, straight after the cliffhanger. Whisper gates email *before* any value, and this gate comes after a played chapter. It stays soft because Chai has guest mode.
**Headline A:** Save {{story_title}}.
**Headline B:** Keep your place in the story.
**Body A:** Link an account so chapter 2 finds you.
**Body B:** Guest stories live only on this phone.
**Field:** Continue with Apple · Continue with Google · Use email
**Visual:** Adapted `s40-acc-02`: white Apple button, dark Google button, outline email button. The chapter card sits small above the headline.
**Error states:** "Sign-in didn't finish. Try again?" · "That email already has an account — sign in instead"
**Microcopy:** Legal line: "By continuing you agree to the Terms and Privacy Policy."
**Skip link:** Continue as guest
**CTA:** Continue with Apple

---

## F. Monetization

### 14. Paywall
**Purpose:** The primary ask, placed right after the chapter 1 cliffhanger. It sells *the rest of the story* in the app's voice, never the lead's.
**Headline A:** Read every chapter.
**Headline B:** The whole story, unlocked.
**Body A:** Every trope, every voice, and chat without counting.
**Body B:** No coins. No per-chapter charges. One plan.
**Plans:**
- **Yearly — pre-selected**, "Best value" badge, $99.99 / year, **renews at $99.99 / year**, small "≈ $1.92/week"
- Weekly — $6.99 / week, **renews at $6.99 / week**
**Visual:** Existing `s29-iap-01` layout with the chapter card as the hero (not the lead's portrait). Benefit rows with pink lucide icons, two plan cards with yearly highlighted, full-width pink CTA. Close (×) visible from the first frame, "Restore purchase" top-right.
**Microcopy:** Benefit rows: "Every chapter of every story" · "All narrator voices" · "Unlimited chat with your lead" · "They remember your choices" · "Collect every chapter card" · "Unlimited reply ideas". Fair-use: "Unlimited means normal use — capped at 300 messages a day to stop abuse." Legal: "Auto-renews at the price shown until cancelled. Cancel anytime in store settings." Free tier line: "Free: chapter 1 of any story + 10 messages a day."
**Skip link:** Continue free · 10 messages a day
**Fallback offer:** None in-funnel. A dismiss drops the user back into the chapter 1 scene to keep chatting with the lead (7 messages left), with Chapter 2 shown locked. The second ask fires at the limit or chapter lock (#17). Optional A/B arm: a disclosed 3-day free trial on Weekly, with the post-trial price stated on the same screen.
**CTA:** Continue — $99.99/year

---

## G. Payoff

### 15. Chapter 2 begins
**Purpose:** The funnel ends inside the product. Plus users hear chapter 2 pick up at the bell, and free users stay in the chapter 1 scene with the lead.
**Headline A:** Chapter 2 · {{story_title}}
**Headline B:** Right where you left off.
**Body A:** {{lead}} picks up mid-sentence.
**Body B:** Free: 7 messages left today.
**Visual:** Same scene art and narrator bar. Plus users: chapter 2 narration resumes with "—to bring you home." Free users: the chat thread continues under the chapter 1 art, with a small locked "Chapter 2" pill above the composer. The AI banner stays on top.
**Microcopy:** Plus users get a one-time toast: "Every chapter is unlocked. Enjoy." Free users see the counter under the reply-idea chips at all times.
**CTA:** (tap play or send a message)

### 16. Nightly chapter reminder (notification opt-in)
**Purpose:** Locks the read-at-bedtime habit. It sits after the paywall here (not before the gate as in ChatChi), so nothing stands between the cliffhanger and the ask.
**Headline A:** A new chapter each night?
**Headline B:** Get a nudge at bedtime.
**Body A:** One reminder when your next chapter is ready.
**Body B:** One a day, max. Turn off anytime.
**Field:** Pre-permission sheet with a time picker (default 10 pm), then the system prompt only on "Turn on"
**Visual:** Bottom sheet over the dimmed story, with a sample lock-screen push card showing the chapter card thumbnail.
**Microcopy:** Sample push (app voice): "Chai · Chapter 2 of Ashes & Oaths is ready 📖" · Max one push a day. Never in the lead's voice, and never "Kael misses you" or "don't leave him hanging".
**Skip link:** Not now
**CTA:** Turn on

### 17. Limit or chapter lock (second paywall)
**Purpose:** Highest-intent ask in the app, fired at the 10th message or on tapping a locked chapter. Same plans, contextual copy.
**Headline A:** You've used today's 10.
**Headline B:** Chapter 2 is ready.
**Body A:** Resets at midnight. Or read and chat without limits.
**Body B:** Unlock every chapter, or keep chatting free.
**Visual:** Existing `s21-chat-01` inline card under the lead's last bubble: crown, pink border, composer disabled with "Out of messages · resets at midnight". Tapping it opens `s29-iap-01` with the matching headline.
**Microcopy:** The card is always the app talking. The lead's last bubble stays in-story and never mentions payment, limits or leaving.
**Skip link:** Come back at midnight
**CTA:** Upgrade to Chai Plus

---

## Notes

- **What changed vs. the ChatChi base:** the base's "who to meet / genres / connection / vibe" picks become **trope → name → love interest → voice → pace**. The match reveal becomes a **story cover**, and the opening scene becomes a **narrated chapter** with chat inside it. The "first photo moment" becomes a **chapter card**, and there's a **chapter lock** next to the daily message limit. The notification opt-in moves after the paywall, so the cliffhanger leads straight to the gate and then the ask. The hook and age gate are merged into one screen, so the first *choice* tap is the trope.
- **Why so short compared with Whisper:** Whisper's 20+ questions work because its quiz *is* the fantasy, and that content is explicit. Here the SFW chapter is the demo, and every extra question delays it. Five taps is the cap. If the data asks for more, add them *inside* the story as choices, not before it.
- **Skipped on purpose:** the stat interstitials (Whisper's 87% / 94% / 649K claims can't be verified and don't transfer), the spin wheel (chapter cards are the real reward), countdowns and struck-through "intro" prices (no urgency, and the renewal price is on every card), and the email gate before value.
- **Compliance:**
  - The age gate comes first.
  - Hooks, covers and ad creative stay SFW.
  - The 18+ content setting is opt-in in the app and never promoted.
  - The AI banner stays on #10, #11, #15 and #17.
  - The paywall hero is the chapter card, not the lead pleading.
  - Pushes use the app voice.
  - The fair-use cap is disclosed behind "unlimited".
- **Pricing:** the $99.99/year and $6.99/week plans and the 10 free messages a day are reused from the ChatChi base. Confirm Chai's real store prices and free tier (especially "chapter 1 free") before launch.
- **Drop-off risk:** #1 (the year wheel on the very first screen, so the hero must sell hard), #5 (users who don't tap ▶ miss the persona, so autoplay captions show silently), #8 (keep it ≤7 s), and #14.
- **Monetization:** one subscription with two triggers, measured separately: onboarding paywall CVR at #14, and limit / chapter-lock CVR at #17 (day 0 and day 1+). Chapter cards drive completion, not revenue.
- **Content ops:** every trope × lead gender needs a chapter 1 script, audio in all 4 voices, 3 reply ideas per beat, one cliffhanger line and one SFW chapter card. Start with the top 3 tropes from ad data.
- **A/B first:** (1) Hook A vs. B on #1. (2) Voice pick (#5) on vs. off, testing whether audio lifts #14. (3) The HEA inline question on vs. off. (4) #14 on vs. relying on #17 alone.
