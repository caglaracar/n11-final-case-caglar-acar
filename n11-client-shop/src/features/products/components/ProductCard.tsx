'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { useCartStore } from '@/features/cart/store';
import { formatCurrency } from '@/shared/lib/utils';
import { toast } from 'sonner';
import type { Product } from '@/features/products/types';

export function ProductCard({ product }: { product: Product }) {
  const add = useCartStore((s) => s.add);
  const discount = product.oldPrice && product.oldPrice > product.price
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  const handleAdd = () => {
    add({ productId: product.id, name: product.name, price: product.price, thumbnail: product.thumbnail });
    toast.success('Sepete eklendi');
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.thumbnail}
              alt={product.name}
              className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">Görsel yok</div>
          )}
          {discount > 0 && (
            <Badge variant="sale" className="absolute left-2 top-2 text-[10px]">
              %{discount} indirim
            </Badge>
          )}
        </div>
      </Link>
      <div className="p-3">
        {product.brandName && (
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{product.brandName}</p>
        )}
        <Link href={`/products/${product.id}`}>
          <h3 className="mt-0.5 line-clamp-2 min-h-[2.25rem] text-xs font-medium leading-tight hover:text-brand-600">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-base font-bold text-brand-600">{formatCurrency(product.price)}</span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">{formatCurrency(product.oldPrice)}</span>
          )}
        </div>
        <Button size="sm" className="mt-2.5 w-full text-xs" onClick={handleAdd} disabled={product.stock <= 0}>
          <ShoppingCart className="h-3.5 w-3.5" />
          {product.stock <= 0 ? 'Stokta yok' : 'Sepete ekle'}
        </Button>
      </div>
    </Card>
  );
}
