import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useBasket, useWishlist } from '@/providers';
import ImageLightbox from './ImageLightbox';
import { formatPrice } from '@/lib/format';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  currency?: string;
  image: string;
  rating: number;
  reviews: number;
  badge?: string | null;
  category?: string;
  searchCount?: number;
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  currency,
  image,
  rating,
  reviews,
  badge,
  category,
  searchCount,
}: ProductCardProps) {
  const { addItem } = useBasket();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [addedToCart, setAddedToCart] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [wishlistAnim, setWishlistAnim] = useState(false);

  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;
  const inWishlist = isInWishlist(id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, name, price, image, category });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    toggleWishlist(id);
    setWishlistAnim(true);
    setTimeout(() => setWishlistAnim(false), 400);
  };

  const handleLightbox = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="group bg-white rounded-2xl border border-surface-200 overflow-hidden transition-all duration-300 hover:border-surface-300 hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
        <Link to={`/product/${id}`} className="block">
          {/* Image container */}
          <div className="relative overflow-hidden bg-surface-50 aspect-square">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
              style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
            />

            {/* Discount badge */}
            {discount > 0 && (
              <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-accent-600 text-white text-[10px] font-bold rounded-full">
                -{discount}%
              </span>
            )}
            {/* Product badge (no discount) */}
            {badge && !discount && (
              <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-primary-800 text-white text-[10px] font-bold rounded-full">
                {badge}
              </span>
            )}

            {/* ❤ Wishlist Button — always visible top-right */}
            <button
              onClick={handleWishlist}
              className={`absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer z-10 ${
                inWishlist
                  ? 'bg-accent-600 text-white'
                  : 'bg-white/90 text-primary-400 hover:text-accent-600 hover:bg-white'
              } ${wishlistAnim ? 'scale-125' : 'scale-100'}`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
              title={inWishlist ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            >
              <i className={`${inWishlist ? 'ri-heart-fill' : 'ri-heart-line'} text-sm`}></i>
            </button>

            {/* Quick view on hover */}
            <button
              onClick={handleLightbox}
              className="absolute bottom-2.5 right-2.5 w-8 h-8 flex items-center justify-center bg-white/90 text-primary-500 hover:text-accent-600 rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 cursor-pointer z-10"
              title="Hızlı görünüm"
            >
              <i className="ri-zoom-in-line text-sm"></i>
            </button>

            {/* Add to cart button — always inside container */}
            <div className="absolute inset-x-0 bottom-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 p-2">
              <button
                onClick={handleAddToCart}
                className={`w-full py-2 text-xs font-bold rounded-xl cursor-pointer whitespace-nowrap transition-colors ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-accent-600 text-white hover:bg-accent-700'
                }`}
              >
                {addedToCart ? (
                  <span className="flex items-center justify-center gap-1">
                    <i className="ri-check-line"></i> Eklendi!
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    <i className="ri-shopping-cart-2-line"></i> Sepete Ekle
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-3">
            {category && (
              <p className="text-[10px] text-accent-600 font-semibold uppercase tracking-wide mb-1">{category}</p>
            )}
            <h3 className="text-sm font-medium text-primary-900 mb-2 line-clamp-2 leading-snug min-h-[36px]">{name}</h3>

            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-xs ${i < Math.floor(rating) ? 'text-amber-400' : 'text-surface-300'}`}>★</span>
                ))}
              </div>
              <span className="text-[10px] text-surface-500">({reviews.toLocaleString()})</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-base font-bold text-primary-900">{formatPrice(price, currency)}</span>
                {originalPrice && (
                  <span className="text-xs text-surface-400 line-through">{formatPrice(originalPrice, currency)}</span>
                )}
              </div>
            </div>

            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-accent-600">
              <i className="ri-truck-line text-xs"></i>
              <span>Ücretsiz kargo</span>
            </div>            {searchCount && searchCount > 0 ? (
              <div className="mt-1 flex items-center gap-1 text-[10px] text-primary-500">
                <i className="ri-search-line text-xs"></i>
                <span>{searchCount.toLocaleString('tr-TR')} kez arandı</span>
              </div>
            ) : null}          </div>
        </Link>
      </div>

      {lightboxOpen && (
        <ImageLightbox src={image} alt={name} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
}
