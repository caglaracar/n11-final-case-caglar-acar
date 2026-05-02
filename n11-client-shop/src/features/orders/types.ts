export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'FAILED';

export interface OrderItem {
  productId: string;
  productName: string;
  category?: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: number;
  authId: number;
  customerEmail: string;
  customerName: string;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  shippingAddress: string;
  shippingCity: string;
  items: OrderItem[];
  createdAt: number;
  updatedAt: number;
}

export interface CheckoutResponse {
  orderId: number;
  paymentPageUrl: string;
  paymentToken: string;
}

export type PaymentStatus = 'INITIATED' | 'SUCCESS' | 'FAILED';

export interface PaymentRecord {
  id: number;
  orderId: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  iyzicoPaymentId: string | null;
  failReason: string | null;
  createdAt: number;
}
