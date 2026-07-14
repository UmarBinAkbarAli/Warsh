[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$ApkPath,

    [string]$AvdName = 'Warsh_API_34',

    [string]$PackageName = 'com.warsh.app',

    [switch]$ResetAppData
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Resolve-AndroidSdk {
    $candidates = @(
        $env:ANDROID_SDK_ROOT,
        $env:ANDROID_HOME,
        (Join-Path $env:LOCALAPPDATA 'Android\Sdk')
    ) | Where-Object { $_ }

    foreach ($candidate in $candidates) {
        if (Test-Path -LiteralPath (Join-Path $candidate 'platform-tools\adb.exe')) {
            return $candidate
        }
    }

    throw 'Android SDK not found. Set ANDROID_SDK_ROOT or install the Android SDK.'
}

function Get-OnlineEmulatorSerial {
    param([Parameter(Mandatory = $true)][string]$AdbPath)

    $deviceLines = & $AdbPath devices
    foreach ($line in $deviceLines) {
        if ($line -match '^(emulator-\d+)\s+device$') {
            return $Matches[1]
        }
    }

    return $null
}

if ($ApkPath) {
    $resolvedApk = (Resolve-Path -LiteralPath $ApkPath).Path
} else {
    $releaseDirectory = Join-Path $PSScriptRoot 'warsh-app\android\app\build\outputs\apk\release'
    $latestApk = if (Test-Path -LiteralPath $releaseDirectory) {
        Get-ChildItem -LiteralPath $releaseDirectory -Filter '*.apk' -File |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 1
    }

    $searchDirectories = @(
        (Join-Path $PSScriptRoot 'warsh-app\.eas-builds'),
        (Join-Path $PSScriptRoot 'warsh-app\builds'),
        (Join-Path $env:USERPROFILE 'Downloads')
    )
    if (-not $latestApk) {
        $latestApk = $searchDirectories |
            Where-Object { Test-Path -LiteralPath $_ } |
            ForEach-Object { Get-ChildItem -LiteralPath $_ -Filter '*.apk' -File -Recurse } |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 1
    }

    if (-not $latestApk) {
        throw 'No APK path was supplied and no release APK was found in the Android build output, EAS build folders, or Downloads.'
    }

    $resolvedApk = $latestApk.FullName
    Write-Host "Using latest APK: $resolvedApk"
}

if ([System.IO.Path]::GetExtension($resolvedApk) -ne '.apk') {
    throw "Expected an .apk file, received: $resolvedApk"
}

$sdk = Resolve-AndroidSdk
$adb = Join-Path $sdk 'platform-tools\adb.exe'
$emulator = Join-Path $sdk 'emulator\emulator.exe'

if (-not (Test-Path -LiteralPath $emulator)) {
    throw "Android Emulator not found at $emulator"
}

& $adb start-server | Out-Null
$serial = Get-OnlineEmulatorSerial -AdbPath $adb

if (-not $serial) {
    $knownAvds = @(& $emulator -list-avds)
    if ($knownAvds -notcontains $AvdName) {
        throw "Android virtual device '$AvdName' does not exist. Available AVDs: $($knownAvds -join ', ')"
    }

    Write-Host "Starting Android emulator '$AvdName'..."
    Start-Process -FilePath $emulator -ArgumentList @('-avd', $AvdName, '-no-boot-anim') | Out-Null

}

$deadline = (Get-Date).AddMinutes(3)
$bootCompleted = ''
do {
    if (-not $serial) {
        Start-Sleep -Seconds 2
        $serial = Get-OnlineEmulatorSerial -AdbPath $adb
    }
    if ($serial) {
        $bootCompleted = (& $adb -s $serial shell getprop sys.boot_completed 2>$null | Out-String).Trim()
    }
    if ($bootCompleted -ne '1') {
        Start-Sleep -Seconds 2
    }
} while ((-not $serial -or $bootCompleted -ne '1') -and (Get-Date) -lt $deadline)

if (-not $serial -or $bootCompleted -ne '1') {
    throw "Emulator '$AvdName' did not finish booting within 3 minutes."
}

Write-Host "Installing $resolvedApk on $serial..."
& $adb -s $serial install -r -d $resolvedApk
if ($LASTEXITCODE -ne 0) {
    throw "APK installation failed with exit code $LASTEXITCODE."
}

if ($ResetAppData) {
    Write-Host "Clearing existing app data for $PackageName..."
    & $adb -s $serial shell pm clear $PackageName
    if ($LASTEXITCODE -ne 0) {
        throw "Could not clear app data for $PackageName."
    }
}

Write-Host "Launching $PackageName..."
& $adb -s $serial shell monkey -p $PackageName -c android.intent.category.LAUNCHER 1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw "APK installed, but $PackageName could not be launched."
}

$packageInfo = & $adb -s $serial shell dumpsys package $PackageName
$versionName = ($packageInfo | Select-String -Pattern 'versionName=' | Select-Object -First 1).Line.Trim()
$versionCode = ($packageInfo | Select-String -Pattern 'versionCode=' | Select-Object -First 1).Line.Trim()

Write-Host "Warsh is installed and running on $serial."
Write-Host $versionName
Write-Host $versionCode
