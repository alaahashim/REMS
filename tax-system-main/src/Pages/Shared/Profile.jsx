import React, { useState } from 'react';
import { Button, Card, Col, Form, Row, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const ProfilePage = () => {
  const { user, updateCurrentUser } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState(() => ({
    name: user?.name || '',
    username: user?.username || '',
    password: user?.password || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  }));
  const [message, setMessage] = useState('');

  const avatarSrc = form.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || form.username || 'User')}&background=random`;

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.username.trim() || !form.password.trim()) {
      setMessage(t('usernamePasswordRequired'));
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem('tax_users') || '[]');
    const duplicate = allUsers.find(
      (item) => item.username === form.username.trim() && item.id !== user?.id
    );

    if (duplicate) {
      setMessage(t('usernameExists'));
      return;
    }

    updateCurrentUser({
      ...form,
      username: form.username.trim(),
      password: form.password.trim()
    });
    setMessage(t('changesSaved'));
  };

  return (
    <div className="p-3 p-md-4">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex align-items-center gap-3 mb-4">
            <div
              className="rounded-circle overflow-hidden border border-2 border-primary"
              style={{ width: '80px', height: '80px' }}
            >
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-100 h-100 object-fit-cover"
              />
            </div>
            <div>
              <h4 className="mb-1 fw-bold">{form.name || form.username || 'User'}</h4>
              <p className="text-muted mb-0">{user?.role || 'User'}</p>
              <div className="d-flex gap-2 mt-2 flex-wrap">
                <Form.Label htmlFor="profile-photo" className="btn btn-outline-primary btn-sm mb-0">
                  <i className="fa-solid fa-camera"></i>
                  {t('changePhoto')}
                </Form.Label>
                {form.avatar && (
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => setForm({ ...form, avatar: '' })}
                  >
                    <i className="fa-solid fa-trash"></i>
                    {t('removePhoto')}
                  </Button>
                )}
                <Form.Control
                  id="profile-photo"
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>
          </div>

          {message && <Alert variant="success">{message}</Alert>}

          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('name')}</Form.Label>
                  <Form.Control
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('username')}</Form.Label>
                  <Form.Control
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('password')}</Form.Label>
                  <Form.Control
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('email')}</Form.Label>
                  <Form.Control
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>{t('phone')}</Form.Label>
              <Form.Control
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Form.Group>

            <Button variant="primary" onClick={handleSave}>
              {t('save')}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProfilePage;
