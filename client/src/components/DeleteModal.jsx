import { AlertTriangle, X } from 'lucide-react';

const DeleteModal = ({ student, onConfirm, onCancel, loading }) => {
  if (!student) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(244,63,94,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertTriangle size={22} color="#f43f5e" />
          </div>
          <h2 className="modal-title" style={{ marginBottom: 0 }}>Delete Student</h2>
          <button
            className="btn-ghost btn-icon"
            onClick={onCancel}
            style={{ marginLeft: 'auto' }}
          >
            <X size={18} />
          </button>
        </div>

        <p className="modal-body">
          Are you sure you want to delete{' '}
          <strong style={{ color: 'var(--text-primary)' }}>
            {student.firstName} {student.lastName}
          </strong>{' '}
          ({student.studentId})? This action <strong style={{ color: '#f43f5e' }}>cannot be undone</strong>.
        </p>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete Student'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
