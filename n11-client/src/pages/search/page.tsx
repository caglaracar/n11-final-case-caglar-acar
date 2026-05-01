import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/base/ProductCard';
import ProductSkeleton from '@/components/base/ProductSkeleton';
import Pagination from '@/components/base/Pagination';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { productService, toUiProducts } from '@/services';
import type { UiProduct } from '@/services';

const sortOptions = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
];

const ITEMS_PER_PAGE = 12;

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [items, setItems] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const promise = query.trim()
      ? productService.search(query.trim(), 0, 100)
      : productService.findAll(0, 100);

    promise
      .then((page) => {
        if (cancelled) return;
        setItems(toUiProducts(page.content));
      })
      .catch((e: any) => {
        if (cancelled) return;
        setError(e?.serverMessage || 'Ürünler yüklenemedi.');
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [query]);

  const allCategories = useMemo(
    () => Array.from(new Set(items.map((p) => p.category).filter(Boolean))),
    [items],
  );

  const filtered = useMemo(() => {
    let result = items.filter((p) => {
      const inPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const inCat = selectedCategories.length === 0 || selectedCategories.includes(p.category);
      return inPrice && inCat;
    });
    if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [items, sortBy, priceRange, selectedCategories]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, sortBy, priceRange, selectedCategories]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-32 md:pt-36">
        <div className="section-padding py-8 md:py-12 border-b border-surface-200">
          <h1 className="font-display text-2xl md:text-3xl text-primary-900 font-medium mb-2">
            {query ? `Search: "${query}"` : 'All Products'}
          </h1>
          <p className="text-sm text-primary-500">{filtered.length} results found</p>
        </div>

        <div className="section-padding py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-56 flex-shrink-0">
              <div className="bg-white border border-surface-200 rounded-lg p-5 space-y-6">
                <div>
                  <h3 className="font-medium text-primary-900 text-sm mb-3">Categories</h3>
                  <div className="space-y-2">
                    {allCategories.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                          className="w-4 h-4 accent-primary-800 cursor-pointer"
                        />
                        <span className="text-sm text-primary-600">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-primary-900 text-sm mb-3">Price Range</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm"
                        placeholder="Min"
                      />
                      <span className="text-primary-400">-</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm"
                        placeholder="Max"
                      />
                    </div>
                    <p className="text-xs text-primary-400">${priceRange[0]} - ${priceRange[1]}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setPriceRange([0, 5000]);
                  }}
                  className="w-full py-2 text-sm text-primary-600 hover:text-primary-900 border border-surface-300 rounded-md hover:border-primary-400 transition-all cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-primary-400 hidden sm:inline">
                  Showing {filtered.length} products
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-primary-400">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border border-surface-300 rounded-md px-3 py-2 focus:outline-none focus:border-primary-500 bg-white"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6">
                  <span className="w-12 h-12 flex items-center justify-center mx-auto mb-3 text-red-400">
                    <i className="ri-error-warning-line text-2xl"></i>
                  </span>
                  <h3 className="font-medium text-red-800 mb-1">Something went wrong</h3>
                  <p className="text-sm text-red-600 mb-3">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!error && (
                <>
                  {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                      {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                        <ProductSkeleton key={i} />
                      ))}
                    </div>
                  ) : filtered.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        {paginated.map((product) => (
                          <ProductCard key={product.id} {...product} />
                        ))}
                      </div>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </>
                  ) : (
                    <div className="text-center py-20">
                      <span className="w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary-300">
                        <i className="ri-search-line text-4xl"></i>
                      </span>
                      <h3 className="font-display text-lg text-primary-900 mb-2">No results found</h3>
                      <p className="text-sm text-primary-400">Try adjusting your search or filters.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
