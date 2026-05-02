import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface Props {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = 'Tümünü gör',
  icon,
  rightSlot,
  className,
}: Props) {
  return (
    <div className={cn('mb-5 flex items-end justify-between gap-3', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold tracking-tight md:text-2xl">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {rightSlot}
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-0.5 whitespace-nowrap text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
          >
            {viewAllLabel}
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
