'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { bannerApi } from '@/features/banners/api/bannerApi';
import type { Banner } from '@/features/banners/types';
import { cn } from '@/shared/lib/utils';

const FALLBACK: Banner[] = [
  {
    id: 'fallback-1',
    eyebrow: 'Yeni Sezon',
    title: 'Premium ürünler · uygun fiyatlar',
    subtitle: 'Elektronikten modaya, ev yaşamından spora kadar binlerce ürün seni bekliyor.',
    ctaLabel: 'Alışverişe başla',
    ctaHref: '/products',
    imageUrl:
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80&auto=format&fit=crop',
    badge: null,
    sortOrder: 0,
    active: true,
  },
];

const AUTOPLAY_MS = 6500;

export function HeroSlider() {
  const { data } = useQuery({
    queryKey: ['banners'],
    queryFn: () => bannerApi.findAll().catch(() => [] as Banner[]),
    staleTime: 5 * 60 * 1000,
  });

  const slides = data && data.length > 0 ? data : FALLBACK;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;
  const safe = ((index % total) + total) % total;
  const slide = slides[safe];

  const next = useCallback(() => setIndex((i) => i + 1), []);
  const prev = useCallback(() => setIndex((i) => i - 1), []);

  useEffect(() => {
    if (paused || total <= 1) return;
    const t = window.setInterval(next, AUTOPLAY_MS);
    return () => window.clearInterval(t);
  }, [paused, total, next]);

  return (
    <section
      className="relative overflow-hidden bg-ink-700 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-brand-500/15 blur-3xl" />

      <div className="container relative z-10">
        <div className="grid min-h-[420px] items-center gap-8 py-12 md:min-h-[480px] md:grid-cols-[1.1fr_1fr] md:gap-12 md:py-16">
          <div key={`text-${safe}`} className="flex max-w-xl flex-col animate-in fade-in slide-in-from-bottom-3 duration-500">
            {slide.eyebrow && (
              <span className="mb-5 inline-flex w-fit items-center rounded-full bg-brand-600 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest shadow-md">
                {slide.eyebrow}
              </span>
            )}
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="mt-5 max-w-md text-sm leading-relaxed text-white/80 md:text-base">
                {slide.subtitle}
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {slide.ctaLabel && slide.ctaHref && (
                <Link
                  href={slide.ctaHref}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-ink-700 shadow-xl shadow-black/20 transition-transform hover:-translate-y-0.5 active:scale-95"
                >
                  {slide.ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:border-white/50 hover:bg-white/10"
              >
                Tüm ürünler
              </Link>
            </div>
          </div>

          <div className="relative hidden h-full md:flex md:items-center md:justify-center">
            <div
              key={`img-${safe}`}
              className="relative animate-in fade-in zoom-in-95 duration-500"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="h-[320px] w-full max-w-[460px] rounded-2xl object-cover shadow-2xl shadow-black/40 ring-1 ring-white/10 lg:h-[380px]"
              />
            </div>
          </div>
        </div>
      </div>

      {total > 1 && (
        <>
          <SliderArrow side="left" onClick={prev} />
          <SliderArrow side="right" onClick={next} />
          <div className="absolute bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === safe ? 'w-8 bg-brand-500' : 'w-2 bg-white/30 hover:bg-white/50',
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function SliderArrow({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Önceki' : 'Sonraki'}
      className={cn(
        'absolute top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/20 md:flex',
        side === 'left' ? 'left-4' : 'right-4',
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
