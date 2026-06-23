import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import { createAppeal } from '../../services/appealService'; 
import { useAuth } from '../../context/AuthContext';

// بيانات وهمية لتمثيل الربطات الضريبية (لاحقاً ستستبدلها بـ API Call)
const mockTaxAssessments = [
  { id: 101, taxYear: 2023, annualTax: 5000, unitId: 'U-1024', personId: '29501011223344', citizenName: 'أحمد محمد علي' },
  { id: 102, taxYear: 2023, annualTax: 12000, unitId: 'U-1050', personId: '28502053344556', citizenName: 'شركة النور للمقاولات' },
  { id: 103, taxYear: 2022, annualTax: 3500, unitId: 'U-1100', personId: '29001019998877', citizenName: 'محمد حسن إبراهيم' },
];

const AddAppeal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // 1. حالة قائمة الربطات
  const [assessments, setAssessments] = useState([]);
  // 2. حالة الربط المختار
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  // 3. حالة البيانات التلقائية التي ستظهر بعد الاختيار
  const [assessmentDetails, setAssessmentDetails] = useState(null);

  // 4. بيانات الطعن الفعلية (اللي هيخليها الموظف)
  const [formData, setFormData] = useState({
    appealReason: '',
    appealDate: new Date().toISOString().split('T')[0],
    file: null 
  });

  // تحميل الربطات الضريبية عند فتح الصفحة
  useEffect(() => {
    // هنا هتستبدل الـ mock بالـ API الحقيقي
    // مثال: const data = await getTaxAssessments();
    setAssessments(mockTaxAssessments);
  }, []);

  // ✨ دالة الاختيار الذكية (تملأ البيانات لوحدها)
  const handleAssessmentSelect = (e) => {
    const assessmentId = e.target.value;
    setSelectedAssessmentId(assessmentId);

    if (assessmentId) {
      const found = assessments.find(a => a.id == assessmentId);
      if (found) {
        setAssessmentDetails({
          citizenName: found.citizenName,
          unitId: found.unitId,
          annualTax: found.annualTax,
          taxYear: found.taxYear
        });
      }
    } else {
      setAssessmentDetails(null); // مسح البيانات لو فضل فارغ
    }
  };

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
      if (!selectedAssessmentId || !formData.appealReason) {
        throw new Error("يجب اختيار الربط الضريبي وكتابة سبب الطعن");
      }

      // تجهيز الـ Payload ليطابق الـ Database (الاعتماد على TaxAssessmentId)
      const payload = {
        taxAssessmentId: Number(selectedAssessmentId),
        appealDate: formData.appealDate,
        appealReason: formData.appealReason,
        status: 'Pending'
        // لا نرسل personId أو unitId لأن الداتابيز يعرفهم من خلال الـ TaxAssessmentId
      };

      await createAppeal(payload, user.id);
      
      setMessage({ 
        text: 'تم تسجيل الطعن على الربط الضريبي بنجاح! يرجى العلم بأنه يوجد رسم تقديم قدره 100 ج.م يجب سداده.', 
        type: 'success' 
      });
      
      setTimeout(() => navigate('/data-entry/home'), 3000);
    } catch (error) {
      if (error.message) setMessage({ text: error.message, type: 'danger' });
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
                    <small className="text-white">تقديم طلب جديد</small>
                    <Card.Title className="mb-0 fs-4 fw-bold">تسجيل طعن ضريبي</Card.Title>
                </div>
                <Badge bg="success" className="fs-6">إضافة</Badge> 
              </div>
            </Card.Header>
            
            <Card.Body>
              {message.text && <Alert variant={message.type} className="mb-4">{message.text}</Alert>}

              <Form onSubmit={handleSubmit}>
                
                {/* 1. حقل اختيار الربط الضريبي */}
                <Form.Group className="mb-4">
                  <Form.Label className="text-primary fw-bold fs-5">اختر الربط الضريبي المراد الطعن عليه <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    size="lg"
                    value={selectedAssessmentId}
                    onChange={handleAssessmentSelect}
                    required
                  >
                    <option value="">-- ابحث واختر رقم الربط الضريبي --</option>
                    {assessments.map((item) => (
                      <option key={item.id} value={item.id}>
                        ربط رقم ({item.id}) - للعام ({item.taxYear}) - الضريبة المستحقة ({item.annualTax} ج.م)
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* 2. البيانات التلقائية (تظهر فقط لو اختار ربط) */}
                {assessmentDetails && (
                  <Card className="mb-4 bg-light border-secondary">
                    <Card.Body>
                      <Card.Title className="text-muted mb-3 h6">بيانات الربط المختار (تلقائية)</Card.Title>
                      <Row>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label className="text-secondary fw-bold">اسم المالك</Form.Label>
                            <Form.Control type="text" value={assessmentDetails.citizenName} readOnly plaintext className="fw-bold fs-5" />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label className="text-secondary fw-bold">رقم الوحدة</Form.Label>
                            <Form.Control type="text" value={assessmentDetails.unitId} readOnly plaintext className="fw-bold fs-5" />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label className="text-secondary fw-bold">المبلغ الضريبي</Form.Label>
                            <Form.Control type="text" value={`${assessmentDetails.annualTax} ج.م`} readOnly plaintext className="fw-bold fs-5 text-danger" />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                )}

                {/* 3. باقي بيانات الطعن (التاريخ والسبب) */}
                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">تاريخ تقديم الطعن</Form.Label>
                      <Form.Control 
                        type="date" 
                        name="appealDate"
                        value={formData.appealDate}
                        onChange={(e) => setFormData({ ...formData, appealDate: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">رفع المستندات الداعمة</Form.Label>
                      <Form.Control
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.png"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="text-primary fw-bold">تفاصيل وسبب الطعن <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="appealReason"
                    placeholder="اكتب هنا أسباب الاعتراض على القيمة الضريبية المحسوبة..."
                    value={formData.appealReason}
                    onChange={(e) => setFormData({ ...formData, appealReason: e.target.value })}
                    required
                  />
                </Form.Group>

                <div className="d-flex justify-content-between gap-3 mt-5">
                  <Button variant="secondary" onClick={() => navigate('/data-entry/home')}>إلغاء والعودة</Button>
                  <Button variant="success" type="submit" disabled={loading} size="lg" className="fw-bold px-5">
                    {loading ? <><Spinner size="sm" animation="border" className="me-2" /> جاري التسجيل...</> : 'تسجيل الطعن'}
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