import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/base/ProductCard';
import ProductSkeleton from '@/components/base/ProductSkeleton';
import Pagination from '@/components/base/Pagination';
import { productService, toUiProducts, type UiProduct } from '@/services';
import { categoryService, type Category } from '@/services';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';

const sortOptions = [
  { label: 'Öne Çıkanlar', value: 'featured' },
  { label: 'Fiyat: Artan', value: 'price-asc' },
  { label: 'Fiyat: Azalan', value: 'price-desc' },
  { label: 'En Yüksek Puan', value: 'rating' },
  { label: 'En Yeni', value: 'newest' },
];

const ITEMS_PER_PAGE = 20;

function resolveCategory(catParam: string | null, categories: Category[]): Category | null {
  if (!catParam || !categories.length) return null;
  const q = catParam.toLowerCase();
  return (
    categories.find((c) => c.id === catParam) ||
    categories.find((c) => (c.slug ?? '').toLowerCase() === q) ||
    categories.find((c) => c.name.toLowerCase() === q) ||
    null
  );
}

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [minRating, setMinRating] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ─── Server-side data state ──────────────────────────────────
  const [pageItems, setPageItems] = useState<UiProduct[]>([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoryService
      .findAll()
      .then((cats) => setCategories([...cats].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))))
      .catch(() => setCategories([]));
  }, []);

  const catParam = searchParams.get('cat');
  const qParam = searchParams.get('q') ?? undefined;
  const dealsOnly = searchParams.get('deals') === '1';
  const activeCategory = useMemo(() => resolveCategory(catParam, categories), [catParam, categories]);

  // Tek marka seçiliyse server-side filtre, çoklu seçimde client-side filtre.
  const serverBrand = selectedBrands.size === 1 ? Array.from(selectedBrands)[0] : undefined;

  // Backend pagination — page/size, q, categoryId, brand değiştikçe yeniden çek.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    productService
      .findAll(currentPage - 1, ITEMS_PER_PAGE, qParam, activeCategory?.id, serverBrand)
      .then((page) => {
        if (cancelled) return;
        setPageItems(toUiProducts(page.content));
        setServerTotal(page.totalElements);
        setServerTotalPages(Math.max(1, page.totalPages));
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.serverMessage || 'Ürünler yüklenemedi.');
        setPageItems([]);
        setServerTotal(0);
        setServerTotalPages(1);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [currentPage, qParam, activeCategory?.id, serverBrand]);

  // Filtre/kategori/sıralama değişince ilk sayfaya dön.
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory?.id, qParam, serverBrand, dealsOnly, inStockOnly, minRating, priceRange?.min, priceRange?.max, sortBy, selectedBrands.size]);

  // Sayfadaki ürünlerden marka ve fiyat sınırları (sadece UI için).
  const allBrands = useMemo(() => {
    const set = new Set<string>();
    pageItems.forEach((p) => p.brand && set.add(p.brand));
    return Array.from(set).sort();
  }, [pageItems]);

  const priceBounds = useMemo(() => {
    if (pageItems.length === 0) return { min: 0, max: 1000 };
    const prices = pageItems.map((p) => p.price);
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [pageItems]);

  const setCategoryParam = (cat: Category | null) => {
    const next = new URLSearchParams(searchParams);
    if (!cat) next.delete('cat');
    else next.set('cat', cat.slug || cat.name);
    setSearchParams(next);
  };

  // Geçerli sayfa üzerinde client-side ek filtreler (price/inStock/rating/dealsOnly/multi-brand).
  const filtered = useMemo(() => {
    return pageItems
      .filter((p) => {
        if (dealsOnly && !(p.originalPrice && p.originalPrice > p.price)) return false;
        if (inStockOnly && !p.inStock) return false;
        if (selectedBrands.size > 1 && (!p.brand || !selectedBrands.has(p.brand))) return false;
        if (priceRange && (p.price < priceRange.min || p.price > priceRange.max)) return false;
        if (minRating > 0 && (p.rating ?? 0) < minRating) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
        if (sortBy === 'newest') return b.id.localeCompare(a.id);
        return 0;
      });
  }, [pageItems, sortBy, inStockOnly, selectedBrands, priceRange, minRating, dealsOnly]);

  const totalPages = serverTotalPages;
  const paginated = filtered;

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
  };

  const resetFilters = () => {
    setSelectedBrands(new Set());
    setInStockOnly(false);
    setMinRating(0);
    setPriceRange(priceBounds);
  };

  const activeFilterCount =
    selectedBrands.size +
    (inStockOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (priceRange && (priceRange.min !== priceBounds.min || priceRange.max !== priceBounds.max) ? 1 : 0);

  const heading = dealsOnly ? 'Fırsatlar' : activeCategory?.name || 'Tüm Ürünler';

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      <main className="pt-32 md:pt-36 pb-16">
        <div className="page-container">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-primary-400 mb-3">
            <Link to="/" className="hover:text-accent-600 transition-colors">Anasayfa</Link>
            <i className="ri-arrow-right-s-line" />
            <Link to="/products" className="hover:text-accent-600 transition-colors">Ürünler</Link>
            {activeCategory && (
              <>
                <i className="ri-arrow-right-s-line" />
                <span className="text-primary-700 font-medium">{activeCategory.name}</span>
              </>
            )}
          </nav>

          {/* Heading row */}
          <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-3">
              {activeCategory?.iconClass ? (
                <span className="w-11 h-11 flex items-center justify-center rounded-xl bg-accent-50 text-accent-600 text-xl shadow-sm">
                  <i className={activeCategory.iconClass} />
                </span>
              ) : (
                <span className="w-11 h-11 flex items-center justify-center rounded-xl bg-accent-50 text-accent-600 text-xl shadow-sm">
                  <i className="ri-shopping-bag-3-line" />
                </span>
              )}
              <div>
                <h1 className="font-display font-bold text-2xl md:text-3xl text-primary-900 leading-tight">
                  {heading}
                </h1>
                <p className="text-xs text-primary-400 mt-0.5">
                  <span className="font-semibold text-primary-700">{serverTotal}</span> ürün — sayfa {currentPage}/{totalPages}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFiltersOpen(true)}
                className="md:hidden inline-flex items-center gap-2 text-sm text-primary-700 font-medium px-3 py-2 rounded-lg bg-white border border-surface-200 hover:border-accent-300 cursor-pointer"
              >
                <i className="ri-filter-3-line" />
                Filtreler
                {activeFilterCount > 0 && (
                  <span className="bg-accent-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-lg px-3 py-1.5">
                <i className="ri-sort-desc text-primary-400 text-sm" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm focus:outline-none bg-transparent cursor-pointer pr-1"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex gap-6">
            {/* Sidebar */}
            <aside className="hidden md:block w-[200px] flex-shrink-0">
              <div className="sticky top-32">
                <FiltersPanel
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={setCategoryParam}
                  priceBounds={priceBounds}
                  priceRange={priceRange ?? priceBounds}
                  onPriceChange={setPriceRange}
                  inStockOnly={inStockOnly}
                  onInStockChange={setInStockOnly}
                  allBrands={allBrands}
                  selectedBrands={selectedBrands}
                  onBrandToggle={toggleBrand}
                  minRating={minRating}
                  onMinRatingChange={setMinRating}
                  onReset={resetFilters}
                  activeCount={activeFilterCount}
                />
              </div>
            </aside>

            {/* Grid */}
            <div className="flex-1 min-w-0">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <i className="ri-error-warning-line text-2xl text-red-400 mb-2 inline-block" />
                  <h3 className="font-medium text-red-800 mb-1">Bir şeyler ters gitti</h3>
                  <p className="text-sm text-red-600 mb-3">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Yeniden Dene
                  </button>
                </div>
              )}

              {!error && (
                <>
                  {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                        <ProductSkeleton key={i} />
                      ))}
                    </div>
                  ) : paginated.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {paginated.map((product) => (
                          <ProductCard key={product.id} {...product} />
                        ))}
                      </div>
                      <div className="mt-8">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="bg-white border border-surface-200 rounded-xl text-center py-20 px-4">
                      <i className="ri-shopping-bag-3-line text-4xl text-primary-300 mb-3 inline-block" />
                      <h3 className="font-display text-lg text-primary-900 mb-1">Ürün bulunamadı</h3>
                      <p className="text-sm text-primary-400 mb-4">Filtrelerini değiştirmeyi dene.</p>
                      {activeFilterCount > 0 && (
                        <button
                          onClick={resetFilters}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-accent-600 text-white text-sm font-semibold rounded-full hover:bg-accent-700 transition-colors cursor-pointer"
                        >
                          <i className="ri-refresh-line" />
                          Filtreleri sıfırla
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile drawer */}
      {filtersOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/40 flex items-end" onClick={() => setFiltersOpen(false)}>
          <div
            className="bg-white w-full max-h-[88vh] rounded-t-2xl overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-surface-200 px-4 py-3 flex items-center justify-between z-10">
              <h3 className="font-display text-base font-bold text-primary-900">Filtreler</h3>
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-primary-500 cursor-pointer"
                aria-label="Kapat"
              >
                <i className="ri-close-line text-xl" />
              </button>
            </div>
            <div className="p-4">
              <FiltersPanel
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={(c) => { setCategoryParam(c); setFiltersOpen(false); }}
                priceBounds={priceBounds}
                priceRange={priceRange ?? priceBounds}
                onPriceChange={setPriceRange}
                inStockOnly={inStockOnly}
                onInStockChange={setInStockOnly}
                allBrands={allBrands}
                selectedBrands={selectedBrands}
                onBrandToggle={toggleBrand}
                minRating={minRating}
                onMinRatingChange={setMinRating}
                onReset={resetFilters}
                activeCount={activeFilterCount}
              />
            </div>
          </div>
          <style>{`
            @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
            .animate-slide-up { animation: slide-up 220ms cubic-bezier(0.16,1,0.3,1) both; }
          `}</style>
        </div>
      )}

      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Filters Panel — single unified card
// ─────────────────────────────────────────────────────────

interface FiltersPanelProps {
  categories: Category[];
  activeCategory: Category | null;
  onCategoryChange: (cat: Category | null) => void;
  priceBounds: { min: number; max: number };
  priceRange: { min: number; max: number };
  onPriceChange: (range: { min: number; max: number }) => void;
  inStockOnly: boolean;
  onInStockChange: (v: boolean) => void;
  allBrands: string[];
  selectedBrands: Set<string>;
  onBrandToggle: (brand: string) => void;
  minRating: number;
  onMinRatingChange: (n: number) => void;
  onReset: () => void;
  activeCount: number;
}

function FiltersPanel(p: FiltersPanelProps) {
  return (
    <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-surface-100">
        <h3 className="font-display text-sm font-bold text-primary-900 flex items-center gap-2">
          <i className="ri-equalizer-3-line text-accent-600" />
          Filtreler
        </h3>
        {p.activeCount > 0 && (
          <button
            onClick={p.onReset}
            className="text-[11px] text-accent-600 hover:underline cursor-pointer font-medium"
          >
            Sıfırla ({p.activeCount})
          </button>
        )}
      </div>

      {/* Categories */}
      <Section title="Kategori">
        <ul className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
          <CategoryItem label="Tümü" icon="ri-apps-2-line" active={!p.activeCategory} onClick={() => p.onCategoryChange(null)} />
          {p.categories.map((cat) => (
            <CategoryItem
              key={cat.id}
              label={cat.name}
              icon={cat.iconClass || 'ri-folder-line'}
              active={p.activeCategory?.id === cat.id}
              onClick={() => p.onCategoryChange(cat)}
            />
          ))}
        </ul>
      </Section>

      {/* Price */}
      <Section title="Fiyat">
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={p.priceBounds.min}
              max={p.priceRange.max}
              value={p.priceRange.min}
              onChange={(e) => p.onPriceChange({ ...p.priceRange, min: Math.max(p.priceBounds.min, Number(e.target.value) || 0) })}
              className="w-full min-w-0 px-2 py-1 border border-surface-300 rounded text-xs focus:outline-none focus:border-accent-400"
            />
            <span className="text-primary-300 text-xs">—</span>
            <input
              type="number"
              min={p.priceRange.min}
              max={p.priceBounds.max}
              value={p.priceRange.max}
              onChange={(e) => p.onPriceChange({ ...p.priceRange, max: Math.min(p.priceBounds.max, Number(e.target.value) || p.priceBounds.max) })}
              className="w-full min-w-0 px-2 py-1 border border-surface-300 rounded text-xs focus:outline-none focus:border-accent-400"
            />
          </div>
          <input
            type="range"
            min={p.priceBounds.min}
            max={p.priceBounds.max}
            value={p.priceRange.max}
            onChange={(e) => p.onPriceChange({ ...p.priceRange, max: Number(e.target.value) })}
            className="w-full accent-accent-600"
          />
          <p className="text-[10px] text-primary-400">
            ${p.priceBounds.min.toLocaleString()} – ${p.priceBounds.max.toLocaleString()}
          </p>
        </div>
      </Section>

      {/* Brand */}
      {p.allBrands.length > 0 && (
        <Section title="Marka">
          <ul className="space-y-1 max-h-44 overflow-y-auto pr-1">
            {p.allBrands.map((brand) => {
              const checked = p.selectedBrands.has(brand);
              return (
                <li key={brand}>
                  <label className="flex items-center gap-2 text-xs text-primary-700 cursor-pointer hover:text-accent-600">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => p.onBrandToggle(brand)}
                      className="accent-accent-600 w-3.5 h-3.5"
                    />
                    <span className="truncate">{brand}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {/* Rating */}
      <Section title="Puan">
        <ul className="space-y-0.5">
          {[0, 4, 4.5].map((r) => (
            <li key={r}>
              <button
                onClick={() => p.onMinRatingChange(r)}
                className={`w-full text-left text-xs py-1 px-1.5 rounded transition-colors flex items-center gap-2 cursor-pointer ${
                  p.minRating === r
                    ? 'bg-accent-50 text-accent-700 font-semibold'
                    : 'text-primary-600 hover:bg-surface-50'
                }`}
              >
                {r === 0 ? (
                  <span>Tümü</span>
                ) : (
                  <>
                    <span className="text-amber-400 flex items-center text-[11px]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i key={i} className={`ri-star-${i < Math.floor(r) ? 'fill' : i < r ? 'half-fill' : 'line'}`} />
                      ))}
                    </span>
                    <span className="text-[10px] text-primary-400">{r}+ ve üzeri</span>
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      </Section>

      {/* Stock */}
      <Section title="Stok" last>
        <label className="flex items-center gap-2 text-xs text-primary-700 cursor-pointer">
          <input
            type="checkbox"
            checked={p.inStockOnly}
            onChange={(e) => p.onInStockChange(e.target.checked)}
            className="accent-accent-600 w-3.5 h-3.5"
          />
          Sadece stoktakiler
        </label>
      </Section>
    </div>
  );
}

function Section({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`px-4 py-3 ${last ? '' : 'border-b border-surface-100'}`}>
      <h4 className="text-[10px] font-bold uppercase tracking-[0.08em] text-primary-400 mb-2">
        {title}
      </h4>
      {children}
    </div>
  );
}

function CategoryItem({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full text-left text-xs py-1.5 px-2 rounded-md transition-colors flex items-center gap-2 cursor-pointer ${
          active
            ? 'bg-accent-50 text-accent-700 font-semibold'
            : 'text-primary-600 hover:bg-surface-50'
        }`}
      >
        <i className={`${icon} text-sm flex-shrink-0`} />
        <span className="truncate">{label}</span>
      </button>
    </li>
  );
}
