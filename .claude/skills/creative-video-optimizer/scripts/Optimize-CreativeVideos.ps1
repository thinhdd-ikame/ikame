<#
.SYNOPSIS
  Turn generated creative MP4s into web-ready assets under creative-development/<niche>/web/.

.DESCRIPTION
  Reads the raw clips written by the creative-video-generator skill
  (funnel/creative-development/<niche>/videos/*.mp4), trims each one to the
  ad-usable opening seconds, and writes two web deliverables per clip into a
  sibling web/ folder:

    <slug>.webp  animated WebP for the funnel landing page
    <slug>.mp4   size-capped H.264 for anywhere WebP is not accepted

  Source clips are never modified. web-assets.md records what was produced with
  which settings, and is the tracked artifact - the media itself is gitignored.

.PARAMETER Path
  What to optimize. Accepts, in order of preference:
    - a niche path, e.g. "dancing/cat-dancing" (resolved under funnel/creative-development/)
    - a creative-development niche folder (the one holding videos/)
    - a videos/ folder, or any folder of .mp4 files
    - a single .mp4 file

.PARAMETER Duration
  Seconds to keep from the start of each clip. Default 8. Pass 0 to keep the
  full clip. A clip shorter than this is used whole.

.PARAMETER MaxSizeMB
  Size cap for the .mp4 deliverable. Default 5.

.PARAMETER WebpWidth
  Width of the .webp deliverable; height scales proportionally. Default 480.

.PARAMETER WebpFps
  Frame rate of the .webp deliverable. Default 15.

.PARAMETER WebpQuality
  libwebp quality 0-100. Default 60. Higher looks better and weighs more.

.PARAMETER Mp4Width
  Width cap for the .mp4 deliverable. Default 720. Narrower clips stay native.

.PARAMETER AudioKbps
  Audio bitrate for the .mp4. Default 0, i.e. stripped - these clips are silent
  footage and the audio track is dead weight.

.PARAMETER Only
  Optimize just these slugs (file base names), e.g. -Only hook-a, generation.

.PARAMETER SkipWebp
  Produce only the .mp4 deliverable. Use for clips with an audio track that
  matters - WebP has no audio at all.

.PARAMETER SkipMp4
  Produce only the .webp deliverable.

.PARAMETER Force
  Re-encode even when the output already exists.

.PARAMETER NoInstall
  Fail instead of auto-downloading a portable ffmpeg when none is found.

.PARAMETER DryRun
  Print the plan - inputs, resolved settings, outputs - without encoding.

.EXAMPLE
  ./Optimize-CreativeVideos.ps1 -Path dancing/cat-dancing -DryRun

.EXAMPLE
  ./Optimize-CreativeVideos.ps1 -Path dancing/cat-dancing

.EXAMPLE
  ./Optimize-CreativeVideos.ps1 -Path C:\Users\me\Downloads\clip.mp4 -Duration 8 -WebpWidth 360
#>

param(
    [Parameter(Mandatory, Position = 0)][string]$Path,
    [ValidateRange(0, 600)][double]$Duration = 8,
    [ValidateRange(0.1, 500)][double]$MaxSizeMB = 5,
    [ValidateRange(64, 4096)][int]$WebpWidth = 480,
    [ValidateRange(1, 60)][int]$WebpFps = 15,
    [ValidateRange(0, 100)][int]$WebpQuality = 60,
    [ValidateRange(128, 4096)][int]$Mp4Width = 720,
    [ValidateRange(0, 320)][int]$AudioKbps = 0,
    [string[]]$Only,
    [switch]$SkipMp4,
    [switch]$SkipWebp,
    [switch]$Force,
    [switch]$NoInstall,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $ScriptDir "FfmpegTools.ps1")

# <repo>/.claude/skills/creative-video-optimizer/scripts -> <repo>
$RepoRoot = (Get-Item $ScriptDir).Parent.Parent.Parent.Parent.FullName

# Aim under the cap; muxing overhead and rate control both drift upward.
$SafetyFactor = 0.93
$MaxAttempts = 4

function Resolve-SourceSet {
    <#
      Works out which .mp4 files to read and where the web/ folder belongs.
    #>
    param([string]$InputPath)

    $candidates = @($InputPath)
    if (-not [System.IO.Path]::IsPathRooted($InputPath)) {
        $candidates += (Join-Path $RepoRoot $InputPath)
        $candidates += (Join-Path $RepoRoot "funnel/creative-development/$InputPath")
    }

    $resolved = $null
    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) { $resolved = Get-Item $candidate; break }
    }
    if (-not $resolved) {
        throw "Could not resolve -Path '$InputPath'. Tried:`n  " + ($candidates -join "`n  ")
    }

    if (-not $resolved.PSIsContainer) {
        if ($resolved.Extension -ne ".mp4") { throw "Not an .mp4 file: $($resolved.FullName)" }
        return [pscustomobject]@{
            Videos    = @($resolved)
            OutputDir = Join-Path $resolved.DirectoryName "web"
            Label     = $resolved.BaseName
        }
    }

    # A niche folder holds videos/; otherwise treat the folder itself as the source.
    $videosDir = Join-Path $resolved.FullName "videos"
    if (Test-Path $videosDir) {
        $sourceDir = Get-Item $videosDir
        $outputDir = Join-Path $resolved.FullName "web"
    } elseif ($resolved.Name -eq "videos") {
        $sourceDir = $resolved
        $outputDir = Join-Path $resolved.Parent.FullName "web"
    } else {
        $sourceDir = $resolved
        $outputDir = Join-Path $resolved.FullName "web"
    }

    $videos = @(Get-ChildItem -Path $sourceDir.FullName -Filter *.mp4 -File | Sort-Object Name)
    if ($videos.Count -eq 0) { throw "No .mp4 files found in $($sourceDir.FullName)" }

    [pscustomobject]@{
        Videos    = $videos
        OutputDir = $outputDir
        Label     = $sourceDir.Parent.Name
    }
}

function Invoke-WebpEncode {
    param(
        [string]$Ffmpeg, [string]$Source, [string]$Target,
        [double]$TrimSeconds, [int]$Width, [int]$Fps, [int]$Quality
    )

    $trimArgs = @()
    if ($TrimSeconds -gt 0) { $trimArgs = @("-t", $TrimSeconds) }

    $ffArgs = @("-y", "-loglevel", "error") + $trimArgs + @(
        "-i", $Source,
        "-vcodec", "libwebp",
        "-filter:v", "fps=fps=$Fps,scale=${Width}:-2:flags=lanczos",
        "-lossless", "0", "-compression_level", "6", "-q:v", $Quality,
        "-loop", "0", "-preset", "picture", "-an", "-fps_mode", "passthrough",
        $Target)

    Write-Verbose "ffmpeg $($ffArgs -join ' ')"
    & $Ffmpeg @ffArgs
    if ($LASTEXITCODE -ne 0) { throw "webp encode failed for $Source" }
}

function Invoke-Mp4Encode {
    <#
      Two-pass H.264 aimed at a size budget, verified against the real output and
      retried at a lower bitrate when it overshoots.
    #>
    param(
        [string]$Ffmpeg, [string]$Source, [string]$Target,
        [double]$TrimSeconds, [double]$ClipSeconds,
        [int]$Width, [int]$Audio, [double]$BudgetBytes,
        [double]$SourceBytes, [double]$SourceSeconds, [int]$SourceWidth
    )

    # A clip that already fits and needs no trim or downscale is copied, not
    # re-encoded: budget-filling rate control would otherwise inflate a 2.5 MB
    # source toward the 5 MB cap and lose quality doing it.
    if ($TrimSeconds -le 0 -and $SourceBytes -le $BudgetBytes -and $SourceWidth -le $Width) {
        Copy-Item $Source $Target -Force
        return [pscustomobject]@{ Kbps = $null; OverBudget = $false; Copied = $true }
    }

    $trimArgs = @()
    if ($TrimSeconds -gt 0) { $trimArgs = @("-t", $TrimSeconds) }

    # Never spend more bits per second than the source had - the budget is a
    # ceiling, not a target.
    $sourceKbps = [Math]::Floor(($SourceBytes * 8) / ($SourceSeconds * 1000))

    $audioArgs = if ($Audio -eq 0) { @("-an") } else { @("-c:a", "aac", "-b:a", "${Audio}k") }
    $filter = "scale='min($Width,iw)':-2:flags=lanczos"
    $logBase = Join-Path $env:TEMP ("ffpass-" + [guid]::NewGuid().ToString("N"))

    try {
        $ratio = $SafetyFactor
        $attempt = 0
        while ($true) {
            $attempt++
            $totalKbps = [Math]::Floor(($BudgetBytes * 8 * $ratio) / ($ClipSeconds * 1000))
            $videoKbps = $totalKbps - $Audio
            if ($videoKbps -gt $sourceKbps) { $videoKbps = $sourceKbps }
            if ($videoKbps -lt 100) { $videoKbps = 100 }

            $common = @("-y", "-loglevel", "error") + $trimArgs + @(
                "-i", $Source,
                "-c:v", "libx264", "-preset", "slow", "-filter:v", $filter,
                "-b:v", "${videoKbps}k", "-passlogfile", $logBase)

            $pass1 = $common + @("-pass", "1", "-an", "-f", "mp4", "NUL")
            Write-Verbose "ffmpeg $($pass1 -join ' ')"
            & $Ffmpeg @pass1
            if ($LASTEXITCODE -ne 0) { throw "mp4 pass 1 failed for $Source" }

            $pass2 = $common + @("-pass", "2") + $audioArgs + @("-movflags", "+faststart", $Target)
            Write-Verbose "ffmpeg $($pass2 -join ' ')"
            & $Ffmpeg @pass2
            if ($LASTEXITCODE -ne 0) { throw "mp4 pass 2 failed for $Source" }

            $actual = (Get-Item $Target).Length
            if ($actual -le $BudgetBytes) { return [pscustomobject]@{ Kbps = $videoKbps; OverBudget = $false; Copied = $false } }

            if ($attempt -ge $MaxAttempts) {
                Write-Warning ("{0} is {1:N2} MB, still over budget after {2} attempts" -f (Split-Path $Target -Leaf), ($actual / 1MB), $attempt)
                return [pscustomobject]@{ Kbps = $videoKbps; OverBudget = $true; Copied = $false }
            }

            # Overshot: shrink the budget by how far we missed, plus a nudge.
            $ratio = $ratio * ($BudgetBytes / $actual) * 0.97
        }
    } finally {
        $logFilter = (Split-Path $logBase -Leaf) + "*"
        Get-ChildItem -Path $env:TEMP -Filter $logFilter -ErrorAction SilentlyContinue |
            Remove-Item -Force -ErrorAction SilentlyContinue
    }
}

# --- plan -------------------------------------------------------------------

$source = Resolve-SourceSet -InputPath $Path
$videos = $source.Videos

if ($Only) {
    $wanted = @($Only | ForEach-Object { $_.ToLowerInvariant() })
    $videos = @($videos | Where-Object { $wanted -contains $_.BaseName.ToLowerInvariant() })
    if ($videos.Count -eq 0) {
        throw "-Only matched nothing. Available: " + (($source.Videos | ForEach-Object { $_.BaseName }) -join ", ")
    }
}

$ffprobe = Resolve-FfmpegTool -Name "ffprobe" -NoInstall:$NoInstall
$ffmpeg = Resolve-FfmpegTool -Name "ffmpeg" -NoInstall:$NoInstall

Write-Host "Source:  $($videos[0].DirectoryName)"
Write-Host "Output:  $($source.OutputDir)"
Write-Host "Trim:    $(if ($Duration -gt 0) { "first $Duration s" } else { 'full clip' })"
if (-not $SkipWebp) { Write-Host "WebP:    ${WebpWidth}px / ${WebpFps}fps / q$WebpQuality" }
if (-not $SkipMp4) { Write-Host "MP4:     ${Mp4Width}px / cap $MaxSizeMB MB / audio $(if ($AudioKbps -eq 0) { 'stripped' } else { "${AudioKbps}k" })" }
Write-Host ""

if ($DryRun) {
    foreach ($video in $videos) {
        $info = Get-VideoInfo -FfprobePath $ffprobe -VideoPath $video.FullName
        $kept = if ($Duration -gt 0) { [Math]::Min($Duration, $info.Duration) } else { $info.Duration }
        $outputs = @()
        if (-not $SkipWebp) { $outputs += "web/$($video.BaseName).webp" }
        if (-not $SkipMp4) { $outputs += "web/$($video.BaseName).mp4" }
        Write-Host ("{0,-16} {1}x{2} {3:N1}s {4:N2} MB -> keep {5:N1}s -> {6}" -f `
            $video.Name, $info.Width, $info.Height, $info.Duration, ($video.Length / 1MB), $kept, `
            ($outputs -join " + "))
    }
    Write-Host ""
    Write-Host "Dry run - nothing encoded."
    return
}

if (-not (Test-Path $source.OutputDir)) { New-Item -ItemType Directory -Force $source.OutputDir | Out-Null }

# --- encode -----------------------------------------------------------------

$rows = @()
foreach ($video in $videos) {
    $slug = $video.BaseName
    $webpPath = Join-Path $source.OutputDir "$slug.webp"
    $mp4Path = Join-Path $source.OutputDir "$slug.mp4"

    $webpDone = $SkipWebp -or ((Test-Path $webpPath) -and -not $Force)
    $mp4Done = $SkipMp4 -or ((Test-Path $mp4Path) -and -not $Force)
    if ($webpDone -and $mp4Done) {
        Write-Host "$slug - skip, already built"
        $rows += [pscustomobject]@{
            Slug = $slug; SourceMB = [Math]::Round($video.Length / 1MB, 2)
            WebpMB = $(if (Test-Path $webpPath) { [Math]::Round((Get-Item $webpPath).Length / 1MB, 2) } else { $null })
            Mp4MB = $(if (Test-Path $mp4Path) { [Math]::Round((Get-Item $mp4Path).Length / 1MB, 2) } else { $null })
            Note = "skipped"
        }
        continue
    }

    $info = Get-VideoInfo -FfprobePath $ffprobe -VideoPath $video.FullName
    $trim = if ($Duration -gt 0 -and $Duration -lt $info.Duration) { $Duration } else { 0 }
    $clipSeconds = if ($trim -gt 0) { $trim } else { $info.Duration }
    $note = ""

    if (-not $webpDone) {
        Write-Host "$slug - webp..."
        Invoke-WebpEncode -Ffmpeg $ffmpeg -Source $video.FullName -Target $webpPath `
            -TrimSeconds $trim -Width $WebpWidth -Fps $WebpFps -Quality $WebpQuality
    }

    if (-not $mp4Done) {
        Write-Host "$slug - mp4..."
        $result = Invoke-Mp4Encode -Ffmpeg $ffmpeg -Source $video.FullName -Target $mp4Path `
            -TrimSeconds $trim -ClipSeconds $clipSeconds -Width $Mp4Width `
            -Audio $AudioKbps -BudgetBytes ($MaxSizeMB * 1MB) `
            -SourceBytes $video.Length -SourceSeconds $info.Duration -SourceWidth $info.Width
        if ($result.OverBudget) { $note = "mp4 over budget" }
        if ($result.Copied) { $note = "mp4 copied as-is" }
    }

    $rows += [pscustomobject]@{
        Slug     = $slug
        SourceMB = [Math]::Round($video.Length / 1MB, 2)
        WebpMB   = $(if (Test-Path $webpPath) { [Math]::Round((Get-Item $webpPath).Length / 1MB, 2) } else { $null })
        Mp4MB    = $(if (Test-Path $mp4Path) { [Math]::Round((Get-Item $mp4Path).Length / 1MB, 2) } else { $null })
        Note     = $note
    }
}

# --- manifest ---------------------------------------------------------------

$manifestPath = Join-Path $source.OutputDir "web-assets.md"
$lines = @()
$lines += "# Web Assets - $($source.Label)"
$lines += ""
$lines += "Built by the creative-video-optimizer skill from ``videos/``. Media here is"
$lines += "gitignored; this file is the tracked record. Re-run the skill to rebuild."
$lines += ""
$lines += "**Settings:** trim $(if ($Duration -gt 0) { "${Duration}s" } else { 'none' }) | " +
          "$(if ($SkipWebp) { 'no webp' } else { "webp ${WebpWidth}px ${WebpFps}fps q$WebpQuality" }) | " +
          "$(if ($SkipMp4) { 'no mp4' } else { "mp4 ${Mp4Width}px cap ${MaxSizeMB} MB, audio $(if ($AudioKbps -eq 0) { 'stripped' } else { "${AudioKbps}k" })" })"
$lines += ""
$lines += "| Asset | Source MP4 | WebP | MP4 |"
$lines += "| --- | --- | --- | --- |"
foreach ($row in $rows) {
    $webp = if ($null -ne $row.WebpMB) { "``web/$($row.Slug).webp`` ($($row.WebpMB) MB)" } else { "-" }
    $mp4 = if ($null -ne $row.Mp4MB) { "``web/$($row.Slug).mp4`` ($($row.Mp4MB) MB)" } else { "-" }
    $lines += "| $($row.Slug) | $($row.SourceMB) MB | $webp | $mp4 |"
}
$lines += ""
$lines += "_Generated $(Get-Date -Format 'yyyy-MM-dd HH:mm')._"

Set-Content -Path $manifestPath -Value $lines -Encoding UTF8

Write-Host ""
$rows | Format-Table -AutoSize
Write-Host "Wrote $manifestPath"

$problems = @($rows | Where-Object { $_.Note -eq "mp4 over budget" })
if ($problems.Count -gt 0) {
    Write-Host ""
    Write-Host "$($problems.Count) clip(s) could not reach the size cap. Lower -Mp4Width or -MaxSizeMB headroom:"
    foreach ($p in $problems) { Write-Host "  - $($p.Slug): $($p.Mp4MB) MB" }
}
