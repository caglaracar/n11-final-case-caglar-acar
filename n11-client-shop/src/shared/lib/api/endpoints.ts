export const ENDPOINTS = {
  auth: {
    login: '/dev/v1/auth/login',
    register: '/dev/v1/auth/register',
    refresh: '/dev/v1/auth/refresh',
    logout: '/dev/v1/auth/logout',
  },
  user: {
    me: '/dev/v1/user-profile/me',
    update: '/dev/v1/user-profile/update',
  },
  product: {
    findAll: '/dev/v1/product/find-all',
    findById: (id: string) => `/dev/v1/product/find-by-id/${id}`,
    popular: '/dev/v1/product/popular',
    flashDeals: '/dev/v1/product/flash-deals',
    priceDrops: '/dev/v1/product/price-drops',
    trending: '/dev/v1/product/search/trending',
  },
  category: { findAll: '/dev/v1/product/category/find-all' },
  brand: { findAll: '/dev/v1/product/brand/find-all' },
  banner: { findAll: '/dev/v1/banner/find-all' },
  basket: {
    me: '/dev/v1/basket',
    add: '/dev/v1/basket/add',
    update: '/dev/v1/basket/update',
    remove: (productId: string) => `/dev/v1/basket/remove/${productId}`,
    clear: '/dev/v1/basket/clear',
  },
  address: {
    list: '/dev/v1/address',
    create: '/dev/v1/address/create',
    update: (id: string) => `/dev/v1/address/update/${id}`,
    remove: (id: string) => `/dev/v1/address/delete/${id}`,
    setDefault: (id: string) => `/dev/v1/address/default/${id}`,
  },
  order: {
    checkout: '/dev/v1/order/checkout',
    me: '/dev/v1/order/me',
    byId: (id: number | string) => `/dev/v1/order/${id}`,
    cancel: (id: number | string) => `/dev/v1/order/${id}/cancel`,
  },
  payment: {
    byOrderId: (orderId: number | string) => `/dev/v1/payment/order/${orderId}`,
  },
} as const;
