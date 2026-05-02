import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type { AuthTokens, AuthUser } from '@/features/auth/store';

// ── Auth-service contracts (mirror backend DTOs) ──────────────────
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

export interface RegisterResponse {
  authId: number;
  userName: string;
  email: string;
  role: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

// ── User-service profile ──────────────────────────────────────────
export interface UserProfileResponse {
  id: string;
  authId: number;
  userName: string;
  name?: string;
  surName?: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

const toTokens = (t: TokenResponse): AuthTokens => ({
  accessToken: t.accessToken,
  refreshToken: t.refreshToken,
  expiresIn: t.expiresIn,
});

const toUser = (p: UserProfileResponse): AuthUser => ({
  id: p.id,
  authId: p.authId,
  userName: p.userName,
  email: p.email,
  role: p.role,
  name: p.name,
  surName: p.surName,
  phone: p.phone,
  avatar: p.avatar,
});

export const authApi = {
  register: (p: RegisterPayload) =>
    unwrap<RegisterResponse>(api.post<BaseResponse<RegisterResponse>>(ENDPOINTS.auth.register, p)),

  login: async (p: LoginPayload): Promise<AuthTokens> => {
    const tr = await unwrap<TokenResponse>(api.post<BaseResponse<TokenResponse>>(ENDPOINTS.auth.login, p));
    return toTokens(tr);
  },

  me: async (): Promise<AuthUser> => {
    const profile = await unwrap<UserProfileResponse>(
      api.get<BaseResponse<UserProfileResponse>>(ENDPOINTS.user.me),
    );
    return toUser(profile);
  },

  logout: (refreshToken: string) =>
    unwrap<void>(api.post<BaseResponse<void>>(ENDPOINTS.auth.logout, { refreshToken })),
};
