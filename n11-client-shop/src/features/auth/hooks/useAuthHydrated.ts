'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store';

/**
 * Zustand persist senkron olmayabilir; ilk render'da `tokens` null görünüp
 * korumalı sayfaların yanlışlıkla login'e atmasını engellemek için
 * rehydrate tamamlanana kadar `false` döner.
 */
export function useAuthHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useAuthStore.persist;
    if (!persist) {
      setHydrated(true);
      return;
    }
    if (persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = persist.onFinishHydration(() => setHydrated(true));
    return () => unsub();
  }, []);

  return hydrated;
}
