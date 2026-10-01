---
niche: mygrowth-book-summaries
display_name: MyGrowth (Key Ideas / Book Summaries)
archetype: learning-plan
subject: person
input: topics, last book finished, read or listen, reason, three books of interest, minutes per day, reminder time, name, email
output: a personal shelf of three books and a 4-week reading plan of one key idea a day
screens: 20
monetization: web subscription (3 plans, 1-week intro / 4-week pre-selected / 12-week anchor, renewal shown beside every intro price); one-time single-book pass as last-chance offer; activation (install + sign-in) measured separately
creative_screens:
  hook-a: 1
  hook-b: 2
  quiz: 8
  loading: 14
  reveal: 16
motion: >
  a thick book closing into a single glowing idea card that slides up to a
  phone, then three book spines lining up on a shelf one by one
---

# Funnel Content — MyGrowth (Key Ideas / Book Summaries)

Same app and brand as `learning/mygrowth` (MyGrowth, EXTRAMILE LIMITED: 5-15 minute lessons across six subjects). This variant sells one habit: one big idea a day, taken from books you care about. **Reference (adspylab, captured 2026-09-28):** Headway `makeheadway.com/onboarding/start` (variant quiz1/split 37, 41 screens, about 2,280 ads, "swap doomscrolling for bite-sized learning"). The niche is saturated (Headway runs 77K ads across variants), so this brief only exists to test whether MyGrowth can enter it; see the verification note below. The shape is the shared learning-plan archetype: interests and habits quiz, a taste of the product, a dated plan, one web paywall. **Deliberate differences from the competitor:** (1) no sensitive profiling (the competitor asks about sex life, boundaries, extro/introversion and shows "72% / 94% ready" scores); (2) no live feed of masked emails ("1,102 learned in the last hour") and no "55M downloads / 5M in your location" claims; (3) the user taps a real 60-second sample idea before any email or paywall, instead of a "does this book seem interesting?" card with no content; (4) no struck-through anchor prices equal to the renewal, no promo timer; (5) the plan is a set of idea cards from the three books the user picked, labelled as goals, not "become the most interesting person in the room"; (6) book titles are public-domain or generic, no copyrighted summary text. **Look:** identical to `learning/mygrowth`: white background, lavender panels `#EBE9F7`, violet gradient `#8488F4 → #7D73E3`, blue `#007BFF`, orange `#FF9F00` accent. Copy rules apply throughout: headline ≤6 words, body ≤12 words, A/B on every screen.

Tokens: `{{name}}`, `{{topics}}`, `{{book_1}}`, `{{book_2}}`, `{{book_3}}`, `{{reason}}`, `{{format}}`, `{{minutes}}`, `{{reminder}}`, `{{idea_hours}}`, `{{email}}`, `{{price_1w}}`, `{{renewal_1w}}`, `{{price_4w}}`, `{{renewal_4w}}`, `{{price_12w}}`, `{{renewal_12w}}`, `{{offer_name}}`, `{{offer_price}}`, `{{app_rating}}`, `{{rating_count}}`, `{{refund_days}}`. Unset personal tokens fall back to: name "you", topics "big ideas", book_1 "Meditations", book_2 "Walden", book_3 "The Art of War", reason "learn something new", format "read or listen", minutes "10", reminder "evening".

---

## A. Hook

### 1. Hook A — One big idea a day
**Purpose:** Cold traffic from "learn more, scroll less" ads sees one small, doable promise.
**Headline A:** One big idea a day
**Headline B:** Great books, in minutes
**Body A:** Key ideas from books you care about.
**Body B:** Learn something real instead of scrolling.
**Visual:** White background, MyGrowth logo top-left, rating strip. A thick book closing into one glowing idea card, last headline word in violet, violet CTA pinned bottom.
**Microcopy:** Rating strip: "★ {{app_rating}} · {{rating_count}} App Store ratings", shown only when both values are real (CONFIG); hidden while they are tokens. Never a geo-injected "Top app in {country}".
**CTA:** Start my quiz

### 2. Hook B — Ideas worth keeping
**Purpose:** Shows the product shape (one card, three beats) so the quiz feels like a means, not a survey.
**Headline A:** One idea. Three beats.
**Headline B:** Read less, keep more
**Body A:** The idea, why it matters, one thing to try.
**Body B:** Each card takes about a minute.
**Visual:** Lavender panel with a single idea card showing three labelled rows (Idea, Why, Try). Real app footage of a lesson card, not a stock phone.
**Microcopy:** Under CTA: "Takes about 3 minutes"
**CTA:** Continue

---

## B. Investment

### 3. Topics
**Purpose:** Interest signal; the picks sort the book list in #8 and become `{{topics}}`.
**Headline A:** What do you want more of?
**Headline B:** Pick your topics
**Body A:** Pick all that apply.
**Body B:** We'll sort your books around these.
**Options:**
- 🧠 Mind
- 💰 Money
- 🔁 Habits
- 🧭 Leadership
- 🏛️ Philosophy
- ✏️ Other
**Field:** Multi-select, CTA disabled until one pick (Other needs text).
**Visual:** 2-column grid of illustrated topic cards, Other as a full-width pill.
**Microcopy:** Other placeholder: "e.g. Parenting". Disabled-CTA hint: "Pick at least one to continue"
**CTA:** Continue

### 4. Last book finished
**Purpose:** Calibrates the pace without judgement; a long gap is a normal answer.
**Headline A:** Last book you finished?
**Headline B:** When did you last finish one?
**Body A:** No judgement. A long gap is fine.
**Body B:** It helps us set a gentle start.
**Options:**
- 📗 This month
- 📘 This year
- 📙 Years ago
- 🙈 Not since school
**Field:** Single-select, nothing pre-selected.
**Visual:** Four stacked pills with a small book-stack icon that shrinks as the gap grows.
**Microcopy:** No population claim about reading habits ("most people…") is made; Body A only reassures.
**CTA:** Continue

### 5. Read or listen
**Purpose:** Format preference; becomes `{{format}}` and is echoed in the plan and the paywall.
**Headline A:** Read or listen?
**Headline B:** How do you like ideas?
**Body A:** Pick your default. Switch anytime.
**Body B:** Every lesson works both ways.
**Options:**
- 📖 Read
- 🎧 Listen
- 🔀 A bit of both
**Field:** Single-select. Body B's "works both ways" (fallback Body B while unconfirmed: "We'll tune your plan to it.") and the "Read or listen" / "Streaks" lines on #18-#19 sit behind `CONFIG.features` flags (`readListen`, `streaks`, default false) and are hidden or softened until product confirms them (see Notes).
**Visual:** Three wide cards, an open book, headphones, and both side by side.
**Microcopy:** None
**CTA:** Continue

### 6. Your reason
**Purpose:** Motivation in the user's own words; becomes `{{reason}}` for the plan header and the paywall hero.
**Headline A:** Why ideas, why now?
**Headline B:** What's pulling you in?
**Body A:** Pick the closest one.
**Body B:** Your plan will lean toward it.
**Options:**
- 📵 Scroll less
- 💼 Grow at work
- 🌱 Build a habit
- 🔎 Stay curious
- ✏️ Other
**Field:** Single-select. Other opens a one-line input, CTA disabled while empty. `{{reason}}` phrases: "scrolling less" / "growing at work" / "a reading habit" / "staying curious" (Other uses the typed text).
**Visual:** 2x2 grid of illustrated cards, Other as a full-width pill.
**Microcopy:** Other placeholder: "e.g. Be a better manager"
**CTA:** Continue

### 7. Bridge — Ideas, not shortcuts
**Purpose:** Honest framing before the book list: key ideas are a doorway to the book, not a replacement for it. No time-saving stat.
**Headline A:** Ideas first, books after
**Headline B:** A doorway to the book
**Body A:** Short ideas make big books easier to start.
**Body B:** Keep the ones that stick.
**Visual:** Lavender panel, a book on the left with an arrow into a single glowing card; second small arrow back to the book.
**Microcopy:** "Key ideas are an introduction, not a replacement for the full book."
**CTA:** Pick my books

### 8. Pick three books
**Purpose:** The main investment tap; up to three titles that shape the shelf, the plan and the sample. List is public-domain titles only, sorted so books matching #3 come first.
**Headline A:** Pick up to three books
**Headline B:** Which would you open first?
**Body A:** Your first ideas come from these.
**Body B:** Tap to add, tap again to remove.
**Options:**
- 🏛️ Meditations · Marcus Aurelius
- 🌲 Walden · Henry David Thoreau
- ⚔️ The Art of War · Sun Tzu
- 🪞 Self-Reliance · Ralph Waldo Emerson
- 💰 The Wealth of Nations · Adam Smith
- 🧠 As a Man Thinketh · James Allen
- ✏️ Other
**Field:** Multi-select, maximum three; a fourth tap shows "Three is the limit" and changes nothing. CTA disabled until at least one pick; the Other pick needs text and counts toward the three. The first pick in tap order is `{{book_1}}`. Counter "n of 3 picked".
**Visual:** Book-spine cards (title, author, topic chip), selected ones lift and show a check. A small "More titles join the library over time" line only if confirmed.
**Microcopy:** Other placeholder: "e.g. a book you've been meaning to read". Disabled-CTA hint: "Pick at least one to continue". Titles are public-domain placeholders; the real library list must be confirmed before launch.
**CTA:** Continue

### 9. A 60-second idea
**Purpose:** The product demo and the differentiator: a real key idea, tappable in three beats, before any email or paywall. Uses `{{book_1}}` (the first pick; Other falls back to Meditations).
**Headline A:** Try a one-minute idea
**Headline B:** From {{book_1}}, in a minute
**Body A:** Tap through all three beats.
**Body B:** One idea, why it matters, one try.
**Beats (original paraphrase, for demo):**
| Book | Idea | Why it matters | Try today |
|---|---|---|---|
| Meditations | Your reaction is the part you control. | Events arrive unasked; your judgement is yours to edit. | At the next annoyance, take one breath before you reply. |
| Walden | Everything costs hours of your life. | Price is not only money; it is time you don't get back. | Before saying yes, ask what hours it will cost. |
| The Art of War | Preparation decides most contests. | Calm comes from having thought it through first. | Before your next big meeting, write the one outcome you need. |
| Self-Reliance | Trust your own thinking first. | Borrowed opinions can drown out your own. | Write your view before reading anyone else's. |
| The Wealth of Nations | Doing one thing well makes everyone richer. | Focus plus trade beats doing everything yourself. | Name one task to hand off or drop this week. |
| As a Man Thinketh | Repeated thoughts become habits. | What you keep thinking shapes what you keep doing. | Notice one repeated thought today and reword it. |
**Field:** Three beat cards (Idea / Why it matters / Try today); each opens on tap. A "⏱ About 60 sec" chip is a guide only, not a gate. CTA appears once all three are open. Single reaction row after: 👍 Useful · 🤔 Not for me (neither blocks the flow; both just continue).
**Visual:** One tall idea card with three stacked rows that flip open, a "60 sec" chip top-right, book spine thumbnail top-left.
**Microcopy:** "Our own words, based on the book's themes." Never quote the book at length. Counter: "Idea 1 of 20 in your plan"
**CTA:** Next

### 10. Minutes a day
**Purpose:** The commitment tap; sets `{{minutes}}` and makes the plan total a calculation.
**Headline A:** How many minutes a day?
**Headline B:** Your daily idea time
**Body A:** Short daily ideas beat long rare ones.
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

### 11. Reminder time
**Purpose:** Anchors the habit to a daily slot; becomes `{{reminder}}` and sets the first notification.
**Headline A:** When should we nudge you?
**Headline B:** Pick your idea time
**Body A:** One gentle reminder a day.
**Body B:** Change or turn it off anytime.
**Options:**
- 🌅 Morning · 8:00
- ☕ Lunch · 12:30
- 🌆 Evening · 18:30
- 🌙 Before bed · 21:30
- ✏️ Other
**Field:** Single-select. Other opens a one-line time input, CTA disabled while empty.
**Visual:** Four time cards with a small sun/moon arc, Other as a full-width pill.
**Microcopy:** Other placeholder: "e.g. 7:15 am". The notification permission prompt is asked later in the app, not here.
**CTA:** Continue

### 12. Name
**Purpose:** Gets `{{name}}` for the loader, the shelf, the paywall hero and the offer.
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
**Purpose:** Trust beat before the loader. Rating and review blocks render only from real store data in CONFIG; with none, the screen falls back to a proof-free message.
**Headline A:** Rated {{app_rating}} on the App Store
**Headline B:** Learners give it {{app_rating}} stars
**Body A:** From {{rating_count}} ratings by people like {{name}}.
**Body B:** Lessons short enough to finish over coffee.
**Fallback (no real rating):** Headline A "Small ideas add up" / B "One idea a day"; Body A "A few minutes of reading a day." / B "Short enough to keep going, day after day." No rating, laurel or count shown.
**Visual:** Large rating with star row and laurel (rating version) or a book icon (fallback), App Store and Google Play badges, and one review card only if a real review is in CONFIG.
**Microcopy:** No quote, name, count or "millions of users" is shown until the growth team supplies verified store data; the sibling briefs' ratings and quotes are unverified for this funnel and are not used.
**CTA:** Continue

---

## D. Anticipation

### 14. Building the plan (loading)
**Purpose:** Makes the plan feel assembled from the answers; rows name the user's own picks.
**Headline A:** Building {{name}}'s plan…
**Headline B:** Shelving your three books…
**Steps:**
- Shelving {{book_1}} and your other picks…
- Choosing ideas for {{topics}}…
- Setting your {{reminder}} reminder…
- Almost ready, your plan awaits…
**Visual:** Three book spines sliding onto a shelf; four progress rows; real reviews rotate beneath only if CONFIG has them.
**Microcopy:** An optional review block appears under the rows only when CONFIG holds real reviews; otherwise nothing.
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
**Visual:** Blurred shelf card behind a white sheet holding the field.
**Error states:** "Please enter a valid email address" / "This email already has a plan. Check your inbox."
**Microcopy:** Under CTA: "Used only for your account. No spam." + Terms · Privacy links.
**CTA:** Show my shelf

---

## D. Reveal

### 16. Your idea shelf
**Purpose:** The result: the user's three books on a shelf, each with a first idea title and the share of the plan it fills. No score, no verdict.
**Headline A:** {{name}}'s idea shelf
**Headline B:** Your three books
**Body A:** Based on your picks, topics and pace.
**Body B:** Each fills about a week of ideas.
**Visual:** Wooden-free flat shelf with three coloured spines (title, author, topic chip); under each a row "First idea: <title>" and a chip "Goal: week N". Chips: Topics · Reason · Format · Pace `{{minutes}}` min.
**Microcopy:** First-idea titles are the "Idea" lines from #9 for the same book (Other picks show "Your own pick"). With fewer than three picks the shelf shows the remaining slots as "Add a book later in the app". "A reading guide, not a test or a grade."
**CTA:** See my plan

### 17. Your 4-week reading plan
**Purpose:** Turns the shelf and pace into a dated ramp of idea cards, labelled as goals.
**Headline A:** {{name}}'s 4-week plan
**Headline B:** Built around {{reason}}
**Body A:** One idea a day, five days a week.
**Body B:** Week by week, from your first book to your last.
**Visual:** Four week rows with a 5-dot strip each and a theme: Week 1 `{{book_1}}`, Week 2 `{{book_2}}`, Week 3 `{{book_3}}`, Week 4 "Revisit your favourites" (with one or two picks, the books repeat in order and Week 4 is the same). Chips: Topics · Reason · Format · Reminder. Footer: "20 idea cards · X hours in 4 weeks" computed from `{{minutes}}`.
**Microcopy:** Each week is labelled "Goal", never a promised outcome. "Your pace sets the hours, not the results."
**CTA:** Show my first ideas

### 18. Paywall
**Purpose:** Long-scroll web sales page. Intro and renewal prices sit side by side on every plan; no struck-through "reference" prices, no timer. Final prices are the growth team's call, so the page shows tokens.
**Headline A:** {{name}}, start your idea habit
**Headline B:** Your idea plan, ready
**Body A:** Every price and renewal shown before you pay.
**Body B:** 20 idea cards, built around {{reason}}.
**Plans:** (structure only, prices are tokens)
- **1-week plan** intro `{{price_1w}}`, then `{{renewal_1w}}` per week.
- **4-week plan**: **pre-selected**, intro `{{price_4w}}`, then `{{renewal_4w}}` every 4 weeks. Badge: "Recommended" (no popularity claim).
- **12-week plan**: anchor, intro `{{price_12w}}`, then `{{renewal_12w}}` every 12 weeks.
- Plans are named by the period they bill. No fake "was" price.
**Page structure (top to bottom):** brand bar (logo + close ✕) · personal hero (shelf thumbnail, reason, `{{minutes}}` min/day chips) · plan block · what's inside · how it works (3 steps) · proof (rating + review cards, only when real) · guarantee (only when refund days are real) · FAQ · plan block repeated · sticky CTA.
**Visual:** Same web look as the rest of the funnel. Proof section hidden until real reviews exist. Radio plan cards, violet border on the selected one, payment-method row (Apple Pay / PayPal / card), safe-checkout badges. No countdown bar.
**Microcopy:**
- Line above the sticky CTA: "{{price_4w}} today. Then {{renewal_4w}} every 4 weeks until you cancel." (follows the selected plan)
- Trust row: "🔒 Secure checkout · Cancel online anytime"
- What's inside (shipped features only; "Read or listen" and "Streaks" render only when `CONFIG.features` confirms them): "Short lessons, 5-15 minutes" · "Read or listen" · "Idea cards for your three picks" · "A daily reminder at {{reminder}}" · "Streaks"
- How it works: 1 "Pick your plan" · 2 "Sign in with {{email}}" · 3 "Open your first idea card"
- Guarantee: hidden while `refundDays` is a token; shown only once the real terms are filled in.
- FAQ: "How do I cancel?" → "Profile → Settings → Manage subscription, or the link in your receipt." · "Will it renew?" → "Yes, at the renewal price shown, until you cancel. We email you before every renewal." · "Is it the full book?" → "No. Key ideas are an introduction; read the full book to go deeper."
**Fallback offer:** On close, the last-chance offer (#19) once per session. No timer.
**CTA:** Start my plan

### 19. Last-chance offer (on close)
**Purpose:** Second chance for users who close the page without paying: a smaller, different product than the three tiers, one book's worth of ideas paid once. Shown once per session, then never again.
**Headline A:** Not ready? Take one book
**Headline B:** One book, paid once
**Body A:** A single-book pass. No subscription.
**Body B:** Just your first book, nothing to cancel.
**Plans:** One offer card, a different product from the 1/4/12-week plans: {{offer_name}} (single-book pass), `{{offer_price}}` paid once, no renewal, not labelled "free", no struck-through price. Covers the first library pick (`{{book_1}}`; a typed Other title falls back to the first library pick) and includes its idea cards only (about five ideas) and the read-or-listen format. Not included (stated on the card): your other two picks, the daily reminder plan, new picks later.
**Visual:** Web page in the paywall's style: sticky bar with close X, eyebrow "One-time offer · shown once", one violet-bordered card with the book spine thumbnail, price row, 3 checks, a "not included" line, CTA, payment badges, a "paid once, nothing to cancel" line.
**Microcopy:** "`{{offer_price}}` once. No renewal, nothing to cancel." Shown once (sessionStorage `ikf_offer_mygrowth-book-summaries`); `CONFIG.offer.expiresMin` is `null`, no timer. Decline link: "No thanks, back to my plan".
**CTA:** Get the book pass

---

## G. Payoff

### 20. Get the app
**Purpose:** Web buyers who never sign in refund; the first job after paying is idea 1 with the same email.
**Headline A:** You're in, {{name}}!
**Headline B:** Last step: open the app
**Body A:** Get the app and sign in with {{email}}.
**Body B:** Your first idea card is waiting.
**Visual:** Green check over the logo, 3 numbered steps (Download · Tap the sign-in link we emailed · Open idea card 1), store badges, QR for desktop, phone mockup of an idea card.
**Microcopy:** "Receipt sent to {{email}}" · "Manage or cancel anytime" link.
**CTA:** Open the app

---

## Notes

- **Verification of the niche (required by the task):** the research (`mygrowth.md` §1, §5) shows MyGrowth selling 5-15 minute lessons in six subjects (History, Psychology, Communication and others); the only book-summary funnel captured is **Headway** (a different app). Nothing in the captures confirms that MyGrowth ships a library of book summaries or key ideas, and a third-party listing shows only locked onboarding steps. This brief therefore treats "Key Ideas" as a proposed MyGrowth track: **unverified**, and it must not launch until product confirms that (a) a book/key-idea library exists, (b) the titles on #8 are in it, and (c) lessons can be read and listened to. Until then the demo's titles are public-domain placeholders.
- **Unverified:** the 77K ads figure and the Headway spine are research-observed (V); the idea beats on #9, the shelf, the single-book offer and the 20-idea ramp are this brief's own design, not a competitor's. The sample ideas are our own paraphrases of well-known public-domain themes, to be checked by editors; no book text is quoted. Prices are tokens; the 1/4/12-week structure mirrors the sibling briefs, not MyGrowth's live plans, so confirm with growth before launch.
- **Demo banner:** the demo panel shows "Concept: library unverified". Star row on #13 is drawn from the real rating value.
- **Honesty guardrails:** no "read a book in 15 minutes" or "save X hours" claims; no "most people" stats; plan weeks are goals; key ideas are framed as a doorway to the book; no rating, count or review is shown until real store data is set in CONFIG.
- **Dropped competitor mechanics:** sensitive profiling (sex life, boundaries), "72% / 94% ready" scores, role-model match, "55M downloads" and "5M in your location" claims, live masked-email learner feed, anchor prices equal to the renewal, recycled reviews, "Does this book seem interesting?" cards with no content.
- **Copyright:** only public-domain titles (Meditations, Walden, The Art of War, Self-Reliance, The Wealth of Nations, As a Man Thinketh); any modern bestseller needs a licence before it can appear in the picker.
- **Measure:** quiz completion by screen, book picks and sample-card completion (#9), #16 to #18 reach, paywall conversion per plan, single-book-pass accept rate, activation (install + sign-in + first idea within 48 h), first-renewal retention at full price, refund rate.
- **Demo (private Artifact):** https://claude.ai/artifact/VwAUbUHtwKaDkgbkDJJBkb
