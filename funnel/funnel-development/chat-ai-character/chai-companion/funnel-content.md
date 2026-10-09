---
niche: chai-companion
display_name: ChatChi - Companion (AI friend who remembers your day - 18+)
archetype: companion-chat
subject: person
input: birth year (18+ gate), today's mood, what filled the day (+ optional one-line note), name, what helps, companion personality
output: a matched AI companion whose first check-in opens with the user's actual day and who remembers it tomorrow
screens: 25
monetization: 2-message chat taste (2 chat screens), then the memory page, a check-in opt-in and a mandatory email screen (activates the subscription, email only, no social sign-in), then a long-scroll paywall (ChatChi Plus - 1 / 3 / 12 months, 12 months pre-selected, Paddle); tapping a plan opens its checkout; after a subscription purchase a one-time add-on upsell (a second companion, $22.99 once, the subscription stays), then the get-app screen; leaving a checkout opens that plan's sale (lower first period), then a one-time lifetime last step, then back to the paywall. HARD PAYWALL, no free tier: no chat after the 2-message taste without a purchase; the web chat (#23) is Plus-only. Crisis-flagged users get the same paywall without sale pushes (its X opens the crisis resources)
creative_screens:
  hook-a: 1
  mood-pick: 2
  reveal: 10
  first-chat: 11
  memory: 13
  day-two: 24
motion: >
  a warm dusk sky slowly shifting colour behind a friendly companion portrait
  while a gentle chat bubble types how was today and a small memory note pins itself below
---

# Funnel Content — ChatChi: Companion

ChatChi is ikame's AI character-chat app. It reuses the ChatChi flow, content and design system (see `../chatchi/funnel-content.md`). This brief is the **"always with you" companion niche** funnel for Meta ads → web quiz → web paywall → app, aimed at US women 18-34. The niche signal is Honey's pages "Always With You AI" (+531%), "AI That Listens" and "AI Crush Club": ~16K Meta ads 03-08/2026, rising again in August. The concept is a **supportive, SFW companion who remembers your day and checks in**. It's wellbeing-adjacent but **explicitly not therapy**. The user gives an age, today's mood, what the day held, a name and two taste picks. They get a companion whose first message is about *their* day, and who brings it up again on day 2. Archetype: **companion-chat**, a variant of it. The value is memory plus a daily check-in rather than story or romance, so the hook is a memory toast in a 2-message chat taste, followed by the memory page, a check-in opt-in and a mandatory email step before the paywall. 25 screens.

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

Visual: the ChatChi/ChatChi system (near-black, bold geometric headlines, Inter, lucide icons), shifted softer for this niche. It uses a warm dusk gradient (charcoal → plum → amber), with amber as the secondary accent next to the raspberry-pink primary, more air, daytime-dressed friendly portraits and no romance cues. Confirm against the ChatChi brand kit.

---

## A. Hook

### 1. Hook + age check
**Purpose:** Mirror the ad (a friend who remembers) and clear the 18+ gate first. The "not a therapist" line and the crisis link are visible from frame one.
**Headline A:** Someone who remembers your day.
**Headline B:** How was today, really?
**Body A:** An AI friend who listens, remembers, and checks in.
**Body B:** Talk it out with a friend who never forgets.
**Field:** Birth-year wheel under the hero, no default selection. CTA stays disabled until a year is picked.
**Visual:** Warm dusk gradient. One friendly companion portrait (casual daytime clothes, soft smile), with a bubble typing "Hey — how was today?" beside it. The year wheel sits in a rounded `surface` box below, with the pink CTA pinned at the bottom. Small "Need help now?" text link top-right, and it persists on every screen through #23.
**Microcopy:** Under CTA: "18+ · ChatChi is AI, not a therapist" · Footer: Terms · Privacy. "Need help now?" opens the crisis sheet: "Call or text 988 (US) · Outside the US: findahelpline.com · In danger now? Call your local emergency number." One tap, no sign-in, never paywalled.
**Error state:** Under 18 → blocking screen: "ChatChi is for adults only" / "Free support for young people is available now." Buttons: "Call or text 988 (US)" · "Find a helpline near you". No way back in.
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
**Microcopy:** On 💔 Really hard (or detected crisis language), a gentle bottom sheet opens before advancing. Headline: "You deserve support right now". Body: "Talking to a person can help. It's free, anytime." Buttons: "Call or text 988 (US)" · "Find a local helpline" · "Continue with ChatChi". Never a dead end, never a sales line. `{{mood}}` is never used in urgency or paywall copy.
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
**Microcopy:** Rows: "💬 Always AI, and always says so" · "🔒 Private chats, delete anytime" · "🆘 In crisis? Call or text 988 (US) or visit findahelpline.com". Footer: "ChatChi doesn't give medical or mental health advice."
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
**Purpose:** The demo and the first half of the chat taste. The first message is about the user's actual day, which proves the niche promise before any ask. Reply ideas remove the blank box.
**Headline A:** {{companion}}
**Headline B:** {{companion}} · first chat
**Body A:** Tap a reply or write your own.
**Body B:** Say as much or as little as you like.
**Options:** (sample for mood = Exhausting, topic = Work, note = interview Thursday)
- 😮‍💨 Long day, honestly.
- 😬 Nervous about Thursday.
- 🙃 Distract me, please.
- ✏️ Type your own
**Visual:** `s17-chat-01` layout on the dusk theme, with the AI disclosure banner pinned on top. Opening bubble: "Exhausting one, huh? Was it work, or is Thursday's interview on your mind?" Three reply-idea rows, composer counter reading "Preview · 2 messages". "Need help now?" stays visible.
**Microcopy:** Top banner: "You're chatting with an AI companion — not a therapist." Every message passes crisis-language detection. On a match, the companion steps out of role, shows the crisis sheet and doesn't continue small talk until the user chooses to.
**CTA:** (tap a reply, message 1 of 2)

### 12. It remembers (end of the chat taste)
**Purpose:** Prove memory and support style live in two messages, then hand off to the memory page while the companion is still "typing".
**Headline A:** {{companion}} will remember that.
**Headline B:** Noted for next time.
**Body A:** Small details carry into tomorrow's chat.
**Body B:** You can edit this memory anytime.
**Visual:** Mid-chat. After the first reply, a toast slides in from the notebook icon ("📓 Sam will remember: interview Thursday"). The reply follows `{{support_style}}`: with "Help me plan", Sam offers a three-line prep list. The composer counter drops "Preview · 2 messages" → "Preview over".
**Microcopy:** The user sends at most 2 messages (`CONFIG.teaserMessages: 2`, one on #11, one here). After the companion answers the 2nd, the reply ideas hide, the composer locks, a typing bubble shows for ~1.5 s, then #13 opens. The chat taste is these two screens only: no third exchange, no follow-up consent bubble, and no free chat afterwards (hard paywall). If the user comes back into #11/#12 after the taste (back navigation, FunnelFox back, Say hi again on #10), the reply ideas stay hidden, the composer stays locked ("Preview over", placeholder "Get Plus to keep chatting") and the same typing hand-off moves them forward again (#13, or #16 once the email is saved). Crisis-flagged users follow the same path to #16. Events: `chat_message`, `chat_teaser_end`, then `paywall_view` with placement `chat_teaser` on #16.
**CTA:** (tap a reply, message 2 of 2)

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
**Visual:** Bottom sheet over the dimmed chat (composer hidden, no more messages), with a sample lock-screen push card.
**Microcopy:** Sample push (app voice, about the user's memory, never about absence): "ChatChi · How did the interview go? Sam saved your notes." Never "Sam misses you" or "haven't heard from you". Pushes pause after 3 unopened days, with no escalation. No promotional push follows a crisis-flagged chat.
**Skip link:** Not now
**CTA:** Turn on

---

## E. Email (mandatory)

### 15. Save your chat (email)
**Purpose:** Collect the email that activates the subscription: the app logs the payer in with it and links the Paddle purchase to it. Framed as saving *the user's* chat and memories. Required, right before the paywall.
**Headline A:** Where should we save {{companion}}'s memories?
**Headline B:** Save today's memory page.
**Body A:** We use it to activate your Plus and save your chat.
**Body B:** Your email activates Plus and keeps your chat safe.
**Field:** One email input (placeholder "you@example.com"). No Apple / Google / social sign-in, no guest option.
**Visual:** Mini memory page above the headline on the dusk theme, mail icon inside the input, lock hint under it.
**Error states:** Empty: "Enter your email to continue" · Invalid format: "Enter a valid email". The CTA does nothing until the email is valid.
**Microcopy:** Hint: "Private. No spam. You log in to the app with it." Legal line: "By continuing you agree to the Terms and Privacy Policy.", where Terms and Privacy Policy are underlined links to `CONFIG.legal` (new tab). On submit: `S.email` is set and `emit('lead',{method:'email'})` fires; the FunnelFox build passes it to `inputs.setEmail`, which pre-fills checkout. #22 step 2 then reads "Log in with {{email}}".
**CTA:** Save my chat

---

## F. Monetization

### 16. Paywall — long scroll
**Purpose:** The primary ask, right after the chat taste, the memory page and the email step. It sells more talk and deeper memory in the app's voice, Hard paywall: there is no free plan and no way back into a chat without buying.
**Headline A:** {{companion}} wants to keep talking.
**Headline B:** {{companion}} wants to keep talking.
**Body A:** Unlimited chat, long-term memory, and their voice.
**Body B:** No daily limit. Memory that carries into tomorrow.
**Plans:** 1 month · 3 months · 12 months (12 months pre-selected, "★ Most popular ★" ribbon). Each card shows the first-period price, then "Then {{renewal}} {{period}}. Cancel anytime." 1 month $24.99, then $49.99 every month · 3 months $49.99, then $109.99 every 3 months · 12 months $119.99, then $299.99 every year (Paddle, one price per checkout).
**Visual:** A web landing page, not an app sheet: one long scroll on the dusk theme, top to bottom:
1. Sticky brand bar: ChatChi logo, a mini "Continue" CTA (fades in whenever no plan-block CTA button is fully on screen; scrolls to plan block 1), close X. "Need help now?" sits in its own strip above it.
2. Personal hero: the companion's portrait full-bleed, eyebrow "Your companion is ready", headline, body. Under it, chips from the user's picks (For {{name}} · personality · support style · up to 2 topics · voice; never the mood), then the mini memory page (date, Day 1 flame, 2 remembered items) with "{{companion}} remembers {{n}} things from today. Saved from your chat. Only you can see it, and it carries into tomorrow's first message."
3. Plan block 1 (eyebrow "Choose your plan", H2 "Keep talking with {{companion}}"): one elevated card with the 3 plan cards (12 months pre-selected), a "Due today · {{plan}}" row, CTA "Keep talking with {{companion}}", "Secure checkout · Cancel anytime", payment badges (Apple Pay · G Pay · VISA · Mastercard · PayPal), the renewal line for the selected plan, legal and fair-use lines.
4. What you get ("Everything in ChatChi Plus"): 6 benefit rows, each a gradient icon well + title + one line.
5. How it works ("From checkout to your chat"): 1 Choose your plan (secure checkout in the browser) · 2 Get the ChatChi app (App Store / Google Play) · 3 Log in with {{email}} (Plus is already on; {{companion}} and today's memory page are waiting).
6. Why go Plus ("Tomorrow, {{companion}} remembers"): a mock of tomorrow's first message (memory chip "From yesterday: …" + the day-2 opener), then 3 fact cards "24/7 · {{companion}} is there, day or night" · "Voice · hear {{companion}} speak" · "You · decide what they remember", and the wellbeing line. Product facts only: no ratings, user counts or reviews until ChatChi has real ones.
7. FAQ ("Good to know", accordion): Can I cancel anytime? · When do I get Plus? · Will I be charged again? · Is my chat private? · What happens after checkout? · Is ChatChi a therapist?
8. Plan block 2 (eyebrow "Ready when you are", H2 "{{companion}} is saving your seat"): the same card as block 1.
9. Footer: logo, Terms of Service · Privacy Policy, "Questions? support@chatchi.co", wellbeing line. No skip link.
10. Sticky bottom CTA bar: "ChatChi Plus · {{plan}}" + "Due today {{price}}" and a "Continue" button (opens the selected plan's checkout). Shown, on a solid background, whenever no plan-block CTA button is fully on screen, so the first view always shows a price and a CTA on every screen size (a plan block only peeking at the bottom edge does not count); the footer has bottom padding so it never covers content at the end of the scroll.
Changing plan updates both plan blocks and the sticky bar in place (no re-render, scroll position kept). If the user comes back after a sale or lifetime checkout, the paywall still shows a visible plan selected (the sale's base plan, else 12 months), never a hidden plan. The same page opens from every route (email step, declined sale/lifetime, reload, FunnelFox).
**Microcopy:** Benefit rows: "Unlimited chat · Talk as long as you need, day or night." · "Long-term memory you control · See, edit or delete anything {{companion}} remembers." · "Hear them speak · {{companion}}'s {{voice}} voice, in the app." · "Daily check-ins · One gentle message a day, at the time you pick." · "5 personas · Change how {{companion}} talks, anytime." · "Unlimited reply ideas · Never stuck on what to say." Renewal line (selected plan): "{{price}} today, then {{renewal}} {{period}} until you cancel." Legal: "Auto-renews at the price and period shown until cancelled. Cancel anytime in account or store settings." Fair-use: "Unlimited means normal use, capped at 300 messages a day to stop abuse." FAQ answers: cancel "Yes. Cancel in your account or store settings whenever you like. No call, no form." · when "Right after checkout. Download the ChatChi app, log in with the email you saved, and Plus is already on." · charged again "Yes. Each plan renews at the price shown on it until you cancel. The 12-month plan renews once a year." · private "Your chats are never public. You can see, edit or delete any memory, or your whole account, in the app." · after checkout "You open the app and pick up with {{companion}} right where you left off. Today's memory page is saved to your account." · therapist "No. {{companion}} is an AI companion for everyday chats, not therapy or medical advice. If you need help now, call or text 988 (US) or visit findahelpline.com. Always free." Wellbeing line: "ChatChi is AI, not therapy. Crisis resources are always free."
**Checkout flow:** Tapping a plan card opens that plan's checkout straight away (the CTA does the same for the selected plan). Leaving a checkout without paying opens the same plan's sale screen (#17-#19). Closing the paywall (X) opens the lifetime last step (#20) every time; declining #20 returns here. Reload on the paywall stays on the paywall. On a crisis-flagged path the X opens the "Need help now?" sheet instead of #20 and the user stays on the paywall.
**Skip link:** none (hard paywall)
**CTA:** Keep talking with {{companion}}

### 17. Sale - 1 month (after leaving the 1-month checkout)
**Purpose:** A second, cheaper first period for the plan the user already chose, instead of a generic downsell.
**Headline A:** Keep talking with {{companion}}, for less
**Body A:** Your 1 month plan at a lower first price.
**Plans:** ChatChi Plus · 1 month: $22.99 for the first month with the regular first-month $24.99 struck (same plan length only), then $49.99 every month until cancelled.
**Visual:** Same web look as the paywall: top bar with the ChatChi logo and close X, eyebrow "Special offer · 1 month", one pink-bordered glowing card with the companion's avatar, "ChatChi Plus · 1 month", "With {{companion}} · private to you", price row (struck regular → sale, "first month"), 3 checks (Unlimited chat, whenever you need it · Long-term memory you control · Daily check-ins at your time), CTA, renewal line, wellbeing line, plain "No thanks" link, legal links.
**Microcopy:** Renewal line: "$22.99 for the first month, then $49.99 every month until you cancel. Cancel anytime in account or store settings." Accept → checkout of the `m1_sale` price. "No thanks", the X, or leaving that sale checkout without paying → #20. Events: `sale_view`, `sale_accept` + `checkout_click` (plan `m1_sale`), `sale_decline`, `checkout_decline`.
**CTA:** Claim 1 month offer

### 18. Sale - 3 months (after leaving the 3-month checkout)
**Purpose:** Same as #17 for the 3-month plan.
**Headline A:** Keep talking with {{companion}}, for less
**Body A:** Your 3 months plan at a lower first price.
**Plans:** ChatChi Plus · 3 months: $44.99 for the first 3 months, regular $49.99 struck, then $109.99 every 3 months.
**Visual:** As #17, eyebrow "Special offer · 3 months".
**Microcopy:** Accept → `m3_sale` checkout. Decline or leave → #20.
**CTA:** Claim 3 months offer

### 19. Sale - 12 months (after leaving the 12-month checkout)
**Purpose:** Same as #17 for the 12-month plan.
**Headline A:** Keep talking with {{companion}}, for less
**Body A:** Your 12 months plan at a lower first price.
**Plans:** ChatChi Plus · 12 months: $105.99 for the first year, regular $119.99 struck, then $299.99 every year.
**Visual:** As #17, eyebrow "Special offer · 12 months".
**Microcopy:** Accept → `y12_sale` checkout. Decline or leave → #20.
**CTA:** Claim 12 months offer

### 20. Lifetime - last-chance offer
**Purpose:** The last step of the decline chain: one payment, no subscription. Replaces the old weekly last-chance offer (`CONFIG.offer.enabled: false`).
**Headline A:** Keep {{companion}} forever
**Body A:** One payment. No subscription, nothing to renew.
**Plans:** ChatChi Plus · Lifetime: $99.99 paid once, no renewal (a one-time product, not a subscription SKU).
**Visual:** As #17, eyebrow "Last offer · pay once", price row "$99.99 · paid once", checks "Unlimited chat with {{companion}}, forever · Long-term memory you control · Every future update included".
**Microcopy:** Fine print: "$99.99 once. No renewal, nothing to cancel." Accept → `lifetime` checkout. "No thanks", the X, or leaving the lifetime checkout (FunnelFox native × too) → back to #16 paywall. Reached from a declined sale, or every time the paywall is closed. Never shown on a crisis-flagged path.
**CTA:** Get lifetime access

---

## G. Payoff

### 21. Add-on upsell (after a subscription purchase)
**Purpose:** One more ask while intent is highest: a one-time extra on top of the plan just bought. The subscription stays as it is.
**Headline A:** Add a second companion
**Body A:** One more friend, one more voice. Yours to keep.
**Plans:** Bonus companion, $22.99 paid once (its own one-time Paddle price, hidden checkout `addon`; not a subscription, nothing renews). Copy lives in `CONFIG.upsell`.
**Visual:** The #17 offer look. Eyebrow "You're in · one more thing", "Bonus companion · Alongside {{companion}} · private to you" next to a "new companion" avatar (dashed ring, person icon, small + badge; not the current companion's face), price row "$22.99 paid once", 3 checks (Create a second companion from scratch · Their own memory and chats · Paid once, no renewal), CTA, fine print, "No thanks".
**Microcopy:** Fine print: "$22.99 once. Your plan stays as it is." Accept → `addon` checkout; paid or left → #22. Paid add-on shows "Bonus companion added. Create them in the app." on #22. Lifetime buyers (#20) skip this screen. Events: `upsell_accept` (plan `addon`), `upsell_decline`, `purchase_complete` (plan `addon`).
**CTA:** Add for $22.99

### 22. Get the app
**Purpose:** Hand payers to the app, where the memory journal, check-ins and day 2 live.
**Headline A:** You're in. {{companion}} is waiting.
**Body A:** Your chat continues in the ChatChi app.
**Visual:** Gradient check well, 3 numbered steps (Download ChatChi: AI Roleplay Chat · Log in with {{email}}, "The email you saved your chat with.", falling back to "Log in with your checkout email" · Open your chat with {{companion}}), "Open the app" CTA, App Store and Google Play badges, "Keep chatting here" link back to #23 (unlimited).
**Microcopy:** After a paid add-on (#21) a line under the body: "Bonus companion added. Create them in the app." Store links and the deep link come from `CONFIG.app`, not set yet (placeholder store URLs).
**CTA:** Open the app

### 23. Back in the chat
**Purpose:** Plus-only web chat, reached from #22 "Keep chatting here". A non-premium user can never land here: any route (decline, debug fill, FunnelFox navigation, restore) is redirected to #16.
**Headline A:** {{companion}}
**Headline B:** Right where you left off.
**Body A:** Pick up right where you left off.
**Body B:** Unlimited chat is on.
**Visual:** `s18-chat-01` on the dusk theme, same thread as the taste. No counter (Plus), with an "Open the ChatChi app" pill. "Ideas · 3" chip above the composer. AI banner on top.
**Microcopy:** Plus users get a one-time toast: "Unlimited chat is on."
**CTA:** (send a message)

### 24. Day 2 — they remembered
**Purpose:** The niche's real proof, on the next open. The first message references yesterday, which is what makes a companion feel like a friend and drives D1 retention.
**Headline A:** Day 2. They remembered.
**Headline B:** {{companion}} asked about yesterday.
**Body A:** Today's chat opens with what you shared.
**Body B:** Memory is what makes it feel like a friend.
**Visual:** New-day thread with a "from yesterday" memory chip (the note or the user's first reply) above the opening bubble: "Morning, {{name}}. Hope today feels a little lighter than yesterday." Streak flame shows "Day 2".
**Microcopy:** Plus only: fires on a paid user's next open in the same browser; a returning non-paying visitor starts at #1 (or resumes on the paywall in the same tab). No promotional push follows a crisis-flagged chat.
**CTA:** (tap a reply)

### 25. Daily limit reached (legacy, unreachable)
**Status:** Hard paywall: there is no free tier, so this screen is never shown. The engine keeps the code (`daily_limit`, `CONFIG.freeMessagesPerDay`), but a non-premium user routed here lands on #16 and Plus users never hit the limit card. Copy below kept for reference only.
**Purpose (old):** Highest-intent ask at the 10th message. Same plans, app voice, and never shown during a crisis-flagged conversation.
**Headline A:** You've used today's 10.
**Headline B:** Want to keep talking?
**Body A:** Resets at midnight. Or chat without limits.
**Body B:** Go unlimited, or come back at midnight.
**Visual:** Existing `s21-chat-01` inline card under the companion's last bubble: crown, pink border, composer disabled with "Out of messages · resets at midnight". Tapping it opens the #16 paywall with the quota headline.
**Microcopy:** The card is the app talking, never the companion. Closing that paywall opens #20 once per session (if not seen yet), otherwise returns to the card. If the conversation was flagged for crisis language, the card is replaced by the crisis card, and the resources and "Need help now?" link are never metered.
**Skip link:** Come back at midnight
**CTA:** Upgrade to ChatChi Plus

---

## Notes

- **Monetization rework (2026-10-06):** same plans and offers as `../chai-dream-girl/`. Three plans (1 / 3 / 12 months) replace Yearly / Weekly. Per-plan sale screens (#17-#19), a lifetime last step (#20), a post-purchase one-time add-on upsell (#21, a second companion at $22.99; changed from a $99.99 lifetime upgrade on 2026-10-06) and a get-app screen (#22) replace the old weekly last-chance offer (kept disabled in config).
- **Flow restored (2026-10-06, product owner):** the onboarding is the pre-rework one again; only the chat is shortened. The chat taste is #11-#12 with at most 2 user messages (`CONFIG.teaserMessages: 2`). Restored after it: the memory journal page (#13), the check-in time opt-in (#14) and the email screen (#15), which is now **mandatory** (it is how the purchase gets activated in the app) and email-only: the Apple / Google sign-in buttons, their handler and the guest option are gone. Still dropped: the 3rd chat exchange and the consented follow-up bubble ("Want me to ask how Thursday went?"), because the chat taste is capped at 2 messages. The checkout URL never carries the email; FunnelFox gets it through `inputs.setEmail` on the `lead` event.
- **Engine screen names (FunnelFox titles):** #1-#12 as before, #13 `day_remembered` (13), #14 `checkin_time` (14), #15 `save_memories` (15), #16 `paywall` (16), #17-#20 `sale_m1` / `sale_m3` / `sale_y12` / `sale_lifetime` (21-24), #21 `upsell_lifetime` (25), #22 `get_app` (26), #23 `back_in_chat` (17), #24 `day2_remembered` (18), #25 `daily_limit` (19). `CONFIG.declineFlow` maps each checkout to the screen opened when it is left without paying; `lifetime` → `paywall`, `addon` → `get_app`. `back_in_chat`, `day2_remembered` and `daily_limit` are Plus-only: no checkout × or navigation leads there.
- **What changed vs. the ChatChi base:**
  - The romance-and-genre picks become **mood → day → support style → personality**.
  - The romance cliffhanger becomes a **memory toast** in the chat taste.
  - A **day-2 payoff screen** (#24) is added, because "remembers your day" is only proven the next day.
  - The whole wellbeing layer (#1 crisis link, #2 sheet, #4 boundary, crisis detection, the path rule) is new to the companion-chat line.
- **Wellbeing boundaries (non-negotiable):**
  - Positioning is "friend", never "therapist", "treatment" or "cure loneliness". No mental-health outcome claims in ads or on the paywall.
  - The "Need help now?" link is on every screen, one tap, never behind sign-in or payment.
  - All free text passes crisis-language detection.
  - Hard paywall (2026-10-06): crisis-flagged users reach the same #16 (there is no free chat to send them to), but never the sale and lifetime screens (#17-#20); the paywall X opens the crisis resources. Legal should confirm this before launch.
  - `{{mood}}` never feeds urgency copy.
  - Legal should review the crisis flow and the US state rules on companion apps before launch.
- **Why no physical attributes:** Honey's 6-screen body quiz fits a male-gaze NSFW product and would contradict a SFW "AI that listens" promise for women 18-34. The personality pick carries the match.
- **Skipped on purpose:** the spin wheel, countdowns and "Lucky today" pricing, and social-proof stats and reviews (none are verified). The "Why go Plus" cards are product facts computed from config.
- **Pricing:** 1 month $24.99 → $49.99, 3 months $49.99 → $109.99, 12 months $119.99 → $299.99; sales $22.99 / $44.99 / $105.99 for the first period; lifetime $99.99 once. No free tier (hard paywall); fair-use cap 300. Legal: Terms https://squad-xteam.com/termofuse.html, Privacy https://squad-xteam.com/policy.html, support support@chatchi.co.
- **Drop-off risk:** #1 (age wheel plus hero), #4 (the boundary screen reads as friction, so keep it to 3 rows) and #16. The day-2 screen (#24) is the retention metric that matters most for this niche.
- **Hard paywall (2026-10-06, product owner):** users may try the chat for 1-2 messages, then must buy. Removed: "Continue free · 10 messages a day" on the paywall, "No thanks, continue free" on #20 and the old offer, the free chat after a decline, the "30× more messages than the free plan" card, the free-tier counter. Paywall X → #20 every time (no once-per-session rule), #20 decline → #16.
- **Monetization:** one trigger (#16 onboarding CVR with placement `chat_teaser`), plus sale, lifetime and upsell take rates. Report crisis-path users separately and exclude them from CVR targets, so no one is tempted to optimize that path.
- **A/B first:** (1) Hook A "remembers your day" vs. B "How was today, really?". (2) Teaser 2 messages vs. 3. (3) The #3 optional note on vs. off, to see if it lifts #24 D1.
