import { createHash } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Hashes a plaintext password using the EXACT same scheme as
 * hashPassword() in src/services/user.service.ts: a plain SHA-256 hex digest.
 *
 * This is the "no-colon" format that verifyPassword() in
 * src/services/auth-server.service.ts accepts. Do NOT swap this for
 * bcrypt/argon2 — those formats always fail auth in this system.
 *
 * Time complexity: O(n) in the length of the password.
 */
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

/**
 * Resets a single user's password to a known value and reactivates the account.
 *
 * Usage:
 *   node scripts/reset-admin-password.js <email> <newPassword>
 * or via env vars RESET_EMAIL / RESET_PASSWORD.
 *
 * Time complexity: O(1) database work (single unique-key update).
 */
async function main() {
  const email = (process.argv[2] ?? process.env.RESET_EMAIL ?? '').trim().toLowerCase();
  const newPassword = process.argv[3] ?? process.env.RESET_PASSWORD ?? '';

  if (!email || !newPassword) {
    console.error(
      'Usage: node scripts/reset-admin-password.js <email> <newPassword>\n' +
        '   or: RESET_EMAIL=<email> RESET_PASSWORD=<pw> node scripts/reset-admin-password.js',
    );
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    console.error(`❌ No user found with email "${email}". Nothing was changed.`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: {
      password: hashPassword(newPassword),
      isActive: true,
    },
  });

  console.log(`✅ Password reset for ${email} (isActive set to true).`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
