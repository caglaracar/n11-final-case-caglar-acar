import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type { Brand, BrandPayload } from '@/features/brands/types';

export const brandApi = {
  findAll: () => unwrap<Brand[]>(api.get<BaseResponse<Brand[]>>(ENDPOINTS.brand.findAll)),
  create: (payload: BrandPayload) =>
    unwrap<Brand>(api.post<BaseResponse<Brand>>(ENDPOINTS.brand.create, payload)),
  update: (id: string, payload: Partial<BrandPayload>) =>
    unwrap<Brand>(api.put<BaseResponse<Brand>>(ENDPOINTS.brand.update(id), payload)),
  remove: (id: string) =>
    unwrap<void>(api.delete<BaseResponse<void>>(ENDPOINTS.brand.delete(id))),
};
