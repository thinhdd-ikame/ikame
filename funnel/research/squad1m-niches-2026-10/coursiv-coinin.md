# Competitor funnel research: Coursiv + CoinIn lines

Captured 2026-10-01. Source: AdSpyLab Funnels Library (saved walkthroughs) + creative_teardown; web fallback where AdSpyLab has no data.
Legend: **[V]** = verified from a saved AdSpyLab capture or the ad copy. **[I]** = inferred (web or pattern-based, not a captured funnel).
"Ads" = AdSpyLab ad count linked to that funnel URL (volume, not spend). Screen counts = captured screens; numbering gaps mean loaders or transitions the crawler collapsed.

---

## 0. Base pattern: the existing CoinIn web funnel (funnel.coininapp.com) [V]

Operator note: CoinIn and PlantIn run the **same funnel template** (same "Welcome to the world of X", same loader copy, same paywall layout, same FAQ). PlantIn's paywall even shows CoinIn reviews ("useful app to determine value of coin collection"), which is a copy-paste bug. The ads also share creative families across the two brands. Treat this as one operator's house template.

Live variants (AdSpyLab, 7-month ad volume):
- info.coininapp.com/landing/w2a/dynamic/white/white : **52.8k ads**. This is a pre-lander that bridges to the store (the crawler gets stuck after 4 screens). It is the main destination for UGC ads.
- funnel.coininapp.com/coin-cio-black-better-c : 6.5k ads (capture 2026-09-28, 20 screens, run 68f916da94f4b0f8b8a3)
- funnel.coininapp.com/coin-cio-black-better-c-ww : 3.45k ads (capture 2026-09-28, 19 screens, run d24bc1b5c6741d422355)
- funnel.coininapp.com/blackcoinin-cio-t-10-2-w-26-de-black-bc-3d : German, 718 ads (capture 2026-09-28, 19 screens)
- quiz.coininapp.com/coinin-t-10-2-w-26 (+ -de/-au/-it/-es) : 4.5k+ ads. Not captured in the library, and the URL now 307-redirects to coininapp.com.

### Spine (coin-cio-black-better-c, ~20 screens) [V]
1. Welcome splash: "Identify 450,000+ coins · 6M+ users · 4.5 rating", plus a discount timer hint. CTA "Start now"
2. Commitment splash: "Are you ready to become rich with CoinIn? 💰 Scan, Identify, and Profit"
3. Q: "Have you ever checked if your coins have any special value?" (3 opts)
4. Q: "Do you know some coins can be worth thousands of dollars?"
5. Social proof: "Over 6 million coin collectors trust CoinIn"
6. Q: "Ever thought about selling coins for profit?"
7. Q: "Would you like to know which of your coins are valuable?"
8. Q: "Do you know how to identify rare coins?"
9. Social proof: "58,600 coins identified daily" (ww variant: "Right now, 43,598 users are scanning")
10–12. **"Your Turn to Guess!" game x3**: "Could this 1972 Eisenhower Dollar be worth a $12,000 payday? True/False" ($12,000 / $3,500 / $20,500). The DE variant uses 2-Euro €12,000, 1-Euro €490 and 20-Mark 1881 €6,686, so prices are localized to coins people in that market actually hold.
13. Q: "More confident selling through a secure marketplace?"
14. Q: "What would you do if one of your coins was worth $10,000?" (Sell / Keep as investment / Not sure)
15. Testimonial (story or Trustpilot-style review)
16. Q: "One app to identify, track, and sell your coins securely?"
17. Loader: "Getting CoinIn ready… checking market data"
18. Q (gift hook): "Pick one, get a personalized guide as a gift 🎁: Find out what my coins are worth / Sell my coins / Organize my collection"
19. Email gate: "Enter your email correctly so your surprise reaches your inbox" (ww variant: "Never lose access to your coins collection")
20. Paywall (long-scroll web page)

- **Key inputs:** none about the user's actual coins. Only attitude questions plus True/False guesses. No age or gender question. Single goal pick plus email.
- **Aha/result object:** weak. There is no personalized result. The "aha" is the guessing game (seeing coins worth $3.5k–$20k) plus the "gift guide" promise. The paywall headline is "💰 You're Sitting on Potential Treasure – Don't Miss Out!"
- **Paywall (US, 2026-09-28) [V]:** 1-WEEK TRIAL $12.99 then $39.99/4w ($1.85/day) · **4-WEEK $14.99 then $39.99/4w ($0.53/day), "MOST RECOMMENDED"** · 12-WEEK $39.99 then $59.99/12w. CTA "GET MY PLAN". Page sections: feature list (identify 330k coins, actual value, sell/buy marketplace, facts, collection tracker) → 3-step how-it-works → repeat plans → "Fact #71" teaser → reviews → FAQ.
- **Paywall (ww/EU variant) [V]:** 04:58 countdown. 1-MONTH €39.99→€15.99 · **"PREMIUM FOR 3 DAYS – BEST" €35.99→€1.99** · 1 YEAR €201→€99.99. The fine print reads "Trial for $14.99, then $29.99 every payment period", which does not match the plan cards. 30-day money-back guarantee. The DE fine print says the 3-day plan renews at €35.99 **every 14 days**.
- **Older versions (Sept 1–3 captures) [V]:** paywall → checkout → **downsell** screen ($14.99/4w, $39.99/12w). The downsell step was removed in the latest captures.
- **Creative angle [V]:** long first-person UGC "collector story" posted from persona pages (Ethan Parker – Coin Collector, The Wisest Collector, Edward Moore – Numismatologist, Oliver Thompson – Coin Historian, ~25 personas). Arc: grandfather's hobby → boxes of coins → "no idea what they're worth" → tried CoinIn → listed a few → "they sold… not millions, but real money" → "confidence, I feel like an actual collector". The link is embedded mid-post ("this is the page I used to download it"). The top text runs with up to 1,297 variants and CTAs in 10+ languages.

---

## 1. Coursiv · AI automation & freelancing (Jobescape)

### Ref A: Jobescape "chat-v3" [V]
- URL: https://jobescape.me/chat-v3/ (+ ?lang=fr/es/de/it/ar/ko/pt/zh/ja). **14,984 ads** on the main URL over 7 months (~21k across languages). The capture shows 3,717 ads. Captured 2026-09-28 (run 407e2256030af4013d72).
- Pages: Advancing AI, Marcus Levin, Emily Carter – Senior AI Automation & Freelancing Expert, Daniel Blake, Jobescape.
- **Pivot to note:** the current chat-v3 is **"Get confident using Claude"**: a single-tool course (Claude, Projects, Skills, scheduled tasks, agents, Claude Code). It is no longer generic "AI freelancing". It carries a trademark disclaimer ("independent educational product, not affiliated with Anthropic").
- **Screens:** 39 captured (numbering up to 45).
- **Spine:**
  1. Q hook on screen 1: "Have you ever used Claude?" (Yes/No) with "Complete this quiz to see your subscription plan"
  2. Info: "You're ahead, but this is just the start"
  3–7. Profile: learn-for (work/personal/growth) · work status (employee/freelancer/owner/between jobs/exploring) · age · gender (skippable) · benefit (promotion/faster/confidence/own business/earn more)
  8. "Did we get everything right?" summary confirm
  9–11. Challenges: AI experience rating · readiness for AI career change (fear) · "What scares you most" (replaced by someone using AI better…)
  12. Info: authority quote (Harvard's Karim Lakhani: "humans with AI will replace humans without AI")
  13–15. Use-case 1 (documents): Likert "I create docs regularly" · "spent as long fixing AI output?" · "what if a polished doc took 2 min?"
  17. Info: "Create polished content faster" (demo)
  18–21. Use-case 2 (build apps without code): idea? · what stopped you · "possible without coding?"
  22. Info: "Building an app has never been this easy"
  23–27. Personalization: pace · min/day (10/20/30/60) · theory vs practice · portfolio site? · AI mentor?
  28. Info: "plan almost ready"
  29–30. Certificate question + certificate value info
  31. Main blocker (no plan / waste time / too busy / confusing)
  32–38. Loader with 3 progress bars (Goals → Growth areas → Picking content), with reviews and micro-questions interleaved
  39. **Result: "Here's your AI profile"** (role, AI experience level, biggest stoppers, time lost on manual work, top opportunity)
  40. Email gate ("get your Claude Learning Plan")
  42. Name input
  44. **Plan reveal: "Your Personal Plan to Learn Claude"**, a 6-module syllabus + final assessment + certificate
  45. Paywall
- **Key inputs:** work status, motivation, AI experience, fears, use-case pain (docs / apps), minutes per day, learning style, blocker, email, name.
- **Aha object:** AI readiness profile card + named 6-module syllabus + certificate.
- **Paywall [V]:** "Start Learning Claude today with 61% intro offer!" 1-Week €6.93 (strikethrough €17.77) → €38.95/4w · **4-Week €15.19 (strikethrough €38.95) → €38.95/4w "Most popular"** · 12-Week €25.99 → €66.65/12w. CTA "GET MY PLAN". A $1 card-verification hold. Page sections: value bullets (50+ lessons, AI mentors, 24/7 chat, +7 tools incl. CV & Portfolio builder) → Trustpilot 4.4 / 300K+ users → recap of "your goal / 10 min a day / former barrier" → benefits → reviews.
- **Note:** the 1-week plan renews to the 4-week price (€38.95), so the cheapest entry rolls into the monthly plan.

### Ref B: Zenfy "get-started" (AI-driven income / freelancing) [V]
(Listed under career, but its framing is automation + freelancing + income, so it fits Niche 1 better.)
- URL: https://zenfy.ac/get-started/0, **4,763 ads**, captured 2026-09-28, 31 screens (n up to 38). Pages: ~13 "Career Advisor" personas (Emily Hart, Erica Stanton, Sarah Jenkins…).
- **Spine:** 1 gender ("AI-DRIVEN INCOME GROWTH CHALLENGE") → 2 age → 3 "100,000+ using Zenfy" → 4 main goal (grow wealth/be my own boss/financial freedom/travel…) → 5 income source → 6 schedule → 7 job challenges (multi) → 9 financial situation → 10 **desired annual income ($50k…$350k+)** → 11–14 control over hours, routine-free job, what you'd do with saved time, interest match → 15 digital-business knowledge → 16 side-hustle history → 18 AI tools familiar (multi) → 22 "AI may boost income" → 23 fields to try (design, content, web dev, AI, marketing…) → 25 freelancing readiness (emoji scale) → 26 focus → **27 Result: "AI-Driven Income Growth Profile" readiness score** → 28 special goal (house/wedding/car/retirement…) → 29 min/day → **30 "Personal plan: AI Master by November 2026" date-prediction chart** → 31–32 loader → 34–35 email (domain autocomplete) → 36 email-trends opt-in → 37 "4-week Career Freedom Challenge" readiness chart → 38 checkout.
- **Paywall [V]:** a single plan. "Promo code Discount_Sep50 applied". 1-WEEK $20 → **$10**, then **$85 per 28 days**. Before/after card ("Moderate → High career skills / Limited → High income"). 100% money-back guarantee, 4.5 from 436 reviews.
- **Dark patterns:** the income-goal question frames dollar outcomes; a $10 trial renews to $85/28d (an 8.5x jump); a fake "promo code applied".

### Ref C (own baseline): Coursiv /dynamic [V, summary only]
- https://coursiv.io/dynamic, 2,936 ads, 37 screens, captured 2026-09-28. Paywall plans: 1w €6.93, 4w, 12w €39.99. Use it as the internal baseline. Jobescape's prices and plan grid match it almost exactly.

### Hooks / angles (Niche 1)
- Fear of displacement ("replaced by someone who uses AI better") + an authority quote.
- Concrete use-case mini-demos (a doc in 2 minutes, an app without code) instead of abstract "learn AI".
- Certificate for LinkedIn/CV; portfolio site; AI mentor.
- Expert-persona pages ("Senior AI Automation & Freelancing Expert") + multi-language at scale.
- Single-tool branding (Claude) gives search/trend tailwind.

### Dark patterns to avoid
- "Complete this quiz to see your subscription plan" frames the quiz as plan selection.
- Strikethrough "61% off" anchors, and a 1-week plan that renews at the 4-week price.
- Income-target questions that imply earnings (Zenfy), and a fake promo code.
- Trademark-adjacent branding on someone else's product (legal risk).

---

## 2. Coursiv · AI for career / career change (Shift, Zenfy)

### Ref A: Shift "find-your-job-intro-trial-personalized" [V]
- URL: https://quiz.shift.careers/find-your-job-intro-trial-personalized/status, **938 ads**, captured 2026-09-06 (run dee5ec6cb04b42cd0542), 42 screens (n up to 46). Page: "Shift – Transform Your Career".
- **Spine:**
  1–2. "Create a Job Search Plan · Pass this quiz to personalize your subscription · Are you looking for a job?"
  3–4. Gender, age
  5. "Join 32,000+ Shift users"
  6. How long searching
  7–8. What didn't suit you before (multi)
  9. Empathy: "It's okay to feel stuck. Many users faced [your answer]"
  10. Kind of change (same field / new profession / after long break / new country)
  11–12. Work environment, culture
  13–14. What's holding you back (multi)
  15. Reflection: "You deserve a fulfilling job! You're aiming for X in a Y environment"
  16–19. Assets: CV? LinkedIn strong? headhunted? interview confidence
  20. "10 minutes daily beats all day once a week"
  21–25. Yes/No "real job-search experiences" (ghosted? skipped vacancy? rejection self-doubt? heard from recruiter?)
  26. "Step-by-step plan: strategy, CV, interview, LinkedIn"
  29–30. Life challenges (long break, parenting, migration, caregiving, health, finance)
  31. Years of experience
  32. Salary expectation (skippable)
  33. **"Profile Summary: potential of getting a perfect job offer" gauge (Low→High)**, labeled non-customized
  34. Min/day
  35. Start-date target
  36. "We got you" chart
  37–40. 3-bar loader with reviews
  41–42. Email
  43–44. Name ("to get a personal discount promo code")
  45. "Your Personal Plan is ready" (cites peer-reviewed job-search research)
  46. Checkout
- **Key inputs:** change type, blockers, assets (CV/LinkedIn), interview confidence, life constraints, experience, salary, start date.
- **Aha object:** "Potential of getting a perfect job offer" gauge + Now→Goal comparison (Confidence: needs improvement→high; Career strategy: undefined→well defined).
- **Paywall [V]:** 10:00 countdown, "Your promo code is applied! marketing_discount". 1-week trial €9.93 → €44.99/4w ($1.60/day) · **4-week €19.99 → €44.99/4w "Recommended for your goal"** · 12-week €39.99 → €89.99/12w. Features: CV builder, interview prep, LinkedIn enhancement, networking, "hidden tactics", 20 skills/personality tests, 24/7 expert chat, **1-on-1 career coaching**. Includes a tools preview and reviews.
- **Compliance-forward copy (worth copying):** "This is not a guarantee or promise of results" on every chart; "illustrative example". This is safer than Zenfy.

### Ref B: Zenfy (see Niche 1): career-advisor personas, "Career Freedom Challenge" framing [V]

### Hooks / angles (Niche 2)
- Validating real pain points (ghosted, rejected, skipped a role for missing requirements).
- Life-event segments (return after a break, migration, parenting) are a strong targeting axis.
- A human-coach promise (1:1 session) on top of the app.

### Dark patterns to avoid
- "Personal discount promo code" collected for a name (the discount is fake).
- Countdown timer + a fake promo; a 1-week trial renewing at the 4-week price.

---

## 3. CoinIn · Collector persona ("The Wisest Collector") [V]
- No separate persona funnel exists. Persona pages (The Wisest Collector, Ethan Parker – Coin Collector, Edward Moore – Numismatologist, Oliver Thompson – Coin Historian, Linda Thompson, Sarah Lee – Coin Historian, plus crossovers like "Liam Johnson: Artefacts Collector" and "Selene Moon – Crystal Collector") all point to the same funnel.coininapp.com / info.coininapp.com destinations (Section 0).
- Top The Wisest Collector creatives (Mar–Aug 2026): video family 633059, **492 ads**, ran 144 days; family 633083, 456 ads (shared with PlantIn); image family 722759, 336 ads (shared with "Exclusive Coinmarket", exclusivecoinmarket.org, 752 ads, which is apparently the same operator's marketplace-style lander).
- **The persona mechanic is in the ad, not the funnel.** The funnel itself has no persona continuity: the persona never appears on screens, and screen 1 is a generic CoinIn splash.
- "Crystal Collector" and "Artefacts Collector" pages suggest the operator is already testing **adjacent collectibles under the coin app** [I].
- **Dark patterns:** fake-persona UGC presented as organic ("I never thought I'd be writing a post like this"); "become rich" framing; "sold on CoinIn marketplace with zero commission" testimonials with dollar figures ($4,200 / $6,000 / $8,500 / $10,000).

---

## 4. CoinIn · Antique appraisal [I, no Meta web2app funnel found]
- AdSpyLab: niche_search "antique" returned 0 results; Hobbies funnels library contains only CoinIn, PlantIn and Hello Piano. **No antique appraisal web funnel is visible on Meta.**
- Adjacent in-store apps (web): Antique Identifier by Picture° (Android, $4.99/wk or $24.99/yr); Antique Identifier – Vintiq (iOS, $5.99/wk to $39.99/yr); Antique Identifier – Relic (iOS, AI fact sheet + appraisal + comparisons). All are app-store native: photo → ID → paywall on details/value. Several web "free antique identifier" SEO sites (antiqueidentifierapp.com, theantiqueidentifier.app) use "snap a photo, get its value".
- **Recommended spine (inferred, adapting the CoinIn template):** splash → "What did you find?" (furniture / porcelain / silver / jewelry / art / toys / clocks) → where it came from (inherited / attic / flea market / estate sale) → condition / maker's mark visible? → "Guess the value" game with real auction comps → fear-of-loss info ("Most heirlooms are sold below value at garage sales") → loader → **"Appraisal readiness" or a sample appraisal report** → email → long paywall.
- **Aha object to build:** a sample appraisal card (category, era, maker-mark guide, value range, "where to sell" route), rather than CoinIn's generic "treasure" headline.

## 5. CoinIn · Trading cards (Pokemon, sports) [I, no Meta web2app funnel found]
- AdSpyLab: niche_search "card scan" returned 0 results.
- App-native competitors (web):
  - **Ludex:** Free (60 cards, 5 eBay listings a month) / Lite $4.99/mo or $44.99/yr (1 category) / Standard $9.99/mo or $89.99/yr / Pro $24.99/mo or $239.99/yr. 7-day free trial on paid tiers. Monetizes eBay-listing limits.
  - **Collectr:** Pro $7.99/mo or $59.99/yr ($4.99/mo). Soft paywall, no trial. ~7 onboarding steps: camera permission → **scan your first card before signup** → account prompt "save your collection" → paywall on unlimited scans / 5-year price history / export.
  - Others: Pokemon Card Value Scanner, CardMon, PokeDex scanner. PSA and Beckett are grading services, not funnels.
- **Implication:** this category's norm is scan-first, soft paywall, annual ~$45–90. A web quiz funnel would be new to the category. The audience is younger (TCG) or nostalgic dads (sports).
- **Recommended spine:** pick a game (Pokemon/sports/MTG/One Piece) → era of your cards (WOTC 1999 / modern / vintage sports) → binder size → "Do you know which of your cards are graded-worthy?" → **"Guess the price" with real PSA 10 comps** (e.g., a 1st-edition Charizard) → grading/fake-check fear info → loader → **"Collection value estimate range" + "top 3 to check for PSA"** → email → paywall (annual-first, matching category norms).

## 6. CoinIn · Stamps, old banknotes, gemstones [I, no Meta web2app funnel found]
- AdSpyLab: "stamp" returned only Catawiki (9 ads, a marketplace category page). "rock" returned no identifier brands.
- App-native (web): Stamp Identifier (Colnect, free/social, 100k+ installs); Stamp Value Stamp Identifier (IAP); **NoteScan** banknote ID ($5.99/wk with 3-day trial); NoteSnap (30,000+ banknotes); **Rock Identifier: Stone ID** (Next Vision): 3-day trial → $5.99/wk or $19.99–39.99/yr, with known complaints about trials auto-converting to yearly plans. Lens-style multi-object apps (lensapp.io) cover banknotes too.
- CoinIn itself already runs "Coin&Note Scanner" and "Crystal Collector" pages [V], so banknotes and gems fit the coin funnel naturally.
- **Recommended:** add an object picker to the CoinIn spine (coins / banknotes / stamps / gemstones), then branch guessing-game items (an error banknote, the Inverted Jenny stamp, a raw sapphire vs glass). Result: a value range + "real vs fake" check.

## 7. PlantIn · Plant ID / plant care [V]

### Ref A: PlantIn "plantin-redesign-cio-uk" [V]
- URL: https://funnel.myplantin.com/plantin-redesign-cio-uk, 1,054 ads, captured 2026-09-28, 14 screens (n up to 20). Pages: **Chloe Bennett – Indoor Jungle**, Expert Botanist.
- **Spine:**
  1. "Welcome to the world of PlantIn! Identify 30,000+ plants" (discount timer)
  2. "How often do your plants show signs of trouble?" (visual: crispy tips, mealybugs, yellowing)
  3. "Do you usually know why your plant is struggling?"
  4. "Over 15 million plant parents trust PlantIn" (review wall)
  5. Confidence with diseases
  6. "72% of plant parents struggle with diseases"
  7. How many plants (1-2 / 3-5 / 5-10 / 10+)
  8. "Know what to do when your plant gets sick?" (care-card visual)
  9. "73% of plant parents 'kill' their plants with water"
  10. Goals (multi: keep alive / identify / remember to water / diagnose & cure / grow herbs & veg)
  11–12. Loader "Tailoring your PlantIn experience"
  13. Email ("Create personalized plant care experience")
  14. Paywall
- **Key inputs:** problem frequency, diagnosis confidence, plant count, goals. Nothing about the user's own plant species.
- **Aha object:** none personalized. Stats and the loader stand in for a result.
- **Paywall [V]:** 04:58 timer. 1-WEEK TRIAL £3.99 (strikethrough £39.99, £0.57/day) · **4-WEEK £14.99 (strikethrough £39.99) "MOST POPULAR"** → £39.99/4w · 12-WEEK £39.99 (strikethrough £59.99). 30-day money-back guarantee. Features: 16k species, instant disease diagnosis, 24/7 botanist support, 20M community, light meter + watering calculator. **Reviews include CoinIn coin reviews (template bug).**
- Earlier version (Sept 1 capture, 13 screens): 4w $14.99 → $29.99, 12w $39.99, 4w alt $15.99 → $39.99, with a checkout step.

### Ref B: PlantIn careguide pre-lander [V, partial]
- https://info.myplantin.com/landing/w2a/dynamic/periglacial/careguideid_mondil_ji_gr_btn_righttx_v2 : 1,015 ads (the "careguide" naming matches the +171% trend). Crawler stuck at 4 screens, so this is likely a pre-lander/advertorial that hands off to the store.
- The white pre-lander (info.myplantin.com/.../white/white) has 1,510 ads. Pages: ~25 personas (Ben Oak – Houseplant Mentor, Dr. Camellia Bloomfield, Zen & Zamioculcas…).
- Other captured variants: plantin-cio-main-uk (1,025 ads, 13 screens), plantin-cio-main-es (674 ads, 16 screens).

### Hooks / angles
- Problem-led ("never kill your plants"), stats that make overwatering the user's fault, an expert/plant-mom persona.

### Dark patterns to avoid
- Strikethrough "£39.99" on a trial that was never sold at that price; a countdown timer; cross-brand fake reviews.

---

## Cross-niche patterns (all [V] unless marked)
- Plan grid is universal: 1-week intro → renews at the 4-week price; 4-week "most popular" is the default; 12-week is the value anchor. Price per day is shown on every plan.
- Paywall = a long-scroll web page with plans repeated twice, a 30-day money-back guarantee, reviews, an FAQ ("How can I cancel?").
- Timers and "promo applied" appear in Shift, Zenfy, CoinIn and PlantIn.
- The learning funnels (Jobescape, Shift, Zenfy) run long (31–42 screens) and build a real profile → result → plan reveal. The scanner funnels (CoinIn, PlantIn) are short (14–20 screens) with **no personalized result**. That gap is the opening for the collectibles line.
