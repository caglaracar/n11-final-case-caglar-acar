import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { useAuth, useBasket, useWishlist } from '@/providers';
import {
  addressService,
  orderService,
  productService,
  toUiProduct,
  userService,
  type UiProduct,
} from '@/services';
import type { Address, Order } from '@/types/api';

type AccountTab = 'profile' | 'orders' | 'wishlist' | 'addresses' | 'settings';

const statusColor: Record<string, string> = {
  CREATED: 'bg-amber-100 text-amber-700',
  PAYMENT_PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const emptyAddress: Omit<Address, 'id'> = {
  title: 'Ev',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'TR',
  isDefault: false,
};

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, logout, refreshProfile } = useAuth();
  const { addItem } = useBasket();
  const { wishlist, toggleWishlist } = useWishlist();

  const [tab, setTab] = useState<AccountTab>('profile');

  // Profile
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState({ name: '', surName: '', phone: '', avatar: '' });
  const [savedMsg, setSavedMsg] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDraft({
        name: user.name ?? '',
        surName: user.surName ?? '',
        phone: user.phone ?? '',
        avatar: user.avatar ?? '',
      });
    }
  }, [user]);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // Wishlist hydration (productId → product)
  const [wishlistProducts, setWishlistProducts] = useState<UiProduct[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [addrForm, setAddrForm] = useState<Omit<Address, 'id'>>(emptyAddress);
  const [addrError, setAddrError] = useState<string | null>(null);

  useEffect(() => {
    if (tab !== 'orders') return;
    let cancelled = false;
    setOrdersLoading(true);
    orderService
      .mine(0, 50)
      .then((p) => {
        if (!cancelled) setOrders(p.content || []);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      })
      .finally(() => !cancelled && setOrdersLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tab]);

  useEffect(() => {
    if (tab !== 'wishlist') return;
    let cancelled = false;
    setWishlistLoading(true);
    Promise.all(
      wishlist.map((id) =>
        productService
          .findById(id)
          .then(toUiProduct)
          .catch(() => null),
      ),
    )
      .then((list) => {
        if (!cancelled) setWishlistProducts(list.filter((x): x is UiProduct => !!x));
      })
      .finally(() => !cancelled && setWishlistLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tab, wishlist]);

  useEffect(() => {
    if (tab !== 'addresses') return;
    let cancelled = false;
    setAddrLoading(true);
    addressService
      .list()
      .then((list) => !cancelled && setAddresses(list))
      .catch(() => !cancelled && setAddresses([]))
      .finally(() => !cancelled && setAddrLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const totalSpent = useMemo(
    () => orders.filter((o) => o.status === 'PAID').reduce((sum, o) => sum + o.totalAmount, 0),
    [orders],
  );

  const handleSaveProfile = async () => {
    setProfileError(null);
    try {
      await userService.update(draft);
      await refreshProfile();
      setEditMode(false);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch (e: any) {
      setProfileError(e?.serverMessage || e?.message || 'Profil güncellenemedi');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleAddToCartFromWishlist = (p: UiProduct) => {
    addItem({ id: p.id, name: p.name, price: p.price, image: p.image, category: p.category });
  };

  const handleAddAddress = async (e: FormEvent) => {
    e.preventDefault();
    setAddrError(null);
    try {
      const created = await addressService.create({
        ...addrForm,
        isDefault: addresses.length === 0 ? true : addrForm.isDefault,
      });
      setAddresses((prev) => [...prev, created]);
      setShowNewAddr(false);
      setAddrForm(emptyAddress);
    } catch (e: any) {
      setAddrError(e?.serverMessage || e?.message || 'Adres oluşturulamadı');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await addressService.delete(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      /* ignore */
    }
  };

  const handleMakeDefault = async (id: string) => {
    try {
      await addressService.setDefault(id);
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    } catch {
      /* ignore */
    }
  };

  const handleCancelOrder = async (id: number) => {
    try {
      const updated = await orderService.cancel(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch {
      /* ignore */
    }
  };

  const tabs: { key: AccountTab; label: string; icon: string }[] = [
    { key: 'profile', label: 'Profile', icon: 'ri-user-line' },
    { key: 'orders', label: 'My Orders', icon: 'ri-shopping-bag-2-line' },
    { key: 'wishlist', label: 'Wishlist', icon: 'ri-heart-line' },
    { key: 'addresses', label: 'Addresses', icon: 'ri-map-pin-line' },
    { key: 'settings', label: 'Settings', icon: 'ri-settings-3-line' },
  ];

  const displayName =
    [user?.name, user?.surName].filter(Boolean).join(' ') || user?.userName || 'Kullanıcı';
  const initial = (displayName || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      <div className="section-padding pt-36 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-900 flex items-center justify-center text-white font-display text-xl font-semibold flex-shrink-0">
                {initial}
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold text-primary-900">{displayName}</h1>
                <p className="text-sm text-primary-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-900 transition-colors border border-surface-300 px-4 py-2 rounded-md hover:border-primary-400 whitespace-nowrap cursor-pointer"
            >
              <span className="w-4 h-4 flex items-center justify-center">
                <i className="ri-logout-box-r-line"></i>
              </span>
              Sign Out
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-56 flex-shrink-0">
              <nav className="bg-white rounded-lg border border-surface-200 overflow-hidden">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                      tab === t.key
                        ? 'bg-primary-900 text-white'
                        : 'text-primary-600 hover:bg-surface-50 hover:text-primary-900'
                    }`}
                  >
                    <span className="w-4 h-4 flex items-center justify-center">
                      <i className={`${t.icon} text-base`}></i>
                    </span>
                    {t.label}
                  </button>
                ))}
              </nav>
            </aside>

            <main className="flex-1">
              {/* PROFILE */}
              {tab === 'profile' && (
                <div className="bg-white rounded-lg border border-surface-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-lg font-semibold text-primary-900">Personal Information</h2>
                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-1.5 text-sm text-primary-700 hover:text-primary-900 cursor-pointer whitespace-nowrap"
                      >
                        <span className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-pencil-line"></i>
                        </span>
                        Edit
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setEditMode(false)}
                          className="text-sm text-primary-400 hover:text-primary-700 cursor-pointer whitespace-nowrap"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          className="btn-primary py-2 px-4 text-sm whitespace-nowrap cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>

                  {savedMsg && (
                    <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-md px-4 py-2.5 text-sm">
                      <span className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-check-line"></i>
                      </span>
                      Profile updated successfully
                    </div>
                  )}
                  {profileError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {profileError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { label: 'First Name', key: 'name', icon: 'ri-user-line' },
                      { label: 'Last Name', key: 'surName', icon: 'ri-user-line' },
                      { label: 'Phone Number', key: 'phone', icon: 'ri-phone-line' },
                      { label: 'Avatar URL', key: 'avatar', icon: 'ri-image-line' },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block text-xs font-medium text-primary-600 uppercase tracking-wider mb-1.5">
                          {field.label}
                        </label>
                        {editMode ? (
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-primary-400">
                              <i className={`${field.icon} text-sm`}></i>
                            </span>
                            <input
                              value={(draft as any)[field.key] || ''}
                              onChange={(e) =>
                                setDraft((d) => ({ ...d, [field.key]: e.target.value }))
                              }
                              className="w-full pl-11 pr-4 py-2.5 border border-surface-300 rounded-md text-sm text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-800/20 hover:border-primary-400 transition-all bg-white"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 py-2.5 px-4 bg-surface-50 rounded-md border border-surface-100">
                            <span className="w-4 h-4 flex items-center justify-center text-primary-400 flex-shrink-0">
                              <i className={`${field.icon} text-sm`}></i>
                            </span>
                            <span className="text-sm text-primary-800">
                              {(user as any)?.[field.key] || '—'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-medium text-primary-600 uppercase tracking-wider mb-1.5">
                        Email
                      </label>
                      <div className="flex items-center gap-3 py-2.5 px-4 bg-surface-50 rounded-md border border-surface-100">
                        <span className="w-4 h-4 flex items-center justify-center text-primary-400 flex-shrink-0">
                          <i className="ri-mail-line text-sm"></i>
                        </span>
                        <span className="text-sm text-primary-800">{user?.email || '—'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-primary-600 uppercase tracking-wider mb-1.5">
                        Username
                      </label>
                      <div className="flex items-center gap-3 py-2.5 px-4 bg-surface-50 rounded-md border border-surface-100">
                        <span className="w-4 h-4 flex items-center justify-center text-primary-400 flex-shrink-0">
                          <i className="ri-at-line text-sm"></i>
                        </span>
                        <span className="text-sm text-primary-800">{user?.userName || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-surface-100">
                    <h3 className="font-medium text-primary-900 text-sm mb-4">Account Summary</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <SummaryStat label="Total Orders" value={String(orders.length)} icon="ri-shopping-bag-line" />
                      <SummaryStat label="Wishlist Items" value={String(wishlist.length)} icon="ri-heart-line" />
                      <SummaryStat label="Total Spent" value={`$${totalSpent.toFixed(2)}`} icon="ri-money-dollar-circle-line" />
                    </div>
                  </div>
                </div>
              )}

              {/* ORDERS */}
              {tab === 'orders' && (
                <div className="space-y-4">
                  <h2 className="font-display text-lg font-semibold text-primary-900 mb-2">Order History</h2>
                  {ordersLoading && <p className="text-sm text-primary-400">Yükleniyor...</p>}
                  {!ordersLoading && orders.length === 0 && (
                    <div className="bg-white rounded-lg border border-surface-200 py-16 text-center">
                      <span className="w-12 h-12 flex items-center justify-center mx-auto mb-3 text-primary-300">
                        <i className="ri-shopping-bag-line text-4xl"></i>
                      </span>
                      <p className="text-primary-500 text-sm">Henüz siparişiniz yok</p>
                      <Link to="/products" className="btn-primary mt-4 inline-block">
                        Alışverişe Başla
                      </Link>
                    </div>
                  )}
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-lg border border-surface-200 overflow-hidden">
                      <button
                        onClick={() =>
                          setExpandedOrder(expandedOrder === order.id ? null : order.id)
                        }
                        className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 gap-3 hover:bg-surface-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-semibold text-primary-900 text-sm">#{order.id}</p>
                            <p className="text-xs text-primary-400 mt-0.5">
                              {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              statusColor[order.status] || 'bg-surface-200 text-primary-600'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-display font-semibold text-primary-900">
                            ${order.totalAmount.toFixed(2)}
                          </p>
                          <span className="w-5 h-5 flex items-center justify-center text-primary-400">
                            {expandedOrder === order.id ? (
                              <i className="ri-arrow-up-s-line text-lg"></i>
                            ) : (
                              <i className="ri-arrow-down-s-line text-lg"></i>
                            )}
                          </span>
                        </div>
                      </button>
                      {expandedOrder === order.id && (
                        <div className="border-t border-surface-100 px-6 py-4 space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-primary-800">{item.productName}</p>
                                <p className="text-xs text-primary-400">Qty: {item.quantity}</p>
                              </div>
                              <p className="text-sm font-semibold text-primary-900">
                                ${(item.unitPrice * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                          <div className="flex items-center justify-between pt-3 border-t border-surface-100">
                            <Link
                              to={`/track-order?id=${order.id}`}
                              className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-900 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <span className="w-4 h-4 flex items-center justify-center">
                                <i className="ri-truck-line"></i>
                              </span>
                              Siparişi Takip Et
                            </Link>
                            {(order.status === 'CREATED' || order.status === 'PAYMENT_PENDING') && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="btn-outline py-1.5 px-4 text-xs"
                              >
                                İptal Et
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* WISHLIST */}
              {tab === 'wishlist' && (
                <div>
                  <h2 className="font-display text-lg font-semibold text-primary-900 mb-4">
                    My Wishlist{' '}
                    <span className="text-primary-400 font-normal text-base">({wishlist.length})</span>
                  </h2>
                  {wishlistLoading && <p className="text-sm text-primary-400">Yükleniyor...</p>}
                  {!wishlistLoading && wishlistProducts.length === 0 ? (
                    <div className="bg-white rounded-lg border border-surface-200 py-16 text-center">
                      <span className="w-12 h-12 flex items-center justify-center mx-auto mb-3 text-primary-300">
                        <i className="ri-heart-line text-4xl"></i>
                      </span>
                      <p className="text-primary-500 text-sm">Your wishlist is empty</p>
                      <Link to="/products" className="btn-primary mt-4 inline-block">
                        Continue Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlistProducts.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white rounded-lg border border-surface-200 overflow-hidden group"
                        >
                          <div className="relative h-56 overflow-hidden">
                            <Link to={`/product/${p.id}`}>
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                              />
                            </Link>
                            <button
                              onClick={() => toggleWishlist(p.id)}
                              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white rounded-full text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                            >
                              <i className="ri-heart-fill text-base"></i>
                            </button>
                          </div>
                          <div className="p-4">
                            <p className="font-medium text-primary-900 text-sm line-clamp-2">{p.name}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="font-display font-semibold text-primary-900">
                                ${p.price.toFixed(2)}
                              </span>
                              <button
                                onClick={() => handleAddToCartFromWishlist(p)}
                                className="btn-primary py-1.5 px-4 text-xs"
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ADDRESSES */}
              {tab === 'addresses' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-semibold text-primary-900">My Addresses</h2>
                    <button
                      onClick={() => setShowNewAddr((v) => !v)}
                      className="text-sm font-semibold text-accent-600 hover:text-accent-700"
                    >
                      {showNewAddr ? 'Vazgeç' : '+ Yeni Adres'}
                    </button>
                  </div>

                  {addrLoading && <p className="text-sm text-primary-400">Yükleniyor...</p>}
                  {addrError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {addrError}
                    </div>
                  )}

                  {showNewAddr && (
                    <form onSubmit={handleAddAddress} className="bg-white rounded-lg border border-surface-200 p-6 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          required
                          placeholder="Başlık"
                          value={addrForm.title}
                          onChange={(e) => setAddrForm({ ...addrForm, title: e.target.value })}
                          className="px-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-accent-400"
                        />
                        <input
                          required
                          placeholder="Ad Soyad"
                          value={addrForm.fullName}
                          onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                          className="px-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-accent-400"
                        />
                      </div>
                      <input
                        placeholder="Telefon"
                        value={addrForm.phone || ''}
                        onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-accent-400"
                      />
                      <input
                        required
                        placeholder="Adres satırı 1"
                        value={addrForm.line1}
                        onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })}
                        className="w-full px-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-accent-400"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          required
                          placeholder="Şehir"
                          value={addrForm.city}
                          onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                          className="px-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-accent-400"
                        />
                        <input
                          placeholder="İl/Eyalet"
                          value={addrForm.state || ''}
                          onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                          className="px-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-accent-400"
                        />
                        <input
                          required
                          placeholder="Posta Kodu"
                          value={addrForm.zipCode}
                          onChange={(e) => setAddrForm({ ...addrForm, zipCode: e.target.value })}
                          className="px-4 py-2.5 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-accent-400"
                        />
                      </div>
                      <button type="submit" className="btn-primary cursor-pointer">
                        Adresi Kaydet
                      </button>
                    </form>
                  )}

                  {!addrLoading && addresses.length === 0 && !showNewAddr && (
                    <div className="bg-white rounded-lg border border-surface-200 py-12 text-center">
                      <p className="text-primary-500 text-sm">Henüz adres eklenmemiş.</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addresses.map((a) => (
                      <div key={a.id} className="bg-white rounded-lg border border-surface-200 p-5">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-bold text-primary-900 text-sm">
                            {a.title || 'Adres'}{' '}
                            {a.isDefault && (
                              <span className="text-xs text-accent-600 ml-1">(varsayılan)</span>
                            )}
                          </p>
                          <button
                            onClick={() => handleDeleteAddress(a.id)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                        <p className="text-xs text-primary-600">
                          {a.fullName} {a.phone ? `· ${a.phone}` : ''}
                        </p>
                        <p className="text-xs text-primary-500 mt-1">
                          {a.line1}
                          {a.line2 ? `, ${a.line2}` : ''}, {a.city}
                          {a.state ? `, ${a.state}` : ''} {a.zipCode}
                          {a.country ? `, ${a.country}` : ''}
                        </p>
                        {!a.isDefault && (
                          <button
                            onClick={() => handleMakeDefault(a.id)}
                            className="mt-3 text-xs font-semibold text-accent-600 hover:text-accent-700"
                          >
                            Varsayılan yap
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SETTINGS */}
              {tab === 'settings' && (
                <div className="space-y-5">
                  <h2 className="font-display text-lg font-semibold text-primary-900 mb-2">Account Settings</h2>
                  <div className="bg-white rounded-lg border border-surface-200 p-6">
                    <h3 className="font-medium text-primary-900 mb-4 text-sm uppercase tracking-wider">
                      Privacy & Security
                    </h3>
                    <p className="text-sm text-primary-500">
                      Şifre değişikliği ve 2FA çok yakında. Şu an oturum yönetimi için aşağıdaki düğmeyi
                      kullanabilirsiniz.
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-logout-box-r-line"></i>
                    </span>
                    Sign out
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function SummaryStat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-surface-50 rounded-lg p-4 text-center border border-surface-100">
      <span className="w-8 h-8 flex items-center justify-center mx-auto mb-2 text-primary-600">
        <i className={`${icon} text-xl`}></i>
      </span>
      <p className="font-display text-xl font-semibold text-primary-900">{value}</p>
      <p className="text-xs text-primary-400 mt-0.5">{label}</p>
    </div>
  );
}
