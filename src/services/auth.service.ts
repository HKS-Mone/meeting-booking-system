import type { User } from '@/lib/types';
import { getSessionAction, loginAction, logoutAction } from '@/app/(auth)/login/actions';

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

export const authService = {
  async getSession() {
    return getSessionAction();
  },

  login(credentials: LoginCredentials) {
    return loginAction(credentials);
  },

  async logout() {
    return logoutAction();
  },
};
