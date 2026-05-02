import { NavLink, Outlet } from 'react-router-dom';
import {
  Award,
  Image as ImageIcon,
  LayoutDashboard,
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
  icon: typeof LayoutDashboard;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: 'Genel',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
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
      <aside className="sticky top-0 flex h-screen flex-col border-r bg-background px-4 py-6">
        <div className="px-2 pb-6">
          <Logo />
        </div>

        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto pr-1">
          {NAV.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
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
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
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

        <div className="mt-auto border-t pt-4">
          <div className="mb-3 flex items-center gap-2 px-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {user?.userName?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0 text-sm">
              <p className="truncate font-medium">{user?.userName ?? 'Admin'}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email ?? ''}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
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
