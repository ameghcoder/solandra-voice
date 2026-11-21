FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@12.18.0 --activate
WORKDIR /app

FROM base AS build
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/server/package.json apps/server/
COPY apps/frontend/package.json apps/frontend/
RUN pnpm install --frozen-lockfile
COPY apps/server apps/server
COPY apps/frontend apps/frontend
RUN pnpm build

FROM base AS prod-deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/server/package.json apps/server/
COPY apps/frontend/package.json apps/frontend/
RUN pnpm install --prod --frozen-lockfile --filter server

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=prod-deps /app/apps/server/package.json ./apps/server/package.json
COPY --from=build /app/apps/server/dist ./apps/server/dist
COPY --from=build /app/apps/frontend/dist ./apps/frontend/dist
EXPOSE 8080
CMD ["node", "apps/server/dist/index.js"]
