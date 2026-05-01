export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-surface-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-surface-200 rounded w-1/3" />
        <div className="h-4 bg-surface-200 rounded w-3/4" />
        <div className="h-3 bg-surface-200 rounded w-1/2" />
        <div className="flex items-center gap-2 pt-1">
          <div className="h-5 bg-surface-200 rounded w-16" />
          <div className="h-3 bg-surface-200 rounded w-12" />
        </div>
      </div>
    </div>
  );
}