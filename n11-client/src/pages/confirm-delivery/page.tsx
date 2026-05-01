import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { orderService } from '@/services';

type State = 'idle' | 'loading' | 'success' | 'already_delivered' | 'error';

export default function ConfirmDeliveryPage() {
  const [params] = useSearchParams();
  const orderId = Number(params.get('orderId'));
  const token   = params.get('token') ?? '';

  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const isValid = !Number.isNaN(orderId) && orderId > 0 && token.length > 0;

  const confirm = async () => {
    setState('loading');
    try {
      await orderService.confirmDelivery(orderId, token);
      setState('success');
    } catch (e: any) {
      const msg: string = e?.serverMessage || e?.message || '';
      if (msg.toLowerCase().includes('uygun durumda değil')) {
        setState('already_delivered');
      } else {
        setErrorMsg(msg || 'Onay işlemi başarısız oldu.');
        setState('error');
      }
    }
  };

  // Auto-confirm if params are present and valid (user just clicked the email link)
  useEffect(() => {
    if (isValid) confirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="pt-32 md:pt-36 flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">

          {(state === 'idle' || state === 'loading') && (
            <>
              <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-6">
                <i className="ri-truck-line text-3xl text-primary-600 animate-pulse"></i>
              </div>
              <h1 className="font-display font-bold text-2xl text-primary-900 mb-2">
                Teslim Onayı
              </h1>
              <p className="text-primary-400 text-sm mb-6">
                #{orderId} numaralı siparişiniz için teslim onayı işleniyor...
              </p>
              <div className="w-8 h-8 border-2 border-primary-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                <i className="ri-check-line text-4xl text-green-600"></i>
              </div>
              <h1 className="font-display font-bold text-2xl text-primary-900 mb-2">
                Teslim Onaylandı!
              </h1>
              <p className="text-primary-500 text-sm mb-6 max-w-sm mx-auto">
                #{orderId} numaralı siparişiniz <strong>Teslim Edildi</strong> olarak işaretlendi.
                Teşekkürler!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/track-order" className="btn-primary">Siparişlerime Git</Link>
                <Link to="/products" className="btn-outline">Alışverişe Devam</Link>
              </div>
            </>
          )}

          {state === 'already_delivered' && (
            <>
              <div className="w-20 h-20 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-6">
                <i className="ri-information-line text-4xl text-primary-400"></i>
              </div>
              <h1 className="font-display font-bold text-2xl text-primary-900 mb-2">
                Zaten Onaylanmış
              </h1>
              <p className="text-primary-500 text-sm mb-6">
                Bu sipariş daha önce teslim edildi olarak işaretlendi.
              </p>
              <Link to="/track-order" className="btn-primary">Siparişlerime Git</Link>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <i className="ri-error-warning-line text-4xl text-red-500"></i>
              </div>
              <h1 className="font-display font-bold text-2xl text-primary-900 mb-2">
                {!isValid ? 'Geçersiz Bağlantı' : 'Bir Hata Oluştu'}
              </h1>
              <p className="text-primary-500 text-sm mb-6 max-w-sm mx-auto">
                {!isValid
                  ? 'Bu bağlantı geçersiz veya eksik. Lütfen e-postanızdaki bağlantıya tıklayın.'
                  : errorMsg}
              </p>
              <Link to="/track-order" className="btn-outline">Siparişlerime Git</Link>
            </>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
}
