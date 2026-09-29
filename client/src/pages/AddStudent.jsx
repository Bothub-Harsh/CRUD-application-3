import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../services/studentService';
import { toast } from 'react-toastify';
import { ChevronLeft, Save } from 'lucide-react';

const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Business Administration', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];
const COURSES = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'BBA', 'MBA', 'B.Sc', 'M.Sc', 'B.Com', 'B.A'];

const initialForm = {
  firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '',
  gender: '', studentId: '', course: '', department: '', year: '',
  address: '', city: '', state: '', country: 'India',
  enrollmentDate: new Date().toISOString().split('T')[0],
  status: 'active', profileImage: ''
};

const AddStudent = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(form.email)) e.email = 'Invalid email format';
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
      const payload = { ...form, year: parseInt(form.year) };
      await studentService.create(payload);
      toast.success('Student created successfully! 🎓');
      navigate('/students');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create student.';
      toast.error(msg);
      if (err.response?.data?.errors) {
        const serverErrors = {};
        err.response.data.errors.forEach(e => { serverErrors[e.field] = e.message; });
        setErrors(serverErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ name, label, required, type = 'text', children, col }) => (
    <div className="form-group" style={col ? { gridColumn: `span ${col}` } : {}}>
      <label className="form-label" htmlFor={`add-${name}`}>
        {label}{required && <span className="required">*</span>}
      </label>
      {children || (
        <input
          id={`add-${name}`} name={name} type={type}
          className={`form-control ${errors[name] ? 'error' : ''}`}
          value={form[name]} onChange={handleChange}
        />
      )}
      {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
  );

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <button className="back-btn" onClick={() => navigate('/students')}>
        <ChevronLeft size={18} /> Back to Students
      </button>

      <div className="page-header">
        <div className="page-header-title">
          <h1>Add New Student</h1>
          <p>Fill in the student information below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><h2 className="card-title">Personal Information</h2></div>
          <div className="card-body">
            <div className="form-grid">
              <Field name="firstName" label="First Name" required />
              <Field name="lastName" label="Last Name" required />
              <Field name="email" label="Email Address" required type="email" />
              <Field name="phone" label="Phone Number" type="tel" />
              <Field name="dateOfBirth" label="Date of Birth" type="date" />
              <Field name="gender" label="Gender">
                <select id="add-gender" name="gender" className={`form-control ${errors.gender ? 'error' : ''}`} value={form.gender} onChange={handleChange}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </Field>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="add-profileImage">Profile Image URL</label>
              <input id="add-profileImage" name="profileImage" type="url" className="form-control"
                placeholder="https://example.com/image.jpg" value={form.profileImage} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><h2 className="card-title">Academic Information</h2></div>
          <div className="card-body">
            <div className="form-grid">
              <Field name="studentId" label="Student ID" required>
                <input id="add-studentId" name="studentId" type="text"
                  className={`form-control ${errors.studentId ? 'error' : ''}`}
                  placeholder="e.g. STU2024001" value={form.studentId} onChange={handleChange}
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace' }} />
              </Field>
              <Field name="course" label="Course" required>
                <select id="add-course" name="course" className={`form-control ${errors.course ? 'error' : ''}`} value={form.course} onChange={handleChange}>
                  <option value="">Select course</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field name="department" label="Department" required>
                <select id="add-department" name="department" className={`form-control ${errors.department ? 'error' : ''}`} value={form.department} onChange={handleChange}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field name="year" label="Year" required>
                <select id="add-year" name="year" className={`form-control ${errors.year ? 'error' : ''}`} value={form.year} onChange={handleChange}>
                  <option value="">Select year</option>
                  {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </Field>
              <Field name="enrollmentDate" label="Enrollment Date" type="date" />
              <Field name="status" label="Status">
                <select id="add-status" name="status" className="form-control" value={form.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                  <option value="suspended">Suspended</option>
                </select>
              </Field>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h2 className="card-title">Address</h2></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label" htmlFor="add-address">Street Address</label>
              <input id="add-address" name="address" type="text" className="form-control" value={form.address} onChange={handleChange} />
            </div>
            <div className="form-grid-3">
              <Field name="city" label="City" />
              <Field name="state" label="State" />
              <Field name="country" label="Country" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/students')}>Cancel</button>
          <button type="submit" id="submit-add-student" className="btn btn-primary btn-lg" disabled={loading}>
            <Save size={18} />
            {loading ? 'Creating...' : 'Create Student'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;
