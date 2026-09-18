---
name: funnel-content-writer
description: Generate a 12-screen funnel content brief (hook → quiz → generation → social proof → paywall → payment → success) for a new niche/product, following this repo's proven funnel structure. Use whenever the user asks to write funnel content, viết content funnel, tạo funnel mới, draft a new AI-generation funnel (photo/video/dancing/style-transfer style apps), or wants a funnel-content.md for a folder under funnel/funnel-development/. Trigger even if they just name a niche and say "làm funnel cho <niche>" or "content cho ngách <niche>" without spelling out the full structure.
---

# Funnel Content Writer

Generate funnel copy for a new niche by reskinning a fixed, proven 12-screen structure — never invent new screens, remove screens, or reorder them. The structure itself (not the copy) is what's been validated; consistency across niches is the point, so a reviewer or future engineer can open any `funnel-content.md` in this repo and instantly recognize the pattern.

## When to use this

Use this whenever asked to draft funnel content for a new product/niche — e.g. "làm content funnel cho ngách cat-selfie", "tạo funnel mới: turn photo into cartoon", "viết funnel-content.md cho ai-voice-cloning". The user may give you just a niche name, or a niche name plus a one-line description of what the user uploads and what they get back.

## What you need from the user

If not already given, ask (briefly, in one message):
1. **Niche/product name** (e.g. "cat-selfie", "voice-cloning", "cartoon-avatar") — becomes the folder name, kebab-case.
2. **Subject & transformation**: who uploads what, and what AI turns it into (e.g. "user uploads a selfie of their cat → AI turns it into a royal portrait"). This drives the headlines, visuals, and the `{{name}}`-equivalent personalization variable.
3. Optionally: any real pricing to use in the Payment screen. If none given, leave Payment generic (see screen 11) — do not invent prices.

Don't over-ask — if the product/transformation is obvious from context (e.g. user already described it earlier in conversation), just proceed and note your interpretation in the output's intro line.

## The 12-screen structure

This is the exact sequence used across every existing funnel in this repo (`baby-dancing`, `normal-dancing`, `pet-dancing`). Each screen serves a specific job in the conversion psychology — keep the job, reskin the copy.

1. **Welcome Hook A** — Emotional "before" state + the core promise. Sets the hook.
2. **Welcome Hook B** — Reinforces the promise through a relatable social framing ("follow the steps, and it's ready").
3. **Welcome Hook C** — Sets expectation for speed/ease ("in just a minute...").
4. **Q1 — Occasion/Goal** — A quiz screen with 4 emoji-labeled options that segments intent and increases the user's investment before the ask.
5. **Q2 — Name input** — Captures a name (person/pet/baby/whatever the subject is) used to personalize every later screen via a `{{name}}`-style variable.
6. **Q3 — Style/Preference** — Another 4-option quiz (always include a "Surprise me" option) giving the user perceived control over the AI output.
7. **Generation (loading)** — Headline uses `{{name}}`. Body shows a fake 3-step progress line ("Analyzing X → applying Y → rendering Z"). Auto-advances, no CTA.
8. **Social Proof** — A big usage-count headline (e.g. "1,486,000+ ... created") plus press-logo placeholders, positioned right before the reveal/paywall to build trust.
9. **Landing Hug (Emotional Preview)** — Blurred/teaser reveal of the result to trigger desire, gated behind signup.
10. **Registration** — Hard gate: Email + Password fields, no way to see the result without signing up.
11. **Payment** — Plan choice (Weekly/Annual style, "highlight savings on annual" — keep generic unless real pricing was supplied). CTA: "Continue with Apple Pay / Continue".
12. **Success/Download** — Delivers the payoff and drives sharing (download + share CTA) — this is the viral loop.

## Mobile-length rules (copy must fit a phone screen)

This is real UI copy, not a written brief — every line has to physically fit on a mobile screen at readable font size. Keep everything short:

- **Headline:** max ~6 words. One clear idea, no subordinate clauses.
- **Body:** max ~12 words, one short sentence. If the idea needs more than that, cut it rather than wrap it.
- **Options:** emoji + 1-3 words each (e.g. "🐕 Funny & Bouncy" is already at the limit — don't go longer).
- **Field/CTA:** 1-4 words (e.g. "Continue", "Enter name").
- **Visual:** can stay a short descriptive phrase — it's a note for the designer, not on-screen text, so it doesn't need to fit the phone.

If a draft headline or body runs long, tighten the wording instead of shortening by truncation — punchy beats descriptive. When in doubt, write it, then cut every word that isn't doing work.

## Visual style reference

`assets/reference-funnel-screens.png` is a screenshot of the actual 12-screen mobile mockup this whole template is based on — the screen names in that file (First screen, Q1, Q2, Q3, Video generation, Testimonial, Landing Hug, registration, Payment, Success_download) map 1:1 to the structure below. Look at it when writing the **Visual** field so descriptions stay grounded in the real design instead of generic guesses:

- Dark/black background throughout, purple-to-pink gradient accents on primary buttons and quiz option pills.
- Small "Apple Award"-style trophy badge in the top bar on early screens — a trust signal, not literal Apple branding.
- Hook screens (1-3): photo collage / two overlapping photos in a rounded card, tall aspect ratio.
- Quiz screens (Q1-Q3): stacked pill-shaped option buttons, one emoji + short label each.
- Generation screen: grid/mosaic of small photos animating, app logo appears as it completes.
- Testimonial: huge bold number (matches the "1,486,000+" stat), press logos in a row beneath it (Forbes, Rolling Stone, Maxim-style placements).
- Landing Hug: single blurred result image filling most of the screen, dark gradient overlay, CTA pinned at bottom.
- Registration: plain white input field on dark background, minimal chrome.
- Payment: two plan cards side by side (e.g. weekly vs. annual), Apple Pay button prominent below.
- Success/download: app logo centered, short confirmation text, single CTA.

## Per-screen documentation format

Document every screen with this exact set of fields (omit **Options**/**Field**/**Plans** where not applicable to that screen type):

```markdown
## N. Screen Name
**Purpose:** Why this screen exists in the funnel psychology (one sentence).
**Headline:** ...
**Body:** ...
**Visual:** ...
**Options:** (only for quiz screens — 4 emoji-labeled options)
- 🎉 Option
- ...
**Field:** (only for input screens, e.g. name/email/password)
**Plans:** (only for the Payment screen)
**CTA:** ...
```

## Output

Write the result to `funnel/funnel-development/<niche-kebab-case>/funnel-content.md` (relative to the repo root — create the folder if it doesn't exist). Start the file with a one-paragraph summary line matching this pattern from existing funnels:

```markdown
# Funnel Content — <Niche Display Name>

AI <photo/video/whatever> generator funnel: <subject> uploads <input>, AI turns it into <output>. 12-screen flow, modeled on the reference funnel (hook → personalization quiz → generation → social proof → paywall → payment → success).

---
```

Then the 12 screens as specified above, separated by `##` headers, matching the style, tone, and level of detail of the existing `dancing` funnels (short, punchy headlines; casual body copy; placeholder visual descriptions; consumer-app tone — not corporate/formal).

## What NOT to do

- Don't add, remove, merge, or reorder screens — the fixed structure is the whole point of this skill.
- Don't invent real pricing numbers for the Payment screen unless the user explicitly supplies them.
- Don't write actual code (React/HTML/etc.) — this skill produces the content brief only, in Markdown, same as the existing reference funnels.
- Don't reuse the literal press-logo placeholders or stat numbers verbatim across niches without at least considering whether they fit the new niche's audience (e.g. "The Dodo" fits pets, not fitness).

## Example

For reference, here's how screen 4 and 6 adapt across existing niches — use this to calibrate how much to change per niche:

| Niche | Q1 Occasion options | Q3 Style options |
|---|---|---|
| baby-dancing | 🎉 Birthday · 👶 Just for fun · 🎁 Gift for family · 📱 Post on social media | 🕺 Funny & Bouncy · 🩰 Cute & Gentle · 🔥 Viral TikTok Style · 🎶 Surprise me |
| pet-dancing | 🎉 Pet's birthday · 🐾 Just for fun · 🎁 Gift for a pet lover · 📱 Post on social media | 🐕 Funny & Bouncy · 🐈 Smooth & Sassy · 🔥 Viral TikTok Style · 🎶 Surprise me |

Notice: the *shape* (4 options, one emoji each, last option often a wildcard) stays fixed; only the wording adapts to the subject.
