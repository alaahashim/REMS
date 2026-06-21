import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const defaultNotifications = [
  {
    id: 1,
    text: 'تمت إضافة مستخدم جديد إلى النظام',
    time: 'منذ 5 دقائق',
    type: 'success'
  },
  {
    id: 2,
    text: 'يوجد طلبات معلقة تحتاج مراجعة',
    time: 'منذ ساعة',
    type: 'warning'
  },
  {
    id: 3,
    text: 'تم تحديث سياسة الإشعارات',
    time: 'منذ يوم',
    type: 'info'
  }
];

const TopNavbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(() => {
    const savedNotifications = JSON.parse(localStorage.getItem('tax_notifications') || 'null');
    if (Array.isArray(savedNotifications) && savedNotifications.length > 0) {
      return savedNotifications;
    }

    localStorage.setItem('tax_notifications', JSON.stringify(defaultNotifications));
    return defaultNotifications;
  });
  const { lang, toggleLanguage, translations } = useLanguage();

  const role = user?.role || 'Admin';
  const displayName = user?.name || user?.username || 'User';
  const profileImage = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

  const getHomePath = () => {
    switch (role) {
      case 'Data Entry':
        return '/data-entry/home';
      case 'Reviewer':
        return '/reviewer/home';
      case 'Finance':
        return '/finance/home';
      case 'Manager':
        return '/manager/home';
      case 'Committee':
        return '/committee/appeals';
      case 'Admin':
        return '/admin/home';
      default:
        return '/';
    }
  };

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
  const showSearch = role !== 'Data Entry';
  const notificationCount = notifications.length;
  const showBackButton =
    location.pathname !== '/' &&
    !location.pathname.includes('/login') &&
    !location.pathname.includes('/unauthorized');

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="top-bar bg-white shadow-sm py-3 px-4 d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center gap-2">
        {showBackButton && (
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            onClick={() => navigate(getHomePath())}
            title={translations[lang].back}
          >
            <i className={`fa-solid ${lang === 'ar' ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i>
            <span>{translations[lang].back}</span>
          </button>
        )}
        <h4 className="page-title m-0 fw-bold text-primary">{currentPageTitle}</h4>
      </div>

      <div className="d-flex align-items-center gap-2 gap-md-3">
        {showSearch && (
          <div className="search-container d-none d-md-block">
            <input
              type="text"
              className="form-control rounded-pill border-0 bg-light"
              placeholder={
                role === 'Finance'
                  ? translations[lang].searchByNationalId
                  : role === 'Manager'
                  ? translations[lang].searchByProperty
                  : translations[lang].searchPlaceholder
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              style={{ minWidth: '240px', padding: '10px 18px' }}
            />
          </div>
        )}

        <button
          className="btn d-flex align-items-center gap-1 text-primary"
          style={{
            backgroundColor: '#f0f8ff',
            borderRadius: '999px',
            padding: '10px 14px',
            fontWeight: 600
          }}
          onClick={toggleLanguage}
          title={translations[lang].language}
        >
          <i className="fa-solid fa-globe"></i>
          <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        <button
          className="btn p-2 text-primary"
          style={{
            backgroundColor: '#f0f8ff',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => navigate('/chatbot')}
          title={translations[lang].assistant}
        >
          <i className="fa-solid fa-robot fs-5"></i>
        </button>

        <button
          className="btn p-2 text-secondary position-relative"
          style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={translations[lang].notifications}
          onClick={() => navigate('/notifications')}
        >
          <i className="fa-solid fa-bell fs-5"></i>
          {notificationCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {notificationCount}
            </span>
          )}
        </button>

        <button
          className="btn p-2 text-secondary"
          style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={translations[lang].settings}
          onClick={() => navigate('/settings')}
        >
          <i className="fa-solid fa-gear fs-5"></i>
        </button>

        <button
          className="btn p-0 rounded-circle overflow-hidden border border-2 border-primary"
          style={{ width: '50px', height: '50px' }}
          title={translations[lang].profile}
          onClick={() => navigate('/profile')}
        >
          <img
            src={profileImage}
            alt="User"
            className="w-100 h-100 object-fit-cover"
          />
        </button>
      </div>
    </div>
  );
};

export default TopNavbar;
