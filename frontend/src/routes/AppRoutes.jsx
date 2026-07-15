import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoadingState } from '../components/PageState';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';
import PublicLayout from '../layouts/PublicLayout';
import StaffLayout from '../layouts/StaffLayout';
import ProtectedRoute from './ProtectedRoute';

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const AnalyticsPage = lazy(() => import('../pages/dashboard/AnalyticsPage'));
const CategoryManagementPage = lazy(() => import('../pages/dashboard/CategoryManagementPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const MenuManagementPage = lazy(() => import('../pages/dashboard/MenuManagementPage'));
const OrdersPage = lazy(() => import('../pages/dashboard/OrdersPage'));
const RestaurantProfilePage = lazy(() => import('../pages/dashboard/RestaurantProfilePage'));
const ReviewManagementPage = lazy(() => import('../pages/dashboard/ReviewManagementPage'));
const StaffManagementPage = lazy(() => import('../pages/dashboard/StaffManagementPage'));
const TableManagementPage = lazy(() => import('../pages/dashboard/TableManagementPage'));
const WebsiteSettingsPage = lazy(() => import('../pages/dashboard/WebsiteSettingsPage'));
const PublicAboutPage = lazy(() => import('../pages/public/PublicAboutPage'));
const PublicBillPage = lazy(() => import('../pages/public/PublicBillPage'));
const PublicCartPage = lazy(() => import('../pages/public/PublicCartPage'));
const PublicContactPage = lazy(() => import('../pages/public/PublicContactPage'));
const PublicDishDetailsPage = lazy(() => import('../pages/public/PublicDishDetailsPage'));
const PublicHomePage = lazy(() => import('../pages/public/PublicHomePage'));
const PublicMenuPage = lazy(() => import('../pages/public/PublicMenuPage'));
const PublicOrderStatusPage = lazy(() => import('../pages/public/PublicOrderStatusPage'));
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('../pages/public/UnauthorizedPage'));
const KitchenOrdersPage = lazy(() => import('../pages/staff/KitchenOrdersPage'));
const WaiterOrdersPage = lazy(() => import('../pages/staff/WaiterOrdersPage'));

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingState label="Loading page..." />}>
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
            <Route path="served" element={<WaiterOrdersPage status="SERVED" />} />
            <Route index element={<Navigate to="/waiter/ready" replace />} />
          </Route>
        </Route>

        <Route path="/r/:restaurantSlug" element={<PublicLayout />}>
          <Route index element={<PublicHomePage />} />
          <Route path="about" element={<PublicAboutPage />} />
          <Route path="contact" element={<PublicContactPage />} />
          <Route path="menu" element={<PublicMenuPage />} />
          <Route path="cart" element={<PublicCartPage />} />
          <Route path="menu/:menuItemId" element={<PublicDishDetailsPage />} />
          <Route path="orders/:orderId" element={<PublicOrderStatusPage />} />
          <Route path="bill/:orderId" element={<PublicBillPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
