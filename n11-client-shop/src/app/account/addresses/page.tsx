'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, ShoppingBag, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  createAddress,
  deleteAddress,
  getMyAddresses,
  setDefaultAddress,
} from '@/features/addresses/api/addressApi';
import type { Address, AddressInput } from '@/features/addresses/types/addresses-types';
import { extractErrorMessage } from '@/shared/lib/api/client';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const EMPTY_FORM: AddressInput = {
  title: '',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'Turkey',
};

export default function AddressesPage() {
  return (
    <Suspense fallback={null}>
      <AddressesPageInner />
    </Suspense>
  );
}

function AddressesPageInner() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromCheckout = searchParams.get('from') === 'checkout';
  const [form, setForm] = useState<AddressInput>(EMPTY_FORM);

  const addressesQuery = useQuery({ queryKey: ['addresses'], queryFn: getMyAddresses });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['addresses'] });

  const goBackToCheckout = () => router.push('/checkout');

  const createMutation = useMutation({
    mutationFn: (payload: AddressInput) => createAddress(payload),
    onSuccess: () => {
      toast.success(fromCheckout ? 'Adres eklendi, ödemeye dönüyorsun' : 'Adres eklendi');
      setForm(EMPTY_FORM);
      invalidate();
      if (fromCheckout) goBackToCheckout();
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Adres eklenemedi')),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: () => {
      toast.success('Adres silindi');
      invalidate();
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Adres silinemedi')),
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => setDefaultAddress(id),
    onSuccess: () => {
      toast.success('Varsayılan adres güncellendi');
      invalidate();
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Adres güncellenemedi')),
  });

  const selectAndContinueMutation = useMutation({
    mutationFn: (id: string) => setDefaultAddress(id),
    onSuccess: () => {
      toast.success('Adres seçildi, ödemeye dönüyorsun');
      invalidate();
      goBackToCheckout();
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Adres seçilemedi')),
  });

  return (
    <div className="container py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Adreslerim</h1>
        {fromCheckout && (
          <Button variant="outline" size="sm" onClick={goBackToCheckout}>
            <ShoppingBag className="mr-1 h-4 w-4" /> Ödemeye dön
          </Button>
        )}
      </div>

      {fromCheckout && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-brand-200 bg-brand-50/60 p-4 text-sm dark:border-brand-900/50 dark:bg-brand-950/30">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <div className="flex-1">
            <p className="font-semibold text-brand-700 dark:text-brand-300">Ödeme akışındasın</p>
            <p className="mt-0.5 text-muted-foreground">
              Bir adres seç veya yenisini ekle. Seçtiğin adres varsayılan yapılıp ödeme sayfasına dönülecek.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
        <ul className="space-y-3">
          {(addressesQuery.data ?? []).map((address) => (
            <AddressRow
              key={address.id}
              address={address}
              showSelect={fromCheckout}
              isSelecting={selectAndContinueMutation.isPending}
              onDelete={() => removeMutation.mutate(address.id)}
              onSetDefault={() => setDefaultMutation.mutate(address.id)}
              onSelectAndContinue={() => selectAndContinueMutation.mutate(address.id)}
            />
          ))}
          {addressesQuery.data?.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Henüz kayıtlı adresin yok. Sağdaki formu kullanarak yeni bir adres ekleyebilirsin.
              </CardContent>
            </Card>
          )}
        </ul>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Yeni adres ekle</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                createMutation.mutate(form);
              }}
            >
              <Field label="Başlık" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
              <Field label="Ad Soyad" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
              <Field label="Telefon" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field label="Adres" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} />
              <Field label="Adres (devam)" value={form.line2 ?? ''} onChange={(v) => setForm({ ...form, line2: v })} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="İl" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                <Field label="İlçe" value={form.state ?? ''} onChange={(v) => setForm({ ...form, state: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Posta Kodu" value={form.zipCode ?? ''} onChange={(v) => setForm({ ...form, zipCode: v })} />
                <Field label="Ülke" value={form.country ?? ''} onChange={(v) => setForm({ ...form, country: v })} />
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="mt-2">
                {createMutation.isPending ? 'Kaydediliyor…' : 'Kaydet'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AddressRow({
  address,
  showSelect,
  isSelecting,
  onDelete,
  onSetDefault,
  onSelectAndContinue,
}: {
  address: Address;
  showSelect: boolean;
  isSelecting: boolean;
  onDelete: () => void;
  onSetDefault: () => void;
  onSelectAndContinue: () => void;
}) {
  return (
    <li>
      <Card>
        <CardContent className="flex items-start justify-between gap-4 p-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{address.title}</span>
              {address.isDefault && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                  Varsayılan
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {address.fullName} · {address.phone}
            </p>
            <p className="text-sm text-muted-foreground">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ''}, {address.city}
              {address.state ? `/${address.state}` : ''}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {showSelect && (
              <Button size="sm" onClick={onSelectAndContinue} disabled={isSelecting}>
                Seç ve devam et <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
            {!address.isDefault && (
              <Button variant="ghost" size="sm" onClick={onSetDefault}>
                <Star className="mr-1 h-4 w-4" /> Varsayılan
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="mr-1 h-4 w-4 text-destructive" /> Sil
            </Button>
          </div>
        </CardContent>
      </Card>
    </li>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
