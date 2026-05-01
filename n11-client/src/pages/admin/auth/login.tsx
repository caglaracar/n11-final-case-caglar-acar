/**
 * Admin Giriş Sayfası — `/admin/login`.
 *
 * Kullanıcı login'inden ayrı, koyu (dark) tema. Sadece ADMIN rolüne
 * sahip Auth'lar bu kapıdan içeri girebilir; ADMIN olmayan biri başarılı
 * authenticate olsa bile session sıfırlanır ve hata gösterilir.
 */
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuth();

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fromPath = (location.state as { from?: string } | null)?.from ?? "/admin";

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.identifier.trim()) e.identifier = "Kullanıcı adı veya email gerekli";
    if (!form.password) e.password = "Şifre gerekli";
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError(null);
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const role = await login({ userName: form.identifier, password: form.password });
      if (role !== "ADMIN") {
        // Yetkisiz erişim — session'ı temizle, kullanıcıyı yönlendir.
        await logout();
        setServerError("Bu hesap admin yetkisine sahip değil.");
        return;
      }
      navigate(fromPath, { replace: true });
    } catch (err) {
      setServerError((err as Error).message || "Giriş başarısız");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-[#0d2b28] to-[#0a1f1e] px-4 py-12">
      <div className="absolute top-1/4 right-16 w-80 h-80 rounded-full bg-accent-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-8 w-64 h-64 rounded-full bg-accent-400/10 blur-2xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-accent-600 shadow-lg shadow-accent-600/40">
              <i className="ri-shopping-cart-2-fill text-white text-xl"></i>
            </div>
            <span className="font-display font-extrabold text-2xl text-white">
              Sepet<span className="text-accent-400">ify</span>
            </span>
          </Link>
          <p className="text-accent-400 text-xs tracking-widest uppercase font-bold mb-2">
            Admin Panel
          </p>
          <h1 className="font-display text-2xl text-white font-semibold">Yönetici Girişi</h1>
          <p className="text-white/50 text-sm mt-1">Yalnızca yetkili personel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
              Kullanıcı Adı / Email
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                <i className="ri-shield-user-line text-base"></i>
              </span>
              <input
                type="text"
                autoComplete="username"
                value={form.identifier}
                onChange={(e) => setForm((f) => ({ ...f, identifier: e.target.value }))}
                placeholder="admin"
                className={`w-full pl-11 pr-4 py-3 rounded-lg bg-white/5 border text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-400 transition-all ${
                  errors.identifier ? "border-red-400/60" : "border-white/10 hover:border-white/20"
                }`}
              />
            </div>
            {errors.identifier && <p className="text-red-300 text-xs mt-1">{errors.identifier}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
              Şifre
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                <i className="ri-lock-line text-base"></i>
              </span>
              <input
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className={`w-full pl-11 pr-12 py-3 rounded-lg bg-white/5 border text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-400 transition-all ${
                  errors.password ? "border-red-400/60" : "border-white/10 hover:border-white/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
              >
                <i className={showPwd ? "ri-eye-off-line text-base" : "ri-eye-line text-base"}></i>
              </button>
            </div>
            {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password}</p>}
          </div>

          {serverError && (
            <p className="text-sm text-red-200 bg-red-500/10 border border-red-400/30 rounded-lg px-3 py-2">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-lg bg-accent-600 hover:bg-accent-500 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {submitting ? "Giriş yapılıyor..." : "Yönetici Olarak Giriş"}
            <i className="ri-arrow-right-line"></i>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-xs">
          <Link to="/admin/register" className="text-white/60 hover:text-white">
            Admin hesabı oluştur
          </Link>
          <Link to="/login" className="text-white/60 hover:text-white">
            ← Kullanıcı girişi
          </Link>
        </div>
      </div>
    </div>
  );
}
