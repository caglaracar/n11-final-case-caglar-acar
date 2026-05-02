'use client';

import { use, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Minus, Plus, ShieldCheck, ShoppingCart, Truck, Zap } from 'lucide-react';
import { toast } from 'sonner';

import { productApi } from '@/features/products/api/productApi';
import { useCartStore } from '@/features/cart/store';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/utils';
import { MAX_PAYMENT_AMOUNT, MAX_PAYMENT_AMOUNT_MESSAGE } from '@/shared/lib/payment';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const add = useCartStore((s) => s.add);

  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.detail(id),
  });

  const discount = useMemo(() => {
    if (!product?.oldPrice || product.oldPrice <= product.price) return 0;
    return Math.round((1 - product.price / product.oldPrice) * 100);
  }, [product]);

  if (isLoading) {
    return <div className="container py-20 text-center text-muted-foreground">Yükleniyor…</div>;
  }
  if (!product) {
    return <div className="container py-20 text-center text-muted-foreground">Ürün bulunamadı.</div>;
  }

  const lineTotal = product.price * quantity;
  const exceedsMaxAmount = lineTotal >= MAX_PAYMENT_AMOUNT;
  const outOfStock = product.stock <= 0;
  const maxQuantity = Math.max(1, product.stock);

  const handleAddToCart = (): boolean => {
    if (exceedsMaxAmount) {
      toast.error(MAX_PAYMENT_AMOUNT_MESSAGE);
      return false;
    }
    add(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        thumbnail: product.thumbnail,
      },
      quantity,
    );
    toast.success(quantity === 1 ? 'Sepete eklendi' : `${quantity} adet sepete eklendi`);
    return true;
  };

  const handleBuyNow = () => {
    if (handleAddToCart()) {
      router.push('/checkout');
    }
  };

  return (
    <div className="container py-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* Left: image */}
        <div className="mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-2xl border bg-muted">
          {product.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.thumbnail}
              alt={product.name}
              className="h-full w-full object-contain p-6"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-sm text-muted-foreground">
              Görsel yok
            </div>
          )}
        </div>

        {/* Right: info + actions */}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            {product.brandName && <span className="font-semibold text-foreground">{product.brandName}</span>}
            {product.brandName && product.categoryName && <span>·</span>}
            {product.categoryName && <span>{product.categoryName}</span>}
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">{product.name}</h1>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-4xl font-semibold text-brand-600">{formatCurrency(product.price)}</span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-lg text-muted-foreground line-through">
                {formatCurrency(product.oldPrice)}
              </span>
            )}
            {discount > 0 && (
              <Badge variant="sale" className="ml-1">
                -%{discount}
              </Badge>
            )}
          </div>

          <div className="mt-3">
            <Badge variant={outOfStock ? 'secondary' : 'default'}>
              {outOfStock ? 'Stokta yok' : `Stokta · ${product.stock} adet`}
            </Badge>
          </div>

          {product.description && (
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          )}

          {/* quantity */}
          <div className="mt-8 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Adet</span>
            <div className="inline-flex items-center rounded-lg border">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                disabled={outOfStock || quantity <= 1}
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-sm font-medium tabular-nums">{quantity}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                disabled={outOfStock || quantity >= maxQuantity}
                onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <span className="ml-auto text-sm text-muted-foreground">
              Ara toplam: <strong className="text-foreground">{formatCurrency(lineTotal)}</strong>
            </span>
          </div>

          {exceedsMaxAmount && (
            <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
              {MAX_PAYMENT_AMOUNT_MESSAGE}
            </p>
          )}

          {/* CTA */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button
              size="lg"
              variant="outline"
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="w-full"
            >
              <ShoppingCart className="h-4 w-4" /> Sepete ekle
            </Button>
            <Button
              size="lg"
              onClick={handleBuyNow}
              disabled={outOfStock || exceedsMaxAmount}
              className="w-full"
            >
              <Zap className="h-4 w-4" /> Hemen al
            </Button>
          </div>

          {/* trust badges */}
          <Card className="mt-8">
            <CardContent className="grid gap-3 p-4 text-xs text-muted-foreground sm:grid-cols-3">
              <Highlight icon={Truck} title="Ücretsiz kargo" desc="500 ₺ üzeri siparişlerde" />
              <Highlight icon={ShieldCheck} title="Güvenli ödeme" desc="iyzico altyapısı" />
              <Highlight icon={Zap} title="Hızlı kargo" desc="Aynı gün gönderim" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Highlight({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 text-brand-600" />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p>{desc}</p>
      </div>
    </div>
  );
}
