'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, MapPin, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { useAuthStore } from '@/features/auth/store';
import { useCartStore } from '@/features/cart/store';
import { basketApi } from '@/features/cart/api/basketApi';
import { addressApi } from '@/features/addresses/api/addressApi';
import { orderApi } from '@/features/orders/api/orderApi';
import { extractErrorMessage } from '@/shared/lib/api/client';
import { MAX_PAYMENT_AMOUNT, MAX_PAYMENT_AMOUNT_MESSAGE } from '@/shared/lib/payment';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const tokens = useAuthStore((state) => state.tokens);
  const cartItems = useCartStore((state) => state.items);
  const cartTotal = useCartStore((state) => state.total());

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const addressesQuery = useQuery({
    queryKey: ['addresses'],
    queryFn: addressApi.list,
    enabled: !!tokens,
  });

  useEffect(() => {
    const list = addressesQuery.data;
    if (!list || selectedAddressId) return;
    const fallback = list.find((address) => address.isDefault) ?? list[0];
    if (fallback) setSelectedAddressId(fallback.id);
  }, [addressesQuery.data, selectedAddressId]);

  const checkoutMutation = useMutation({
    mutationFn: async (addressId: string) => {
      if (cartTotal >= MAX_PAYMENT_AMOUNT) {
        throw new Error(MAX_PAYMENT_AMOUNT_MESSAGE);
      }
      await basketApi.syncFromLocal(cartItems);
      return orderApi.checkout({ addressId });
    },
    onSuccess: (response) => {
      toast.success('Ödeme sayfasına yönlendiriliyorsun…');
      window.location.href = response.paymentPageUrl;
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Ödeme başlatılamadı')),
  });

  if (!tokens) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Önce giriş yapmalısın</h1>
        <p className="mt-2 text-muted-foreground">Ödemeye geçmek için hesabına giriş yap.</p>
        <Button asChild className="mt-6">
          <Link href="/auth?tab=login">Giriş yap</Link>
        </Button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Sepetin boş</h1>
        <Button asChild className="mt-6">
          <Link href="/products">Ürünleri keşfet</Link>
        </Button>
      </div>
    );
  }

  const addresses = addressesQuery.data ?? [];
  const isProcessing = checkoutMutation.isPending;
  const exceedsMaxAmount = cartTotal >= MAX_PAYMENT_AMOUNT;

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight">Ödeme</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand-600" /> Teslimat adresi
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/account/addresses?from=checkout">Adresleri yönet</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {addressesQuery.isLoading && (
              <p className="text-sm text-muted-foreground">Adresler yükleniyor…</p>
            )}
            {!addressesQuery.isLoading && addresses.length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Kayıtlı adresin yok. Ödemeye geçmek için önce bir teslimat adresi ekle.
                <div className="mt-4">
                  <Button asChild>
                    <Link href="/account/addresses?from=checkout">Adres ekle</Link>
                  </Button>
                </div>
              </div>
            )}
            <ul className="grid gap-3">
              {addresses.map((address) => {
                const isSelected = address.id === selectedAddressId;
                return (
                  <li key={address.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedAddressId(address.id)}
                      className={`w-full rounded-lg border p-4 text-left transition ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-600'
                          : 'hover:border-foreground/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{address.title}</span>
                        {address.isDefault && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                            Varsayılan
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {address.fullName} · {address.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ''}, {address.city}
                        {address.state ? `/${address.state}` : ''}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Sipariş özeti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {cartItems.map((line) => (
                <li key={line.productId} className="flex justify-between">
                  <span className="line-clamp-1 pr-2 text-muted-foreground">
                    {line.name} <span className="text-xs">× {line.quantity}</span>
                  </span>
                  <span>{formatCurrency(line.price * line.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Kargo</span>
              <span>Ödemede hesaplanır</span>
            </div>
            <div className="flex justify-between border-t pt-4 text-lg font-semibold">
              <span>Toplam</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            {exceedsMaxAmount && (
              <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
                {MAX_PAYMENT_AMOUNT_MESSAGE}
              </p>
            )}
            <Button
              size="lg"
              className="w-full"
              disabled={!selectedAddressId || isProcessing || exceedsMaxAmount}
              onClick={() => selectedAddressId && checkoutMutation.mutate(selectedAddressId)}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> İşleniyor…
                </>
              ) : (
                'Ödemeye geç'
              )}
            </Button>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Ödeme iyzico üzerinden güvenli olarak alınır.
            </p>
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200">
              <p className="font-semibold">Bootcamp değerlendirme · iyzico test kartı</p>
              <ul className="mt-1.5 space-y-0.5 font-mono text-[11px]">
                <li>Kart no: <strong>5528 7900 0000 0008</strong></li>
                <li>SKT: <strong>12/30</strong> · CVC: <strong>123</strong></li>
                <li>3D-Secure SMS kodu: <strong>283126</strong></li>
              </ul>
              <p className="mt-1.5 leading-snug">Gerçek ödeme alınmaz; iyzico sandbox üzerinden simüle edilir.</p>
            </div>
            <Button variant="ghost" className="w-full" onClick={() => router.push('/cart')}>
              Sepete dön
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
