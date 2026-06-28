import React, { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Nav,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  getManagerAppeals,
  getManagerExemptions,
  managerAppealDecision,
  managerExemptionDecision,
} from '../../services/managerService';
import { openExemptionAttachment } from "../../services/exemptionService";
import { useLanguage } from '../../context/LanguageContext'; 
import { useDynamicTranslation } from '../../utils/useDynamicTranslation'; 

// ── مكون مساعد لترجمة البيانات اللي جاية من الداتا بيز ──
const DynText = ({ text, lang }) => {
  const translated = useDynamicTranslation(text || '', lang);
  return <>{translated || '-'}</>;
};

// ─── helpers ────────────────────────────────────────────────────────────────
const money = (value) =>
  `${Math.round(Number(value) || 0).toLocaleString('ar-EG')} ج.م`;

const statusBadge = (status) => {
  const map = {
    Pending_Manager_Appeal: { bg: 'warning', text: 'dark', label: 'ينتظر قرار' },
    Approved: { bg: 'success', text: undefined, label: 'مقبول' },
    Rejected: { bg: 'danger', text: undefined, label: 'مرفوض' },
    PendingManager: { bg: 'warning', text: 'dark', label: 'ينتظر قرار' },
  };
  const cfg = map[status] || { bg: 'secondary', text: undefined, label: status };
  return (
    <Badge bg={cfg.bg} text={cfg.text}>
      {cfg.label}
    </Badge>
  );
};

const getExemptionTypeArabic = (type) => {
  switch (type) {
    case 'PrimaryResidence':
      return 'سكن أساسي';
    case 'Disability':
      return 'إعاقة';
    case 'Charity':
      return 'جمعيات';
    default:
      return type || '-';
  }
};

// ─── component ───────────────────────────────────────────────────────────────
const ManagerVerdict = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage(); 

  const [activeTab, setActiveTab] = useState('appeals');
  const [loading, setLoading] = useState(true);
  const [appeals, setAppeals] = useState([]);
  const [exemptions, setExemptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // modal state
  const [modal, setModal] = useState({ show: false, type: null, item: null });
  const [decision, setDecision] = useState('Approved');
  const [note, setNote] = useState('');
  const [approvedTax, setApprovedTax] = useState('');
  const [exemptionPercent, setExemptionPercent] = useState('');

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [appealsData, exemptionsData] = await Promise.all([
        getManagerAppeals(),
        getManagerExemptions(),
      ]);
      setAppeals(appealsData);
      setExemptions(exemptionsData);
    } catch {
      setError('تعذّر تحميل البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── modal helpers ──────────────────────────────────────────────────────────
  const openModal = (type, item) => {
    setModal({ show: true, type, item });
    setDecision('Approved');
    setNote('');
    setApprovedTax('');
    setExemptionPercent('');
  };

  const closeModal = () => setModal({ show: false, type: null, item: null });

  // ── submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (modal.type === 'appeal') {
        await managerAppealDecision(modal.item.id, {
          status: decision,
          note,
          ...(decision === 'Approved' && { managerApprovedTax: Number(approvedTax) }),
        });
      } else {
        await managerExemptionDecision(modal.item.id, {
          status: decision,
          note,
          ...(decision === 'Approved' && { exemptionPercentage: Number(exemptionPercent) }),
        });
      }
      closeModal();
      await fetchAll();
    } catch {
      setError('حدث خطأ أثناء إرسال القرار. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const pendingAppeals = appeals.filter((a) => a.status === 'PendingManager');
  const pendingExemptions = exemptions.filter((e) => e.status === 'PendingManager');

  return (
    <Container fluid className="mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            <i className="fa-solid fa-stamp me-2 text-primary"></i>الاعتمادات
          </h3>
          <p className="text-muted mb-0">مراجعة الطعون والإعفاءات واتخاذ القرار النهائي</p>
        </div>
        <Button variant="outline-dark" onClick={() => navigate('/manager/home')}>
          <i className="fa-solid fa-arrow-right me-2"></i>عودة للرئيسية
        </Button>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-4">
          <i className="fa-solid fa-triangle-exclamation me-2"></i>
          {error}
        </div>
      )}

      {/* Tabs */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Header className="bg-transparent border-bottom pt-3 pb-0">
          <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
            <Nav.Item>
              <Nav.Link eventKey="appeals" className="fw-bold">
                <i className="fa-solid fa-scale-balanced me-2"></i>
                الطعون
                {pendingAppeals.length > 0 && (
                  <Badge bg="danger" className="ms-2">{pendingAppeals.length}</Badge>
                )}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="exemptions" className="fw-bold">
                <i className="fa-solid fa-file-circle-check me-2"></i>
                الإعفاءات
                {pendingExemptions.length > 0 && (
                  <Badge bg="danger" className="ms-2">{pendingExemptions.length}</Badge>
                )}
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>

        <Card.Body className="p-0">
          {/* ── Appeals Tab ── */}
          {activeTab === 'appeals' && (
            <Table hover responsive className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="text-center">#</th>
                  <th>كود الوحدة</th>
                  <th>سبب الطعن</th>
                  <th className="text-end">الضريبة الأصلية</th>
                  <th className="text-end">ضريبة اللجنة</th>
                  <th className="text-center">الحالة</th>
                  <th className="text-center">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {appeals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-5">
                      <i className="fa-solid fa-inbox fa-3x mb-3 d-block"></i>
                      لا توجد طعون
                    </td>
                  </tr>
                ) : (
                  appeals.map((appeal, index) => (
                    <tr key={appeal.id}>
                      <td className="text-center fw-bold text-primary">{index + 1}</td>
                      <td className="fw-bold">{appeal.unitNumber || appeal.taxAssessment?.unitId || '-'}</td>
                      <td className="text-muted"><DynText text={appeal.appealReason} lang={lang} /></td>
                      <td className="text-end fw-bold text-success">{money(appeal.originalTax)}</td>
                      <td className="text-end fw-bold text-success">{money(appeal.proposedTax ?? 0)}</td>
                      <td className="text-center">{statusBadge(appeal.status)}</td>
                      <td className="text-center">
                        {appeal.status === 'PendingManager' ? (
                          <Button size="sm" variant="primary" onClick={() => openModal('appeal', appeal)}>
                            <i className="fa-solid fa-gavel me-1"></i>قرار
                          </Button>
                        ) : (
                          <span className="text-muted small">تم البت</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}

          {/* ── Exemptions Tab ── */}
          {activeTab === 'exemptions' && (
            <Table hover responsive className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="text-center">#</th>
                  <th>المالك</th>
                  <th>سبب الإعفاء</th>
                  <th>المرفق</th>
                  <th className="text-center">الحالة</th>
                  <th className="text-center">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {exemptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-5">
                      <i className="fa-solid fa-inbox fa-3x mb-3 d-block"></i>
                      لا توجد إعفاءات
                    </td>
                  </tr>
                ) : (
                  exemptions.map((exemption, index) => (
                    <tr key={exemption.id}>
                      <td className="text-center fw-bold text-primary">{index + 1}</td>
                      <td className="fw-bold"><DynText text={exemption.personName} lang={lang} /></td>
                      <td><DynText text={getExemptionTypeArabic(exemption.exemptionType)} lang={lang} /></td>
                      <td>
                        {exemption.fileName ? (
                          <Button size="sm" variant="outline-primary" onClick={() => openExemptionAttachment(exemption.id)}>
                            فتح الملف
                          </Button>
                        ) : (
                          <span className="text-muted">لا يوجد</span>
                        )}
                      </td>
                      <td className="text-center">{statusBadge(exemption.status)}</td>
                      <td className="text-center">
                        {exemption.status === "PendingManager" ? (
                          <Button size="sm" variant="primary" onClick={() => openModal("exemption", exemption)}>
                            <i className="fa-solid fa-gavel me-1"></i>قرار
                          </Button>
                        ) : (
                          <span className="text-muted small">تم البت</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* ── Decision Modal ── */}
      <Modal show={modal.show} onHide={closeModal} centered dir="rtl">
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="fw-bold">
            <i className="fa-solid fa-gavel me-2 text-primary"></i>
            {modal.type === 'appeal' ? 'قرار المدير – الطعن' : 'قرار المدير – الإعفاء'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* القرار */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">القرار</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  label="قبول"
                  id="approve"
                  value="Approved"
                  checked={decision === 'Approved'}
                  onChange={(e) => setDecision(e.target.value)}
                />
                <Form.Check
                  type="radio"
                  label="رفض"
                  id="reject"
                  value="Rejected"
                  checked={decision === 'Rejected'}
                  onChange={(e) => setDecision(e.target.value)}
                />
              </div>
            </Form.Group>

            {/* الضريبة النهائية – للطعن عند القبول */}
            {modal.type === 'appeal' && decision === 'Approved' && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  الضريبة النهائية المعتمدة <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="أدخل قيمة الضريبة المعتمدة"
                  value={approvedTax}
                  onChange={(e) => setApprovedTax(e.target.value)}
                />
              </Form.Group>
            )}

            {/* نسبة الإعفاء – للإعفاء عند القبول */}
            {modal.type === 'exemption' && decision === 'Approved' && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  نسبة الإعفاء (%) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0 – 100"
                  value={exemptionPercent}
                  onChange={(e) => setExemptionPercent(e.target.value)}
                />
              </Form.Group>
            )}

            {/* ملاحظة */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">ملاحظة المدير</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="أدخل ملاحظتك (اختياري)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-top">
          <Button variant="outline-secondary" onClick={closeModal} disabled={submitting}>
            إلغاء
          </Button>
          <Button
            variant={decision === 'Approved' ? 'success' : 'danger'}
            onClick={handleSubmit}
            disabled={
              submitting ||
              (modal.type === 'appeal' && decision === 'Approved' && !approvedTax) ||
              (modal.type === 'exemption' && decision === 'Approved' && !exemptionPercent)
            }
          >
            {submitting ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <i className={`fa-solid ${decision === 'Approved' ? 'fa-check' : 'fa-times'} me-2`}></i>
            )}
            تأكيد القرار
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManagerVerdict;