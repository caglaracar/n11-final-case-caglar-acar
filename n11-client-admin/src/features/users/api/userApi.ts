import { api, unwrap, type BaseResponse, type Page } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type { UserProfile } from '@/features/users/types';

export interface UserSearchParams {
  page?: number;
  size?: number;
  q?: string;
  role?: string;
}

export const userApi = {
  search: (params: UserSearchParams = {}) =>
    unwrap<Page<UserProfile>>(
      api.get<BaseResponse<Page<UserProfile>>>(ENDPOINTS.user.search, { params }),
    ),
};
