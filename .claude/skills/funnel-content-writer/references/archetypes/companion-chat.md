# Archetype — companion-chat

**Shape:** User picks (or is matched with) an AI character → chats in an ongoing story that builds memory and intimacy → pays a subscription to remove the daily message limit and unlock depth (memory control, voice, personas).
**Signals:** AI girlfriend/boyfriend, roleplay, character chat, companion. The product is a loop, not a result. Free tier meters messages per day, the value compounds over time (the character remembers), and there's often an intimacy/level system unlocking photos. Usually 18+.
**Modeled on:** ChatChi design (`chatchi-design/`) → `funnel/funnel-development/chat-ai-character/chatchi/funnel-content.md`. Category reasoning from Character.AI, Talkie, Chai and Replika onboarding (catalog → taste picks → chat → limit-hit paywall). Unverified by live teardown.

## Default flow (16-22 screens)

**A. Hook** (2-3) — the character promise (portraits) · the memory differentiator · pricing honesty (no coins / no per-message).
**B. Investment** (4-6) — **age gate first** (before anything romance-flavoured) → name capture → 3-4 cheap taste picks that genuinely drive the match: who to meet · genres · connection type · character vibe. Cap it there, because more questions only delay the loop.
**C. Trust** (1) — privacy promise ("chats stay private, delete anytime"), or a real usage stat.
**D. Anticipation** (4-6) — matching loader → match reveal (portrait + bio + voice) → **opening scene with reply ideas** → **1-2 chat screens, at most 2 user messages** showing memory + intimacy, then a typing hand-off → a first reward from the real mechanic (first photo moment) → notification opt-in (daily check-in / streak).
**E. Gate** (1) — **mandatory email only** (no Apple/Google, no guest), framed as "save your story".
**F. Monetization** — **hard web paywall** right after the email gate. Declines go to a per-plan sale → lifetime → back to the paywall; there is no free chat. After purchase come a one-time add-on upsell and get-app. (ChatChi rules: `../app-rules.md`.)
**G. Payoff** (1) — drop back into the same scene, mid-story.

## Monetization

**ChatChi (owner rule, 2026-10-06): hard paywall, no free tier.** The generic pattern below applies only to apps without rules. Usually **one subscription with two triggers**. The onboarding paywall comes right after the first scene, and the limit-hit paywall comes at the Nth message. Measure them separately, because the limit-hit one converts on real intent and is the fallback when the onboarding one is dismissed. Photo moments / intimacy are an engagement lever that drives message volume, not a separate revenue layer, unless the app sells coins. If it does, treat coins as a second metric, like `personalization-quiz`.

Plan structure: yearly pre-selected with a per-week price vs. weekly. Disclose any fair-use cap behind "unlimited".

## Traps

- **Age gate before everything suggestive.** Hooks and ad creative stay SFW, and 18+ content stays opt-in.
- **Never monetize in the character's voice.** No "I miss you", "don't leave", "pay so we can keep talking" in pushes or paywalls. It's emotional manipulation and an active regulatory target for companion apps.
- **Keep the AI disclosure visible** on every chat screen.
- **Don't build a long quiz.** The first scene is the demo, and every extra question is time not spent in the loop.
- **No fake gamified wheel** when the app has a real reward mechanic (hearts → moments). Use that instead.
- **Don't drop the user on a catalog grid** after onboarding. Start a scene for them, because a blank grid is where first-session drop-off happens.
- "Unlimited" needs its fair-use cap in the microcopy, or it's a false claim.

## Known variants

- `chatchi` (20 screens) — reference implementation. Freemium 10 messages/day, guest mode, "no counting" brand promise, so no countdowns and a dismissible paywall with no fallback discount. The limit-hit card is the second ask.
- `chai-romance-stories` (17 screens) — Chai, web2app, modeled on Whisper + Candy AI series. The unit is a *chapter*: trope pick first (hook merged with age gate), 5-tap quiz incl. narrator-voice pick, narrated chapter 1 with chat inside, chapter card as reward, paywall right after the chapter cliffhanger, chapter lock added as a trigger beside the message limit, notification opt-in moved after the paywall.
- `chai-companion` (19 screens) — Chai, "AI that listens" niche modeled on Honey minus its body quiz. First tap "How was your day?" seeds memory; adds a wellbeing layer (persistent crisis link, "friend, not a therapist" screen, crisis-text detection, paywall/limit card suppressed on crisis paths); cliffhanger = consented follow-up; reward = memory journal + streak; extra day-2 "they remembered" screen.
- `chai-ai-boyfriend` (17 screens) — Chai, SFW "book boyfriend" for women, modeled on Whisper's "who is he" archetypes with sexual descriptors stripped. First tap = archetype; picks are voice, love style, meet-cute; "you set the pace" trust screen; he texts first; reward = first voice note instead of a photo; good-morning texts opt-in with a no-guilt, 3-day-silence push rule.
- `chai-ai-girlfriend` (21 screens) — Chai, SFW "design your AI girlfriend" for men 21+, modeled on Honey 4202-2's structure with every body/libido/kink/fetish input stripped. The "design her" shape replaces catalog matching: hook + 18+ year gate → a 6-tap appearance builder (hair colour, age 21+ only, hair style, eyes, fashion, optional details) with a live-updating 3D preview card as the hero → bridge → names → goal → 4 SFW sliders (warmth, playfulness, sweet flirtiness, talkativeness) → SFW meet-cute pick → loader with one inline yes/no that changes her first text (emojis) → private profile card → a short "she texts first" taste → soft gate → honest 1/3/12-month paywall (renewal on every card, no struck anchors, placeholder prices) → daily-hello opt-in after the paywall.
- `chai-dream-girl` (14 screens) — Chai, close SFW clone of Honey 4202-2 as re-crawled 2026-09-30, the Honey-shaped control beside `chai-ai-girlfriend`. Keeps Honey's order and photo-card grids: ethnicity (hook, 18+ via legal line) → age 21+ → figure (clothed) → hair → looks multi → bridge → looking-for → 3 SFW sliders → do-together multi → 8 SFW scenario cards → 3-row loader with 3 inline yes/no (selfies, voice notes, good-morning texts) → long-scroll paywall (hero, plans, "built for you" match, benefits, stats, chat mock, reviews, plans again). No names, no gate, no first-chat taste before the paywall; she texts first after it. Countdown, struck prices and $/day cut; proof blocks are config placeholders.
- **chat-ai-character/chai-roleplay** (2026-10-01): SFW multi-genre roleplay, scene-first; 18+ year gate, genre/role/setting/tone picks, three live scene turns with memory toast before soft email gate; open lane, unverified.
- **chat-ai-character/chai-named-character** (2026-10-01): one template run per named character as content rows; character opens three scripted turns, asks user's name, "they remember" recall beat, voice note; daily-limit card after offer.
- **chat-ai-character/chai-short-drama** (2026-10-01): unit is an episode (EP1-2 free, EP3 locked); series pick, two vertical-story episodes, lead quotes episode details in chat; offer is one-time series pass, then EP3 plus limit card.
- **chat-ai-character/chai-create-your-ai** (2026-10-07, 26 screens): near 1:1 clone of Chai's live ad funnel `quiz.chai-ai.com/v2` (54/64 active Meta ads). Hook doubles as the first quiz tap → who you like / your gender / age bracket / chat kind / anime-vs-photo → reference-image grid → name, age, personality, meet place, shared memories → "now about you" bridge → your name + background → LLM writes 4 scenario plots → pick one → TTS of the first message, 5 voices → email → spin wheel (always 50%) → paywall with a 10-min timer and name promo code, 1/4/52-week intro plans. Owner exceptions: no chat taste, weekly plans, wheel and timer kept (overrides the "no fake wheel" trap here).
- **chat-ai-character/chai-kpop-idol** (2026-10-08): `chai-create-your-ai` with idol imagery on every screen (Chai's peeking K-pop star / webtoon prince). All idols are original fictional characters — never a real idol's face or name (Chai uses a real star's photo; that's a likeness-rights and ad-policy risk we don't copy).
