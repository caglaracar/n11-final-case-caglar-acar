'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Flame, Search, ShoppingBag, TrendingUp, User } from 'lucide-react';
import { Logo } from '@/shared/components/Logo';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { useCartStore } from '@/features/cart/store';
import { categoryApi } from '@/features/categories/api/categoryApi';
import { productApi } from '@/features/products/api/productApi';
import { cn } from '@/shared/lib/utils';

export function Header() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const itemCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));

  const { data: categories = [] } = useQuery({
    queryKey: ['nav-categories'],
    queryFn: () =>
      categoryApi
        .findAll()
        .then((cats) =>
          [...cats]
            .filter((c) => c.visibleInNav !== false)
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
        )
        .catch(() => []),
    staleTime: 5 * 60 * 1000,
  });

  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { data: trending = [] } = useQuery({
    queryKey: ['search', 'trending', 10],
    queryFn: () => productApi.trending(10).catch(() => []),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function submit(term?: string) {
    const value = (term ?? q).trim();
    if (!value) return;
    setOpen(false);
    router.push(`/products?q=${encodeURIComponent(value)}`);
    // backend kaydı asenkron işlendikten sonra dropdown'ı tazele
    setTimeout(() => {
      void queryClient.invalidateQueries({ queryKey: ['search', 'trending'] });
    }, 600);
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center gap-6">
        <Logo />

        <div ref={wrapRef} className="relative hidden flex-1 md:block">
          <form
            action="/products"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => {
                setOpen(true);
                void queryClient.invalidateQueries({ queryKey: ['search', 'trending'] });
              }}
              placeholder="Ürün, marka veya kategori ara…"
              className="pl-9"
              autoComplete="off"
            />
          </form>

          {open && trending.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border bg-white text-foreground shadow-xl ring-1 ring-black/5">
              <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                Trend Aramalar
              </div>
              <ul className="max-h-80 overflow-auto py-1">
                {trending.map((t, i) => (
                  <li key={t.term}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        submit(t.term);
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent/60"
                    >
                      <span
                        className={cn(
                          'grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs font-bold tabular-nums',
                          i < 3
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {i < 3 ? <Flame className="h-3.5 w-3.5" /> : i + 1}
                      </span>
                      <span className="flex-1 truncate font-medium text-foreground">{t.term}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {t.count.toLocaleString('tr-TR')} arama
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          <Link
            href="/products"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          >
            Tümü
          </Link>
          {categories.slice(0, 4).map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${encodeURIComponent(c.slug || c.name)}`}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Hesabım">
            <Link href="/account">
              <User />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" className="relative" aria-label="Sepet">
            <Link href="/cart">
              <ShoppingBag />
              {itemCount > 0 && (
                <Badge
                  variant="sale"
                  className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]"
                >
                  {itemCount}
                </Badge>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
