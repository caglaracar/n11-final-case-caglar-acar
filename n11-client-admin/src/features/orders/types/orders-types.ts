export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  authId?: number;
  customerEmail?: string;
  customerName?: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  shippingAddress?: string;
  shippingCity?: string;
  items: OrderItem[];
  createdAt?: number;
  updatedAt?: number;
}

export const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'PAID',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'FAILED',
];
