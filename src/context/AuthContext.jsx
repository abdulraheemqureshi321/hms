import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('hms_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.user);
        } catch (err) {
          console.error('Session restore failed:', err);
          localStorage.removeItem('hms_token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('hms_token', res.token);
    setUser(res);
    return res;
  };

  const registerGuest = async (guestData) => {
    const res = await api.post('/auth/register-guest', guestData);
    localStorage.setItem('hms_token', res.token);
    setUser(res);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('hms_token');
    setUser(null);
  };

  const hasPermission = (moduleName, action = 'view') => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    if (user.role === 'Guest' && moduleName === 'guest_portal') return true;
    
    const mod = user.permissions?.find(p => p.module === moduleName);
    return mod ? mod.actions.includes(action) : false;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, registerGuest, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
