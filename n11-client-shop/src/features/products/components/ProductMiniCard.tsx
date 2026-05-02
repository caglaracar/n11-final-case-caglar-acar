'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { useCartStore } from '@/features/cart/store';
import { formatCurrency } from '@/shared/lib/utils';
import type { Product } from '@/features/products/types';

interface Props {
  product: Product;
  /** "deal" → kırmızı indirim rozeti; "drop" → pasif fiyat düştü rozeti. */
  variant?: 'deal' | 'drop';
}

/**
 * Kompakt yatay-kayan listelerde kullanılan ürün kartı (flash & price-drops).
 * Resim + isim alanı linktir; alt kısımda sepete ekle butonu vardır.
 */
export function ProductMiniCard({ product, variant = 'deal' }: Props) {
  const add = useCartStore((s) => s.add);
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : 0;

  const handleAdd = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      thumbnail: product.thumbnail,
    });
    toast.success('Sepete eklendi');
  };

  return (
    <div className="group flex w-[160px] shrink-0 flex-col overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm md:w-[180px]">
      <Link href={`/products/${product.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {discount > 0 && (
            <Badge
              variant={variant === 'deal' ? 'sale' : 'secondary'}
              className="absolute left-2 top-2 z-10"
            >
              -%{discount}
            </Badge>
          )}
          {product.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.thumbnail}
              alt={product.name}
              className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
              Görsel yok
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-3">
          <p className="line-clamp-2 min-h-[2.25rem] text-xs font-medium leading-tight text-foreground">
            {product.name}
          </p>
          <div className="mt-2 flex items-end gap-1.5">
            <span className="text-base font-bold text-brand-600">
              {formatCurrency(product.price)}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="mb-0.5 text-xs text-muted-foreground line-through">
                {formatCurrency(product.oldPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="border-t p-2">
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs"
          onClick={handleAdd}
          disabled={product.stock <= 0}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {product.stock <= 0 ? 'Stokta yok' : 'Sepete ekle'}
        </Button>
      </div>
    </div>
  );
}
