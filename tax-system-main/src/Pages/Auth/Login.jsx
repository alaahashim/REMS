import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { forgotPassword, resetPassword, verifyPasswordOtp } from '../../services/authService';

const routeByRole = (role = '') => {
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
      return '/admin/users';
    default:
      return '/';
  }
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const clearFeedback = () => {
    setError('');
    setMessage('');
  };

  const goToLogin = () => {
    setMode('login');
    setOtp('');
    setNewPassword('');
    clearFeedback();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearFeedback();
    setLoading(true);

    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      navigate(routeByRole(result.user.role));
      return;
    }

    setError(result.message);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearFeedback();
    setLoading(true);

    try {
      const response = await forgotPassword(username);
      setMessage(response?.message || 'Verification code sent.');
      setMode('verify');
    } catch (err) {
      setError(err?.message || 'Unable to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearFeedback();
    setLoading(true);

    try {
      const response = await verifyPasswordOtp(username, otp);
      setMessage(response?.message || 'Verification code confirmed.');
      setMode('reset');
    } catch (err) {
      setError(err?.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearFeedback();
    setLoading(true);

    try {
      const response = await resetPassword(username, otp, newPassword);
      setMessage(response?.message || 'Password reset successfully.');
      setMode('login');
      setOtp('');
      setNewPassword('');
      setPassword('');
    } catch (err) {
      setError(err?.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'login' ? t('employeeLogin') : 'Password recovery';

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light" dir="rtl">
      <div className="card shadow p-4" style={{ width: 420, maxWidth: '92vw' }}>
        <div className="text-center mb-4">
          <h3 className="text-primary">Tax System</h3>
          <p className="text-muted mb-0">{title}</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {mode === 'login' && (
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
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? '...' : t('enter')}
            </button>
            <button
              type="button"
              className="btn btn-link w-100 mt-2"
              disabled={loading}
              onClick={() => {
                clearFeedback();
                setMode('request');
              }}
            >
              Forgot password?
            </button>
          </form>
        )}

        {mode === 'request' && (
          <form onSubmit={handleForgotPassword}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? '...' : 'Send verification code'}
            </button>
            <button type="button" className="btn btn-link w-100 mt-2" onClick={goToLogin}>
              Back to sign in
            </button>
          </form>
        )}

        {mode === 'verify' && (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-3">
              <label className="form-label">Verification code</label>
              <input
                type="text"
                className="form-control"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? '...' : 'Verify code'}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary w-100 mt-2"
              disabled={loading}
              onClick={handleForgotPassword}
            >
              Resend code
            </button>
            <button type="button" className="btn btn-link w-100 mt-2" onClick={goToLogin}>
              Back to sign in
            </button>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label className="form-label">New password</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                autoFocus
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? '...' : 'Reset password'}
            </button>
            <button type="button" className="btn btn-link w-100 mt-2" onClick={goToLogin}>
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
