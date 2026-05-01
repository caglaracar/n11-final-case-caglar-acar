import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
      <img
        src="https://readdy.ai/api/search-image?query=modern%20premium%20lifestyle%20products%20collection%20flatlay%20warm%20golden%20lighting%20minimal%20aesthetic%20cream%20beige%20tones%20artistic%20photography%20wide%20angle%20electronics%20home%20goods&width=1600&height=900&seq=hero2&orientation=landscape"
        alt="LUXE Hero"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <p className="text-white/80 text-sm md:text-base tracking-[0.3em] uppercase mb-4 animate-fade-in">
          Premium Lifestyle 2026
        </p>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-medium mb-6 max-w-4xl leading-tight animate-slide-up">
          Everything You Love, Elevated
        </h1>
        <p className="text-white/70 text-base md:text-lg max-w-xl mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          From cutting-edge tech to home essentials, discover premium products curated for modern living.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Link to="/products" className="btn-primary text-center">
            Shop Now
          </Link>
          <Link to="/products" className="btn-outline border-white text-white hover:bg-white hover:text-primary-900 text-center">
            Explore Categories
          </Link>
        </div>
      </div>
    </section>
  );
}
