import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Row, Col, Table, Badge, Button, Container, Tab, Tabs, Form, Nav, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { getProperties } from '../../services/propertyService';
// ✅ استيراد دوال الطعون والإعفاءات
import { getAppeals, deleteAppeal } from '../../services/appealService';
import { getExemptions, deleteExemption } from '../../services/exemptionService';

const DataEntryHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');

  // البيانات الوهمية (لأغراض العرض الافتراضي قبل التحميل)
  const initialMockRequests = [
    { id: 501, type: 'طعن', refNo: 'TN-2023-501', citizen: 'محمد أحمد علي', subject: 'مبالغة في القيمة السوقية', date: '2023-10-26', status: 'Pending' },
    { id: 502, type: 'إعفاء', refNo: 'EX-2023-112', citizen: 'سارة محمود', subject: 'إعفاء وحدة سكنية أساسية', date: '2023-10-25', status: 'Under Review' },
    { id: 503, type: 'طعن', refNo: 'TN-2023-499', citizen: 'شركة النور للمقاولات', subject: 'خطأ في مساحة الأرض', date: '2023-10-24', status: 'Approved' },
    { id: 504, type: 'إعفاء', refNo: 'EX-2023-110', citizen: 'خالد إبراهيم', subject: 'إعفاء ذوي الإعاقة', date: '2023-10-23', status: 'Rejected' },
    { id: 505, type: 'طعن', refNo: 'TN-2023-498', citizen: 'منى عبد السلام', subject: 'تكرار الفاتورة', date: '2023-10-22', status: 'Pending' },
  ];

  const [allRequests, setAllRequests] = useState(initialMockRequests);
  // بيانات العقارات الديناميكية
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ دالة جلب البيانات الحقيقية عند فتح الصفحة
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // جلب العقارات
      const props = await getProperties();
      setProperties(props);

      // جلب الطعون والإعفاءات من الذاكرة
      // ملاحظة: دمجنا البيانات في قائمة allRequests
      const appeals = await getAppeals();
      const exemptions = await getExemptions();
      
      // تحويل الطعون والإعفاءات لنفس الشكل (لعرضهم في الجدول الموحد)
      const formattedRequests = [
        ...appeals.map(a => ({ ...a, type: 'طعن' })),
        ...exemptions.map(e => ({ ...e, type: 'إعفاء' }))
      ];

      setAllRequests(formattedRequests);
    } catch (error) {
      console.error("فشل تحميل البيانات", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // ✅ دالة الحذف الحقيقية (تعمل على الـ API/LocalStorage)
  const handleDeleteRequest = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        // 1. البحث عن الهدف لمعرفة نوعه
        const target = allRequests.find(r => r.id === id);
        if (!target) return;

        // 2. استدعاء دالة الحذف المناسبة
        if (target.type === 'طعن') {
          await deleteAppeal(id);
        } else if (target.type === 'إعفاء') {
          await deleteExemption(id);
        }

        // 3. تحديث القائمة على الشاشة فوراً
        setAllRequests(allRequests.filter(r => r.id !== id));
        alert('تم حذف الطلب بنجاح');
      } catch (error) {
        console.error("Delete Error:", error);
        alert('فشل حذف الطلب');
      }
    }
  };

  // دالة الحذف للعقارات
  const handleDeleteProperty = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف بيانات هذا العقار؟')) {
      // ملاحظة: دالة حذف العقار موجودة في ملف propertyService
      // نحتاج لاستيرادها إذا لم تكن موجودة
      // import { deleteProperty } from '../../services/propertyService'; 
      // لكن سأعتمد على الطريقة المباشرة هنا لضمان العمل فوراً
      const props = JSON.parse(localStorage.getItem('properties')) || [];
      const newProps = props.filter(p => p.id != id);
      localStorage.setItem('properties', JSON.stringify(newProps));
      setProperties(newProps);
      alert('تم حذف العقار بنجاح');
    }
  };

  const handleEditRequest = (req) => {
    if (req.type === 'طعن') navigate(`/data-entry/edit-appeal/${req.id}`);
    else if (req.type === 'إعفاء') navigate(`/data-entry/edit-exemption/${req.id}`);
  };

  const handleEditProperty = (id) => {
    navigate(`/data-entry/edit-property/${id}`);
  };

  const getFilteredData = (key) => {
    const query = searchQuery.toLowerCase();
    
    if (key === 'properties') {
      return properties.filter(p => 
        (p.refNo && p.refNo.toString().toLowerCase().includes(query)) || 
        (p.ownerName && p.ownerName.toLowerCase().includes(query)) ||
        (p.address && p.address.toLowerCase().includes(query))
      );
    } else {
      let statusFilter = key === 'pending' ? ['Pending', 'Under Review'] : ['Approved', 'Rejected'];
      return allRequests.filter(req => 
        statusFilter.includes(req.status) && (
          req.refNo.toLowerCase().includes(query) ||
          req.citizen.toLowerCase().includes(query)
        )
      );
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved': return <Badge bg="success">تم الاعتماد</Badge>;
      case 'Rejected': return <Badge bg="danger">مرفوض</Badge>;
      case 'Pending': return <Badge bg="warning text-dark">قيد الانتظار</Badge>;
      case 'Under Review': return <Badge bg="info">قيد المراجعة</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    return type === 'طعن' 
      ? <Badge bg="primary" className="rounded-pill"><i className="fa-solid fa-gavel me-1"></i> طعن</Badge>
      : <Badge bg="secondary" className="rounded-pill"><i className="fa-solid fa-shield-halved me-1"></i> إعفاء</Badge>;
  };

  return (
    <Container fluid className="mt-4">
      <Row className="mb-3 justify-content-end">
        <Col xs="auto">
          <div className="bg-light p-2 rounded border border-light d-flex align-items-center gap-2 px-3">
            <i className="fa-regular fa-calendar-days text-primary fs-5"></i>
            <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>{getCurrentDate()}</span>
          </div>
        </Col>
      </Row>

      {/* قسم الإجراءات السريعة (Action Cards) */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Link to="/data-entry/add" className="text-decoration-none">
            <Card className="h-100 shadow-sm border-0 border-top border-4 border-primary" style={{ transition: 'transform 0.2s' }} className="hover-lift">
              <Card.Body className="d-flex align-items-center p-3">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                  <i className="fa-solid fa-building text-primary fs-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark">إضافة عقار جديد</h6>
                  <small className="text-muted">تسجيل عقار + ربط المالك تلقائياً</small>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col md={3}>
          <Link to="/data-entry/link" className="text-decoration-none">
            <Card className="h-100 shadow-sm border-0 border-top border-4 border-info">
              <Card.Body className="d-flex align-items-center p-3">
                <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                  <i className="fa-solid fa-user-plus text-info fs-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark">ربط مالك إضافي</h6>
                  <small className="text-muted">إضافة شريك ملكية أو تحديث المالك</small>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col md={3}>
          <Link to="/data-entry/appeal" className="text-decoration-none">
            <Card className="h-100 shadow-sm border-0 border-top border-4 border-warning">
              <Card.Body className="d-flex align-items-center p-3">
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                  <i className="fa-solid fa-gavel text-warning fs-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark">تقديم طعن ضريبي</h6>
                  <small className="text-muted">اعتراض على القيمة أو تقدير الضرائب</small>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col md={3}>
          <Link to="/data-entry/exemption" className="text-decoration-none">
            <Card className="h-100 shadow-sm border-0 border-top border-4 border-secondary">
              <Card.Body className="d-flex align-items-center p-3">
                <div className="bg-secondary bg-opacity-10 p-3 rounded-circle me-3">
                  <i className="fa-solid fa-shield-halved text-secondary fs-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark">طلب إعفاء ضريبي</h6>
                  <small className="text-muted">وحدات سكنية أساسية / ذوي إعاقة</small>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Tab.Container id="main-tabs" defaultActiveKey="pending">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Nav variant="pills" className="bg-light rounded p-1">
                <Nav.Item>
                  <Nav.Link eventKey="pending" className="rounded-pill px-4">الطلبات المعلقة (تحتاج متابعة)</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="decided" className="rounded-pill px-4">القرارات الصادرة (الأرشيف)</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="properties" className="rounded-pill px-4">
                    <i className="fa-solid fa-building me-1"></i> العقارات المسجلة
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              
              <div className="d-flex gap-2" style={{width: '300px'}}>
                 <Form.Control 
                    type="text" 
                    placeholder="بحث (رقم / اسم / عنوان)..." 
                    size="sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
            </div>

            <Tab.Content>
              <Tab.Pane eventKey="pending">
                <Table hover responsive className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>رقم الطلب</th>
                      <th>النوع</th>
                      <th>اسم المواطن / المالك</th>
                      <th>موضوع الطلب</th>
                      <th>تاريخ التقدم</th>
                      <th>الحالة الحالية</th>
                      <th className="text-end pe-4">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? <tr><td colSpan="8" className="text-center py-5"><Spinner animation="border" /></td></tr> : getFilteredData('pending').map((req) => (
                      <tr key={req.id}>
                        <td className="fw-bold text-primary">{req.refNo}</td>
                        <td>{getTypeBadge(req.type)}</td>
                        <td className="fw-medium">{req.citizen}</td>
                        <td className="text-muted">{req.subject}</td>
                        <td className="small">{req.date}</td>
                        <td>{getStatusBadge(req.status)}</td>
                        <td className="text-end pe-4">
                          <div className="d-flex justify-content-end gap-1">
                            <Button 
                                variant="light" 
                                size="sm" 
                                className="text-primary border"
                                title="تعديل البيانات"
                                onClick={() => handleEditRequest(req)}
                            >
                                <i className="fa-solid fa-pen-to-square"></i>
                            </Button>
                            <Button 
                                variant="light" 
                                size="sm" 
                                className="text-danger border"
                                title="حذف الطلب"
                                onClick={() => handleDeleteRequest(req.id)}
                            >
                                <i className="fa-solid fa-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!loading && getFilteredData('pending').length === 0 && (
                        <tr><td colSpan="8" className="text-center py-4 text-muted">لا توجد طلبات معلقة حالياً</td></tr>
                    )}
                  </tbody>
                </Table>
              </Tab.Pane>

              <Tab.Pane eventKey="decided">
                <Table hover responsive className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>رقم الطلب</th>
                      <th>النوع</th>
                      <th>اسم المواطن / المالك</th>
                      <th>موضوع الطلب</th>
                      <th>تاريخ القرار</th>
                      <th>القرار النهائي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? <tr><td colSpan="7" className="text-center py-5"><Spinner animation="border" /></td></tr> : getFilteredData('decided').map((req) => (
                      <tr key={req.id}>
                        <td className="fw-bold text-muted">{req.refNo}</td>
                        <td>{getTypeBadge(req.type)}</td>
                        <td>{req.citizen}</td>
                        <td className="text-muted">{req.subject}</td>
                        <td className="small">{req.date}</td>
                        <td>{getStatusBadge(req.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab.Pane>

              <Tab.Pane eventKey="properties">
                <Table hover responsive className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>رقم المرجع</th>
                      <th>اسم المالك</th>
                      <th>العنوان / الموقع</th>
                      <th>النوع</th>
                      <th>المساحة (م²)</th>
                      <th className="text-end pe-4">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? <tr><td colSpan="6" className="text-center py-5"><Spinner animation="border" /></td></tr> : getFilteredData('properties').map((prop) => (
                      <tr key={prop.id}>
                        <td className="fw-bold text-primary">{prop.refNo || prop.id}</td>
                        <td className="fw-medium">{prop.ownerName}</td>
                        <td className="text-muted">{prop.address || `${prop.buildingNo} - ${prop.streetId}`}</td>
                        <td><Badge bg="dark">{prop.unitType || 'عقار'}</Badge></td>
                        <td>{prop.area || (prop.units ? prop.units.reduce((sum, unit) => sum + Number(unit.area || 0), 0) : '-') || '-'}</td>
                        <td className="text-end pe-4">
                          <div className="d-flex justify-content-end gap-1">
                            <Button 
                                variant="light" 
                                size="sm" 
                                className="text-primary border"
                                title="تعديل البيانات"
                                onClick={() => handleEditProperty(prop.id)}
                            >
                                <i className="fa-solid fa-pen-to-square"></i>
                            </Button>
                            <Button 
                                variant="light" 
                                size="sm" 
                                className="text-danger border"
                                title="حذف العقار"
                                onClick={() => handleDeleteProperty(prop.id)}
                            >
                                <i className="fa-solid fa-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!loading && getFilteredData('properties').length === 0 && (
                        <tr><td colSpan="6" className="text-center py-4 text-muted">لا توجد عقارات مسجلة</td></tr>
                    )}
                  </tbody>
                </Table>
              </Tab.Pane>

            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DataEntryHome;