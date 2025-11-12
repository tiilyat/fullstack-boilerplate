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
# Prune to only api workspace dependencies
RUN turbo prune @fullstack-boilerplate/api --docker

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

# Build the API
RUN pnpm turbo build --filter=@fullstack-boilerplate/api

# Runner stage - minimal production image
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

# Copy built application from builder
COPY --from=builder /app .

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE 8000

# Health check (Hono server has /health endpoint)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "apps/api/dist/index.js"]
