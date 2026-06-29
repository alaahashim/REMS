// src/pages/Finance/FinanceHome.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container, Row, Col, Card, Table,
  Button, Spinner, Badge, Alert,
} from "react-bootstrap";
import { getFinanceDashboard, getPaymentHistory } from "../../services/financeService";

const METHOD_LABELS = {
  Cash:     "نقدي",
  Fawry:    "فوري",
  Bank:     "تحويل بنكي",
  InstaPay: "إنستا باي",
};

const PAYMENT_STATUS = {
  Pending:  { bg: "warning", text: "معلق"  },
  Paid:     { bg: "success", text: "مدفوع" },
  Overdue:  { bg: "danger",  text: "متأخر" },
};

const formatAmount = (n) =>
  Math.round(n ?? 0).toLocaleString("ar-EG");

// ── بطاقة إحصائية ────────────────────────────────────────
const StatCard = ({ title, value, icon, colorClass, loading }) => (
  <Card className={`border-0 shadow-sm border-start border-4 ${colorClass}`}>
    <Card.Body className="d-flex justify-content-between align-items-center">
      <div>
        <h6 className="text-muted text-uppercase mb-1" style={{ fontSize: "0.75rem" }}>
          {title}
        </h6>
        <h3 className="fw-bold mb-0">
          {loading ? <Spinner size="sm" animation="border" /> : value}
        </h3>
      </div>
      <div className="opacity-25 fs-1">{icon}</div>
    </Card.Body>
  </Card>
);

// ── المكوّن الرئيسي ────────────────────────────────────────
const FinanceHome = () => {
  const navigate  = useNavigate();
  const location  = useLocation();       // ← للكشف عن العودة من صفحة الدفع

  const [dashLoading, setDashLoading] = useState(true);
  const [histLoading, setHistLoading] = useState(true);
  const [error,       setError]       = useState("");

  const [dashboard, setDashboard] = useState({
    totalAssessments:    0,
    paidAssessments:     0,
    pendingAssessments:  0,
    overdueInstallments: 0,
    totalCollected:      0,
    remainingAmount:     0,
  });

  const [history, setHistory] = useState([]);

  // ── جلب البيانات ────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setError("");
    setDashLoading(true);
    setHistLoading(true);

    try {
      const [dash, hist] = await Promise.allSettled([
        getFinanceDashboard(),
        getPaymentHistory(),
      ]);

      if (dash.status === "fulfilled") setDashboard(dash.value);
      else setError("فشل تحميل الإحصائيات.");

      if (hist.status === "fulfilled")   setHistory(hist.value?.items ?? []);

      else setError((prev) => prev + " فشل تحميل سجل المدفوعات.");
    } finally {
      setDashLoading(false);
      setHistLoading(false);
    }
  }, []);

  // تحميل أولي + إعادة تحميل عند العودة من صفحة الدفع
  useEffect(() => {
    loadAll();
  }, [loadAll, location.key]); // location.key يتغير في كل navigate

  // ── Render ───────────────────────────────────────────────
  return (
    <Container fluid className="mt-4">

      {/* عنوان + تحديث */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h3 className="text-success fw-bold mb-0">
            التحصيل المالي (Finance Collection)
          </h3>
          <p className="text-muted mb-0">
            لوحة متابعة المدفوعات والمستحقات
          </p>
        </Col>
        <Col xs="auto">
          <Button variant="outline-secondary" size="sm" onClick={loadAll}>
            <i className="fa-solid fa-rotate-right me-1" /> تحديث
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      {/* ── بطاقات المبالغ ─────────────────────────────── */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <StatCard
            title="إجمالي المحصل"
            value={`${formatAmount(dashboard.totalCollected)} ج.م`}
            icon={<i className="fa-solid fa-coins text-success" />}
            colorClass="border-success"
            loading={dashLoading}
          />
        </Col>
        <Col md={4}>
          <StatCard
            title="المبلغ المتبقي"
            value={`${formatAmount(dashboard.remainingAmount)} ج.م`}
            icon={<i className="fa-solid fa-file-invoice-dollar text-warning" />}
            colorClass="border-warning"
            loading={dashLoading}
          />
        </Col>
        <Col md={4}>
          <StatCard
            title="أقساط متأخرة"
            value={dashboard.overdueInstallments}
            icon={<i className="fa-solid fa-triangle-exclamation text-danger" />}
            colorClass="border-danger"
            loading={dashLoading}
          />
        </Col>
      </Row>

      {/* ── بطاقات العدد ───────────────────────────────── */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center py-3">
            <h2 className="fw-bold text-dark mb-0">
              {dashLoading ? "..." : dashboard.totalAssessments}
            </h2>
            <small className="text-muted">إجمالي التقييمات</small>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center py-3">
            <h2 className="fw-bold text-success mb-0">
              {dashLoading ? "..." : dashboard.paidAssessments}
            </h2>
            <small className="text-muted">تقييمات مدفوعة بالكامل</small>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center py-3">
            <h2 className="fw-bold text-warning mb-0">
              {dashLoading ? "..." : dashboard.pendingAssessments}
            </h2>
            <small className="text-muted">تقييمات معلقة / جزئية</small>
          </Card>
        </Col>
      </Row>

      {/* ── زر التسجيل ─────────────────────────────────── */}
      <Row className="mb-4">
        <Col className="text-end">
          <Button
            variant="success"
            size="lg"
            onClick={() => navigate("/finance/collect")}
          >
            <i className="fa-solid fa-plus-circle me-2" />
            تسجيل سداد جديد
          </Button>
        </Col>
      </Row>

      {/* ── جدول سجل المدفوعات ─────────────────────────── */}
      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center">
              <span>سجل المدفوعات (Payment History)</span>
              {history.length > 0 && (
                <Badge bg="secondary">{history.length} عملية</Badge>
              )}
            </Card.Header>
            <Card.Body className="p-0">
              {histLoading ? (
                <div className="text-center p-5">
                  <Spinner animation="border" variant="success" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fa-solid fa-inbox fa-2x mb-3" />
                  <p>لا توجد مدفوعات مسجلة بعد.</p>
                </div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>رقم الوحدة</th>
                      <th>المالك</th>
                      <th className="text-end">المبلغ</th>
                      <th>طريقة الدفع</th>
                      <th>رقم الإيصال</th>
                      <th>تاريخ السداد</th>
                      <th className="text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row, idx) => {
                      const statusMeta =
                        PAYMENT_STATUS[row.status] ??
                        { bg: "secondary", text: row.status };
                      return (
                        <tr key={row.paymentId ?? idx}>
                          <td className="text-muted">{idx + 1}</td>
                          <td className="fw-bold text-primary">
                            Unit #{row.unitId}
                          </td>
                          <td>{row.ownerName}</td>
                          <td className="text-end fw-bold">
                            {formatAmount(row.paidAmount)} ج.م
                          </td>
                          <td>
                            <Badge bg="secondary">
                              {METHOD_LABELS[row.method] ?? row.method}
                            </Badge>
                          </td>
                          <td className="font-monospace">
                            {row.receiptNo || "—"}
                          </td>
                          <td>
                            {new Date(row.paymentDate).toLocaleDateString(
                              "ar-EG"
                            )}
                          </td>
                          <td className="text-center">
                            <Badge bg={statusMeta.bg}>
                              {statusMeta.text}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
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