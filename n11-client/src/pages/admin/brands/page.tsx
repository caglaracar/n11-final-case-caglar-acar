import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { brandService, type Brand, type BrandUpsertBody } from '@/services';

const emptyForm = {
  name: '',
  description: '',
  slug: '',
  logoUrl: '',
  active: true,
  sortOrder: 0,
};

export default function AdminBrands() {
  const [items, setItems] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await brandService.findAll();
      setItems(list);
    } catch (e: any) {
      setError(e?.serverMessage || 'Markalar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((b) => b.name.toLowerCase().includes(q));
  }, [items, search]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (b: Brand) => {
    setEditingId(b.id);
    setForm({
      name: b.name,
      description: b.description ?? '',
      slug: b.slug ?? '',
      logoUrl: b.logoUrl ?? '',
      active: b.active ?? true,
      sortOrder: b.sortOrder ?? 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu markayı silmek istediğine emin misin? (Bağlı ürün varsa silinemez.)')) return;
    try {
      await brandService.delete(id);
      fetchAll();
    } catch (e: any) {
      alert(e?.serverMessage || 'Silinemedi.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('İsim zorunlu.');
      return;
    }
    setSubmitting(true);
    try {
      const body: BrandUpsertBody = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        slug: form.slug.trim() || undefined,
        logoUrl: form.logoUrl.trim() || undefined,
        active: form.active,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (editingId) {
        await brandService.update(editingId, body);
      } else {
        await brandService.create({ ...body, name: body.name! });
      }
      setShowModal(false);
      fetchAll();
    } catch (err: any) {
      alert(err?.serverMessage || 'Kaydedilemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-primary-900 font-medium">Markalar</h1>
            <p className="text-sm text-primary-400">Ürünlerin marka kataloğu</p>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4 cursor-pointer">
            <i className="ri-add-line" /> Yeni Marka
          </button>
        </div>

        <div className="relative max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-primary-400">
            <i className="ri-search-line text-sm"></i>
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Marka ara..."
            className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500 bg-white"
          />
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600">{error}</div>}

        <div className="bg-white border border-surface-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Sıra</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Logo</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">İsim</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Slug</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">Durum</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-primary-500 uppercase tracking-wider">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-t border-surface-100 hover:bg-surface-50">
                  <td className="px-6 py-4 text-primary-500">{b.sortOrder ?? 0}</td>
                  <td className="px-6 py-4">
                    {b.logoUrl ? (
                      <img src={b.logoUrl} alt={b.name} className="w-10 h-10 object-contain rounded-md bg-surface-50 border border-surface-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-surface-50 border border-dashed border-surface-300 flex items-center justify-center text-primary-300">
                        <i className="ri-bookmark-line" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-primary-900">{b.name}</p>
                    {b.description && <p className="text-xs text-primary-400">{b.description}</p>}
                  </td>
                  <td className="px-6 py-4 text-primary-500 font-mono text-xs">{b.slug || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${b.active ? 'bg-green-100 text-green-700' : 'bg-surface-100 text-primary-500'}`}>
                      {b.active ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(b)} className="w-8 h-8 flex items-center justify-center rounded-md text-primary-500 hover:bg-surface-100 cursor-pointer">
                        <i className="ri-pencil-line" />
                      </button>
                      <button onClick={() => handleDelete(b.id)} className="w-8 h-8 flex items-center justify-center rounded-md text-red-500 hover:bg-red-50 cursor-pointer">
                        <i className="ri-delete-bin-line" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-primary-400">Marka yok.</div>
          )}
          {loading && <div className="text-center py-12 text-sm text-primary-400">Yükleniyor...</div>}
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-surface-200 flex items-center justify-between">
                <h2 className="font-display text-lg font-medium text-primary-900">
                  {editingId ? 'Marka Güncelle' : 'Yeni Marka'}
                </h2>
                <button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center text-primary-400 cursor-pointer">
                  <i className="ri-close-line text-xl" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <Field label="İsim *">
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500 bg-white" />
                </Field>
                <Field label="Açıklama">
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500 bg-white min-h-[60px]" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Slug">
                    <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="apple" className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500 bg-white" />
                  </Field>
                  <Field label="Sıra">
                    <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500 bg-white" />
                  </Field>
                </div>
                <Field label="Logo URL">
                  <input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500 bg-white" />
                </Field>
                <label className="flex items-center gap-2 text-sm text-primary-700">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  Aktif
                </label>
              </div>
              <div className="p-6 border-t border-surface-200 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-primary-600 cursor-pointer">İptal</button>
                <button type="submit" disabled={submitting} className="btn-primary text-sm py-2 px-4 cursor-pointer">
                  {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-primary-500 uppercase tracking-wider mb-1">{label}</span>
      {children}
    </label>
  );
}
