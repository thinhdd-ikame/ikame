# AdSpyLab funnel captures (pulled 2026-10-01)

## 1. Testora: IQ & Autism (run 7f6bf2e1a7ba68d62127)
- URL funnel.testora.space/start-1aut?cohort=testora_fl_iq_tp1_autism | ads 679 | captured 2026-09-02 | raw 63 screens, 46 unique. Later re-captures (09-20/28/29) only got 15 screens.
- FB page names include personas: "Ingrid Voss", "Ingrid from Testora", "Patrick Sterling", "International Brain Test", "Brain Health Check".
- Questions: progress counter "N /39" plus a running stopwatch (00:00 to 01:44). The intro says "The IQ test contains 30 questions / Each question has 1 correct answer / You need 5 minutes". Mix:
  - 1 diagnosis-status question, gender, 5 autism Likert items (5-pt "Completely Agree…Completely Disagree")
  - 4 text logic items ("You pass the runner who was number four…", "How many months have 28 days?", "8, 12, __, 20, 24", "Car is to wheel as bird is to")
  - about 16 image-matrix puzzles ("Select your answer:", 6 image options), education level, plus a confirm modal: "Do you want to confirm your answers? You will not be able to edit them after validation."
- Flow spine:
  1-3. Intro/landing: "IQ & Autism Test", "The Autism & IQ Profile — The 5-minute assessment that uncovers your cognitive profile". Live counter "12,486 people are taking the test right now".
  4. Interstitial: "High intelligence and autism often share the same 'spiky' cognitive profile: exceptional logic paired with social unconventionality"
  5. "Have you been diagnosed with autism?" (I'm diagnosed by a doctor / self-diagnosed / I suspect I might be autistic / No, I'm just exploring)
  6. Interstitial: "Turing, Tesla, Einstein — all showed strong autistic traits. None were diagnosed. All changed the world…"
  7. Gender. 8. Interstitial: "Women's autism is often misdiagnosed as anxiety or depression. This leads to years of ineffective treatment…"
  9-13. Likert autism items ("I often feel that I am 'different' from others", "I often focus intensely on specific topics", food textures, "overwhelmed in busy or noisy places")
  14. Interstitial: "Standard IQ tests were not designed for autistic cognition. Many autistic people score average — then outperform everyone where the test couldn't look."
  15-18. Text logic items. 20-35. Matrix puzzles, broken up by fake-feedback interstitials: "You Are Faster Than 93% of All Test Participants!" and "Outstanding Logic score!"
  40-41. Education level, then the confirm-answers modal. 45. "30M+ people have discovered their IQ & Autism score with Testora. 8796 users took their test today."
  46-55. Loader "Calculating IQ & Autism Test Score": progress bars for "Analyzing your answers / Calculating your autism score / Preparing your test report / Creating your brain training plan", with micro-questions that pause the bars at 50% ("Did you get distracted while taking the test?", "Do you want to compare your results with our other users?"). Review from "Ronald Thompson".
  57-58. Email gate: "YOUR RESULTS ARE READY! Calculated: September 2, 2026. Enter your email to unlock your complete IQ analysis." Teaser fields: COMPLETION TIME 01m 46s, STRONGEST SKILL Visual Perception.
  59. Name: "*We use your name to generate your IQ certificate."
  61. Paywall/result. 62. Checkout.
- Result object: an IQ number on a comparison bar ("IQ 160 Albert Einstein / IQ 114 You / Marilyn Monroe") and the headline "Your Cognitive Profile Is Unusual — …unusual combination of spatial and analytical dominance — seen in only 12% of test-takers. However, there's one recurring pattern in your answers that may be limiting your peak performance". The autism score is promised ("Calculating your autism score") but no visible autism number was captured. "Get IQ Report" CTA.
- Paywall: captured text cuts off at 400 chars, so plan cards are NOT captured. Checkout shows "Total: 16.99" and "30-day money-back guarantee"; Card / PayPal / Amex / Visa / Discover / Maestro; CTA "Confirm Payment". 09:59 countdown on the paywall. Renewal disclosure not captured.
- Disclaimers: none captured; no "not a diagnosis" text seen anywhere in the capture. Diagnosis-adjacent claims: "misdiagnosed", "ineffective treatment", the Turing/Tesla/Einstein retro-diagnosis.
- Dark patterns:
  - live counter "12,486/12,488/12,490 people are taking the test right now" ticks across screens
  - "8796 users took their test today"
  - fake performance flattery mid-test ("Faster Than 93%")
  - loader micro-questions, no-edit confirmation
  - 10:00 paywall timer, live ticker "Oliver just scored 93 in IQ test"
  - celebrity IQ anchoring

## 2. Impulse: archetype.mental-impulse.com (run fa7239d7ed7d8ccd725f)
- ads 1,703 | captured 2026-09-28 | raw 42, 31 unique. Company: GMRD Apps Limited, Limassol, Cyprus; support@brainimpulse.me.
- IMPORTANT: despite the "archetype" subdomain, all 3 full captures (09-06, 09-21, 09-28) landed on the generic Impulse BRAIN-TRAINING quiz. No archetype questions or archetype result was captured. The archetype quiz may sit behind ad-specific params.
- Questions: about 20 items, no N/XX counter, "1 MINUTE QUIZ".
  - Gender, age, thinking style (Analytical vs Creative)
  - 5 multi-selects (skills to improve, goals, motivation, enjoyment, reason for self-growth)
  - 3-option single choices ("Yes, absolutely! / Maybe / Not really")
  - 4 emoji Likert items (👎👎🤷👍👍 "Do you agree with the statement below?")
  - Daily goal (5/10/20/30 min)
- Flow spine:
  1. Long-scroll landing: "Unlock your potential with brain training & self-discovery"; "#1 most downloaded brain training app 100M+ downloads 1.300.000 five-star ratings #1 Health & Fitness app (2022‑2023)"; "over 120 million people"; 16+ self-discovery tests.
  2. Gender gate ("By choosing your gender and continuing you confirm you have read and agree to our Terms…Subscription Policy…Cookie Policy (including…Meta Pixel)" plus price disclosure). 3. age.
  4. "Let's go!" 5. Thinking style. 6. Pseudo-result: "You are left-brain dominant! Your strength is clear, logical thinking…"
  7-14. Goals/confidence questions. 15. "Your brain loves to learn, you just need a better system!"
  16-20. Likert items, with interstitials "People with strong cognitive skills are more likely to succeed in key areas of life" and "Just 5 minutes a day for a sharper mind!"
  22-29. Motivation multis, "Did you know that brain games are effective…", daily goal.
  30-33. Loader "We are crafting your experience…" (Analyzing your goals, Assessing your mental state, Training plan, Personalizing your experience 89%), with overlay yes/no micro-questions and reviews ("3.4 million people have chosen Impulse").
  34. Email ("Achieve your goals with Impulse"; "I agree to Impulse Terms & Conditions and Privacy Policy" checkbox). 39-40. Name.
  41. "Daniel, your 4-week brain training plan is ready!" Cognitive-performance chart Week1→4 with "This chart is for illustrative purposes only". 42. Checkout.
- Result object: only the plan-ready chart and the "left-brain dominant" label. No trait/score report.
- Paywall (verbatim), MOST POPULAR "4-WEEK PLAN Save 50% $19.99 now, then auto-renews at $39.98 every 4 weeks":
  - "12-WEEK PLAN Save 50% $39.99 now, then auto-renews at $79.98 every 12 weeks"
  - "24-WEEK PLAN Save 50% $59.99 now, then auto-renews at $119.98 every 24 weeks"
  - Landing also discloses "7-day introductory trial for $0.99 auto-renewed at $29.98 every month". Not offered at checkout in this capture.
  - "50% discount reserved for: 9:58" countdown. What you get: "A brain training plan, 35+ fun brain games, 200+ logic puzzles, A detailed analysis of your brain performance". Ratings "4.7 1 million ratings / 4.7 115k ratings".
  - No guarantee seen. No upsell captured (stopped at plan select).
- Disclaimers: "This chart is for illustrative purposes only". No medical claims. Gender tap = consent to T&C + tracking.
- Dark patterns:
  - consent bundled into the gender tap
  - "Save 50%" anchored against a renewal price that is actually the regular price
  - 10-min reservation timer
  - inconsistent social proof (100M+ downloads / 120M people / 3.4M people)
  - loader overlay micro-questions

## 3. Impulse: trauma.mental-impulse.com (run 513ac9ba09a938d507dc)
- ads 607 | captured 2026-09-28 | raw 40, 29 unique.
- IMPORTANT: same issue as #2. The capture is the IDENTICAL generic brain-training quiz: same 20 questions, same loader, same email gate, same 4/12/24-week paywall ($19.99→$39.98, $39.99→$79.98, $59.99→$119.98, "Save 50%", MOST POPULAR 4-week). No trauma questions or trauma result was captured in any of 3 full captures (09-06, 09-21, 09-28).
- Only differences: no name step; plan-ready screen shows the email ("…your 4-week brain training plan is ready!").
- Takeaway: Impulse runs subdomain-per-angle ad landings (archetype/trauma) that funnel into one shared brain-training quiz and paywall. The ad angle is only a hook; the product is the same.

## 4. memoryOS (run 475a5052229047be140d)
- URL start.memoryos.com/new-h | ads 1,650 | captured 2026-09-28 | raw 40, 34 unique. Encoder Inc., Delaware; support@memoryos.com.
- Questions: about 25 single-choice / short yes-no items with emoji options, in sections PROFILE → PERSONALITY → PREFERENCES. No N/XX counter. Not a test (no scored items).
- Flow spine:
  1. Age gate "Compare your results with others in your age group" (65+ … 18-24).
  2. Authority: "Kickstarter's #1 App BY THE WORLD MEMORY CHAMPION 'memoryOS is light years Ahead of Others in Memory Space' Google Brands Accelerator".
  3. Gender (with Skip). 4. Use case. 5. "Glad you're here!"
  6. Forgetting frequency. 7. "Weak memory is not your fault. 50% of what we try to learn slips away after the first hour, and over 90% after the first week."
  8-17. Pain points (names, dates, passwords, dementia concern "Is age-related memory decline or dementia a concern for you or your loved ones?"), each followed by a reassurance card ("You'll easily remember names…").
  20-25. PERSONALITY yes/no; "You came to the right place! Get ready to join 100,000 early adopters who on average see a rapid increase in recall precision by +79% and recall speed by +57%".
  26-30. Mind Palace explainer ("Our patented Virtual Memory Palace technology, combined with Duolingo-like microlessons…"); founder story card on Jonas von Essen ("Two Times World Memory Champion… Memorized the first 100,000 Pi digits").
  31-34. Learning style, motivation, "Ready to embark…?", daily commitment 5/10/15/20 min.
  35-36. Email. 37. "How can we call you?"
  39. "Your personal memory growth plan is ready. Memory Level… +70% in 4 Weeks" ("The chart is a non-customized illustration based on average user data"). 40. Long paywall.
- Result object: no test result; just a Now→Goal chart ("Struggling to Remember / Weak memory" → "Remember Everything Important / Master of Recall").
- Paywall (verbatim): "Invest in your brain today. Enjoy tomorrow." "Offer reserved for 10:00".
  - MOST POPULAR "12-WEEK PLAN SAVE 63% $99.99 $36.99 $1.19 → $0.44 per day"
  - "4-WEEK PLAN SAVE 70% $49.99 $15.19 $1.79 → $0.54 per day"
  - BEST DEAL "24-WEEK PLAN SAVE 50% $119.99 $59.99 $0.71 → $0.36 per day"
  - Renewal: "By purchasing, you agree you will be charged $36.99 today for your first 12 weeks. Then $99.99 every 12 weeks, starting 21 December 2026, until you cancel. Cancel in one step, any time, in Account Settings or in the app — no phone call or email required. We'll email you these terms now, plus a reminder before each charge."
  - Guarantee: "150% Money-Back Guarantee… return your money back plus a box of chocolates if you don't see results and can demonstrate that you followed our plan."
  - Footer: "PLEASE NOTE: You will be charged $99.99 every 12 weeks before you cancel." Long benefit list, about 30 user reviews, FAQ ("Isn't memoryOS too expensive?").
- Disclaimers: chart disclaimers only. Claims: "Scientifically proven & time-tested methods", "patented", "+79%/+57%/+70%".
- Dark patterns:
  - "11 people are viewing this page right now"
  - 10:00 offer timer
  - strike-through anchors and per-day reframing
  - dementia fear question
  - Early Adopters count inflates within one funnel (100,000 → 500,000+)
- Renewal disclosure is unusually clear and consumer-friendly.

## 5-7. TestLibrary autism / ADHD / archetype (runs 018006bc888a6bfdc1b2, 0535d0961eb988deba61, 89cd1b5fc05a6e34b3cd; also re-tried newer 0b57054bae3bcb75d16c, 4f7bdfb662d96c8a3b23)
- testlibrary.com/autism-test/ ads 1,314, captured 2026-09-02 (5 raw) and 2026-09-20 (14 raw).
- /adhd-test/ ads 1,155, same dates.
- /archetype-test/ ads 0, captured 2026-09-11, status "stuck", 14 raw.
- ALL runs return only 1 unique screen (landing + gender gate). Flow, questions and paywall were NOT captured.
- Landing copy: "Discover your Autism trait profile — Complete this 5-minute autism test to reveal how your unique traits shape who you are. Start by selecting your gender: Male / Female". ADHD and Archetype are the same template ("…to reveal what truly drives your decisions" for archetype).
- Hero mock widgets (OCR): "41%", "6250", "focused →", "4/5 (High)". Suggests the result uses trait % plus 1-5 level bars.
- Footer: "Cancel Subscription · Subscription Policy · Free Tests". Disclaimer: "The content on this website is intended for informational and educational purposes only. It does not... Read More".
- FB pages: "Mind Metrics", "TestLibrary - Created by Experts", persona "Michael Anderson", "Unleash Your Inner Archetype".
- Trackers: google_ads, applovin, meta, tiktok, sentry.

## 8. 64Personality (run ea5e24ccede5b7a55613, plus daf7c1977f6965bbb77c)
- URL 64personality.com/personality-64 | ads 0 (FB pages many: "Hot Personality Test", "Dangerous Personality Types", "Shadow Personality", "Personality Lab", persona names "Daythan Summers", "Katrin Schanze", "Maria Geraci") | captured 2026-09-28 (raw 51, 10 unique); the $1.98 version captured 2026-09-05 (raw 49, 10 unique).
- Company: FULL OF POTENTIAL LIMITED, Hong Kong. Trackers: meta, tiktok, snapchat, taboola, quora, pinterest, x, mediago, bing; payments via solidgate, stripe, adyen.
- Questions: "30 questions From different dimensions" (intro), but the captures show about 36 statements across 5 pages of 7-8. 5-pt DISAGREE…AGREE circle scale (16Personalities-style). MBTI plus added "A/O (Assertive vs. Oscillating) and H/C (Harmony vs. Calm) dimensions" gives 64 types.
- Flow spine:
  1. Long landing: "64 PERSONALITY TYPE TEST… 95% Accuracy Rate, 64 Personality Types, 210M+ Total tests taken". Testimonials tagged with type ("Sarah Chen INTJ-A / Architect"), "World Personality Map" country rankings. Price shown on landing: "Monthly Excellence $1.98 / 7 days INTRODUCTORY TRIAL then $28.8 / month".
  2. "Get ready…" (30 questions / Science-backed / Private & Secure / 10M+ Users).
  3-38. Multi-question Likert pages: "Be yourself and answer honestly… Grow into the person you want to be with your optional Premium Suite."
  ~45. Analysis loader "Your 64 Personality Type analysis is in progress". 48-50. Email "Please save your results below" (consent checkbox; stats "3,692,000+ Personality Tests Taken… 120,000+ Excellent reviews"). 51. Checkout = result teaser.
- Result object: masked type code "??F? - O?" (one letter revealed, e.g. F) with the archetype blurb "Mediators are poetic, kind, and altruistic people…". Trait bars free ("63% Extrovert, 29% Intuition, 63% Thinking, 61% Judgment"). Career / Personal Growth / Relationships sections are scrambled-text blurred and LOCKED. "YOUR PERSONALITY TYPE IS VERY RARE, ONLY 0.23%".
- Paywall:
  - (a) daf7 version, verbatim: "Total today $1.98 (-90%) Personality Result + Report $19.80 $1.98 / 7-day Trial to Premium Toolkit $7.2 $0 / After trial $28.80 / First recurring charge September 13, 2026". CTA "Order now". "You are enrolling in a monthly subscription… billed $28.80 per month until you cancel".
  - (b) ea5e 09-28: text layer says "Total today $19.8 (-51%) Personality Result + Report $39.8 $19.8 / Premium Toolkit $9.7 $0 / After trial $38.8". Consent: "I agree to pay $19.8 today for a 7-day Premium trial. Unless canceled… renew at $28.80/month starting October 5, 2026". CTA "Pay $19.8 & START SUBSCRIPTION".
  - (b) cont.: the screenshot OCR of the same screen shows "$1.98 (-90%)… $49.80 $1.98… $42 $0… After trial $28.80". So the price is A/B'd or swapped between DOM and render; verify live. Note "After trial $38.8" vs "$28.80/month" also conflicts.
  - "Bonus: Get 50+ best-selling tests for free" (Love Languages, Career Aptitude, IQ, Enneagram). Counter "Over 1 3 9 4 1 2 4 reports ordered". No money-back guarantee seen. No post-checkout upsell captured.
- Disclaimers: "Disclaimer: Our products and services are provided for entertainment and educational purposes only. They are not intended to provide professional psychological, medical, or diagnostic advice…"; "Please note that full reports for some tests are not free". Yet it claims "scientifically-validated assessment", "95% Accuracy Rate", "based on the latest psychological studies".
- Dark patterns:
  - partial type reveal (curiosity gap), "VERY RARE, ONLY 0.23%" (shown to everyone)
  - inflated strike-through anchors that change between versions ($19.80/$39.8/$49.80)
  - tiny trial price → $28.80/mo
  - rolling odometer "reports ordered"
  - contradictory social proof (210M+ tests vs 3.69M tests vs 10M+ users)

## 9. Chillio: "Let AI run your house" (run 39fdc5b9dca8e6af7b4e)
- URL quiz.get-chillio.app/qs/house-ai | ads 8,953 | captured 2026-09-28 | raw 54, 37 unique.
- Questions: about 25, no N/XX counter ("⏳ 3 minute quiz").
  - Single choice, about 8 multi-selects ("Choose all that apply"), and about 6 statement items "Do you relate to the statement below?" (👎 No / 🤷 Neutral / 👍 Yes, 3-pt; e.g. "I avoid starting tasks if I feel I won't do them perfectly")
  - 3 loader micro-questions
- Flow spine:
  1. Gender gate "Let AI run your house — According to your type and triggers" (Male/Female/Other; "By continuing, I agree with Terms of Use, Privacy Policy and Refund Policy"). 2. Age.
  3. "Over 250,000 people have chosen Chillio". 4. Main goal. 6. "Great, you just set your first goal!"
  7-14. Living situation, mess level, overwhelm frequency, stressors, blockers, toughest part.
  16. Authority: "Chillio is built on evidence-based productivity methods. Your plan draws on CBT techniques from peer-reviewed behavioral research." Harvard / Stanford / Cambridge logos plus "Chillio is not affiliated with, endorsed by, or sponsored by these institutions."
  17-22. Relate-to-statement items.
  23. Profile: "Summary of your Personality Profile — Overthinking and procrastination play a big role in how you manage your home"; Cleaning type: Perfectionist; Procrastination Very High; Overthinking Very High (Low-Normal-Medium-High gauge).
  24-34. Habits to start/break, fun features, Before/After card ("Cluttered space → Organized life… Results may vary"), feelings, daily time.
  35. "The only AI you need to keep your home running smoothly… within 3 months" chart.
  36-45. Loader "We're setting up your transformation…" (Defining your goals / Learning about your space / Creating your cleaning plan / Building your daily routine) with overlay yes/no and Trustpilot reviews.
  47-48. Email "Included with your plan: Printable Cleaning Planner". 49-50. First name.
  51. "83% of Chillio users feel in control of their life in just 4 weeks". 52-53. Scratch card "Scratch to reveal your discount!… 50% discount… Your promo code! eric_september26 Applied automatically at checkout!" 54. Checkout.
- Result object: free "Personality Profile" card (Cleaning type + Procrastination/Overthinking levels). Paywall header repeats "Main challenge: Inconsistent routine / Goal: Get more done" plus Now-vs-After gauges.
- Paywall (verbatim): "Your promo code applied! eric_sep26 09:59", "until 50% offer expires".
  - "1-Week Trial 4-Week Plan First week for $10.50 $21.00 $10.50 50% Off"
  - Most popular "4-Week Plan First 4 weeks for $19.99 $39.99 $19.99 50% Off"; bonus "Cleaning planner (PDF)"
  - "12-Week Plan First 12 weeks for $34.99 $79.99 $34.99 50% Off"
  - Disclosure: "By clicking Get my plan, I agree to pay $19.99 for my plan and that if I do not cancel before the end of the 4-week introductory plan, it will convert to a 4 weeks subscription and Chillio will automatically charge my payment method the regular price $39.99 every 4 weeks thereafter until I cancel…"
  - "30-day money-back guarantee… if you don't see visible results and can demonstrate that you followed our plan". Stats "88% of users left positive reviews on Trustpilot (as of June 2026)". "As featured in Forbes, Mashable, TechCrunch, healthline, verywell mind".
- Disclaimers: "not affiliated with, endorsed by" university logos; "The chart is a non-customized illustration and results may vary". No medical claim beyond "CBT techniques".
- Dark patterns:
  - university-logo authority borrowing (with disclaimer)
  - gamified scratch-card promo with personalised code, 10-min timer
  - "50% Off" vs regular renewal price
  - loader micro-questions, PDF bonus as sweetener

## 10. Breeze: Childhood trauma (run 344bf541e5f6c02ebc69)
- URL try-breeze.com/funnel/childhood/ | Mental Health | ads 1,262 | captured 2026-09-28 (geo shown as Germany, EUR) | raw 47, 38 unique. Earlier versions: 09-21 (52), 09-02 (55).
- FB pages: "From trauma freeze to inner peace", "Heal and abstract trauma impact", "Healing insights. From trauma to Self-Discovery", "Survive and Thrive". Support: support@breeze-wellbeing.com.
- Questions: about 28, in a 4-section stepper ("Your history" → "Tendencies" → "Struggles signs" → "Final question"). No N/XX counter. Mix:
  - Single choice and multi-selects
  - 4-pt relate scale ("Strongly relate / Somewhat relate / Hardly relate / Can't relate"), yes/no/not sure
  - About 10 ambiguous-image "What do you see first?" items (Evil eyes/Fire, Young woman/Skull, Shark/Leg, Child/Eye, Two people/Monster face, Home/Horse…)
  - An AUDIO illusion ("You're about to hear a short sound. It may feel unusual or slightly uncomfortable. What do you hear first? Please stop / Breeze mom"; "Continue without sound")
- Flow spine:
  1. Gender ("Why we ask"). 2. Age.
  3-4. "In your childhood, your parents were…" (Happily married … I had no parents); growing-up environment multi (Nurturing / Chaotic / Unsafe / Neglectful and lonely…).
  6. Audio illusion. 7-8. Image illusions.
  9-11. Coping statement; "Do you see depression or low mood as 'normal'…?"; "How long have you been feeling this way?"
  12. Breathing pause "Let's take a moment. Take one slow breath before we continue".
  14. Interstitial "Did you know? Childhood trauma has different lasting mental effects on each gender. That's why creating a tailored treatment plan is key…"
  15-23. Tendencies: spotlight feelings, relationship patterns multi, "I'm repeatedly drawn to people who treat me poorly". Testimonial card "With Breeze, I finally embraced my past — Liam 4.9".
  24. "We understand that each childhood experience is unique…"
  25-30. Struggles: low self-worth, goals multi ("Reconnect with my parents", "Learn to set boundaries"…). 32. Commitment length (2 weeks … 6 months).
  33-34. Name. 35. "Breeze Effect" before/after bars (Sleep, Relationships, Health, Self-acceptance; "Results shown are for illustrative purposes only"). 36. "You did something beautiful for yourself".
  37-39. Loader "Calculating your results…" (Analyzing your childhood environment / Identifying your most prominent patterns / Understanding the impact of past experiences / …personalized supporting plan). Overlay yes/no micro-questions are clinical-symptom style: avoidance, "constantly on edge", eating changes. "Excellent 4.8 based on 27 000 reviews".
  40. Email gate "Your results are ready… we guarantee its 100% safety and privacy", CTA "Explore results".
  44. "Confirm your country 🇩🇪 Germany — We ask for your country to customize your offer". 45. "Feel the difference in just 7 days" Before/With Breeze list. 46. Profile. 47. Paywall.
- Result object: "Your personalized childhood experience profile is ready". Trait tags: Emotional detachment, Fear of intimacy, Anxiety, Trust issues. Then "This plan will help if you experience…" lists (Emotional Vulnerability, Feeling Stuck, Relationship Problems, Insomnia and Stress) and the "28-Day Resilience Support Plan". The full results are locked ("Ashley, see your full Childhood experiences results").
- Paywall (verbatim): PAY-WHAT-YOU-WANT trial: "Choose any amount you like €1 €2 €10 €17.34 — Cost to cover our team's effort. It costs us €17.34 to provide this trial offer, but we want you to choose what feels right for you."
  - Capture picked €10: "Your 7-day trial for €10.00… Total today 7-day trial €1.43/per day Billed at €10. Price after trial 4-weeks plan €1.00/per day Billed at €29.99".
  - Disclosure: "Your 7-day trial will last until 05:21 AM, Oct 5, 2026. Then your monthly Subscription Period will start and you will be charged €29.99 every month. No partial refunds applicable. You may cancel at any time…"
  - Trial timeline "Today → Day 5 Reminder about the end of a trial period → Day 7 Your trial will be converted to a full price unless it is canceled".
  - Includes: "50+ expert-crafted personality tests, Personalized 28-day plan, Personalized routine & tools, Calming games". Google Pay primary, then card. "Google Play 3M+ downloads / App Store 4.9 out of 5 65K 5-star rating". No money-back guarantee seen. Timer hint on country screen.
- Disclaimers: FAQ item "Can this quiz replace professional evaluation?" (answer not captured); "Results may vary"; "Many users report feeling better after reading our guides. Individual experiences may differ". No explicit "not a diagnosis" banner captured. Uses "treatment plan" wording in the interstitial.
- Dark patterns:
  - pay-what-you-want anchor with a guilt line "It costs us €17.34…"
  - per-day reframing (€1.43/day trial vs €1.00/day plan makes the renewal look cheaper)
  - "No partial refunds"
  - distressing stimuli (skull/monster/evil imagery, uncomfortable audio)
  - loader symptom micro-questions
  - generic first-name reviews with uniform 4.9
