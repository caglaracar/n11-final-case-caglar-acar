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

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  PAID:      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  SHIPPED:   'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  FAILED:    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING:   'Beklemede',
  PAID:      'Ödendi',
  SHIPPED:   'Kargoda',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal',
  FAILED:    'Başarısız',
};

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
      header: 'Sipariş No',
      cell: (o) => <span className="font-mono text-xs font-semibold">#{o.id}</span>,
    },
    {
      key: 'customerEmail',
      header: 'Müşteri',
      cell: (o) => (
        <div className="min-w-0">
          {o.customerName && <p className="truncate text-xs font-medium">{o.customerName}</p>}
          <p className="truncate text-xs text-muted-foreground">{o.customerEmail ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Ürünler',
      cell: (o) => (
        <div className="max-w-[200px] space-y-0.5">
          {o.items.map((item, i) => (
            <p key={i} className="truncate text-xs">
              {item.productName}
              <span className="ml-1 text-muted-foreground">×{item.quantity}</span>
            </p>
          ))}
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Tutar',
      cell: (o) => (
        <span className="whitespace-nowrap text-sm font-semibold">
          {formatCurrency(o.totalAmount, o.currency ?? 'TRY')}
        </span>
      ),
    },
    {
      key: 'shippingCity',
      header: 'Şehir',
      cell: (o) => <span className="text-xs">{o.shippingCity ?? '—'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Tarih',
      cell: (o) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {o.createdAt ? formatDate(new Date(o.createdAt)) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Durum',
      cell: (o) => (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[o.status]}`}>
            {STATUS_LABELS[o.status]}
          </span>
          <select
            className="h-7 rounded border bg-background px-1.5 text-[11px]"
            value={o.status}
            onChange={(e) =>
              updateStatus.mutate({ id: o.id, next: e.target.value as OrderStatus })
            }
            disabled={updateStatus.isPending}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Siparişler" description="Tüm siparişleri yönet" />

      <Card className="mb-4 flex flex-wrap items-center gap-2 p-4">
        <span className="text-sm text-muted-foreground">Filtre:</span>
        <button className={chipCls(status === '')} onClick={() => { setStatus(''); setPage(0); }}>
          Tümü
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            className={chipCls(status === s)}
            onClick={() => { setStatus(s); setPage(0); }}
          >
            <span className={`mr-1 inline-block h-2 w-2 rounded-full ${STATUS_STYLES[s].split(' ')[0]}`} />
            {STATUS_LABELS[s]}
          </button>
        ))}
        {data && (
          <Badge variant="outline" className="ml-auto">
            {data.totalElements} sipariş
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
    'flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors',
    active ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent',
  ].join(' ');
}
