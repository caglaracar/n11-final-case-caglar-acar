import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type {
  AuthTokens,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  TokenResponse,
  UserProfileResponse,
} from '@/features/auth/types/auth-types';

function tokenResponseToTokens(tokenResponse: TokenResponse): AuthTokens {
  return {
    accessToken: tokenResponse.accessToken,
    refreshToken: tokenResponse.refreshToken,
    expiresIn: tokenResponse.expiresIn,
  };
}

function profileResponseToUser(profile: UserProfileResponse): AuthUser {
  return {
    id: profile.id,
    authId: profile.authId,
    userName: profile.userName,
    email: profile.email,
    role: profile.role,
    name: profile.name,
    surName: profile.surName,
    phone: profile.phone,
    avatar: profile.avatar,
  };
}

export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  return unwrap(api.post<BaseResponse<RegisterResponse>>(ENDPOINTS.auth.register, payload));
}

export async function loginUser(payload: LoginPayload): Promise<AuthTokens> {
  const tokenResponse = await unwrap(
    api.post<BaseResponse<TokenResponse>>(ENDPOINTS.auth.login, payload),
  );
  return tokenResponseToTokens(tokenResponse);
}

export async function getCurrentUser(): Promise<AuthUser> {
  const profile = await unwrap(api.get<BaseResponse<UserProfileResponse>>(ENDPOINTS.user.me));
  return profileResponseToUser(profile);
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await unwrap(api.post<BaseResponse<void>>(ENDPOINTS.auth.logout, { refreshToken }));
}
