'use client';

import Link from 'next/link';
import { AlertTriangle, Minus, Plus, RotateCcw, Scissors, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/features/cart/store';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/utils';
import { MAX_PAYMENT_AMOUNT, MAX_PAYMENT_AMOUNT_MESSAGE } from '@/shared/lib/payment';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const total = useCartStore((s) => s.total());
  const saved = useCartStore((s) => s.saved);
  const autoSplit = useCartStore((s) => s.autoSplit);
  const restoreSaved = useCartStore((s) => s.restoreSaved);
  const removeSaved = useCartStore((s) => s.removeSaved);
  const exceedsMaxAmount = total >= MAX_PAYMENT_AMOUNT;

  const handleAutoSplit = async () => {
    const moved = await autoSplit();
    if (moved > 0) {
      toast.success(`${moved} adet ürün bir sonraki siparişe ayrıldı`);
    }
  };

  if (items.length === 0 && saved.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Sepetin boş</h1>
        <p className="mt-2 text-muted-foreground">Alışverişe başlamak için ürünlere göz at.</p>
        <Button asChild className="mt-6"><Link href="/products">Ürünleri keşfet</Link></Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight">Sepetim</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {items.length > 0 ? (
            <ul className="space-y-3">
              {items.map((line) => (
                <li key={line.productId}>
                  <Card>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {line.thumbnail && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={line.thumbnail} alt={line.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${line.productId}`} className="line-clamp-2 text-sm font-medium hover:text-brand-600">
                          {line.name}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(line.price)}</p>
                      </div>
                      <div className="flex items-center gap-1 rounded-md border">
                        <Button variant="ghost" size="icon" onClick={() => setQty(line.productId, line.quantity - 1)}>
                          <Minus />
                        </Button>
                        <span className="w-8 text-center text-sm">{line.quantity}</span>
                        <Button variant="ghost" size="icon" onClick={() => setQty(line.productId, line.quantity + 1)}>
                          <Plus />
                        </Button>
                      </div>
                      <span className="w-24 text-right font-semibold">{formatCurrency(line.price * line.quantity)}</span>
                      <Button variant="ghost" size="icon" onClick={() => remove(line.productId)} aria-label="Kaldır">
                        <Trash2 className="text-destructive" />
                      </Button>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Sepetin şu an boş — aşağıdan ayrılan ürünleri geri alabilir veya yeni ürün ekleyebilirsin.
              </CardContent>
            </Card>
          )}

          {saved.length > 0 && (
            <section className="space-y-3">
              <header className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">Bir sonraki siparişe ayrılanlar</h2>
                <span className="text-xs text-muted-foreground">{saved.length} kalem</span>
              </header>
              <ul className="space-y-3">
                {saved.map((line) => (
                  <li key={line.productId}>
                    <Card className="border-dashed bg-muted/20">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {line.thumbnail && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={line.thumbnail} alt={line.name} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${line.productId}`} className="line-clamp-2 text-sm font-medium hover:text-brand-600">
                            {line.name}
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatCurrency(line.price)} · {line.quantity} adet
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => restoreSaved(line.productId, line.quantity)}>
                          <RotateCcw className="mr-1 h-3.5 w-3.5" /> Sepete al
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => removeSaved(line.productId)} aria-label="Kaldır">
                          <Trash2 className="text-destructive" />
                        </Button>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <Card className="h-fit">
          <CardContent className="space-y-4 p-6">
            <div className="flex justify-between text-sm"><span>Ara toplam</span><span>{formatCurrency(total)}</span></div>
            <div className="flex justify-between text-sm text-muted-foreground"><span>Kargo</span><span>Ödemede hesaplanır</span></div>
            <div className="border-t pt-4 flex justify-between text-lg font-semibold"><span>Toplam</span><span>{formatCurrency(total)}</span></div>
            {exceedsMaxAmount && (
              <div className="space-y-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{MAX_PAYMENT_AMOUNT_MESSAGE}</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleAutoSplit}
                >
                  <Scissors className="mr-1 h-3.5 w-3.5" /> Sepeti otomatik böl
                </Button>
                <p className="text-[11px] leading-snug text-destructive/80">
                  Pahalı kalemler bir sonraki siparişe ayrılır; ödeme tamamlandıktan sonra geri alabilirsin.
                </p>
              </div>
            )}
            <Button asChild size="lg" className="w-full" disabled={exceedsMaxAmount || items.length === 0}>
              <Link
                href={exceedsMaxAmount || items.length === 0 ? '#' : '/checkout'}
                aria-disabled={exceedsMaxAmount || items.length === 0}
              >
                Ödemeye geç
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
