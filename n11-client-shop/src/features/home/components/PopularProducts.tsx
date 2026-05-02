'use client';

import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { getPopularProducts } from '@/features/products/api/productApi';
import { ProductMiniCard } from '@/features/products/components/ProductMiniCard';
import { HorizontalScroller } from '@/shared/components/HorizontalScroller';
import { SectionHeader } from '@/shared/components/SectionHeader';

export function PopularProducts() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', 'popular'],
    queryFn: () => getPopularProducts(12),
  });

  return (
    <section className="container py-10">
      <SectionHeader
        title="Öne çıkan ürünler"
        subtitle="Bugün en çok tercih edilenler"
        icon={<Sparkles className="h-4 w-4" />}
        viewAllHref="/products"
      />

      {isLoading && (
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] w-[160px] shrink-0 animate-pulse rounded-xl bg-muted md:w-[180px]" />
          ))}
        </div>
      )}

      {isError && (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Ürünler yüklenemedi. Backend gateway&apos;in çalıştığından emin ol.
        </p>
      )}

      {data && data.length > 0 && (
        <HorizontalScroller>
          {data.map((p) => (
            <ProductMiniCard key={p.id} product={p} />
          ))}
        </HorizontalScroller>
      )}
    </section>
  );
}
