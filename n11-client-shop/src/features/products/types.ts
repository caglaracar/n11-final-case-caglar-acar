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
