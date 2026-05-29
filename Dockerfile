# Se alterar package.json ou package-lock.json, rode: docker compose up --build

FROM node:24-slim AS base

# ─── Pruners ────────────────────────────────────────────────────────────────

FROM base AS pruner-api
RUN npm install -g turbo
WORKDIR /app
COPY . .
RUN turbo prune api --docker

FROM base AS pruner-web
RUN npm install -g turbo
WORKDIR /app
COPY . .
RUN turbo prune web --docker

# ─── API ────────────────────────────────────────────────────────────────────

FROM base AS api-installer
WORKDIR /app
COPY --from=pruner-api /app/out/json/ .
COPY --from=pruner-api /app/out/package-lock.json ./package-lock.json
RUN npm ci

FROM api-installer AS api-dev
COPY --from=pruner-api /app/out/full/ .
WORKDIR /app/apps/api
CMD ["sh", "-c", "npm run db:seed && npm run start:dev"]

FROM api-installer AS api-builder
COPY --from=pruner-api /app/out/full/ .
WORKDIR /app/apps/api
RUN npm run build -w api

FROM base AS api-prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=pruner-api /app/out/json/ .
COPY --from=pruner-api /app/out/package-lock.json ./package-lock.json
RUN npm ci --omit=dev
COPY --from=api-builder /app/apps/api/dist ./apps/api/dist
WORKDIR /app/apps/api
CMD ["sh", "-c", "npm run migration:run:prod && node dist/database/seed-colors && node dist/main"]

# ─── Web ────────────────────────────────────────────────────────────────────

FROM base AS web-installer
WORKDIR /app
COPY --from=pruner-web /app/out/json/ .
COPY --from=pruner-web /app/out/package-lock.json ./package-lock.json
RUN npm ci

FROM web-installer AS web-dev
COPY --from=pruner-web /app/out/full/ .
WORKDIR /app/apps/web
CMD ["npm", "run", "dev", "--", "--host"]

FROM web-installer AS web-builder
COPY --from=pruner-web /app/out/full/ .
RUN npm run build -w web

FROM nginx:alpine AS web-prod
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=web-builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
