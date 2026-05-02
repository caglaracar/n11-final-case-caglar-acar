'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '@/features/auth/api/authApi';
import type { LoginPayload, RegisterPayload } from '@/features/auth/types/auth-types';
import { useAuthStore } from '@/features/auth/store';

/**
 * Login flow: tokens'ı al → store'a yaz → /me ile profili çek → user'ı set et → yönlendir.
 */
export function useLogin(redirectTo = '/') {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const tokens = await loginUser(payload);
      setTokens(tokens); // /me çağrısı bu token'ı kullanacak
      const user = await getCurrentUser();
      setUser(user);
      return user;
    },
    onSuccess: (user) => {
      toast.success(`Hoş geldin, ${user.userName}!`);
      router.push(redirectTo);
    },
  });
}

/**
 * Register flow: kayıt ol → otomatik giriş yap → /me → yönlendir.
 */
export function useRegister(redirectTo = '/') {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      await registerUser(payload);
      const tokens = await loginUser({ userName: payload.userName, password: payload.password });
      setTokens(tokens);
      const user = await getCurrentUser();
      setUser(user);
      return user;
    },
    onSuccess: (user) => {
      toast.success(`Hesabın oluşturuldu — hoş geldin, ${user.userName}!`);
      router.push(redirectTo);
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const tokens = useAuthStore((s) => s.tokens);
  const clear = useAuthStore((s) => s.clear);

  return useMutation({
    mutationFn: async () => {
      if (tokens?.refreshToken) {
        // Backend hatası UX'i bozmamalı: yine de local clear ediyoruz
        await logoutUser(tokens.refreshToken).catch(() => undefined);
      }
    },
    onSettled: () => {
      clear();
      router.push('/');
    },
  });
}
