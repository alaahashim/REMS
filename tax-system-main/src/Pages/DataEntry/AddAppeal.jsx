import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // ✅ تأكد من وجود هذين
import { Form, Button, Card, Container, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import { createAppeal } from '../../services/appealService'; 
import { getAssignmentById } from '../../services/assignmentService'; // ✅ تأكد من وجود هذا أيضاً
import { useAuth } from '../../context/AuthContext';

const AddAppeal = () => {
  const navigate = useNavigate(); // ✅ موجود
  const { user } = useAuth();       // ✅ موجود
  
  // ✅ استخدمن useParams هنا لقراءة رقم الطلب من الرابط
  const { id } = useParams(); 

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    personId: '',
    unitId: '',
    disputedAmount: '', 
    appealReason: '',
    appealDate: new Date().toISOString().split('T')[0],
    file: null 
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      if (!formData.personId || !formData.unitId) {
        throw new Error("يجب اختيار المالك والوحدة أولاً");
      }

      await createAppeal(formData, user.id);
      
      setMessage({ 
        text: 'تم تسجيل الطعن بنجاح! يرجى العلم بأنه يوجد رسم تقديم قدره 100 ج.م يجب سداده لإحالة الطلب للجنة.', 
        type: 'success' 
      });
      
      setTimeout(() => navigate('/data-entry/home'), 3000);
    } catch (error) {
      if (error.message) setMessage({ text: error.message, type: 'danger' });
      console.error("Error submitting appeal:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm border-0 border-top border-5 border-primary">
            <Card.Header className="bg-primary text-white py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                    <small className="text-white">تعديل طلب</small>
                    {/* ✅ هنا نعرض الرقم المستخدم من الرابط */}
                    <Card.Title className="mb-0 fs-4 fw-bold">تعديل طلب ضريبي (رقم: {id})</Card.Title>
                </div>
                <Badge bg="warning" className="fs-6">تحديث</Badge>
              </div>
            </Card.Header>
            
            <Card.Body>
              {message.text && <Alert variant={message.type} className="mb-4">{message.text}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">رقم قومي المالك <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="personId"
                        placeholder="أدخل الرقم القومي..."
                        value={formData.personId}
                        onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">رقم الوحدة (Unit ID) <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="unitId"
                        placeholder="مثال: 1024"
                        value={formData.unitId}
                        onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-primary fw-bold">المبلغ المتنازع عليه (ج.م)</Form.Label>
                            <Form.Control 
                                type="number" 
                                name="disputedAmount"
                                value={formData.disputedAmount}
                                onChange={(e) => setFormData({ ...formData, disputedAmount: e.target.value })}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="text-primary fw-bold">سبب الطعن <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="appealReason"
                    placeholder="اكتب تفاصيل الاعتراض..."
                    value={formData.appealReason}
                    onChange={(e) => setFormData({ ...formData, appealReason: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="text-primary fw-bold">رفع المستندات (محضر / أدلة) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.png"
                    required
                  />
                </Form.Group>

                <div className="d-flex justify-content-between gap-3 mt-5">
                  <Button variant="secondary" onClick={() => navigate('/data-entry/home')}>إلغاء</Button>
                  <Button variant="success" type="submit" disabled={loading} size="lg" className="fw-bold">
                    {loading ? <Spinner size="sm" animation="border" /> : 'حفظ التعديلات'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddAppeal;