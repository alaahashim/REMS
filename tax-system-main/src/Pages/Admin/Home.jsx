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
import { getEmployees, getSystemLogs } from '../../services/adminService';

const AdminHome = () => {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [logs, setLogs] = useState([]); // لتخزين آخر السجلات

  useEffect(() => {
    const loadData = async () => {
      // جلب المستخدمين من ال API
      const users = await getEmployees();
      setUserCount(users.length);

      // جلب أحدث السجلات
      const systemLogs = await getSystemLogs();
      setLogs(systemLogs);
    };
    loadData();
  }, []);

  // اعرض أحدث 5 سجلات مرتبة من الأحدث للأقدم
  const recentLogs = (logs || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  // مساعد لترجمة أسماء المستخدمين إلى عرض عربي صريح
  const translateUser = (log) => {
    if (!log) return '-';

    // إذا كانت التفاصيل تحتوي على FullName أو Username
    const nameMatch = /FullName:\s*([^,|]+)/i.exec(log.details) || /Username:\s*([^,|]+)/i.exec(log.details);
    if (nameMatch && nameMatch[1]) return nameMatch[1].trim();

    // إذا كان المستخدم معرف كـ Employee #id
    const empMatch = /^Employee #(\d+)$/i.exec(log.user);
    if (empMatch) {
      // عرض اسم عربي افتراضي للمعرّفات العامة
      return 'المسؤول';
    }

    if (log.user === 'System') return 'النظام';

    // افتراضيًا أعرض القيمة كما هي
    return log.user || '-';
  };

  // مساعد لتحويل نوع الحدث إلى بادج عربي + لون
  const actionBadge = (action) => {
    const map = {
      CREATE: { text: 'إضافة حساب', variant: 'success' },
      UPDATE: { text: 'تعديل حساب', variant: 'warning' },
      DELETE: { text: 'حذف حساب', variant: 'danger' },
      LOGIN: { text: 'تسجيل دخول', variant: 'primary' },
      APPROVE: { text: 'إقرار', variant: 'success' },
    };
    return map[action] || { text: action || 'نشاط', variant: 'secondary' };
  };

  // مساعد لتنسيق حقل التفاصيل بطريقة عربية قابلة للقراءة
  const formatDetails = (log) => {
    if (!log || !log.details) return <span className="text-muted">لا توجد تفاصيل</span>;

    // أجزاء التفاصيل مفصولة بـ ' | '
    const parts = log.details.split(' | ').map((p) => p.trim());
    const keyPart = parts.find((p) => /^Key:/i.test(p));
    const newPart = parts.find((p) => /^New:/i.test(p));
    const oldPart = parts.find((p) => /^Old:/i.test(p));

    const extractField = (text, field) => {
      const re = new RegExp(field + '\\s*:\\s*([^,|]+)', 'i');
      const m = re.exec(text);
      return m ? m[1].trim() : null;
    };

    if (log.action === 'CREATE' && newPart) {
      const full = extractField(newPart, 'FullName') || extractField(newPart, 'FullName');
      const code = extractField(newPart, 'EmployeeCode') || extractField(newPart, 'EmployeeCode');
      if (full || code) {
        return (
          <div>
            تم إنشاء حساب جديد للموظف: <strong>{full || '-'}</strong>
            {code ? <span> <span className="text-muted">(كود: {code})</span></span> : null}
          </div>
        );
      }
    }

    if (log.action === 'UPDATE') {
      if (keyPart) {
        const keyVal = keyPart.split(':')[1]?.trim();
        return <div>تم تعديل حالة الحساب (الرقم المسلسل: <strong>{keyVal}</strong>)</div>;
      }
      // عرض ملخص للتغييرات إن وُجدت
      if (newPart || oldPart) {
        return (
          <div>
            <div>تم تعديل الحساب:</div>
            <ul className="mb-0" style={{paddingInlineStart: '18px'}}>
              {oldPart && <li>السابق: {oldPart.replace(/(Old:|New:|,)/gi, ' - ').replace(/FullName:/gi, 'الاسم:').replace(/EmployeeCode:/gi, 'كود الموظف:')}</li>}
              {newPart && <li>الحالي: {newPart.replace(/(Old:|New:|,)/gi, ' - ').replace(/FullName:/gi, 'الاسم:').replace(/EmployeeCode:/gi, 'كود الموظف:')}</li>}
            </ul>
          </div>
        );
      }
    }

    if (log.action === 'DELETE') {
      if (keyPart) {
        const keyVal = keyPart.split(':')[1]?.trim();
        return <div>تم حذف الحساب (الرقم المسلسل: <strong>{keyVal}</strong>)</div>;
      }
    }

    // افتراضي: عرض أجزاء مفصّلة مع استبدال الحقول التقنية بنص عربي
    return (
      <div style={{fontSize:'0.95rem'}}>
        {parts.map((p, idx) => (
          <div key={idx} className="text-break">
            • {p.replace(/FullName:/gi, 'الاسم:').replace(/EmployeeCode:/gi, 'كود الموظف:').replace(/Key:/gi, 'الرقم المسلسلي:').replace(/\|/g, ' - ')}
          </div>
        ))}
      </div>
    );
  };

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
            {recentLogs.length > 0 ? (
              <Table striped bordered hover responsive size="sm" className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>المستخدم</th>
                    <th>الإجراء</th>
                    <th>التفاصيل</th>
                    <th>الوقت</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log) => {
                    const userLabel = translateUser(log);
                    const badge = actionBadge(log.action);
                    return (
                    <tr key={log.id} style={{borderBottom: '2px solid #eef2f5'}}>
                      <td><strong>{userLabel}</strong></td>
                      <td>
                        <Badge bg={badge.variant} className="fw-normal">{badge.text}</Badge>
                      </td>
                      <td style={{fontSize:'0.95rem'}}>{formatDetails(log)}</td>
                      <td className="text-muted" style={{fontSize:'0.8rem'}}>
                        {new Date(log.date).toLocaleString('ar-EG')}
                      </td>
                    </tr>
                    );
                  })}
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