'use client';

import { useCallback, useState } from 'react';
import type { User } from '@/lib/types';
import { authService, type LoginCredentials } from '@/services/auth.service';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.login(credentials);

      if (!result.success) {
        setError(result.error ?? 'Unable to sign in.');
        return result;
      }

      setCurrentUser(result.user ?? null);
      return result;
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Unable to sign in.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.logout();
      setCurrentUser(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to sign out.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    isLoading,
    error,
    login,
    logout,
  };
}
