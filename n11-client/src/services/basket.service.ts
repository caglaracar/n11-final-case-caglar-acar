import { http } from "./http";
import type { Basket, BasketItem } from "@/types/api";

const enc = encodeURIComponent;

export const basketService = {
  get: () => http.get<Basket>("/basket"),
  add: (body: BasketItem) => http.post<Basket>("/basket/add", body),
  update: (productId: string, quantity: number) =>
    http.put<Basket>("/basket/update", { productId, quantity }),
  remove: (productId: string) => http.delete<Basket>(`/basket/remove/${enc(productId)}`),
  clear: () => http.delete<void>("/basket/clear"),
};
