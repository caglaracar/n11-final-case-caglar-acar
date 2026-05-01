import HeroSlider from './components/HeroSlider';
import QuickLinks from './components/QuickLinks';
import FlashDeals from './components/FlashDeals';
import PriceDropsCarousel from './components/PriceDropsCarousel';
import CategoriesSection from './components/CategoriesSection';
import ProductCarousel from './components/ProductCarousel';
import Footer from '@/components/feature/Footer';
import Navbar from '@/components/feature/Navbar';
import { useProducts } from '@/hooks/useProducts';

export default function Home() {
  const { products } = useProducts(60);

  const electronics   = products.filter((p) => p.category === 'Electronics' || p.subcategory === 'Audio');
  const homeProducts  = products.filter((p) => p.category === 'Home & Living' || p.category === 'Appliances');
  const sportsProducts = products.filter((p) => p.category === 'Sports & Outdoors' || p.category === 'Footwear');

  return (
    <div className="bg-[#FAFAF8]">
      <Navbar />

      <div className="pt-[124px] md:pt-[156px]"></div>

      <HeroSlider />
      <QuickLinks />
      <FlashDeals />
      <PriceDropsCarousel />
      <CategoriesSection />

      {electronics.length > 0 && (
        <ProductCarousel
          title="Elektronik"
          subtitle="Kulaklık, akıllı saat, hoparlör ve dahası"
          products={electronics}
        />
      )}

      {homeProducts.length > 0 && (
        <ProductCarousel
          title="Ev & Yaşam"
          subtitle="Beyaz eşya, mutfak ve mobilya"
          products={homeProducts}
        />
      )}

      {sportsProducts.length > 0 && (
        <ProductCarousel
          title="Spor & Outdoor"
          subtitle="Bir sonraki maceran için ekipmanlar"
          products={sportsProducts}
        />
      )}

      {products.length > 0 && (
        <ProductCarousel
          title="Tüm Ürünler"
          subtitle="Kataloğumuzu keşfet"
          products={products}
        />
      )}

      {/* Trust Badges */}
      <section className="bg-white py-6 border-b border-surface-200">
        <div className="section-padding">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: 'ri-truck-line',              title: 'Ücretsiz Kargo',  sub: '$100 üzeri siparişlerde' },
              { icon: 'ri-shield-check-line',       title: 'Güvenli Ödeme',   sub: 'SSL şifreli ödeme'       },
              { icon: 'ri-refresh-line',            title: '30 Gün İade',     sub: 'Sorunsuz iade hakkı'     },
              { icon: 'ri-customer-service-2-line', title: '7/24 Destek',     sub: 'Her zaman yanındayız'    },
            ].map((b) => (
              <div key={b.title} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-100">
                <span className="w-9 h-9 flex items-center justify-center rounded-full bg-accent-100 text-accent-600 flex-shrink-0">
                  <i className={`${b.icon} text-lg`}></i>
                </span>
                <div>
                  <p className="text-sm font-bold text-primary-900">{b.title}</p>
                  <p className="text-xs text-primary-400">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
