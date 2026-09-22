---
name: creative-video-optimizer
description: Turn generated creative MP4s into web-ready assets (animated WebP + size-capped MP4) under funnel/creative-development/<niche>/web/, ready to drop onto the funnel landing page. Use when the user asks to optimize/compress/shrink creative video, convert video to webp, trim a clip to its first N seconds, get a clip under a size cap, or prepare/push creative video onto a funnel (e.g. "nén video funnel cat-dancing", "convert video sang webp", "cắt 8s đầu rồi giảm size", "đẩy video lên funnel", "làm nhẹ video cho landing page"). Runs after creative-video-generator has produced videos/; also works on any standalone .mp4 path.
---

# Creative Video Optimizer

The clips that `creative-video-generator` produces are 1080x1920 sora renders — good footage, far too heavy for a landing page (6 MB+ for 8 seconds is normal). This skill is the post-processing stage: it trims each clip to its ad-usable opening, then writes two web deliverables per clip into a `web/` folder beside `videos/`.

Source clips are never touched. Everything is reversible by deleting `web/` and re-running.

## Output shape

```
funnel/creative-development/dancing/cat-dancing/
  images/
    hook-a.png
  videos/
    hook-a.mp4          <- source, untouched
  web/
    hook-a.webp         <- animated WebP for the landing page
    hook-a.mp4          <- size-capped H.264 fallback
    web-assets.md       <- tracked manifest: what was built, at what settings
```

`web/*.webp` and `web/*.mp4` are gitignored, same as `images/` and `videos/`. `web-assets.md` is the tracked artifact — it's what tells a reviewer what the page is actually serving.

## How to run it

Always dry-run first. It probes every clip and prints the plan without encoding, so a wrong `-Path` costs nothing:

```powershell
.claude/skills/creative-video-optimizer/scripts/Optimize-CreativeVideos.ps1 -Path dancing/cat-dancing -DryRun
```

Then for real:

```powershell
.claude/skills/creative-video-optimizer/scripts/Optimize-CreativeVideos.ps1 -Path dancing/cat-dancing
```

`-Path` is forgiving. It accepts a niche path (`dancing/cat-dancing`, resolved under `funnel/creative-development/`), a niche folder, a `videos/` folder, a loose folder of MP4s, or a single `.mp4` anywhere on disk — a one-off file from Downloads works the same way.

Report back the `web/` folder and the size table the script prints.

## Defaults, and when to move off them

| | Default | Lever |
| --- | --- | --- |
| Trim | first 8s | `-Duration 5`, or `-Duration 0` to keep the whole clip |
| WebP | 480px / 15fps / q60 | `-WebpWidth` `-WebpFps` `-WebpQuality` |
| MP4 | 720px, capped 5 MB, audio stripped | `-Mp4Width` `-MaxSizeMB` `-AudioKbps` |

Real numbers from the `dancing/cat-dancing` run — sora clips are 720x1280, mostly 4.3s:

| Clip | Source MP4 | WebP | MP4 |
| --- | --- | --- | --- |
| generation | 2.54 MB | 0.86 MB | 2.54 MB (copied) |
| hook-a | 5.87 MB | 1.45 MB | 4.66 MB (re-encoded) |
| hook-b | 2.26 MB | 0.67 MB | 2.26 MB (copied) |
| hook-c | 2.72 MB | 0.73 MB | 2.72 MB (copied) |
| landing-hug | 2.90 MB | 0.72 MB | 2.90 MB (copied) |

WebP lands around 0.7–1.5 MB at the default settings, so there is plenty of room. Raising `-WebpWidth` to 720 roughly doubles the file for a size most phones downscale away — only reach for it when the clip is the hero element on the screen.

The scaling headroom is much tighter on a full 1080x1920 source (a 13.6s phone recording, 8s kept, measured separately): 720px/15fps/q60 came out at 5.20 MB, 480px/15fps/q60 at 3.17 MB, 480px/12fps/q45 at 2.10 MB, 360px/12fps/q50 at 1.50 MB. 480/15/q60 is the default because it is the largest setting that still clears 5 MB on that worst case.

Audio is stripped by default: these clips are silent footage, so the track is pure weight.

Useful flags: `-Only hook-a,generation` for a subset, `-SkipMp4` when the page only serves WebP, `-SkipWebp` for the reverse, `-Force` to re-encode finished outputs, `-NoInstall` to fail instead of auto-downloading ffmpeg.

## Check for an audio track before applying the defaults

The defaults assume a sora funnel clip: vertical, a few seconds, silent. A finished ad video is none of those, and the defaults will quietly wreck it — `-Duration 8` cuts 33 seconds down to 8, `-AudioKbps 0` throws the voiceover away, and WebP has no audio track at all, so a WebP of a narrated ad is silent by construction.

So probe first when the input did not come out of `creative-video-generator`:

```powershell
ffprobe -v error -show_entries stream=codec_type,codec_name,channels -of default=noprint_wrappers=1 <file>
```

If there is an audio stream that carries meaning, run `-Duration 0 -SkipWebp -AudioKbps 128` and pick `-Mp4Width` from the source. A 1920x1080 33s ad at 19.76 MB came out at 4.69 MB this way — 1280x720, ~1070 kbps video, audio intact.

## The MP4 cap is a ceiling, never a target

`-MaxSizeMB` is the most the output may weigh, not the size it should aim for. Two guards enforce that, and both exist because the first version violated it — it turned a 2.54 MB source into 4.16 MB while losing quality, because the bitrate math happily spent the whole budget:

- A clip that needs no trim, already fits the cap, and is no wider than `-Mp4Width` is **copied, not re-encoded** (`mp4 copied as-is` in the output table).
- Otherwise the target bitrate is clamped to the source's own bitrate, so a re-encode can shrink a clip but never inflate it.

On the cat-dancing run that means only `hook-a` is actually encoded; the other four are copied. If you change this code, keep both guards.

Bitrate is derived from clip duration and the size budget, then the script **checks the real output** and re-encodes at a lower bitrate if it overshot, up to 4 attempts. Don't replace that loop with a single bitrate calculation — x264 rate control overshoots often enough on short clips that a one-shot estimate silently ships files over the cap.

If a clip still can't reach the cap after 4 attempts, the script says so per-file rather than failing the run. That means the clip is too long or too detailed for the budget: lower `-Mp4Width` first, and only then `-MaxSizeMB`.

## ffmpeg

The scripts find ffmpeg on PATH, then at `%USERPROFILE%\tools\ffmpeg\bin\`, and download a portable build into that second location if neither has it. No admin rights, nothing added to PATH.

**Download source matters.** `gyan.dev` throttles to roughly 2 MB/min and will appear to hang for half an hour; the BtbN GitHub build pulls 185 MB in about a minute. `FfmpegTools.ps1` pins the GitHub URL — don't swap it back to gyan.dev.

**Build ffmpeg arguments as an explicit array**, then splat it: `$ffArgs = @("-y", ...); & $ffmpeg @ffArgs`. The first version wrote the arguments inline across backtick-continued lines with an `@splat` in the middle, and ffmpeg received a mangled argv — it read the output path as `-` and died with `Unable to choose an output format for 'pipe:'`. The identical arguments on a single line worked, which makes this look like an ffmpeg problem when it is a quoting one. The array form is also what makes `-Verbose` able to print the exact command, so debugging the next one is cheap. Don't "tidy" it back to inline arguments.

## What NOT to do

- Don't encode over the source clips in `videos/`. The whole point of a separate `web/` folder is that re-deriving at different settings stays free; an in-place overwrite makes the original unrecoverable without paying sora again.
- Don't commit `web/*.webp` or `web/*.mp4` — they're gitignored. `web-assets.md` is the tracked record.
- Don't bake copy into these clips. The overlay headline lives in `creative-brief.md`, same contract as `creative-video-generator` — this skill only changes container, size and length.
- Don't hand-run raw ffmpeg commands for this and skip the manifest. The manifest is how anyone else knows what settings the live assets were built at.
