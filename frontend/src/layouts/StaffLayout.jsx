import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function StaffLayout({ role }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const navItems = role === 'kitchen'
    ? [
        { to: '/kitchen/pending', label: 'Pending Orders', icon: 'P' },
        { to: '/kitchen/preparing', label: 'Preparing Orders', icon: 'K' },
        { to: '/kitchen/ready', label: 'Ready Orders', icon: 'R' },
      ]
    : [
        { to: '/waiter/ready', label: 'Ready Orders', icon: 'R' },
        { to: '/waiter/served', label: 'Served Orders', icon: 'S' },
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
        <div className="sidebar-top">
          <div className="brand">RestroBuild</div>
          <span>{role === 'kitchen' ? 'Kitchen live board' : 'Dining room service board'}</span>
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
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

export default StaffLayout;
