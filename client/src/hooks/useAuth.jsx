import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/studentService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedAdmin = localStorage.getItem('admin');
    if (token && storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch {
        localStorage.removeItem('admin');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const { token, admin } = res.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('admin', JSON.stringify(admin));
    setAdmin(admin);
    return res.data;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    const { token, admin } = res.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('admin', JSON.stringify(admin));
    setAdmin(admin);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
