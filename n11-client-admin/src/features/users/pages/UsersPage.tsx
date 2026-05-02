import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/shared/components/data-table/DataTable';
import { SearchInput } from '@/shared/components/data-table/SearchInput';
import { userApi } from '@/features/users/api/userApi';
import type { UserProfile } from '@/features/users/types';
import { formatDate } from '@/shared/lib/utils';

export function UsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'' | 'USER' | 'ADMIN' | 'SELLER'>('');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['users', { page, search, role }],
    queryFn: () =>
      userApi.search({
        page,
        size: 20,
        q: search || undefined,
        role: role === '' ? undefined : role,
      }),
  });

  const columns: DataTableColumn<UserProfile>[] = [
    {
      key: 'userName',
      header: 'Kullanıcı',
      cell: (u) => (
        <div>
          <p className="font-medium">{u.userName}</p>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Ad Soyad',
      cell: (u) => [u.name, u.surName].filter(Boolean).join(' ') || '—',
    },
    { key: 'phone', header: 'Telefon', cell: (u) => u.phone ?? '—' },
    {
      key: 'role',
      header: 'Rol',
      cell: (u) => (
        <Badge variant={u.role === 'ADMIN' ? 'default' : 'outline'}>{u.role}</Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Kayıt',
      cell: (u) => (u.createdAt ? formatDate(u.createdAt) : '—'),
    },
  ];

  return (
    <>
      <PageHeader title="Kullanıcılar" description="Müşteri ve admin hesapları" />

      <Card className="mb-4 flex flex-wrap items-center gap-3 p-4">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(0);
          }}
          placeholder="Kullanıcı adı / e-posta…"
        />
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={role}
          onChange={(e) => {
            setRole(e.target.value as typeof role);
            setPage(0);
          }}
        >
          <option value="">Tüm roller</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="SELLER">SELLER</option>
        </select>
      </Card>

      <DataTable
        columns={columns}
        rows={data?.content}
        isLoading={isLoading}
        rowKey={(u) => u.authId}
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
    </>
  );
}
