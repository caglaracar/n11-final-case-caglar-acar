/**
 * Tüm domain servislerini tek bir noktadan re-export eder.
 *
 * Kullanım:
 *   import { authService, productService } from "@/services";
 *   import { http, ApiError, tokenStore } from "@/services/http";
 */
export * from "./auth.service";
export * from "./user.service";
export * from "./product.service";
export * from "./review.service";
export * from "./blog.service";
export * from "./basket.service";
export * from "./order.service";
export * from "./wishlist.service";
export * from "./address.service";
export * from "./contact.service";
export * from "./admin.service";
export * from "./banner.service";
export * from "./payment.service";

// UI adaptörleri
export * from "./adapters/product.adapter";

// Sık kullanılan core
export { http, ApiError, tokenStore, decodeJwt, isExpired, API_BASE } from "./http";
