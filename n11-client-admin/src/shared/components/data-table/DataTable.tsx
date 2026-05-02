import { type ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  /** Default: read row[key] as string. Provide custom renderer for cells. */
  cell?: (row: T) => ReactNode;
  className?: string;
  headClassName?: string;
}

export interface DataTablePagination {
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[] | undefined;
  isLoading?: boolean;
  emptyText?: string;
  rowKey: (row: T) => string;
  actions?: (row: T) => ReactNode;
  pagination?: DataTablePagination;
}

export function DataTable<T>({
  columns,
  rows,
  isLoading,
  emptyText = 'Kayıt bulunamadı',
  rowKey,
  actions,
  pagination,
}: DataTableProps<T>) {
  const colSpan = columns.length + (actions ? 1 : 0);
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key} className={c.headClassName}>
                  {c.header}
                </TableHead>
              ))}
              {actions && <TableHead className="w-[120px] text-right">İşlem</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-10 text-center text-muted-foreground">
                  Yükleniyor…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && (rows?.length ?? 0) === 0 && (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-10 text-center text-muted-foreground">
                  {emptyText}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              rows?.map((row) => (
                <TableRow key={rowKey(row)}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className={cn(c.className)}>
                      {c.cell
                        ? c.cell(row)
                        : ((row as Record<string, unknown>)[c.key] as ReactNode) ?? '—'}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">{actions(row)}</div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t p-4 text-sm">
          <span className="text-muted-foreground">
            Sayfa {pagination.page + 1} / {pagination.totalPages} · Toplam{' '}
            {pagination.totalElements}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 0}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              Önceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page + 1 >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
