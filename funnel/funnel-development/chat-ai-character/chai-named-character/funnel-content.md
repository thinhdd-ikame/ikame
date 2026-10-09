---
niche: chai-named-character
display_name: ChatChi - Named Character (one funnel template per story character - 18+, SFW)
archetype: companion-chat
subject: person
input: birth year (18+ gate), two chat replies, user name, two interests, email (mandatory)
output: a half-finished chat with a named story character who remembers the user, plus her first voice note
screens: 19
monetization: a 2-reply chat taste early in the flow, then the previous onboarding (name, interests, they remember, voice note, loader), then a mandatory email step (activates Plus), then a long-scroll paywall (ChatChi Plus - 1 / 3 / 12 months, 12 months pre-selected, Paddle); tapping a plan opens its checkout; after a subscription purchase a one-time $22.99 add-on upsell (Bonus character, the plan stays), then the get-app screen; leaving a checkout opens that plan's sale (lower first period), then a one-time lifetime last step, then back to the paywall; closing the paywall opens the lifetime step every time. HARD PAYWALL: no free tier, no free chat after the 2-reply taste; the web chat (#19) opens only after a purchase
creative_screens:
  hook-a: 1
  hook-b: 3
  memory: 8
  voice-note: 9
  reveal: 10
motion: >
  a character portrait with a phone lock-screen text arriving ("Lena: You've been in the romance aisle forty minutes"),
  typing dots, then a voice-note waveform pulsing as the name is spoken
---

# Funnel Content — ChatChi: Named Character

ChatChi is ikame's AI character-chat app. This brief is one **funnel template, run once per named character**, for Meta ads → web chat → web paywall → app. The ad shows one character (a face, a name, one line they say), the funnel starts inside that character's chat, and the character carries what they learned about the user into the app. Archetype: **companion-chat**, shortened. Screen order is fixed across characters. Everything character-specific is a token (`{{char_name}}`, `{{char_role}}`, `{{char_hook}}` and the scripted lines in the Notes tables), so a new character is a content row, not a new funnel. 20 screens. Brief numbers follow the user's path; the engine's `SCREENS` indices differ (see Notes).

**Reference funnel:** Candy AI `/lp/series/holly-donovan` (and about 20 sibling series URLs, ads running, captured 2026-09-28, AdSpyLab, see `chai-candy.md`). Candy's unit is a named character who is also the chat partner. Honey does the same through about 30 persona pages feeding one builder. Candy's weakness, per the research, is that the in-chat character has no memory of the content that sold it.

**Kept:** one named character per ad and per funnel, the character speaks first, the funnel is a story beat, not a form.

**Deliberately changed vs. Candy / Honey:**
- **Women leads, glamour look (2026-10-06).** All three characters are women (Lena, Mara, Kai), shot in the chai-dream-girl glamour-photo style: fitted, flirty outfits, never nude, every model clearly 26+. The `leo` key and `?char=leo` links still work.
- **SFW by construction.** Every Candy capture is adult. Here the characters are story archetypes (bookshop owner, starship captain, rival chef), the 18+ gate is an age check only, and there is no sexual input or content in funnel or ads.
- **The character remembers.** The name and the two interests the user gives are used by the character in the funnel, on the paywall and in the app. Candy's gap is ChatChi's selling point.
- **No countdowns, no fake struck-through prices, no "50 million users" claims.** The only strike-through is on a sale screen, showing the same plan's real paywall first-period price. Renewal price sits beside every intro price. Proof blocks (rating, reviews) are hidden until real; no hard-coded stars.
- **The paywall is the app talking, never the character.** No "don't leave", "I miss you" or "pay so we can keep talking", in the paywall, sale screens, offer or pushes.
- The 31-screen video-episode preamble is replaced by a two-turn chat the character opens, then a few quick questions the character remembers.

Visual: the ChatChi system as in `chai-ai-boyfriend` and `chai-dream-girl` (near-black, violet-to-magenta gradient, Plus Jakarta Sans headlines, Inter body). Character art is painted/illustrated, clothed, never photoreal. Confirm against the ChatChi brand kit.

---

## A. Hook

### 1. Meet the character (hook)
**Purpose:** Mirror the ad. A face, a name and one line the character says, so the user is already in the story on screen one.
**Headline A:** Meet {{char_name}}.
**Headline B:** {{char_name}} wants a word.
**Body A:** {{char_hook}}
**Body B:** Say hi. {{char_name}} remembers everything you tell them.
**Visual:** Full-bleed painted portrait of `{{char_name}}` in their own setting (the shop, the bridge, the kitchen), gradient to near-black at the bottom. Name and role chip ("{{char_role}}") over the image. A lock-screen style text bubble carries `{{char_hook}}`. Fixed small "AI character · fictional · 18+" tag top right.
**Microcopy:** Under the CTA: "AI character. Fictional and SFW by default. 18+ only." · Footer: Terms · Privacy
**CTA:** Say hi

### 2. 18+ check
**Purpose:** Clear the age gate before any chat, in the app's voice. The character is already waiting behind it.
**Headline A:** First, how old are you?
**Headline B:** Quick age check.
**Body A:** ChatChi is for adults. {{char_name}} is waiting.
**Body B:** Pick your birth month and year.
**Field:** Birth month + birth year pickers, no default selection. Age is computed from month and year. CTA stays disabled until both are picked.
**Visual:** The portrait blurred and dimmed behind a rounded surface card holding the year wheel and the CTA.
**Error state:** Under 18 → blocking screen: "Sorry, ChatChi is for adults" / "You must be 18 or older to continue." No back button. The block is persisted for the session (`sessionStorage` key `ikf_age_block`), so reloading or going back does not let the user retry with another date.
**Microcopy:** "18+ · AI character · Fictional and SFW by default"
**CTA:** I'm 18+ · Continue

---

## B. Investment (chat taste, then questions)

### 3. First message, your reply
**Purpose:** Turn one. The character speaks first, which is the ad's promise. A reply tap is the cheapest possible commitment, and the choice colours turn two.
**Headline A:** {{char_name}} says hi.
**Headline B:** New message from {{char_name}}.
**Body A:** Tap a reply or write your own.
**Body B:** Your move.
**Options:** (sample for Lena) 😏 Maybe both. · 📖 Recommend something, then. · 👀 Do you work here? · ✏️ Other
**Field:** Chat thread. Typing dots, then the opener lands (`{{char_open}}`). Three reply chips plus "✏️ Other", which opens a one-line input. An empty input keeps Send disabled.
**Visual:** Scene dimmed behind the thread, character avatar and name in the header, a thin progress bar under the header (chat and question steps 3-9). AI banner on top: "{{char_name}} is an AI character. Fictional, and depicted as an adult."
**CTA:** (tap a reply)

### 4. Second message (last chat turn)
**Purpose:** Turn two. The character answers the reply in character, so the user feels heard, then asks something light.
**Headline A:** {{char_name}} answers.
**Headline B:** They're typing again.
**Body A:** Keep it going. Pick a reply.
**Body B:** Last reply, then they type.
**Options:** (sample for Lena) 🙈 Not telling. · 📚 Fae books. All of them. · 🤔 Depends who's asking. · ✏️ Other
**Field:** Same thread, the previous turn above. Replies as in screen 3. This is the last chat turn before the paywall: after the reply (`CONFIG.teaserMessages` = 2 replies in total) the chips hide, no input is possible, the character shows typing dots for about 1.5 s and the flow hands off to #5. Event `chat_teaser_end` (count 2).
**Visual:** Same as 3. The character's bubble reacts to the chosen reply (`{{char_reply_1}}`).
**CTA:** (tap a reply)

---

## C. About you

### 5. What's your name?
**Purpose:** The character asks. Capturing `{{name}}` in the character's voice makes it feel like being remembered, not like a form.
**Headline A:** What should {{char_name}} call you?
**Headline B:** What's your name?
**Body A:** They'll use it. Change it anytime.
**Body B:** Real name or a nickname.
**Field:** Display name, text, 1-20 chars, in a question card (not a chat message). If skipped the character says "you".
**Visual:** Question card over the blurred portrait, the character's avatar on top, progress bar in the top nav, name input, Continue, "Call me anything" link.
**Error state:** "Add a name so {{char_name}} knows what to call you"
**Skip link:** Call me anything
**CTA:** Continue

### 6. First thing you love
**Purpose:** Interest one. A cheap taste pick the character will bring up again, which is the memory demo.
**Headline A:** What do you love most?
**Headline B:** Tell {{char_name}} one thing.
**Body A:** They'll remember it.
**Body B:** Pick the closest. Or write it.
**Options:** 📚 Books · 🎬 Movies · 🎵 Music · 🍳 Food · ✏️ Other
**Field:** Single select in a question card, sets `{{interest_1}}`. "Other" opens a one-line input. CTA disabled while "Other" is empty.
**Visual:** Same question card as #5: avatar, headline, a 2-column grid of emoji options, "Other" full width.
**CTA:** Continue

### 7. How you unwind
**Purpose:** Interest two. A second detail raises the cost of leaving and gives the character two facts to recall.
**Headline A:** How do you unwind?
**Headline B:** After a long day?
**Body A:** {{char_name}} is taking notes.
**Body B:** Pick one. They'll remember.
**Options:** 🛋️ Staying in · 🚶 A long walk · 🎮 Games · 🍷 Out with friends · ✏️ Other
**Field:** Single select, sets `{{interest_2}}`. Same "Other" rules as screen 6.
**Visual:** Same as #6.
**CTA:** Continue

---

## D. Trust

### 8. They remember
**Purpose:** The proof of the differentiator inside the funnel: the character recalls the name and both interests unprompted. This is also the SFW and privacy beat.
**Headline A:** {{char_name}} remembers.
**Headline B:** Noted. Kept.
**Body A:** Your name and what you love, kept.
**Body B:** Private by default. Delete anytime.
**Visual:** Back in the thread (the two chat turns above, then the character's "I'm curious about you" line). A toast slides in from the notebook icon ("📓 {{char_name}} will remember: {{name}}, {{interest_1}}, {{interest_2}}"), then the character's recall bubble (`{{char_recall}}`). Under it, three small rows: "🔒 Chats are never public" · "🎚️ You set the pace. Say 'slow down' anytime" · "💬 AI and fictional, always labeled".
**Microcopy:** Any 18+ content setting is opt-in in the app profile, off by default, and is never shown or promoted in the funnel or ads.
**CTA:** Keep going

---

## E. Anticipation

### 9. First voice note (reward)
**Purpose:** The reward is the character saying the user's name. It is the emotional peak, and the paywall follows right after the loader and the email step.
**Headline A:** {{char_name}} sent a voice note.
**Headline B:** Hear {{char_name}} say your name.
**Body A:** Tap to listen. More come as you chat.
**Body B:** Their first voice note, just for you.
**Visual:** Large voice-note bubble with ▶ 0:08 and a waveform. Captions always visible beneath (`{{char_voice_caption}}`). Nothing autoplays with sound.
**Microcopy:** Caption: "Voices are AI-generated." · The first voice note is free. The rest follow the app's heart rule.
**CTA:** Continue

### 10. Writing back (loader)
**Purpose:** Manufacture the wait right at the cliffhanger. The next message is real, and it is behind the gate.
**Headline A:** {{char_name}} is writing back…
**Headline B:** Almost there…
**Steps:**
1. Reading what you told them… — 0→100%
2. Choosing the right words… — 0→100%
3. Saving your chat… — 0→100%
4. Typing a reply… — 0→100%
**Visual:** The character portrait slowly un-blurs as bars run, with typing dots at the bottom. Four thin gradient bars with checks. Stays under 8 seconds.
**CTA:** (auto-advances, ~6-8 seconds)

---

## F. Gate

### 11. Where should we save this? (email, mandatory)
**Purpose:** Email capture before the paywall. It is required: the subscription is activated on this email, and the user logs in to the app with it.
**Headline A:** Where should we save this?
**Headline B:** Keep your chat with {{char_name}}.
**Body A:** We use it to activate your Plus and save your chat.
**Body B:** We use it to activate your Plus. No spam.
**Field:** Email, validated format (`name@domain.tld`). Mandatory: no skip link, no guest path. Email only, no Google / Apple / social sign-in.
**Visual:** Card over the blurred portrait: the character's avatar, "Reply ready" with a blurred bubble, the email field, the CTA, the legal line.
**Error states:** "That email doesn't look right" · "Add your email to see the reply"
**Microcopy:** Legal line: "By continuing you agree to the Terms and Privacy Policy." On submit: `S.email` is set, events `lead` (placement `email_gate`; the FunnelFox build calls `inputs.setEmail`) and `email_submit`, then the paywall (#12) opens.
**CTA:** See the reply

---

## G. Monetization

### 12. Paywall — long scroll
**Purpose:** The primary ask at peak desire: the reply is written and the email is saved. It sells more of the same chat in the app's voice, not the character's.
**Headline A:** Read what {{char_name}} wrote
**Headline B:** {{char_name}} replied to {{name}}
**Eyebrow:** Your reply is ready
**Body A:** {{char_name}} kept everything you said. The next message is waiting.
**Body B:** {{char_name}} kept everything you said. The next message is waiting.
**Plans:**
- **1 month** — $24.99 for the first month, **then $49.99 every month**
- **3 months** — $49.99 for the first 3 months, **then $109.99 every 3 months**
- **12 months — pre-selected**, "Recommended" badge — $119.99 for the first year, **then $299.99 every year**
- Each card: first-period price + "Then {{renew}} {{period}}. Cancel anytime." No struck prices on the paywall. Paddle, one price per checkout. Hidden plans (sale screens and lifetime) never show here.
**Visual:** A web landing page (web2app), long scroll, same look as `chai-dream-girl`. Sections top to bottom, each with an uppercase pink eyebrow and a bold H2:
1. **Sticky top bar:** ChatChi logo, mini CTA "Continue with {{char_name}}" (fades in once the hero scrolls away, scrolls to plan block 1), close ×.
2. **Personal hero:** the character portrait full-bleed, eyebrow "Your reply is ready", the headline, the body, and a blurred "1 new" unread message row.
3. **Their picks:** a 2×2 card grid: Your name ({{name}}; "Story · {{char_role}}" when the name was skipped) · Your character ({{char_name}}) · You love ({{interest_1}}) · You unwind with ({{interest_2}}).
4. **Plan block 1:** one elevated card: eyebrow "Choose your plan", H2 "Keep talking with {{char_name}}", the 3 plan cards, "Due today · {{price}} today", CTA, payment badges (Apple Pay · G Pay · VISA · Mastercard · PayPal), "Secure checkout · Cancel anytime", renewal line for the selected plan + auto-renew and fair-use fine print.
5. **What you get** — "Everything in ChatChi Plus": 2-column icon cards: Unlimited chat (PLUS tag) · Every voice note · {{char_name}} remembers · Every character · Good-morning texts · Private chats.
6. **Your story so far** — "{{char_name}} remembers": a chat mock of the user's own thread (the opener, their first reply, the recall line with their name and interests) and the AI disclosure bubble.
7. **How it works** — "From checkout to your chat": 1 Checkout (secure, in the browser) → 2 Get the app (ChatChi: AI Roleplay Chat, App Store / Google Play) → 3 Log in with {{email}} ({{char_name}} and Plus are already waiting).
8. **Why go Plus** (honest proof, product facts only) — "The preview, without limits": 3 facts (24/7 replies · 3 characters, each with a story · 300 messages a day on Plus*) and a Preview vs Plus table (Messages: 2 in the preview / Unlimited* · Voice notes: 1 sample / Every one · Memory: this chat / keeps your details · Characters: {{char_name}} / all of them). *Unlimited = normal use, capped at 300 a day. No ratings, user counts or reviews: `rating`/`reviews` stay `null` and that block shows only with real, sourced store data.
9. **Guarantee:** hidden while `refundDays` is `null`.
10. **Questions** — "Good to know" accordion, first item open: When do I get it? · Can I cancel anytime? · Will I be charged again? · Is it private? · What happens after I pay? · Is {{char_name}} a real person?
11. **Plan block 2:** the same card again.
12. **Footer:** logo, Terms of Use · Privacy Policy, "Support: support@chatchi.co", the AI disclosure + 18+, "This page is ChatChi speaking, never {{char_name}}."
13. **Sticky bottom CTA bar:** "{{plan}} plan · {{price}} today" + CTA on a solid background; shown from the first view whenever neither plan-block CTA is on screen, so price + CTA are always visible at 375×667 and 430×932; the footer has bottom padding so the bar never covers it at the end of the scroll.
The same page opens from every entry (email step, the lifetime step's decline, any non-paid route into the chat).
**Microcopy:** FAQ answers: "Right after checkout. Download the ChatChi app and log in with {{email}}. {{char_name}} and your chat are already there." · "Yes. Cancel in your account or store settings, or email support@chatchi.co, any time before the next renewal. No call, no form." · "Yes, unless you cancel. Your first period is at the price shown today, then the plan renews at the regular price on your plan card." · "Your chat is tied to your account and nobody else sees it. Your email is for logging in and receipts. No spam. Delete any chat or your account in the app." · "We show you how to get the app. Log in with the same email and Plus is already on." · "No. {{char_name}} is an AI character: fictional, and depicted as an adult." Renewal line: "{{price}} today for your first {{period}}, then {{renew}} {{renews}} until you cancel." Legal: "Auto-renews at the price and period shown until cancelled. Cancel anytime in account or store settings. Unlimited = normal use, capped at 300 messages a day." The page is the app speaking; the only lines in the character's voice are the quoted chat thread.
**Skip link:** none. Hard paywall: no free tier, no "continue free". The close × opens #16.
**Checkout flow:** tapping a plan card opens that plan's checkout straight away (the CTA and sticky CTA do the same for the selected plan). Leaving a checkout without paying opens the sale screen of the same plan (#13-#15). Closing the paywall itself (X) opens the lifetime last step (#16) every time; declining #16 returns to the paywall. There is no way to chat without paying. Legal links: Terms https://squad-xteam.com/termofuse.html · Privacy https://squad-xteam.com/policy.html · support@chatchi.co.
**CTA:** Continue with {{char_name}} (plan blocks, sticky bar and top-bar mini CTA)

### 13. Sale - 1 month (after leaving the 1-month checkout)
**Purpose:** A second, cheaper first period for the plan the user already chose, instead of a generic downsell. Replaces the retired one-time message pass.
**Headline A:** Keep {{char_name}} for less
**Body A:** Your 1 month plan at a lower first price.
**Plans:** ChatChi Plus · 1 month: $22.99 for the first month with the regular first-month $24.99 struck (same plan length only), then $49.99 every month until cancelled.
**Visual:** Same web look as the paywall: top bar with the ChatChi logo and close X, eyebrow "Special offer · 1 month", the character's avatar ring, "With {{char_name}} · {{char_role}}", price row (struck regular → sale, "first month"), 3 checks (Unlimited chat with {{char_name}} · {{char_name}} remembers more · Every voice note and every character), CTA, renewal line, plain "No thanks" link, legal links, AI disclosure.
**Microcopy:** Accept → checkout of the `m1_sale` price. "No thanks", the X, or leaving that sale checkout without paying → #16 lifetime. Events: `sale_view`, `sale_accept` + `checkout_click` (plan `m1_sale`), `sale_decline`, `checkout_decline`.
**CTA:** Claim 1 month offer

### 14. Sale - 3 months (after leaving the 3-month checkout)
**Purpose:** Same as #13 for the 3-month plan.
**Headline A:** Keep {{char_name}} for less
**Body A:** Your 3 months plan at a lower first price.
**Plans:** ChatChi Plus · 3 months: $44.99 for the first 3 months, regular $49.99 struck, then $109.99 every 3 months.
**Visual:** As #13, eyebrow "Special offer · 3 months".
**Microcopy:** Accept → `m3_sale` checkout. Decline or leave → #16.
**CTA:** Claim 3 months offer

### 15. Sale - 12 months (after leaving the 12-month checkout)
**Purpose:** Same as #13 for the 12-month plan.
**Headline A:** Keep {{char_name}} for less
**Body A:** Your 12 months plan at a lower first price.
**Plans:** ChatChi Plus · 12 months: $105.99 for the first year, regular $119.99 struck, then $299.99 every year.
**Visual:** As #13, eyebrow "Special offer · 12 months".
**Microcopy:** Accept → `y12_sale` checkout. Decline or leave → #16.
**CTA:** Claim 12 months offer

### 16. Lifetime - last-chance offer
**Purpose:** The last ask after a declined sale: one payment, no subscription. Also shown every time the paywall is closed.
**Headline A:** Keep {{char_name}} forever
**Body A:** One payment. No subscription, nothing to renew.
**Plans:** ChatChi Plus · Lifetime: $99.99 paid once, no renewal (a one-time product, not a subscription SKU).
**Visual:** As #13, eyebrow "Last offer · pay once", price row "$99.99 · paid once", checks "Unlimited chat with {{char_name}}, forever · Every voice note and every character · Every future update included".
**Microcopy:** Accept → `lifetime` checkout. "No thanks", the X, or leaving the lifetime checkout (FunnelFox native × too, `declineFlow.lifetime:'paywall'`) → back to the paywall (#12). Shown every time the paywall is closed.
**CTA:** Get lifetime access

---

## H. Payoff

### 17. Add-on upsell (after a subscription purchase)
**Purpose:** One more ask while intent is highest: a one-time add-on on top of the plan just bought. The subscription stays as it is.
**Headline A:** Add a second character
**Body A:** One more story, one more voice. Yours to keep.
**Plans:** Bonus character, $22.99 paid once (its own Paddle one-time price, hidden plan `addon`). Engine screen name stays `upsell_lifetime` (FunnelFox build and tests rely on it).
**Visual:** The #13 offer look. Eyebrow "You're in · one more thing", "ChatChi · Bonus character / Next to {{char_name}} · add-on" under the avatar, price row "$22.99 paid once", 3 checks (Create a second character from scratch · Their own memory and chats · Paid once, no renewal), CTA, fine print, "No thanks". All copy lives in `CONFIG.upsell`.
**Microcopy:** Fine print: "$22.99 once. Your plan stays as it is." Accept → `addon` checkout; paid → #18 with the line "Bonus character added. Create them in the app."; checkout left or "No thanks" → #18 without it. Lifetime buyers (#16) skip this screen. Events: `upsell_accept` (plan `addon`), `upsell_decline`, `purchase_complete` (plan `addon`).
**CTA:** Add for $22.99

### 18. Get the app
**Purpose:** Hand payers to the app, where the chat and the character's memory live.
**Headline A:** You're in. {{char_name}} is waiting.
**Body A:** Your chat continues in the ChatChi app.
**Visual:** Gradient check well, 3 numbered steps (Download ChatChi: AI Roleplay Chat · Log in with {{email}} (the email from #11; "your checkout email" if unknown) · Open your chat with {{char_name}}), "Open the app" CTA, App Store and Google Play badges, "Keep chatting here" link back to #19 (unlimited, "ChatChi Plus is on").
**Microcopy:** If the add-on was paid, a line under the body: "Bonus character added. Create them in the app." Store links come from `CONFIG.app`, not set yet. Plus users get a one-time toast in the chat: "Unlimited chat is on. Enjoy."
**CTA:** Open the app

### 19. Web chat (paid only)
**Purpose:** Plus users only, from "Keep chatting here" on #18. The character's reply (`{{char_after}}`) is the reveal the email promised. Never reachable without a purchase: any route into it for a non-payer (decline flow, reload/restore, debug) lands on the paywall (#12).
**Headline A:** {{char_name}}
**Headline B:** {{char_name}} · online
**Body A:** (chat) The character's reply, then unlimited chat.
**Visual:** The full thread (two chat turns, recall, voice note) with the reply below, three reply ideas above the composer ("Tell me more." · "What about you?" · "*smiles*"), "Memory: {{name}}, {{interest_1}}, {{interest_2}}" chip, composer, "ChatChi Plus is on. Unlimited chat." and an "Open the ChatChi app" link. No counter.
**Microcopy:** Fair-use cap as on the paywall. Events: `chat_message`, `complete`.
**CTA:** (reply ideas / composer)

### (removed) Daily limit / free tier
The free tier (10 messages a day, daily-limit card, "Come back at midnight") is gone: hard paywall. The engine keeps the old `daily_limit` code (index 16) but never routes to it, and the FunnelFox build has no `daily_limit` screen.

---

## Notes

- **One template, many characters.** Screens 1-19 are identical per character. Character rows below are content. Each character needs one portrait, one scene backdrop, a voice, and the scripted lines `{{char_hook}}`, `{{char_open}}`, two reply sets, `{{char_reply_1}}`, `{{char_reply_2}}`, `{{char_recall}}`, `{{char_voice_caption}}`, `{{char_after}}`. Switch in the demo with `?char=leo|mara|kai` (default Lena).

| | Lena | Mara | Kai |
|---|---|---|---|
| `{{char_role}}` | The bookshop owner | The starship captain | The rival chef |
| `{{char_hook}}` | "You've been in the romance aisle forty minutes." | "Captain's log: someone boarded uninvited." | "You again. Still pretending you can cook?" |
| Setting | A rainy bookshop at closing time | A starship bridge, stars through the glass | A busy kitchen pass at midnight |
| Voice | Dry, warm | Calm, commanding | Quick, teasing |

- **SFW by construction.** Characters are story archetypes, painted and clothed. No sexual descriptors, no sexual input, no adult-performer names, no taboo family framing (all present in Candy's captures). The age gate is an age check only. The 18+ content setting stays opt-in in the app profile, never in the funnel or ads.
- **Compliance.** The age gate comes first. The AI banner stays on every chat screen (#3-#4, #8-#9, #19). No monetization in the character's voice: the sale, lifetime and upsell screens are the app speaking. The fair-use cap is disclosed. Renewal price on every plan and sale. No countdown, wheel or ticker. Proof blocks and guarantee are hidden until real.
- **Memory carries into the app.** The character's memory (`name`, `interest_1`, `interest_2`, the two replies) must be handed to the app at web2app (`ikfunnel` data, same as `chai-ai-boyfriend`). If the handoff is not built, drop the promise on #8 and the paywall hero. Do not ship the claim without it.
- **Unverified.** Candy's flow is a video-episode funnel (31 screens, no quiz, no email before paywall). This chat-first adaptation is our own design, not a copy of any captured funnel. The Candy paywall plan structure was captured, but the 1/3/12-month structure here is ChatChi's Paddle plan set (same as `chai-dream-girl`), not Candy's. No ChatChi-specific conversion data yet.
- **Unverified numbers.** The 300 fair-use cap is carried from the other ChatChi funnels, not confirmed for ChatChi. Confirm before launch.
- **Drop-off risk:** #2 (age wheel), #5 (name, so the skip link), #11 (email before the paywall; it is mandatory because Plus is activated on it, so test copy, not removal), #12. Keep the loader (#10) under 8 s.
- **Monetization:** hard paywall, one trigger (#12 onboarding CVR). Sale CVR (#13-#15), lifetime CVR (#16) and upsell take-rate (#17) are separate metrics. `CONFIG.declineFlow` maps each checkout to where a non-payer lands (m1/m3/y12 → their sale, sales → lifetime, lifetime → #12 paywall, addon → #18); FunnelFox's native checkout × follows the same map. Voice notes drive message volume, not revenue.
- **A/B first:** (1) Hook A "Meet {{char_name}}." vs. B "{{char_name}} wants a word." (2) Which character in the ad (one funnel per character). (3) #11 email copy (activate Plus vs. save your chat). (4) Voice note before vs. after the paywall.
- **Content ops:** per character, about 12 scripted lines plus one portrait and one scene. Launch with the three samples (Lena, Mara, Kai), then clone from Candy's most-run series themes, minus the adult and taboo ones.
- **Demo (Artifact, private):** https://claude.ai/artifact/UEfDa91NsrfRpWeQcKsFwT (default Lena, `?char=mara` or `?char=kai` to switch). Images are CSS-drawn placeholders until `gen_images.py` runs with `IKAME_AI_KEY`.

- **Review fixes (2026-10-01):** age gate checks birth month + year and persists the block in sessionStorage; rating and reviews render only when real (no hard-coded stars); the offer is a smaller one-time message pass with a "Not included" list; demo has `<head>`.
- **Monetization port (2026-10-06):** flow aligned with `chai-dream-girl`: the email step opened a 2-message free-chat taste before the paywall (superseded, see below); 1/3/12-month plans replace the 1/4/12-week tokens; the old one-time message pass (engine screen 14) is retired (`CONFIG.offer.enabled:false`) in favour of per-plan sales (#13-#15), a lifetime last step (#16), a lifetime upsell for subscribers (#17) and a get-app hand-off (#18). Placeholder rating/reviews removed (`null`), legal URLs set.
- **Add-on upsell (2026-10-06):** #17 no longer sells lifetime ($99.99, `lifetime_up`, plan cancelled for the buyer). It now sells a one-time $22.99 add-on (Bonus character, hidden plan `addon`, own Paddle price); the subscription just bought is untouched. Screen name `upsell_lifetime` kept for the FunnelFox build.
- **Flow restore (2026-10-06, PO feedback):** "email is mandatory to activate the subscription; no Google / Apple login; the chat taste is only 1-2 screens, everything else as the previous version." The chat taste is now the first two scripted turns (#3-#4, 2 replies, then a ~1.5 s typing hand-off); the third turn (old `chat_reply_3`, engine 5) is dropped; name and the two interests (#5-#7) are restored as question cards instead of chat messages; they remember, voice note, loader and the mandatory email (#8-#11) are back in their previous order, and the email opens the paywall (#12) directly (no free-chat taste before the paywall). The email emits `lead` (FunnelFox `inputs.setEmail`) and is shown on get-app step 2. No social sign-in anywhere; "Apple Pay · Google Pay" removed from the secure-checkout line.
- **Brief # → engine screen:** #1-#4 = 1-4 · #5 `your_name` (6) · #6 `interest_love` (7) · #7 `interest_unwind` (8) · #8 `they_remember` (9) · #9 `voice_note` (10) · #10 `writing_back` (11) · #11 `email_gate` (12) · #19 `back_in_chat` (15) · #12 `paywall` (13) · #13 `sale_m1` (17) · #14 `sale_m3` (18) · #15 `sale_y12` (19) · #16 `sale_lifetime` (20) · #17 `upsell_lifetime` (21) · #18 `get_app` (22) · `daily_limit` (16) unreachable, not in the FunnelFox build. Engine indices 5 (dropped third chat turn) and 14 (the old message pass) are unused.
- **Hard paywall (2026-10-06, owner):** "let them try chatting 1-2 messages, then the user must buy." Free tier removed: no "Continue free · 10 messages a day" link, no "continue free" on the sale/lifetime screens, no free chat after declining. Paywall × → #16 lifetime every time (the once-per-session `ltSeen` rule is gone); #16 No/× and the lifetime checkout × → back to the paywall. Back into a taste chat after the 2 replies shows it read-only ("{{char_name}} has a few questions first…") and forwards to #5 again. The web chat (#19) is for paid users only; any non-paid route into it (decline map, reload restore, debug jump) lands on the paywall. #9 CTA renamed "Continue" (was "Keep chatting").
- **Web paywall polish (2026-10-06, owner: "check the paywall UI so it looks like the web, some places are a bit simple, like an app"):** #12 rebuilt on the `chai-dream-girl` landing-page pattern: eyebrow + H2 per section, the picks as a 2×2 card grid, the plan block as one elevated card with payment badges and a full renewal line, "What you get" as icon cards (no more locked rows), a "Your story so far" chat mock, how it works as checkout → get the app → log in with your email, an honest "Why go Plus" block (product facts + Preview vs Plus table), a 6-question FAQ, a real footer with support@chatchi.co, and a sticky bar showing the plan and today's price. Plans, prices and checkout behaviour unchanged. All 61 click-through branches (standalone + FunnelFox harness, incl. A/B, every character, under-18 reset, back, reload) reach email → paywall.
- **QA fixes (2026-10-07, ChatChi UI test 06/10):** sticky bottom bar (price + CTA) shows from the paywall first view; top bars of the paywall and sale/add-on screens are solid; Terms/Privacy are real links in link colour at 13px with a 40px tap target on every screen, support@chatchi.co is a mailto link; get-app uses the official App Store / Google Play badge artwork (still `openApp()`); the retired message-pass screen (engine 99, `{{offer_*}}`) and `CONFIG.offer` are removed from the engine.
