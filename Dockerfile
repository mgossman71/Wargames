# syntax=docker/dockerfile:1

# ============================================================================
# WarGames / WOPR — production image
# Stage 1: build the Vite + React + TypeScript app into a static `dist/`
# Stage 2: serve it with a small nginx container on port 8080
# ============================================================================

# ---- 1) BUILD -------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first for better layer caching.
# `npm ci` uses package-lock.json and installs devDependencies too
# (vite / typescript / plugin-react are needed to build).
COPY package.json package-lock.json ./
RUN npm ci

# Copy the source and produce the static bundle.
COPY . .
RUN npm run build

# ---- 2) RUN ---------------------------------------------------------------
FROM nginx:alpine AS runtime

# Serve on 8080 with SPA fallback + asset caching.
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# nginx (alpine) ships with `wget` for healthchecks.
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]