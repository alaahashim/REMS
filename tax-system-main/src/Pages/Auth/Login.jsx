import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(username, password);
    
    if (result.success) {
      // --- المنطق الجديد للتوجيه حسب الدور ---
      const role = result.user.role;
      
      switch (role) {
        case 'Data Entry':
          navigate('/data-entry/home');
          break;
        case 'Reviewer':
          navigate('/reviewer/home');
          break;
        case 'Finance':
          navigate('/finance/home');
          break;
        case 'Manager':
          navigate('/manager/home');
          break;
        case 'Committee':
          navigate('/committee/appeals');
          break;
        case 'Admin':
          navigate('/admin/home');
          break;
        default:
          navigate('/'); // للطوارئ
      }
      
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: '400px' }}>
        <div className="text-center mb-4">
          <h3 className="text-primary">نظام الضرائب العقارية</h3>
          <p className="text-muted">{t('employeeLogin')}</p>
        </div>
        
        {/* معلومات المساعدة */}
        {/* <div className="alert alert-info py-2 small">
          للتجربة: 
          <br/>DataEntry: data1 / 123
          <br/>Reviewer: rev1 / 123
          <br/>Finance: fin1 / 123
          <br/>Manager: man1 / 123
          <br/>Committee: com1 / 123
          <br/>Admin: admin / admin
        </div> */}

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">{t('username')}</label>
            <input 
              type="text" 
              className="form-control" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">{t('password')}</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">{t('enter')}</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
