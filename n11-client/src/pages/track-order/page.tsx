import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { orderService } from '@/services';
import { useAuth } from '@/providers';
import type { Order, OrderStatus } from '@/types/api';

const statusBadge: Record<OrderStatus, string> = {
  CREATED:         'bg-amber-100 text-amber-700',
  PAYMENT_PENDING: 'bg-yellow-100 text-yellow-700',
  PAID:            'bg-green-100 text-green-700',
  FAILED:          'bg-red-100 text-red-700',
  CANCELLED:       'bg-red-100 text-red-700',
  SHIPPED:         'bg-blue-100 text-blue-700',
  DELIVERED:       'bg-emerald-100 text-emerald-700',
};

const statusLabel: Record<OrderStatus, string> = {
  CREATED:         'Sipariş Alındı',
  PAYMENT_PENDING: 'Ödeme Bekleniyor',
  PAID:            'Ödeme Onaylandı',
  FAILED:          'Ödeme Başarısız',
  CANCELLED:       'İptal Edildi',
  SHIPPED:         'Kargoda',
  DELIVERED:       'Teslim Edildi',
};

const flow: { key: OrderStatus; label: string }[] = [
  { key: 'CREATED',         label: 'Sipariş Alındı' },
  { key: 'PAYMENT_PENDING', label: 'Ödeme Bekleniyor' },
  { key: 'PAID',            label: 'Ödeme Onaylandı' },
  { key: 'SHIPPED',         label: 'Kargoda' },
  { key: 'DELIVERED',       label: 'Teslim Edildi' },
];

function progressIndex(status: OrderStatus): number {
  switch (status) {
    case 'CREATED':         return 0;
    case 'PAYMENT_PENDING': return 1;
    case 'PAID':            return 2;
    case 'SHIPPED':         return 3;
    case 'DELIVERED':       return 4;
    case 'FAILED':
    case 'CANCELLED':       return -1;
    default:                return 0;
  }
}

function OrderTimeline({ order }: { order: Order }) {
  const idx = progressIndex(order.status);
  const terminal = order.status === 'CANCELLED' || order.status === 'FAILED';

  return (
    <div className="bg-white border border-surface-200 rounded-lg p-5">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <p className="text-xs text-primary-400">Sipariş #{order.id}</p>
          <p className="text-sm font-bold text-primary-900">
            {order.totalAmount.toFixed(2)} {order.currency}
          </p>
          <p className="text-xs text-primary-400 mt-0.5">
            {order.createdAt ? new Date(order.createdAt).toLocaleString('tr-TR') : '—'}
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusBadge[order.status]}`}>
          {statusLabel[order.status]}
        </span>
      </div>

      {/* Timeline */}
      {terminal ? (
        <div className={`text-sm font-medium ${order.status === 'FAILED' ? 'text-red-600' : 'text-primary-500'}`}>
          <i className="ri-close-circle-line mr-1"></i>
          {order.status === 'FAILED' ? 'Ödeme başarısız oldu, sipariş tamamlanamadı.' : 'Sipariş iptal edildi.'}
        </div>
      ) : (
        <div className="flex items-center gap-0">
          {flow.map((step, i) => {
            const done = i <= idx;
            const current = i === idx;
            return (
              <div key={step.key} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    done
                      ? 'bg-primary-900 border-primary-900'
                      : 'bg-white border-surface-300'
                  } ${current ? 'ring-4 ring-primary-900/10' : ''}`}>
                    {done && <i className="ri-check-line text-white text-[9px]"></i>}
                  </div>
                  <p className={`text-[9px] mt-1 text-center leading-tight max-w-[56px] ${done ? 'text-primary-700 font-semibold' : 'text-primary-300'}`}>
                    {step.label}
                  </p>
                </div>
                {i < flow.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 mx-0.5 ${i < idx ? 'bg-primary-900' : 'bg-surface-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Items summary */}
      <div className="mt-4 pt-4 border-t border-surface-100 space-y-1">
        {order.items.map((it, i) => (
          <div key={i} className="flex justify-between text-xs text-primary-600">
            <span className="truncate max-w-[70%]">{it.productName} <span className="text-primary-400">×{it.quantity}</span></span>
            <span className="font-medium text-primary-800">{(it.unitPrice * it.quantity).toFixed(2)} {order.currency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Guest: search by order ID ─────────────────────────────────
function GuestTracker() {
  const [params, setParams] = useSearchParams();
  const initialId = params.get('id') ?? '';
  const [orderIdInput, setOrderIdInput] = useState(initialId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      setOrder(await orderService.track(id));
    } catch {
      setOrder(null);
      setError('Sipariş bulunamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      const n = Number(initialId);
      if (!Number.isNaN(n)) fetchOrder(n);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTrack = async (e: FormEvent) => {
    e.preventDefault();
    const n = Number(orderIdInput);
    if (!orderIdInput.trim() || Number.isNaN(n)) { setError('Geçerli bir sipariş numarası girin.'); return; }
    setParams({ id: String(n) });
    await fetchOrder(n);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {!order ? (
        <form onSubmit={handleTrack} className="bg-surface-50 border border-surface-200 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-primary-700 uppercase tracking-wider mb-1.5">
              Sipariş Numarası
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400">
                <i className="ri-hashtag text-sm"></i>
              </span>
              <input
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="örn. 12345"
                className="w-full pl-10 pr-4 py-3 border border-surface-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-800/20"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Sorgulanıyor...' : 'Sorgula'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <OrderTimeline order={order} />
          <button
            onClick={() => { setOrder(null); setOrderIdInput(''); setParams({}); }}
            className="text-sm text-primary-500 hover:text-primary-900 flex items-center gap-1 cursor-pointer"
          >
            <i className="ri-arrow-left-line"></i> Başka bir sipariş ara
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Authenticated: own orders list ────────────────────────────
function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const page = await orderService.mine(0, 50);
      setOrders(page.content);
    } catch {
      setError('Siparişler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id: number) => {
    if (!confirm('Bu siparişi iptal etmek istediğinize emin misiniz?')) return;
    setCancelling(id);
    try {
      const updated = await orderService.cancel(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (e: any) {
      alert(e?.serverMessage || 'İptal edilemedi.');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <div className="text-center py-12 text-sm text-primary-400">Yükleniyor...</div>;
  if (error)   return <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600">{error}</div>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-surface-100 mx-auto mb-4">
          <i className="ri-shopping-bag-line text-3xl text-primary-400"></i>
        </div>
        <p className="text-primary-500 text-sm mb-4">Henüz siparişiniz yok.</p>
        <Link to="/products" className="btn-primary inline-block">Alışverişe Başla</Link>
      </div>
    );
  }

  const canCancel = (status: OrderStatus) =>
    status === 'CREATED' || status === 'PAYMENT_PENDING' || status === 'PAID';

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o.id}>
          <OrderTimeline order={o} />
          {canCancel(o.status) && (
            <div className="mt-2 flex justify-end">
              <button
                disabled={cancelling === o.id}
                onClick={() => cancel(o.id)}
                className="text-xs text-red-600 hover:text-red-800 border border-red-200 px-3 py-1 rounded hover:bg-red-50 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {cancelling === o.id ? 'İptal ediliyor...' : 'Siparişi İptal Et'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Page shell ────────────────────────────────────────────────
export default function TrackOrderPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 md:pt-36">
        <div className="section-padding py-10 border-b border-surface-100 text-center">
          <h1 className="font-display text-3xl md:text-4xl text-primary-900 font-medium mb-2">
            {isAuthenticated ? 'Siparişlerim' : 'Sipariş Takibi'}
          </h1>
          <p className="text-primary-500 text-sm max-w-md mx-auto">
            {isAuthenticated
              ? 'Tüm siparişlerinizi aşağıda görebilir ve yönetebilirsiniz.'
              : 'Sipariş numaranı girerek güncel durumu görüntüle.'}
          </p>
        </div>

        <div className="section-padding py-10">
          {authLoading ? (
            <div className="text-center py-12 text-sm text-primary-400">Yükleniyor...</div>
          ) : isAuthenticated ? (
            <MyOrders />
          ) : (
            <GuestTracker />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
