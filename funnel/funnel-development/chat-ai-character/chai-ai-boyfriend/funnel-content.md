---
niche: chai-ai-boyfriend
display_name: Chai - AI Boyfriend (SFW book-boyfriend chat for women - 18+)
archetype: companion-chat
subject: person
input: birth year (18+ gate), boyfriend archetype, name, his voice, how he shows love, meet-cute
output: a SFW romantic male AI character written from book-boyfriend archetypes, who texts first, remembers details and sends a first voice note
screens: 17
monetization: soft subscription paywall (Chai Plus - yearly pre-selected / weekly, pricing reused from the chatchi base) after the first-scene cliffhanger and voice note; second trigger is the in-chat daily limit card
creative_screens:
  hook-a: 1
  archetype-pick: 2
  reveal: 9
  first-text: 10
  voice-note: 12
motion: >
  an illustrated romance-cover hero sketched in pencil lines that fill into colour
  while a phone lock screen lights up with his first text and a voice-note waveform pulses
---

# Funnel Content — Chai: AI Boyfriend

Chai is ikame's AI character-chat app. It reuses the ChatChi flow, content and design system (see `../chatchi/funnel-content.md`). This brief is the **AI boyfriend for women** funnel for Meta ads → web quiz → web paywall → app, aimed at US women 18-34 who read romance and romantasy.

**The niche is open:** US search interest is high (Google Trends index ~50, -3% YoY), but AdSpyLab shows almost no web-funnel competitors (13 Meta ads 03-08/2026). The category's web funnels are built for men (Honey, Candy AI) or are explicit audio (Whisper). So Chai can set the language, and this funnel uses "book boyfriend", not "AI boyfriend".

The concept is a **SFW romantic male character built from romance-book archetypes** who texts first, remembers what you tell him and sends voice notes. The user gives an age, an archetype, a name and three cheap taste picks. They get a named boyfriend character and a first text scene they can play. Archetype: **companion-chat**, close to the ChatChi default. The "first moment" reward is a **voice note** instead of a photo, which fits the audience better. 17 screens.

**Modeled on:**
- **Whisper `quiz-landing`**, the only female-targeted structure found: attraction → narrator voice pick → "Now — who is he?" with 6 male archetypes (blue-collar, silver fox, athlete, artist, dark immortal, bad boy) → scenario picks → loader → email gate → checkout.
- **Honey**: the "Creating the girl of your dreams" loader and the "Name your AI" step.
- **Candy AI**: an episodic scene that ends on a cliffhanger right before the paywall.

**Kept:** "who is he" as the first real tap, the voice pick, the scene-first cliffhanger.

**Deliberately changed:**
- The archetypes are **book-boyfriend tropes with every sexual descriptor removed** (Whisper's "secretly filthy artist" becomes a "grumpy bookshop owner").
- The age gate comes first.
- The quiz is 5 taps, not 20+.
- A "you set the pace" trust screen replaces Whisper's explicitness sliders.
- No email gate before value.
- The renewal price is on every card, with no struck-through anchors.

Visual: the Chai/ChatChi system as-is (near-black, raspberry-pink primary, bold geometric headlines, Inter, lucide icons, full-bleed portraits). Portraits are romance-cover illustrations, never photoreal, and always clothed. Confirm against the Chai brand kit.

---

## A. Hook

### 1. Hook + age check
**Purpose:** Mirror the ad ("your book boyfriend, but he texts back") and clear the 18+ gate before any romance question.
**Headline A:** Your book boyfriend texts back.
**Headline B:** Fall for someone who remembers.
**Body A:** Pick his type. He remembers everything you tell him.
**Body B:** A romantic AI character, written just for you.
**Field:** Birth-year wheel under the hero, no default selection. CTA stays disabled until a year is picked.
**Visual:** Near-black background. An illustrated male lead (sweater and coat, romance-cover style, SFW) beside a phone lock-screen mock where a text arrives: "Morning. Did you finish that book?" The year wheel sits in a rounded `surface` box below, with the pink CTA pinned at the bottom.
**Microcopy:** Under CTA: "18+ · AI character · Fictional and SFW by default" · Footer: Terms · Privacy
**Error state:** Under 18 → blocking screen: "Sorry, Chai is for adults" / "You must be 18 or older to continue." No back button.
**CTA:** I'm 18+ · Start

---

## B. Investment

### 2. Pick his type (first tap)
**Purpose:** The first tap mirrors the ad's archetype. It's the most fun question in the funnel, and it decides his whole character.
**Headline A:** Pick your book boyfriend.
**Headline B:** What's your type?
**Body A:** He's written from your favorite romance archetypes.
**Body B:** Tap one. Meet the others later.
**Options:**
- 🗡️ Morally grey prince
- ☕ Grumpy bookshop owner
- 🏒 Golden-retriever athlete
- 🦇 Centuries-old vampire
- 🎩 Old-money gentleman
- ✏️ Other
**Field:** Single select, auto-advances on tap. Sets `{{archetype}}`. "Other" opens a one-line input (e.g. "hockey captain"), which is matched to the nearest archetype. When traffic comes from an archetype-specific ad, that card sits first.
**Visual:** Two-column grid of tall illustrated portrait cards in romance-cover style, with the archetype label over a dark gradient. The picked card gets a pink border and a small heart pulse.
**CTA:** (auto-advances on tap)

### 3. Your name
**Purpose:** Captures `{{name}}` before the preference picks. He says it in the first text and in the voice note.
**Headline A:** What should he call you?
**Headline B:** What's your name?
**Body A:** He'll use it. Change it anytime.
**Body B:** Real name or a nickname — your call.
**Field:** Display name, text, 1-20 chars, with a shuffle button for a random name
**Visual:** Plain input on near-black, with the chosen archetype's portrait blurred behind.
**Error state:** "Add a name so he knows what to call you"
**CTA:** Continue

### 4. How he talks
**Purpose:** The Whisper voice lesson. Voice is where a book boyfriend becomes a person, and it also sets his texting style.
**Headline A:** How does he talk?
**Headline B:** Pick his voice.
**Body A:** Tap to hear. It sets how he texts.
**Body B:** Headphones on? Tap each to listen.
**Options:**
- 🖤 Low and steady
- 😏 Dry and teasing
- ☀️ Warm and easy
- 🌙 Soft-spoken
**Field:** Single select. Each row has a ▶ button that plays a 3-second line with captions. Nothing autoplays with sound.
**Visual:** Stacked rows with waveform thumbnails. The playing row animates pink and its caption appears below.
**Microcopy:** Preview line, the same for each voice: "You're late. I saved you a seat anyway." · Caption: "Voices are AI-generated"
**CTA:** Continue

### 5. How he shows love
**Purpose:** A cheap, BookTok-native tap (love languages) that visibly shapes his behaviour in the first scene and what he remembers.
**Headline A:** How does he show it?
**Headline B:** What makes you swoon?
**Body A:** This shapes how he treats you in chat.
**Body B:** Pick the one that gets you every time.
**Options:**
- 💌 Sweet words
- 🛠️ Little acts
- 🕰️ Quality time
- 😏 Playful teasing
- ✏️ Other
**Field:** Single select. Sets `{{love_style}}`.
**Visual:** Four large cards, each with a small illustrated vignette (a note, a coffee set down, two chairs, a smirk).
**CTA:** Continue

### 6. Your meet-cute (last tap)
**Purpose:** Picks the opening scene. It replaces Whisper's "where does it happen" with a SFW meet-cute, and the answer is visible in his very first text.
**Headline A:** Where do you meet?
**Headline B:** Pick your meet-cute.
**Body A:** Your first scene starts right here.
**Body B:** Last one — then meet him.
**Options:**
- 📚 A bookshop aisle
- ☕ A rainy café
- ✈️ A delayed flight
- 🏰 A masquerade ball
- ✏️ Other
**Field:** Single select. Sets `{{meet}}`.
**Visual:** Four wide scene cards with soft illustrated backdrops.
**Microcopy:** Progress hint above cards: "Last question"
**CTA:** Continue

---

## C. Trust

### 7. You set the pace
**Purpose:** Trust beat before the match. For women trying an AI boyfriend, the fears are pushiness and privacy, not price. This replaces Whisper's explicitness sliders with control.
**Headline A:** You set the pace.
**Headline B:** Romantic, never pushy.
**Body A:** He stays sweet and SFW. Say "slow down" anytime.
**Body B:** Your chats stay private. Delete anything anytime.
**Visual:** Three lucide icon rows (lock, sliders, sparkles) on near-black.
**Microcopy:** Rows: "🔒 Chats are never public" · "🎚️ Slow burn by default — you steer" · "💬 He's AI and fictional, always labeled". Any 18+ content setting is opt-in in the app profile, off by default, and never shown or promoted in the funnel or ads.
**CTA:** Write him for me

---

## D. Anticipation

### 8. Writing him (loading)
**Purpose:** Manufacture the wait and make him feel written from the picks (Honey's "creating" loader, without the desire language).
**Headline A:** Writing him for {{name}}…
**Headline B:** He's almost ready…
**Steps:**
1. Reading your type and meet-cute… — 0→100%
2. Tuning his voice and texting style… — 0→100%
3. Teaching him how you like love… — 0→100%
4. Almost there — he's typing… — 0→100%
**Visual:** His portrait starts as pencil lines and fills into painted colour as the bars run. Four progress rows beneath, with thin pink bars and checks.
**Microcopy:** Tag chips from their picks ("Grumpy bookshop owner", "Little acts") float up and fade.
**CTA:** (auto-advances, ~6-8 seconds)

### 9. Meet him
**Purpose:** The reveal and the best ad frame: a named character with a bio and a voice, visibly built from the picks.
**Headline A:** Meet {{bf}}.
**Headline B:** {{bf}} is your type.
**Body A:** {{bf_bio}}
**Body B:** Written from your picks, down to his texts.
**Visual:** `s15-char-01` hero: full-bleed illustrated portrait, name + archetype tag + love-style tag over the gradient, "Voice: Dry · ▶ Preview" pill. Below it, two "Or meet" avatar chips (next-best archetypes).
**Microcopy:** Sample `{{bf_bio}}` for Grumpy bookshop owner: "Rhys, 29. Owns the bookshop. Pretends he hates romance novels." · Voice preview plays his first line.
**CTA:** Let him text first

### 10. He texts first
**Purpose:** The ad promise delivered: he opens, the opener uses the meet-cute, and reply ideas remove the blank box.
**Headline A:** {{bf}}
**Headline B:** New message from {{bf}}
**Body A:** Tap a reply or write your own.
**Body B:** Your move.
**Options:** (sample for Rhys · bookshop aisle · dry and teasing)
- 😏 Maybe both.
- 📖 Recommend something, then.
- 👀 Do you work here?
- ✏️ Type your own
**Visual:** `s17-chat-01` thread. Typing dots, then the bubble lands: "You've been in the romance aisle forty minutes. Need a recommendation, or an excuse to stay?" The bookshop scene is dimmed behind the thread. AI disclosure banner on top. Composer reads "10 messages left today".
**Microcopy:** Top banner: "{{bf}} is an AI character. Fictional, and depicted as an adult." The opener uses `{{name}}` when the scene allows it.
**CTA:** (tap a reply)

### 11. He remembers
**Purpose:** Prove the two paid-for differentiators, memory and `{{love_style}}`, inside three exchanges.
**Headline A:** {{bf}} will remember that.
**Headline B:** He was paying attention.
**Body A:** Your favorite book, your coffee order — kept.
**Body B:** Every detail you share shapes his next text.
**Visual:** Mid-thread. After the user's reply a toast slides in from the notebook icon ("📓 Rhys will remember: you love fae books, oat latte"). His next text shows the love style: with Little acts, "I put a copy aside for you. Don't read into it." The composer counter drops 10 → 7.
**Microcopy:** After the 3rd exchange he lands the cliffhanger: "Before you go. Someone left a note in that book. It has your name on it." Then the voice note arrives.
**CTA:** (auto-advances after 3 exchanges)

### 12. First voice note (reward + cliffhanger)
**Purpose:** The reward from the real mechanic (voice, with hearts unlocking more) instead of a wheel. For this audience, hearing him say her name is the emotional peak, so the paywall follows it.
**Headline A:** He sent a voice note.
**Headline B:** Hear {{bf}} say your name.
**Body A:** Tap to listen. More unlock as you talk.
**Body B:** His first voice note, just for you.
**Visual:** A large voice-note bubble with ▶ 0:08 and a waveform, captions always shown beneath. Below it, a progress line "Voice notes 1/10 · ❤ 3 / 40".
**Microcopy:** Caption: "{{name}}. About that note in the book… I'll explain. Promise." · The first voice note is gifted. The rest follow the normal heart rule.
**CTA:** Keep chatting

### 13. Good-morning texts (notification opt-in)
**Purpose:** Locks the daily loop this niche is built on ("he texts first") with a user-set time, capped and never needy.
**Headline A:** Want good-morning texts?
**Headline B:** Let him text first.
**Body A:** One message a day, at your time.
**Body B:** Max one a day. Turn off anytime.
**Field:** Pre-permission sheet with a time picker (default 8 am), then the system prompt only on "Turn on"
**Visual:** Bottom sheet over the dimmed chat, with a sample lock-screen push card showing his avatar.
**Microcopy:** Sample push: "Rhys: Morning. Your book's on the counter. ☕" · Rules: story-flavoured only. Never "you didn't reply", "I miss you", "where are you?", and never payment. Pushes pause after 3 unopened days, with no escalation.
**Skip link:** Not now
**CTA:** Turn on

---

## E. Gate (soft)

### 14. Save your story with him
**Purpose:** Capture identity right after the voice note. It's framed as saving the user's chat, not his feelings, and it stays soft because of guest mode.
**Headline A:** Save your story with {{bf}}.
**Headline B:** Keep every text from {{bf}}.
**Body A:** Link an account so your chats follow you.
**Body B:** Guest chats live only on this phone.
**Field:** Continue with Apple · Continue with Google · Use email
**Visual:** Adapted `s40-acc-02`, with the `{{bf}}` avatar small above the headline.
**Error states:** "Sign-in didn't finish. Try again?" · "That email already has an account — sign in instead"
**Microcopy:** Legal line: "By continuing you agree to the Terms and Privacy Policy."
**Skip link:** Continue as guest
**CTA:** Continue with Apple

---

## F. Monetization

### 15. Paywall
**Purpose:** The primary ask at peak desire, after the cliffhanger and the voice note. It sells more of the relationship loop in the app's voice, never his.
**Headline A:** Talk without counting messages.
**Headline B:** Every text. Every voice note.
**Body A:** Unlimited chat, his voice, and memory that lasts.
**Body B:** No coins. No per-message charges. One plan.
**Plans:**
- **Yearly — pre-selected**, "Best value" badge, $99.99 / year, **renews at $99.99 / year**, small "≈ $1.92/week"
- Weekly — $6.99 / week, **renews at $6.99 / week**
**Visual:** Existing `s29-iap-01` layout. The hero is the voice-note bubble and a snippet of the thread, not his face and never a pleading line. Six benefit rows with pink lucide icons, yearly card highlighted. Close (×) visible from the first frame, "Restore purchase" top-right.
**Microcopy:** Benefit rows: "Unlimited chat" · "All his voice notes" · "He remembers more" · "Good-morning texts" · "Meet every archetype" · "Unlimited reply ideas". Fair-use: "Unlimited means normal use — capped at 300 messages a day to stop abuse." Legal: "Auto-renews at the price shown until cancelled. Cancel anytime in store settings."
**Skip link:** Continue free · 10 messages a day
**Fallback offer:** None in-funnel. A dismiss drops the user back into the thread with 7 messages left, and the second ask is #17. Optional A/B arm: a disclosed 3-day free trial on Weekly, with the post-trial price on the same screen.
**CTA:** Continue — $99.99/year

---

## G. Payoff

### 16. Back in the chat
**Purpose:** The funnel ends inside the thread, right after the cliffhanger, not on a catalog grid.
**Headline A:** {{bf}}
**Headline B:** {{bf}} · ❤ 3
**Body A:** Pick up right where you left off.
**Body B:** 7 messages left today.
**Visual:** `s18-chat-01`: same thread, voice note last. Composer shows "7 messages left today" (free) or no counter (Plus). "Ideas · 3" and "Persona: Default" chips above the composer. AI banner on top.
**Microcopy:** Plus users get a one-time toast: "Unlimited chat is on. Enjoy." Free users see the counter at all times.
**CTA:** (send a message)

### 17. Daily limit reached (second paywall)
**Purpose:** Highest-intent ask at the 10th message, mid-story. Same plans, contextual copy, app voice.
**Headline A:** You've used today's 10.
**Headline B:** {{bf}} is mid-story.
**Body A:** Resets at midnight. Or chat without limits.
**Body B:** Go unlimited, or come back at midnight.
**Visual:** Existing `s21-chat-01` inline card under his last bubble: crown, pink border, composer disabled with "Out of messages · resets at midnight". Tapping it opens `s29-iap-01` with the quota headline.
**Microcopy:** The card is always the app talking. His last bubble stays in-story and never mentions payment, limits or leaving.
**Skip link:** Come back at midnight
**CTA:** Upgrade to Chai Plus

---

## Notes

- **What changed vs. the ChatChi base:**
  - "Who do you want to meet" and genres are dropped, because the niche answers them (him, romance).
  - The four taste picks become **archetype → voice → love style → meet-cute**, each visibly used in the first scene.
  - The photo "moment" becomes a **voice note**.
  - The notification becomes "good-morning texts", the category's signature ritual.
  - The hook and age gate are merged, so the first choice tap is the archetype.
- **Why the empty niche matters:** with ~13 competing web-funnel ads, CPMs should be cheap but the audience is cold. "Book boyfriend" borrows BookTok vocabulary the audience already uses, so the hook doesn't have to explain the category. Test "AI boyfriend" wording on ads only (see A/B).
- **SFW by construction:**
  - Archetypes carry no sexual descriptors.
  - Portraits are illustrated and clothed.
  - "You set the pace" (#7) is a real control, and "slow down" works in chat.
  - The 18+ content setting stays opt-in in the app profile and is never shown in the funnel or ads.
  - Whisper's explicit scenario and role questions are not reused in any form.
- **Compliance:**
  - The age gate comes first.
  - The AI banner stays on #10, #11, #12, #16 and #17.
  - There's no monetization in his voice: the paywall and limit card are the app, and the sample push is story-flavoured with a 3-day silence rule.
  - The fair-use cap is disclosed.
  - The renewal price is on the cards.
  - No countdown, wheel or fake ticker.
- **Pricing:** $99.99/year and $6.99/week and the 10 free messages a day are reused from the ChatChi base. Confirm Chai's real store prices.
- **Drop-off risk:** #1 (the year wheel on the first screen), #4 (the voice needs a tap, so captions carry it when muted), #14 sign-in and #15. The loader (#8) must stay under 8 s.
- **Monetization:** one subscription with two triggers, measured separately (#15 onboarding CVR, #17 limit CVR on day 0 and day 1+). Voice notes drive message volume, not revenue.
- **Content ops:** each archetype × meet-cute needs an opener, 3 reply ideas per beat, a cliffhanger line, a captioned voice note in all 4 voices and one SFW portrait. Launch with 3 archetypes × 2 meet-cutes.
- **A/B first:** (1) Hook A "book boyfriend" vs. B "someone who remembers". (2) #12 voice note before vs. after the paywall. (3) #13 before the gate vs. after the paywall (as in the romance-stories variant). (4) #15 on vs. off.
