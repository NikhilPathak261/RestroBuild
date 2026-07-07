import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';
import PublicLayout from '../layouts/PublicLayout';
import StaffLayout from '../layouts/StaffLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import AnalyticsPage from '../pages/dashboard/AnalyticsPage';
import CategoryManagementPage from '../pages/dashboard/CategoryManagementPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import MenuManagementPage from '../pages/dashboard/MenuManagementPage';
import OrdersPage from '../pages/dashboard/OrdersPage';
import RestaurantProfilePage from '../pages/dashboard/RestaurantProfilePage';
import ReviewManagementPage from '../pages/dashboard/ReviewManagementPage';
import StaffManagementPage from '../pages/dashboard/StaffManagementPage';
import TableManagementPage from '../pages/dashboard/TableManagementPage';
import WebsiteSettingsPage from '../pages/dashboard/WebsiteSettingsPage';
import PublicHomePage from '../pages/public/PublicHomePage';
import PublicMenuPage from '../pages/public/PublicMenuPage';
import PublicOrderStatusPage from '../pages/public/PublicOrderStatusPage';
import NotFoundPage from '../pages/public/NotFoundPage';
import UnauthorizedPage from '../pages/public/UnauthorizedPage';
import KitchenOrdersPage from '../pages/staff/KitchenOrdersPage';
import WaiterOrdersPage from '../pages/staff/WaiterOrdersPage';
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
          <Route path="staff" element={<StaffManagementPage />} />
          <Route path="reviews" element={<ReviewManagementPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['ROLE_KITCHEN']} />}>
        <Route path="/kitchen" element={<StaffLayout role="kitchen" />}>
          <Route path="pending" element={<KitchenOrdersPage status="PENDING" />} />
          <Route path="preparing" element={<KitchenOrdersPage status="PREPARING" />} />
          <Route path="ready" element={<KitchenOrdersPage status="READY" />} />
          <Route index element={<Navigate to="/kitchen/pending" replace />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['ROLE_WAITER']} />}>
        <Route path="/waiter" element={<StaffLayout role="waiter" />}>
          <Route path="ready" element={<WaiterOrdersPage />} />
          <Route index element={<Navigate to="/waiter/ready" replace />} />
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
