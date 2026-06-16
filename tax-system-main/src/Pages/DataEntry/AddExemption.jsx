import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { createExemption } from '../../services/exemptionService';
import { getAssignmentById } from '../../services/assignmentService';
import { useAuth } from '../../context/AuthContext';

const AddExemption = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // ملاحظة: أزلنا الحقول الوهمية وجعلنا القيم الافتراضية صحيحة
  const [formData, setFormData] = useState({
    personId: '',
    personName: '', // سيتم ملؤه تلقائياً
    propertyId: '',
    exemptionType: '',
    clauseNo: '',
    exemptionStartDate: new Date().toISOString().split('T')[0],
    exemptionEndDate: '',
    attachment: null
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, attachment: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      if (!formData.personId || !formData.propertyId || !formData.exemptionType) {
        throw new Error("من فضلك، قم بملء كل البيانات المطلوبة *");
      }

      // ملاحظة: تعديل البيانات لتتناسب الـ Service (إذا كان يعتم استخدام FormData)
      const formDataToSend = new FormData();
      formDataToSend.append('personId', formData.personId);
      formDataToSend.append('propertyId', formData.propertyId);
      formDataToSend.append('exemptionType', formData.exemptionType);
      formDataToSend.append('clauseNo', formData.clauseNo);
      formDataToSend.append('startDate', formData.exemptionStartDate);
      if (formData.exemptionEndDate) formDataToSend.append('endDate', formData.exemptionEndDate);
      if (formData.attachment) formDataToSend.append('file', formData.attachment);

      await createExemption(formDataToSend, user?.id);
      
      setMessage({ text: 'تم رفع الطلب والمرفقات بنجاح!', type: 'success' });
      setTimeout(() => navigate('/data-entry/home'), 2000);
    } catch (error) {
      if (error.message) setMessage({ text: error.message, type: 'danger' });
      console.error("Error submitting exemption:", error);
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
              <h5 className="mb-0"><i className="fa-solid fa-shield-halved me-2"></i> {localStorage.getItem('lang') === 'en' ? 'Add Exemption' : 'طلب إعفاء'}</h5>
            </Card.Header>
            <Card.Body>
              {message.text && <Alert variant={message.type} className="mb-4">{message.text}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">رقم قومي للممول <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="personId"
                        value={formData.personId}
                        onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">رقم العقار (Property ID) <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="propertyId"
                        value={formData.propertyId}
                        onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">نوع الإعفاء <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        name="exemptionType"
                        value={formData.exemptionType}
                        onChange={(e) => setFormData({ ...formData, exemptionType: e.target.value })}
                        required
                      >
                        <option value="">اختر نوع الإعفاء...</option>
                        <option value="basic_unit">الوحدة السكنية الأساسية</option>
                        <option value="disability">إعفاء ذوي الإعاقة</option>
                        <option value="waqf">ملكيات وقفية</option>
                        <option value="charity">جمعيات خيرية</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">رقم المادة القانونية</Form.Label>
                      <Form.Control
                        type="text"
                        name="clauseNo"
                        placeholder="مثال: مادة 37"
                        value={formData.clauseNo}
                        onChange={(e) => setFormData({ ...formData, clauseNo: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-primary fw-bold">تاريخ بداية الإعفاء</Form.Label>
                            <Form.Control 
                                type="date" 
                                value={formData.exemptionStartDate}
                                onChange={(e) => setFormData({ ...formData, exemptionStartDate: e.target.value })}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-primary fw-bold">تاريخ نهاية الإعفاء</Form.Label>
                            <Form.Control 
                                type="date" 
                                value={formData.exemptionEndDate}
                                onChange={(e) => setFormData({ ...formData, exemptionEndDate: e.target.value })}
                            />
                            <Form.Text className="text-muted">اتركه فارغاً إذا كان الإعفاء دائم</Form.Text>
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="text-primary fw-bold">رفع المستندات (عقد ملكية / صورة البطاقة) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="file"
                    name="attachment"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.png"
                    required
                  />
                  <Form.Text className="text-muted">يمكنك رفع ملف بصيغة PDF أو صورة. الحد الأقصى 5 ميجا.</Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-between gap-2 mt-5">
                  <Button variant="secondary" onClick={() => navigate('/data-entry/home')}>إلغاء</Button>
                  <Button variant="success" type="submit" disabled={loading} size="lg" className="fw-bold">
                    {loading ? <Spinner size="sm" animation="border" /> : 'حفظ الطلب'}
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

export default AddExemption;