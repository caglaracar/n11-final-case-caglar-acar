import { HeroSlider } from '@/features/banners/components/HeroSlider';
import { CategoryGrid } from '@/features/categories/components/CategoryGrid';
import { FlashDealsSection } from '@/features/home/components/FlashDealsSection';
import { PriceDropsSection } from '@/features/home/components/PriceDropsSection';
import { PopularProducts } from '@/features/home/components/PopularProducts';

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <CategoryGrid />
      <FlashDealsSection />
      <PriceDropsSection />
      <PopularProducts />
    </>
  );
}
