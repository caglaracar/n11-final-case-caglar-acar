import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useBasket } from '@/providers';
import { addressService, orderService, paymentService } from '@/services';
import type { Address } from '@/types/api';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { formatPrice } from '@/lib/format';

// ─── Turkish Address API ──────────────────────────────────────────
type Province   = { id: number; name: string };
type District   = { id: number; name: string };

async function fetchProvinces(): Promise<Province[]> {
  try {
    const res = await fetch('https://turkiyeapi.dev/api/v1/provinces?fields=id,name');
    const json = await res.json();
    return (json.data as Province[]).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  } catch { return []; }
}

async function fetchDistricts(provinceId: number): Promise<District[]> {
  try {
    const res = await fetch(`https://turkiyeapi.dev/api/v1/provinces/${provinceId}`);
    const json = await res.json();
    return ((json.data?.districts ?? []) as District[]).sort((a, b) =>
      a.name.localeCompare(b.name, 'tr'));
  } catch { return []; }
}

// ─── Types ───────────────────────────────────────────────────────
const emptyAddrForm: Omit<Address, 'id'> = {
  title: 'Ev', fullName: '', phone: '', line1: '', line2: '',
  city: '', state: '', zipCode: '', country: 'Türkiye', isDefault: true,
};

type CardForm = { holderName: string; cardNumber: string; expireMonth: string; expireYear: string; cvc: string };
const emptyCard: CardForm = { holderName: '', cardNumber: '', expireMonth: '', expireYear: '', cvc: '' };

function formatCardNumber(raw: string) {
  return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

// ─── Component ───────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, totalPrice, clearBasket } = useBasket();
  const { user } = useAuth();

  const [step, setStep]           = useState<1 | 2>(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null);
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [addrForm, setAddrForm]   = useState<Omit<Address, 'id'>>(emptyAddrForm);

  // İl / İlçe
  const [provinces, setProvinces]   = useState<Province[]>([]);
  const [districts, setDistricts]   = useState<District[]>([]);
  const [selProvince, setSelProvince] = useState<number | null>(null);

  // Card
  const [card, setCard]         = useState<CardForm>(emptyCard);
  const [cardDisplay, setCardDisplay] = useState('');

  // Flow state
  const [placing, setPlacing]   = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const SHIPPING_THRESHOLD = 500;
  const shipping = totalPrice > SHIPPING_THRESHOLD ? 0 : 29.99;
  const tax      = totalPrice * 0.18;  // KDV %18
  const finalTotal = totalPrice + shipping + tax;

  useEffect(() => {
    fetchProvinces().then(setProvinces);
    let cancelled = false;
    addressService.list()
      .then((list) => {
        if (cancelled) return;
        setAddresses(list);
        const def = list.find((a) => a.isDefault) ?? list[0];
        if (def) setSelectedAddrId(def.id);
        else setShowNewAddr(true);
      })
      .catch(() => setShowNewAddr(true));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (user) {
      setAddrForm((s) => ({
        ...s,
        fullName: s.fullName || `${user.name ?? ''} ${user.surName ?? ''}`.trim(),
        phone:    s.phone    || user.phone || '',
      }));
      setCard((s) => ({
        ...s,
        holderName: s.holderName || `${user.name ?? ''} ${user.surName ?? ''}`.trim().toUpperCase(),
      }));
    }
  }, [user]); // eslint-disable-line

  const handleProvinceChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setSelProvince(id || null);
    setDistricts([]);
    const prov = provinces.find((p) => p.id === id);
    setAddrForm((s) => ({ ...s, city: prov?.name ?? '', state: '' }));
    if (id) {
      const dists = await fetchDistricts(id);
      setDistricts(dists);
    }
  };

  const handleCreateAddress = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const created = await addressService.create({
        ...addrForm,
        isDefault: addresses.length === 0 ? true : addrForm.isDefault,
      });
      setAddresses((prev) => [...prev, created]);
      setSelectedAddrId(created.id);
      setShowNewAddr(false);
      setAddrForm(emptyAddrForm);
      setSelProvince(null);
      setDistricts([]);
    } catch (err: any) {
      setError(err?.serverMessage || err?.message || 'Adres oluşturulamadı');
    }
  };

  const handleCardNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCard((s) => ({ ...s, cardNumber: raw }));
    setCardDisplay(formatCardNumber(raw));
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddrId) { setError('Lütfen bir teslimat adresi seçin.'); setStep(1); return; }
    if (items.length === 0) return;
    if (!card.holderName || !card.cardNumber || !card.expireMonth || !card.expireYear || !card.cvc) {
      setPaymentError('Lütfen tüm kart bilgilerini doldurun.');
      return;
    }
    setPlacing(true);
    setError(null);
    setPaymentError(null);
    try {
      // 1) Sipariş oluştur
      const order = await orderService.create({
        currency:  'TRY',
        userEmail: user?.email,
        items: items.map((i) => ({
          productId:   i.id,
          productName: i.name,
          unitPrice:   i.price,
          quantity:    i.quantity,
        })),
      });

      // 2) Kart ile ödeme — kart hiçbir zaman loglanmaz / Kafka'ya gitmez
      const payment = await paymentService.checkout({
        orderId:     order.id,
        holderName:  card.holderName,
        cardNumber:  card.cardNumber,
        expireMonth: card.expireMonth,
        expireYear:  card.expireYear,
        cvc:         card.cvc,
      });

      if (!payment.success) {
        setPaymentError(payment.failReason || 'Ödeme başarısız oldu. Lütfen kart bilgilerinizi kontrol edin.');
        setPlacing(false);
        return;
      }

      setPlacedOrderId(order.id);
      await clearBasket();
    } catch (err: any) {
      const msg = err?.serverMessage || err?.message || 'Bir hata oluştu';
      if (msg.toLowerCase().includes('ödeme') || msg.toLowerCase().includes('kart')) {
        setPaymentError(msg);
      } else {
        setError(msg);
      }
    } finally {
      setPlacing(false);
    }
  };

  // ─── Success screen ───────────────────────────────────────────
  if (placedOrderId) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="pt-32 md:pt-36 flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-green-50 mb-6">
            <i className="ri-check-line text-3xl text-green-600"></i>
          </div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-primary-900 mb-3">Sipariş Alındı!</h1>
          <p className="text-primary-400 text-sm mb-2 max-w-sm text-center">
            Sipariş numaranız: <span className="font-mono font-semibold">#{placedOrderId}</span>
          </p>
          <p className="text-primary-400 text-sm mb-8 max-w-sm text-center">
            Ödemeniz onaylandı. Kargo sürecine alındığında e-posta ile bilgilendirileceksiniz.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Link to={`/track-order`} className="btn-primary">Siparişlerime Git</Link>
            <Link to="/products" className="btn-outline">Alışverişe Devam</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="pt-32 md:pt-36 flex-1 flex flex-col items-center justify-center px-4">
          <h1 className="font-display font-bold text-2xl text-primary-900 mb-3">Sepetiniz Boş</h1>
          <Link to="/products" className="btn-primary mt-4">Alışverişe Başla</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <div className="pt-32 md:pt-36">
        <div className="section-padding py-8 md:py-12">
          <h1 className="font-display font-bold text-2xl md:text-3xl text-primary-900 mb-6">Sipariş Tamamla</h1>

          {/* Steps */}
          <div className="flex items-center gap-2 mb-8">
            {(['Teslimat', 'Ödeme'] as const).map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                  step === i + 1 ? 'bg-accent-500 text-white' : 'bg-surface-200 text-primary-600'
                }`}>
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-xs">{i + 1}</span>
                  {label}
                </div>
                {i === 0 && <div className="w-8 h-px bg-surface-300" />}
              </div>
            ))}
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* ─── Left: Steps ──────────────────────────────── */}
            <div className="lg:col-span-2">

              {/* Step 1: Address */}
              {step === 1 && (
                <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-bold text-lg text-primary-900">Teslimat Adresi</h2>
                    <button onClick={() => setShowNewAddr((v) => !v)}
                      className="text-sm font-semibold text-accent-600 hover:text-accent-700">
                      {showNewAddr ? 'Vazgeç' : '+ Yeni Adres'}
                    </button>
                  </div>

                  {/* Existing addresses */}
                  {addresses.length > 0 && !showNewAddr && (
                    <div className="space-y-2">
                      {addresses.map((a) => (
                        <label key={a.id} className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                          selectedAddrId === a.id ? 'border-accent-500 bg-accent-50' : 'border-surface-200 hover:border-surface-300'
                        }`}>
                          <input type="radio" checked={selectedAddrId === a.id}
                            onChange={() => setSelectedAddrId(a.id)} className="mt-1" />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-primary-900">
                              {a.title || 'Adres'} {a.isDefault && <span className="text-xs text-accent-600">(varsayılan)</span>}
                            </p>
                            <p className="text-xs text-primary-600">{a.fullName} · {a.phone}</p>
                            <p className="text-xs text-primary-500">
                              {a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}{a.state ? `, ${a.state}` : ''} {a.zipCode}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* New address form */}
                  {showNewAddr && (
                    <form onSubmit={handleCreateAddress} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input required placeholder="Başlık (Ev, İş)" value={addrForm.title}
                          onChange={(e) => setAddrForm({ ...addrForm, title: e.target.value })}
                          className="input" />
                        <input required placeholder="Ad Soyad" value={addrForm.fullName}
                          onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                          className="input" />
                      </div>
                      <input placeholder="Telefon" value={addrForm.phone}
                        onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                        className="w-full input" />
                      <input required placeholder="Adres satırı 1" value={addrForm.line1}
                        onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })}
                        className="w-full input" />
                      <input placeholder="Adres satırı 2 (opsiyonel)" value={addrForm.line2 || ''}
                        onChange={(e) => setAddrForm({ ...addrForm, line2: e.target.value })}
                        className="w-full input" />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* İl dropdown */}
                        <select required value={selProvince ?? ''} onChange={handleProvinceChange} className="input">
                          <option value="">İl seçin...</option>
                          {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        {/* İlçe dropdown */}
                        <select value={addrForm.state} disabled={districts.length === 0}
                          onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                          className="input disabled:opacity-60">
                          <option value="">{districts.length === 0 ? 'Önce il seçin' : 'İlçe seçin...'}</option>
                          {districts.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                      </div>

                      <input placeholder="Posta Kodu" value={addrForm.zipCode}
                        onChange={(e) => setAddrForm({ ...addrForm, zipCode: e.target.value })}
                        className="w-full input" />

                      <div className="flex gap-3">
                        <button type="submit" className="btn-primary cursor-pointer">Adresi Kaydet</button>
                        {addresses.length > 0 && (
                          <button type="button" onClick={() => setShowNewAddr(false)} className="btn-outline cursor-pointer">İptal</button>
                        )}
                      </div>
                    </form>
                  )}

                  {!showNewAddr && (
                    <button onClick={() => selectedAddrId && setStep(2)}
                      disabled={!selectedAddrId}
                      className="btn-primary mt-2 cursor-pointer disabled:opacity-50">
                      Ödeme Adımına Geç
                    </button>
                  )}
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
                  <h2 className="font-display font-bold text-lg text-primary-900">Ödeme Bilgileri</h2>

                  {paymentError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      <i className="ri-error-warning-line mr-1"></i>{paymentError}
                    </div>
                  )}

                  {/* Card form */}
                  <div className="space-y-4">
                    {/* Card preview */}
                    <div className="bg-gradient-to-br from-primary-800 to-primary-600 rounded-xl p-5 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-8 -translate-x-8"></div>
                      <p className="text-xs text-white/60 mb-3 uppercase tracking-widest">Kart Numarası</p>
                      <p className="font-mono text-lg tracking-widest mb-4">
                        {cardDisplay || '•••• •••• •••• ••••'}
                      </p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-white/60 uppercase tracking-widest">Kart Sahibi</p>
                          <p className="font-semibold text-sm">{card.holderName || 'AD SOYAD'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/60 uppercase tracking-widest">Son Kullanma</p>
                          <p className="font-mono text-sm">
                            {card.expireMonth || 'AA'}/{card.expireYear?.slice(-2) || 'YY'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <input type="text" placeholder="Kart üzerindeki isim (BÜYÜK HARF)"
                      value={card.holderName}
                      onChange={(e) => setCard({ ...card, holderName: e.target.value.toUpperCase() })}
                      className="w-full input" />

                    <div>
                      <input type="text" inputMode="numeric" placeholder="Kart Numarası (16 hane)"
                        value={cardDisplay}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                        className="w-full input font-mono" />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <select value={card.expireMonth}
                        onChange={(e) => setCard({ ...card, expireMonth: e.target.value })}
                        className="input">
                        <option value="">Ay</option>
                        {Array.from({ length: 12 }, (_, i) => {
                          const m = String(i + 1).padStart(2, '0');
                          return <option key={m} value={m}>{m}</option>;
                        })}
                      </select>
                      <select value={card.expireYear}
                        onChange={(e) => setCard({ ...card, expireYear: e.target.value })}
                        className="input">
                        <option value="">Yıl</option>
                        {Array.from({ length: 10 }, (_, i) => {
                          const y = String(new Date().getFullYear() + i);
                          return <option key={y} value={y}>{y}</option>;
                        })}
                      </select>
                      <input type="text" inputMode="numeric" placeholder="CVC"
                        value={card.cvc}
                        onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        maxLength={4}
                        className="input font-mono" />
                    </div>

                    {/* İyzico sandbox test hint */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 space-y-0.5">
                      <p className="font-semibold"><i className="ri-information-line mr-1"></i>Sandbox test kartı:</p>
                      <p>No: <span className="font-mono">5528790000000008</span> · Son: 12/2030 · CVC: 123</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="btn-outline cursor-pointer">Geri</button>
                    <button onClick={handlePlaceOrder} disabled={placing}
                      className="btn-primary flex-1 cursor-pointer disabled:opacity-50">
                      {placing
                        ? <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Ödeme yapılıyor...
                          </span>
                        : `Siparişi Tamamla — ${formatPrice(finalTotal, 'TRY')}`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Right: Order Summary ─────────────────────── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-surface-200 p-6 sticky top-40">
                <h2 className="font-display font-bold text-lg text-primary-900 mb-4">Sipariş Özeti</h2>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img src={item.image} alt={item.name}
                        className="w-14 h-14 rounded-md object-contain bg-surface-50 p-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-primary-900 truncate">{item.name}</p>
                        <p className="text-xs text-primary-400">Adet: {item.quantity}</p>
                        <p className="text-xs font-bold text-accent-500">
                          {formatPrice(item.price * item.quantity, 'TRY')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-surface-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-400">Ara Toplam</span>
                    <span className="font-semibold">{formatPrice(totalPrice, 'TRY')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-400">Kargo</span>
                    <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
                      {shipping === 0 ? 'ÜCRETSİZ' : formatPrice(shipping, 'TRY')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-400">KDV (%18)</span>
                    <span className="font-semibold">{formatPrice(tax, 'TRY')}</span>
                  </div>
                  {shipping === 0 && (
                    <p className="text-xs text-green-600">
                      <i className="ri-truck-line mr-1"></i>
                      {formatPrice(SHIPPING_THRESHOLD, 'TRY')} üzeri ücretsiz kargo!
                    </p>
                  )}
                  <div className="border-t border-surface-200 pt-2 flex justify-between">
                    <span className="font-bold text-primary-900">Toplam</span>
                    <span className="font-bold text-accent-500 text-lg">{formatPrice(finalTotal, 'TRY')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Global input style */}
      <style>{`.input { padding: 0.625rem 1rem; border: 1px solid #e5e7eb; border-radius: 0.375rem; font-size: 0.875rem; outline: none; width: 100%; background: white; } .input:focus { border-color: #6b7280; }`}</style>
    </div>
  );
}
