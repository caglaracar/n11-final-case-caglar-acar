import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type { Product, ProductPage } from '@/features/products/types';

// ─── Types ────────────────────────────────────────────────────────────

export interface ListParams {
  page?: number;
  size?: number;
  q?: string;
  categoryId?: string;
  brandId?: string;
}

export interface TrendingTerm {
  term: string;
  count: number;
}

/** Backend'den dönen ham (raw) ürün şekli — UI'da kullanmadan önce mapProduct ile normalize edilir. */
interface RawProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number | null;
  currency?: string;
  categoryId?: string;
  categoryName?: string;
  subcategory?: string;
  brand?: string;
  brandName?: string;
  stock: number;
  imageUrl?: string;
  thumbnail?: string;
  images?: string[];
  badge?: string;
  features?: string[];
  flashDealEndsAt?: string | null;
  priceDropAt?: string | null;
}

interface RawPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── Mappers ──────────────────────────────────────────────────────────

function mapProduct(raw: RawProduct): Product {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    price: raw.price,
    oldPrice: raw.originalPrice ?? undefined,
    thumbnail: raw.imageUrl ?? raw.thumbnail ?? raw.images?.[0],
    images: raw.images,
    brandName: raw.brand ?? raw.brandName,
    categoryName: raw.categoryName ?? raw.subcategory,
    stock: raw.stock,
    flashDealEndsAt: raw.flashDealEndsAt ?? null,
    priceDropAt: raw.priceDropAt ?? null,
  };
}

function mapPage(raw: RawPage<RawProduct>): ProductPage {
  return {
    content: raw.content.map(mapProduct),
    totalElements: raw.totalElements,
    totalPages: raw.totalPages,
    number: raw.number,
    size: raw.size,
  };
}

// ─── API çağrıları ────────────────────────────────────────────────────

async function list(params: ListParams = {}): Promise<ProductPage> {
  const request = api.get<BaseResponse<RawPage<RawProduct>>>(ENDPOINTS.product.findAll, { params });
  const rawPage = await unwrap(request);
  return mapPage(rawPage);
}

async function detail(id: string): Promise<Product> {
  const request = api.get<BaseResponse<RawProduct>>(ENDPOINTS.product.findById(id));
  const rawProduct = await unwrap(request);
  return mapProduct(rawProduct);
}

async function popular(limit = 12): Promise<Product[]> {
  const request = api.get<BaseResponse<RawProduct[]>>(ENDPOINTS.product.popular, { params: { limit } });
  const rawList = await unwrap(request);
  return rawList.map(mapProduct);
}

async function flashDeals(): Promise<Product[]> {
  const request = api.get<BaseResponse<RawProduct[]>>(ENDPOINTS.product.flashDeals);
  const rawList = await unwrap(request);
  return rawList.map(mapProduct);
}

async function priceDrops(limit = 12): Promise<Product[]> {
  const request = api.get<BaseResponse<RawProduct[]>>(ENDPOINTS.product.priceDrops, { params: { limit } });
  const rawList = await unwrap(request);
  return rawList.map(mapProduct);
}

async function trending(limit = 10): Promise<TrendingTerm[]> {
  const request = api.get<BaseResponse<TrendingTerm[]>>(ENDPOINTS.product.trending, { params: { limit } });
  return unwrap(request);
}

export const productApi = {
  list,
  detail,
  popular,
  flashDeals,
  priceDrops,
  trending,
};
