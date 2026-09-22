<#
  Shared ffmpeg helpers for the creative-video-optimizer skill.

  Dot-source this file; it defines Resolve-FfmpegTool, Get-VideoInfo and
  Install-PortableFfmpeg. Keep this file pure ASCII - PowerShell 5.1 parses
  BOM-less .ps1 using the ANSI codepage and silently corrupts anything else.
#>

$script:FfmpegHome = Join-Path $env:USERPROFILE "tools\ffmpeg"

# gyan.dev throttles to roughly 2 MB/min and is not usable here; the BtbN
# GitHub build pulled 185 MB in about a minute. Don't "helpfully" swap it back.
$script:FfmpegZipUrl = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"

function Install-PortableFfmpeg {
    <#
      Downloads a portable ffmpeg build into %USERPROFILE%\tools\ffmpeg.
      Nothing is added to PATH and nothing needs admin rights.
    #>
    [CmdletBinding()]
    param()

    $zip = Join-Path $env:TEMP "ffmpeg-portable.zip"
    $tmp = Join-Path $env:TEMP "ffmpeg-portable-extract"

    Write-Host "ffmpeg not found - downloading a portable build (about 185 MB)..."
    $previousProgress = $ProgressPreference
    $ProgressPreference = "SilentlyContinue"
    try {
        Invoke-WebRequest -Uri $script:FfmpegZipUrl -OutFile $zip -UseBasicParsing
    } finally {
        $ProgressPreference = $previousProgress
    }

    if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
    Expand-Archive -Path $zip -DestinationPath $tmp -Force

    $exe = Get-ChildItem -Path $tmp -Filter "ffmpeg.exe" -Recurse | Select-Object -First 1
    if (-not $exe) { throw "Downloaded archive did not contain ffmpeg.exe" }

    $payload = $exe.Directory.Parent.FullName
    if (Test-Path $script:FfmpegHome) { Remove-Item $script:FfmpegHome -Recurse -Force }
    New-Item -ItemType Directory -Force $script:FfmpegHome | Out-Null
    Copy-Item (Join-Path $payload "*") $script:FfmpegHome -Recurse -Force

    Remove-Item $zip -Force -ErrorAction SilentlyContinue
    Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue

    Write-Host "Installed ffmpeg to $script:FfmpegHome"
}

function Resolve-FfmpegTool {
    <#
      Returns the full path to ffmpeg.exe or ffprobe.exe, looking first on PATH,
      then in the portable install. Installs the portable build if neither has it
      and -NoInstall was not requested.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][ValidateSet("ffmpeg", "ffprobe")][string]$Name,
        [switch]$NoInstall
    )

    $onPath = Get-Command $Name -ErrorAction SilentlyContinue
    if ($onPath) { return $onPath.Source }

    $portable = Join-Path $script:FfmpegHome "bin\$Name.exe"
    if (Test-Path $portable) { return $portable }

    if ($NoInstall) {
        throw "$Name not found. Install it, or place a portable build at $portable"
    }

    Install-PortableFfmpeg
    if (Test-Path $portable) { return $portable }

    throw "$Name still not found after install at $portable"
}

function Get-VideoInfo {
    <#
      Probes a video and returns duration in seconds plus pixel dimensions.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$FfprobePath,
        [Parameter(Mandatory)][string]$VideoPath
    )

    $raw = & $FfprobePath -v error -select_streams v:0 `
        -show_entries stream=width,height -show_entries format=duration `
        -of default=noprint_wrappers=1 $VideoPath
    if ($LASTEXITCODE -ne 0) { throw "ffprobe failed on $VideoPath" }

    $values = @{}
    foreach ($line in $raw) {
        if ($line -match '^\s*([a-z_]+)=(.+)\s*$') { $values[$Matches[1]] = $Matches[2].Trim() }
    }

    $invariant = [Globalization.CultureInfo]::InvariantCulture
    $duration = 0.0
    if ($values.ContainsKey("duration")) {
        [void][double]::TryParse($values["duration"], [Globalization.NumberStyles]::Float, $invariant, [ref]$duration)
    }
    if ($duration -le 0) { throw "Could not read a usable duration from $VideoPath" }

    [pscustomobject]@{
        Duration = $duration
        Width    = [int]$values["width"]
        Height   = [int]$values["height"]
    }
}
