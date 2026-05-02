import { ShoppingCart } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export function Logo({ className, compact = false, variant = 'auto' }: { className?: string; compact?: boolean; variant?: 'auto' | 'light' | 'dark' }) {
  const isLight = variant === 'light';
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#FF44EE] to-[#a92aa0] text-white shadow-md shadow-brand/30">
        <ShoppingCart className="h-5 w-5" strokeWidth={2.5} />
      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <div className="text-[18px] font-extrabold tracking-tight">
            <span className={isLight ? 'text-white' : 'text-foreground'}>Sepet</span>
            <span className="text-brand">ify</span>
          </div>
          <span className={cn(
            'mt-0.5 text-[10px] font-medium uppercase tracking-widest',
            isLight ? 'text-white/50' : 'text-muted-foreground',
          )}>Admin</span>
        </div>
      )}
    </div>
  );
}
