import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/shared/components/data-table/DataTable';
import { FormDialog } from '@/shared/components/FormDialog';
import { Field } from '@/shared/components/Field';
import { bannerApi } from '@/features/banners/api/bannerApi';
import type { Banner } from '@/features/banners/types';

const schema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional(),
  eyebrow: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  imageUrl: z.string().url('Geçerli URL gir'),
  badge: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
  active: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

const KEY = ['banners-admin'] as const;

export function BannersPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Banner | null>(null);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: KEY, queryFn: () => bannerApi.findAll() });
  const remove = useMutation({
    mutationFn: (id: string) => bannerApi.remove(id),
    onSuccess: () => {
      toast.success('Banner silindi');
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
  const save = useMutation({
    mutationFn: (v: FormValues) =>
      editing ? bannerApi.update(editing.id, v) : bannerApi.create(v),
    onSuccess: () => {
      toast.success(editing ? 'Banner güncellendi' : 'Banner oluşturuldu');
      qc.invalidateQueries({ queryKey: KEY });
      setOpen(false);
      setEditing(null);
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', imageUrl: '', active: true, sortOrder: 0 },
  });

  const openCreate = () => {
    form.reset({ title: '', imageUrl: '', active: true, sortOrder: 0 });
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (b: Banner) => {
    setEditing(b);
    form.reset({
      title: b.title,
      subtitle: b.subtitle ?? '',
      eyebrow: b.eyebrow ?? '',
      ctaLabel: b.ctaLabel ?? '',
      ctaHref: b.ctaHref ?? '',
      imageUrl: b.imageUrl,
      badge: b.badge ?? '',
      sortOrder: b.sortOrder,
      active: b.active,
    });
    setOpen(true);
  };

  const sorted = (data ?? []).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const columns: DataTableColumn<Banner>[] = [
    {
      key: 'title',
      header: 'Başlık',
      cell: (b) => (
        <div className="flex items-center gap-3">
          <img
            src={b.imageUrl}
            alt={b.title}
            className="h-10 w-16 rounded object-cover"
            loading="lazy"
          />
          <div className="min-w-0">
            <p className="truncate font-medium">{b.title}</p>
            <p className="truncate text-xs text-muted-foreground">{b.subtitle ?? '—'}</p>
          </div>
        </div>
      ),
    },
    { key: 'eyebrow', header: 'Üst yazı', cell: (b) => b.eyebrow ?? '—' },
    { key: 'sortOrder', header: 'Sıra' },
    {
      key: 'active',
      header: 'Durum',
      cell: (b) =>
        b.active ? <Badge variant="success">Aktif</Badge> : <Badge variant="outline">Pasif</Badge>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Bannerlar"
        description="Anasayfa banner sliderını yönet"
        action={
          <Button onClick={openCreate}>
            <Plus />
            Yeni Banner
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={sorted}
        isLoading={isLoading}
        rowKey={(b) => b.id}
        actions={(b) => (
          <>
            <Button variant="ghost" size="icon" onClick={() => openEdit(b)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={remove.isPending}
              onClick={() => {
                if (confirm('Banner silinsin mi?')) remove.mutate(b.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </>
        )}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Banner düzenle' : 'Yeni banner'}
        submitting={save.isPending}
        onSubmit={form.handleSubmit((v) => save.mutate(v))}
      >
        <Field label="Başlık" htmlFor="b-title" error={form.formState.errors.title?.message}>
          <Input id="b-title" {...form.register('title')} />
        </Field>
        <Field label="Alt başlık" htmlFor="b-sub">
          <Input id="b-sub" {...form.register('subtitle')} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Üst yazı" htmlFor="b-eyebrow">
            <Input id="b-eyebrow" {...form.register('eyebrow')} />
          </Field>
          <Field label="Rozet" htmlFor="b-badge">
            <Input id="b-badge" {...form.register('badge')} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="CTA metni" htmlFor="b-cta-l">
            <Input id="b-cta-l" {...form.register('ctaLabel')} />
          </Field>
          <Field label="CTA link" htmlFor="b-cta-h">
            <Input id="b-cta-h" {...form.register('ctaHref')} />
          </Field>
        </div>
        <Field
          label="Görsel URL"
          htmlFor="b-img"
          error={form.formState.errors.imageUrl?.message}
        >
          <Input id="b-img" {...form.register('imageUrl')} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sıra" htmlFor="b-sort">
            <Input id="b-sort" type="number" {...form.register('sortOrder')} />
          </Field>
          <label className="mt-7 flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register('active')} />
            Aktif
          </label>
        </div>
      </FormDialog>
    </>
  );
}
