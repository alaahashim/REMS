import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Row, Col, Alert, Spinner, Badge, Container, Table, InputGroup } from 'react-bootstrap';
import { getUnits, getProperties, updateUnitData } from '../../services/propertyService';
import { calculateTax } from '../../services/taxService'; 


const TaxCalculation = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  // حالة البحث السريع
  const [quickSearchId, setQuickSearchId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState(null);
  const [property, setProperty] = useState(null); 
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // مدخلات الحساب
  const [taxInput, setTaxInput] = useState({ area: 0, usage: 'Residential', annualRent: 0, isFirstHome: false });
  const [calcResult, setCalcResult] = useState(null);

  // إعدادات الفوترة والسداد
  const [billingConfig, setBillingConfig] = useState({
    payerType: 'owner', 
    paymentPlan: 'full', 
    includeAppealFee: false 
  });

  useEffect(() => {
    if (id) loadDataById(id);
  }, [id]);

  const handleQuickJump = (e) => {
    if (e.key === 'Enter' && quickSearchId) {
      e.preventDefault();
      navigate(`/reviewer/calc/${quickSearchId}`);
    }
  };

  const loadDataById = async (unitId) => {
    setLoading(true);
    try {
      const [unitsData, propsData] = await Promise.all([ getUnits(), getProperties() ]);
      const foundUnit = unitsData.find(u => String(u.id) === String(unitId));
      
      if (foundUnit) {
        const foundProp = propsData.find(p => p.id == foundUnit.propertyId);
        setUnit(foundUnit);
        setProperty(foundProp);
        prepareCalculation(foundUnit);
        setErrorMsg('');
      } else {
        setErrorMsg('وحدة غير موجودة');
      }
    } catch (error) {
      console.error("Load Error:", error);
      setErrorMsg('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const prepareCalculation = (u) => {
    const estimatedRent = (u.area || 0) * 30 * 12;
    setTaxInput({
      area: u.area || 0,
      usage: u.usage || 'Residential',
      annualRent: estimatedRent,
      isFirstHome: false,
      locationZone: u.locationZone || 'B'
    });
  };

  useEffect(() => {
    if (taxInput.area > 0) {
        const result = calculateTax(taxInput);
        setCalcResult(result);
    }
  }, [taxInput]); // إعادة الحساب عند تغيير الاستخدام أو القيمة

  const getFinalBilling = () => {
    if (!calcResult) return null;
    const tax = calcResult.tax;
    const appealFee = billingConfig.includeAppealFee ? 50 : 0; 
    const totalDue = tax + appealFee; 
    
    let installmentAmount = 0;
    let installmentCount = 0;

    if (billingConfig.paymentPlan === 'installment_2') {
        installmentCount = 2;
        installmentAmount = totalDue / 2;
    } else {
        installmentCount = 1;
        installmentAmount = totalDue;
    }

    return { tax, appealFee, totalDue, installmentCount, installmentAmount };
  };

  const finalBilling = getFinalBilling();

  const handleApprove = async () => {
    if (!window.confirm("هل أنت متأكد من اعتماد هذا التقدير وإرساله للمالية؟")) return;
    setIsSaving(true);
    try {
        await updateUnitData(unit.id, {
          status: (finalBilling.totalDue === 0) ? 'Approved' : 'Pending_Manager',
          tax: finalBilling.totalDue,
          taxDetails: `ضريبة: ${finalBilling.tax} + رسوم: ${finalBilling.appealFee}`,
          payerType: billingConfig.payerType,
          paymentPlan: billingConfig.paymentPlan
        });

        alert('تم الحفظ وإرسال الطلب للجهة المختصة');
        navigate('/reviewer/home');
    } catch (error) {
        alert('خطأ: الوحدة غير موجودة');
    }
    finally { setIsSaving(false); }
  };

  if (loading && !unit) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /> جاري التحميل...</div>;

  return (
    <Container fluid className="mt-4">
      {/* 1. البحث السريع */}
      <Row className="mb-3">
        <Col>
          <InputGroup>
            <InputGroup.Text><i className="fa-solid fa-bolt text-warning"></i></InputGroup.Text>
            <Form.Control 
              placeholder="أدخل رقم الوحدة للانتقال السريع..." 
              value={quickSearchId}
              onChange={(e) => setQuickSearchId(e.target.value)}
              onKeyDown={handleQuickJump}
            />
          </InputGroup>
        </Col>
      </Row>

      {/* رسالة الخطأ */}
      {errorMsg && (
        <Row className="justify-content-center mb-3">
            <Col md={8}><Alert variant="danger">{errorMsg}</Alert></Col>
        </Row>
      )}

      <Row className="justify-content-center">
        <Col md={11} lg={10}>
          <Card className="shadow-sm border-0 border-top border-5 border-primary">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center pt-3">
              <div>
                <small className="text-muted">تقدير ضريبة وحدة عقارية</small>
                <Card.Title className="mb-0 fs-4 fw-bold">وحدة رقم: {unit?.id}</Card.Title>
              </div>
              <div className="text-end">
                  <Badge bg="primary" className="fs-6 mb-1">{unit?.unitType}</Badge>
                  <div><small className="text-muted fw-bold">الدور: {unit?.floor}</small></div>
              </div>
            </Card.Header>
            <Card.Body>
              
              {/* بيانات المبنى */}
              <Card className="mb-3 bg-light border">
                  <Card.Body className="py-3">
                    <h6 className="fw-bold border-bottom pb-2 text-primary"><i className="fa-solid fa-building me-2"></i> بيانات المبنى</h6>
                    <Row>
                        <Col md={4}>
                            <div className="small text-muted">العنوان الكامل</div>
                            <div className="fw-bold">{property?.address || `${property?.governorateName || property?.governorateId} - ${property?.centerName || property?.centerId} - ${property?.neighborhoodName || ''} - ${property?.streetName || property?.streetId}`}</div>
                        </Col>
                        <Col md={4}>
                            <div className="small text-muted">المنطقة الضريبية</div>
                            <div className="fw-bold">{property?.locationZone || 'B'}</div>
                        </Col>
                        <Col md={4}>
                            <div className="small text-muted">اسم المالك (الأول)</div>
                            <div className="fw-bold text-primary fs-5">{property?.ownerName} <span className="text-danger">*</span></div>
                        </Col>
                    </Row>
                  </Card.Body>
              </Card>

              {/* بيانات الوحدة */}
              <Card className="mb-3 border-info">
                  <Card.Body className="py-3">
                    <h6 className="fw-bold border-bottom pb-2 text-info"><i className="fa-solid fa-house-chimney me-2"></i> بيانات الوحدة</h6>
                    <Row>
                        <Col md={4}>
                            <div className="small text-muted">المساحة</div>
                            <div className="fw-bold fs-5">{unit?.area} م²</div>
                        </Col>
                        <Col md={4}>
                            <div className="small text-muted">الاستخدام</div>
                            <div className="fw-bold fs-5">{unit?.usage}</div>
                        </Col>
                    </Row>
                  </Card.Body>
              </Card>

              <Form>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>نوع الاستخدام <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        value={taxInput.usage}
                        onChange={(e) => setTaxInput({...taxInput, usage: e.target.value})}
                      >
                        <option value="Residential">سكني (خصم 30%)</option>
                        <option value="Commercial">تجاري (خصم 32%)</option>
                        <option value="Industrial">صناعي (خصم 32%)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>القيمة الإيجارية السنوية <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="number" 
                        className="fw-bold text-primary"
                        value={taxInput.annualRent}
                        onChange={(e) => setTaxInput({...taxInput, annualRent: Number(e.target.value)})}
                      />
                    </Form.Group>
                  </Col>
                  {/* جديد: خيار الوحدة السكنية الأساسية */}
                  <Col md={4}>
                    <Form.Group className="mb-3 pt-4">
                        <Form.Check 
                            type="switch"
                            id="first-home-switch"
                            label={<span className="fw-bold text-success">الوحدة السكنية الأساسية (معفى)</span>}
                            disabled={taxInput.usage !== 'Residential'} // غير مفعال للتاجر
                            checked={taxInput.isFirstHome}
                            onChange={(e) => setTaxInput({...taxInput, isFirstHome: e.target.checked})}
                        />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>

              {/* تفاصيل الحساب القانونية (محدثة لتظهر النسب الديناميكية) */}
              {calcResult && (
                <div className="bg-light p-4 rounded mb-4 border border-info shadow-sm">
                    <h6 className="fw-bold mb-3 text-info">تفاصيل الحساب وفقاً للنظام</h6>
                    
                    <div className="d-flex justify-content-between mb-2">
                        <span>القيمة الإيجارية السنوية:</span>
                        <span className="fw-bold text-primary">{Math.round(calcResult.annualRent).toLocaleString()} ج.م</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                        <span>قواعد الحي / المنطقة:</span>
                        <span className="fw-bold">{calcResult.zoneDescription}</span>
                    </div>
                    
                    <div className="d-flex justify-content-between mb-2 text-danger">
                        <span>الخصم للصيانة والاستهلاك ({calcResult.discountRate}%):</span>
                        <span className="fw-bold">- {Math.round(calcResult.discountAmount).toLocaleString()} ج.م</span>
                    </div>
                    
                     <div className="d-flex justify-content-between mb-2 bg-white p-2 rounded border">
                        <span className="fw-bold">الوعاء الضريبي بعد الخصم:</span>
                        <span className="fw-bold">{Math.round(calcResult.netRent).toLocaleString()} ج.م</span>
                    </div>

                    {/* تفاصيل الإعفاء إذا وجدت */}
                    {calcResult.exemptionAmount > 0 && (
                        <div className="d-flex justify-content-between mb-2 text-success">
                            <span>{calcResult.exemptionLabel || 'إعفاء'}:</span>
                            <span className="fw-bold">- {Math.round(calcResult.exemptionAmount).toLocaleString()} ج.م</span>
                        </div>
                    )}

                    <hr />
                    <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded border border-success border-2">
                        <span className="fw-bold fs-5">الضريبة المستحقة ({calcResult.taxRate}%):</span>
                        <span className="fw-bold text-success fs-3">{Math.round(calcResult.tax).toLocaleString()} ج.م</span>
                    </div>
                </div>
              )}

              {/* إعدادات الفوترة والسداد */}
              {calcResult && (
                <Card className="mb-4 border-warning bg-warning bg-opacity-10">
                    <Card.Header className="bg-transparent border-bottom fw-bold text-warning">
                        <i className="fa-solid fa-file-invoice-dollar me-2"></i> إعدادات الفوترة والسداد
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Label className="fw-bold">المسؤول عن الدفع</Form.Label>
                                <div className="d-flex gap-3 mt-2">
                                    <Form.Check 
                                        type="radio" 
                                        label={<span className="fw-bold">المالك (الافتراضي)</span>} 
                                        name="payerType"
                                        id="payer-owner"
                                        checked={billingConfig.payerType === 'owner'}
                                        onChange={() => setBillingConfig({...billingConfig, payerType: 'owner'})}
                                    />
                                    <Form.Check 
                                        type="radio" 
                                        label={<span className="fw-bold">المستأجر</span>} 
                                        name="payerType"
                                        id="payer-tenant"
                                        checked={billingConfig.payerType === 'tenant'}
                                        onChange={() => setBillingConfig({...billingConfig, payerType: 'tenant'})}
                                    />
                                </div>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label className="fw-bold">خطة السداد</Form.Label>
                                <Form.Select 
                                    value={billingConfig.paymentPlan}
                                    onChange={(e) => setBillingConfig({...billingConfig, paymentPlan: e.target.value})}
                                    className="fw-bold"
                                >
                                    <option value="full">دفع كامل (دفعة واحدة)</option>
                                    <option value="installment_2">دفع على شهرين (دفعات شهرية)</option>
                                </Form.Select>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Form.Check 
                                    type="switch"
                                    id="appeal-fee-switch"
                                    label={<span className="fw-bold text-danger">إضافة رسوم تقديم طعن (+ 50 ج.م)</span>}
                                    checked={billingConfig.includeAppealFee}
                                    onChange={(e) => setBillingConfig({...billingConfig, includeAppealFee: e.target.checked})}
                                />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
              )}

              {/* ملخص الفاتورة النهائية */}
              {finalBilling && (
                <Card className="mb-4 border-dark bg-dark text-white shadow-lg">
                    <Card.Body>
                        <h5 className="fw-bold text-warning mb-3 border-bottom border-secondary pb-2">ملخص الفاتورة النهائية</h5>
                        <Table borderedless className="mb-0">
                            <tbody>
                                <tr>
                                    <td>قيمة الضريبة المستحقة:</td>
                                    <td className="text-end fw-bold">{Math.round(finalBilling.tax).toLocaleString()} ج.م</td>
                                </tr>
                                {finalBilling.appealFee > 0 && (
                                    <tr className="text-danger">
                                        <td>رسوم الطعن:</td>
                                        <td className="text-end fw-bold">+ {finalBilling.appealFee.toLocaleString()} ج.م</td>
                                    </tr>
                                )}
                                <tr className="border-top border-secondary">
                                    <td className="fs-4 fw-bold">إجمالي الفاتورة:</td>
                                    <td className="text-end fs-4 fw-bold text-success">{Math.round(finalBilling.totalDue).toLocaleString()} ج.م</td>
                                </tr>
                            </tbody>
                        </Table>
                        {finalBilling.installmentCount > 1 && (
                            <Alert variant="light" className="mt-3 text-dark">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>قسط شهري ({finalBilling.installmentCount} دفعات):</span>
                                    <span className="fw-bold fs-5 text-primary">{Math.round(finalBilling.installmentAmount).toLocaleString()} ج.م</span>
                                </div>
                            </Alert>
                        )}
                    </Card.Body>
                </Card>
              )}

              <div className="d-flex justify-content-between gap-3 mt-5">
                  <Button variant="secondary" onClick={() => navigate('/reviewer/home')}>عودة</Button>
                  <Button variant="success" onClick={handleApprove} size="lg" disabled={isSaving}>
                    {isSaving ? <Spinner size="sm" animation="border" /> : 'اعتماد وإرسال للمالية'}
                  </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TaxCalculation;