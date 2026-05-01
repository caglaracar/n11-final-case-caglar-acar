/**
 * Access + refresh token saklama. localStorage tabanlı; SSR yok.
 *
 * Anahtarlar:
 *  - n11_access_token
 *  - n11_refresh_token
 *
 * `subscribe` ile UI değişikliklerden haberdar olur (tab arası dahil),
 * cross-tab değişimi `storage` event'iyle yakalanır.
 */
const ACCESS_KEY = "n11_access_token";
const REFRESH_KEY = "n11_refresh_token";

type Listener = () => void;
const listeners = new Set<Listener>();
function emit() {
  for (const l of listeners) l();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === ACCESS_KEY || e.key === REFRESH_KEY) emit();
  });
}

export const tokenStore = {
  get access(): string | null {
    return typeof localStorage !== "undefined" ? localStorage.getItem(ACCESS_KEY) : null;
  },
  get refresh(): string | null {
    return typeof localStorage !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null;
  },
  set(access: string, refresh: string) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    emit();
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    emit();
  },
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
