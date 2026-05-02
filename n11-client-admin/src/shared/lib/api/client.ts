import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';

const BASE_URL = import.meta.env.VITE_API_URL;
if (!BASE_URL) {
  throw new Error('VITE_API_URL is not set. Copy .env.example to .env.');
}

// ─── Types ─────────────────────────────────────────────────────────────

export type BaseResponse<T> = {
  result: { resultCode: string; resultText?: string };
  errorMessage?: string | null;
  data: T;
};

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first?: boolean;
  last?: boolean;
}

interface BackendErrorPayload {
  result?: unknown;
  errorMessage?: string;
  data?: { message?: string; detail?: Record<string, string> };
}

interface RetriableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// ─── Axios instance ───────────────────────────────────────────────────

export const api = axios.create({ baseURL: BASE_URL, timeout: 15_000 });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

// ─── Refresh-token rotation ───────────────────────────────────────────

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) throw new Error('no_refresh_token');

  type RefreshResponse = {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  };

  const { data } = await axios.post<BaseResponse<RefreshResponse>>(
    `${BASE_URL}${ENDPOINTS.auth.refresh}`,
    { refreshToken },
    { timeout: 10_000 },
  );
  if (!data.data) throw new Error(data.errorMessage ?? 'refresh_failed');

  useAuthStore.getState().setTokens({
    accessToken: data.data.accessToken,
    refreshToken: data.data.refreshToken,
  });
  return data.data.accessToken;
}

function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/login')
    || url.includes('/auth/refresh')
    || url.includes('/auth/register')
    || url.includes('/auth/logout');
}

function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

// ─── Response interceptor ─────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<BackendErrorPayload>) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const requestUrl = original?.url ?? '';

    if (status === 401 && original && !original._retry && !isAuthEndpoint(requestUrl)) {
      const hasRefreshToken = !!useAuthStore.getState().refreshToken;
      if (hasRefreshToken) {
        original._retry = true;
        try {
          refreshPromise ??= refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
          const freshAccessToken = await refreshPromise;
          original.headers = {
            ...(original.headers ?? {}),
            Authorization: `Bearer ${freshAccessToken}`,
          };
          return api.request(original);
        } catch {
          useAuthStore.getState().clear();
          redirectToLogin();
          return Promise.reject(error);
        }
      }
      // refresh token yok → temiz çıkış
      useAuthStore.getState().clear();
      redirectToLogin();
      return Promise.reject(error);
    }

    // 2) Diğer 4xx/5xx → toast (login/register dışında)
    if (status && status >= 400 && !isAuthEndpoint(requestUrl)) {
      toast.error(extractErrorMessage(error));
    }
    return Promise.reject(error);
  },
);

// ─── Helpers ──────────────────────────────────────────────────────────

export function extractErrorMessage(error: unknown, fallback = 'İşlem başarısız'): string {
  const axiosError = error as AxiosError<BackendErrorPayload>;
  const payload = axiosError.response?.data;
  const detail = payload?.data?.detail;
  if (detail) {
    const parts = Object.entries(detail).map(([key, value]) => `${key}: ${value}`);
    if (parts.length > 0) return parts.join(' · ');
  }
  return payload?.data?.message ?? payload?.errorMessage ?? axiosError.message ?? fallback;
}

export async function unwrap<T>(promise: Promise<{ data: BaseResponse<T> }>): Promise<T> {
  const { data } = await promise;
  return data.data;
}
