import React, { useState, useEffect } from 'react';
import { Nav, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('');

  useEffect(() => {
    if (user) {
      setRole(user.role);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ width: '280px', backgroundColor: '#004080', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* رأس القائمة الجانبية: تكبير الخط وزيادة الارتفاع ليتوافق مع الـ Navbar الجديد */}
      <div className="p-5 border-bottom border-white text-center">
        <h5 className="fw-bold mb-0 text-white fs-3">نظام الضرائب</h5>
        <small className="text-white" style={{opacity: 1, fontSize: '0.8rem'}}>Tax Management System</small>
      </div>

      <div className="p-3" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="mb-3 text-center">
            <small className="text-uppercase text-white fw-bold mb-1">مستخدم حالي</small>
            <div className="fw-bold fs-5 text-white">{user ? user.name : 'Guest'}</div>
            <Badge bg="light" text="dark">{role}</Badge>
        </div>

        <Nav className="flex-column" variant="pills">
          {/* --- قوائم مدخل البيانات (Data Entry) --- */}
          {role === 'Data Entry' && (
            <>
                <Nav.Link onClick={() => navigate('/data-entry/home')} className="text-white mb-2">
                    <i className="fa-solid fa-gauge-high me-2"></i> الرئيسية
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/data-entry/add')} className="text-white mb-2">
                    <i className="fa-solid fa-building me-2"></i> إضافة عقار
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/data-entry/link')} className="text-white mb-2">
                    <i className="fa-solid fa-user-tie me-2"></i> ربط المالك
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/data-entry/appeal')} className="text-white mb-2">
                    <i className="fa-solid fa-file-contract me-2"></i> طعن ضريبي
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/data-entry/exemption')} className="text-white mb-2">
                    <i className="fa-solid fa-shield-halved me-2"></i> طلب إعفاء
                </Nav.Link>
            </>
          )}

          {/* --- قوائم المراجع (Reviewer) --- */}
          {role === 'Reviewer' && (
            <>
                <Nav.Link onClick={() => navigate('/reviewer/home')} className="text-white mb-2">
                    <i className="fa-solid fa-list-check me-2"></i> المهام اليومية
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/reviewer/calc')} className="text-white mb-2">
                    <i className="fa-solid fa-calculator me-2"></i> حساب الضرائب
                </Nav.Link>
            </>
          )}

          {/* --- قوائم المالية (Finance) --- */}
          {role === 'Finance' && (
            <>
                <Nav.Link onClick={() => navigate('/finance/home')} className="text-white mb-2">
                    <i className="fa-solid fa-coins me-2"></i> التحصيل والسداد
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/finance/collect')} className="text-white mb-2">
                    <i className="fa-solid fa-cash-register me-2"></i> تسجيل دفع جديد
                </Nav.Link>
            </>
          )}

          {/* --- قوائم المدير (Manager) --- */}
          {role === 'Manager' && (
            <>
                <Nav.Link onClick={() => navigate('/manager/home')} className="text-white mb-2">
                    <i className="fa-solid fa-chart-pie me-2"></i> الرئيسية
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/manager/verdict')} className="text-white mb-2">
                    <i className="fa-solid fa-stamp me-2"></i> الاعتمادات النهائية
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/manager/reports')} className="text-white mb-2">
                    <i className="fa-solid fa-file-pdf me-2"></i> التقارير المالية
                </Nav.Link>
            </>
          )}

          {/* --- قوائم اللجان (Committee) --- */}
          {role === 'Committee' && (
             <>
                <Nav.Link onClick={() => navigate('/committee/home')} className="text-white mb-2">
                    <i className="fa-solid fa-gavel me-2"></i> لجنة الطعون
                </Nav.Link>
             </>
          )}

          {/* --- قوائم الأدمن (Admin) --- */}
          {role === 'Admin' && (
            <>
                <Nav.Link onClick={() => navigate('/admin/home')} className="text-white mb-2">
                    <i className="fa-solid fa-gauge-high me-2"></i> لوحة التحكم
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/admin/users')} className="text-white mb-2">
                    <i className="fa-solid fa-users-gear me-2"></i> إدارة المستخدمين
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/admin/logs')} className="text-white mb-2">
                    <i className="fa-solid fa-list-ol me-2"></i> سجلات المراقبة
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