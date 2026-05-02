import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type { Category } from '@/features/categories/types';

export const categoryApi = {
  findAll: () =>
    unwrap<Category[]>(api.get<BaseResponse<Category[]>>(ENDPOINTS.category.findAll)),
};
