export interface BasketItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

/** Backend basket-service'den dönen ham sepet. */
export interface RawBasket {
  authId: number;
  items: BasketItem[] | null;
  total: number;
  updatedAt: number;
}

export interface AddBasketItemPayload {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}
