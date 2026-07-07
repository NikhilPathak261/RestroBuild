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
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
