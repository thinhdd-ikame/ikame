---
niche: chai-short-drama
display_name: Chai - Short Drama Series (watch an episode, then talk to the lead - 18+)
archetype: companion-chat
subject: person
input: birth month and year (18+ gate), series, your name, two chat replies, email
output: a short vertical drama you watch, then a lead character who remembers what you just watched and talks about it
screens: 14
monetization: web subscription paywall (1-week intro / 4-week pre-selected / 12-week anchor, price tokens) after Episode 3 is locked; one-time series pass as the last-chance offer; second trigger is the in-chat daily message limit card
creative_screens:
  hook-a: 1
  series-pick: 3
  episode-1: 5
  cliffhanger: 7
  chat-memory: 9
  locked: 10
motion: >
  a vertical story frame plays with progress bars filling at the top, the caption slides in,
  then the lead character steps out of the frame as a chat bubble that quotes the scene you just watched
---

# Funnel Content - Chai: Short Drama Series

Chai is ikame's AI character-chat app. This is the **short-drama niche** funnel for Meta ads, then web quiz, then web paywall, then app, for US/UK adults 18-34 who binge vertical drama and character chat. The user picks a series, plays two short episodes (still art plus captions, optional voice line), hits a cliffhanger, then **talks to the lead for two turns**. Episode 3 is locked behind the paywall. Archetype: **companion-chat**, variant **episode-unlock**: the unit of value is an episode, the free taste is two episodes plus a short chat, and the lock is a story lock, not a message lock. 14 screens. This reuses the Chai structure of `../chai-roleplay/` (scene-first taste before the ask) and `../chai-ai-boyfriend/` (SFW tone, lead character). The Task 10 brief (`chai-named-character`) was not available at build time, so the named-lead idea is built here from those two siblings.

**Reference funnel (research `nebula-chai.md` section 6, `chai-candy.md`):** **Candy AI** short-drama funnel (holly-donovan variant, 31 screens): Episode 1 and 2 autoplay, Episode 3 is locked, then a long quiz and paywall. Sheet note: CandyShorts has been discontinued, so the category is marked "declining". Build last, safe to cut. Reading is [V] for the Candy structure; no live re-crawl was done for this build.

**Kept:** episodes as the hook, EP3 lock as the paywall trigger, the lead as the "person" you meet.

**Deliberately changed:**
- **The character remembers the episode.** After EP2 the lead replies with details from what you just watched (names, objects, the last line). Candy's character does not. This is the whole differentiator and the paid benefit.
- **SFW, no taboo titles.** Series are romance, thriller, fantasy-court. No family, workplace-power, forced or explicit framings, no sexual input.
- **18+ gate first** with a real birth-year picker.
- **Chat before the lock, not a 30-screen quiz.** Two turns, then the locked episode, then the ask.
- **No countdown, no fake unlock timer, no struck-through prices, no fake viewer ticker.** Renewal sits next to every price.
- **Honest lock:** EP3 is locked because it is part of the paid plan, and the screen says so.
- **AI disclosure** on every chat screen.

Visual: the Chai system (near-black, magenta-violet gradient primary, Plus Jakarta Sans headlines, Inter body, lucide icons, same tokens as `../chai-roleplay/`). Episodes use a **vertical story frame**: full-bleed illustration, thin segmented progress bars on top, a serif caption lower third, tap right to advance, tap left to go back. Illustration only, never photoreal people, all characters adult and clothed. Confirm against the Chai brand kit.

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
**Body A:** Chai dramas are for people 18 and older.
**Body B:** We only use this to confirm your age.
**Field:** Birth month + year selects, no default. CTA disabled until both are picked. A failed check is persisted for the session (`sessionStorage`), so a reload stays blocked.
**Visual:** Dimmed story frame behind a rounded `surface` box with the year select.
**Microcopy:** "AI-generated stories · All characters are fictional and 18+" · Footer: Terms of Service · Privacy Policy
**Error state:** Under 18 gives a blocking screen: "Sorry, Chai is for adults" / "You must be 18 or older to continue." No back button, and it stays blocked after a reload.
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
**Visual:** A toast from a notebook icon: "{{char_name}} remembers: Episode 2, the key on the table". Counter drops 10 to 8. After the reply the scene tint darkens.
**Microcopy:** Memory chip lists two things from the episodes (for example "the navy suit", "the key"). If the user types their own line the reply still references the same details.
**CTA:** (tap a reply)

---

## E. Gate and Monetization

### 10. Episode 3 (locked)
**Purpose:** The honest lock. The next episode is part of the paid plan, and the user already knows the lead. Sets up the email and paywall.
**Headline A:** Episode 3 is locked.
**Headline B:** What happens next?
**Body A:** Unlock it and keep talking to {{char_name}}.
**Body B:** Part of Chai Plus. Free users stay on 1-2.
**Visual:** Blurred poster of EP3 with a lock chip, the lead portrait beside "Ep 3 · Chai Plus". Beneath it, a one-line tease from the lead in quotes.
**Microcopy:** "Free: Episodes 1-2 and 10 messages a day." No timer, no "unlocking soon".
**CTA:** Unlock Episode 3

### 11. Save your story
**Purpose:** Capture identity at peak curiosity. Soft gate: Chai has guest mode.
**Headline A:** Save your progress.
**Headline B:** Keep your place.
**Body A:** Add your email so the lead finds you.
**Body B:** Guest progress lives only on this device.
**Field:** Email, validated. Under it: Continue with Apple · Continue with Google. Guest skip.
**Visual:** Small series poster above the headline, email field, two outline buttons.
**Error state:** "That email doesn't look right. Check it?"
**Microcopy:** "By continuing you agree to the Terms and Privacy Policy. We only email about your story."
**Skip link:** Continue as guest
**CTA:** Continue

### 12. Paywall
**Purpose:** The primary ask as a long-scroll web sales page. It sells the rest of the series and the lead's memory, in the app's voice, never the character's.
**Headline A:** Unlock the whole series.
**Headline B:** Keep watching {{series}}.
**Body A:** Every episode, plus chat that remembers.
**Body B:** One plan. No coins. No per-episode charges.
**Plans:**
- **1-week intro**, {{price_1w}}, renews at {{renew_1w}} per week
- **4-week, pre-selected**, "Recommended" badge, {{price_4w}}, renews at {{renew_4w}} every 4 weeks
- **12-week, anchor**, {{price_12w}}, renews at {{renew_12w}} every 12 weeks
Renewal price shows on every card and on the sticky CTA. No struck-through prices, no countdown.
**Visual:** Long-scroll web page. (1) Brand bar with logo, close X from the first frame, Restore. (2) Personal hero: the series poster with the lead and a "Ep 3 locked" chip. (3) Plan block with the 4-week pre-selected. (4) "What's inside": all episodes of every series, a lead who remembers what you watched, unlimited chat (fair-use cap), voice lines, switch series anytime. (5) "How it works": watch, talk, unlock the next. (6) Proof: store rating, user count and reviews as `{{rating}}`, `{{review_*}}` config placeholders, hidden until real. (7) Guarantee: shown only when `{{refund_days}}` is a real number. (8) FAQ: "Is it free to start?", "What is unlimited?", "How often do new episodes come?", "Is this private?", "Is it explicit?" (No, SFW), "How do I cancel?". (9) Plan block repeated. (10) Sticky CTA with plan, price and renewal line. Close visible throughout.
**Microcopy:** Sticky CTA line: "{{price_4w}} today, renews at {{renew_4w}} every 4 weeks" · Fair-use: "Unlimited means normal use, capped at 300 messages a day." · Legal: "Auto-renews at the price shown until cancelled. Cancel anytime in account or store settings." · Free tier: "Free: Episodes 1-2 and 10 messages a day." · Disclosure: "{{char_name}} is an AI character."
**Skip link:** Continue free
**Fallback offer:** #13 last-chance offer, shown once per session (also after closing the limit-card paywall on #14). Declining it goes to #14 with Episode 3 still locked.
**CTA:** Continue with 4 weeks

### 13. Last-chance offer (on close)
**Purpose:** One honest, smaller option for users who close the paywall: pay once for this series only, no renewal. Shown once per session (`sessionStorage` key `ikf_offer_chai-short-drama`).
**Headline A:** Just want this series?
**Headline B:** One smaller option
**Body A:** Pay once for {{series}}. No renewal.
**Body B:** Shown once only. Not part of Chai Plus.
**Plans:** One card: {{offer_name}}, {{offer_price}} once, paid once, never renews. Includes: every episode of this series, chat with {{char_name}} at the normal free daily limit. **Not included:** other series, unlimited chat, voice lines. Optional {{offer_badge}}. Placeholder terms until Chai confirms a one-time product exists.
**Visual:** Same web look as the paywall: top bar with logo and close X, eyebrow "One-time offer", pink-bordered card with the series poster thumbnail, a price row, two checks and two greyed "not included" rows, the CTA and the "paid once" line. Plain decline link and legal links below.
**Microcopy:** No timer (`CONFIG.offer.expiresMin` is null). Price line: "{{offer_price}} once. Does not renew." · Decline: "No thanks, continue free · Episodes 1-2" · The offer speaks as the app, never the character. Events: `offer_view`, `offer_accept`, `offer_decline`.
**CTA:** Get this series

---

## F. Payoff

### 14. Episode 3 and chat
**Purpose:** The funnel ends in the product. A paying user plays Episode 3, then keeps chatting with the lead who remembers all three episodes. A free user stays on the chat with Episode 3 still locked and the limit card as the second ask.
**Headline A:** Episode 3
**Headline B:** The truth comes out.
**Body A:** Then keep talking with {{char_name}}.
**Body B:** They remember all three episodes.
**Visual:** Paid: vertical story frame with 3 slides, then the chat with a "Watched Ep 1-3" chip and unlimited counter. Free: the chat with a locked "Ep 3" strip above the composer, the counter under the reply chips, and, when messages hit zero, the app (not the lead) shows a limit card with a crown, "Out of messages · resets at midnight", Upgrade, "Come back at midnight". Upgrade opens the paywall; closing it can hit the once-only offer.
**Microcopy:** The lead's last bubble never mentions payment, limits or leaving. Plus users get a one-time toast: "Unlimited chat is on. Enjoy." · "{{char_name}} is an AI character."
**CTA:** (type or tap a reply)

---

## Notes

- **Not shown in the funnel, but required in the product:** a post-purchase notification opt-in ("a new episode is ready", app voice, never "{{char_name}} misses you") and a "continue watching" row in the app. Episode cadence is not claimed anywhere until Chai confirms it.
- **Skipped on purpose:** Candy's 28-screen quiz, a fake countdown on the lock, a scratch card or spin wheel, struck-through intro prices, a viewer ticker, taboo or power-dynamic titles, any sexual input.
- **Compliance:** 18+ gate first with real month and year pickers. Posters, art and ad creative stay SFW. AI disclosure on #5-#9, #13, #14. Paywall and offer hero are the series poster, not the lead pleading. The fair-use cap is disclosed behind "unlimited".
- **Unverified:** the category outlook (CandyShorts discontinued per sheet, no re-crawl), the 10 free messages/day and 300 fair-use cap (reused from the Chai base, confirm), every price, rating, review, refund term and the existence of a one-time series pass (all tokens or assumptions), and the "voice line" playback (in the demo it is a stub that says "plays in the app").
- **Content ops:** each series needs 2 free episodes plus 1 locked episode (3 slides each, art plus caption), a lead with an opening line quoting the episodes, two reply sets with scripted answers, and a tease line. The demo scripts all three series.
- **Drop-off risk:** #2 (year gate on screen two), #5-#6 (slide length: keep each under 20 s), #9 (users who do not reply: chips are the safety net), #12.
- **Monetization:** one subscription, two triggers measured separately: paywall CVR after the EP3 lock (#12) and limit-card CVR (#14). The one-time series pass is a third, separate metric and may cannibalise the 1-week plan, so test it against a plain decline.
- **A/B first:** (1) Hook A vs B on #1. (2) Chat taste before the lock (#8-#9) vs lock straight after the cliffhanger. (3) EP3 lock with the lead's tease vs without. (4) Offer as a one-time series pass vs no offer.
- **Priority:** the sheet marks this niche as declining, so build last and cut first if capacity is short.
- **Demo:** `demo.html` next to this file. Images are CSS/gradient placeholders under the real names in `img/` (no `IKAME_AI_KEY` at build time); regenerate with `gen_images.py <name>`. Artifact (private): https://claude.ai/artifact/LEuNcoAoUN5MMSZeMC7TYK
