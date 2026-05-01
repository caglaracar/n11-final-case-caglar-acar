import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { reviewService } from '@/services';
import type { Page, Review } from '@/types/api';

export default function AdminReviews() {
  const [page, setPage] = useState<Page<Review> | null>(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reviewService.adminFindAll(pageNumber, pageSize);
      setPage(result);
    } catch (e: any) {
      setError(e?.serverMessage || 'Yorumlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize]);

  const items = page?.content ?? [];
  const totalElements = page?.totalElements ?? 0;
  const totalPages = page?.totalPages ?? 0;

  const handleDelete = async (id: string) => {
    if (!confirm('Yorum silinsin mi?')) return;
    try {
      await reviewService.delete(id);
      fetchPage();
    } catch (e: any) {
      alert(e?.serverMessage || 'Silinemedi.');
    }
  };

  const stars = (n: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <i key={i} className={`ri-star-${i < n ? 'fill' : 'line'} ${i < n ? 'text-amber-400' : 'text-surface-300'}`} />
    ));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-primary-900 font-medium">Yorumlar</h1>
            <p className="text-sm text-primary-400">
              {totalElements > 0
                ? `Toplam ${totalElements} yorum · Sayfa ${pageNumber + 1}/${Math.max(totalPages, 1)}`
                : 'Müşteri yorumlarını yönet'}
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
            {[10, 20, 50, 100].map((s) => (
              <option key={s} value={s}>{s} / sayfa</option>
            ))}
          </select>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600">{error}</div>}

        <div className="bg-white border border-surface-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Yazar</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Puan</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Yorum</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Ürün</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Tarih</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-t border-surface-100 hover:bg-surface-50 align-top">
                  <td className="px-6 py-4">
                    <p className="font-medium text-primary-900">{r.authorName || 'Anonim'}</p>
                    <p className="text-xs text-primary-400">#{r.authorAuthId}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{stars(r.rating)}</td>
                  <td className="px-6 py-4 max-w-md">
                    {r.title && <p className="font-medium text-primary-900">{r.title}</p>}
                    <p className="text-primary-700 line-clamp-3">{r.comment}</p>
                  </td>
                  <td className="px-6 py-4 text-primary-500 font-mono text-xs">
                    <a href={`/product/${r.productId}`} className="hover:text-accent-600" target="_blank" rel="noreferrer">
                      {r.productId.slice(-6)}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-primary-500 text-xs">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-md text-red-500 hover:bg-red-50 cursor-pointer"
                      title="Sil"
                    >
                      <i className="ri-delete-bin-line" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && items.length === 0 && (
            <div className="text-center py-12 text-sm text-primary-400">Henüz yorum yok.</div>
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
