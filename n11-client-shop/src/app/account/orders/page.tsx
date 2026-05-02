'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';

import { getMyOrders } from '@/features/orders/api/orderApi';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/utils';
import type { Order, OrderStatus } from '@/features/orders/types/orders-types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Ödeme bekleniyor',
  PAID: 'Ödendi',
  SHIPPED: 'Kargoya verildi',
  DELIVERED: 'Teslim edildi',
  CANCELLED: 'İptal edildi',
  FAILED: 'Başarısız',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  SHIPPED: 'bg-sky-100 text-sky-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-zinc-200 text-zinc-700',
  FAILED: 'bg-rose-100 text-rose-700',
};

export default function OrdersPage() {
  const ordersQuery = useQuery({
    queryKey: ['orders', 'me'],
    queryFn: getMyOrders,
  });

  if (ordersQuery.isLoading) {
    return <div className="container py-20 text-center text-muted-foreground">Siparişler yükleniyor…</div>;
  }

  const orders = ordersQuery.data ?? [];
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
      <h1 className="text-3xl font-bold tracking-tight">Siparişlerim</h1>
      <ul className="mt-8 space-y-4">
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </ul>
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  return (
    <li>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Sipariş #{order.id}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })
                .format(new Date(order.createdAt))}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {order.items.length} ürün · {order.shippingCity}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold">{formatCurrency(order.totalAmount, order.currency)}</span>
            <Button asChild variant="outline" size="sm">
              <Link href={`/orders/${order.id}/result`}>Detay</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </li>
  );
}
