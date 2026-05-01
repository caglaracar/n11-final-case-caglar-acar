/**
 * Admin Kayıt Sayfası — `/admin/register`.
 *
 * Backend'in `${app.admin.invite-code}` değeriyle eşleşmesi gereken bir davet
 * kodu zorunludur. Başarılı kayıt sonrası otomatik login + `/admin`'e yönlendirir.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "@/services";
import { useAuth } from "@/providers";

function toUserName(raw: string): string {
  const slug = raw
    .trim()
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return slug || "admin";
}

export default function AdminRegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    confirm: "",
    inviteCode: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.userName.trim()) e.userName = "Kullanıcı adı gerekli";
    else if (!/^[a-zA-Z0-9_]{3,30}$/.test(form.userName))
      e.userName = "3-30 karakter, sadece harf/rakam/_";
    if (!form.email) e.email = "Email gerekli";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Geçersiz email";
    if (!form.password) e.password = "Şifre gerekli";
    else if (form.password.length < 8) e.password = "En az 8 karakter olmalı";
    if (form.password !== form.confirm) e.confirm = "Şifreler eşleşmiyor";
    if (!form.inviteCode) e.inviteCode = "Davet kodu gerekli";
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
      const userName = toUserName(form.userName);
      await authService.registerAdmin({
        userName,
        email: form.email,
        password: form.password,
        repassword: form.confirm,
        inviteCode: form.inviteCode,
      });
      // Backend register tokeni dönmüyor → peşine login at.
      const role = await login({ userName, password: form.password });
      if (role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        // Beklenmedik durum
        setServerError("Hesap oluşturuldu ancak admin yetkisi atanamadı.");
      }
    } catch (err) {
      setServerError((err as Error).message || "Kayıt başarısız");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-[#0d2b28] to-[#0a1f1e] px-4 py-12">
      <div className="absolute top-1/4 left-16 w-80 h-80 rounded-full bg-accent-500/15 blur-3xl pointer-events-none" />

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
          <h1 className="font-display text-2xl text-white font-semibold">Yönetici Hesabı Oluştur</h1>
          <p className="text-white/50 text-sm mt-1 text-center">
            Geçerli bir davet kodu ile yeni admin hesabı oluştur.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              value={form.userName}
              onChange={(e) => setForm((f) => ({ ...f, userName: e.target.value }))}
              placeholder="admin_caglar"
              className={`w-full px-4 py-3 rounded-lg bg-white/5 border text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-400 transition-all ${
                errors.userName ? "border-red-400/60" : "border-white/10 hover:border-white/20"
              }`}
            />
            {errors.userName && <p className="text-red-300 text-xs mt-1">{errors.userName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="admin@sepetify.com"
              className={`w-full px-4 py-3 rounded-lg bg-white/5 border text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-400 transition-all ${
                errors.email ? "border-red-400/60" : "border-white/10 hover:border-white/20"
              }`}
            />
            {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                Şifre
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className={`w-full pl-4 pr-10 py-3 rounded-lg bg-white/5 border text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-400 transition-all ${
                    errors.password ? "border-red-400/60" : "border-white/10 hover:border-white/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                >
                  <i className={showPwd ? "ri-eye-off-line text-base" : "ri-eye-line text-base"}></i>
                </button>
              </div>
              {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                Tekrar
              </label>
              <input
                type={showPwd ? "text" : "password"}
                value={form.confirm}
                onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-lg bg-white/5 border text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-400 transition-all ${
                  errors.confirm ? "border-red-400/60" : "border-white/10 hover:border-white/20"
                }`}
              />
              {errors.confirm && <p className="text-red-300 text-xs mt-1">{errors.confirm}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
              Davet Kodu
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-400">
                <i className="ri-key-2-line text-base"></i>
              </span>
              <input
                type="text"
                value={form.inviteCode}
                onChange={(e) => setForm((f) => ({ ...f, inviteCode: e.target.value }))}
                placeholder="********"
                className={`w-full pl-11 pr-4 py-3 rounded-lg bg-white/5 border text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-400 transition-all font-mono ${
                  errors.inviteCode ? "border-red-400/60" : "border-white/10 hover:border-white/20"
                }`}
              />
            </div>
            {errors.inviteCode && <p className="text-red-300 text-xs mt-1">{errors.inviteCode}</p>}
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
            {submitting ? "Oluşturuluyor..." : "Admin Hesabı Oluştur"}
            <i className="ri-arrow-right-line"></i>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-xs">
          <Link to="/admin/login" className="text-white/60 hover:text-white">
            ← Admin girişi
          </Link>
          <Link to="/login" className="text-white/60 hover:text-white">
            Kullanıcı girişi
          </Link>
        </div>
      </div>
    </div>
  );
}
