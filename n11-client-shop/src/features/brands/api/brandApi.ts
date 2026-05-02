import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type { Brand } from '@/features/brands/types/brands-types';

export async function getAllBrands(): Promise<Brand[]> {
  return unwrap(api.get<BaseResponse<Brand[]>>(ENDPOINTS.brand.findAll));
}
