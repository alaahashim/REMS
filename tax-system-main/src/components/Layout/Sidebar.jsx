import React from 'react';
import { Nav, Button, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

// ─── ثوابت ───────────────────────────────────────────────────────────────────
const ROLES_MAP = {
  'Admin':      'مدير النظام',
  'Manager':    'المدير العام',
  'Data Entry': 'مدخل بيانات',
  'Reviewer':   'المراجع المالي',
  'Finance':    'المسؤول المالي',
  'Committee':  'لجنة الطعون',
};

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────
const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { lang, translations } = useLanguage();
  const navigate  = useNavigate();
  const location  = useLocation();

  const role = user?.role ?? '';

  const translateRole = (currentRole) => ROLES_MAP[currentRole] || currentRole;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // الانتقال للصفحة وإغلاق السايدبار على الموبايل
  const handleNavigate = (path) => {
    navigate(path);
    onClose?.();
  };

  // تحديد الرابط النشط لإبقاء التمييز البصري
  const isActivePath = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    color:           'white',
    marginBottom:    '8px',
    backgroundColor: isActivePath(path) ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    borderRadius:    '6px',
    padding:         '10px 15px',
    transition:      'background-color 0.2s ease',
    cursor:          'pointer',
  });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* خلفية معتمة — تظهر على الموبايل فقط عند فتح السايدبار */}
      <div
        className="sidebar-backdrop"
        onClick={onClose}
        style={{ display: isOpen ? 'block' : 'none' }}
      />

      <div className={`sidebar ${isOpen ? 'is-open' : ''}`} style={{ width: '280px', backgroundColor: '#004080', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* ── رأس القائمة ── */}
        <div className="p-5 border-bottom border-white text-center">
          <h5 className="fw-bold mb-0 text-white fs-3">نظام الضرائب</h5>
          <small className="text-white" style={{ opacity: 1, fontSize: '0.8rem' }}>Tax Management System</small>
        </div>

        {/* ── بيانات المستخدم + الروابط ── */}
        <div className="p-3" style={{ flex: 1, overflowY: 'auto' }}>
          <div className="mb-3 text-center">
            <small className="text-uppercase text-white fw-bold mb-1 d-block">مستخدم حالي</small>
            <div className="fw-bold fs-5 text-white text-truncate mb-1">
              {user ? user.name : 'Guest'}
            </div>
            <Badge bg="light" text="dark" className="px-2 py-1 fw-bold">
              {translateRole(role)}
            </Badge>
          </div>

          <Nav className="flex-column" variant="pills">

            {/* ── مدخل البيانات ── */}
            {role === 'Data Entry' && (
              <>
                <Nav.Link onClick={() => handleNavigate('/data-entry/home')}      style={linkStyle('/data-entry/home')}      active={isActivePath('/data-entry/home')}>
                  <i className="fa-solid fa-gauge-high me-2" /> الرئيسية
                </Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/data-entry/add')}       style={linkStyle('/data-entry/add')}       active={isActivePath('/data-entry/add')}>
                  <i className="fa-solid fa-building me-2" /> إضافة عقار
                </Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/data-entry/link')}      style={linkStyle('/data-entry/link')}      active={isActivePath('/data-entry/link')}>
                  <i className="fa-solid fa-user-tie me-2" /> ربط المالك
                </Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/data-entry/appeal')}    style={linkStyle('/data-entry/appeal')}    active={isActivePath('/data-entry/appeal')}>
                  <i className="fa-solid fa-file-contract me-2" /> طعن ضريبي
                </Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/data-entry/exemption')} style={linkStyle('/data-entry/exemption')} active={isActivePath('/data-entry/exemption')}>
                  <i className="fa-solid fa-shield-halved me-2" /> طلب إعفاء
                </Nav.Link>
              </>
            )}

            {/* ── المراجع ── */}
            {role === 'Reviewer' && (
              <>
                <Nav.Link onClick={() => handleNavigate('/reviewer/home')} style={linkStyle('/reviewer/home')} active={isActivePath('/reviewer/home')}>
                  <i className="fa-solid fa-list-check me-2" /> المهام اليومية
                </Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/reviewer/calc')} style={linkStyle('/reviewer/calc')} active={isActivePath('/reviewer/calc')}>
                  <i className="fa-solid fa-calculator me-2" /> حساب الضرائب
                </Nav.Link>
              </>
            )}

            {/* ── المالية ── */}
            {role === 'Finance' && (
              <>
                <Nav.Link onClick={() => handleNavigate('/finance/home')}    style={linkStyle('/finance/home')}    active={isActivePath('/finance/home')}>
                  <i className="fa-solid fa-coins me-2" /> التحصيل والسداد
                </Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/finance/collect')} style={linkStyle('/finance/collect')} active={isActivePath('/finance/collect')}>
                  <i className="fa-solid fa-cash-register me-2" /> تسجيل دفع جديد
                </Nav.Link>
              </>
            )}

            {/* ── المدير ── */}
            {role === 'Manager' && (
              <>
                <Nav.Link onClick={() => handleNavigate('/manager/home')}    style={linkStyle('/manager/home')}    active={isActivePath('/manager/home')}>
                  <i className="fa-solid fa-chart-pie me-2" /> الرئيسية
                </Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/manager/verdict')} style={linkStyle('/manager/verdict')} active={isActivePath('/manager/verdict')}>
                  <i className="fa-solid fa-stamp me-2" /> الاعتمادات النهائية
                </Nav.Link>
                
              </>
            )}

            {/* ── لجنة الطعون ── */}
           {/* ── لجنة الطعون والإعفاءات ── */}
{role === 'Committee' && (
  <>
    <Nav.Link
      onClick={() => handleNavigate('/committee/appeals')}
      style={linkStyle('/committee/appeals')}
      active={isActivePath('/committee/appeals')}
    >
      <i className="fa-solid fa-gavel me-2" />
      لجنة الطعون
    </Nav.Link>

    <Nav.Link
      onClick={() => handleNavigate('/committee/exemptions')}
      style={linkStyle('/committee/exemptions')}
      active={isActivePath('/committee/exemptions')}
    >
      <i className="fa-solid fa-shield-halved me-2" />
      لجنة الإعفاءات
    </Nav.Link>
  </>
)}

            {/* ── الأدمن ── */}
            {role === 'Admin' && (
              <>
                <Nav.Link onClick={() => handleNavigate('/admin/home')}  style={linkStyle('/admin/home')}  active={isActivePath('/admin/home')}>
                  <i className="fa-solid fa-gauge-high" style={{ marginLeft: '15px' }} /> لوحة التحكم
                </Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/admin/users')} style={linkStyle('/admin/users')} active={isActivePath('/admin/users')}>
                  <i className="fa-solid fa-users-gear" style={{ marginLeft: '15px' }} /> إدارة المستخدمين
                </Nav.Link>
                <Nav.Link onClick={() => handleNavigate('/admin/logs')}  style={linkStyle('/admin/logs')}  active={isActivePath('/admin/logs')}>
                  <i className="fa-solid fa-list-ol" style={{ marginLeft: '15px' }} /> سجلات المراقبة
                </Nav.Link>
              </>
            )}

          </Nav>
        </div>

        {/* ── زر الخروج ── */}
        <div className="mt-auto p-3 border-top border-white">
          <Button variant="danger" className="w-100 fw-bold" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket me-2" /> تسجيل خروج
          </Button>
        </div>

      </div>
    </>
  );
};

export default Sidebar;