import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="not-found">
    <div className="not-found-code">404</div>
    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Page Not Found</h1>
    <p style={{ color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 400, lineHeight: 1.7 }}>
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link to="/dashboard" className="btn btn-primary btn-lg">
      Go to Dashboard
    </Link>
  </div>
);

export default NotFound;
