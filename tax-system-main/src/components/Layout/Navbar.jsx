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
  const { lang, toggleLanguage, translations } = useLanguage();

  const role         = user?.role || 'Admin';
  const displayName  = user?.name || user?.username || 'User';
  const profileImage = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

  // عدد الإشعارات حسب الدور (منطق mariam-updates)
  const notificationCount =
    role === 'Finance' ? 2 :
    role === 'Manager' ? 5 :
    defaultNotifications.length;

  // ─── عنوان الصفحة ────────────────────────────────────────────────────────
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/profile')           return translations[lang].profile;
    if (path === '/notifications')     return translations[lang].notifications;
    if (path === '/settings')          return translations[lang].settings;
    if (path.includes('/home') || path === '/') return translations[lang].dashboard;
    if (path.includes('/add'))         return translations[lang].addProperty;
    if (path.includes('/link'))        return translations[lang].linkOwner;
    if (path.includes('/appeal'))      return translations[lang].addAppeal;
    if (path.includes('/exemption'))   return translations[lang].addExemption;
    if (path.includes('/calc'))        return translations[lang].calcTax;
    if (path.includes('/collect'))     return translations[lang].collect;
    if (path.includes('/users'))       return translations[lang].users;
    if (path.includes('/logs'))        return translations[lang].logs;
    if (path.includes('/verdict'))     return translations[lang].verdict;
    if (path.includes('/reports'))     return translations[lang].reports;
    return translations[lang].mainSystem;
  };

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
          <button className="btn btn-outline-secondary btn-sm d-none d-md-flex align-items-center gap-1" onClick={() => navigate('/')} title={translations[lang].back}>
            <i className={`fa-solid ${lang === 'ar' ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i>
            <span>{translations[lang].back}</span>
          </button>
        )}
        
        {/* ✅ تصغير الخط وعمل Truncate على الموبايل */}
        <h4 className="page-title m-0 fw-bold text-primary text-truncate">
          {currentPageTitle}
        </h4>
      </div>

      {/* ── جانب الأدوات ── */}
      <div className="d-flex align-items-center gap-1 gap-md-3">

        <button
          className="btn d-flex align-items-center justify-content-center text-primary p-1 p-md-2 lang-toggle-btn"
          onClick={toggleLanguage}
          title={translations[lang].language}
          style={{ gap: '4px' }}
        >
          <i className="fa-solid fa-language fs-5"></i>
          <span className="fw-bold" style={{ fontSize: '0.85rem' }}>
            {lang === 'ar' ? 'English' : 'العربية'}
          </span>
        </button>

        <button className="btn p-1 p-md-2 text-primary d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f0f8ff', borderRadius: '50%', width: '38px', height: '38px' }} onClick={() => navigate('/chatbot')} title={translations[lang].assistant}>
          <i className="fa-solid fa-robot fs-5"></i>
        </button>

        <button className="btn p-1 p-md-2 text-secondary position-relative d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }} title={translations[lang].notifications} onClick={() => navigate('/notifications')}>
          <i className="fa-solid fa-bell fs-5"></i>
          {notificationCount > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.6rem'}}>{notificationCount}</span>}
        </button>

        <button className="btn p-1 p-md-2 text-secondary d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }} title={translations[lang].settings} onClick={() => navigate('/settings')}>
          <i className="fa-solid fa-gear fs-5"></i>
        </button>

        {/* ✅ تصغير الصورة الشخصية شوية على الموبايل */}
        <button className="btn p-0 rounded-circle overflow-hidden border border-2 border-primary profile-avatar-btn" title={translations[lang].profile} onClick={() => navigate('/profile')}>
          <img src={profileImage} alt="User" className="w-100 h-100 object-fit-cover" />
        </button>
      </div>
    </div>
  );
};

export default TopNavbar;