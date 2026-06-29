import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getCurrentProfile,
  getUserById,
  updateUserById,
  uploadProfilePicture,
} from '../../services/authService';

const emptyForm = {
  id: '',
  employeeCode: '',
  name: '',
  username: '',
  nationalId: '',
  jobTitle: '',
  department: '',
  officeId: '',
  email: '',
  phone: '',
  avatar: '',
  picturePath: '',
  role: '',
  roleNameArabic: '',
  isActive: true,
  createdAt: '',
  createdByName: '',
  updatedByName: '',
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
};

const isAdminUser = (user) => {
  const value = `${user?.role || ''} ${user?.department || ''} ${user?.roleNameArabic || ''}`.toLowerCase();
  return value.includes('admin') || value.includes('مدير النظام') || value.includes('أدمن');
};

const ProfilePage = () => {
  const { id } = useParams();
  const { user, updateCurrentUser } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  const profileId = id || user?.id;
  const isCurrentUserProfile = !id || String(id) === String(user?.id);
  const canEditBasic = isCurrentUserProfile || isAdminUser(user);
  const canEditAdmin = isAdminUser(user);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'success' });

  const avatarSrc = form.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || form.username || 'User')}&background=random`;

  const statusBadge = useMemo(() => (
    <Badge bg={form.isActive ? 'success' : 'secondary'} className="fw-normal">
      {form.isActive ? 'نشط' : 'معطل'}
    </Badge>
  ), [form.isActive]);

  const applyProfile = (profile) => {
    if (!profile) return;

    setForm({
      ...emptyForm,
      ...profile,
      id: profile.id || '',
      employeeCode: profile.employeeCode || '',
      name: profile.name || profile.fullName || '',
      username: profile.username || '',
      nationalId: profile.nationalId || '',
      jobTitle: profile.jobTitle || '',
      department: profile.department || profile.role || '',
      officeId: profile.officeId || '',
      email: profile.email || '',
      phone: profile.phone || '',
      avatar: profile.avatar || '',
      picturePath: profile.picturePath || '',
      role: profile.role || profile.department || '',
      roleNameArabic: profile.roleNameArabic || '',
      isActive: profile.isActive !== false,
      createdAt: profile.createdAt || '',
      createdByName: profile.createdByName || '',
      updatedByName: profile.updatedByName || '',
    });
  };

  useEffect(() => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: 'success' });

    const request = id ? getUserById(profileId) : getCurrentProfile();

    request
      .then((profile) => {
        applyProfile(profile);
        if (!id && profile) updateCurrentUser(profile);
      })
      .catch((error) => {
        console.error('Profile load failed', error);
        setMessage({ text: 'تعذر تحميل بيانات الملف الشخصي.', type: 'danger' });
      })
      .finally(() => setLoading(false));
  }, [id, profileId, updateCurrentUser]);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !profileId) return;

    setUploading(true);
    setMessage({ text: '', type: 'success' });

    try {
      const updatedProfile = await uploadProfilePicture(profileId, file);
      applyProfile(updatedProfile);
      if (isCurrentUserProfile && updatedProfile) updateCurrentUser(updatedProfile);
      setMessage({ text: 'تم تحديث الصورة الشخصية بنجاح.', type: 'success' });
    } catch (error) {
      console.error('Profile picture upload failed', error);
      setMessage({ text: error?.message || 'تعذر رفع الصورة الشخصية.', type: 'danger' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profileId || !canEditBasic) return;

    if (!/^\d{14}$/.test(form.nationalId)) {
      setMessage({ text: 'الرقم القومي يجب أن يتكون من 14 رقم.', type: 'danger' });
      return;
    }

    if (form.phone && !/^\d{11}$/.test(form.phone)) {
      setMessage({ text: 'رقم الهاتف يجب أن يتكون من 11 رقم.', type: 'danger' });
      return;
    }

    setSaving(true);
    setMessage({ text: '', type: 'success' });

    try {
      const updatedProfile = await updateUserById(profileId, form);
      applyProfile(updatedProfile);
      if (isCurrentUserProfile && updatedProfile) updateCurrentUser(updatedProfile);
      setMessage({ text: t('changesSaved') || 'تم حفظ التغييرات.', type: 'success' });
    } catch (error) {
      console.error('Profile update failed', error);
      setMessage({ text: error?.message || 'تعذر حفظ بيانات الملف الشخصي.', type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-3 p-md-4 text-center">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="p-3 p-md-4" dir="rtl">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
            <div
              className="rounded-circle overflow-hidden border border-2 border-primary flex-shrink-0"
              style={{ width: '96px', height: '96px' }}
            >
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-100 h-100 object-fit-cover"
              />
            </div>

            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                <h4 className="mb-0 fw-bold">{form.name || form.username || 'User'}</h4>
                {statusBadge}
              </div>
              <p className="text-muted mb-1">{form.roleNameArabic || form.jobTitle || form.role || 'User'}</p>
              <p className="text-muted small mb-0">كود الموظف: {form.employeeCode || '-'}</p>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline-primary"
                disabled={!canEditBasic || uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="fa-solid fa-camera ms-1" />
                {uploading ? <Spinner size="sm" animation="border" /> : t('changePhoto')}
              </Button>
              <Form.Control
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          {message.text && <Alert variant={message.type}>{message.text}</Alert>}

          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('name')}</Form.Label>
                  <Form.Control
                    value={form.name}
                    readOnly={!canEditBasic}
                    onChange={(e) => setField('name', e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('username')}</Form.Label>
                  <Form.Control value={form.username} readOnly />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>البريد الإلكتروني</Form.Label>
                  <Form.Control
                    type="email"
                    value={form.email}
                    readOnly={!canEditBasic}
                    onChange={(e) => setField('email', e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>رقم الهاتف</Form.Label>
                  <Form.Control
                    inputMode="numeric"
                    maxLength={11}
                    value={form.phone}
                    readOnly={!canEditBasic}
                    onChange={(e) => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>الرقم القومي</Form.Label>
                  <Form.Control
                    inputMode="numeric"
                    maxLength={14}
                    value={form.nationalId}
                    readOnly={!canEditAdmin}
                    onChange={(e) => setField('nationalId', e.target.value.replace(/\D/g, '').slice(0, 14))}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>المسمى الوظيفي</Form.Label>
                  <Form.Control
                    value={form.jobTitle}
                    readOnly={!canEditAdmin}
                    onChange={(e) => setField('jobTitle', e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>الصلاحية / القسم</Form.Label>
                  <Form.Control
                    value={form.department}
                    readOnly={!canEditAdmin}
                    onChange={(e) => {
                      setField('department', e.target.value);
                      setField('role', e.target.value);
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>المأمورية</Form.Label>
                  <Form.Control
                    value={form.officeId}
                    readOnly={!canEditAdmin}
                    onChange={(e) => setField('officeId', e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>تاريخ الانضمام</Form.Label>
                  <Form.Control value={formatDate(form.createdAt)} readOnly />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>أنشئ بواسطة</Form.Label>
                  <Form.Control value={form.createdByName || '-'} readOnly />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>آخر تحديث بواسطة</Form.Label>
                  <Form.Control value={form.updatedByName || '-'} readOnly />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="primary" onClick={handleSave} disabled={!canEditBasic || saving}>
                {saving ? <Spinner size="sm" animation="border" /> : t('save')}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProfilePage;
