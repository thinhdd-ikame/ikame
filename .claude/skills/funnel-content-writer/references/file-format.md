# funnel-content.md format contract

Any funnel this repo produces — whatever its shape or screen count — is written in this format, because downstream skills parse it (`creative-video-generator` reads the frontmatter and the screen headers to decide which screens become ad creative).

The *shape* of the funnel is free. The *format* is not.

---

## 1. Frontmatter (required)

```yaml
---
niche: nebula
display_name: Nebula (Astrology / Horoscope)
archetype: personalization-quiz
subject: person                 # what the funnel is about: person, cat, dog, baby, couple...
input: birth date, time, place  # what the user gives
output: personalized birth-chart reading   # what they get
screens: 24
monetization: subscription paywall + pay-per-minute astrologer chat
creative_screens:               # screens worth turning into ad creative: slug -> screen number
  hook-a: 1
  hook-b: 2
  hook-c: 3
  reveal: 19
motion: >
  a slow cosmic reveal - star field drifting, a birth-chart wheel igniting
  line by line
---
```

Notes:

- `creative_screens` is the contract that lets the creative pipeline work on *any* funnel shape. Slugs are free-form; `hook-a` / `hook-b` / `hook-c` / `reveal` are the conventional four. `reveal` = the screen that shows the transformation/result happening (the loading screen in generator funnels, the reading in quiz funnels). Map only the screens that genuinely make good ad creative; a funnel may have 2 or 6.
- `motion` is a one-sentence description of what should visibly move in a video ad. Without it the video generator falls back to a generic motion prompt and produces near-static clips.
- Keep frontmatter values ASCII where practical — the PowerShell 5.1 pipeline reads these files, and hyphens are safer than em-dashes inside frontmatter.
- Every funnel in this repo carries this block (the older template funnels were backfilled on 2026-09-22). The creative pipeline still keeps a title-based fallback for a file that somehow has none, but treat frontmatter as required.

## 2. Title + intro

```markdown
# Funnel Content — <Display Name>

<One paragraph: what the app is, what the user gives and gets, what funnel shape this is
and why (name the archetype), how many screens, and anything deliberately different from
the repo's other funnels.>

---
```

If the flow was derived from competitor teardown rather than a registered archetype, say which apps it was modeled on right here.

## 3. Stages and screens

Group screens under stage headers, and number screens **continuously across the whole file** (1…N, never restarting per stage):

```markdown
## A. Hooks (value prop + trust)

### 1. Hook A — Welcome
**Purpose:** ...
```

Short funnels (≤12 screens) may skip stage headers and use flat `## 1. Screen Name` headers. Both forms are parsed; pick one and stay consistent within a file.

Screen title = a short name for the screen's job, not its copy.

## 4. Per-screen fields

**Required on every screen:** `Purpose`, `Headline`, `Visual`, `CTA`.
**Required unless the block replaces it:** `Body` (the loading block replaces it with `Steps`; auto-advance screens still state the CTA as `(auto-advances, ~6-8 seconds)`).

Everything else is used only where the block calls for it (see `blocks.md`):

| Field | Where | Content |
|---|---|---|
| `Purpose` | every screen | One sentence: why this screen exists in the funnel psychology. |
| `Headline` / `Headline A` + `Headline B` | every screen | ≤6 words. Write an A/B pair when the funnel is meant to be tested; A is the control. |
| `Body` / `Body A` + `Body B` | almost every screen | ≤12 words; on quiz screens the helper line under the question. |
| `Options` | choice screens | 4 items, emoji + 1-3 words, plus `✏️ Other` where free choice makes sense. |
| `Field` | input screens | The control and its constraints (type, max length, select mode, default). |
| `Steps` | loading screens | 4 progress rows with % counter, checkmark, bar. Replaces Body. |
| `Value line` | upload/action screens | The small line under the CTA. |
| `Prize` | gamified reward | What the wheel/scratch can land on. |
| `Plans` | paywall | Tier structure, which is pre-selected, which is the decoy, badges. |
| `Microcopy` | any | Supporting text: badges, benefit rows, legal line, sample push, quote cards, price disclosure. |
| `Error state` / `Error states` | input screens | The literal validation messages. |
| `Skip link` | optional-ask screens | The exact skip wording. |
| `Fallback offer` | paywall | What's shown after a dismiss. |
| `Visual` | every screen | Designer note — exempt from the copy length rules. |
| `CTA` | every screen | 1-4 words, or the auto-advance note. |

Field order within a screen: Purpose → Headline(s) → Body(s) → Options/Field/Steps/Plans/Prize/Value line → Visual → Microcopy/Error state/Skip link/Fallback offer → CTA.

## 5. Closing notes section

End the file with a short `## Notes` section recording the *decisions*, not the copy: which blocks were deliberately skipped and why, where the drop-off risk sits, how many monetization layers there are and how they should be measured separately, and what to A/B test first. This is what makes the next funnel in the category faster to write — and it feeds the archetype file (§6 of SKILL.md).

## 6. Example screen

```markdown
### 8. Time of birth
**Purpose:** Sharper chart precision; needs a skip so users who don't know it don't drop.
**Headline A:** What time were you born?
**Headline B:** Know your birth time?
**Body A:** Exact time gives a sharper reading.
**Body B:** Check your birth certificate if unsure.
**Field:** Time picker + "I don't know my birth time" link
**Visual:** Dark background, clock-face illustration with zodiac symbols around the rim.
**Microcopy:** Skip-link fallback copy: "No worries — we'll estimate it for you"
**CTA:** Continue
```
