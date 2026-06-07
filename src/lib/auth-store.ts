'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from './types';

interface AuthState {
  currentUser: User | null;
  isLoggedIn: boolean;
  setCurrentUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isLoggedIn: false,

      setCurrentUser: (user: User) => {
        set({ currentUser: user, isLoggedIn: true });
      },

      logout: () => {
        set({ currentUser: null, isLoggedIn: false });
      },
    }),
    {
      name: 'mone-meeting-auth',
    }
  )
);
