import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/shared/components/data-table/DataTable';
import { orderApi } from '@/features/orders/api/orderApi';
import { ORDER_STATUSES, type Order, type OrderStatus } from '@/features/orders/types/orders-types';
import { formatCurrency, formatDate } from '@/shared/lib/utils';

const KEY = ['admin', 'orders'] as const;

export function OrdersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<OrderStatus | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: [...KEY, { page, status }],
    queryFn: () =>
      orderApi.list({ page, size: 20, status: status === '' ? undefined : status }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, next }: { id: number; next: OrderStatus }) =>
      orderApi.updateStatus(id, next),
    onSuccess: () => {
      toast.success('Durum güncellendi');
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  const columns: DataTableColumn<Order>[] = [
    {
      key: 'id',
      header: 'Sipariş',
      cell: (o) => <span className="font-mono text-xs">#{o.id}</span>,
    },
    { key: 'customerEmail', header: 'Müşteri', cell: (o) => o.customerEmail ?? '—' },
    {
      key: 'totalAmount',
      header: 'Tutar',
      cell: (o) => formatCurrency(o.totalAmount, o.currency ?? 'TRY'),
    },
    { key: 'items', header: 'Adet', cell: (o) => o.items.length },
    {
      key: 'createdAt',
      header: 'Oluşturma',
      cell: (o) => (o.createdAt ? formatDate(new Date(o.createdAt)) : '—'),
    },
    {
      key: 'status',
      header: 'Durum',
      cell: (o) => (
        <select
          className="h-8 rounded-md border bg-background px-2 text-xs"
          value={o.status}
          onChange={(e) =>
            updateStatus.mutate({ id: o.id, next: e.target.value as OrderStatus })
          }
          disabled={updateStatus.isPending}
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Siparişler" description="Tüm siparişleri yönet" />

      <Card className="mb-4 flex flex-wrap items-center gap-2 p-4">
        <span className="text-sm text-muted-foreground">Filtre:</span>
        <button
          className={chipCls(status === '')}
          onClick={() => {
            setStatus('');
            setPage(0);
          }}
        >
          Tümü
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            className={chipCls(status === s)}
            onClick={() => {
              setStatus(s);
              setPage(0);
            }}
          >
            {s}
          </button>
        ))}
        {data && (
          <Badge variant="outline" className="ml-auto">
            {data.totalElements} sonuç
          </Badge>
        )}
      </Card>

      <DataTable
        columns={columns}
        rows={data?.content}
        isLoading={isLoading}
        rowKey={(o) => String(o.id)}
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

function chipCls(active: boolean) {
  return [
    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
    active ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent',
  ].join(' ');
}
