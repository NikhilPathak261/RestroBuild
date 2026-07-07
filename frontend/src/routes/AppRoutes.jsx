import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';
import PublicLayout from '../layouts/PublicLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import CategoryManagementPage from '../pages/dashboard/CategoryManagementPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import MenuManagementPage from '../pages/dashboard/MenuManagementPage';
import OrdersPage from '../pages/dashboard/OrdersPage';
import RestaurantProfilePage from '../pages/dashboard/RestaurantProfilePage';
import TableManagementPage from '../pages/dashboard/TableManagementPage';
import WebsiteSettingsPage from '../pages/dashboard/WebsiteSettingsPage';
import PublicHomePage from '../pages/public/PublicHomePage';
import PublicMenuPage from '../pages/public/PublicMenuPage';
import PublicOrderStatusPage from '../pages/public/PublicOrderStatusPage';
import NotFoundPage from '../pages/public/NotFoundPage';
import UnauthorizedPage from '../pages/public/UnauthorizedPage';
import ProtectedRoute from './ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['ROLE_OWNER']} />}>
        <Route path="/dashboard" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<RestaurantProfilePage />} />
          <Route path="website" element={<WebsiteSettingsPage />} />
          <Route path="categories" element={<CategoryManagementPage />} />
          <Route path="menu" element={<MenuManagementPage />} />
          <Route path="tables" element={<TableManagementPage />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>
      </Route>

      <Route path="/r/:restaurantSlug" element={<PublicLayout />}>
        <Route index element={<PublicHomePage />} />
        <Route path="menu" element={<PublicMenuPage />} />
        <Route path="orders/:orderId" element={<PublicOrderStatusPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
