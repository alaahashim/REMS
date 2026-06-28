import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Table, Tabs, Tab, Badge, Button } from 'react-bootstrap';
import { useDataContext } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext'; 
import { useDynamicTranslation } from '../../utils/useDynamicTranslation'; 

// استيراد الخدمات
import { getUnits, getProperties } from '../../services/propertyService';
import { getGovernorates, getCenters } from '../../services/locationService';
import { getSystemLogs } from '../../services/adminService';

// استيراد خدمات الحذف والجلب المباشر
import { deleteExemption, getExemptions as getExemptionsDirect } from '../../services/exemptionService';
import { deleteAppeal } from '../../services/appealService';

// ── مكون مساعد لترجمة البيانات اللي جاية من الداتا بيز ──
const DynText = ({ text, lang }) => {
  const translated = useDynamicTranslation(text || '', lang);
  return <>{translated || '-'}</>;
};

const Dashboard = () => {
  const location = useLocation();
  const { getAssignments, getAppeals, fetchData } = useDataContext(); 
  const { lang } = useLanguage(); 

  const [loading, setLoading] = useState(true);
  
  // البيانات الأساسية
  const [units, setUnits] = useState([]); 
  const [properties, setProperties] = useState([]);
  const [exemptions, setExemptions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [appeals, setAppeals] = useState([]);

  // بيانات التحويل
  const [governorates, setGovernorates] = useState([]);
  const [centers, setCenters] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        await fetchData();
        
        const exempts = await getExemptionsDirect(); 
        const assigns = await getAssignments();
        const appels = await getAppeals();
        
        setExemptions(exempts);
        setAssignments(assigns);
        setAppeals(appels);

        const [unitsData, propsData, govData, centerData, systemLogs] = await Promise.all([
          getUnits(),
          getProperties(),
          getGovernorates(),
          getCenters(),
          getSystemLogs()
        ]);

        setUnits(unitsData);
        setProperties(propsData);
        setGovernorates(govData);
        setCenters(centerData);
        setAuditLogs(systemLogs);

      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [location]);

  // دوال مساعدة
  const getGovName = (id) => governorates.find(g => g.id == id)?.name || id;
  const getCenterName = (id) => centers.find(c => c.id == id)?.name || id;

  const getExemptionType = (typeCode) => {
    switch (typeCode) {
      case 'basic_unit': return 'الوحدة السكنية الأساسية';
      case 'disability': return 'إعفاء ذوي الإعاقة';
      case 'waqf': return 'ملكيات وقفية';
      case 'charity': return 'جمعيات خيرية';
      default: return typeCode;
    }
  };

  const safeDate = (dateStr) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('ar-EG');
  };

  // --- دوال الحذف ---
  const handleDeleteExemption = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف طلب الإعفاء هذا؟")) return;
    try {
      await deleteExemption(id);
      alert("تم حذف الطلب بنجاح");
      setExemptions(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      alert(error.message || "فشل الحذف");
    }
  };

  const handleDeleteAppeal = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف طلب الطعن هذا؟")) return;
    try {
      await deleteAppeal(id);
      alert("تم حذف الطعن بنجاح");
      setAppeals(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      alert(error.message || "فشل الحذف");
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <h3 className="text-primary fw-bold">لوحة التحكم الموحدة</h3>
          <p className="text-muted mb-0">نظرة عامة على المباني والوحدات والنشاطات الضريبية</p>
        </Col>
      </Row>

      {/* --- الإحصائيات --- */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm border-start border-4 border-primary">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase mb-1">المباني</h6>
                <h3 className="fw-bold mb-0">{loading ? '...' : properties.length}</h3>
              </div>
              <div className="text-primary opacity-25 fs-1"><i className="fa-solid fa-city"></i></div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm border-start border-4 border-info">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase mb-1">الوحدات</h6>
                <h3 className="fw-bold mb-0">{loading ? '...' : units.length}</h3>
              </div>
              <div className="text-info opacity-25 fs-1"><i className="fa-solid fa-layer-group"></i></div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm border-start border-4 border-success">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase mb-1">الإعفاءات</h6>
                <h3 className="fw-bold mb-0">{loading ? '...' : exemptions.length}</h3>
              </div>
              <div className="text-success opacity-25 fs-1"><i className="fa-solid fa-shield-halved"></i></div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm border-start border-4 border-warning">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase mb-1">الطعون</h6>
                <h3 className="fw-bold mb-0">{loading ? '...' : appeals.length}</h3>
              </div>
              <div className="text-warning opacity-25 fs-1"><i className="fa-solid fa-scale-balanced"></i></div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white fw-bold">آخر العمليات على النظام</Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center p-5"><Spinner animation="border" /></div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center text-muted">لا توجد سجلات عمليات حديثة.</div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>التاريخ والوقت</th>
                      <th>الموظف</th>
                      <th>المستخدم</th>
                      <th>الإجراء</th>
                      <th>الجهة</th>
                      <th>التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.slice(0, 5).map((log, index) => (
                      <tr key={log.id || index}>
                        <td>{index + 1}</td>
                        <td style={{ fontSize: '0.9rem' }}>{new Date(log.date).toLocaleString('ar-EG')}</td>
                        <td><DynText text={log.employeeName} lang={lang} /></td>
                        <td><DynText text={log.user} lang={lang} /></td>
                        <td>
                          <Badge bg={log.action === 'INSERT' ? 'success' : log.action === 'DELETE' ? 'danger' : 'warning'} className="fw-normal">
                            {log.action}
                          </Badge>
                        </td>
                        <td>{log.entity || log.table || '-'}</td>
                        <td style={{ fontSize: '0.85rem', maxWidth: '250px' }} className="text-muted"><DynText text={log.details || log.changeDetails} lang={lang} /></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- الجداول --- */}
      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white fw-bold">سجل النظام الشامل</Card.Header>
            <Card.Body>
              <Tabs defaultActiveKey="units" fill>
                
                <Tab eventKey="units" title={<span className="text-dark fw-bold">الوحدات الضريبية</span>}>
                  {loading ? (
                    <div className="text-center p-5"><Spinner animation="border" /></div>
                  ) : (
                    <Table hover responsive className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th><th>رقم الوحدة</th><th>نوع الوحدة</th><th>العنوان</th><th>المالك</th><th>الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {units.length === 0 ? (
                          <tr><td colSpan="6" className="text-center text-muted">لا توجد وحدات.</td></tr>
                        ) : (
                          units.map((unit, index) => {
                            const parentProperty = properties.find(p => p.id == unit.propertyId);
                            const address = parentProperty 
                                ? `${getGovName(parentProperty.governorateId)} - ${getCenterName(parentProperty.centerId)}` 
                                : 'غير معروف';
                            return (
                              <tr key={unit.id}>
                                <td>{index + 1}</td>
                                <td className="fw-bold text-primary"><span>وحدة رقم:</span> {unit.id}</td>
                                <td><DynText text={unit.unitType} lang={lang} /> (<span>دور </span>{unit.floor})</td>
                                <td><small><DynText text={address} lang={lang} /></small></td>
                                <td><DynText text={parentProperty?.ownerName || 'غير معروف'} lang={lang} /></td>
                                <td>
                                  {unit.status === 'Paid' ? <Badge bg="success">مدفوع</Badge> : 
                                   unit.status === 'New' ? <Badge bg="warning">جديد</Badge> :
                                   unit.status === 'Pending_Manager' ? <Badge bg="info">بانتظار المدير</Badge> :
                                   <Badge bg="secondary">{unit.status}</Badge>}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </Table>
                  )}
                </Tab>

                <Tab eventKey="exemptions" title={<span className="text-info fw-bold">الإعفاءات</span>}>
                  {loading ? (
                    <div className="text-center p-5"><Spinner animation="border" /></div>
                  ) : (
                    <Table hover responsive className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th><th>نوع الإعفاء</th><th>رقم العقار</th><th>تاريخ الطلب</th><th>الحالة</th><th>المرفق</th><th>الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exemptions.length === 0 ? (
                          <tr><td colSpan="7" className="text-center text-muted">لا توجد طلبات.</td></tr>
                        ) : (
                          exemptions.map((ex, index) => (
                            <tr key={ex.id}>
                              <td>{index + 1}</td>
                              <td><DynText text={getExemptionType(ex.exemptionType)} lang={lang} /></td>
                              <td>{ex.propertyId}</td>
                              <td>{safeDate(ex.createdAt)}</td>
                              <td>
                                {ex.status === 'Pending' || ex.status === 'Under Review' ? <Badge bg="warning">قيد المراجعة</Badge> : 
                                 ex.status === 'Accepted' ? <Badge bg="success">مقبول</Badge> :
                                 ex.status === 'Rejected' ? <Badge bg="danger">مرفوض</Badge> : 
                                 <Badge bg="secondary">{ex.status}</Badge>}
                              </td>
                              <td>
                                {ex.fileName ? <a href={ex.fileData} download={ex.fileName} className="btn btn-sm btn-outline-info"><i className="fa-solid fa-download"></i></a> : <span className="text-muted">-</span>}
                              </td>
                              <td>
                                {ex.status === 'Pending' || ex.status === 'Under Review' ? (
                                  <Button variant="outline-danger" size="sm" onClick={() => handleDeleteExemption(ex.id)}>
                                    <i className="fa-solid fa-trash"></i>
                                  </Button>
                                ) : (
                                  <Badge bg="secondary" title="لا يمكن الحذف">مغلق</Badge>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  )}
                </Tab>

                <Tab eventKey="assignments" title={<span className="text-success fw-bold">الملاك</span>}>
                  {loading ? <div className="text-center p-5"><Spinner animation="border" /></div> : (
                    <Table hover responsive className="mb-0">
                        <thead className="table-light">
                            <tr><th>#</th><th>رقم العقار</th><th>الاسم</th><th>الرقم</th><th>الصفة</th><th>التاريخ</th></tr>
                        </thead>
                        <tbody>
                            {assignments.length === 0 ? <tr><td colSpan="6" className="text-center text-muted">لا توجد بيانات.</td></tr> : 
                            assignments.map((assign, index) => (
                                <tr key={assign.id || index}>
                                    <td>{index + 1}</td>
                                    <td>{assign.propertyId}</td>
                                    <td><DynText text={assign.personName || 'غير محدد'} lang={lang} /></td>
                                    <td>{assign.personId}</td>
                                    <td><Badge bg={assign.roleType === 'Owner' ? 'primary' : 'secondary'}>{assign.roleType === 'Owner' ? 'مالك' : 'مستأجر'}</Badge></td>
                                    <td>{safeDate(assign.startDate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                  )}
                </Tab>

                <Tab eventKey="appeals" title={<span className="text-warning fw-bold">الطعون</span>}>
                  {loading ? (
                    <div className="text-center p-5"><Spinner animation="border" /></div>
                  ) : (
                    <Table hover responsive className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th><th>رقم الوحدة</th><th>سبب الطعن</th><th>تاريخ التقديم</th><th>الحالة</th><th>الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appeals.length === 0 ? (
                          <tr><td colSpan="6" className="text-center text-muted">لا توجد طعون.</td></tr>
                        ) : (
                          appeals.map((appeal, index) => (
                            <tr key={appeal.id}>
                              <td>{index + 1}</td>
                              <td className="fw-bold"><span>وحدة رقم:</span> {appeal.unitId}</td>
                              <td style={{ maxWidth: '200px' }}><DynText text={appeal.appealReason} lang={lang} /></td>
                              <td>{safeDate(appeal.createdAt)}</td>
                              <td>
                                {appeal.status === 'Pending_Payment' ? <Badge bg="warning">بانتظار الرسم</Badge> :
                                 appeal.status === 'Pending_Committee' ? <Badge bg="info">قيد اللجنة</Badge> :
                                 <Badge bg="secondary">{appeal.status}</Badge>}
                              </td>
                              <td>
                                {appeal.status === 'Pending_Payment' ? (
                                  <Button variant="outline-danger" size="sm" onClick={() => handleDeleteAppeal(appeal.id)}>
                                    <i className="fa-solid fa-trash"></i>
                                  </Button>
                                ) : (
                                  <Badge bg="secondary" title="لا يمكن الحذف">مغلق</Badge>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  )}
                </Tab>

              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;