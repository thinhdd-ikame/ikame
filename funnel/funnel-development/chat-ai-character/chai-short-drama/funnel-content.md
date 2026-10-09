---
niche: chai-short-drama
display_name: ChatChi - Short Drama Series (watch an episode, then talk to the lead - 18+)
archetype: companion-chat
subject: person
input: birth month and year (18+ gate), series, your name, two chat replies
output: a short vertical drama you watch, then a lead character who remembers what you just watched and talks about it
screens: 19
monetization: 2-message chat taste with the lead, then the Episode 3 lock and a mandatory email screen (activates Plus in the app), then a long-scroll paywall (ChatChi Plus - 1 / 3 / 12 months, 12 months pre-selected, Paddle); tapping a plan opens its checkout; after a subscription purchase a one-time $22.99 add-on upsell (Bonus character, plan kept), then the get-app screen; leaving a checkout opens that plan's sale (lower first period), then a one-time lifetime last step, then back to the paywall. HARD paywall: no free tier, no free chat after the taste; chat continues only after a purchase
creative_screens:
  hook-a: 1
  series-pick: 3
  episode-1: 5
  cliffhanger: 7
  chat-memory: 9
  ep3-locked: 10
  paywall: 12
motion: >
  a vertical story frame plays with progress bars filling at the top, the caption slides in,
  then the lead character steps out of the frame as a chat bubble that quotes the scene you just watched
---

# Funnel Content - ChatChi: Short Drama Series

ChatChi is ikame's AI character-chat app. This is the **short-drama niche** funnel for Meta ads, then web quiz, then web paywall, then app, for US/UK adults 18-34 who binge vertical drama and character chat. The user picks a series, plays two short episodes (still art plus captions, optional voice line), hits a cliffhanger, then **talks to the lead for two turns**. Episode 3 is locked behind the paywall. Archetype: **companion-chat**, variant **episode-unlock**: the unit of value is an episode, the free taste is two episodes plus a short chat, and the lock is a story lock, not a message lock. 19 screens (2026-10-06: the per-plan sale / lifetime / upsell / get-app flow from `../chai-dream-girl/` replaced the series-pass offer; the chat taste is capped at 2 screens and 2 messages; the Episode 3 lock and the email screen of the previous version are kept, the email is now mandatory because it activates Plus in the app, and the Apple / Google sign-in and guest skip are gone). This reuses the ChatChi structure of `../chai-roleplay/` (scene-first taste before the ask) and `../chai-ai-boyfriend/` (SFW tone, lead character). The Task 10 brief (`chai-named-character`) was not available at build time, so the named-lead idea is built here from those two siblings.

**Reference funnel (research `nebula-chai.md` section 6, `chai-candy.md`):** **Candy AI** short-drama funnel (holly-donovan variant, 31 screens): Episode 1 and 2 autoplay, Episode 3 is locked, then a long quiz and paywall. Sheet note: CandyShorts has been discontinued, so the category is marked "declining". Build last, safe to cut. Reading is [V] for the Candy structure; no live re-crawl was done for this build.

**Kept:** episodes as the hook, EP3 lock as the paywall trigger, the lead as the "person" you meet.

**Deliberately changed:**
- **The character remembers the episode.** After EP2 the lead replies with details from what you just watched (names, objects, the last line). Candy's character does not. This is the whole differentiator and the paid benefit.
- **SFW, no taboo titles.** Series are romance, thriller, fantasy-court. No family, workplace-power, forced or explicit framings, no sexual input.
- **18+ gate first** with a real birth-year picker.
- **Chat before the lock, not a 30-screen quiz.** Two turns with the lead, a typing bubble, the Episode 3 lock, the email, then the ask (the paywall hero is the locked Episode 3 cover).
- **No countdown, no fake unlock timer, no fake viewer ticker.** Renewal sits next to every price. The only struck price is on a sale screen, and it is the same plan's regular first-period price.
- **Honest lock:** EP3 is locked because it is part of the paid plan, and the screen says so.
- **AI disclosure** on every chat screen.

Visual: the ChatChi system (near-black, magenta-violet gradient primary, Plus Jakarta Sans headlines, Inter body, lucide icons, same tokens as `../chai-roleplay/`). Episodes use a **vertical story frame**: full-bleed illustration, thin segmented progress bars on top, a serif caption lower third, tap right to advance, tap left to go back. Illustration only, never photoreal people, all characters adult and clothed. Confirm against the ChatChi brand kit.

---

## A. Hook

### 1. Hook
**Purpose:** Mirror the ad: a drama you can step into. Sells "watch, then talk to them".
**Headline A:** Watch it. Then talk back.
**Headline B:** Short dramas that answer you.
**Body A:** Two episodes free. Then the lead chats with you.
**Body B:** They remember what you just watched.
**Visual:** Near-black ground. Three tilted vertical story frames (romance, thriller, fantasy) with tiny progress bars on top, a magenta glow behind them. Logo on top, a slim "Short drama" tag.
**Microcopy:** Under the CTA: "18+ · AI-generated · All characters are fictional"
**CTA:** Start watching

---

## B. Investment

### 2. Age gate
**Purpose:** Clear the legal gate before any story is shown. Birth month and year pickers, age computed to the month, under-18 is a hard stop.
**Headline A:** Adults only. Quick check.
**Headline B:** When were you born?
**Body A:** ChatChi dramas are for people 18 and older.
**Body B:** We only use this to confirm your age.
**Field:** Birth month + year selects, no default. CTA disabled until both are picked. A failed check is persisted for the session (`sessionStorage`), so a reload stays blocked.
**Visual:** Dimmed story frame behind a rounded `surface` box with the year select.
**Microcopy:** "AI-generated stories · All characters are fictional and 18+" · Footer: Terms of Service · Privacy Policy
**Error state:** Under 18 gives a blocking screen: "Sorry, ChatChi is for adults" / "You must be 18 or older to continue." No back button, and it stays blocked after a reload.
**CTA:** Continue

### 3. Pick your series
**Purpose:** The one real choice. The series sets the lead, the episodes and the voice of the chat.
**Headline A:** Pick your series.
**Headline B:** What are you watching?
**Body A:** Each has a different lead to talk to.
**Body B:** Switch series anytime later.
**Options:**
- 💍 The Wrong Date
- 🌙 Night Shift
- 👑 Crown of Ash
**Field:** Single select, tap advances. Each card shows a poster, the series title, a one-line logline and the lead's name. Sets `{{series}}` and `{{char_name}}` (Leo, Nora, Alden).
**Visual:** Three tall poster cards stacked as a swipe row with a genre accent each (rose, teal, amber). Picked card lifts. No dashed "Other" card, because the three series are the full catalogue.
**Microcopy:** Caption: "Illustrations only. Leads are AI characters."
**CTA:** (advances on tap)

### 4. Your name
**Purpose:** Captures `{{name}}` so the lead can say it and the memory feels personal.
**Headline A:** What should they call you?
**Headline B:** Your name in the story.
**Body A:** The lead will use it. Change it anytime.
**Body B:** Real name or a nickname. Your call.
**Field:** Text, 1-20 chars, shuffle button for names. CTA disabled while empty. If skipped, the fallback is "you".
**Visual:** Plain input on near-black, the lead's portrait blurred behind.
**Skip link:** Skip for now
**Error state:** "Add a name or skip for now"
**CTA:** Continue

---

## C. Episodes (the taste)

### 5. Episode 1
**Purpose:** The free taste. A vertical story that sets the hook and ends on a question.
**Headline A:** Episode 1
**Headline B:** {{series}}, part one
**Body A:** Tap to continue. Hold to pause.
**Body B:** About one minute. No sound needed.
**Visual:** Full-bleed vertical story frame with 3 slides (scene art, serif caption, small speaker chip "Voice line"). Segmented progress bars on top, a close/back chevron, a muted "Listen" chip per slide. Auto-advance 4 s per slide, tap to skip.
**Microcopy:** Bottom hint: "Episode 1 of 3 · free" · Top pill: "AI-generated story. Fictional."
**CTA:** Next episode

### 6. Episode 2
**Purpose:** Raise the stakes and plant the specific details the lead will quote later (a name, an object, a last line).
**Headline A:** Episode 2
**Headline B:** It gets personal.
**Body A:** Tap to continue. Hold to pause.
**Body B:** Watch closely. They notice details.
**Visual:** Same story frame, 3 slides, darker grade. Last slide freezes on a line of dialogue.
**Microcopy:** Bottom hint: "Episode 2 of 3 · free"
**CTA:** See what happens

### 7. Cliffhanger
**Purpose:** The story stops mid-reveal and the lead steps out of the frame. Moves the user from watching to talking.
**Headline A:** It stops right here.
**Headline B:** {{char_name}} wants a word.
**Body A:** Talk to them about what just happened.
**Body B:** They saw the same two episodes you did.
**Visual:** The frozen last frame of EP2, the lead portrait sliding out of it with a small "Watched: Ep 1, Ep 2" chip and a typing indicator.
**Microcopy:** Line from the lead, per series, quoted from EP2 · "{{char_name}} is an AI character. Fictional, and depicted as an adult."
**CTA:** Chat with {{char_name}}

---

## D. Chat (the memory)

### 8. Chat, turn 1
**Purpose:** First live exchange. The lead opens with a detail from EP1/EP2, and reply chips remove the blank box.
**Headline A:** {{char_name}} speaks first.
**Headline B:** They were there too.
**Body A:** Pick a reply, or type your own.
**Body B:** Three ways to answer.
**Options:** (sample for The Wrong Date, generated per series)
- 😏 Ask about the key
- 😳 Play it cool
- 🙃 Blame the wedding
**Field:** Tap a chip or type. Counter reads "10 messages left today".
**Visual:** Story art faded behind the chat, AI pill on top, a "Watched Ep 1-2" memory chip under the header, composer at the bottom.
**Microcopy:** "{{char_name}} is an AI character. Fictional, and depicted as an adult."
**CTA:** (tap a reply)

### 9. Chat, turn 2
**Purpose:** Prove the paid differentiator live: the lead quotes a specific thing from the episodes and the story bends.
**Headline A:** {{char_name}} remembers.
**Headline B:** They quoted the show.
**Body A:** Every detail you watched is in their memory.
**Body B:** Reply once more. Episode 3 is next.
**Options:** (sample)
- 🗝️ Take the key
- 🔍 Ask what he saw
- 🚪 Walk away
**Visual:** A toast from a notebook icon: "{{char_name}} remembers: Episode 2, the key on the table". Counter drops 2 to 0 over the two turns. After the reply the scene tint darkens.
**Microcopy:** Memory chip lists two things from the episodes (for example "the navy suit", "the key"). If the user types their own line the reply still references the same details. After the lead's reply the chips hide and the composer locks, a typing bubble shows for ~1.5 s, then the Episode 3 lock (#10) opens. These two chat screens are the whole chat taste: no other chat screen before the paywall. The user sends at most 2 messages (`CONFIG.teaserMessages`); after that a non-buyer can never send again. Going back into #8 or #9 after the taste shows the thread read-only (no reply ideas, composer locked, "Free preview used · Episode 3 is next") and hands off forward to #10 again. Events: `chat_message`, `chat_teaser_end`, `paywall_view` with placement `chat_teaser`.
**CTA:** (tap a reply)

---

## E. Gate and Monetization

### 10. Episode 3 (locked)
**Purpose:** The honest lock. The next episode is part of the paid plan, and the user already knows the lead. Sets up the email and the paywall.
**Headline A:** Episode 3 is locked.
**Headline B:** What happens next?
**Body A:** Unlock it and keep talking to {{char_name}}.
**Body B:** Part of ChatChi Plus, with unlimited chat.
**Visual:** Blurred poster of EP3 with a lock ring, "Ep 3 · ChatChi Plus" chip. Beneath it, a one-line tease from the lead in quotes.
**Microcopy:** "Your free preview ends here. Episode 3 and chat continue with ChatChi Plus." No timer, no "unlocking soon".
**CTA:** Unlock Episode 3

### 11. Save your story (email, mandatory)
**Purpose:** Capture the email that activates ChatChi Plus: the user logs in to the app with it after paying, so it is required. No social sign-in, no guest skip.
**Headline A:** Where should we send {{char_name}}'s messages?
**Headline B:** Save your progress.
**Body A:** We use it to activate your Plus and save your chat.
**Field:** One email field, validated (must look like name@domain.tld to continue). No Apple / Google buttons, no skip link.
**Visual:** Logo, headline, email field, legal line, CTA pinned to the bottom.
**Error state:** "That email doesn't look right. Check it?"
**Microcopy:** "Log in to the ChatChi app with this email to open your Plus. We only email about your account and your story." Terms | Privacy. On submit: `S.email` is set and `lead` fires (FunnelFox build: `inputs.setEmail(S.email)`), then the paywall (#12) opens. The get-app screen (#18) then says "Log in with {{email}}".
**CTA:** Save my story

### 12. Paywall
**Purpose:** The primary ask as a long-scroll web sales page, opened after the chat taste, the Episode 3 lock and the email screen. It sells the rest of the series and the lead's memory, in the app's voice, never the character's.
**Eyebrow:** {{name}}, your story is waiting. (without a name: "Your story is waiting")
**Headline A:** Unlock the rest of {{series}}.
**Headline B:** Keep watching {{series}}.
**Body:** {{char_name}} wants to keep talking. Episode 3 is next. (after the chat taste; otherwise A "Every episode, plus chat that remembers." / B "One plan. No coins. No per-episode charges.")
**Plans:** 1 month · 3 months · 12 months (12 months pre-selected, "BEST VALUE" ribbon: lowest price per month). Each card: plan name with a small per-month equivalent of the first period (3 months "≈ $16.66/mo first 3 months", 12 months "≈ $10.00/mo first year"; 1 month "Try it for a month"), the first-period price on the right, and under a dashed rule "Then {{renewal}} every {{period}}. Cancel anytime." 1 month $24.99, then $49.99 every month · 3 months $49.99, then $109.99 every 3 months · 12 months $119.99, then $299.99 every year (Paddle, one price per checkout).
**Visual (2026-10-06 web pass):** a web landing page, not an app sheet. Each section has a pink uppercase eyebrow and a 25px heading, ~34px apart.
(1) **Sticky top bar:** ChatChi logo, a mini "Unlock Ep 3" pill that fades in once plan block #1 scrolls away (scrolls back to it), close X.
(2) **Personal hero:** full-bleed series art under the bar, eyebrow with their name, headline, body; then 4 fact tiles from their run (Series · Your lead + role · Watched "Episodes 1-2 of 3" · You said "“{{last reply}}”") and the lead's tease line as a quote ("The letter is real, {{name}}. Ask me what it says.").
(3) **Plan block #1:** one elevated card: eyebrow "Choose your plan", "Keep watching {{series}}", 3 plan cards, "Due today {{price}}", CTA "Unlock Episode 3", payment badges (Apple Pay · G Pay · VISA · Mastercard · PayPal, confirm against the Paddle checkout before launch), "Secure checkout · Cancel anytime", renewal line for the selected plan.
(4) **What you get** - "Everything in ChatChi Plus", icon rows: Episode 3 of {{series}} (NEXT) · every episode, every series · unlimited chat with {{char_name}} (fair use 300/day) · a lead who remembers · voice lines (NEW) · your place is saved.
(5) **How it works** - "From checkout to Episode 3": 1 Check out here (about a minute) · 2 Get the ChatChi app (App Store / Google Play) · 3 Log in with {{email}}: Episode 3 and {{char_name}} are waiting, Plus already on.
(6) **Product facts** - "Why go Plus", 3 tiles, not social proof: "24/7 · the lead replies, day or night", "300 · messages a day, fair-use cap" (`CONFIG.fairUseCap`), "0 · coins or per-episode charges". No reviews or ratings (hidden until real ChatChi store reviews exist).
(7) Guarantee block hidden (no refund policy confirmed).
(8) **FAQ** - "Good to know": When do I get access? · Can I cancel anytime? · Will I be charged again? · Is it private? · What happens after I pay? · Can I keep chatting for free? (No. The free preview was Episodes 1-2 and two messages.) · What does unlimited mean? · Is it explicit? (No, SFW.)
(9) **Plan block #2**, the same card.
(10) **Footer:** logo + "ChatChi: AI Roleplay Chat", Terms · Privacy, "Questions? support@chatchi.co", renewal note, AI disclosure.
(11) **Sticky bottom CTA:** "{{plan}} · {{price}} today" + "Unlock Episode 3"; slides up only while no plan block is on screen; the footer leaves room so it never covers content at the end.
Changing plan updates both blocks, the due-today row, the renewal line and the sticky bar in place (no re-render, scroll kept). The paywall opened from anywhere (onboarding, the in-chat upgrade strip) is this same page.
**Microcopy:** Renewal line: "$119.99 today for your first year, then $299.99 every year until you cancel. Cancel anytime in your account settings." · Fair-use: "Fair use: up to 300 messages a day." · Footer: "Subscriptions renew at the price and period shown until cancelled." · Terms https://squad-xteam.com/termofuse.html · Privacy https://squad-xteam.com/policy.html · Support support@chatchi.co · Disclosure: "{{char_name}} is an AI character. Fictional, and depicted as an adult."
**Checkout flow:** tapping a plan card opens that plan's checkout straight away (the sticky CTA does the same for the selected plan). Leaving a checkout without paying opens the sale screen of the same plan (#13-#15), as set in `CONFIG.declineFlow`. Closing the paywall (X) opens the lifetime last step (#16) every time; its "No thanks" / X / closed checkout come back to the paywall (`declineFlow.lifetime: 'paywall'`). There is no way past the paywall without paying.
**Skip link:** none (hard paywall, no free tier).
**CTA:** Unlock Episode 3 (opens the selected plan's checkout)

### 13. Sale - 1 month (after leaving the 1-month checkout)
**Purpose:** A cheaper first period for the plan the user already chose, instead of a generic downsell.
**Headline A:** Keep watching {{series}} for less
**Body A:** Your 1 month plan at a lower first price.
**Plans:** ChatChi Plus · 1 month: $22.99 for the first month with the regular first-month $24.99 struck (same plan length only), then $49.99 every month until cancelled.
**Visual:** Same web look as the paywall: top bar with the ChatChi logo and close X, eyebrow "Special offer · 1 month", round series-poster thumbnail with the lead, price row (struck regular, sale price, "first month"), 3 checks (every episode of {{series}} · unlimited chat with {{char_name}} · every series and voice lines), CTA, renewal line, plain "No thanks" link, legal links, AI disclosure.
**Microcopy:** Accept opens the `m1_sale` checkout. "No thanks", the X, or leaving that sale checkout without paying opens #16. Events: `sale_view`, `sale_accept` + `checkout_click` (plan `m1_sale`), `sale_decline`, `checkout_decline`.
**CTA:** Claim 1 month offer

### 14. Sale - 3 months (after leaving the 3-month checkout)
**Purpose:** Same as #13 for the 3-month plan.
**Headline A:** Keep watching {{series}} for less
**Body A:** Your 3 months plan at a lower first price.
**Plans:** ChatChi Plus · 3 months: $44.99 for the first 3 months, regular $49.99 struck, then $109.99 every 3 months.
**Visual:** As #13, eyebrow "Special offer · 3 months".
**Microcopy:** Accept opens the `m3_sale` checkout. Decline or leave opens #16.
**CTA:** Claim 3 months offer

### 15. Sale - 12 months (after leaving the 12-month checkout)
**Purpose:** Same as #13 for the 12-month plan.
**Headline A:** Keep watching {{series}} for less
**Body A:** Your 12 months plan at a lower first price.
**Plans:** ChatChi Plus · 12 months: $105.99 for the first year, regular $119.99 struck, then $299.99 every year.
**Visual:** As #13, eyebrow "Special offer · 12 months".
**Microcopy:** Accept opens the `y12_sale` checkout. Decline or leave opens #16.
**CTA:** Claim 12 months offer

### 16. Lifetime - last-chance offer
**Purpose:** The last ask after a decline: one payment, no subscription. Declining it returns to the paywall.
**Headline A:** Keep {{series}} forever
**Body A:** One payment. No subscription, nothing to renew.
**Plans:** ChatChi Plus · Lifetime: $99.99 paid once, no renewal (a one-time product, not a subscription SKU).
**Visual:** As #13, eyebrow "Last offer · pay once", price row "$99.99 · paid once", checks "Every episode of {{series}}, forever · Unlimited chat with {{char_name}} · Every series, every new episode".
**Microcopy:** Accept opens the `lifetime` checkout. "No thanks", the X, or leaving the lifetime checkout returns to the paywall (#12). Shown every time the paywall is closed. The old one-time series pass offer is retired and its screen is removed from the build (no `last_chance_offer`).
**CTA:** Get lifetime access

---

## F. Payoff

### 17. Add-on upsell (after a subscription purchase)
**Purpose:** One more ask while intent is highest: a one-time add-on next to the plan just bought. The subscription stays as it is (screen name stays `upsell_lifetime` for the FunnelFox build and tests).
**Headline A:** Add a second story lead
**Body A:** One more story, one more voice. Yours to keep.
**Plans:** ChatChi · Bonus character, $22.99 paid once (one-time add-on with its own Paddle price, hidden plan key `addon`; not a subscription, no renewal).
**Visual:** The #13 offer look. Eyebrow "You're in · one more thing", "One-time add-on · Plan: {{plan}}" under the thumbnail, price row "$22.99 paid once", 3 checks (Create a second lead from scratch · Their own memory and chats · Paid once, no renewal), CTA, fine print, "No thanks". All copy lives in `CONFIG.upsell`.
**Microcopy:** Fine print: "$22.99 once. Your plan stays as it is." (`CONFIG.upsell.note`). Accept opens the `addon` checkout; paid or left goes to #18 (`declineFlow.addon: get_app`). After paying, #18 adds "Bonus character added. Create them in the app." Lifetime buyers (#16) skip this screen. The app must grant the second-character slot on the `addon` purchase. Events: `upsell_accept {plan: addon}`, `upsell_decline`.
**CTA:** Add for $22.99

### 18. Get the app
**Purpose:** Hand payers to the app, where the series and the chat live.
**Headline A:** You're in. {{char_name}} is waiting.
**Body A:** {{series}} continues in the ChatChi app.
**Visual:** Gradient check well, a "Bonus character added. Create them in the app." line when the add-on was bought, 3 numbered steps (Download ChatChi: AI Roleplay Chat · Log in with {{email}} (falls back to "your checkout email") · Open your chat with {{char_name}}), "Open the app" CTA, App Store and Google Play badges, "Keep chatting here" link back to #19 (Episode 3, then unlimited chat).
**Microcopy:** Store links come from `CONFIG.app` (store URLs not set yet). Event: `app_handoff`.
**CTA:** Open the app

### 19. Episode 3 and chat
**Purpose:** PAID ONLY. The funnel ends in the product: a paying user (via #18 "Keep chatting here") plays Episode 3, then keeps chatting (unlimited, no counter) with the lead who remembers all three episodes. A non-buyer can never reach this screen: any route (decline, restore, debug jump, FunnelFox navigation) redirects to the paywall (#12).
**Headline A:** Episode 3
**Headline B:** The truth comes out.
**Body A:** Then keep talking with {{char_name}}.
**Body B:** They remember all three episodes.
**Visual:** Paid: vertical story frame with 3 slides, then the chat with a "Watched Ep 1-3" chip, unlimited, no counter. The free-chat state (counter, daily limit card, "Come back at midnight") stays in code but is unreachable: there is no free tier.
**Microcopy:** The lead's last bubble never mentions payment, limits or leaving. Plus users get a one-time toast: "Unlimited chat is on. Enjoy." · "{{char_name}} is an AI character."
**CTA:** (type or tap a reply)

---

## Notes

- **Not shown in the funnel, but required in the product:** a post-purchase notification opt-in ("a new episode is ready", app voice, never "{{char_name}} misses you") and a "continue watching" row in the app. Episode cadence is not claimed anywhere until ChatChi confirms it.
- **Skipped on purpose:** Candy's 28-screen quiz, a fake countdown on the lock, a scratch card or spin wheel, struck-through intro prices, a viewer ticker, taboo or power-dynamic titles, any sexual input.
- **Compliance:** 18+ gate first with real month and year pickers. Posters, art and ad creative stay SFW. AI disclosure on #5-#9, #12-#16 and #19. Paywall and offer hero are the series poster, not the lead pleading. The fair-use cap is disclosed behind "unlimited".
- **Unverified:** the category outlook (CandyShorts discontinued per sheet, no re-crawl), the 300 fair-use cap (reused from the ChatChi base, confirm), the lifetime product, the $22.99 add-on and the app granting its second-character slot (#17), the store URLs, and the refund term (no guarantee block shown), and the "voice line" playback (in the demo it is a stub that says "plays in the app").
- **Content ops:** each series needs 2 free episodes plus 1 locked episode (3 slides each, art plus caption), a lead with an opening line quoting the episodes, two reply sets with scripted answers, and a tease line. The demo scripts all three series.
- **Drop-off risk:** #2 (year gate on screen two), #5-#6 (slide length: keep each under 20 s), #9 (users who do not reply: chips are the safety net), #11 (mandatory email), #12.
- **Monetization (2026-10-06, same flow as `../chai-dream-girl/`):** ChatChi Plus 1 / 3 / 12 months, hard paywall, one trigger: paywall CVR after the 2-message chat taste (#12); no free tier, no limit card. Then per-plan sale CVR (#13-#15), lifetime last-step CVR (#16) and add-on take rate (#17, $22.99 one-time). Each checkout's close goes where `CONFIG.declineFlow` says (also the FunnelFox native checkout X). Removed: the free tier ("Continue free", free chat, daily limit card as a funnel step; 2026-10-06 hard-paywall pass), the one-time series pass and the Apple / Google sign-in + guest skip on the email screen. Kept from the previous version: the Episode 3 lock (#10) and the email screen (#11), now mandatory.
- **A/B first:** (1) Hook A vs B on #1. (2) Chat taste before the paywall (#8-#9) vs paywall straight after the cliffhanger. (3) A separate EP3 lock screen with the lead's tease before the paywall vs none. (4) Lifetime last step vs plain decline.
- **Priority:** the sheet marks this niche as declining, so build last and cut first if capacity is short.
- **Demo:** `demo.html` next to this file; `python3 build.py` embeds `img/` into `funnel.html` (the FunnelFox build input). Images are CSS/gradient placeholders under the real names in `img/` (no `IKAME_AI_KEY` at build time); regenerate with `gen_images.py <name>`. Artifact (private): https://claude.ai/artifact/LEuNcoAoUN5MMSZeMC7TYK
