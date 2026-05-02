import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type { Banner, BannerPayload } from '@/features/banners/types';

export const bannerApi = {
  findAll: () =>
    unwrap<Banner[]>(api.get<BaseResponse<Banner[]>>(ENDPOINTS.banner.adminFindAll)),
  create: (payload: BannerPayload) =>
    unwrap<Banner>(api.post<BaseResponse<Banner>>(ENDPOINTS.banner.create, payload)),
  update: (id: string, payload: Partial<BannerPayload>) =>
    unwrap<Banner>(api.put<BaseResponse<Banner>>(ENDPOINTS.banner.update(id), payload)),
  remove: (id: string) =>
    unwrap<void>(api.delete<BaseResponse<void>>(ENDPOINTS.banner.delete(id))),
};
