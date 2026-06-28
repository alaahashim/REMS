import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Container, Spinner, Table, Modal, Form } from 'react-bootstrap';
import { getExemptions, committeeExemptionDecision } from "../../services/committeeService";
import { openExemptionAttachment } from "../../services/exemptionService";
import { useLanguage } from '../../context/LanguageContext'; 
import { useDynamicTranslation } from '../../utils/useDynamicTranslation'; 

// ── مكون مساعد لترجمة البيانات اللي جاية من الداتا بيز ──
const DynText = ({ text, lang }) => {
  const translated = useDynamicTranslation(text || '', lang);
  return <>{translated || '-'}</>;
};

const exemptionLabels = {
  basic_unit: 'الوحدة السكنية الأساسية',
  disability: 'إعفاء ذوي الإعاقة',
  waqf: 'ملكيات وقفية',
  charity: 'جمعيات خيرية'
};

const CommitteeExemptions = () => {
  const { lang } = useLanguage(); 
  const [exemptions, setExemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExemption, setSelectedExemption] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [verdict, setVerdict] = useState('');
  const [committeeNote, setCommitteeNote] = useState('');

  const loadExemptions = async () => {
    setLoading(true);
    try {
      const exemptionsData = await getExemptions();
      setExemptions(exemptionsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExemptions();
  }, []);

  const openDecisionModal = (exemption) => {
    setSelectedExemption(exemption);
    setShowModal(true);
    setVerdict('');
    setCommitteeNote('');
  };

  const closeDecisionModal = () => {
    setShowModal(false);
    setSelectedExemption(null);
  };

  const submitDecision = async () => {
    if (!verdict) {
      alert('يرجى اختيار توصية اللجنة');
      return;
    }

    const isConfirmed = window.confirm('هل تريد إرسال توصية اللجنة للمدير للاعتماد النهائي؟');
    if (!isConfirmed) return;

    try {
      await committeeExemptionDecision(selectedExemption.id, {
        verdict,
        note: committeeNote
      });

      alert('تم إرسال توصية اللجنة للمدير');
      closeDecisionModal();
      await loadExemptions();
    } catch (error) {
      alert(error.message || 'فشلت العملية');
    }
  };

  return (
    <Container fluid className="mt-4">
      <Card className="mb-3">
        <Card.Body className="d-flex justify-content-between align-items-center flex-column flex-md-row gap-3">
          <div>
            <h3 className="section-title mb-1">لجنة الإعفاءات</h3>
            <p className="text-muted mb-0">عرض جميع طلبات الإعفاء ومراجعة التوصيات قبل إرسالها للمدير.</p>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>الممول</th>
                  <th>نوع الإعفاء</th>
                  <th>المستند</th>
                  <th>الحالة</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {exemptions.length === 0 ? (
                  <tr><td colSpan="6" className="text-center text-muted py-4">لا توجد طلبات إعفاء</td></tr>
                ) : exemptions.map((exemption) => (
                  <tr key={exemption.id} className="table-action-row">
                    <td className="fw-bold text-primary">#{exemption.id}</td>
                    <td><DynText text={exemption.personName || exemption.personId} lang={lang} /></td>
                    <td><DynText text={exemptionLabels[exemption.exemptionType] || exemption.exemptionType} lang={lang} /></td>
                    <td>
                      {exemption.fileName ? (
                        <Button size="sm" variant="outline-primary" onClick={() => openExemptionAttachment(exemption.id)}>
                          فتح الملف
                        </Button>
                      ) : (
                        <span className="text-muted">لا يوجد</span>
                      )}
                    </td>
                    <td>
                      {exemption.status === 'PendingCommittee' ? <Badge bg="warning">معلقة للجنة</Badge> :
                       exemption.status === 'PendingManager' ? <Badge bg="info">معروضة على المدير</Badge> :
                       <Badge bg="secondary">{exemption.status}</Badge>}
                    </td>
                    <td>
                      {exemption.status === 'PendingCommittee' ? (
                        <Button size="sm" variant="success" onClick={() => openDecisionModal(exemption)}>
                          إصدار توصية
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" disabled>تم الإرسال</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={closeDecisionModal} centered size="lg">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>توصية لجنة الإعفاء</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedExemption && (
            <>
              <Alert variant="secondary">
                <span>العقار:</span> {selectedExemption.propertyId || '-'} | <span>نوع الإعفاء:</span> <DynText text={exemptionLabels[selectedExemption.exemptionType] || selectedExemption.exemptionType || '-'} lang={lang} />
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label>توصية اللجنة</Form.Label>
                <Form.Select value={verdict} onChange={(event) => setVerdict(event.target.value)}>
                  <option value="">اختر...</option>
                  <option value="Accept">قبول</option>
                  <option value="Reject">رفض</option>
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label>ملاحظات اللجنة</Form.Label>
                <Form.Control as="textarea" rows={3} value={committeeNote} onChange={(event) => setCommitteeNote(event.target.value)} />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDecisionModal}>إلغاء</Button>
          <Button variant="success" onClick={submitDecision}>إرسال للمدير</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CommitteeExemptions;