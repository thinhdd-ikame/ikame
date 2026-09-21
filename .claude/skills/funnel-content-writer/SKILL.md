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

This is the exact sequence used across every existing funnel in this repo, matching the Figma flow board frame-for-frame (Ob1 -> Ob2 -> Ob3 -> Input Name -> Choose Style -> Copy of Choose Style -> Upload Photo -> Social Proof -> Creating -> Lucky Wheel -> Email -> Paywall). Each screen serves a specific job in the conversion psychology - keep the job, reskin the copy.

1. **Ob1 — Welcome Hook A** — Emotional "before" state + the core promise. Sets the hook.
2. **Ob2 — Welcome Hook B** — Reinforces the promise through a relatable social framing ("follow the steps, and it's ready").
3. **Ob3 — Welcome Hook C** — Sets expectation for speed/ease ("in just a minute...").
4. **Input Name** — Captures a name (person/pet/baby/whatever the subject is) used to personalize every later screen via a `{{name}}`-style variable. Comes before any style question — the name is what makes the later screens feel personal.
5. **Choose Style** — A quiz of 4 preset options (always include a "Surprise me" option) plus a final "✏️ Other" escape hatch that opens a one-line text input. Gives the user perceived control over the AI output, and a way through when nothing on the list fits.
6. **Copy of Choose Style** — The same pill-option layout (4 presets + "✏️ Other") reused for a second preference question (occasion/goal in the existing funnels). Two short questions beat one long one: each tap increases investment before the upload.
7. **Upload Photo** — The only real input, asked after the user is already invested. Big dashed upload box, a bold `CREATE NOW` CTA (not "Continue"), a value line under the CTA ("Not just one look — 50 styles included"), and an arc collage of finished results fanned across the bottom edge.
8. **Social Proof** — A big usage-count headline (e.g. "1,486,000+ ... created") plus press-logo placeholders, positioned right before the generation to build trust.
9. **Generation (loading)** — Headline uses `{{name}}`. Instead of a Body line, it shows **four labeled progress rows**, each with its own percentage counter, checkmark and progress bar: three describing the work ("Analyzing your photos with care...", "Matching a <style> style...", "Preparing your personalized <output>...") and a fourth teaser row ("Almost ready — your first preview awaits"). A hero image of the result fills the top half. Auto-advances, no CTA.
10. **Lucky Wheel** — A gamified spin right before the paywall: the user wins a bonus/discount, which raises perceived value and makes the price feel earned rather than asked for.
11. **Registration** — Hard gate: Email (+ Password) fields, no way to see the result without signing up.
12. **Paywall / Payment** — Plan choice (Weekly/Annual style, "highlight savings on annual" — keep generic unless real pricing was supplied). CTA: "Continue with Apple Pay / Continue". This is the last screen in the flow.

## Mobile-length rules (copy must fit a phone screen)

This is real UI copy, not a written brief — every line has to physically fit on a mobile screen at readable font size. Keep everything short:

- **Headline:** max ~6 words. One clear idea, no subordinate clauses.
- **Body:** max ~12 words, one short sentence. If the idea needs more than that, cut it rather than wrap it. Quiz and name-input screens get one too — keep it to ~8 words there, since it sits between the question and the options.
- **Options:** emoji + 1-3 words each (e.g. "🐕 Funny & Bouncy" is already at the limit - don't go longer). Every quiz screen ends with an "Other" pill (pencil emoji) that opens a one-line free-text input - never leave a user stuck with four choices that all miss.
- **Field/CTA:** 1-4 words (e.g. "Continue", "Enter name").
- **Steps** (screen 7): 4-7 words per row, warm and human, ending in "..." on the first three. Describe care and craft, not engineering ("Analyzing your photos with care...", not "Running inference...").
- **Visual:** can stay a short descriptive phrase — it's a note for the designer, not on-screen text, so it doesn't need to fit the phone.

If a draft headline or body runs long, tighten the wording instead of shortening by truncation — punchy beats descriptive. When in doubt, write it, then cut every word that isn't doing work.

## Visual style reference

`assets/reference-funnel-screens.png` is a screenshot of the actual 12-screen mobile mockup this whole template is based on — the screen names in that file (First screen, Q1, Q2, Q3, Video generation, Testimonial, Landing Hug, registration, Payment, Success_download) map 1:1 to the structure below. Look at it when writing the **Visual** field so descriptions stay grounded in the real design instead of generic guesses:

- Dark/black background throughout, purple-to-pink gradient accents on primary buttons and quiz option pills.
- Small "Apple Award"-style trophy badge in the top bar on early screens — a trust signal, not literal Apple branding.
- Hook screens (1-3): photo collage / two overlapping photos in a rounded card, tall aspect ratio.
- Quiz screens (Q1-Q3): stacked pill-shaped option buttons, one emoji + short label each.
- Generation screen: hero image of the finished result fills the top half with a glowing ring animating over it; four stacked progress rows beneath, each a label on the left, % on the right, checkmark when done, and a full-width purple progress bar.
- Testimonial: huge bold number (matches the "1,486,000+" stat), press logos in a row beneath it (Forbes, Rolling Stone, Maxim-style placements).
- Landing Hug: single blurred result image filling most of the screen, dark gradient overlay, CTA pinned at bottom.
- Upload Photo: tall dashed-border box centered with a "+" and "UPLOAD YOUR PHOTO" label, solid purple CREATE NOW button below it, small value line under the button, arc/fan collage of finished results curving across the bottom edge.
- Lucky Wheel: colorful segmented wheel centered on black, pointer at the top, glow behind the wheel, single CTA pinned below.
- Registration: plain white input field on dark background, minimal chrome.
- Payment: two plan cards side by side (e.g. weekly vs. annual), Apple Pay button prominent below.
- Success/download: app logo centered, short confirmation text, single CTA.

## Per-screen documentation format

Document every screen with this exact set of fields (omit **Options**/**Field**/**Plans** where not applicable to that screen type). **Purpose**, **Headline**, **Body**, **Visual** and **CTA** are required on *every* screen — including the quiz screens (Q1, Q3) and the name-input screen (Q2). On those, the Body is the short helper line printed under the question: it says why you are asking or what happens next, never a restatement of the headline. The only exception is screen 7, where **Steps** (four progress rows) takes the place of Body.

```markdown
## N. Screen Name
**Purpose:** Why this screen exists in the funnel psychology (one sentence).
**Headline:** ...
**Body:** ... (required on every screen except screen 7 — on Q1/Q2/Q3 this is the helper line under the question)
**Steps:** (screen 7 only — 4 progress rows, each with % counter, checkmark and progress bar; replaces Body)
- Analyzing your photos with care...
- ...
**Visual:** ...
**Options:** (only for quiz screens — 4 emoji-labeled options, then "✏️ Other" as a 5th)
- 🎉 Option
- ...
**Field:** (only for input screens, e.g. name/email/password, and the dashed upload box on screen 7)
**Value line:** (screen 7 only — the small line under the CREATE NOW button, e.g. "Not just one look — 50 styles included")
**Prize:** (screen 10 only — what the wheel can land on)
**Plans:** (only for the Payment screen)
**CTA:** ...
```

## Output

Write the result to `funnel/funnel-development/<niche-kebab-case>/funnel-content.md` (relative to the repo root — create the folder if it doesn't exist). Start the file with a one-paragraph summary line matching this pattern from existing funnels:

```markdown
# Funnel Content — <Niche Display Name>

AI <photo/video/whatever> generator funnel: <subject> uploads <input>, AI turns it into <output>. 12-screen flow, modeled on the reference funnel (hooks → name → style → upload → social proof → generation → lucky wheel → email → paywall).

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
