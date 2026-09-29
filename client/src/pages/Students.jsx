import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentService } from '../services/studentService';
import { AvatarFallback, StatusBadge, formatDate } from '../components/helpers';
import DeleteModal from '../components/DeleteModal';
import { toast } from 'react-toastify';
import {
  Search, Plus, Eye, Pencil, Trash2, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, SlidersHorizontal
} from 'lucide-react';

const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Business Administration', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];
const COURSES = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'BBA', 'MBA', 'B.Sc', 'M.Sc', 'B.Com', 'B.A'];
const YEARS = [1, 2, 3, 4, 5, 6];
const STATUSES = ['active', 'inactive', 'graduated', 'suspended'];
const GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'];

const SortIcon = ({ field, current, order }) =>
  current === field
    ? order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
    : <ChevronDown size={14} style={{ opacity: 0.3 }} />;

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: '', department: '', course: '', year: '', gender: '', status: '',
    sortBy: 'createdAt', sortOrder: 'desc', page: 1, limit: 10
  });

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined));
      const res = await studentService.getAll(params);
      setStudents(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(() => { fetchStudents(); }, filters.search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchStudents]);

  const handleSort = (field) => {
    setFilters(p => ({
      ...p,
      sortBy: field,
      sortOrder: p.sortBy === field && p.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1
    }));
  };

  const handleFilter = (key, val) => {
    setFilters(p => ({ ...p, [key]: val, page: 1 }));
  };

  const handleSearch = (e) => {
    setFilters(p => ({ ...p, search: e.target.value, page: 1 }));
  };

  const handlePage = (p) => {
    setFilters(prev => ({ ...prev, page: p }));
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await studentService.delete(deleteTarget._id);
      toast.success('Student deleted successfully.');
      setDeleteTarget(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ search: '', department: '', course: '', year: '', gender: '', status: '', sortBy: 'createdAt', sortOrder: 'desc', page: 1, limit: 10 });
  };

  const hasFilters = filters.department || filters.course || filters.year || filters.gender || filters.status;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title">
          <h1>Students</h1>
          <p>Manage all student records — {pagination.total} total students</p>
        </div>
        <Link to="/students/add" className="btn btn-primary">
          <Plus size={16} /> Add Student
        </Link>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box" style={{ flex: 2 }}>
          <Search size={16} className="search-icon" />
          <input
            id="student-search"
            placeholder="Search by name, email, ID, course..."
            value={filters.search}
            onChange={handleSearch}
          />
        </div>

        <button
          className={`btn btn-secondary btn-sm`}
          onClick={() => setShowFilters(p => !p)}
          style={hasFilters ? { borderColor: 'var(--primary-500)', color: 'var(--primary-400)' } : {}}
        >
          <SlidersHorizontal size={15} /> Filters {hasFilters ? '●' : ''}
        </button>

        <select id="sort-select" className="filter-select" value={`${filters.sortBy}:${filters.sortOrder}`}
          onChange={e => {
            const [sortBy, sortOrder] = e.target.value.split(':');
            setFilters(p => ({ ...p, sortBy, sortOrder, page: 1 }));
          }}>
          <option value="createdAt:desc">Newest First</option>
          <option value="createdAt:asc">Oldest First</option>
          <option value="firstName:asc">Name A→Z</option>
          <option value="firstName:desc">Name Z→A</option>
          <option value="studentId:asc">Student ID ↑</option>
          <option value="enrollmentDate:desc">Enrollment Date ↓</option>
        </select>

        <select id="limit-select" className="filter-select" value={filters.limit}
          onChange={e => setFilters(p => ({ ...p, limit: parseInt(e.target.value), page: 1 }))}>
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <div className="form-label" style={{ marginBottom: 6 }}>Department</div>
              <select id="filter-dept" className="filter-select" value={filters.department} onChange={e => handleFilter('department', e.target.value)}>
                <option value="">All Departments</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <div className="form-label" style={{ marginBottom: 6 }}>Course</div>
              <select id="filter-course" className="filter-select" value={filters.course} onChange={e => handleFilter('course', e.target.value)}>
                <option value="">All Courses</option>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div className="form-label" style={{ marginBottom: 6 }}>Year</div>
              <select id="filter-year" className="filter-select" value={filters.year} onChange={e => handleFilter('year', e.target.value)}>
                <option value="">All Years</option>
                {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div>
              <div className="form-label" style={{ marginBottom: 6 }}>Gender</div>
              <select id="filter-gender" className="filter-select" value={filters.gender} onChange={e => handleFilter('gender', e.target.value)}>
                <option value="">All Genders</option>
                {GENDERS.map(g => <option key={g} value={g}>{g.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <div className="form-label" style={{ marginBottom: 6 }}>Status</div>
              <select id="filter-status" className="filter-select" value={filters.status} onChange={e => handleFilter('status', e.target.value)}>
                <option value="">All Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {hasFilters && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ alignSelf: 'flex-end' }}>
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="loading-screen" style={{ minHeight: 300 }}>
            <div className="spinner" /><p className="loading-text">Loading students...</p>
          </div>
        ) : !students.length ? (
          <div className="empty-state">
            <div className="empty-icon">🎓</div>
            <p className="empty-title">No students found</p>
            <p className="empty-subtitle">
              {filters.search || hasFilters ? 'Try adjusting your search/filters.' : 'Add your first student to get started.'}
            </p>
            {!filters.search && !hasFilters && (
              <Link to="/students/add" className="btn btn-primary" style={{ marginTop: 16 }}>Add Student</Link>
            )}
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th className="sortable" onClick={() => handleSort('studentId')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      ID <SortIcon field="studentId" current={filters.sortBy} order={filters.sortOrder} />
                    </span>
                  </th>
                  <th>Phone</th>
                  <th className="sortable" onClick={() => handleSort('course')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      Course <SortIcon field="course" current={filters.sortBy} order={filters.sortOrder} />
                    </span>
                  </th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th className="sortable" onClick={() => handleSort('enrollmentDate')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      Enrolled <SortIcon field="enrollmentDate" current={filters.sortBy} order={filters.sortOrder} />
                    </span>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AvatarFallback name={`${s.firstName} ${s.lastName}`} size="sm" imageUrl={s.profileImage} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{s.firstName} {s.lastName}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, background: 'var(--bg-primary)', padding: '3px 8px', borderRadius: 6, color: 'var(--primary-400)' }}>
                        {s.studentId}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.phone || '—'}</td>
                    <td>{s.course}</td>
                    <td style={{ fontSize: 13 }}>{s.department}</td>
                    <td>
                      <span className="badge badge-gray" style={{ minWidth: 60, justifyContent: 'center' }}>Year {s.year}</span>
                    </td>
                    <td><StatusBadge status={s.status} /></td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatDate(s.enrollmentDate)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button id={`view-${s._id}`} title="View" className="btn btn-ghost btn-icon" onClick={() => navigate(`/students/${s._id}`)}>
                          <Eye size={15} />
                        </button>
                        <button id={`edit-${s._id}`} title="Edit" className="btn btn-ghost btn-icon" onClick={() => navigate(`/students/${s._id}/edit`)}
                          style={{ color: 'var(--primary-400)' }}>
                          <Pencil size={15} />
                        </button>
                        <button id={`delete-${s._id}`} title="Delete" className="btn btn-ghost btn-icon" onClick={() => setDeleteTarget(s)}
                          style={{ color: 'var(--danger-500)' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div style={{ padding: '0 20px' }}>
            <div className="pagination">
              <span className="pagination-info">
                Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
              </span>
              <button className="page-btn" onClick={() => handlePage(pagination.page - 1)} disabled={pagination.page === 1}>
                <ChevronLeft size={16} />
              </button>
              {[...Array(pagination.totalPages)].map((_, i) => {
                const p = i + 1;
                if (pagination.totalPages <= 7 || Math.abs(p - pagination.page) <= 2 || p === 1 || p === pagination.totalPages) {
                  return (
                    <button key={p} className={`page-btn ${p === pagination.page ? 'active' : ''}`} onClick={() => handlePage(p)}>
                      {p}
                    </button>
                  );
                }
                if (Math.abs(p - pagination.page) === 3) return <span key={p} style={{ color: 'var(--text-muted)' }}>...</span>;
                return null;
              })}
              <button className="page-btn" onClick={() => handlePage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteModal
        student={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Students;
