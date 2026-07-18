import { Link, Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <Link className="brand" to="/login">RestroBuild</Link>
        <Outlet />
      </section>
      <section className="auth-aside">
        <div>
          <p className="eyebrow">Restaurant SaaS</p>
          <h1>Build a branded menu and QR ordering flow for every table.</h1>
          <p>
            Owners manage the restaurant, kitchen staff process live orders, and customers order from a mobile-first website.
          </p>
          <div className="auth-feature-grid" aria-label="Platform highlights">
            <span>Live orders</span>
            <span>QR menus</span>
            <span>Staff roles</span>
            <span>Analytics</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
