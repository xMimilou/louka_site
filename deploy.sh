#!/bin/bash
set -e

# ── Config ─────────────────────────────────────────────────────────────────────
SERVER="louka@192.168.1.26"
IMAGE="louka-site"
REMOTE_DIR="/home/louka/louka-site"

# ── Charger les variables d'env ────────────────────────────────────────────────
if [ ! -f .env.production ]; then
  echo "❌  Fichier .env.production manquant. Copie .env.example et remplis les valeurs."
  exit 1
fi

source .env.production

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "❌  NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requis dans .env.production"
  exit 1
fi

echo "🔨  Build de l'image Docker..."
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -t "$IMAGE:latest" .

echo "📦  Export de l'image..."
docker save "$IMAGE:latest" | gzip > /tmp/louka-site.tar.gz

echo "🚀  Transfert vers le serveur $SERVER..."
scp /tmp/louka-site.tar.gz "$SERVER:/tmp/louka-site.tar.gz"
scp docker-compose.yml "$SERVER:$REMOTE_DIR/docker-compose.yml"

echo "⚙️   Déploiement sur le serveur..."
ssh "$SERVER" bash << EOF
  set -e
  mkdir -p $REMOTE_DIR

  echo "Chargement de l'image..."
  docker load < /tmp/louka-site.tar.gz
  rm /tmp/louka-site.tar.gz

  echo "Redémarrage du conteneur..."
  cd $REMOTE_DIR
  docker compose down --remove-orphans
  docker compose up -d

  echo "Nettoyage des anciennes images..."
  docker image prune -f
EOF

rm /tmp/louka-site.tar.gz

echo "✅  Déployé sur http://192.168.1.26:3000"
