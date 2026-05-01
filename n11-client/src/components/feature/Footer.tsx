import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary-50 pt-8 pb-4 border-t border-primary-100">
      <div className="section-padding">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-accent-600">
                <i className="ri-shopping-cart-2-fill text-white text-sm" />
              </div>
              <div className="leading-none">
                <span className="font-display font-extrabold text-base text-primary-900 tracking-tight">
                  Sepet
                </span>
                <span className="font-display font-extrabold text-base text-accent-600">ify</span>
              </div>
            </div>
            <p className="text-surface-600 text-xs leading-relaxed mb-3">
              Premium ürünler, uygun fiyatlar, hızlı teslimat.
            </p>
            <div className="flex gap-2">
              {[
                { icon: 'ri-instagram-line', label: 'Instagram' },
                { icon: 'ri-facebook-line', label: 'Facebook' },
                { icon: 'ri-twitter-x-line', label: 'X' },
                { icon: 'ri-linkedin-line', label: 'LinkedIn' },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-primary-700 hover:bg-accent-50 hover:text-accent-600 transition-colors text-sm"
                >
                  <i className={s.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-primary-500 mb-2">
              Alışveriş
            </h4>
            <ul className="space-y-1.5">
              <li><Link to="/products" className="text-surface-600 text-xs hover:text-accent-600 transition-colors">Tüm Ürünler</Link></li>
              <li><Link to="/products?deals=1" className="text-surface-600 text-xs hover:text-accent-600 transition-colors">Fırsatlar</Link></li>
              <li><Link to="/basket" className="text-surface-600 text-xs hover:text-accent-600 transition-colors">Sepetim</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-primary-500 mb-2">
              Destek
            </h4>
            <ul className="space-y-1.5">
              <li><Link to="/contact" className="text-surface-600 text-xs hover:text-accent-600 transition-colors">İletişim</Link></li>
              <li><Link to="/track-order" className="text-surface-600 text-xs hover:text-accent-600 transition-colors">Sipariş Takibi</Link></li>
              <li><Link to="/faq" className="text-surface-600 text-xs hover:text-accent-600 transition-colors">SSS</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-primary-500 mb-2">
              Bülten
            </h4>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                (form as HTMLFormElement).reset();
              }}
            >
              <input
                type="email"
                name="email"
                placeholder="E-posta"
                required
                className="flex-1 min-w-0 px-3 py-2 rounded-md border border-surface-300 text-xs focus:outline-none focus:border-accent-400 bg-white"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-md bg-accent-600 text-white text-xs font-semibold hover:bg-accent-700 transition-colors whitespace-nowrap"
              >
                Abone Ol
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-primary-200 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-surface-500 text-[11px]">© 2026 Sepetify. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-3">
            <i className="ri-visa-fill text-xl text-surface-400" />
            <i className="ri-mastercard-fill text-xl text-surface-400" />
            <i className="ri-paypal-fill text-xl text-surface-400" />
            <i className="ri-apple-fill text-xl text-surface-400" />
          </div>
        </div>
      </div>
    </footer>
  );
}
