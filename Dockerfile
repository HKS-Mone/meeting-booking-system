# ============================================================
# Stage 1: Install dependencies
# ============================================================
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci

RUN npx prisma generate

# ============================================================
# Stage 2: Build the application
# ============================================================
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

COPY . .

ARG DATABASE_URL=mysql://placeholder:placeholder@localhost:3306/placeholder
ENV DATABASE_URL=${DATABASE_URL}

RUN npm run build

# Compile seed.ts → seed.js for use at runtime
RUN node_modules/.bin/tsc prisma/seed.ts \
    --outDir prisma \
    --esModuleInterop \
    --module commonjs \
    --target es2017 \
    --moduleResolution node \
    --skipLibCheck

# ============================================================
# Stage 3: Production runtime image
# ============================================================
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copies prisma/ including the compiled seed.js
COPY --from=builder /app/prisma ./prisma

COPY --from=deps    /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps    /app/node_modules/@prisma ./node_modules/@prisma

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]