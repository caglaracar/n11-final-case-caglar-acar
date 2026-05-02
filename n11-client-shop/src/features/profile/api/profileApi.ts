import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';

export interface UserProfile {
  id: string;
  authId: number;
  userName: string;
  name: string | null;
  surName: string | null;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  surName?: string;
  phone?: string;
  avatar?: string;
}

async function fetchMe(): Promise<UserProfile> {
  const request = api.get<BaseResponse<UserProfile>>(ENDPOINTS.user.me);
  return unwrap(request);
}

async function updateMe(payload: UpdateProfilePayload): Promise<UserProfile> {
  const request = api.put<BaseResponse<UserProfile>>(ENDPOINTS.user.update, payload);
  return unwrap(request);
}

export const profileApi = {
  me: fetchMe,
  update: updateMe,
};
