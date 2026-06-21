import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Container, Row, Spinner, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getEnrichedUnits } from '../../services/propertyService';
import { getAppeals } from '../../services/appealService';

const readStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const money = (value) => `${Math.round(Number(value) || 0).toLocaleString('ar-EG')} ج.م`;

const ManagerHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState([]);
  const [payments, setPayments] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [exemptions, setExemptions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [enrichedUnits, appealsData] = await Promise.all([
          getEnrichedUnits(),
          getAppeals()
        ]);

        setUnits(enrichedUnits);
        setAppeals(appealsData);
        setPayments(readStorage('tax_payments'));
        setInstallments(readStorage('tax_installments'));
        setExemptions(readStorage('exemptions'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const dashboard = useMemo(() => {
    const pendingApproval = units.filter((unit) => unit.status === 'Pending_Manager');
    const paidUnits = units.filter((unit) => unit.status === 'Paid');
    const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.paidAmount || 0), 0);
    const pendingInstallments = installments.filter((installment) => installment.status === 'Pending');
    const pendingAppeals = appeals.filter((appeal) => appeal.status === 'Pending_Manager_Appeal');
    const pendingExemptions = exemptions.filter((exemption) => exemption.status === 'Pending');

    return {
      pendingApproval,
      paidUnits,
      totalRevenue,
      pendingInstallments,
      pendingAppeals,
      pendingExemptions,
      recentPayments: [...payments]
        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
        .slice(0, 5)
    };
  }, [appeals, exemptions, installments, payments, units]);

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;
  }

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h3 className="section-title mb-1">مكتب المدير العام</h3>
          <p className="text-muted mb-0">لوحة متابعة تشغيلية مبنية على الملفات والمدفوعات الحالية</p>
        </Col>
        <Col md="auto" className="d-flex gap-2">
          <Button variant="primary" onClick={() => navigate('/manager/verdict')}>
            <i className="fa-solid fa-stamp me-2"></i>
            الاعتمادات
          </Button>
          <Button variant="outline-primary" onClick={() => navigate('/manager/reports')}>
            <i className="fa-solid fa-chart-pie me-2"></i>
            التقارير
          </Button>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="metric-card h-100">
            <Card.Body>
              <div className="metric-icon mb-3"><i className="fa-solid fa-file-signature"></i></div>
              <div className="text-muted">قرارات معلقة</div>
              <h4 className="fw-bold mb-0">{dashboard.pendingApproval.length}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card h-100">
            <Card.Body>
              <div className="metric-icon mb-3"><i className="fa-solid fa-coins"></i></div>
              <div className="text-muted">تحصيل فعلي</div>
              <h4 className="fw-bold text-success mb-0">{money(dashboard.totalRevenue)}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card h-100">
            <Card.Body>
              <div className="metric-icon mb-3"><i className="fa-solid fa-calendar-days"></i></div>
              <div className="text-muted">أقساط مستحقة</div>
              <h4 className="fw-bold mb-0">{dashboard.pendingInstallments.length}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card h-100">
            <Card.Body>
              <div className="metric-icon mb-3"><i className="fa-solid fa-scale-balanced"></i></div>
              <div className="text-muted">طعون وإعفاءات</div>
              <h4 className="fw-bold mb-0">{dashboard.pendingAppeals.length + dashboard.pendingExemptions.length}</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={7}>
          <Card className="h-100">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <span className="fw-bold">ملفات تحتاج قرار</span>
              <Button size="sm" variant="outline-primary" onClick={() => navigate('/manager/verdict')}>فتح قائمة الاعتماد</Button>
            </Card.Header>
            <Card.Body className="p-0">
              {dashboard.pendingApproval.length === 0 ? (
                <div className="text-center text-muted py-5">لا توجد ملفات معلقة حاليًا</div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>الوحدة</th>
                      <th>المالك</th>
                      <th>العنوان</th>
                      <th>الضريبة</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.pendingApproval.slice(0, 6).map((unit) => (
                      <tr key={unit.id} className="table-action-row">
                        <td className="fw-bold">#{unit.id}</td>
                        <td>{unit.ownerName || '-'}</td>
                        <td><small>{unit.propertyAddress || '-'}</small></td>
                        <td>{money(unit.tax)}</td>
                        <td><Badge bg="warning">ينتظر توقيع</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="h-100">
            <Card.Header className="bg-white fw-bold">آخر عمليات التحصيل</Card.Header>
            <Card.Body className="p-0">
              {dashboard.recentPayments.length === 0 ? (
                <div className="text-center text-muted py-5">لا توجد مدفوعات مسجلة بعد</div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>الإيصال</th>
                      <th>المبلغ</th>
                      <th>التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentPayments.map((payment) => (
                      <tr key={payment.id} className="table-action-row">
                        <td className="fw-bold">{payment.receiptNo || '-'}</td>
                        <td className="text-success fw-bold">{money(payment.paidAmount)}</td>
                        <td>{new Date(payment.paymentDate).toLocaleDateString('ar-EG')}</td>
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

export default ManagerHome;
