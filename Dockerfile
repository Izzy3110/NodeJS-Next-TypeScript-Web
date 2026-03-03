# Base image
FROM node:24.13-bookworm AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package info and lockfile
COPY package.json package-lock.json ./
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci --verbose

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables must be present at build time
# https://nextjs.org/docs/api-reference/next.config.js/environment-variables
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Install mariadb-client for the bash init script
RUN apt-get update && apt-get install -y mariadb-client && rm -rf /var/lib/apt/lists/*


RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets
COPY --from=builder /app/public ./public

# Copy start script & dbdata
COPY --from=builder --chown=nextjs:nodejs /app/scripts/init_db.sh ./scripts/init_db.sh
RUN chmod +x ./scripts/init_db.sh
COPY --from=builder --chown=nextjs:nodejs /app/dbdata ./dbdata

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

CMD ["sh", "-c", "./scripts/init_db.sh && node server.js"]
