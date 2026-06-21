import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Row, Col, Table, Badge, Button, Container, Form, Nav, Spinner, Tab } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { getProperties, deleteProperty } from '../../services/propertyService';
//import { getAppealsForHome, deleteAppeal } from '../../services/appealService';
import { getExemptionsForHome, deleteExemption } from '../../services/exemptionService';

const DataEntryHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [allRequests, setAllRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const props = await getProperties();
      setProperties(props);

      // const appeals = await getAppealsForHome();
      const exemptions = await getExemptionsForHome();

      const formattedRequests = [...exemptions];
      setAllRequests(formattedRequests);
    } catch (error) {
      console.error('فشل تحميل البيانات', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDeleteRequest = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        const target = allRequests.find((r) => r.id === id);
        if (!target) return;

        if (target.type === 'طعن') {
          // ميزة الطعون لسه مش متفعّلة بالكامل
          alert('حذف الطعون غير متاح حالياً');
          return;
        }

        if (target.type === 'إعفاء') {
          await deleteExemption(id);
        }

        setAllRequests((prev) => prev.filter((r) => r.id !== id));
        alert('تم حذف الطلب بنجاح');
      } catch (error) {
        console.error('Delete Error:', error);
        alert('فشل حذف الطلب');
      }
    }
  };

  // 🔧 الإصلاح الأساسي: كانت بتمسح من localStorage بدل ما تنادي الـ API الحقيقي
  // فالعقار كان بيرجع تاني أول ما تعمل refresh لإنه أصلاً مكنش بيتمسح من الداتابيز
  const handleDeleteProperty = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف بيانات هذا العقار؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        await deleteProperty(id);
        setProperties((prev) => prev.filter((p) => p.id !== id));
        alert('تم حذف العقار بنجاح');
      } catch (error) {
        console.error('Delete Property Error:', error);
        alert('فشل حذف العقار، حاول مرة أخرى');
      }
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
    const query = searchQuery.toLowerCase().trim();

    if (key === 'properties') {
      return properties.filter(
        (p) =>
          (p.refNo && p.refNo.toString().toLowerCase().includes(query)) ||
          (p.ownerName && p.ownerName.toLowerCase().includes(query)) ||
          (p.address && p.address.toLowerCase().includes(query))
      );
    }

    // 🔧 كانت 'NeedsMoreInfo' (يحتاج استيفاء) مش موجودة في أي تاب فكانت بتختفي تمامًا
    const statusFilter =
      key === 'pending'
        ? ['Pending', 'NeedsMoreInfo']
        : ['Approved', 'Rejected'];

    return allRequests.filter(
      (req) =>
        statusFilter.includes(req.status) &&
        (
          (req.ownerName && req.ownerName.toLowerCase().includes(query)) ||
          (req.nationalId && req.nationalId.toLowerCase().includes(query)) ||
          (req.type && req.type.toLowerCase().includes(query)) ||
          req.id?.toString().includes(query)
        )
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <Badge bg="warning text-dark">قيد المراجعة</Badge>;
      case 'Approved':
        return <Badge bg="success">مقبول</Badge>;
      case 'Rejected':
        return <Badge bg="danger">مرفوض</Badge>;
      case 'NeedsMoreInfo':
        return <Badge bg="info">يحتاج استيفاء</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    return type === 'طعن' ? (
      <Badge bg="primary" className="rounded-pill">
        <i className="fa-solid fa-gavel me-1"></i> طعن
      </Badge>
    ) : (
      <Badge bg="secondary" className="rounded-pill">
        <i className="fa-solid fa-shield-halved me-1"></i> إعفاء
      </Badge>
    );
  };

  // 🔧 المساحة كانت بتستخدم || اللي بيتجاهل القيمة 0 (لإن 0 falsy في JS)
  // فعقار مساحته 0 فعليًا (لسه مفيهوش وحدات) كان بيظهر "-" بدل الرقم الحقيقي
  const formatArea = (prop) => {
    if (typeof prop.area === 'number') return prop.area;
    if (Array.isArray(prop.units)) {
      return prop.units.reduce((sum, unit) => sum + Number(unit.area || 0), 0);
    }
    return '-';
  };

  return (
    <Container fluid className="mt-4">
      <Row className="mb-3 justify-content-end">
        <Col xs="auto">
          <div className="bg-light p-2 rounded border border-light d-flex align-items-center gap-2 px-3">
            <i className="fa-regular fa-calendar-days text-primary fs-5"></i>
            <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
              {getCurrentDate()}
            </span>
          </div>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={3}>
          <Link to="/data-entry/add" className="text-decoration-none">
            <Card className="h-100 shadow-sm border-0 border-top border-4 border-primary hover-lift">
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
                  <Nav.Link eventKey="pending" className="rounded-pill px-4">
                    الطلبات المعلقة (تحتاج متابعة)
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="decided" className="rounded-pill px-4">
                    القرارات الصادرة (الأرشيف)
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="properties" className="rounded-pill px-4">
                    <i className="fa-solid fa-building me-1"></i> العقارات المسجلة
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              <div className="d-flex gap-2" style={{ width: '300px' }}>
                <Form.Control
                  type="text"
                  placeholder="بحث (رقم / رقم قومي / اسم / نوع)..."
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
                      <th>كود / رقم الوحدة</th>
                      <th>اسم المالك</th>
                      <th>تاريخ الطلب</th>
                      <th>السند القانوني</th>
                      <th>الحالة</th>
                      <th className="text-end pe-4">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="text-center py-5">
                          <Spinner animation="border" />
                        </td>
                      </tr>
                    ) : getFilteredData('pending').length > 0 ? (
                      getFilteredData('pending').map((req) => (
                        <tr key={req.id}>
                          <td className="fw-bold text-primary">{req.id}</td>
                          <td>{getTypeBadge(req.type)}</td>
                          <td>{req.unitNumber || '-'}</td>
                          <td className="fw-medium">{req.ownerName || '-'}</td>
                          <td className="small">
                            {req.requestDate
                              ? new Date(req.requestDate).toLocaleDateString('ar-EG')
                              : '-'}
                          </td>
                          <td>{req.legalReference || '-'}</td>
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-4 text-muted">
                          لا توجد طلبات معلقة حالياً
                        </td>
                      </tr>
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
                      <th>الرقم القومي</th>
                      <th>اسم المالك</th>
                      <th>تاريخ الطلب</th>
                      <th>السند القانوني</th>
                      <th>الحالة النهائية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <Spinner animation="border" />
                        </td>
                      </tr>
                    ) : getFilteredData('decided').length > 0 ? (
                      getFilteredData('decided').map((req) => (
                        <tr key={req.id}>
                          <td className="fw-bold text-muted">{req.id}</td>
                          <td>{getTypeBadge(req.type)}</td>
                          <td>{req.nationalId || '-'}</td>
                          <td>{req.ownerName || '-'}</td>
                          <td className="small">
                            {req.requestDate
                              ? new Date(req.requestDate).toLocaleDateString('ar-EG')
                              : '-'}
                          </td>
                          <td>{req.legalReference || '-'}</td>
                          <td>{getStatusBadge(req.status)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-muted">
                          لا توجد قرارات صادرة حالياً
                        </td>
                      </tr>
                    )}
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
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <Spinner animation="border" />
                        </td>
                      </tr>
                    ) : getFilteredData('properties').length > 0 ? (
                      getFilteredData('properties').map((prop) => (
                        <tr key={prop.id}>
                          <td className="fw-bold text-primary">{prop.refNo || prop.id}</td>
                          <td className="fw-medium">{prop.ownerName || '-'}</td>
                          <td className="text-muted">
                            {`${prop.governorate} - ${prop.neighborhood}`}
                          </td>
                          <td>
                            <Badge bg="dark">{prop.unitType || 'عقار'}</Badge>
                          </td>
                          <td>{formatArea(prop)}</td>
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          لا توجد عقارات مسجلة
                        </td>
                      </tr>
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