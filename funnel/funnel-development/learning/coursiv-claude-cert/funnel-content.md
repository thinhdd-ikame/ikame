---
niche: coursiv-claude-cert
display_name: Coursiv - Claude AI Skills Certificate (Claude track, web funnel)
archetype: learning-plan
subject: person
input: Claude experience, main use, work field, current AI tools, Claude skills to master, certificate use, daily minutes, name, 2-item Claude skill check, email
output: personalized 28-day Claude skills plan with a dated Coursiv certificate of completion and a first Artifacts micro-lesson
screens: 23
monetization: web subscription paywall (1-week / 4-week pre-selected / 12-week, intro price with renewal price shown on every card and in the CTA line), app unlocked by the same email
creative_screens:
  hook-a: 1
  hook-b: 2
  lesson: 14
  reveal: 19
motion: >
  a request typing into a chat window, a side panel sliding up and rendering
  an interactive checklist Artifact whose boxes tick themselves, then a
  28-day track lighting up week by week and a certificate of completion
  stamping its date
---

# Funnel Content — Coursiv Claude Skills Certificate

Niche "Chứng chỉ Claude AI": a Claude-only entry into the Coursiv app for adults who hear about Claude at work and want a structured way to learn it plus something to show for it. The user answers ~10 taps (Claude experience, use, field, which AI tools they already use, which Claude skills they want) and takes a 2-item Claude check. They get a 28-day Claude track with a dated **Coursiv certificate of completion**, and build one Claude Artifact inside the funnel. Market signal (AdSpyLab Meta ads 03-08/2026 + Google Trends US): Tixu.ai has opened 6 new pages since 06/2026 (Claude AI Academy / Claude AI Certifications / Claude Certified Academy) with 24.5K ads, 15.6K of them in August alone, the fastest-growing cluster in the category. Search for "claude ai" is up 243% YoY. Archetype: **learning-plan**, 23 screens. **Modeled on:** Tixu `tixu.ai/api/experiment/cert` and `/t` (41 screens, captured 2026-09-21; note the captured "cert" landing is Tixu's generic AI-certificate flow, since the Claude-branded pages weren't captured separately), Jobescape `jobescape.me/chat-v3` ("Get confident using Claude", 50 screens, email at 41, paywall at 46) and Kodree's `claude-code` funnel (14 screens, paywall at 14). **What was deliberately changed:** (1) The first tap is the ad's own question ("Have you used Claude?", as Jobescape and Kodree open), not Tixu's gender tap. (2) A real Claude skill check (Projects, long-file prompting) and a one-tap **Artifacts** micro-lesson replace Tixu's opinion sliders. (3) A "which AI tools do you use now?" question routes ChatGPT/Gemini switchers into a switch module, the niche's biggest segment. (4) Certificate framing is honest everywhere. It is a Coursiv certificate of completion, never "Claude Certified" or "official", and Coursiv's non-affiliation with Anthropic is stated on the hook, the plan and the paywall. (5) Cut: gender, income range ($40K-$200K+), "dream home / wedding" goals, "2x more results" and Kodree's "add an official certification?" add-on question. Look: the base Coursiv **light "career" theme** (white, deep-indigo primary, green progress and success states). It must **not** borrow Anthropic's brand look (no Claude spark logo as a brand mark, no Anthropic coral palette, no copy of the claude.ai interface). "Claude" appears only as a plain text tool name. Copy follows the mobile limits (headline ≤6 words, body ≤12 words), with A/B on most screens.

---

## A. Hook

### 1. Hook A — Claude experience (first tap)
**Purpose:** The ad asks "Have you used Claude?", so the click lands on that exact one-tap answer. The answer sets the starting level and routes true beginners past the skill check.
**Headline A:** Have you used Claude yet?
**Headline B:** Get confident with Claude AI
**Body A:** Your 28-day Claude plan starts with this answer.
**Body B:** 15 minutes a day. Pick one to start.
**Options:**
- 🌱 Never tried it
- 🧪 A few times
- 🛠️ Every week
- 🚀 Every day
**Field:** Single-select, tap advances
**Visual:** White background, small "28-Day Claude Skills Program" pill above the headline, four stacked pills with a 1-4 bar signal icon on the right, a soft photo strip of a person at a laptop at the bottom edge. "Claude" is shown as text only, not as a logo.
**Microcopy:** Footer: "Coursiv is not affiliated with or endorsed by Anthropic." · "By continuing, you agree to our Terms, Privacy and Subscription Terms"
**CTA:** (tap to continue)

### 2. Hook B — Certificate promise, stated honestly
**Purpose:** Shows the end state (a certificate you can share) right after the first tap and says exactly what kind of certificate it is. Honesty here prevents the refund complaint "I thought this was official".
**Headline A:** Finish with a certificate
**Headline B:** Prove your Claude skills
**Body A:** A Coursiv certificate of completion for your Claude track.
**Body B:** From first chat to Projects and Artifacts, step by step.
**Visual:** Tilted sample certificate card: "Coursiv Certificate of Completion · Claude Skills Track", blank name line, Coursiv's own green seal (no Anthropic marks). A "[N]+ learners" chip beneath.
**Microcopy:** Under the card: "Issued by Coursiv. Not an official Anthropic certification." · Learner count: ikame's verified number only. Tixu's "500K users, 4.7" is theirs.
**CTA:** Build my plan

---

## B. Investment (each answer maps to a plan field, see Notes)

### 3. Main use
**Purpose:** The primary driver. It picks the Week 1 focus and is echoed on the plan and paywall.
**Headline A:** What do you want Claude for?
**Headline B:** Where should Claude help first?
**Body A:** Your first week is built on this.
**Body B:** Pick the one that matters most now.
**Options:**
- ✍️ Writing & email
- 📊 Research & analysis
- 📄 Long documents
- 🧰 Small work tools
- 💡 Brainstorming
- ✏️ Other
**Field:** Single-select; "Other" opens a one-line input (max 40 chars); progress "1 / 8" top
**Visual:** Stacked pills with line icons, selected pill fills indigo with white text, thin indigo progress bar at top.
**CTA:** Continue

### 4. Work field
**Purpose:** Swaps every lesson example, and the micro-lesson task on screen 14, to the user's field.
**Headline A:** What field are you in?
**Headline B:** Where do you work?
**Body A:** Lessons use real tasks from your work.
**Body B:** We'll swap in examples from your field.
**Options:**
- 💻 Tech / IT
- 📊 Finance
- 📣 Marketing / Media
- 🩺 Healthcare
- 🏫 Education
- 🤝 Sales / Business
- ⚙️ Operations
- ✏️ Other
**Field:** Single-select, two-column grid, tap advances
**Visual:** Two-column grid of compact icon tiles, indigo outline on select.
**CTA:** (tap to continue)

### 5. Current AI tools
**Purpose:** The niche-specific router. Most Claude-curious users already use ChatGPT, Gemini or Copilot, so Week 1 becomes a "switch to Claude" module for them and a "first AI" module for "None yet".
**Headline A:** Which AI tools do you use?
**Headline B:** What do you use today?
**Body A:** Pick all that apply. We'll build on them.
**Body B:** Switching tools? We'll map what carries over.
**Options:**
- 💬 ChatGPT
- ✨ Gemini
- 🪟 Copilot
- 🤖 Claude
- 🚫 None yet
- ✏️ Other
**Field:** Multi-select; "None yet" clears the others; CTA enabled at ≥1
**Visual:** 2×3 tiles with the tool name in plain text and a neutral icon, check badge on select.
**Microcopy:** Disabled-CTA hint: "Pick at least one"
**CTA:** Continue

### 6. Bridge — Your skills carry over
**Purpose:** Breaks the quiz after the tools question and turns "I'd have to start over" into "I'm already halfway". The body swaps with the answer to screen 5.
**Headline A:** Good news: your skills transfer
**Headline B:** Claude feels familiar fast
**Body A:** Know ChatGPT? Most of your habits work in Claude.
**Body B:** We'll show what's different and where Claude shines.
**Visual:** Two generic chat windows side by side merging into one, three green chips floating up: "Projects", "Artifacts", "Long files".
**Microcopy:** Body variant for "None yet": "New to AI? Claude is a friendly place to start." · Progress hint: "4 / 8 · Your plan is taking shape" · Every Claude feature claim here and on screens 7, 11, 12 and 14 is checked against the live product before launch.
**CTA:** Continue

### 7. Claude skills to master
**Purpose:** Picks the plan's modules. This is the "the plan is really mine" input, and it only offers skills the track actually teaches.
**Headline A:** Which Claude skills matter most?
**Headline B:** What do you want to master?
**Body A:** Pick up to three. They become your modules.
**Body B:** Choose up to three. We'll order them for you.
**Options:**
- 🗂️ Projects
- 🧩 Artifacts
- 📎 Files & PDFs
- 🎯 Better prompts
- 🔎 Research
- ✏️ Other
**Field:** Multi-select, max 3, CTA enabled at ≥1; each tile has an "i" tooltip
**Visual:** 2×3 tiles, each with a tiny neutral UI thumbnail of the feature (a folder with files, a side panel with a chart, a PDF with highlights), check badge on select.
**Microcopy:** Tooltips: Projects "Keep files and instructions in one place" · Artifacts "Claude builds docs, charts and mini tools" · Files & PDFs "Ask questions about long documents" · Disabled-CTA hint: "Pick at least one"
**CTA:** Continue

### 8. What the certificate is for
**Purpose:** Frames the certificate honestly as something to show, and picks the Week 4 final project (a LinkedIn post, a resume line, a demo for a manager).
**Headline A:** What's your certificate for?
**Headline B:** How will you use it?
**Body A:** We'll shape your final project around it.
**Body B:** Your last week builds something you can show.
**Options:**
- 💼 LinkedIn profile
- 📄 My resume
- 🙋 Showing my manager
- 🏁 Personal milestone
- ✏️ Other
**Field:** Single-select; "Other" opens a one-line input
**Visual:** Stacked pills, a small certificate icon beside the headline.
**Microcopy:** Small line under the options: "Certificate of completion. Employers decide what they recognize."
**CTA:** Continue

### 9. Daily pace
**Purpose:** The commitment device. It sets the certificate date on screen 19, so pace visibly moves the date.
**Headline A:** How much time per day?
**Headline B:** Set your daily Claude time
**Body A:** This sets your certificate date. Change it anytime.
**Body B:** Short and daily beats long and rare.
**Options:**
- ☕ 10 min/day
- ⏱️ 15 min/day
- 🔥 20 min/day
**Field:** Single-select; 15 min tagged "Most picked" only if true
**Visual:** Three large horizontal cards, each with a small clock arc filled to its share.
**CTA:** Continue

### 10. Name
**Purpose:** Captures `{{name}}` before the check, the lesson and the plan, so all three feel personal.
**Headline A:** What should we call you?
**Headline B:** Whose name goes on it?
**Body A:** Your name goes on your certificate.
**Body B:** First name is enough.
**Field:** Text input, placeholder "First name", max 30 chars
**Visual:** White input with indigo focus ring, faint certificate outline behind it with the name line blank.
**Error state:** "Please enter your name to continue"
**CTA:** Continue

---

## B. Skill check + first taste

### 11. Skill check 1 — Projects
**Purpose:** A real Claude-knowledge item instead of Tixu's "how ready are you?" sliders. Every answer shows the right one plus one fact, and "Not sure" curbs over-claiming. Users who picked "Never tried it" on screen 1 skip 11-12 and land on 13 with the beginner copy.
**Headline A:** Quick check: what's a Project?
**Headline B:** What do Claude Projects do?
**Body A:** Two quick questions. Guessing is fine.
**Body B:** No pressure. It just sets your level.
**Options:**
- 🗂️ Keep shared context
- 🖼️ Edit photos
- 📅 Book meetings
- 🤷 Not sure
**Field:** Single-select. After a tap, the correct option turns green and a fact line appears; then the CTA shows.
**Visual:** Question card on white, "1 / 2" dots top right, fact line slides up in a soft green box.
**Microcopy:** Fact line: "Projects keep your files and instructions for every chat." · Feedback follows the answer: correct "Right!"; wrong or "Not sure" "Good guess. Here's how it works."
**CTA:** Next question

### 12. Skill check 2 — Long-file prompting
**Purpose:** A second item that teaches a genuine, lesser-known Claude habit, so the check is itself a small lesson.
**Headline A:** Asking Claude about a long file?
**Headline B:** Where does your question go?
**Body A:** Pick the order that gets better answers.
**Body B:** One small habit makes a big difference.
**Options:**
- 📄 File first
- ❓ Question first
- 🔀 Doesn't matter
- 🤷 Not sure
**Field:** Single-select, same reveal pattern as screen 11
**Visual:** Same card layout, "2 / 2" dots, a tiny diagram of a long page with a question bubble moving to the bottom.
**Microcopy:** Fact line: "Anthropic's prompting tips: put long files first, question last." (Verify against Anthropic's current prompting guide before launch.) Feedback follows the answer, as on screen 11.
**CTA:** See my level

### 13. Score bridge
**Purpose:** Turns the check into a computed level. The copy follows the actual score, so the praise is earned rather than fixed.
**Headline A:** {{name}}, you got {{score}} of 2
**Headline B:** Your starting level: {{level}}
**Body A:** Nice base. Your plan skips what you know.
**Body B:** We'll start you at exactly the right lesson.
**Visual:** Horizontal meter (Beginner · Explorer · Practitioner) with a marker sliding to the computed band, two small result chips (✓ / ✗) for the two items.
**Microcopy:** Body variants: score 0 or skipped: "Perfect starting point. Week 1 covers exactly this." · score 1: "Good instincts. We'll fill the gaps first." · score 2: Body A as written.
**CTA:** Try a real lesson

### 14. Micro-lesson — Build your first Artifact
**Purpose:** The demo and the strongest ad-creative screen. In one tap the user watches a request become an interactive Artifact (a checklist, a chart or a one-pager, swapped by field and main use). That proves the Claude track teaches doing, not reading. No competitor funnel captured has an equivalent.
**Headline A:** {{name}}, build your first Artifact
**Headline B:** Watch Claude build a tool
**Body A:** Tap a request. See it become a tool.
**Body B:** 60 seconds, one tap, a real Claude skill.
**Options:**
- 🧾 "Make my weekly task checklist"
- 📊 "Chart these numbers for me"
- 📝 "Draft a one-page brief"
**Field:** Single tap. The request types into a chat bubble, a short reply streams, and a side panel slides up with the Artifact. Tickable checklist boxes, a bar chart that draws itself, or a formatted one-pager; examples swap by screen 4's field. The user can tick one box. Then a green chip appears: "Why it worked: clear task, format, audience". This is a pre-rendered simulation, labelled as a demo.
**Visual:** Phone split view: chat on top, Artifact panel rising from the bottom with a soft shadow. Neutral chat styling, not a copy of the claude.ai interface.
**Microcopy:** Label on the panel: "Demo preview" · Post-tap line: "That's Day 1, Lesson 1. 27 days to go." · Confirm how the app lets users practise with Claude (built-in playground vs. the user's own Claude account) and state it truthfully on screen 20.
**CTA:** Nice — keep going

---

## C. Trust

### 15. Social proof — Certificates earned
**Purpose:** Outcome proof just after the lesson and before the email gate, at peak "this works" and just before the friction.
**Headline A:** [N] certificates earned
**Headline B:** Rated [X]★ by learners
**Body A:** Real people finishing, one short lesson a day.
**Body B:** Learners share certificates on LinkedIn every week.
**Visual:** Big indigo number on white, a star row with the store name, two named review cards (one LinkedIn-post style showing a Coursiv certificate, one store review that mentions Claude).
**Microcopy:** ikame's own verified counts and ratings, "as of <month year>". Reviews must be real, attributed and dated. Don't reuse Tixu's "501,793 clients" or Jobescape's review cards.
**CTA:** Continue

---

## D. Anticipation

### 16. Building the plan (loading)
**Purpose:** Makes the plan feel crafted, with every row naming an answer the user gave.
**Headline A:** Building {{name}}'s Claude plan...
**Headline B:** Crafting your 28-day Claude path...
**Steps:** (4 rows, each with % counter, checkmark, progress bar)
- Building on your {{tools}} habits…
- Ordering {{skills}} into weekly modules…
- Adding {{industry}} tasks you'll recognize…
- Almost ready — your certificate date awaits…
**Visual:** A 28-tile grid filling tile by tile with small module icons (folder, panel, PDF), four progress rows beneath, one rotating review card at the bottom.
**Microcopy:** Rotating review cards: real, attributed, dated ikame reviews only
**CTA:** (auto-advances, ~6 seconds)

---

## E. Gate

### 17. Email gate
**Purpose:** Captures identity before the plan is revealed. On a web funnel the email is also the app login, so the copy says so.
**Headline A:** Where should we send it?
**Headline B:** Save your Claude plan, {{name}}
**Body A:** Your email becomes your app login.
**Body B:** We'll email your plan and a login link.
**Field:** Email input with typo suggestion ("Did you mean gmail.com?"); one **unchecked** optional box "Send me Claude tips and product news"
**Visual:** White input with envelope icon, lock icon beside the privacy line, the plan card blurred behind a frosted panel.
**Error states:** "Enter a valid email address" / "This email already has an account — log in instead?"
**Microcopy:** "We never sell your data. Privacy Policy" · Tixu's separate "Want smart tips? Yes, I'm in!" screen is folded into the unchecked box.
**CTA:** Show my plan

---

## D. Reveal

### 18. Claude profile
**Purpose:** Mirrors the answers back as a computed profile. The level comes from screens 1 and 11-13, not a fixed "High AI Potential".
**Headline A:** {{name}}, your Claude starting point
**Headline B:** Your Claude profile, {{name}}
**Body A:** Here's what your answers and check tell us.
**Body B:** You're closer than you think. Here's the map.
**Visual:** The level meter from screen 13, four summary rows with icons: Focus = {{use_case}}, Coming from = {{tools}}, Modules = {{skills}}, Pace = {{minutes}} min/day.
**Microcopy:** Meter caption: "Based on your answers and your 2-question check"
**CTA:** See my plan

### 19. Your plan + certificate date
**Purpose:** The reveal. A dated week-by-week Claude plan whose modules and date come from the answers, with an honest certificate footnote.
**Headline A:** Certificate by {{cert_date}}
**Headline B:** Your 28-day Claude plan
**Body A:** At {{minutes}} min a day, you finish {{cert_date}}.
**Body B:** Week 4 ends with your {{cert_use}} project.
**Visual:** Four stacked week cards: Week 1 "Switching to Claude" (or "Claude basics" for "None yet") → Week 2 {{skill_1}} → Week 3 {{skill_2}} with {{industry}} tasks → Week 4 final project for {{cert_use}} + certificate. Below, a two-column before/after: "You now" (grey) vs. "With the plan" (green).
**Microcopy:** Before/after rows. You now: "Guessing what Claude can do" / "Starting every chat from zero" / "Nothing to show for it". With the plan: "Projects set up for your work" / "Artifacts you can reuse" / "Certificate of completion". Footnotes: "Estimated date based on your pace." · "Coursiv certificate of completion. Not an Anthropic certification or accredited credential."
**CTA:** What's included

### 20. What's inside
**Purpose:** A bundle preview right before price. It also shows the real edge over a Claude-only academy: the same subscription covers other AI tools.
**Headline A:** Everything in your Claude track
**Headline B:** More than a Claude course
**Body A:** Lessons, practice, prompts and a certificate to share.
**Body B:** Learn Claude, then ChatGPT and Gemini too.
**Visual:** 5 icon benefit rows on white with green checks, a tilted phone mockup of a Claude lesson screen on the right.
**Microcopy:** Benefit rows (only what the app ships; verify the list): "📚 Daily 15-minute Claude lessons" / "🧪 Hands-on Projects & Artifacts practice" / "🗂️ Ready-made Claude prompts for {{industry}}" / "🏅 Certificate of completion with your name" / "🧭 Other AI tools included". Footer: "Coursiv is not affiliated with Anthropic. Claude is a trademark of Anthropic."
**CTA:** Get my plan

---

## F. Monetization

### 21. Paywall
**Purpose:** The primary ask. Each card shows today's price and the renewal price and period at equal weight. No timer, no wheel, no promo code.
**Headline A:** Start your Claude plan, {{name}}
**Headline B:** Your certificate starts today
**Body A:** Pick a plan. Cancel anytime from your account.
**Body B:** Focus: {{use_case}}. Finish date: {{cert_date}}.
**Plans:**
- **1-week plan** — lowest entry price, for trying it. The card states "then renews at [regular 1-week price] every week". It renews at *its own* period and never rolls silently into a 4-week plan.
- **4-week plan** — pre-selected, covers the full 28-day Claude track, "MOST POPULAR" badge only if true. The card shows "[intro price] today, then [regular price] every 4 weeks".
- **12-week plan** — best per-day value, "BEST VALUE" badge, per-day price shown small, covers the Claude track plus other AI tools. The card shows "[intro price] today, then [regular price] every 12 weeks".
- Any struck-through price must be the real regular renewal price, and the intro must apply to a genuine first period. Same plan structure as the base `learning/coursiv` funnel; use ikame's real prices at launch.
**Visual:** Top: a mini plan card echoing focus and date. Three stacked plan cards, the 4-week one with an indigo border. The renewal line uses the same size and colour as the price, not grey fine print. Payment row: Apple Pay / Google Pay / card logos.
**Microcopy:** Trust row: "🔒 Secure payment · Cancel anytime in 2 taps · [N]-day refund window". Agreement checkbox **unchecked**: "I agree to the Terms, Subscription and Refund Policy". Line above CTA, filled from the selected card: "You'll pay [today's price] today. It renews at [renewal price] every [period] until you cancel. We'll email you before each renewal." Footer: "Coursiv is not affiliated with or endorsed by Anthropic."
**Fallback offer:** On dismiss or back, one sheet with one genuine offer (e.g. the 4-week intro price extended once), with the renewal price on the same line. No countdown.
**CTA:** Get my plan

### 22. Checkout summary
**Purpose:** Confirms exactly what is charged today and later, before the card form. Surprise renewals are the category's top refund and chargeback cause.
**Headline A:** Review your order
**Headline B:** Here's what you'll pay
**Body A:** Today's total and your renewal, spelled out.
**Body B:** No surprises. Cancel anytime before renewal.
**Visual:** Receipt-style card: plan name, today's total (incl. tax), next charge amount and **date**, "how to cancel" line; card / Apple Pay form below.
**Microcopy:** Receipt rows: "Today: [price + tax]" / "Renews {{renew_date}}: [renewal price + tax] every [period]" / "Cancel: Account → Subscription, web or app". No add-ons on this screen.
**CTA:** Pay securely

---

## G. Payoff

### 23. Welcome + app handoff
**Purpose:** Activation. The user installs, logs in with the same email by magic link and opens Day 1 at once. A web sale that never opens the app turns into a refund.
**Headline A:** Welcome aboard, {{name}}!
**Headline B:** Day 1 of Claude is ready
**Body A:** Get the app and log in with {{email}}.
**Body B:** Your first 15-minute Claude lesson is waiting.
**Visual:** Green success check, phone mockup showing "Day 1 · Switching to Claude" (or "Claude basics"), App Store / Google Play buttons, 3 numbered steps.
**Microcopy:** Steps: "1. Install the app" / "2. Tap the login link in your email" / "3. Start Day 1". Receipt line: "Receipt and cancel link sent to {{email}}".
**CTA:** Get the app

---

## Notes

**Market + competitor evidence.** Tixu's Claude cluster (Claude AI Academy / Claude AI Certifications / Claude Certified Academy, 6 pages since 06/2026, 24.5K ads, 15.6K in August) is the fastest-growing ad cluster in AI upskilling. "claude ai" search is +243% YoY (US). Captured flows: **Tixu** `/api/experiment/cert` + `/t` (41 screens each; 1,100 + 6,236 ads). Gender tap first, "used AI before?", 500K social screen, age, goal including "Increase my income / Retire early", agree/disagree sliders, a "Do you need to write code to use AI?" myth tap, tools used, reskilling and Pew stats, **work-hours and income-range questions ($40K → $200K+)**, "Oxford: AI skills pay ~23% more", "big goal: dream home / wedding / new car", before/after "Easy to Replace → Valuable to Employers", a loader with inline questions, email at 33, name at 35, marketing opt-in at 37, "2x more results", paywall at 41. Tixu's EUR ladder is the same as Coursiv's: €6.93 (struck €13.86) / €19.99 → €39.99 / €39.99 → €79.99. **Jobescape** `chat-v3` (50 screens, 3,717 ads). "Get confident using Claude / Have you ever used Claude?" first, 3 niche segments (writing / building apps / work), "AI mentor?", "portfolio site?", and "Would a certificate of completion help your career?" before the plan. Email at 41, paywall at 46, "61% intro offer" (€6.93 intro for 28 days, then €38.95 per 28 days). **Kodree** `claude-code` (14 screens), with "add an official certification to your plan?" at 13, paywall at 14 and a €1 / 7-day trial.

**Deliberately not implemented.** Gender and income questions (analytics plus earnings-claim exposure); "Easy to Replace", "Valuable to Employers" and "2x more results" (outcome claims); "official certification" wording and Kodree/Jobescape-style yes/no add-on questions (these appear to pre-sell add-ons, which is unverified); any "$1 / €1 trial into a hidden recurring sub"; timers, wheels and name-seeded promo codes. The screen 8 certificate question is kept, but it only picks the final project and never promises career value.

**Anthropic / trademark safety (must pass legal before launch).** Never "Claude Certified", "Claude Academy", "official", "accredited" or an Anthropic logo in the funnel, the ad page names or the creatives. Tixu's page names imply affiliation, and ikame should not copy that. "Claude" is used only as a descriptive tool name. The non-affiliation line appears on screens 1, 2, 19, 20 and 21. If Anthropic runs its own courses or certificates, the copy must never read as if this is that program.

**Answers change the plan.** Screen 1 experience + screens 11-13 score → level. Main use → Week 1 focus and paywall echo. Field → examples and the Artifact on 14. Tools → Week 1 "Switching to Claude" vs. "Claude basics". Skills (max 3) → Weeks 2-3 modules. Certificate use → Week 4 project. Minutes → date. Level rubric: Never 0 / A few 1 / Weekly 2 / Daily 3, plus 1 per correct check item. 0-1 Beginner, 2-3 Explorer, 4-5 Practitioner. Date: 10 min → today + 35 days, 15 → +28, 20 → +21 (confirm against real lesson lengths). The "28 days" in the ad holds at 15 min/day, so say so in the ad.

**Blocks skipped:** notification opt-in (web, pre-install; reminders are set in-app on Day 1), gamified wheel, post-purchase upsell, and a separate password registration (the email is the login via magic link).

**Drop-off risk:** 11-12 (a check can feel like an exam, hence "Guessing is fine" and the beginner skip) and 17 (email before plan). Keep 14 to one tap.

**First A/B tests:** (1) Artifact lesson at 14 vs. a "which prompt is better?" lesson (base funnel). (2) Hook B certificate card at 2 vs. straight into questions. (3) Email gate before the plan (17) vs. after the plan, before the paywall.

**Monetization:** one layer, the web subscription. Track paywall conversion, install + login + Day 1 within 48h, and refund/chargeback rate by plan, especially refunds citing "not official".

**Unverified / assumed:** Tixu's Claude-branded page flows (only the generic cert flow was captured); current Claude feature names and the prompting tip on 12; how the app provides Claude practice; live prices. All ikame stats are `[N]` placeholders until real.
