import { Suspense } from 'react';
import { AuthClient } from '@/features/auth/components/AuthClient';

export const metadata = { title: 'Sepetify · Giriş yap veya üye ol' };

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function AuthPage({ searchParams }: Props) {
  const sp = await searchParams;
  const initial = sp.tab === 'register' ? 'register' : 'login';
  return (
    <Suspense>
      <AuthClient initial={initial} />
    </Suspense>
  );
}
