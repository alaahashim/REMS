import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Container, Spinner, Table, Modal, Form } from 'react-bootstrap';
import { getAppeals, committeeDecision } from '../../services/committeeService';

const CommitteeAppeals = () => {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [verdict, setVerdict] = useState('');
  const [committeeNote, setCommitteeNote] = useState('');
  const [newTaxAmount, setNewTaxAmount] = useState('');

  const loadAppeals = async () => {
    setLoading(true);
    try {
      const appealsData = await getAppeals();
      setAppeals(appealsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppeals();
  }, []);

  const openDecisionModal = (appeal) => {
    setSelectedAppeal(appeal);
    setShowModal(true);
    setVerdict('');
    setCommitteeNote('');
    setNewTaxAmount('');
  };

  const closeDecisionModal = () => {
    setShowModal(false);
    setSelectedAppeal(null);
  };

  const submitDecision = async () => {
    if (!verdict) {
      alert('يرجى اختيار توصية اللجنة');
      return;
    }

    if (verdict === 'Accept' && !newTaxAmount) {
      alert('عند قبول الطعن يجب تحديد الضريبة المقترحة');
      return;
    }

    const isConfirmed = window.confirm('هل تريد إرسال توصية اللجنة للمدير للاعتماد النهائي؟');
    if (!isConfirmed) return;

    try {
      await committeeDecision(selectedAppeal.id, {
        verdict,
        note: committeeNote,
        newTaxAmount
      });

      alert('تم إرسال توصية اللجنة للمدير');
      closeDecisionModal();
      await loadAppeals();
    } catch (error) {
      alert(error.message || 'فشلت العملية');
    }
  };

const pendingAppeals =appeals.filter(x=>x.status==="PendingCommittee");
  return (
    <Container fluid className="mt-4">
      <Card className="mb-3">
        <Card.Body className="d-flex justify-content-between align-items-center flex-column flex-md-row gap-3">
          <div>
            <h3 className="section-title mb-1">لجنة الطعون</h3>
            <p className="text-muted mb-0">عرض جميع الطعون والمراجعة قبل إرسال التوصية إلى المدير.</p>
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
                  <th>رقم القضية</th>
                  <th>كود الوحدة</th>
                  <th>المواطن</th>
                  <th>سبب الطعن</th>
                  <th>الحالة</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {appeals.length === 0 ? (
                  <tr><td colSpan="6" className="text-center text-muted py-4">لا توجد طعون</td></tr>
                ) : appeals.map((appeal) => (
                  <tr key={appeal.id} className="table-action-row">
                    <td className="fw-bold text-primary">#{appeal.id}</td>
                    <td>{appeal.unitNumber}</td>
                    <td>{appeal.personName ||  '-'}</td>
                    <td style={{ maxWidth: 260 }}>{appeal.appealReason || '-'}</td>
                    <td>
                      {appeal.status==="PendingCommittee" ? <Badge bg="warning">معلقة للجنة</Badge> :
                       appeal.status==="PendingManager" ? <Badge bg="info">معروضة على المدير</Badge> :
                       <Badge bg="secondary">{appeal.status}</Badge>}
                    </td>
                    <td>
                      {appeal.status === "PendingCommittee" ? (
    <Button
      size="sm"
      variant="primary"
      onClick={() => openDecisionModal(appeal)}
    >
      إصدار توصية
    </Button>
) : (
    <Button
      size="sm"
      variant="secondary"
      disabled
    >
      تم الإرسال
    </Button>
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
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>توصية لجنة الطعن</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppeal && (
            <>
              <Alert variant="secondary">
               <strong>الوحدة:</strong> {selectedAppeal.unitNumber}| <strong>سبب الطعن:</strong> {selectedAppeal.appealReason || '-'}
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label>توصية اللجنة</Form.Label>
                <Form.Select value={verdict} onChange={(event) => setVerdict(event.target.value)}>
                  <option value="">اختر...</option>
                  <option value="Accept">قبول</option>
                  <option value="Reject">رفض</option>
                </Form.Select>
              </Form.Group>

              {verdict === 'Accept' && (
                <Form.Group className="mb-3">
                  <Form.Label>الضريبة المقترحة بعد قبول الطعن</Form.Label>
                  <Form.Control type="number" value={newTaxAmount} onChange={(event) => setNewTaxAmount(event.target.value)} />
                </Form.Group>
              )}

              <Form.Group>
                <Form.Label>ملاحظات اللجنة</Form.Label>
                <Form.Control as="textarea" rows={3} value={committeeNote} onChange={(event) => setCommitteeNote(event.target.value)} />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDecisionModal}>إلغاء</Button>
          <Button variant="primary" onClick={submitDecision}>إرسال للمدير</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CommitteeAppeals;
