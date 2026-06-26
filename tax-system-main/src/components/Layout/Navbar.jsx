import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const defaultNotifications = [
  { id: 1, text: 'تمت إضافة مستخدم جديد إلى النظام', time: 'منذ 5 دقائق', type: 'success' },
  { id: 2, text: 'يوجد طلبات معلقة تحتاج مراجعة', time: 'منذ ساعة', type: 'warning' },
  { id: 3, text: 'تم تحديث سياسة الإشعارات', time: 'منذ يوم', type: 'info' }
];

const TopNavbar = ({ onToggleSidebar }) => { // ✅ استقبل البروبس ده
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(() => {
    const savedNotifications = JSON.parse(localStorage.getItem('tax_notifications') || 'null');
    if (Array.isArray(savedNotifications) && savedNotifications.length > 0) return savedNotifications;
    localStorage.setItem('tax_notifications', JSON.stringify(defaultNotifications));
    return defaultNotifications;
  });
  const { lang, toggleLanguage, translations } = useLanguage();

  const role = user?.role || 'Admin';
  const displayName = user?.name || user?.username || 'User';
  const profileImage = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/profile') return translations[lang].profile;
    if (path === '/notifications') return translations[lang].notifications;
    if (path === '/settings') return translations[lang].settings;
    if (path.includes('/home') || path === '/') return translations[lang].dashboard;
    if (path.includes('/add')) return translations[lang].addProperty;
    if (path.includes('/link')) return translations[lang].linkOwner;
    if (path.includes('/appeal')) return translations[lang].addAppeal;
    if (path.includes('/exemption')) return translations[lang].addExemption;
    if (path.includes('/calc')) return translations[lang].calcTax;
    if (path.includes('/collect')) return translations[lang].collect;
    if (path.includes('/users')) return translations[lang].users;
    if (path.includes('/logs')) return translations[lang].logs;
    if (path.includes('/verdict')) return translations[lang].verdict;
    if (path.includes('/reports')) return translations[lang].reports;
    return translations[lang].mainSystem;
  };

  const currentPageTitle = getPageTitle();
  const showSearch = role !== 'Data Entry' && role !== 'Finance'; 
  const showBackButton = false; 
  const notificationCount = notifications.length;

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="top-bar bg-white shadow-sm py-2 py-md-3 px-3 px-md-4 d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center gap-2">
        {/* ✅ زر القائمة (يظهر فقط على الموبايل) */}
        <button
          className="btn btn-sm text-primary d-md-none border-0 p-1"
          onClick={onToggleSidebar}
          style={{ fontSize: '1.5rem' }}
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        {showBackButton && (
          <button className="btn btn-outline-secondary btn-sm d-none d-md-flex align-items-center gap-1" onClick={() => navigate('/')} title={translations[lang].back}>
            <i className={`fa-solid ${lang === 'ar' ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i>
            <span>{translations[lang].back}</span>
          </button>
        )}
        
        {/* ✅ تصغير الخط وعمل Truncate على الموبايل */}
        <h4 className="page-title m-0 fw-bold text-primary text-truncate" style={{ fontSize: window.innerWidth < 768 ? '1rem' : '1.5rem' }}>
          {currentPageTitle}
        </h4>
      </div>

      <div className="d-flex align-items-center gap-1 gap-md-3">
        {showSearch && (
          <div className="search-container d-none d-md-block">
            <input
              type="text"
              className="form-control rounded-pill border-0 bg-light"
              placeholder={role === 'Finance' ? translations[lang].searchByNationalId : role === 'Manager' ? translations[lang].searchByProperty : translations[lang].searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              style={{ minWidth: '200px', padding: '8px 15px' }}
            />
          </div>
        )}

        {/* ✅ إخفاء كلمة العربية/English على الموبايل وبقاء الأيقونة */}
        <button
          className="btn d-flex align-items-center justify-content-center text-primary p-1 p-md-2"
          style={{ backgroundColor: '#f0f8ff', borderRadius: '999px', minWidth: window.innerWidth < 768 ? '38px' : 'auto', height: '38px' }}
          onClick={toggleLanguage}
          title={translations[lang].language}
        >
          <i className="fa-solid fa-globe"></i>
          <span className="d-none d-md-inline ms-1" style={{fontWeight: 600}}>{lang === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        <button className="btn p-1 p-md-2 text-primary d-none d-sm-block" style={{ backgroundColor: '#f0f8ff', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => navigate('/chatbot')} title={translations[lang].assistant}>
          <i className="fa-solid fa-robot fs-5"></i>
        </button>

        <button className="btn p-1 p-md-2 text-secondary position-relative" style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={translations[lang].notifications} onClick={() => navigate('/notifications')}>
          <i className="fa-solid fa-bell fs-5"></i>
          {notificationCount > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.6rem'}}>{notificationCount}</span>}
        </button>

        <button className="btn p-1 p-md-2 text-secondary d-none d-sm-block" style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={translations[lang].settings} onClick={() => navigate('/settings')}>
          <i className="fa-solid fa-gear fs-5"></i>
        </button>

        {/* ✅ تصغير الصورة الشخصية شوية على الموبايل */}
        <button className="btn p-0 rounded-circle overflow-hidden border border-2 border-primary" style={{ width: window.innerWidth < 768 ? '35px' : '45px', height: window.innerWidth < 768 ? '35px' : '45px' }} title={translations[lang].profile} onClick={() => navigate('/profile')}>
          <img src={profileImage} alt="User" className="w-100 h-100 object-fit-cover" />
        </button>
      </div>
    </div>
  );
};

export default TopNavbar;