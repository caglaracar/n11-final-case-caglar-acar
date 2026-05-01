/**
 * HTTP istemci çekirdeği — fetch wrapper.
 *
 * Sorumluluklar:
 *  - JSON serileştirme/deserileştirme.
 *  - Authorization header'ı (token varsa).
 *  - 401 alındığında refresh akışı (rotation, tek-uçuş).
 *  - BaseResponse zarfını açıp `data`'yı döner; `result===false` ise ApiError fırlatır.
 *
 * Servis dosyaları sadece `request<T>(...)`'i veya kısa-yol metotlarını çağırır.
 */
import type { BaseResponse } from "@/types/api";
import { API_BASE } from "./config";
import { ApiError } from "./errors";
import { tokenStore } from "./tokenStore";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type RequestOpts = {
  method?: Method;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Default true. login/register/refresh için false. */
  auth?: boolean;
  /** Refresh sonrası iç retry için. */
  _retried?: boolean;
  /** Üst katmana sinyal — caller tarafından AbortController.signal verilebilir. */
  signal?: AbortSignal;
};

function buildQuery(query?: RequestOpts["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

// ─── Refresh tek-uçuş ─────────────────────────────────────────
let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!tokenStore.refresh) return false;
  if (refreshing) return refreshing;

  refreshing = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: tokenStore.refresh }),
      });
      if (!res.ok) return false;
      const body = (await res.json()) as BaseResponse<{
        accessToken: string;
        refreshToken: string;
      }>;
      if (!body.result || !body.data) return false;
      tokenStore.set(body.data.accessToken, body.data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}

// ─── Çekirdek fetch ───────────────────────────────────────────
export async function request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const { method = "GET", body, query, auth = true, _retried = false, signal } = opts;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && tokenStore.access) headers["Authorization"] = `Bearer ${tokenStore.access}`;

  const res = await fetch(`${API_BASE}${path}${buildQuery(query)}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (res.status === 401 && auth && !_retried) {
    const ok = await tryRefresh();
    if (ok) return request<T>(path, { ...opts, _retried: true });
    tokenStore.clear();
  }

  let payload: BaseResponse<T> | null = null;
  try {
    payload = (await res.json()) as BaseResponse<T>;
  } catch {
    /* empty / non-json body — ok için sorun değil */
  }

  if (!res.ok || (payload && payload.result === false)) {
    const msg = payload?.errorMessage || `HTTP ${res.status}`;
    throw new ApiError(res.status, msg, payload?.errorMessage ?? null);
  }
  return (payload as BaseResponse<T>).data;
}

// ─── Kısa-yol verb helper'ları ────────────────────────────────
export const http = {
  get: <T>(path: string, opts: Omit<RequestOpts, "method" | "body"> = {}) =>
    request<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts: Omit<RequestOpts, "method" | "body"> = {}) =>
    request<T>(path, { ...opts, method: "POST", body }),
  put: <T>(path: string, body?: unknown, opts: Omit<RequestOpts, "method" | "body"> = {}) =>
    request<T>(path, { ...opts, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, opts: Omit<RequestOpts, "method" | "body"> = {}) =>
    request<T>(path, { ...opts, method: "PATCH", body }),
  delete: <T>(path: string, opts: Omit<RequestOpts, "method" | "body"> = {}) =>
    request<T>(path, { ...opts, method: "DELETE" }),
};
