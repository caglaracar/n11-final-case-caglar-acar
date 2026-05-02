import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type { Banner } from '@/features/banners/types/banners-types';

export async function getActiveBanners(): Promise<Banner[]> {
  return unwrap(api.get<BaseResponse<Banner[]>>(ENDPOINTS.banner.findAll));
}
