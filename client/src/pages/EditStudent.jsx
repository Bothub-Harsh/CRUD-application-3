import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../services/studentService';
import { toast } from 'react-toastify';
import { ChevronLeft, Save } from 'lucide-react';

const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Business Administration', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];
const COURSES = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'BBA', 'MBA', 'B.Sc', 'M.Sc', 'B.Com', 'B.A'];

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await studentService.getById(id);
        const s = res.data.data;
        setForm({
          firstName: s.firstName || '', lastName: s.lastName || '', email: s.email || '',
          phone: s.phone || '', dateOfBirth: s.dateOfBirth ? s.dateOfBirth.split('T')[0] : '',
          gender: s.gender || '', studentId: s.studentId || '', course: s.course || '',
          department: s.department || '', year: s.year?.toString() || '', address: s.address || '',
          city: s.city || '', state: s.state || '', country: s.country || 'India',
          enrollmentDate: s.enrollmentDate ? s.enrollmentDate.split('T')[0] : '',
          status: s.status || 'active', profileImage: s.profileImage || ''
        });
      } catch (err) {
        toast.error('Failed to load student.');
        navigate('/students');
      } finally {
        setFetchLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.studentId.trim()) e.studentId = 'Student ID is required';
    if (!form.course) e.course = 'Course is required';
    if (!form.department) e.department = 'Department is required';
    if (!form.year) e.year = 'Year is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Please fix validation errors.'); return; }
    setLoading(true);
    try {
      await studentService.update(id, { ...form, year: parseInt(form.year) });
      toast.success('Student updated successfully! ✅');
      navigate(`/students/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="loading-screen" style={{ minHeight: 400 }}>
        <div className="spinner" /><p className="loading-text">Loading student data...</p>
      </div>
    );
  }

  if (!form) return null;

  const F = ({ name, label, req, type = 'text', children }) => (
    <div className="form-group">
      <label className="form-label" htmlFor={`edit-${name}`}>
        {label}{req && <span className="required">*</span>}
      </label>
      {children || (
        <input id={`edit-${name}`} name={name} type={type}
          className={`form-control ${errors[name] ? 'error' : ''}`}
          value={form[name]} onChange={handleChange} />
      )}
      {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
  );

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <button className="back-btn" onClick={() => navigate(`/students/${id}`)}>
        <ChevronLeft size={18} /> Back to Student Profile
      </button>

      <div className="page-header">
        <div className="page-header-title">
          <h1>Edit Student</h1>
          <p>Update student information — {form.firstName} {form.lastName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><h2 className="card-title">Personal Information</h2></div>
          <div className="card-body">
            <div className="form-grid">
              <F name="firstName" label="First Name" req />
              <F name="lastName" label="Last Name" req />
              <F name="email" label="Email Address" req type="email" />
              <F name="phone" label="Phone Number" type="tel" />
              <F name="dateOfBirth" label="Date of Birth" type="date" />
              <F name="gender" label="Gender">
                <select id="edit-gender" name="gender" className="form-control" value={form.gender} onChange={handleChange}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </F>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-profileImage">Profile Image URL</label>
              <input id="edit-profileImage" name="profileImage" type="url" className="form-control"
                value={form.profileImage} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><h2 className="card-title">Academic Information</h2></div>
          <div className="card-body">
            <div className="form-grid">
              <F name="studentId" label="Student ID" req>
                <input id="edit-studentId" name="studentId" type="text"
                  className={`form-control ${errors.studentId ? 'error' : ''}`}
                  value={form.studentId} onChange={handleChange}
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace' }} />
              </F>
              <F name="course" label="Course" req>
                <select id="edit-course" name="course" className={`form-control ${errors.course ? 'error' : ''}`} value={form.course} onChange={handleChange}>
                  <option value="">Select course</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </F>
              <F name="department" label="Department" req>
                <select id="edit-department" name="department" className={`form-control ${errors.department ? 'error' : ''}`} value={form.department} onChange={handleChange}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </F>
              <F name="year" label="Year" req>
                <select id="edit-year" name="year" className={`form-control ${errors.year ? 'error' : ''}`} value={form.year} onChange={handleChange}>
                  <option value="">Select year</option>
                  {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </F>
              <F name="enrollmentDate" label="Enrollment Date" type="date" />
              <F name="status" label="Status">
                <select id="edit-status" name="status" className="form-control" value={form.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                  <option value="suspended">Suspended</option>
                </select>
              </F>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h2 className="card-title">Address</h2></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-address">Street Address</label>
              <input id="edit-address" name="address" type="text" className="form-control" value={form.address} onChange={handleChange} />
            </div>
            <div className="form-grid-3">
              <F name="city" label="City" />
              <F name="state" label="State" />
              <F name="country" label="Country" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(`/students/${id}`)}>Cancel</button>
          <button type="submit" id="submit-edit-student" className="btn btn-primary btn-lg" disabled={loading}>
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStudent;
