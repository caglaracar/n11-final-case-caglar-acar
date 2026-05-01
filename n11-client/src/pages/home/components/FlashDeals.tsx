import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { productService, toUiProducts, type UiProduct } from '@/services';
import { formatPrice } from '@/lib/format';

/** ms → {h,m,s} */
function diffParts(ms: number) {
  if (ms <= 0) return { h: 0, m: 0, s: 0 };
  const total = Math.floor(ms / 1000);
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Flash Deals — backend `/product/flash-deals` endpoint'i aktif kampanyaları döner.
 * Geri sayım, kampanyaların en erken `flashDealEndsAt` zamanına göre hesaplanır.
 */
export default function FlashDeals() {
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;
    productService.flashDeals().then((res) => {
      if (cancelled) return;
      setProducts(toUiProducts(res ?? []));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const earliestEndsAt = useMemo(() => {
    const times = products
      .map((p) => p.flashDealEndsAt ? new Date(p.flashDealEndsAt).getTime() : NaN)
      .filter((n) => !isNaN(n) && n > now);
    return times.length > 0 ? Math.min(...times) : null;
  }, [products, now]);

  const time = useMemo(() => {
    if (earliestEndsAt == null) return null;
    return diffParts(earliestEndsAt - now);
  }, [earliestEndsAt, now]);

  if (products.length === 0) return null;

  return (
    <section className="bg-white py-6 border-b border-surface-200">
      <div className="section-padding">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 flex items-center justify-center text-accent-500">
                <i className="ri-flashlight-fill text-2xl"></i>
              </span>
              <h2 className="font-display font-bold text-xl text-primary-900">Flash Fırsatlar</h2>
            </div>
            {time && (
              <div className="flex items-center gap-1">
                {[pad(time.h), pad(time.m), pad(time.s)].map((unit, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="bg-primary-900 text-white text-sm font-bold px-2 py-1 rounded-md min-w-[32px] text-center">
                      {unit}
                    </span>
                    {i < 2 && <span className="text-primary-900 font-bold text-sm">:</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Link
            to="/products?deals=1"
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
                className="flex-shrink-0 w-[160px] md:w-[180px] bg-white border border-surface-200 rounded-xl overflow-hidden hover:border-accent-300 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                {discount > 0 && (
                  <div className="relative">
                    <span className="absolute top-2 left-2 z-10 bg-accent-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                      -{discount}%
                    </span>
                  </div>
                )}
                <div className="w-full aspect-square bg-surface-50 overflow-hidden">
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
                  <div className="flex items-end gap-1.5">
                    <span className="text-base font-bold text-accent-500">
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
