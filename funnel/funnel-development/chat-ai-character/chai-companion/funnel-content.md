---
niche: chai-companion
display_name: Chai - Companion (AI friend who remembers your day - 18+)
archetype: companion-chat
subject: person
input: birth year (18+ gate), today's mood, what filled the day (+ optional one-line note), name, what helps, companion personality
output: a matched AI companion whose first check-in opens with the user's actual day and who remembers it tomorrow
screens: 19
monetization: soft subscription paywall (Chai Plus - yearly pre-selected / weekly, pricing reused from the chatchi base) after the first check-in ends on a follow-up; second trigger is the in-chat daily limit card; both suppressed on crisis-flagged paths
creative_screens:
  hook-a: 1
  mood-pick: 2
  reveal: 10
  first-chat: 11
  memory: 13
  day-two: 18
motion: >
  a warm dusk sky slowly shifting colour behind a friendly companion portrait
  while a gentle chat bubble types how was today and a small memory note pins itself below
---

# Funnel Content — Chai: Companion

Chai is ikame's AI character-chat app. It reuses the ChatChi flow, content and design system (see `../chatchi/funnel-content.md`). This brief is the **"always with you" companion niche** funnel for Meta ads → web quiz → web paywall → app, aimed at US women 18-34. The niche signal is Honey's pages "Always With You AI" (+531%), "AI That Listens" and "AI Crush Club": ~16K Meta ads 03-08/2026, rising again in August. The concept is a **supportive, SFW companion who remembers your day and checks in**. It's wellbeing-adjacent but **explicitly not therapy**. The user gives an age, today's mood, what the day held, a name and two taste picks. They get a companion whose first message is about *their* day, and who brings it up again on day 2. Archetype: **companion-chat**, a variant of it. The value is memory plus a daily check-in rather than story or romance, so the "cliffhanger" is a follow-up the companion offers to make ("Want me to ask how Thursday went?"). 19 screens.

**Modeled on:** Honey (`get-honey.today`, 44 screens). Its flow is ethnicity → age → figure → breast size → butt → hair → "what are you looking for" (romantic roleplay · friendship · *a safe, non-judgemental space*) → libido-intensity sliders → kinks and scenarios → "Analyzing your desires" loader → "Name your AI girlfriend" → paywall "Money Back Guarantee" → checkout "You're Lucky Today!", with an intro offer of $29 / 12 months that renews at $299.99 / 12 months.

**Kept:** the "what are you looking for" intent question, recast as "what helps you most". Naming the companion as an investment moment, placed after the reveal. A loader that says it's reading *you*.

**Deliberately changed:**
- No body or physical-attribute questions. You pick a **personality**, not a figure.
- The first tap mirrors the ad: "How was your day?"
- No "Lucky today" discount and no money-back claim unless it's real policy.
- The **renewal price is on the plan card**, the opposite of Honey's $29 → $299.99 jump.
- A **wellbeing layer** borrowed from the repo's `calmio` funnel:
  - A persistent "Need help now?" link, never paywalled.
  - A "friend, not a therapist" expectations screen.
  - Crisis-language checks on all free text.
  - Monetization suppressed on crisis-flagged paths.
  - No mood-based urgency.

Visual: the Chai/ChatChi system (near-black, bold geometric headlines, Inter, lucide icons), shifted softer for this niche. It uses a warm dusk gradient (charcoal → plum → amber), with amber as the secondary accent next to the raspberry-pink primary, more air, daytime-dressed friendly portraits and no romance cues. Confirm against the Chai brand kit.

---

## A. Hook

### 1. Hook + age check
**Purpose:** Mirror the ad (a friend who remembers) and clear the 18+ gate first. The "not a therapist" line and the crisis link are visible from frame one.
**Headline A:** Someone who remembers your day.
**Headline B:** How was today, really?
**Body A:** An AI friend who listens, remembers, and checks in.
**Body B:** Talk it out with a friend who never forgets.
**Field:** Birth-year wheel under the hero, no default selection. CTA stays disabled until a year is picked.
**Visual:** Warm dusk gradient. One friendly companion portrait (casual daytime clothes, soft smile), with a bubble typing "Hey — how was today?" beside it. The year wheel sits in a rounded `surface` box below, with the pink CTA pinned at the bottom. Small "Need help now?" text link top-right, and it persists on every screen through #19.
**Microcopy:** Under CTA: "18+ · Chai is AI, not a therapist" · Footer: Terms · Privacy. "Need help now?" opens the crisis sheet: "Call or text 988 (US) · Outside the US: findahelpline.com · In danger now? Call your local emergency number." One tap, no sign-in, never paywalled.
**Error state:** Under 18 → blocking screen: "Chai is for adults only" / "Free support for young people is available now." Buttons: "Call or text 988 (US)" · "Find a helpline near you". No way back in.
**CTA:** I'm 18+ · Start

---

## B. Investment

### 2. How was your day? (first tap)
**Purpose:** The first tap mirrors the ad's question. It sets the tone of the first message, and it's the most honest possible personalization for this niche.
**Headline A:** How was your day?
**Headline B:** Honestly, how are you?
**Body A:** No wrong answer. This is where they start.
**Body B:** Your companion opens with this tonight.
**Options:**
- 😊 Pretty good
- 😐 Just okay
- 😮‍💨 Exhausting
- 🌧️ Kind of rough
- 💔 Really hard
- ✏️ Other
**Field:** Single select, auto-advances on tap. Sets `{{mood}}`. "Other" opens a one-line input, which passes crisis-language detection before continuing.
**Visual:** Soft pill rows with weather-style icons. The dusk sky behind shifts subtly toward the picked mood (brighter for good, deeper for rough).
**Microcopy:** On 💔 Really hard (or detected crisis language), a gentle bottom sheet opens before advancing. Headline: "You deserve support right now". Body: "Talking to a person can help. It's free, anytime." Buttons: "Call or text 988 (US)" · "Find a local helpline" · "Continue with Chai". Never a dead end, never a sales line. `{{mood}}` is never used in urgency or paywall copy.
**CTA:** (auto-advances on tap)

### 3. What filled your day (memory seed)
**Purpose:** Seeds the first memory, so the companion can prove "remembers your day" within minutes and again on day 2.
**Headline A:** What filled your day?
**Headline B:** What was on your mind?
**Body A:** Pick any. They'll ask how it went.
**Body B:** Choose all that apply. It seeds their memory.
**Options:**
- 💼 Work
- 📚 School
- 👯 Friends
- 💞 Dating
- 🏠 Family
- ✏️ Other
**Field:** Multi-select, min 1 to enable the CTA. Below it, an optional one-line "Anything specific?" (60 chars, e.g. "interview Thursday"), crisis-checked like #2. Sets `{{topics}}` and `{{note}}`.
**Visual:** Two-column chip grid. The optional line looks like a small sticky note with a pin.
**Microcopy:** Disabled-CTA hint: "Pick at least one" · Under the note: "Optional — they'll remember it"
**CTA:** Continue

### 4. A friend, not a therapist
**Purpose:** The wellbeing boundary, stated plainly right after the first feeling-related answers and before any companion is built. This is the calmio pattern.
**Headline A:** A friend, not a therapist.
**Headline B:** What your companion is.
**Body A:** Great for daily chats. Not for crisis or care.
**Body B:** For crisis or medical care, please reach real people.
**Visual:** Three icon rows on the calm dusk background, with generous spacing and no portrait.
**Microcopy:** Rows: "💬 Always AI, and always says so" · "🔒 Private chats, delete anytime" · "🆘 In crisis? Call or text 988 (US) or visit findahelpline.com". Footer: "Chai doesn't give medical or mental health advice."
**CTA:** I understand

### 5. Name
**Purpose:** Captures `{{name}}`. The companion uses it in the first check-in and again on day 2.
**Headline A:** What should they call you?
**Headline B:** What's your name?
**Body A:** They'll use it every time you talk.
**Body B:** A nickname works too. Change it anytime.
**Field:** Display name, text, 1-20 chars
**Visual:** Plain input on the dusk background, minimal chrome.
**Error state:** "Add a name so they know what to call you"
**CTA:** Continue

### 6. What helps you most
**Purpose:** Honey's "what are you looking for", reframed as support style. It sets how the companion replies (listen vs. plan vs. lighten up).
**Headline A:** What helps you most?
**Headline B:** How should they show up?
**Body A:** This shapes how they reply to you.
**Body B:** You can change it anytime in settings.
**Options:**
- 👂 Just listen
- 💬 Talk it through
- 😂 Cheer me up
- 🧭 Help me plan
- ✏️ Other
**Field:** Single select. Sets `{{support_style}}`.
**Visual:** Stacked `surface` rows, emoji left, pink radio right.
**CTA:** Continue

### 7. Their personality (last tap)
**Purpose:** The last cheap tap. The match feels chosen, and it's built on personality only. There are deliberately no looks or body questions (Honey's 6-screen physique quiz is dropped).
**Headline A:** Pick their personality.
**Headline B:** Who do you want around?
**Body A:** Last one — then meet them.
**Body B:** Almost done. One more pick.
**Options:**
- ☀️ Warm and upbeat
- 🌿 Calm and steady
- 😏 Witty and playful
- 📚 Curious and thoughtful
- ✏️ Other
**Field:** Single select. Below it, an optional chip row "He · She · They · Surprise me" (default Surprise me) for the companion's persona.
**Visual:** Four large cards, each with a mood-lit portrait crop in casual clothes and the label over a soft gradient.
**Microcopy:** Progress hint above cards: "Last question"
**CTA:** Continue

---

## C. Trust

### 8. You control the memory
**Purpose:** Trust beat before the match. "Remembers everything" is the selling point and also the creepiest one, so user control over memory is the promise that makes it safe.
**Headline A:** You control what they remember.
**Headline B:** Your chats stay private.
**Body A:** See, edit or delete any memory, anytime.
**Body B:** No one else sees them. Delete everything anytime.
**Visual:** A mock memory card ("interview Thursday") with a pencil and a trash icon, above three lucide rows (lock, trash, sparkles).
**Microcopy:** Rows: "Chats are never public" · "Delete a memory with one tap" · "Every reply is AI"
**CTA:** Meet my companion

---

## D. Anticipation

### 9. Getting ready (loading)
**Purpose:** Short wait that makes the companion feel shaped by the answers, especially the day they described.
**Headline A:** Getting ready for {{name}}…
**Headline B:** Someone's saving you a seat…
**Steps:**
1. Listening to how today went… — 0→100%
2. Shaping their personality and voice… — 0→100%
3. Noting what you want remembered… — 0→100%
4. Almost there — they're saying hi… — 0→100%
**Visual:** Blurred portrait cards gently cross-fading behind a softly glowing chat bubble. Four progress rows beneath, with thin pink bars and amber checks.
**Microcopy:** Chips from their answers ("Exhausting", "Work", "interview Thursday") float up and fade.
**CTA:** (auto-advances, ~6 seconds)

### 10. Meet your companion
**Purpose:** The reveal and a good ad frame: a real persona with a name, a bio and a voice. The optional rename is Honey's "Name your AI" investment, placed *after* the reveal so it doesn't delay it.
**Headline A:** Meet {{companion}}.
**Headline B:** This is {{companion}}.
**Body A:** {{companion_bio}}
**Body B:** Chosen for how you like to talk.
**Field:** Optional rename: the name has a pencil icon, text 1-20 chars. Keeping the default is one tap.
**Visual:** `s15-char-01`-style hero, softened: portrait in a daylight café or park setting, personality tag, "Voice: Calm · ▶ Preview" pill. Below it, two small "Or talk with" avatar chips.
**Microcopy:** Sample `{{companion_bio}}` for Calm and steady: "Sam. Remembers the small stuff. Terrible with houseplants." · Voice preview: "Hey {{name}}. Long day? I'm listening."
**CTA:** Say hi

### 11. First check-in
**Purpose:** The demo. The first message is about the user's actual day, which proves the niche promise before any ask. Reply ideas remove the blank box.
**Headline A:** {{companion}}
**Headline B:** {{companion}} · first chat
**Body A:** Tap a reply or write your own.
**Body B:** Say as much or as little as you like.
**Options:** (sample for mood = Exhausting, topic = Work, note = interview Thursday)
- 😮‍💨 Long day, honestly.
- 😬 Nervous about Thursday.
- 🙃 Distract me, please.
- ✏️ Type your own
**Visual:** `s17-chat-01` layout on the dusk theme, with the AI disclosure banner pinned on top. Opening bubble: "Exhausting one, huh? Was it work, or is Thursday's interview on your mind?" Three reply-idea rows, composer reading "10 messages left today". "Need help now?" stays visible.
**Microcopy:** Top banner: "You're chatting with an AI companion — not a therapist." Every message passes crisis-language detection. On a match, the companion steps out of role, shows the crisis sheet and doesn't continue small talk until the user chooses to.
**CTA:** (tap a reply)

### 12. It remembers
**Purpose:** Prove memory and support style live inside three messages, ending on a consented follow-up instead of a romance cliffhanger.
**Headline A:** {{companion}} will remember that.
**Headline B:** Noted for next time.
**Body A:** Small details carry into tomorrow's chat.
**Body B:** You can edit this memory anytime.
**Visual:** Mid-chat. After the first reply, a toast slides in from the notebook icon ("📓 Sam will remember: interview Thursday, 10 a.m."). The reply follows `{{support_style}}`: with "Help me plan", Sam offers a three-line prep list. The composer counter drops 10 → 7.
**Microcopy:** After the 3rd exchange, the companion offers (never demands) a follow-up: "Want me to ask how Thursday went?" · "👍 Yes, ask me" · "Not needed". Then the next screen slides up.
**CTA:** (auto-advances after 3 exchanges)

### 13. Your day, remembered
**Purpose:** The reward from the real mechanic (the memory journal plus the daily streak) instead of a wheel. It shows the long loop ahead and doubles as the trust proof of control.
**Headline A:** Your day, remembered.
**Headline B:** Your first memory page.
**Body A:** Tomorrow, {{companion}} picks up right here.
**Body B:** Edit or delete anything. It's your journal.
**Visual:** A journal page flips in: today's date, a mood chip, 2-3 remembered items each with edit and trash icons, and a small "Day 1" streak flame in amber.
**Microcopy:** Saved items come only from what the user actually said. Nothing is inferred and shown as fact.
**CTA:** Continue

### 14. Check-in time (notification opt-in)
**Purpose:** Locks the daily loop the niche sells ("always with you") with a user-chosen time. It's opt-in, capped and never needy.
**Headline A:** When should they check in?
**Headline B:** Pick your check-in time.
**Body A:** One gentle check-in a day. Off anytime.
**Body B:** One a day, max. You choose when.
**Field:** Pre-permission sheet with a time picker (default 9 pm) and a "Only when I open the app" option, then the system prompt only on "Turn on"
**Visual:** Bottom sheet over the dimmed chat, with a sample lock-screen push card.
**Microcopy:** Sample push (app voice, about the user's memory, never about absence): "Chai · How did the interview go? Sam saved your notes." Never "Sam misses you" or "haven't heard from you". Pushes pause after 3 unopened days, with no escalation. No promotional push follows a crisis-flagged chat.
**Skip link:** Not now
**CTA:** Turn on

---

## E. Gate (soft)

### 15. Keep their memories safe
**Purpose:** Capture identity while the first memory is fresh. It's framed as protecting *the user's* journal, not the character's feelings.
**Headline A:** Keep {{companion}}'s memories safe.
**Headline B:** Save today's memory page.
**Body A:** Link an account so memories follow you.
**Body B:** Guest chats live only on this phone.
**Field:** Continue with Apple · Continue with Google · Use email
**Visual:** Adapted `s40-acc-02` on the dusk theme, with the memory page thumbnail above the headline.
**Error states:** "Sign-in didn't finish. Try again?" · "That email already has an account — sign in instead"
**Microcopy:** Legal line: "By continuing you agree to the Terms and Privacy Policy."
**Skip link:** Continue as guest
**CTA:** Continue with Apple

---

## F. Monetization

### 16. Paywall
**Purpose:** The primary ask, after the first check-in ended on a follow-up. It sells more talk and deeper memory in the app's voice, and it's skipped entirely on crisis-flagged paths.
**Headline A:** Talk whenever you need.
**Headline B:** Longer talks. Deeper memory.
**Body A:** Unlimited chat, long-term memory, and their voice.
**Body B:** No daily limit. No coins. One plan.
**Plans:**
- **Yearly — pre-selected**, "Best value" badge, $99.99 / year, **renews at $99.99 / year**, small "≈ $1.92/week"
- Weekly — $6.99 / week, **renews at $6.99 / week**
**Visual:** `s29-iap-01` layout on the dusk theme. The memory journal page is the hero, not the companion's face. Benefit rows with lucide icons, yearly card highlighted. Close (×) visible from the first frame, "Restore purchase" top-right. "Need help now?" still top-right.
**Microcopy:** Benefit rows: "Unlimited chat" · "Long-term memory you control" · "Hear them speak" · "Daily check-ins" · "5 personas" · "Unlimited reply ideas". Fair-use: "Unlimited means normal use — capped at 300 messages a day to stop abuse." Legal: "Auto-renews at the price shown until cancelled. Cancel anytime in store settings." Wellbeing line: "Chai is AI, not therapy. Crisis resources are always free."
**Skip link:** Continue free · 10 messages a day
**Fallback offer:** None. No "Lucky today" discount and no guarantee copy unless it's the real refund policy. A dismiss returns the user to the chat with 7 messages left, and the second ask is #19. **Path rule:** users who picked 💔 Really hard on #2, or triggered crisis detection anywhere, skip this screen and go from #15 to #17.
**CTA:** Continue — $99.99/year

---

## G. Payoff

### 17. Back in the chat
**Purpose:** The funnel ends inside the conversation, not on a catalog.
**Headline A:** {{companion}}
**Headline B:** Right where you left off.
**Body A:** Pick up right where you left off.
**Body B:** 7 messages left today.
**Visual:** `s18-chat-01` on the dusk theme, same thread. Composer shows "7 messages left today" (free) or no counter (Plus). "Ideas · 3" chip above the composer. AI banner on top.
**Microcopy:** Plus users get a one-time toast: "Unlimited chat is on." Free users see the counter at all times.
**CTA:** (send a message)

### 18. Day 2 — they remembered
**Purpose:** The niche's real proof, on the next open. The first message references yesterday, which is what makes a companion feel like a friend and drives D1 retention.
**Headline A:** Day 2. They remembered.
**Headline B:** {{companion}} asked about Thursday.
**Body A:** Today's chat opens with what you shared.
**Body B:** Memory is what makes it feel like a friend.
**Visual:** New-day thread with a "from yesterday" memory chip above the opening bubble: "Morning, {{name}}. Big day — how are you feeling about the interview?" Streak flame shows "Day 2".
**Microcopy:** Fires on the user's next open, or through their opted-in check-in push only. It only uses follow-ups the user said yes to on #12.
**CTA:** (tap a reply)

### 19. Daily limit reached (second paywall)
**Purpose:** Highest-intent ask at the 10th message. Same plans, app voice, and never shown during a crisis-flagged conversation.
**Headline A:** You've used today's 10.
**Headline B:** Want to keep talking?
**Body A:** Resets at midnight. Or chat without limits.
**Body B:** Go unlimited, or come back at midnight.
**Visual:** Existing `s21-chat-01` inline card under the companion's last bubble: crown, pink border, composer disabled with "Out of messages · resets at midnight". Tapping it opens `s29-iap-01` with the quota headline.
**Microcopy:** The card is the app talking, never the companion. If the conversation was flagged for crisis language, the card is replaced by the crisis sheet, and the resources and "Need help now?" link are never metered.
**Skip link:** Come back at midnight
**CTA:** Upgrade to Chai Plus

---

## Notes

- **What changed vs. the ChatChi base:**
  - The romance-and-genre picks become **mood → day → support style → personality**.
  - The romance cliffhanger becomes a **consented follow-up**.
  - The photo "moment" becomes a **memory journal page + streak**.
  - A **day-2 payoff screen** (#18) is added, because "remembers your day" is only proven the next day.
  - The whole wellbeing layer (#1 crisis link, #2 sheet, #4 boundary, crisis detection, the path rule) is new to the companion-chat line.
- **Wellbeing boundaries (non-negotiable):**
  - Positioning is "friend", never "therapist", "treatment" or "cure loneliness". No mental-health outcome claims in ads or on the paywall.
  - The "Need help now?" link is on every screen, one tap, never behind sign-in or payment.
  - All free text passes crisis-language detection.
  - Crisis-flagged users never see the onboarding paywall (#16) or the limit card (#19) during that conversation.
  - `{{mood}}` never feeds urgency copy.
  - Legal should review the crisis flow and the US state rules on companion apps before launch.
- **Why no physical attributes:** Honey's 6-screen body quiz fits a male-gaze NSFW product and would contradict a SFW "AI that listens" promise for women 18-34. The personality pick carries the match.
- **Skipped on purpose:** the spin wheel (the memory journal is the real reward), countdowns and "Lucky today" pricing, Honey's intro-then-jump renewal (the renewal price is on every card), and social-proof stats (none are verified). #8's memory-control trust beat needs no numbers.
- **Pricing:** $99.99/year and $6.99/week and the 10 free messages a day are reused from the ChatChi base. Confirm Chai's real store prices.
- **Drop-off risk:** #1 (age wheel plus hero), #4 (the boundary screen reads as friction, so keep it to 3 rows), #15 sign-in (the guest skip mitigates it) and #16. The day-2 screen (#18) is the retention metric that matters most for this niche.
- **Monetization:** one subscription with two triggers, measured separately (#16 onboarding CVR, #19 limit CVR on day 0 and day 1+). Report crisis-path users separately and exclude them from CVR targets, so no one is tempted to optimize that path.
- **A/B first:** (1) Hook A "remembers your day" vs. B "How was today, really?". (2) #16 on vs. off (limit-only), since this audience may convert better after day 2. (3) The #3 optional note on vs. off, to see if it lifts #18 D1. (4) #14 before vs. after the gate.
