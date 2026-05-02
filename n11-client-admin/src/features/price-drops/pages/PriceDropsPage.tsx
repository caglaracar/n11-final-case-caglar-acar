import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Percent, Undo2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/shared/components/data-table/DataTable';
import { SearchInput } from '@/shared/components/data-table/SearchInput';
import { productApi } from '@/features/products/api/productApi';
import type { Product } from '@/features/products/types';
import { formatCurrency, formatDate } from '@/shared/lib/utils';

type Filter = 'all' | 'discounted' | 'plain';

const KEY = ['products', 'price-drops'] as const;

function discountPct(p: Product) {
  if (!p.originalPrice || p.originalPrice <= p.price) return 0;
  return Math.round((1 - p.price / p.originalPrice) * 100);
}

export function PriceDropsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: [...KEY, { page, q: search || undefined }],
    queryFn: () => productApi.list({ page, size: 20, q: search || undefined }),
  });

  const apply = useMutation({
    mutationFn: ({ id, price, originalPrice }: { id: string; price: number; originalPrice?: number }) =>
      productApi.applyPriceDrop(id, { price, originalPrice }),
    onSuccess: () => {
      toast.success('İndirim uygulandı');
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  const clear = useMutation({
    mutationFn: (id: string) => productApi.clearPriceDrop(id),
    onSuccess: () => {
      toast.success('İndirim göstergesi kaldırıldı');
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  const filteredRows = useMemo(() => {
    const rows = data?.content ?? [];
    if (filter === 'all') return rows;
    return rows.filter((p) => (filter === 'discounted' ? discountPct(p) > 0 : discountPct(p) === 0));
  }, [data, filter]);

  const discountedCount = useMemo(
    () => (data?.content ?? []).filter((p) => discountPct(p) > 0).length,
    [data],
  );

  const applyPercent = (p: Product, pct: number) => {
    const ref = p.originalPrice && p.originalPrice > p.price ? p.originalPrice : p.price;
    const newPrice = Math.round(ref * (1 - pct / 100) * 100) / 100;
    if (newPrice <= 0 || newPrice >= ref) {
      toast.error('Geçersiz indirim oranı');
      return;
    }
    apply.mutate({ id: p.id, price: newPrice, originalPrice: ref });
  };

  const applyManual = (p: Product) => {
    const raw = drafts[p.id];
    const newPrice = Number(raw);
    if (!raw || !Number.isFinite(newPrice) || newPrice <= 0) {
      toast.error('Geçerli bir fiyat gir');
      return;
    }
    const ref = p.originalPrice && p.originalPrice > p.price ? p.originalPrice : p.price;
    if (newPrice >= ref) {
      toast.error('Yeni fiyat referans fiyattan düşük olmalı');
      return;
    }
    apply.mutate({ id: p.id, price: newPrice, originalPrice: ref });
    setDrafts((d) => {
      const n = { ...d };
      delete n[p.id];
      return n;
    });
  };

  const columns: DataTableColumn<Product>[] = [
    {
      key: 'name',
      header: 'Ürün',
      cell: (p) => (
        <div className="flex items-center gap-3">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded-md object-cover" loading="lazy" />
          ) : (
            <div className="h-10 w-10 rounded-md bg-muted" />
          )}
          <div className="min-w-0">
            <p className="truncate font-medium">{p.name}</p>
            <p className="truncate text-xs text-muted-foreground">{p.brand ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Satış / Liste',
      cell: (p) => {
        const pct = discountPct(p);
        return (
          <div>
            <p className="font-medium">{formatCurrency(p.price, p.currency ?? 'TRY')}</p>
            {pct > 0 && (
              <p className="text-xs text-muted-foreground">
                <span className="line-through">
                  {formatCurrency(p.originalPrice ?? p.price, p.currency ?? 'TRY')}
                </span>{' '}
                <Badge className="ml-1 bg-rose-500 hover:bg-rose-500">-%{pct}</Badge>
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'priceDropAt',
      header: 'Son düşüş',
      cell: (p) => (p.priceDropAt ? formatDate(p.priceDropAt) : '—'),
    },
  ];

  return (
    <>
      <PageHeader
        title="Fiyat Düşüşleri"
        description={`Bu sayfadaki ${data?.content?.length ?? 0} üründen ${discountedCount} tanesinde aktif indirim var`}
      />

      <Card className="mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(0);
            }}
            placeholder="Ürün ara…"
          />
        </div>
        <div className="flex overflow-hidden rounded-md border">
          {(['all', 'discounted', 'plain'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-sm transition ${
                filter === f ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`}
            >
              {f === 'all' ? 'Tümü' : f === 'discounted' ? 'İndirimli' : 'Normal'}
            </button>
          ))}
        </div>
      </Card>

      <DataTable
        columns={columns}
        rows={filteredRows}
        isLoading={isLoading}
        rowKey={(p) => p.id}
        actions={(p) => {
          const busy = apply.isPending || clear.isPending;
          return (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => applyPercent(p, 10)}>
                -%10
              </Button>
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => applyPercent(p, 20)}>
                -%20
              </Button>
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => applyPercent(p, 30)}>
                -%30
              </Button>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="Yeni fiyat"
                value={drafts[p.id] ?? ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                className="h-8 w-28 text-xs"
              />
              <Button size="sm" disabled={busy || !drafts[p.id]} onClick={() => applyManual(p)}>
                <Percent className="h-3.5 w-3.5" />
              </Button>
              {discountPct(p) > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => clear.mutate(p.id)}
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        }}
        pagination={
          data
            ? {
                page: data.number,
                totalPages: data.totalPages,
                totalElements: data.totalElements,
                onPageChange: setPage,
              }
            : undefined
        }
      />
    </>
  );
}
