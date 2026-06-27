import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { getExemptionById, updateExemption } from '../../services/exemptionService';
import { useLanguage } from '../../context/LanguageContext'; // <--- جلب اللغة
import { useDynamicTranslation } from '../../utils/useDynamicTranslation'; // <--- الأداة

// ── مكون مساعد لترجمة الداتا ديناميكياً ──
const DynText = ({ text, lang }) => {
  const translated = useDynamicTranslation(text || '', lang);
  return <>{translated || '-'}</>;
};

const EditExemption = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage(); // <--- جلب اللغة الحالية

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [readOnlyInfo, setReadOnlyInfo] = useState({ ownerName: '', nationalId: '' });

  const [formData, setFormData] = useState({
    unitId: '',
    unitNumber: '',
    exemptionType: '',
    legalReference: '',
    exemptionStartDate: '',
    exemptionEndDate: '',
    file: null
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setMessage({ text: '', type: '' });

      try {
        const data = await getExemptionById(id);

        setReadOnlyInfo({
          ownerName: data.ownerName,
          nationalId: data.nationalId
        });

        setFormData({
          unitId: data.unitId,
          unitNumber: data.unitNumber,
          exemptionType: data.exemptionType,
          legalReference: data.legalReference || '',
          exemptionStartDate: data.exemptionStartDate ? data.exemptionStartDate.split('T')[0] : '',
          exemptionEndDate: data.exemptionEndDate ? data.exemptionEndDate.split('T')[0] : '',
          file: null
        });
      } catch (err) {
        // نص ثابت — مطابق في phraseTranslations
        setMessage({ text: err.message || 'فشلت العملية', type: 'danger' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const updateField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      updateField('file', e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      await updateExemption(id, {
        ExemptionType: formData.exemptionType,
        UnitId: formData.unitId,
        UnitNumber: formData.unitNumber,
        LegalReference: formData.legalReference,
        ExemptionStartDate: formData.exemptionStartDate,
        ExemptionEndDate: formData.exemptionEndDate,
        file: formData.file
      });

      // نص ثابت — سيُضاف لـ phraseTranslations
      setMessage({ text: 'تم تحديث طلب الإعفاء بنجاح!', type: 'success' });
      setTimeout(() => navigate('/data-entry/home'), 1500);
    } catch (err) {
      // نص ثابت — مطابق في phraseTranslations
      setMessage({ text: err.message || 'فشلت العملية', type: 'danger' });
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
                  {/* نص ثابت — مطابق في phraseTranslations */}
                  <small className="text-white">تعديل طلب</small>
                  {/* نص ثابت — مطابق في phraseTranslations + سيُضاف "رقم:" */}
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
                      {/* نص ثابت — مطابق في phraseTranslations */}
                      <Form.Label className="text-primary fw-bold">رقم قومي للممول</Form.Label>
                      <Form.Control
                        type="text"
                        value={readOnlyInfo.nationalId}
                        disabled
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      {/* نص ثابت — تم إضافته في الرد السابق لـ phraseTranslations */}
                      <Form.Label className="text-primary fw-bold">كود الوحدة</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.unitNumber}
                        disabled
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      {/* نص ثابت — مطابق في phraseTranslations */}
                      <Form.Label className="text-primary fw-bold">نوع الإعفاء</Form.Label>
                      <Form.Select
                        value={formData.exemptionType}
                        onChange={(e) => updateField('exemptionType', e.target.value)}
                        required
                      >
                        {/* نصوص ثابتة — مطابقة في phraseTranslations */}
                        <option value="basic_unit">الوحدة السكنية الأساسية</option>
                        <option value="disability">إعفاء ذوي الإعاقة</option>
                        <option value="waqf">ملكيات وقفية</option>
                        <option value="charity">جمعيات خيرية</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      {/* نص ثابت — مطابق في phraseTranslations */}
                      <Form.Label className="text-primary fw-bold">رقم المادة القانونية</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.legalReference}
                        onChange={(e) => updateField('legalReference', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      {/* نص ثابت — مطابق في phraseTranslations */}
                      <Form.Label className="text-primary fw-bold">تاريخ بداية الإعفاء</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.exemptionStartDate}
                        onChange={(e) => updateField('exemptionStartDate', e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      {/* نص ثابت — مطابق في phraseTranslations */}
                      <Form.Label className="text-primary fw-bold">تاريخ نهاية الإعفاء</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.exemptionEndDate}
                        onChange={(e) => updateField('exemptionEndDate', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  {/* نص ثابت — مطابق في phraseTranslations */}
                  <Form.Label className="text-primary fw-bold">تحديث المستندات</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.png"
                  />
                </Form.Group>

                <div className="d-flex justify-content-between gap-3 mt-5">
                  {/* نص ثابت — مطابق في phraseTranslations */}
                  <Button variant="secondary" onClick={() => navigate('/data-entry/home')}>إلغاء</Button>
                  {/* نص ثابت — مطابق في phraseTranslations */}
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