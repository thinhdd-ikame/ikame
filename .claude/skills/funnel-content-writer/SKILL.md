---
name: funnel-content-writer
description: Write the screen-by-screen onboarding + paywall content brief (funnel-content.md) for a mobile app funnel in ANY category — AI photo/video generators, astrology & personality quizzes, fitness, mental health, chat/companion, utility, subscription content, marketplace. Picks the funnel shape that fits the app instead of forcing one template: classifies the product archetype, assembles the flow from a screen-block library, and writes to funnel/funnel-development/<path>/funnel-content.md. Use whenever the user asks to write funnel content, viết content funnel, tạo funnel mới cho <app/ngách>, draft onboarding/paywall copy, or just names a niche and says "làm funnel cho X" / "content cho ngách X".
---

# Funnel Content Writer

Produce the content brief for a mobile app's onboarding → paywall funnel: every screen, its job, its copy, its visual note. Markdown only — never code.

**This skill is deliberately open-ended.** There is no single house template. Different app categories monetize through genuinely different flows (a photo app sells one transformation; an astrology app sells a personalized reading built from a 9-screen data quiz; a fitness app sells a plan). Screen count and sequence follow the niche's own funnel psychology. What stays fixed across every funnel this skill writes is only:

1. the **stage arc** (§3) every consumer subscription funnel walks through,
2. the **copy rules** (§5) — this is real mobile UI copy,
3. the **file format** (`references/file-format.md`) — so downstream skills can parse any funnel this repo produces.

Everything else — how many screens, which blocks, in what order — is a per-app decision you make and justify.

## Workflow

1. **Intake** — pin down the app (§1).
2. **Classify** — pick the archetype, or derive a new one from a competitor teardown (§2).
3. **Assemble** — build the screen sequence from the block library (§3).
4. **Write** — per `references/file-format.md` plus the copy rules in §5.
5. **Register** — record the archetype so the next funnel reuses it (§6).

---

## 1. Intake

If it isn't already clear from the conversation, ask once, briefly, in a single message:

1. **App / niche name** — becomes the folder, kebab-case.
2. **What the user gets, and what they give to get it** — e.g. "uploads a cat selfie → gets a royal portrait", "answers birth date/time/place → gets a personalized reading", "logs weight + goal → gets a workout plan". This one answer usually decides the archetype.
3. **Monetization** — subscription paywall only, or paywall plus upsell / consumable / marketplace? If unknown, assume a hard subscription paywall and say so.
4. Optional: real pricing, a real competitor to model on, brand/visual constraints.

Don't over-ask. If the answers are obvious from context, proceed and state your reading of them in the intro paragraph of the output file.

## 2. Classify the archetype

Read `references/archetypes/README.md` and match the app against the registered archetypes. Each archetype file gives a default flow, the monetization shape, and the traps specific to that category.

**If nothing fits** — that is expected, not a failure. Then:

1. Name 2-3 real apps leading the niche and do a quick teardown of their onboarding: what they ask, in what order, where the gate sits, how many layers of monetization. Use web research if available; otherwise reason from the category and say in the file that the flow is unverified.
2. Design the sequence from the block library below.
3. Write a new archetype file (§6) so the next app in that category starts from it.

Never bend an app into an archetype that doesn't fit just because the archetype exists. A wrong flow shape costs far more than a few minutes of teardown.

## 3. Assemble the flow

`references/blocks.md` is the library: each block has a job, when to use it, when to skip it, and which fields it needs. Compose the funnel from blocks, in the order the app's psychology wants.

Every funnel walks this arc, but the number of screens per stage is yours to decide — a stage can be 1 screen or 9:

| Stage | Job | Typical blocks |
|---|---|---|
| **A. Hook** | Promise + emotional "before" state, before asking for anything | Hook, trust badge |
| **B. Investment** | Each tap raises sunk cost and sharpens personalization | Quiz question, personal-data input, name capture, asset upload, bridge/reassurance |
| **C. Trust** | Proof beats placed at the friction points, not bolted on at the end | Social proof, press logos, testimonial, stat |
| **D. Anticipation** | Manufacture the wait, tease the payoff | Generation/loading, preview/tease, before-after, notification opt-in, gamified reward |
| **E. Gate** | Capture identity before the value is revealed | Registration / account gate |
| **F. Monetization** | The ask, plus any second layer | Paywall, fallback offer, post-purchase upsell, secondary revenue |
| **G. Payoff** | Deliver the thing, then extend the relationship | Reveal/result, success/download, share, rating, referral |

Sanity checks before writing:

- **Is every screen earning its place?** If a screen's only job is "the template has one", cut it.
- **Is friction ordered right?** Cheap taps first, high-friction inputs after investment, the upload/identity ask last.
- **Does a trust beat sit immediately after the highest-friction screen?**
- **Is the payoff gated?** The user should never see the finished value before the gate/paywall.
- **How many monetization layers?** If there are two (subscription + consumable/marketplace), they are separate metrics — write both, and say so in the notes.

## 4. Where the file goes

`funnel/funnel-development/<category>/<niche>/funnel-content.md`, or `funnel/funnel-development/<niche>/funnel-content.md` when the app isn't part of a category line. Reuse an existing category folder (`dancing/`, `halloween/`, `photo-bw/`, `fitness/`, `mental-health/`, `chat-ai-character/`, …) when the app belongs to one — that folder name is what the downstream creative skills mirror into `funnel/creative-development/`.

Format is specified in `references/file-format.md` — **read it before writing**. It defines the frontmatter contract (machine-readable: archetype, subject, which screens are ad-creative candidates) and the per-screen field catalogue.

## 5. Copy rules (every funnel, every archetype)

This is real in-app UI copy on a phone screen, not a written brief.

- **Headline:** ≤6 words, one idea, no subordinate clause.
- **Body:** ≤12 words, one sentence. On quiz screens it is the helper line under the question (~8 words) — it says why you're asking or what happens next, never a restatement of the headline.
- **Options:** emoji + 1-3 words. On any free-choice question, end the list with an "✏️ Other" escape hatch that opens a one-line input — never leave a user stuck between four options that all miss.
- **Field / CTA:** 1-4 words. On the key action screen use a verb CTA ("CREATE NOW"), not "Continue".
- **Loading steps:** 4-7 words per row, warm and human, ending in "…" — describe care and craft, not engineering.
- **Visual:** exempt from the length rules — it's a note for the designer, not on-screen text. Default look and per-block layout patterns are in `references/visual-language.md`; override them when the app has its own brand or audience, and say so in the intro.
- **Personalization:** capture a name early and reuse it as a `{{name}}`-style token on later screens. One token per entity (`{{name}}`, `{{cat_name}}`), used consistently.
- Write it, then cut every word not doing work. Tighten the wording rather than truncating it.

## 6. Register the archetype

After writing the funnel:

- **Existing archetype, followed as-is** → nothing to do.
- **Existing archetype, deviated from** → add a line under that archetype's "Known variants" noting what changed and why.
- **New shape** → create `references/archetypes/<name>.md` from the template at the bottom of `references/archetypes/README.md`, and add a row to its index table. Keep it short: signals, default flow, monetization, traps.

This is what keeps the skill dynamic — the library grows with each new app category instead of calcifying around the first one.

## What NOT to do

- **Don't copy a previous funnel's screen list into a different app category.** Reskinning copy over a flow designed for another product shape is the exact failure mode this skill exists to prevent.
- Don't invent pricing numbers unless the user supplies them — describe the plan structure instead (tiers, decoy, which one is pre-selected).
- Don't write code (React/HTML/…). This skill produces the Markdown content brief only.
- Don't reuse stat numbers or press-logo placeholders verbatim across niches — "The Dodo" fits pets, not fitness.
- Don't skip the frontmatter. Downstream skills (`creative-video-generator`) parse it; a file without it falls back to fragile title matching.
