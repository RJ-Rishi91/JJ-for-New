import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, seed } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('jj_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('jj_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await auth.me();
      localStorage.setItem('jj_user', JSON.stringify(data));
      setUser(data);
    } catch {
      localStorage.removeItem('jj_token');
      localStorage.removeItem('jj_user');
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    seed().catch(() => {});
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await auth.login({ email, password });
    localStorage.setItem('jj_token', data.token);
    localStorage.setItem('jj_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, city, school) => {
    const { data } = await auth.register({ name, email, password, city, school });
    localStorage.setItem('jj_token', data.token);
    localStorage.setItem('jj_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('jj_token');
    localStorage.removeItem('jj_user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await auth.me();
      localStorage.setItem('jj_user', JSON.stringify(data));
      setUser(data);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
