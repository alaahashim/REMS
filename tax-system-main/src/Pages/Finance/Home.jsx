import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Spinner, Badge } from 'react-bootstrap';
import { getEnrichedUnits } from '../../services/propertyService';
import { getFinancialStats } from '../../services/financeService';
import { useLanguage } from '../../context/LanguageContext'; 
import { useDynamicTranslation } from '../../utils/useDynamicTranslation'; 

// ── مكون مساعد لترجمة البيانات اللي جاية من الداتا بيز ──
const DynText = ({ text, lang }) => {
  const translated = useDynamicTranslation(text || '', lang);
  return <>{translated || '-'}</>;
};

const FinanceHome = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage(); 

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalCollected: 0, totalDue: 0 });
  const [paidUnits, setPaidUnits] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [unitsData, financeStats] = await Promise.all([
          getEnrichedUnits(),
          getFinancialStats()
        ]);
        
        // تصفية: الوحدات التي تم دفعها فقط
        const paid = unitsData.filter(u => u.status === 'Paid');
        setPaidUnits(paid);
        
        setStats(financeStats);
      } catch (error) {
        console.error("Error loading finance:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          {/* تم استخدام كلمات موجودة مسبقاً في phraseTranslations لتتم ترجمتها أوتوماتيكياً */}
          <h3 className="text-success fw-bold">التحصيل والسداد</h3>
          <p className="text-muted mb-0">آخر عمليات التحصيل</p>
        </Col>
      </Row>

      {/* البطاقات الإحصائية */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm border-start border-4 border-success">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase mb-1">إجمالي التحصيل</h6>
                <h3 className="fw-bold mb-0 text-success">{loading ? '...' : Math.round(stats.totalCollected).toLocaleString('ar-EG')} ج.م</h3>
              </div>
              <div className="text-success opacity-25 fs-1"><i className="fa-solid fa-coins"></i></div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm border-start border-4 border-warning">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase mb-1">إجمالي المستحق</h6>
                <h3 className="fw-bold mb-0 text-warning">{loading ? '...' : Math.round(stats.totalDue).toLocaleString('ar-EG')} ج.م</h3>
              </div>
              <div className="text-warning opacity-25 fs-1"><i className="fa-solid fa-file-invoice-dollar"></i></div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* زر تسجيل سداد جديد */}
      <Row className="mb-4">
          <Col className="text-end">
              <Button variant="success" size="lg" onClick={() => navigate('/finance/collect')}>
                  <i className="fa-solid fa-plus-circle me-2"></i> تسجيل دفع جديد
              </Button>
          </Col>
      </Row>

      {/* جدول السجل المالي */}
      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white fw-bold">آخر عمليات التحصيل</Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center p-5"><Spinner animation="border" /></div>
              ) : paidUnits.length === 0 ? (
                <div className="text-center py-5 text-muted">لا توجد مدفوعات مسجلة بعد</div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>رقم الوحدة</th>
                      <th>المالك</th>
                      <th>المبلغ</th>
                      <th>طريقة الدفع</th>
                      <th>الإيصال</th>
                      <th>تاريخ السداد</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paidUnits.map((prop, index) => (
                      <tr key={prop.id}>
                        <td>{index + 1}</td>
                        <td className="fw-bold text-primary">وحدة #{prop.id}</td>
                        <td><DynText text={prop.ownerName} lang={lang} /></td>
                        <td className="fw-bold">{Math.round(prop.tax || prop.paidAmount || 0).toLocaleString('ar-EG')} ج.م</td>
                        <td>
                            <Badge bg="secondary"><DynText text={prop.paymentMethod} lang={lang} /></Badge>
                        </td>
                        <td>{prop.receiptNo}</td>
                        <td>{new Date(prop.paymentDate).toLocaleDateString('ar-EG')}</td>
                        <td>
                           <Badge bg="success">مدفوع</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FinanceHome;