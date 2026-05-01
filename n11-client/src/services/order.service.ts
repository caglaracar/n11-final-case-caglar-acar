import { http } from "./http";
import type { CreateOrderRequest, Order, Page } from "@/types/api";

export const orderService = {
  create: (body: CreateOrderRequest) => http.post<Order>("/order/create", body),
  findById: (id: number) => http.get<Order>(`/order/find-by-id/${id}`),
  mine: (page = 0, size = 10) =>
    http.get<Page<Order>>("/order/me", { query: { page, size } }),
  cancel: (id: number) => http.post<Order>(`/order/cancel/${id}`),
  /** Public — yalnızca order id ile sorgu. */
  track: (orderId: number) =>
    http.get<Order>("/order/track", { query: { orderId }, auth: false }),
  /** Public — müşteri teslim onayı, email'deki linkten çağrılır. */
  confirmDelivery: (orderId: number, token: string) =>
    http.get<Order>("/order/confirm-delivery", { query: { orderId, token }, auth: false }),
};
