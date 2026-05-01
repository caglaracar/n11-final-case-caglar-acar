import { http } from "./http";
import type { AdminStats, Order, OrderStatus, Page } from "@/types/api";

export const adminService = {
  stats: () => http.get<AdminStats>("/admin/stats"),
  orders: (status?: OrderStatus, page = 0, size = 20) =>
    http.get<Page<Order>>("/admin/orders", { query: { status, page, size } }),
  updateOrderStatus: (id: number, status: OrderStatus) =>
    http.post<Order>(`/admin/orders/${id}/status`, undefined, { query: { status } }),
};
