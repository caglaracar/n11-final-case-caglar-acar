import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { bannerService, type Banner } from '@/services';

/**
 * Banner'lar admin panelinden yönetiliyor. BE çağrısı başarısızsa
 * fallback slide kullanılır.
 */
const fallbackSlides: Banner[] = [
  {
    id: 'fallback-1',
    eyebrow: 'Mega İndirim',
    title: "Teknoloji Ürünleri %30'a Varan İndirim",
    subtitle: 'Sony, Apple, Samsung ve daha fazlası — premium fiyatlarla değil.',
    ctaLabel: "Elektronik'e Bak",
    ctaHref: '/products',
    imageUrl: 'https://picsum.photos/seed/sepetify-hero-1/1200/640',
    badge: null,
    sortOrder: 0,
    active: true,
  },
];

const slideThemes = [
  { bgFrom: '#0f2b26', bgTo: '#0d3d35', accent: '#f43f5e', glow: 'rgba(244,63,94,0.35)' },
  { bgFrom: '#1a2e1a', bgTo: '#0d3320', accent: '#34d399', glow: 'rgba(52,211,153,0.30)' },
  { bgFrom: '#1a1f0d', bgTo: '#2a3012', accent: '#facc15', glow: 'rgba(250,204,21,0.30)' },
  { bgFrom: '#1f1233', bgTo: '#2d1a4d', accent: '#a78bfa', glow: 'rgba(167,139,250,0.30)' },
  { bgFrom: '#0c1f33', bgTo: '#102a4d', accent: '#60a5fa', glow: 'rgba(96,165,250,0.30)' },
];
const themeOf = (idx: number) => slideThemes[idx % slideThemes.length];

const AUTOPLAY_MS = 6000;

export default function HeroSlider() {
  const [slides, setSlides] = useState<Banner[]>(fallbackSlides);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const sliderRef = useRef<HTMLElement>(null);

  useEffect(() => {
    bannerService
      .findAllActive()
      .then((list) => {
        if (list && list.length > 0) setSlides(list);
      })
      .catch(() => {
        /* fallback ile devam */
      });
  }, []);

  const total = slides.length;
  const safeIdx = total === 0 ? 0 : ((current % total) + total) % total;
  const slide = slides[safeIdx];
  const theme = themeOf(safeIdx);

  const next = useCallback(() => setCurrent((c) => c + 1), []);
  const prev = useCallback(() => setCurrent((c) => c - 1), []);
  const goTo = useCallback((idx: number) => setCurrent(idx), []);

  useEffect(() => {
    if (paused || total <= 1) return;
    const t = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, total, next]);

  // Klavye navigasyonu — slider focus'taysa ok tuşlarıyla.
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [prev, next]);

  if (total === 0) return null;

  return (
    <section
      ref={sliderRef}
      tabIndex={0}
      className="relative w-full overflow-hidden focus:outline-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        background: `linear-gradient(135deg, ${theme.bgFrom} 0%, ${theme.bgTo} 100%)`,
        transition: 'background 0.7s ease',
      }}
      aria-roledescription="carousel"
    >
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Glow */}
      <div
        className="absolute -top-32 right-[-100px] w-[640px] h-[640px] rounded-full blur-3xl opacity-50 pointer-events-none transition-all duration-700"
        style={{ background: theme.glow }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700"
        style={{ background: theme.glow }}
      />

      <div className="section-padding relative z-10">
        <div className="grid md:grid-cols-[1.1fr_1fr] items-center min-h-[400px] md:min-h-[480px] gap-8 md:gap-12 py-12 md:py-16">
          {/* LEFT: Text */}
          <div key={`text-${safeIdx}`} className="flex flex-col justify-center max-w-[560px] animate-slide-fade-in">
            {slide.eyebrow && (
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="text-white text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md"
                  style={{ background: theme.accent }}
                >
                  {slide.eyebrow}
                </span>
                {slide.badge && (
                  <span className="text-white/50 text-xs uppercase tracking-wider">{slide.badge}</span>
                )}
              </div>
            )}

            <h2
              className="font-display font-black text-3xl md:text-5xl lg:text-6xl leading-[1.05] mb-5"
              style={{ color: theme.accent }}
            >
              {slide.title}
            </h2>

            {slide.subtitle && (
              <p className="text-white/70 text-sm md:text-lg leading-relaxed mb-8 max-w-md">
                {slide.subtitle}
              </p>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              {slide.ctaLabel && slide.ctaHref && (
                <Link
                  to={slide.ctaHref}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-primary-900 bg-white hover:bg-surface-50 transition-all active:scale-95 whitespace-nowrap shadow-xl shadow-black/20"
                >
                  {slide.ctaLabel}
                  <span className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-arrow-right-line text-sm" />
                  </span>
                </Link>
              )}
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white border border-white/25 hover:border-white/50 hover:bg-white/10 transition-all whitespace-nowrap"
              >
                Tümünü Gör
              </Link>
            </div>
          </div>

          {/* RIGHT: Image */}
          <div className="hidden md:flex items-center justify-center relative h-full">
            <div
              className="absolute inset-0 m-auto w-[380px] h-[380px] rounded-full blur-3xl opacity-40"
              style={{ background: theme.glow }}
            />
            <div
              key={`img-${safeIdx}`}
              className="relative animate-image-pop"
              style={{ animationDuration: '700ms' }}
            >
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full max-w-[460px] h-[300px] lg:h-[400px] object-cover rounded-2xl relative z-10 shadow-2xl shadow-black/40 ring-1 ring-white/10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {total > 1 && !paused && (
        <div
          key={`progress-${safeIdx}`}
          className="absolute bottom-0 left-0 h-1 z-20"
          style={{
            background: theme.accent,
            animation: `hero-progress ${AUTOPLAY_MS}ms linear forwards`,
          }}
        />
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2 z-20">
          {slides.map((_, idx) => {
            const active = safeIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className="cursor-pointer p-1"
                aria-label={`Slide ${idx + 1}`}
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    active ? 'w-10' : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  style={active ? { background: theme.accent, boxShadow: `0 0 12px ${theme.glow}` } : undefined}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Prev / Next */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Önceki slide"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full transition-all duration-200 cursor-pointer backdrop-blur-md ring-1 ring-white/10 hover:ring-white/30 z-20 active:scale-90"
          >
            <i className="ri-arrow-left-s-line text-2xl" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Sonraki slide"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full transition-all duration-200 cursor-pointer backdrop-blur-md ring-1 ring-white/10 hover:ring-white/30 z-20 active:scale-90"
          >
            <i className="ri-arrow-right-s-line text-2xl" />
          </button>
        </>
      )}

      {/* Counter */}
      {total > 1 && (
        <div className="absolute top-6 right-6 z-20 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-white text-xs font-mono tabular-nums tracking-widest ring-1 ring-white/10">
          {String(safeIdx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
      )}

      <style>{`
        @keyframes hero-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes slide-fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .animate-slide-fade-in { animation: slide-fade-in 600ms cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes image-pop {
          from { opacity: 0; transform: scale(0.94) translateX(20px); }
          to   { opacity: 1; transform: scale(1) translateX(0);       }
        }
        .animate-image-pop { animation: image-pop 700ms cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>
    </section>
  );
}
