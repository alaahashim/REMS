import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { Tabs, Tab } from 'react-bootstrap';
import { updatePropertyStatus } from '../../services/propertyService'; 
import { getAppeals } from '../../services/appealService'; 
import { approveCommitteeAppeal } from '../../services/managerService'; 
import { getEnrichedUnits } from '../../services/propertyService'; 

const ManagerVerdict = () => {
  const [key, setKey] = useState('reviews'); 
  const [tasks, setTasks] = useState([]);
  const [committeeAppeals, setCommitteeAppeals] = useState([]);
  // --- إضافة الـ State الخاص بالإعفاءات (الجزء الجديد) ---
  const [exemptions, setExemptions] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [decisionNote, setDecisionNote] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const enrichedUnits = await getEnrichedUnits();
        const pending = enrichedUnits.filter(u => u.status === 'Pending_Manager');
        setTasks(pending);
        
        const appeals = await getAppeals();
        const pendingAppeals = appeals.filter(a => a.status === 'Pending_Manager_Appeal');
        const enrichedAppeals = pendingAppeals.map(appeal => {
            const unit = enrichedUnits.find(u => String(u.id) === String(appeal.unitId));
            return { 
                ...appeal, 
                originalTax: unit ? unit.tax : 0, 
                ownerName: unit ? unit.ownerName : 'غير معروف',
                propertyAddress: unit ? unit.propertyAddress : 'غير معروف'
            };
        });
        setCommitteeAppeals(enrichedAppeals);

        // --- جلب بيانات الإعفاءات (الجزء الجديد) ---
        const { getExemptions } = await import('../../services/exemptionService');
        const exemptsData = await getExemptions();
        setExemptions(exemptsData.filter(e => e.status === 'Pending_Manager_Exemption')); // عرض توصيات اللجنة فقط
        // ------------------------------------------

      } catch (error) {
        console.error("Error loading manager tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenReview = (task) => {
    setSelectedItem({ type: 'review', data: task });
    setShowModal(true);
    setDecisionNote('');
  };

  const handleFinalDecision = async (isApproved) => {
    const newStatus = isApproved ? 'Approved' : 'Rejected';
    if (!window.confirm(isApproved ? "اعتماد نهائي؟" : "رفض؟")) return;
    try {
      await updatePropertyStatus(selectedItem.data.id, newStatus, selectedItem.data.tax);
      // بعد نجاح تحديث حالة الوحدة
     if (isApproved && selectedItem.data.tax > 0) {
        const { generateInstallments } = await import('../../services/installmentService');
        await generateInstallments(selectedItem.data.id, selectedItem.data.tax);
    }
      alert("تم القرار وتوليد جدول الأقساط");
      setShowModal(false);
      const units = await getEnrichedUnits();
      setTasks(units.filter(u => u.status === 'Pending_Manager'));
    } catch { alert("فشل"); }
  };

  const handleOpenAppeal = (appeal) => {
      setSelectedItem({ type: 'appeal', data: appeal });
      setShowModal(true);
      setDecisionNote('');
  };

  const handleCommitteeApproval = async (isApproved) => {
      if(!window.confirm(isApproved ? "اعتماد قرار اللجنة؟" : "رفض قرار اللجنة؟")) return;
      try {
          if(isApproved) {
              await approveCommitteeAppeal(selectedItem.data.id);
              alert("تم اعتماد قرار اللجان");
          } else {
              alert("تم الرفض");
          }
          setShowModal(false);
          const appeals = await getAppeals();
          const pendingAppeals = appeals.filter(a => a.status === 'Pending_Manager_Appeal');
          setCommitteeAppeals(pendingAppeals);
      } catch { alert("فشل"); }
  };

  // --- دالة التعامل مع قرارات الإعفاء (الجزء الجديد) ---
  const handleExemptionDecision = async (exemptionId, isApproved) => {
      const decision = isApproved ? 'قبول' : 'رفض';
      if (!window.confirm(`هل أنت متأكد من ${decision} طلب الإعفاء؟`)) return;
      
      try {
          const { updateExemptionStatus } = await import('../../services/exemptionService');
          const note = isApproved ? "تم اعتماد الإعفاء بناءً على المستندات" : "مرفوض لعدم استيفاء الشروط";
          
          await updateExemptionStatus(exemptionId, isApproved ? 'Accepted' : 'Rejected', note);
          
          alert(`تم ${decision} الطلب`);
          
          // تحديث قائمة الإعفاءات
          const { getExemptions } = await import('../../services/exemptionService');
          const data = await getExemptions();
          setExemptions(data.filter(e => e.status === 'Pending_Manager_Exemption'));
          
      } catch (error) {
          console.error(error);
          alert("فشل العملية");
      }
  };
  // ------------------------------------------------

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <h3 className="text-warning fw-bold">مكتب الاعتمادات والقرارات</h3>
          <p className="text-muted">اعتماد تقديرات الوحدات، قرارات اللجان، وطلبات الإعفاء</p>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Tabs id="manager-tabs" activeKey={key} onSelect={(k) => setKey(k)} fill className="mb-4">
            
            {/* التبويب الأول: تقديرات المراجع */}
            <Tab eventKey="reviews" title={<span className="fw-bold">تقديرات المراجع <Badge bg="primary">{tasks.length}</Badge></span>}>
              {loading ? <div className="text-center p-5"><Spinner /></div> : tasks.length === 0 ? <div className="text-center p-5">لا توجد ملفات</div> : (
                <Table hover>
                  <thead><tr><th>#</th><th>رقم الوحدة</th><th>نوع/دور</th><th>المالك</th><th>العنوان</th><th>الضريبة</th><th>الإجراء</th></tr></thead>
                  <tbody>
                    {tasks.map((task, i) => (
                      <tr key={task.id}>
                        <td>{i+1}</td>
                        <td className="fw-bold text-primary">Unit #{task.id}</td>
                        <td>{task.unitType} (دور {task.floor})</td>
                        <td>{task.ownerName}</td>
                        <td><small>{task.propertyAddress}</small></td>
                        <td className="fw-bold text-success">{task.tax ? task.tax.toLocaleString() : '0'} ج.م</td>
                        <td><Button size="sm" variant="outline-primary" onClick={() => handleOpenReview(task)}>توقيع</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>

            {/* التبويب الثاني: قرارات اللجان */}
            <Tab eventKey="appeals" title={<span className="fw-bold">قرارات اللجان <Badge bg="info">{committeeAppeals.length}</Badge></span>}>
               {loading ? <div className="text-center p-5"><Spinner /></div> : committeeAppeals.length === 0 ? <div className="text-center p-5">لا توجد قرارات معلقة</div> : (
                <Table hover>
                  <thead><tr><th>رقم القضية</th><th>رقم الوحدة</th><th>قرار اللجنة</th><th>الضريبة الأصلية</th><th>المبلغ المقترح</th><th>الإجراء</th></tr></thead>
                  <tbody>
                    {committeeAppeals.map((appeal) => (
                      <tr key={appeal.id}>
                        <td className="fw-bold">#{appeal.id}</td>
                        <td>{appeal.unitId}</td>
                        <td>
                            <Badge bg={appeal.verdict === 'Accept' ? 'success' : 'danger'}>
                                {appeal.verdict === 'Accept' ? 'قبول' : 'رفض'}
                            </Badge>
                        </td>
                        <td className="text-muted">{appeal.originalTax} ج.م</td>
                        <td className={appeal.verdict === 'Accept' ? 'text-success fw-bold' : 'text-muted'}>
                            {appeal.verdict === 'Accept' ? appeal.proposedTax + ' ج.م' : '-'}
                        </td>
                        <td><Button size="sm" variant="outline-info" onClick={() => handleOpenAppeal(appeal)}>اعتماد</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>

            {/* التبويب الثالث (الجديد): طلبات الإعفاء */}
            <Tab eventKey="exemptions" title={<span className="fw-bold">طلبات الإعفاء <Badge bg="info">{exemptions.length}</Badge></span>}>
               {loading ? <div className="text-center p-5"><Spinner /></div> : exemptions.length === 0 ? <div className="text-center p-5">لا توجد طلبات إعفاء معلقة</div> : (
                <Table hover>
                  <thead><tr><th>رقم الطلب</th><th>رقم العقار</th><th>نوع الإعفاء</th><th>تاريخ الطلب</th><th>المرفق</th><th>الإجراء</th></tr></thead>
                  <tbody>
                    {exemptions.map((ex) => (
                      <tr key={ex.id}>
                        <td className="fw-bold">#{ex.id}</td>
                        <td>{ex.propertyId}</td>
                        <td>{ex.exemptionType}</td>
                        <td>{new Date(ex.createdAt).toLocaleDateString('ar-EG')}</td>
                        <td>
                            {ex.fileName ? (
                                <a href={ex.fileData} download={ex.fileName} className="btn btn-sm btn-outline-info">
                                    <i className="fa-solid fa-download"></i> تحميل
                                </a>
                            ) : <span className="text-muted">لا يوجد</span>}
                        </td>
                        <td>
                            <div className="d-flex gap-2">
                                <Button variant="outline-success" size="sm" onClick={() => handleExemptionDecision(ex.id, true)} title="قبول">
                                    <i className="fa-solid fa-check"></i>
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleExemptionDecision(ex.id, false)} title="رفض">
                                    <i className="fa-solid fa-xmark"></i>
                                </Button>
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>

          </Tabs>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>
            {selectedItem?.type === 'review' ? 'اعتماد تقدير' : 
             selectedItem?.type === 'appeal' ? 'اعتماد قرار لجنة' : 'اعتماد إعفاء'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {selectedItem?.type === 'review' ? (
                <div>
                    <h4>وحدة: {selectedItem.data.unitType} - دور {selectedItem.data.floor}</h4>
                    <p className="text-muted">المالك: {selectedItem.data.ownerName}</p>
                    <h2 className="text-center text-success my-3">{selectedItem.data.tax ? selectedItem.data.tax.toLocaleString() : '0'} ج.م</h2>
                    <Form.Control as="textarea" rows={2} placeholder="ملاحظات المدير..." value={decisionNote} onChange={e=>setDecisionNote(e.target.value)} />
                    <div className="d-flex gap-2 mt-3">
                        <Button variant="danger" className="w-50" onClick={()=>handleFinalDecision(false)}>رفض</Button>
                        <Button variant="success" className="w-50" onClick={()=>handleFinalDecision(true)}>اعتماد</Button>
                    </div>
                </div>
            ) : selectedItem?.type === 'appeal' ? (
                <div>
                    <Alert variant="info">
                        <strong>القرار:</strong> {selectedItem?.data.verdict === 'Accept' ? 'قبول الطعن' : 'رفض الطعن'}<br/>
                        <strong>ملاحظات اللجنة:</strong> {selectedItem?.data.committeeNote}
                    </Alert>
                    {selectedItem?.data.verdict === 'Accept' && (
                         <div className="text-center my-3 p-3 bg-light rounded">
                            <p>سيتم تغيير الضريبة من <strong className="text-danger">{selectedItem?.data.originalTax}</strong> إلى <strong className="text-success">{selectedItem?.data.proposedTax}</strong></p>
                         </div>
                    )}
                    <div className="d-flex gap-2 mt-3">
                        <Button variant="secondary" className="w-50" onClick={()=>handleCommitteeApproval(false)}>رفض التوصية</Button>
                        <Button variant="primary" className="w-50" onClick={()=>handleCommitteeApproval(true)}>توقيع وتنفيذ</Button>
                    </div>
                </div>
            ) : null}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ManagerVerdict;
