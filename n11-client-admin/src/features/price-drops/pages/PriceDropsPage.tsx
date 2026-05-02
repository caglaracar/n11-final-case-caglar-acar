import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, Percent, Undo2 } from 'lucide-react';
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
import type { Product } from '@/features/products/types/products-types';
import { formatCurrency, formatDate } from '@/shared/lib/utils';

type Filter = 'all' | 'discounted' | 'plain';

const KEY = ['products', 'price-drops'] as const;

function discountPct(p: Product) {
  if (!p.originalPrice || p.originalPrice <= p.price) return 0;
  return Math.round((1 - p.price / p.originalPrice) * 100);
}

function refPrice(p: Product) {
  return p.originalPrice && p.originalPrice > p.price ? p.originalPrice : p.price;
}

export function PriceDropsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(0);

  const [editing, setEditing] = useState<Product | null>(null);
  const [pct, setPct] = useState<number | null>(null);
  const [manualPrice, setManualPrice] = useState('');

  const [removing, setRemoving] = useState<Product | null>(null);

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
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'İndirim uygulanamadı'),
  });

  const clear = useMutation({
    mutationFn: (id: string) => productApi.clearPriceDrop(id),
    onSuccess: () => {
      toast.success('İndirim kaldırıldı');
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

  const openEditor = (p: Product) => {
    setEditing(p);
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

  const submitEditor = () => {
    if (!editing || computedNewPrice == null) return;
    const ref = refPrice(editing);
    if (computedNewPrice <= 0 || computedNewPrice >= ref) {
      toast.error(`Yeni fiyat ${ref}₺'den küçük ve 0'dan büyük olmalı`);
      return;
    }
    apply.mutate(
      { id: editing.id, price: computedNewPrice, originalPrice: ref },
      { onSuccess: () => setEditing(null) },
    );
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
        const pctNow = discountPct(p);
        return (
          <div>
            <p className="font-medium">{formatCurrency(p.price, p.currency ?? 'TRY')}</p>
            {pctNow > 0 && (
              <p className="text-xs text-muted-foreground">
                <span className="line-through">
                  {formatCurrency(p.originalPrice ?? p.price, p.currency ?? 'TRY')}
                </span>{' '}
                <Badge className="ml-1 bg-brand hover:bg-brand">-%{pctNow}</Badge>
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
                filter === f ? 'bg-brand text-white' : 'hover:bg-accent/40'
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
        actions={(p) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openEditor(p)}
              className="gap-1"
            >
              <Pencil className="h-3.5 w-3.5" />
              İndirim
            </Button>
            {discountPct(p) > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setRemoving(p)}
                title="İndirimi kaldır"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-brand" />
              İndirim uygula
            </DialogTitle>
            <DialogDescription>
              {editing?.name} — Liste fiyatı:{' '}
              <span className="font-semibold text-foreground">
                {editing && formatCurrency(refPrice(editing), editing.currency ?? 'TRY')}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">Hızlı oran</p>
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
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">veya manuel fiyat</p>
              <Input
                type="number"
                step="0.01"
                placeholder="Yeni satış fiyatı"
                value={manualPrice}
                onChange={(e) => {
                  setManualPrice(e.target.value);
                  setPct(null);
                }}
              />
            </div>

            {computedNewPrice != null && editing && (
              <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 text-sm">
                <p className="text-muted-foreground">Önizleme</p>
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
            <Button variant="outline" onClick={() => setEditing(null)} disabled={apply.isPending}>
              İptal
            </Button>
            <Button
              onClick={submitEditor}
              disabled={apply.isPending || computedNewPrice == null}
              className="bg-brand text-white hover:bg-brand/90"
            >
              {apply.isPending ? 'Uygulanıyor…' : 'İndirimi Uygula'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title="İndirimi kaldır"
        description={
          removing
            ? `${removing.name} ürünündeki indirim göstergesi kaldırılacak. Devam edilsin mi?`
            : ''
        }
        confirmText="Kaldır"
        variant="destructive"
        onConfirm={async () => {
          if (removing) await clear.mutateAsync(removing.id);
        }}
      />
    </>
  );
}
