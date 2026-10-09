# Screen block library

The vocabulary every funnel in this repo is assembled from. A block is a *job*, not a fixed screen: the same block is one screen in one app and six in another (a quiz block is 2 screens in a photo app, 9 in an astrology app).

Pick blocks, order them, repeat them as the app needs. Nothing here is mandatory except what the app's own psychology demands.

Legend: **Fields** = the per-screen fields this block needs in the output file (see `file-format.md`).

---

## Stage A — Hook

### Hook
**Job:** State the promise against the user's "before" state, before asking for anything.
**Use when:** Always. 1-3 screens; 3 when the funnel is long and needs to sell the wait.
**Skip when:** Never fully — but collapse to 1 screen for utility apps where the value is self-evident.
**Copy pattern:** Screen 1 = emotional promise. Screen 2 = social framing ("millions already do this"). Screen 3 = speed/ease ("ready in 2 minutes").
**Fields:** Purpose, Headline, Body, Visual, CTA.

### Trust badge / award bar
**Job:** Borrowed credibility in the top bar (award badge, "featured in" strip) on early screens.
**Use when:** Category is trust-sensitive (health, finance, astrology) or CPI-driven traffic is cold.
**Fields:** folded into **Microcopy** + **Visual** on hook screens, not its own screen.

---

## Stage B — Investment

### Quiz question
**Job:** Cheap taps that raise sunk cost and segment the user. Two short questions beat one long one.
**Use when:** Almost always. Count depends on archetype: 2-3 for transformation apps, 6-12 for personalization/data apps where the quiz *is* the product demo.
**Skip when:** The app needs zero personalization to deliver value.
**Copy pattern:** Question as headline, helper line as body, 4 options, "✏️ Other" as the escape hatch. Single-select by default; multi-select only when the answer is genuinely plural (then say so in Body and gate the CTA on ≥1 pick).
**Fields:** Purpose, Headline, Body, Options, Field (select mode), Visual, CTA.

### Personal-data input
**Job:** Collect a real datum the output genuinely depends on (birth date/time/place, weight, goal, age).
**Use when:** The product's accuracy depends on it — and only then. Every one of these is a drop-off cliff.
**Skip when:** It's "nice to have" analytics data. Cut it.
**Copy pattern:** Body explains *why* you need it. High-friction fields get a skip link with a reassuring fallback ("No worries — we'll estimate it").
**Fields:** Purpose, Headline, Body, Field, Visual, Error state, CTA, (Skip link).

### Name capture
**Job:** Gets the `{{name}}` token that personalizes every later screen.
**Use when:** Any funnel with a generation/reveal step. Place it *before* the preference questions — the name is what makes later screens feel personal.
**Fields:** Purpose, Headline, Body, Field, Visual, Error state, CTA.

### Asset upload
**Job:** The one real input in transformation apps (photo/video/voice).
**Use when:** The product transforms something the user owns.
**Skip when:** The app generates from answers alone (astrology, fitness plans, journaling).
**Copy pattern:** Big dashed upload box, verb CTA ("CREATE NOW"), a value line under the CTA ("Not just one look — 50 styles included"), a collage of finished results at the bottom edge.
**Fields:** Purpose, Headline, Body, Field, Value line, Visual, CTA.

### Bridge / reassurance
**Job:** Break up a long input sequence: "every answer sharpens your result", progress hint, keeps quiz fatigue low.
**Use when:** The investment stage runs past ~5 screens.
**Skip when:** Short funnels — it's dead weight.
**Fields:** Purpose, Headline, Body, Visual, Microcopy (progress hint), CTA.

---

## Stage C — Trust

### Social proof interstitial
**Job:** A trust beat placed at the exact point friction peaks — right after the hardest inputs, right before the gate.
**Use when:** At least once; twice in funnels longer than ~15 screens.
**Copy pattern:** One huge number as headline (usage count, accuracy %, review count), one supporting line, press logos or a star row beneath, optionally a named quote card.
**Fields:** Purpose, Headline, Body, Visual, Microcopy (quote/logos), CTA.
**Trap:** Match the proof to the audience — pet press for pets, women's lifestyle press for astrology, fitness press for fitness. Never carry placeholders across niches unchanged.

---

## Stage D — Anticipation

### Generation / loading
**Job:** Manufacture the wait so the output feels expensive to produce, and tease the result.
**Use when:** Anything "AI generates" something. This is also the highest-value screen for ad creative.
**Copy pattern:** Headline uses `{{name}}`. Instead of Body, four labeled progress rows, each with a % counter, checkmark and bar: three describing the work, a fourth teaser ("Almost ready — your first preview awaits"). Auto-advances, no CTA. Rotating testimonial cards optional.
**Fields:** Purpose, Headline, Steps, Visual, Microcopy, CTA (auto-advance note).

### Preview / tease
**Job:** Flash what's behind the paywall before asking for anything — desire before price.
**Use when:** The paywall sells a bundle of features rather than one output.
**Fields:** Purpose, Headline, Body, Visual, Microcopy (benefit rows), CTA.

### Before / after
**Job:** Contrast life without vs. with the app — the last emotional push before the gate.
**Use when:** Outcome apps (health, mental health, fitness, guidance). Weak for novelty/entertainment apps.
**Fields:** Purpose, Headline, Body, Visual, Microcopy (side labels), CTA.

### Notification opt-in
**Job:** Locks the daily-open habit before the account even exists.
**Use when:** The product has a daily loop (horoscope, streaks, reminders).
**Skip when:** One-shot novelty output — the ask buys nothing.
**Fields:** Purpose, Headline, Body, Field (time picker), Visual, Microcopy (sample push), CTA, Skip link.

### Gamified reward
**Job:** A spin/scratch win right before the paywall so the price feels earned, not asked for.
**Use when:** Impulse-purchase categories (photo/video novelty, entertainment).
**Skip when:** The category's credibility would suffer (health, finance, astrology) — a wheel cheapens a "serious" promise, and the product's own reveal already plays that role.
**Fields:** Purpose, Headline, Body, Prize, Visual, CTA.

---

## Stage E — Gate

### Registration / account gate
**Job:** Capture identity before the value is revealed.
**Use when:** Always, unless the platform's policy forbids gating.
**Copy pattern:** **Email only**: one validated email input, a mandatory step with no skip, guest or "later" link. **No Google / Apple / social sign-in** (owner rule; the email activates the subscription in the app). It sits right before the paywall. The headline ties to saving their result ("Where should we save {{name}}?"), and the body says why ("We use it to activate your Plus and save your chat."). The legal line under the CTA has real Terms and Privacy links.
**Fields:** Purpose, Headline, Body, Field, Visual, Error states, Microcopy (legal line), CTA.

---

## Stage F — Monetization

### Paywall
**Job:** The primary ask.
**Shape: a web-funnel landing page, not an in-app sheet.** These funnels run on the web after a Meta ad (web2app), so the paywall is a **long-scroll sales page** that sells the result the user just built, then asks twice. A compact "2 plan cards + CTA" screen reads like an app store sheet and under-sells on web. User direction, 2026-09-30.
**Section stack (top → bottom), cut what the app can't back with real data:**
1. **Sticky top bar**: brand, close X, and a mini CTA that fades in once the first plan block scrolls away.
2. **Personal hero**: eyebrow ("Your reading is ready"), headline naming *their* result, their own artifact (photo, chart, sketch, character) next to 3-4 fact chips drawn from their answers.
3. **Plan block #1**: in one card, 2-3 plans (annual pre-selected with a ribbon, per-week equivalent small), a "Due today" row, CTA, payment-method badges, "Secure checkout · Cancel anytime", and the renewal line for the selected plan.
4. **What's inside**: a table of contents of the product. The first item is open, the rest locked or blurred.
5. **How it works**: 3 steps from checkout to the app (web2app handoff).
6. **Proof**: rating + reviews. **Only real data**; otherwise the block hides or shows visible placeholders.
7. **Guarantee**: only if the refund policy exists.
8. **FAQ accordion**: when do I get it · how to cancel · will I be charged again · what happens to my data/photo · accuracy/entertainment disclaimer.
9. **Plan block #2**: the same component again.
10. **Footer**: legal links, entity, disclaimer.
11. **Sticky bottom CTA**: it shows the selected plan and today's charge, and it is visible **from first view**. It hides only while a plan-block CTA is on screen. Give it a solid background, and pad the footer so it never covers the last line.
**First-view rule:** at 375×667 and 430×932, the user sees a CTA and a price without scrolling. Legal and support links are real links: underlined, at least 13px, with a tap area at least 40px tall. Sticky bars have a solid background.
**Hard paywall:** when the app's rules say so (`app-rules.md`), there is no free tier, no "Continue free", and every decline returns to the paywall.
**Copy pattern:** 2-3 plan cards. With 3, the middle tier is a deliberate decoy that makes annual read as obvious value. Annual is pre-selected with a savings ribbon and a small per-week price. Trust row and auto-renew fine print sit under every CTA. **Describe the structure; only use real numbers when the user supplies them.** No countdowns or struck "was" prices unless the offer genuinely expires or the reference price is real.
**Fields:** Purpose, Headline, Body, Plans, Visual (list the sections used), Microcopy (FAQ answers, renewal line, guarantee), CTA, (Fallback offer).

### Fallback offer (the "upsell on decline", required)
**Job:** Second chance after a paywall close without paying: a lower first price, a trial, or a lighter tier. The team calls this "Upsell"; in funnel terms it is a downsell.
**Use when:** the app's rules in `app-rules.md` decide the shape. **ChatChi:** a per-plan sale on leaving a checkout, then a lifetime offer, then back to the paywall (no free path). **Starlyn:** none. Apps without rules: one fallback offer, per the default below (user direction, 2026-09-30). The paywall's close X and every "no thanks / continue free" link go here first. Only after it is declined does the user reach the free path, the limited result or the app handoff.
**Rules:**
- **Shown once per user session** (sessionStorage flag). A second paywall close goes straight to the free path.
- **Real terms only.** Offer price, renewal price and period are placeholders until the app supplies them. The struck "was" price may only be the real current price of the plan being undercut.
- **Timer only when the deadline is real.** When `expiresMin` is set, the offer is withdrawn when it ends. Never reset it on reload.
- **Same web-page look as the paywall:** sticky bar with close, an eyebrow "One-time offer · shown once", a headline tying back to their result, and one offer card holding their artifact thumbnail, a price row (struck regular price → offer price, "today"), 3 checks, CTA, payment badges and the renewal line. Below the card, a plain decline link naming what they keep for free.
- **Events:** `offer_view`, `offer_accept` (+ `checkout_click` with plan `offer`), `offer_decline`, `offer_expired`. Measure offer CVR separately from paywall CVR.
- **Brand promises still win:** if the app promises "no discounts / price shown first" (e.g. Starlyn), the offer is a lighter tier or a trial at the listed price, not a markdown.
**Fields:** its own screen: Purpose, Headline, Body, Plans (the one offer), Visual, Microcopy (timer rule, decline link), CTA. The paywall screen's `Fallback offer:` field points to it.

### Post-purchase upsell
**Job:** Sell a one-time add-on while intent is still hot, right after the subscription purchase.
**Use when:** There's a discrete add-on worth buying (an extra report, a bonus character, extra styles). It is a hidden one-time plan (`addon`) with **its own checkout and price**, and the subscription just bought stays as it is.
**Routing:** paid, skipped or checkout closed → the get-app screen (with an "added" line when paid). Buyers of a one-time lifetime plan skip it.
**Countdown:** only when the deadline is real.
**Fields:** Purpose, Headline, Body, Visual, Microcopy (timer, skip link), CTA.

### Secondary revenue
**Job:** A separate revenue stream (pay-per-minute chat, marketplace, consumable credits) introduced after trust is established.
**Use when:** The app has one. Treat it as its own metric, not part of paywall conversion.
**Fields:** Purpose, Headline, Body, Visual, Microcopy (price disclosure), CTA, Skip link.

---

## Stage G — Payoff

### Reveal / result
**Job:** Deliver the thing, interactively where possible, so the purchase feels justified.
**Fields:** Purpose, Headline, Body, Visual, Microcopy (sample content, share row), CTA.

### Success / download (get the app)
**Job:** Confirm and hand over the artifact. In web2app funnels this is the get-app screen: a check, "You're in", and 3 steps (download the app · log in with your checkout email · open your result). It has an "Open the app" CTA and store badges that look like the official black badges.
**Open the app** routes by device and fills the tokens: email, the FunnelFox user id, and utm/fbclid captured on the first screen. The links per app are in `app-rules.md`.
**Use when:** The output is a file the user saves or shares.
**Fields:** Purpose, Headline, Body, Visual, CTA.

### Share / rating / referral
**Job:** Extend the relationship at peak satisfaction.
**Use when:** The output is inherently shareable, or the app needs store reviews.
**Fields:** folded into the reveal/success screen as **Microcopy** unless it's a full screen.
