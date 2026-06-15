#!/bin/sh
set -e
echo "Running Prisma migrations..."
npx prisma@5 migrate deploy
echo "Starting Next.js server..."
exec "$@"