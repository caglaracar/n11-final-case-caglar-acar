'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Zap } from 'lucide-react';
import { getFlashDealProducts } from '@/features/products/api/productApi';
import { ProductMiniCard } from '@/features/products/components/ProductMiniCard';
import { HorizontalScroller } from '@/shared/components/HorizontalScroller';

const pad = (n: number) => String(n).padStart(2, '0');

function diffParts(ms: number) {
  if (ms <= 0) return { h: 0, m: 0, s: 0 };
  const total = Math.floor(ms / 1000);
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

export function FlashDealsSection() {
  const { data } = useQuery({
    queryKey: ['products', 'flash-deals'],
    queryFn: () => getFlashDealProducts().catch(() => []),
    staleTime: 60 * 1000,
  });

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const earliestEnd = useMemo(() => {
    if (!data) return null;
    const stamps = data
      .map((p) => (p.flashDealEndsAt ? new Date(p.flashDealEndsAt).getTime() : NaN))
      .filter((n) => !Number.isNaN(n) && n > now);
    return stamps.length > 0 ? Math.min(...stamps) : null;
  }, [data, now]);

  if (!data || data.length === 0) return null;

  const time = earliestEnd != null ? diffParts(earliestEnd - now) : null;

  return (
    <section className="container py-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-sm">
            <Zap className="h-5 w-5 fill-current" />
          </span>
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 truncate text-xl font-bold tracking-tight md:text-2xl">
              Flash Fırsatlar
              {time && (
                <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600 ring-1 ring-orange-200">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
                  Bitiyor
                </span>
              )}
            </h2>
            {time && (
              <div className="mt-1 flex items-center gap-1">
                {[
                  { label: 'sa', v: pad(time.h) },
                  { label: 'dk', v: pad(time.m) },
                  { label: 'sn', v: pad(time.s) },
                ].map((u, i) => (
                  <span key={u.label} className="flex items-center gap-1">
                    <span className="rounded-md bg-ink-700 px-2 py-0.5 text-sm font-bold tabular-nums text-white shadow-sm">
                      {u.v}
                    </span>
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                      {u.label}
                    </span>
                    {i < 2 && <span className="px-0.5 text-sm font-bold text-ink-400">:</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <Link
          href="/products?deals=1"
          className="shrink-0 whitespace-nowrap text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
        >
          Tümünü gör →
        </Link>
      </div>

      <HorizontalScroller>
        {data.map((p) => (
          <ProductMiniCard key={p.id} product={p} variant="deal" />
        ))}
      </HorizontalScroller>
    </section>
  );
}
