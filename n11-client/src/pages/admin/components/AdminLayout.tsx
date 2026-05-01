import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: 'ri-dashboard-line' },
  { path: '/admin/products', label: 'Ürünler', icon: 'ri-shopping-bag-3-line' },
  { path: '/admin/categories', label: 'Kategoriler', icon: 'ri-price-tag-3-line' },
  { path: '/admin/brands', label: 'Markalar', icon: 'ri-bookmark-line' },
  { path: '/admin/flash-deals', label: 'Flash Fırsatlar', icon: 'ri-flashlight-line' },
  { path: '/admin/price-drops', label: 'Fiyatı Düşenler', icon: 'ri-arrow-down-s-line' },
  { path: '/admin/banners', label: 'Banner / Hero', icon: 'ri-image-line' },
  { path: '/admin/orders', label: 'Siparişler', icon: 'ri-file-list-3-line' },
  { path: '/admin/reviews', label: 'Yorumlar', icon: 'ri-chat-quote-line' },
  { path: '/admin/wishlists', label: 'Favoriler', icon: 'ri-heart-line' },
  { path: '/admin/customers', label: 'Müşteriler', icon: 'ri-user-3-line' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/admin/login', { replace: true });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-primary-900 text-white fixed h-full">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-accent-600 shadow-md shadow-accent-600/30">
              <i className="ri-shopping-cart-2-fill text-white text-base"></i>
            </div>
            <span className="font-display font-extrabold text-xl text-white">Sepet<span className="text-accent-400">ify</span></span>
            <span className="text-xs text-white/50 uppercase tracking-wider">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-all ${
                isActive(item.path)
                  ? 'bg-white/10 text-white font-medium border-l-2 border-accent-300'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center"><i className={`${item.icon} text-base`}></i></span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          {user?.userName && (
            <div className="flex items-center gap-2 px-1 py-1 text-xs text-white/60">
              <span className="w-7 h-7 rounded-full bg-accent-600/30 flex items-center justify-center text-accent-300">
                <i className="ri-user-3-line" />
              </span>
              <span className="truncate">{user.userName}</span>
            </div>
          )}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors w-full cursor-pointer"
          >
            <span className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></span>
            Back to Store
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-300 hover:text-red-200 transition-colors w-full cursor-pointer"
          >
            <span className="w-4 h-4 flex items-center justify-center"><i className="ri-logout-box-r-line"></i></span>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-primary-900 text-white flex flex-col h-full">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-accent-600">
                  <i className="ri-shopping-cart-2-fill text-white text-sm"></i>
                </div>
                <span className="font-display text-xl font-extrabold text-white">Sepet<span className="text-accent-400">ify</span></span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center text-white/60 cursor-pointer">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <nav className="flex-1 py-4">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 text-sm transition-all ${
                    isActive(item.path)
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center"><i className={`${item.icon} text-base`}></i></span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Mobile Header */}
        <header className="md:hidden bg-primary-900 text-white p-4 flex items-center justify-between sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="w-8 h-8 flex items-center justify-center cursor-pointer">
            <i className="ri-menu-line text-xl"></i>
          </button>
          <span className="font-display text-lg font-extrabold">Sepet<span className="text-accent-400">ify</span> Admin</span>
          <div className="w-8"></div>
        </header>

        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
