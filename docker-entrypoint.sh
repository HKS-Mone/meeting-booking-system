#!/bin/sh
set -e

echo "Ensuring application database exists..."
node - <<'EOF'
const { execFileSync } = require('child_process');
const u = new URL(process.env.DATABASE_URL);
const db = u.pathname.slice(1);
execFileSync(
  'mysql',
  ['-h', u.hostname, '-P', u.port || '3306', '-u', u.username,
   '-p' + u.password, '-e', 'CREATE DATABASE IF NOT EXISTS `' + db + '`;'],
  { stdio: 'inherit' }
);
EOF

echo "Running Prisma migrations..."
npx prisma@5 migrate deploy

echo "Running database seed..."
node prisma/seed.js

echo "Starting Next.js server..."
exec "$@"
