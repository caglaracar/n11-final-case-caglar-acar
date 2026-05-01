import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AdminLayout from '../components/AdminLayout';
import { adminService } from '@/services';
import type { AdminStats } from '@/types/api';

const monthNames = [
  'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
  'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara',
];

const statusBadge: Record<string, string> = {
  CREATED: 'bg-amber-100 text-amber-700',
  PAYMENT_PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminService
      .stats()
      .then((s) => !cancelled && setStats(s))
      .catch((e: any) => !cancelled && setError(e?.serverMessage || 'İstatistikler alınamadı.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = useMemo(() => {
    if (!stats) return [];
    return stats.revenueByMonth.map((m) => ({
      name: `${monthNames[(m.month - 1) % 12] ?? m.month} ${String(m.year).slice(2)}`,
      revenue: m.total,
      orders: m.orders,
    }));
  }, [stats]);

  const cards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: 'Toplam Gelir',
        value: `$${stats.totalRevenue.toLocaleString()}`,
        icon: 'ri-money-dollar-circle-line',
        bg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
      },
      {
        label: 'Toplam Sipariş',
        value: stats.totalOrders.toLocaleString(),
        icon: 'ri-shopping-bag-3-line',
        bg: 'bg-sky-50',
        iconColor: 'text-sky-600',
      },
      {
        label: 'Ödenen',
        value: stats.paidOrders.toLocaleString(),
        icon: 'ri-check-double-line',
        bg: 'bg-amber-50',
        iconColor: 'text-amber-600',
      },
      {
        label: 'Bekleyen',
        value: stats.pendingOrders.toLocaleString(),
        icon: 'ri-time-line',
        bg: 'bg-accent-50',
        iconColor: 'text-accent-600',
      },
    ];
  }, [stats]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-primary-900 font-semibold">Dashboard</h1>
            <p className="text-sm text-primary-400 mt-0.5">
              Hoş geldin! Bugün mağazanda neler oluyor?
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-sm text-primary-400">Yükleniyor...</div>
        )}

        {stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {cards.map((c, idx) => (
                <div
                  key={c.label}
                  className="bg-white border border-surface-100 rounded-xl p-5 animate-slide-up"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`w-10 h-10 flex items-center justify-center rounded-xl ${c.bg} ${c.iconColor}`}
                    >
                      <i className={`${c.icon} text-xl`}></i>
                    </span>
                  </div>
                  <p className="font-display text-2xl font-bold text-primary-900 mb-0.5">
                    {c.value}
                  </p>
                  <p className="text-xs text-primary-400">{c.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-surface-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold text-primary-900">Aylık Gelir</h2>
                  <p className="text-xs text-primary-400 mt-0.5">Son 12 ay</p>
                </div>
              </div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: any, name: any) =>
                        name === 'revenue' ? [`$${Number(value).toLocaleString()}`, 'Gelir'] : [value, 'Sipariş']
                      }
                    />
                    <Bar dataKey="revenue" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-surface-100 rounded-xl overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between border-b border-surface-100">
                  <h2 className="font-semibold text-primary-900">Son Siparişler</h2>
                  <Link
                    to="/admin/orders"
                    className="text-xs text-accent-600 font-semibold hover:text-accent-700 transition-colors whitespace-nowrap"
                  >
                    Tümünü gör
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface-50 border-b border-surface-100">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-primary-500 uppercase tracking-wider">
                          Sipariş
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-primary-500 uppercase tracking-wider">
                          Tarih
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-primary-500 uppercase tracking-wider">
                          Durum
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-primary-500 uppercase tracking-wider">
                          Toplam
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-50">
                      {stats.recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-surface-50 transition-colors">
                          <td className="px-6 py-3.5">
                            <span className="text-xs font-mono font-semibold text-primary-700">
                              #{order.id}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-xs text-primary-500">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString()
                              : '—'}
                          </td>
                          <td className="px-6 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                statusBadge[order.status] || 'bg-surface-100 text-surface-600'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right font-semibold text-primary-900">
                            ${order.totalAmount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {stats.recentOrders.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-8 text-center text-sm text-primary-400"
                          >
                            Henüz sipariş yok.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white border border-surface-100 rounded-xl p-6">
                <h2 className="font-semibold text-primary-900 mb-4">Hızlı İşlemler</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: 'Ürünler',
                      icon: 'ri-add-circle-line',
                      path: '/admin/products',
                      color: 'bg-accent-50 text-accent-700 hover:bg-accent-100 border border-accent-100',
                    },
                    {
                      label: 'Siparişler',
                      icon: 'ri-file-list-3-line',
                      path: '/admin/orders',
                      color: 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-100',
                    },
                    {
                      label: 'Müşteriler',
                      icon: 'ri-user-settings-line',
                      path: '/admin/customers',
                      color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100',
                    },
                    {
                      label: 'Mağazaya Git',
                      icon: 'ri-store-2-line',
                      path: '/',
                      color: 'bg-surface-50 text-primary-700 hover:bg-surface-100 border border-surface-200',
                    },
                  ].map((action) => (
                    <Link
                      key={action.label}
                      to={action.path}
                      className={`flex items-center gap-3 p-4 rounded-xl transition-all text-sm font-semibold cursor-pointer ${action.color}`}
                    >
                      <span className="w-5 h-5 flex items-center justify-center">
                        <i className={`${action.icon} text-base`}></i>
                      </span>
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
