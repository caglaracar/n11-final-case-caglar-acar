import { useEffect, useState, Fragment } from 'react';
import AdminLayout from '../components/AdminLayout';
import { wishlistService, productService, type AdminWishlistEntry } from '@/services';
import type { Page, Product } from '@/types/api';

export default function AdminWishlists() {
  const [page, setPage] = useState<Page<AdminWishlistEntry> | null>(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [productMap, setProductMap] = useState<Record<string, Product | 'missing'>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const fetchPage = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await wishlistService.adminListAll(pageNumber, pageSize);
      setPage(result);
    } catch (e: any) {
      setError(e?.serverMessage || 'Favori listeleri alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize]);

  const ensureProducts = async (ids: string[]) => {
    const missing = ids.filter((id) => !productMap[id] && !loadingIds.has(id));
    if (missing.length === 0) return;
    setLoadingIds((prev) => {
      const next = new Set(prev);
      missing.forEach((id) => next.add(id));
      return next;
    });
    const results = await Promise.allSettled(missing.map((id) => productService.findById(id)));
    setProductMap((prev) => {
      const next = { ...prev };
      results.forEach((r, i) => {
        const id = missing[i];
        next[id] = r.status === 'fulfilled' ? r.value : 'missing';
      });
      return next;
    });
    setLoadingIds((prev) => {
      const next = new Set(prev);
      missing.forEach((id) => next.delete(id));
      return next;
    });
  };

  const toggleExpand = (key: string, productIds: string[]) => {
    if (expanded === key) {
      setExpanded(null);
      return;
    }
    setExpanded(key);
    ensureProducts(productIds);
  };

  const formatPrice = (p: Product) =>
    `${p.price?.toLocaleString('tr-TR')} ${p.currency || ''}`.trim();

  const items = page?.content ?? [];
  const totalElements = page?.totalElements ?? 0;
  const totalPages = page?.totalPages ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-primary-900 font-medium">Favoriler</h1>
            <p className="text-sm text-primary-400">
              {totalElements > 0
                ? `${totalElements} kullanıcı · Sayfa ${pageNumber + 1}/${Math.max(totalPages, 1)}`
                : 'Müşterilerin favori ürünleri'}
            </p>
          </div>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageNumber(0);
              setPageSize(Number(e.target.value));
            }}
            className="text-sm border border-surface-300 rounded-md px-3 py-2.5 focus:outline-none focus:border-primary-500 bg-white"
          >
            {[10, 20, 50].map((s) => (<option key={s} value={s}>{s} / sayfa</option>))}
          </select>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600">{error}</div>}

        <div className="bg-white border border-surface-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Kullanıcı</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">E-posta</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Favori Sayısı</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Detay</th>
              </tr>
            </thead>
            <tbody>
              {items.map((w) => {
                const key = String(w.authId);
                const isOpen = expanded === key;
                return (
                  <Fragment key={key}>
                    <tr className="border-t border-surface-100 hover:bg-surface-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-primary-900">{w.userName}</p>
                        <p className="text-xs text-primary-400">#{w.authId}</p>
                      </td>
                      <td className="px-6 py-4 text-primary-600">{w.email || '—'}</td>
                      <td className="px-6 py-4 text-primary-700 font-medium">{w.itemCount}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleExpand(key, w.productIds)}
                          disabled={w.itemCount === 0}
                          className="text-xs px-3 py-1.5 rounded-md border border-surface-300 disabled:opacity-40 hover:bg-surface-50 cursor-pointer"
                        >
                          {isOpen ? 'Kapat' : 'Ürünleri göster'}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-surface-50/50">
                        <td colSpan={4} className="px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {w.productIds.map((pid) => {
                              const entry = productMap[pid];
                              const isLoading = loadingIds.has(pid);
                              if (isLoading || entry === undefined) {
                                return (
                                  <div key={pid} className="flex items-center gap-3 p-3 bg-white border border-surface-200 rounded-md">
                                    <div className="w-12 h-12 rounded bg-surface-100 animate-pulse" />
                                    <div className="flex-1 space-y-1">
                                      <div className="h-3 bg-surface-100 rounded animate-pulse w-3/4" />
                                      <div className="h-3 bg-surface-100 rounded animate-pulse w-1/2" />
                                    </div>
                                  </div>
                                );
                              }
                              if (entry === 'missing') {
                                return (
                                  <div key={pid} className="flex items-center gap-3 p-3 bg-white border border-red-200 rounded-md">
                                    <div className="w-12 h-12 rounded bg-red-50 flex items-center justify-center text-red-400">
                                      <i className="ri-error-warning-line" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-red-600">Ürün bulunamadı</p>
                                      <p className="text-xs font-mono text-primary-400 truncate">{pid}</p>
                                    </div>
                                  </div>
                                );
                              }
                              const p = entry;
                              return (
                                <a
                                  key={pid}
                                  href={`/product/${pid}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-3 p-3 bg-white border border-surface-200 rounded-md hover:border-accent-400 transition-colors"
                                >
                                  {p.imageUrl ? (
                                    <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded object-cover bg-surface-50" />
                                  ) : (
                                    <div className="w-12 h-12 rounded bg-surface-100 flex items-center justify-center text-primary-300">
                                      <i className="ri-image-line" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-primary-900 truncate">{p.name}</p>
                                    <p className="text-xs text-primary-500">
                                      {p.brand && <span>{p.brand} · </span>}
                                      <span className="text-primary-700 font-medium">{formatPrice(p)}</span>
                                    </p>
                                    {(p.stock ?? 0) <= 0 && (
                                      <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600">Stok yok</span>
                                    )}
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          {!loading && items.length === 0 && (
            <div className="text-center py-12 text-sm text-primary-400">Kullanıcı yok.</div>
          )}
          {loading && <div className="text-center py-12 text-sm text-primary-400">Yükleniyor...</div>}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-primary-500">
              {pageNumber * pageSize + 1}–{Math.min((pageNumber + 1) * pageSize, totalElements)} / {totalElements}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPageNumber(0)} disabled={pageNumber === 0} className="px-3 py-1.5 rounded-md border border-surface-300 disabled:opacity-40 cursor-pointer">«</button>
              <button onClick={() => setPageNumber((p) => Math.max(0, p - 1))} disabled={pageNumber === 0} className="px-3 py-1.5 rounded-md border border-surface-300 disabled:opacity-40 cursor-pointer">‹</button>
              <span className="px-3">{pageNumber + 1} / {totalPages}</span>
              <button onClick={() => setPageNumber((p) => Math.min(totalPages - 1, p + 1))} disabled={pageNumber + 1 >= totalPages} className="px-3 py-1.5 rounded-md border border-surface-300 disabled:opacity-40 cursor-pointer">›</button>
              <button onClick={() => setPageNumber(totalPages - 1)} disabled={pageNumber + 1 >= totalPages} className="px-3 py-1.5 rounded-md border border-surface-300 disabled:opacity-40 cursor-pointer">»</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
