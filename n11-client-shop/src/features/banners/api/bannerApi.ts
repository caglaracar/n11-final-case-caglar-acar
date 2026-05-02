import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type { Banner } from '@/features/banners/types';

export const bannerApi = {
  findAll: () =>
    unwrap<Banner[]>(api.get<BaseResponse<Banner[]>>(ENDPOINTS.banner.findAll)),
};
