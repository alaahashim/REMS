import React from 'react';
import { Nav, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const role = user?.role || '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ width: '280px', backgroundColor: '#004080', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* رأس القائمة الجانبية: تكبير الخط وزيادة الارتفاع ليتوافق مع الـ Navbar الجديد */}
      <div className="p-5 border-bottom border-white text-center">
        <h5 className="fw-bold mb-0 text-white fs-3">نظام الضرائب</h5>
        <small className="text-white" style={{opacity: 1, fontSize: '0.8rem'}}>{t('taxManagementSystem')}</small>
      </div>

      <div className="p-3" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="mb-3 text-center">
            <small className="text-uppercase text-white fw-bold mb-1">{t('currentUser')}</small>
            <div className="fw-bold fs-5 text-white">{user ? user.name : t('guest')}</div>
            <Badge bg="light" text="dark">{role}</Badge>
        </div>

        <Nav className="flex-column" variant="pills">
          {/* --- قوائم مدخل البيانات (Data Entry) --- */}
          {role === 'Data Entry' && (
            <>
                <Nav.Link onClick={() => navigate('/data-entry/home')} className="text-white mb-2">
                    <i className="fa-solid fa-gauge-high me-2"></i> {t('dashboard')}
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/data-entry/add')} className="text-white mb-2">
                    <i className="fa-solid fa-building me-2"></i> {t('addProperty')}
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/data-entry/link')} className="text-white mb-2">
                    <i className="fa-solid fa-user-tie me-2"></i> {t('linkOwner')}
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/data-entry/appeal')} className="text-white mb-2">
                    <i className="fa-solid fa-file-contract me-2"></i> {t('addAppeal')}
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/data-entry/exemption')} className="text-white mb-2">
                    <i className="fa-solid fa-shield-halved me-2"></i> {t('addExemption')}
                </Nav.Link>
            </>
          )}

          {/* --- قوائم المراجع (Reviewer) --- */}
          {role === 'Reviewer' && (
            <>
                <Nav.Link onClick={() => navigate('/reviewer/home')} className="text-white mb-2">
                    <i className="fa-solid fa-list-check me-2"></i> {t('dashboard')}
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/reviewer/calc')} className="text-white mb-2">
                    <i className="fa-solid fa-calculator me-2"></i> {t('calcTax')}
                </Nav.Link>
            </>
          )}

          {/* --- قوائم المالية (Finance) --- */}
          {role === 'Finance' && (
            <>
                <Nav.Link onClick={() => navigate('/finance/home')} className="text-white mb-2">
                    <i className="fa-solid fa-coins me-2"></i> {t('dashboard')}
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/finance/collect')} className="text-white mb-2">
                    <i className="fa-solid fa-cash-register me-2"></i> {t('collect')}
                </Nav.Link>
            </>
          )}

          {/* --- قوائم المدير (Manager) --- */}
          {role === 'Manager' && (
            <>
                <Nav.Link onClick={() => navigate('/manager/home')} className="text-white mb-2">
                    <i className="fa-solid fa-chart-pie me-2"></i> {t('dashboard')}
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/manager/verdict')} className="text-white mb-2">
                    <i className="fa-solid fa-stamp me-2"></i> {t('verdict')}
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/manager/reports')} className="text-white mb-2">
                    <i className="fa-solid fa-file-pdf me-2"></i> {t('reports')}
                </Nav.Link>
            </>
          )}

          {/* --- قوائم اللجان (Committee) --- */}
          {role === 'Committee' && (
             <>
                <Nav.Link onClick={() => navigate('/committee/appeals')} className="text-white mb-2">
                    <i className="fa-solid fa-scale-balanced me-2"></i> {t('addAppeal')}
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/committee/exemptions')} className="text-white mb-2">
                    <i className="fa-solid fa-shield-halved me-2"></i> {t('addExemption')}
                </Nav.Link>
             </>
          )}

          {/* --- قوائم الأدمن (Admin) --- */}
          {role === 'Admin' && (
            <>
                <Nav.Link onClick={() => navigate('/admin/home')} className="text-white mb-2">
                    <i className="fa-solid fa-gauge-high me-2"></i> {t('dashboard')}
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/admin/users')} className="text-white mb-2">
                    <i className="fa-solid fa-users-gear me-2"></i> {t('users')}
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/admin/logs')} className="text-white mb-2">
                    <i className="fa-solid fa-list-ol me-2"></i> {t('logs')}
                </Nav.Link>
            </>
          )}
        </Nav>
      </div>

      {/* زر الخروج في الأسفل */}
      <div className="mt-auto p-3 border-top border-white">
        <Button variant="danger" className="w-100 fw-bold" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket me-2"></i> {t('logout')}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
