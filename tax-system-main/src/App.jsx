import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Button } from 'react-bootstrap'; 
import { ProtectedRoute } from './routes/ProtectedRoute';
import Chatbot from './pages/Shared/Chatbot';

// Components
import Sidebar from './components/Layout/Sidebar';
import TopNavbar from './components/Layout/Navbar';

// Pages
import Login from './pages/Auth/Login';
import { Unauthorized } from './pages/Unauthorized';
import Dashboard from './pages/Shared/Dashboard'; 
import ProfilePage from './pages/Shared/Profile';
import NotificationsPage from './pages/Shared/Notifications';
import SettingsPage from './pages/Shared/Settings';

// Data Entry
import DataEntryHome from './pages/DataEntry/DataEntryHome'; 
import AddProperty from './pages/DataEntry/AddProperty';
import LinkOwner from './pages/DataEntry/LinkOwner';
import AddAppeal from './pages/DataEntry/AddAppeal';
import AddExemption from './pages/DataEntry/AddExemption';
import EditProperty from "./pages/DataEntry/EditProperty"; 

// ✅ إضافة استيراد صفحات التعديل الجديدة
import EditAppeal from './pages/DataEntry/EditAppeal';
import EditExemption from './pages/DataEntry/EditExemption';

// Reviewer
import ReviewerHome from './pages/Reviewer/Home';
import TaxCalculation from './pages/Reviewer/TaxCalculation';

// Finance
import FinanceHome from './pages/Finance/Home';
import FinanceCollection from './pages/Finance/Collection';

// Manager
import ManagerHome from './pages/Manager/Home';
import ManagerVerdict from './pages/Manager/Verdict';
import ManagerReports from './pages/Manager/Reports';

// Admin
import AdminHome from './pages/Admin/Home';
import UserManagement from './pages/Admin/UserManagement';
import AuditLogs from './pages/Admin/AuditLogs';

// Committee
import CommitteeAppeals from './pages/Committee/Appeals';
import CommitteeExemptions from './pages/Committee/Exemptions';

// ✅ كومبوننت مساعد (احتفظنا به للمستقبل)
const UnderConstruction = ({ message }) => {
  const navigate = useNavigate();
  return (
    <div className="p-5 text-center">
        <h3>{message}</h3>
        <Button variant="secondary" onClick={() => navigate(-1)}>رجوع</Button>
    </div>
  );
};

function App() {
  const [settings, setSettings] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('tax_settings') || '{}');
    return {
      emailAlerts: saved.emailAlerts ?? true,
      darkMode: saved.darkMode ?? false,
      compactView: saved.compactView ?? false
    };
  });

  useEffect(() => {
    document.body.classList.toggle('dark-mode', settings.darkMode);
    document.body.classList.toggle('compact-view', settings.compactView);
  }, [settings]);

  useEffect(() => {
    const handleSettingsChanged = (event) => {
      setSettings(event.detail);
    };

    window.addEventListener('tax-settings-changed', handleSettingsChanged);
    return () => window.removeEventListener('tax-settings-changed', handleSettingsChanged);
  }, []);

  return (
    <Router>
      <Routes>
        {/* صفحة الدخول */}
      <Route path="/" element={<Navigate to="/login" replace />} />

  {/* صفحة الدخول */}
  <Route path="/login" element={<Login />} />
  <Route path="/unauthorized" element={<Unauthorized />} />

        {/* التطبيق الرئيسي */}
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="app-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
              <Sidebar />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <TopNavbar />
                <main className="content-area p-4" style={{ flex: 1, overflowY: 'auto' }}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/chatbot" element={<Chatbot />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    
                    {/* مسارات Data Entry */}
                    <Route path="/data-entry/home" element={<DataEntryHome />} />
                    <Route path="/data-entry/add" element={<AddProperty />} />
                    <Route path="/data-entry/link" element={<LinkOwner />} />
                    <Route path="/data-entry/appeal" element={<AddAppeal />} />
                    <Route path="/data-entry/exemption" element={<AddExemption />} />
                    <Route path="/data-entry/edit-property/:id" element={<EditProperty />} />

                    {/* ✅ تعديل: ربط المسارات بالملفات الحقيقية */}
                    <Route path="/data-entry/edit-appeal/:id" element={<EditAppeal />} />
                    <Route path="/data-entry/edit-exemption/:id" element={<EditExemption />} />

                    {/* مسارات Reviewer */}
                    <Route path="/reviewer/home" element={<ReviewerHome />} />
                    <Route path="/reviewer/calc/:id?" element={<TaxCalculation />} />

                    {/* مسارات Finance */}
                    <Route path="/finance/home" element={<FinanceHome />} />
                    <Route path="/finance/collect" element={<FinanceCollection />} />

                    {/* مسارات Manager */}
                    <Route path="/manager/home" element={<ManagerHome />} />
                    <Route path="/manager/verdict" element={<ManagerVerdict />} />
                    <Route path="/manager/reports" element={<ManagerReports />} />

                    {/* مسارات Admin */}
                    <Route path="/admin/home" element={<AdminHome />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/logs" element={<AuditLogs />} />

                    {/* مسارات Committee */}
                    <Route path="/committee/appeals" element={<CommitteeAppeals />} />
                    <Route path="/committee/exemptions" element={<CommitteeExemptions />} />
                  </Routes>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
