import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { userService } from '@/services';
import type { UserProfile } from '@/types/api';

function fullName(u: UserProfile) {
  const parts = [u.name, u.surName].filter(Boolean).join(' ').trim();
  return parts || u.userName;
}

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<UserProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    // Admin paneli sadece "USER" rolündeki müşterileri listeler — yöneticiler
    // (ADMIN/SELLER) bu sayfada görünmez.
    userService
      .search(search.trim(), 0, 50, 'USER')
      .then((p) => !cancelled && setItems(p.content))
      .catch((e: any) => !cancelled && setError(e?.serverMessage || 'Müşteriler alınamadı.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [search]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-primary-900 font-medium">Müşteriler</h1>
            <p className="text-sm text-primary-400">Müşteri tabanını yönet</p>
          </div>
        </div>

        <div className="relative max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-primary-400">
            <i className="ri-search-line text-sm"></i>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İsim veya kullanıcı adı..."
            className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500 bg-white"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="bg-white border border-surface-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">
                    Kullanıcı Adı
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">
                    Telefon
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">
                    Kayıt
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-t border-surface-100 hover:bg-surface-50 transition-colors cursor-pointer"
                    onClick={() => setSelected(customer)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {customer.avatar ? (
                          <img
                            src={customer.avatar}
                            alt={fullName(customer)}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary-900 flex items-center justify-center text-white font-display text-sm font-semibold flex-shrink-0">
                            {fullName(customer).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-primary-900 text-sm">{fullName(customer)}</p>
                          <p className="text-xs text-primary-400">{customer.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-primary-700">{customer.userName}</td>
                    <td className="px-6 py-4 text-primary-500">{customer.phone || '—'}</td>
                    <td className="px-6 py-4 text-primary-500">
                      {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="w-8 h-8 flex items-center justify-center rounded-md text-primary-500 hover:text-primary-900 hover:bg-surface-100 transition-all cursor-pointer">
                        <i className="ri-eye-line text-base"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && items.length === 0 && (
            <div className="text-center py-12">
              <p className="text-primary-400 text-sm">Müşteri bulunamadı.</p>
            </div>
          )}
          {loading && (
            <div className="text-center py-12 text-sm text-primary-400">Yükleniyor...</div>
          )}
        </div>

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-surface-200 flex items-center justify-between">
                <h2 className="font-display text-lg font-medium text-primary-900">Müşteri Detayı</h2>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 flex items-center justify-center text-primary-400 hover:text-primary-900 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  {selected.avatar ? (
                    <img
                      src={selected.avatar}
                      alt={fullName(selected)}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary-900 flex items-center justify-center text-white font-display text-xl font-semibold">
                      {fullName(selected).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-primary-900">{fullName(selected)}</p>
                    <p className="text-sm text-primary-400">{selected.email || '—'}</p>
                    <p className="text-xs text-primary-400 mt-0.5">@{selected.userName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-50 rounded-lg p-3 border border-surface-100">
                    <p className="text-xs text-primary-400 uppercase tracking-wider">Telefon</p>
                    <p className="text-sm font-medium text-primary-900 truncate">{selected.phone || '—'}</p>
                  </div>
                  <div className="bg-surface-50 rounded-lg p-3 border border-surface-100">
                    <p className="text-xs text-primary-400 uppercase tracking-wider">Auth ID</p>
                    <p className="text-sm font-medium text-primary-900">#{selected.authId}</p>
                  </div>
                  <div className="bg-surface-50 rounded-lg p-3 border border-surface-100 col-span-2">
                    <p className="text-xs text-primary-400 uppercase tracking-wider">Kayıt Tarihi</p>
                    <p className="text-sm font-medium text-primary-900">
                      {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '—'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-surface-200 flex items-center justify-end">
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 text-sm text-primary-600 hover:text-primary-900 cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
