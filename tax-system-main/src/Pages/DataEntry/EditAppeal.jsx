import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import { updateAppeal } from '../../services/appealService';

// بيانات وهمية للعرض عند تحميل الصفحة
const mockTaxAssessments = [
  { id: 101, taxYear: 2023, annualTax: 5000, unitId: 'U-1024', personId: '29501011223344', citizenName: 'أحمد محمد علي' },
];

const fetchAppealById = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const foundAssessment = mockTaxAssessments[0]; // محاكاة أن هذا الطعن مرتبط بالربط 101
      resolve({
        id: id,
        taxAssessmentId: foundAssessment.id,
        assessmentDetails: foundAssessment, // نرسل تفاصيل الربط لتظهر في الكارت
        appealReason: 'القيمة السوقية للعقار لا تعكس الحقيقة الفعلية للسعر في المنطقة المحيطة.',
        appealDate: '2023-10-20',
        file: null 
      });
    }, 500);
  });
};

const EditAppeal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [assessmentDetails, setAssessmentDetails] = useState(null);
  
  const [formData, setFormData] = useState({
    appealReason: '',
    appealDate: '',
    file: null 
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAppealById(id);
        setAssessmentDetails(data.assessmentDetails);
        setFormData({
          appealReason: data.appealReason,
          appealDate: data.appealDate,
          file: null
        });
      } catch (error) {
        setMessage({ text: 'حدث خطأ أثناء تحميل البيانات', type: 'danger' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      await updateAppeal(id, {
        appealDate: formData.appealDate,
        appealReason: formData.appealReason,
        fileName: formData.file?.name || undefined
      });
      
      setMessage({ text: 'تم تحديث بيانات الطعن بنجاح!', type: 'success' });
      setTimeout(() => navigate('/data-entry/home'), 2000);
    } catch (error) {
      setMessage({ text: error.message || 'حدث خطأ أثناء التحديث', type: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm border-0 border-top border-5 border-primary">
            <Card.Header className="bg-primary text-white py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                    <small className="text-white">تعديل طلب</small>
                    <Card.Title className="mb-0 fs-4 fw-bold">تعديل طعن ضريبي (رقم: {id})</Card.Title>
                </div>
                <Badge bg="warning" text="dark" className="fs-6">تحديث</Badge> 
              </div>
            </Card.Header>
            
            <Card.Body>
              {message.text && <Alert variant={message.type} className="mb-4">{message.text}</Alert>}

              <Form onSubmit={handleSubmit}>
                {/* كارت البيانات التلقائية (مقروء فقط) */}
                {assessmentDetails && (
                  <Card className="mb-4 bg-light border-secondary">
                    <Card.Body>
                      <Card.Title className="text-muted mb-3 h6">بيانات الربط الضريبي (لا يمكن تعديلها)</Card.Title>
                      <Row>
                        <Col md={4}>
                          <Form.Label className="text-secondary fw-bold">اسم المالك</Form.Label>
                          <Form.Control type="text" value={assessmentDetails.citizenName} readOnly plaintext className="fw-bold fs-5" />
                        </Col>
                        <Col md={4}>
                          <Form.Label className="text-secondary fw-bold">رقم الوحدة</Form.Label>
                          <Form.Control type="text" value={assessmentDetails.unitId} readOnly plaintext className="fw-bold fs-5" />
                        </Col>
                        <Col md={4}>
                          <Form.Label className="text-secondary fw-bold">المبلغ الضريبي</Form.Label>
                          <Form.Control type="text" value={`${assessmentDetails.annualTax} ج.م`} readOnly plaintext className="fw-bold fs-5 text-danger" />
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                )}

                {/* حقول التعديل الفعلية */}
                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">تاريخ تقديم الطعن</Form.Label>
                      <Form.Control 
                        type="date" 
                        value={formData.appealDate}
                        onChange={(e) => setFormData({ ...formData, appealDate: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">تحديث المستندات</Form.Label>
                      <Form.Control
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.png"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="text-primary fw-bold">سبب الطعن</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={formData.appealReason}
                    onChange={(e) => setFormData({ ...formData, appealReason: e.target.value })}
                    required
                  />
                </Form.Group>

                <div className="d-flex justify-content-between gap-3 mt-5">
                  <Button variant="secondary" onClick={() => navigate('/data-entry/home')} size="lg">إلغاء</Button>
                  <Button variant="success" type="submit" disabled={submitting} size="lg" className="fw-bold">
                    {submitting ? <Spinner size="sm" animation="border" /> : 'حفظ التعديلات'}
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

export default EditAppeal;