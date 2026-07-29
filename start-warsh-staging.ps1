param(
    [switch]$RefreshContent,
    [switch]$PrepareOnly
)

$ErrorActionPreference = 'Stop'
$RepoRoot = $PSScriptRoot
$BackendRoot = Join-Path $RepoRoot 'warsh-backend'
$ContainerName = 'warsh-staging-postgres'
$VolumeName = 'warsh-staging-pgdata'
$DatabaseUrl = 'postgresql://postgres@127.0.0.1:55432/warsh_staging'

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw 'Docker is required for isolated local staging.'
}

docker info *> $null
if ($LASTEXITCODE -ne 0) {
    throw 'Docker Desktop is not running. Start it, then run this command again.'
}

$existingContainer = docker container inspect $ContainerName 2>$null
if ($LASTEXITCODE -ne 0) {
    docker volume create $VolumeName | Out-Null
    docker run -d `
        --name $ContainerName `
        --publish '127.0.0.1:55432:5432' `
        --env 'POSTGRES_DB=warsh_staging' `
        --env 'POSTGRES_HOST_AUTH_METHOD=trust' `
        --volume "${VolumeName}:/var/lib/postgresql/data" `
        postgres:17-alpine | Out-Null
} else {
    $publishedPort = docker port $ContainerName '5432/tcp'
    if ($publishedPort -ne '127.0.0.1:55432') {
        throw "$ContainerName must bind only to 127.0.0.1:55432; found $publishedPort."
    }

    $running = docker inspect --format '{{.State.Running}}' $ContainerName
    if ($running -ne 'true') {
        docker start $ContainerName | Out-Null
    }
}

$ready = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    docker exec $ContainerName pg_isready -U postgres -d warsh_staging *> $null
    if ($LASTEXITCODE -eq 0) {
        $ready = $true
        break
    }
    Start-Sleep -Seconds 1
}
if (-not $ready) {
    throw 'The isolated staging database did not become ready.'
}

# These overrides are deliberately set before any Prisma or launcher command.
# They prevent a local .env value from selecting the production database.
$env:DATABASE_URL = $DatabaseUrl
$env:DIRECT_DATABASE_URL = $DatabaseUrl
$env:DEV_UNLOCK_ALL = 'true'
$env:NODE_ENV = 'development'

Push-Location $BackendRoot
try {
    npx prisma migrate deploy
    if ($LASTEXITCODE -ne 0) {
        throw 'Staging migration failed.'
    }

    if ($RefreshContent) {
        node prisma/seed.cjs
        if ($LASTEXITCODE -ne 0) {
            throw 'Staging content refresh failed.'
        }
    }
} finally {
    Pop-Location
}

Write-Host 'Local staging is isolated at 127.0.0.1:55432.' -ForegroundColor Green
Write-Host 'Production has not been changed.' -ForegroundColor Green

if (-not $PrepareOnly) {
    & (Join-Path $RepoRoot 'start-warsh.ps1') -dev
}
