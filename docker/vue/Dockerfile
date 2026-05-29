# ── dev ───────────────────────────────────────────────────────────────────────
# npm ci pre-installs deps into the image layer; host source is mounted at
# runtime so Nuxt HMR picks up changes without rebuilding.
FROM node:20-alpine AS dev
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ── build ──────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ── runtime (production) ───────────────────────────────────────────────────────
FROM nginx:alpine AS runtime
COPY --from=build /app/.output/public /usr/share/nginx/html
