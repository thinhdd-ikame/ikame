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
**Copy pattern:** Email + password, plus Apple/Google sign-in. Legal line under the CTA.
**Fields:** Purpose, Headline, Body, Field, Visual, Error states, Microcopy (legal line), CTA.

---

## Stage F — Monetization

### Paywall
**Job:** The primary ask.
**Copy pattern:** 2-3 plan cards. With 3, the middle tier is a deliberate decoy that makes annual read as obvious value; annual pre-selected with a savings badge and a per-week price shown small. Trust row (secure payment · cancel anytime · refund window) and auto-renew fine print. **Describe the structure; only use real numbers when the user supplies them.**
**Fields:** Purpose, Headline, Body, Plans, Visual, Microcopy, CTA, (Fallback offer).

### Fallback offer
**Job:** Second chance after a paywall dismiss — trial, discount, or cheaper tier.
**Use when:** Hard-gated funnels, always worth specifying.
**Fields:** folded into the paywall screen as **Fallback offer**, or its own screen when the offer differs materially.

### Post-purchase upsell
**Job:** Sell an add-on while intent is still hot, with a countdown.
**Use when:** There's a discrete add-on worth buying (extra report, extra styles, HD pack).
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

### Success / download
**Job:** Confirm and hand over the artifact.
**Use when:** The output is a file the user saves or shares.
**Fields:** Purpose, Headline, Body, Visual, CTA.

### Share / rating / referral
**Job:** Extend the relationship at peak satisfaction.
**Use when:** The output is inherently shareable, or the app needs store reviews.
**Fields:** folded into the reveal/success screen as **Microcopy** unless it's a full screen.
