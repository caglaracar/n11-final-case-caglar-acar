import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2.5 group', className)}>
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm transition-transform group-hover:scale-105">
        <ShoppingCart className="h-5 w-5" strokeWidth={2.5} />
      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <div className="text-[20px] font-extrabold tracking-tight">
            <span className="text-foreground">Sepet</span>
            <span className="text-brand-600">ify</span>
          </div>
          <span className="mt-0.5 text-[10px] tracking-wider text-muted-foreground">Alışverişin en kolay hali</span>
        </div>
      )}
    </Link>
  );
}
