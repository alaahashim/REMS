import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getCurrentProfile, loginUser } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('tax_current_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    getCurrentProfile()
      .then((profile) => {
        if (profile) setUser(profile);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const login = async (username, password) => {
    try {
      const result = await loginUser(username, password);
      setUser(result.user);
      return result;
    } catch (error) {
      return { success: false, message: error?.message || 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('tax_current_user');
    localStorage.removeItem('refreshToken');
  };

  const updateCurrentUser = useCallback((updates) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      const nextUser = {
        ...currentUser,
        ...updates,
        name: updates.name || currentUser.name || currentUser.username,
      };
      localStorage.setItem('tax_current_user', JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);