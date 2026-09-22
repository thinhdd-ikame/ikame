<#
.SYNOPSIS
  Generate AI video ad creatives for the ad-worthy screens of an existing funnel-content.md.

.DESCRIPTION
  Reads a funnel-content.md (written by the funnel-content-writer skill) of ANY shape,
  takes the screens it declares as ad-creative candidates in its "creative_screens:"
  frontmatter (slug -> screen number; legacy files without frontmatter fall back to
  matching the 12-screen template's Welcome Hook A/B/C and Generation titles), generates
  a clean still of the subject per screen and then an image-to-video clip, and writes
  everything under funnel/creative-development/<same-niche-path>/.

  The stills deliberately carry no app UI and no copy: the headline belongs on top as
  an overlay in the edit. creative-brief.md records which copy pairs with which clip.

.PARAMETER FunnelContentPath
  Path to the source funnel-content.md, e.g.
  funnel/funnel-development/dancing/cat-dancing/funnel-content.md

.PARAMETER ImageProvider
  Key into $ImageProviders (Providers.ps1). Defaults to config/providers.json (or
  config/providers.example.json if providers.json hasn't been created yet).

.PARAMETER VideoProvider
  Key into $VideoProviders (Providers.ps1). Same default resolution as -ImageProvider.

.PARAMETER OnlyScreens
  Run just these slugs instead of all of them. The valid slugs are whatever the funnel's
  creative_screens frontmatter declares (conventionally hook-a, hook-b, hook-c, reveal;
  legacy template funnels use hook-a, hook-b, hook-c, generation).
  A partial run leaves creative-brief.md alone, since it would otherwise drop the
  screens it didn't run.

.PARAMETER Force
  Regenerate even when the clip already exists. Without it, finished screens are
  skipped so a re-run after a failure resumes instead of paying twice.

.PARAMETER DryRun
  Build every prompt and print what would be sent, without calling any API or
  writing any media files. Use this first to sanity-check parsing before spending
  API credits.

.EXAMPLE
  ./Generate-CreativeVideos.ps1 -FunnelContentPath funnel/funnel-development/dancing/cat-dancing/funnel-content.md -DryRun

.EXAMPLE
  $env:IKAME_AI_KEY = "..."
  ./Generate-CreativeVideos.ps1 -FunnelContentPath funnel/funnel-development/dancing/cat-dancing/funnel-content.md -OnlyScreens hook-a
#>

param(
    [Parameter(Mandatory)][string]$FunnelContentPath,
    [string]$ImageProvider,
    [string]$VideoProvider,
    [string[]]$OnlyScreens,
    [switch]$Force,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $ScriptDir "Providers.ps1")

# --- Resolve config -----------------------------------------------------

$configDir = Join-Path (Split-Path -Parent $ScriptDir) "config"
$configPath = Join-Path $configDir "providers.json"
if (-not (Test-Path $configPath)) {
    $configPath = Join-Path $configDir "providers.example.json"
}
$config = Get-Content -Raw $configPath | ConvertFrom-Json

$imageSettings = $config.image
$videoSettings = $config.video
if (-not $ImageProvider) { $ImageProvider = $imageSettings.provider }
if (-not $VideoProvider) { $VideoProvider = $videoSettings.provider }

if (-not $ImageProviders.ContainsKey($ImageProvider)) {
    throw "Unknown image provider '$ImageProvider'. Known: $($ImageProviders.Keys -join ', ')"
}
if (-not $VideoProviders.ContainsKey($VideoProvider)) {
    throw "Unknown video provider '$VideoProvider'. Known: $($VideoProviders.Keys -join ', ')"
}

function Get-ApiKey($settings) {
    $envVar = $settings.apiKeyEnvVar
    $key = [Environment]::GetEnvironmentVariable($envVar)
    if (-not $key -and -not $DryRun) {
        throw "Environment variable '$envVar' is not set. Run: `$env:$envVar = '...'"
    }
    return $key
}

# --- Parse funnel-content.md --------------------------------------------

if (-not (Test-Path $FunnelContentPath)) {
    throw "Funnel content file not found: $FunnelContentPath"
}
$FunnelContentPath = (Resolve-Path $FunnelContentPath).Path
# -Encoding UTF8 is required: funnel-content.md holds em-dashes and arrows, and PS 5.1's
# default read decodes them with the ANSI codepage, which would send mojibake to the image API.
$content = Get-Content -Raw $FunnelContentPath -Encoding UTF8

# Frontmatter is the machine-readable contract (see funnel-content-writer/references/file-format.md).
# Funnels come in any shape now - 12-screen photo funnels, 24-screen quiz funnels - so the ad-worthy
# screens are declared by the funnel itself instead of guessed from titles. Parsed with a hand-rolled
# reader (no YAML module on PS 5.1): flat "key: value", a nested "creative_screens:" slug -> number
# map, and folded ">" continuations.
$frontmatter = @{}
$creativeScreens = @()
$fmMatch = [regex]::Match($content, '(?s)\A﻿?---\r?\n(?<fm>.*?)\r?\n---\r?\n')
if ($fmMatch.Success) {
    $currentKey = $null
    foreach ($line in ($fmMatch.Groups['fm'].Value -split "\r?\n")) {
        if ($line -match '^\s*#' -or $line -match '^\s*$') { continue }
        if ($line -match '^(?<key>[A-Za-z0-9_]+):\s*(?<val>.*)$') {
            $currentKey = $Matches['key']
            $val = $Matches['val'] -replace '\s{2,}#.*$', ''
            $val = $val.Trim().Trim('"').Trim("'")
            if ($val -eq '>' -or $val -eq '|') { $val = '' }
            $frontmatter[$currentKey] = $val
        }
        elseif ($currentKey -eq 'creative_screens' -and $line -match '^\s+(?<k>[A-Za-z0-9_-]+):\s*(?<v>\d+)') {
            $creativeScreens += [PSCustomObject]@{ Slug = $Matches['k']; Number = [int]$Matches['v'] }
        }
        elseif ($currentKey -and $line -match '^\s+(?<cont>\S.*)$') {
            $frontmatter[$currentKey] = ("$($frontmatter[$currentKey]) $($Matches['cont'])").Trim()
        }
    }
}

# The title separator is matched as "any punctuation char" instead of a literal em-dash:
# PS 5.1 parses this BOM-less .ps1 with the ANSI codepage, so a non-ASCII character in the
# source would be corrupted at parse time and the match would silently fail.
$nicheMatch = [regex]::Match($content, '(?m)^#\s*Funnel Content\s*[^\w\s]\s*(?<name>.+?)\s*$')
if ($frontmatter['display_name']) {
    $nicheDisplayName = $frontmatter['display_name']
}
elseif ($nicheMatch.Success) {
    $nicheDisplayName = $nicheMatch.Groups['name'].Value
}
else {
    throw "Could not find '# Funnel Content - NICHE' title or a display_name in frontmatter: $FunnelContentPath"
}

$transformMatch = [regex]::Match($content, '(?m)^AI .*?generator funnel:\s*(?<desc>.+?)\.\s*\d+-screen')
$transformDesc = if ($frontmatter['input'] -and $frontmatter['output']) {
    "uploads $($frontmatter['input']), gets $($frontmatter['output'])"
} elseif ($transformMatch.Success) {
    $transformMatch.Groups['desc'].Value
} else {
    $nicheDisplayName
}

$subjectWord = if ($frontmatter['subject']) { $frontmatter['subject'] } else { "subject" }
if ($subjectWord -eq "subject") {
    foreach ($p in @('(?i)photo of (?:their|the)\s+(?<subject>\w+)', '(?i)(?<subject>\w+)\s+owner\s+uploads')) {
        $m = [regex]::Match($transformDesc, $p)
        if ($m.Success) { $subjectWord = $m.Groups['subject'].Value; break }
    }
}

# funnel-content.md personalizes with {{cat_name}} / {{baby_name}} / {{user_name}} tokens.
# There's no live user session here, so resolve each token from its own name rather than
# one global subject - a self funnel says "your video", a pet funnel says "your cat's video".
function Resolve-Placeholders([string]$text, [string]$fallbackSubject) {
    if (-not $text) { return $text }
    $text = $text -replace '\{\{user_name\}\}''s', 'your'
    $text = $text -replace '\{\{user_name\}\}', 'you'
    $text = $text -replace '\{\{(\w+)_name\}\}', 'your $1'
    return $text -replace '\{\{\w+\}\}', "your $fallbackSubject"
}

# What the subject should actually be seen doing. Taken from the funnel's own "motion:" frontmatter
# when it has one - the niche knows its own motion better than any keyword table - and otherwise
# derived from the transformation sentence, because a generic "turn this into a video" motion prompt
# produces near-static clips.
$transformAction = if ($frontmatter['motion']) { $frontmatter['motion'] } else { switch -Regex ($transformDesc) {
    'danc'                  { "an energetic, funny dance with big rhythmic body movements"; break }
    'black *& *white|b&w'   { "a slow cinematic portrait moment - a subtle head turn, a blink, hair and light shifting - in rich high-contrast black and white"; break }
    'halloween|costume'     { "a playful Halloween costume performance, spooky and fun, with clear movement"; break }
    default                 { "the transformation described above, with clear visible movement" }
} }

# Ad-angle profiles per slug. Which screen each slug points at comes from the funnel's
# "creative_screens:" frontmatter; legacy funnels (written before that contract existed) fall back
# to matching by TITLE, never by number - the 12-screen template was renumbered once and number-based
# mapping silently attached the wrong ad angle to the wrong screen.
# An ordered array, so no hashtable key/index ambiguity.
$TargetScreens = @(
    @{ Slug = "hook-a"; TitlePattern = 'Welcome Hook A'; Angle = "opening hook, establish the promise"
       Staging = "looking straight into the camera in a cosy, warmly lit home setting"
       Action = "comes alive and breaks into $transformAction, big and immediately obvious from the first frame" }
    @{ Slug = "hook-b"; TitlePattern = 'Welcome Hook B'; Angle = "reinforce with relatable ease-of-use framing"
       Staging = "relaxed in a bright, ordinary living room, candid everyday moment"
       Action = "starts moving, building quickly from small movements into $transformAction" }
    @{ Slug = "hook-c"; TitlePattern = 'Welcome Hook C'; Angle = "reinforce speed and ease"
       Staging = "close portrait in warm golden light"
       Action = "instantly bursts into $transformAction, fast and joyful, no build-up" }
    @{ Slug = "generation"; TitlePattern = 'Generation \(Loading\)'; Angle = "the AI transformation actually happening"
       Staging = "posed like a plain still snapshot, neutral background"
       Action = "visibly comes to life out of the frozen snapshot and turns into $transformAction, a magical photo-to-motion transformation" }
    # No TitlePattern: "reveal" is the shape-neutral name for the transformation/result screen and
    # only ever arrives through frontmatter, so it takes no part in legacy title matching.
    @{ Slug = "reveal"; TitlePattern = $null; Angle = "the payoff the funnel is selling"
       Staging = "posed like a plain still snapshot, neutral background"
       Action = "visibly comes to life out of the frozen snapshot and turns into $transformAction, a magical transformation" }
)

# Any slug a funnel declares that has no profile above still gets a usable pair of prompts.
$DefaultAngle = @{ Angle = "the product moment worth advertising"
                   Staging = "looking straight into the camera in a warmly lit everyday setting"
                   Action = "moves into $transformAction, clearly and continuously" }

# Screen headers are "## N." in flat funnels and "### N." in staged ones - accept both.
$screenPattern = '(?ms)^#{2,3}\s*(?<num>\d+)\.\s*(?<title>.+?)\r?\n(?<body>.*?)(?=^#{2,3}\s*\d+\.|\z)'
$screenMatches = [regex]::Matches($content, $screenPattern)

$parsedScreens = @()
foreach ($m in $screenMatches) {
    $body = $m.Groups['body'].Value
    # "Headline:" in single-variant funnels, "Headline A:" in A/B-ready ones - A is always the control.
    $headline = [regex]::Match($body, '(?m)^\*\*Headline(?:\s+A)?:\*\*\s*(.+?)\s*$')
    # funnel-content.md uses {{cat_name}}-style placeholders for personalization;
    # there's no live user session here, so swap in a generic stand-in.
    $headlineText = if ($headline.Success) { $headline.Groups[1].Value } else { "" }
    $headlineText = Resolve-Placeholders $headlineText $subjectWord
    if ($headlineText) { $headlineText = $headlineText.Substring(0, 1).ToUpper() + $headlineText.Substring(1) }

    $parsedScreens += [PSCustomObject]@{
        Number   = [int]$m.Groups['num'].Value
        Title    = $m.Groups['title'].Value.Trim()
        Headline = $headlineText
    }
}

# Bind each ad angle to a screen, and fail loudly rather than silently producing a creative for the
# wrong one. Frontmatter wins when present (works for any funnel shape); otherwise fall back to the
# legacy title patterns, which only know the 12-screen photo/video template.
$plan = @()
if ($creativeScreens.Count -gt 0) {
    foreach ($entry in $creativeScreens) {
        $screen = $parsedScreens | Where-Object { $_.Number -eq $entry.Number } | Select-Object -First 1
        if (-not $screen) {
            throw "frontmatter creative_screens maps '$($entry.Slug)' to screen $($entry.Number), which is not in $FunnelContentPath. Screens found: $(($parsedScreens | ForEach-Object { "$($_.Number). $($_.Title)" }) -join ' | ')"
        }
        $angle = $TargetScreens | Where-Object { $_.Slug -eq $entry.Slug } | Select-Object -First 1
        if (-not $angle) {
            $angle = @{ Slug = $entry.Slug; Angle = $DefaultAngle.Angle; Staging = $DefaultAngle.Staging; Action = $DefaultAngle.Action }
        }
        $plan += [PSCustomObject]@{ Target = $angle; Screen = $screen }
    }
}
else {
    foreach ($t in $TargetScreens | Where-Object { $_.TitlePattern }) {
        $screen = $parsedScreens | Where-Object { $_.Title -match $t.TitlePattern } | Select-Object -First 1
        if (-not $screen) {
            throw "No screen matching '$($t.TitlePattern)' in $FunnelContentPath, and no creative_screens frontmatter to go by. Add a creative_screens block (see funnel-content-writer/references/file-format.md). Screens found: $(($parsedScreens | ForEach-Object { "$($_.Number). $($_.Title)" }) -join ' | ')"
        }
        $plan += [PSCustomObject]@{ Target = $t; Screen = $screen }
    }
}

# --- Resolve output paths ------------------------------------------------

$normalized = $FunnelContentPath -replace '\\', '/'
if ($normalized -notmatch '/funnel-development/(?<nichePath>.+)/funnel-content\.md$') {
    throw "Expected path under .../funnel-development/<niche-path>/funnel-content.md, got: $FunnelContentPath"
}
$nichePath = $Matches['nichePath']
$outDir = ($normalized -replace '/funnel-development/', '/creative-development/') -replace '/funnel-content\.md$', ''
$outDir = $outDir -replace '/', '\'

$imagesDir = Join-Path $outDir "images"
$videosDir = Join-Path $outDir "videos"
$briefPath = Join-Path $outDir "creative-brief.md"

if (-not $DryRun) {
    New-Item -ItemType Directory -Force -Path $imagesDir | Out-Null
    New-Item -ItemType Directory -Force -Path $videosDir | Out-Null
}

# --- Style constants -----------------------------------------------------
# Deliberately NOT the funnel's own app-UI visual language (dark bg, gradient buttons):
# that belongs to the screen mockup, while this describes footage of the real subject.

$StyleCue = "Natural lighting, shallow depth of field, crisp detail, cinematic colour, shot on a modern phone camera"

$subjectPhrase = switch ($subjectWord) {
    "cat"     { "A real domestic cat" }
    "dog"     { "A real dog" }
    "baby"    { "A real baby" }
    "partner" { "A real young couple together" }
    "couple"  { "A real young couple together" }
    "person"  { "A real person" }
    "subject" { "A real person" }
    # Frontmatter can name any subject (pet, plant, car, room...), so build a phrase from it
    # rather than silently falling back to a person and generating footage of the wrong thing.
    default   { "A real $subjectWord" }
}

# --- Generate ------------------------------------------------------------

$briefEntries = @()
$failures = @()
$imageKey = if (-not $DryRun) { Get-ApiKey $imageSettings } else { $null }
$videoKey = if (-not $DryRun) { Get-ApiKey $videoSettings } else { $null }

$planToRun = if ($OnlyScreens) { $plan | Where-Object { $OnlyScreens -contains $_.Target.Slug } } else { $plan }
if ($OnlyScreens -and -not $planToRun) {
    throw "-OnlyScreens '$($OnlyScreens -join ", ")' matched nothing. Slugs in this funnel: $(($plan | ForEach-Object { $_.Target.Slug }) -join ', ')"
}

foreach ($item in $planToRun) {
    $screen = $item.Screen
    $target = $item.Target
    $slug = $target.Slug
    $num = $screen.Number

    # The frame deliberately contains no app UI and no copy. Feeding sora a screenshot-style
    # mockup warps the lettering and gives it nothing to animate; the headline and CTA belong
    # on top as an overlay in the edit, not baked into the generated footage.
    $imagePrompt = "Photorealistic vertical 9:16 opening frame for a social video ad. $subjectPhrase, $($target.Staging). $StyleCue. No text, no captions, no user interface, no buttons, no logos and no watermarks anywhere in the frame."
    $motionPrompt = "$subjectPhrase $($target.Action). Pronounced, continuous movement for the entire clip - clearly in motion from the first frame to the last, never a still photo with only a camera drift. Vertical smartphone video, natural handheld feel. No text, captions, interface or logos anywhere in the frame."

    Write-Host "== Screen $num - $($screen.Title) [$slug] =="
    Write-Host "Image prompt:  $imagePrompt"
    Write-Host "Motion prompt: $motionPrompt"

    $imagePath = Join-Path $imagesDir "$slug.png"
    $videoPath = Join-Path $videosDir "$slug.mp4"

    $screenStatus = "dry-run"
    if (-not $DryRun) {
        if ((Test-Path $videoPath) -and -not $Force) {
            Write-Host "  skip - $videoPath already exists"
            $screenStatus = "skipped (already generated)"
        }
        else {
            # One screen failing (a moderation block, a provider hiccup) must not abandon the
            # screens after it - a matrix run is 75 clips and re-running is billed again.
            try {
                Write-Host "  image via $ImageProvider / $($imageSettings.model)..."
                $imageBytes = & $ImageProviders[$ImageProvider] $imagePrompt $imageKey $imageSettings
                [System.IO.File]::WriteAllBytes($imagePath, $imageBytes)
                Write-Host "    -> $imagePath ($([Math]::Round($imageBytes.Length / 1KB)) KB)"

                Write-Host "  video via $VideoProvider / $($videoSettings.model)..."
                $videoBytes = & $VideoProviders[$VideoProvider] $imageBytes $motionPrompt $videoKey $videoSettings
                [System.IO.File]::WriteAllBytes($videoPath, $videoBytes)
                Write-Host "    -> $videoPath ($([Math]::Round($videoBytes.Length / 1KB)) KB)"
                $screenStatus = "ok"
            }
            catch {
                $reason = "$_"
                Write-Host "  FAILED: $reason"
                $failures += [PSCustomObject]@{ Screen = $num; Slug = $slug; Reason = $reason }
                $screenStatus = "FAILED - $reason"
            }
        }
    }

    $briefEntries += [PSCustomObject]@{
        Number       = $num
        Title        = $screen.Title
        Slug         = $slug
        OverlayCopy  = $screen.Headline
        ImagePrompt  = $imagePrompt
        MotionPrompt = $motionPrompt
        ImagePath    = "images/$slug.png"
        VideoPath    = "videos/$slug.mp4"
        Status       = $screenStatus
    }
}

# --- Write creative-brief.md ---------------------------------------------

# A partial run only knows about the screens it ran, so writing the brief would drop the rest.
if (-not $DryRun -and $OnlyScreens) {
    Write-Host ""
    Write-Host "Partial run (screens $($OnlyScreens -join ', ')) - left creative-brief.md untouched."
    Write-Host "Re-run without -OnlyScreens to rebuild it across all screens."
}
elseif (-not $DryRun) {
    $lines = @()
    $lines += "# Creative Brief - $nicheDisplayName"
    $lines += ""
    $lines += "Generated from ``$($nichePath)/funnel-content.md``. Image provider: ``$ImageProvider``. Video provider: ``$VideoProvider``."
    $lines += ""
    $lines += "---"
    foreach ($e in $briefEntries) {
        $lines += ""
        $lines += "## $($e.Number). $($e.Title)"
        $lines += "**Overlay copy (add in the edit, not baked into the footage):** $($e.OverlayCopy)"
        $lines += "**Image prompt:** $($e.ImagePrompt)"
        $lines += "**Motion prompt:** $($e.MotionPrompt)"
        $lines += "**Image:** ``$($e.ImagePath)``"
        $lines += "**Video:** ``$($e.VideoPath)``"
        $lines += "**Status:** $($e.Status)"
    }
    $lines -join "`n" | Set-Content -Path $briefPath -Encoding utf8
    Write-Host ""
    Write-Host "Wrote $briefPath"

    Write-Host ""
    if ($failures.Count -gt 0) {
        Write-Host "$($failures.Count) of $($planToRun.Count) screens FAILED for $nicheDisplayName :"
        foreach ($f in $failures) { Write-Host "  - screen $($f.Screen) [$($f.Slug)]: $($f.Reason)" }
        Write-Host "Re-running this funnel regenerates only the failed screens (finished ones are skipped)."
    }
    else {
        Write-Host "All $($planToRun.Count) screens done for $nicheDisplayName."
    }
}
else {
    Write-Host ""
    Write-Host "(dry run - no files written; would write to $outDir)"
}

