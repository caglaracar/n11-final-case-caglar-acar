import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Logo } from '@/shared/components/Logo';
import { useAdminRegister, useLogin } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/features/auth/store';
import { cn } from '@/shared/lib/utils';

const loginSchema = z.object({
  userName: z.string().min(3, 'En az 3 karakter'),
  password: z.string().min(6, 'En az 6 karakter'),
});

const registerSchema = z
  .object({
    userName: z.string().min(3, 'En az 3 karakter'),
    email: z.string().email('Geçerli e-posta gir'),
    password: z.string().min(6, 'En az 6 karakter'),
    repassword: z.string().min(6, 'En az 6 karakter'),
    inviteCode: z.string().min(1, 'Davet kodu gerekli'),
  })
  .refine((d) => d.password === d.repassword, {
    path: ['repassword'],
    message: 'Şifreler eşleşmiyor',
  });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function LoginPage() {
  const token = useAuthStore((s) => s.accessToken);
  const [tab, setTab] = useState<'login' | 'register'>('login');

  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-muted/40 via-background to-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Logo className="mb-4" />
          <CardTitle>Yönetim Paneli</CardTitle>
          <CardDescription>
            {tab === 'login' ? 'Hesabınla giriş yap' : 'Yeni admin hesabı oluştur'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            <TabBtn active={tab === 'login'} onClick={() => setTab('login')}>
              Giriş yap
            </TabBtn>
            <TabBtn active={tab === 'register'} onClick={() => setTab('register')}>
              Kayıt ol
            </TabBtn>
          </div>
          {tab === 'login' ? <LoginForm /> : <RegisterForm />}
        </CardContent>
      </Card>
    </div>
  );
}

function TabBtn({
  active,
  ...rest
}: { active: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
      )}
      {...rest}
    />
  );
}

function LoginForm() {
  const { mutate, isPending } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { userName: '', password: '' },
  });
  return (
    <form className="space-y-4" onSubmit={handleSubmit((v) => mutate(v))}>
      <Field id="userName" label="Kullanıcı adı" error={errors.userName?.message}>
        <Input id="userName" autoComplete="username" {...register('userName')} />
      </Field>
      <Field id="password" label="Şifre" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
        />
      </Field>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Giriş yapılıyor…' : 'Giriş yap'}
      </Button>
    </form>
  );
}

function RegisterForm() {
  const { mutate, isPending } = useAdminRegister();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { userName: '', email: '', password: '', repassword: '', inviteCode: '' },
  });
  const DEMO_INVITE = 'n11-bootcamp-admin-2026';
  const useDemoInvite = () => {
    setValue('inviteCode', DEMO_INVITE, { shouldValidate: true });
    void navigator.clipboard?.writeText(DEMO_INVITE).catch(() => undefined);
  };
  return (
    <form className="space-y-4" onSubmit={handleSubmit((v) => mutate(v))}>
      <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200">
        <p className="font-semibold">Bootcamp değerlendirme · Demo davet kodu</p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <code className="rounded bg-amber-100 px-2 py-1 font-mono text-[11px] dark:bg-amber-900/40">
            {DEMO_INVITE}
          </code>
          <button
            type="button"
            onClick={useDemoInvite}
            className="rounded border border-amber-300 bg-white px-2 py-1 text-[11px] font-medium hover:bg-amber-100 dark:border-amber-700 dark:bg-transparent dark:hover:bg-amber-900/30"
          >
            Otomatik doldur
          </button>
        </div>
      </div>
      <Field id="r-userName" label="Kullanıcı adı" error={errors.userName?.message}>
        <Input id="r-userName" autoComplete="username" {...register('userName')} />
      </Field>
      <Field id="r-email" label="E-posta" error={errors.email?.message}>
        <Input id="r-email" type="email" autoComplete="email" {...register('email')} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field id="r-password" label="Şifre" error={errors.password?.message}>
          <Input id="r-password" type="password" {...register('password')} />
        </Field>
        <Field id="r-repassword" label="Tekrar" error={errors.repassword?.message}>
          <Input id="r-repassword" type="password" {...register('repassword')} />
        </Field>
      </div>
      <Field id="r-invite" label="Davet kodu" error={errors.inviteCode?.message}>
        <Input id="r-invite" placeholder={DEMO_INVITE} {...register('inviteCode')} />
      </Field>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Oluşturuluyor…' : 'Hesap oluştur'}
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
