import React, { createContext, useState, useEffect, useContext } from 'react';

// إنشاء الـ Context
export const AuthContext = createContext();

// المستخدم الافتراضي
const DEFAULT_ADMIN = { username: 'admin', password: 'admin', role: 'Admin' };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);

  // 1. جلب المستخدمين من LocalStorage
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('tax_users')) || [];
    const allUsers = [DEFAULT_ADMIN, ...storedUsers];
    setUsersList(allUsers);
  }, []);

  // 2. دالة تسجيل الدخول
  const login = (username, password) => {
    const foundUser = usersList.find(u => u.username === username && u.password === password);

    if (foundUser) {
      setUser({ 
        username: foundUser.username, 
        role: foundUser.role,
        id: foundUser.id,
        name: foundUser.name
      });
      return { success: true, user: foundUser };
    } else {
      return { success: false, message: 'بيانات الدخول غير صحيحة' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- هذا الجزء هو المهم وهو كان ناقص في الكود السابق ---
export const useAuth = () => {
  return useContext(AuthContext);
};