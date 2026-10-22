// src/context/AuthContext.jsx
import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { queryClient } from '../lib/queryClient';
import { AuthContext } from './authContextValue';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data);
        } catch (error) {
          // Only an invalid or expired session should log the user out, not a network
          // blip or a server restart
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
          }
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Cached API data belongs to whoever was signed in; drop it whenever that changes
  const startSession = (data) => {
    queryClient.clear();
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    startSession(response.data);
    return response.data;
  };

  const register = async (email, password, fullName) => {
    const response = await authAPI.register(email, password, fullName);
    startSession(response.data);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    queryClient.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
