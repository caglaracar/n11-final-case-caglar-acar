'use client';

import { useQuery } from '@tanstack/react-query';
import { TrendingDown } from 'lucide-react';
import { getPriceDropProducts } from '@/features/products/api/productApi';
import { ProductMiniCard } from '@/features/products/components/ProductMiniCard';
import { HorizontalScroller } from '@/shared/components/HorizontalScroller';
import { SectionHeader } from '@/shared/components/SectionHeader';

export function PriceDropsSection() {
  const { data } = useQuery({
    queryKey: ['products', 'price-drops'],
    queryFn: () => getPriceDropProducts(12).catch(() => []),
    staleTime: 2 * 60 * 1000,
  });

  if (!data || data.length === 0) return null;

  return (
    <section className="container py-10">
      <SectionHeader
        title="Fiyatı Düşenler"
        subtitle="Beklediğin ürünün fiyatı düştü"
        icon={<TrendingDown className="h-4 w-4" />}
        viewAllHref="/products?sort=price-drops"
      />
      <HorizontalScroller>
        {data.map((p) => (
          <ProductMiniCard key={p.id} product={p} variant="drop" />
        ))}
      </HorizontalScroller>
    </section>
  );
}
