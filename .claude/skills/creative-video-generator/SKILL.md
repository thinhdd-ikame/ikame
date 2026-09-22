---
name: creative-video-generator
description: Generate real AI video ad creatives (image-to-video) from an existing funnel-content.md, for the funnel/creative-development/ category. Use when the user asks to create/generate video creatives, video ads, or creative video for a funnel/niche that already has a funnel-content.md (e.g. "tạo video cho funnel cat-dancing", "generate creative video cho ngách X", "tạo video ads cho funnel này"). If no funnel-content.md exists yet for that niche, run the funnel-content-writer skill first.
---

# Creative Video Generator

Turns an existing `funnel-content.md` of any shape into real MP4 ad creatives: one clean still + one image-to-video clip for each screen the funnel declares as ad-worthy in its `creative_screens` frontmatter (conventionally the three hooks plus the reveal/generation screen). Output lands under `funnel/creative-development/<same-niche-path>/`.

This is a two-stage AI pipeline (text→image, then image→video) run entirely through PowerShell REST calls — no Node/Python required. Providers are pluggable; see `scripts/Providers.ps1`.

## When to use this

- User names a niche/funnel that already has a `funnel-content.md` under `funnel/funnel-development/` and asks for video creative, video ads, or creative video for it.
- If the funnel doesn't exist yet, tell the user to run `funnel-content-writer` first, then come back to this skill.

## How to run it

1. Locate the source file: `funnel/funnel-development/<niche-path>/funnel-content.md`.
2. First run a dry run to sanity check parsing (no API calls, no cost):
   ```powershell
   .claude/skills/creative-video-generator/scripts/Generate-CreativeVideos.ps1 -FunnelContentPath "funnel/funnel-development/dancing/cat-dancing/funnel-content.md" -DryRun
   ```
   Confirm every declared target screen resolved to the screen you expect, and that the prompts read sensibly.
3. Make sure `IKAME_AI_KEY` is set in the shell (the key for ikame's internal LiteLLM gateway at `core-ai-platform.ikameglobal.com`, which fronts both stages). If it isn't set, ask the user to run `$env:IKAME_AI_KEY = "..."` in their PowerShell session — never hardcode a key into a file in this repo. Note that env vars do not survive between separate PowerShell invocations, so set it in the same command that runs the script.
4. Run for real (no `-DryRun`):
   ```powershell
   .claude/skills/creative-video-generator/scripts/Generate-CreativeVideos.ps1 -FunnelContentPath "funnel/funnel-development/dancing/cat-dancing/funnel-content.md"
   ```
5. Report back the output folder (`funnel/creative-development/dancing/cat-dancing/`) with `images/`, `videos/`, and `creative-brief.md`.

To run the whole matrix (every theme x character line) in one go, loop over the funnels instead of calling the script once per niche — scope the `Get-ChildItem` to a theme folder to do just one theme:

```powershell
Get-ChildItem -Path "funnel/funnel-development" -Recurse -Filter "funnel-content.md" |
    ForEach-Object { .claude/skills/creative-video-generator/scripts/Generate-CreativeVideos.ps1 -FunnelContentPath $_.FullName }
```

Always dry-run the loop first (append `-DryRun`). A full matrix run is 4 images + 4 videos per funnel, and video is billed per generated second, so confirm the scale with the user before launching one. Screens whose `.mp4` already exists are skipped, so a re-run after a failure resumes rather than re-billing.

## Models and cost

Both stages go through the same gateway and the same key. Settings live in `config/providers.json` (copy from `config/providers.example.json`; it is gitignored to avoid per-machine drift). Changing model, size, or clip length is a config edit, not a code change.

Verified working (Sept 2026):
- Image: `gpt-image-1` at `1024x1536`. It honours the `size` parameter; `gemini/gemini-2.5-flash-image` ignores it and always returns 1024x1024, and `gemini/imagen-*` 404s on this gateway.
- Video: `sora-2` at `720x1280`, 8 seconds (4s read as too short). Render time is highly variable — the same clip length has taken anywhere from 70 seconds to 7 minutes, and jobs often sit at 99% for a while, so don't assume a hung job. The still is auto-resized (scale-to-cover, centre-crop) to match, because sora rejects an `input_reference` whose dimensions differ from `size`.
- The multipart submit goes through `HttpWebRequest`, not `Invoke-RestMethod`: on PS 5.1 the latter returns an empty-bodied HTTP 400 for larger binary multipart payloads even though the identical bytes succeed the other way. Don't "simplify" it back.
- **`gemini/veo-3.1-*` does not work.** All three spellings were tried: the two prefixed ones 404 on submit, the unprefixed one accepts the job then 500s on poll. It is listed by `/v1/models` only because of a wildcard entry, the same reason `gemini/imagen-*` appears and 404s. Video means sora on this gateway. `sora-2-pro` is verified working and is the quality upgrade lever.

## Moderation is intermittent — retry, don't conclude

sora-2 sometimes fails a job late: it submits fine, runs to 99%, then returns `moderation_blocked`. **This verdict is not stable.** The identical still image with the identical prompt was blocked twice and then passed on a later attempt, including for a photorealistic baby — the subject that looked most obviously "banned".

So `Invoke-IkameVideo` retries a moderation failure (`moderationRetries` in config, default 2 retries). Do not conclude that a subject is unsupported from one or two blocks, and do not redesign the creative around an apparent block before retrying it several times.

Subjects confirmed to produce video: cat, adult person, **baby** (all three of cat/dog-style pets, adults and infants have completed successfully). `gpt-image-1` has shown no subject restrictions at the image stage at all.

To add a vendor that is not behind this gateway, add one function plus one registry entry in `scripts/Providers.ps1` matching the documented adapter signature. Fetch that vendor's current API docs first — don't guess endpoint shapes.

## Known provider quirks

- A failed screen does not abort the run: it is recorded as `FAILED` in `creative-brief.md`, the remaining screens continue, and a summary is printed at the end. Re-running regenerates only what is missing (pass `-Force` to redo finished ones).
- An earlier version of this doc claimed blurred stills specifically trigger moderation. That was inferred from a single block followed by a single pass, before the verdict was known to be flaky — treat it as unproven. The current prompt builds its own clean subject frame and never passes the funnel's `Visual` text through, so the question no longer arises.

## Scope — which screens get video

Funnels have no fixed shape (see `funnel-content-writer`), so **each funnel declares its own ad-worthy screens** in its frontmatter:

```yaml
creative_screens:
  hook-a: 1
  hook-b: 2
  hook-c: 3
  reveal: 19
motion: >
  a slow cosmic reveal - a drifting star field, a birth-chart wheel igniting line by line
```

The slug picks the ad angle (`hook-a/b/c` = the three opening angles, `reveal`/`generation` = the transformation happening); the number picks the screen. Unknown slugs still run, on a generic angle. `motion:` is what should visibly move — without it the script falls back to a keyword table and generic motion prompts produce near-static clips. Quiz, input, registration, wheel and paywall screens stay out: they're UI, not ad material.

Every funnel in the repo now carries this block — the template funnels (dancing / halloween / photo-bw / cat-royal-portrait) were backfilled on 2026-09-22 with `generation: 9`, so their existing `generation.png` / `generation.mp4` filenames stay valid. A file with **no** frontmatter falls back to matching **by title, not by number** (`TitlePattern` in `$TargetScreens`): the 12-screen template was renumbered once — screens gained an `ObN —` prefix, Upload Photo and Lucky Wheel were inserted, Landing Hug was removed — which silently repointed number-based mapping at the wrong screens. If neither frontmatter nor a title matches, the script fails loudly and lists the screens it did find, rather than generating a creative for the wrong screen.

## The output is footage + a copy overlay, not a finished ad

The generated clip contains no text. The headline that belongs on top of it is recorded in `creative-brief.md` as **Overlay copy** for whoever assembles the final ad. Don't try to bake copy into the footage — that is what produced warped lettering and near-static clips in the first version.

## What NOT to do

- Don't hardcode or write real API keys into any file in this repo — always environment variables.
- Don't invent new screens or reorder the funnel — that's `funnel-content-writer`'s territory, this skill only reads what the funnel declares.
- Don't commit generated `images/` or `videos/` binaries — they're gitignored; `creative-brief.md` is the tracked artifact.
