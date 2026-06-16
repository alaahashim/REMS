import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Table, Button, Spinner, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { getAppeals, committeeDecision } from '../../services/committeeService';

const CommitteeHome = () => {
  const navigate = useNavigate();
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // المتغيرات
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [verdict, setVerdict] = useState(''); // 'Accept' or 'Reject'
  const [committeeNote, setCommitteeNote] = useState('');
  const [newTaxAmount, setNewTaxAmount] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getAppeals();
        setAppeals(data);
      } catch (error) {
        console.error("Error loading committee:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleOpenVerdict = (appeal) => {
      setSelectedAppeal(appeal);
      setShowModal(true);
      setVerdict('');
      setCommitteeNote('');
      setNewTaxAmount('');
  };

  const handleFinalDecision = async () => {
      if (!verdict) return alert("يرجى اختيار القرار");
      if (verdict === 'Accept' && !newTaxAmount) return alert("عند القبول، يجب تحديد المبلغ الجديد");

      const confirmMsg = verdict === 'Accept' 
      ? "هل أنت متأكد من إحالة القبول للمدير؟" 
      : "هل أنت متأكد من إحالة الرفض للمدير؟";

      if (!window.confirm(confirmMsg)) return;

      try {
          // نرسل البيانات للخدمة التي بدورها تحفظها كـ Pending_Manager
          await committeeDecision(selectedAppeal.id, {
            verdict: verdict,
            note: committeeNote,
            newTaxAmount: newTaxAmount
          });
          alert("تم إرسال قرار اللجنة للمدير للموافقة النهائية");
          setShowModal(false);
          const data = await getAppeals();
          setAppeals(data);
      } catch (error) {
          alert("فشلت العملية: " + error.message);
      }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/manager/home')}>
          <i className="fa-solid fa-arrow-right"></i> عودة للرئيسية
        </button>
      </div> */}

      <Container fluid>
        <Card style={{ padding: '20px', marginBottom: '20px', background: 'white', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 style={{ color: 'var(--info)' }}>لجنة الطعون العقارية</h3>
              <p className="text-muted mb-0">دراسة الطعون وإصدار التوصيات (للعرض على المدير)</p>
            </div>
            <Badge bg="info" className="fs-5">{appeals.length} قضية</Badge>
          </div>
        </Card>

        <Card style={{ background: 'white', padding: '25px' }}>
          {loading ? <div className="text-center"><Spinner animation="border" /></div> : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>رقم القضية</th>
                  <th>رقم الوحدة</th>
                  <th>المواطن</th>
                  <th>سبب الطعن</th>
                  <th>الحالة</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {appeals.length === 0 ? (
                  <tr><td colSpan="6" className="text-center">لا توجد قضايا</td></tr>
                ) : appeals.map(appeal => (
                  <tr key={appeal.id}>
                    <td className="fw-bold text-primary">#{appeal.id}</td>
                    <td>{appeal.unitId}</td>
                    <td>{appeal.personId}</td>
                    <td style={{ maxWidth: '200px' }}>{appeal.appealReason}</td>
                    <td>
                      {appeal.status === 'Pending' && <Badge bg="warning">معلقة للنظر</Badge>}
                      {appeal.status === 'Pending_Manager_Appeal' && <Badge bg="info">تم العرض على المدير</Badge>}
                    </td>
                    <td>
                      {appeal.status === 'Pending' ? (
                        <Button variant="primary" size="sm" onClick={() => handleOpenVerdict(appeal)}>
                          <i className="fa-solid fa-pen-to-square"></i> إصدار توصية
                        </Button>
                      ) : (
                        <Button variant="secondary" size="sm" disabled>تم الإرسال</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        {/* Modal التوصية */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
          <Modal.Header className="bg-info text-white">
            <Modal.Title>توصية اللجنة للعرض على المدير</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedAppeal && (
              <div>
                <Alert variant="secondary">
                  <strong>الوحدة:</strong> {selectedAppeal.unitId} | <strong>السبب:</strong> {selectedAppeal.appealReason}
                </Alert>

                <Form.Group className="mb-3">
                  <Form.Label>توصية اللجنة</Form.Label>
                  <Form.Select value={verdict} onChange={(e) => setVerdict(e.target.value)}>
                    <option value="">اختر...</option>
                    <option value="Accept">قبول الطعن (تخفيض الضريبة)</option>
                    <option value="Reject">رفض الطعن (إبقاء التقدير)</option>
                  </Form.Select>
                </Form.Group>

                {verdict === 'Accept' && (
                  <Form.Group className="mb-3">
                    <Form.Label>المبلغ المقترح للدفع (ج.م)</Form.Label>
                    <Form.Control type="number" value={newTaxAmount} onChange={(e) => setNewTaxAmount(e.target.value)} />
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>ملاحظات اللجنة (تسجل في المحضر)</Form.Label>
                  <Form.Control as="textarea" rows={3} value={committeeNote} onChange={(e) => setCommitteeNote(e.target.value)} />
                </Form.Group>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>إلغاء</Button>
            <Button variant="primary" onClick={handleFinalDecision}>عرض على المدير</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default CommitteeHome;