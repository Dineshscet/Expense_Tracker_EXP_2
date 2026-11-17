import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user_data');
      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Validate with server
          const res = await api.get('/auth/profile/');
          setUser(res.data);
          localStorage.setItem('user_data', JSON.stringify(res.data));
        } catch (err) {
          console.error("Token verification failed:", err);
          // Auto login as demo user Dinesh if available to make testing instant
          await autoLoginDemo();
        }
      } else {
        // Auto login demo user Dinesh on first launch so the user sees the dashboard immediately!
        await autoLoginDemo();
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const autoLoginDemo = async () => {
    try {
      const res = await api.post('/auth/login/', {
        username: 'dinesh',
        password: 'Password123!',
      });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user_data', JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch (e) {
      console.warn("Demo auto-login skipped:", e);
    }
  };

  const login = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    localStorage.setItem('user_data', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register/', userData);
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    localStorage.setItem('user_data', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile/', data);
    setUser(res.data);
    localStorage.setItem('user_data', JSON.stringify(res.data));
    return res.data;
  };

  const changePassword = async (data) => {
    const res = await api.post('/auth/change-password/', data);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        loginAsDemo: autoLoginDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

