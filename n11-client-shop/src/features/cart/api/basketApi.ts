import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type {
  AddBasketItemPayload,
  RawBasket,
} from '@/features/cart/types/cart-types';

export async function getMyBasket(): Promise<RawBasket> {
  return unwrap(api.get<BaseResponse<RawBasket>>(ENDPOINTS.basket.me));
}

export async function addBasketItem(payload: AddBasketItemPayload): Promise<RawBasket> {
  return unwrap(api.post<BaseResponse<RawBasket>>(ENDPOINTS.basket.add, payload));
}

export async function updateBasketItem(productId: string, quantity: number): Promise<RawBasket> {
  return unwrap(
    api.put<BaseResponse<RawBasket>>(ENDPOINTS.basket.update, { productId, quantity }),
  );
}

export async function removeBasketItem(productId: string): Promise<RawBasket> {
  return unwrap(api.delete<BaseResponse<RawBasket>>(ENDPOINTS.basket.remove(productId)));
}

export async function clearBasket(): Promise<void> {
  await unwrap(api.delete<BaseResponse<void>>(ENDPOINTS.basket.clear));
}
