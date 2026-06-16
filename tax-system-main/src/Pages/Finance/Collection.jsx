import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Badge, InputGroup, Table } from 'react-bootstrap';
import { registerPayment } from '../../services/financeService';
import { getEnrichedUnits } from '../../services/propertyService'; 
import { getUnitInstallments } from '../../services/installmentService';

const Collection = () => {
  const navigate = useNavigate();
  
  // الحالات الأساسية
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState(null); // بيانات الوحدة
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // البحث السريع
  const [searchTerm, setSearchTerm] = useState('');

  // --- حالات جديدة خاصة بالأقساط ---
  const [pendingInstallments, setPendingInstallments] = useState([]); // قائمة الأقساط المستحقة
  const [selectedInstallment, setSelectedInstallment] = useState(null); // القسط المختار حالياً

  // بيانات الدفع
  const [paymentData, setPaymentData] = useState({
    receiptNo: '',
    amount: 0,
    method: 'Cash',
    paymentDate: new Date().toISOString().split('T')[0]
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const handlePrintReceipt = () => {
    window.print();
  };

  // دالة البحث عن وحدة
  const handleQuickSearch = async (e) => {
    e.preventDefault();
    if(!searchTerm) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const units = await getEnrichedUnits();
      const found = units.find(u => String(u.id) === searchTerm);
      
      if (found) {
        if (found.status !== 'Approved') {
          setErrorMsg('هذه الوحدة لم توافق عليها الإدارة بعد ولا يمكن تسجيل سداد أو طباعة فاتورة.');
          setUnit(null);
          setPendingInstallments([]);
          setSelectedInstallment(null);
          return;
        }

        setUnit(found);
        // جلب الأقساط الخاصة بهذه الوحدة
        const installments = await getUnitInstallments(found.id);
        // فلترة: الأقساط التي لم تدفع فقط
        const pending = installments.filter(i => i.status === 'Pending');
        setPendingInstallments(pending);
        
        // اختيار أول قسط افتراضياً إذا وجد
        if(pending.length > 0) {
            setSelectedInstallment(pending[0]);
            setPaymentData(prev => ({...prev, amount: pending[0].amount}));
        }
      } else {
        setErrorMsg('وحدة غير موجودة برقم: ' + searchTerm);
        setUnit(null);
        setPendingInstallments([]);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('حدث خطأ في البحث');
    } finally {
      setLoading(false);
    }
  };

  // دالة الدفع
  const handlePay = async () => {
    if (!selectedInstallment) {
        alert("الرجاء اختيار القسط المراد دفعه أولاً من الجدول");
        return;
    }
    
    if (!window.confirm(`هل أنت متأكد من تسجيل مبلغ ${Math.round(paymentData.amount)} ج.م؟`)) return;
    
    setIsSaving(true);
    try {
      // نرسل ID القسط المختار (وليس ID الوحدة)
      await registerPayment(selectedInstallment.id, {
        receiptNo: paymentData.receiptNo,
        amount: paymentData.amount,
        method: paymentData.method,
        paymentDate: paymentData.paymentDate,
        employeeId: 1 // يمكن جلبه من الـ AuthContext لاحقاً
      });
      
      setPaymentSuccess(true);
      setReceiptData({
        unit,
        installment: selectedInstallment,
        payment: paymentData
      });
      setPendingInstallments(prev => prev.filter(i => i.id !== selectedInstallment.id));
      setSelectedInstallment(null);
      alert('تم تسجيل السداد بنجاح. يمكنك طباعة الإيصال الآن.');
    } catch (error) {
      alert('فشلت العملية: ' + (error.message || 'حدث خطأ غير متوقع'));
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  //            واجهة المستخدم (Return)
  // ==========================================

  // 1. واجهة البحث (في البداية)
  if (!unit) {
    return (
      <Container fluid className="mt-5 d-flex justify-content-center">
        <Row>
            <Col md={8} className="mx-auto">
              <Card className="shadow-lg border-0 border-top border-5 border-success text-center p-5">
                <Card.Body>
                    <i className="fa-solid fa-money-check-dollar fa-4x text-success mb-4"></i>
                    <h2 className="fw-bold mb-3">تسجيل سداد ضريبي</h2>
                    <p className="text-muted">ابحث عن وحدة لتسجيل إيصال الدفع</p>
                    
                    {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
                    
                    <Form onSubmit={handleQuickSearch}>
                        <InputGroup size="lg">
                            <InputGroup.Text><i className="fa-solid fa-search"></i></InputGroup.Text>
                            <Form.Control 
                                placeholder="رقم الوحدة أو اسم المالك..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                required
                            />
                            <Button variant="success" type="submit">
                                {loading ? <Spinner size="sm" animation="border"/> : 'بحث'}
                            </Button>
                        </InputGroup>
                    </Form>
                </Card.Body>
              </Card>
            </Col>
        </Row>
      </Container>
    );
  }

  // 2. شاشة التحميل
  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /> جاري التحميل...</div>;

  // تحقق حالة الوحدة (اختياري لمنع الدفع المزدوج)
  const isFullyPaid = pendingInstallments.length === 0 && unit.status !== 'New'; 

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col md={11} lg={10}>
          <Card className="shadow-sm border-0 border-top border-5 border-success">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center pt-3">
              <div>
                <small className="text-muted">تسجيل سداد (Receipt Registration)</small>
                <Card.Title className="mb-0 fs-4 fw-bold">وحدة رقم: {unit.id}</Card.Title>
              </div>
              <Badge bg={isFullyPaid ? 'success' : 'info'} className="fs-6">
                {isFullyPaid ? 'لا توجد أقساط مستحقة' : 'جاهز للدفع'}
              </Badge>
            </Card.Header>
            <Card.Body>
              
              {/* حالة: تم دفع كل شيء؟ */}
              {isFullyPaid ? (
                <Alert variant="success" className="text-center">
                    <i className="fa-solid fa-check-circle fa-2x mb-2"></i>
                    <h4>جميع الأقساط المسجلة لهذه الوحدة تم دفعها</h4>
                    <Button variant="outline-secondary" className="mt-3" onClick={() => navigate('/finance/home')}>عودة</Button>
                </Alert>
              ) : (
                <>
                    {/* معلومات الوحدة */}
                    <Alert variant="secondary">
                        <h6 className="fw-bold border-bottom pb-2">بيانات الوحدة والمالك</h6>
                        <Row>
                            <Col md={6}>
                                <div><small>المالك:</small> <strong>{unit.ownerName}</strong></div>
                                <div><small>العنوان:</small> {unit.propertyAddress}</div>
                                <div><small>نوع الوحدة:</small> {unit.unitType} (الدور {unit.floor})</div>
                            </Col>
                            <Col md={6} className="text-end">
                                <div className="small text-muted">إجمالي الضريبة السنوية</div>
                                <div className="fw-bold text-primary fs-4">{Math.round(unit.tax || 0).toLocaleString()} ج.م</div>
                            </Col>
                        </Row>
                    </Alert>

                    {/* جدول الأقساط المستحقة */}
                    {pendingInstallments.length > 0 ? (
                        <Card className="mb-3 border-info bg-light">
                            <Card.Header className="bg-info text-white fw-bold py-2">
                                الأقساط المستحقة (الرجاء اختيار قسط للدفع)
                            </Card.Header>
                            <Card.Body className="p-0">
                                <Table hover size="sm" className="mb-0">
                                    <thead>
                                        <tr>
                                            <th>تاريخ الاستحقاق</th>
                                            <th className="text-end">المبلغ (ج.م)</th>
                                            <th className="text-center">اختيار</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingInstallments.map((inst) => (
                                            <tr 
                                                key={inst.id} 
                                                style={{cursor: 'pointer', backgroundColor: selectedInstallment?.id === inst.id ? '#e8f0fe' : 'white'}}
                                                onClick={() => {
                                                    setSelectedInstallment(inst);
                                                    setPaymentData(prev => ({...prev, amount: inst.amount}));
                                                }}
                                            >
                                                <td>{new Date(inst.dueDate).toLocaleDateString('ar-EG')}</td>
                                                <td className="text-end fw-bold">{Math.round(inst.amount).toLocaleString()}</td>
                                                <td className="text-center">
                                                    <Form.Check 
                                                        type="radio" 
                                                        checked={selectedInstallment?.id === inst.id}
                                                        readOnly 
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    ) : (
                        <Alert variant="warning">لا توجد أقساط مستحقة حالياً (قد يكون النظام لم يولدها بعد).</Alert>
                    )}

                    {/* نموذج الدفع */}
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>رقم الإيصال (Receipt No) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="اكتب رقم الكاشير..."
                                        value={paymentData.receiptNo}
                                        onChange={(e) => setPaymentData({...paymentData, receiptNo: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>طريقة الدفع</Form.Label>
                                    <Form.Select
                                        value={paymentData.method}
                                        onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                                    >
                                        <option value="Cash">نقدي (Cash)</option>
                                        <option value="Fawry">فوري (Fawry)</option>
                                        <option value="Bank">تحويل بنكي</option>
                                        <option value="InstaPay">إنستا باي</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>مبلغ الدفع (ج.م)</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        className="fw-bold text-primary fs-5"
                                        value={paymentData.amount}
                                        onChange={(e) => setPaymentData({...paymentData, amount: Number(e.target.value)})}
                                        required
                                        readOnly // يفضل جعله للقراءة فقط لضمان الدفع بالقسط المحدد
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>تاريخ السداد</Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        value={paymentData.paymentDate}
                                        onChange={(e) => setPaymentData({...paymentData, paymentDate: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-between gap-3 mt-5">
                            <Button variant="secondary" onClick={() => navigate('/finance/home')}>إلغاء</Button>
                            <Button 
                                variant="success" 
                                onClick={handlePay} 
                                size="lg" 
                                disabled={!selectedInstallment || isSaving}
                                className="px-5"
                            >
                                {isSaving ? <Spinner size="sm" animation="border" /> : `تأكيد دفع القسط (${selectedInstallment ? Math.round(selectedInstallment.amount) : 0})`}
                            </Button>
                        </div>
                    </Form>

                    {paymentSuccess && receiptData && (
                        <Card className="mt-4 border-primary receipt-box" id="receipt-print-section">
                            <Card.Header className="bg-primary text-white fw-bold">
                                إيصال سداد الضريبة
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-2"><strong>رقم الإيصال:</strong> {receiptData.payment.receiptNo}</div>
                                <div className="mb-2"><strong>رقم الوحدة:</strong> {receiptData.unit.id}</div>
                                <div className="mb-2"><strong>اسم المالك:</strong> {receiptData.unit.ownerName}</div>
                                <div className="mb-2"><strong>العنوان:</strong> {receiptData.unit.propertyAddress}</div>
                                <div className="mb-2"><strong>المبلغ المدفوع:</strong> {Math.round(receiptData.payment.amount).toLocaleString()} ج.م</div>
                                <div className="mb-2"><strong>طريقة الدفع:</strong> {receiptData.payment.method}</div>
                                <div className="mb-2"><strong>تاريخ السداد:</strong> {new Date(receiptData.payment.paymentDate).toLocaleDateString('ar-EG')}</div>
                                <div className="mb-2"><strong>القسط:</strong> {receiptData.installment.id}</div>
                                <div className="d-flex justify-content-end gap-2 mt-3 no-print">
                                    <Button variant="outline-primary" onClick={handlePrintReceipt}>طباعة الإيصال</Button>
                                    <Button variant="outline-secondary" onClick={() => navigate('/finance/home')}>العودة للرئيسية</Button>
                                </div>
                            </Card.Body>
                        </Card>
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

export default Collection;