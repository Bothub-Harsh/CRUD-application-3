import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../components/helpers';
import { LogOut, User2 } from 'lucide-react';

const Profile = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = admin?.name
    ? admin.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-header-title">
          <h1>My Profile</h1>
          <p>Account information and settings</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
            <div className="avatar avatar-lg" style={{ background: 'linear-gradient(135deg, var(--primary-500), #7c3aed)', fontSize: 28 }}>
              {initials}
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>{admin?.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span className="badge badge-info">{admin?.role || 'admin'}</span>
              </div>
            </div>
          </div>

          <div className="profile-info-grid">
            <div className="info-item">
              <div className="info-label">Email Address</div>
              <div className="info-value">{admin?.email}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Role</div>
              <div className="info-value" style={{ textTransform: 'capitalize' }}>{admin?.role || 'admin'}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Account ID</div>
              <div className="info-value" style={{ fontSize: 12, fontFamily: 'monospace' }}>{admin?.id}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Last Login</div>
              <div className="info-value">{admin?.lastLogin ? formatDate(admin.lastLogin) : 'Current session'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>Account Actions</h3>
          <button className="btn btn-danger" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
