import { api, unwrap, type BaseResponse, type Page } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type {
  ApplyPriceDropPayload,
  Product,
  ProductCreatePayload,
  ProductUpdatePayload,
  SetFlashDealPayload,
} from '@/features/products/types';

export interface ProductListParams {
  page?: number;
  size?: number;
  q?: string;
  categoryId?: string;
  brandId?: string;
}

export const productApi = {
  list: (params: ProductListParams = {}) =>
    unwrap<Page<Product>>(
      api.get<BaseResponse<Page<Product>>>(ENDPOINTS.product.findAll, { params }),
    ),
  detail: (id: string) =>
    unwrap<Product>(api.get<BaseResponse<Product>>(ENDPOINTS.product.findById(id))),
  create: (payload: ProductCreatePayload) =>
    unwrap<Product>(api.post<BaseResponse<Product>>(ENDPOINTS.product.create, payload)),
  update: (id: string, payload: ProductUpdatePayload) =>
    unwrap<Product>(api.put<BaseResponse<Product>>(ENDPOINTS.product.update(id), payload)),
  remove: (id: string) =>
    unwrap<void>(api.delete<BaseResponse<void>>(ENDPOINTS.product.delete(id))),

  flashDeals: () =>
    unwrap<Product[]>(api.get<BaseResponse<Product[]>>(ENDPOINTS.product.flashDeals)),
  setFlashDeal: (id: string, payload: SetFlashDealPayload) =>
    unwrap<Product>(
      api.put<BaseResponse<Product>>(ENDPOINTS.product.setFlashDeal(id), payload),
    ),
  clearFlashDeal: (id: string) =>
    unwrap<Product>(api.delete<BaseResponse<Product>>(ENDPOINTS.product.clearFlashDeal(id))),

  priceDrops: (limit = 50) =>
    unwrap<Product[]>(
      api.get<BaseResponse<Product[]>>(ENDPOINTS.product.priceDrops, { params: { limit } }),
    ),
  applyPriceDrop: (id: string, payload: ApplyPriceDropPayload) =>
    unwrap<Product>(
      api.put<BaseResponse<Product>>(ENDPOINTS.product.applyPriceDrop(id), payload),
    ),
  clearPriceDrop: (id: string) =>
    unwrap<Product>(api.delete<BaseResponse<Product>>(ENDPOINTS.product.clearPriceDrop(id))),
};
