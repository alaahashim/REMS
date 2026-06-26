import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Container, ProgressBar, Row, Spinner, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getEnrichedUnits } from '../../services/propertyService';
import { getEmployeesPerformance } from '../../utils/performance';
import { printDocument } from '../../utils/printDocument';

const readStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const money = (value) => `${Math.round(Number(value) || 0).toLocaleString('ar-EG')} ج.م`;

const ManagerReports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState([]);
  const [payments, setPayments] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [employeesStats, setEmployeesStats] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const enrichedUnits = await getEnrichedUnits();
        setUnits(enrichedUnits);
        setPayments(readStorage('tax_payments'));
        setInstallments(readStorage('tax_installments'));
        setEmployeesStats(getEmployeesPerformance());
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalCollected = payments.reduce((sum, payment) => sum + Number(payment.paidAmount || 0), 0);
    const totalDue = installments.reduce((sum, installment) => sum + Number(installment.amount || 0), 0);
    const totalPending = installments
      .filter((installment) => installment.status === 'Pending')
      .reduce((sum, installment) => sum + Number(installment.amount || 0), 0);
    const pendingApproval = units.filter((unit) => unit.status === 'Pending_Manager').length;
    const paidInstallments = installments.filter((installment) => installment.status === 'Paid').length;
    const collectionPercentage = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;

    const typeTotals = units.reduce((acc, unit) => {
      const key = unit.unitType || 'غير محدد';
      acc[key] = (acc[key] || 0) + Number(unit.tax || 0);
      return acc;
    }, {});

    return {
      totalCollected,
      totalDue,
      totalPending,
      pendingApproval,
      paidInstallments,
      collectionPercentage,
      typeTotals
    };
  }, [installments, payments, units]);

  const exportEmployeeReport = () => {
    const rows = employeesStats.map((employee, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${employee.role}</td>
        <td>${employee.name}</td>
        <td>${employee.tasksDone}</td>
        <td>${employee.score}%</td>
        <td>${employee.details}</td>
      </tr>
    `).join('');

    printDocument(
      'تقرير أداء الموظفين',
      `
        <main class="print-page">
          <header class="print-header">
            <div>
              <h1 class="print-title">تقرير أداء الموظفين</h1>
              <div class="print-subtitle">تاريخ الإصدار: ${new Date().toLocaleString('ar-EG')}</div>
            </div>
          </header>
          <table class="print-table">
            <thead>
              <tr>
                <th>#</th>
                <th>القسم</th>
                <th>الموظف</th>
                <th>المهام المنجزة</th>
                <th>الدقة</th>
                <th>تفاصيل الأداء</th>
              </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="6">لا توجد بيانات أداء متاحة</td></tr>'}</tbody>
          </table>
        </main>
      `
    );
  };

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;
  }

  return (
    <Container fluid className="mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">التقارير المالية والإدارية</h3>
          <p className="text-muted mb-0">مؤشرات الأداء الرئيسية (KPIs)</p>
        </div>
        <Button variant="outline-dark" onClick={() => navigate('/manager/home')}>
          <i className="fa-solid fa-arrow-right me-2"></i>عودة للرئيسية
        </Button>
      </div>

      {/* KPI Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 border-start border-4 border-primary">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-muted small fw-bold mb-1">إجمالي المستحق</div>
                  <h4 className="fw-bold mb-0">{money(stats.totalDue)}</h4>
                </div>
                <i className="fa-solid fa-sack-dollar fa-2x text-primary opacity-25"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 border-start border-4 border-success">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-muted small fw-bold mb-1">إجمالي التحصيل</div>
                  <h4 className="fw-bold text-success mb-0">{money(stats.totalCollected)}</h4>
                </div>
                <i className="fa-solid fa-wallet fa-2x text-success opacity-25"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 border-start border-4 border-danger">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-muted small fw-bold mb-1">المتبقي للتحصيل</div>
                  <h4 className="fw-bold text-danger mb-0">{money(stats.totalPending)}</h4>
                </div>
                <i className="fa-solid fa-hourglass-half fa-2x text-danger opacity-25"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 border-start border-4 border-warning">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-muted small fw-bold mb-1">بانتظار الاعتماد</div>
                  <h4 className="fw-bold mb-0">{stats.pendingApproval} ملف</h4>
                </div>
                <i className="fa-solid fa-file-signature fa-2x text-warning opacity-25"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts / Progress Section */}
      <Row className="g-4 mb-4">
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-transparent fw-bold text-dark border-bottom py-3">
              <i className="fa-solid fa-chart-line me-2 text-success"></i>نسبة التحصيل الكلية
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-center align-items-center py-5">
              <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '150px', height: '150px' }}>
                <ProgressBar 
                  className="w-100" 
                  style={{ height: '150px', transform: 'rotate(-90deg)' }} 
                  now={stats.collectionPercentage} 
                  variant="success"
                />
                <div className="position-absolute fs-2 fw-bold text-dark">
                  {stats.collectionPercentage}%
                </div>
              </div>
              <div className="mt-3 text-muted text-center">
                تم سداد <span className="fw-bold text-success">{stats.paidInstallments}</span> قسط من إجمالي الأقساط
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-transparent fw-bold text-dark border-bottom py-3">
              <i className="fa-solid fa-building me-2 text-info"></i>توزيع الضريبة حسب نوع الوحدة
            </Card.Header>
            <Card.Body>
              {Object.entries(stats.typeTotals).length === 0 ? (
                <div className="text-muted text-center py-4">لا توجد وحدات مسجلة</div>
              ) : (
                <div>
                  {Object.entries(stats.typeTotals).map(([type, value]) => {
                    const percent = stats.totalDue > 0 ? Math.round((value / stats.totalDue) * 100) : 0;
                    return (
                      <div className="mb-4" key={type}>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="fw-bold text-dark">{type}</span>
                          <span className="text-muted">{money(value)} ({percent}%)</span>
                        </div>
                        <ProgressBar now={percent} variant="info" style={{ height: 22, borderRadius: '10px' }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Employee Table */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Header className="bg-transparent d-flex justify-content-between align-items-center border-bottom py-3">
          <span className="fw-bold text-dark"><i className="fa-solid fa-users-gear me-2 text-primary"></i>أداء الموظفين</span>
          <Button size="sm" variant="outline-dark" onClick={exportEmployeeReport}>
            <i className="fa-solid fa-file-pdf me-2"></i>تصدير PDF
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="text-center">#</th>
                <th>القسم</th>
                <th>الموظف</th>
                <th className="text-center">المهام</th>
                <th style={{ minWidth: '180px' }}>الدقة</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {employeesStats.map((employee, index) => (
                <tr key={employee.id || index}>
                  <td className="text-center text-muted">{index + 1}</td>
                  <td>
                    <Badge bg="light" text="dark" className="border">{employee.role}</Badge>
                  </td>
                  <td className="fw-bold">{employee.name}</td>
                  <td className="text-center">{employee.tasksDone}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <ProgressBar 
                        now={employee.score} 
                        variant={employee.score >= 85 ? 'success' : 'warning'} 
                        style={{ height: 10, flex: 1 }} 
                      />
                      <span className="fw-bold text-muted small">{employee.score}%</span>
                    </div>
                  </td>
                  <td>
                    <Badge bg={employee.score >= 85 ? 'success' : employee.tasksDone > 0 ? 'warning' : 'secondary'} className="px-3 py-2">
                      {employee.score >= 85 ? 'ممتاز' : employee.tasksDone > 0 ? 'يحتاج متابعة' : 'غير فعال'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ManagerReports;