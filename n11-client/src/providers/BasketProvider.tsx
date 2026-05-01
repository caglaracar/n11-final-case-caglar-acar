/**
 * Sepet bağlamı — kullanıcı bazlı.
 *
 * Kural:
 *  - Misafir: localStorage'dan okur/yazar.
 *  - Giriş yapıldığında: misafir sepetini remote'a merge eder, sonra remote'u kullanır.
 *  - Çıkış yapıldığında: state + localStorage tamamen temizlenir.
 *    Farklı kullanıcılar arasında veri geçişi olmaz.
 */
import {
  createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode,
} from "react";
import { basketService, productService } from "@/services";
import type { Basket as ApiBasket, BasketItem as ApiBasketItem } from "@/types/api";
import { useAuth } from "./AuthProvider";

export interface BasketItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
}

interface BasketContextType {
  items: BasketItem[];
  loading: boolean;
  addItem: (item: Omit<BasketItem, "quantity">) => Promise<void> | void;
  removeItem: (id: string) => Promise<void> | void;
  updateQuantity: (id: string, quantity: number) => Promise<void> | void;
  clearBasket: () => Promise<void> | void;
  totalItems: number;
  totalPrice: number;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);
const LOCAL_KEY = "n11_basket";

function readLocal(): BasketItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as BasketItem[]) : [];
  } catch { return []; }
}
function writeLocal(items: BasketItem[]) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(items)); }
  catch { /* quota */ }
}
function clearLocal() {
  try { localStorage.removeItem(LOCAL_KEY); }
  catch { /* ignore */ }
}

const toApiItem = (c: BasketItem): ApiBasketItem => ({
  productId: c.id, productName: c.name, unitPrice: c.price, quantity: c.quantity,
});

async function decorateBackendBasket(api: ApiBasket, prev: BasketItem[]): Promise<BasketItem[]> {
  return Promise.all(
    api.items.map(async (it) => {
      const found = prev.find((p) => p.id === it.productId);
      if (found) return { ...found, quantity: it.quantity, price: it.unitPrice, name: it.productName };
      try {
        const p = await productService.findById(it.productId);
        return {
          id: it.productId, name: it.productName, price: it.unitPrice,
          quantity: it.quantity, image: p.imageUrl || (p.images?.[0]) || "", category: p.subcategory || p.categoryId || "",
        };
      } catch {
        return { id: it.productId, name: it.productName, price: it.unitPrice, quantity: it.quantity, image: "", category: "" };
      }
    }),
  );
}

export function BasketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, authId, loading: authLoading } = useAuth();

  // Boş başla — doğru kullanıcı için yüklenecek.
  const [items, setItems] = useState<BasketItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Hangi authId için yükleme yaptık? null = henüz yapılmadı.
  const loadedForRef  = useRef<number | "guest" | null>(null);
  const prevIsAuthRef = useRef<boolean | null>(null);

  // ─── Auth state değişimini takip et ─────────────────────────────

  useEffect(() => {
    if (authLoading) return;

    // Çıkış tespiti: önceden auth, şimdi değil.
    const wasAuth = prevIsAuthRef.current;
    prevIsAuthRef.current = isAuthenticated;
    if (wasAuth === true && !isAuthenticated) {
      setItems([]);
      clearLocal();
      loadedForRef.current = "guest";
      return;
    }

    const targetKey: number | "guest" = isAuthenticated && authId ? authId : "guest";
    if (loadedForRef.current === targetKey) return;

    // Yeni kullanıcı ya da ilk yükleme.
    const localItems = readLocal();
    loadedForRef.current = targetKey;

    if (!isAuthenticated) {
      // Misafir: localStorage'dan yükle.
      setItems(localItems);
      return;
    }

    // Giriş yapıldı: misafir sepetini merge et, sonra remote'u çek.
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // Misafir'de eklenen ürünleri remote'a yükle (sadece bu oturumda eklenenler).
        if (localItems.length > 0) {
          for (const it of localItems) {
            try { await basketService.add(toApiItem(it)); }
            catch { /* ignore */ }
            if (cancelled) return;
          }
          // Merge tamamlandı — local'i temizle.
          clearLocal();
        }
        const api = await basketService.get();
        if (cancelled) return;
        const decorated = await decorateBackendBasket(api, localItems);
        if (!cancelled) setItems(decorated);
      } catch {
        // Offline — local'i kullan.
        if (!cancelled) setItems(localItems);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated, authId, authLoading]); // eslint-disable-line

  // Misafir modda localStorage'a yaz.
  useEffect(() => {
    if (!authLoading && !isAuthenticated) writeLocal(items);
  }, [items, isAuthenticated, authLoading]);

  // ─── Actions ─────────────────────────────────────────────────────

  const addItem = useCallback<BasketContextType["addItem"]>(async (item) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      return existing
        ? prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev, { ...item, quantity: 1 }];
    });
    if (isAuthenticated) {
      try { await basketService.add({ productId: item.id, productName: item.name, unitPrice: item.price, quantity: 1 }); }
      catch { /* swallow */ }
    }
  }, [isAuthenticated]);

  const removeItem = useCallback<BasketContextType["removeItem"]>(async (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (isAuthenticated) {
      try { await basketService.remove(id); }
      catch { /* ignore */ }
    }
  }, [isAuthenticated]);

  const updateQuantity = useCallback<BasketContextType["updateQuantity"]>(async (id, quantity) => {
    if (quantity <= 0) { await removeItem(id); return; }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
    if (isAuthenticated) {
      try { await basketService.update(id, quantity); }
      catch { /* ignore */ }
    }
  }, [isAuthenticated, removeItem]);

  const clearBasket = useCallback<BasketContextType["clearBasket"]>(async () => {
    setItems([]);
    clearLocal();
    if (isAuthenticated) {
      try { await basketService.clear(); }
      catch { /* ignore */ }
    }
  }, [isAuthenticated]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <BasketContext.Provider value={{ items, loading, addItem, removeItem, updateQuantity, clearBasket, totalItems, totalPrice }}>
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useBasket must be used within a BasketProvider");
  return ctx;
}
