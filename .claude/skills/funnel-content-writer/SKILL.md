---
name: funnel-content-writer
description: Write the screen-by-screen onboarding + paywall content brief (funnel-content.md) for a mobile app funnel in ANY category — AI photo/video generators, astrology & personality quizzes, fitness, mental health, chat/companion, utility, subscription content, marketplace. Picks the funnel shape that fits the app instead of forcing one template: classifies the product archetype, assembles the flow from a screen-block library, and writes to funnel/funnel-development/<path>/funnel-content.md. On request it also builds a clickable single-file HTML prototype (demo.html) of the funnel. Use whenever the user asks to write funnel content, "code demo" / "cho xem demo" of a funnel, viết content funnel, tạo funnel mới cho <app/ngách>, draft onboarding/paywall copy, or just names a niche and says "làm funnel cho X" / "content cho ngách X".
---

# Funnel Content Writer

Produce the content brief for a mobile app's onboarding → paywall funnel: every screen, its job, its copy, its visual note. The brief is Markdown. A clickable HTML prototype of it is an optional follow-up step (§7), built only when the user asks for a demo.

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
6. **Demo (on request)** — build a clickable prototype from the brief (§7, `references/prototype.md`).

---

## 1. Intake

**First, check `references/app-rules.md`.** If the app is listed there (ChatChi, Starlyn, CoinIdentify), its rules are binding: brand, legal, flow shape, plans, prices, Paddle IDs and app links. They override every generic default in this skill.

If it isn't already clear from the conversation, ask once, briefly, in a single message:

1. **App / niche name** — becomes the folder, kebab-case.
2. **What the user gets, and what they give to get it** — e.g. "uploads a cat selfie → gets a royal portrait", "answers birth date/time/place → gets a personalized reading", "logs weight + goal → gets a workout plan". This one answer usually decides the archetype.
3. **Monetization** — subscription paywall only, or paywall plus upsell / consumable / marketplace? If unknown, assume a hard subscription paywall and say so.
4. Optional: real pricing, a real competitor to model on, brand/visual constraints.

**If the app already has a design file** (a `.pen` via the pencil MCP, a Figma link), read it before writing anything. It gives you the real screen inventory (what onboarding already exists), the real prices, the brand voice and the design tokens. Starlyn is the example: its `.pen` showed guest mode, a dismissible paywall and the store promise "No timers. No per-minute billing", and each of those changed the funnel shape. Reference existing screens by their ids in `Visual:` and list which screens are new in the Notes.

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
- **Is the paywall a web page?** These funnels are web2app, so the paywall is a long-scroll landing page (personal hero → plan block → what's inside → how it works → proof → guarantee → FAQ → plan block again, with a sticky CTA). It is not a compact app-style sheet. See `references/blocks.md` → Paywall.
- **Does the paywall show a CTA and price on first view?** Check at 375×667 and 430×932. The sticky bottom bar shows from first view whenever no plan-block CTA is on screen.
- **Is the gate email-only and mandatory?** One email input right before the paywall: no skip, guest, or Google/Apple sign-in. See `blocks.md` → Registration.
- **What happens on decline?** It follows the app's rules in `references/app-rules.md`:
  - **ChatChi:** a per-plan sale, then a lifetime offer, then back to the paywall (hard paywall, no free tier).
  - **Starlyn:** no offer at all.
  - **An app with no rules yet:** a one-time fallback offer (`blocks.md` → Fallback offer), and ask the user.
- **Is a chat taste short?** In chat apps, the taste before the paywall is 1-2 chat screens with at most 2 user messages. After that, the user must buy.
- **Is there an under-18 way back?** An 18+ block always has "Change my birth date".
- **Is there a post-purchase step?** A purchase leads to the one-time add-on upsell (own checkout, the subscription stays), then the get-app screen.
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

## 7. Demo prototype (only when asked)

When the user asks to see it working ("code demo", "cho xem demo", "làm prototype"), build a single-file clickable prototype next to the brief:

`funnel/funnel-development/<path>/demo.html`

It must follow the brief exactly: the same screens, numbering, A/B copy and branching. Publish it as an Artifact and give the user the link. Follow `references/prototype.md` for the page structure, the state model, what to fake and what never to fake, and the motion rules. The reference implementation is `funnel/funnel-development/starlyn/demo.html`. Start from it rather than from scratch.

If the brief changes later, update the demo in the same turn, so the two never drift apart.

## 8. QA before shipping

Run the checklist in `references/prototype.md` → "Checking it" before handing off a demo or pushing a funnel. The checklist covers:
- every branch reaching the paywall by real clicks;
- overlay stacking;
- back, close and reload;
- 360/375/430 widths;
- first-view CTA.

The owner reports bugs from a QA sheet. For each bug, fix it, verify it with before/after screenshots, and write a status per bug (Fixed / Not a bug / Won't fix, with a note).

## 9. Ship to FunnelFox

When the funnel is verified, push it to FunnelFox as a **draft** right away, without asking. The FunnelFox projects and app links are listed in `references/app-rules.md`.
- **Publishing stays with the user.** The live link shows only the last published version, so always end with a reminder to **Publish**, and name the funnels.
- **Before you diagnose a live bug, check whether the live link is just an old publish.** FunnelFox's `funnel_get` `updated_at` is the last publish time.

## What NOT to do

- **Don't copy a previous funnel's screen list into a different app category.** Reskinning copy over a flow designed for another product shape is the exact failure mode this skill exists to prevent.
- Don't invent pricing numbers unless the user supplies them — describe the plan structure instead (tiers, decoy, which one is pre-selected).
- Don't write app code (React Native, Swift, …). The brief is Markdown. The only code this skill produces is the optional HTML prototype in §7, and only when asked.
- Don't add urgency mechanics (countdowns, "offer expires" timers) when the app's own positioning promises the opposite. Read the store screenshots and the paywall copy first.
- Don't reuse stat numbers or press-logo placeholders verbatim across niches — "The Dodo" fits pets, not fitness.
- **Don't invent or borrow proof.** Use no made-up stats or reviews. Don't present a competitor's store reviews, or a positive fragment cut from a negative review, as our users'. Use honest product facts instead, and hide the reviews block.
- **Don't cut onboarding screens to change monetization.** Email, opt-ins, journals and voice notes stay; change only the monetization screens.
- Don't skip the frontmatter. Downstream skills (`creative-video-generator`) parse it; a file without it falls back to fragile title matching.
