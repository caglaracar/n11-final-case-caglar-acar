'use client';

import { create } from 'zustand';
import { toast } from 'sonner';

import { useAuthStore } from '@/features/auth/store';
import {
  addBasketItem,
  clearBasket,
  getMyBasket,
  removeBasketItem,
  updateBasketItem,
} from '@/features/cart/api/basketApi';
import { getProductById } from '@/features/products/api/productApi';
import type { RawBasket } from '@/features/cart/types/cart-types';
import { extractErrorMessage } from '@/shared/lib/api/client';
import { MAX_PAYMENT_AMOUNT } from '@/shared/lib/payment';

export interface CartLine {
  productId: string;
  name: string;
  price: number;
  thumbnail?: string;
  quantity: number;
}

interface CartState {
  /** Sunucudan gelen sepet kalemleri. Tek doğru kaynak basket-service. */
  items: CartLine[];
  /**
   * Limit aşımında bir sonraki siparişe ayrılan kalemler.
   * Sadece bellekte tutulur; sayfa yenilenince temizlenir.
   */
  saved: CartLine[];
  /** İlk hydrate tamamlandı mı? */
  hydrated: boolean;
  /** API çağrısı sürüyor mu? */
  isLoading: boolean;

  /** Backend basket-service'den sepeti çekip state'e ezerek bağlar. */
  hydrate: () => Promise<void>;
  /** Logout'ta state'i temizler (sunucuya istek atmaz). */
  reset: () => void;
  add: (item: Omit<CartLine, 'quantity'>, qty?: number) => Promise<boolean>;
  setQuantity: (productId: string, qty: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  total: () => number;
  autoSplit: () => Promise<number>;
  restoreSaved: (productId: string, qty?: number) => Promise<void>;
  removeSaved: (productId: string) => void;
}

const isAuthenticated = () => !!useAuthStore.getState().tokens?.accessToken;

const requireAuth = (): boolean => {
  if (!isAuthenticated()) {
    toast.error('Sepete erişmek için giriş yap');
    return false;
  }
  return true;
};

const mapItems = (raw: RawBasket): CartLine[] =>
  (raw.items ?? []).map((item) => ({
    productId: item.productId,
    name: item.productName,
    price: item.unitPrice,
    quantity: item.quantity,
  }));

/** Sunucu cevabı thumbnail taşımıyor; mevcut state'tekileri eşle. */
function mergeThumbnails(prev: CartLine[], next: CartLine[]): CartLine[] {
  if (prev.length === 0) return next;
  return next.map((line) => {
    const existing = prev.find((p) => p.productId === line.productId);
    return existing?.thumbnail ? { ...line, thumbnail: existing.thumbnail } : line;
  });
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  saved: [],
  hydrated: false,
  isLoading: false,

  hydrate: async () => {
    if (!isAuthenticated()) {
      set({ items: [], saved: [], hydrated: true, isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const remote = await getMyBasket();
      const lines = mapItems(remote);
      const thumbnails = await Promise.all(
        lines.map((line) =>
          getProductById(line.productId)
            .then((p) => ({ id: line.productId, url: p.images?.[0] ?? p.thumbnail ?? undefined }))
            .catch(() => ({ id: line.productId, url: undefined }))
        )
      );
      const thumbMap = Object.fromEntries(thumbnails.map((t) => [t.id, t.url]));
      const withThumbs = lines.map((l) => ({ ...l, thumbnail: thumbMap[l.productId] }));
      set({ items: withThumbs, hydrated: true, isLoading: false });
    } catch (err) {
      console.error('[basket] hydrate failed', err);
      set({ hydrated: true, isLoading: false });
    }
  },

  reset: () => set({ items: [], saved: [], hydrated: false, isLoading: false }),

  add: async (item, qty = 1) => {
    if (!requireAuth()) return false;
    set({ isLoading: true });
    try {
      const remote = await addBasketItem({
        productId: item.productId,
        productName: item.name,
        quantity: qty,
        unitPrice: item.price,
      });
      const next = mapItems(remote).map((line) =>
        line.productId === item.productId && item.thumbnail
          ? { ...line, thumbnail: item.thumbnail }
          : line,
      );
      set((s) => ({ items: mergeThumbnails(s.items, next), isLoading: false }));
      return true;
    } catch (err) {
      set({ isLoading: false });
      toast.error(extractErrorMessage(err, 'Sepete eklenemedi'));
      return false;
    }
  },

  setQuantity: async (productId, qty) => {
    if (!requireAuth()) return;
    set({ isLoading: true });
    try {
      const remote =
        qty <= 0 ? await removeBasketItem(productId) : await updateBasketItem(productId, qty);
      set((s) => ({ items: mergeThumbnails(s.items, mapItems(remote)), isLoading: false }));
    } catch (err) {
      set({ isLoading: false });
      toast.error(extractErrorMessage(err, 'Sepet güncellenemedi'));
    }
  },

  remove: async (productId) => {
    if (!requireAuth()) return;
    set({ isLoading: true });
    try {
      const remote = await removeBasketItem(productId);
      set((s) => ({ items: mergeThumbnails(s.items, mapItems(remote)), isLoading: false }));
    } catch (err) {
      set({ isLoading: false });
      toast.error(extractErrorMessage(err, 'Ürün kaldırılamadı'));
    }
  },

  clear: async () => {
    if (!requireAuth()) return;
    set({ isLoading: true });
    try {
      await clearBasket();
      set({ items: [], isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      toast.error(extractErrorMessage(err, 'Sepet temizlenemedi'));
    }
  },

  total: () => get().items.reduce((acc, line) => acc + line.price * line.quantity, 0),

  autoSplit: async () => {
    const state = get();
    const previousItems = state.items.map((i) => ({ ...i }));
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
    set({ saved });
    if (!isAuthenticated()) {
      set({ items });
      return moved;
    }
    try {
      for (const prev of previousItems) {
        const adjusted = items.find((i) => i.productId === prev.productId);
        if (!adjusted) {
          await removeBasketItem(prev.productId);
        } else if (adjusted.quantity !== prev.quantity) {
          await updateBasketItem(prev.productId, adjusted.quantity);
        }
      }
      const remote = await getMyBasket();
      set((s) => ({ items: mergeThumbnails(s.items, mapItems(remote)) }));
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Sepet senkronlanamadı'));
    }
    return moved;
  },

  restoreSaved: async (productId, qty = 1) => {
    const state = get();
    const src = state.saved.find((s) => s.productId === productId);
    if (!src) return;
    const take = Math.min(qty, src.quantity);
    const saved = state.saved
      .map((s) => (s.productId === productId ? { ...s, quantity: s.quantity - take } : s))
      .filter((s) => s.quantity > 0);
    set({ saved });
    if (!isAuthenticated()) return;
    try {
      const remote = await addBasketItem({
        productId: src.productId,
        productName: src.name,
        quantity: take,
        unitPrice: src.price,
      });
      const next = mapItems(remote).map((line) =>
        line.productId === productId && src.thumbnail
          ? { ...line, thumbnail: src.thumbnail }
          : line,
      );
      set((s) => ({ items: mergeThumbnails(s.items, next) }));
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Sepete geri alınamadı'));
    }
  },

  removeSaved: (productId) => {
    set((s) => ({ saved: s.saved.filter((i) => i.productId !== productId) }));
  },
}));

/** Geriye dönük yardımcı; CartHydrator hâlâ bunu kullanıyor. */
export async function hydrateCartFromServer(): Promise<void> {
  await useCartStore.getState().hydrate();
}
