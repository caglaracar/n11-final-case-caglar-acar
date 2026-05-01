import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { productService } from '@/services';
import type { Product } from '@/types/api';
import { formatPrice } from '@/lib/format';

/**
 * Admin — İndirim Yönetimi.
 *
 * Burada amaç ürün edit etmek DEĞİL; sadece fiyatı düşürmek.
 *
 * Tüm ürünler listelenir. Her satırda hızlı indirim butonları:
 *  -%10 / -%20 / özel %
 *
 * Mantık:
 *  - originalPrice boşsa, mevcut `price` referans olarak set edilir.
 *  - Yeni fiyat = originalPrice * (1 - pct/100). 2 ondalıklı yuvarlanır.
 *  - Backend `price < eskiPrice` olduğunda `priceDropAt = Instant.now()` yapar.
 *
 * "Sıfırla" → originalPrice null'a çekilir (tam fiyata döner; priceDropAt korunur).
 */
export default function AdminPriceDrops() {
  const [items, setItems]     = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [busyId, setBusyId]   = useState<string | null>(null);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState<'all' | 'discounted' | 'nodiscount'>('all');
  const [customPct, setCustomPct] = useState<Record<string, string>>({});

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      // Sayfa size sınırını yüksek tutuyoruz — admin tek seferde tüm kataloğu görmek istiyor.
      const page = await productService.findAll(0, 500);
      setItems(page?.content ?? []);
    } catch (e: any) {
      setError(e?.serverMessage || e?.message || 'Yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const discountedCount = useMemo(
    () => items.filter((p) => p.originalPrice && p.originalPrice > p.price).length,
    [items],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      const hasDiscount = !!(p.originalPrice && p.originalPrice > p.price);
      if (filter === 'discounted' && !hasDiscount) return false;
      if (filter === 'nodiscount' && hasDiscount) return false;
      return true;
    });
  }, [items, search, filter]);

  /** Yüzde ile indirim uygula. */
  const applyDiscount = async (p: Product, pct: number) => {
    if (!isFinite(pct) || pct <= 0 || pct >= 100) {
      alert('Lütfen 1–99 arasında bir yüzde girin.');
      return;
    }
    setBusyId(p.id);
    try {
      // Referans fiyat: originalPrice boşsa mevcut price referans alınır.
      const ref = p.originalPrice && p.originalPrice > 0 ? p.originalPrice : p.price;
      const newPrice = parseFloat((ref * (1 - pct / 100)).toFixed(2));

      if (newPrice >= p.price) {
        alert('Yeni fiyat mevcut fiyattan düşük olmalı.');
        return;
      }

      await productService.update(p.id, { price: newPrice, originalPrice: ref });
      // Server zaten priceDropAt'ı set eder; full refresh yapmak en güvenli yol.
      await fetchAll();
      setCustomPct((s) => { const n = { ...s }; delete n[p.id]; return n; });
    } catch (e: any) {
      alert(e?.serverMessage || e?.message || 'Güncellenemedi.');
    } finally {
      setBusyId(null);
    }
  };

  /** İndirimi kaldır: originalPrice'ı null'a çek (BE update null gönderildiğinde dokunmuyor — küçük bir trick: aynı price'ı originalPrice yap). */
  const clearDiscount = async (p: Product) => {
    if (!p.originalPrice || p.originalPrice <= p.price) return;
    setBusyId(p.id);
    try {
      // originalPrice = price yaparak indirim göstergesini kapatıyoruz; price'a dokunmuyoruz.
      await productService.update(p.id, { originalPrice: p.price });
      await fetchAll();
    } catch (e: any) {
      alert(e?.serverMessage || e?.message || 'Güncellenemedi.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl text-primary-900 font-medium">İndirim Yönetimi</h1>
          <p className="text-sm text-primary-400">
            {items.length} ürün listeleniyor — {discountedCount} tanesinde aktif indirim var.
            İndirim uygulanan ürünler kullanıcı tarafında <strong>Fiyatı Düşenler</strong> bölümünde görünür.
          </p>
        </div>

        {/* Arama + filtre + yenile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400">
              <i className="ri-search-line text-sm"></i>
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün ara..."
              className="w-full pl-9 pr-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500 bg-white"
            />
          </div>
          <div className="flex border border-surface-300 rounded-md bg-white overflow-hidden text-sm">
            {(['all', 'discounted', 'nodiscount'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 cursor-pointer whitespace-nowrap ${filter === f ? 'bg-primary-900 text-white' : 'text-primary-600 hover:bg-surface-50'}`}
              >
                {f === 'all' ? 'Tümü' : f === 'discounted' ? 'İndirimli' : 'İndirimsiz'}
              </button>
            ))}
          </div>
          <button
            onClick={fetchAll}
            className="px-4 py-2 text-sm bg-white border border-surface-300 rounded-md hover:bg-surface-50 cursor-pointer text-primary-700"
          >
            <i className="ri-refresh-line mr-1"></i>Yenile
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600">{error}</div>}

        <div className="bg-white border border-surface-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Ürün</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Satış / Liste</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Son düşüş</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">İndirim Uygula</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const hasDiscount = !!(p.originalPrice && p.originalPrice > p.price);
                const discountPct = hasDiscount
                  ? Math.round((1 - p.price / (p.originalPrice as number)) * 100)
                  : 0;
                const busy = busyId === p.id;
                const customVal = customPct[p.id] ?? '';

                return (
                  <tr key={p.id} className="border-t border-surface-100 hover:bg-surface-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-contain rounded-md bg-surface-50 p-0.5" />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-surface-100 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-primary-900 truncate max-w-[260px]">{p.name}</p>
                          <p className="text-xs text-primary-400">{p.brand || '—'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-primary-900 font-semibold">{formatPrice(p.price, p.currency)}</p>
                      {hasDiscount ? (
                        <p className="text-xs">
                          <span className="text-primary-400 line-through">{formatPrice(p.originalPrice as number, p.currency)}</span>
                          <span className="ml-2 inline-block px-1.5 py-0.5 bg-red-50 text-red-700 rounded font-bold">-%{discountPct}</span>
                        </p>
                      ) : (
                        <p className="text-xs text-primary-400">İndirim yok</p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs text-primary-600">
                        {p.priceDropAt ? new Date(p.priceDropAt).toLocaleString('tr-TR') : '—'}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 flex-wrap justify-end">
                        <button
                          disabled={busy}
                          onClick={() => applyDiscount(p, 10)}
                          className="px-2 py-1 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 cursor-pointer disabled:opacity-50"
                          title="Liste fiyatından %10 indir"
                        >-%10</button>
                        <button
                          disabled={busy}
                          onClick={() => applyDiscount(p, 20)}
                          className="px-2 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 cursor-pointer disabled:opacity-50"
                          title="Liste fiyatından %20 indir"
                        >-%20</button>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          step={1}
                          value={customVal}
                          onChange={(e) => setCustomPct((s) => ({ ...s, [p.id]: e.target.value }))}
                          placeholder="%"
                          className="w-14 px-2 py-1 border border-surface-300 rounded text-xs"
                        />
                        <button
                          disabled={busy || !customVal}
                          onClick={() => applyDiscount(p, parseFloat(customVal))}
                          className="px-2 py-1 text-xs bg-primary-900 text-white rounded hover:bg-primary-800 cursor-pointer disabled:opacity-50"
                        >Uygula</button>
                        {hasDiscount && (
                          <button
                            disabled={busy}
                            onClick={() => clearDiscount(p)}
                            className="px-2 py-1 text-xs bg-surface-100 text-primary-700 border border-surface-300 rounded hover:bg-surface-200 cursor-pointer disabled:opacity-50"
                            title="İndirimi kaldır (fiyat değişmez)"
                          >Sıfırla</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-primary-400">
              {search || filter !== 'all' ? 'Eşleşen ürün bulunamadı.' : 'Henüz ürün yok.'}
            </div>
          )}
          {loading && <div className="text-center py-12 text-sm text-primary-400">Yükleniyor...</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
