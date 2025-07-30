# Small Wonders 🌟

> A journaling platform that visualizes your daily reflections as a 3D star-field constellation.

[![MIT License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/your-username/small-wonders)](https://github.com/your-username/small-wonders)

---

## Live Demo  
[View deployed version](https://small-wonders-838262699382.us-central1.run.app)

---

## Features

- 3D star constellation of your reflections
- Lightweight journaling interface
- Filter and tag entries by emoji-based categories
- Personalized stats and reflection insights
- Deployable as a containerized app on Cloud Run

---

## Repo Structure
<pre> \`\`\` root/ |___ frontend/ # React 18 + Vite + TailwindCSS (client UI) |___ backend/ # Express + TypeScript + Firebase Admin SDK (REST API) |___ Dockerfile # Multi-stage Docker build (frontend → backend → runtime) \`\`\` </pre>

---

## Prerequisites

- Node 18 (LTS) — `nvm use 18`
- npm 9 or later (to use `npm ci`)
- Firebase project with:
  - A **Web App** (for client-side SDK keys)
  - A **Service Account key** (JSON, for Admin SDK)
- Firestore in **Native** mode
- *(Optional)* Docker and Google Cloud CLI (for Cloud Run deployment)

---

## Environment Variables

Create these two local files (not tracked by git):

```
frontend/.env        # used by Vite
VITE_FIREBASE_API_KEY="…"
VITE_FIREBASE_AUTH_DOMAIN="…"
VITE_FIREBASE_PROJECT_ID="…"

backend/.env         # loaded by dotenv
FIREBASE_SERVICE_ACCOUNT_KEY="{…one-line JSON…}"
```

---

## Local development
```bash
# 1. install deps (exact versions)
npm ci --workspaces --include-workspace-root

# 2. start backend (port 3001)
cd backend && npm run dev

# 3. start frontend (port 5173)
cd ../frontend && npm run dev
```

The Vite dev server proxies `/api` requests to `localhost:3001`.

---

## Docker – build & run locally

```bash
# build multi-arch image (amd64)
docker buildx build --platform linux/amd64 -t small-wonders:dev .

# run with env vars / secrets mounted
docker run -p 3001:3001 \
  -e FIREBASE_SERVICE_ACCOUNT_KEY="$(cat backend/.env | grep FIREBASE | cut -d '=' -f2-)" \
  small-wonders:dev
```

The container serves the API at `/api/*` and the built React app at `/`.

---

## Cloud Run deployment

A helper script `deploy.sh` automates *build → push → deploy*.

```bash
chmod +x deploy.sh      # one-time
./deploy.sh             # builds, pushes, deploys latest commit
```

Edit the variables at the top of the script (`PROJECT_ID`, `REGION`, etc.) to match your GCP environment. The script:
1. Builds a linux/amd64 image using Docker Buildx.
2. Pushes it to Artifact Registry.
3. Deploys to Cloud Run with `NODE_ENV=production` and the `FIREBASE_SERVICE_ACCOUNT_KEY` secret attached.

---

## Scripts cheat-sheet

| Command | Location | Purpose |
|---------|----------|---------|
| `npm run dev` | `backend/` | nodemon + ts-node live-reload API |
| `npm run dev` | `frontend/` | Vite dev server + HMR |
| `npm run build` | `frontend/` | Production React build (to `dist/`) |
| `docker buildx …` | root | Build multi-stage Docker image |
| `./deploy.sh` | root | Rebuild and redeploy to Cloud Run |

---

## License
MIT 
