'use server';

import { cookies } from 'next/headers';
import { authCookie, serverAuthService } from '@/services/auth-server.service';
import type { LoginCredentials } from '@/services/auth.service';

export async function getSessionAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookie.name)?.value;
  const result = await serverAuthService.authenticateToken(token);

  if (!result.success) {
    return { success: false, error: result.error ?? 'Invalid session.' };
  }

  return { success: true, user: result.user };
}

export async function loginAction(credentials: LoginCredentials) {
  const result = await serverAuthService.login(credentials);

  if (!result.success || !result.token) {
    return { success: false, error: result.error ?? 'Invalid email or password.' };
  }

  const isSecureContext =
    process.env.NEXTAUTH_URL?.startsWith('https://') ??
    process.env.NODE_ENV === 'production';

  const cookieStore = await cookies();
  cookieStore.set(authCookie.name, result.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureContext,
    maxAge: authCookie.maxAge,
    path: '/',
  });

  return { success: true, user: result.user };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(authCookie.name);

  return { success: true };
}
