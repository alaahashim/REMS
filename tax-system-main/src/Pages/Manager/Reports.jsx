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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="section-title mb-1">التقارير المالية</h3>
          <p className="text-muted mb-0">مؤشرات مبنية على المدفوعات والأقساط والوحدات المسجلة فعليًا</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/manager/home')}>
          <i className="fa-solid fa-arrow-right me-2"></i>
          عودة
        </Button>
      </div>

      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="metric-card h-100">
            <Card.Body>
              <div className="metric-icon mb-3"><i className="fa-solid fa-sack-dollar"></i></div>
              <div className="text-muted">إجمالي المستحق</div>
              <h4 className="fw-bold mb-0">{money(stats.totalDue)}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card h-100">
            <Card.Body>
              <div className="metric-icon mb-3"><i className="fa-solid fa-wallet"></i></div>
              <div className="text-muted">إجمالي التحصيل</div>
              <h4 className="fw-bold text-success mb-0">{money(stats.totalCollected)}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card h-100">
            <Card.Body>
              <div className="metric-icon mb-3"><i className="fa-solid fa-hourglass-half"></i></div>
              <div className="text-muted">المتبقي للتحصيل</div>
              <h4 className="fw-bold mb-0">{money(stats.totalPending)}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card h-100">
            <Card.Body>
              <div className="metric-icon mb-3"><i className="fa-solid fa-file-signature"></i></div>
              <div className="text-muted">بانتظار اعتماد المدير</div>
              <h4 className="fw-bold mb-0">{stats.pendingApproval} ملف</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header className="bg-white fw-bold">نسبة التحصيل</Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>{stats.collectionPercentage}% من إجمالي الأقساط</span>
                <span className="fw-bold">{stats.paidInstallments} قسط مدفوع</span>
              </div>
              <ProgressBar now={stats.collectionPercentage} variant="success" style={{ height: 24 }} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header className="bg-white fw-bold">توزيع الضريبة حسب نوع الوحدة</Card.Header>
            <Card.Body>
              {Object.entries(stats.typeTotals).length === 0 ? (
                <div className="text-muted text-center py-4">لا توجد وحدات مسجلة</div>
              ) : Object.entries(stats.typeTotals).map(([type, value]) => {
                const percent = stats.totalDue > 0 ? Math.round((value / stats.totalDue) * 100) : 0;
                return (
                  <div className="mb-3" key={type}>
                    <div className="d-flex justify-content-between mb-1">
                      <span>{type}</span>
                      <span className="fw-bold">{money(value)}</span>
                    </div>
                    <ProgressBar now={percent} variant="info" style={{ height: 18 }} />
                  </div>
                );
              })}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <span className="fw-bold">أداء الموظفين</span>
          <Button size="sm" variant="outline-primary" onClick={exportEmployeeReport}>
            <i className="fa-solid fa-file-pdf me-2"></i>
            تصدير التقرير PDF
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>القسم</th>
                <th>الموظف</th>
                <th>المهام المنجزة</th>
                <th>الدقة</th>
                <th>تفاصيل</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {employeesStats.map((employee, index) => (
                <tr key={employee.id || index} className="table-action-row">
                  <td>{index + 1}</td>
                  <td>{employee.role}</td>
                  <td className="fw-bold">{employee.name}</td>
                  <td>{employee.tasksDone}</td>
                  <td style={{ minWidth: 150 }}>
                    <ProgressBar now={employee.score} label={`${employee.score}%`} variant={employee.score >= 85 ? 'success' : 'warning'} />
                  </td>
                  <td>{employee.details}</td>
                  <td>
                    <Badge bg={employee.score >= 85 ? 'success' : employee.tasksDone > 0 ? 'warning' : 'secondary'}>
                      {employee.score >= 85 ? 'ممتاز' : employee.tasksDone > 0 ? 'يحتاج متابعة' : 'لا توجد بيانات'}
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
