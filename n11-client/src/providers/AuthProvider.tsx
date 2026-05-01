/**
 * Auth state'i + login/register/logout aksiyonları.
 *
 * Token'lar `tokenStore`'da; bu provider yalnızca:
 *  - boot'ta hydrate (access geçerliyse `me()`, expire ise refresh dener),
 *  - login/register sonrası tekrar hydrate eder,
 *  - logout'ta state ve store'u temizler,
 *  - cross-tab logout/login için tokenStore değişimlerini dinler.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { authService, tokenStore, decodeJwt, isExpired, userService } from "@/services";
import type { LoginRequest, RegisterRequest, Role, UserProfile } from "@/types/api";

type AuthState = {
  user: UserProfile | null;
  role: Role | null;
  authId: number | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  login: (req: LoginRequest) => Promise<Role>;
  register: (req: RegisterRequest) => Promise<Role>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    authId: null,
    loading: true,
  });
  // Aynı anda birden fazla hydrate başlamasını engelle (login + storage event yarışı).
  const hydrating = useRef(false);

  const hydrate = useCallback(async () => {
    if (hydrating.current) return;
    hydrating.current = true;
    try {
      // Access yoksa: belki yalnızca refresh var (browser restore vs.) — refresh'i dene.
      if (!tokenStore.access && tokenStore.refresh) {
        try {
          const t = await authService.refresh(tokenStore.refresh);
          tokenStore.set(t.accessToken, t.refreshToken);
        } catch {
          tokenStore.clear();
        }
      }

      // Access expired ise refresh'i dene; başarısızsa temizle.
      const claims = decodeJwt(tokenStore.access);
      if (!claims || !claims.sub || isExpired(claims)) {
        if (tokenStore.refresh) {
          try {
            const t = await authService.refresh(tokenStore.refresh);
            tokenStore.set(t.accessToken, t.refreshToken);
          } catch {
            tokenStore.clear();
            setState({ user: null, role: null, authId: null, loading: false });
            return;
          }
        } else {
          tokenStore.clear();
          setState({ user: null, role: null, authId: null, loading: false });
          return;
        }
      }

      const fresh = decodeJwt(tokenStore.access);
      try {
        const profile = await userService.me();
        setState({
          user: profile,
          role: fresh?.role ?? "USER",
          authId: profile.authId,
          loading: false,
        });
      } catch {
        tokenStore.clear();
        setState({ user: null, role: null, authId: null, loading: false });
      }
    } finally {
      hydrating.current = false;
    }
  }, []);

  useEffect(() => {
    hydrate();
    // Cross-tab senkron: yalnızca diğer sekmedeki LOGOUT'a tepki ver.
    // Aynı sekmede login/refresh sonrası `set()` çağrıları zaten hydrate edilmiş durumda
    // — burada tekrar çağırmak çift `/me`'ye yol açar.
    return tokenStore.subscribe(() => {
      if (!tokenStore.access && !tokenStore.refresh) {
        setState({ user: null, role: null, authId: null, loading: false });
      }
    });
  }, [hydrate]);

  const login = useCallback(
    async (req: LoginRequest): Promise<Role> => {
      const tokens = await authService.login(req);
      tokenStore.set(tokens.accessToken, tokens.refreshToken);
      const claims = decodeJwt(tokens.accessToken);
      const role: Role = claims?.role ?? "USER";
      const authId = claims?.sub ? Number(claims.sub) : null;
      // /me hatası girişi bloklamamalı — opsiyonel.
      try {
        const profile = await userService.me();
        setState({ user: profile, role, authId: profile.authId, loading: false });
      } catch {
        setState({ user: null, role, authId, loading: false });
      }
      return role;
    },
    [],
  );

  const register = useCallback(
    async (req: RegisterRequest): Promise<Role> => {
      await authService.register(req);
      // backend register tokeni dönmüyor — peşi sıra login
      return login({ userName: req.userName, password: req.password });
    },
    [login],
  );

  const logout = useCallback(async () => {
    const refresh = tokenStore.refresh;
    try {
      // Backend `RefreshRequestDto` zorunlu kıldığı için refresh token gönderilmeli.
      // Yoksa endpoint zaten gerekli değil; idempotent davranalım.
      if (tokenStore.access && refresh) {
        await authService.logout(refresh);
      }
    } catch {
      /* offline da olsa local state'i temizle */
    } finally {
      tokenStore.clear();
      setState({ user: null, role: null, authId: null, loading: false });
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: !!state.authId,
      isAdmin: state.role === "ADMIN",
      isSeller: state.role === "SELLER",
      login,
      register,
      logout,
      refreshProfile: hydrate,
    }),
    [state, login, register, logout, hydrate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
