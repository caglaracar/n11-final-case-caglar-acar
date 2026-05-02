'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface Props {
  children: React.ReactNode;
  className?: string;
  /** Card genişliği `flex-shrink-0`'a önerilen sınıf (bu component children'a karışmaz). */
  itemClassName?: string;
  showArrows?: boolean;
}

/**
 * Generic horizontal-scroll carousel: ok butonları, kenar fade'leri ve
 * scroll progress bar içerir. Children'lar `flex-shrink-0` olarak verilmeli.
 */
export function HorizontalScroller({ children, className, showArrows = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft < max - 4);
      setProgress(max > 0 ? Math.min(1, el.scrollLeft / max) : 0);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [children]);

  const scrollBy = (dir: 'left' | 'right') => {
    const el = ref.current;
    if (!el) return;
    const amount = Math.max(320, el.clientWidth * 0.85);
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const showProgress = canLeft || canRight;

  return (
    <div className={cn('relative', className)}>
      {showArrows && (
        <>
          <ScrollArrow side="left" disabled={!canLeft} onClick={() => scrollBy('left')} />
          <ScrollArrow side="right" disabled={!canRight} onClick={() => scrollBy('right')} />
        </>
      )}

      {/* Edge fades */}
      {canLeft && (
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-2 left-0 top-0 z-10 w-10 bg-gradient-to-r from-background to-transparent"
        />
      )}
      {canRight && (
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-2 right-0 top-0 z-10 w-10 bg-gradient-to-l from-background to-transparent"
        />
      )}

      <div
        ref={ref}
        className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth pb-2 md:gap-4"
      >
        {children}
      </div>

      {showProgress && (
        <div className="mx-auto mt-3 h-[3px] w-32 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-150"
            style={{ width: `${Math.max(12, progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function ScrollArrow({
  side,
  onClick,
  disabled,
}: {
  side: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === 'left' ? 'Sola kaydır' : 'Sağa kaydır'}
      className={cn(
        'absolute top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background/95 text-foreground shadow-md backdrop-blur transition-all hover:border-brand-300 hover:text-brand-600 disabled:pointer-events-none disabled:opacity-0 md:flex',
        side === 'left' ? '-left-3' : '-right-3',
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
