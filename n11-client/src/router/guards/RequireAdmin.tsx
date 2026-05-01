/** ADMIN rolü gerektiren route'lar için sarmalayıcı. */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/providers";

export default function RequireAdmin() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-primary-400 text-sm">
        Yükleniyor...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }
  if (!isAdmin) {
    // Authenticated user'a admin alanı görünmesin — anasayfaya at.
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
