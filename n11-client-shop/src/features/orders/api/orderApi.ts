import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type { CheckoutResponse, Order, PaymentRecord } from '@/features/orders/types';

// ─── Types ────────────────────────────────────────────────────────────

export interface CheckoutPayload {
  addressId: string;
  clientIp?: string;
}

// ─── Order API ────────────────────────────────────────────────────────

async function checkout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  const request = api.post<BaseResponse<CheckoutResponse>>(ENDPOINTS.order.checkout, payload);
  return unwrap(request);
}

async function myOrders(): Promise<Order[]> {
  const request = api.get<BaseResponse<Order[]>>(ENDPOINTS.order.me);
  return unwrap(request);
}

async function getOrderById(id: number | string): Promise<Order> {
  const request = api.get<BaseResponse<Order>>(ENDPOINTS.order.byId(id));
  return unwrap(request);
}

async function cancelOrder(id: number | string): Promise<Order> {
  const request = api.post<BaseResponse<Order>>(ENDPOINTS.order.cancel(id));
  return unwrap(request);
}

export const orderApi = {
  checkout,
  myOrders,
  byId: getOrderById,
  cancel: cancelOrder,
};

// ─── Payment API ──────────────────────────────────────────────────────

async function getPaymentByOrderId(orderId: number | string): Promise<PaymentRecord> {
  const request = api.get<BaseResponse<PaymentRecord>>(ENDPOINTS.payment.byOrderId(orderId));
  return unwrap(request);
}

export const paymentApi = {
  byOrderId: getPaymentByOrderId,
};
