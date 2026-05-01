import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryService, type Category } from '@/services';

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoryService
      .findAll()
      .then((cats) =>
        setCategories(
          [...cats]
            .filter((c) => c.visibleInNav !== false)
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
        ),
      )
      .catch(() => setCategories([]));
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="py-8 md:py-10 bg-[#FAFAF8]">
      <div className="section-padding">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-bold text-lg md:text-xl text-primary-900">
              Kategoriler
            </h2>
            <p className="text-xs text-primary-400 mt-0.5">İlgini çeken kategoriye göz at</p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-accent-500 hover:text-accent-600 flex items-center gap-0.5 whitespace-nowrap"
          >
            Tümü
            <i className="ri-arrow-right-s-line text-base"></i>
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?cat=${encodeURIComponent(cat.slug || cat.name)}`}
              className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-surface-200 hover:border-accent-300 hover:shadow-sm transition-all"
            >
              <span className="w-12 h-12 flex items-center justify-center rounded-full bg-accent-50 text-accent-600 group-hover:bg-accent-100 transition-colors text-2xl">
                <i className={cat.iconClass || 'ri-folder-line'} />
              </span>
              <p className="text-xs font-semibold text-primary-800 text-center leading-tight line-clamp-2">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
