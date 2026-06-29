// src/pages/Finance/Collection.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Row, Col, Form, Button, Card,
  Alert, Spinner, Badge, InputGroup, Table, Modal,
} from "react-bootstrap";
import { searchByNameOrId, registerPayment } from "../../services/financeService";
import { printDocument } from "../../utils/printDocument";

const PAYMENT_METHODS = [
  { value: "Cash",     label: "نقدي (Cash)"  },
  { value: "Fawry",   label: "فوري (Fawry)" },
  { value: "Bank",    label: "تحويل بنكي"   },
  { value: "InstaPay",label: "إنستا باي"    },
];

const STATUS_LABELS = {
  Pending:       { bg: "warning", text: "معلق"  },
  Paid:          { bg: "success", text: "مدفوع" },
  Overdue:       { bg: "danger",  text: "متأخر" },
  PartiallyPaid: { bg: "info",    text: "جزئي"  },
};

const INITIAL_FORM = {
  receiptNo:   "",
  method:      "Cash",
  paymentDate: new Date().toISOString().split("T")[0],
};

const formatAmount = (n) =>
  Math.round(n ?? 0).toLocaleString("ar-EG");

// ────────────────────────────────────────────────────────────
const Collection = () => {
  const navigate = useNavigate();

  const [searchTerm,    setSearchTerm]    = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError,   setSearchError]   = useState("");

  const [assessment,  setAssessment]  = useState(null);
  const [pendingList, setPendingList] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [form,        setForm]        = useState(INITIAL_FORM);
  const [formError,   setFormError]   = useState("");
  const [saving,      setSaving]      = useState(false);
  const [receipt,     setReceipt]     = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── مشتقات ──────────────────────────────────────────────
  const selectedInstallments = pendingList.filter((i) =>
    selectedIds.has(i.id)
  );
  const totalSelected = selectedInstallments.reduce(
    (sum, i) => sum + (i.amount ?? 0), 0
  );

  const isFullyPaid =
    assessment !== null && pendingList.length === 0 && receipt === null;

  const paymentStatus = assessment
    ? STATUS_LABELS[assessment.paymentStatus] ??
      { bg: "secondary", text: assessment.paymentStatus }
    : null;

  // هل التقييم محجوز بسبب طعن؟
  const isBlocked = assessment && !assessment.isAvailableForCollection;

  // ── طباعة الإيصال ────────────────────────────────────────
  const handlePrint = (r) => {
    const paidStr  = formatAmount(r.totalPaid);
    const dateStr  = new Date(r.paymentDate).toLocaleDateString("ar-EG");
    const issuedAt = new Date().toLocaleString("ar-EG");
    const instNums = (r.installmentNumbers ?? []).join("، ");

    printDocument(
      `إيصال سداد ${r.receiptNo}`,
      `
        <main class="print-page receipt-page">
          <header class="print-header">
            <div>
              <h1 class="print-title">إيصال سداد ضريبة عقارية</h1>
              <div class="print-subtitle">نسخة رسمية صادرة من نظام التحصيل</div>
            </div>
            <div class="receipt-number">
              <span>رقم الإيصال</span>
              <strong>${r.receiptNo}</strong>
            </div>
          </header>
          <section class="print-grid">
            <div class="print-field">
              <span class="print-label">رقم الوحدة</span>
              <span class="print-value">${r.unitId}</span>
            </div>
            <div class="print-field">
              <span class="print-label">اسم المالك</span>
              <span class="print-value">${r.ownerName}</span>
            </div>
            <div class="print-field" style="grid-column:1/-1">
              <span class="print-label">العنوان</span>
              <span class="print-value">${r.address}</span>
            </div>
            <div class="print-field print-total">
              <span class="print-label">المبلغ المدفوع</span>
              <span class="print-value">${paidStr} ج.م</span>
            </div>
            <div class="print-field">
              <span class="print-label">طريقة الدفع</span>
              <span class="print-value">${r.method}</span>
            </div>
            <div class="print-field">
              <span class="print-label">تاريخ السداد</span>
              <span class="print-value">${dateStr}</span>
            </div>
            <div class="print-field">
              <span class="print-label">أرقام الأقساط</span>
              <span class="print-value">${instNums}</span>
            </div>
          </section>
          <footer class="print-footer">
            <div class="signature-box">توقيع الموظف المختص</div>
            <div class="signature-box">ختم المأمورية</div>
          </footer>
          <p class="print-subtitle">تمت الطباعة في: ${issuedAt}</p>
        </main>
      `,
      `
        .receipt-page { border: 2px solid #0f766e; padding: 18px; }
        .receipt-number { min-width:150px; border:1px solid #99f6e4;
          background:#ecfdf5; border-radius:8px; padding:10px 12px; text-align:center; }
        .receipt-number span   { display:block; color:#667085; font-size:12px; }
        .receipt-number strong { display:block; color:#0f766e; font-size:20px; margin-top:4px; }
      `
    );
  };

  // ── البحث ───────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setSearchLoading(true);
    setSearchError("");
    setAssessment(null);
    setPendingList([]);
    setSelectedIds(new Set());
    setReceipt(null);
    setForm(INITIAL_FORM);
    setFormError("");

    try {
      const result = await searchByNameOrId(searchTerm.trim());

      if (!result) {
        setSearchError(`لم يتم العثور على نتائج للبحث: "${searchTerm}"`);
        return;
      }

      setAssessment(result);

      // نعرض الأقساط غير المدفوعة دائماً —
      // لكن نمنع الدفع فقط إذا كان isAvailableForCollection = false
      const pending = (result.installments ?? []).filter(
        (i) => i.status === "Pending" || i.status === "Overdue"
      );
      setPendingList(pending);

      if (pending.length > 0 && result.isAvailableForCollection) {
        setSelectedIds(new Set([pending[0].id]));
      }
    } catch (err) {
      setSearchError(
        err?.message || err?.response?.data?.message || "حدث خطأ أثناء البحث."
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleSearch(); }
  };

  // ── اختيار قسط ─────────────────────────────────────────
  const toggleInstallment = (id) => {
    if (isBlocked) return; // لا تتيح الاختيار إذا كان التقييم محجوزاً
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setReceipt(null);
    setFormError("");
  };

  // ── التحقق ──────────────────────────────────────────────
  const validateForm = () => {
    if (!form.receiptNo.trim()) return "رقم الإيصال مطلوب.";
    if (!form.paymentDate)      return "تاريخ السداد مطلوب.";
    if (selectedIds.size === 0) return "الرجاء اختيار قسط واحد على الأقل.";
    return "";
  };

  // ── تأكيد الدفع ─────────────────────────────────────────
  const handleConfirmPay = async () => {
    setShowConfirm(false);
    setSaving(true);
    setFormError("");

    try {
      const receiptDto = await registerPayment({
        installmentIds: Array.from(selectedIds),
        receiptNo: form.receiptNo.trim(),
        method: form.method,
        paymentDate: form.paymentDate,
        employeeId: 2,
        notes: "",
      });

      setReceipt(receiptDto);

      const paidIds = new Set(selectedIds);
      const remainingInstallments = pendingList.filter((i) => !paidIds.has(i.id));
      setPendingList(remainingInstallments);
      setSelectedIds(new Set());
      setForm(INITIAL_FORM);

      // تحديث حالة التقييم بدقة بناءً على الأقساط المتبقية
      if (assessment) {
        setAssessment((prev) => ({
          ...prev,
          paymentStatus:
            remainingInstallments.length === 0
              ? "Paid"
              : "PartiallyPaid",
        }));
      }
    } catch (err) {
      setFormError(
        err?.message || err?.response?.data?.message || "فشلت عملية الدفع."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePayClick = () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setFormError("");
    setShowConfirm(true);
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <Container fluid className="mt-4">

      {/* شريط البحث */}
      <Row className="mb-3">
        <Col>
          <InputGroup>
            <InputGroup.Text>
              <i className="fa-solid fa-money-check-dollar text-success" />
            </InputGroup.Text>
            <Form.Control
              placeholder="ابحث بالاسم أو الرقم القومي واضغط Enter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={searchLoading}
            />
            <Button variant="success" onClick={handleSearch} disabled={searchLoading}>
              {searchLoading
                ? <Spinner size="sm" animation="border" />
                : <i className="fa-solid fa-search" />}
            </Button>
          </InputGroup>
        </Col>
      </Row>

      {searchError && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" onClose={() => setSearchError("")} dismissible>
              {searchError}
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="justify-content-center">
        <Col md={11} lg={10}>
          <Card className="shadow-sm border-0 border-top border-5 border-success">

            <Card.Header className="bg-white d-flex justify-content-between align-items-center pt-3">
              <div>
                <small className="text-muted">
                  تسجيل سداد (Receipt Registration)
                </small>
                <Card.Title className="mb-0 fs-4 fw-bold">
                  {assessment
                    ? `وحدة رقم: ${assessment.unitId}`
                    : "تسجيل سداد ضريبي"}
                </Card.Title>
              </div>
              {assessment && (
                <div className="d-flex gap-2 align-items-center flex-wrap">
                  <Badge bg={paymentStatus.bg}>{paymentStatus.text}</Badge>
                  {isBlocked && (
                    <Badge bg="danger">
                      <i className="fa-solid fa-lock me-1" />
                      محجوز — قيد الطعن
                    </Badge>
                  )}
                  {isFullyPaid && (
                    <Badge bg="success">لا توجد أقساط مستحقة</Badge>
                  )}
                </div>
              )}
            </Card.Header>

            <Card.Body>

              {/* جاري البحث */}
              {searchLoading && (
                <div className="text-center my-5">
                  <Spinner animation="border" variant="success" />
                  <p className="mt-2 text-muted">جاري البحث...</p>
                </div>
              )}

              {/* لم يتم البحث بعد */}
              {!searchLoading && !assessment && !searchError && (
                <div className="text-center py-5 text-muted">
                  <i className="fa-solid fa-arrow-up fa-2x mb-3" />
                  <h5>استخدم خانة البحث أعلاه</h5>
                  <p>سيتم عرض بيانات الملكية والأقساط المستحقة هنا.</p>
                </div>
              )}

              {/* النتيجة */}
              {!searchLoading && assessment && (
                <>
                  {/* ── بيانات التقييم ── */}
                  <Alert variant="secondary" className="mb-3">
                    <h6 className="fw-bold border-bottom pb-2">
                      بيانات التقييم الضريبي
                    </h6>
                    <Row>
                      <Col md={6}>
                        <div>
                          <small>المالك:</small>{" "}
                          <strong>{assessment.ownerName}</strong>
                        </div>
                        <div>
                          <small>الرقم القومي:</small> {assessment.nationalId}
                        </div>
                        <div>
                          <small>العنوان:</small> {assessment.address}
                        </div>
                      </Col>
                      <Col md={6} className="text-md-end">
                        <div className="small text-muted">الضريبة السنوية</div>
                        <div className="fw-bold text-primary fs-4">
                          {formatAmount(assessment.annualTax)} ج.م
                        </div>
                        {assessment.appealFee > 0 && (
                          <div className="small text-warning mt-1">
                            رسوم طعن: {formatAmount(assessment.appealFee)} ج.م
                          </div>
                        )}
                        <div className="small text-muted mt-1">
                          الإجمالي المستحق:{" "}
                          <span className="fw-bold text-dark">
                            {formatAmount(assessment.totalDue)} ج.م
                          </span>
                        </div>
                        <div className="small text-muted mt-1">
                          خطة الدفع:{" "}
                          <Badge bg="secondary">{assessment.paymentPlan}</Badge>
                        </div>
                      </Col>
                    </Row>
                  </Alert>

                  {/* ── تحذير: قيد الطعن ── */}
                  {isBlocked && (
                    <Alert variant="warning" className="d-flex align-items-start gap-2">
                      <i className="fa-solid fa-triangle-exclamation fa-lg mt-1" />
                      <div>
                        <strong>هذا التقييم قيد الطعن حالياً</strong>
                        <div className="small mt-1">
                          لا يمكن تسجيل سداد على هذا التقييم حتى يتم البت في
                          الطعن من قِبل المدير. يمكنك مراجعة صفحة الطعون
                          لمتابعة حالة الطعن.
                        </div>
                      </div>
                    </Alert>
                  )}

                  {/* ── حالة: مدفوع بالكامل ── */}
                  {isFullyPaid && !isBlocked ? (
                    <Alert variant="success" className="text-center">
                      <i className="fa-solid fa-check-circle fa-2x mb-2" />
                      <h4>جميع الأقساط المسجلة لهذا التقييم تم دفعها</h4>
                      <Button
                        variant="outline-secondary"
                        className="mt-3"
                        onClick={() => navigate("/finance/home")}
                      >
                        العودة
                      </Button>
                    </Alert>
                  ) : (
                    <>
                      {/* ── جدول الأقساط ── */}
                      {pendingList.length > 0 ? (
                        <Card className="mb-3 border-info bg-light">
                          <Card.Header
                            className="bg-info text-white fw-bold py-2 d-flex justify-content-between"
                          >
                            <span>
                              الأقساط المستحقة
                              {!isBlocked && " — اختر قسطاً أو أكثر للدفع"}
                            </span>
                            {selectedIds.size > 0 && (
                              <Badge bg="light" text="dark">
                                {selectedIds.size} مختار —{" "}
                                {formatAmount(totalSelected)} ج.م
                              </Badge>
                            )}
                          </Card.Header>
                          <Card.Body className="p-0">
                            <Table hover size="sm" className="mb-0">
                              <thead className="table-light">
                                <tr>
                                  {!isBlocked && (
                                    <th className="text-center">اختيار</th>
                                  )}
                                  <th>رقم القسط</th>
                                  <th>تاريخ الاستحقاق</th>
                                  <th className="text-end">المبلغ (ج.م)</th>
                                  <th className="text-center">الحالة</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pendingList.map((inst) => {
                                  const isSelected = selectedIds.has(inst.id);
                                  const instStatus =
                                    STATUS_LABELS[inst.status] ??
                                    { bg: "secondary", text: inst.status };
                                  return (
                                    <tr
                                      key={inst.id}
                                      style={{
                                        cursor: isBlocked ? "default" : "pointer",
                                        backgroundColor: isSelected ? "#e8f4fd" : "",
                                        opacity: isBlocked ? 0.6 : 1,
                                      }}
                                      onClick={() => toggleInstallment(inst.id)}
                                    >
                                      {!isBlocked && (
                                        <td className="text-center">
                                          <Form.Check
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleInstallment(inst.id)}
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </td>
                                      )}
                                      <td>{inst.installmentNumber}</td>
                                      <td>
                                        {new Date(inst.dueDate).toLocaleDateString("ar-EG")}
                                      </td>
                                      <td className="text-end fw-bold">
                                        {formatAmount(inst.amount)}
                                      </td>
                                      <td className="text-center">
                                        <Badge bg={instStatus.bg}>
                                          {instStatus.text}
                                        </Badge>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </Table>
                          </Card.Body>
                        </Card>
                      ) : (
                        !isBlocked && (
                          <Alert variant="warning">
                            لا توجد أقساط مستحقة حالياً.
                          </Alert>
                        )
                      )}

                      {/* ── نموذج الدفع (يُخفى إذا كان محجوزاً) ── */}
                      {!isBlocked && selectedIds.size > 0 && (
                        <>
                          <h6 className="fw-bold text-muted border-bottom pb-2 mt-4">
                            بيانات الدفع —{" "}
                            {selectedIds.size === 1
                              ? `القسط رقم ${selectedInstallments[0]?.installmentNumber}`
                              : `${selectedIds.size} أقساط`}
                          </h6>

                          {formError && (
                            <Alert
                              variant="danger"
                              onClose={() => setFormError("")}
                              dismissible
                            >
                              {formError}
                            </Alert>
                          )}

                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  رقم الإيصال{" "}
                                  <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="اكتب رقم الكاشير..."
                                  value={form.receiptNo}
                                  onChange={(e) =>
                                    setForm({ ...form, receiptNo: e.target.value })
                                  }
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>طريقة الدفع</Form.Label>
                                <Form.Select
                                  value={form.method}
                                  onChange={(e) =>
                                    setForm({ ...form, method: e.target.value })
                                  }
                                >
                                  {PAYMENT_METHODS.map((m) => (
                                    <option key={m.value} value={m.value}>
                                      {m.label}
                                    </option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>إجمالي المبلغ (ج.م)</Form.Label>
                                <Form.Control
                                  type="text"
                                  readOnly
                                  className="fw-bold text-primary fs-5 bg-light"
                                  value={`${formatAmount(totalSelected)} ج.م`}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>تاريخ السداد</Form.Label>
                                <Form.Control
                                  type="date"
                                  value={form.paymentDate}
                                  onChange={(e) =>
                                    setForm({ ...form, paymentDate: e.target.value })
                                  }
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <div className="d-flex justify-content-between gap-3 mt-3">
                            <Button
                              variant="secondary"
                              onClick={() => navigate("/finance/home")}
                            >
                              إلغاء
                            </Button>
                            <Button
                              variant="success"
                              size="lg"
                              onClick={handlePayClick}
                              disabled={saving}
                              className="px-5"
                            >
                              {saving
                                ? <Spinner size="sm" animation="border" />
                                : `تأكيد الدفع (${formatAmount(totalSelected)} ج.م)`}
                            </Button>
                          </div>
                        </>
                      )}

                      {/* ── إيصال السداد ── */}
                      {receipt && (
                        <Card
                          className="mt-4 border-success"
                          id="receipt-print-section"
                        >
                          <Card.Header className="bg-success text-white fw-bold">
                            <i className="fa-solid fa-circle-check me-2" />
                            تم تسجيل السداد — إيصال الضريبة
                          </Card.Header>
                          <Card.Body>
                            <Row>
                              <Col md={6}>
                                <div className="mb-2">
                                  <strong>رقم الإيصال:</strong> {receipt.receiptNo}
                                </div>
                                <div className="mb-2">
                                  <strong>رقم الوحدة:</strong> {receipt.unitId}
                                </div>
                                <div className="mb-2">
                                  <strong>اسم المالك:</strong> {receipt.ownerName}
                                </div>
                                <div className="mb-2">
                                  <strong>العنوان:</strong> {receipt.address}
                                </div>
                              </Col>
                              <Col md={6}>
                                <div className="mb-2">
                                  <strong>المبلغ المدفوع:</strong>{" "}
                                  <span className="text-success fw-bold fs-5">
                                    {formatAmount(receipt.totalPaid)} ج.م
                                  </span>
                                </div>
                                <div className="mb-2">
                                  <strong>طريقة الدفع:</strong>{" "}
                                  <Badge bg="secondary">{receipt.method}</Badge>
                                </div>
                                <div className="mb-2">
                                  <strong>تاريخ السداد:</strong>{" "}
                                  {new Date(receipt.paymentDate).toLocaleDateString("ar-EG")}
                                </div>
                                <div className="mb-2">
                                  <strong>أرقام الأقساط:</strong>{" "}
                                  {(receipt.installmentNumbers ?? []).join("، ")}
                                </div>
                              </Col>
                            </Row>
                            <div className="d-flex justify-content-end gap-2 mt-3 no-print">
                              <Button
                                variant="outline-success"
                                onClick={() => handlePrint(receipt)}
                              >
                                <i className="fa-solid fa-print me-1" />
                                طباعة الإيصال
                              </Button>
                              <Button
                                variant="outline-secondary"
                                onClick={() => navigate("/finance/home")}
                              >
                                العودة للرئيسية
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      )}
                    </>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* مودال التأكيد */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>تأكيد عملية الدفع</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>هل أنت متأكد من تسجيل السداد التالي؟</p>
          <ul className="list-unstyled bg-light p-3 rounded">
            <li>
              <strong>المالك:</strong> {assessment?.ownerName}
            </li>
            <li>
              <strong>الأقساط المختارة:</strong>{" "}
              {selectedInstallments
                .map((i) => `قسط رقم ${i.installmentNumber}`)
                .join("، ")}
            </li>
            <li>
              <strong>إجمالي المبلغ:</strong>{" "}
              <span className="text-success fw-bold">
                {formatAmount(totalSelected)} ج.م
              </span>
            </li>
            <li>
              <strong>رقم الإيصال:</strong> {form.receiptNo}
            </li>
            <li>
              <strong>طريقة الدفع:</strong> {form.method}
            </li>
          </ul>
          <Alert variant="warning" className="mb-0 small">
            لا يمكن التراجع عن هذه العملية بعد التأكيد.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            إلغاء
          </Button>
          <Button variant="success" onClick={handleConfirmPay}>
            تأكيد السداد
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default Collection;