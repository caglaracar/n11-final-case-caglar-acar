'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';

import { getMyOrders } from '@/features/orders/api/orderApi';
import { Button } from '@/shared/components/ui/button';
import { formatCurrency } from '@/shared/lib/utils';
import type { Order, OrderStatus } from '@/features/orders/types/orders-types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING:   'Ödeme bekleniyor',
  PAID:      'Ödendi',
  SHIPPED:   'Kargoya verildi',
  DELIVERED: 'Teslim edildi',
  CANCELLED: 'İptal edildi',
  FAILED:    'Başarısız',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING:   'bg-amber-100 text-amber-700',
  PAID:      'bg-emerald-100 text-emerald-700',
  SHIPPED:   'bg-sky-100 text-sky-700',
  DELIVERED: 'bg-teal-100 text-teal-700',
  CANCELLED: 'bg-zinc-200 text-zinc-600',
  FAILED:    'bg-rose-100 text-rose-700',
};

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'me'],
    queryFn: getMyOrders,
  });

  if (isLoading) {
    return <div className="container py-20 text-center text-muted-foreground">Siparişler yükleniyor…</div>;
  }

  const orders = data ?? [];
  if (orders.length === 0) {
    return (
      <div className="container py-20 text-center">
        <Package className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Henüz siparişin yok</h1>
        <Button asChild className="mt-6">
          <Link href="/products">Alışverişe başla</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Siparişlerim</h1>
      <ul className="space-y-4">
        {orders.map((order) => <OrderRow key={order.id} order={order} />)}
      </ul>
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const date = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })
    .format(new Date(order.createdAt));

  return (
    <li className="rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold">Sipariş #{order.id}</span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Ürünler */}
      <ul className="divide-y px-5">
        {order.items.map((item) => (
          <li key={item.productId} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <Link
                href={`/products/${item.productId}`}
                className="line-clamp-1 text-sm font-medium hover:text-brand-600"
              >
                {item.productName}
              </Link>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.quantity} adet · {formatCurrency(item.unitPrice, order.currency)} / adet
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold">
              {formatCurrency(item.unitPrice * item.quantity, order.currency)}
            </span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-5 py-3">
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>{order.shippingCity}</span>
          {order.shippingAddress && (
            <span className="hidden max-w-xs truncate sm:block">{order.shippingAddress}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-base font-bold">
            Toplam: {formatCurrency(order.totalAmount, order.currency)}
          </span>
          <Button asChild variant="outline" size="sm">
            <Link href={`/orders/${order.id}/result`}>Detay</Link>
          </Button>
        </div>
      </div>
    </li>
  );
}
