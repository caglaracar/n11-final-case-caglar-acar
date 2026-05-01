import { useMemo, useState } from 'react';
import { ALL_CATEGORY_ICONS, CATEGORY_ICON_CATALOG } from './iconCatalog';

interface Props {
  value: string;
  onChange: (next: string) => void;
}

export default function IconPicker({ value, onChange }: Props) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null; // null => grupları göster
    return ALL_CATEGORY_ICONS.filter((i) => i.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="space-y-3">
      {/* Önizleme + manuel input */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-md border border-surface-300 bg-surface-50 flex items-center justify-center text-2xl text-primary-700 shrink-0">
          {value ? <i className={value} /> : <i className="ri-image-add-line text-primary-300" />}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="ri-cpu-line"
            className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500 bg-white font-mono"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-xs text-red-500 hover:underline"
            >
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* Arama */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-primary-400">
          <i className="ri-search-line text-sm" />
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="İkon ara (ör. car, book, shirt)..."
          className="w-full pl-10 pr-4 py-2 border border-surface-300 rounded-md text-sm focus:outline-none focus:border-primary-500 bg-white"
        />
      </div>

      {/* Grid */}
      <div className="border border-surface-200 rounded-md max-h-72 overflow-y-auto bg-surface-50/40">
        {filtered ? (
          <IconGrid icons={filtered} value={value} onChange={onChange} />
        ) : (
          CATEGORY_ICON_CATALOG.map((g) => (
            <div key={g.group} className="px-3 pt-3 pb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-500 mb-2">
                {g.group}
              </p>
              <IconGrid icons={g.icons} value={value} onChange={onChange} />
            </div>
          ))
        )}
        {filtered && filtered.length === 0 && (
          <div className="text-center py-6 text-xs text-primary-400">Eşleşen ikon yok.</div>
        )}
      </div>
    </div>
  );
}

function IconGrid({
  icons,
  value,
  onChange,
}: {
  icons: string[];
  value: string;
  onChange: (n: string) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-1">
      {icons.map((icon) => {
        const selected = icon === value;
        return (
          <button
            key={icon}
            type="button"
            title={icon}
            onClick={() => onChange(icon)}
            className={`aspect-square flex items-center justify-center rounded-md text-lg transition-colors cursor-pointer ${
              selected
                ? 'bg-primary-900 text-white shadow-sm ring-2 ring-primary-900/40'
                : 'text-primary-700 hover:bg-white hover:shadow-sm'
            }`}
          >
            <i className={icon} />
          </button>
        );
      })}
    </div>
  );
}
