import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers";

type AuthTab = "login" | "signup";

/** Türkçe karakterleri ASCII'ye indirip yalnız [a-zA-Z0-9_] bırakır. */
function toUserName(name: string, email: string): string {
  const base = (name && name.trim()) || email.split("@")[0] || "user";
  const slug = base
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
  return slug || "user";
}

export default function AuthPage() {
  const [tab, setTab] = useState<AuthTab>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const fromPath = (location.state as { from?: string } | null)?.from ?? null;

  /** Role'e göre default landing. Eğer korumalı bir sayfadan yönlendirildiyse oraya dön. */
  const resolveRedirect = (role: "USER" | "SELLER" | "ADMIN"): string => {
    if (fromPath) return fromPath;
    if (role === "ADMIN") return "/admin";
    return "/";
  };

  const validateLogin = () => {
    const e: Record<string, string> = {};
    if (!loginForm.identifier) e.identifier = "Kullanıcı adı veya email gerekli";
    if (!loginForm.password) e.password = "Şifre gerekli";
    return e;
  };

  const validateSignup = () => {
    const e: Record<string, string> = {};
    if (!signupForm.name) e.name = "Ad soyad gerekli";
    if (!signupForm.email) e.email = "Email gerekli";
    else if (!/\S+@\S+\.\S+/.test(signupForm.email)) e.email = "Geçersiz email";
    if (!signupForm.password) e.password = "Şifre gerekli";
    else if (signupForm.password.length < 8) e.password = "En az 8 karakter olmalı";
    if (signupForm.password !== signupForm.confirm) e.confirm = "Şifreler eşleşmiyor";
    return e;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const errs = validateLogin();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const role = await login({ userName: loginForm.identifier, password: loginForm.password });
      setSubmitted(true);
      const target = resolveRedirect(role);
      setTimeout(() => navigate(target, { replace: true }), 600);
    } catch (err) {
      setServerError((err as Error).message || "Giriş başarısız");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const errs = validateSignup();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const userName = toUserName(signupForm.name, signupForm.email);
      const role = await register({
        userName,
        email: signupForm.email,
        password: signupForm.password,
        repassword: signupForm.confirm,
      });
      setSubmitted(true);
      const target = resolveRedirect(role);
      setTimeout(() => navigate(target, { replace: true }), 600);
    } catch (err) {
      setServerError((err as Error).message || "Kayıt başarısız");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex animate-page-enter">
      {/* Left - Brand Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-primary-900 via-[#0d2b28] to-[#0a1f1e]">
        <img
          src="https://readdy.ai/api/search-image?query=modern%20minimal%20flat%20lay%20arrangement%20of%20premium%20consumer%20products%20electronics%20smartwatch%20headphones%20books%20sneakers%20on%20dark%20slate%20surface%20top%20view%20artistic%20composition%20professional%20product%20photography%20moody%20cinematic%20lighting%20no%20people&width=1000&height=1100&seq=auth-product-flatlay-2026&orientation=portrait"
          alt="Sepetify Ürünler"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-primary-900/50 to-[#0d4a40]/70" />
        <div className="absolute top-1/4 right-16 w-80 h-80 rounded-full bg-accent-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-8 w-64 h-64 rounded-full bg-accent-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-accent-600 group-hover:bg-accent-500 transition-colors shadow-lg shadow-accent-600/30">
              <i className="ri-shopping-cart-2-fill text-white text-xl"></i>
            </div>
            <div className="flex items-baseline">
              <span className="font-display font-extrabold text-2xl text-white tracking-tight">Sepet</span>
              <span className="font-display font-extrabold text-2xl text-accent-400">ify</span>
            </div>
          </Link>

          <div className="flex-1 flex flex-col justify-center py-12">
            <p className="text-accent-400 text-xs tracking-widest uppercase font-bold mb-4">Alışverişin En Kolay Hali</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Her şey burada,<br />
              <span className="text-accent-400">tek bir yerde.</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed max-w-sm mb-10">
              Elektronik, ev, spor, moda ve daha fazlası — hızlı ve güvenli teslimat ile.
            </p>

            <div className="space-y-4">
              {[
                { icon: "ri-truck-line", title: "Ücretsiz Kargo", desc: "100 TL üzeri tüm siparişlerde" },
                { icon: "ri-shield-check-line", title: "Alıcı Güvencesi", desc: "Güvenli ödeme ve kolay iade" },
                { icon: "ri-customer-service-2-line", title: "7/24 Destek", desc: "Her zaman buradayız" },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-accent-600/20 border border-accent-600/30 text-accent-400 flex-shrink-0">
                    <i className={`${item.icon} text-lg`}></i>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{item.title}</p>
                    <p className="text-white/50 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/25 text-xs">&copy; 2026 Sepetify. Tüm hakları saklıdır.</p>
        </div>
      </div>

      {/* Right - Form Panel */}
      <div className="w-full lg:w-[45%] flex items-center justify-center bg-[#FAFAF8] px-6 py-12 lg:px-12 xl:px-16">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent-600">
                <i className="ri-shopping-cart-2-fill text-white text-base"></i>
              </div>
              <span className="font-display font-extrabold text-2xl text-primary-900">
                Sepet<span className="text-accent-600">ify</span>
              </span>
            </Link>
          </div>

          <div className="flex bg-surface-100 rounded-full p-1 mb-8 border border-surface-200">
            <button
              onClick={() => {
                setTab("login");
                setErrors({});
                setSubmitted(false);
                setServerError(null);
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap cursor-pointer ${
                tab === "login" ? "bg-primary-900 text-white" : "text-primary-600 hover:text-primary-900"
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => {
                setTab("signup");
                setErrors({});
                setSubmitted(false);
                setServerError(null);
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap cursor-pointer ${
                tab === "signup" ? "bg-primary-900 text-white" : "text-primary-600 hover:text-primary-900"
              }`}
            >
              Hesap Oluştur
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-12 animate-scale-in">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-accent-100 mx-auto mb-4">
                <i className="ri-check-line text-2xl text-accent-600"></i>
              </div>
              <h3 className="font-display text-xl font-semibold text-primary-900 mb-2">
                {tab === "login" ? "Tekrar hoşgeldin!" : "Hesap oluşturuldu!"}
              </h3>
              <p className="text-primary-400 text-sm">Yönlendiriliyorsun...</p>
            </div>
          ) : tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-semibold text-primary-900 mb-1">Tekrar hoşgeldin</h2>
                <p className="text-sm text-primary-400">Sepetify hesabınıza giriş yapın</p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-primary-600 mb-1.5 uppercase tracking-wider">
                    Kullanıcı Adı / Email
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-primary-400">
                      <i className="ri-user-line text-base"></i>
                    </span>
                    <input
                      type="text"
                      autoComplete="username"
                      value={loginForm.identifier}
                      onChange={(e) => setLoginForm((f) => ({ ...f, identifier: e.target.value }))}
                      placeholder="kullanici_adi veya email"
                      className={`w-full pl-11 pr-4 py-3 rounded-lg border text-sm text-primary-900 placeholder-primary-300 bg-white focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-400 transition-all ${
                        errors.identifier ? "border-red-400" : "border-surface-200 hover:border-surface-300"
                      }`}
                    />
                  </div>
                  {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-primary-600 uppercase tracking-wider">Şifre</label>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-primary-400">
                      <i className="ri-lock-line text-base"></i>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      className={`w-full pl-11 pr-12 py-3 rounded-lg border text-sm text-primary-900 placeholder-primary-300 bg-white focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-400 transition-all ${
                        errors.password ? "border-red-400" : "border-surface-200 hover:border-surface-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-primary-400 hover:text-primary-700 cursor-pointer"
                    >
                      {showPassword ? <i className="ri-eye-off-line text-base"></i> : <i className="ri-eye-line text-base"></i>}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
              </div>

              {serverError && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full text-center flex items-center justify-center gap-2 py-3.5 disabled:opacity-60"
              >
                {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-arrow-right-line"></i>
                </span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-semibold text-primary-900 mb-1">Hesap oluştur</h2>
                <p className="text-sm text-primary-400">Sepetify'a katıl, akıllı alışverişe başla</p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-primary-600 mb-1.5 uppercase tracking-wider">Ad Soyad</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-primary-400">
                      <i className="ri-user-line text-base"></i>
                    </span>
                    <input
                      type="text"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Ali Veli"
                      className={`w-full pl-11 pr-4 py-3 rounded-lg border text-sm text-primary-900 placeholder-primary-300 bg-white focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-400 transition-all ${
                        errors.name ? "border-red-400" : "border-surface-200 hover:border-surface-300"
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary-600 mb-1.5 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-primary-400">
                      <i className="ri-mail-line text-base"></i>
                    </span>
                    <input
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="ali@example.com"
                      className={`w-full pl-11 pr-4 py-3 rounded-lg border text-sm text-primary-900 placeholder-primary-300 bg-white focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-400 transition-all ${
                        errors.email ? "border-red-400" : "border-surface-200 hover:border-surface-300"
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary-600 mb-1.5 uppercase tracking-wider">Şifre</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-primary-400">
                      <i className="ri-lock-line text-base"></i>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={signupForm.password}
                      onChange={(e) => setSignupForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="En az 8 karakter"
                      className={`w-full pl-11 pr-12 py-3 rounded-lg border text-sm text-primary-900 placeholder-primary-300 bg-white focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-400 transition-all ${
                        errors.password ? "border-red-400" : "border-surface-200 hover:border-surface-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-primary-400 hover:text-primary-700 cursor-pointer"
                    >
                      {showPassword ? <i className="ri-eye-off-line text-base"></i> : <i className="ri-eye-line text-base"></i>}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary-600 mb-1.5 uppercase tracking-wider">Şifre Tekrar</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-primary-400">
                      <i className="ri-lock-2-line text-base"></i>
                    </span>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={signupForm.confirm}
                      onChange={(e) => setSignupForm((f) => ({ ...f, confirm: e.target.value }))}
                      placeholder="••••••••"
                      className={`w-full pl-11 pr-12 py-3 rounded-lg border text-sm text-primary-900 placeholder-primary-300 bg-white focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-400 transition-all ${
                        errors.confirm ? "border-red-400" : "border-surface-200 hover:border-surface-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-primary-400 hover:text-primary-700 cursor-pointer"
                    >
                      {showConfirm ? <i className="ri-eye-off-line text-base"></i> : <i className="ri-eye-line text-base"></i>}
                    </button>
                  </div>
                  {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
                </div>
              </div>

              {serverError && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full text-center flex items-center justify-center gap-2 py-3.5 disabled:opacity-60"
              >
                {submitting ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-arrow-right-line"></i>
                </span>
              </button>
            </form>
          )}

          <p className="text-center text-sm text-primary-400 mt-8 flex items-center justify-center gap-4">
            <Link to="/" className="hover:text-primary-900 transition-colors inline-flex items-center gap-1 cursor-pointer">
              <i className="ri-arrow-left-line text-xs"></i>
              Mağazaya Dön
            </Link>
            <span className="text-primary-200">·</span>
            <Link to="/admin/login" className="hover:text-primary-900 transition-colors inline-flex items-center gap-1 cursor-pointer">
              <i className="ri-shield-user-line text-xs"></i>
              Yönetici Girişi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
