'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { profileApi, type UpdateProfilePayload, type UserProfile } from '@/features/profile/api/profileApi';
import { useAuthStore, type AuthUser } from '@/features/auth/store';
import { extractErrorMessage } from '@/shared/lib/api/client';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const EMPTY_FORM: UpdateProfilePayload = {
  name: '',
  surName: '',
  phone: '',
  avatar: '',
};

function toForm(profile: UserProfile): UpdateProfilePayload {
  return {
    name: profile.name ?? '',
    surName: profile.surName ?? '',
    phone: profile.phone ?? '',
    avatar: profile.avatar ?? '',
  };
}

function profileToAuthUser(profile: UserProfile): AuthUser {
  return {
    id: profile.id,
    authId: profile.authId,
    userName: profile.userName,
    email: profile.email,
    role: profile.role,
    name: profile.name ?? undefined,
    surName: profile.surName ?? undefined,
    phone: profile.phone ?? undefined,
    avatar: profile.avatar ?? undefined,
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const tokens = useAuthStore((s) => s.tokens);
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState<UpdateProfilePayload>(EMPTY_FORM);

  useEffect(() => {
    if (!tokens) router.replace('/auth?tab=login');
  }, [tokens, router]);

  const profileQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: profileApi.me,
    enabled: !!tokens,
  });

  useEffect(() => {
    if (profileQuery.data) setForm(toForm(profileQuery.data));
  }, [profileQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.update(payload),
    onSuccess: (updated) => {
      toast.success('Profilin güncellendi');
      setUser(profileToAuthUser(updated));
      queryClient.setQueryData(['profile', 'me'], updated);
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Profil güncellenemedi')),
  });

  if (!tokens) return null;

  return (
    <div className="container max-w-3xl py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profilim</h1>
        <p className="mt-1 text-sm text-muted-foreground">Hesap bilgilerini buradan güncelleyebilirsin.</p>
      </header>

      {profileQuery.isLoading ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">Yükleniyor…</CardContent>
        </Card>
      ) : profileQuery.isError ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            Profil bilgileri alınamadı.
          </CardContent>
        </Card>
      ) : profileQuery.data ? (
        <div className="grid gap-6">
          <ReadOnlyCard profile={profileQuery.data} />

          <Card>
            <CardHeader>
              <CardTitle>Bilgilerini güncelle</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  const payload: UpdateProfilePayload = {
                    name: form.name?.trim() || undefined,
                    surName: form.surName?.trim() || undefined,
                    phone: form.phone?.trim() || undefined,
                    avatar: form.avatar?.trim() || undefined,
                  };
                  updateMutation.mutate(payload);
                }}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Ad"
                    value={form.name ?? ''}
                    onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
                  />
                  <Field
                    label="Soyad"
                    value={form.surName ?? ''}
                    onChange={(value) => setForm((prev) => ({ ...prev, surName: value }))}
                  />
                </div>
                <Field
                  label="Telefon"
                  placeholder="+90 555 555 55 55"
                  value={form.phone ?? ''}
                  onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
                />
                <Field
                  label="Profil görseli (URL)"
                  placeholder="https://…"
                  value={form.avatar ?? ''}
                  onChange={(value) => setForm((prev) => ({ ...prev, avatar: value }))}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => profileQuery.data && setForm(toForm(profileQuery.data))}
                    disabled={updateMutation.isPending}
                  >
                    Sıfırla
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Kaydediliyor…' : 'Kaydet'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function ReadOnlyCard({ profile }: { profile: UserProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hesap bilgileri</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
        <ReadOnlyRow label="Kullanıcı adı" value={profile.userName} />
        <ReadOnlyRow label="E-posta" value={profile.email} />
        <ReadOnlyRow label="Rol" value={profile.role} />
        <ReadOnlyRow
          label="Üyelik tarihi"
          value={new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(new Date(profile.createdAt))}
        />
      </CardContent>
    </Card>
  );
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
