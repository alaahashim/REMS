// src/pages/Reviewer/TaxCalculation.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert, Badge, Button, Card, Col, Container, Form,
  InputGroup, Modal, Row, Spinner, Table,
} from "react-bootstrap";
import {
  getReviewerTaskDetails,
  previewTaxCalculation,
  approveTaxCalculation,
  hasAppealsForAssessment,
} from "../../services/taxService";

const CURRENT_YEAR = new Date().getFullYear();
const PAYER_TYPE   = { OWNER: 1, TENANT: 2 };
const PAYMENT_PLAN = { FULL: 1, INSTALLMENT_2: 2 };

const InfoField = ({ label, value, primary = false }) => (
  <div>
    <div className="text-muted mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.02em" }}>
      {label}
    </div>
    <div className={`fw-semibold${primary ? " text-primary" : ""}`} style={{ fontSize: "0.9rem" }}>
      {value ?? "-"}
    </div>
  </div>
);

const SectionHeading = ({ icon, label, color = "primary" }) => (
  <div className="d-flex align-items-center gap-2 mb-3">
    <i className={`fa-solid ${icon} text-${color}`} />
    <span className={`fw-bold text-${color}`}>{label}</span>
  </div>
);

const TaxStatusBadge = ({ status }) => {
  const s = String(status ?? "").toLowerCase();
  const approved = s.includes("approved") || s === "2";
  return approved
    ? <Badge bg="success">معتمد</Badge>
    : <Badge bg="warning" text="dark">بانتظار الحساب</Badge>;
};

const PersonRow = ({ person, showShare = false }) => (
  <tr>
    <td className="fw-semibold">{person.fullName || "-"}</td>
    <td className="text-muted small">{person.roleType || "-"}</td>
    {showShare && (
      <td>{person.sharePercentage != null ? `${person.sharePercentage}%` : "-"}</td>
    )}
    <td className="text-muted small">{person.phone || "-"}</td>
  </tr>
);

const AmountRow = ({ label, amount, variant = "", minus = false, bold = false, large = false }) => {
  const cls = [variant ? `text-${variant}` : "", bold ? "fw-bold" : "", large ? "fs-5" : ""].join(" ").trim();
  const formatted = `${Number(amount ?? 0).toLocaleString("en-US")} ج.م`;
  return (
    <div className={`d-flex justify-content-between align-items-center py-1 ${large ? "border-top mt-2 pt-3" : ""}`}>
      <span className={cls}>{label}</span>
      <span className={cls}>{minus ? `– ${formatted}` : formatted}</span>
    </div>
  );
};

const TaxCalculation = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [loadingDetails, setLoadingDetails] = useState(false);
  const [details,         setDetails]        = useState(null);
  const [detailsError,    setDetailsError]   = useState("");

  const [form, setForm] = useState({
    taxYear:            CURRENT_YEAR,
    annualRentOverride: "",
    payerType:          PAYER_TYPE.OWNER,
    paymentPlan:        PAYMENT_PLAN.FULL,
    includeAppealFee:   false,
  });

  const [hasAppeals,     setHasAppeals]     = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewResult,  setPreviewResult]  = useState(null);
  const [previewError,   setPreviewError]   = useState("");
  const [approving,      setApproving]      = useState(false);
  const [approveError,   setApproveError]   = useState("");
  const [showConfirm,    setShowConfirm]    = useState(false);

  /* ── تحميل التفاصيل ── */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoadingDetails(true);
        setDetailsError("");
        setDetails(null);
        setDetails(await getReviewerTaskDetails(id));
      } catch (err) {
        setDetailsError(err?.message || "حدث خطأ أثناء تحميل بيانات الوحدة");
      } finally {
        setLoadingDetails(false);
      }
    })();
  }, [id]);

  /* ── التحقق من وجود طعون وتفعيل السويتش تلقائياً ── */
  useEffect(() => {
    if (!id || !form.taxYear || Number(form.taxYear) < 2010) return;

    (async () => {
      try {
        const result = await hasAppealsForAssessment(Number(id), Number(form.taxYear));
        setHasAppeals(result);
        setField("includeAppealFee", result);
      } catch {
        setHasAppeals(false);
      }
    })();
  }, [id, form.taxYear]);

  const owners = useMemo(
    () => (Array.isArray(details?.owners) ? details.owners : []),
    [details],
  );
  const tenants = useMemo(
    () => (Array.isArray(details?.tenants) ? details.tenants : []),
    [details],
  );
  const primaryOwner = useMemo(
    () => owners.length
      ? [...owners].sort((a, b) => (b.sharePercentage || 0) - (a.sharePercentage || 0))[0]
      : null,
    [owners],
  );

  const buildPayload = () => ({
    unitId:             Number(id),
    taxYear:            Number(form.taxYear),
    annualRentOverride: form.annualRentOverride === "" ? null : Number(form.annualRentOverride),
    payerType:          Number(form.payerType),
    paymentPlan:        Number(form.paymentPlan),
    includeAppealFee:   !!form.includeAppealFee,
  });

  const validate = () => {
    if (!id || Number(id) <= 0)                                  return "معرّف الوحدة غير صحيح";
    if (!form.taxYear || Number(form.taxYear) < 2010)            return "يرجى إدخال سنة ضريبية صحيحة";
    if (form.annualRentOverride !== "" && Number(form.annualRentOverride) < 0)
                                                                 return "القيمة الإيجارية لا يمكن أن تكون سالبة";
    return "";
  };

  const handlePreview = async () => {
    const msg = validate();
    if (msg) { setPreviewError(msg); return; }
    try {
      setPreviewLoading(true);
      setPreviewError("");
      setApproveError("");
      setPreviewResult(await previewTaxCalculation(buildPayload()));
    } catch (err) {
      setPreviewResult(null);
      setPreviewError(err?.message || "حدث خطأ أثناء معاينة التقدير الضريبي");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleApprove = () => {
    const msg = validate();
    if (msg) { setApproveError(msg); return; }
    if (!previewResult) { setApproveError("يجب تنفيذ معاينة الحساب أولاً قبل الاعتماد"); return; }
    setShowConfirm(true);
  };

  const confirmApprove = async () => {
    setShowConfirm(false);
    try {
      setApproving(true);
      setApproveError("");
      await approveTaxCalculation(buildPayload());
      navigate("/reviewer/home", { state: { successMsg: "تم اعتماد التقييم الضريبي بنجاح ✓" } });
    } catch (err) {
      setApproveError(err?.message || "حدث خطأ أثناء اعتماد التقييم الضريبي");
    } finally {
      setApproving(false);
    }
  };

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  if (loadingDetails) return (
    <Container fluid className="py-5 text-center">
      <Spinner animation="border" variant="primary" />
      <div className="mt-3 text-muted">جاري تحميل بيانات الوحدة...</div>
    </Container>
  );

  if (detailsError) return (
    <Container fluid className="py-4">
      <Alert variant="danger">{detailsError}</Alert>
      <Button variant="secondary" onClick={() => navigate("/reviewer/home")}>عودة</Button>
    </Container>
  );

  if (!details) return (
    <Container fluid className="py-4">
      <Alert variant="warning">لا توجد بيانات لهذه الوحدة</Alert>
      <Button variant="secondary" onClick={() => navigate("/reviewer/home")}>عودة</Button>
    </Container>
  );

  return (
    <>
      <Container fluid className="py-4">
        <Row className="justify-content-center">
          <Col xxl={10} xl={11}>

            {/* ── رأس الصفحة ── */}
            <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
              <div>
                <div className="text-muted small mb-1">شاشة التقدير الضريبي</div>
                <h4 className="fw-bold mb-1">وحدة رقم: {details.unitNumber || details.unitId}</h4>
                <div className="text-muted small">معرّف الوحدة: {details.unitId}</div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <TaxStatusBadge status={details.taxStatus} />
                <Button variant="outline-secondary" size="sm" onClick={() => navigate("/reviewer/home")}>
                  <i className="fa-solid fa-arrow-right me-1" />
                  عودة
                </Button>
              </div>
            </div>

            {previewError && (
              <Alert variant="danger" dismissible onClose={() => setPreviewError("")} className="mb-3">
                {previewError}
              </Alert>
            )}
            {approveError && (
              <Alert variant="danger" dismissible onClose={() => setApproveError("")} className="mb-3">
                {approveError}
              </Alert>
            )}

            {/* ── بيانات الوحدة ── */}
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body>
                <SectionHeading icon="fa-house" label="بيانات الوحدة والعقار" />
                <Row className="g-3">
                  <Col xs={6} sm={3}><InfoField label="رقم الوحدة"    value={details.unitNumber} /></Col>
                  <Col xs={6} sm={3}><InfoField label="نوع الوحدة"    value={details.unitType} /></Col>
                  <Col xs={6} sm={3}><InfoField label="الدور"          value={details.floor} /></Col>
                  <Col xs={6} sm={3}><InfoField label="المساحة"        value={details.area != null ? `${details.area} م²` : null} /></Col>
                  <Col xs={12} sm={6}><InfoField label="العنوان"       value={details.propertyAddress} /></Col>
                  <Col xs={6} sm={3}><InfoField label="الاستخدام"      value={details.usage} /></Col>
                  <Col xs={6} sm={3}><InfoField label="المالك الأساسي" value={primaryOwner?.fullName} primary /></Col>
                </Row>
              </Card.Body>
            </Card>

            {/* ── الملاك والمستأجرون ── */}
            <Row className="g-3 mb-4">
              <Col lg={6}>
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body>
                    <SectionHeading icon="fa-users" label="الملاك" />
                    {owners.length === 0 ? (
                      <p className="text-muted small">لا يوجد ملاك مسجلون لهذه الوحدة</p>
                    ) : (
                      <Table size="sm" bordered responsive className="mb-0 align-middle">
                        <thead className="table-light">
                          <tr><th>الاسم</th><th>نوع العلاقة</th><th>نسبة الملكية</th><th>الهاتف</th></tr>
                        </thead>
                        <tbody>
                          {owners.map((o, i) => <PersonRow key={`o-${o.ownerId ?? i}`} person={o} showShare />)}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={6}>
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body>
                    <SectionHeading icon="fa-user-check" label="المستأجرون" color="success" />
                    {tenants.length === 0 ? (
                      <p className="text-muted small">لا يوجد مستأجرون مسجلون لهذه الوحدة</p>
                    ) : (
                      <Table size="sm" bordered responsive className="mb-0 align-middle">
                        <thead className="table-light">
                          <tr><th>الاسم</th><th>نوع العلاقة</th><th>الهاتف</th></tr>
                        </thead>
                        <tbody>
                          {tenants.map((t, i) => <PersonRow key={`t-${t.ownerId ?? i}`} person={t} />)}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* ── نموذج الإعدادات ── */}
            <Card className="mb-4 shadow-sm border-0 border-top border-3 border-primary">
              <Card.Header className="bg-white border-bottom py-3">
                <SectionHeading icon="fa-calculator" label="إعدادات التقدير الضريبي" />
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        السنة الضريبية <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min={2010}
                        max={CURRENT_YEAR + 1}
                        value={form.taxYear}
                        onChange={(e) => setField("taxYear", e.target.value)}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        القيمة الإيجارية السنوية{" "}
                        <span className="text-muted fw-normal">(اختياري)</span>
                      </Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="number"
                          min={0}
                          placeholder="تقدير تلقائي إذا تُرك فارغاً"
                          value={form.annualRentOverride}
                          onChange={(e) => setField("annualRentOverride", e.target.value)}
                        />
                        <InputGroup.Text>ج.م</InputGroup.Text>
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">نوع الاستخدام</Form.Label>
                      <Form.Control value={details.usage || "-"} disabled readOnly />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Label className="fw-semibold small d-block">المسؤول عن السداد</Form.Label>
                    <div className="d-flex gap-4 mt-1">
                      <Form.Check
                        type="radio" id="payer-owner" name="payerType" label="المالك"
                        checked={Number(form.payerType) === PAYER_TYPE.OWNER}
                        onChange={() => setField("payerType", PAYER_TYPE.OWNER)}
                      />
                      <Form.Check
                        type="radio" id="payer-tenant" name="payerType" label="المستأجر"
                        checked={Number(form.payerType) === PAYER_TYPE.TENANT}
                        onChange={() => setField("payerType", PAYER_TYPE.TENANT)}
                      />
                    </div>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">خطة السداد</Form.Label>
                      <Form.Select
                        value={form.paymentPlan}
                        onChange={(e) => setField("paymentPlan", Number(e.target.value))}
                      >
                        <option value={PAYMENT_PLAN.FULL}>دفع كامل</option>
                        <option value={PAYMENT_PLAN.INSTALLMENT_2}>تقسيط على دفعتين</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* ── السويتش ── */}
                  <Col xs={12}>
                    <Form.Check
                      type="switch"
                      id="appeal-fee-switch"
                      label={
                        <>
                          إضافة رسوم طعن (50 ج.م)
                          {hasAppeals && (
                            <Badge bg="warning" text="dark" className="ms-2 small">
                              تفعّل تلقائياً — يوجد طعن مسجّل
                            </Badge>
                          )}
                        </>
                      }
                      checked={form.includeAppealFee}
                      onChange={(e) => setField("includeAppealFee", e.target.checked)}
                    />
                  </Col>
                </Row>

                <div className="mt-4">
                  <Button
                    variant="primary"
                    onClick={handlePreview}
                    disabled={previewLoading || approving}
                  >
                    {previewLoading ? (
                      <><Spinner size="sm" className="me-2" />جاري المعاينة...</>
                    ) : (
                      <><i className="fa-solid fa-magnifying-glass-dollar me-2" />معاينة الحساب</>
                    )}
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* ── نتيجة المعاينة ── */}
            {previewResult && (
              <>
                <Card className="mb-4 shadow-sm border-0">
                  <Card.Header className="bg-white border-bottom py-3">
                    <SectionHeading icon="fa-file-invoice-dollar" label="نتيجة المعاينة الضريبية" color="info" />
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3 mb-4">
                      <Col md={4}><InfoField label="المالك المستخدم في الحساب" value={previewResult.ownerName} primary /></Col>
                      <Col md={4}><InfoField label="السنة الضريبية"            value={previewResult.taxYear} /></Col>
                      <Col md={4}><InfoField label="وصف الموقع / العقار"       value={previewResult.zoneDescription} /></Col>
                    </Row>

                    <div className="rounded border p-3" style={{ background: "#f8f9fb" }}>
                      <AmountRow label="القيمة الإيجارية السنوية" amount={previewResult.annualRent} />
                      <AmountRow
                        label={`خصم الصيانة / الاستهلاك (${previewResult.discountRate}%)`}
                        amount={previewResult.discountAmount}
                        variant="danger" minus
                      />
                      <AmountRow label="صافي القيمة الإيجارية السنوية" amount={previewResult.netAnnualRentalValue} />

                      {Number(previewResult.exemptionAmount || 0) > 0 && (
                        <AmountRow
                          label={`إعفاء ضريبي${previewResult.exemptionReason ? ` – ${previewResult.exemptionReason}` : ""}`}
                          amount={previewResult.exemptionAmount}
                          variant="success" minus
                        />
                      )}

                      <div className="my-2 border-top" />

                      <AmountRow
                        label={`الضريبة السنوية (${previewResult.taxRate}%)`}
                        amount={previewResult.annualTax}
                        variant="success" bold
                      />
                      <AmountRow label="رسوم الطعن" amount={previewResult.appealFee} />

                      <div
                        className="d-flex justify-content-between align-items-center mt-3 rounded p-3 border"
                        style={{ background: "#fff" }}
                      >
                        <span className="fw-bold fs-5">إجمالي المستحق</span>
                        <span className="fw-bold fs-4 text-primary">
                          {Number(previewResult.totalDue ?? 0).toLocaleString("en-US")} ج.م
                        </span>
                      </div>

                      {Number(previewResult.installmentCount || 1) > 1 && (
                        <Alert variant="info" className="mt-3 mb-0 py-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="small">قيمة القسط ({previewResult.installmentCount} دفعات)</span>
                            <span className="fw-bold text-primary">
                              {Number(previewResult.installmentAmount ?? 0).toLocaleString("en-US")} ج.م
                            </span>
                          </div>
                        </Alert>
                      )}

                      <div className="mt-2 text-muted small">
                        {previewResult.isFromManualAnnualRent
                          ? "تم الحساب باستخدام قيمة إيجارية مدخلة يدوياً."
                          : "تم الحساب باستخدام التقدير التلقائي للقيمة الإيجارية."}
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <div className="d-flex justify-content-end">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleApprove}
                    disabled={approving || previewLoading}
                  >
                    {approving ? (
                      <><Spinner size="sm" className="me-2" />جاري الاعتماد...</>
                    ) : (
                      <><i className="fa-solid fa-check me-2" />اعتماد التقدير الضريبي</>
                    )}
                  </Button>
                </div>
              </>
            )}

          </Col>
        </Row>
      </Container>

      {/* ── مودال تأكيد الاعتماد ── */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">تأكيد الاعتماد</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <div className="d-flex gap-3 align-items-start">
            <i className="fa-solid fa-triangle-exclamation text-warning fa-lg mt-1" />
            <div>
              <p className="mb-1 fw-semibold">هل أنت متأكد من اعتماد هذا التقدير الضريبي؟</p>
              <p className="text-muted small mb-0">
                سيتم حفظ التقييم وإرسال الإشعار للجهة المعنية. لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" onClick={() => setShowConfirm(false)}>إلغاء</Button>
          <Button variant="success" onClick={confirmApprove}>
            <i className="fa-solid fa-check me-1" />
            نعم، اعتماد
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TaxCalculation;