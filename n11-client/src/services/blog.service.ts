import { http } from "./http";
import type { BlogPost, Page } from "@/types/api";

const enc = encodeURIComponent;

export const blogService = {
  findAll: (page = 0, size = 12) =>
    http.get<Page<BlogPost>>("/blog/find-all", { query: { page, size }, auth: false }),
  findBySlug: (slug: string) =>
    http.get<BlogPost>(`/blog/slug/${enc(slug)}`, { auth: false }),
  findById: (id: string) =>
    http.get<BlogPost>(`/blog/find-by-id/${enc(id)}`, { auth: false }),
};
