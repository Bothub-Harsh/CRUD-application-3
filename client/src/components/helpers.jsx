export const getStatusBadge = (status) => {
  const map = {
    active:    'badge-success',
    inactive:  'badge-gray',
    graduated: 'badge-info',
    suspended: 'badge-danger',
  };
  return map[status] || 'badge-gray';
};

export const getGenderLabel = (g) => {
  const map = { male: 'Male', female: 'Female', other: 'Other', prefer_not_to_say: 'Prefer not to say' };
  return map[g] || g || '—';
};

export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const AvatarFallback = ({ name, size = 'md', imageUrl }) => {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  if (imageUrl) {
    return <img src={imageUrl} alt={name} className={`avatar avatar-${size}`} />;
  }

  return (
    <div className={`avatar avatar-${size}`}>
      {initials}
    </div>
  );
};

export const StatusBadge = ({ status }) => (
  <span className={`badge ${getStatusBadge(status)}`}>{status}</span>
);
