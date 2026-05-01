/**
 * Backend Product DTO ↔ UI ProductCard / Carousel shape adaptörleri.
 *
 * UI bileşenleri (ProductCard, ProductCarousel, FlashDeals) string id, image,
 * reviews (count), badge ve category alanlarını bekliyor; backend ise imageUrl,
 * reviewCount, categoryId, subcategory kullanıyor. Tek nokta üzerinden çeviri.
 */
import type { Product } from "@/types/api";

export interface UiProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  currency: string;
  category: string;
  categoryId?: string;
  subcategory?: string;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  badge: string | null;
  description?: string;
  features?: string[];
  inStock: boolean;
  stockCount: number;
  brand?: string;
  flashDealEndsAt?: string;
  priceDropAt?: string;
  searchCount?: number;
}

const FALLBACK_IMG =
  "https://readdy.ai/api/search-image?query=premium%20product%20on%20warm%20beige%20studio%20background%20minimal%20editorial%20photography&width=600&height=750&seq=fallback&orientation=portrait";

export function toUiProduct(p: Product): UiProduct {
  const image = p.imageUrl || (p.images && p.images[0]) || FALLBACK_IMG;
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice ?? null,
    category: p.subcategory || p.categoryId || "Other",
    categoryId: p.categoryId,
    subcategory: p.subcategory,
    image,
    images: p.images && p.images.length > 0 ? p.images : [image],
    rating: p.rating ?? 0,
    reviews: p.reviewCount ?? 0,
    badge: p.badge ?? null,
    description: p.description,
    features: p.features,
    inStock: (p.stock ?? 0) > 0,
    stockCount: p.stock ?? 0,
    brand: p.brand,
    currency: p.currency || "TRY",
    flashDealEndsAt: p.flashDealEndsAt,
    priceDropAt: p.priceDropAt,
    searchCount: p.searchCount,
  };
}

export function toUiProducts(list: Product[] | undefined | null): UiProduct[] {
  return (list || []).map(toUiProduct);
}
