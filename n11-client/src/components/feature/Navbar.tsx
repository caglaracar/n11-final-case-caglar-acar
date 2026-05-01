import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useBasket } from '@/providers';
import { useAuth, useWishlist } from '@/providers';
import { categoryService, productService, type Category } from '@/services';

type CategoryLink = { label: string; icon: string; path: string; badge?: string | null };

const fallbackCategoryLinks: CategoryLink[] = [
  { label: 'Elektronik', icon: 'ri-computer-line', path: '/products?cat=Electronics' },
  { label: 'Ev & Yaşam', icon: 'ri-home-3-line', path: '/products?cat=Home' },
  { label: 'Spor', icon: 'ri-run-line', path: '/products?cat=Sports' },
  { label: 'Moda', icon: 'ri-shirt-line', path: '/products?cat=Fashion' },
  { label: 'Kozmetik', icon: 'ri-flask-line', path: '/products?cat=Beauty' },
];

const toCategoryLink = (c: Category): CategoryLink => ({
  label: c.name,
  icon: c.iconClass || '',
  path: `/products?cat=${encodeURIComponent(c.slug || c.name)}`,
  badge: c.highlightLabel ?? null,
});

const fallbackSuggestions = [
  'Sony Kulaklık', 'Apple Watch', 'Nike Ayakkabı', 'Dyson Süpürge',
  'Samsung TV', 'Logitech Mouse', 'Kindle', 'Herman Miller',
];

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categoryLinks, setCategoryLinks] = useState<CategoryLink[]>(fallbackCategoryLinks);
  const [suggestions, setSuggestions] = useState<string[]>(fallbackSuggestions);

  useEffect(() => {
    // Önce gerçek arama trendlerini Redis'ten dene; boş gelirse popüler ürün adlarına düş.
    productService
      .trendingTerms(8)
      .then((terms) => {
        const fromRedis = (terms || []).map((t) => t.term).filter(Boolean);
        if (fromRedis.length > 0) {
          setSuggestions(fromRedis);
          return;
        }
        return productService.popular(8).then((list) => {
          const names = (list || []).map((p) => p.name).filter(Boolean);
          if (names.length > 0) setSuggestions(names);
        });
      })
      .catch(() => {
        // BE indi → fallback ile devam.
      });
  }, []);

  useEffect(() => {
    categoryService
      .findAll()
      .then((cats) => {
        const visible = cats
          .filter((c) => c.visibleInNav !== false)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map(toCategoryLink);
        setCategoryLinks(visible.length > 0 ? visible : fallbackCategoryLinks);
      })
      .catch(() => {
        // BE indi → fallback ile devam.
      });
  }, []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();
  const isLoggedIn = isAuthenticated;
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useBasket();
  const { wishlistCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const catScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateCatScroll = () => {
    const el = catScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateCatScroll();
    const el = catScrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateCatScroll, { passive: true });
    window.addEventListener('resize', updateCatScroll);
    return () => {
      el.removeEventListener('scroll', updateCatScroll);
      window.removeEventListener('resize', updateCatScroll);
    };
  }, [categoryLinks]);

  const scrollCat = (dir: 'left' | 'right') => {
    const el = catScrollRef.current;
    if (!el) return;
    const amount = Math.max(240, el.clientWidth * 0.7);
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestion = (s: string) => {
    setSearchQuery(s);
    navigate(`/search?q=${encodeURIComponent(s)}`);
    setShowSuggestions(false);
  };

  const filteredSuggestions = searchQuery
    ? suggestions.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    : suggestions.slice(0, 6);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${scrolled ? 'border-b border-surface-200' : 'border-b border-surface-100'}`}>
        {/* Top Row */}
        <div className="page-container">
          <div className="flex items-center gap-4 h-16 md:h-[68px]">
            {/* ===== LOGO ===== */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              {/* Cart badge with S */}
              <div className="relative w-9 h-9 flex-shrink-0">
                {/* Cart background */}
                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 group-hover:from-accent-400 group-hover:to-accent-600 transition-all duration-300">
                  <i className="ri-shopping-cart-2-fill text-white text-lg"></i>
                </div>
                {/* Speed dot */}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-70">
                  <div className="w-1 h-0.5 bg-accent-400 rounded-full"></div>
                  <div className="w-1.5 h-0.5 bg-accent-400 rounded-full"></div>
                  <div className="w-1 h-0.5 bg-accent-400 rounded-full"></div>
                </div>
              </div>
              {/* Text */}
              <div className="hidden sm:block">
                <div className="flex items-baseline leading-none">
                  <span className="font-display font-extrabold text-[20px] text-primary-900 tracking-tight">Sepet</span>
                  <span className="font-display font-extrabold text-[20px] text-accent-600 tracking-tight">ify</span>
                </div>
                <p className="text-[9px] text-primary-400 leading-none mt-0.5 tracking-wide">Alışverişin en kolay hali</p>
              </div>
            </Link>

            {/* Search Bar */}
            <div ref={searchRef} className="flex-1 relative hidden md:block">
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-primary-400 pointer-events-none">
                    <i className="ri-search-line text-lg"></i>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Ürün, marka veya kategori ara..."
                    className="w-full pl-12 pr-4 py-2.5 border-2 border-surface-200 rounded-l-full text-sm text-primary-900 placeholder-primary-400 focus:outline-none focus:border-accent-500 transition-colors bg-surface-50 focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-r-full transition-colors whitespace-nowrap text-sm"
                >
                  Ara
                </button>
              </form>

              {/* Suggestions */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-surface-200 rounded-2xl z-50 overflow-hidden">
                  <div className="px-4 py-2.5 bg-surface-50 border-b border-surface-100 flex items-center gap-2">
                    <i className="ri-history-line text-xs text-primary-400"></i>
                    <span className="text-xs text-primary-400 font-medium uppercase tracking-wide">
                      {searchQuery ? 'Öneriler' : 'Popüler Aramalar'}
                    </span>
                  </div>
                  {filteredSuggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-primary-700 hover:bg-surface-50 transition-colors text-left cursor-pointer"
                    >
                      <span className="w-4 h-4 flex items-center justify-center text-primary-400 flex-shrink-0">
                        <i className="ri-search-line text-sm"></i>
                      </span>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              {/* Track Order */}
              <Link
                to="/track-order"
                className="hidden lg:flex flex-col items-center px-2 py-1 text-primary-500 hover:text-accent-600 transition-colors rounded-lg hover:bg-surface-50"
              >
                <span className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-map-pin-line text-xl"></i>
                </span>
                <span className="text-[10px] leading-none mt-0.5 whitespace-nowrap">Takip</span>
              </Link>

              {/* Account */}
              <button
                onClick={() => navigate(isLoggedIn ? '/account' : '/login')}
                className="flex flex-col items-center px-2 py-1 text-primary-500 hover:text-accent-600 transition-colors relative rounded-lg hover:bg-surface-50 cursor-pointer"
              >
                <span className="w-6 h-6 flex items-center justify-center relative">
                  <i className="ri-user-line text-xl"></i>
                  {isLoggedIn && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"></span>}
                </span>
                <span className="hidden lg:block text-[10px] leading-none mt-0.5 whitespace-nowrap">
                  {isLoggedIn ? 'Hesabım' : 'Giriş Yap'}
                </span>
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="flex flex-col items-center px-2 py-1 text-primary-500 hover:text-accent-600 transition-colors relative rounded-lg hover:bg-surface-50"
                title="Favorilerim"
              >
                <span className="w-6 h-6 flex items-center justify-center relative">
                  <i className="ri-heart-line text-xl"></i>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-0.5">
                      {wishlistCount}
                    </span>
                  )}
                </span>
                <span className="hidden lg:block text-[10px] leading-none mt-0.5 whitespace-nowrap">Favoriler</span>
              </Link>

              {/* Cart */}
              <Link
                to="/basket"
                className="flex flex-col items-center px-2 py-1 text-primary-500 hover:text-accent-600 transition-colors relative rounded-lg hover:bg-surface-50"
              >
                <span className="w-6 h-6 flex items-center justify-center relative">
                  <i className="ri-shopping-cart-2-line text-xl"></i>
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-accent-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-0.5">
                      {totalItems}
                    </span>
                  )}
                </span>
                <span className="hidden lg:block text-[10px] leading-none mt-0.5 whitespace-nowrap">Sepet</span>
              </Link>

              {/* Admin */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden xl:flex flex-col items-center px-2 py-1 text-primary-500 hover:text-accent-600 transition-colors rounded-lg hover:bg-surface-50"
                >
                  <span className="w-6 h-6 flex items-center justify-center">
                    <i className="ri-shield-user-line text-xl"></i>
                  </span>
                  <span className="text-[10px] leading-none mt-0.5 whitespace-nowrap">Admin</span>
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center text-primary-700 rounded-lg hover:bg-surface-100 cursor-pointer"
              >
                {mobileOpen ? <i className="ri-close-line text-2xl"></i> : <i className="ri-menu-line text-2xl"></i>}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-primary-400">
                <i className="ri-search-line text-base"></i>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Ürün ara..."
                className="w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-l-full text-sm text-primary-900 focus:outline-none focus:border-accent-500 transition-colors bg-surface-50"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-accent-600 text-white rounded-r-full text-sm font-semibold whitespace-nowrap">
              Ara
            </button>
          </form>
        </div>

        {/* Category Bar */}
        <div className="hidden md:block border-t-2 border-surface-100" style={{ background: 'linear-gradient(to right, #fff7f7, #ffffff 40%, #fff0f0)' }}>
          <div className="page-container">
            <div className="relative">
              {/* Left arrow */}
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollCat('left')}
                  aria-label="Sola kaydır"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white text-primary-700 hover:text-accent-600 cursor-pointer transition-all border border-surface-200 hover:border-accent-200"
                  style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.10)' }}
                >
                  <i className="ri-arrow-left-s-line text-lg" />
                </button>
              )}
              {/* Right arrow */}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollCat('right')}
                  aria-label="Sağa kaydır"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white text-primary-700 hover:text-accent-600 cursor-pointer transition-all border border-surface-200 hover:border-accent-200"
                  style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.10)' }}
                >
                  <i className="ri-arrow-right-s-line text-lg" />
                </button>
              )}

              {/* Fade edges */}
              {canScrollLeft && (
                <div className="absolute left-8 top-0 bottom-0 w-10 z-[5] pointer-events-none bg-gradient-to-r from-[#fff7f7] to-transparent" />
              )}
              {canScrollRight && (
                <div className="absolute right-8 top-0 bottom-0 w-10 z-[5] pointer-events-none bg-gradient-to-l from-[#fff0f0] to-transparent" />
              )}

              <div
                ref={catScrollRef}
                className="flex items-center gap-0.5 overflow-x-auto scroll-smooth"
                style={{ scrollbarWidth: 'none', paddingLeft: canScrollLeft ? 36 : 0, paddingRight: canScrollRight ? 36 : 0 }}
              >
              {categoryLinks.map((cat) => {
                const catParam = new URLSearchParams(cat.path.split('?')[1] || '').get('cat') || '';
                const currentCatParam = new URLSearchParams(location.search).get('cat') || '';
                const isActive =
                  location.pathname === '/products' && catParam && currentCatParam.toLowerCase() === catParam.toLowerCase();
                return (
                <Link
                  key={cat.label}
                  to={cat.path}
                  className={`group flex items-center gap-1.5 px-3.5 py-2.5 whitespace-nowrap text-[13px] font-medium flex-shrink-0 rounded-lg relative transition-all duration-200 ${
                    isActive
                      ? 'text-accent-700 bg-accent-50'
                      : 'text-primary-500 hover:text-accent-600'
                  }`}
                >
                  {/* animated underline */}
                  <span className={`absolute bottom-1 left-3.5 right-3.5 h-[2px] bg-accent-500 rounded-full transition-transform duration-200 origin-left ${
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
                  {cat.icon && (
                    <span className={`w-[18px] h-[18px] flex items-center justify-center rounded-md transition-all duration-200 flex-shrink-0 ${
                      isActive ? 'bg-accent-100 text-accent-700' : 'bg-surface-100 group-hover:bg-accent-50 group-hover:text-accent-600'
                    }`}>
                      <i className={`${cat.icon} text-xs`}></i>
                    </span>
                  )}
                  {cat.label}
                  {cat.badge && (
                    <span className="ml-0.5 px-1.5 py-0.5 bg-accent-600 text-white text-[9px] font-bold rounded-full leading-none animate-pulse">{cat.badge}</span>
                  )}
                </Link>
                );
              })}
              {/* divider */}
              <div className="mx-3 w-px h-4 bg-surface-200 flex-shrink-0"></div>
              {/* Deals pill */}
              <Link
                to="/products?deals=1"
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 bg-accent-600 text-white text-xs font-bold rounded-full hover:bg-accent-700 active:scale-95 transition-all duration-200 whitespace-nowrap"
                style={{ boxShadow: '0 2px 8px rgba(225,29,72,0.30)' }}
              >
                <i className="ri-flashlight-fill text-sm"></i>
                Fırsatlar
              </Link>
              <Link
                to="/price-drops"
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white text-accent-600 border border-accent-600 text-xs font-bold rounded-full hover:bg-accent-50 active:scale-95 transition-all duration-200 whitespace-nowrap"
              >
                <i className="ri-arrow-down-s-line text-sm"></i>
                Fiyatı Düşenler
              </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Slide Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white animate-fade-in overflow-y-auto" style={{ top: '118px' }}>
          <div className="px-4 py-4 flex flex-col gap-1">
            {categoryLinks.map(cat => (
              <Link
                key={cat.label}
                to={cat.path}
                className="flex items-center gap-3 py-3 border-b border-surface-100 text-primary-800 text-base font-medium hover:text-accent-600 transition-colors"
              >
                {cat.icon && (
                  <span className="w-5 h-5 flex items-center justify-center text-accent-500">
                    <i className={`${cat.icon} text-lg`}></i>
                  </span>
                )}
                {cat.label}
              </Link>
            ))}
            <Link to="/track-order" className="flex items-center gap-3 py-3 border-b border-surface-100 text-primary-800 text-base font-medium">
              <span className="w-5 h-5 flex items-center justify-center text-accent-500"><i className="ri-map-pin-line text-lg"></i></span>
              Sipariş Takibi
            </Link>
            <Link to={isLoggedIn ? '/account' : '/login'} className="flex items-center gap-3 py-3 border-b border-surface-100 text-primary-800 text-base font-medium">
              <span className="w-5 h-5 flex items-center justify-center text-accent-500"><i className="ri-user-line text-lg"></i></span>
              {isLoggedIn ? 'Hesabım' : 'Giriş Yap'}
            </Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-3 py-3 text-primary-800 text-base font-medium">
                <span className="w-5 h-5 flex items-center justify-center text-accent-500"><i className="ri-shield-user-line text-lg"></i></span>
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
