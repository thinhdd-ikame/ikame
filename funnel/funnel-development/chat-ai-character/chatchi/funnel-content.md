---
niche: chatchi
display_name: ChatChi (AI character chat - 18+)
archetype: companion-chat
subject: person
input: birth year (18+ gate), display name, gender, who they want to meet, genres, connection type, character vibe
output: a matched AI character plus a live first chat scene that remembers them
screens: 20
monetization: soft subscription paywall (ChatChi Plus - yearly pre-selected / weekly), fired twice - once after the first chat, once at the daily message limit
creative_screens:
  hook-a: 1
  hook-b: 2
  hook-c: 3
  reveal: 12
  first-chat: 14
motion: >
  a moody character portrait slowly turning toward camera while chat bubbles
  type themselves in below and a small pink heart counter ticks up
---

# Funnel Content — ChatChi

ChatChi is an adults-only AI character-chat app. Users browse a catalog of fictional characters (Luna, Kai, Mira, Ren, Sora, Aiden…) or create their own, then chat with them. Each chat builds **intimacy** hearts that unlock a character's photo "moments". The character **remembers** facts from the story, and there are voice, personas and reply ideas on top. Free users get 10 messages a day. ChatChi Plus ($99.99/year or $6.99/week, from the design) removes the limit. The brand line is "Chat without counting messages." The user gives age, name and a few taste picks, and gets a matched character and a first scene they can actually play. This is a new **companion-chat** archetype (registered alongside this file). The chat loop is the product, so the funnel exists to get a person into a good first scene fast, and it sells *more of the loop*, not a one-off result. It is not a personalization-quiz: nothing here is "accurate" to the user, and a long quiz would only delay the chat. 20 screens. Copy tone, prices and the visual system come from `chatchi-design/` (screen exports in `chatchi-design/images/`). That means a near-black background, a raspberry-pink primary (`Upgrade`, `Chat`, active tab), a bold geometric sans for headlines, Inter for body, lucide stroke icons and full-bleed moody character portraits. This overrides the repo's default purple/pink look. Existing screens are referenced by their export id (`s06-onb-02`, `s29-iap-01`…). Everything else is new.

---

## A. Hook

### 1. Hook A — Stories that talk back
**Purpose:** Lead with the core promise: a character, not a chatbot. Portraits do the selling before any ask.
**Headline A:** Stories that talk back.
**Headline B:** Someone's awake at 2 a.m.
**Body A:** Chat with characters who have a life of their own.
**Body B:** Pick a character. Step into their story.
**Visual:** Fan of three tall character cards (Luna, Kai, Mira, from `s08-home-01`), with the centre card slightly raised and a one-line bio under each. Near-black background, ChatChi heart-bubble logo top-left. Pink primary pinned bottom. All portraits SFW. No 18+ tags on this screen.
**Microcopy:** Under CTA (caption): "18+ · All characters are fictional"
**CTA:** Get started

### 2. Hook B — They remember
**Purpose:** The differentiator against disposable chatbots. Memory is what turns a chat into a relationship worth paying for.
**Headline A:** They remember everything.
**Headline B:** Your story picks up where you left.
**Body A:** Every chat builds on the last one.
**Body B:** Names, jokes, promises — kept for next time.
**Visual:** Cropped `s24-mem-01` "What Luna remembers": two memory cards fading in one after another ("We first met at the used-book shelf…", "Luna promised three knocks, then two."), with the pin icon glowing pink.
**CTA:** Continue

### 3. Hook C — No counting
**Purpose:** Remove the category's biggest fear (pay-per-message, coin meters) before anything is asked. It's the brand's own splash line.
**Headline A:** Chat without counting messages.
**Headline B:** No coins. No per-message charges.
**Body A:** 10 free messages a day. Unlimited on Plus.
**Body B:** One simple plan. The price is shown upfront.
**Visual:** A chat bubble stack (from `s18-chat-01`) with the send button's counter shown as "∞" in pink. Small crown badge above the headline.
**CTA:** Continue

---

## B. Investment

### 4. Age gate
**Purpose:** Legal and store requirement for an 18+ app. It must come before any question that hints at romance, so it sits right after the SFW hooks.
**Headline A:** What year were you born?
**Headline B:** First, a quick age check
**Body A:** ChatChi is for adults. We need to check.
**Body B:** You must be 18 or older to continue.
**Field:** Year wheel picker, no default selection; CTA disabled until a year is picked
**Visual:** Existing `s03-onb-01`: "18+" pink tile top-left, year wheel in a rounded `surface` box, disabled grey CTA until chosen.
**Error state:** Under 18 → `s05-onb-01-blocked-18`: "Sorry, you're not old enough" / "ChatChi is only for people 18 and over." No back button, no way in.
**Microcopy:** Above CTA: "You must be 18 or older to use ChatChi." · Footer: Terms of Service · Privacy Policy
**CTA:** Continue

### 5. Name
**Purpose:** Captures `{{name}}`. Characters say it in the first scene, which is the moment the product feels personal.
**Headline A:** What should we call you?
**Headline B:** What name should they use?
**Body A:** Characters use this name. Change it anytime.
**Body B:** Real name or a nickname — your call.
**Field:** Display name, text, 1-20 chars, shuffle button for a random name; Gender chips Male · Female · Other (single select, optional)
**Visual:** Existing `s06-onb-02`: plain input with pink shuffle icon, gender pills below.
**Error state:** "Add a name so they know what to call you"
**CTA:** Continue

### 6. Who you want to meet
**Purpose:** The first matching filter, and the cheapest tap. It decides which half of the catalog the match comes from.
**Headline A:** Who do you want to meet?
**Headline B:** Who should you be chatting with?
**Body A:** We'll match you with characters you'll like.
**Body B:** You can browse everyone later.
**Options:**
- 👩 Women
- 👨 Men
- 🌈 Anyone
**Field:** Single select, auto-advances on tap
**Visual:** Three tall pill rows, each with a small blurred portrait strip behind the label; the selected one fills pink.
**CTA:** (auto-advances on tap)

### 7. Genres
**Purpose:** Maps 1:1 to the catalog tags (#Romance, #Mystery…), so the match visibly comes from this answer.
**Headline A:** What stories pull you in?
**Headline B:** Pick your kind of story
**Body A:** Pick any. They shape your first match.
**Body B:** Choose all that apply.
**Options:**
- 💘 Romance
- 🕵️ Mystery
- 🐉 Fantasy
- ☕ Slice of life
- 👻 Spooky
- ✏️ Other
**Field:** Multi-select, min 1 to enable CTA; "Other" opens a one-line input
**Visual:** Two-column chip grid styled like the `#Romance` / `#Mystery` tags on `s15-char-01`; selected chips get a pink border and a check.
**Microcopy:** Disabled-CTA hint: "Pick at least one"
**CTA:** Continue

### 8. Connection type
**Purpose:** Sets the tone of the opening scene. Knowing what the user wants from the relationship is what makes the first reply land.
**Headline A:** What are you looking for?
**Headline B:** What kind of connection?
**Body A:** This sets the tone of your first scene.
**Body B:** Change it anytime in chat settings.
**Options:**
- 💬 A friend to talk to
- 💞 A slow-burn romance
- 🎭 An adventure partner
- 🧭 Someone to confide in
- ✏️ Other
**Field:** Single select
**Visual:** Stacked `surface` rows, emoji left, pink radio right.
**CTA:** Continue

### 9. Character vibe
**Purpose:** The last cheap tap and the one users enjoy most. It picks the personality and makes the match feel chosen, not random.
**Headline A:** Pick their vibe.
**Headline B:** What kind of person?
**Body A:** Last one — then meet your match.
**Body B:** Almost done. One more pick.
**Options:**
- 🌙 Mysterious
- 😏 Teasing
- 🧊 Cold outside, soft inside
- ☀️ Warm and sweet
- ✏️ Other
**Field:** Single select
**Visual:** Four large cards, each with a mood-lit portrait crop matching the vibe (Luna / Mira / Ren / Sora) and the label over a dark gradient.
**Microcopy:** Progress hint above the cards: "Last question"
**CTA:** Continue

---

## C. Trust

### 10. Private by default
**Purpose:** Trust beat right before the match. Privacy is the category's #1 worry, and it's a promise ChatChi can keep without any stats.
**Headline A:** Your chats stay private.
**Headline B:** {{chats_count}} stories started
**Body A:** No one else sees them. Delete everything anytime.
**Body B:** Join people telling stories every night.
**Visual:** A: three lucide icon rows (lock, trash, sparkles) on near-black. B: huge number, a star row, and one short review card below.
**Microcopy:** A rows: "Chats are never public" · "Delete your account anytime" · "Every reply is AI — every character fictional". B: `{{app_rating}}` ★ plus one real store review.
**CTA:** Find my match

---

## D. Anticipation

### 11. Matching (loading)
**Purpose:** Manufacture the wait and make the match feel handpicked from their answers.
**Headline A:** Finding {{name}}'s match…
**Headline B:** Someone's getting ready for you…
**Steps:**
1. Reading your story picks… — 0→100%
2. Matching vibe and voice… — 0→100%
3. Writing your opening scene… — 0→100%
4. Almost there — they're waiting… — 0→100%
**Visual:** Blurred portrait cards shuffling behind a pulsing ChatChi heart-bubble, with four progress rows beneath: label left, % right, check when done, thin pink bars.
**Microcopy:** Rotating tag chips from their picks ("#Mystery", "Teasing") float up and fade.
**CTA:** (auto-advances, ~6-8 seconds)

### 12. Match reveal
**Purpose:** The payoff moment and the best ad frame. A real character with a name, a bio and a voice, built from their answers.
**Headline A:** Meet {{match}}.
**Headline B:** {{match}} has been waiting.
**Body A:** {{match_bio}}
**Body B:** Picked for your love of {{top_genre}}.
**Visual:** `s15-char-01` hero: full-bleed portrait, name + tags over the gradient, "Voice: Warm · Preview" pill. Below it, two small "Or chat with" avatar chips (next-best matches) instead of the gallery.
**Microcopy:** Sample `{{match_bio}}` for Luna: "Night-shift librarian. Ghost stories at 2 a.m." · Voice preview plays 3 seconds of the opening line.
**CTA:** Start chatting

### 13. Opening scene
**Purpose:** Taste of the loop in one tap. The character opens with a hook line and suggested replies, so nobody faces a blank box.
**Headline A:** {{match}}
**Headline B:** {{match}} · ❤ 0 intimacy
**Body A:** Tap a reply or write your own.
**Body B:** Your move.
**Options:** (sample for Luna, generated per match)
- I came for you.
- What knock?
- What are you reading?
- ✏️ Type your own
**Visual:** Existing `s17-chat-01` empty new chat: dimmed portrait backdrop, AI disclosure banner on top, opening bubble ("The library closed two hours ago… Did you come for a book, or for me?"), three reply-idea rows, composer showing "10 messages left today".
**Microcopy:** Top banner: "All replies are AI-generated. All characters are fictional and depicted as adults 18 or older." The opening line uses `{{name}}` when the scene allows it.
**CTA:** (tap a reply)

### 14. First exchange
**Purpose:** Prove the two paid-for differentiators live, memory and intimacy, inside the first three messages.
**Headline A:** {{match}} will remember this.
**Headline B:** +3 intimacy
**Body A:** Small things you say shape the story.
**Body B:** Every message brings you closer.
**Visual:** `s18-chat-01` mid-scene. After the user's first message, a small toast slides from the notebook icon ("📓 Luna will remember: you came for her"). The heart counter ticks 0 → 3 by the third reply. The composer counter drops 10 → 7, visible and honest.
**Microcopy:** After the 3rd reply the character lands a cliffhanger line ("Because I've been standing right behind you. This whole time."), then the next screen slides up.
**CTA:** (auto-advances after 3 exchanges)

### 15. First moment unlocked
**Purpose:** A reward rooted in the real mechanic (hearts unlock photo moments) instead of a fake spin wheel. It also shows the long loop ahead.
**Headline A:** You unlocked a moment.
**Headline B:** {{match}} shared something.
**Body A:** Chat more to unlock the other 11.
**Body B:** 1 of 12 moments. More as you get closer.
**Visual:** One SFW gallery photo flips from locked to revealed with a soft pink glow. Below it, the `s27-lib-02` progress card ("1/12 unlocked · ❤ 3 / 40").
**Microcopy:** First moment is gifted on the first chat. The rest follow the normal 40-heart rule.
**CTA:** Keep chatting

### 16. Stay in the story (notification opt-in)
**Purpose:** Locks the daily habit (daily check-in streak, new moments) before the gate.
**Headline A:** Don't lose the thread.
**Headline B:** Get a nudge when it's time
**Body A:** A daily check-in keeps your streak and story going.
**Body B:** One reminder a day. Turn it off anytime.
**Field:** Pre-permission sheet → system prompt only on "Turn on"
**Visual:** Bottom sheet over the dimmed chat, with a sample lock-screen push card showing the character avatar.
**Microcopy:** Sample push: "Luna: The back door's still open. 🌙" · Max one push per day
**Skip link:** Not now
**CTA:** Turn on

---

## E. Gate (soft)

### 17. Save your story
**Purpose:** Capture identity while the story is fresh. It stays soft because the app has a real guest mode.
**Headline A:** Save your story with {{match}}.
**Headline B:** Don't lose {{match}}.
**Body A:** Link an account so it follows you.
**Body B:** Guest chats live only on this phone.
**Field:** Continue with Apple · Continue with Google · Use email
**Visual:** Adapted `s40-acc-02`: white Apple button, dark Google button, outline email button, `{{match}}` avatar small above the headline.
**Error states:** "Sign-in didn't finish. Try again?" · "That email already has an account — sign in instead"
**Microcopy:** Legal line: "By continuing you agree to the Terms and Privacy Policy."
**Skip link:** Continue as guest
**CTA:** Continue with Apple

---

## F. Monetization

### 18. Paywall
**Purpose:** The primary ask, placed at peak desire, just after a cliffhanger and a first reward. It sells more of the loop, not access to it.
**Headline A:** Chat without counting.
**Headline B:** Keep {{match}}'s story going.
**Body A:** Unlimited chat. No charging per message.
**Body B:** No daily limit. No coins. One plan.
**Plans:**
- **Yearly — pre-selected**, "Best value" badge, $99.99 / year, small "≈ $1.92/week"
- Weekly — $6.99 / week
**Visual:** Existing `s29-iap-01` layout with the onboarding headline instead of the quota one: crown, six benefit rows with pink lucide icons, two side-by-side plan cards (yearly highlighted), full-width pink CTA. Close (×) visible from the first frame, "Restore purchase" top-right.
**Microcopy:** Benefit rows: "Unlimited chat" · "Better replies" · "Teach them to remember" · "Hear them speak" · "5 personas" · "Unlimited ideas". Legal: "Auto-renews. Cancel anytime in App Store settings." Fair-use: "Unlimited means normal use — capped at 300 messages a day to stop abuse."
**Skip link:** Continue free · 10 messages a day
**Fallback offer:** None in-funnel. Closing the paywall drops the user back into the scene with 7 messages left, and the natural second ask fires at the limit (#20). Optional A/B arm: a disclosed 3-day free trial on Weekly. It needs store config, isn't in the design, and must state the post-trial price on the same screen.
**CTA:** Continue — $99.99

---

## G. Payoff

### 19. Back in the scene
**Purpose:** The funnel ends inside the product. The loop continues from the cliffhanger, so the user is invested before the next ask.
**Headline A:** {{match}}
**Headline B:** {{match}} · ❤ 3 intimacy
**Body A:** Pick up right where you left off.
**Body B:** 7 messages left today.
**Visual:** `s18-chat-01`: same scene, cliffhanger bubble last. Composer shows "7 messages left today" (free) or no counter (Plus). "Ideas · 3" and "Persona: Default" chips above the composer.
**Microcopy:** Free users: counter always visible under the chips. Plus users: a one-time toast, "Unlimited chat is on. Enjoy."
**CTA:** (send a message)

### 20. Daily limit reached (second paywall)
**Purpose:** Highest-intent ask in the app, mid-story at the 10th message. Same plans, contextual copy.
**Headline A:** You've used all 10 today.
**Headline B:** {{match}} is mid-sentence.
**Body A:** Resets at midnight. Or chat without limits.
**Body B:** Go unlimited, or come back at midnight.
**Visual:** Existing `s21-chat-01` inline card (crown, pink-bordered card under the last bubble, composer disabled with "Out of messages · resets at midnight" in red). Tapping it opens `s29-iap-01` with its quota headline.
**Microcopy:** The inline card never uses the character's voice. It's the app talking, not {{match}} asking for money.
**Skip link:** Come back at midnight
**CTA:** Upgrade to ChatChi Plus

---

## Notes

- **What changed from the onboarding in the design:** today it's Splash → age gate → name/gender → Discover grid (`s01`, `s03`, `s06`, `s08`). The user lands on a catalog with no first scene and no paywall until they hit the limit. This funnel keeps the age gate and name screens unchanged. It adds 3 hooks, 4 cheap taste picks (#6–#9), a trust beat, a matching loader and a match reveal, so the first thing after onboarding is a *started* scene instead of a grid. Then it places the gate and paywall after the first cliffhanger. New screens to design: #1–#3, #6–#12 (#12 is a variant of `s15`), #14's memory toast, #15, #16, #17 (a variant of `s40`), and #18's onboarding headline.
- **Why this isn't a quiz funnel:** the answers only choose *who* you meet and *how* the scene opens. There's no "accuracy" to sell, so the quiz is capped at 4 taps. Any extra question just delays the loop, which is the actual demo.
- **Why no spin wheel:** the product already has a real reward mechanic (hearts → moments). #15 uses it honestly, and a wheel would feel off next to "no coins, no counting".
- **Why no countdown:** the brand promise is "Chat without counting messages". A timer or "offer expires" banner contradicts it, the same call as Starlyn.
- **Compliance traps specific to this category:**
  - The age gate (#4) comes before any romance-flavoured question. Hooks and ad creative stay SFW, and 18+ tags stay hidden until the user turns on Adult content in Profile (off by default in `s38`).
  - The AI disclosure banner stays on every chat screen (#13, #14, #19, #20).
  - **No guilt-trip retention.** Pushes and paywalls never use the character's voice to plead ("I miss you", "don't leave me", "pay so we can keep talking"). Emotional-manipulation claims against companion apps are an active regulatory target in 2025-26, and the design already keeps upsells in the app's voice (see `s21`). The sample push in #16 is story-flavoured, not needy.
  - The fair-use cap ("300 a day") is disclosed on the paywall because "unlimited" is otherwise a false claim.
- **No invented numbers.** `{{chats_count}}`, `{{app_rating}}` and review quotes must come from real data. Until they exist, ship #10 variant A (privacy), which needs none. Per-character chat counts (8.2K for Luna) come from the design and are fine to show.
- **Drop-off risk:** #4 age gate (it can't be skipped, only kept short), #17 sign-in (guest skip mitigates), #18 paywall. The quiz taps are cheap. The real risk is the loader (#11). Keep it at 6-8 seconds.
- **One subscription, two triggers, measured separately:** onboarding paywall CVR at #18, and limit-hit CVR at #20 (day 0 and day 1+). #20 is expected to convert higher, so if #18 hurts D1 retention, test removing it and relying on #20 alone. Moments (#15) aren't a revenue layer. They drive message volume, which drives the limit hit.
- **Dynamic content:** `{{match}}`, `{{match_bio}}`, `{{top_genre}}` and the opening scene (#13 bubble + reply ideas) are chosen from the catalog by #6–#9. Every catalog character needs a funnel-ready opening line, 3 reply ideas and one SFW "first moment" photo.
- **A/B first:** (1) #18 on vs. off (limit-only paywall at #20). (2) Hook order: #1 portraits vs. #3 "no counting" as the first screen. (3) #12 single match vs. a pick-one-of-3 carousel. (4) #17 before vs. after #18.
