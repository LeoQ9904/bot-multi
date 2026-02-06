FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Use corepack to install/activate pnpm (more reliable inside official node images)
RUN corepack enable && corepack prepare pnpm@10.17.0 --activate

# BUILD STAGE
FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter web build

# RUN STAGE
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=build /usr/src/app/apps/web/.output ./
EXPOSE 3000
CMD ["node", "server/index.mjs"]
