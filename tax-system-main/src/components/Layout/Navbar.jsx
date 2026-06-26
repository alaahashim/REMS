import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const TopNavbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, toggleLanguage, translations } = useLanguage();

  const getPageTitle = () => {
    const path = location.pathname;
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

  const notificationCount = user?.role === 'Finance' ? 2 : (user?.role === 'Manager' ? 5 : 0);

  return (
    <div className="top-bar bg-white shadow-sm py-5 px-4 d-flex justify-content-between align-items-center">
      <h4 className="page-title m-0 fw-bold text-primary">{getPageTitle()}</h4>

      <div className="d-flex align-items-center gap-3">
        <button
          className="btn p-2 text-primary"
          style={{ backgroundColor: '#f0f8ff', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={toggleLanguage}
          title="تغيير اللغة"
        >
          <i className="fa-solid fa-globe fs-5"></i>
          <span style={{ fontSize: '0.7rem', fontWeight: 'bold', marginLeft: '4px' }}>{lang === 'ar' ? 'EN' : 'AR'}</span>
        </button>

        <button
          className="btn p-2 text-primary"
          style={{ backgroundColor: '#f0f8ff', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => navigate('/chatbot')}
          title="المساعد الذكي"
        >
          <i className="fa-solid fa-robot fs-5"></i>
        </button>

        <button className="btn p-2 text-secondary position-relative" style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="الإشعارات">
          <i className="fa-solid fa-bell fs-5"></i>
          {notificationCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
              {notificationCount}
            </span>
          )}
        </button>

        <button className="btn p-2 text-secondary" style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="الإعدادات">
          <i className="fa-solid fa-gear fs-5"></i>
        </button>

        <div className="rounded-circle overflow-hidden border border-2 border-primary" style={{ width: '50px', height: '50px' }}>
          <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} alt="User" className="w-100 h-100 object-fit-cover" />
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
