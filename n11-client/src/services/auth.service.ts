import { http } from "./http";
import type {
  LoginRequest,
  RegisterAdminRequest,
  RegisterRequest,
  RegisterResponse,
  TokenResponse,
} from "@/types/api";

/**
 * Auth servis çağrıları.
 *
 * Notlar:
 *  - login/register/refresh public endpoint'lere gider → `auth:false`
 *    (refresh'te eski/expired access token gönderilmemeli ki gateway 401 atmasın)
 *  - logout: backend `RefreshRequestDto { refreshToken }` body bekliyor;
 *    ayrıca gateway `Bearer access` ister (whitelist'te değil).
 *  - registerAdmin: davet kodu (invite code) gönderir; başarılı olursa ADMIN rolünde Auth döner.
 */
export const authService = {
  register: (body: RegisterRequest) =>
    http.post<RegisterResponse>("/auth/register", body, { auth: false }),
  registerAdmin: (body: RegisterAdminRequest) =>
    http.post<RegisterResponse>("/auth/admin/register", body, { auth: false }),
  login: (body: LoginRequest) =>
    http.post<TokenResponse>("/auth/login", body, { auth: false }),
  refresh: (refreshToken: string) =>
    http.post<TokenResponse>("/auth/refresh", { refreshToken }, { auth: false }),
  logout: (refreshToken: string) =>
    http.post<void>("/auth/logout", { refreshToken }),
};
