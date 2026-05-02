'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { useCartStore } from '@/features/cart/store';

/**
 * Auth token değişince sepeti backend'le senkronize eder.
 * - Login varsa basket-service'den sepeti çeker.
 * - Logout olursa lokal sepet state'ini temizler (sunucu çağrısı yok).
 * Sepet artık sadece API üzerinden yönetildiği için localStorage'da hiçbir
 * şey tutulmaz.
 */
export function CartHydrator() {
  const accessToken = useAuthStore((s) => s.tokens?.accessToken ?? null);
  const hydrate = useCartStore((s) => s.hydrate);
  const reset = useCartStore((s) => s.reset);

  useEffect(() => {
    if (accessToken) {
      void hydrate();
    } else {
      reset();
    }
  }, [accessToken, hydrate, reset]);

  return null;
}
