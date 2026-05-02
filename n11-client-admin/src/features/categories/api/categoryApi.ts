import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type { Category, CategoryPayload } from '@/features/categories/types';

export const categoryApi = {
  findAll: () =>
    unwrap<Category[]>(api.get<BaseResponse<Category[]>>(ENDPOINTS.category.findAll)),
  create: (payload: CategoryPayload) =>
    unwrap<Category>(api.post<BaseResponse<Category>>(ENDPOINTS.category.create, payload)),
  update: (id: string, payload: Partial<CategoryPayload>) =>
    unwrap<Category>(api.put<BaseResponse<Category>>(ENDPOINTS.category.update(id), payload)),
  remove: (id: string) =>
    unwrap<void>(api.delete<BaseResponse<void>>(ENDPOINTS.category.delete(id))),
};
