/**
 * Backend DTO'larıyla 1-1 eşleşen frontend tipleri.
 *
 * - Backend `BaseResponse<T>` zarfını HTTP istemcimiz açar; sayfalara `data`'yı doğrudan veririz.
 * - Spring `Page<T>` ham olarak akar.
 */

export type BaseResponse<T> = {
  result: boolean;
  errorMessage: string | null;
  data: T;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type Role = "USER" | "SELLER" | "ADMIN";

// ─── Auth ──────────────────────────────────────────────────────
export type RegisterRequest = {
  userName: string;
  password: string;
  repassword: string;
  email: string;
};
export type RegisterAdminRequest = RegisterRequest & { inviteCode: string };
export type LoginRequest = { userName: string; password: string };
export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
};
export type RegisterResponse = {
  authId: number;
  userName: string;
  email: string;
  role: Role;
};

// ─── User ──────────────────────────────────────────────────────
export type UserProfile = {
  id: string;
  authId: number;
  userName: string;
  name?: string;
  surName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
};
export type UpdateProfileRequest = {
  name?: string;
  surName?: string;
  phone?: string;
  avatar?: string;
};

// ─── Product ───────────────────────────────────────────────────
export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  categoryId?: string;
  subcategory?: string;
  brand?: string;
  stock: number;
  imageUrl?: string;
  images?: string[];
  badge?: string;
  features?: string[];
  rating?: number;
  reviewCount?: number;
  sellerAuthId?: number;
  viewCount?: number;
  searchCount?: number;
  flashDealEndsAt?: string;
  priceDropAt?: string;
  createdAt?: string;
  updatedAt?: string;
};
export type CreateProductRequest = Partial<
  Omit<Product, "id" | "createdAt" | "updatedAt" | "rating" | "reviewCount">
> & {
  name: string;
  price: number;
  currency: string;
  categoryId: string;
  stock: number;
};
export type UpdateProductRequest = Partial<
  Omit<Product, "id" | "createdAt" | "updatedAt" | "rating" | "reviewCount" | "sellerAuthId">
>;

// ─── Review ────────────────────────────────────────────────────
export type Review = {
  id: string;
  productId: string;
  authorAuthId: number;
  authorName?: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt?: string;
};
export type CreateReviewRequest = {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
};

// ─── Blog ──────────────────────────────────────────────────────
export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  category?: string;
  image?: string;
  author?: string;
  readMinutes?: number;
  createdAt?: string;
  updatedAt?: string;
};

// ─── Cart ──────────────────────────────────────────────────────
export type BasketItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};
export type Basket = {
  authId: number;
  items: BasketItem[];
  total: number;
  updatedAt?: string;
};

// ─── Address ───────────────────────────────────────────────────
export type Address = {
  id: string;
  title?: string;
  fullName: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  zipCode: string;
  country?: string;
  isDefault?: boolean;
};

// ─── Order ─────────────────────────────────────────────────────
export type OrderStatus =
  | "CREATED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "SHIPPED"
  | "DELIVERED";
export type Order = {
  id: number;
  authId: number;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  items: BasketItem[];
  createdAt?: string;
  updatedAt?: string;
};
export type CreateOrderRequest = { items: BasketItem[]; currency: string; userEmail?: string };

// ─── Payment ───────────────────────────────────────────────────
export type CheckoutRequest = {
  orderId: number;
  holderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
};
export type PaymentResponse = {
  orderId: number;
  paymentId: number;
  success: boolean;
  providerRef?: string;
  failReason?: string;
  status: string;
};

// ─── Admin ─────────────────────────────────────────────────────
export type AdminStats = {
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
  revenueByMonth: { year: number; month: number; total: number; orders: number }[];
  recentOrders: Order[];
};

// ─── JWT claims ────────────────────────────────────────────────
export type JwtClaims = {
  iss?: string;
  sub?: string;
  role?: Role;
  jti?: string;
  iat?: number;
  exp?: number;
  typ?: "access" | "refresh";
};
