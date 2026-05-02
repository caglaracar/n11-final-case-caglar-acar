import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Percent, Timer, Undo2, Zap } from 'lucide-react';
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

type Filter = 'all' | 'active' | 'inactive';

const KEY = ['products', 'flash-deals'] as const;

/** datetime-local input → ISO (UTC). */
function toIso(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** ISO → datetime-local input value (local timezone). */
function toLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function FlashDealsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: [...KEY, { page, q: search || undefined }],
    queryFn: () => productApi.list({ page, size: 20, q: search || undefined }),
  });

  const setDeal = useMutation({
    mutationFn: ({ id, endsAt }: { id: string; endsAt: string }) =>
      productApi.setFlashDeal(id, { flashDealEndsAt: endsAt }),
    onSuccess: () => {
      toast.success('Flash deal güncellendi');
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  const clear = useMutation({
    mutationFn: (id: string) => productApi.clearFlashDeal(id),
    onSuccess: () => {
      toast.success('Flash deal sonlandırıldı');
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  const applyDrop = useMutation({
    mutationFn: ({ id, price, originalPrice }: { id: string; price: number; originalPrice: number }) =>
      productApi.applyPriceDrop(id, { price, originalPrice }),
    onSuccess: () => {
      toast.success('İndirim uygulandı');
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'İndirim uygulanamadı';
      toast.error(msg);
    },
  });

  const clearDrop = useMutation({
    mutationFn: (id: string) => productApi.clearPriceDrop(id),
    onSuccess: () => {
      toast.success('İndirim kaldırıldı');
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  const isActive = (p: Product) =>
    !!p.flashDealEndsAt && new Date(p.flashDealEndsAt).getTime() > Date.now();

  const filteredRows = useMemo(() => {
    const rows = data?.content ?? [];
    if (filter === 'all') return rows;
    return rows.filter((p) => (filter === 'active' ? isActive(p) : !isActive(p)));
  }, [data, filter]);

  const activeCount = useMemo(
    () => (data?.content ?? []).filter(isActive).length,
    [data],
  );

  const quickStart = (p: Product, hours: number) => {
    const endsAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    setDeal.mutate({ id: p.id, endsAt });
  };

  const saveDraft = (p: Product) => {
    const iso = toIso(drafts[p.id] ?? '');
    if (!iso) {
      toast.error('Geçerli bir tarih seç');
      return;
    }
    setDeal.mutate({ id: p.id, endsAt: iso });
  };

  const quickDiscount = (p: Product, pct: number) => {
    const ref = p.originalPrice ?? p.price;
    const newPrice = Math.round(ref * (1 - pct / 100) * 100) / 100;
    if (newPrice <= 0 || newPrice >= ref) {
      toast.error('Geçersiz indirim');
      return;
    }
    applyDrop.mutate({ id: p.id, price: newPrice, originalPrice: ref });
  };

  const saveDiscount = (p: Product) => {
    const raw = priceDrafts[p.id];
    const newPrice = raw ? Number(raw) : NaN;
    const ref = p.originalPrice ?? p.price;
    if (!Number.isFinite(newPrice) || newPrice <= 0 || newPrice >= ref) {
      toast.error(`Yeni fiyat ${ref}₺'den küçük olmalı`);
      return;
    }
    applyDrop.mutate({ id: p.id, price: newPrice, originalPrice: ref });
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
    { key: 'price', header: 'Fiyat', cell: (p) => {
        const cur = p.currency ?? 'TRY';
        if (p.originalPrice && p.originalPrice > p.price) {
          return (
            <div className="flex flex-col">
              <span className="font-medium text-emerald-600">{formatCurrency(p.price, cur)}</span>
              <span className="text-xs text-muted-foreground line-through">{formatCurrency(p.originalPrice, cur)}</span>
            </div>
          );
        }
        return formatCurrency(p.price, cur);
      },
    },
    {
      key: 'status',
      header: 'Durum',
      cell: (p) =>
        isActive(p) ? (
          <Badge className="bg-emerald-500 hover:bg-emerald-500">Aktif</Badge>
        ) : p.flashDealEndsAt ? (
          <Badge variant="secondary">Süresi doldu</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: 'flashDealEndsAt',
      header: 'Bitiş',
      cell: (p) => (p.flashDealEndsAt ? formatDate(p.flashDealEndsAt) : '—'),
    },
  ];

  return (
    <>
      <PageHeader
        title="Flash Fırsatlar"
        description={`Bu sayfadaki ${data?.content?.length ?? 0} üründen ${activeCount} tanesi aktif kampanyada`}
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
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-sm transition ${
                filter === f ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`}
            >
              {f === 'all' ? 'Hepsi' : f === 'active' ? 'Aktif' : 'Pasif'}
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
          const draft = drafts[p.id] ?? toLocalInput(p.flashDealEndsAt);
          const priceDraft = priceDrafts[p.id] ?? '';
          const busy = setDeal.isPending || clear.isPending || applyDrop.isPending || clearDrop.isPending;
          const hasDiscount = !!p.originalPrice && p.originalPrice > p.price;
          return (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1">
                <Input
                  type="datetime-local"
                  value={draft}
                  onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                  className="h-8 w-44 text-xs"
                />
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => quickStart(p, 6)}>
                  +6s
                </Button>
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => quickStart(p, 24)}>
                  +24s
                </Button>
                <Button size="sm" disabled={busy || !drafts[p.id]} onClick={() => saveDraft(p)}>
                  <Zap className="h-3.5 w-3.5" />
                </Button>
                {p.flashDealEndsAt && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => clear.mutate(p.id)}
                  >
                    <Timer className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Yeni fiyat"
                  value={priceDraft}
                  onChange={(e) => setPriceDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                  className="h-8 w-28 text-xs"
                />
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => quickDiscount(p, 10)}>
                  -%10
                </Button>
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => quickDiscount(p, 20)}>
                  -%20
                </Button>
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => quickDiscount(p, 30)}>
                  -%30
                </Button>
                <Button size="sm" disabled={busy || !priceDraft} onClick={() => saveDiscount(p)}>
                  <Percent className="h-3.5 w-3.5" />
                </Button>
                {hasDiscount && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => clearDrop.mutate(p.id)}
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
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
