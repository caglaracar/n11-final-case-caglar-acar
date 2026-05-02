import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type {
  UpdateProfilePayload,
  UserProfile,
} from '@/features/profile/types/profile-types';

export async function getMyProfile(): Promise<UserProfile> {
  return unwrap(api.get<BaseResponse<UserProfile>>(ENDPOINTS.user.me));
}

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  return unwrap(api.put<BaseResponse<UserProfile>>(ENDPOINTS.user.update, payload));
}
