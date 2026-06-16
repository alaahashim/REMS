import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // 1. إذا لم يكن مسجل دخول، ارجعه لصفحة الدخول
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. إذا تم تحديد أدوار مسموحة (مثلاً: Admin فقط)
  // والمستخدم الحالي ليس من بينهم، أرسله لصفحة خطأ
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. كل شيء تمام، اعرض الصفحة المطلوبة
  return children;
};