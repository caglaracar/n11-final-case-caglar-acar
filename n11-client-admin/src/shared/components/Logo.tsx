import { ShoppingCart } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-sm">
        <ShoppingCart className="h-5 w-5" strokeWidth={2.5} />
      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <div className="text-[18px] font-extrabold tracking-tight">
            <span className="text-foreground">Sepet</span>
            <span className="text-orange-600">ify</span>
          </div>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Admin</span>
        </div>
      )}
    </div>
  );
}
