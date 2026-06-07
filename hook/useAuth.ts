"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { authService, type LoginCredentials } from "@/services/auth.service";

export function useAuth() {
  const { currentUser, setCurrentUser, logout: clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    setIsCheckingSession(true);
    setError(null);

    try {
      const result = await authService.getSession();

      if (result.success && result.user) {
        setCurrentUser(result.user);
        return result;
      }

      clearAuth();
      return result;
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to verify session.";
      clearAuth();
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsCheckingSession(false);
    }
  }, [clearAuth, setCurrentUser]);

  useEffect(() => {
    void Promise.resolve().then(refreshSession);
  }, [refreshSession]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await authService.login(credentials);

        if (!result.success) {
          setError(result.error ?? "Unable to sign in.");
          return result;
        }

        if (result.user) {
          setCurrentUser(result.user);
        }

        return result;
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to sign in.";
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [setCurrentUser],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.logout();
      clearAuth();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to sign out.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [clearAuth]);

  return {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    isLoading,
    isCheckingSession,
    error,
    login,
    logout,
    refreshSession,
  };
}
