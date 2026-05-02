'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';

import { orderApi, paymentApi } from '@/features/orders/api/orderApi';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/utils';
import type { Order, PaymentStatus } from '@/features/orders/types';

export default function OrderResultPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;

  const orderQuery = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.byId(orderId!),
    enabled: !!orderId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PENDING' ? 2_000 : false;
    },
  });

  const paymentQuery = useQuery({
    queryKey: ['payment', orderId],
    queryFn: () => paymentApi.byOrderId(orderId!),
    enabled: !!orderId,
    retry: false,
  });

  if (!orderId || orderQuery.isLoading) {
    return (
      <div className="container py-20 text-center text-muted-foreground">
        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
        <p className="mt-4">Sipariş bilgisi yükleniyor…</p>
      </div>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="container py-20 text-center">
        <XCircle className="mx-auto h-10 w-10 text-rose-600" />
        <h1 className="mt-4 text-2xl font-bold">Sipariş bulunamadı</h1>
        <Button asChild className="mt-6">
          <Link href="/account/orders">Siparişlerim</Link>
        </Button>
      </div>
    );
  }

  const order = orderQuery.data;
  const paymentStatus: PaymentStatus | undefined = paymentQuery.data?.status;

  const variant = resolveVariant(order.status, paymentStatus);

  return (
    <div className="container py-10 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          {variant.icon}
          <CardTitle className="mt-4 text-2xl">{variant.title}</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">{variant.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/30 p-4 text-sm">
            <div>
              <p className="text-muted-foreground">Sipariş No</p>
              <p className="font-medium">#{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Toplam</p>
              <p className="font-semibold">{formatCurrency(order.totalAmount, order.currency)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Teslimat</p>
              <p>{order.shippingAddress}</p>
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold">Ürünler</h2>
            <ul className="divide-y rounded-lg border text-sm">
              {order.items.map((item) => (
                <li key={item.productId} className="flex justify-between p-3">
                  <span className="line-clamp-1 pr-2">
                    {item.productName} <span className="text-muted-foreground">× {item.quantity}</span>
                  </span>
                  <span>{formatCurrency(item.unitPrice * item.quantity, order.currency)}</span>
                </li>
              ))}
            </ul>
          </div>

          {paymentQuery.data?.failReason && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <strong>iyzico hatası:</strong> {paymentQuery.data.failReason}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="flex-1">
              <Link href="/account/orders">Siparişlerim</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/products">Alışverişe devam et</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function resolveVariant(orderStatus: Order['status'], paymentStatus?: PaymentStatus) {
  if (orderStatus === 'PAID' || orderStatus === 'SHIPPED' || orderStatus === 'DELIVERED'
      || paymentStatus === 'SUCCESS') {
    return {
      icon: <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />,
      title: 'Ödemen başarıyla alındı',
      subtitle: 'Siparişin hazırlanmaya başladı; sipariş geçmişinden takip edebilirsin.',
    };
  }
  if (orderStatus === 'FAILED' || paymentStatus === 'FAILED') {
    return {
      icon: <XCircle className="mx-auto h-12 w-12 text-rose-600" />,
      title: 'Ödeme tamamlanamadı',
      subtitle: 'Kart bilgilerini kontrol edip tekrar deneyebilirsin.',
    };
  }
  if (orderStatus === 'CANCELLED') {
    return {
      icon: <XCircle className="mx-auto h-12 w-12 text-zinc-500" />,
      title: 'Sipariş iptal edildi',
      subtitle: 'Stok rezervasyonu serbest bırakıldı.',
    };
  }
  return {
    icon: <Clock className="mx-auto h-12 w-12 text-amber-500" />,
    title: 'Ödemen onaylanıyor',
    subtitle: 'iyzico\'dan dönüş bekleniyor; bu sayfa otomatik yenileniyor.',
  };
}
