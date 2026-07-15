import { Link, Outlet, useParams, useSearchParams } from 'react-router-dom';

function PublicLayout() {
  const { restaurantSlug } = useParams();
  const [searchParams] = useSearchParams();
  const basePath = `/r/${restaurantSlug}`;
  const tableId = searchParams.get('tableId');
  const tableQuery = tableId ? `?tableId=${tableId}` : '';

  return (
    <div className="public-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="public-header">
        <Link className="brand" to={`${basePath}${tableQuery}`}>RestroBuild</Link>
        <nav>
          <Link to={`${basePath}${tableQuery}`}>Home</Link>
          <Link to={`${basePath}/menu${tableQuery}`}>Menu</Link>
          <Link to={`${basePath}/cart${tableQuery}`}>Cart</Link>
          <Link to={`${basePath}/about${tableQuery}`}>About</Link>
          <Link to={`${basePath}/contact${tableQuery}`}>Contact</Link>
        </nav>
      </header>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;
