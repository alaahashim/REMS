import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Table, Button, ProgressBar, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getProperties } from '../../services/propertyService';
import { getEmployeesPerformance } from '../../utils/performance'; 

const ManagerReports = () => {
  const navigate = useNavigate();
  
  // الخطأ كان هنا: كان ناقص تعريف stats
  const [employeesStats, setEmployeesStats] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCollected: 0,
    totalPending: 0,
    pendingApproval: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. جلب بيانات العقارات
        const props = await getProperties();
        
        let revenue = 0;
        let collected = 0;
        let pendingApprovalCount = 0; // التصحيح: تعريف المتغير
        
        props.forEach(p => {
          const tax = Number(p.tax) || 0;
          if (p.status === 'Approved') {
            revenue += tax;
          } else if (p.status === 'Paid') {
            collected += tax;
          }
          
          // التصحيح: استخدام الاسم الصحيح للمتغير
          if (p.status === 'Pending_Manager_Approval') pendingApprovalCount++;
        });

        // 2. تحديث الإحصائيات المالية
        setStats({
          totalRevenue: revenue + 500000, // إضافة رقم افتراضي للعرض
          totalCollected: collected,
          totalPending: (revenue + 500000) - collected,
          pendingApproval: pendingApprovalCount
        });

        // 3. جلب بيانات أداء الموظفين (من الدالة المساعدة)
        const empStats = getEmployeesPerformance();
        setEmployeesStats(empStats);
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading reports:", error);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const collectionPercentage = stats.totalRevenue > 0 
    ? Math.round((stats.totalCollected / stats.totalRevenue) * 100) 
    : 0;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/manager/home')}>
          <i className="fa-solid fa-arrow-right"></i> عودة للرئيسية
        </button>
      </div>

      <Container fluid>
        {/* 1. KPI Cards */}
        <h4 className="fw-bold mb-3 text-primary">نظرة عامة على الأداء المالي</h4>
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm text-center p-3 border-top border-5 border-primary">
              <i className="fa-solid fa-chart-line fa-2x text-primary mb-2"></i>
              <h6 className="text-muted text-uppercase">الإيرادات التقديرية</h6>
              <h3 className="fw-bold">{Math.round(stats.totalRevenue).toLocaleString()} ج.م</h3>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm text-center p-3 border-top border-5 border-success">
              <i className="fa-solid fa-wallet fa-2x text-success mb-2"></i>
              <h6 className="text-muted text-uppercase">إجمالي التحصيل</h6>
              <h3 className="fw-bold text-success">{Math.round(stats.totalCollected).toLocaleString()} ج.م</h3>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm text-center p-3 border-top border-5 border-warning">
              <i className="fa-solid fa-hourglass-half fa-2x text-warning mb-2"></i>
              <h6 className="text-muted text-uppercase">ديون متأخرة</h6>
              <h3 className="fw-bold text-warning">{Math.round(stats.totalPending).toLocaleString()} ج.م</h3>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm text-center p-3 border-top border-5 border-info">
              <i className="fa-solid fa-stamp fa-2x text-info mb-2"></i>
              <h6 className="text-muted text-uppercase">انتظار التوقيع</h6>
              <h3 className="fw-bold text-info">{stats.pendingApproval} ملف</h3>
            </Card>
          </Col>
        </Row>

        {/* 2. Analytics Section */}
        <Row className="mb-4">
          <Col md={6}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-white fw-bold">نسبة التحصيل (Collection Rate)</Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>تم تحصيله ({collectionPercentage}%)</span>
                  <span className="fw-bold text-primary">{Math.round(stats.totalCollected).toLocaleString()} ج.م</span>
                </div>
                <ProgressBar now={collectionPercentage} variant="primary" style={{ height: '25px' }} />
                <small className="text-muted mt-2 d-block">الهدف: 85% تحصيل سنوي</small>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-white fw-bold">توزيع الديون حسب النوع</Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>تجاري (Commercial)</span>
                    <span className="fw-bold text-danger">70%</span>
                  </div>
                  <ProgressBar now={70} variant="danger" style={{ height: '20px' }} />
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>سكني (Residential)</span>
                    <span className="fw-bold text-info">30%</span>
                  </div>
                  <ProgressBar now={30} variant="info" style={{ height: '20px' }} />
                </div>
                <div className="alert alert-light border mt-3 mb-0 p-2 text-center">
                  <small>ملاحظة: نسبة الديون التجارية في ارتفاع.</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* 3. Detailed Table */}
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white d-flex justify-content-between align-items-center">
            <span className="fw-bold">أداء الموظفين (Employee Performance)</span>
            <Button size="sm" variant="outline-primary">تصدير التقرير PDF</Button>
          </Card.Header>
          <Card.Body className="p-0">
            <Table hover responsive>
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>القسم</th>
                  <th>الموظف</th>
                  <th>عدد المهام المنجزة</th>
                  <th>الدقة (Accuracy)</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {employeesStats.map((emp, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{emp.role}</td>
                    <td>{emp.name}</td>
                    <td>{emp.tasksDone}</td>
                    <td>
                       <ProgressBar now={emp.score} label={`${emp.score}%`} variant={emp.score > 90 ? 'success' : 'warning'} style={{height:'15px'}} />
                    </td>
                    <td><Badge bg={emp.score > 90 ? 'success' : 'warning'}>{emp.score > 90 ? 'نشط جداً' : 'مقبول'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

      </Container>
    </div>
  );
};

export default ManagerReports;