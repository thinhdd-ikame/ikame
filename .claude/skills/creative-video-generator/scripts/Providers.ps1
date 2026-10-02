<#
Provider adapter registry for the creative-video-generator skill.

Each entry is a scriptblock with a fixed signature so Generate-CreativeVideos.ps1
never needs to know provider-specific request/response shapes:

  Image adapter:  param($Prompt, $ApiKey, $Settings)                 -> returns [byte[]] image bytes
  Video adapter:  param($ImageBytes, $MotionPrompt, $ApiKey, $Settings) -> returns [byte[]] video bytes

$Settings is that provider's entry from config/providers.json (baseUrl, model, size, ...).
Switching between models on the same gateway is therefore a config change, not a code change.
To add a genuinely different vendor, add one new function plus one registry entry below.

Verified against ikame's internal LiteLLM gateway (core-ai-platform) in Sept 2026:
  POST /v1/images/generations  JSON  -> data[0].b64_json
  POST /v1/videos              multipart/form-data (input_reference = still frame)
  GET  /v1/videos/{id}               -> status: queued | in_progress | completed | failed
  GET  /v1/videos/{id}/content       -> the mp4 bytes
Note: the gateway rejects a multipart POST to /v1/videos that carries no file, and
sora-2 requires input_reference to match the requested size exactly, hence the resize below.
#>

Add-Type -AssemblyName System.Drawing

function Get-HttpErrorDetail($ErrorRecord) {
    $code = $null
    try { $code = [int]$ErrorRecord.Exception.Response.StatusCode } catch {}
    $detail = ""
    try {
        $reader = New-Object System.IO.StreamReader($ErrorRecord.Exception.Response.GetResponseStream())
        $detail = $reader.ReadToEnd()
    }
    catch {}
    if (-not $detail) { $detail = $ErrorRecord.Exception.Message }
    return "HTTP $code - $detail"
}

function Resize-ImageCover {
    <# Scales to cover WxH then center-crops, so the frame is never stretched. #>
    param([byte[]]$ImageBytes, [int]$Width, [int]$Height)

    $inStream = New-Object System.IO.MemoryStream(, $ImageBytes)
    $src = [System.Drawing.Image]::FromStream($inStream)

    $scale = [Math]::Max($Width / $src.Width, $Height / $src.Height)
    $scaledW = [int][Math]::Ceiling($src.Width * $scale)
    $scaledH = [int][Math]::Ceiling($src.Height * $scale)
    $offsetX = [int](($Width - $scaledW) / 2)
    $offsetY = [int](($Height - $scaledH) / 2)

    $target = New-Object System.Drawing.Bitmap $Width, $Height
    $g = [System.Drawing.Graphics]::FromImage($target)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($src, $offsetX, $offsetY, $scaledW, $scaledH)
    $g.Dispose()

    $outStream = New-Object System.IO.MemoryStream
    $target.Save($outStream, [System.Drawing.Imaging.ImageFormat]::Png)
    $target.Dispose(); $src.Dispose(); $inStream.Dispose()
    return $outStream.ToArray()
}

function Invoke-MultipartPost {
    <#
      Sends a multipart body with HttpWebRequest rather than Invoke-RestMethod.
      Invoke-RestMethod in PS 5.1 fails with an empty-bodied HTTP 400 on larger binary
      multipart payloads (reproduced at ~1.6MB against this gateway, while the identical
      bytes sent this way succeed). This path also lets us read the real error body.
    #>
    param([string]$Uri, [string]$ApiKey, [byte[]]$Body, [string]$Boundary, [int]$TimeoutSeconds)

    $req = [System.Net.HttpWebRequest]::Create($Uri)
    $req.Method = "POST"
    $req.ContentType = "multipart/form-data; boundary=$Boundary"
    $req.Headers.Add("Authorization", "Bearer $ApiKey")
    $req.Timeout = $TimeoutSeconds * 1000
    $req.ReadWriteTimeout = $TimeoutSeconds * 1000

    $stream = $req.GetRequestStream()
    try { $stream.Write($Body, 0, $Body.Length) } finally { $stream.Close() }

    try {
        $resp = $req.GetResponse()
        $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
        try { return $reader.ReadToEnd() | ConvertFrom-Json } finally { $reader.Close(); $resp.Close() }
    }
    catch [System.Net.WebException] {
        $r = $_.Exception.Response
        $code = if ($r) { [int]$r.StatusCode } else { "no response" }
        $text = ""
        if ($r) {
            $reader = New-Object System.IO.StreamReader($r.GetResponseStream())
            try { $text = $reader.ReadToEnd() } finally { $reader.Close() }
        }
        throw "HTTP $code - $text"
    }
}

function New-MultipartBody {
    param([System.Collections.Specialized.OrderedDictionary]$Fields, [byte[]]$FileBytes, [string]$FileField, [string]$FileName, [string]$Boundary)

    $enc = [System.Text.Encoding]::UTF8
    $ms = New-Object System.IO.MemoryStream
    $LF = "`r`n"
    foreach ($k in $Fields.Keys) {
        $part = "--$Boundary$LF" + "Content-Disposition: form-data; name=`"$k`"$LF$LF" + "$($Fields[$k])$LF"
        $b = $enc.GetBytes($part); $ms.Write($b, 0, $b.Length)
    }
    $head = "--$Boundary$LF" + "Content-Disposition: form-data; name=`"$FileField`"; filename=`"$FileName`"$LF" + "Content-Type: image/png$LF$LF"
    $b = $enc.GetBytes($head); $ms.Write($b, 0, $b.Length)
    $ms.Write($FileBytes, 0, $FileBytes.Length)
    $b = $enc.GetBytes($LF + "--$Boundary--$LF"); $ms.Write($b, 0, $b.Length)
    return $ms.ToArray()
}

function Invoke-IkameImage {
    param(
        [Parameter(Mandatory)][string]$Prompt,
        [Parameter(Mandatory)][string]$ApiKey,
        [Parameter(Mandatory)]$Settings
    )

    $uri = "$($Settings.baseUrl)/v1/images/generations"
    $body = @{
        model  = $Settings.model
        prompt = $Prompt
        n      = 1
        size   = $Settings.size
    } | ConvertTo-Json -Depth 5

    # The gateway drops connections occasionally ("Unable to read data from the transport
    # connection"), which is fatal to a long batch if it is not retried.
    $tries = if ($Settings.transientRetries) { [int]$Settings.transientRetries + 1 } else { 3 }
    $response = $null
    for ($try = 1; $try -le $tries; $try++) {
        try {
            $response = Invoke-RestMethod -Uri $uri -Method Post -Headers @{
                "Authorization" = "Bearer $ApiKey"
                "Content-Type"  = "application/json"
            } -Body $body -TimeoutSec $Settings.timeoutSeconds
            break
        }
        catch {
            $detail = Get-HttpErrorDetail $_
            if ($try -ge $tries) { throw "Image generation failed ($($Settings.model)) after $tries tries: $detail" }
            Write-Host "    image call failed on try $try ($detail) - retrying in 5s"
            Start-Sleep -Seconds 5
        }
    }

    $b64 = $response.data[0].b64_json
    if (-not $b64) { throw "Image response had no b64_json - raw: $($response | ConvertTo-Json -Depth 5 -Compress)" }
    return [Convert]::FromBase64String($b64)
}

function Invoke-IkameVideo {
    param(
        [Parameter(Mandatory)][byte[]]$ImageBytes,
        [Parameter(Mandatory)][string]$MotionPrompt,
        [Parameter(Mandatory)][string]$ApiKey,
        [Parameter(Mandatory)]$Settings
    )

    $dims = $Settings.size -split 'x'
    $refBytes = Resize-ImageCover -ImageBytes $ImageBytes -Width ([int]$dims[0]) -Height ([int]$dims[1])

    $fields = [ordered]@{
        model   = $Settings.model
        prompt  = $MotionPrompt
        seconds = "$($Settings.seconds)"
        size    = $Settings.size
    }
    # sora's moderation verdict is NOT deterministic: the identical still and prompt came back
    # moderation_blocked twice and then completed on a later attempt. Treat a block as transient
    # and retry, instead of writing the screen off. A blocked job yields no video to be billed for.
    $maxTries = if ($Settings.moderationRetries) { [int]$Settings.moderationRetries + 1 } else { 3 }

    for ($try = 1; $try -le $maxTries; $try++) {
        $boundary = [System.Guid]::NewGuid().ToString()
        $body = New-MultipartBody -Fields $fields -FileBytes $refBytes -FileField "input_reference" -FileName "frame.png" -Boundary $boundary

        try {
            $job = Invoke-MultipartPost -Uri "$($Settings.baseUrl)/v1/videos" -ApiKey $ApiKey `
                -Body $body -Boundary $boundary -TimeoutSeconds $Settings.timeoutSeconds
        }
        catch { throw "Video submit failed ($($Settings.model)): $_" }

        if (-not $job.id) { throw "Video submit returned no job id - raw: $($job | ConvertTo-Json -Depth 5 -Compress)" }

        $attempt = 0
        do {
            Start-Sleep -Seconds $Settings.pollIntervalSeconds
            $attempt++
            # Cap checked here, before the request: a `continue` below would otherwise skip it
            # and spin forever whenever polling keeps failing.
            if ($attempt -gt $Settings.maxPollAttempts) {
                throw "Video job $($job.id) unfinished after $($Settings.maxPollAttempts * $Settings.pollIntervalSeconds)s (last status: $($status.status))"
            }

            # A dropped poll must not abandon a job that is still rendering and already paid for.
            try {
                $status = Invoke-RestMethod -Uri "$($Settings.baseUrl)/v1/videos/$($job.id)" -Method Get `
                    -Headers @{ "Authorization" = "Bearer $ApiKey" } -TimeoutSec 60
            }
            catch {
                Write-Host "    poll $attempt failed ($(Get-HttpErrorDetail $_)) - will poll again"
                continue
            }

            Write-Host "    [try $try/$maxTries, poll $attempt] $($status.status) $($status.progress)%"
        } while ($status.status -notin @("completed", "succeeded", "failed", "error"))

        if ($status.status -in @("completed", "succeeded")) {
            $tempFile = [System.IO.Path]::GetTempFileName()
            try {
                Invoke-WebRequest -Uri "$($Settings.baseUrl)/v1/videos/$($job.id)/content" `
                    -Headers @{ "Authorization" = "Bearer $ApiKey" } -OutFile $tempFile -TimeoutSec 300
                return [System.IO.File]::ReadAllBytes($tempFile)
            }
            catch { throw "Video download failed: $(Get-HttpErrorDetail $_)" }
            finally { Remove-Item $tempFile -Force -ErrorAction SilentlyContinue }
        }

        $errText = $status.error | ConvertTo-Json -Depth 4 -Compress
        $isModeration = $errText -match 'moderation'
        if ($isModeration -and $try -lt $maxTries) {
            Write-Host "    moderation block on try $try - retrying (it is intermittent)"
            continue
        }
        throw "Video job $($job.id) ended as '$($status.status)' after $try tr$(if ($try -eq 1) { 'y' } else { 'ies' }): $errText"
    }
}

$ImageProviders = @{
    "ikame" = { param($Prompt, $ApiKey, $Settings) Invoke-IkameImage -Prompt $Prompt -ApiKey $ApiKey -Settings $Settings }
}

$VideoProviders = @{
    "ikame" = { param($ImageBytes, $MotionPrompt, $ApiKey, $Settings) Invoke-IkameVideo -ImageBytes $ImageBytes -MotionPrompt $MotionPrompt -ApiKey $ApiKey -Settings $Settings }
}
