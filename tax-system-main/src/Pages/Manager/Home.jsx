import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { getManagerAppeals, getManagerExemptions } from '../../services/managerService';
import { getFinanceDashboard, getPaymentHistory, getEmployeesPerformance } from '../../services/financeService';

// ─── helpers ─────────────────────────────────────────────────────────────────
const money = (value) =>
  `${Math.round(Number(value) || 0).toLocaleString('ar-EG')} ج.م`;

// ─── component ────────────────────────────────────────────────────────────────
const ManagerHome = () => {
  const navigate = useNavigate();

  // ── state ──────────────────────────────────────────────────────────────────
  const [loading, setLoading]               = useState(true);
  const [units, setUnits]                   = useState([]);
  const [appeals, setAppeals]               = useState([]);
  const [exemptions, setExemptions]         = useState([]);
  const [financeDashboard, setFinanceDashboard] = useState(null);
  const [employeesStats, setEmployeesStats] = useState([]);
  // history pagination
  const [recentPayments, setRecentPayments] = useState([]);
  const [historyMeta, setHistoryMeta]       = useState(null);
  const [historyPage, setHistoryPage]       = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── fetch history ──────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async (page = 1) => {
    setHistoryLoading(true);
    try {
      const result = await getPaymentHistory(page, 6);
      setRecentPayments(result.items ?? []);
      setHistoryMeta(result);
      setHistoryPage(page);
    } catch {
      // silent
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // ── main fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      // الوحدات — غير حرجة، فشلها لا يظهر error
      try {
        const enrichedUnits = await getEnrichedUnits();
        setUnits(enrichedUnits);
      } catch {
        console.warn('Enriched units unavailable');
      }

      // الطعون والإعفاءات — مهمة للـ KPI فقط، فشلها صامت
      try {
        const [appealsData, exemptionsData] = await Promise.all([
          getManagerAppeals(),
          getManagerExemptions(),
        ]);
        setAppeals(appealsData);
        setExemptions(exemptionsData);
      } catch {
        console.warn('Appeals/Exemptions unavailable');
      }

      try {
        const financeData = await getFinanceDashboard();
        setFinanceDashboard(financeData);
      } catch {
        console.warn('Finance dashboard unavailable');
      }

      try {
        const employees = await getEmployeesPerformance();
        console.log('employees sample:', employees?.[0]);
        setEmployeesStats(employees);
      } catch {
        console.warn('Employees performance unavailable');
      }

      await fetchHistory(1);
      setLoading(false);
    };

    load();
  }, [fetchHistory]);

  // ── derived KPIs ───────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const totalCollected  = financeDashboard?.totalCollected      ?? 0;
    const remainingAmount = financeDashboard?.remainingAmount     ?? 0;
    const totalDue        = totalCollected + remainingAmount;
    const collectionPct   = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;

    return {
      totalCollected,
      remainingAmount,
      totalDue,
      collectionPct,
      overdueInstallments:  financeDashboard?.overdueInstallments ?? 0,
      paidAssessments:      financeDashboard?.paidAssessments     ?? 0,
      totalAssessments:     financeDashboard?.totalAssessments    ?? 0,
      pendingAppeals:       appeals.filter((a) => a.status === 'PendingManager').length,
      pendingExemptions:    exemptions.filter((e) => e.status === 'PendingManager').length,
      pendingApproval:      units.filter((u) => u.appealStatus === 'PendingManager').length,
    };
  }, [financeDashboard, appeals, exemptions, units]);

  // ── loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="mt-4">

      {/* ── Header ── */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h3 className="fw-bold text-dark mb-1">مكتب المدير العام</h3>
          <p className="text-muted mb-0">لوحة متابعة تشغيلية فورية</p>
        </Col>
        <Col md="auto">
          <Button variant="outline-dark" onClick={() => navigate('/manager/reports')}>
            <i className="fa-solid fa-chart-pie me-2"></i>التقارير
          </Button>
        </Col>
      </Row>

      {/* ── KPI Cards ── */}
      <Row className="g-3 mb-4">

        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 border-start border-4 border-success">
            <Card.Body className="d-flex align-items-center p-3">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                <i className="fa-solid fa-coins fa-2x text-success"></i>
              </div>
              <div>
                <div className="text-muted small fw-bold">تحصيل فعلي</div>
                <h4 className="fw-bold mb-0 text-success">{money(kpi.totalCollected)}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 border-start border-4 border-danger">
            <Card.Body className="d-flex align-items-center p-3">
              <div className="rounded-circle bg-danger bg-opacity-10 p-3 me-3">
                <i className="fa-solid fa-hourglass-half fa-2x text-danger"></i>
              </div>
              <div>
                <div className="text-muted small fw-bold">المتبقي للتحصيل</div>
                <h4 className="fw-bold mb-0 text-danger">{money(kpi.remainingAmount)}</h4>
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
                <div className="text-muted small fw-bold">أقساط متأخرة</div>
                <h4 className="fw-bold mb-0 text-dark">{kpi.overdueInstallments}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 border-start border-4 border-warning">
            <Card.Body className="d-flex align-items-center p-3">
              <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                <i className="fa-solid fa-scale-balanced fa-2x text-warning"></i>
              </div>
              <div>
                <div className="text-muted small fw-bold">طعون وإعفاءات معلقة</div>
                <h4 className="fw-bold mb-0 text-dark">
                  {kpi.pendingAppeals + kpi.pendingExemptions}
                </h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

      </Row>

      {/* ── Collection Progress ── */}
      <Card className="border-0 shadow-sm rounded-3 mb-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold text-dark">
              <i className="fa-solid fa-chart-line me-2 text-success"></i>
              نسبة التحصيل
            </span>
            <span className="text-muted small">
              {money(kpi.totalCollected)} من {money(kpi.totalDue)}
            </span>
          </div>
          <ProgressBar
            now={kpi.collectionPct}
            variant="success"
            style={{ height: 20, borderRadius: 10 }}
            label={`${kpi.collectionPct}%`}
          />
          <Row className="mt-3 text-center g-0">
            <Col className="border-end">
              <div className="fw-bold text-dark">{kpi.totalAssessments}</div>
              <div className="text-muted small">إجمالي التقييمات</div>
            </Col>
            <Col className="border-end">
              <div className="fw-bold text-success">{kpi.paidAssessments}</div>
              <div className="text-muted small">مدفوع بالكامل</div>
            </Col>
            <Col>
              <div className="fw-bold text-danger">{kpi.overdueInstallments}</div>
              <div className="text-muted small">قسط متأخر</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ── Payment History + Employees Performance ── */}
      <Row className="g-4 mb-4">

        {/* آخر عمليات التحصيل */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-transparent fw-bold text-dark border-bottom py-3">
              <i className="fa-solid fa-receipt me-2 text-success"></i>
              آخر عمليات التحصيل
            </Card.Header>
            <Card.Body className="p-0 d-flex flex-column">
              {historyLoading ? (
                <div className="text-center py-5 flex-grow-1 d-flex align-items-center justify-content-center">
                  <Spinner animation="border" size="sm" variant="success" />
                </div>
              ) : recentPayments.length === 0 ? (
                <div className="text-center text-muted py-5 flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                  <i className="fa-solid fa-wallet fa-3x mb-3"></i>
                  لا توجد مدفوعات مسجلة بعد
                </div>
              ) : (
                <>
                  <div className="flex-grow-1">
                    <Table hover responsive className="mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>الإيصال</th>
                          <th className="text-end">المبلغ</th>
                          <th>التاريخ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentPayments.map((payment, index) => (
                          <tr key={payment.receiptNo ?? index}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-success bg-opacity-10 p-2 me-2">
                                  <i className="fa-solid fa-check text-success"></i>
                                </div>
                                <span className="fw-bold">{payment.receiptNo || '-'}</span>
                              </div>
                            </td>
                            <td className="text-end fw-bold text-success">
                              {money(payment.totalPaid ?? payment.paidAmount)}
                            </td>
                            <td className="text-muted">
                              {new Date(payment.paymentDate).toLocaleDateString('ar-EG')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {historyMeta && historyMeta.totalPages > 1 && (
                    <div className="d-flex justify-content-center align-items-center gap-1 py-3 border-top flex-wrap">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        disabled={historyPage === 1 || historyLoading}
                        onClick={() => fetchHistory(historyPage - 1)}
                      >
                        <i className="fa-solid fa-chevron-right"></i>
                      </Button>
                      {Array.from({ length: historyMeta.totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === historyMeta.totalPages || Math.abs(p - historyPage) <= 1)
                        .reduce((acc, p, idx, arr) => {
                          if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((item, idx) =>
                          item === '...' ? (
                            <span key={`dots-${idx}`} className="px-1 text-muted">…</span>
                          ) : (
                            <Button
                              key={item}
                              size="sm"
                              variant={item === historyPage ? 'success' : 'outline-secondary'}
                              onClick={() => fetchHistory(item)}
                              disabled={historyLoading}
                              style={{ minWidth: 34 }}
                            >
                              {item}
                            </Button>
                          )
                        )}
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        disabled={historyPage === historyMeta.totalPages || historyLoading}
                        onClick={() => fetchHistory(historyPage + 1)}
                      >
                        <i className="fa-solid fa-chevron-left"></i>
                      </Button>
                    </div>
                  )}
                  {historyMeta && (
                    <div className="text-center text-muted small pb-2">
                      صفحة {historyPage} من {historyMeta.totalPages}
                      &nbsp;·&nbsp;إجمالي {historyMeta.totalCount} عملية
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* أداء الموظفين */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-transparent fw-bold text-dark border-bottom py-3">
              <i className="fa-solid fa-users-gear me-2 text-primary"></i>
              أداء الموظفين
            </Card.Header>
            <Card.Body className="p-0">
              {employeesStats.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="fa-solid fa-users fa-3x mb-3 d-block"></i>
                  لا توجد بيانات أداء متاحة
                </div>
              ) : (
                <Table hover responsive className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="text-center">#</th>
                      <th>الموظف</th>
                      <th>القسم</th>
                      <th className="text-center">المهام المنجزة</th>
                      <th className="text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeesStats.map((emp, index) => (
                      <tr key={emp.employeeId ?? emp.EmployeeId ?? emp.id ?? index}>
                        <td className="text-center text-muted">{index + 1}</td>
                        <td className="fw-bold">
                          {emp.employeeName ?? emp.EmployeeName ?? emp.name ?? '-'}
                        </td>
                        <td>
                          <Badge bg="light" text="dark" className="border">
                            {emp.department ?? emp.Department ?? '-'}
                          </Badge>
                        </td>
                        <td className="text-center">
                          {emp.tasksDone ?? emp.TasksDone ?? 0}
                        </td>
                        <td className="text-center">
                          <Badge bg={(emp.isActive ?? emp.IsActive) ? 'success' : 'danger'}>
                            {(emp.isActive ?? emp.IsActive) ? 'نشط' : 'غير نشط'}
                          </Badge>
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