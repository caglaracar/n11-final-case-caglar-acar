/**
 * @deprecated Yeni kodlarda `@/services` (servisler) ve `@/types/api` (tipler) kullanın.
 * Bu dosya geriye dönük uyum için ince bir yeniden-dışa-aktarımdır.
 */
export {
  authService as authApi,
  userService as userApi,
  productService as productApi,
  reviewService as reviewApi,
  blogService as blogApi,
  basketService as basketApi,
  orderService as orderApi,
  wishlistService as wishlistApi,
  addressService as addressApi,
  contactService as contactApi,
  adminService as adminApi,
  http,
  ApiError,
  tokenStore,
  decodeJwt,
  API_BASE,
} from "@/services";
export type * from "@/types/api";
