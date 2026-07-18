import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'D' },
  { to: '/dashboard/profile', label: 'Restaurant Profile', icon: 'P' },
  { to: '/dashboard/website', label: 'Website', icon: 'W' },
  { to: '/dashboard/categories', label: 'Categories', icon: 'C' },
  { to: '/dashboard/menu', label: 'Menu', icon: 'M' },
  { to: '/dashboard/tables', label: 'Tables', icon: 'T' },
  { to: '/dashboard/orders', label: 'Orders', icon: 'O' },
  { to: '/dashboard/reviews', label: 'Reviews', icon: 'R' },
  { to: '/dashboard/staff', label: 'Staff', icon: 'S' },
  { to: '/dashboard/analytics', label: 'Analytics', icon: 'A' },
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
        <div className="sidebar-top">
          <div className="brand">RestroBuild</div>
          <span>Restaurant command center</span>
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'}>
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
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
