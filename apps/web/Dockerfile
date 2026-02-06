FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.17.0 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile --filter web...

FROM base AS build
WORKDIR /app
ARG NUXT_PUBLIC_API_BASE_URL
ARG NUXT_PUBLIC_FIREBASE_CONFIG
ENV NUXT_PUBLIC_API_BASE_URL=${NUXT_PUBLIC_API_BASE_URL}
ENV NUXT_PUBLIC_FIREBASE_CONFIG=${NUXT_PUBLIC_FIREBASE_CONFIG}
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web ./apps/web
WORKDIR /app/apps/web
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/web/.output ./
EXPOSE 3000
CMD ["node", "server/index.mjs"]
