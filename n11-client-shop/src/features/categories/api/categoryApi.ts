import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type { Category } from '@/features/categories/types/categories-types';

export async function getAllCategories(): Promise<Category[]> {
  return unwrap(api.get<BaseResponse<Category[]>>(ENDPOINTS.category.findAll));
}
