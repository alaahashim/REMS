import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

// ─── ثوابت ───────────────────────────────────────────────────────────────────
const defaultNotifications = [
  { id: 1, text: 'تمت إضافة مستخدم جديد إلى النظام', time: 'منذ 5 دقائق', type: 'success' },
  { id: 2, text: 'يوجد طلبات معلقة تحتاج مراجعة',    time: 'منذ ساعة',    type: 'warning' },
  { id: 3, text: 'تم تحديث سياسة الإشعارات',           time: 'منذ يوم',     type: 'info'    },
];

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────
const TopNavbar = ({ onToggleSidebar }) => {
  const { user }                       = useAuth();
  const location                       = useLocation();
  const navigate                       = useNavigate();
  const { lang, toggleLanguage }      = useLanguage();

  const role         = user?.role || 'Admin';
  const displayName  = user?.name || user?.username || 'User';
  const profileImage = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

  // عدد الإشعارات حسب الدور
  const notificationCount =
    role === 'Finance' ? 2 :
    role === 'Manager' ? 5 :
    defaultNotifications.length;

  // ─── عنوان الصفحة ────────────────────────────────────────────────────────
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/profile')           return 'الملف الشخصي';
    if (path === '/notifications')     return 'الإشعارات';
    if (path === '/settings')          return 'الإعدادات';
    if (path.includes('/home') || path === '/') return 'الرئيسية';
    if (path.includes('/add'))         return 'إضافة عقار';
    if (path.includes('/link'))        return 'ربط المالك';
    if (path.includes('/appeal'))      return 'تسجيل طعن';
    if (path.includes('/exemption'))   return 'تسجيل إعفاءات';
    if (path.includes('/calc'))        return 'حساب وتقدير الضريبة';
    if (path.includes('/collect'))     return 'تسجيل سداد';
    if (path.includes('/users'))       return 'إدارة المستخدمين';
    if (path.includes('/logs'))        return 'سجل النظام';
    if (path.includes('/verdict'))     return 'قرارات اللجان';
    if (path.includes('/reports'))     return 'التقارير الإدارية';
    return 'نظام الضرائب العقارية';
  };
  
  const currentPageTitle = getPageTitle();

  const showBackButton =
    location.pathname !== '/' &&
    !location.pathname.endsWith('/home');

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="top-bar bg-white shadow-sm py-2 py-md-3 px-3 px-md-4 d-flex justify-content-between align-items-center">

      {/* ── جانب العنوان ── */}
      <div className="d-flex align-items-center gap-2">
        {/* زر القائمة — يظهر على الموبايل فقط */}
        <button
          className="btn btn-sm text-primary d-md-none border-0 p-1"
          onClick={onToggleSidebar}
          style={{ fontSize: '1.5rem' }}
        >
          <i className="fa-solid fa-bars" />
        </button>

        {showBackButton && (
          <button className="btn btn-outline-secondary btn-sm d-none d-md-flex align-items-center gap-1" onClick={() => navigate('/')} title="رجوع">
            <i className={`fa-solid ${lang === 'ar' ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i>
            <span>رجوع</span>
          </button>
        )}
        
        <h4 className="page-title m-0 fw-bold text-primary text-truncate">
          {currentPageTitle}
        </h4>
      </div>

      {/* ── جانب الأدوات ── */}
      <div className="d-flex align-items-center gap-1 gap-md-3">

        <button
          className="btn d-flex align-items-center justify-content-center text-primary p-1 p-md-2 lang-toggle-btn"
          onClick={toggleLanguage}
          title="اللغة"
          style={{ gap: '4px' }}
        >
          <i className="fa-solid fa-language fs-5"></i>
          {/* لا يتم ترجمة هذه الجملة أوتوماتيكياً لأنها تعتمد على منطق عكسي */}
          <span className="fw-bold" style={{ fontSize: '0.85rem' }}>
            {lang === 'ar' ? 'English' : 'العربية'}
          </span>
        </button>

        <button className="btn p-1 p-md-2 text-primary d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f0f8ff', borderRadius: '50%', width: '38px', height: '38px' }} onClick={() => navigate('/chatbot')} title="المساعد الذكي">
          <i className="fa-solid fa-robot fs-5"></i>
        </button>

        <button className="btn p-1 p-md-2 text-secondary position-relative d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }} title="الإشعارات" onClick={() => navigate('/notifications')}>
          <i className="fa-solid fa-bell fs-5"></i>
          {notificationCount > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.6rem'}}>{notificationCount}</span>}
        </button>

        <button className="btn p-1 p-md-2 text-secondary d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }} title="الإعدادات" onClick={() => navigate('/settings')}>
          <i className="fa-solid fa-gear fs-5"></i>
        </button>

        <button className="btn p-0 rounded-circle overflow-hidden border border-2 border-primary profile-avatar-btn" title="الملف الشخصي" onClick={() => navigate('/profile')}>
          <img src={profileImage} alt="User" className="w-100 h-100 object-fit-cover" />
        </button>
      </div>
    </div>
  );
};

export default TopNavbar;