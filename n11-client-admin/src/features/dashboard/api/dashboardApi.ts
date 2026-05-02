import type { Order, OrderStatus } from '@/features/orders/types/orders-types';
import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';

export interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<OrderStatus, number>;
  revenueByMonth: { month: string; revenue: number }[];
  recentOrders: Order[];
}

export const dashboardApi = {
  stats: () => unwrap<AdminStats>(api.get<BaseResponse<AdminStats>>(ENDPOINTS.order.stats)),
};
