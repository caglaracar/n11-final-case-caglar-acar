'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogOut, Package, MapPin, User } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { useAuthStore } from '@/features/auth/store';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useAuthHydrated } from '@/features/auth/hooks/useAuthHydrated';

const TILES = [
  { href: '/account/orders', icon: Package, title: 'Siparişlerim', desc: 'Geçmiş ve aktif siparişlerin' },
  { href: '/account/addresses', icon: MapPin, title: 'Adreslerim', desc: 'Teslimat ve fatura adresleri' },
  { href: '/account/profile', icon: User, title: 'Profilim', desc: 'Hesap bilgilerini güncelle' },
];

export default function AccountPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const tokens = useAuthStore((s) => s.tokens);
  const logout = useLogout();
  const hydrated = useAuthHydrated();

  useEffect(() => {
    if (hydrated && !tokens) router.replace('/auth?tab=login&returnTo=/account');
  }, [hydrated, tokens, router]);

  if (!hydrated || !user) return null;
  const greeting = user.name?.trim() || user.userName;

  return (
    <div className="container py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Merhaba, {greeting}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" onClick={() => logout.mutate()} disabled={logout.isPending}>
          <LogOut /> Çıkış yap
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map(({ href, icon: Icon, title, desc }) => (
          <Link key={href} href={href}>
            <Card className="h-full transition-colors hover:border-brand-500/50">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-brand-500/10 text-brand-600">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
