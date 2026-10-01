---
niche: mygrowth-charisma
display_name: MyGrowth (Charisma / Small Talk)
archetype: learning-plan
subject: person
input: tough situations, what goes wrong, 3 simulated replies, main goal, minutes per day, name, email
output: a conversation style (Listener / Storyteller / Connector), 3 skills to build, and a 4-week plan of script cards
screens: 21
monetization: web subscription (3 plans, 1-week intro / 4-week pre-selected / 12-week anchor, renewal shown beside every intro price); smaller one-track starter pass as last-chance offer; activation (install + sign-in) measured separately
creative_screens:
  hook-a: 1
  hook-b: 2
  quiz: 6
  loading: 14
  reveal: 16
motion: >
  two speech bubbles trading lines while an empty third bubble fills in at the
  right moment, then a script card flipping over to reveal the exact words to say
---

# Funnel Content — MyGrowth (Charisma / Small Talk)

Same app and brand as `learning/mygrowth` (MyGrowth, EXTRAMILE LIMITED: 5-15 minute lessons, Communication is one of its six subjects). This variant sells one skill: never running out of words. **References (adspylab, captured 2026-09-28 and 2026-10-01):** MyGrowth `communication-bau` (29 screens, 689 ads), RiseGuide `buildcharisma.com/l` (33 screens, 1,213 ads) and Smartyme small talk (45 screen configs, source-extracted). The shape is the shared learning-plan archetype: goal and pace quiz, a skill check, a measured result, a dated plan, one web paywall. **Deliberate differences from the competitors:** (1) the skill check is three *simulated conversations* where the user picks what to say and gets feedback on the spot, instead of Likert self-ratings and "92% ready" percentages; (2) the result is a conversation style built from those three real replies, not a celebrity role-model match or a profile "Readiness: PERFECT" gauge; (3) the plan is a set of script cards (situation, what to say, what to say next) built from the situations the user named; (4) no scratch card, no 10:00 promo timer, no "950+ started today" ticker, no struck-through "reference" prices; (5) no "Cambridge methodology" authority claim and no promise that charisma is "fixed in 4 weeks"; (6) the competitor's email-only cancellation is replaced by self-serve cancel. **Look:** identical to `learning/mygrowth`: white background, lavender panels `#EBE9F7`, violet gradient `#8488F4 → #7D73E3`, blue `#007BFF`, orange `#FF9F00` accent. Copy rules apply throughout: headline ≤6 words, body ≤12 words, A/B on every screen.

Tokens: `{{name}}`, `{{spots}}`, `{{top_spot}}`, `{{goal}}`, `{{style}}`, `{{style_hint}}`, `{{minutes}}`, `{{cards_hours}}`, `{{email}}`, `{{price_1w}}`, `{{renewal_1w}}`, `{{price_4w}}`, `{{renewal_4w}}`, `{{price_12w}}`, `{{renewal_12w}}`, `{{offer_price}}`, `{{offer_renew_price}}`, `{{app_rating}}`, `{{rating_count}}`. Unset personal tokens fall back to: name "you", top_spot "parties", goal "enjoy conversations", style "Connector", minutes "10".

---

## A. Hook

### 1. Hook A — Never run out of words
**Purpose:** Cold traffic from small-talk ads sees the exact fear in the ad, answered with a promise of practice.
**Headline A:** Never run out of words
**Headline B:** Small talk, made easy
**Body A:** Practice real conversations in five minutes a day.
**Body B:** Know what to say, before you need it.
**Visual:** White background, MyGrowth logo top-left, rating strip. Two speech bubbles trading lines with a third bubble filling in, last headline word in violet, violet CTA pinned bottom.
**Microcopy:** Rating strip: "★ {{app_rating}} · {{rating_count}} App Store ratings" (verified 4.5 / 2,400+ in the sibling brief; re-check at launch, never a geo-injected "Top app in {country}").
**CTA:** Start my quiz

### 2. Hook B — Real moments, real practice
**Purpose:** Sets the frame that this is rehearsal for real moments, not theory or a personality test.
**Headline A:** Rehearse the moment, not theory
**Headline B:** Practice before the party
**Body A:** Pick what to say, see how it lands.
**Body B:** Try three real situations in about two minutes.
**Visual:** Lavender panel with a chat card: a friendly line from "them", three reply chips below, one chip highlighted. Real app footage of a script card, not a stock phone.
**Microcopy:** Under CTA: "Takes about 3 minutes"
**CTA:** Continue

---

## B. Investment

### 3. Tough situations
**Purpose:** Names where conversation is hardest; these answers pick the script-card situations in the plan.
**Headline A:** Where do words fail you?
**Headline B:** Your toughest conversations?
**Body A:** Pick all that apply.
**Body B:** We'll build your script cards around these.
**Options:**
- 🎉 Parties
- 💼 Work
- 💘 Dates
- 📞 Phone calls
- 👨‍👩‍👧 Family events
- ✏️ Other
**Field:** Multi-select, CTA disabled until one pick (Other needs text). The first pick in tap order becomes `{{top_spot}}`.
**Visual:** 2-column grid of illustrated situation cards, Other as a full-width pill.
**Microcopy:** Other placeholder: "e.g. Networking events". Disabled-CTA hint: "Pick at least one to continue"
**CTA:** Continue

### 4. What happens
**Purpose:** Lets the user say what goes wrong in their own words, with no verdict from us.
**Headline A:** What usually happens?
**Headline B:** In the moment, you…
**Body A:** Pick all that fit. No judgement here.
**Body B:** Pick all that fit.
**Options:**
- 🫥 Mind goes blank
- 🤐 Silence gets awkward
- 🔁 Replay it later
- 🌀 Ramble on
- ✏️ Other
**Field:** Multi-select, CTA disabled until one pick (Other needs text).
**Visual:** Stacked pills with right-side check circles.
**Microcopy:** Other placeholder: "What else happens?"
**CTA:** Continue

### 5. Bridge — A skill, not a trait
**Purpose:** Reassurance before the simulations: conversation is practiced, not inborn. No outcome claim.
**Headline A:** Conversation is a skill
**Headline B:** You're not "bad at talking"
**Body A:** Skills get better with practice. Let's try three moments.
**Body B:** No wrong answers, just different effects.
**Visual:** Lavender panel, three speech bubbles in a row, each with a small dot, the first one lit.
**Microcopy:** "No wrong answers. Each reply shows what it does." Progress hint: "Step 1 of 3 done"
**CTA:** Try the first one

### 6. Simulation 1 — Party
**Purpose:** The product demo and the differentiator: a real situation, a real choice, immediate feedback. Each reply is tagged by style (ask / story / safe), invisibly.
**Headline A:** At a party, by the snacks
**Headline B:** A stranger says hi
**Body A:** They say: "Crazy week, huh?"
**Body B:** What do you say back?
**Options:** (3 replies, order fixed; none is "wrong")
| Reply | Tag | Feedback |
|---|---|---|
| "Totally! How's yours been?" | ask | 💡 Questions keep it going: you handed them the mic. |
| "Ha, mine started with a flat tire." | story | 💡 A small funny detail gives them something to react to. |
| "Yeah." *smile* | safe | 💡 Friendly, but it stalls. Add a question or a detail. |
**Field:** Single-select; feedback card slides up after the tap, CTA appears after it lands. Feedback is amber/violet, never red.
**Visual:** Chat view: their bubble on the left with an avatar, three reply buttons beneath, feedback card with a 💡 icon.
**Microcopy:** Feedback label: "💡 How it lands". Counter: "Moment 1 of 3"
**CTA:** Next moment

### 7. Simulation 2 — Work
**Purpose:** Second moment, a work context, so the style read has two data points.
**Headline A:** New colleague, coffee machine
**Headline B:** Your first chat at work
**Body A:** They say: "Hi, I just joined the team."
**Body B:** What do you say back?
**Options:**
| Reply | Tag | Feedback |
|---|---|---|
| "Welcome! What were you doing before?" | ask | 💡 An easy question for a newcomer: they can answer for minutes. |
| "Welcome! My first week I got lost twice." | story | 💡 A relatable story puts them at ease fast. |
| "Nice. Good luck." | safe | 💡 Polite, but it closes the door. Try one question. |
**Field:** Same as #6.
**Visual:** Same chat layout, office-kitchen backdrop.
**Microcopy:** Counter: "Moment 2 of 3"
**CTA:** Next moment

### 8. Simulation 3 — Date or call
**Purpose:** Third moment; adapts to #3 (a date if "Dates" was picked, a phone call if "Phone calls" was picked and not Dates, otherwise a date). Gives the style read its tie-breaker.
**Headline A:** First date, second drink
**Headline B:** On a first date
**Body A:** They ask: "What do you do for fun?"
**Body B:** What do you say back?
**Options:** (date version)
| Reply | Tag | Feedback |
|---|---|---|
| "Hiking, mostly. Do you get outside much?" | ask | 💡 You shared a little, then asked: a balanced reply. |
| "Last month I tried pottery and flooded the studio." | story | 💡 A story shows personality and gives them a laugh to build on. |
| "Oh, just normal stuff." | safe | 💡 Vague answers are hard to reply to. One detail helps. |
**Call version** (Headline A "Returning a call", Headline B "On the phone", body "They say: \"Thanks for calling me back.\""): ask "Of course! How can I help?" · story "Sure, sorry, I was stuck in traffic!" · safe "No problem."
**Field:** Same as #6.
**Visual:** Same chat layout; restaurant backdrop (date) or phone-call UI (call).
**Microcopy:** Counter: "Moment 3 of 3"
**CTA:** See my replies

### 9. Result bridge (computed from #6-8)
**Purpose:** Honest read of the three real replies: what the user reached for, and why it matters.
**Headline A:** {{style_hint}}
**Headline B:** That took two minutes
**Body A:** That's the skill, and it can be practiced.
**Body B:** Your replies already show a pattern.
**Visual:** Three replay cards stacked like flashcards, each with the situation, the reply picked and a small "ask", "story" or "short" tag.
**Microcopy:** `{{style_hint}}` bands: 2+ asks "You reach for questions" · 2+ stories "You reach for stories" · otherwise "You mix questions and stories". Progress hint: "Step 2 of 3 done"
**CTA:** Keep going

### 10. Main goal
**Purpose:** The one outcome the plan is built toward; becomes `{{goal}}` and decides the Week 4 script cards.
**Headline A:** What's your main goal?
**Headline B:** What would you love?
**Body A:** Pick the one that matters most.
**Body B:** Your plan will aim at this.
**Options:**
- 🤝 Make new friends
- 💼 Shine at work
- 💘 Date with ease
- 📞 Handle calls
- 🎉 Enjoy parties
- ✏️ Other
**Field:** Single-select. Other opens a one-line input and routes to the general Week 4 cards; CTA disabled while Other is empty.
**Visual:** 2-column grid of illustrated goal cards, Other as a full-width pill.
**Microcopy:** Other placeholder: "e.g. Speak up in meetings"
**CTA:** Continue

### 11. Minutes a day
**Purpose:** The commitment tap; sets `{{minutes}}`, which sizes the daily practice and makes the plan total a calculation.
**Headline A:** How many minutes a day?
**Headline B:** Your daily practice
**Body A:** Short daily reps beat long rare ones.
**Body B:** You can change it anytime in the app.
**Options:**
- 👍 Casual · 5 min/day
- 👌 Regular · 10 min/day
- 🤘 Serious · 15 min/day
- 💪 Determined · 20 min/day
**Field:** Single-select, nothing pre-selected.
**Visual:** Four wide cards, minutes in a small grey line.
**Microcopy:** "Most lessons take 5-15 minutes."
**CTA:** Set my pace

### 12. Name
**Purpose:** Gets `{{name}}` for the style card, the loader, the paywall hero and the offer.
**Headline A:** What should we call you?
**Headline B:** What's your first name?
**Body A:** We'll put it on your plan.
**Body B:** First name is all we need.
**Field:** Text input, placeholder "First name", max 30 chars, autofocus. Empty tap shows the error and does not advance.
**Visual:** Plain white input with violet focus ring.
**Error state:** "Please enter a name to continue"
**CTA:** Continue

---

## C. Trust

### 13. Social proof
**Purpose:** Trust beat before the loader, public checkable numbers only.
**Headline A:** Rated 4.5 on the App Store
**Headline B:** Learners give it 4.5 stars
**Body A:** From 2,400+ ratings by people like {{name}}.
**Body B:** Lessons short enough to finish over coffee.
**Visual:** Large "{{app_rating}}" with star row and laurel, App Store and Google Play badges, one review card.
**Microcopy:** Quote from the sibling brief (confirm reuse rights): "It beats mindless scrolling. You learn while you scroll!" — Kare. This is the only verified review; replace with a communication-course review from real store data before launch. No invented user counts.
**CTA:** Continue

---

## D. Anticipation

### 14. Building the plan (loading)
**Purpose:** Makes the plan feel assembled from the answers; rows name the user's own picks.
**Headline A:** Building {{name}}'s plan…
**Headline B:** Reading your three replies…
**Steps:**
- Reading your three replies…
- Spotting your conversation style…
- Choosing script cards for {{top_spot}}…
- Almost ready, your plan awaits…
**Visual:** Three speech bubbles flipping into script cards; four progress rows; two real reviews rotating beneath.
**Microcopy:** Carousel header: "★ {{app_rating}} on the App Store"
**CTA:** (auto-advances, ~6 seconds)

---

## E. Gate

### 15. Email
**Purpose:** Web checkout needs an identity that later unlocks the app; asked after the loader at peak curiosity.
**Headline A:** Where should we send it?
**Headline B:** Save your plan, {{name}}
**Body A:** Your email unlocks your plan in the app.
**Body B:** You'll sign in with this email later.
**Field:** Email input (email keyboard, autofocus), "Continue with Apple" / "Continue with Google" above. Separate **unchecked** marketing checkbox.
**Visual:** Blurred style card behind a white sheet holding the field.
**Error states:** "Please enter a valid email address" / "This email already has a plan. Check your inbox."
**Microcopy:** Under CTA: "Used only for your account. No spam." + Terms · Privacy links.
**CTA:** Show my style

---

## D. Reveal

### 16. Your conversation style
**Purpose:** The result: a style derived from the three real replies (tag counts, ties go to Connector), plus the 3 skills that style most needs.
**Headline A:** {{name}}, you're a {{style}}
**Headline B:** Your conversation style
**Body A:** Based on your three replies. A starting point, not a label.
**Body B:** Three skills would round it out.
**Visual:** A style card (illustration, style name in violet, one-line description) and three skill rows with level bars labelled "Goal".
**Microcopy:** Styles and skills to build:
| Style | Rule | Description | 3 skills to build |
|---|---|---|---|
| Listener | 2+ asks | You make people feel heard. | Share more of yourself · Start the conversation · Exit gracefully |
| Storyteller | 2+ stories | You bring energy and color. | Ask follow-up questions · Keep stories short · Read the room |
| Connector | otherwise | You mix both. | Open with confidence · Keep it going · Exit gracefully |
"Styles are a practice guide, not a personality test or a diagnosis."
**CTA:** See my plan

### 17. Your 4-week plan
**Purpose:** Turns the style and the situations into a dated ramp of script cards, labelled as goals.
**Headline A:** {{name}}'s 4-week plan
**Headline B:** Built around {{goal}}
**Body A:** One script card a day, five days a week.
**Body B:** Week by week, from openers to your toughest spot.
**Visual:** Four week rows with a 5-dot strip each and a theme: Week 1 "Easy openers", Week 2 "Keep it going", Week 3 the style skill (see #16), Week 4 the main goal's situation (see #10). Chips: Style · Goal · Toughest spot · Pace `{{minutes}}` min. Footer line "20 script cards · X hours in 4 weeks" computed from `{{minutes}}`.
**Microcopy:** Each week is labelled "Goal", never a promised outcome. "Your pace sets the hours, not the results."
**CTA:** Show my cards

### 18. Your first script cards
**Purpose:** Free taste of the product: three real script cards for the user's top situation (opener, follow-up, graceful exit); the other 17 are locked behind the paywall.
**Headline A:** Your first script cards
**Headline B:** Words ready for {{top_spot}}
**Body A:** Opener, follow-up, graceful exit. Tap a card.
**Body B:** Three of your twenty cards, unlocked.
**Visual:** Three flip cards (situation title front; "Say" and "Then" lines back), followed by a blurred stack labelled "17 more in your plan".
**Microcopy:** Card text by situation (Other uses Parties):
| Situation | Opener | Follow-up | Exit |
|---|---|---|---|
| Parties | "How do you know the host?" | "What brought you here tonight?" | "I'm going to say hi to a friend. Great chatting!" |
| Work | "What are you working on this week?" | "How did you get into that?" | "I'll let you get back to it. Good talking!" |
| Dates | "What's the best part of your week so far?" | "What got you into that?" | "I've had a lovely time. Let's do this again?" |
| Phone calls | "Hi, thanks for picking up. Is now a good time?" | "Could you tell me a bit more about that?" | "Thanks for your time. I'll send a note to recap." |
| Family events | "What's new with you since I saw you last?" | "How did that go?" | "I'm going to grab a drink. Back in a bit!" |
**CTA:** Unlock all 20

---

## F. Monetization

### 19. Paywall
**Purpose:** Long-scroll web sales page. Intro and renewal prices sit side by side on every plan; no struck-through "reference" prices, no timer. Final prices are the growth team's call, so the page shows tokens.
**Headline A:** {{name}}, start your practice today
**Headline B:** Your {{style}} plan
**Body A:** Every price and renewal shown before you pay.
**Body B:** 20 script cards, built around {{goal}}.
**Plans:** (structure only, prices are tokens)
- **1-week plan** intro `{{price_1w}}`, then `{{renewal_1w}}` per week.
- **4-week plan**: **pre-selected**, intro `{{price_4w}}`, then `{{renewal_4w}}` every 4 weeks. "MOST POPULAR" only if sales data backs it.
- **12-week plan**: anchor, intro `{{price_12w}}`, then `{{renewal_12w}}` every 12 weeks.
- Plans are named by the period they bill. No fake "was" price.
**Page structure (top to bottom):** brand bar (logo + close ✕) · personal hero (style card, goal, `{{minutes}}` min/day chips) · plan block · what's inside · how it works (3 steps) · proof (rating + review cards) · guarantee · FAQ · plan block repeated · sticky CTA.
**Visual:** Same web look as the rest of the funnel. Radio plan cards, violet border on the selected one, payment-method row (Apple Pay / PayPal / card), safe-checkout badges. No countdown bar.
**Microcopy:**
- Line above the sticky CTA: "{{price_4w}} today. Then {{renewal_4w}} every 4 weeks until you cancel." (follows the selected plan)
- Trust row: "🔒 Secure checkout · Cancel online anytime"
- What's inside (shipped features only, confirm against the app): "5-15 minute lessons" · "Script cards for every situation" · "Practice scenes with feedback" · "Read or listen to every lesson" · "Streaks and reminders"
- How it works: 1 "Pick your plan" · 2 "Sign in with {{email}}" · 3 "Open your first script card"
- Guarantee: hidden while the refund terms are still a token; shown only once the real conditions are filled in.
- FAQ: "How do I cancel?" → "Profile → Settings → Manage subscription, or the link in your receipt." · "Will it renew?" → "Yes, at the renewal price shown, until you cancel. We email you before every renewal." · "Is this therapy?" → "No. It's practice for everyday conversation, not treatment."
**Fallback offer:** On close, the last-chance offer (#20) once per session. No timer.
**CTA:** Start my plan

### 20. Last-chance offer (on close)
**Purpose:** Second chance for users who close the page without paying: a smaller, cheaper option than the three tiers, one situation track for one week. Shown once per session, then never again.
**Headline A:** Not ready? Start smaller
**Headline B:** Try one situation track
**Body A:** One track, one week, no big commitment.
**Body B:** Your {{goal}} script cards only.
**Plans:** One offer card: **7-day starter pass**, `{{offer_price}}` for 7 days, then `{{offer_renew_price}}` per week until cancelled. Scope: only the user's `{{goal}}` track (7 script cards, 3 practice scenes); the full plan stays on the paywall. Not labelled "free". No struck-through price.
**Visual:** Same web look as #19: sticky bar with logo and ✕, eyebrow "One-time offer · shown once", one violet-bordered card with the goal icon, three checks that match the scope, renewal line, text link "No thanks, back to my plan".
**Microcopy:** "{{offer_price}} for 7 days, then {{offer_renew_price}} a week until you cancel. Cancel anytime online." Shown once (sessionStorage `ikf_offer_mygrowth-charisma`); `CONFIG.offer.expiresMin` is `null`, no timer.
**CTA:** Get the starter pass

---

## G. Payoff

### 21. Get the app
**Purpose:** Web buyers who never sign in refund; the first job after paying is card 1 with the same email.
**Headline A:** You're in, {{name}}!
**Headline B:** Last step: open the app
**Body A:** Get the app and sign in with {{email}}.
**Body B:** Your first script card is waiting.
**Visual:** Green check over the logo, 3 numbered steps (Download · Tap the sign-in link we emailed · Open script card 1), store badges, QR for desktop, phone mockup of a script card.
**Microcopy:** "Receipt sent to {{email}}" · "Manage or cancel anytime" link.
**CTA:** Open the app

---

## Notes

- **Unverified:** the research marks MyGrowth communication-bau and RiseGuide as observed (V); Smartyme small talk is source-extracted (config, not a live capture). Nothing here is inferred from a competitor screen, but the three simulations, the style bands (ask / story / tie → Connector), the script-card text, the 20-card ramp and the starter-pass offer are this brief's own design, not a competitor's. The "style" is a practice guide, not a validated psychological test. Prices are tokens; the 1-week / 4-week / 12-week structure mirrors the sibling brief, not MyGrowth's live 4/12/26-week plans, so confirm with growth before launch.
- **Honesty guardrails:** no promise that the user becomes "charismatic" or confident in N weeks; weeks are goals; no "Cambridge methodology", celebrity role-model or "92% ready" claims; the simulation feedback explains effects instead of grading right or wrong; the only review quote is the one verified in the sibling brief.
- **Dropped competitor mechanics:** scratch card, 10:00 promo timer, "950+ started today" and "1.5M users" tickers, struck reference prices, email-only cancellation, recycled reviews from other subjects, expert/authority personas.
- **Not a health product:** communication practice, not social-anxiety treatment. If a user types distress into an Other field the app does not react, but the FAQ states it is not therapy; do not target ads at "social anxiety".
- **Measure:** quiz completion by screen, simulation reply split (ask / story / safe), #16 to #19 reach, paywall conversion per plan, starter-pass accept rate, activation (install + sign-in + first card within 48 h), first-renewal retention at full price, refund rate.
- **Demo (private Artifact):** https://claude.ai/artifact/GdgczPChuFZmPisbetdRA5
