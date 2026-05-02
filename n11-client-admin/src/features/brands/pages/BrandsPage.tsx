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
import { brandApi } from '@/features/brands/api/brandApi';
import type { Brand } from '@/features/brands/types';

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  active: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});
type FormValues = z.infer<typeof schema>;

const KEY = ['brands'] as const;

export function BrandsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Brand | null>(null);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: KEY, queryFn: () => brandApi.findAll() });
  const remove = useMutation({
    mutationFn: (id: string) => brandApi.remove(id),
    onSuccess: () => {
      toast.success('Marka silindi');
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
  const save = useMutation({
    mutationFn: (v: FormValues) => {
      const payload = { ...v, logoUrl: v.logoUrl || undefined };
      return editing ? brandApi.update(editing.id, payload) : brandApi.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Marka güncellendi' : 'Marka oluşturuldu');
      qc.invalidateQueries({ queryKey: KEY });
      setOpen(false);
      setEditing(null);
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', active: true, sortOrder: 0 },
  });

  const openCreate = () => {
    form.reset({ name: '', active: true, sortOrder: 0 });
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (b: Brand) => {
    setEditing(b);
    form.reset({
      name: b.name,
      slug: b.slug ?? '',
      description: b.description ?? '',
      logoUrl: b.logoUrl ?? '',
      active: b.active ?? true,
      sortOrder: b.sortOrder ?? 0,
    });
    setOpen(true);
  };

  const columns: DataTableColumn<Brand>[] = [
    {
      key: 'name',
      header: 'Marka',
      cell: (b) => (
        <div className="flex items-center gap-3">
          {b.logoUrl ? (
            <img src={b.logoUrl} alt={b.name} className="h-8 w-8 rounded object-contain" />
          ) : (
            <div className="h-8 w-8 rounded bg-muted" />
          )}
          <span className="font-medium">{b.name}</span>
        </div>
      ),
    },
    { key: 'slug', header: 'Slug', cell: (b) => b.slug ?? '—' },
    { key: 'sortOrder', header: 'Sıra', cell: (b) => b.sortOrder ?? 0 },
    {
      key: 'active',
      header: 'Durum',
      cell: (b) =>
        b.active === false ? (
          <Badge variant="outline">Pasif</Badge>
        ) : (
          <Badge variant="success">Aktif</Badge>
        ),
    },
  ];

  const sorted = (data ?? []).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <>
      <PageHeader
        title="Markalar"
        description="Markaları yönet"
        action={
          <Button onClick={openCreate}>
            <Plus />
            Yeni Marka
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
                if (confirm(`"${b.name}" silinsin mi?`)) remove.mutate(b.id);
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
        title={editing ? 'Markayı düzenle' : 'Yeni marka'}
        submitting={save.isPending}
        onSubmit={form.handleSubmit((v) => save.mutate(v))}
      >
        <Field label="Ad" htmlFor="b-name" error={form.formState.errors.name?.message}>
          <Input id="b-name" {...form.register('name')} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Slug" htmlFor="b-slug">
            <Input id="b-slug" {...form.register('slug')} />
          </Field>
          <Field label="Sıra" htmlFor="b-sort">
            <Input id="b-sort" type="number" {...form.register('sortOrder')} />
          </Field>
        </div>
        <Field label="Açıklama" htmlFor="b-desc">
          <Input id="b-desc" {...form.register('description')} />
        </Field>
        <Field label="Logo URL" htmlFor="b-logo" error={form.formState.errors.logoUrl?.message}>
          <Input id="b-logo" {...form.register('logoUrl')} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register('active')} />
          Aktif
        </label>
      </FormDialog>
    </>
  );
}
