interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-surface-300 text-primary-600 hover:border-accent-400 hover:text-accent-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        <i className="ri-arrow-left-s-line text-lg"></i>
      </button>

      {getPages().map((page, i) => (
        <button
          key={i}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`min-w-[36px] h-9 px-2.5 flex items-center justify-center rounded-lg text-sm font-medium transition-all cursor-pointer ${
            page === currentPage
              ? 'bg-accent-500 text-white border border-accent-500'
              : page === '...'
                ? 'text-primary-400 cursor-default'
                : 'border border-surface-300 text-primary-600 hover:border-accent-400 hover:text-accent-500'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-surface-300 text-primary-600 hover:border-accent-400 hover:text-accent-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        <i className="ri-arrow-right-s-line text-lg"></i>
      </button>
    </div>
  );
}