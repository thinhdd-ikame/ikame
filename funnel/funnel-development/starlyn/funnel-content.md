---
niche: starlyn
display_name: Starlyn (Astrology - daily line, birth chart, compatibility)
archetype: personalization-quiz
subject: person
input: name, birth date, birth time (optional), birth place, focus areas, optional second person
output: Big Three reveal (Sun, Moon, Rising) + a personalized daily line
screens: 21
monetization: soft subscription paywall (weekly trial / monthly / yearly pre-selected) + consumable question packs
creative_screens:
  hook-a: 1
  hook-b: 2
  hook-c: 3
  sun-sign: 8
  reveal: 15
motion: >
  a quiet gold reveal on deep navy - chart-wheel rings drawing in, planets
  settling into place one by one, a single line of text typing itself out
---

# Funnel Content — Starlyn

Starlyn is a plain-words astrology app: a one-sentence daily reading with do/don't lists, a birth chart explained without jargon, compatibility with people you add, and paid questions where the price is always shown first. The user gives name, birth date/time/place and a few preferences, and gets their Big Three plus a personalized Today screen. It's the **personalization-quiz** archetype (same family as `nebula/`), but Starlyn's brand promises change the back half. The app has a guest mode, so there is no hard account gate. The Big Three is revealed free before the paywall, so the paywall sells depth (week/month, full chart, compatibility, questions), not access. The paywall can be dismissed from the first frame. There is no countdown upsell, because the app's store page literally says "No timers. No per-minute billing. Ever." There are also no invented stats. 21 screens. Pricing, copy tone and the visual system come straight from `starlyn-design/starlyn.pen` (tokens `$bg #0B0A18`, `$accent #E9C26B`, serif display headlines, lucide stroke icons). This overrides the repo's default purple/pink look. Screens that already exist in the .pen are referenced by their SCR id.

---

## A. Hook

### 1. Hook A — Your day
**Purpose:** Lead with the daily loop, the product's core habit and its most concrete promise.
**Headline A:** Your day, in one line.
**Headline B:** One sentence. Every morning.
**Body A:** Plus what to do — and what to skip today.
**Body B:** Guidance you can use before your coffee.
**Visual:** SCR-ONB-01 layout: Art/Sky band top half, serif Display headline, a floating Today card below it ("Say the boring, specific version…") with Do/Don't chips. Gold primary button pinned bottom.
**Microcopy:** Under CTA (Caption): "We only use your birth details to build your chart."
**CTA:** Get started

### 2. Hook B — Plain words
**Purpose:** Answer the biggest objection for newcomers: astrology feels like jargon.
**Headline A:** Your chart, in plain words.
**Headline B:** Astrology, minus the jargon
**Body A:** Sun, Moon, Rising and every placement — explained simply.
**Body B:** No degrees or houses to decode. Just you.
**Visual:** C · Chart wheel centered, planets lighting up one at a time; three placement rows fade in below ("Where you take up space without trying").
**CTA:** Continue

### 3. Hook C — Honest pricing
**Purpose:** The differentiator against Nebula-style apps. Name the fear (meters, timers) and remove it before any ask.
**Headline A:** You see the price first.
**Headline B:** No timers. No per-minute billing.
**Body A:** Ask real questions. No meter running, ever.
**Body B:** Your saved readings stay yours, even without Premium.
**Visual:** Cropped SCR-ASK-01 Empty: composer with the line "This uses 1 of your 3 questions." highlighted in `$accent-dim`.
**Microcopy:** Small badge above headline: "3 free questions to start"
**CTA:** Continue

---

## B. Investment

### 4. Focus areas
**Purpose:** Cheap multi-select first tap. It maps 1:1 to the four life-area scores on Today, so the answer visibly shapes the output.
**Headline A:** Where do you want clarity?
**Headline B:** What's on your mind lately?
**Body A:** Pick any. They'll lead your Today screen.
**Body B:** Choose all that apply — change it any time.
**Options:**
- ❤️ Love
- 💼 Career
- 🏡 Family
- 🌿 Health
- ✏️ Something else
**Field:** Multi-select, min 1 to enable CTA; "Something else" opens a one-line input
**Visual:** Stacked `$surface` rows with a life-area colour dot (`$love`, `$career`, `$family`, `$health`); selected row gets a gold border + check.
**Microcopy:** Disabled-CTA hint: "Pick at least one"
**CTA:** Continue

### 5. Experience level
**Purpose:** Second cheap tap. Decides whether the chart shows the "New to charts? Start here" card and how much each placement explains.
**Headline A:** How well do you know astrology?
**Headline B:** New to birth charts?
**Body A:** No wrong answer — we'll match the depth.
**Body B:** We'll explain as much as you want.
**Options:**
- 🌱 Totally new
- ☀️ I know my sign
- 🌙 I know my Big Three
- 🔭 I read charts
**Field:** Single-select, auto-advance on tap
**Visual:** Same row style as #4, one lucide icon per row in a small icon well.
**CTA:** (auto-advances on selection)

### 6. Name
**Purpose:** Captures `{{name}}`. Every later screen and the Today greeting uses it.
**Headline A:** What should we call you?
**Headline B:** First, your name
**Body A:** We'll use it in your readings.
**Body B:** First name is plenty.
**Field:** Field/Text, placeholder "Your name", max 30 chars, keyboard opens on load
**Visual:** Single field on `$bg`, sky band faded behind the headline.
**Error state:** "Add a name to continue"
**CTA:** Continue

### 7. Date of birth
**Purpose:** First real data input. It also unlocks the instant Sun-sign reward on the next screen.
**Headline A:** When were you born?
**Headline B:** Tell us when you arrived
**Body A:** Your date finds your Sun sign.
**Body B:** The day you arrived sets your core.
**Field:** Field/Picker → date wheel (month / day / year); age gate at the app's store age rating
**Visual:** Date wheel in a `$surface` sheet, gold selection band.
**Error state:** "Pick a full date to continue"
**CTA:** Continue

### 8. Sun sign (bridge)
**Purpose:** Pays the user back right after the first hard input, a micro-reveal instead of a generic "every answer counts" screen. It also frames the two harder inputs ahead.
**Headline A:** {{name}}, you're a {{sun_sign}}.
**Headline B:** Your Sun is in {{sun_sign}}
**Body A:** Two more details find your Moon and Rising.
**Body B:** Time and place decide your Rising sign.
**Visual:** Chart wheel with only the Sun glyph lit in gold, sign glyph large in the center, other planets dim. Soft glow pulse once on load.
**Microcopy:** One-line trait under the headline, e.g. "Leo — you take up space without trying."; progress hint: "1 of 3 details done"
**CTA:** Continue

### 9. Time of birth
**Purpose:** The biggest drop-off cliff. The skip link has to feel like a normal choice, not a failure.
**Headline A:** What time were you born?
**Headline B:** Know your birth time?
**Body A:** Time decides your Rising sign.
**Body B:** A birth certificate or family can tell you.
**Field:** Field/Picker → time wheel + text link "I don't know my birth time"
**Visual:** Time wheel sheet; clock-face ring around the chart wheel with the Rising slot outlined.
**Skip link:** "I don't know my birth time"
**Microcopy:** Shown after skip: "No problem — we'll leave Rising open. We never guess it."
**CTA:** Continue

### 10. Place of birth
**Purpose:** Completes the chart inputs; reuses the existing place-search sheet.
**Headline A:** Where were you born?
**Headline B:** Your birth city, please
**Body A:** City and country is enough.
**Body B:** Location fine-tunes your Rising and houses.
**Field:** Search field → SCR-ONB-02 place search sheet (autocomplete, "City, country")
**Visual:** Field on `$bg`, results list in a bottom sheet, map-pin icon.
**Error state:** "We couldn't find that place. Try a nearby city."
**Microcopy:** "We never share these."
**CTA:** Continue

---

## C. Trust

### 11. Your details stay yours
**Purpose:** Trust beat right after the three hardest inputs. For astrology the fear is data misuse and scare tactics, so answer that before asking for anything else.
**Headline A:** Your details stay yours.
**Headline B:** Rated {{app_rating}}★ by real readers
**Body A:** Used only to build your chart. Never shared or sold.
**Body B:** Plain words, no scare tactics, no hidden charges.
**Visual:** Art/Icon well with a lock icon, three short promise rows beneath (lock · no-timer · bookmark icons). Variant B: star row + one quote card.
**Microcopy:** Promise rows: "Never shared or sold" / "No timers, no per-minute billing" / "Saved readings stay free, for good". Quote card (B only): real App Store review ≤15 words with first name + age. **Fill `{{app_rating}}` and the quote from real store data only. Ship variant A until real reviews exist.**
**CTA:** Continue

---

## B. Investment (continued)

### 12. Someone on your mind
**Purpose:** Seeds the People feature. A named second person makes the compatibility tease (#17) personal, and that's the strongest paywall trigger this app has.
**Headline A:** Anyone you want to check?
**Headline B:** Who's on your mind?
**Body A:** We'll show how you two actually fit.
**Body B:** Add one person now, or skip it.
**Options:**
- 💞 Partner
- ✨ Crush
- 🤝 Friend or family
- 🙂 Just me for now
- ✏️ Someone else
**Field:** Single-select; "Just me for now" skips #13
**Visual:** Row style as #4; two overlapping initial avatars (M + ?) above the headline.
**CTA:** Continue

### 13. Their details (conditional)
**Purpose:** Minimum data for a compatibility score. Name + birthday only; time and place are optional.
**Headline A:** Tell us about them
**Headline B:** Who are they?
**Body A:** A name and birthday are enough to start.
**Body B:** Birth time is optional — add it later.
**Field:** Reuses SCR-COMP-02 Add person form: Name (text), Date of birth (picker), collapsed "Add time and place" row. Captures `{{person}}`.
**Visual:** Compact form on `$bg`, the second avatar fills with their initial as they type.
**Error state:** "Add their name and birthday"
**Skip link:** "I'll add them later"
**Microcopy:** "They won't be notified."
**CTA:** Continue

---

## D. Anticipation

### 14. Building your chart (loading)
**Purpose:** Makes the chart feel calculated, not canned. It's also the best ad-creative screen in the flow.
**Headline A:** Placing your planets, {{name}}…
**Headline B:** Building {{name}}'s chart…
**Steps:** (4 rows, each with % counter, checkmark, progress bar)
- Finding where your Sun sat…
- Tracing your Moon's inner weather…
- Locating your Rising at birth… *(no birth time: "Leaving Rising open for now…")*
- Writing your first day, plainly…
**Visual:** SCR-ONB-03 Loading: chart-wheel rings draw in, planets drop into place one by one in gold; progress rows beneath. No fake testimonials, keep the screen calm.
**CTA:** (auto-advances, ~6-8 seconds)

---

## G. Payoff (free layer)

### 15. Your Big Three (reveal)
**Purpose:** Delivers real value before any ask. It proves the plain-words promise and earns the paywall. Deliberately *not* gated (see Notes).
**Headline A:** Here you are, {{name}}.
**Headline B:** Meet your Big Three
**Body A:** Your Sun, Moon and Rising, in plain words.
**Body B:** Tap any one to read more.
**Visual:** SCR-ONB-03 Reveal: full chart wheel top, three placement cards below (Sun / Moon / Rising, icon + one-line meaning). Use S50 variant when birth time is unknown.
**Microcopy:** Card lines: "Your core — how you take up space" / "Your inner weather" / "The door people walk through first". Unknown-time card: "Rising needs your birth time. Add it any time — we never guess it."
**CTA:** Show me today

---

## D. Anticipation (retention + desire)

### 16. Morning line (notification opt-in)
**Purpose:** Locks in the daily open. The push *is* the product (the sentence itself), which is the honest pitch for the permission.
**Headline A:** Your day, every morning at 8.
**Headline B:** Get your line each morning
**Body A:** One push with today's sentence — not a nudge.
**Body B:** The guidance itself, right on your lock screen.
**Field:** Time chip, default 8:00 AM (tap to change); system permission prompt follows CTA
**Visual:** FLOW-NOTIFY pre-permission sheet over the dimmed reveal; lock-screen mock with one sample push.
**Microcopy:** Sample push: "☀️ Say the boring, specific version of what you want today."
**CTA:** Turn on
**Skip link:** "Not now"

### 17. What's waiting (tease)
**Purpose:** Shows the locked depth that's *specific to this user* right before the ask. Two paths: with a person (compatibility) or solo (week ahead).
**Headline A:** You + {{person}}: {{score}}/100
**Headline B:** Your week is already written
**Body A:** One area is open. Four more are waiting.
**Body B:** Today's free. Tomorrow, week and month are Premium.
**Visual:** A = SCR-COMP-03 Free layout: score ring, "Love & attraction" open, 4 areas under GC-03 premium lock blur. B = SCR-HORO-01 period picker with Week/Month tabs locked over blurred text.
**Microcopy:** Path rule: A if #13 was completed, else B. Footnote: "Anything you unlock stays readable for good."
**CTA:** See what's inside

---

## E. Gate (soft)

### 18. Save your chart
**Purpose:** Ties chart, Premium and question balance to an account before the purchase. It's skippable because the app fully supports guest use.
**Headline A:** Keep your chart safe
**Headline B:** Save {{name}}'s chart
**Body A:** Sign in so it follows you to a new phone.
**Body B:** One tap. Premium and questions come too.
**Field:** GC-01 Provider Apple "Continue with Apple" + "Continue with Google"
**Visual:** Mini chart wheel with the user's Big Three glyphs, two provider buttons stacked, minimal chrome.
**Microcopy:** Legal line: "By continuing, you agree to our Terms & Privacy Policy"
**Skip link:** "Continue as guest"
**CTA:** Continue with Apple

---

## F. Monetization

### 19. Paywall
**Purpose:** Primary ask: a soft paywall selling depth. Close button visible from the first frame; dismiss lands on Today with the free layer intact.
**Headline A:** Go deeper with Premium
**Headline B:** {{name}}, see your whole week
**Body A:** See your week and month, not just today.
**Body B:** Every placement, every area, five questions monthly.
**Plans:** (real prices from SCR-IAP-01)
- **Weekly** — $4.99 / week · 3-day free trial
- **Monthly** — $9.99 / month, no badge
- **Yearly** — pre-selected, "SAVE 50%" badge, $59.99 / year with "$5.00 a month" shown small
**Visual:** SCR-IAP-01 Default: close ✕ top-left, hero art, four check rows, GC-09 plan cards (Sub Selected on Yearly), gold CTA.
**Microcopy:** Benefit rows: "Yesterday, tomorrow, weekly and monthly readings" / "Every placement in your birth chart" / "All 5 compatibility areas, up to 20 people" / "5 questions every month". Fine print: "Renews automatically. Cancel any time in the App Store." Links: Restore purchases · Terms of Use · Privacy Policy. When Weekly is selected, the CTA line reads "Free for 3 days, then $4.99/week."
**Fallback offer:** On ✕, one bottom sheet, once per install: "Try 3 days free", then "$4.99/week after, cancel any time" in the same type size as the offer. Buttons: "Start free trial" / "Not now" → Today.
**CTA:** Continue

---

## G. Payoff (daily loop + second revenue layer)

### 20. Today (first open)
**Purpose:** First real Today screen, weighted by the focus areas from #4. This is the habit the whole funnel is selling.
**Headline A:** Good morning, {{name}}.
**Headline B:** Here's your day, {{name}}.
**Body:** The generated line itself, e.g. "Say the boring, specific version of what you want."
**Visual:** SCR-HOME-01 Today: Big Three header chips, Today-at-a-glance card with Do/Don't, four life-area scores ordered by #4 picks, face-down tarot card "Tap to reveal", Ask card with "3 left".
**Microcopy:** One-time coach mark on the scores: "Your focus areas come first. Change them in Me."
**CTA:** Read more

### 21. First question
**Purpose:** Introduces the second revenue layer (question packs) at peak trust. It starts with free questions, so the first use costs nothing and the pricing model stays visible.
**Headline A:** Ask your first question
**Headline B:** Got a real question?
**Body A:** You have 3 free. You'll always see the price.
**Body B:** Ask about your week, your chart, or {{person}}.
**Visual:** SCR-ASK-01 Empty: suggestion chips, with one personalized chip first ("Why do we keep clashing, {{person}}?" or, solo, "What should I focus on this week?"); composer at bottom.
**Microcopy:** Composer line: "This uses 1 of your 3 questions." Packs (only shown once free questions run out, SCR-IAP-02): 5 for $2.99 · 10 for $4.99 "MOST POPULAR" · 25 for $9.99, "Questions never expire." Premium note: "Premium includes 5 questions every month."
**CTA:** Ask
**Skip link:** "Maybe later"

---

## Notes

- **What changed from the existing onboarding in the .pen:** today it's Intro → one birth-data form → loading → reveal → notify (S03–S10). This funnel splits the form into single-question screens (#6, #7, #9, #10), adds three cheap taps (#4, #5, #12) and the Sun-sign micro-reveal (#8), and adds a tease + soft sign-in + paywall between the reveal and Today. New screens to design: #1–#3 hook variants, #4, #5, #8, #11, #12, #17, #18, #19's fallback sheet.
- **Deliberate deviations from `personalization-quiz`:**
  - **No hard gate.** The app has a working guest mode, so a forced account wall would contradict the product.
  - **Big Three before the paywall.** Starlyn is freemium, so the free reveal is the proof and the paywall sells depth.
  - **No countdown upsell.** The store listing promises "No timers", so a timer anywhere in the funnel breaks the brand's core claim.
  - **No gender or relationship-status questions.** Nothing in the output uses them.
  - **One trust interstitial instead of two,** because the paywall's own trust copy covers the second beat.
- **No invented numbers.** `{{app_rating}}`, review quotes and any "X people" stat must come from real store/analytics data. Until then, ship #11 variant A (privacy promises), which needs no numbers.
- **Drop-off risk:** #9 birth time (mitigated by the brand-true "we never guess it" skip), #13 their details (skippable), #18 sign-in, #19 paywall.
- **Two monetization layers, two metrics:** subscription conversion at #19 (+ fallback trial take-rate) is one number. Question-pack revenue (first pack purchase rate, packs per payer) is separate and should be measured from #21 onward, never folded into paywall CVR.
- **Branching:** #13 and #17A exist only on the person path. Track the funnel for both paths, since the compatibility tease is expected to convert better than the solo week tease.
- **A/B first:** (1) #18 before vs. after the paywall. (2) #8 Sun-sign bridge on vs. off, to measure its lift on #9–#10 completion. (3) #19 Headline A vs. B. (4) #17 person path vs. solo path conversion, to decide whether #12 should be pushed harder.
