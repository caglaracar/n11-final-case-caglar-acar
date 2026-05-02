import { NavLink, Outlet } from 'react-router-dom';
import {
  Award,
  Image as ImageIcon,
  LogOut,
  Package,
  Percent,
  ShoppingBag,
  Tags,
  Users,
  Zap,
} from 'lucide-react';

import { Logo } from '@/shared/components/Logo';
import { Button } from '@/shared/components/ui/button';
import { useAuthStore } from '@/features/auth/store';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { cn } from '@/shared/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Package;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: 'Katalog',
    items: [
      { to: '/products', label: 'Ürünler', icon: Package },
      { to: '/categories', label: 'Kategoriler', icon: Tags },
      { to: '/brands', label: 'Markalar', icon: Award },
      { to: '/banners', label: 'Bannerlar', icon: ImageIcon },
    ],
  },
  {
    label: 'Kampanya',
    items: [
      { to: '/flash-deals', label: 'Flash Fırsatlar', icon: Zap },
      { to: '/price-drops', label: 'Fiyat Düşüşleri', icon: Percent },
    ],
  },
  {
    label: 'Satış',
    items: [{ to: '/orders', label: 'Siparişler', icon: ShoppingBag }],
  },
  {
    label: 'Topluluk',
    items: [
      { to: '/users', label: 'Kullanıcılar', icon: Users },
    ],
  },
];

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] bg-muted/30">
      <aside className="sticky top-0 flex h-screen flex-col bg-brand-dark px-4 py-6 text-white shadow-xl">
        <div className="px-2 pb-6">
          <Logo variant="light" />
        </div>

        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto pr-1">
          {NAV.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                {group.label}
              </p>
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand text-white shadow-md shadow-brand/30'
                        : 'text-white/70 hover:bg-white/5 hover:text-white',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <div className="mb-3 flex items-center gap-2 px-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-brand/20 text-xs font-bold text-brand">
              {user?.userName?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0 text-sm">
              <p className="truncate font-medium text-white">{user?.userName ?? 'Admin'}</p>
              <p className="truncate text-xs text-white/60">{user?.email ?? ''}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut className="h-4 w-4" />
            Çıkış yap
          </Button>
        </div>
      </aside>

      <main className="min-w-0 px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export type { NavGroup, NavItem };
