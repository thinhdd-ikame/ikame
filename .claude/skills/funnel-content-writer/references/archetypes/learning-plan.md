# Archetype — learning-plan

**Shape:** User answers a goal / level / pace quiz (plus a short skill check or 1-3 sample-lesson questions) → gets a measured level and a dated multi-week plan, and does one real micro-lesson → one subscription unlocks the plan (often sold on the web, then app login by the same email).
**Signals:** Micro-learning, AI/tech upskilling, languages, general knowledge, faith study (Quran), courses, certificates. "15 min a day", streaks, level test, minutes-per-day question, progress curve / finish date before the paywall, subject-specific Meta ads. Output is a plan + habit, not a one-shot reading; value accrues over weeks, so activation and Day-2 return matter more than the reveal.
**Modeled on:** four live web funnels torn down via adspylab (Sept 2026): Coursiv (`coursiv.io/dynamic`), EWA (`quiz.appewa.com`, 67 screens), MyGrowth (`quiz.mygrowth.one`, 37), AyahPath (`quiz.ayahpath.com`). MyGrowth and AyahPath share one operator (Extramile Limited) and one funnel system.

## Default flow (18-26 screens)

**A. Hook** (1-3) — first-tap question or promise matched to the ad (subject / work type) · social or "every level welcome" framing with real app footage.
**B. Investment** (8-13) — cheap segment tap → subject / target skill (drives everything downstream) → goals (multi) → name capture → self-rated level (routes true beginners past the test) → blocker/struggles → bridge/reassurance mapping each to a real feature → preferred formats (only shipped ones) → daily minutes → habit anchor (time of day / existing routine → notification slot).
**B. Skill check + first taste** (2-5) — adaptive check (1-3 quiz items or word grids; every item shows the right answer + one fact; decoy items curb over-claiming) · computed score bridge · **one complete, tappable micro-lesson** using the user's own subject. The lesson is the demo.
**C. Trust** (1-2) — real store rating + verbatim review before/after the skill check; outcome proof (completions, certificates) beats install counts.
**D. Anticipation** (1-2) — loader whose rows name the user's answers · course-match tease (lessons locked).
**E. Gate** (1) — email (web: doubles as app login, magic link) or soft Apple/Google in-app.
**D. Reveal** (2-3) — measured level · dated plan / timeline computed from level × minutes (labelled an estimate) · what's inside.
**F. Monetization** (1-2) — paywall (3 plans named by real billing period, middle pre-selected, renewal price on every card) · order summary with today's charge, renewal charge and date. One disclosed fallback max.
**G. Payoff** (1) — web: install → same email → Day 1 ready; in-app: drop straight into Day 1, streak started, tomorrow's lesson named.

## Monetization

One layer: period subscription (weeks or months matching the program length). A post-purchase add-on, if any, is a second metric and must be declared as its own recurring sub beside the button. Measure separately: paywall conversion, trial→paid, first-renewal retention at full price, refund/chargeback rate (guardrail — refunds cluster at the first renewal), and activation (install + login + Day 1 within 24-48h).

## Traps

- **Answers must visibly change the plan** (module, examples, date). A quiz routing everyone to the same course and a fixed "550 words" / "certificate in 4 weeks" for everyone are the category's top complaints. Pace must move the date.
- **Intro → renewal jumps of 2-10× are the category default** (EWA 2×, MyGrowth 2-2.5×, AyahPath ~10×, Coursiv 1-week trial rolling into a pricier 4-week plan). Each plan renews at its own period; renewal on the card, in the CTA line and on the receipt; pre-renewal reminder. See the no-hidden-billing rule in personalization-quiz.md.
- No resetting countdowns, spin wheels / scratch cards, name-seeded fake promo codes, geo-injected "Top app in {country}", fake "started today" tickers, pre-checked or hard-to-skip add-ons. Self-serve cancel — email-only cancel is a hard-to-cancel pattern.
- Knowledge-check praise must follow the answers; "Excellent!" regardless is fake.
- **No income, job or outcome guarantees** ("pay off bills", "2× better results"); no "accredited" / CELTA-style logos unless true — say "certificate of completion".
- Cut analytics-only questions (gender, age, app history) unless they route content; competitor funnels run 37-130 screens, mostly statement screens. Cap trivia at 2-3 items; keep the in-funnel lesson to one tap-through.
- **Handoff is the last cliff:** browser-generated passwords cause "paid but can't log in" reviews — use deep link + magic link. Preload lesson media; fall back to still + audio.
- **Faith/devotional niches:** no guilt/fear questions about worship, no yes/no prompts about closeness to God, no contested rulings as quiz items, no invented scholar/imam personas, verified citations only, qualified review of every sacred-text string.

## Known variants

- `learning/coursiv` (24) — AI upskilling, light "career" look; 60-sec "which prompt works better?" micro-lesson at 15; email gate before the plan; 1/4/12-week paywall + receipt.
- `learning/ewa` (23) — languages; adaptive 2-grid word check with decoy words; subtitle tap-to-translate first taste; disclosed 3-day trial as the only fallback.
- `learning/mygrowth` (25) — general knowledge, 6 subjects with per-subject knowledge checks; plan graph after the email gate; optional add-on declared as its own sub.
- `learning/coursiv-claude-cert` (23) — Claude-only track (Tixu/Jobescape/Kodree teardown); first tap "Have you used Claude?", current-tools router (ChatGPT switchers), 2-item Claude check, Artifacts micro-lesson at 14; "Coursiv certificate of completion" + not-affiliated-with-Anthropic line on hook, plan and paywall.
- `learning/coursiv-ai-simple` (24) — non-tech office workers 35-55; honest job-anxiety first tap, "need tech skills?" myth tap, "what eats your week?" drives lesson + weeks, tech-comfort sets lesson style, 1-item "AI can be wrong" check, messy-notes → weekly-report lesson at 15; large-type accessibility override; 5/10/15 min pace.
- `learning/coursiv-vibe-coding` (24) — non-developers building apps; first tap "What would you build?", one-line app idea captured and built live at 15, device question routes browser builders vs. laptop tools, 2-item builder check (errors, clear requests); plan ends in a shipped app + certificate; Kodree's add-on yes/no questions and €1 trial dropped.
- `learning/ayahpath` (23) — faith/devotional; in-app store billing (Nigeria/Android); lesson time paired with a prayer; Bismillah word-by-word lesson as the reveal; mandatory religious-content review.
