import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../UI/NotificationDropdown';
import SettingsModal from '../UI/SettingsModal';

const TopNavbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);

  // دالة تحديد العنوان
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/home') || path === '/') return 'الرئيسية';
    if (path.includes('/add')) return 'إضافة عقار';
    if (path.includes('/link')) return 'ربط المالك';
    if (path.includes('/appeal')) return 'تسجيل طعون';
    if (path.includes('/exemption')) return 'تسجيل إعفاءات';
    if (path.includes('/calc')) return 'حساب وتقدير الضريبة';
    if (path.includes('/collect')) return 'تسجيل سداد';
    if (path.includes('/users')) return 'إدارة المستخدمين';
    if (path.includes('/logs')) return 'سجل النظام';
    if (path.includes('/verdict')) return 'قرارات اللجان';
    if (path.includes('/reports')) return 'التقارير الإدارية';
    return 'لوحة التحكم';
  };

  const currentPageTitle = getPageTitle();

  return (
    <div className="top-bar bg-white shadow-sm py-3 px-4 d-flex justify-content-between align-items-center">
      <h5 className="page-title m-0 fw-bold text-secondary">{currentPageTitle}</h5>
      
      <div className="d-flex align-items-center gap-3">
        
        {/* شريط البحث */}
        <div className="search-container position-relative d-none d-md-block">
          <input 
            type="text" 
            className="form-control rounded-pill" 
            placeholder="بحث برقم القومي..." 
            style={{ paddingRight: '35px', width: '250px' }}
          />
          <button className="btn btn-link position-absolute top-50 translate-middle-y end-0 text-secondary p-0 pe-2">
            <i className="fa-solid fa-search"></i>
          </button>
        </div>
        
        {/* الإشعارات */}
        <NotificationDropdown />

        {/* الإعدادات */}
        <button 
            className="btn p-2 text-secondary hover-text-primary border-0 bg-transparent"
            title="الإعدادات"
            onClick={() => setShowSettings(true)}
        >
            <i className="fa-solid fa-gear fs-5"></i>
        </button>
        
        {/* صورة المستخدم */}
        <div className="rounded-circle overflow-hidden border border-2 border-primary" style={{width: '40px', height: '40px'}}>
           <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} alt="User" className="w-100 h-100 object-fit-cover" />
        </div>
      </div>

      {/* نافذة الإعدادات */}
      <SettingsModal show={showSettings} handleClose={() => setShowSettings(false)} />
    </div>
  );
};

export default TopNavbar;