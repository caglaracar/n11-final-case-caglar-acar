'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Filter, X } from 'lucide-react';
import { productApi } from '@/features/products/api/productApi';
import { categoryApi } from '@/features/categories/api/categoryApi';
import { brandApi } from '@/features/brands/api/brandApi';
import { ProductCard } from '@/features/products/components/ProductCard';
import { cn } from '@/shared/lib/utils';

const PAGE_SIZE = 24;

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageInner />
    </Suspense>
  );
}

function ProductsPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get('q') ?? undefined;
  const categoryParam = params.get('category') ?? undefined;
  const brandParam = params.get('brand') ?? undefined;

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.findAll().catch(() => []),
    staleTime: 5 * 60 * 1000,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandApi.findAll().catch(() => []),
    staleTime: 5 * 60 * 1000,
  });

  // Resolve slug/name → id (backend filtre id ile çalışıyor)
  const categoryId = useMemo(() => {
    if (!categoryParam) return undefined;
    const lower = categoryParam.toLowerCase();
    return categories.find(
      (c) =>
        c.id === categoryParam ||
        c.slug?.toLowerCase() === lower ||
        c.name.toLowerCase() === lower,
    )?.id;
  }, [categoryParam, categories]);

  const brandId = useMemo(() => {
    if (!brandParam) return undefined;
    const lower = brandParam.toLowerCase();
    return brands.find(
      (b) =>
        b.id === brandParam ||
        b.slug?.toLowerCase() === lower ||
        b.name.toLowerCase() === lower,
    )?.id;
  }, [brandParam, brands]);

  // Slug verildi ama kategori/markalar daha gelmediyse istek atma → flicker önle
  const filtersReady =
    (!categoryParam || categoryId !== undefined) &&
    (!brandParam || brandId !== undefined);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['products', 'list', { q, categoryId, brandId }],
    enabled: filtersReady,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      productApi.list({
        q,
        categoryId,
        brandId,
        page: pageParam,
        size: PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.number + 1 < lastPage.totalPages ? lastPage.number + 1 : undefined,
  });

  const items = useMemo(
    () => (data ? data.pages.flatMap((p) => p.content) : []),
    [data],
  );
  const totalElements = data?.pages[0]?.totalElements ?? 0;

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '300px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function setFilter(key: 'category' | 'brand', value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/products?${next.toString()}`);
  }

  function clearAll() {
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    router.push(`/products${next.toString() ? `?${next.toString()}` : ''}`);
  }

  const headingTitle = categoryParam
    ? `${categories.find((c) => c.id === categoryId)?.name ?? categoryParam} ürünleri`
    : q
      ? `"${q}" için sonuçlar`
      : 'Tüm Ürünler';

  return (
    <div className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{headingTitle}</h1>
        {filtersReady && (
          <p className="mt-1 text-sm text-muted-foreground">
            {totalElements.toLocaleString('tr-TR')} ürün listeleniyor
          </p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* SIDEBAR */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Filter className="h-4 w-4 text-brand-600" />
                Filtreler
              </div>
              {(categoryParam || brandParam) && (
                <button
                  onClick={clearAll}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                >
                  <X className="h-3 w-3" />
                  Temizle
                </button>
              )}
            </div>

            <FilterGroup
              title="Kategoriler"
              options={categories.map((c) => ({ value: c.slug || c.name, label: c.name, id: c.id }))}
              activeValue={categoryParam}
              onChange={(v) => setFilter('category', v)}
            />

            <FilterGroup
              title="Markalar"
              options={brands.map((b) => ({ value: b.slug || b.name, label: b.name, id: b.id }))}
              activeValue={brandParam}
              onChange={(v) => setFilter('brand', v)}
              maxHeightClass="max-h-72"
            />
          </div>
        </aside>

        {/* GRID */}
        <div>
          {isLoading || !filtersReady ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="rounded-md border border-dashed py-16 text-center text-muted-foreground">
              Hiç ürün bulunamadı.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              <div ref={sentinelRef} className="h-10" />

              {isFetchingNextPage && (
                <p className="py-4 text-center text-sm text-muted-foreground">Yükleniyor…</p>
              )}

              {!hasNextPage && items.length > PAGE_SIZE && (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  Tüm ürünler yüklendi.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface FilterOption {
  value: string;
  label: string;
  id?: string;
}

function FilterGroup({
  title,
  options,
  activeValue,
  onChange,
  maxHeightClass,
}: {
  title: string;
  options: FilterOption[];
  activeValue?: string;
  onChange: (v: string | null) => void;
  maxHeightClass?: string;
}) {
  if (options.length === 0) return null;
  return (
    <details open className="group border-b last:border-0">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-accent/40">
        {title}
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
      </summary>
      <ul className={cn('space-y-0.5 px-2 pb-3', maxHeightClass && `${maxHeightClass} overflow-y-auto pr-1`)}>
        {options.map((opt) => {
          const active =
            activeValue?.toLowerCase() === opt.value.toLowerCase() ||
            activeValue === opt.id;
          return (
            <li key={opt.value}>
              <button
                onClick={() => onChange(active ? null : opt.value)}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors',
                  active
                    ? 'bg-brand-50 font-semibold text-brand-700 ring-1 ring-brand-200'
                    : 'text-foreground hover:bg-accent/60',
                )}
              >
                <span className="truncate">{opt.label}</span>
                {active && <span className="text-brand-600">✓</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
