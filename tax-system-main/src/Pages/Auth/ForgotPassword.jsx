import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Form, Button, Alert, Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import axios from 'axios'; // أو استورد الـ apiClient الخاص بمشروعك

const ForgotPassword = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Step 1: طلب إرسال الكود من الـ Backend
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // استبدل الرابط بالـ API الخاص بك
      const response = await axios.post('/api/auth/forgot-password', { email: email.trim() });
      
      setMessage({ text: response.data.message || 'تم إرسال الكود إلى بريدك الإلكتروني', type: 'success' });
      setStep(2);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'حدث خطأ، تأكد من أن الإيميل مسجل في النظام';
      setMessage({ text: errorMsg, type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: إرسال الكود وكلمة المرور الجديدة للـ Backend للتحقق والحفظ
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      setLoading(false);
      setMessage({ text: 'كلمات المرور غير متطابقة', type: 'danger' });
      return;
    }

    try {
      // استبدل الرابط بالـ API الخاص بك
      const response = await axios.post('/api/auth/reset-password', {
        email: email.trim(),
        otp: verificationCode,
        newPassword: newPassword
      });

      setMessage({ text: 'تم تغيير كلمة المرور بنجاح، جاري التحويل...', type: 'success' });
      
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'كود التحقق غير صحيح أو انتهت صلاحيته';
      setMessage({ text: errorMsg, type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const isRtl = lang === 'ar';

  return (
    <Container fluid className="d-flex justify-content-center align-items-center vh-100 bg-light" dir={isRtl ? 'rtl' : 'ltr'}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card className="shadow border-0">
            <Card.Header className="bg-primary text-white py-3 text-center">
              <h5 className="mb-0">{t('resetPassword') || 'إعادة تعيين كلمة المرور'}</h5>
            </Card.Header>
            <Card.Body className="p-4">
              {message.text && <Alert variant={message.type} className="mb-4">{message.text}</Alert>}

              {step === 1 ? (
                <Form onSubmit={handleEmailSubmit}>
                  <div className="text-center mb-4">
                    <i className="fa-solid fa-envelope-circle-check fa-3x text-primary mb-3"></i>
                    <p className="text-muted">أدخل بريدك الإلكتروني وسنرسل لك كود تحقق</p>
                  </div>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold text-primary">{t('email') || 'البريد الإلكتروني'}</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@domain.com"
                      required
                    />
                  </Form.Group>
                  <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                    {loading ? <Spinner size="sm" animation="border" /> : (t('sendVerification') || 'إرسال كود التحقق')}
                  </Button>
                </Form>
              ) : (
                <Form onSubmit={handleResetSubmit}>
                  <div className="text-center mb-4">
                    <i className="fa-solid fa-shield-halved fa-3x text-success mb-3"></i>
                    <p className="text-muted small">تم إرسال الكود إلى: <strong>{email}</strong></p>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-primary">{t('verificationCode') || 'كود التحقق'}</Form.Label>
                    <Form.Control
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="أدخل الـ 6 أرقام"
                      maxLength={6}
                      className="text-center fs-3 fw-bold"
                      style={{ letterSpacing: '10px' }}
                      required
                    />
                  </Form.Group>

                  <hr className="my-4"/>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-primary">{t('newPassword') || 'كلمة المرور الجديدة'}</Form.Label>
                    <Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold text-primary">{t('confirmNewPassword') || 'تأكيد كلمة المرور'}</Form.Label>
                    <Form.Control type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </Form.Group>

                  <Button type="submit" variant="success" className="w-100" disabled={loading}>
                    {loading ? <Spinner size="sm" animation="border" /> : (t('changePassword') || 'تغيير كلمة المرور')}
                  </Button>
                </Form>
              )}

              <div className="text-center mt-3">
                <span onClick={() => navigate('/login')} className="text-decoration-underline text-muted" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                  {t('backToLogin') || 'العودة لتسجيل الدخول'}
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