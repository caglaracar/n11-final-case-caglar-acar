import { Link } from 'react-router-dom';
import ProductCard from '@/components/base/ProductCard';
import { products } from '@/mocks/products';

export default function FeaturedProducts() {
  const featured = products.slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="section-padding">
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <div>
            <p className="text-sm text-surface-500 tracking-wider uppercase mb-2">Curated Selection</p>
            <h2 className="font-display text-2xl md:text-4xl text-primary-900 font-medium">Trending Now</h2>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-900 transition-colors"
          >
            View All
            <span className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-line"></i></span>
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
        <div className="sm:hidden mt-8 text-center">
          <Link to="/products" className="btn-outline inline-block">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
