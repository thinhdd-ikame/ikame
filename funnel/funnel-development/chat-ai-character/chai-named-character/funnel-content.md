---
niche: chai-named-character
display_name: Chai - Named Character (one funnel template per story character - 18+, SFW)
archetype: companion-chat
subject: person
input: birth year (18+ gate), three chat replies, user name, two interests, email
output: a half-finished chat with a named story character who remembers the user, plus his or her first voice note
screens: 16
monetization: web long-scroll subscription paywall (1-week intro / 4-week pre-selected / 12-week anchor) after the first voice note, last-chance offer on close, second trigger is the in-chat daily limit card
creative_screens:
  hook-a: 1
  hook-b: 3
  memory: 9
  voice-note: 10
  reveal: 11
motion: >
  a character portrait with a phone lock-screen text arriving ("Leo: You've been in the romance aisle forty minutes"),
  typing dots, then a voice-note waveform pulsing as the name is spoken
---

# Funnel Content — Chai: Named Character

Chai is ikame's AI character-chat app. This brief is one **funnel template, run once per named character**, for Meta ads → web chat → web paywall → app. The ad shows one character (a face, a name, one line they say), the funnel starts inside that character's chat, and the character carries what they learned about the user into the app. Archetype: **companion-chat**, shortened. Screen order is fixed across characters. Everything character-specific is a token (`{{char_name}}`, `{{char_role}}`, `{{char_hook}}` and the scripted lines in the Notes tables), so a new character is a content row, not a new funnel. 16 screens.

**Reference funnel:** Candy AI `/lp/series/holly-donovan` (and about 20 sibling series URLs, ads running, captured 2026-09-28, AdSpyLab, see `chai-candy.md`). Candy's unit is a named character who is also the chat partner. Honey does the same through about 30 persona pages feeding one builder. Candy's weakness, per the research, is that the in-chat character has no memory of the content that sold it.

**Kept:** one named character per ad and per funnel, the character speaks first, the funnel is a story beat, not a form.

**Deliberately changed vs. Candy / Honey:**
- **SFW by construction.** Every Candy capture is adult. Here the characters are story archetypes (bookshop owner, starship captain, rival chef), the 18+ gate is an age check only, and there is no sexual input or content in funnel or ads.
- **The character remembers.** The name and the two interests the user gives are used by the character in the funnel, on the paywall and in the app. Candy's gap is Chai's selling point.
- **No countdowns, no struck-through fake prices, no "50 million users" claims.** Renewal price sits beside every intro price. Proof blocks (rating, reviews) are hidden until real; no hard-coded stars.
- **The paywall is the app talking, never the character.** No "don't leave", "I miss you" or "pay so we can keep talking", in the paywall, offer, limit card or pushes.
- The 31-screen video-episode preamble is replaced by three chat turns the character opens.

Visual: the Chai system as in `chai-ai-boyfriend` and `chai-dream-girl` (near-black, violet-to-magenta gradient, Plus Jakarta Sans headlines, Inter body). Character art is painted/illustrated, clothed, never photoreal. Confirm against the Chai brand kit.

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
**Body A:** Chai is for adults. {{char_name}} is waiting.
**Body B:** Pick your birth month and year.
**Field:** Birth month + birth year pickers, no default selection. Age is computed from month and year. CTA stays disabled until both are picked.
**Visual:** The portrait blurred and dimmed behind a rounded surface card holding the year wheel and the CTA.
**Error state:** Under 18 → blocking screen: "Sorry, Chai is for adults" / "You must be 18 or older to continue." No back button. The block is persisted for the session (`sessionStorage` key `ikf_age_block`), so reloading or going back does not let the user retry with another date.
**Microcopy:** "18+ · AI character · Fictional and SFW by default"
**CTA:** I'm 18+ · Continue

---

## B. Investment (the chat)

### 3. First message, your reply
**Purpose:** Turn one. The character speaks first, which is the ad's promise. A reply tap is the cheapest possible commitment, and the choice colours turn two.
**Headline A:** {{char_name}} says hi.
**Headline B:** New message from {{char_name}}.
**Body A:** Tap a reply or write your own.
**Body B:** Your move.
**Options:** (sample for Leo) 😏 Maybe both. · 📖 Recommend something, then. · 👀 Do you work here? · ✏️ Other
**Field:** Chat thread. Typing dots, then the opener lands (`{{char_open}}`). Three reply chips plus "✏️ Other", which opens a one-line input. An empty input keeps Send disabled.
**Visual:** Scene dimmed behind the thread, character avatar and name in the header, a thin progress bar under the header (steps 3-10). AI banner on top: "{{char_name}} is an AI character. Fictional, and depicted as an adult."
**CTA:** (tap a reply)

### 4. Second message
**Purpose:** Turn two. The character answers the reply in character, so the user feels heard, then asks something light.
**Headline A:** {{char_name}} answers.
**Headline B:** They're typing again.
**Body A:** Keep it going. Pick a reply.
**Body B:** One more reply to go.
**Options:** (sample for Leo) 🙈 Not telling. · 📚 Fae books. All of them. · 🤔 Depends who's asking. · ✏️ Other
**Field:** Same thread, the previous turn above. Replies as in screen 3.
**Visual:** Same as 3. The character's bubble reacts to the chosen reply (`{{char_reply_1}}`).
**CTA:** (tap a reply)

### 5. Third message
**Purpose:** Turn three ends the opener on a small hook that leads naturally into the character asking who the user is.
**Headline A:** One more from {{char_name}}.
**Headline B:** It gets personal.
**Body A:** They're curious about you now.
**Body B:** Reply, then they'll ask your name.
**Options:** (sample for Leo) 😊 Okay, ask away. · 🙃 I'll allow it. · 😅 You first. · ✏️ Other
**Field:** Same thread. After the reply the character says `{{char_reply_2}}` and moves to the name question.
**Visual:** Same as 3.
**CTA:** (tap a reply)

### 6. What's your name?
**Purpose:** The character asks. Capturing `{{name}}` in the character's voice makes it feel like being remembered, not like a form.
**Headline A:** What should {{char_name}} call you?
**Headline B:** What's your name?
**Body A:** They'll use it. Change it anytime.
**Body B:** Real name or a nickname.
**Field:** Display name, text, 1-20 chars, inside the chat composer. If skipped the character says "you".
**Visual:** Thread above, the character's question as the last bubble, name input as the composer.
**Error state:** "Add a name so {{char_name}} knows what to call you"
**Skip link:** Call me anything
**CTA:** Send

### 7. First thing you love
**Purpose:** Interest one. A cheap taste pick the character will bring up again, which is the memory demo.
**Headline A:** What do you love most?
**Headline B:** Tell {{char_name}} one thing.
**Body A:** They'll remember it.
**Body B:** Pick the closest. Or write it.
**Options:** 📚 Books · 🎬 Movies · 🎵 Music · 🍳 Food · ✏️ Other
**Field:** Single select in the chat panel, sets `{{interest_1}}`. "Other" opens a one-line input. CTA disabled while "Other" is empty.
**Visual:** The character's question as a bubble. Option rows slide up from the bottom with emoji and label.
**CTA:** Continue

### 8. How you unwind
**Purpose:** Interest two. A second detail raises the cost of leaving and gives the character two facts to recall.
**Headline A:** How do you unwind?
**Headline B:** After a long day?
**Body A:** {{char_name}} is taking notes.
**Body B:** Pick one. They'll remember.
**Options:** 🛋️ Staying in · 🚶 A long walk · 🎮 Games · 🍷 Out with friends · ✏️ Other
**Field:** Single select, sets `{{interest_2}}`. Same "Other" rules as screen 7.
**Visual:** Same as 7.
**CTA:** Continue

---

## C. Trust

### 9. They remember
**Purpose:** The proof of the differentiator inside the funnel: the character recalls the name and both interests unprompted. This is also the SFW and privacy beat.
**Headline A:** {{char_name}} remembers.
**Headline B:** Noted. Kept.
**Body A:** Your name and what you love, kept.
**Body B:** Private by default. Delete anytime.
**Visual:** Thread. A toast slides in from the notebook icon ("📓 {{char_name}} will remember: {{name}}, {{interest_1}}, {{interest_2}}"), then the character's recall bubble (`{{char_recall}}`). Under it, three small rows: "🔒 Chats are never public" · "🎚️ You set the pace. Say 'slow down' anytime" · "💬 AI and fictional, always labeled".
**Microcopy:** Any 18+ content setting is opt-in in the app profile, off by default, and is never shown or promoted in the funnel or ads.
**CTA:** Keep going

---

## D. Anticipation

### 10. First voice note (reward)
**Purpose:** The reward is the character saying the user's name. It is the emotional peak, and the paywall follows right after the loader and email.
**Headline A:** {{char_name}} sent a voice note.
**Headline B:** Hear {{char_name}} say your name.
**Body A:** Tap to listen. More come as you chat.
**Body B:** Their first voice note, just for you.
**Visual:** Large voice-note bubble with ▶ 0:08 and a waveform. Captions always visible beneath (`{{char_voice_caption}}`). Nothing autoplays with sound.
**Microcopy:** Caption: "Voices are AI-generated." · The first voice note is free. The rest follow the app's heart rule.
**CTA:** Keep chatting

### 11. Writing back (loader)
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

## E. Gate

### 12. Where should it go?
**Purpose:** Email capture before the reply is revealed. The reason is concrete and in the app's voice: save the chat so it follows the user into the app.
**Headline A:** Where should we save this?
**Headline B:** Keep your chat with {{char_name}}.
**Body A:** Your email links this chat to the app.
**Body B:** No spam. Just your story.
**Field:** Email, validated format
**Visual:** Dimmed thread behind a card: the character's avatar, the message "Reply ready", a blurred last bubble, and the email field below.
**Error states:** "That email doesn't look right" · "Add your email to see the reply"
**Microcopy:** Legal line: "By continuing you agree to the Terms and Privacy Policy."
**CTA:** See the reply

---

## F. Monetization

### 13. Paywall — long scroll
**Purpose:** The primary ask at peak desire, after the voice note and the unread reply. It sells more of the same chat in the app's voice, not the character's.
**Headline A:** Read what {{char_name}} wrote.
**Headline B:** {{char_name}} replied to {{name}}.
**Body A:** Unlimited chat, voice notes, and memory that lasts.
**Body B:** No coins. No per-message charges.
**Plans:**
- **1 week intro** — {{price_1w}}, then **renews at {{renew_1w}} per week**
- **4 weeks — pre-selected**, "Most popular" badge — {{price_4w}}, **renews at {{renew_4w}} every 4 weeks**
- **12 weeks — anchor** — {{price_12w}}, **renews at {{renew_12w}} every 12 weeks**
- Renewal shown beside every price. No struck prices. Real prices only.
**Visual:** A long-scroll web page: (1) top brand bar with the Chai logo, close ×, and a mini CTA that appears once plan block one scrolls away. (2) Hero: the character portrait and a snippet of the unread reply blurred, with chips from the user's picks ("{{name}}", "{{interest_1}}", "{{interest_2}}"). (3) Plan block with the three plans, "Due today" row, CTA, "Secure checkout · Cancel anytime". (4) What's inside: unlimited chat, all voice notes, memory, every character, good-morning texts. (5) How it works: pay → open the app → continue the chat. (6) Proof: rating and reviews, placeholders until real. (7) Guarantee: hidden while `refundDays` is a token. (8) FAQ accordion. (9) Plan block repeated. (10) Footer with legal and the AI disclosure. (11) Sticky bottom CTA.
**Microcopy:** Benefit rows: "Unlimited chat" · "Every voice note" · "{{char_name}} remembers more" · "Meet every character" · "Good-morning texts". FAQ: when do I get it · how do I cancel · will I be charged again · what happens to my chats · is it AI. Fair-use: "Unlimited means normal use, capped at 300 messages a day." Legal: "Auto-renews at the price shown until cancelled. Cancel anytime in account or store settings." The page is the app speaking. Nothing here is written in the character's voice.
**Skip link:** Continue free · 10 messages a day
**Fallback offer:** #14, shown once per session. Declining it drops the user into the thread (#15). The second ask is the limit card (#16).
**CTA:** Continue

### 14. Last-chance offer (on close)
**Purpose:** Second chance for users who close the paywall or tap "Continue free", or close the paywall opened from the limit card. It is a genuinely smaller one-time pass, not a discounted subscription. Shown once per session (`sessionStorage` key `ikf_offer_chai-named-character`), then never again.
**Headline A:** Keep talking with {{char_name}}.
**Headline B:** A smaller pass, paid once.
**Body A:** 50 messages and this voice note, paid once.
**Body B:** No subscription. No renewal. Paid once.
**Plans:** One card: "Message pass · {{char_name}}", {{offer_price}} paid once, no renewal, no struck-through price. Includes: 50 more messages with {{char_name}} · this voice note and the reply waiting · your chat saved to your email. **Not included:** unlimited chat · other characters · memory beyond this chat · more voice notes. Optional {{offer_badge}}. Pass size (50) and price are placeholders until Chai confirms real terms.
**Visual:** Same web look as the paywall: bar with logo and close, eyebrow "One-time pass · shown once", headline, one glowing card with the character avatar, pass name, price row ("paid once"), three checks, a "Not included" line, CTA and a "once, no renewal" line. AI disclosure under the card. Plain decline link and legal links at the bottom.
**Microcopy:** No timer unless `CONFIG.offer.expiresMin` is a real deadline (default `null`). Line under CTA: "{{offer_price}} once. No renewal, nothing to cancel. Unlimited chat needs Chai Plus." Decline link: "No thanks, continue free · 10 messages a day". Events: `offer_view`, `offer_accept` + `checkout_click` (plan `offer`), `offer_decline`, `offer_expired`.
**CTA:** Get the pass

---

## G. Payoff

### 15. Back in the chat
**Purpose:** The funnel ends inside the thread, mid-story, with the character's reply and the user's memories on screen, not on a catalog grid.
**Headline A:** {{char_name}}
**Headline B:** {{char_name}} · online
**Body A:** Pick up right where you left off.
**Body B:** 7 messages left today.
**Visual:** Thread: the character's reply (`{{char_after}}`) at the bottom, voice note above it. Composer shows "7 messages left today" (free) or no counter (Plus). "Memory: {{name}}, {{interest_1}}, {{interest_2}}" chip above the composer. AI banner on top.
**Microcopy:** Plus users get a one-time toast: "Unlimited chat is on. Enjoy." Free users see the counter always.
**CTA:** (send a message)

### 16. Daily limit reached (second ask)
**Purpose:** The highest-intent ask at the last free message, mid-story. Same plans, contextual copy, the app talking.
**Headline A:** You've used today's 10.
**Headline B:** The story is mid-scene.
**Body A:** Resets at midnight. Or chat without limits.
**Body B:** Go unlimited, or come back at midnight.
**Visual:** Inline crown card under the last bubble, composer disabled "Out of messages · resets at midnight". Tapping the card opens the paywall (#13) with the quota headline.
**Microcopy:** The card is always the app. The character's last bubble stays in-story and never mentions payment, limits or leaving.
**Skip link:** Come back at midnight
**CTA:** Upgrade to Chai Plus

---

## Notes

- **One template, many characters.** Screens 1-16 are identical per character. Character rows below are content. Each character needs one portrait, one scene backdrop, a voice, and the scripted lines `{{char_hook}}`, `{{char_open}}`, three reply sets, `{{char_reply_1}}`, `{{char_reply_2}}`, `{{char_recall}}`, `{{char_voice_caption}}`, `{{char_after}}`. Switch in the demo with `?char=leo|mara|kai` (default Leo).

| | Leo | Mara | Kai |
|---|---|---|---|
| `{{char_role}}` | The bookshop owner | The starship captain | The rival chef |
| `{{char_hook}}` | "You've been in the romance aisle forty minutes." | "Captain's log: someone boarded uninvited." | "You again. Still pretending you can cook?" |
| Setting | A rainy bookshop at closing time | A starship bridge, stars through the glass | A busy kitchen pass at midnight |
| Voice | Dry, warm | Calm, commanding | Quick, teasing |

- **SFW by construction.** Characters are story archetypes, painted and clothed. No sexual descriptors, no sexual input, no adult-performer names, no taboo family framing (all present in Candy's captures). The age gate is an age check only. The 18+ content setting stays opt-in in the app profile, never in the funnel or ads.
- **Compliance.** The age gate comes first. The AI banner stays on every chat screen (#3-#10, #15, #16). No monetization in the character's voice. The fair-use cap is disclosed. Renewal price on every plan. No countdown, wheel or ticker. Proof blocks and guarantee are hidden until real.
- **Memory carries into the app.** The character's memory (`name`, `interest_1`, `interest_2`, the three replies) must be handed to the app at web2app (`ikfunnel` data, same as `chai-ai-boyfriend`). If the handoff is not built, drop the promise on #9 and the paywall hero. Do not ship the claim without it.
- **Unverified.** Candy's flow is a video-episode funnel (31 screens, no quiz, no email before paywall). This chat-first adaptation is our own design, not a copy of any captured funnel. The Candy paywall plan structure was captured, but the 1-week/4-week/12-week structure here is Chai's standard subscription, not Candy's. No Chai-specific conversion data yet.
- **Unverified numbers.** The 10 free messages a day and the 300 fair-use cap are carried from the other Chai funnels, not confirmed for Chai. The 50-message pass size is a proposal. Confirm all three before launch.
- **Drop-off risk:** #2 (age wheel), #6 (name, so the skip link), #12 (email before the reply, test removing it), #13. Keep the loader (#11) under 8 s.
- **Monetization:** one subscription with two triggers, measured separately (#13 onboarding CVR, #16 limit CVR). Offer CVR (#14) is a third metric. Voice notes drive message volume, not revenue.
- **A/B first:** (1) Hook A "Meet {{char_name}}." vs. B "{{char_name}} wants a word." (2) Which character in the ad (one funnel per character). (3) #12 email before vs. after the paywall. (4) Voice note before vs. after the paywall.
- **Content ops:** per character, about 12 scripted lines plus one portrait and one scene. Launch with the three samples (Leo, Mara, Kai), then clone from Candy's most-run series themes, minus the adult and taboo ones.
- **Demo (Artifact, private):** https://claude.ai/artifact/UEfDa91NsrfRpWeQcKsFwT (default Leo, `?char=mara` or `?char=kai` to switch). Images are CSS-drawn placeholders until `gen_images.py` runs with `IKAME_AI_KEY`.

- **Review fixes (2026-10-01):** age gate checks birth month + year and persists the block in sessionStorage; rating and reviews render only when real (no hard-coded stars); the offer is a smaller one-time message pass with a "Not included" list; demo has `<head>`.
