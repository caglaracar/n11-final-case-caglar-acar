'use client';

import { forwardRef, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Logo } from '@/shared/components/Logo';
import { useLogin, useRegister } from '@/features/auth/hooks/useAuth';
import { cn } from '@/shared/lib/utils';

type Tab = 'login' | 'register';

const loginSchema = z.object({
  userName: z.string().min(1, 'Kullanıcı adı zorunlu'),
  password: z.string().min(1, 'Şifre zorunlu'),
});
type LoginValues = z.infer<typeof loginSchema>;

const registerSchema = z
  .object({
    userName: z
      .string()
      .min(3, 'En az 3 karakter')
      .max(30, 'En fazla 30 karakter')
      .regex(/^[a-zA-Z0-9_]+$/, 'Sadece harf, rakam ve _ kullanılabilir'),
    email: z.string().email('Geçerli e-posta giriniz'),
    password: z
      .string()
      .min(6, 'En az 6 karakter')
      .max(64)
      .regex(/[A-Z]/, 'En az bir büyük harf')
      .regex(/[a-z]/, 'En az bir küçük harf')
      .regex(/[0-9]/, 'En az bir rakam'),
    repassword: z.string(),
  })
  .refine((v) => v.password === v.repassword, {
    path: ['repassword'],
    message: 'Şifreler eşleşmiyor',
  });
type RegisterValues = z.infer<typeof registerSchema>;

export function AuthClient({ initial = 'login' }: { initial?: Tab }) {
  const [tab, setTab] = useState<Tab>(initial);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-sm sm:p-10">
          <header className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              {tab === 'login' ? 'Giriş yap' : 'Hesap oluştur'}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {tab === 'login'
                ? 'Hesabına giriş yap, kaldığın yerden devam et.'
                : 'Birkaç saniyede üye ol, alışverişe başla.'}
            </p>
          </header>

          <TabSwitch value={tab} onChange={setTab} />

          <div className="mt-6">
            {tab === 'login' ? (
              <LoginForm onSwitch={() => setTab('register')} />
            ) : (
              <RegisterForm onSwitch={() => setTab('login')} />
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Devam ederek{' '}
          <Link href="/legal/terms" className="underline hover:text-foreground">
            Kullanım Koşulları
          </Link>{' '}
          ve{' '}
          <Link href="/legal/privacy" className="underline hover:text-foreground">
            Gizlilik Politikası
          </Link>
          &apos;nı kabul etmiş olursun.
        </p>
      </div>
    </div>
  );
}

function TabSwitch({ value, onChange }: { value: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="relative grid grid-cols-2 rounded-lg bg-muted p-1">
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-md bg-background shadow-sm transition-transform duration-300 ease-out',
          value === 'login' ? 'translate-x-1' : 'translate-x-[calc(100%+0.25rem)]',
        )}
      />
      {(['login', 'register'] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            'relative z-10 rounded-md py-2 text-sm font-semibold transition-colors',
            value === t ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {t === 'login' ? 'Giriş Yap' : 'Üye Ol'}
        </button>
      ))}
    </div>
  );
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { mutate, isPending } = useLogin();
  const [showPwd, setShowPwd] = useState(false);
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
      <Field id="login-userName" label="Kullanıcı adı" error={errors.userName?.message}>
        <Input id="login-userName" autoComplete="username" placeholder="ahmet_y" {...register('userName')} />
      </Field>

      <Field id="login-password" label="Şifre" error={errors.password?.message}>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          placeholder="••••••••"
          show={showPwd}
          onToggle={() => setShowPwd((s) => !s)}
          {...register('password')}
        />
      </Field>

      <div className="flex justify-end">
        <Link href="/auth/forgot" className="text-sm font-medium text-primary hover:underline">
          Şifremi unuttum
        </Link>
      </div>

      <Button type="submit" className="h-11 w-full text-base font-semibold" disabled={isPending}>
        {isPending ? 'Giriş yapılıyor…' : 'Giriş Yap'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Hesabın yok mu?{' '}
        <button type="button" onClick={onSwitch} className="font-semibold text-primary hover:underline">
          Hemen üye ol
        </button>
      </p>
    </form>
  );
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { mutate, isPending } = useRegister();
  const [showPwd, setShowPwd] = useState(false);
  const [showRePwd, setShowRePwd] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { userName: '', email: '', password: '', repassword: '' },
  });

  const pwd = watch('password') ?? '';
  const strength = passwordStrength(pwd);

  return (
    <form className="space-y-4" onSubmit={handleSubmit((v) => mutate(v))}>
      <Field id="reg-userName" label="Kullanıcı adı" error={errors.userName?.message}>
        <Input id="reg-userName" autoComplete="username" placeholder="ahmet_y" {...register('userName')} />
      </Field>

      <Field id="reg-email" label="E-posta" error={errors.email?.message}>
        <Input id="reg-email" type="email" autoComplete="email" placeholder="ornek@mail.com" {...register('email')} />
      </Field>

      <Field id="reg-password" label="Şifre" error={errors.password?.message}>
        <PasswordInput
          id="reg-password"
          autoComplete="new-password"
          placeholder="En az 6 karakter"
          show={showPwd}
          onToggle={() => setShowPwd((s) => !s)}
          {...register('password')}
        />
        {pwd.length > 0 && <PasswordMeter score={strength} />}
      </Field>

      <Field id="reg-repassword" label="Şifre (tekrar)" error={errors.repassword?.message}>
        <PasswordInput
          id="reg-repassword"
          autoComplete="new-password"
          placeholder="••••••••"
          show={showRePwd}
          onToggle={() => setShowRePwd((s) => !s)}
          {...register('repassword')}
        />
      </Field>

      <Button type="submit" className="h-11 w-full text-base font-semibold" disabled={isPending}>
        {isPending ? 'Hesap oluşturuluyor…' : 'Üye Ol'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Zaten hesabın var mı?{' '}
        <button type="button" onClick={onSwitch} className="font-semibold text-primary hover:underline">
          Giriş yap
        </button>
      </p>
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
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  show: boolean;
  onToggle: () => void;
};

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ show, onToggle, className, ...rest }, ref) => (
    <div className="relative">
      <Input ref={ref} type={show ? 'text' : 'password'} className={cn('pr-10', className)} {...rest} />
      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? 'Şifreyi gizle' : 'Şifreyi göster'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  ),
);
PasswordInput.displayName = 'PasswordInput';

function passwordStrength(pwd: string): 0 | 1 | 2 | 3 | 4 {
  let s = 0;
  if (pwd.length >= 6) s++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd) || pwd.length >= 12) s++;
  return s as 0 | 1 | 2 | 3 | 4;
}

function PasswordMeter({ score }: { score: 0 | 1 | 2 | 3 | 4 }) {
  const labels = ['Çok zayıf', 'Zayıf', 'Orta', 'İyi', 'Güçlü'];
  const colors = ['bg-rose-400', 'bg-amber-400', 'bg-yellow-400', 'bg-lime-500', 'bg-emerald-500'];
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn('h-1 flex-1 rounded-full transition-colors', i < score ? colors[score] : 'bg-muted')}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{labels[score]}</p>
    </div>
  );
}
