export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  categoryId?: string;
  categoryName?: string;
  subcategory?: string;
  brand?: string;
  stock: number;
  imageUrl?: string;
  images?: string[];
  badge?: string;
  features?: string[];
  status?: string;
  flashDealEndsAt?: string | null;
  priceDropAt?: string | null;
  createdAt?: string;
}

export interface ProductCreatePayload {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  categoryId: string;
  subcategory?: string;
  brand?: string;
  stock: number;
  imageUrl?: string;
  images?: string[];
  badge?: string;
  features?: string[];
}

/** Sadece ürün içerik alanları — fiyat düşüşü/flash deal ayrı endpoint'lerle yönetilir. */
export type ProductUpdatePayload = Partial<Omit<ProductCreatePayload, 'currency' | 'originalPrice'>>;

export interface SetFlashDealPayload {
  flashDealEndsAt: string;
}

export interface ApplyPriceDropPayload {
  price: number;
  originalPrice?: number;
}
