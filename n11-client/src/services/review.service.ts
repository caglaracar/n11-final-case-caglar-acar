import { http } from "./http";
import type { CreateReviewRequest, Page, Review } from "@/types/api";

const enc = encodeURIComponent;

export const reviewService = {
  list: (productId: string, page = 0, size = 20) =>
    http.get<Page<Review>>(`/review/product/${enc(productId)}`, {
      query: { page, size },
      auth: false,
    }),
  create: (body: CreateReviewRequest) => http.post<Review>("/review/create", body),
  delete: (id: string) => http.delete<void>(`/review/delete/${enc(id)}`),
  /** Admin: tüm yorumları sayfalı listele. */
  adminFindAll: (page = 0, size = 20) =>
    http.get<Page<Review>>("/review/admin/find-all", { query: { page, size } }),
};
