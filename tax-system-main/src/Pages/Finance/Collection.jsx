// src/pages/Finance/Collection.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Form, Button, Card,
  Alert, Spinner, Badge, InputGroup, Table, Modal,
} from 'react-bootstrap';
import { searchByNameOrId, registerPayment } from '../../services/financeService';
import { printDocument } from '../../utils/printDocument';

// ── ثوابت ──────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { value: 'Cash',     label: 'نقدي (Cash)'     },
  { value: 'Fawry',    label: 'فوري (Fawry)'    },
  { value: 'Bank',     label: 'تحويل بنكي'      },
  { value: 'InstaPay', label: 'إنستا باي'       },
];

const STATUS_LABELS = {
  Pending:       { bg: 'warning', text: 'معلق'    },
  Paid:          { bg: 'success', text: 'مدفوع'   },
  Overdue:       { bg: 'danger',  text: 'متأخر'   },
  PartiallyPaid: { bg: 'info',    text: 'جزئي'    },
};

const INITIAL_FORM = {
  receiptNo:   '',
  method:      'Cash',
  paymentDate: new Date().toISOString().split('T')[0],
};

// ── المكوّن الرئيسي ─────────────────────────────────────────
const Collection = () => {
  const navigate = useNavigate();

  // حالة البحث
  const [searchTerm,        setSearchTerm]        = useState('');
  const [searchLoading,     setSearchLoading]     = useState(false);
  const [searchError,       setSearchError]       = useState('');

  // نتيجة البحث (FinanceSearchResponseDto)
  const [assessment,        setAssessment]        = useState(null);
  // الأقساط المعلقة (مشتقة من assessment)
  const [pendingList,       setPendingList]       = useState([]);
  // القسط المختار
  const [selected,          setSelected]          = useState(null);

  // نموذج الدفع
  const [form,              setForm]              = useState(INITIAL_FORM);
  const [formError,         setFormError]         = useState('');

  // حالة الحفظ
  const [saving,            setSaving]            = useState(false);

  // إيصال بعد النجاح
  const [receipt,           setReceipt]           = useState(null);

  // مودال التأكيد
  const [showConfirm,       setShowConfirm]       = useState(false);

  // ── مساعد: طباعة الإيصال ──────────────────────────────────
  const handlePrint = (r) => {
    const paidAmount  = Math.round(r.paidAmount).toLocaleString('ar-EG');
    const paymentDate = new Date(r.paymentDate).toLocaleDateString('ar-EG');
    const issuedAt    = new Date().toLocaleString('ar-EG');

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
              <span class="print-value">${paidAmount} ج.م</span>
            </div>
            <div class="print-field">
              <span class="print-label">طريقة الدفع</span>
              <span class="print-value">${r.method}</span>
            </div>
            <div class="print-field">
              <span class="print-label">تاريخ السداد</span>
              <span class="print-value">${paymentDate}</span>
            </div>
            <div class="print-field">
              <span class="print-label">رقم القسط</span>
              <span class="print-value">${r.installmentNumber}</span>
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
        .receipt-number { min-width: 150px; border: 1px solid #99f6e4;
          background: #ecfdf5; border-radius: 8px; padding: 10px 12px; text-align: center; }
        .receipt-number span { display: block; color: #667085; font-size: 12px; }
        .receipt-number strong { display: block; color: #0f766e; font-size: 20px; margin-top: 4px; }
      `,
    );
  };

  // ── البحث ─────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setSearchLoading(true);
    setSearchError('');
    setAssessment(null);
    setPendingList([]);
    setSelected(null);
    setReceipt(null);
    setForm(INITIAL_FORM);
    setFormError('');

    try {
      const result = await searchByNameOrId(searchTerm.trim());

      if (!result) {
        setSearchError(`لم يتم العثور على نتائج للبحث: "${searchTerm}"`);
        return;
      }

      setAssessment(result);

      // استخرج الأقساط غير المدفوعة فقط
      const pending = (result.installments || []).filter(
        (i) => i.status === 'Pending' || i.status === 'Overdue',
      );
      setPendingList(pending);

      // اختر أول قسط تلقائياً
      if (pending.length > 0) setSelected(pending[0]);

    } catch (err) {
      setSearchError(
        err?.response?.data?.message || err?.message || 'حدث خطأ أثناء البحث.',
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSearch(); }
  };

  // ── اختيار قسط ──────────────────────────────────────────
  const handleSelectInstallment = (inst) => {
    setSelected(inst);
    setReceipt(null);       // مسح الإيصال القديم عند تغيير القسط
    setFormError('');
  };

  // ── التحقق من النموذج قبل الإرسال ───────────────────────
  const validateForm = () => {
    if (!form.receiptNo.trim()) return 'رقم الإيصال مطلوب.';
    if (!form.paymentDate)      return 'تاريخ السداد مطلوب.';
    if (!selected)              return 'الرجاء اختيار قسط من الجدول.';
    return '';
  };

  // ── تأكيد الدفع (بعد المودال) ───────────────────────────
  const handleConfirmPay = async () => {
    setShowConfirm(false);
    setSaving(true);
    setFormError('');

    try {
      const payload = {
        installmentId: selected.id,
        paidAmount:    selected.amount,   // الباك‌إند يتحقق أن المبلغ يطابق القسط
        receiptNo:     form.receiptNo.trim(),
        method:        form.method,
        paymentDate:   form.paymentDate,
        employeeId:    1,                 // ← استبدله بـ ID المستخدم الحالي من الـ auth context
        notes:         '',
      };

      const receiptDto = await registerPayment(payload);
      setReceipt(receiptDto);

      // حذف القسط المدفوع من القائمة المعلقة
      setPendingList((prev) => prev.filter((i) => i.id !== selected.id));
      setSelected(null);
      setForm(INITIAL_FORM);

    } catch (err) {
      // الباك‌إند يرجع رسالة عربية في body.message
      setFormError(
        err?.response?.data?.message || err?.message || 'فشلت عملية الدفع.',
      );
    } finally {
      setSaving(false);
    }
  };

  // ── فتح مودال التأكيد ────────────────────────────────────
  const handlePayClick = () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setFormError('');
    setShowConfirm(true);
  };

  // ── حسابات مشتقة ────────────────────────────────────────
  const isFullyPaid =
    assessment !== null && pendingList.length === 0 && receipt === null;

  const paymentStatus = assessment
    ? STATUS_LABELS[assessment.paymentStatus] ?? { bg: 'secondary', text: assessment.paymentStatus }
    : null;

  // ────────────────────────────────────────────────────────
  return (
    <Container fluid className="mt-4">

      {/* ── شريط البحث ─────────────────────────────────── */}
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

      {/* ── خطأ البحث ──────────────────────────────────── */}
      {searchError && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" onClose={() => setSearchError('')} dismissible>
              {searchError}
            </Alert>
          </Col>
        </Row>
      )}

      {/* ── الكارت الرئيسي ─────────────────────────────── */}
      <Row className="justify-content-center">
        <Col md={11} lg={10}>
          <Card className="shadow-sm border-0 border-top border-5 border-success">

            {/* Header */}
            <Card.Header className="bg-white d-flex justify-content-between align-items-center pt-3">
              <div>
                <small className="text-muted">تسجيل سداد (Receipt Registration)</small>
                <Card.Title className="mb-0 fs-4 fw-bold">
                  {assessment ? `وحدة رقم: ${assessment.unitId}` : 'تسجيل سداد ضريبي'}
                </Card.Title>
              </div>
              {assessment && (
                <div className="d-flex gap-2 align-items-center">
                  <Badge bg={paymentStatus.bg}>{paymentStatus.text}</Badge>
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

              {/* لم يتم البحث */}
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
                  {/* ── بيانات التقييم ─────────────────────── */}
                  <Alert variant="secondary" className="mb-3">
                    <h6 className="fw-bold border-bottom pb-2">بيانات التقييم الضريبي</h6>
                    <Row>
                      <Col md={6}>
                        <div><small>المالك:</small> <strong>{assessment.ownerName}</strong></div>
                        <div><small>الرقم القومي:</small> {assessment.nationalId}</div>
                        <div><small>العنوان:</small> {assessment.address}</div>
                      </Col>
                      <Col md={6} className="text-md-end">
                        <div className="small text-muted">الضريبة السنوية</div>
                        <div className="fw-bold text-primary fs-4">
                          {Math.round(assessment.annualTax).toLocaleString('ar-EG')} ج.م
                        </div>
                        <div className="small text-muted mt-1">
                          خطة الدفع: <Badge bg="secondary">{assessment.paymentPlan}</Badge>
                        </div>
                      </Col>
                    </Row>
                  </Alert>

                  {/* ── حالة: مدفوع بالكامل ────────────────── */}
                  {isFullyPaid ? (
                    <Alert variant="success" className="text-center">
                      <i className="fa-solid fa-check-circle fa-2x mb-2" />
                      <h4>جميع الأقساط المسجلة لهذا التقييم تم دفعها</h4>
                      <Button
                        variant="outline-secondary"
                        className="mt-3"
                        onClick={() => navigate('/finance/home')}
                      >
                        العودة
                      </Button>
                    </Alert>
                  ) : (
                    <>
                      {/* ── جدول الأقساط ───────────────────── */}
                      {pendingList.length > 0 ? (
                        <Card className="mb-3 border-info bg-light">
                          <Card.Header className="bg-info text-white fw-bold py-2">
                            الأقساط المستحقة — اختر قسطاً للدفع
                          </Card.Header>
                          <Card.Body className="p-0">
                            <Table hover size="sm" className="mb-0">
                              <thead className="table-light">
                                <tr>
                                  <th>رقم القسط</th>
                                  <th>تاريخ الاستحقاق</th>
                                  <th className="text-end">المبلغ (ج.م)</th>
                                  <th className="text-center">الحالة</th>
                                  <th className="text-center">اختيار</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pendingList.map((inst) => {
                                  const isSelected = selected?.id === inst.id;
                                  const instStatus = STATUS_LABELS[inst.status]
                                    ?? { bg: 'secondary', text: inst.status };
                                  return (
                                    <tr
                                      key={inst.id}
                                      style={{
                                        cursor: 'pointer',
                                        backgroundColor: isSelected ? '#e8f4fd' : '',
                                      }}
                                      onClick={() => handleSelectInstallment(inst)}
                                    >
                                      <td>{inst.installmentNumber}</td>
                                      <td>
                                        {new Date(inst.dueDate).toLocaleDateString('ar-EG')}
                                      </td>
                                      <td className="text-end fw-bold">
                                        {Math.round(inst.amount).toLocaleString('ar-EG')}
                                      </td>
                                      <td className="text-center">
                                        <Badge bg={instStatus.bg}>{instStatus.text}</Badge>
                                      </td>
                                      <td className="text-center">
                                        <Form.Check
                                          type="radio"
                                          checked={isSelected}
                                          onChange={() => handleSelectInstallment(inst)}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </Table>
                          </Card.Body>
                        </Card>
                      ) : (
                        <Alert variant="warning">
                          لا توجد أقساط مستحقة حالياً.
                        </Alert>
                      )}

                      {/* ── نموذج الدفع ────────────────────── */}
                      {selected && (
                        <>
                          <h6 className="fw-bold text-muted border-bottom pb-2 mt-4">
                            بيانات الدفع — القسط رقم {selected.installmentNumber}
                          </h6>

                          {formError && (
                            <Alert
                              variant="danger"
                              onClose={() => setFormError('')}
                              dismissible
                            >
                              {formError}
                            </Alert>
                          )}

                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  رقم الإيصال <span className="text-danger">*</span>
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
                                <Form.Label>مبلغ الدفع (ج.م)</Form.Label>
                                {/* readonly — الباك‌إند يتحقق أن المبلغ = قيمة القسط */}
                                <Form.Control
                                  type="text"
                                  readOnly
                                  className="fw-bold text-primary fs-5 bg-light"
                                  value={`${Math.round(selected.amount).toLocaleString('ar-EG')} ج.م`}
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
                              onClick={() => navigate('/finance/home')}
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
                              {saving ? (
                                <Spinner size="sm" animation="border" />
                              ) : (
                                `تأكيد دفع القسط (${Math.round(selected.amount).toLocaleString('ar-EG')} ج.م)`
                              )}
                            </Button>
                          </div>
                        </>
                      )}

                      {/* ── إيصال السداد بعد النجاح ─────────── */}
                      {receipt && (
                        <Card className="mt-4 border-primary" id="receipt-print-section">
                          <Card.Header className="bg-primary text-white fw-bold">
                            ✅ تم تسجيل السداد — إيصال الضريبة
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
                                  <strong>المبلغ المدفوع:</strong>{' '}
                                  <span className="text-success fw-bold fs-5">
                                    {Math.round(receipt.paidAmount).toLocaleString('ar-EG')} ج.م
                                  </span>
                                </div>
                                <div className="mb-2">
                                  <strong>طريقة الدفع:</strong>{' '}
                                  <Badge bg="secondary">{receipt.method}</Badge>
                                </div>
                                <div className="mb-2">
                                  <strong>تاريخ السداد:</strong>{' '}
                                  {new Date(receipt.paymentDate).toLocaleDateString('ar-EG')}
                                </div>
                                <div className="mb-2">
                                  <strong>رقم القسط:</strong> {receipt.installmentNumber}
                                </div>
                              </Col>
                            </Row>
                            <div className="d-flex justify-content-end gap-2 mt-3 no-print">
                              <Button
                                variant="outline-primary"
                                onClick={() => handlePrint(receipt)}
                              >
                                <i className="fa-solid fa-print me-1" /> طباعة الإيصال
                              </Button>
                              <Button
                                variant="outline-secondary"
                                onClick={() => navigate('/finance/home')}
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

      {/* ── مودال التأكيد ─────────────────────────────────── */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>تأكيد عملية الدفع</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <>
              <p>هل أنت متأكد من تسجيل السداد التالي؟</p>
              <ul className="list-unstyled bg-light p-3 rounded">
                <li><strong>المالك:</strong> {assessment?.ownerName}</li>
                <li><strong>القسط رقم:</strong> {selected.installmentNumber}</li>
                <li>
                  <strong>المبلغ:</strong>{' '}
                  <span className="text-success fw-bold">
                    {Math.round(selected.amount).toLocaleString('ar-EG')} ج.م
                  </span>
                </li>
                <li><strong>رقم الإيصال:</strong> {form.receiptNo}</li>
                <li><strong>طريقة الدفع:</strong> {form.method}</li>
              </ul>
              <Alert variant="warning" className="mb-0 small">
                لا يمكن التراجع عن هذه العملية بعد التأكيد.
              </Alert>
            </>
          )}
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