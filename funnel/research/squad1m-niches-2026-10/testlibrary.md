# Testlibrary: competitor funnel summary
Source: AdSpyLab captures (raw/testora_*.json, impulse_*.json, memoryos.json, breeze_childhood.json + captures_notes.md). Screens = unique (raw in brackets).

## Niche map
| Niche | Reference funnel(s) | Screens | Status |
|---|---|---|---|
| MBTI / personality | Testora ps1tp (90-item, 8 parts); 64Personality | 34 (100 raw) / 10 (51 raw) | covered |
| Archetype | Impulse archetype.mental-impulse.com; TestLibrary /archetype-test | 31 / 1 | **hook only**: both captures land on generic brain training or a gender gate |
| Brain health / memory | memoryOS new-h; Impulse brain training | 34 / 31 | covered |
| Autism | Testora IQ & Autism; TestLibrary /autism-test | 46 (63 raw) / 1 | covered (Testora) |
| ADHD | TestLibrary /adhd-test | 1 | landing only |
| Trauma | Breeze childhood; Impulse trauma (generic) | 38 / 29 | covered (Breeze) |
| Narcissism | — | — | none |

---

## 1. Testora: Personality test (ps1tp), MBTI-style
- **Entry:** https://funnel.testora.space/en/gender-1?cohort=testora_fl_ps1tp | **Ads:** 928 | **Captured:** 2026-09-28 | **Screens:** 34 unique (100 raw) | run fc2f414a50c7fac8cd01
- **Spine:**
  1. Gender hero "Discover Your Personality, 5-minute quiz" + live counter "12,486 taking the test now"
  2. Likert items counted "N/90" (5-pt Strongly Agree to Strongly Disagree)
  3. Every ~10 items, an interstitial: HBR/Eurich "95% think they know themselves, 10-15% do"; "personality can grow"
  4. 3 "What do you notice first?" image items (Lips/Trees/Roots…), each followed by an instant mini-result
  5. Progress unlocks: "2 of 8 parts open: Emotional Depth, Cognitive Architecture", then 4/8 (Social Energy, Execution Style)…
  6. "Your Personality Portrait: 8 parts" and "Only 3 in 100 share your strengths"
  7. Life-context block (82-86/90): life satisfaction, current struggles (multi), mental blocks (overthinking…), areas to improve, "not living up to potential"
  8. Chart "growing self-knowledge"
  9. Loader with 4 micro-questions ("distracted?", "taken tests before?", "compare with others?", "track progress?")
  10. Email + marketing consent, newsletter opt-in
  11. Cross-sell "50+ other tests" (pick topics: memory, attachment style, archetypes, EQ, career…)
  12. Paywall
- **Inputs:** gender, about 80 Likert items, 3 projective image picks, life struggles, focus areas, email.
- **Result before paywall:** an 8-part "Personality Portrait" (named dimensions unlocked progressively) + rarity "3 in 100". The paywall header shows "Focus area: Relationships / Growth mindset: Strong"; the report is blurred ("Analytical" repeated) behind "Unlock my Full Report".
- **Paywall:** 7-DAY TRIAL €5.89 (€33.98 struck), €0.84/day; 4-WEEK €16.99 (€33.98) MOST POPULAR, €0.56/day; 12-WEEK €33.99 (€67.98), €0.37/day. Renews monthly at €33.98. **Cancel only by emailing support@testora.space.** 30-day money-back. Program levels 1-6 ("Meet Your True Self"…). Reviews.
- **Hooks:** progressive "parts unlocked" reveal; projective-image mini-results; rarity claim; 90-question length signals rigor.
- **Dark patterns:** live counter; email-only cancellation; struck "was" prices equal to the renewal price; loader micro-questions.

## 2. 64Personality: 64 types (MBTI + 2 extra axes)
- **Entry:** https://64personality.com/personality-64 | **Ads:** 0 in window (many FB pages: "Hot Personality Test", "Dangerous Personality Types", "Shadow Personality") | **Captured:** 2026-09-28 (10 unique / 51 raw); 2026-09-05 ($1.98 version) | runs ea5e24ccede5b7a55613 / daf7c1977f6965bbb77c. Full of Potential Ltd, Hong Kong.
- **Spine:**
  1. Long landing ("95% accuracy, 210M+ tests", World Personality Map, price disclosed: $1.98 / 7-day trial then $28.8/mo)
  2. "Get ready" (30 questions)
  3. About 5 pages of 7-8 Likert statements (16Personalities-style)
  4. Analysis loader
  5. Email "save your results"
  6. Checkout = result teaser
- **Result before paywall:** masked type "??F? - O?" with one letter revealed + archetype blurb ("Mediators are poetic…"); free trait bars (63% Extrovert…); Career / Growth / Relationships blurred; "VERY RARE, ONLY 0.23%".
- **Paywall:** (a) $1.98 report (anchor $19.80, -90%) + 7-day Premium trial, then $28.80/month. (b) A/B: $19.8 today (anchor $39.8), "renew at $28.80/month", but the DOM says "After trial $38.8" (conflict). Bonus "50+ tests free". Odometer "reports ordered". No guarantee.
- **Risks:** "entertainment only" disclaimer next to "scientifically-validated, 95% accuracy"; rarity shown to everyone; shifting anchors; contradictory social proof.

## 3. Impulse: archetype.mental-impulse.com (archetype hook, brain-training product)
- **Entry:** https://archetype.mental-impulse.com/ | **Ads:** 1,703 | **Captured:** 2026-09-28 (also 09-06, 09-21) | **Screens:** 31 (42 raw) | run fa7239d7ed7d8ccd725f. GMRD Apps Ltd, Cyprus.
- **Note:** no archetype questions or result in any of 3 captures; the archetype quiz may require ad-specific params.
- **Spine:**
  1. Long landing (100M+ downloads, 16+ self-discovery tests)
  2. Gender (tap = T&C + Meta Pixel consent), age, "Let's go"
  3. Thinking style, **pseudo-result** "You are left-brain dominant!"
  4. Goals/confidence (5 multi-selects), 4 emoji Likert items with interstitials
  5. Motivation, daily goal 5-30 min
  6. Loader with micro-questions
  7. Email, name
  8. "4-week brain training plan ready" chart (illustrative)
  9. Checkout
- **Result before paywall:** "left-brain dominant" label + plan chart. No trait report.
- **Paywall:** 4-WEEK $19.99, then $39.98/4w (MOST POPULAR); 12-WEEK $39.99, then $79.98; 24-WEEK $59.99, then $119.98; "Save 50%"; 10-min "discount reserved" timer. The landing also discloses a 7-day $0.99 trial, then $29.98/mo (not offered at checkout). No guarantee, no upsell.
- **Risks:** consent bundled into the gender tap; inconsistent social proof (100M / 120M / 3.4M).

## 4. Impulse: trauma.mental-impulse.com (trauma hook, same product)
- **Entry:** https://trauma.mental-impulse.com/ | **Ads:** 607 | **Captured:** 2026-09-28 | **Screens:** 29 (40 raw) | run 513ac9ba09a938d507dc
- **Same quiz and paywall as #3.** No trauma content. No name step; plan screen shows the email.
- **Takeaway:** subdomain-per-angle landings (archetype/trauma) feed one generic funnel. The ad angle is only a hook.

## 5. memoryOS: memory / brain health
- **Entry:** https://start.memoryos.com/new-h | **Ads:** 1,650 | **Captured:** 2026-09-28 | **Screens:** 34 (40 raw) | run 475a5052229047be140d. Encoder Inc., Delaware.
- **Spine:**
  1. Age gate ("compare with your age group"), World Memory Champion authority, gender, use case
  2. Forgetting frequency, info "weak memory is not your fault (forgetting curve)"
  3. Pain points (names, dates, passwords, **dementia concern**), each with a reassurance card
  4. Personality yes/no; "+79% recall precision / +57% speed"
  5. Mind Palace explainer, founder card (Jonas von Essen)
  6. Learning style, motivation, daily 5-20 min
  7. Email, name
  8. Plan chart "+70% in 4 weeks"
  9. Long paywall
- **Result before paywall:** none scored; a Now→Goal chart ("Weak memory" → "Master of Recall").
- **Paywall:** 10-min offer timer. 12-WEEK $36.99 ($99.99) MOST POPULAR; 4-WEEK $15.19 ($49.99); 24-WEEK $59.99 ($119.99) BEST DEAL; per-day reframing. Clear renewal text ($99.99/12 weeks from a stated date; one-step cancel in settings; reminder before each charge). **150% money-back + box of chocolates** (conditional). About 30 reviews, FAQ.
- **Risks:** dementia fear question; "patented", "scientifically proven"; "11 people viewing"; early-adopter count inflates (100k → 500k+). Renewal disclosure is a good-practice benchmark.

## 6. Testora: IQ & Autism
- **Entry:** https://funnel.testora.space/start-1aut?cohort=testora_fl_iq_tp1_autism | **Ads:** 679 | **Captured:** 2026-09-02 | **Screens:** 46 (63 raw) | run 7f6bf2e1a7ba68d62127. Later re-captures only got 15 screens.
- **Spine:**
  1. Landing "Autism & IQ Profile, 5-minute assessment" + live counter
  2. Interstitial "spiky profile"
  3. "Diagnosed with autism?" (doctor / self / suspect / exploring)
  4. Turing/Tesla/Einstein interstitial
  5. Gender, then "women's autism misdiagnosed" interstitial
  6. 5 autism Likert items
  7. "Standard IQ tests weren't designed for autistic cognition"
  8. 4 text logic items + about 16 image-matrix puzzles, with flattery ("Faster than 93%") and a stopwatch, counter "N/39"
  9. Education, "confirm answers, can't edit" modal
  10. "30M+ people / 8,796 today"
  11. Loader (IQ / autism score / report / brain plan) with micro-questions
  12. Email gate (completion time, strongest skill teaser)
  13. Name ("for your IQ certificate")
  14. Result/paywall, checkout
- **Result before paywall:** IQ number on a celebrity bar (Einstein 160 / You 114 / Monroe) + "Cognitive profile is unusual: seen in only 12%… one pattern limiting your peak performance". The autism score is promised; **no visible autism number captured**.
- **Paywall:** plan cards not captured (text cut). Checkout "Total: 16.99", 30-day money-back, 09:59 timer, live ticker "Oliver just scored 93". Renewal not captured.
- **Risks (high):** no "not a diagnosis" disclaimer seen; misdiagnosis and retro-diagnosis claims; fake live counters; flattery mid-test.

## 7. TestLibrary: autism / ADHD / archetype (landing only)
- **Entries:** testlibrary.com/autism-test/ (1,314 ads), /adhd-test/ (1,155 ads), /archetype-test/ (0 ads) | **Captured:** 2026-09-02, 09-11, 09-20 | **Screens:** 1 unique each (landing + gender gate)
- Landing: "Discover your Autism trait profile: complete this 5-minute test…"; ADHD and Archetype use the same template. Hero mock widgets ("41%", "4/5 (High)") suggest trait % + 1-5 level bars as the result. Footer: Cancel Subscription, Subscription Policy, Free Tests; "informational/educational only".
- FB pages: "Mind Metrics", "TestLibrary - Created by Experts", "Unleash Your Inner Archetype".

## 8. Breeze: childhood trauma
- **Entry:** https://try-breeze.com/funnel/childhood/ | **Ads:** 1,262 | **Captured:** 2026-09-28 | **Screens:** 38 (47 raw) | run 344bf541e5f6c02ebc69
- **Spine:**
  1. Gender, age
  2. Parents, childhood environment
  3. Audio illusion + about 10 ambiguous-image items
  4. Low mood, duration, breathing pause
  5. Interstitial "tailored treatment plan"
  6. Tendencies / relationship patterns
  7. Struggles, goals, commitment
  8. Name, "Breeze Effect" bars
  9. Loader with symptom micro-questions
  10. Email, country, before/after
  11. **Result**
  12. Paywall
- **Result before paywall:** childhood-experience profile tags (Emotional detachment, Fear of intimacy, Anxiety, Trust issues) + 28-day plan; full result locked.
- **Paywall:** pay-what-you-want 7-day trial (€1 / €2 / €10 / €17.34, "it costs us €17.34"), then €29.99/month; "no partial refunds"; day-5 reminder timeline. Includes "50+ personality tests".
- **Risks:** distressing stimuli, "treatment" wording, guilt anchoring, no crisis redirect.

---

## Cross-funnel patterns
- Test-style funnels (Testora, 64P) use long item counts ("N/90", "N/39") + progressive unlock + rarity claims, then a blurred report. Plan-style funnels (Impulse, memoryOS) skip real scoring and show a Now→Goal chart.
- Pricing cluster: trial €5.89 / $1.98; 4-week €16.99-$19.99; renews €29.99-$39.98 per 4 weeks; 10-min timer.
- Cross-sell "50+ tests" appears in Testora, 64P and Breeze (library positioning, which matches Testlibrary).

## GAP (no data)
- **ADHD:** only the TestLibrary landing; no question flow, result or paywall from any brand.
- **Archetype:** no archetype question set or result captured (Impulse archetype → generic brain training; TestLibrary archetype → landing only).
- **Narcissism** (and narcissistic-abuse/relationship trauma): no funnel captured.
- **Autism result object/paywall plans:** Testora autism score and plan cards not captured.
- **Trauma result via a test-library brand:** only Breeze (wellbeing app); Impulse trauma has no trauma content.
