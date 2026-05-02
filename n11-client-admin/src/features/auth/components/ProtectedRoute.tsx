import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const persist = useAuthStore.persist;
    if (!persist) { setHydrated(true); return; }
    if (persist.hasHydrated()) { setHydrated(true); return; }
    const unsub = persist.onFinishHydration(() => setHydrated(true));
    return () => unsub();
  }, []);
  return hydrated;
}

export function ProtectedRoute() {
  const hydrated = useHydrated();
  const token = useAuthStore((s) => s.accessToken);
  const user  = useAuthStore((s) => s.user);

  if (!hydrated) return null;
  if (!token)    return <Navigate to="/login" replace />;
  if (user && user.role !== 'ADMIN') return <Navigate to="/login" replace />;
  return <Outlet />;
}
