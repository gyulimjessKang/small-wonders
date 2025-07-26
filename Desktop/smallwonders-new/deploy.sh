#!/usr/bin/env bash
# Deploys the latest code to Cloud Run.
# Usage: ./deploy.sh
# Need to be logged in with `gcloud auth login` and make sure Docker is running.

set -euo pipefail

# -------- configurable variables --------
PROJECT_ID="small-wonders-app"
REGION="us-central1"
REPO="smallwonders"          # Artifact Registry repo
SERVICE="small-wonders"      # Cloud Run service name

# -------- derived values --------
GIT_SHA=$(git rev-parse --short HEAD)
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/$SERVICE:$GIT_SHA"

echo "📦 Building Docker image $IMAGE (linux/amd64) …"
docker buildx build \
  --platform linux/amd64 \
  -t "$IMAGE" \
  --push .

echo "Deploying $IMAGE to Cloud Run service $SERVICE …"
gcloud run deploy "$SERVICE" \
  --image="$IMAGE" \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars=NODE_ENV=production \
  --set-secrets=FIREBASE_SERVICE_ACCOUNT_KEY=FIREBASE_SERVICE_ACCOUNT_KEY:latest \
  # --service-account="$SERVICE_ACCOUNT"   # uncomment if using custom SA

echo "Deployment triggered. Check Cloud Run console for status." 