import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Form, Button, Alert, Card, Container, Row, Col, Spinner } from 'react-bootstrap';

const DEFAULT_ADMIN_EMAIL = 'admin@tax-system.com';

const ForgotPassword = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Enter email, 2: Verification code & Reset Password
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [targetUserType, setTargetUserType] = useState(''); // 'admin' or 'employee'
  const [targetUserIndex, setTargetUserIndex] = useState(-1);

  // Step 1: Submit Email
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    setTimeout(() => {
      const emailLower = email.trim().toLowerCase();
      
      // Look up admin profile
      let admin = null;
      try {
        const storedAdmin = localStorage.getItem('tax_admin_profile');
        admin = storedAdmin ? JSON.parse(storedAdmin) : { email: DEFAULT_ADMIN_EMAIL };
      } catch (e) {
        admin = { email: DEFAULT_ADMIN_EMAIL };
      }

      if (admin.email && admin.email.toLowerCase() === emailLower) {
        setTargetUserType('admin');
        setLoading(false);
        setStep(2);
        setMessage({ text: t('verificationSent') + ' (123456)', type: 'success' });
        return;
      }

      // Look up employee list
      let employees = [];
      try {
        employees = JSON.parse(localStorage.getItem('tax_users')) || [];
      } catch (e) {
        employees = [];
      }

      const empIndex = employees.findIndex(u => u.email && u.email.toLowerCase() === emailLower);
      if (empIndex !== -1) {
        setTargetUserType('employee');
        setTargetUserIndex(empIndex);
        setLoading(false);
        setStep(2);
        setMessage({ text: t('verificationSent') + ' (123456)', type: 'success' });
        return;
      }

      setLoading(false);
      setMessage({ text: t('emailNotRegistered'), type: 'danger' });
    }, 1000);
  };

  // Step 2: Verification Code and Reset Password
  const handleResetSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    setTimeout(() => {
      // 1. Verify Code (Mock: 123456)
      if (verificationCode !== '123456') {
        setLoading(false);
        setMessage({ text: t('invalidCode'), type: 'danger' });
        return;
      }

      // 2. Validate passwords
      if (newPassword !== confirmPassword) {
        setLoading(false);
        setMessage({ text: t('passwordsDoNotMatch'), type: 'danger' });
        return;
      }

      // 3. Save password
      if (targetUserType === 'admin') {
        let admin = null;
        try {
          const storedAdmin = localStorage.getItem('tax_admin_profile');
          admin = storedAdmin ? JSON.parse(storedAdmin) : {
            id: 'admin-1',
            username: 'admin',
            password: 'admin',
            role: 'Admin',
            name: 'Administrator',
            email: DEFAULT_ADMIN_EMAIL
          };
        } catch (e) {
          admin = { id: 'admin-1', username: 'admin', password: 'admin', role: 'Admin', name: 'Administrator', email: DEFAULT_ADMIN_EMAIL };
        }
        
        admin.password = newPassword;
        localStorage.setItem('tax_admin_profile', JSON.stringify(admin));
      } else if (targetUserType === 'employee' && targetUserIndex !== -1) {
        try {
          const employees = JSON.parse(localStorage.getItem('tax_users')) || [];
          if (employees[targetUserIndex]) {
            employees[targetUserIndex].password = newPassword;
            localStorage.setItem('tax_users', JSON.stringify(employees));
          }
        } catch (e) {
          console.error(e);
        }
      }

      setLoading(false);
      setMessage({ text: t('passwordChanged'), type: 'success' });
      
      // Redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    }, 1200);
  };

  const isRtl = lang === 'ar';

  return (
    <Container fluid className="d-flex justify-content-center align-items-center vh-100 bg-light" dir={isRtl ? 'rtl' : 'ltr'}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card className="shadow border-0">
            <Card.Header className="bg-primary text-white py-3 text-center">
              <h5 className="mb-0">{t('resetPassword')}</h5>
            </Card.Header>
            <Card.Body className="p-4">
              {message.text && (
                <Alert variant={message.type} className="mb-4">
                  {message.text}
                </Alert>
              )}

              {step === 1 ? (
                <Form onSubmit={handleEmailSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold text-primary">{t('email')}</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('enterEmail')}
                      required
                    />
                  </Form.Group>

                  <Button type="submit" variant="primary" className="w-100 mb-3" disabled={loading}>
                    {loading ? <Spinner size="sm" animation="border" /> : t('sendVerification')}
                  </Button>
                </Form>
              ) : (
                <Form onSubmit={handleResetSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-primary">{t('verificationCode')}</Form.Label>
                    <Form.Control
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-primary">{t('newPassword')}</Form.Label>
                    <Form.Control
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold text-primary">{t('confirmNewPassword')}</Form.Label>
                    <Form.Control
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button type="submit" variant="primary" className="w-100 mb-3" disabled={loading}>
                    {loading ? <Spinner size="sm" animation="border" /> : t('changePassword')}
                  </Button>
                </Form>
              )}

              <div className="text-center mt-3">
                <span
                  onClick={() => navigate('/login')}
                  className="text-decoration-underline text-muted"
                  style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  {t('backToLogin')}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
