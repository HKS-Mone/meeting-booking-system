import 'server-only';

import { createHash, createHmac, pbkdf2Sync, timingSafeEqual } from 'node:crypto';
import { AuthRepository } from '@/repository/auth.repository';
import type { User } from '@/lib/types';
import type { AuthResult, LoginCredentials } from '@/services/auth.service';

type UserWithDepartment = Awaited<ReturnType<typeof AuthRepository.validateUser>>;
type JwtPayload = {
  sub?: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
};

const JWT_COOKIE_NAME = 'auth_token_mone';
const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_DIGEST = 'sha256';

function getJwtSecret() {
  return process.env.JWT_SECRET ?? 'development-only-change-me';
}

function base64Url(input: Buffer | string) {
  return Buffer.from(input)
    .toString('base64')
    .replaceAll('=', '')
    .replaceAll('+', '-')
    .replaceAll('/', '_');
}

function decodeBase64Url(input: string) {
  const base64 = input.replaceAll('-', '+').replaceAll('_', '/');
  return Buffer.from(base64, 'base64').toString('utf8');
}

function signJwt(payload: Record<string, unknown>) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRES_IN_SECONDS,
  };

  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedBody = base64Url(JSON.stringify(body));
  const data = `${encodedHeader}.${encodedBody}`;
  const signature = createHmac('sha256', getJwtSecret()).update(data).digest();

  return `${data}.${base64Url(signature)}`;
}

function verifyJwt(token?: string): JwtPayload | null {
  if (!token) {
    return null;
  }

  const [encodedHeader, encodedBody, encodedSignature] = token.split('.');
  if (!encodedHeader || !encodedBody || !encodedSignature) {
    return null;
  }

  const data = `${encodedHeader}.${encodedBody}`;
  const expectedSignature = base64Url(createHmac('sha256', getJwtSecret()).update(data).digest());
  const expected = Buffer.from(expectedSignature);
  const actual = Buffer.from(encodedSignature);

  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedBody)) as JwtPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function verifyPassword(password: string, storedPassword?: string | null) {
  if (!storedPassword) {
    return false;
  }

  if (!storedPassword.includes(':')) {
    return createHash('sha256').update(password).digest('hex') === storedPassword;
  }

  const [scheme, iterations, salt, storedHash] = storedPassword.split(':');
  if (scheme !== 'pbkdf2' || !iterations || !salt || !storedHash) {
    return false;
  }

  const hash = pbkdf2Sync(password, salt, Number(iterations), PASSWORD_KEY_LENGTH, PASSWORD_DIGEST);
  const stored = Buffer.from(storedHash, 'hex');

  return stored.length === hash.length && timingSafeEqual(stored, hash);
}

function toSafeUser(user: NonNullable<UserWithDepartment>): User {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId ? String(user.departmentId) : undefined,
    department: user.department
      ? {
          id: String(user.department.id),
          name: user.department.name,
        }
      : undefined,
    createdAt: user.createdAt.toISOString(),
  };
}

function createToken(user: NonNullable<UserWithDepartment>) {
  return signJwt({
    sub: String(user.id),
    email: user.email,
    role: user.role,
  });
}

export const authCookie = {
  name: JWT_COOKIE_NAME,
  maxAge: JWT_EXPIRES_IN_SECONDS,
};

export const serverAuthService = {
  verifyPassword(password: string, storedPassword?: string | null): boolean {
    return verifyPassword(password, storedPassword);
  },

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const email = credentials.email.trim().toLowerCase();
    const user = await AuthRepository.validateUser(email);

    if (!user || user.isActive === false || !verifyPassword(credentials.password, user.password)) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const token = createToken(user);
    return { success: true, user: toSafeUser(user), token };
  },

  async authenticateToken(token?: string): Promise<AuthResult> {
    const payload = verifyJwt(token);
    const userId = Number(payload?.sub);

    if (!payload || !Number.isInteger(userId)) {
      return { success: false, error: 'Invalid session.' };
    }

    const user = await AuthRepository.findActiveUserById(userId);
    if (!user) {
      return { success: false, error: 'Invalid session.' };
    }

    return { success: true, user: toSafeUser(user) };
  },
};
