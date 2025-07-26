# -------- Stage 1 : build the React frontend ----------------------------
FROM node:18-alpine AS frontend-builder

# Set working dir inside the image for the frontend code
WORKDIR /app/frontend

# Copy only the package manifests first for better layer caching
COPY frontend/package*.json ./

# Install exact deps defined in package-lock.json
RUN npm ci --quiet

# Copy the rest of the frontend source code
COPY frontend .

# Build the production-ready static assets (output: frontend/dist)
RUN npm run build


# -------- Stage 2 : build the Node/Express backend ----------------------
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./
COPY backend/tsconfig.json ./

RUN npm ci --quiet

# Copy backend source and compile TypeScript → dist/
COPY backend .
RUN npm run build


# -------- Stage 3 : create the final lean runtime image -----------------
FROM node:18-slim AS production

ENV NODE_ENV=production

WORKDIR /app

# 1) backend runtime files
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package*.json ./backend/

# 2) frontend static assets (served by Express from /public)
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Install backend prod dependencies only (omit devDeps)
WORKDIR /app/backend
RUN npm install --omit=dev --quiet && npm cache clean --force

# Expose the API port
EXPOSE 3001

# Default command: start the backend (which also serves the built frontend)
CMD ["node", "dist/index.js"] 