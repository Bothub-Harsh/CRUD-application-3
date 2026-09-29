import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { studentService } from '../services/studentService';
import { AvatarFallback, StatusBadge, formatDate, getGenderLabel } from '../components/helpers';
import DeleteModal from '../components/DeleteModal';
import { toast } from 'react-toastify';
import { ChevronLeft, Pencil, Trash2, Mail, Phone, MapPin, Calendar, BookOpen, Hash } from 'lucide-react';

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="info-item">
    <div className="info-label">
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {Icon && <Icon size={11} />} {label}
      </div>
    </div>
    <div className="info-value">{value || '—'}</div>
  </div>
);

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await studentService.getById(id);
        setStudent(res.data.data);
      } catch (err) {
        toast.error('Student not found.');
        navigate('/students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id, navigate]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await studentService.delete(id);
      toast.success('Student deleted successfully.');
      navigate('/students');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: 400 }}>
        <div className="spinner" /><p className="loading-text">Loading student profile...</p>
      </div>
    );
  }

  if (!student) return null;

  const sectionCard = (title, items) => (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header"><h2 className="card-title">{title}</h2></div>
      <div className="card-body">
        <div className="profile-info-grid">
          {items.map((item, i) => (
            <InfoItem key={i} icon={item.icon} label={item.label} value={item.value} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <button className="back-btn" onClick={() => navigate('/students')}>
        <ChevronLeft size={18} /> Back to Students
      </button>

      {/* Hero */}
      <div className="profile-hero">
        <AvatarFallback name={`${student.firstName} ${student.lastName}`} size="xl" imageUrl={student.profileImage} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            {student.firstName} {student.lastName}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <span style={{ fontFamily: 'monospace', background: 'rgba(99,102,241,0.15)', color: 'var(--primary-400)', padding: '4px 12px', borderRadius: 6, fontSize: 14, fontWeight: 600 }}>
              {student.studentId}
            </span>
            <StatusBadge status={student.status} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 14, color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={14} />{student.email}
            </span>
            {student.phone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={14} />{student.phone}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={14} />{student.course} • {student.department}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <Link to={`/students/${id}/edit`} className="btn btn-secondary">
            <Pencil size={15} /> Edit
          </Link>
          <button className="btn btn-danger" onClick={() => setDeleteOpen(true)}>
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      {/* Info sections */}
      {sectionCard('Academic Information', [
        { icon: Hash,    label: 'Student ID',      value: student.studentId },
        { icon: BookOpen,label: 'Course',          value: student.course },
        { label: 'Department',   value: student.department },
        { label: 'Year',         value: student.year ? `Year ${student.year}` : null },
        { icon: Calendar,label: 'Enrollment Date', value: formatDate(student.enrollmentDate) },
        { label: 'Status',       value: <StatusBadge status={student.status} /> },
      ])}

      {sectionCard('Personal Information', [
        { label: 'Full Name',     value: `${student.firstName} ${student.lastName}` },
        { icon: Mail, label: 'Email',  value: student.email },
        { icon: Phone,label: 'Phone',  value: student.phone },
        { label: 'Date of Birth', value: formatDate(student.dateOfBirth) },
        { label: 'Gender',        value: getGenderLabel(student.gender) },
      ])}

      {sectionCard('Contact & Address', [
        { icon: MapPin, label: 'Address',  value: student.address },
        { label: 'City',    value: student.city },
        { label: 'State',   value: student.state },
        { label: 'Country', value: student.country },
      ])}

      {sectionCard('System Information', [
        { label: 'Created At', value: formatDate(student.createdAt) },
        { label: 'Updated At', value: formatDate(student.updatedAt) },
        { label: 'Record ID',  value: student._id },
      ])}

      <DeleteModal
        student={student}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={deleteLoading}
      />
    </div>
  );
};

export default StudentDetails;
