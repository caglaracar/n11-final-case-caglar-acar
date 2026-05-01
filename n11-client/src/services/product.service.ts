import { http } from "./http";
import type {
  CreateProductRequest,
  Page,
  Product,
  UpdateProductRequest,
} from "@/types/api";

const enc = encodeURIComponent;

export type Category = {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  iconClass?: string;
  highlightLabel?: string;
  visibleInNav?: boolean;
  sortOrder?: number;
};

export type CategoryUpsertBody = {
  name?: string;
  description?: string;
  slug?: string;
  iconClass?: string;
  highlightLabel?: string;
  visibleInNav?: boolean;
  sortOrder?: number;
};

export type Brand = {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  logoUrl?: string;
  active?: boolean;
  sortOrder?: number;
};

export type BrandUpsertBody = {
  name?: string;
  description?: string;
  slug?: string;
  logoUrl?: string;
  active?: boolean;
  sortOrder?: number;
};

export type TrendingTerm = {
  term: string;
  count: number;
};

export const productService = {
  findAll: (page = 0, size = 10, q?: string, categoryId?: string, brandId?: string) =>
    http.get<Page<Product>>("/product/find-all", {
      query: {
        page,
        size,
        ...(q ? { q } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(brandId ? { brandId } : {}),
      },
      auth: false,
    }),
  findById: (id: string) =>
    http.get<Product>(`/product/find-by-id/${enc(id)}`, { auth: false }),
  search: (q: string, page = 0, size = 10) =>
    http.get<Page<Product>>("/product/find-all", { query: { q, page, size }, auth: false }),
  popular: (limit = 5) =>
    http.get<Product[]>("/product/popular", { query: { limit }, auth: false }),
  priceDrops: (limit = 12) =>
    http.get<Product[]>("/product/price-drops", { query: { limit }, auth: false }),
  flashDeals: () =>
    http.get<Product[]>("/product/flash-deals", { auth: false }),
  trendingTerms: (limit = 10) =>
    http.get<TrendingTerm[]>("/product/search/trending", { query: { limit }, auth: false }),
  create: (body: CreateProductRequest) => http.post<Product>("/product/create", body),
  update: (id: string, body: UpdateProductRequest) =>
    http.put<Product>(`/product/update/${enc(id)}`, body),
  delete: (id: string) => http.delete<void>(`/product/delete/${enc(id)}`),
};

export const categoryService = {
  findAll: () =>
    http.get<Category[]>("/product/category/find-all", { auth: false }),
  create: (body: CategoryUpsertBody & { name: string }) =>
    http.post<Category>("/product/category/create", body),
  update: (id: string, body: CategoryUpsertBody) =>
    http.put<Category>(`/product/category/update/${enc(id)}`, body),
  delete: (id: string) =>
    http.delete<void>(`/product/category/delete/${enc(id)}`),
};

export const brandService = {
  findAll: () =>
    http.get<Brand[]>("/product/brand/find-all", { auth: false }),
  create: (body: BrandUpsertBody & { name: string }) =>
    http.post<Brand>("/product/brand/create", body),
  update: (id: string, body: BrandUpsertBody) =>
    http.put<Brand>(`/product/brand/update/${enc(id)}`, body),
  delete: (id: string) =>
    http.delete<void>(`/product/brand/delete/${enc(id)}`),
};
