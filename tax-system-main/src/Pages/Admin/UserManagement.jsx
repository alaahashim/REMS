import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { addNewUser } from '../../services/adminService';

const UserManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    employeeCode: '',
    jobTitle: '',
    officeId: '',
    username: '',
    password: '',
    role: 'Data Entry',
    isActive: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await addNewUser(formData);
      setMessage({ text: 'تم إضافة المستخدم بنجاح', type: 'success' });
      setTimeout(() => navigate('/admin/home'), 1500);
    } catch (error) {
      setMessage({ text: 'حدث خطأ', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col md={10}>
          <div style={{marginBottom:'20px'}}>
            <button className="btn btn-secondary" onClick={() => navigate('/admin/home')}>
              <i className="fa-solid fa-arrow-right"></i> عودة للرئيسية
            </button>
          </div>

          <Card className="shadow-sm border-0 border-top border-5 border-dark">
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0"><i className="fa-solid fa-user-plus me-2"></i> إضافة حساب موظف جديد (Employee)</h5>
            </Card.Header>
            <Card.Body>
              
              {message.text && <Alert variant={message.type}>{message.text}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>الاسم الثلاثي <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>كود الموظف (EmployeeCode) <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="text" placeholder="مثال: EMP-005" required value={formData.employeeCode} onChange={(e) => setFormData({...formData, employeeCode: e.target.value})} />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>المسمى الوظيفي (JobTitle)</Form.Label>
                      <Form.Control type="text" placeholder="مثال: مراجع ضرائب أول" required value={formData.jobTitle} onChange={(e) => setFormData({...formData, jobTitle: e.target.value})} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>المأمورية التابعة (OfficeID)</Form.Label>
                      <Form.Select value={formData.officeId} onChange={(e) => setFormData({...formData, officeId: e.target.value})}>
                        <option value="">اختر المأمورية...</option>
                        <option value="1">مأمورية مدينة نصر - القاهرة</option>
                        <option value="2">مأمورية الدقي - الجيزة</option>
                        <option value="3">مأمورية الإسكندرية</option>
                        <option value="99">المركز الرئيسي</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>اسم المستخدم للنظام (Username) <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="text" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>كلمة المرور (Password) <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>الصلاحية العامة (Role)</Form.Label>
                      <Form.Select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                        <option value="Data Entry">Data Entry (مدخل بيانات)</option>
                        <option value="Reviewer">Reviewer (مراجع)</option>
                        <option value="Finance">Finance (مالي)</option>
                        <option value="Manager">Manager (مدير)</option>
                        <option value="Admin">Admin (أدمن)</option>
                        <option value="Committee">Committee (لجان)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>حالة الحساب (Status)</Form.Label>
                      <Form.Select value={formData.isActive ? '1' : '0'} onChange={(e) => setFormData({...formData, isActive: e.target.value === '1'})}>
                        <option value="1">نشط (Active)</option>
                        <option value="0">معلق (Suspended)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Button variant="primary" type="submit" className="w-100 py-3 fw-bold" disabled={loading}>
                  {loading ? <Spinner size="sm" animation="border" /> : 'حفظ وإنشاء الحساب'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserManagement;