import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { productService, categoryService, brandService, type Category, type Brand } from '@/services';
import type { CreateProductRequest, Page, Product } from '@/types/api';

const statusColor: Record<string, string> = {
  'In Stock': 'bg-green-100 text-green-700',
  'Low Stock': 'bg-amber-100 text-amber-700',
  'Out of Stock': 'bg-red-100 text-red-700',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const emptyForm: CreateProductRequest = {
  name: '',
  price: 0,
  currency: 'TRY',
  categoryId: '',
  stock: 0,
  description: '',
  imageUrl: '',
  brand: '',
};

function getStatus(count: number) {
  if (count <= 0) return 'Out of Stock';
  if (count < 20) return 'Low Stock';
  return 'In Stock';
}

const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48"><rect width="40" height="48" fill="%23f5f5f4"/><path fill="%23a8a29e" d="M12 16h16v16H12zm2 2v12h12V18H14zm2 2h2v2h-2zm6 4l-2 4h-6l4-6 2 2 4-6 4 8h-4z"/></svg>'
  );

export default function AdminProducts() {
  const [page, setPage] = useState<Page<Product> | null>(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateProductRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const categoryNameById = useMemo(() => {
    const m = new Map<string, string>();
    categories.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [categories]);

  const fetchPage = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await productService.findAll(
        pageNumber,
        pageSize,
        search || undefined,
        categoryFilter || undefined,
      );
      setPage(result);
    } catch (e: any) {
      setError(e?.serverMessage || 'Ürünler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    categoryService.findAll().then(setCategories).catch(() => setCategories([]));
    brandService.findAll().then(setBrands).catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize, search, categoryFilter]);

  const items = page?.content ?? [];
  const totalElements = page?.totalElements ?? 0;
  const totalPages = page?.totalPages ?? 0;

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, categoryId: categoryFilter || categories[0]?.id || '' });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: p.price,
      currency: p.currency,
      categoryId: p.categoryId || '',
      stock: p.stock,
      description: p.description || '',
      imageUrl: p.imageUrl || '',
      brand: p.brand || '',
      subcategory: p.subcategory,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğine emin misin?')) return;
    try {
      await productService.delete(id);
      fetchPage();
    } catch (e: any) {
      alert(e?.serverMessage || 'Silinemedi.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.categoryId || form.price <= 0) {
      alert('İsim, kategori ve fiyat zorunlu.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await productService.update(editingId, form);
      } else {
        await productService.create(form);
      }
      setShowModal(false);
      fetchPage();
    } catch (err: any) {
      alert(err?.serverMessage || 'Kaydedilemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPageNumber(0);
    setSearch(searchInput.trim());
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-primary-900 font-medium">Ürünler</h1>
            <p className="text-sm text-primary-400">
              {totalElements > 0
                ? `Toplam ${totalElements} ürün · Sayfa ${pageNumber + 1}/${Math.max(totalPages, 1)}`
                : 'Ürün kataloğunu yönet'}
            </p>
          </div>
          <button
            onClick={openAdd}
            className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4 cursor-pointer"
          >
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-add-line"></i>
            </span>
            Yeni Ürün
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <form onSubmit={submitSearch} className="relative flex-1 w-full sm:max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-primary-400">
              <i className="ri-search-line text-sm"></i>
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ürün ara (Enter)..."
              className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500 bg-white"
            />
          </form>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setPageNumber(0);
              setCategoryFilter(e.target.value);
            }}
            className="text-sm border border-surface-300 rounded-md px-3 py-2.5 focus:outline-none focus:border-primary-500 bg-white"
          >
            <option value="">Tüm kategoriler</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageNumber(0);
              setPageSize(Number(e.target.value));
            }}
            className="text-sm border border-surface-300 rounded-md px-3 py-2.5 focus:outline-none focus:border-primary-500 bg-white"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s} / sayfa
              </option>
            ))}
          </select>
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
                    Ürün
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">
                    Fiyat
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">
                    Stok
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((product) => {
                  const stock = product.stock ?? 0;
                  const status = getStatus(stock);
                  const catName = product.categoryId
                    ? categoryNameById.get(product.categoryId) || product.categoryId
                    : '—';
                  return (
                    <tr
                      key={product.id}
                      className="border-t border-surface-100 hover:bg-surface-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 rounded-md overflow-hidden flex-shrink-0 bg-surface-100">
                            <img
                              src={product.imageUrl || FALLBACK_IMG}
                              alt={product.name}
                              loading="lazy"
                              onError={(e) => {
                                const img = e.currentTarget;
                                if (img.src !== FALLBACK_IMG) img.src = FALLBACK_IMG;
                              }}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-primary-900 text-sm">{product.name}</p>
                            <p className="text-xs text-primary-400">ID: {product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-primary-600">{catName}</td>
                      <td className="px-6 py-4 font-medium text-primary-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-primary-600">{stock}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[status]}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/product/${product.id}`}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-primary-500 hover:text-primary-900 hover:bg-surface-100 transition-all cursor-pointer"
                          >
                            <i className="ri-eye-line text-base"></i>
                          </Link>
                          <button
                            onClick={() => openEdit(product)}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-primary-500 hover:text-primary-900 hover:bg-surface-100 transition-all cursor-pointer"
                          >
                            <i className="ri-pencil-line text-base"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                          >
                            <i className="ri-delete-bin-line text-base"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && items.length === 0 && (
            <div className="text-center py-12">
              <p className="text-primary-400 text-sm">Kriterlere uygun ürün yok.</p>
            </div>
          )}
          {loading && (
            <div className="text-center py-12 text-sm text-primary-400">Yükleniyor...</div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 px-6 py-3 border-t border-surface-200 text-sm">
              <span className="text-primary-500">
                {pageNumber * pageSize + 1}–{Math.min((pageNumber + 1) * pageSize, totalElements)} / {totalElements}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={pageNumber === 0}
                  onClick={() => setPageNumber(0)}
                  className="px-2 py-1 rounded-md text-primary-600 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <i className="ri-skip-back-line"></i>
                </button>
                <button
                  type="button"
                  disabled={pageNumber === 0}
                  onClick={() => setPageNumber((n) => Math.max(0, n - 1))}
                  className="px-2 py-1 rounded-md text-primary-600 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <i className="ri-arrow-left-s-line"></i>
                </button>
                <span className="px-3 py-1 text-primary-700">
                  {pageNumber + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={pageNumber + 1 >= totalPages}
                  onClick={() => setPageNumber((n) => n + 1)}
                  className="px-2 py-1 rounded-md text-primary-600 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <i className="ri-arrow-right-s-line"></i>
                </button>
                <button
                  type="button"
                  disabled={pageNumber + 1 >= totalPages}
                  onClick={() => setPageNumber(totalPages - 1)}
                  className="px-2 py-1 rounded-md text-primary-600 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <i className="ri-skip-forward-line"></i>
                </button>
              </div>
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-surface-200 flex items-center justify-between">
                <h2 className="font-display text-lg font-medium text-primary-900">
                  {editingId ? 'Ürün Düzenle' : 'Yeni Ürün'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-primary-400 hover:text-primary-900 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-primary-700 uppercase tracking-wider mb-1.5">
                    Ürün Adı
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-primary-700 uppercase tracking-wider mb-1.5">
                      Fiyat
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      required
                      className="w-full px-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-700 uppercase tracking-wider mb-1.5">
                      Stok
                    </label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-primary-700 uppercase tracking-wider mb-1.5">
                      Kategori
                    </label>
                    <select
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500 bg-white"
                    >
                      <option value="">Kategori seç...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-700 uppercase tracking-wider mb-1.5">
                      Para Birimi
                    </label>
                    <input
                      type="text"
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      className="w-full px-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-primary-700 uppercase tracking-wider mb-1.5">
                    Marka
                  </label>
                  <select
                    value={form.brand || ''}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full px-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500 bg-white"
                  >
                    <option value="">— Marka seçin —</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-primary-700 uppercase tracking-wider mb-1.5">
                    Görsel URL
                  </label>
                  <input
                    type="text"
                    value={form.imageUrl || ''}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="w-full px-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-primary-700 uppercase tracking-wider mb-1.5">
                    Açıklama
                  </label>
                  <textarea
                    rows={3}
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500 resize-none"
                  ></textarea>
                </div>
              </div>
              <div className="p-6 border-t border-surface-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-primary-600 hover:text-primary-900 cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-sm py-2 px-4 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Kaydediliyor...' : editingId ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
