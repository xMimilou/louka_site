# ── Config ─────────────────────────────────────────────────────────────────────
$SERVER  = "louka@192.168.1.26"
$SSH_KEY = "$env:USERPROFILE\.ssh\scale_investor"
$IMAGE   = "louka-site"
$REMOTE  = "/home/louka/louka-site"
$TMPFILE = "$env:TEMP\louka-site.tar"

# ── Charger .env.local ────────────────────────────────────────────────────────
$ENV_FILE = if (Test-Path ".env.local") { ".env.local" } elseif (Test-Path ".env") { ".env" } else { $null }

if (-not $ENV_FILE) {
    Write-Error "Aucun fichier .env.local ou .env trouve."
    exit 1
}

Write-Host "Utilisation de $ENV_FILE" -ForegroundColor Gray

$env_vars = @{}
Get-Content $ENV_FILE | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
        $env_vars[$matches[1].Trim()] = $matches[2].Trim()
    }
}

$SUPABASE_URL  = $env_vars["NEXT_PUBLIC_SUPABASE_URL"]
$SUPABASE_KEY  = $env_vars["NEXT_PUBLIC_SUPABASE_ANON_KEY"]

if (-not $SUPABASE_URL) { $SUPABASE_URL = "" }
if (-not $SUPABASE_KEY) { $SUPABASE_KEY = "" }

# ── Build ──────────────────────────────────────────────────────────────────────
Write-Host "`n[1/5] Build de l'image Docker..." -ForegroundColor Cyan
docker build `
    --build-arg "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" `
    --build-arg "NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY" `
    -t "${IMAGE}:latest" .

if ($LASTEXITCODE -ne 0) { Write-Error "Build echoue"; exit 1 }

# ── Export ─────────────────────────────────────────────────────────────────────
Write-Host "`n[2/5] Export de l'image ($TMPFILE)..." -ForegroundColor Cyan
docker save -o $TMPFILE "${IMAGE}:latest"

if ($LASTEXITCODE -ne 0) { Write-Error "Export echoue"; exit 1 }

# ── Transfert ──────────────────────────────────────────────────────────────────
Write-Host "`n[3/5] Transfert vers $SERVER..." -ForegroundColor Cyan
ssh -i $SSH_KEY $SERVER "mkdir -p $REMOTE"
scp -i $SSH_KEY $TMPFILE "${SERVER}:/tmp/louka-site.tar"
scp -i $SSH_KEY "docker-compose.yml" "${SERVER}:${REMOTE}/docker-compose.yml"

if ($LASTEXITCODE -ne 0) { Write-Error "Transfert echoue"; exit 1 }

# ── Déploiement ────────────────────────────────────────────────────────────────
Write-Host "`n[4/5] Deploiement sur le serveur..." -ForegroundColor Cyan
ssh -i $SSH_KEY $SERVER @"
set -e
mkdir -p $REMOTE
echo 'Chargement image...'
docker load -i /tmp/louka-site.tar
rm /tmp/louka-site.tar
echo 'Redemarrage conteneur...'
cd $REMOTE
docker compose down --remove-orphans
docker compose up -d
docker image prune -f
"@

if ($LASTEXITCODE -ne 0) { Write-Error "Deploiement echoue"; exit 1 }

# ── Nettoyage local ────────────────────────────────────────────────────────────
Write-Host "`n[5/5] Nettoyage local..." -ForegroundColor Cyan
Remove-Item $TMPFILE -Force

Write-Host "`nDeploye sur http://192.168.1.26:3000" -ForegroundColor Green
