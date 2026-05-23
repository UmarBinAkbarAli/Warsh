################################################################################
# start-warsh.ps1  -  One-command dev launcher for the Warsh app
#
# Modes:
#   .\start-warsh.ps1        - local dev  (backend on localhost:3000)
#   .\start-warsh.ps1 -prod  - production (backend = https://warsh-backend.vercel.app)
#
# Local dev does (in order):
#   1. Checks adb is available and a device is connected via USB
#   2. Sets ADB reverse tunnel for Metro (8081) and local backend (3000)
#   3. Starts the Next.js backend in a new terminal window
#   4. Waits for the backend to be healthy (GET /api/health)
#   5. Starts Expo Metro with EXPO_PUBLIC_API_URL=http://127.0.0.1:3000
#
# Production mode does:
#   1. Checks adb is available and a device is connected via USB
#   2. Sets ADB reverse tunnel for Metro (8081) only - no local backend needed
#   3. Starts Expo Metro with EXPO_PUBLIC_API_URL=https://warsh-backend.vercel.app
#
# Database: Neon (cloud Postgres) - no local DB needed in either mode.
#
# Stop: Close the terminal window(s) that open.
################################################################################

param(
    [switch]$prod
)

$ErrorActionPreference = "Stop"
$RepoRoot = $PSScriptRoot

# helpers
function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "    OK  $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "    !! $msg"  -ForegroundColor Yellow }

# mode banner
if ($prod) {
    Write-Host ""
    Write-Host "  MODE: PRODUCTION  (warsh-backend.vercel.app)" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "  MODE: LOCAL DEV   (localhost:3000)" -ForegroundColor Green
}

# 1. ADB check
Write-Step "Checking ADB and USB device"

$adb = "adb"
if (-not (Get-Command adb -ErrorAction SilentlyContinue)) {
    $adbPath = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
    if (Test-Path $adbPath) {
        $adb = $adbPath
    } else {
        Write-Host "ERROR: 'adb' not found. Install Android SDK Platform Tools." -ForegroundColor Red
        exit 1
    }
}

& $adb start-server | Out-Null
$adbDevices = & $adb devices | Select-String "device$"
if (-not $adbDevices) {
    Write-Host "ERROR: No Android device detected via USB. Plug in your phone, enable USB debugging, and try again." -ForegroundColor Red
    exit 1
}

Write-OK "Device connected: $($adbDevices[0].Line.Trim())"

# 2. ADB reverse tunnels
if ($prod) {
    Write-Step "Setting ADB reverse tunnel (Metro:8081 only - backend is remote)"
    & $adb reverse tcp:8081 tcp:8081 | Out-Null
    Write-OK "Tunnel active: phone -> localhost:8081 (Metro)"
} else {
    Write-Step "Setting ADB reverse tunnels (Metro:8081, Backend:3000)"
    & $adb reverse tcp:8081 tcp:8081 | Out-Null
    & $adb reverse tcp:3000 tcp:3000 | Out-Null
    Write-OK "Tunnels active: phone -> localhost:8081 (Metro), phone -> localhost:3000 (Backend)"
}

# 3. Start local backend (dev mode only)
if (-not $prod) {
    Write-Step "Starting Next.js backend (port 3000)"

    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location '$RepoRoot\arabai-backend'; Write-Host 'Warsh Backend' -ForegroundColor Cyan; npm run dev"
    ) -WindowStyle Normal

    Write-OK "Backend window opened"

    Write-Step "Waiting for backend to be ready at http://localhost:3000/api/health"

    $maxWait = 60
    $elapsed = 0
    $ready = $false

    while ($elapsed -lt $maxWait) {
        Start-Sleep -Seconds 2
        $elapsed += 2
        try {
            $resp = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($resp.StatusCode -eq 200) { $ready = $true; break }
        } catch { }
        Write-Host "    Still waiting... ($elapsed s)"
    }

    if ($ready) {
        Write-OK "Backend is up and healthy"
    } else {
        Write-Warn "Backend did not respond in ${maxWait}s - Metro will still start. Check the backend window for errors."
    }
}

# 4. Start Expo Metro
$apiUrl = if ($prod) { "https://warsh-backend.vercel.app" } else { "http://127.0.0.1:3000" }
$envName = if ($prod) { "production" } else { "development" }

Write-Step "Starting Expo Metro (EXPO_PUBLIC_API_URL=$apiUrl)"

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$RepoRoot\arabai-app'; `$env:EXPO_PUBLIC_API_URL='$apiUrl'; `$env:EXPO_PUBLIC_ENVIRONMENT='$envName'; Write-Host 'Warsh Metro  [$envName]' -ForegroundColor Magenta; npx expo start --localhost --clear"
) -WindowStyle Normal

Write-OK "Metro window opened"

# 5. Wait for Metro to be ready, then re-apply ADB tunnel
#    Metro launch can cause the USB device to briefly reconnect, silently
#    dropping the reverse tunnel that was set in step 2. Re-applying it
#    after Metro is up guarantees the phone can reach port 8081.
Write-Step "Waiting for Metro to be ready at http://localhost:8081/status"

$metroMaxWait = 120
$metroElapsed = 0
$metroReady = $false

while ($metroElapsed -lt $metroMaxWait) {
    Start-Sleep -Seconds 3
    $metroElapsed += 3
    try {
        $resp = Invoke-WebRequest -Uri "http://localhost:8081/status" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($resp.StatusCode -eq 200) { $metroReady = $true; break }
    } catch { }
    Write-Host "    Still waiting for Metro... ($metroElapsed s)"
}

if ($metroReady) {
    Write-OK "Metro is up"
} else {
    Write-Warn "Metro did not respond in ${metroMaxWait}s - re-applying tunnel anyway. Check Metro window for errors."
}

# Re-apply the tunnel now that Metro is running (prevents stale/dropped tunnel)
Write-Step "Re-applying ADB reverse tunnel (tcp:8081) after Metro launch"
& $adb reverse tcp:8081 tcp:8081 | Out-Null
if (-not $prod) {
    & $adb reverse tcp:3000 tcp:3000 | Out-Null
}
Write-OK "ADB tunnel refreshed - open/reload the app on your phone"

# Done
$color = if ($prod) { "Yellow" } else { "Green" }
Write-Host ""
Write-Host "================================================================" -ForegroundColor $color
if ($prod) {
    Write-Host "  Warsh app  ->  PRODUCTION BACKEND" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  API      -> https://warsh-backend.vercel.app"
} else {
    Write-Host "  Warsh dev environment is starting!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Backend  -> http://localhost:3000   (backend window)"
}
Write-Host "  Metro    -> http://localhost:8081   (metro window)"
Write-Host ""
Write-Host "  On your phone: open the Expo Go app or the Warsh dev build"
Write-Host "  and scan the QR code in the Metro window."
Write-Host "================================================================" -ForegroundColor $color
