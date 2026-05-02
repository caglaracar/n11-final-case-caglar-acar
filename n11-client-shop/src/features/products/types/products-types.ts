export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  thumbnail?: string;
  images?: string[];
  brandName?: string;
  categoryName?: string;
  stock: number;
  /** ISO timestamp — flash kampanyasının bitiş zamanı (countdown için). */
  flashDealEndsAt?: string | null;
  /** ISO timestamp — fiyat düşüşünün gerçekleştiği zaman (sıralama için). */
  priceDropAt?: string | null;
}

export interface ProductPage {
  content: Product[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ProductSearchParams {
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

/** Backend ham ürün şekli — UI'a vermeden önce normalize edilir. */
export interface RawProduct {
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
