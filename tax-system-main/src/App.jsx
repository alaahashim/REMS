import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'; 
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
import CommitteeHome from './pages/Committee/Home';

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
  return (
    <Router>
      <Routes>
        {/* صفحة الدخول */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* التطبيق الرئيسي */}
        <Route path="/*" element={
          <ProtectedRoute>
            <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f4f6f9' }}>
              <Sidebar />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <TopNavbar />
                <main className="content-area p-4" style={{ flex: 1, overflowY: 'auto' }}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/chatbot" element={<Chatbot />} /> 
                    
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
                    <Route path="/committee/home" element={<CommitteeHome />} />
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