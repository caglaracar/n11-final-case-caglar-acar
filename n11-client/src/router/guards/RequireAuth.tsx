/**
 * Auth gerektiren route'lar için sarmalayıcı.
 * Auth state hidrate olurken minimal placeholder gösterir, değilse /login'e yollar.
 */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/providers";

export default function RequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-primary-400 text-sm">
        Yükleniyor...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
}
