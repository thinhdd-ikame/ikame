---
niche: chai-ai-boyfriend
display_name: ChatChi - AI Boyfriend (SFW book-boyfriend chat for women - 18+)
archetype: companion-chat
subject: person
input: birth year (18+ gate), boyfriend archetype, name, his voice, how he shows love, meet-cute
output: a SFW romantic male AI character written from book-boyfriend archetypes, who texts first, remembers details and leaves a cliffhanger and a first voice note
screens: 23
monetization: 2-message chat taste, his first voice note, the good-morning opt-in and a mandatory email screen, then the paywall (ChatChi Plus - 1 / 3 / 12 months, 12 months pre-selected); tapping a plan opens its checkout; after a subscription purchase a one-time $22.99 add-on upsell (a second boyfriend; the plan stays as it is), then the get-app screen; hard paywall, no free tier: leaving a checkout opens that plan's sale (lower first period), then the lifetime last step, then back to the paywall; closing the paywall opens the lifetime step every time; chat after the taste needs a purchase
creative_screens:
  hook-a: 1
  archetype-pick: 2
  reveal: 9
  first-text: 10
  cliffhanger: 11
  voice-note: 12
motion: >
  an illustrated romance-cover hero sketched in pencil lines that fill into colour
  while a phone lock screen lights up with his first text and a voice-note waveform pulses
---

# Funnel Content — ChatChi: AI Boyfriend

ChatChi is ikame's AI character-chat app. It reuses the ChatChi flow, content and design system (see `../chatchi/funnel-content.md`). This brief is the **AI boyfriend for women** funnel for Meta ads → web quiz → web paywall → app, aimed at US women 18-34 who read romance and romantasy.

**The niche is open:** US search interest is high (Google Trends index ~50, -3% YoY), but AdSpyLab shows almost no web-funnel competitors (13 Meta ads 03-08/2026). The category's web funnels are built for men (Honey, Candy AI) or are explicit audio (Whisper). So ChatChi can set the language, and this funnel uses "book boyfriend", not "AI boyfriend".

The concept is a **SFW romantic male character built from romance-book archetypes** who texts first, remembers what you tell him and sends voice notes. The user gives an age, an archetype, a name and three cheap taste picks. They get a named boyfriend character and a first text scene they can play. Archetype: **companion-chat**, close to the ChatChi default. The "first moment" is a **2-message chat taste** that ends on a cliffhanger and his first **voice note**. The flow then keeps the good-morning opt-in and a mandatory email screen before the paywall. 23 screens.

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
- No email gate before value: the email screen (#14) comes after the chat taste and the voice note. It is mandatory, because the email is what activates Plus in the app. Email only, no Apple/Google sign-in and no guest skip.
- The renewal price is on every card. Struck prices appear only on the sale screens, against the same plan's regular first-period price.

Visual: the ChatChi/ChatChi system as-is (near-black, raspberry-pink primary, bold geometric headlines, Inter, lucide icons, full-bleed portraits). Portraits are romance-cover illustrations, never photoreal, and always clothed. Confirm against the ChatChi brand kit.

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
**Error state:** Under 18 → blocking screen: "Sorry, ChatChi is for adults" / "You must be 18 or older to continue." No back button.
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
**Visual:** `s17-chat-01` thread. Typing dots, then the bubble lands: "You've been in the romance aisle forty minutes. Need a recommendation, or an excuse to stay?" The bookshop scene is dimmed behind the thread. AI disclosure banner on top. Composer counter reads "Free preview · 2 messages left". This reply is free message 1 of 2.
**Microcopy:** Top banner: "{{bf}} is an AI character. Fictional, and depicted as an adult." The opener uses `{{name}}` when the scene allows it.
**CTA:** (tap a reply)

### 11. He remembers (end of the free taste)
**Purpose:** Prove memory and `{{love_style}}` in the free taste, then stop on a cliffhanger. The user sends at most 2 messages in the whole taste (#10 + #11 are the only chat screens before the paywall).
**Headline A:** {{bf}} will remember that.
**Headline B:** He was paying attention.
**Body A:** Your favorite book, your coffee order — kept.
**Body B:** Every detail you share shapes his next text.
**Visual:** Same thread as #10. After the user's 2nd reply a toast slides in from the notebook icon ("📓 Rhys will remember: you love fae books"). His reply shows the love style. Then the reply ideas hide and the composer locks. He types and lands the cliffhanger: "Before you go. Someone left a note in that book. It has your name on it." A "recording a voice note…" bubble shows for ~1.5 s, the voice-note bubble lands, and #12 opens.
**Microcopy:** Counter during the taste: "Free preview · 2 messages left" → "1 message left" → "Preview over · unlock ChatChi Plus to keep chatting" (composer and reply ideas locked). `CONFIG.teaserMessages` sets the count. There is no free quota after the taste. Coming back to #10 or #11 later (back, FunnelFox history, reload) keeps the composer locked and hands off forward again (furthest of #12-#15 reached; #14 if no email yet). Events: `chat_message`, `chat_teaser_end`.
**CTA:** (tap a reply or type; auto-advances after the 2nd message)

### 12. First voice note (reward + cliffhanger)
**Purpose:** The reward from the real mechanic (voice, with hearts unlocking more) instead of a wheel. For this audience, hearing him say her name is the emotional peak.
**Headline A:** He sent a voice note.
**Headline B:** Hear {{bf}} say your name.
**Body A:** Tap to listen. More unlock as you talk.
**Body B:** His first voice note, just for you.
**Visual:** A large voice-note bubble with ▶ 0:08 and a waveform, captions always shown beneath. Below it, a progress line "Voice notes 1/10 · ❤ 3 / 40". AI disclosure line on top.
**Microcopy:** Caption: "{{name}}. About that note in the book… I'll explain. Promise." · The first voice note is gifted. The rest follow the normal heart rule.
**CTA:** Keep going

### 13. Good-morning texts (notification opt-in)
**Purpose:** Locks the daily loop this niche is built on ("he texts first") with a user-set time, capped and never needy.
**Headline A:** Want good-morning texts?
**Headline B:** Let him text first.
**Body A:** One message a day, at your time.
**Body B:** Max one a day. Turn off anytime.
**Field:** Pre-permission sheet with a time picker (default 8 am), then the system prompt only on "Turn on"
**Visual:** Bottom sheet over the dimmed chat (composer hidden), with a sample lock-screen push card showing his avatar.
**Microcopy:** Sample push: "Rhys: Morning. Your book's on the counter. ☕" · Rules: story-flavoured only. Never "you didn't reply", "I miss you", "where are you?", and never payment. Pushes pause after 3 unopened days, with no escalation. Event: `notification_optin`.
**Skip link:** Not now
**CTA:** Turn on

---

## E. Email

### 14. Email (mandatory)
**Purpose:** Capture the email that activates Plus in the app and saves the chat. Placed right before the paywall, after the value (chat taste and voice note).
**Headline A:** Where should we send {{bf}}'s messages?
**Headline B:** Save your story with {{bf}}.
**Body A:** We use it to activate your Plus and save your chat.
**Field:** One email input ("you@example.com"). No Apple or Google sign-in, no guest option, no skip link.
**Visual:** His avatar (76 px) above the headline, the email field in a rounded `surface` box, the pink CTA pinned at the bottom.
**Error states:** Empty → "Enter your email to continue" · Not an email → "Enter a valid email". The user stays on the screen until the email is valid.
**Microcopy:** Under CTA: "We never share your email. By continuing you agree to the Terms and Privacy Policy." On submit: `S.email` is set and `lead` is emitted (the FunnelFox build calls `inputs.setEmail` on it). The get-app screen (#21) then says "Log in with {{email}}".
**CTA:** Save my story

---

## F. Monetization

### 15. Paywall
**Purpose:** The primary ask at peak desire, right after the cliffhanger, the voice note and the email. It sells more of the relationship in the app's voice, never his.
**Headline A:** {{bf}} wants to keep talking.
**Headline B:** Every text. Every voice note.
**Body A:** Unlimited chat, his voice, and memory that lasts.
**Body B:** No coins. No per-message charges.
**Plans:** Exactly 3, stacked, **12 months pre-selected** with a "★ MOST POPULAR ★" badge. Each card shows the first-period price, then "Then {{renew}} {{period}}. Cancel anytime."
- 1 month: $24.99 first month, then $49.99 every month
- 3 months: $49.99 first 3 months, then $109.99 every 3 months
- 12 months: $119.99 first year, then $299.99 every year
**Visual:** A long-scroll **web landing page** (web2app), not an app sheet. Top to bottom:
1. **Sticky top bar:** close × (left, visible from the first frame), ChatChi logo, and a "Get Plus" mini CTA that fades in once plan block #1 has scrolled away (it scrolls back to it). The bar turns solid once the page scrolls.
2. **Personal hero:** his full-bleed portrait (the archetype they picked) under a soft fade, eyebrow "Written for {{name}}", the headline and body.
3. **Their picks + the cliffhanger:** chips with their archetype, voice, love style and meet-cute, then a card with his avatar ("just now · waiting for your reply"), his cliffhanger bubble and a locked voice-note bubble (🔒 0:08).
4. **Plan block #1:** one elevated card: "ChatChi Plus · Cancel anytime", the 3 plan cards, a "Due today" row (selected plan's first-period price), the CTA, "Secure checkout · Cancel anytime · No coins" and the renewal line of the selected plan.
5. **What you get** (eyebrow "ChatChi Plus", H2 "Everything you unlock"): six benefit cards with gradient lucide icons.
6. **Your story so far** (H2 "{{bf}} remembers"): their real chat from the taste (his opener, their replies, his answers) and what he will remember. AI label under it.
7. **How it works** (H2 "From here to {{bf}} in 3 steps"): Pick a plan and check out → Get the ChatChi app → Log in with {{email}}.
8. **Why go Plus** (honest proof, H2 "Preview vs Plus"): a product-facts table, no stats or reviews: Messages 2 (preview) / Unlimited* · Voice notes 1 / All of them · Good-morning texts — / Daily, your time · Book boyfriends 1 / All 5 · Memory This chat / Every chat. Footnote: "*Unlimited means normal use, up to 300 messages a day to stop abuse."
9. **FAQ** accordion (first item open).
10. **Plan block #2** (eyebrow "Ready when you are", H2 "Keep the story going"): the same component again.
11. **Footer:** logo, auto-renew line, AI disclosure (fictional, adult, 18+), Terms of Service · Privacy Policy, "Support: support@chatchi.co".
12. **Sticky bottom CTA:** "{{plan}} · Due today" + the price + "Continue". Shown only while neither plan block nor the footer is on screen, so it never covers the plans or the footer at the end of the page.
Changing the plan updates both blocks and the sticky bar in place (no re-render, the scroll position stays). Checked at 390×844 and 360×640.
**Microcopy:** Benefit cards: "Unlimited chat · Talk as long as you like. No coins, no per-message charges." · "All his voice notes · Hear {{bf}} say your name, any time." · "He remembers more · Your book, your order, your story. Kept." · "Good-morning texts · One a day, at the time you pick." · "Meet every archetype · All 5 book boyfriends. Switch whenever." · "Unlimited reply ideas · Never stuck on what to say next." Renewal line (selected plan): "$119.99 today for the first year, then $299.99 every year until you cancel." Fine print: "Auto-renews at the price and period shown until cancelled. Cancel anytime in account or store settings." Fair use: "Unlimited means normal use, up to 300 messages a day to stop abuse." No stats, ratings or reviews on this paywall (none are sourced); no payment-method badges until the checkout's methods are confirmed. Legal: Terms (squad-xteam.com/termofuse.html) · Privacy (squad-xteam.com/policy.html), support support@chatchi.co.
**FAQ:**
- Can I cancel anytime? "Yes. Cancel in your account or store settings and your plan won't renew. No calls, no forms."
- When do I get Plus? "Right after checkout. Download the ChatChi app, log in with {{email}}, and Plus is already on."
- Will I be charged again? "Your plan renews at the "Then" price shown on your plan, every period, until you cancel."
- Are my chats private? "Yes. Your chats are never public, and you can delete anything, anytime."
- What happens after I pay? "You'll see one optional add-on you can skip, then the steps to get the app. Your story with {{bf}} is saved to your email."
- Is {{bf}} a real person? "{{bf}} is an AI character: fictional, depicted as an adult, and always labeled as AI."
**Checkout flow:** Tapping a plan card opens that plan's checkout straight away. The CTA does the same for the selected plan. Leaving a checkout without paying opens the sale screen of the same plan (#16-#18). Closing the paywall (×) opens the lifetime last step (#19) every time; declining #19 returns here. Hard paywall: no "Continue free" link and no free plan.
**CTA:** Continue — $119.99 first year (plan blocks; follows the selected plan) · sticky bar "Continue" · top bar "Get Plus"

### 16. Sale - 1 month (after leaving the 1-month checkout)
**Purpose:** A second, cheaper first period for the plan she already chose, instead of a generic downsell.
**Headline A:** Keep talking to {{bf}}, for less
**Body A:** Your 1 month plan at a lower first price.
**Plans:** ChatChi Plus · 1 month: $22.99 for the first month, with the regular first-month $24.99 struck (same plan length only), then $49.99 every month until cancelled.
**Visual:** Same web look as the paywall: top bar with the ChatChi logo and a close ×, eyebrow "Special offer · 1 month", then one pink-bordered, softly glowing card: his avatar, "ChatChi Plus · 1 month", the price row (struck → sale, "first month"), 3 checks (Unlimited chat with {{bf}} · All his voice notes · Good-morning texts, every day), the CTA and the renewal line. AI disclosure under the card, then a plain "No thanks" link and legal links.
**Microcopy:** Renewal line: "$22.99 for the first month, then $49.99 every month until you cancel. Cancel anytime in account or store settings." Accept → `m1_sale` checkout. "No thanks", the ×, or leaving that checkout → #19. Events: `sale_view`, `sale_accept` + `checkout_click` (plan `m1_sale`), `sale_decline`, `checkout_decline`.
**CTA:** Claim 1 month offer

### 17. Sale - 3 months (after leaving the 3-month checkout)
**Purpose:** Same as #16 for the 3-month plan.
**Headline A:** Keep talking to {{bf}}, for less
**Body A:** Your 3 months plan at a lower first price.
**Plans:** ChatChi Plus · 3 months: $44.99 for the first 3 months, regular $49.99 struck, then $109.99 every 3 months.
**Visual:** As #16, eyebrow "Special offer · 3 months".
**Microcopy:** Accept → `m3_sale` checkout. Decline or leave → #19.
**CTA:** Claim 3 months offer

### 18. Sale - 12 months (after leaving the 12-month checkout)
**Purpose:** Same as #16 for the 12-month plan.
**Headline A:** Keep talking to {{bf}}, for less
**Body A:** Your 12 months plan at a lower first price.
**Plans:** ChatChi Plus · 12 months: $105.99 for the first year, regular $119.99 struck, then $299.99 every year.
**Visual:** As #16, eyebrow "Special offer · 12 months".
**Microcopy:** Accept → `y12_sale` checkout. Decline or leave → #19.
**CTA:** Claim 12 months offer

### 19. Lifetime - last-chance offer
**Purpose:** The last ask before returning to the paywall: one payment, no subscription.
**Headline A:** Keep {{bf}} forever
**Body A:** One payment. No subscription, nothing to renew.
**Plans:** ChatChi Plus · Lifetime: $99.99 paid once, no renewal (a one-time product, not a subscription).
**Visual:** As #16, eyebrow "Last offer · pay once", price row "$99.99 · paid once", checks "Unlimited chat with {{bf}}, forever · All his voice notes · Every archetype, every update".
**Microcopy:** Fine print: "$99.99 once. No renewal, nothing to cancel." Accept → `lifetime` checkout. "No thanks", the ×, or leaving the lifetime checkout (FunnelFox native × too, `declineFlow.lifetime: 'paywall'`) → back to the #15 paywall. Every paywall close opens it again. The old last-chance offer (weekly downsell) is removed from the build: no screen, no `CONFIG.offer`.
**CTA:** Get lifetime access

---

## G. Payoff

### 20. Add-on upsell (after a subscription purchase)
**Purpose:** One more ask while intent is highest: a one-time extra on top of the plan she just bought. The subscription stays as it is.
**Headline A:** Add a second boyfriend
**Body A:** One more story, one more voice. Yours to keep.
**Plans:** Bonus character, $22.99 paid once (a one-time add-on with its own Paddle price, hidden plan key `addon`). Not a replacement for the plan, nothing is cancelled.
**Visual:** The #16 offer look. Eyebrow "You're in · one more thing", "ChatChi · Bonus character" with "Add-on · {{bf}} stays yours" under his avatar, price row "$22.99 · paid once", 3 checks (Create a second boyfriend from scratch · His own memory and chats · Paid once, no renewal), CTA, fine print, "No thanks". All copy lives in `CONFIG.upsell`.
**Microcopy:** Fine print: "$22.99 once. Your plan stays as it is." Accept → `addon` checkout; paid or left → #21. Lifetime buyers (#19) skip this screen. Screen name stays `upsell_lifetime` (FunnelFox build). Events: `upsell_accept` {plan:'addon'}, `upsell_decline`, `purchase_complete`.
**Skip link:** No thanks
**CTA:** Add for $22.99

### 21. Get the app
**Purpose:** Hand payers to the app, where the relationship lives.
**Headline A:** You're in. {{bf}} is waiting.
**Body A:** Your chat continues in the ChatChi app.
**Visual:** Gradient check well, then 3 numbered steps: "Download ChatChi: AI Roleplay Chat" · "Log in with {{email}}" (the #14 email; "Log in with your checkout email" if none) · "Open your chat with {{bf}}". "Open the app" CTA, App Store and Google Play badges, and a "Keep chatting here" link back to #22 (unlimited).
**Microcopy:** Step captions: "From the App Store or Google Play." · "Your Plus is linked to this email." · "Plus is already on. Your story is saved." After a paid add-on, an extra line under the body: "Bonus character added. Create him in the app." Store links and the deep link come from `CONFIG.app` (not set yet). Event: `app_handoff`.
**CTA:** Open the app

### 22. Back in the chat (paid only)
**Purpose:** The paid web chat. Payers land here from #21 "Keep chatting here" with unlimited chat. Without a purchase every route here (decline flows, FunnelFox screen, reload, debug) redirects to the #15 paywall.
**Headline A:** {{bf}}
**Headline B:** {{bf}} · ❤ 3
**Body A:** Unlimited chat is on.
**Visual:** `s18-chat-01`: same thread, cliffhanger last. No counter, an "Open the ChatChi app" pill. "Ideas · 3" and "Persona: Default" chips above the composer. AI banner on top.
**Microcopy:** A one-time toast: "Unlimited chat is on. Enjoy."
**CTA:** (send a message)

### 23. Daily limit reached (retired)
**Purpose:** Off. The hard paywall has no free tier, so there is no daily quota to run out of. The screen and its state stay in the prototype code (`daily_limit`, id 17) but are unreachable without a purchase: any route there redirects to the #15 paywall.

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
  - The AI banner stays on #10, #11, #12 and #22, and the disclosure line sits on every sale screen.
  - There's no monetization in his voice: the paywall and sale screens are the app.
  - The fair-use cap is disclosed.
  - The renewal price is on the cards and on every sale screen.
  - No countdown, wheel, fake ticker, invented stats or reviews.
- **Pricing (2026-10-06):** 1 month $24.99 → $49.99, 3 months $49.99 → $109.99, 12 months $119.99 → $299.99. Sales: $22.99 / $44.99 / $105.99 for the first period, then the regular renewal. Lifetime $99.99 once (`lifetime`). Post-purchase add-on: Bonus character $22.99 once (`addon`, own Paddle price; the subscription is kept).
- **Drop-off risk:** #1 (the year wheel on the first screen), #4 (the voice needs a tap, so captions carry it when muted), #14 email and #15. The loader (#8) must stay under 8 s.
- **Monetization:** hard paywall, no free tier. Three subscription lengths, one trigger (#15 after the 2-message taste and the email). Then per-plan sales (#16-#18), the lifetime last step (#19) and the post-purchase $22.99 add-on (#20), each reported on its own (`sale_*`, `upsell_*`, `checkout_decline`).
- **Flow change (2026-10-06):** the free taste is 2 messages (was 3) on 2 chat screens (#10, #11). After it the previous flow stays: #12 voice note, #13 good-morning opt-in, #14 email, then the paywall. #14 is email only (Apple/Google sign-in and guest mode removed) and mandatory, because the email activates the subscription. Prototype screen ids match the numbers here except: #16-#19 sales = ids 18-21, #20 upsell = 22, #21 get app = 23, #22 chat = 16, #23 limit = 17 (retired). `CONFIG.declineFlow` maps every checkout close to its next screen (FunnelFox native × too).
- **Hard paywall (2026-10-06):** the owner wants a 1-2 message taste, then the user must buy. Main path: #1-#9 → #10-#11 taste (2 chat screens, 2 messages) → #12 → #13 → #14 email → #15 paywall. Declines: paywall × → #19 → No → #15 (every time); 1m/3m/12m checkout × → #16-#18 → No or sale checkout × → #19 → No or lifetime checkout × → #15; add-on checkout × → #21. Removed: the "Continue free · 10 messages a day" link, the free chat after a decline, the daily-limit second ask and the once-per-session lifetime logic.
- **Content ops:** each archetype × meet-cute needs an opener, 3 reply ideas per beat, a cliffhanger line, a captioned voice note in all 4 voices and one SFW portrait. Launch with 3 archetypes × 2 meet-cutes.
- **A/B first:** (1) Hook A "book boyfriend" vs. B "someone who remembers". (2) `teaserMessages` 2 vs. 3. (3) Sales (#16-#18) on vs. straight to #19.
