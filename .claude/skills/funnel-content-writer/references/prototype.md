# Clickable prototype (demo.html)

An optional follow-up to `funnel-content.md`, built only when the user asks for a demo. It's one self-contained HTML file with vanilla JS and no build step. Google Fonts is the only external request, so it opens straight from disk and publishes as an Artifact.

**Reference implementation:** `funnel/funnel-development/starlyn/demo.html`. Copy it and swap in the new brief's screens. Its structure has already been reviewed with the user.

## Page layout

- **Left: phone frame.** 390×812, radius ~52, inner status bar ("9:41"). All screens render inside it.
- **Right: control panel.** It stacks to one column under ~820px.
  - App name and a one-line intro.
  - **Copy A / Copy B** toggle that swaps every `Headline A/B` + `Body A/B` pair from the brief.
  - **Restart.**
  - **Flow list** grouped by the brief's stage headers, numbered like the brief, with tags for conditional or special screens (`if person`, `bridge`, `2nd layer`). It is clickable to jump to a screen.
  - **"Collected so far"**, a live readout of every answer.
  - A footnote naming what's placeholder data.
- **Deep link:** `demo.html#s=14` opens screen 14 directly (jump prefill applies). Handy for sharing one screen.

## State model

- **One `S` object** holds the current screen, history stack, variant and every answer. `go(n)` / `next()` / `back()` handle navigation. `next()` applies the brief's branching (e.g. skip "their details" when the user picked "Just me").
- **One render function per screen** (`V[n]`) returns that screen's HTML. Input events update `S` without re-rendering, so focus isn't lost; clicks go through one delegated `data-a` handler.
- **Jumping from the panel prefills** anything earlier screens would have collected (`fillTo(n)`, e.g. name "Maya"), so every screen renders in a realistic state.
- **Validation matches the brief:** a disabled CTA until the required pick is made, literal `Error state` copy, and working skip links.
- **Personalization tokens render live** (`{{name}}`, `{{sun_sign}}`, `{{person}}`).

## Fake vs. never fake

- **OK to fake, and say so in the panel footnote:**
  - Generated outputs such as the reading, Moon/Rising, compatibility score and chat answers. Seed them deterministically from the inputs so they stay stable.
  - The loading steps.
  - Store purchase and permission prompts. Show a toast such as "Demo only — no charge made".
- **Never fake:**
  - **Prices:** use the brief's (i.e. the app's real) prices.
  - **Ratings, review quotes, user counts:** keep the brief's placeholder visible (`{{app_rating}}`, a dashed "real review goes here" card).
  - **Legal and auto-renew lines:** copy them from the brief.

## Visual and motion rules (from user review, 2026-09-23)

- **Use the app's own design tokens** when a design file exists (Starlyn: `$bg #0B0A18`, `$accent #E9C26B`, Fraunces + Inter, lucide stroke icons). Don't fall back to the house purple/pink look.
- **Screen changes stay simple:** a ~0.3s fade/slide. The user explicitly rejected 3D screen transitions (cube, depth, flip) and 3D-tilting cards. Don't add them back.
- **Spend the 3D on the hero object only.** In astrology funnels that's the birth-chart wheel, built in CSS 3D:
  - Stacked ring layers at different `translateZ`.
  - Planets floating above the disc on light stalks, with shadows on the disc.
  - Billboarding: counter-rotate the planets so they always face the camera.
  - Slow spin and tilt, plus pointer-driven orbit.
  - Per-screen modes: `float` (hooks, gate), `spin` (loading: tilted deep and fast, then it straightens up before auto-advancing), `land` (reveal: rotates in from flat).

  Other niches: pick that niche's hero object (the transformed photo, the plan card) and give it the same treatment. Don't spread 3D elsewhere.
- **Gotcha:** never set `opacity < 1` or `filter` on a `transform-style: preserve-3d` element. It flattens its children. Fade the outer perspective wrapper instead.
- **Ambient background:** a canvas starfield in the phone (depth layers, twinkle, occasional shooting star, faster drift on the loading screen). It suits astrology; other niches pick their own ambient layer or none.
- **Signature moments:**
  - A constellation of the computed sign drawing itself on the sign-reveal bridge.
  - A tarot card that flips on tap.
  - A sheen on the primary CTA.
- **Reduced motion:** respect `prefers-reduced-motion`. It turns off loops and animations, and the 3D wheel renders one static frame.

## Checking it

- **Headless screenshots:** Python/Node aren't on this machine. Render single screens with Edge headless, e.g. `msedge --headless=new --window-size=460,860 --virtual-time-budget=4000 --screenshot=out.png "file:///…/demo.html#s=15"`. Look at the screenshot once, fix, then publish.
- **Pencil's integrated browser** can time out on screenshots, so don't depend on it.
