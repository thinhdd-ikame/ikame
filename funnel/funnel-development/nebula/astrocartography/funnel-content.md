---
niche: astrocartography
display_name: Nebula - Astrocartography Power Places Map (web2app)
archetype: personalization-quiz
subject: person
input: feeling about current city, life goal, name, birth date, birth time (optional, strongly encouraged), birth place, current city, optional place that felt right, move intent, setting, regions
output: personal astrocartography map - planetary lines worldwide, current-city read, top 3 power places for the chosen goal
screens: 24
monetization: web paywall (weekly / 3-month decoy / annual pre-selected, renewal shown on every card) + optional one-time single-city report for movers
creative_screens:
  hook-a: 1
  hook-b: 2
  city-lines: 11
  felt-right: 19
  reveal: 17
  map: 23
motion: >
  a dark globe turning slowly as coloured planetary lines trace across it
  pole to pole, then city pins pinging awake along the lines one by one
---

# Funnel Content — Nebula · Astrocartography

A web2app funnel (Meta ad → web quiz → web paywall → Nebula app) for the fastest-growing astrology niche. AdSpyLab counted 26.5K astrocartography ("bản đồ sao") ads in 03-08/2026, up 374% over the last three months. The user gives birth data, their current city and a life goal. They get a map of their planetary lines, a read on the city they live in now, and their top power places for that goal. It's the **personalization-quiz** archetype, but the inputs and reveal are built around geography. **Modeled on:** Hint `hint.app/astro-map` (45 screens, ~20 feelings-about-place questions, then a scare beat, "challenging planetary lines crossing places you've lived", then a "93% promo code", then a €1 paywall) and Astroline's `astrocartography_wr` "wrong place" quiz (14 steps, a fake "forecast accuracy 22%→67%" meter, color and element filler questions, ending in a palm photo). **What I deliberately changed:**

- Kept the "wrong city?" angle as the first tap.
- Cut the quiz to inputs the map actually uses: goal ranks the lines, current city gets its own read, and setting, region and move intent filter the recommended cities.
- Added an optional "a place that felt like you" input, which gives a checkable aha moment (#19).
- The birth-time screen honestly explains that one hour moves the lines about 1,000 miles.
- Replaced the fear beat with a neutral "N lines pass near your city".
- Dropped the fake accuracy meter, colors, elements, relationship status and the palm photo, because the map uses none of them.
- No promo code, countdown or ticker. Renewal price on every card.

The visual system is the base `nebula/` house look, with the globe as the single 3D hero object. 24 screens.

---

## A. Hook

### 1. Hook A — Wrong city? (first tap)
**Purpose:** Matches the "are you living in the wrong place?" ad on the very first screen. The answer also sets the tone of the current-city read.
**Headline A:** Living in the wrong city?
**Headline B:** Does your city feel right?
**Body A:** Your birth chart draws lines across the world.
**Body B:** Some places fit your chart better than others.
**Options:**
- 🏡 Feels like home
- 😐 Something's missing
- 😔 I feel stuck
- 🧳 Not my place
**Field:** Single-select, auto-advance; sets `{{city_feeling}}`
**Visual:** Dark sky, 3D globe (hero) turning slowly with three glowing coloured lines crossing it; a small pulsing dot where the user is (IP-level, city only). Four gradient pills below.
**Microcopy:** Under options: "3-minute quiz · For entertainment". Legal line: "By continuing, you agree to our Terms & Privacy Policy"
**CTA:** (auto-advances on selection)

### 2. Hook B — Your chart has a map
**Purpose:** Explains astrocartography in one screen for people new to it, so later questions make sense.
**Headline A:** Your chart has a map
**Headline B:** Every planet touches Earth somewhere
**Body A:** Where a planet's line falls, its energy is strongest.
**Body B:** Find where love, work and calm come easier.
**Visual:** Flat world map; four planetary lines fade in one after another (Venus rose, Jupiter gold, Sun amber, Moon silver), each with a legend chip. Fades only, no 3D.
**Microcopy:** Legend: "♀ Venus — love · ♃ Jupiter — growth · ☉ Sun — recognition · ☽ Moon — home"
**CTA:** Find my places

---

## B. Investment

### 3. Life goal
**Purpose:** The main ranking input. It decides which lines lead the map and which cities become the top 3.
**Headline A:** What should a place give you?
**Headline B:** What are you looking for?
**Body A:** Your map ranks places by this first.
**Options:**
- ❤️ Love
- 💼 Career
- 🌱 Growth
- 🕊️ Peace
- 🏡 Belonging
- ✏️ Other
**Field:** Single-select, auto-advance (Other opens input + Continue); sets `{{goal}}` → `{{goal_planet}}`
**Visual:** 4-6 large cards with a glowing icon each, purple border on select.
**CTA:** (auto-advances on selection)

### 4. Your line (bridge)
**Purpose:** Teaches one fact tied to the user's own answer, so the quiz feels like it's already working.
**Headline A:** {{goal}} follows your {{goal_planet}} lines
**Headline B:** Your {{goal_planet}} line matters most
**Body A:** We'll find where those lines cross livable cities.
**Visual:** Map with only the matching planet's lines lit and the others dim; a slow trace animation along one line.
**Microcopy:** Mapping: Love → Venus · Career → Sun & Jupiter · Growth → Jupiter · Peace → Moon & Venus · Belonging → Moon · Other → all lines, ranked by chart
**CTA:** Continue

### 5. Name
**Purpose:** Captures `{{name}}` for the map title and later screens.
**Headline A:** What's your name?
**Headline B:** Whose map is this?
**Body A:** We'll put it on your map.
**Field:** Text input, placeholder "Your first name", max 30 chars
**Visual:** Plain white input; a small map card above shows "{{name}}'s map" as they type.
**Error state:** "Add your name to continue"
**CTA:** Continue

### 6. Date of birth
**Purpose:** First real input. It places every planet, so the lines start to exist.
**Headline A:** When were you born?
**Headline B:** Your birthday, {{name}}?
**Body A:** Your date places each planet on the map.
**Field:** Date wheel (month / day / year); age gate 18+
**Visual:** Plain date wheel on the star field.
**Error state:** "Pick a full date to continue" / "You must be 18 or older to continue"
**CTA:** Continue

### 7. Time of birth
**Purpose:** Matters more here than in any other astrology niche, because lines shift with every minute. We say so honestly, which motivates the input without scaring, and the skip still gives a real (wider) result.
**Headline A:** What time were you born?
**Headline B:** Know your birth time?
**Body A:** One hour off moves your lines ~1,000 miles.
**Body B:** Exact time draws exact lines.
**Field:** Time wheel. On skip, a follow-up chip row: 🌅 Morning · ☀️ Afternoon · 🌆 Evening · 🌙 Night · 🤷 No idea
**Visual:** Time wheel sheet; behind it a line on the map shifting sideways as the wheel scrolls.
**Skip link:** "I don't know my birth time"
**Microcopy:** Shown after skip: "No problem — we'll show wider bands, not exact lines. Add your time later to sharpen them."
**CTA:** Continue

### 8. Place of birth
**Purpose:** Completes the chart. It anchors every line.
**Headline A:** Where were you born?
**Headline B:** Your birth city, please
**Body A:** Your birthplace anchors every line.
**Field:** City search with autocomplete ("City, country")
**Visual:** Search field, pin dropping on a stylized map.
**Error state:** "We couldn't find that place. Try a nearby city."
**Microcopy:** "We never share or sell your details."
**CTA:** Continue

---

## C. Trust

### 9. Real sky math
**Purpose:** Trust beat after the three hardest inputs. In this niche the doubt is "is this made up?", so show how the lines are calculated.
**Headline A:** Real sky math, not guesses
**Headline B:** {{map_count}} maps drawn so far
**Body A:** Lines come from planet positions at your birth.
**Body B:** People use their map to plan moves and trips.
**Visual:** A column of planet positions (degrees) morphing into lines on the map; three promise rows beneath. Variant B: huge stat number, star row, one quote card.
**Microcopy:** Promise rows: "Calculated from astronomical data" / "Your details never sold" / "Price shown before you pay". **`{{map_count}}` and quotes come from real ikame data only. Ship A until then.**
**CTA:** Continue

---

## B. Investment (continued) — where you are, where you'd go

### 10. Current city
**Purpose:** The input behind the ad's promise. Without it we can't answer "wrong city?".
**Headline A:** Where do you live now?
**Headline B:** Your city right now?
**Body A:** We'll check which lines run near it.
**Field:** City search; "Use my location" button (city-level only, browser permission)
**Visual:** Search field; map zooms toward the chosen city once selected.
**Error state:** "We couldn't find that city. Try a nearby one."
**Microcopy:** "City only. We never store your address."
**CTA:** Continue

### 11. Lines near your city (bridge)
**Purpose:** Micro-reveal that answers part of the ad's question right away. It's neutral on purpose, with no "challenging lines" scare copy.
**Headline A:** {{line_count}} lines pass near {{current_city}}
**Headline B:** {{current_city}} is on your map
**Body A:** Your map shows what each one means there.
**Visual:** Map zoomed on the current city, N short line segments passing near the pin, colours greyed until unlocked.
**Microcopy:** "Most cities carry mixed lines. No place is 'bad'." Progress hint: "4 quick questions left". Rule: if `{{line_count}}` = 0, Headline becomes "{{current_city}} sits between your lines", which is true and still intriguing.
**CTA:** Continue

### 12. A place that felt right (optional)
**Purpose:** Optional input that powers the aha screen (#19): "here's why that place felt like you".
**Headline A:** A place that felt like you?
**Headline B:** Ever felt instantly at home?
**Body A:** We'll show which line was working there.
**Field:** City search; sets `{{felt_place}}`
**Visual:** Search field over a faint travel-postcard collage.
**Error state:** "We couldn't find that place. Try a nearby city."
**Skip link:** "Can't think of one"
**CTA:** Continue

### 13. Moving or curious?
**Purpose:** Sets the map mode: relocation (livable cities, city report upsell) vs. travel (trip spots).
**Headline A:** Moving, or just curious?
**Headline B:** What's the plan?
**Body A:** This decides if we show moves or trips.
**Options:**
- 📦 Planning a move
- 💻 Could work remotely
- ✈️ Planning trips
- 🔭 Just curious
**Field:** Single-select, auto-advance; sets `{{move_intent}}`
**Visual:** Stacked pills.
**CTA:** (auto-advances on selection)

### 14. Your setting
**Purpose:** Filters the top 3 cities to places the user would actually live in or visit.
**Headline A:** Which setting feels like you?
**Headline B:** Where do you come alive?
**Body A:** Your top places will match this vibe.
**Options:**
- 🌆 Big city
- 🏖️ Coast
- ⛰️ Mountains
- 🌳 Small town
- ✏️ Other
**Field:** Single-select, auto-advance (Other opens input + Continue)
**Visual:** 4 image-backed cards (skyline, beach, peaks, village) with dark overlay.
**CTA:** (auto-advances on selection)

### 15. Region
**Purpose:** Filters the top-3 ranking for a mostly-US audience. Without it, "your power place is Ulaanbaatar" loses people.
**Headline A:** Where in the world?
**Headline B:** Any region in mind?
**Body A:** Pick any. We'll rank places there first.
**Options:**
- 🌎 Americas
- 🌍 Europe & Africa
- 🌏 Asia & Pacific
- 🗺️ Anywhere
**Field:** Multi-select, ≥1; "Anywhere" clears the others
**Visual:** Stacked pills; the matching map region glows as each is picked.
**Microcopy:** "Your full map still covers the whole world."
**CTA:** Continue

---

## D. Anticipation

### 16. What your map shows (preview)
**Purpose:** Names the deliverable before the wait, so the loading screen and the paywall both sell something concrete.
**Headline A:** Here's what your map shows
**Headline B:** Your map, {{name}}
**Body A:** Built from your chart and your answers.
**Visual:** 4 icon benefit rows on dark with gold/purple glow, a small map thumbnail above.
**Microcopy:** Rows: "🗺️ All your planetary lines, worldwide" / "📍 Top 3 power places for {{goal}}" / "🏙️ What {{current_city}} brings you" / "✈️ Best times to visit, in the app"
**CTA:** Build my map

### 17. Mapping your lines (loading)
**Purpose:** Makes the map feel calculated for this user. This is the strongest ad-creative screen.
**Headline A:** Mapping your lines, {{name}}…
**Headline B:** Drawing {{name}}'s map…
**Steps:** (4 rows, each with % counter, checkmark, progress bar)
- Placing your planets at birth…
- Drawing your lines around the globe…
- Checking what runs near {{current_city}}…
- Ranking places for {{goal}}… almost there
**Visual:** Hero top half: 3D globe turning, coloured lines tracing pole to pole, city pins pinging along them. Progress rows beneath. No scare "insight" card at 100%.
**Microcopy:** Small line: "For entertainment". Testimonials only if real.
**CTA:** (auto-advances, ~8 seconds)

### 18. Your map is ready (tease)
**Purpose:** Shows the whole map and one real result (the line nearest home), so the paywall unlocks the specifics (city names, meanings), not a blank.
**Headline A:** {{name}}, your map is ready
**Headline B:** Your lines are drawn
**Body A:** One line near home is open. Three places wait.
**Visual:** Flat map with all coloured lines visible and city labels blurred; unlocked card for the current city; three blurred "power place" cards showing only region and line colour.
**Microcopy:** Free card sample: "Near Chicago: your Moon line — home, roots, feeling settled." Locked rows: "Top 3 power places" / "What every line means for you" / "Your full {{current_city}} read". Footnote: "For entertainment."
**CTA:** See my places

### 19. Why it felt right (conditional)
**Purpose:** The checkable aha moment. It confirms a memory the user already has, which builds more trust than any stat.
**Headline A:** Why {{felt_place}} felt right
**Headline B:** {{felt_place}} was no accident
**Body A:** Your {{felt_line}} line runs close by.
**Visual:** Map zoomed on `{{felt_place}}` with that one line highlighted and a one-line meaning card.
**Microcopy:** Path rule: show only if #12 was answered **and** a line truly falls within `{{orb_miles}}` miles. Otherwise skip this screen. Never invent a match.
**CTA:** Continue

---

## E. Gate

### 20. Where to send your map
**Purpose:** Email = map delivery + Nebula app login (web2app handoff).
**Headline A:** Where should we send it?
**Headline B:** Save your map, {{name}}
**Body A:** Your map and app login go here.
**Field:** Email input; "Continue with Google" / "Continue with Apple"; marketing opt-in checkbox, **unchecked by default**
**Visual:** Plain white input, small blurred map card above.
**Error states:** "Enter a valid email address" / "This email already has a map — log in instead?"
**Microcopy:** Legal line: "By continuing, you agree to our Terms & Privacy Policy." Reassurance: "Nothing is charged on this step."
**CTA:** Continue

---

## F. Monetization

### 21. Paywall
**Purpose:** Primary ask. Reuses the base nebula 3-tier structure, but every card carries its renewal price and the CTA line restates exactly what will be charged.
**Headline A:** Unlock your full map
**Headline B:** {{name}}, see your power places
**Body A:** Every line, every place, plus what's ahead.
**Body B:** Your top places and what they bring.
**Plans:** (prices are tokens for the ikame pricing team; do not invent numbers)
- **Weekly** — `{{week_intro_price}}` first week. Card line: "then `{{week_price}}`/week, renews weekly".
- **3-Month** — decoy tier, no badge. Card line: "`{{quarter_price}}` every 3 months, renews".
- **Annual** — pre-selected, "BEST VALUE" badge, per-week equivalent small. Card line: "`{{annual_price}}`/year, renews yearly".
**Visual:** Blurred map card at top, three stacked plan cards (Annual pre-highlighted), each renewal line the same size as its price; Apple Pay / Google Pay prominent, card form below.
**Microcopy:** Benefit rows: "Top 3 power places for {{goal}}" / "Every line, explained for you" / "Travel timing and line alerts in the app". CTA line changes with the plan. Weekly: "`{{week_intro_price}}` today, then `{{week_price}}`/week until you cancel." Annual: "`{{annual_price}}` today, renews yearly." Trust row: "🔒 Secure checkout · Cancel anytime in your account · `{{refund_days}}`-day money-back". "We email you 3 days before any renewal." Legal: "For entertainment only. Not relocation, financial or life advice."
**Fallback offer:** On ✕, once per session, one bottom sheet: "Try 3 days free", then "`{{annual_price}}`/year after, cancel anytime" in the same type size as the offer. Buttons: "Start free trial" / "Not now". "Not now" returns to #18 with the free card kept. No promo codes.
**CTA:** Unlock my map

### 22. One city, in depth (optional add-on)
**Purpose:** A second, small revenue layer only for users who said they're moving or could work remotely (#13). It's a genuine one-time report, with no timer.
**Headline A:** Considering one city seriously?
**Headline B:** Check a city before moving
**Body A:** A deep report for any city you choose.
**Visual:** Sample city report card (lines through it, love / work / home scores, best months); one-time price shown plainly.
**Microcopy:** Price line: "One-time `{{city_report_price}}` · not a subscription". Path rule: shown only if #13 = move or remote; others skip to #23.
**Skip link:** "No thanks, show my map"
**CTA:** Add city report

---

## G. Payoff

### 23. Your power places (reveal)
**Purpose:** Delivers the map on the web success page right away, so the purchase pays off before the app install.
**Headline A:** Your power places, {{name}}
**Headline B:** Here's where you shine
**Body A:** Tap any line or place to read it.
**Visual:** Interactive map with tappable lines and pins; top 3 place cards below; a `{{current_city}}` card; share row.
**Microcopy:** Tooltip sample: "Lisbon · on your Venus line — love and beauty come easier here." Share row: "Save map · Share". Disclaimer: "For entertainment."
**CTA:** Explore in the app

### 24. Continue in Nebula (app handoff)
**Purpose:** Web2app handoff. Zoom, travel timing and line alerts live in the app, and login uses the same email.
**Headline A:** Your map lives in Nebula
**Headline B:** Take your map everywhere
**Body A:** Log in with {{email}} to explore.
**Visual:** Phone mockup showing the zoomable map, a "Best months for Lisbon" card and a line-alert push; store badges; QR code on desktop.
**Microcopy:** In-app rows: "Zoom any city on your lines" / "Best months to visit" / "Alerts when you travel near a line". Notification opt-in happens on first app open.
**CTA:** Open the app

---

## Notes

- **Inputs kept vs. cut.** Kept: goal (ranks lines), birth date, time and place (the lines), current city (the "wrong city" answer), felt-right place (the aha moment), move intent (map mode + upsell eligibility), setting and region (filter top 3). Cut from Hint and Astroline: element, favorite color, introvert/extrovert, relationship status, career status, concept of "home", "what's keeping you from leaving", and the palm photo. None of them changes the map.
- **Fear beat removed on purpose.** Hint's "challenging planetary lines crossing places you've lived" at 100% loading is a scare-to-buy tactic. #11 and #18 stay neutral ("mixed lines, no place is bad"). Astroline's rising "forecast accuracy %" meter isn't used either: it's a fake metric, and the real progress hint is enough.
- **Birth time matters most in this niche.** #7 says the ~1,000-miles-per-hour fact plainly and offers a time-of-day fallback, so skippers still get a useful (wider-band) map. Track the #7 skip rate: if it's much higher than in the base nebula, test Body B.
- **Trust beats:** #9 after the birth data (no numbers until real data exists) and #19 (a personal proof point, conditional).
- **Two monetization layers, two metrics:** subscription CVR at #21 (+ fallback trial take rate), and city-report attach rate at #22 among move and remote users only. Don't fold #22 into paywall CVR.
- **Drop-off risk:** #7 birth time, #10 current city (location permission; the manual search is the default), #20 email, #21 paywall.
- **A/B first:** (1) #1 Headline A ("wrong city") vs. B (softer). (2) #19 on vs. off, to measure the aha screen's lift on #21 CVR. (3) #11 placement: before vs. after #12-#15. (4) #21 Headline A vs. B.
