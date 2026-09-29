import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard, Users, UserPlus, LogOut, Menu, X,
  GraduationCap, User2
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/students', icon: Users, label: 'Students' },
  { to: '/students/add', icon: UserPlus, label: 'Add Student' },
  { to: '/profile', icon: User2, label: 'My Profile' },
];

const Sidebar = ({ open, onClose }) => {
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
    <>
      <div className={`sidebar-overlay ${open ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <GraduationCap size={18} color="white" />
          </div>
          <span className="sidebar-logo-text">EduAdmin</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon"><Icon size={18} /></span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{admin?.name || 'Admin'}</div>
              <div className="sidebar-user-role">{admin?.role || 'admin'}</div>
            </div>
          </div>
          <button className="nav-item w-full" style={{ color: '#f87171' }} onClick={handleLogout}>
            <span className="nav-icon"><LogOut size={18} /></span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
