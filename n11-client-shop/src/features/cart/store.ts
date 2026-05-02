'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from '@/features/auth/store';
import { MAX_PAYMENT_AMOUNT } from '@/shared/lib/payment';

export interface CartLine {
  productId: string;
  name: string;
  price: number;
  thumbnail?: string;
  quantity: number;
}

interface CartState {
  items: CartLine[];
  /** Bir sonraki siparişe ayrılan kalemler (yalnızca local'de tutulur). */
  saved: CartLine[];
  /** Sunucudan gelen sepete state'i ezerek bağla. */
  setLines: (lines: CartLine[]) => void;
  add: (item: Omit<CartLine, 'quantity'>, qty?: number) => void;
  setQuantity: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  total: () => number;
  /** Limiti aşan kalemleri otomatik olarak "sonraki sipariş"e ayırır. */
  autoSplit: () => number;
  /** Ayrılan kalemden 1 adet sepete geri alır. */
  restoreSaved: (productId: string, qty?: number) => void;
  /** Ayrılan kalemi tamamen siler. */
  removeSaved: (productId: string) => void;
}

const isAuthenticated = () => !!useAuthStore.getState().tokens?.accessToken;

/**
 * Backend basket-service'i fire-and-forget tetikler. Login yoksa hiçbir şey yapmaz
 * (anonim sepet localStorage'da kalır). Hatalar konsola düşer; UI optimistik kalır.
 */
function syncBackend(action: () => Promise<unknown>) {
  if (typeof window === 'undefined') return;
  if (!isAuthenticated()) return;
  void action().catch((err) => {
    console.error('[basket] sync failed', err);
  });
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      setLines: (lines) => set({ items: lines }),
      add: (item, qty = 1) => {
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: i.quantity + qty } : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, quantity: qty }] };
        });
        syncBackend(async () => {
          const { basketApi } = await import('@/features/cart/api/basketApi');
          return basketApi.add({
            productId: item.productId,
            productName: item.name,
            quantity: qty,
            unitPrice: item.price,
          });
        });
      },
      setQuantity: (productId, qty) => {
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.productId !== productId)
              : s.items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)),
        }));
        syncBackend(async () => {
          const { basketApi } = await import('@/features/cart/api/basketApi');
          return basketApi.update(productId, qty);
        });
      },
      remove: (productId) => {
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) }));
        syncBackend(async () => {
          const { basketApi } = await import('@/features/cart/api/basketApi');
          return basketApi.remove(productId);
        });
      },
      clear: () => {
        set({ items: [] });
        syncBackend(async () => {
          const { basketApi } = await import('@/features/cart/api/basketApi');
          return basketApi.clear();
        });
      },
      total: () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
      saved: [],
      autoSplit: () => {
        const state = get();
        const items = state.items.map((i) => ({ ...i }));
        const saved = state.saved.map((i) => ({ ...i }));
        let total = items.reduce((a, i) => a + i.price * i.quantity, 0);
        let moved = 0;
        while (total >= MAX_PAYMENT_AMOUNT && items.length > 0) {
          const idx = items.reduce((m, it, i, arr) => (it.price > arr[m].price ? i : m), 0);
          const line = items[idx];
          line.quantity -= 1;
          total -= line.price;
          moved += 1;
          const dest = saved.find((s) => s.productId === line.productId);
          if (dest) dest.quantity += 1;
          else saved.push({ ...line, quantity: 1 });
          if (line.quantity <= 0) items.splice(idx, 1);
        }
        if (moved === 0) return 0;
        set({ items, saved });
        syncBackend(async () => {
          const { basketApi } = await import('@/features/cart/api/basketApi');
          return basketApi.syncFromLocal(items);
        });
        return moved;
      },
      restoreSaved: (productId, qty = 1) => {
        const state = get();
        const src = state.saved.find((s) => s.productId === productId);
        if (!src) return;
        const take = Math.min(qty, src.quantity);
        const saved = state.saved
          .map((s) => (s.productId === productId ? { ...s, quantity: s.quantity - take } : s))
          .filter((s) => s.quantity > 0);
        const existing = state.items.find((i) => i.productId === productId);
        const items = existing
          ? state.items.map((i) =>
              i.productId === productId ? { ...i, quantity: i.quantity + take } : i,
            )
          : [...state.items, { ...src, quantity: take }];
        set({ items, saved });
        syncBackend(async () => {
          const { basketApi } = await import('@/features/cart/api/basketApi');
          return basketApi.syncFromLocal(items);
        });
      },
      removeSaved: (productId) => {
        set((s) => ({ saved: s.saved.filter((i) => i.productId !== productId) }));
      },
    }),
    { name: 'sepetify-cart' },
  ),
);

/**
 * Login sonrası ya da uygulama mount olurken çağrılır. Önce yereldeki anonim
 * sepeti backend'e push eder, sonra backend'i kaynak alarak state'i ezer.
 */
export async function hydrateCartFromServer(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!isAuthenticated()) return;
  const { basketApi } = await import('@/features/cart/api/basketApi');
  try {
    const local = useCartStore.getState().items;
    if (local.length > 0) {
      await basketApi.syncFromLocal(local);
    }
    const remote = await basketApi.me();
    const lines: CartLine[] = (remote.items ?? []).map((row) => ({
      productId: row.productId,
      name: row.productName,
      price: row.unitPrice,
      quantity: row.quantity,
    }));
    useCartStore.getState().setLines(lines);
  } catch (err) {
    console.error('[basket] hydrate failed', err);
  }
}
