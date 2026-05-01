import { http } from "./http";
import type { Page } from "@/types/api";

const enc = encodeURIComponent;

export type AdminWishlistEntry = {
  authId: number;
  userName: string;
  email: string | null;
  itemCount: number;
  productIds: string[];
};

export const wishlistService = {
  list: () => http.get<string[]>("/wishlist"),
  add: (productId: string) => http.post<string[]>(`/wishlist/add/${enc(productId)}`),
  remove: (productId: string) => http.delete<string[]>(`/wishlist/remove/${enc(productId)}`),
  clear: () => http.delete<void>("/wishlist/clear"),
  /** Admin: tüm kullanıcıların wishlist özeti. */
  adminListAll: (page = 0, size = 20) =>
    http.get<Page<AdminWishlistEntry>>("/wishlist/admin/find-all", {
      query: { page, size },
    }),
};
