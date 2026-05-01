import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth, useBasket, useWishlist } from '@/providers';
import { productService, reviewService, toUiProduct, type UiProduct } from '@/services';
import type { Review } from '@/types/api';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/base/ProductCard';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import ImageLightbox from '@/components/base/ImageLightbox';
import { formatPrice } from '@/lib/format';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useBasket();
  const { isAuthenticated, user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { products: allProducts } = useProducts(120);

  const [product, setProduct] = useState<UiProduct | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'features' | 'reviews' | 'shipping'>('features');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    productService
      .findById(id)
      .then((p) => {
        if (cancelled) return;
        const ui = toUiProduct(p);
        setProduct(ui);
        setActiveImage(ui.image);
      })
      .catch(() => {
        if (cancelled) return;
        // fallback: belki katalogta listelenenlerden biri
        const fromList = allProducts.find((p) => p.id === id);
        if (fromList) {
          setProduct(fromList);
          setActiveImage(fromList.image);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setReviewsLoading(true);
    reviewService
      .list(id, 0, 50)
      .then((p) => {
        if (!cancelled) setReviews(p.content || []);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  const relatedProducts = useMemo(
    () => allProducts.filter((p) => p.id !== id && p.category === product?.category).slice(0, 4),
    [allProducts, product?.category, id],
  );

  const discount = product?.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    toggleWishlist(product.id);
  };

  const submitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (reviewForm.comment.trim().length < 3) {
      setReviewError('Yorumunuz en az 3 karakter olmalıdır.');
      return;
    }
    setSubmitting(true);
    setReviewError(null);
    try {
      const created = await reviewService.create({
        productId: product.id,
        rating: reviewForm.rating,
        title: reviewForm.title.trim() || undefined,
        comment: reviewForm.comment.trim(),
      });
      setReviews((prev) => [created, ...prev]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      // ürün rating'ini güncellemiş olabiliriz; arka plan refresh
      productService
        .findById(product.id)
        .then((p) => setProduct(toUiProduct(p)))
        .catch(() => {});
    } catch (err: any) {
      setReviewError(err?.serverMessage || err?.message || 'Yorum gönderilemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
        <Navbar />
        <div className="pt-40 text-center flex-1 text-primary-400 text-sm">Yükleniyor...</div>
        <Footer />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
        <Navbar />
        <div className="pt-40 text-center flex-1">
          <h1 className="font-display text-2xl text-primary-900 mb-4">Product Not Found</h1>
          <Link to="/products" className="btn-primary">Back to Shop</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <div className="pt-32 md:pt-36 animate-page-enter">
        <div className="section-padding py-8 md:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-primary-400 mb-6 flex-wrap">
            <Link to="/" className="hover:text-accent-600 transition-colors">Anasayfa</Link>
            <i className="ri-arrow-right-s-line"></i>
            <Link to="/products" className="hover:text-accent-600 transition-colors">Ürünler</Link>
            <i className="ri-arrow-right-s-line"></i>
            <Link
              to={`/products?cat=${product.category}`}
              className="hover:text-accent-600 transition-colors"
            >
              {product.category}
            </Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-primary-700 font-medium line-clamp-1">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-12">
            {/* Image Panel */}
            <div className="space-y-3 lg:sticky lg:top-32 self-start">
              <div
                className="relative overflow-hidden rounded-2xl bg-surface-50 aspect-square border border-surface-200 cursor-zoom-in group"
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  src={activeImage || product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-110"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
                />
                {product.badge && (
                  <span className="absolute top-4 left-4 px-3 py-1.5 bg-accent-600 text-white text-xs font-bold rounded-full">
                    {product.badge}
                  </span>
                )}
                {discount > 0 && (
                  <span className="absolute top-4 right-4 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    -{discount}%
                  </span>
                )}
                <div className="absolute bottom-4 right-4 w-9 h-9 flex items-center justify-center bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 text-primary-600">
                  <i className="ri-zoom-in-line text-base"></i>
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(img)}
                      className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-surface-50 ${
                        activeImage === img
                          ? 'border-accent-500'
                          : 'border-surface-200 hover:border-accent-400'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-contain p-2" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-accent-600 mb-1 flex items-center gap-1.5">
                <i className="ri-price-tag-3-line text-sm"></i>
                {product.category}
              </p>
              <h1 className="font-display text-2xl md:text-3xl text-primary-900 font-bold mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${i < Math.floor(product.rating) ? 'text-amber-400' : 'text-surface-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm font-semibold text-primary-700">{product.rating.toFixed(1)}</span>
                <span className="text-sm text-primary-400">({product.reviews.toLocaleString()} değerlendirme)</span>
              </div>

              <div className="flex items-center gap-3 mb-6 p-4 bg-white rounded-xl border border-surface-200">
                <span className="text-3xl font-bold text-primary-900">{formatPrice(product.price, product.currency)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-primary-400 line-through">
                      {formatPrice(product.originalPrice, product.currency)}
                    </span>
                    <span className="text-sm font-bold text-white bg-red-500 px-2.5 py-1 rounded-lg">
                      %{discount} indirim
                    </span>
                  </>
                )}
              </div>

              <p className="text-primary-500 leading-relaxed mb-6 text-sm">
                {product.description || 'Bu ürün için açıklama henüz eklenmemiş.'}
              </p>

              <div className="text-xs text-primary-400 mb-4">
                {product.inStock ? (
                  <span className="text-green-600 font-semibold">
                    <i className="ri-checkbox-circle-line"></i> Stokta {product.stockCount} adet
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">
                    <i className="ri-close-circle-line"></i> Stokta yok
                  </span>
                )}
              </div>

              {/* Tabs */}
              <div className="mb-6">
                <div className="flex border-b border-surface-200 mb-4">
                  {([
                    { id: 'features', label: 'Özellikler' },
                    { id: 'reviews', label: 'Yorumlar' },
                    { id: 'shipping', label: 'Kargo & İade' },
                  ] as const).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`px-4 py-2 text-sm font-medium transition-all cursor-pointer whitespace-nowrap -mb-px border-b-2 ${
                        activeTab === t.id
                          ? 'border-accent-600 text-accent-600'
                          : 'border-transparent text-primary-500 hover:text-primary-800'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'features' && (
                  <ul className="space-y-2">
                    {(product.features ?? []).length === 0 ? (
                      <li className="text-sm text-primary-400">Henüz özellik girilmemiş.</li>
                    ) : (
                      product.features!.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-primary-600">
                          <span className="w-5 h-5 flex items-center justify-center text-accent-600 flex-shrink-0 mt-0.5">
                            <i className="ri-check-double-line text-sm"></i>
                          </span>
                          {feature}
                        </li>
                      ))
                    )}
                  </ul>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-3">
                    {isAuthenticated && (
                      <form onSubmit={submitReview} className="p-3 bg-white rounded-xl border border-surface-100">
                        <p className="text-sm font-semibold text-primary-900 mb-2">
                          Yorumunu paylaş, {user?.name || user?.userName}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setReviewForm((s) => ({ ...s, rating: n }))}
                              className={`text-xl ${
                                n <= reviewForm.rating ? 'text-amber-400' : 'text-surface-300'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <input
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm((s) => ({ ...s, title: e.target.value }))}
                          placeholder="Başlık (opsiyonel)"
                          className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-accent-400"
                        />
                        <textarea
                          required
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm((s) => ({ ...s, comment: e.target.value }))}
                          placeholder="Deneyimini yaz"
                          rows={3}
                          className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-accent-400"
                        />
                        {reviewError && <p className="text-xs text-red-600 mb-2">{reviewError}</p>}
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white text-sm font-bold rounded-lg disabled:opacity-50"
                        >
                          {submitting ? 'Gönderiliyor...' : 'Yorum Yap'}
                        </button>
                      </form>
                    )}
                    {reviewsLoading && (
                      <p className="text-sm text-primary-400">Yorumlar yükleniyor...</p>
                    )}
                    {!reviewsLoading && reviews.length === 0 && (
                      <p className="text-sm text-primary-400">Bu ürün için henüz yorum yapılmamış.</p>
                    )}
                    {reviews.map((r) => (
                      <div key={r.id} className="p-3 bg-white rounded-xl border border-surface-100">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-primary-900">
                            {r.authorName || `User #${r.authorAuthId}`}
                          </p>
                          <span className="text-xs text-primary-400">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <div className="flex mb-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-xs ${i < r.rating ? 'text-amber-400' : 'text-surface-300'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        {r.title && <p className="text-xs font-semibold text-primary-700">{r.title}</p>}
                        <p className="text-xs text-primary-500">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div className="space-y-3 text-sm text-primary-600">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-surface-100">
                      <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-accent-100 text-accent-600 flex-shrink-0">
                        <i className="ri-truck-line"></i>
                      </span>
                      <div>
                        <p className="font-semibold text-primary-900">Standart Kargo</p>
                        <p className="text-xs text-primary-400">
                          $100 üzeri siparişlerde ücretsiz — 5-7 iş günü
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-surface-100">
                      <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-accent-100 text-accent-600 flex-shrink-0">
                        <i className="ri-flashlight-line"></i>
                      </span>
                      <div>
                        <p className="font-semibold text-primary-900">Hızlı Teslimat</p>
                        <p className="text-xs text-primary-400">$9.99'dan başlayan fiyatlarla — 1-2 iş günü</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-surface-100">
                      <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-accent-100 text-accent-600 flex-shrink-0">
                        <i className="ri-refresh-line"></i>
                      </span>
                      <div>
                        <p className="font-semibold text-primary-900">30 Gün İade Hakkı</p>
                        <p className="text-xs text-primary-400">Sorusuz sualsiz — tam para iadesi garantisi</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity + Add */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center border-2 border-surface-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-12 flex items-center justify-center text-primary-600 hover:bg-surface-100 transition-colors cursor-pointer"
                  >
                    <i className="ri-subtract-line"></i>
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-primary-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-11 h-12 flex items-center justify-center text-primary-600 hover:bg-surface-100 transition-colors cursor-pointer"
                  >
                    <i className="ri-add-line"></i>
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 py-3.5 rounded-xl font-bold transition-all duration-300 whitespace-nowrap text-sm cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${
                    added ? 'bg-green-500 text-white' : 'bg-accent-600 hover:bg-accent-700 text-white'
                  }`}
                >
                  {added ? (
                    <>
                      <i className="ri-check-line"></i> Sepete Eklendi!
                    </>
                  ) : (
                    <>
                      <i className="ri-shopping-cart-line"></i> Sepete Ekle
                    </>
                  )}
                </button>
                <button
                  onClick={handleWishlist}
                  className={`w-12 h-12 flex items-center justify-center border-2 rounded-xl transition-all cursor-pointer ${
                    inWishlist
                      ? 'border-accent-500 bg-accent-500 text-white'
                      : 'border-surface-200 text-primary-500 hover:border-red-300 hover:text-red-500'
                  }`}
                >
                  <i className={`${inWishlist ? 'ri-heart-fill' : 'ri-heart-line'} text-lg`}></i>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                {[
                  { icon: 'ri-truck-line', text: 'Ücretsiz Kargo' },
                  { icon: 'ri-shield-check-line', text: 'Güvenli Ödeme' },
                  { icon: 'ri-refresh-line', text: '30 Gün İade' },
                ].map((b) => (
                  <div
                    key={b.text}
                    className="flex flex-col items-center gap-1 p-2.5 bg-white rounded-xl border border-surface-100 text-center"
                  >
                    <span className="w-6 h-6 flex items-center justify-center text-accent-600">
                      <i className={`${b.icon} text-base`}></i>
                    </span>
                    <span className="text-[10px] font-medium text-primary-600 leading-tight">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="py-12 md:py-16 border-t border-surface-200 bg-white">
            <div className="section-padding">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display font-bold text-xl text-primary-900">Bunları da Beğenebilirsin</h2>
                <Link
                  to={`/products?cat=${product.category}`}
                  className="text-sm font-semibold text-accent-600 hover:text-accent-700 flex items-center gap-1 whitespace-nowrap"
                >
                  Tümünü Gör <i className="ri-arrow-right-s-line"></i>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />

      {lightboxOpen && (
        <ImageLightbox
          src={activeImage || product.image}
          alt={product.name}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
