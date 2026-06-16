import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';

const fetchAppealById = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: id,
        personId: '29501011223344',
        unitId: '1024',
        disputedAmount: '5000',
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

  const [formData, setFormData] = useState({
    personId: '',
    unitId: '',
    disputedAmount: '', 
    appealReason: '',
    appealDate: '',
    file: null 
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAppealById(id);
        setFormData(data);
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
      setMessage({ text: 'تم تحديث بيانات الطعن بنجاح!', type: 'success' });
      setTimeout(() => navigate('/data-entry/home'), 2000);
    } catch (error) {
      setMessage({ text: 'حدث خطأ أثناء التحديث', type: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          {/* تم التعديل: تثبيت الألوان على Primary */}
          <Card className="shadow-sm border-0 border-top border-5 border-primary">
            <Card.Header className="bg-primary text-white py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                    <small className="text-white">تعديل طلب</small>
                    <Card.Title className="mb-0 fs-4 fw-bold">تعديل طعن ضريبي (رقم: {id})</Card.Title>
                </div>
                {/* تم التعديل: البج على الأزرق */}
                <Badge bg="warning" className="fs-6">تحديث</Badge> 
              </div>
            </Card.Header>
            
            <Card.Body>
              {message.text && <Alert variant={message.type} className="mb-4">{message.text}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      {/* تم التعديل: لون العنوان للون الأساسي */}
                      <Form.Label className="text-primary fw-bold">رقم قومي المالك</Form.Label>
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
                      <Form.Label className="text-primary fw-bold">رقم الوحدة (Unit ID)</Form.Label>
                      <Form.Control
                        type="text"
                        name="unitId"
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
                  <Form.Label className="text-primary fw-bold">سبب الطعن</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="appealReason"
                    value={formData.appealReason}
                    onChange={(e) => setFormData({ ...formData, appealReason: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="text-primary fw-bold">تحديث المستندات (محضر / أدلة)</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.png"
                  />
                </Form.Group>

                <div className="d-flex justify-content-between gap-3 mt-5">
                  <Button variant="secondary" onClick={() => navigate('/data-entry/home')}>إلغاء</Button>
                  {/* تم التعديل: زر الحفظ باللون الأخضر كما في الفورم الأساسية */}
                  <Button variant="success" type="submit" disabled={submitting} className="fw-bold">
                    {submitting ? <Spinner size="sm" animation="border" /> : 'تحديث البيانات'}
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