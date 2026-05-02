import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type { Brand } from '@/features/brands/types';

export const brandApi = {
  findAll: () =>
    unwrap<Brand[]>(api.get<BaseResponse<Brand[]>>(ENDPOINTS.brand.findAll)),
};
