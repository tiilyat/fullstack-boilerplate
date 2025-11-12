# Base stage - define Node version
ARG NODE_VERSION=24.13.0
FROM node:${NODE_VERSION}-alpine AS base

# Prepare stage - prune dependencies with Turbo
FROM base AS prepare
WORKDIR /app
# Install pnpm and turbo globally
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN npm install -g turbo
# Copy repository files
COPY . .
# Prune to only web workspace dependencies
RUN turbo prune @fullstack-boilerplate/web --docker

# Builder stage - install dependencies and build
FROM base AS builder
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy pruned lockfile and package.jsons
COPY --from=prepare /app/out/json/ .

# Install dependencies (use --frozen-lockfile for production)
RUN pnpm install --frozen-lockfile

# Copy full source with turbo.json
COPY --from=prepare /app/out/full/ .

# Build the web app
RUN pnpm turbo build --filter=@fullstack-boilerplate/web

# Production stage - serve with nginx
FROM nginx:alpine AS production

# Copy nginx configuration
COPY apps/web/nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder to nginx directory
COPY --from=builder /app/apps/web/dist /app

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx (nginx:alpine runs as non-root by default)
CMD ["nginx", "-g", "daemon off;"]
