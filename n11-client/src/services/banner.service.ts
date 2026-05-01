import { http } from "./http";

const enc = encodeURIComponent;

/** Public ana sayfa hero banner'ı. */
export type Banner = {
  id: string;
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  imageUrl: string;
  badge?: string | null;
  sortOrder: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type BannerUpsertBody = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
  badge?: string;
  sortOrder?: number;
  active?: boolean;
};

export const bannerService = {
  /** Public: ana sayfa için aktif banner'lar. */
  findAllActive: () =>
    http.get<Banner[]>("/banner/find-all", { auth: false }),
  /** Admin: tüm banner'lar (pasifler dahil). */
  adminFindAll: () => http.get<Banner[]>("/banner/admin/find-all"),
  findById: (id: string) =>
    http.get<Banner>(`/banner/find-by-id/${enc(id)}`),
  create: (body: BannerUpsertBody & { title: string; imageUrl: string }) =>
    http.post<Banner>("/banner/create", body),
  update: (id: string, body: BannerUpsertBody) =>
    http.put<Banner>(`/banner/update/${enc(id)}`, body),
  delete: (id: string) => http.delete<void>(`/banner/delete/${enc(id)}`),
};
