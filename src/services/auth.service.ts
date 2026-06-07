import type { User } from '@/lib/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

async function postAuth<TBody>(url: string, body: TBody): Promise<AuthResult> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as AuthResult;
  if (!response.ok) {
    return { success: false, error: data.error ?? 'Authentication failed.' };
  }

  return data;
}

export const authService = {
  login(credentials: LoginCredentials) {
    return postAuth('/api/auth/login', credentials);
  },

  async logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
  },
};
