import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/shared/components/data-table/DataTable';
import { SearchInput } from '@/shared/components/data-table/SearchInput';
import { FormDialog } from '@/shared/components/FormDialog';
import { Field } from '@/shared/components/Field';
import { productApi } from '@/features/products/api/productApi';
import { categoryApi } from '@/features/categories/api/categoryApi';
import type { Product } from '@/features/products/types/products-types';
import { formatCurrency } from '@/shared/lib/utils';

const schema = z.object({
  name: z.string().min(2, 'En az 2 karakter'),
  description: z.string().min(1, 'Açıklama gerekli'),
  price: z.coerce.number().positive('Pozitif olmalı'),
  stock: z.coerce.number().int().nonnegative(),
  categoryId: z.string().min(1, 'Kategori seç'),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  imageUrl: z.string().url('URL geçersiz').optional().or(z.literal('')),
  badge: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const KEY = ['products'] as const;

export function ProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [...KEY, { page, q: search || undefined }],
    queryFn: () => productApi.list({ page, size: 20, q: search || undefined }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.findAll(),
  });

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    categories?.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const remove = useMutation({
    mutationFn: (id: string) => productApi.remove(id),
    onSuccess: () => {
      toast.success('Ürün silindi');
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = { ...values, imageUrl: values.imageUrl || undefined };
      return editing
        ? productApi.update(editing.id, payload)
        : productApi.create({ ...payload, currency: 'TRY' });
    },
    onSuccess: () => {
      toast.success(editing ? 'Ürün güncellendi' : 'Ürün eklendi');
      qc.invalidateQueries({ queryKey: KEY });
      setDialogOpen(false);
      setEditing(null);
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults(),
  });

  const openCreate = () => {
    form.reset(emptyDefaults());
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    form.reset({
      name: p.name,
      description: p.description ?? '',
      price: p.price,
      stock: p.stock,
      categoryId: p.categoryId ?? '',
      subcategory: p.subcategory ?? '',
      brand: p.brand ?? '',
      imageUrl: p.imageUrl ?? '',
      badge: p.badge ?? '',
    });
    setDialogOpen(true);
  };

  const columns: DataTableColumn<Product>[] = [
    {
      key: 'name',
      header: 'Ürün',
      cell: (p) => (
        <div className="flex items-center gap-3">
          {p.imageUrl ? (
            <img
              src={p.imageUrl}
              alt={p.name}
              className="h-10 w-10 rounded-md object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-10 w-10 rounded-md bg-muted" />
          )}
          <div className="min-w-0">
            <p className="truncate font-medium">{p.name}</p>
            <p className="truncate text-xs text-muted-foreground">{p.brand ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      cell: (p) => {
        const name = p.categoryName ?? (p.categoryId ? categoryNameById.get(p.categoryId) : undefined);
        return (
          <div className="min-w-0">
            <p className="truncate text-sm">{name ?? '—'}</p>
            {p.subcategory && (
              <p className="truncate text-xs text-muted-foreground">{p.subcategory}</p>
            )}
          </div>
        );
      },
    },
    { key: 'stock', header: 'Stok', cell: (p) => p.stock },
    { key: 'price', header: 'Fiyat', cell: (p) => formatCurrency(p.price, p.currency ?? 'TRY') },
    {
      key: 'badge',
      header: 'Etiket',
      cell: (p) => (p.badge ? <Badge variant="secondary">{p.badge}</Badge> : '—'),
    },
  ];

  return (
    <>
      <PageHeader
        title="Ürünler"
        description="Mağazandaki ürünleri yönet"
        action={
          <Button onClick={openCreate}>
            <Plus />
            Yeni Ürün
          </Button>
        }
      />

      <Card className="mb-4 p-4">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(0);
          }}
          placeholder="Ürün ara…"
        />
      </Card>

      <DataTable
        columns={columns}
        rows={data?.content}
        isLoading={isLoading}
        rowKey={(p) => p.id}
        actions={(p) => (
          <>
            <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={remove.isPending}
              onClick={() => {
                if (confirm(`"${p.name}" silinsin mi?`)) remove.mutate(p.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </>
        )}
        pagination={
          data
            ? {
                page: data.number,
                totalPages: data.totalPages,
                totalElements: data.totalElements,
                onPageChange: setPage,
              }
            : undefined
        }
      />

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Ürünü düzenle' : 'Yeni ürün'}
        submitting={save.isPending}
        onSubmit={form.handleSubmit((v) => save.mutate(v))}
      >
        <Field label="Ad" htmlFor="p-name" error={form.formState.errors.name?.message}>
          <Input id="p-name" {...form.register('name')} />
        </Field>
        <Field
          label="Açıklama"
          htmlFor="p-desc"
          error={form.formState.errors.description?.message}
        >
          <Input id="p-desc" {...form.register('description')} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fiyat" htmlFor="p-price" error={form.formState.errors.price?.message}>
            <Input id="p-price" type="number" step="0.01" {...form.register('price')} />
          </Field>
          <Field label="Stok" htmlFor="p-stock" error={form.formState.errors.stock?.message}>
            <Input id="p-stock" type="number" {...form.register('stock')} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Kategori"
            htmlFor="p-cat"
            error={form.formState.errors.categoryId?.message}
          >
            <select
              id="p-cat"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...form.register('categoryId')}
            >
              <option value="">Seç…</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Marka" htmlFor="p-brand">
            <Input id="p-brand" {...form.register('brand')} />
          </Field>
        </div>
        <Field label="Alt Kategori" htmlFor="p-subcat" hint="Örn: Akıllı Telefon, Laptop">
          <Input id="p-subcat" {...form.register('subcategory')} />
        </Field>
        <Field
          label="Görsel URL"
          htmlFor="p-img"
          error={form.formState.errors.imageUrl?.message}
        >
          <Input id="p-img" {...form.register('imageUrl')} />
        </Field>
        <Field label="Etiket (badge)" htmlFor="p-badge" hint="Örn: Yeni, İndirim">
          <Input id="p-badge" {...form.register('badge')} />
        </Field>
      </FormDialog>
    </>
  );
}

function emptyDefaults(): FormValues {
  return {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: '',
    subcategory: '',
    brand: '',
    imageUrl: '',
    badge: '',
  };
}
