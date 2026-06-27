import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Container, Row, Spinner, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getEnrichedUnits } from '../../services/propertyService';
import { getManagerAppeals, getManagerExemptions } from '../../services/managerService';

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
  const [payments, setPayments] = useState([]);         // localStorage – لا يوجد API بعد
  const [installments, setInstallments] = useState([]); // localStorage – لا يوجد API بعد
  const [appeals, setAppeals] = useState([]);
  const [exemptions, setExemptions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [enrichedUnits, appealsData, exemptionsData] = await Promise.all([
          getEnrichedUnits(),
          getManagerAppeals(),
          getManagerExemptions(),
        ]);

        setUnits(enrichedUnits);
        setAppeals(appealsData);
        setExemptions(exemptionsData);

        // بيانات مؤقتة من localStorage حتى يتوفر API خاص بها
        setPayments(readStorage('tax_payments'));
        setInstallments(readStorage('tax_installments'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const dashboard = useMemo(() => {
    const pendingApproval = units.filter((unit) => unit.status === 'Pending_Manager');
    const paidUnits = units.filter((unit) => unit.status === 'Paid');
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.paidAmount || 0), 0);
    const pendingInstallments = installments.filter((i) => i.status === 'Pending');
    const pendingAppeals = appeals.filter((a) => a.status === 'Pending_Manager_Appeal');
    const pendingExemptions = exemptions.filter((e) => e.status === 'PendingManager');

    return {
      pendingApproval,
      paidUnits,
      totalRevenue,
      pendingInstallments,
      pendingAppeals,
      pendingExemptions,
      recentPayments: [...payments]
        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
        .slice(0, 5),
    };
  }, [appeals, exemptions, installments, payments, units]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="mt-4">
      {/* Header */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h3 className="fw-bold text-dark mb-1">مكتب المدير العام</h3>
          <p className="text-muted mb-0">لوحة متابعة تشغيلية فورية</p>
        </Col>
        <Col md="auto" className="d-flex gap-2">
          <Button variant="primary" className="px-4" onClick={() => navigate('/manager/verdict')}>
            <i className="fa-solid fa-stamp me-2"></i>الاعتمادات
          </Button>
          <Button variant="outline-dark" onClick={() => navigate('/manager/reports')}>
            <i className="fa-solid fa-chart-pie me-2"></i>التقارير
          </Button>
        </Col>
      </Row>

      {/* KPI Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 border-start border-4 border-warning">
            <Card.Body className="d-flex align-items-center p-3">
              <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                <i className="fa-solid fa-file-signature fa-2x text-warning"></i>
              </div>
              <div>
                <div className="text-muted small fw-bold">قرارات معلقة</div>
                <h3 className="fw-bold mb-0 text-dark">{dashboard.pendingApproval.length}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 border-start border-4 border-success">
            <Card.Body className="d-flex align-items-center p-3">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                <i className="fa-solid fa-coins fa-2x text-success"></i>
              </div>
              <div>
                <div className="text-muted small fw-bold">تحصيل فعلي</div>
                <h3 className="fw-bold mb-0 text-success">{money(dashboard.totalRevenue)}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 border-start border-4 border-info">
            <Card.Body className="d-flex align-items-center p-3">
              <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                <i className="fa-solid fa-calendar-days fa-2x text-info"></i>
              </div>
              <div>
                <div className="text-muted small fw-bold">أقساط مستحقة</div>
                <h3 className="fw-bold mb-0 text-dark">{dashboard.pendingInstallments.length}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 border-start border-4 border-danger">
            <Card.Body className="d-flex align-items-center p-3">
              <div className="rounded-circle bg-danger bg-opacity-10 p-3 me-3">
                <i className="fa-solid fa-scale-balanced fa-2x text-danger"></i>
              </div>
              <div>
                <div className="text-muted small fw-bold">طعون وإعفاءات</div>
                <h3 className="fw-bold mb-0 text-dark">
                  {dashboard.pendingAppeals.length + dashboard.pendingExemptions.length}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tables Section */}
      <Row className="g-4">
        {/* ملفات تحتاج قرار */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center border-bottom py-3">
              <span className="fw-bold text-dark">
                <i className="fa-solid fa-clock-rotate-left me-2 text-warning"></i>ملفات تحتاج قرار
              </span>
              <Button size="sm" variant="outline-primary" onClick={() => navigate('/manager/verdict')}>
                عرض الكل
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              {dashboard.pendingApproval.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="fa-solid fa-check-circle fa-3x text-success mb-3 d-block"></i>
                  لا توجد ملفات معلقة حاليًا
                </div>
              ) : (
                <Table hover responsive className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="text-center">#</th>
                      <th>المالك</th>
                      <th>العنوان</th>
                      <th className="text-end">الضريبة</th>
                      <th className="text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.pendingApproval.slice(0, 5).map((unit) => (
                      <tr
                        key={unit.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/manager/verdict')}
                      >
                        <td className="text-center fw-bold text-primary">#{unit.id}</td>
                        <td className="fw-bold">{unit.ownerName || '-'}</td>
                        <td className="text-muted text-truncate" style={{ maxWidth: '200px' }}>
                          {unit.propertyAddress || '-'}
                        </td>
                        <td className="text-end fw-bold text-success">{money(unit.tax)}</td>
                        <td className="text-center">
                          <Badge bg="warning" text="dark">ينتظر توقيع</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* آخر عمليات التحصيل – localStorage */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-transparent fw-bold text-dark border-bottom py-3">
              <i className="fa-solid fa-receipt me-2 text-success"></i>آخر عمليات التحصيل
            </Card.Header>
            <Card.Body className="p-0">
              {dashboard.recentPayments.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="fa-solid fa-wallet fa-3x mb-3 d-block"></i>
                  لا توجد مدفوعات مسجلة بعد
                </div>
              ) : (
                <Table hover responsive className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>الإيصال</th>
                      <th className="text-end">المبلغ</th>
                      <th>التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-success bg-opacity-10 p-2 me-2">
                              <i className="fa-solid fa-check text-success"></i>
                            </div>
                            <span className="fw-bold">{payment.receiptNo || '-'}</span>
                          </div>
                        </td>
                        <td className="text-end fw-bold text-success">{money(payment.paidAmount)}</td>
                        <td className="text-muted">
                          {new Date(payment.paymentDate).toLocaleDateString('ar-EG')}
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

export default ManagerHome;