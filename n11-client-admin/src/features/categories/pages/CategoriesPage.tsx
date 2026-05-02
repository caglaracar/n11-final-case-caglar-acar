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
import { categoryApi } from '@/features/categories/api/categoryApi';
import type { Category } from '@/features/categories/types';

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  iconClass: z.string().optional(),
  highlightLabel: z.string().optional(),
  visibleInNav: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});
type FormValues = z.infer<typeof schema>;

const KEY = ['categories'] as const;

export function CategoriesPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: KEY, queryFn: () => categoryApi.findAll() });

  const remove = useMutation({
    mutationFn: (id: string) => categoryApi.remove(id),
    onSuccess: () => {
      toast.success('Kategori silindi');
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  const save = useMutation({
    mutationFn: (values: FormValues) =>
      editing ? categoryApi.update(editing.id, values) : categoryApi.create(values),
    onSuccess: () => {
      toast.success(editing ? 'Kategori güncellendi' : 'Kategori oluşturuldu');
      qc.invalidateQueries({ queryKey: KEY });
      setOpen(false);
      setEditing(null);
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', visibleInNav: true, sortOrder: 0 },
  });

  const openCreate = () => {
    form.reset({ name: '', visibleInNav: true, sortOrder: 0 });
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    form.reset({
      name: c.name,
      slug: c.slug ?? '',
      description: c.description ?? '',
      iconClass: c.iconClass ?? '',
      highlightLabel: c.highlightLabel ?? '',
      visibleInNav: c.visibleInNav ?? true,
      sortOrder: c.sortOrder ?? 0,
    });
    setOpen(true);
  };

  const sorted = (data ?? []).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const columns: DataTableColumn<Category>[] = [
    { key: 'name', header: 'Ad', cell: (c) => <span className="font-medium">{c.name}</span> },
    { key: 'slug', header: 'Slug', cell: (c) => c.slug ?? '—' },
    { key: 'sortOrder', header: 'Sıra', cell: (c) => c.sortOrder ?? 0 },
    {
      key: 'visibleInNav',
      header: 'Menüde',
      cell: (c) =>
        c.visibleInNav === false ? (
          <Badge variant="outline">Gizli</Badge>
        ) : (
          <Badge variant="success">Görünür</Badge>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Kategoriler"
        description="Ürün kategorilerini yönet"
        action={
          <Button onClick={openCreate}>
            <Plus />
            Yeni Kategori
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={sorted}
        isLoading={isLoading}
        rowKey={(c) => c.id}
        actions={(c) => (
          <>
            <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={remove.isPending}
              onClick={() => {
                if (confirm(`"${c.name}" silinsin mi?`)) remove.mutate(c.id);
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
        title={editing ? 'Kategoriyi düzenle' : 'Yeni kategori'}
        submitting={save.isPending}
        onSubmit={form.handleSubmit((v) => save.mutate(v))}
      >
        <Field label="Ad" htmlFor="c-name" error={form.formState.errors.name?.message}>
          <Input id="c-name" {...form.register('name')} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Slug" htmlFor="c-slug">
            <Input id="c-slug" {...form.register('slug')} />
          </Field>
          <Field label="Sıra" htmlFor="c-sort">
            <Input id="c-sort" type="number" {...form.register('sortOrder')} />
          </Field>
        </div>
        <Field label="Açıklama" htmlFor="c-desc">
          <Input id="c-desc" {...form.register('description')} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="İkon class" htmlFor="c-icon" hint="ör: ri-shopping-bag-line">
            <Input id="c-icon" {...form.register('iconClass')} />
          </Field>
          <Field label="Vurgu etiketi" htmlFor="c-hl">
            <Input id="c-hl" {...form.register('highlightLabel')} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register('visibleInNav')} />
          Menüde görünür
        </label>
      </FormDialog>
    </>
  );
}
