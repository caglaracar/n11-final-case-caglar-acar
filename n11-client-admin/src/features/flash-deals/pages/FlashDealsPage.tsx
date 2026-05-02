import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, Timer, Zap } from 'lucide-react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { DataTable, type DataTableColumn } from '@/shared/components/data-table/DataTable';
import { SearchInput } from '@/shared/components/data-table/SearchInput';
import { productApi } from '@/features/products/api/productApi';
import type { Product } from '@/features/products/types';
import { formatCurrency, formatDate } from '@/shared/lib/utils';

type Filter = 'all' | 'active' | 'inactive';

const KEY = ['products', 'flash-deals'] as const;

function toIso(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function toLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function refPrice(p: Product) {
  return p.originalPrice && p.originalPrice > p.price ? p.originalPrice : p.price;
}

export function FlashDealsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(0);

  const [editing, setEditing] = useState<Product | null>(null);
  const [endsLocal, setEndsLocal] = useState('');
  const [pct, setPct] = useState<number | null>(null);
  const [manualPrice, setManualPrice] = useState('');

  const [endingDeal, setEndingDeal] = useState<Product | null>(null);
  const [clearingDiscount, setClearingDiscount] = useState<Product | null>(null);

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

  const clearDeal = useMutation({
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
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'İndirim uygulanamadı'),
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

  const openEditor = (p: Product) => {
    setEditing(p);
    setEndsLocal(toLocalInput(p.flashDealEndsAt));
    setPct(null);
    setManualPrice('');
  };

  const computedNewPrice = (() => {
    if (!editing) return null;
    if (pct != null) {
      const ref = refPrice(editing);
      return Math.round(ref * (1 - pct / 100) * 100) / 100;
    }
    if (manualPrice) {
      const n = Number(manualPrice);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  })();

  const setQuickEnd = (hours: number) => {
    const d = new Date(Date.now() + hours * 3600 * 1000);
    setEndsLocal(toLocalInput(d.toISOString()));
  };

  const submitEditor = async () => {
    if (!editing) return;
    const tasks: Promise<unknown>[] = [];

    if (endsLocal) {
      const iso = toIso(endsLocal);
      if (!iso) {
        toast.error('Geçerli bir bitiş tarihi gir');
        return;
      }
      tasks.push(setDeal.mutateAsync({ id: editing.id, endsAt: iso }));
    }

    if (computedNewPrice != null) {
      const ref = refPrice(editing);
      if (computedNewPrice <= 0 || computedNewPrice >= ref) {
        toast.error(`Yeni fiyat ${ref}₺'den küçük olmalı`);
        return;
      }
      tasks.push(applyDrop.mutateAsync({ id: editing.id, price: computedNewPrice, originalPrice: ref }));
    }

    if (tasks.length === 0) {
      toast.error('Bitiş tarihi veya indirim seç');
      return;
    }

    await Promise.all(tasks);
    setEditing(null);
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
      header: 'Fiyat',
      cell: (p) => {
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
                filter === f ? 'bg-brand text-white' : 'hover:bg-accent/40'
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
          const hasDeal = !!p.flashDealEndsAt;
          const hasDiscount = !!p.originalPrice && p.originalPrice > p.price;
          return (
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => openEditor(p)} className="gap-1">
                <Pencil className="h-3.5 w-3.5" />
                Düzenle
              </Button>
              {hasDeal && (
                <Button
                  size="sm"
                  variant="ghost"
                  title="Kampanyayı sonlandır"
                  onClick={() => setEndingDeal(p)}
                >
                  <Timer className="h-3.5 w-3.5" />
                </Button>
              )}
              {hasDiscount && (
                <Button
                  size="sm"
                  variant="ghost"
                  title="İndirimi kaldır"
                  onClick={() => setClearingDiscount(p)}
                >
                  -%
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

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-brand" />
              Flash Fırsat Düzenle
            </DialogTitle>
            <DialogDescription>
              {editing?.name} — Liste fiyatı:{' '}
              <span className="font-semibold text-foreground">
                {editing && formatCurrency(refPrice(editing), editing.currency ?? 'TRY')}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium">Kampanya bitiş zamanı</p>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="datetime-local"
                  value={endsLocal}
                  onChange={(e) => setEndsLocal(e.target.value)}
                  className="h-9 w-56"
                />
                <Button type="button" size="sm" variant="outline" onClick={() => setQuickEnd(6)}>+6 saat</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setQuickEnd(24)}>+24 saat</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setQuickEnd(72)}>+3 gün</Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="mb-2 text-sm font-medium">İndirim oranı (opsiyonel)</p>
              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 30, 40, 50, 60].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setPct(v);
                      setManualPrice('');
                    }}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                      pct === v
                        ? 'border-brand bg-brand text-white'
                        : 'hover:border-brand/40 hover:bg-brand/5'
                    }`}
                  >
                    -%{v}
                  </button>
                ))}
              </div>
              <Input
                type="number"
                step="0.01"
                placeholder="veya manuel yeni fiyat"
                value={manualPrice}
                onChange={(e) => {
                  setManualPrice(e.target.value);
                  setPct(null);
                }}
                className="mt-3"
              />
            </div>

            {computedNewPrice != null && editing && (
              <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 text-sm">
                <p className="text-muted-foreground">Yeni fiyat önizleme</p>
                <p className="mt-1 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-brand">
                    {formatCurrency(computedNewPrice, editing.currency ?? 'TRY')}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(refPrice(editing), editing.currency ?? 'TRY')}
                  </span>
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEditing(null)} disabled={setDeal.isPending || applyDrop.isPending}>
              İptal
            </Button>
            <Button
              onClick={submitEditor}
              disabled={setDeal.isPending || applyDrop.isPending}
              className="bg-brand text-white hover:bg-brand/90"
            >
              {setDeal.isPending || applyDrop.isPending ? 'Uygulanıyor…' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!endingDeal}
        onOpenChange={(o) => !o && setEndingDeal(null)}
        title="Flash kampanyayı sonlandır"
        description={endingDeal ? `${endingDeal.name} ürününün flash kampanyası sonlandırılacak.` : ''}
        confirmText="Sonlandır"
        variant="destructive"
        onConfirm={async () => {
          if (endingDeal) await clearDeal.mutateAsync(endingDeal.id);
        }}
      />

      <ConfirmDialog
        open={!!clearingDiscount}
        onOpenChange={(o) => !o && setClearingDiscount(null)}
        title="İndirimi kaldır"
        description={clearingDiscount ? `${clearingDiscount.name} ürünündeki indirim göstergesi kaldırılacak.` : ''}
        confirmText="Kaldır"
        variant="destructive"
        onConfirm={async () => {
          if (clearingDiscount) await clearDrop.mutateAsync(clearingDiscount.id);
        }}
      />
    </>
  );
}
