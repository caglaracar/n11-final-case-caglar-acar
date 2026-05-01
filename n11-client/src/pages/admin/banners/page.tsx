import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { bannerService, type Banner, type BannerUpsertBody } from '@/services';

const inputCls =
  'w-full px-3 py-2 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500 bg-white';

const emptyForm = {
  eyebrow: '',
  title: '',
  subtitle: '',
  ctaLabel: '',
  ctaHref: '',
  imageUrl: '',
  badge: '',
  sortOrder: 0,
  active: true,
};

export default function AdminBanners() {
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await bannerService.adminFindAll();
      setItems(list);
    } catch (e: any) {
      setError(e?.serverMessage || 'Banner listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (b: Banner) => {
    setEditingId(b.id);
    setForm({
      eyebrow: b.eyebrow ?? '',
      title: b.title,
      subtitle: b.subtitle ?? '',
      ctaLabel: b.ctaLabel ?? '',
      ctaHref: b.ctaHref ?? '',
      imageUrl: b.imageUrl,
      badge: b.badge ?? '',
      sortOrder: b.sortOrder ?? 0,
      active: b.active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Banner silinsin mi?')) return;
    try {
      await bannerService.delete(id);
      fetchAll();
    } catch (e: any) {
      alert(e?.serverMessage || 'Silinemedi.');
    }
  };

  const handleToggle = async (b: Banner) => {
    try {
      await bannerService.update(b.id, { active: !b.active });
      fetchAll();
    } catch (e: any) {
      alert(e?.serverMessage || 'Güncellenemedi.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.imageUrl.trim()) {
      alert('Başlık ve görsel URL zorunlu.');
      return;
    }
    setSubmitting(true);
    try {
      const body: BannerUpsertBody = {
        eyebrow: form.eyebrow.trim() || undefined,
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || undefined,
        ctaLabel: form.ctaLabel.trim() || undefined,
        ctaHref: form.ctaHref.trim() || undefined,
        imageUrl: form.imageUrl.trim(),
        badge: form.badge.trim() || undefined,
        sortOrder: Number(form.sortOrder) || 0,
        active: form.active,
      };
      if (editingId) {
        await bannerService.update(editingId, body);
      } else {
        await bannerService.create({ ...body, title: body.title!, imageUrl: body.imageUrl! });
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
            <h1 className="font-display text-2xl text-primary-900 font-medium">Banner / Hero</h1>
            <p className="text-sm text-primary-400">Ana sayfa hero alanı</p>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4 cursor-pointer">
            <i className="ri-add-line" /> Yeni Banner
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((b) => (
            <div key={b.id} className="bg-white border border-surface-200 rounded-lg overflow-hidden flex flex-col">
              <div className="aspect-[16/7] bg-surface-100 relative">
                <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                {b.badge && (
                  <span className="absolute top-3 left-3 text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-600 text-white">
                    {b.badge}
                  </span>
                )}
                <span className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full ${b.active ? 'bg-green-100 text-green-700' : 'bg-surface-200 text-primary-600'}`}>
                  {b.active ? 'Yayında' : 'Pasif'}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col gap-1">
                {b.eyebrow && <p className="text-xs uppercase tracking-wider text-accent-600 font-medium">{b.eyebrow}</p>}
                <p className="font-display text-lg text-primary-900">{b.title}</p>
                {b.subtitle && <p className="text-sm text-primary-500">{b.subtitle}</p>}
                {b.ctaLabel && (
                  <p className="text-xs text-primary-400 mt-2">
                    CTA: <span className="font-medium text-primary-700">{b.ctaLabel}</span> → <span className="font-mono">{b.ctaHref || '—'}</span>
                  </p>
                )}
                <p className="text-xs text-primary-400">Sıra: {b.sortOrder}</p>
              </div>
              <div className="px-4 py-3 border-t border-surface-100 flex items-center justify-end gap-2">
                <button onClick={() => handleToggle(b)} className="text-xs px-3 py-1.5 rounded-md text-primary-600 hover:bg-surface-100 cursor-pointer">
                  {b.active ? 'Pasifleştir' : 'Yayına al'}
                </button>
                <button onClick={() => openEdit(b)} className="text-xs px-3 py-1.5 rounded-md text-primary-700 hover:bg-surface-100 cursor-pointer">
                  Düzenle
                </button>
                <button onClick={() => handleDelete(b.id)} className="text-xs px-3 py-1.5 rounded-md text-red-600 hover:bg-red-50 cursor-pointer">
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
        {!loading && items.length === 0 && (
          <div className="text-center py-12 text-sm text-primary-400 bg-white border border-surface-200 rounded-lg">
            Henüz banner yok.
          </div>
        )}
        {loading && <div className="text-center py-12 text-sm text-primary-400">Yükleniyor...</div>}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-surface-200 flex items-center justify-between">
                <h2 className="font-display text-lg font-medium text-primary-900">
                  {editingId ? 'Banner Güncelle' : 'Yeni Banner'}
                </h2>
                <button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center text-primary-400 cursor-pointer">
                  <i className="ri-close-line text-xl" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <Field label="Üst etiket (eyebrow)">
                  <input value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} placeholder="Teknoloji Ürünleri" className={inputCls} />
                </Field>
                <Field label="Başlık *">
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="%30'a Varan İndirim" className={inputCls} />
                </Field>
                <Field label="Alt metin">
                  <textarea value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={`${inputCls} min-h-[60px]`} />
                </Field>
                <Field label="Görsel URL *">
                  <input required value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className={inputCls} />
                </Field>
                {form.imageUrl && (
                  <div className="aspect-[16/7] bg-surface-100 rounded-md overflow-hidden">
                    <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="CTA metni"><input value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} placeholder="Alışverişe Başla" className={inputCls} /></Field>
                  <Field label="CTA link"><input value={form.ctaHref} onChange={(e) => setForm({ ...form, ctaHref: e.target.value })} placeholder="/products?categoryId=..." className={inputCls} /></Field>
                  <Field label="Rozet"><input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="YENİ / %50" className={inputCls} /></Field>
                  <Field label="Sıra"><input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className={inputCls} /></Field>
                </div>
                <label className="flex items-center gap-2 text-sm text-primary-700">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  Yayında
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
