import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/dashboard/profile', label: 'Restaurant Profile' },
  { to: '/dashboard/website', label: 'Website' },
  { to: '/dashboard/categories', label: 'Categories' },
  { to: '/dashboard/menu', label: 'Menu' },
  { to: '/dashboard/tables', label: 'Tables' },
  { to: '/dashboard/orders', label: 'Orders' },
  { to: '/dashboard/reviews', label: 'Reviews' },
  { to: '/dashboard/staff', label: 'Staff' },
  { to: '/dashboard/analytics', label: 'Analytics' },
];

function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="dashboard-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <aside className="sidebar">
        <div className="brand">RestroBuild</div>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="ghost-button" type="button" onClick={handleLogout}>
          Logout
        </button>
      </aside>
      <main id="main-content" className="dashboard-main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
