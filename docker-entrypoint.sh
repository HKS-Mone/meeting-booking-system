#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma@5 migrate deploy

echo "Running database seed..."
node prisma/seed.js

echo "Starting Next.js server..."
exec "$@"