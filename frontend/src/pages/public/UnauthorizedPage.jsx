import { Link } from 'react-router-dom';

function UnauthorizedPage() {
  return (
    <section className="center-page">
      <h1>403</h1>
      <p>You do not have permission to access this page.</p>
      <Link to="/login">Return to login</Link>
    </section>
  );
}

export default UnauthorizedPage;
