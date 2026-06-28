"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { authService, type LoginCredentials } from "@/services/auth.service";

interface UseAuthOptions {
  checkSessionOnMount?: boolean;
}

export function useAuth({ checkSessionOnMount = true }: UseAuthOptions = {}) {
  const { currentUser, setCurrentUser, logout: clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(checkSessionOnMount);
  const [error, setError] = useState<string | null>(null);
  const sessionRequestId = useRef(0);

  const refreshSession = useCallback(async () => {
    const requestId = sessionRequestId.current + 1;
    sessionRequestId.current = requestId;
    setIsCheckingSession(true);
    setError(null);

    try {
      const result = await authService.getSession();

      if (requestId !== sessionRequestId.current) {
        return result;
      }

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
      if (requestId !== sessionRequestId.current) {
        return { success: false, error: message };
      }
      clearAuth();
      setError(message);
      return { success: false, error: message };
    } finally {
      if (requestId === sessionRequestId.current) {
        setIsCheckingSession(false);
      }
    }
  }, [clearAuth, setCurrentUser]);

  useEffect(() => {
    if (!checkSessionOnMount) {
      return;
    }

    void Promise.resolve().then(refreshSession);
  }, [checkSessionOnMount, refreshSession]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      sessionRequestId.current += 1;
      setIsLoading(true);
      setIsCheckingSession(false);
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
    sessionRequestId.current += 1;
    setIsLoading(true);
    setIsCheckingSession(false);
    setError(null);

    try {
      const result = await authService.logout();
      clearAuth();
      return result;
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unable to sign out.";
      setError(message);
      return { success: false, error: message };
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
