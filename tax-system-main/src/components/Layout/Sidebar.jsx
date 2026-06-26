import React from 'react';
import { Nav, Button, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // لمعرفة الصفحة الحالية وتثبيت التنشيط
  const role = user?.role ?? '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // مساعد لتعريب المسمى الوظيفي للمستخدم الحالي في القائمة الجانبية
  const translateRole = (currentRole) => {
    const rolesMap = {
      'Admin': 'مدير النظام',
      'Manager': 'المدير العام',
      'Data Entry': 'مدخل بيانات',
      'Reviewer': 'المراجع المالي',
      'Finance': 'المسؤول المالي',
      'Committee': 'لجنة الطعون'
    };
    return rolesMap[currentRole] || currentRole;
  };

  // دالة لتحديد ما إذا كان الرابط الحالي نشطاً أم لا لإبقاء الخلفية والملء مستمراً
  const isActivePath = (path) => location.pathname === path;

  // تصميم موحد للروابط لضمان بقاء التنشيط وخلفية شفافة بيضاء أنيقة عند الاختيار الفعلي
  const linkStyle = (path) => ({
    color: 'white',
    marginBottom: '8px',
    backgroundColor: isActivePath(path) ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    borderRadius: '6px',
    padding: '10px 15px',
    transition: 'background-color 0.2s ease',
    cursor: 'pointer'
  });

  return (
    <div style={{ width: '280px', backgroundColor: '#004080', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* رأس القائمة الجانبية: تكبير الخط وزيادة الارتفاع ليتوافق مع الـ Navbar الجديد */}
      <div className="p-5 border-bottom border-white text-center">
        <h5 className="fw-bold mb-0 text-white fs-3">نظام الضرائب</h5>
        <small className="text-white" style={{ opacity: 1, fontSize: '0.8rem' }}>Tax Management System</small>
      </div>

      <div className="p-3" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="mb-3 text-center">
          <small className="text-uppercase text-white fw-bold mb-1 d-block">مستخدم حالي</small>
          <div className="fw-bold fs-5 text-white mb-1">{user ? user.name : 'Guest'}</div>
          <Badge bg="light" text="dark" className="px-2 py-1 fw-bold">
            {translateRole(role)}
          </Badge>
        </div>

        <Nav className="flex-column" variant="pills">
          {/* --- قوائم مدخل البيانات (Data Entry) --- */}
          {role === 'Data Entry' && (
            <>
              <Nav.Link onClick={() => navigate('/data-entry/home')} style={linkStyle('/data-entry/home')} active={isActivePath('/data-entry/home')}>
                <i className="fa-solid fa-gauge-high me-2"></i> الرئيسية
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/data-entry/add')} style={linkStyle('/data-entry/add')} active={isActivePath('/data-entry/add')}>
                <i className="fa-solid fa-building me-2"></i> إضافة عقار
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/data-entry/link')} style={linkStyle('/data-entry/link')} active={isActivePath('/data-entry/link')}>
                <i className="fa-solid fa-user-tie me-2"></i> ربط المالك
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/data-entry/appeal')} style={linkStyle('/data-entry/appeal')} active={isActivePath('/data-entry/appeal')}>
                <i className="fa-solid fa-file-contract me-2"></i> طعن ضريبي
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/data-entry/exemption')} style={linkStyle('/data-entry/exemption')} active={isActivePath('/data-entry/exemption')}>
                <i className="fa-solid fa-shield-halved me-2"></i> طلب إعفاء
              </Nav.Link>
            </>
          )}

          {/* --- قوائم المراجع (Reviewer) --- */}
          {role === 'Reviewer' && (
            <>
              <Nav.Link onClick={() => navigate('/reviewer/home')} style={linkStyle('/reviewer/home')} active={isActivePath('/reviewer/home')}>
                <i className="fa-solid fa-list-check me-2"></i> المهام اليومية
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/reviewer/calc')} style={linkStyle('/reviewer/calc')} active={isActivePath('/reviewer/calc')}>
                <i className="fa-solid fa-calculator me-2"></i> حساب الضرائب
              </Nav.Link>
            </>
          )}

          {/* --- قوائم المالية (Finance) --- */}
          {role === 'Finance' && (
            <>
              <Nav.Link onClick={() => navigate('/finance/home')} style={linkStyle('/finance/home')} active={isActivePath('/finance/home')}>
                <i className="fa-solid fa-coins me-2"></i> التحصيل والسداد
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/finance/collect')} style={linkStyle('/finance/collect')} active={isActivePath('/finance/collect')}>
                <i className="fa-solid fa-cash-register me-2"></i> تسجيل دفع جديد
              </Nav.Link>
            </>
          )}

          {/* --- قوائم المدير (Manager) --- */}
          {role === 'Manager' && (
            <>
              <Nav.Link onClick={() => navigate('/manager/home')} style={linkStyle('/manager/home')} active={isActivePath('/manager/home')}>
                <i className="fa-solid fa-chart-pie me-2"></i> الرئيسية
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/manager/verdict')} style={linkStyle('/manager/verdict')} active={isActivePath('/manager/verdict')}>
                <i className="fa-solid fa-stamp me-2"></i> الاعتمادات النهائية
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/manager/reports')} style={linkStyle('/manager/reports')} active={isActivePath('/manager/reports')}>
                <i className="fa-solid fa-file-pdf me-2"></i> التقارير المالية
              </Nav.Link>
            </>
          )}

          {/* --- قوائم اللجان (Committee) --- */}
          {role === 'Committee' && (
            <>
              <Nav.Link onClick={() => navigate('/committee/home')} style={linkStyle('/committee/home')} active={isActivePath('/committee/home')}>
                <i className="fa-solid fa-gavel me-2"></i> لجنة الطعون
              </Nav.Link>
            </>
          )}

          {/* --- قوائم الأدمن (Admin) --- */}
          {role === 'Admin' && (
            <>
              <Nav.Link onClick={() => navigate('/admin/home')} style={linkStyle('/admin/home')} active={isActivePath('/admin/home')}>
  <i className="fa-solid fa-gauge-high" style={{ marginLeft: '15px' }}></i> لوحة التحكم
</Nav.Link>
<Nav.Link onClick={() => navigate('/admin/users')} style={linkStyle('/admin/users')} active={isActivePath('/admin/users')}>
  <i className="fa-solid fa-users-gear" style={{ marginLeft: '15px' }}></i> إدارة المستخدمين
</Nav.Link>
<Nav.Link onClick={() => navigate('/admin/logs')} style={linkStyle('/admin/logs')} active={isActivePath('/admin/logs')}>
  <i className="fa-solid fa-list-ol" style={{ marginLeft: '15px' }}></i> سجلات المراقبة
</Nav.Link>
            </>
          )}
        </Nav>
      </div>

      {/* زر الخروج في الأسفل */}
      <div className="mt-auto p-3 border-top border-white">
        <Button variant="danger" className="w-100 fw-bold" onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket me-2"></i> تسجيل خروج
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;