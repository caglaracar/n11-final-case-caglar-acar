import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { productService } from '@/services';
import type { Product } from '@/types/api';
import { formatPrice } from '@/lib/format';

const FLASH_BADGE = 'Flash Deal';

/** Instant ISO → datetime-local input value (local timezone). */
function toLocalInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** datetime-local value (local) → Instant ISO (UTC). */
function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function AdminFlashDeals() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await productService.findAll(0, 200);
      setItems(page.content);
    } catch (e: any) {
      setError(e?.serverMessage || 'Ürünler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const isActive = (p: Product) => p.flashDealEndsAt && new Date(p.flashDealEndsAt).getTime() > Date.now();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      const active = isActive(p);
      if (filter === 'active' && !active) return false;
      if (filter === 'inactive' && active) return false;
      return true;
    });
  }, [items, search, filter]);

  const activeCount = useMemo(() => items.filter(isActive).length, [items]);

  const setEndsAt = async (p: Product, iso: string | null) => {
    setBusyId(p.id);
    try {
      // BE update yalnızca null olmayan alanları uygular; "Bitir" için geçmiş bir zaman gönderiyoruz.
      const effectiveIso = iso ?? new Date(Date.now() - 1000).toISOString();
      const badge = iso ? FLASH_BADGE : (p.badge === FLASH_BADGE ? '' : p.badge ?? '');
      await productService.update(p.id, { flashDealEndsAt: effectiveIso, badge });
      setItems((prev) => prev.map((x) => (x.id === p.id
        ? { ...x, flashDealEndsAt: effectiveIso, badge: badge || undefined }
        : x)));
      setDrafts((d) => { const n = { ...d }; delete n[p.id]; return n; });
    } catch (e: any) {
      alert(e?.serverMessage || 'Güncellenemedi.');
    } finally {
      setBusyId(null);
    }
  };

  const quickStart = (p: Product, hours: number) => {
    const d = new Date(Date.now() + hours * 3600 * 1000);
    setEndsAt(p, d.toISOString());
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-primary-900 font-medium">Flash Fırsatlar</h1>
            <p className="text-sm text-primary-400">
              Aktif kampanya: <span className="font-medium text-accent-700">{activeCount}</span> ürün — bitiş zamanı backend'den geliyor
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-primary-400">
              <i className="ri-search-line text-sm"></i>
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün ara..."
              className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500 bg-white"
            />
          </div>
          <div className="flex border border-surface-300 rounded-md bg-white overflow-hidden text-sm">
            {(['all', 'active', 'inactive'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 cursor-pointer ${filter === f ? 'bg-primary-900 text-white' : 'text-primary-600 hover:bg-surface-50'}`}
              >
                {f === 'all' ? 'Hepsi' : f === 'active' ? 'Aktif' : 'Pasif'}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600">{error}</div>}

        <div className="bg-white border border-surface-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Ürün</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Fiyat</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Bitiş</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const active = isActive(p);
                const draft = drafts[p.id] ?? toLocalInput(p.flashDealEndsAt);
                return (
                  <tr key={p.id} className="border-t border-surface-100 hover:bg-surface-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded-md bg-surface-50" />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-surface-100" />
                        )}
                        <div>
                          <p className="font-medium text-primary-900">{p.name}</p>
                          <p className="text-xs text-primary-400">{p.brand || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-primary-900 font-medium">{formatPrice(p.price, p.currency)}</p>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <p className="text-xs text-primary-400 line-through">{formatPrice(p.originalPrice, p.currency)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="datetime-local"
                        value={draft}
                        onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                        className="px-2 py-1 border border-surface-300 rounded-md text-xs"
                      />
                      {p.flashDealEndsAt && (
                        <p className={`text-xs mt-1 ${active ? 'text-green-600' : 'text-red-500'}`}>
                          {active ? 'Aktif' : 'Süresi doldu'}: {new Date(p.flashDealEndsAt).toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        disabled={busyId === p.id}
                        onClick={() => quickStart(p, 6)}
                        className="px-2 py-1 text-xs bg-accent-50 text-accent-700 rounded hover:bg-accent-100 cursor-pointer"
                      >+6h</button>
                      <button
                        disabled={busyId === p.id}
                        onClick={() => quickStart(p, 24)}
                        className="px-2 py-1 text-xs bg-accent-50 text-accent-700 rounded hover:bg-accent-100 cursor-pointer"
                      >+24h</button>
                      <button
                        disabled={busyId === p.id || !drafts[p.id]}
                        onClick={() => setEndsAt(p, fromLocalInput(drafts[p.id] ?? ''))}
                        className="px-3 py-1 text-xs bg-primary-900 text-white rounded hover:bg-primary-800 cursor-pointer disabled:opacity-50"
                      >Kaydet</button>
                      {p.flashDealEndsAt && (
                        <button
                          disabled={busyId === p.id}
                          onClick={() => setEndsAt(p, null)}
                          className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 cursor-pointer"
                        >Bitir</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-primary-400">Ürün bulunamadı.</div>
          )}
          {loading && <div className="text-center py-12 text-sm text-primary-400">Yükleniyor...</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
