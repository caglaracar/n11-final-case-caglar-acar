import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import { buildUrl } from '@/shared/lib/url';
import type {
  Product,
  ProductPage,
  ProductSearchParams,
  RawProduct,
  TrendingTerm,
} from '@/features/products/types/products-types';

interface RawPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

function mapProduct(rawProduct: RawProduct): Product {
  return {
    id: rawProduct.id,
    name: rawProduct.name,
    description: rawProduct.description,
    price: rawProduct.price,
    oldPrice: rawProduct.originalPrice ?? undefined,
    thumbnail: rawProduct.imageUrl ?? rawProduct.thumbnail ?? rawProduct.images?.[0],
    images: rawProduct.images,
    brandName: rawProduct.brand ?? rawProduct.brandName,
    categoryName: rawProduct.categoryName ?? rawProduct.subcategory,
    stock: rawProduct.stock,
    flashDealEndsAt: rawProduct.flashDealEndsAt ?? null,
    priceDropAt: rawProduct.priceDropAt ?? null,
  };
}

function mapProductPage(rawPage: RawPage<RawProduct>): ProductPage {
  return {
    content: rawPage.content.map(mapProduct),
    totalElements: rawPage.totalElements,
    totalPages: rawPage.totalPages,
    number: rawPage.number,
    size: rawPage.size,
  };
}

export async function searchProducts(params: ProductSearchParams = {}): Promise<ProductPage> {
  const url = buildUrl(ENDPOINTS.product.findAll, params as Record<string, unknown>);
  const rawPage = await unwrap(api.get<BaseResponse<RawPage<RawProduct>>>(url));
  return mapProductPage(rawPage);
}

export async function getProductById(productId: string): Promise<Product> {
  const rawProduct = await unwrap(
    api.get<BaseResponse<RawProduct>>(ENDPOINTS.product.findById(productId)),
  );
  return mapProduct(rawProduct);
}

export async function getPopularProducts(limit = 12): Promise<Product[]> {
  const url = buildUrl(ENDPOINTS.product.popular, { limit });
  const rawList = await unwrap(api.get<BaseResponse<RawProduct[]>>(url));
  return rawList.map(mapProduct);
}

export async function getFlashDealProducts(): Promise<Product[]> {
  const rawList = await unwrap(api.get<BaseResponse<RawProduct[]>>(ENDPOINTS.product.flashDeals));
  return rawList.map(mapProduct);
}

export async function getPriceDropProducts(limit = 12): Promise<Product[]> {
  const url = buildUrl(ENDPOINTS.product.priceDrops, { limit });
  const rawList = await unwrap(api.get<BaseResponse<RawProduct[]>>(url));
  return rawList.map(mapProduct);
}

export async function getTrendingSearchTerms(limit = 10): Promise<TrendingTerm[]> {
  const url = buildUrl(ENDPOINTS.product.trending, { limit });
  return unwrap(api.get<BaseResponse<TrendingTerm[]>>(url));
}
