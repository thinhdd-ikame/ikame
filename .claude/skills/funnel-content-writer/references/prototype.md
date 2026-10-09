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

## Paywall screen (web funnel)

- Build it as a long-scroll landing page per `visual-language.md` → "Web paywall", not a compact app sheet. The user rejected the app-style paywall on 2026-09-30.
- Put everything the page needs in CONFIG: plans, refund days, rating, reviews, support email, legal entity. Any `{{token}}` renders as a dashed placeholder.
- Plan selection mutates the DOM in place. Wire the sticky CTA with an IntersectionObserver on the plan blocks.
- Screenshot the paywall by scrolling its container in steps (for example 780px), not with one full-page shot, so the sticky elements show as a user sees them.

## Decline screens (follow `app-rules.md`)

- **ChatChi:** `CONFIG.declineFlow` maps each plan's checkout close to its sale screen, sales to `sale_lifetime`, and `lifetime` back to the paywall. `checkout(plan)` opens a demo checkout sheet (Pay / Close without paying) when there's no checkout URL. The sheet sits above every layer.
- **Hard paywall:** no free-chat path. A non-paying user who lands on a chat screen (by back, reload, deep link or restore) is forwarded to the paywall with the composer locked.
- **Apps without rules:** use the fallback-offer pattern below.

## Fallback offer screen (default for apps without rules)

- Every demo wires the paywall close (and any "continue free" link) to a one-time offer screen first. Keep the offer in `CONFIG.offer` (`enabled, name, price, renews, compareAt, badge, checkoutUrl, expiresMin`), and set a sessionStorage flag so it is shown once. Reference: `nebula/palm-reading/demo.html` screen 22.
- Test it: close → offer, decline → free path, close again → free path (no second offer). With `expiresMin` set, the offer must withdraw itself when time runs out.

## Checking it

**QA checklist (run before any hand-off or FunnelFox push):**
- **Every branch reaches the paywall by real clicks from screen 1.** Use no `#s=` jumps. Cover every option, "Other" with text, skip links, the A/B variant, every character variant, typed chat versus reply chips, under-18 → Change my birth date, back/forward and reload mid-funnel. Run it in the standalone page and in the FunnelFox harness.
- **Overlays stack correctly.** Sheets and paywall overlays get an explicit z-index above the chat layers: the paywall over the chat, the checkout sheet over the paywall, toasts on top. One missing z-index once put the paywall under chat bubbles in production.
- **Every button does something.** Check each back, close and X, "No thanks", legal link and store badge. Nothing should be covered (`elementFromPoint`) or too small to tap.
- **Viewports:** 360×640, 375×667, 430×932. Nothing clipped, and a CTA and price visible on the paywall's first view.
- **Reload and restore:** reloading during the chat taste never grants extra messages, and reloading on the paywall stays there.
- **Placeholders:** no raw `{{tokens}}`. Disabled screens (an old offer) are removed from the engine, not just hidden.

- **Headless screenshots:** on the Windows machine, Python/Node aren't available: render single screens with Edge headless, e.g. `msedge --headless=new --window-size=460,860 --virtual-time-budget=4000 --screenshot=out.png "file:///…/demo.html#s=15"`. On the Mac, Node + `playwright-core` (Chromium in `~/Library/Caches/ms-playwright`) can click through the whole funnel, upload files with `setInputFiles`, and scroll the paywall. Look at the screenshots, fix, then publish.
- **Pencil's integrated browser** can time out on screenshots, so don't depend on it.
