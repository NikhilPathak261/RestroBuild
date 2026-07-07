import { Link, Outlet, useParams } from 'react-router-dom';

function PublicLayout() {
  const { restaurantSlug } = useParams();
  const basePath = `/r/${restaurantSlug}`;

  return (
    <main className="public-shell">
      <header className="public-header">
        <Link className="brand" to={basePath}>RestroBuild</Link>
        <nav>
          <Link to={basePath}>Home</Link>
          <Link to={`${basePath}/menu`}>Menu</Link>
          <Link to={`${basePath}/about`}>About</Link>
          <Link to={`${basePath}/contact`}>Contact</Link>
          <Link to={`${basePath}/cart`}>Cart</Link>
        </nav>
      </header>
      <Outlet />
    </main>
  );
}

export default PublicLayout;
