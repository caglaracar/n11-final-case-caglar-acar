import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type { CartLine } from '@/features/cart/store';

// ─── Types ────────────────────────────────────────────────────────────

export interface RawBasketItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface RawBasket {
  authId: number;
  items: RawBasketItem[] | null;
  total: number;
  updatedAt: number;
}

export interface AddBasketItemPayload {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

// ─── API çağrıları ────────────────────────────────────────────────────

async function getMyBasket(): Promise<RawBasket> {
  const request = api.get<BaseResponse<RawBasket>>(ENDPOINTS.basket.me);
  return unwrap(request);
}

async function addItem(item: AddBasketItemPayload): Promise<RawBasket> {
  const request = api.post<BaseResponse<RawBasket>>(ENDPOINTS.basket.add, item);
  return unwrap(request);
}

async function updateItem(productId: string, quantity: number): Promise<RawBasket> {
  const request = api.put<BaseResponse<RawBasket>>(ENDPOINTS.basket.update, { productId, quantity });
  return unwrap(request);
}

async function removeItem(productId: string): Promise<RawBasket> {
  const request = api.delete<BaseResponse<RawBasket>>(ENDPOINTS.basket.remove(productId));
  return unwrap(request);
}

async function clearBasket(): Promise<void> {
  const request = api.delete<BaseResponse<void>>(ENDPOINTS.basket.clear);
  await unwrap(request);
}

/**
 * Local zustand sepetini backend basket-service ile senkron hale getirir.
 * Önce backend sepetini siler, sonra her satırı tek tek POST eder.
 * Checkout başlamadan hemen önce çağrılır.
 */
async function syncFromLocal(lines: CartLine[]): Promise<void> {
  await clearBasket();
  for (const line of lines) {
    await addItem({
      productId: line.productId,
      productName: line.name,
      quantity: line.quantity,
      unitPrice: line.price,
    });
  }
}

export const basketApi = {
  me: getMyBasket,
  add: addItem,
  update: updateItem,
  remove: removeItem,
  clear: clearBasket,
  syncFromLocal,
};
