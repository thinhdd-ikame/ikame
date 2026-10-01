---
niche: calmio-calm-kids
display_name: Calmio - Calm Kids (AI wellbeing companion for parents - 18+)
archetype: personalization-quiz
subject: child
input: parent age (18+ gate), child age band, hardest situation, how often, how the parent responds, what they tried, goal, child first name, parent email
output: a 4-week calm plan for the child plus one ready-to-say script for the hardest situation
screens: 19
monetization: one plan subscription (1-week intro / 4-week pre-selected / 12-week anchor, renewal shown on every price, pre-renewal email), dismissible web paywall, one smaller one-time fallback pack on close (5 calm scripts, paid once, no timer), no other upsell layer
creative_screens:
  hook-a: 1
  hook-b: 2
  loader: 14
  reveal: 15
motion: >
  a tangle of tight looping lines above a quiet evening table slowly relaxes into one
  calm curve while a sage flower bud opens petal by petal and a soft bubble types
  a calm line a parent could say
---

# Funnel Content - Calmio: Calm Kids (for parents)

Calmio is a chat-based AI companion for reflective conversation (18+, "a companion, not a therapist"). This is the **calm kids** niche, written for the **parent** (an adult, 18+): the one who dreads the 6 p.m. meltdown, the bedtime battle, the homework standoff or the screen-time fight. The parent gives a handful of gentle answers about the hard moment. The only data about the child is a **first name and an age band**. They get a **4-week calm plan** for the child and **one ready-to-say script** for the hardest situation, then pay to unlock the whole plan. **Archetype: personalization-quiz** (Calmio mental-health variant, as in `mental-health/calmio-stress`): money is a plan subscription sold after a data quiz, not a per-message meter. 19 screens, A/B copy on every one.

**Reference funnel (competitor teardown, AdSpyLab research sheet, captured 2026-09):** Leaply "Steady Mind: Calm & Connected Kids", a parenting-calm quiz funnel. `calmio.md` has a GAP for it: the capture on file belongs to a different Leaply funnel, so this flow is **inferred from the funnel name, the niche and the Calmio stress and overthinking briefs, not from a live walk. Unverified.** The questions, order and copy are our own design.

**Deliberately different from the reference:** no behavioral-treatment, "fix your child's behavior" or "stop tantrums" claim; no diagnostic labels (no ADHD, autism, anxiety or "difficult child" question or result); no child photo, surname, school, birthday or health detail is ever collected (first name plus an age band only); the parent is addressed as the user and the child as a person, never as a problem. No timer, no promo code, no scratch card, no invented "-60%" anchor, no fake expert byline, no "% of parents" stat. A real script is shown before the paywall, and renewal terms sit next to every price. A "Need help now?" link is on every screen and is never paywalled. Ad copy never implies a personal attribute ("Is your child out of control?" style).

**Visual override (same as `mental-health/calmio`):** soft light theme, warm off-white, sage green and muted lavender, rounded sans, lots of air, the flower as the one hero object. The hook uses a lavender evening scene with a quiet table and a tangle of lines that smooths out. No child faces anywhere: scenes are objects only (mug, night-light, picture book). Confirm against the real brand kit.

---

## A. Hook

### 1. Hook A - Calmer evenings
**Purpose:** Meet the "dreading the evening" state with the brand promise, without asking for anything.
**Headline A:** Calmer evenings with your kid
**Headline B:** Hard evenings? Try a calm line.
**Body A:** A calm companion for the hardest hour at home.
**Body B:** Short scripts and tiny steps, made for your child.
**Visual:** Lavender evening sky fading to warm off-white over a quiet table photo (mug, picture book, night-light), a tangle of thin looping lines that slowly relax into one gentle curve. A sage flower bud breathes (in 4s, out 6s) beneath. One soft bubble: "I'm here. Let's take a breath." Sage button pinned bottom. "Need help now?" link top-right, persistent on every screen to #19.
**Microcopy:** Under CTA: "For parents 18+ · Calmio is AI and not a substitute for professional care". "Need help now?" opens the support sheet: "Call or text 988 (US) · Parenting under strain? Childhelp 1-800-422-4453 (US) · Outside the US: findahelpline.com · In danger now? Call your local emergency number." One tap, no sign-in, no paywall.
**CTA:** Get started

### 2. Hook B - Words for the moment
**Purpose:** Show the core surface (a calm script plus a tiny step) so the parent knows what they would be doing.
**Headline A:** Words for the hard moment.
**Headline B:** A calm line, any evening.
**Body A:** A script to say, a small step to try.
**Body B:** Two minutes a day, built around your child.
**Visual:** Card on off-white with three chat bubbles fading in (parent: "Bedtime turned into a battle again." / Calmio: "That's tough. Want a calm line for tonight?" / parent typing dots). "AI companion" chip above, a picture-book-and-night-light photo on the card.
**CTA:** Continue

---

## B. Investment

### 3. Adult check
**Purpose:** The app and the account are for adults. The check goes before any personal question so no minor discloses anything first.
**Headline A:** First, a quick age check
**Headline B:** What year were you born?
**Body A:** Calmio is for parents and adults, 18 and over.
**Body B:** We ask everyone. It keeps Calmio safe.
**Field:** Year wheel picker with no default. The CTA stays disabled until a year is picked.
**Visual:** Plain year wheel in a rounded white card, small sprout icon above.
**Error state:** Under 18 -> a blocking screen, no way back in. Headline: "Calmio is for adults only". Body: "Free support for young people is available now." Buttons: "Call or text 988 (US)" · "Find a helpline near you" (findahelpline.com).
**CTA:** Continue

### 4. What Calmio is (and isn't)
**Purpose:** The honest expectations beat and the safety net, placed before any question about the child. It is also where the data promise (first name and age band only) is made explicit.
**Headline A:** A companion, not a therapist
**Headline B:** Before we begin, one promise
**Body A:** Ideas for calmer moments. Not therapy or diagnosis.
**Body B:** We only ask your child's first name and age band.
**Visual:** Four icon rows on a white card (chat bubble, lock, lifebuoy, heart). Sage icons, generous spacing, nothing else on screen.
**Microcopy:** Rows: "Calmio is AI, and always says so" · "Only a first name and an age band, no photos or health details" · "Worried about your child's health or behavior? Their doctor can help" · "In crisis? Call or text 988 (US) or visit findahelpline.com". Footer: "Calmio does not provide medical advice, diagnosis or treatment, and does not treat a child's behavior."
**CTA:** I understand

### 5. Child's age band
**Purpose:** The first cheap tap. An age band, never a birthday, sets the wording of the scripts and plan.
**Headline A:** How old is your child?
**Headline B:** Which age fits best?
**Body A:** Pick one. Just a band, no birthdays.
**Body B:** Thinking of more than one? Pick one.
**Options:**
- 🧸 3 to 5
- 🎒 6 to 8
- 🚲 9 to 12
- 🎧 13 to 17
**Field:** Single select, auto-advances on tap. Sets `{{age_band}}`. No free-text field on this screen.
**Visual:** Four soft cards in a 2x2 grid, a line icon each, selected card fills sage. A small closed bud sits at the top.
**Microcopy:** Progress hint: "A few quick taps". Never ask for a birth date, a photo, a school or a diagnosis.
**CTA:** (auto-advances on tap)

### 6. The hardest situation
**Purpose:** Names the moment that hurts most, in the parent's words, and sets `{{situation}}`, which picks the script and the plan weeks.
**Headline A:** What's hardest right now?
**Headline B:** Where does it get tough?
**Body A:** Pick the main one. We'll start there.
**Body B:** One is enough. Your plan starts there.
**Options:**
- 😤 Meltdowns
- 🌙 Bedtime
- 📚 Homework
- 📱 Screens
- ✏️ Other
**Field:** Single select, auto-advances on tap. "Other" opens a one-line input; the CTA stays disabled until it has text, and any free text passes through crisis-language detection. Other falls back to a general script.
**Visual:** Soft pill list with a small line icon each, selected fills sage.
**Microcopy:** Disabled-CTA hint (Other only): "Add a few words". Crisis detection on "Other": if matched, show the support sheet with "Talk to a person now" first and "Continue with Calmio" second. Never block the parent, never ask them to explain.
**CTA:** Continue

### 7. How often
**Purpose:** Sets the pacing of the plan, never shown back as a score or label.
**Headline A:** How often does it happen?
**Headline B:** How often is it hard?
**Body A:** A rough guess is fine.
**Body B:** There's no right answer here.
**Options:**
- 🔥 Most days
- 📅 A few times weekly
- 🌤️ Now and then
- 🌱 Just starting to notice
**Field:** Single select, auto-advances on tap.
**Visual:** Stacked soft pill rows that cool from warm peach to lavender down the list.
**Microcopy:** The answer is not shown as a number or label.
**CTA:** (auto-advances on tap)

### 8. How you respond
**Purpose:** Lets the parent say what they do in the moment without judgment; used only to word the first script.
**Headline A:** How do you usually respond?
**Headline B:** What do you do then?
**Body A:** Pick all that apply. Everyone reacts.
**Body B:** Honest answers help. No judgment here.
**Options:**
- 🗣️ Raise my voice
- 🏳️ Give in
- 🤐 Go quiet
- 🚪 Walk away
- ✏️ Other
**Field:** Multi-select, min 1 to enable the CTA. "Other" opens a one-line input, checked for crisis language.
**Visual:** Soft pill list with a small line icon each, selected ones fill sage.
**Microcopy:** Disabled-CTA hint: "Pick at least one". Replies are never scored, judged or shown back as a label. Crisis detection also covers language about harming a child or oneself: the support sheet opens with Childhelp and 988 first.
**CTA:** Continue

### 9. What you've tried
**Purpose:** Shows respect for effort and lets the plan build on what already helps.
**Headline A:** What have you tried?
**Headline B:** What has helped, even a little?
**Body A:** Pick any. We'll build on it.
**Body B:** Choose all that apply.
**Options:**
- 📅 Routines
- ⭐ Reward charts
- 💬 Talking after
- 📵 Taking screens away
- 🙅 Nothing yet
- ✏️ Other
**Field:** Multi-select, min 1. "Nothing yet" clears the other picks. "Other" opens a one-line input, checked for crisis language.
**Visual:** Stacked pills with a small line icon each, selected ones fill sage.
**Microcopy:** Disabled-CTA hint: "Pick at least one". Never ask about medication, supplements, diagnoses or therapy history.
**CTA:** Continue

### 10. You're not doing it wrong
**Purpose:** A reassurance bridge at the midpoint, to ease the shame of listing the hard moments and keep the parent going. It states no statistic.
**Headline A:** You're not doing it wrong.
**Headline B:** Hard moments happen at home.
**Body A:** You're looking for tools, and that already counts.
**Body B:** Small scripts you can reach for in the moment.
**Visual:** Centered sage flower bud on off-white, three short soft lines of text fading in under it ("Tired is allowed." · "Hard evenings pass." · "Small steps count."). Nothing else on screen.
**Microcopy:** No percentage, no "most parents" claim, no expert quote.
**CTA:** Continue

### 11. What would feel better
**Purpose:** The parent states their own goal; the plan is worded around it. Goals are the parent's, never outcomes Calmio promises.
**Headline A:** What would feel better?
**Headline B:** What do you hope for?
**Body A:** Pick one. Your plan leans toward it.
**Body B:** You can change it anytime.
**Options:**
- 🌙 Calmer evenings
- 💬 Fewer arguments
- 🤝 More connection
- 😴 Easier bedtime
- ✏️ Other
**Field:** Single select, auto-advances on tap. Sets `{{goal}}`. "Other" opens a one-line input, CTA disabled until it has text, checked for crisis language.
**Visual:** Four soft cards with a line icon each; selected card fills sage. A small bud above.
**Microcopy:** Progress hint: "One more question"
**CTA:** (auto-advances on tap)

### 12. Child's first name
**Purpose:** Captures `{{child_name}}`, which the script and the plan use. A skipped name falls back to "your child". It is the only identifier of the child that is ever asked for.
**Headline A:** What's your child's first name?
**Headline B:** Who is this plan for?
**Body A:** First name or nickname only. Nothing else.
**Body B:** So scripts sound like your home.
**Field:** Text input, 1-20 chars, placeholder "Child's first name". Skippable: empty falls back to "your child" everywhere.
**Visual:** Plain white input on off-white, small bud icon above.
**Error state:** "Add a first name or skip for now"
**Microcopy:** Under the field: "No surname, photo or school. You can change it anytime."
**Skip link:** Skip for now
**CTA:** Continue

---

## C. Trust

### 13. Real people, real ratings
**Purpose:** The trust beat right after the investment stage and before the reveal. Proof has to be real; this category is where fake experts and fake stats do the most harm.
**Headline A:** {{app_rating}}★ from real people
**Headline B:** Private. Gentle. Yours.
**Body A:** {{rating_count}} ratings from people who use Calmio.
**Body B:** Only a first name and age band. Sharing is always your choice.
**Visual:** A: large rating number and sage star row, plus one real store review quoted as shown. B: three line rows (lock, eye-off, shield; any delete row gated on `CONFIG.deletion`) on a white card. A renders only when `{{app_rating}}` and `{{rating_count}}` hold real store values; while either is still a token, every viewer sees B (no placeholder card, no dashed "review goes here" box).
**Microcopy:** Rating, count and reviews are unverified: route through `CONFIG` tokens, pull live from this app's own store listing, never hardcode, and never print "from real people" over an unset token (fallback = B). Review cards are real store reviews only. No press logos, no "expert", pediatrician or staff photos unless each is a real, named, credentialed person. B's "delete" row renders only when `CONFIG.deletion` is true (default off); no developer notes appear in the UI.
**CTA:** Continue

---

## D. Anticipation

### 14. Shaping the plan (loading)
**Purpose:** The wait makes the plan feel built from the answers, and gives the strongest ad frame (the blooming flower as the tangle relaxes).
**Headline A:** Shaping {{child_name}}'s calm plan…
**Headline B:** Writing your first script…
**Steps:**
1. Listening back to your answers… - 0→100%
2. Finding the hardest moment… - 0→100%
3. Writing a calm script for you… - 0→100%
4. Almost ready, your plan awaits… - 0→100%
**Visual:** The flower bud blooms in the top half, the one hero object with depth and slow 3D motion, a tangle of lines smoothing behind it. Everything else fades. Four progress rows beneath: label left, % right, check when done, thin sage bars. With no child name, "Shaping your child's calm plan…".
**Microcopy:** Chips from their answers (the situation, the goal, the age band) float up and fade. The child's name is never shown as a chip.
**CTA:** (auto-advances, ~6-8 seconds)

### 15. Calm plan and first script
**Purpose:** The personalized result: a plan and one real script, shown as ideas to try, never a verdict, label or promise. It makes the paywall's "what you get" concrete and traceable to the answers.
**Headline A:** A calm plan for {{child_name}}
**Headline B:** Your first calm script
**Body A:** Built from your answers. Change it anytime.
**Body B:** Say it once tonight. Notice how it feels.
**Visual:** Top: a plan card (flower illustration, pill "Calm plan", chips for age band, hardest moment and goal). Under it a script card labeled "Try saying" with the script in large type. Below: a vertical path of four week cards, week 1 open (the sample), weeks 2-4 titles only. Weeks are goals for the plan, labelled as such.
**Microcopy:** Scripts by situation. Meltdowns: "I can see this is really hard, {{child_name}}. I'm right here. We'll talk when you feel calmer." Bedtime: "It's almost lights-out time. Want the blue book or the green one tonight?" Homework: "Let's do ten minutes, then a break. Want to start with the easy one?" Screens: "Five more minutes, then we switch off. Want to pick the cleanup song?" Other: "I can see something is hard. Tell me, or show me, what you need." Weeks are goals, not promised outcomes (Meltdowns: "Spotting early signs" · "Staying steady first" · "Naming feelings together" · "Your calm routine"; Bedtime: "Winding down early" · "A steady last hour" · "Words for lights-out" · "Your calm routine"; Homework: "Starting small" · "Break-time deals" · "Words for stuck moments" · "Your calm routine"; Screens: "Warnings that land" · "Calm switch-offs" · "Fun swaps" · "Your calm routine"; Other: "Noticing the pattern" · "Staying steady first" · "Words for hard moments" · "Your calm routine"). Footer: "Ideas to try, not treatment or advice for your child's behavior." Never a severity score, label, diagnosis or outcome claim.
**CTA:** Continue

### 16. Save your plan (email)
**Purpose:** Captures the parent's identity so the plan and the script persist, while the result is still warm.
**Headline A:** Where should we send it?
**Headline B:** Save {{child_name}}'s plan
**Body A:** Your plan and first script, kept safe.
**Body B:** No spam. Unsubscribe anytime.
**Field:** Parent email input. Marketing opt-in checkbox, unchecked by default: "Send me tips by email (optional)".
**Visual:** White input on off-white, the small bud above the headline. "Need help now?" still visible top-right.
**Error states:** "Enter a valid email address" · "That email has an account, sign in instead?"
**Microcopy:** Legal line: "By continuing you agree to the Terms and Privacy Policy." The email is the parent's, never the child's.
**CTA:** Continue

---

## F. Monetization

### 17. Paywall (web sales page)
**Purpose:** The one ask, as a long-scroll web page. It sells the calm plan; every price and renewal term sits on the page in readable type.
**Headline A:** Your calm plan is ready
**Headline B:** Start {{child_name}}'s first calm week
**Body A:** Four weeks of scripts and small steps, made for you.
**Body B:** Price shown upfront. We remind you before renewing.
**Plans:** 1-week intro · **4-week, pre-selected** (matches the 4-week plan, ribbon "Matches your plan") · 12-week anchor. Every card shows `{{price_*}}` big and `then {{renewal_*}} / period` right under it, plus a per-week equivalent `{{week_*}}`. No percent-off badge, no struck price, no decoy.
**Visual:** Sticky brand bar with close (×) and the persistent "Need help now?" link. Sections in order: personal hero (their plan card and four fact chips: child's age band, hardest moment, goal, plan length) · plan block (cards, "Due today" row, CTA, payment badges, secure/cancel row, renewal line) · what's inside (the four weeks as a TOC) · how it works (3 steps) · proof ("What people say": rating and real store reviews only; the whole block is hidden while the values are tokens) · FAQ (is this therapy, does it treat or fix behavior, how to cancel, will I be charged again, what do you know about my child, what if I'm in crisis) · plan block again · legal. A sticky bottom CTA slides up while no plan block is visible.
**Microcopy:** Each stat or review is gated on a real value (not a `{{token}}`); no dashed placeholders are shown. Under the CTA at body size: "Renews at {{renewal_4w}} every 4 weeks until you cancel. Cancel anytime in your account." Reminder line: "We'll email you before every renewal." No guarantee or refund block is shown until `{{refund_days}}` and its full terms exist (gated on tokens). Always shown: "Crisis resources are always free." Not shown on this page: timers, promo codes, "no charge yet" wording, usage counters, behavior-change or health-outcome claims.
**Fallback offer:** #18 (a smaller one-time pack, not a cheaper copy of a tier). Every way off this page without paying (× and "Not now") goes to #18 first, once per session. Declining it, or closing the paywall a second time, leads to #19 in free mode.
**CTA:** Start my plan

### 18. A smaller step (one-time offer, shown on close)
**Purpose:** A second, softer chance for parents who closed #17 because a subscription felt like a lot: a genuinely smaller product, paid once. Shown once, never after crisis language.
**Headline A:** A smaller step, together
**Headline B:** Start with five scripts
**Body A:** Five calm scripts, paid once. No subscription.
**Body B:** Nothing to cancel. Just the scripts.
**Plans:** One offer card, a different and smaller product than every #17 tier: `{{offer_name}}` (demo: "Starter script pack"), `{{offer_price}}` paid once, no renewal, no strike-through price, no comparison to the plans. Includes: 5 calm scripts for the hardest moment (one a day), the plan summary saved to the parent's email, a reminder at 6:00 p.m. Not included (stated on the card): the 4-week plan, daily scripts, asking Calmio for a new script. Optional `{{offer_badge}}`. Buying it unlocks only the 5 scripts in #19; the rest stays behind the subscription.
**Visual:** Same web look as #17: sticky bar with close ×, Calmio wordmark and "Need help now?". Centered eyebrow "One-time offer · shown once", one sage-bordered card with a calm thumbnail, pack name, price row ("{{offer_price}} paid once"), 3 checks, a "Not included" line, CTA, payment badges and a "paid once, nothing to cancel" line. Below: "Crisis resources are always free."
**Microcopy:** Price line at body size: "{{offer_price}} paid once. No renewal, nothing to cancel." No timer: `CONFIG.offer.expiresMin` stays null, and there is no "last chance", "offer ends" or "don't miss out" wording. Never shown after crisis language in any free-text field. Merely opening "Need help now?" does not suppress it. Decline link: "No thanks, keep the free script". Events: `offer_view`, `offer_accept` + `checkout_click`, `offer_decline`.
**CTA:** Get the script pack

---

## G. Payoff

### 19. Tonight's first script
**Purpose:** Close the loop and drop the parent into the first real script, so the first session ends inside the product.
**Headline A:** You're set for tonight
**Headline B:** Welcome in. Try tonight's script.
**Body A:** Say it once tonight. Come back and tell Calmio.
**Body B:** Come back anytime. Calmio is here.
**Visual:** Calm garden photo header fading to off-white, the 3D flower fully open as the hero. A "Tonight's script · 2 min" card with the script from #15, a reminder row (toggle off by default) "Remind me at 6:00 p.m.", tab bar below (Today, Ask, Journal, Me).
**Microcopy:** Subscribers get the full plan and week 1. Free mode shows the one script and a quiet "Unlock your plan" row, never a pop-up. No rating prompt here; ask only after a completed script on day 3 or later. Reminder push text carries no topic words (no child's name, no "meltdown", no "bedtime"), max one a day, no guilt.
**CTA:** Start tonight's script

---

## Notes

- **Archetype call.** Plan subscription after a data quiz -> personalization-quiz, Calmio variant (see Known variants in `archetypes/personalization-quiz.md`). Skipped from the default: decoy tier, countdown upsell, before/after screen, separate premium-preview screen (the plan and script on #15 do that job), gamified wheel, a live chat before the paywall (the real script on #15 replaces it).
- **Parent is the user, child is data-minimized.** The only things collected about the child are a first name (#12, skippable) and an age band (#5). Parent data: birth year for the 18+ gate (#3) and email (#16). No child photo, surname, school, birthday, diagnosis, medication or health question anywhere. Legal and privacy review should cover how child-related data is described under children's-privacy rules (COPPA/GDPR-K), even though the user is the adult.
- **No behavioral-treatment claims.** The plan and scripts are ideas to try, not therapy, not a diagnosis, not advice about a child's behavior or development. Weeks are goals derived from answers, not promised outcomes. No "stop tantrums", "fix behavior" or "your child will..." copy anywhere, including ads.
- **Mental-health safety, built in.** "Need help now?" on all 19 screens and on the web paywall and offer bars · expectations screen (#4) before any question about the child · crisis detection on every free-text field (#6, #8, #9, #11), including language about harming a child or oneself, which opens the support sheet with human help first · minors blocked with youth resources (#3) · no medication, diagnosis or therapy-history questions · no clinical labels, scores or gauges. Crisis help is never behind the paywall. Clinical and legal review should cover #3, #4, #15 and the support sheet, including non-US helplines and whether the Childhelp line fits each market.
- **Competitor mechanics - reference only, NOT implemented:** "fix your child's behavior" and diagnosis-adjacent framing, fake pediatrician or psychologist bylines, "% of parents" stats, personalised promo codes, countdown timers, scratch-card discount, discount against a never-charged anchor, renewal far above the intro price.
- **Plans are placeholders.** The structure (1-week / 4-week pre-selected / 12-week anchor) mirrors the competitor layout. All prices are `{{price_*}}` / `{{renewal_*}}` tokens; the offer is a separate one-time SKU (`{{offer_price}}`, no renewal) to be created in the store. The real Calmio store lists 1-month and 3-month SKUs (see `mental-health/calmio`); align SKUs before launch. Renewal is shown beside every price and a pre-renewal email is promised, so it must be built.
- **Unverified.** The Leaply flow, screen order and copy (inferred, see intro) · Calmio's real in-app scripts feature and the free-tier scope (the demo assumes one script stays free) · the app-store rating, reviews and any refund window. Those blocks are placeholders behind tokens and hidden until real values exist. The scripts and week titles are our own draft and need review by a qualified child-development professional before launch. **Privacy copy is unverified:** "You choose what you share" and "Sharing is always your choice" are not confirmed by product; the "delete your data/chats anytime" row is hidden unless `CONFIG.deletion` is true (only when in-app deletion exists).
- **Drop-off risk:** #3 age gate · #5-9 five taps in a row before any value · #16 email · #17 paywall. Keep #14 at 6-8 s.
- **Measure separately:** paywall CVR at #17 · offer CVR at #18 (apart from #17) · free-mode to subscribe later · D1/D7 return at the reminder time · refund and chargeback rate (the honesty metric).
- **A/B first:** (1) #1 "Calmer evenings with your kid" vs "Hard evenings? Try a calm line." (2) #15 with vs without the four-week path. (3) #10 bridge present vs removed. (4) #17 4-week pre-selected vs 12-week pre-selected.
- **Demo (private Artifact):** https://claude.ai/artifact/YNcSfTiLMi7SQ7BocPP1zT
