import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/base/ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  rating: number;
  reviews: number;
  badge: string | null;
}

interface Props {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllPath?: string;
}

export default function ProductCarousel({ title, subtitle, products, viewAllPath = '/products' }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [progress, setProgress] = useState(0);

  const update = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < max - 4);
    setProgress(max > 0 ? Math.min(1, el.scrollLeft / max) : 0);
  };

  useEffect(() => {
    update();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [products]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(320, el.clientWidth * 0.85);
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="bg-white py-6 border-b border-surface-200">
      <div className="section-padding">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="min-w-0">
            <h2 className="font-display font-bold text-lg md:text-xl text-primary-900 truncate">{title}</h2>
            {subtitle && <p className="text-xs text-primary-400 mt-0.5 truncate">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => scroll('left')}
              disabled={!canLeft}
              aria-label="Sola kaydır"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-surface-300 text-primary-600 hover:border-accent-400 hover:text-accent-500 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-surface-300 disabled:hover:text-primary-600"
            >
              <i className="ri-arrow-left-s-line text-lg" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canRight}
              aria-label="Sağa kaydır"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-surface-300 text-primary-600 hover:border-accent-400 hover:text-accent-500 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-surface-300 disabled:hover:text-primary-600"
            >
              <i className="ri-arrow-right-s-line text-lg" />
            </button>
            <Link
              to={viewAllPath}
              className="text-sm font-semibold text-accent-500 hover:text-accent-600 flex items-center gap-0.5 whitespace-nowrap ml-1"
            >
              Tümü
              <i className="ri-arrow-right-s-line text-base" />
            </Link>
          </div>
        </div>

        {/* Scroll container with edge fades */}
        <div className="relative">
          {canLeft && (
            <div className="absolute left-0 top-0 bottom-2 w-8 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
          )}
          {canRight && (
            <div className="absolute right-0 top-0 bottom-2 w-8 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
          )}
          <div
            ref={scrollRef}
            className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[168px] md:w-[200px]">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  currency={product.currency}
                  image={product.image}
                  rating={product.rating}
                  reviews={product.reviews}
                  badge={product.badge}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar — sayfalama göstergesi */}
        {(canLeft || canRight) && (
          <div className="mt-3 mx-auto h-[3px] w-32 bg-surface-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-500 rounded-full transition-all duration-150"
              style={{ width: `${Math.max(12, progress * 100)}%` }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
