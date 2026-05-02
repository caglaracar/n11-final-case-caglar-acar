import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { AppShell } from '@/shared/components/layout/AppShell';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { ProductsPage } from '@/features/products/pages/ProductsPage';
import { CategoriesPage } from '@/features/categories/pages/CategoriesPage';
import { BrandsPage } from '@/features/brands/pages/BrandsPage';
import { BannersPage } from '@/features/banners/pages/BannersPage';
import { FlashDealsPage } from '@/features/flash-deals/pages/FlashDealsPage';
import { PriceDropsPage } from '@/features/price-drops/pages/PriceDropsPage';
import { OrdersPage } from '@/features/orders/pages/OrdersPage';
import { UsersPage } from '@/features/users/pages/UsersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/banners" element={<BannersPage />} />
          <Route path="/flash-deals" element={<FlashDealsPage />} />
          <Route path="/price-drops" element={<PriceDropsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
