import { useQuery } from '@tanstack/react-query';
import { Activity, DollarSign, Package, ShoppingBag, XCircle } from 'lucide-react';
import { PageHeader, StatCard } from '@/shared/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import { formatCurrency, formatDate } from '@/shared/lib/utils';

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => dashboardApi.stats(),
  });

  return (
    <>
      <PageHeader title="Genel Bakış" description="Mağazadaki son durum" />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Toplam Ciro"
          value={isLoading || !data ? '—' : formatCurrency(data.totalRevenue)}
          icon={DollarSign}
          hint={data ? `${data.paidOrders} ödenmiş sipariş` : undefined}
        />
        <StatCard
          label="Toplam Sipariş"
          value={isLoading || !data ? '—' : data.totalOrders}
          icon={ShoppingBag}
          hint={data ? `${data.pendingOrders} bekliyor` : undefined}
        />
        <StatCard
          label="Aktif Süreç"
          value={isLoading || !data ? '—' : data.pendingOrders}
          icon={Activity}
          hint="İşleme alınacak siparişler"
        />
        <StatCard
          label="İptal Edilen"
          value={isLoading || !data ? '—' : data.cancelledOrders}
          icon={XCircle}
          hint="Tüm zamanlar"
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sipariş durumlarına göre dağılım</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <p className="text-sm text-muted-foreground">Yükleniyor…</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {Object.entries(data.ordersByStatus ?? {}).map(([status, count]) => (
                  <li key={status} className="flex items-center justify-between">
                    <Badge variant="outline">{status}</Badge>
                    <span className="font-semibold">{count}</span>
                  </li>
                ))}
                {Object.keys(data.ordersByStatus ?? {}).length === 0 && (
                  <p className="text-sm text-muted-foreground">Veri yok.</p>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son siparişler</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <p className="text-sm text-muted-foreground">Yükleniyor…</p>
            ) : data.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Henüz sipariş yok.</p>
            ) : (
              <ul className="divide-y text-sm">
                {data.recentOrders.slice(0, 6).map((o) => (
                  <li key={o.id} className="flex items-center justify-between py-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">#{o.id.slice(0, 8)}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {o.userEmail ?? '—'} · {o.createdAt ? formatDate(o.createdAt) : '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{o.status}</Badge>
                      <span className="font-semibold">
                        {formatCurrency(o.totalAmount, o.currency)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Aylık ciro</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <p className="text-sm text-muted-foreground">Yükleniyor…</p>
            ) : (
              <RevenueBars data={data.revenueByMonth ?? []} />
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function RevenueBars({ data }: { data: { month: string; revenue: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">Veri yok.</p>;
  }
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="flex h-40 items-end gap-3">
      {data.map((d) => (
        <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-32 w-full items-end">
            <div
              className="w-full rounded-t bg-primary/80 transition-all"
              style={{ height: `${(d.revenue / max) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{d.month}</span>
        </div>
      ))}
    </div>
  );
}
