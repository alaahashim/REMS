import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

const DEFAULT_ADMIN = {
  id: 'admin-1',
  username: 'admin',
  password: 'admin',
  role: 'Admin',
  name: 'Administrator',
  email: 'admin@tax-system.com',
  phone: '01000000000'
};

const getStoredAdmin = () => {
  const stored = localStorage.getItem('tax_admin_profile');
  return stored ? JSON.parse(stored) : DEFAULT_ADMIN;
};

const getAllUsers = () => {
  const storedUsers = JSON.parse(localStorage.getItem('tax_users')) || [];
  const admin = getStoredAdmin();
  return [admin, ...storedUsers.filter((u) => u.username !== admin.username)];
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('tax_current_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    const allUsers = getAllUsers();
    setUsersList(allUsers);
  }, []);

  const login = (username, password) => {
    const allUsers = getAllUsers();
    const foundUser = allUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      const loggedUser = {
        ...foundUser,
        name: foundUser.name || foundUser.username
      };
      setUser(loggedUser);
      localStorage.setItem('tax_current_user', JSON.stringify(loggedUser));
      localStorage.setItem('token', 'mock-access-token-' + Date.now());
      localStorage.setItem('refreshToken', 'mock-refresh-token-' + Date.now());
      return { success: true, user: loggedUser };
    }

    return { success: false, message: 'بيانات الدخول غير صحيحة' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tax_current_user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  const updateCurrentUser = (updates) => {
    if (!user) return;

    const nextUser = {
      ...user,
      ...updates,
      name: updates.name || user.name || user.username
    };

    setUser(nextUser);
    localStorage.setItem('tax_current_user', JSON.stringify(nextUser));

    const storedUsers = JSON.parse(localStorage.getItem('tax_users')) || [];
    const isAdmin = nextUser.role === 'Admin' || nextUser.id === 'admin-1';

    if (isAdmin) {
      localStorage.setItem('tax_admin_profile', JSON.stringify(nextUser));
    } else {
      const updatedStoredUsers = storedUsers.map((u) =>
        u.id === nextUser.id ? nextUser : u
      );
      localStorage.setItem('tax_users', JSON.stringify(updatedStoredUsers));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);