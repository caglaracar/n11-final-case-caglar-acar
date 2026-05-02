import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type { AuthUser } from '@/features/auth/store';

export interface LoginPayload {
  userName: string;
  password: string;
}

export interface RegisterPayload {
  userName: string;
  email: string;
  password: string;
  repassword: string;
}

export interface AdminRegisterPayload extends RegisterPayload {
  inviteCode: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface RegisterResponse {
  authId: string;
  userName: string;
  email: string;
  role: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    unwrap<TokenResponse>(api.post<BaseResponse<TokenResponse>>(ENDPOINTS.auth.login, payload)),
  register: (payload: RegisterPayload) =>
    unwrap<RegisterResponse>(
      api.post<BaseResponse<RegisterResponse>>(ENDPOINTS.auth.register, payload),
    ),
  adminRegister: (payload: AdminRegisterPayload) =>
    unwrap<RegisterResponse>(
      api.post<BaseResponse<RegisterResponse>>(ENDPOINTS.auth.adminRegister, payload),
    ),
  refresh: (refreshToken: string) =>
    unwrap<TokenResponse>(
      api.post<BaseResponse<TokenResponse>>(ENDPOINTS.auth.refresh, { refreshToken }),
    ),
  logout: (refreshToken: string) =>
    unwrap<void>(api.post<BaseResponse<void>>(ENDPOINTS.auth.logout, { refreshToken })),
  me: () => unwrap<AuthUser>(api.get<BaseResponse<AuthUser>>(ENDPOINTS.user.me)),
};
