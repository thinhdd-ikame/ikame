# Funnel archetype registry

An archetype is a *product shape*, not a template. Apps with the same shape monetize the same way, so their funnels share a default block sequence. Match the app to a shape here; if nothing fits, derive a new one and register it.

| Archetype | The shape | Signals | File |
|---|---|---|---|
| **ai-transformation** | User gives one asset → AI returns a transformed version of it | "upload a photo/video/voice", novelty/entertainment, one-shot output, impulse purchase | [ai-transformation.md](ai-transformation.md) |
| **personalization-quiz** | User answers a long data quiz → AI returns a personalized reading/plan; the quiz *is* the demo | astrology, personality, fitness plan, diet, mental health; accuracy depends on real inputs; often two revenue layers | [personalization-quiz.md](personalization-quiz.md) |
| **companion-chat** | User is matched with an AI character → ongoing chat that builds memory/intimacy → subscription removes the daily message limit | character/roleplay/AI girlfriend chat, messages-per-day meter, intimacy levels unlocking photos, usually 18+ | [companion-chat.md](companion-chat.md) |
| **diagnostic-utility** | User answers a short self-assessment → computed risk/health score → each problem mapped to a utility feature → subscription (often web checkout) | authenticator/2FA, VPN, password manager, cleaner, backup; value invisible until something breaks; 3-5 question quiz | [diagnostic-utility.md](diagnostic-utility.md) |

Not yet registered, expect to meet them (derive from teardown, then add the file): habit & streak trackers, utility/scanner tools, learning apps, marketplaces.

## How to pick

Ask what the user must give before the product can deliver:

- **one asset** → ai-transformation
- **many answers about themselves** → personalization-quiz
- **nothing; value is immediate on use** → utility shape: short hook, no quiz, gate late or not at all, paywall on the second use or on a premium feature
- **their attention over time** (chat, streaks, content) → relationship shape: hook → short preference quiz → first taste of the loop → gate → paywall, and retention blocks (notifications, streak) matter more than the reveal. For character chat specifically → companion-chat

When two archetypes both half-fit, follow the one that matches the **monetization** shape, not the content topic — the paywall is what the flow is built around.

## Adding a new archetype

Write `<name>.md` with these sections, keep it under ~60 lines, and add a row to the table above.

```markdown
# Archetype — <name>

**Shape:** <what the user gives → what they get → how it's paid for, in one sentence>
**Signals:** <how to recognize an app of this shape>
**Modeled on:** <real apps torn down, if any — otherwise "unverified, derived from category reasoning">

## Default flow
<Numbered block sequence grouped by stage, with a screen-count range per stage. Blocks by
their names in blocks.md, not invented ones.>

## Monetization
<How many layers, where the gate sits, plan structure, what's measured separately.>

## Traps
<What breaks in this category: blocks that backfire, drop-off cliffs, proof that doesn't
land, ordering mistakes.>

## Known variants
<One line per funnel written from this archetype that deviated, and why.>
```
