'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from './types';
import { users } from './mock-data';

interface AuthState {
  currentUser: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const MOCK_PASSWORDS: Record<string, string> = {
  'admin@meetinghub.com': 'admin123',
  'dilshan@meetinghub.com': 'user123',
  'nimal@meetinghub.com': 'user123',
  'kavinda@meetinghub.com': 'user123',
  'samuel@meetinghub.com': 'user123',
  'dulihan@meetinghub.com': 'user123',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isLoggedIn: false,

      login: (email: string, password: string) => {
        const expectedPwd = MOCK_PASSWORDS[email];
        if (!expectedPwd) {
          return { success: false, error: 'No account found with this email.' };
        }
        if (expectedPwd !== password) {
          return { success: false, error: 'Invalid email or password.' };
        }
        const user = users.find((u) => u.email === email);
        if (!user) return { success: false, error: 'User not found.' };
        set({ currentUser: user, isLoggedIn: true });
        return { success: true };
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
