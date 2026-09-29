import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentService } from '../services/studentService';
import { useAuth } from '../hooks/useAuth';
import { AvatarFallback, StatusBadge, formatDate } from '../components/helpers';
import {
  Users, UserCheck, UserX, GraduationCap, AlertCircle,
  ArrowRight, TrendingUp, BookOpen
} from 'lucide-react';

const statConfig = [
  { key: 'total',     label: 'Total Students',    icon: Users,         variant: 'primary' },
  { key: 'active',    label: 'Active Students',    icon: UserCheck,     variant: 'success' },
  { key: 'inactive',  label: 'Inactive Students',  icon: UserX,         variant: 'warning' },
  { key: 'graduated', label: 'Graduated',          icon: GraduationCap, variant: 'info'    },
  { key: 'suspended', label: 'Suspended',          icon: AlertCircle,   variant: 'danger'  },
];

const Dashboard = () => {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await studentService.getStats();
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const maxDept = stats?.byDepartment?.[0]?.count || 1;
  const maxCourse = stats?.byCourse?.[0]?.count || 1;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title">
          <h1>{greeting()}, {admin?.name?.split(' ')[0] || 'Admin'}! 👋</h1>
          <p>Here's what's happening with your students today.</p>
        </div>
        <Link to="/students/add" className="btn btn-primary">
          <Users size={16} /> Add Student
        </Link>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="stats-grid">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ height: 44, width: 44, borderRadius: 10 }} />
              <div className="skeleton" style={{ height: 32, width: 80, borderRadius: 6, marginTop: 4 }} />
              <div className="skeleton" style={{ height: 16, width: 120, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="stats-grid">
          {statConfig.map(({ key, label, icon: Icon, variant }) => (
            <div key={key} className={`stat-card ${variant}`}>
              <div className={`stat-icon-wrap ${variant}`}>
                <Icon size={22} color={
                  variant === 'primary' ? 'var(--primary-400)' :
                  variant === 'success' ? '#4ade80' :
                  variant === 'warning' ? '#fbbf24' :
                  variant === 'danger'  ? '#fb7185' : '#22d3ee'
                } />
              </div>
              <div className="stat-value">{stats?.[key] ?? 0}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="chart-grid">
        {/* By Department */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Students by Department</h2>
            <BookOpen size={18} color="var(--text-muted)" />
          </div>
          <div className="card-body">
            {!loading && stats?.byDepartment?.length ? (
              <div className="chart-bar-list">
                {stats.byDepartment.map((d, i) => (
                  <div key={i} className="chart-bar-item">
                    <div className="chart-bar-label">
                      <span>{d.name}</span>
                      <span>{d.count} students</span>
                    </div>
                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill"
                        style={{ width: `${(d.count / maxDept) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '40px 24px' }}>
                <p className="empty-subtitle">No department data yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* By Course */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Top Courses</h2>
            <TrendingUp size={18} color="var(--text-muted)" />
          </div>
          <div className="card-body">
            {!loading && stats?.byCourse?.length ? (
              <div className="chart-bar-list">
                {stats.byCourse.map((c, i) => (
                  <div key={i} className="chart-bar-item">
                    <div className="chart-bar-label">
                      <span>{c.name}</span>
                      <span>{c.count}</span>
                    </div>
                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill"
                        style={{
                          width: `${(c.count / maxCourse) * 100}%`,
                          background: 'linear-gradient(90deg, #22c55e, #4ade80)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '40px 24px' }}>
                <p className="empty-subtitle">No course data yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recently Added */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recently Added Students</h2>
          <Link to="/students" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="loading-screen" style={{ minHeight: 200 }}>
            <div className="spinner" />
          </div>
        ) : !stats?.recentStudents?.length ? (
          <div className="empty-state">
            <div className="empty-icon">🎓</div>
            <p className="empty-title">No students yet</p>
            <p className="empty-subtitle">Add your first student to get started.</p>
            <Link to="/students/add" className="btn btn-primary" style={{ marginTop: 16 }}>Add Student</Link>
          </div>
        ) : (
          <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>ID</th>
                  <th>Course</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentStudents.map(s => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AvatarFallback name={`${s.firstName} ${s.lastName}`} size="sm" imageUrl={s.profileImage} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.firstName} {s.lastName}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{s.studentId}</td>
                    <td>{s.course}</td>
                    <td>{s.department}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>{formatDate(s.createdAt)}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/students/${s._id}`)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
