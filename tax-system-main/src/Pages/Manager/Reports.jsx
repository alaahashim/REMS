import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  ProgressBar,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getEnrichedUnits } from '../../services/propertyService';
import {
  getFinanceDashboard,
  getEmployeesPerformance,
} from '../../services/financeService';
import { printDocument } from '../../utils/printDocument';

// ─── helpers ────────────────────────────────────────────────────────────────
const money = (value) =>
  `${Math.round(Number(value) || 0).toLocaleString('ar-EG')} ج.م`;

// ─── component ───────────────────────────────────────────────────────────────
const ManagerReports = () => {
  const navigate = useNavigate();

  const [loading, setLoading]           = useState(true);
  const [units, setUnits]               = useState([]);
  const [financeData, setFinanceData]   = useState(null); // FinanceDashboardDto
  const [employeesStats, setEmployeesStats] = useState([]);
  const [error, setError]               = useState(null);

  // ── fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      setError(null);
      try {
        const [enrichedUnits, finance, employees] = await Promise.all([
    getEnrichedUnits(),
    getFinanceDashboard(),
    getEmployeesPerformance(),
]);

setUnits(enrichedUnits);
setFinanceData(finance);
setEmployeesStats(employees);
      } catch {
        setError('تعذّر تحميل بيانات التقارير. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ── derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    // totalDue = ما تم تحصيله + ما تبقى
    const totalCollected = financeData?.totalCollected      ?? 0;
    const remainingAmount = financeData?.remainingAmount    ?? 0;
    const totalDue        = totalCollected + remainingAmount;

    const collectionPercentage =
      totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;

    // توزيع الضريبة حسب نوع الوحدة (من enrichedUnits)
    const typeTotals = units.reduce((acc, unit) => {
      const key = unit.unitType || 'غير محدد';
      acc[key] = (acc[key] || 0) + Number(unit.tax || 0);
      return acc;
    }, {});

    // مجموع ضرائب الوحدات لحساب النسب النسبية في الشريط
    const unitsTaxTotal = Object.values(typeTotals).reduce((s, v) => s + v, 0);

    return {
      totalDue,
      totalCollected,
      totalPending:          remainingAmount,
      pendingApproval:       units.filter((u) => u.status === 'Pending_Manager').length,
      overdueInstallments:   financeData?.overdueInstallments  ?? 0,
      paidAssessments:       financeData?.paidAssessments      ?? 0,
      totalAssessments:      financeData?.totalAssessments     ?? 0,
      collectionPercentage,
      typeTotals,
      unitsTaxTotal,
    };
  }, [financeData, units]);

  // ── export employee report ─────────────────────────────────────────────────
  const exportEmployeeReport = () => {
    const rows = employeesStats
      .map(
        (employee, index) => `
        <td>${employee.department}</td>
        <td>${employee.name}</td>
        <td>${employee.tasksDone}</td>
        <td>${employee.accuracy}%</td>
        <td>${employee.isActive ? "نشط" : "غير نشط"}</td>
      `
      )
      .join('');

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
<th>المهام</th>
<th>الدقة</th>
<th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="6">لا توجد بيانات أداء متاحة</td></tr>'}
            </tbody>
          </table>
        </main>
      `
    );
  };

  // ── loading / error ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="mt-4">

      {/* ── Error banner ── */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-4">
          <i className="fa-solid fa-triangle-exclamation me-2"></i>
          {error}
        </div>
      )}

      {/* ── Header ── */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">التقارير المالية والإدارية</h3>
          <p className="text-muted mb-0">مؤشرات الأداء الرئيسية (KPIs)</p>
        </div>
        <Button variant="outline-dark" onClick={() => navigate('/manager/home')}>
          <i className="fa-solid fa-arrow-right me-2"></i>عودة للرئيسية
        </Button>
      </div>

      {/* ── KPI Cards ── */}
      <Row className="g-4 mb-4">

        {/* إجمالي المستحق */}
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

        {/* إجمالي التحصيل */}
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 border-start border-4 border-success">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-muted small fw-bold mb-1">إجمالي التحصيل</div>
                  <h4 className="fw-bold text-success mb-0">
                    {money(stats.totalCollected)}
                  </h4>
                </div>
                <i className="fa-solid fa-wallet fa-2x text-success opacity-25"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* المتبقي للتحصيل */}
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 border-start border-4 border-danger">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-muted small fw-bold mb-1">المتبقي للتحصيل</div>
                  <h4 className="fw-bold text-danger mb-0">
                    {money(stats.totalPending)}
                  </h4>
                </div>
                <i className="fa-solid fa-hourglass-half fa-2x text-danger opacity-25"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* بانتظار الاعتماد */}
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

      {/* ── Progress Section ── */}
      <Row className="g-4 mb-4">

        {/* نسبة التحصيل */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-transparent fw-bold text-dark border-bottom py-3">
              <i className="fa-solid fa-chart-line me-2 text-success"></i>
              نسبة التحصيل الكلية
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-center align-items-center py-4 gap-3">

              {/* دائرية بديلة بـ Bootstrap ProgressBar */}
              <div className="w-100 px-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-bold text-dark fs-5">{stats.collectionPercentage}%</span>
                  <span className="text-muted small align-self-end">
                    {money(stats.totalCollected)} من {money(stats.totalDue)}
                  </span>
                </div>
                <ProgressBar
                  now={stats.collectionPercentage}
                  variant="success"
                  style={{ height: 24, borderRadius: 12 }}
                  label={`${stats.collectionPercentage}%`}
                />
              </div>

              {/* إحصائيات إضافية من FinanceDashboardDto */}
              <Row className="w-100 g-2 px-3 mt-1">
                <Col xs={4} className="text-center">
                  <div className="fw-bold text-dark fs-5">{stats.totalAssessments}</div>
                  <div className="text-muted small">إجمالي التقييمات</div>
                </Col>
                <Col xs={4} className="text-center border-start border-end">
                  <div className="fw-bold text-success fs-5">{stats.paidAssessments}</div>
                  <div className="text-muted small">مدفوع بالكامل</div>
                </Col>
                <Col xs={4} className="text-center">
                  <div className="fw-bold text-danger fs-5">{stats.overdueInstallments}</div>
                  <div className="text-muted small">قسط متأخر</div>
                </Col>
              </Row>

            </Card.Body>
          </Card>
        </Col>

        {/* توزيع الضريبة حسب نوع الوحدة */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-transparent fw-bold text-dark border-bottom py-3">
              <i className="fa-solid fa-building me-2 text-info"></i>
              توزيع الضريبة حسب نوع الوحدة
            </Card.Header>
            <Card.Body>
              {Object.entries(stats.typeTotals).length === 0 ? (
                <div className="text-muted text-center py-4">
                  لا توجد وحدات مسجلة
                </div>
              ) : (
                <div>
                  {Object.entries(stats.typeTotals).map(([type, value]) => {
                    const percent =
                      stats.unitsTaxTotal > 0
                        ? Math.round((value / stats.unitsTaxTotal) * 100)
                        : 0;
                    return (
                      <div className="mb-4" key={type}>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="fw-bold text-dark">{type}</span>
                          <span className="text-muted">
                            {money(value)} ({percent}%)
                          </span>
                        </div>
                        <ProgressBar
                          now={percent}
                          variant="info"
                          style={{ height: 22, borderRadius: '10px' }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

      </Row>

      {/* ── Employee Table ── */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Header className="bg-transparent d-flex justify-content-between align-items-center border-bottom py-3">
          <span className="fw-bold text-dark">
            <i className="fa-solid fa-users-gear me-2 text-primary"></i>أداء الموظفين
          </span>
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
              {employeesStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    لا توجد بيانات أداء متاحة
                  </td>
                </tr>
              ) : (
                employeesStats.map((employee, index) => (
                  <tr key={employee.id ?? index}>
                    <td className="text-center text-muted">{index + 1}</td>
                    <td>
                      <Badge bg="light" text="dark" className="border">
    {employee.department}
</Badge>
                    </td>
                    <td className="fw-bold">{employee.name}</td>
                    <td className="text-center">{employee.tasksDone}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                     <ProgressBar
    now={employee.accuracy}
    variant={
        employee.accuracy >= 85
            ? 'success'
            : employee.accuracy >= 60
            ? 'warning'
            : 'danger'
    }
/>

<span>
    {employee.accuracy}%
</span>
                      </div>
                    </td>
                    <td>
                     <Badge
    bg={employee.isActive ? "success" : "danger"}
    className="px-3 py-2"
>
    {employee.isActive ? "نشط" : "غير نشط"}
</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

    </Container>
  );
};

export default ManagerReports;