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

function TimeUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="min-w-[2.2rem] rounded-lg bg-white/20 px-2 py-1 text-center text-lg font-bold tabular-nums leading-none text-white backdrop-blur-sm">
        {value}
      </span>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/70">
        {label}
      </span>
    </div>
  );
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
    const stamps = (data as Array<{ flashDealEndsAt?: string | null }>)
      .map((p) => (p.flashDealEndsAt ? new Date(p.flashDealEndsAt).getTime() : NaN))
      .filter((n) => !Number.isNaN(n) && n > now);
    return stamps.length > 0 ? Math.min(...stamps) : null;
  }, [data, now]);

  if (!data || data.length === 0) return null;

  const time = earliestEnd != null ? diffParts(earliestEnd - now) : null;

  return (
    <section className="container py-10">
      <div className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Zap className="h-6 w-6 fill-white text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white md:text-2xl">
                Flash Fırsatlar
              </h2>
              <p className="text-sm font-medium text-white/80">
                Sınırlı süre, sınırlı stok
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {time && (
              <div className="flex items-end gap-2">
                <TimeUnit value={pad(time.h)} label="saat" />
                <span className="mb-4 text-lg font-bold text-white/60">:</span>
                <TimeUnit value={pad(time.m)} label="dakika" />
                <span className="mb-4 text-lg font-bold text-white/60">:</span>
                <TimeUnit value={pad(time.s)} label="saniye" />
              </div>
            )}
            <Link
              href="/products?deals=1"
              className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-bold text-orange-600 shadow-sm transition-opacity hover:opacity-90"
            >
              Tümünü gör →
            </Link>
          </div>
        </div>
      </div>

      <HorizontalScroller>
        {data.map((p) => (
          <ProductMiniCard key={p.id} product={p} variant="deal" />
        ))}
      </HorizontalScroller>
    </section>
  );
}
