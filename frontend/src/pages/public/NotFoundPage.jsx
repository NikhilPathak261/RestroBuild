import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="center-page">
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/login">Return home</Link>
    </section>
  );
}

export default NotFoundPage;
