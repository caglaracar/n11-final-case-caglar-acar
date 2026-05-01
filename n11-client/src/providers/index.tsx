/**
 * Tüm uygulama provider'larını tek bir bileşende birleştirir.
 * Sıralama önemli: Auth, Cart ve Wishlist'e isAuthenticated bilgisi sağlar.
 */
import type { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import i18n from "@/i18n";
import { AuthProvider } from "./AuthProvider";
import { BasketProvider } from "./BasketProvider";
import { WishlistProvider } from "./WishlistProvider";

export { useAuth } from "./AuthProvider";
export { useBasket, type BasketItem } from "./BasketProvider";
export { useWishlist } from "./WishlistProvider";

declare const __BASE_PATH__: string;

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <BasketProvider>
          <WishlistProvider>
            <BrowserRouter basename={__BASE_PATH__}>{children}</BrowserRouter>
          </WishlistProvider>
        </BasketProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}
