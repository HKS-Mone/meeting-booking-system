# ============================================================
# Stage 1: Install dependencies
# ============================================================
FROM node:20-alpine AS deps

# Required for Prisma + some native packages (openssl, libc-compat)
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy only package files first so Docker caches this layer
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDeps needed for build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# ============================================================
# Stage 2: Build the application
# ============================================================
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# Bring in installed node_modules and generated Prisma client
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Copy the rest of the source code
COPY . .

# Build environment — DATABASE_URL is required at build time
# for Prisma client types (actual value is overridden at runtime)
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Build Next.js (output: 'standalone' is set in next.config.ts)
RUN npm run build

# ============================================================
# Stage 3: Production runtime image
# ============================================================
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

# Copy the standalone bundle (minimal — no node_modules needed)
COPY --from=builder /app/.next/standalone ./
# Static assets: Next.js standalone server serves these when present
COPY --from=builder /app/.next/static ./.next/static
# Public folder
COPY --from=builder /app/public ./public

# Copy Prisma schema + migration files (needed for `prisma migrate deploy`)
COPY --from=builder /app/prisma ./prisma
# Copy Prisma client (generated in stage 1)
COPY --from=deps    /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps    /app/node_modules/@prisma ./node_modules/@prisma

# Copy entrypoint script
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
