import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';

const fetchExemptionById = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: id,
        personId: '29501011223344',
        propertyId: 'PR-992',
        exemptionType: 'basic_unit',
        clauseNo: 'مادة 37',
        exemptionStartDate: '2023-01-01',
        exemptionEndDate: '',
        attachment: null
      });
    }, 500);
  });
};

const EditExemption = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [formData, setFormData] = useState({
    personId: '',
    propertyId: '',
    exemptionType: '',
    clauseNo: '',
    exemptionStartDate: '',
    exemptionEndDate: '',
    attachment: null
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchExemptionById(id);
        setFormData(data);
      } catch (error) {
        setMessage({ text: 'خطأ في تحميل البيانات', type: 'danger' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, attachment: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      setMessage({ text: 'تم تحديث طلب الإعفاء بنجاح!', type: 'success' });
      setTimeout(() => navigate('/data-entry/home'), 2000);
    } catch (error) {
      setMessage({ text: 'فشل التحديث', type: 'danger' });
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
                    <Card.Title className="mb-0 fs-4 fw-bold">تعديل طلب إعفاء (رقم: {id})</Card.Title>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {message.text && <Alert variant={message.type} className="mb-4">{message.text}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      {/* تم التعديل: لون العنوان للون الأساسي */}
                      <Form.Label className="text-primary fw-bold">رقم قومي للممول</Form.Label>
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
                      <Form.Label className="text-primary fw-bold">رقم العقار</Form.Label>
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
                      <Form.Label className="text-primary fw-bold">نوع الإعفاء</Form.Label>
                      <Form.Select
                        name="exemptionType"
                        value={formData.exemptionType}
                        onChange={(e) => setFormData({ ...formData, exemptionType: e.target.value })}
                        required
                      >
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
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="text-primary fw-bold">تحديث المستندات</Form.Label>
                  <Form.Control
                    type="file"
                    name="attachment"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.png"
                  />
                </Form.Group>

                <div className="d-flex justify-content-between gap-3 mt-5">
                  <Button variant="secondary" onClick={() => navigate('/data-entry/home')}>إلغاء</Button>
                  {/* تم التعديل: زر الحفظ باللون الأخضر كما في الفورم الأساسية */}
                  <Button variant="success" type="submit" disabled={submitting} className="fw-bold">
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

export default EditExemption;