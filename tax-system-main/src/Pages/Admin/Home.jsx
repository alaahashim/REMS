// import React from 'react';
// import { Card, Container, Row, Col, Table, Button } from 'react-bootstrap';
// import { useNavigate } from 'react-router-dom';
// import { getSystemLogs } from '../../services/adminService';

// const AdminHome = () => {
//   const navigate = useNavigate();
//   const [userCount, setUserCount] = React.useState(0);
//   const [logsCount, setLogsCount] = React.useState(0);

//   React.useEffect(() => {
//     const loadData = async () => {
//       const logs = await getSystemLogs();
//       const users = JSON.parse(localStorage.getItem('tax_users')) || [];
//       setLogsCount(logs.length);
//       setUserCount(users.length);
//     };
//     loadData();
//   }, []);

//   return (
//     <div style={{padding:'20px'}}>
//       <Row className="mb-4">
//         <Col md={6}>
//           <Card className="border-0 shadow-sm border-start border-4 border-primary">
//             <Card.Body className="d-flex justify-content-between align-items-center">
//               <div>
//                 <h6 className="text-muted text-uppercase mb-1">إجمالي المستخدمين</h6>
//                 <h3 className="fw-bold mb-0 text-primary">{userCount}</h3>
//               </div>
//               <div className="text-primary opacity-25 fs-1"><i className="fa-solid fa-users"></i></div>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={6}>
//           <Card className="border-0 shadow-sm border-start border-4 border-dark">
//             <Card.Body className="d-flex justify-content-between align-items-center">
//               <div>
//                 <h6 className="text-muted text-uppercase mb-1">حالة النظام (Health)</h6>
//                 <h3 className="fw-bold mb-0 text-success">ممتازة</h3>
//               </div>
//               <div className="text-success opacity-25 fs-1"><i className="fa-solid fa-server"></i></div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       <Card className="shadow-sm border-0">
//         <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center">
//           <span>أحدث العمليات المسجلة (System Logs)</span>
//           <Button variant="outline-dark" size="sm" onClick={() => navigate('/admin/logs')}>
//             عرض السجل الكامل
//           </Button>
//         </Card.Header>
//         <Card.Body>
//             <div className="alert alert-info">
//                 <i className="fa-solid fa-info-circle"></i> تستطيع إدارة المستخدمين ومراقبة العمليات من القائمة الجانبية.
//             </div>
//         </Card.Body>
//       </Card>
//     </div>
//   );
// };

// export default AdminHome;
import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Table, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getSystemLogs } from '../../services/adminService';

const AdminHome = () => {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [logs, setLogs] = useState([]); // لتخزين آخر السجلات

  useEffect(() => {
    const loadData = async () => {
      // جلب المستخدمين
      const users = JSON.parse(localStorage.getItem('tax_users')) || [];
      setUserCount(users.length);

      // جلب أحدث السجلات
      const systemLogs = await getSystemLogs();
      setLogs(systemLogs);
    };
    loadData();
  }, []);

  return (
    <div style={{padding:'20px'}}>
      <Row className="mb-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm border-start border-4 border-primary">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase mb-1">إجمالي المستخدمين</h6>
                <h3 className="fw-bold mb-0 text-primary">{userCount}</h3>
              </div>
              <div className="text-primary opacity-25 fs-1"><i className="fa-solid fa-users"></i></div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm border-start border-4 border-dark">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase mb-1">حالة النظام (Health)</h6>
                <h3 className="fw-bold mb-0 text-success">ممتازة</h3>
              </div>
              <div className="text-success opacity-25 fs-1"><i className="fa-solid fa-server"></i></div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center">
          <span>أحدث العمليات المسجلة (System Activity)</span>
          <Button variant="outline-dark" size="sm" onClick={() => navigate('/admin/logs')}>
            عرض السجل الكامل
          </Button>
        </Card.Header>
        <Card.Body>
            {/* جدول آخر العمليات بدلاً من الـ Alert */}
            {logs.length > 0 ? (
                <Table hover responsive size="sm" className="align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>المستخدم</th>
                            <th>الإجراء</th>
                            <th>التفاصيل</th>
                            <th>الوقت</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.slice(0, 5).map((log) => (
                            <tr key={log.id}>
                                <td><strong>{log.user}</strong></td>
                                <td>
                                    <Badge 
                                        bg={log.action === 'LOGIN' ? 'primary' : (log.action === 'APPROVE' ? 'success' : 'secondary')}
                                        className="fw-normal"
                                    >
                                        {log.action}
                                    </Badge>
                                </td>
                                <td style={{fontSize:'0.9rem'}}>{log.details}</td>
                                <td className="text-muted" style={{fontSize:'0.8rem'}}>
                                    {new Date(log.date).toLocaleTimeString('ar-EG')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <div className="text-center p-4 text-muted">لا توجد عمليات مسجلة حالياً.</div>
            )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminHome;