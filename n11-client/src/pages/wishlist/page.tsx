import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import ProductCard from '@/components/base/ProductCard';
import { productService, toUiProduct, type UiProduct } from '@/services';
import { useAuth, useWishlist } from '@/providers';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wishlist.length === 0) { setProducts([]); return; }
    setLoading(true);
    Promise.all(
      wishlist.map((id) =>
        productService.findById(id).then(toUiProduct).catch(() => null)
      )
    )
      .then((results) => setProducts(results.filter(Boolean) as UiProduct[]))
      .finally(() => setLoading(false));
  }, [wishlist]);

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <Navbar />
      <main className="flex-1 section-padding py-8 pt-36">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl text-primary-900 font-medium">Favorilerim</h1>
            <p className="text-sm text-primary-400 mt-1">
              {wishlist.length > 0 ? `${wishlist.length} ürün kaydedildi` : 'Henüz favori eklenmedi'}
            </p>
          </div>
          {products.length > 0 && (
            <button
              onClick={() => wishlist.forEach((id) => toggleWishlist(id))}
              className="text-sm text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              Tümünü Kaldır
            </button>
          )}
        </div>

        {!isAuthenticated && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-700">
            <i className="ri-information-line mr-1"></i>
            Giriş yaparsanız favorileriniz tüm cihazlarınızda senkronize olur.{' '}
            <Link to="/login" className="font-semibold underline">Giriş Yap</Link>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-primary-400 text-sm">Yükleniyor...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-surface-100 mx-auto mb-4">
              <i className="ri-heart-line text-4xl text-primary-300"></i>
            </div>
            <p className="text-primary-500 text-sm mb-4">Favori listeniz boş.</p>
            <Link to="/products" className="btn-primary inline-block">Ürünleri Keşfet</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
