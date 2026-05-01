import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminService } from '@/services';
import type { Order, OrderStatus } from '@/types/api';

const STATUS_OPTIONS: ('ALL' | OrderStatus)[] = [
  'ALL', 'CREATED', 'PAYMENT_PENDING', 'PAID', 'FAILED', 'CANCELLED', 'SHIPPED', 'DELIVERED',
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  CREATED:         'bg-amber-100 text-amber-700',
  PAYMENT_PENDING: 'bg-yellow-100 text-yellow-700',
  PAID:            'bg-emerald-100 text-emerald-700',
  FAILED:          'bg-rose-100 text-rose-700',
  CANCELLED:       'bg-red-100 text-red-700',
  SHIPPED:         'bg-blue-100 text-blue-700',
  DELIVERED:       'bg-green-100 text-green-700',
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  CREATED:         'Oluşturuldu',
  PAYMENT_PENDING: 'Ödeme Bekliyor',
  PAID:            'Ödendi',
  FAILED:          'Başarısız',
  CANCELLED:       'İptal',
  SHIPPED:         'Kargoda',
  DELIVERED:       'Teslim Edildi',
};

/** Backend state machine kurallarıyla eşleşir. */
const NEXT_STATES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  CREATED:         ['PAYMENT_PENDING', 'CANCELLED'],
  PAYMENT_PENDING: ['PAID', 'FAILED', 'CANCELLED'],
  PAID:            ['SHIPPED', 'CANCELLED'],
  SHIPPED:         ['DELIVERED'],
};

const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  PAYMENT_PENDING: 'Ödemeye Al',
  PAID:            'Ödendi İşaretle',
  FAILED:          'Başarısız İşaretle',
  CANCELLED:       'İptal Et',
  SHIPPED:         'Kargoya Ver',
  DELIVERED:       'Teslim Edildi',
};

const ACTION_CLS: Partial<Record<OrderStatus, string>> = {
  SHIPPED:   'bg-blue-600 hover:bg-blue-700 text-white',
  DELIVERED: 'bg-green-600 hover:bg-green-700 text-white',
  CANCELLED: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
  FAILED:    'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100',
  PAID:      'bg-emerald-600 hover:bg-emerald-700 text-white',
  PAYMENT_PENDING: 'border border-surface-300 text-primary-600 hover:border-primary-400',
};

export default function AdminOrders() {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [updating, setUpdating]     = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const status = statusFilter === 'ALL' ? undefined : statusFilter;
      const page = await adminService.orders(status, 0, 100);
      setOrders(page.content);
    } catch (e: any) {
      setError(e?.serverMessage || 'Siparişler alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]); // eslint-disable-line

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) => String(o.id).includes(q) || String(o.authId).includes(q) || o.status.toLowerCase().includes(q),
    );
  }, [orders, search]);

  const selectedOrder = orders.find((o) => o.id === selectedId) ?? null;

  const updateStatus = async (id: number, next: OrderStatus) => {
    setUpdating(true);
    try {
      const updated = await adminService.updateOrderStatus(id, next);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      // modal içindeyse de güncelle
      if (selectedId === id) setSelectedId(id);
    } catch (e: any) {
      alert(e?.serverMessage || 'Durum güncellenemedi.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl text-primary-900 font-medium">Siparişler</h1>
          <p className="text-sm text-primary-400">Tüm siparişleri yönet ve takip et</p>
        </div>

        {/* Filtreler */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400">
              <i className="ri-search-line text-sm"></i>
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Sipariş ID veya müşteri ID..."
              className="w-full pl-9 pr-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500 bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | OrderStatus)}
            className="text-sm border border-surface-300 rounded-md px-3 py-2.5 focus:outline-none focus:border-primary-500 bg-white"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'Tüm Durumlar' : STATUS_LABEL[s as OrderStatus]}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="bg-white border border-surface-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Sipariş</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Müşteri</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Tarih</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Durum</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Toplam</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const nexts = NEXT_STATES[order.status] ?? [];
                  return (
                    <tr
                      key={order.id}
                      className="border-t border-surface-100 hover:bg-surface-50 cursor-pointer"
                      onClick={() => setSelectedId(order.id)}
                    >
                      <td className="px-6 py-4 font-medium text-primary-900">#{order.id}</td>
                      <td className="px-6 py-4 text-primary-600 text-xs">{order.authId}</td>
                      <td className="px-6 py-4 text-primary-500 text-xs">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('tr-TR') : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[order.status]}`}>
                          {STATUS_LABEL[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-primary-900 text-xs">
                        {order.totalAmount.toFixed(2)} {order.currency}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          {nexts.map((next) => (
                            <button
                              key={next}
                              disabled={updating}
                              onClick={() => updateStatus(order.id, next)}
                              className={`px-2.5 py-1 text-xs rounded cursor-pointer disabled:opacity-50 whitespace-nowrap transition-colors ${ACTION_CLS[next] ?? 'border border-surface-300 text-primary-600 hover:border-primary-400'}`}
                            >
                              {ACTION_LABEL[next] ?? next}
                            </button>
                          ))}
                          {nexts.length === 0 && (
                            <span className="text-xs text-primary-300 italic">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-primary-400 text-sm">Sipariş bulunamadı.</div>
          )}
          {loading && (
            <div className="text-center py-12 text-primary-400 text-sm">Yükleniyor...</div>
          )}
        </div>
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-surface-200 flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-medium text-primary-900">
                  Sipariş #{selectedOrder.id}
                </h2>
                <p className="text-xs text-primary-400 mt-0.5">
                  {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('tr-TR') : '—'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_BADGE[selectedOrder.status]}`}>
                  {STATUS_LABEL[selectedOrder.status]}
                </span>
                <button
                  onClick={() => setSelectedId(null)}
                  className="w-8 h-8 flex items-center justify-center text-primary-400 hover:text-primary-900 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Müşteri */}
              <div>
                <p className="text-xs text-primary-400 uppercase tracking-wider mb-1">Müşteri</p>
                <p className="text-sm font-medium text-primary-900">Auth ID: {selectedOrder.authId}</p>
              </div>

              {/* Ürünler */}
              <div>
                <p className="text-xs text-primary-400 uppercase tracking-wider mb-2">Sipariş İçeriği</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-surface-50 last:border-0">
                      <span className="text-sm text-primary-800 truncate max-w-[65%]">
                        {it.productName} <span className="text-primary-400">× {it.quantity}</span>
                      </span>
                      <span className="text-sm font-medium text-primary-900">
                        {(it.unitPrice * it.quantity).toFixed(2)} {selectedOrder.currency}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-3 mt-1 border-t border-surface-200">
                  <span className="text-sm font-semibold text-primary-700">Toplam</span>
                  <span className="text-base font-bold text-primary-900">
                    {selectedOrder.totalAmount.toFixed(2)} {selectedOrder.currency}
                  </span>
                </div>
              </div>

              {/* Durum güncelle */}
              {(NEXT_STATES[selectedOrder.status]?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-primary-400 uppercase tracking-wider mb-2">Durum Güncelle</p>
                  <div className="flex flex-wrap gap-2">
                    {(NEXT_STATES[selectedOrder.status] ?? []).map((next) => (
                      <button
                        key={next}
                        disabled={updating}
                        onClick={() => updateStatus(selectedOrder.id, next)}
                        className={`px-4 py-2 text-xs font-medium rounded-md cursor-pointer disabled:opacity-50 whitespace-nowrap transition-colors ${ACTION_CLS[next] ?? 'border border-surface-300 text-primary-600 hover:border-primary-400'}`}
                      >
                        {ACTION_LABEL[next] ?? next}
                      </button>
                    ))}
                  </div>
                  {selectedOrder.status === 'PAID' && (
                    <p className="text-xs text-primary-400 mt-2">
                      <i className="ri-mail-line mr-1"></i>
                      "Kargoya Ver" seçildiğinde müşteriye otomatik e-posta gönderilir.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-surface-200 flex justify-end">
              <button
                onClick={() => setSelectedId(null)}
                className="px-4 py-2 text-sm text-primary-600 hover:text-primary-900 cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
