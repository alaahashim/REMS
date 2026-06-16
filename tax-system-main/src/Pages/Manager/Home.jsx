import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Spinner, Badge } from 'react-bootstrap';
import { getProperties } from '../../services/propertyService';
import { getAssignments } from '../../services/assignmentService';

const ManagerHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingApproval: 0,
    totalRevenue: 0,
    paidCount: 0,
    pendingAppeals: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // نحضر البيانات المطلوبة للإحصائيات
        const [props, assignments] = await Promise.all([
          getProperties(),
          getAssignments()
        ]);

        // حساب الإحصائيات
        const pending = props.filter(p => p.status === 'Pending_Manager_Approval').length;
        const paid = props.filter(p => p.status === 'Paid');
        const revenue = paid.reduce((sum, p) => sum + (Number(p.tax) || 0), 0);
        
        // نحسب الطعون هنا بشكل مبسط (من LocalStorage مباشرة)
        const appeals = JSON.parse(localStorage.getItem('tax_appeals')) || [];
        const pendingAppeals = appeals.length;

        setStats({
          pendingApproval: pending,
          totalRevenue: revenue,
          paidCount: paid.length,
          pendingAppeals: pendingAppeals
        });
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <h3 className="text-warning fw-bold">مكتب المدير العام</h3>
          <p className="text-muted mb-0">نظرة عامة على أداء المنظمة (Dashboard)</p>
        </Col>
      </Row>

      {/* إحصائيات سريعة */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm border-start border-4 border-warning">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase mb-1">قرارات معلقة</h6>
                <h3 className="fw-bold mb-0">{stats.pendingApproval}</h3>
              </div>
              <div className="text-warning opacity-25 fs-1"><i className="fa-solid fa-file-signature"></i></div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm border-start border-4 border-success">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase mb-1">الإيرادات المحصلة</h6>
                <h3 className="fw-bold mb-0 text-success">{Math.round(stats.totalRevenue).toLocaleString()} ج.م</h3>
              </div>
              <div className="text-success opacity-25 fs-1"><i className="fa-solid fa-coins"></i></div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm border-start border-4 border-info">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase mb-1">قضايا الطعون</h6>
                <h3 className="fw-bold mb-0">{stats.pendingAppeals}</h3>
              </div>
              <div className="text-info opacity-25 fs-1"><i className="fa-solid fa-gavel"></i></div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm border-start border-4 border-dark">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase mb-1">العقارات المدفوعة</h6>
                <h3 className="fw-bold mb-0">{stats.paidCount}</h3>
              </div>
              <div className="text-dark opacity-25 fs-1"><i className="fa-solid fa-check-double"></i></div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* أزرار الوصول السريع */}
      <Row className="mb-4">
        <Col md={4}>
          <Button variant="outline-warning" className="w-100 py-3 fs-5 text-start" onClick={() => navigate('/manager/verdict')}>
            <i className="fa-solid fa-stamp me-2"></i> الاعتمادات والقرارات
          </Button>
        </Col>
        <Col md={4}>
          <Button variant="outline-dark" className="w-100 py-3 fs-5 text-start" onClick={() => navigate('/manager/reports')}>
            <i className="fa-solid fa-chart-pie me-2"></i> التقارير والإحصائيات
          </Button>
        </Col>
        {/* <Col md={4}>
          <Button variant="outline-info" className="w-100 py-3 fs-5 text-start" onClick={() => navigate('/committee/home')}>
            <i className="fa-solid fa-gavel me-2"></i> لجان الطعون
          </Button>
        </Col> */}
      </Row>

      {/* آخر النشاطات */}
      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white fw-bold">أحدث العمليات</Card.Header>
            <Card.Body>
                <div className="text-center text-muted py-5">
                    <i className="fa-solid fa-clock-rotate-left fa-2x mb-3"></i>
                    <p>استخدم القائمة العلوية للتنقل بين الصفحات المفصلة.</p>
                </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ManagerHome;