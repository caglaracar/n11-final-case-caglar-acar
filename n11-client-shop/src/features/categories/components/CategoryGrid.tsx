'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Boxes } from 'lucide-react';
import { getAllCategories } from '@/features/categories/api/categoryApi';
import type { Category } from '@/features/categories/types/categories-types';
import { SectionHeader } from '@/shared/components/SectionHeader';

const PALETTE = [
  'from-brand-500/10 to-brand-600/10 text-brand-700',
  'from-emerald-500/10 to-emerald-600/10 text-emerald-700',
  'from-sky-500/10 to-indigo-500/10 text-indigo-700',
  'from-amber-500/10 to-orange-500/10 text-amber-700',
  'from-rose-500/10 to-pink-500/10 text-rose-700',
  'from-teal-500/10 to-cyan-500/10 text-teal-700',
  'from-violet-500/10 to-fuchsia-500/10 text-violet-700',
  'from-slate-500/10 to-zinc-500/10 text-slate-700',
];

async function loadVisibleCategories(): Promise<Category[]> {
  try {
    const allCategories = await getAllCategories();
    return [...allCategories]
      .filter((category) => category.visibleInNav !== false)
      .sort((first, second) => (first.sortOrder ?? 0) - (second.sortOrder ?? 0));
  } catch {
    return [];
  }
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

export function CategoryGrid() {
  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: loadVisibleCategories,
    staleTime: 5 * 60 * 1000,
  });

  if (!data || data.length === 0) return null;

  return (
    <section className="container py-10">
      <SectionHeader
        title="Kategoriler"
        subtitle="İlgini çeken kategoriye göz at"
        icon={<Boxes className="h-4 w-4" />}
        viewAllHref="/products"
        viewAllLabel="Tümü"
      />

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {data.map((category, index) => (
          <Link
            key={category.id}
            href={`/products?category=${encodeURIComponent(category.slug || category.name)}`}
            className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm"
          >
            <span
              className={`grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br ${PALETTE[index % PALETTE.length]} text-xl transition-transform group-hover:scale-105`}
            >
              {category.iconClass ? <i className={category.iconClass} /> : getInitials(category.name)}
            </span>
            <p className="line-clamp-2 text-center text-xs font-semibold leading-tight">
              {category.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
