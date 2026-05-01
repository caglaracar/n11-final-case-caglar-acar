import { useEffect, useState } from 'react';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import ProductCard from '@/components/base/ProductCard';
import { productService, toUiProducts, type UiProduct } from '@/services';

/**
 * Public — Fiyatı Düşenler
 * Backend `priceDropAt` alanına göre en son fiyat düşüşlerini en üste alır.
 */
export default function PriceDropsPage() {
  const [items, setItems] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    productService.priceDrops(50)
      .then((res) => { if (!cancelled) setItems(toUiProducts(res ?? [])); })
      .catch((e) => { if (!cancelled) setError(e?.serverMessage || 'Yüklenemedi.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="section-padding py-8">
        <header className="mb-6">
          <h1 className="font-display text-3xl text-primary-900 font-medium">Fiyatı Düşenler</h1>
          <p className="text-sm text-primary-500 mt-1">
            Son fiyat indirimleri — en yeni düşüşler en üstte.
          </p>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600 mb-4">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-16 text-sm text-primary-400">Yükleniyor...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-sm text-primary-400">
            Şu anda fiyatı düşen ürün yok.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {items.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
