import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

const TITLE_RULES = [
  { pattern: '/login', title: 'Login | RestroBuild' },
  { pattern: '/register', title: 'Register | RestroBuild' },
  { pattern: '/dashboard', title: 'Dashboard | RestroBuild' },
  { pattern: '/dashboard/profile', title: 'Restaurant Profile | RestroBuild' },
  { pattern: '/dashboard/website', title: 'Website Settings | RestroBuild' },
  { pattern: '/dashboard/categories', title: 'Category Management | RestroBuild' },
  { pattern: '/dashboard/menu', title: 'Menu Management | RestroBuild' },
  { pattern: '/dashboard/tables', title: 'Table Management | RestroBuild' },
  { pattern: '/dashboard/orders', title: 'Orders | RestroBuild' },
  { pattern: '/dashboard/staff', title: 'Staff Management | RestroBuild' },
  { pattern: '/dashboard/reviews', title: 'Reviews | RestroBuild' },
  { pattern: '/dashboard/analytics', title: 'Analytics | RestroBuild' },
  { pattern: '/kitchen/pending', title: 'Pending Orders | RestroBuild' },
  { pattern: '/kitchen/preparing', title: 'Preparing Orders | RestroBuild' },
  { pattern: '/kitchen/ready', title: 'Ready Orders | RestroBuild' },
  { pattern: '/waiter/ready', title: 'Ready Orders | RestroBuild' },
  { pattern: '/waiter/served', title: 'Served Orders | RestroBuild' },
  { pattern: '/r/:restaurantSlug', title: 'Restaurant Website | RestroBuild' },
  { pattern: '/r/:restaurantSlug/about', title: 'About | RestroBuild' },
  { pattern: '/r/:restaurantSlug/contact', title: 'Contact | RestroBuild' },
  { pattern: '/r/:restaurantSlug/menu', title: 'Menu | RestroBuild' },
  { pattern: '/r/:restaurantSlug/cart', title: 'Cart | RestroBuild' },
  { pattern: '/r/:restaurantSlug/menu/:menuItemId', title: 'Dish Details | RestroBuild' },
  { pattern: '/r/:restaurantSlug/orders/:orderId', title: 'Order Tracking | RestroBuild' },
  { pattern: '/r/:restaurantSlug/bill/:orderId', title: 'Bill Summary | RestroBuild' },
  { pattern: '/unauthorized', title: 'Unauthorized | RestroBuild' },
];

function PageTitle() {
  const location = useLocation();
  const matchedRule = TITLE_RULES.find((rule) => matchPath({ path: rule.pattern, end: true }, location.pathname));
  const title = matchedRule?.title ?? 'Page Not Found | RestroBuild';

  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}

export default PageTitle;
