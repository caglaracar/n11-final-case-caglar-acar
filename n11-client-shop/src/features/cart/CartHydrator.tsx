'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { hydrateCartFromServer } from '@/features/cart/store';

/**
 * Auth token değişince (login/logout/refresh) sepeti backend'le senkronize eder.
 * Mount'ta da bir kez çalışır; token yoksa kısa devre yapar.
 */
export function CartHydrator() {
  const accessToken = useAuthStore((s) => s.tokens?.accessToken ?? null);
  useEffect(() => {
    if (!accessToken) return;
    void hydrateCartFromServer();
  }, [accessToken]);
  return null;
}
