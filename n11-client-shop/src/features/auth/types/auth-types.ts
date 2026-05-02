import type { AuthTokens, AuthUser } from '@/features/auth/store';

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

export type { AuthTokens, AuthUser };
