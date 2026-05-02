import { api, unwrap, type BaseResponse, type Page } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type { Order, OrderStatus } from '@/features/orders/types';

export interface OrderListParams {
  page?: number;
  size?: number;
  status?: OrderStatus;
}

export const orderApi = {
  list: (params: OrderListParams = {}) =>
    unwrap<Page<Order>>(
      api.get<BaseResponse<Page<Order>>>(ENDPOINTS.order.adminAll, { params }),
    ),
  updateStatus: (id: string, status: OrderStatus) =>
    unwrap<Order>(
      api.post<BaseResponse<Order>>(
        ENDPOINTS.order.adminUpdateStatus(id),
        undefined,
        { params: { status } },
      ),
    ),
};
