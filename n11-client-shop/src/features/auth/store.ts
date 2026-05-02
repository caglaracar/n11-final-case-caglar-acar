'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  authId: number;
  userName: string;
  email: string;
  role: 'USER' | 'SELLER' | 'ADMIN' | string;
  name?: string;
  surName?: string;
  phone?: string;
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthState {
  tokens: AuthTokens | null;
  user: AuthUser | null;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: AuthUser) => void;
  setSession: (s: { tokens: AuthTokens; user: AuthUser }) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      tokens: null,
      user: null,
      setTokens: (tokens) => set({ tokens }),
      setUser: (user) => set({ user }),
      setSession: ({ tokens, user }) => set({ tokens, user }),
      clear: () => set({ tokens: null, user: null }),
    }),
    {
      name: 'sepetify-shop-auth',
      partialize: (s) => ({ tokens: s.tokens, user: s.user }),
    },
  ),
);

export const getAccessToken = () =>
  typeof window === 'undefined' ? null : useAuthStore.getState().tokens?.accessToken ?? null;
export const getRefreshToken = () =>
  typeof window === 'undefined' ? null : useAuthStore.getState().tokens?.refreshToken ?? null;
