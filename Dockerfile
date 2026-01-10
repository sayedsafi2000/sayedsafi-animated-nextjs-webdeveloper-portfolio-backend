# Multi-stage build for Express Backend
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy package files
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy dependencies and application code
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs backend/ .

# Create uploads directory if it doesn't exist
RUN mkdir -p uploads && chown -R nodejs:nodejs uploads

USER nodejs

# Expose port (Coolify will set the PORT env var via environment)
EXPOSE 5000

ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "server.js"]
