import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import ProductsPage from "../pages/products/page";
import ProductDetailPage from "../pages/product/page";
import BasketPage from "../pages/basket/page";
import CheckoutPage from "../pages/checkout/page";
import AuthPage from "../pages/auth/page";
import AccountPage from "../pages/account/page";
import ContactPage from "../pages/contact/page";
import FaqPage from "../pages/faq/page";
import SearchPage from "../pages/search/page";
import TrackOrderPage from "../pages/track-order/page";
import ConfirmDeliveryPage from "../pages/confirm-delivery/page";
import WishlistPage from "../pages/wishlist/page";
import AdminDashboard from "../pages/admin/dashboard/page";
import AdminProducts from "../pages/admin/products/page";
import AdminCategories from "../pages/admin/categories/page";
import AdminBrands from "../pages/admin/brands/page";
import AdminFlashDeals from "../pages/admin/flash-deals/page";
import AdminPriceDrops from "../pages/admin/price-drops/page";
import PriceDropsPage from "../pages/price-drops/page";
import AdminBanners from "../pages/admin/banners/page";
import AdminOrders from "../pages/admin/orders/page";
import AdminCustomers from "../pages/admin/customers/page";
import AdminReviews from "../pages/admin/reviews/page";
import AdminWishlists from "../pages/admin/wishlists/page";
import AdminLoginPage from "../pages/admin/auth/login";
import AdminRegisterPage from "../pages/admin/auth/register";
import RequireAuth from "./guards/RequireAuth";
import RequireAdmin from "./guards/RequireAdmin";

const routes: RouteObject[] = [
  // ─── Public ────────────────────────────────────────────
  { path: "/", element: <Home /> },
  { path: "/products", element: <ProductsPage /> },
  { path: "/product/:id", element: <ProductDetailPage /> },
  { path: "/basket", element: <BasketPage /> },
  { path: "/login", element: <AuthPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/faq", element: <FaqPage /> },
  { path: "/search", element: <SearchPage /> },
  { path: "/track-order", element: <TrackOrderPage /> },
  { path: "/confirm-delivery", element: <ConfirmDeliveryPage /> },
  { path: "/price-drops", element: <PriceDropsPage /> },
  { path: "/wishlist", element: <WishlistPage /> },

  // ─── Admin auth (public, ayrı kapı) ────────────────────
  { path: "/admin/login", element: <AdminLoginPage /> },
  { path: "/admin/register", element: <AdminRegisterPage /> },

  // ─── Auth gerektirenler ────────────────────────────────
  {
    element: <RequireAuth />,
    children: [
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/account", element: <AccountPage /> },
    ],
  },

  // ─── Admin'e özel ──────────────────────────────────────
  {
    element: <RequireAdmin />,
    children: [
      { path: "/admin", element: <AdminDashboard /> },
      { path: "/admin/products", element: <AdminProducts /> },
      { path: "/admin/categories", element: <AdminCategories /> },
      { path: "/admin/brands", element: <AdminBrands /> },
      { path: "/admin/flash-deals", element: <AdminFlashDeals /> },
      { path: "/admin/price-drops", element: <AdminPriceDrops /> },
      { path: "/admin/banners", element: <AdminBanners /> },
      { path: "/admin/orders", element: <AdminOrders /> },
      { path: "/admin/reviews", element: <AdminReviews /> },
      { path: "/admin/wishlists", element: <AdminWishlists /> },
      { path: "/admin/customers", element: <AdminCustomers /> },
    ],
  },

  { path: "*", element: <NotFound /> },
];

export default routes;
