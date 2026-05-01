import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService, toUiProducts, type UiProduct } from '@/services';
import { formatPrice } from '@/lib/format';

/**
 * Fiyatı Düşenler — backend `/product/price-drops` endpoint'inden beslenir.
 * `priceDropAt` alanı olan ürünleri en yeni düşüşe göre sıralı gösterir.
 */
export default function PriceDropsCarousel() {
  const [products, setProducts] = useState<UiProduct[]>([]);

  useEffect(() => {
    let cancelled = false;
    productService.priceDrops(12).then((res) => {
      if (cancelled) return;
      setProducts(toUiProducts(res ?? []));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="bg-white py-6 border-b border-surface-200">
      <div className="section-padding">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 flex items-center justify-center text-orange-500">
              <i className="ri-price-tag-3-fill text-2xl"></i>
            </span>
            <h2 className="font-display font-bold text-xl text-primary-900">Fiyatı Düşenler</h2>
          </div>
          <Link
            to="/price-drops"
            className="text-sm font-semibold text-accent-500 hover:text-accent-600 flex items-center gap-1 whitespace-nowrap"
          >
            Tümünü Gör
            <i className="ri-arrow-right-s-line text-base"></i>
          </Link>
        </div>

        <div
          className="flex gap-3 md:gap-4 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {products.map((product) => {
            const discount = product.originalPrice
              ? Math.round((1 - product.price / product.originalPrice) * 100)
              : 0;
            return (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="flex-shrink-0 w-[160px] md:w-[180px] bg-white border border-surface-200 rounded-xl overflow-hidden hover:border-orange-300 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <div className="relative w-full aspect-square bg-surface-50 overflow-hidden">
                  {discount > 0 && (
                    <span className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                      -{discount}%
                    </span>
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain object-center p-2"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-primary-800 leading-tight mb-1.5 line-clamp-2">
                    {product.name}
                  </p>
                  <div className="flex items-end gap-1.5 flex-wrap">
                    <span className="text-base font-bold text-orange-600">
                      {formatPrice(product.price, product.currency)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-primary-400 line-through mb-0.5">
                        {formatPrice(product.originalPrice, product.currency)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
