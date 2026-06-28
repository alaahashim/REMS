import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getEnrichedUnits } from '../../services/propertyService';
import { getManagerAppeals, getManagerExemptions } from '../../services/managerService';
import { getFinanceDashboard, getPaymentHistory } from '../../services/financeService';

// ─── helpers ─────────────────────────────────────────────────────────────────
const money = (value) =>
  `${Math.round(Number(value) || 0).toLocaleString('ar-EG')} ج.م`;

// ─── component ────────────────────────────────────────────────────────────────
const ManagerHome = () => {
  const navigate = useNavigate();

  // ── state ──────────────────────────────────────────────────────────────────
  const [loading, setLoading]                   = useState(true);
  const [units, setUnits]                       = useState([]);
  const [appeals, setAppeals]                   = useState([]);
  const [exemptions, setExemptions]             = useState([]);
  const [financeDashboard, setFinanceDashboard] = useState(null);
  const [error, setError]                       = useState(null);

  // history pagination
  const [recentPayments, setRecentPayments]     = useState([]);
  const [historyMeta, setHistoryMeta]           = useState(null); // { totalPages, pageIndex, … }
  const [historyPage, setHistoryPage]           = useState(1);
  const [historyLoading, setHistoryLoading]     = useState(false);

  // ── fetch history (مستقل — يُعاد استدعاؤه عند تغيير الصفحة) ───────────────
  const fetchHistory = useCallback(async (page = 1) => {
    setHistoryLoading(true);
    try {
      const result = await getPaymentHistory(page, 8); // PagedResult<PaymentHistoryDto>
      setRecentPayments(result.items ?? []);
      setHistoryMeta(result);
      setHistoryPage(page);
    } catch {
      // بصمت — لا تكسر باقي الصفحة
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // ── fetch رئيسي ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDashboardData = async () => {
      setError(null);

      // البيانات الأساسية
      try {
        const [enrichedUnits, appealsData, exemptionsData] = await Promise.all([
          getEnrichedUnits(),
          getManagerAppeals(),
          getManagerExemptions(),
        ]);
        setUnits(enrichedUnits);
        setAppeals(appealsData);
        setExemptions(exemptionsData);
      } catch {
        setError('تعذّر تحميل البيانات الرئيسية. يرجى المحاولة مرة أخرى.');
      }

      // Finance — منفصلة حتى لو فشلت لا تكسر الصفحة
      try {
        const financeData = await getFinanceDashboard();
        setFinanceDashboard(financeData);
      } catch {
        console.warn('Finance dashboard API unavailable');
      }

      // History — الصفحة الأولى
      await fetchHistory(1);

      setLoading(false);
    };

    fetchDashboardData();
  }, [fetchHistory]);

  // ── derived values ─────────────────────────────────────────────────────────
  const dashboard = useMemo(() => ({
    pendingApproval:     units.filter((u) => u.appealStatus === 'PendingManager'),
    pendingAppeals:      appeals.filter((a) => a.status === 'PendingManager'),
    pendingExemptions:   exemptions.filter((e) => e.exemptionStatus === 'PendingManager'),
    totalCollected:      financeDashboard?.totalCollected      ?? 0,
    overdueInstallments: financeDashboard?.overdueInstallments ?? 0,
  }), [appeals, exemptions, financeDashboard, units]);

  // ── loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <Container fluid className="mt-4">

      {/* Error banner */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-4">
          <i className="fa-solid fa-triangle-exclamation me-2"></i>
          {error}
        </div>
      )}

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

        {/* قرارات معلقة */}
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 border-start border-4 border-warning">
            <Card.Body className="d-flex align-items-center p-3">
              <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                <i className="fa-solid fa-file-signature fa-2x text-warning"></i>
              </div>
              <div>
                <div className="text-muted small fw-bold">قرارات معلقة</div>
                <h3 className="fw-bold mb-0 text-dark">
                  {dashboard.pendingApproval.length}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* تحصيل فعلي */}
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 border-start border-4 border-success">
            <Card.Body className="d-flex align-items-center p-3">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                <i className="fa-solid fa-coins fa-2x text-success"></i>
              </div>
              <div>
                <div className="text-muted small fw-bold">تحصيل فعلي</div>
                <h3 className="fw-bold mb-0 text-success">
                  {money(dashboard.totalCollected)}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* أقساط متأخرة */}
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 border-start border-4 border-info">
            <Card.Body className="d-flex align-items-center p-3">
              <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                <i className="fa-solid fa-calendar-days fa-2x text-info"></i>
              </div>
              <div>
                <div className="text-muted small fw-bold">أقساط متأخرة</div>
                <h3 className="fw-bold mb-0 text-dark">
                  {dashboard.overdueInstallments}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* طعون وإعفاءات */}
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
                <i className="fa-solid fa-clock-rotate-left me-2 text-warning"></i>
                ملفات تحتاج قرار
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
                        <td className="text-end fw-bold text-success">
                          {money(unit.tax)}
                        </td>
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

        {/* آخر عمليات التحصيل */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-transparent fw-bold text-dark border-bottom py-3">
              <i className="fa-solid fa-receipt me-2 text-success"></i>
              آخر عمليات التحصيل
            </Card.Header>

            <Card.Body className="p-0 d-flex flex-column">

              {/* المحتوى */}
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

                  {/* Pagination */}
                  {historyMeta && historyMeta.totalPages > 1 && (
                    <div className="d-flex justify-content-center align-items-center gap-1 py-3 border-top flex-wrap">

                      {/* زر السابق */}
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        disabled={historyPage === 1 || historyLoading}
                        onClick={() => fetchHistory(historyPage - 1)}
                      >
                        <i className="fa-solid fa-chevron-right"></i>
                      </Button>

                      {/* أرقام الصفحات — مع window لو الصفحات كثيرة */}
                      {Array.from(
                        { length: historyMeta.totalPages },
                        (_, i) => i + 1
                      )
                        .filter((page) =>
                          page === 1 ||
                          page === historyMeta.totalPages ||
                          Math.abs(page - historyPage) <= 1
                        )
                        .reduce((acc, page, idx, arr) => {
                          if (idx > 0 && page - arr[idx - 1] > 1) {
                            acc.push('...');
                          }
                          acc.push(page);
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

                      {/* زر التالي */}
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

                  {/* عداد الصفحة */}
                  {historyMeta && (
                    <div className="text-center text-muted small pb-2">
                      صفحة {historyPage} من {historyMeta.totalPages}
                      &nbsp;·&nbsp;
                      إجمالي {historyMeta.totalCount} عملية
                    </div>
                  )}
                </>
              )}

            </Card.Body>
          </Card>
        </Col>

      </Row>
    </Container>
  );
};

export default ManagerHome;