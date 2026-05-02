import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type {
  CheckoutPayload,
  CheckoutResponse,
  Order,
  PaymentRecord,
} from '@/features/orders/types/orders-types';

export async function checkoutOrder(payload: CheckoutPayload): Promise<CheckoutResponse> {
  return unwrap(api.post<BaseResponse<CheckoutResponse>>(ENDPOINTS.order.checkout, payload));
}

export async function getMyOrders(): Promise<Order[]> {
  return unwrap(api.get<BaseResponse<Order[]>>(ENDPOINTS.order.me));
}

export async function getOrderById(orderId: number | string): Promise<Order> {
  return unwrap(api.get<BaseResponse<Order>>(ENDPOINTS.order.byId(orderId)));
}

export async function cancelOrder(orderId: number | string): Promise<Order> {
  return unwrap(api.post<BaseResponse<Order>>(ENDPOINTS.order.cancel(orderId)));
}

export async function getPaymentByOrderId(orderId: number | string): Promise<PaymentRecord> {
  return unwrap(api.get<BaseResponse<PaymentRecord>>(ENDPOINTS.payment.byOrderId(orderId)));
}
