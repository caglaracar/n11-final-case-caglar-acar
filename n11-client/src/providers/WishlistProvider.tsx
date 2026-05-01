/**
 * Wishlist — kullanıcı bazlı.
 *
 * Kural:
 *  - Giriş yapılmamış (misafir): localStorage'dan okur/yazar.
 *  - Giriş yapıldığında: remote'dan çeker, localStorage'ı temizler.
 *    Önceki kullanıcı verisi yeni hesaba asla bulaşmaz.
 *  - Çıkış yapıldığında: state + localStorage sıfırlanır.
 */
import {
  createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode,
} from "react";
import { wishlistService } from "@/services";
import { useAuth } from "./AuthProvider";

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  clearWishlist: () => void;
}

const STORAGE_KEY = "sepetify_wishlist";
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function readLocal(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}

function clearLocal() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

function writeLocal(items: string[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
  catch { /* ignore */ }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, authId, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Hangi kullanıcı/misafir için yükledik? null = henüz yüklenmedik.
  const loadedForRef = useRef<number | "guest" | null>(null);

  useEffect(() => {
    if (authLoading) return;

    const targetKey: number | "guest" = isAuthenticated && authId ? authId : "guest";

    // Aynı kullanıcı/misafir için zaten yüklendiyse tekrar yükleme.
    if (loadedForRef.current === targetKey) return;

    // Kullanıcı değişti → state'i sıfırla.
    setWishlist([]);
    loadedForRef.current = targetKey;

    if (!isAuthenticated) {
      // Misafir: localStorage'dan oku.
      setWishlist(readLocal());
      return;
    }

    // Giriş yapıldı: önceki localStorage'ı temizle (farklı kullanıcı verisi bulaşmasın).
    clearLocal();

    // Remote'dan çek — bu kullanıcının gerçek listesi.
    let cancelled = false;
    wishlistService
      .list()
      .then((remote) => { if (!cancelled) setWishlist(remote ?? []); })
      .catch(() => { if (!cancelled) setWishlist([]); });

    return () => { cancelled = true; };
  }, [isAuthenticated, authId, authLoading]);

  // Misafir modda: wishlist değişince localStorage'a yaz.
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      writeLocal(wishlist);
    }
  }, [wishlist, isAuthenticated, authLoading]);

  // Çıkış yapılınca: state + localStorage'ı temizle.
  const prevIsAuthRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (authLoading) return;
    const wasAuth = prevIsAuthRef.current;
    prevIsAuthRef.current = isAuthenticated;
    if (wasAuth === true && !isAuthenticated) {
      // Logout tespit edildi.
      setWishlist([]);
      clearLocal();
      loadedForRef.current = "guest";
    }
  }, [isAuthenticated, authLoading]);

  // ─── Actions ─────────────────────────────────────────────────────

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => {
        const isPresent = prev.includes(productId);
        const next = isPresent
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];
        if (isAuthenticated) {
          (isPresent
            ? wishlistService.remove(productId)
            : wishlistService.add(productId)
          ).catch(() => { /* ignore */ });
        }
        return next;
      });
    },
    [isAuthenticated],
  );

  const isInWishlist = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist],
  );

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    clearLocal();
    if (isAuthenticated) wishlistService.clear().catch(() => {});
  }, [isAuthenticated]);

  return (
    <WishlistContext.Provider
      value={{ wishlist, toggleWishlist, isInWishlist, wishlistCount: wishlist.length, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
