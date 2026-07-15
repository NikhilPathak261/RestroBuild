import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function StaffLayout({ role }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const navItems = role === 'kitchen'
    ? [
        { to: '/kitchen/pending', label: 'Pending Orders' },
        { to: '/kitchen/preparing', label: 'Preparing Orders' },
        { to: '/kitchen/ready', label: 'Ready Orders' },
      ]
    : [
        { to: '/waiter/ready', label: 'Ready Orders' },
        { to: '/waiter/served', label: 'Served Orders' },
      ];

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
            <NavLink key={item.to} to={item.to}>
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

export default StaffLayout;
