import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Table, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getEmployees, getSystemLogs } from '../../services/adminService';

const AdminHome = () => {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [logs, setLogs] = useState([]); // لتخزين آخر السجلات
  const [employees, setEmployees] = useState([]); // قائمة الموظفين للربط الذكي

  useEffect(() => {
    const loadData = async () => {
      try {
        // جلب المستخدمين من ال API
        const users = await getEmployees();
        setUserCount(users.length);
        setEmployees(users);

        // جلب أحدث السجلات
        const systemLogs = await getSystemLogs();
        setLogs(systemLogs);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };
    loadData();
  }, []);

  // اعرض أحدث 5 سجلات مرتبة من الأحدث للأقدم
  const recentLogs = (logs || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  // مساعد لترجمة أسماء المستخدمين إلى عرض عربي صريح وثابت لمدير النظام
  const translateUser = (log) => {
    if (!log) return '-';

    const action = (log.action || '').toString().toUpperCase();
    if (action === 'UPDATE' || action === 'DELETE') {
      return 'مدير النظام';
    }

    const detailsStr = log.details || '';
    const nameMatch = /FullName:\s*([^,|\|]+)/i.exec(detailsStr) || /Name:\s*([^,|\|]+)/i.exec(detailsStr) || /Username:\s*([^,|\|]+)/i.exec(detailsStr);
    if (nameMatch && nameMatch[1]) return nameMatch[1].trim();

    if (log.user === 'System') return 'النظام';

    return log.user || 'مدير النظام';
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

  // مساعد لتنسيق حقل التفاصيل بطريقة احترافية ومنظمة بدون Tags ظاهرية وببيانات كاملة
  const formatDetails = (log) => {
    if (!log || !log.details) return <span className="text-muted">لا توجد تفاصيل</span>;

    const action = (log.action || '').toString().toUpperCase();
    const detailsStr = log.details;

    // دالة داخلية مرنة لاستخراج القيم من النص مباشرة دون الاعتماد الكامل على split الـ New والأجزاء السابقة
    const extractField = (text, field) => {
      const re = new RegExp(field + '\\s*:\\s*([^,|\\|\\n]+)', 'i');
      const m = re.exec(text);
      return m ? m[1].trim() : null;
    };

    // محاولة استخراج البيانات الأساسية مباشرة من النص
    let full = extractField(detailsStr, 'FullName') || extractField(detailsStr, 'Name');
    let code = extractField(detailsStr, 'EmployeeCode');
    let nationalId = extractField(detailsStr, 'NationalId') || extractField(detailsStr, 'NationalID');
    const keyVal = extractField(detailsStr, 'Key') || extractField(detailsStr, 'Id');

    // إذا لم تكن البيانات واضحة في النص (مثل سجلات التعديل والحذف المعتمدة على المفتاح فقط)، نقوم بالربط مع قائمة الموظفين
    if (!full && !code && !nationalId && keyVal) {
      const empData = employees.find(e => e.id?.toString() === keyVal?.toString());
      if (empData) {
        full = empData.fullName || empData.name || '-';
        code = empData.employeeCode || '-';
        nationalId = empData.nationalId || '-';
      }
    }

    // قالب عرض الهوية الاحترافي الموحد (الاسم -> الرقم القومي -> الكود)
    const renderEmployeeIdentity = () => {
      return (
        <>
          <strong className="text-dark">{full || 'موضح بالتفاصيل'}</strong>
          {nationalId ? <span> | الرقم القومي: <strong>{nationalId}</strong></span> : null}
          {code ? <span> | كود: <strong>{code}</strong></span> : null}
        </>
      );
    };

    // 1. حالة إضافة حساب (CREATE / INSERT)
    if (action === 'CREATE' || action === 'INSERT') {
      return (
        <div>
          تم إنشاء حساب جديد للموظف: {renderEmployeeIdentity()}
        </div>
      );
    }

    // 2. حالة تعديل حساب (UPDATE)
    if (action === 'UPDATE') {
      let statusChanges = null;
      const isActNew = extractField(detailsStr, 'IsActive');
      
      if (isActNew !== null) {
        // إذا كانت تفاصيل التعديل تشير لتغيير الحالة
        const statusNew = (isActNew.toLowerCase() === 'true' || isActNew === '1') ? 'نشط' : 'معلق';
        const statusOld = statusNew === 'نشط' ? 'معلق' : 'نشط'; // عكس الحالة الحالية كافتراض منطقي سريع للتدقيق
        statusChanges = <span className="ms-1 text-primary fw-bold"> (من {statusOld} إلى {statusNew})</span>;
      }

      return (
        <div>
          تعديل حالة حساب الموظف: {renderEmployeeIdentity()}
          {statusChanges}
        </div>
      );
    }

    // 3. حالة حذف حساب (DELETE)
    if (action === 'DELETE') {
      return (
        <div>
          تم حذف حساب الموظف: {renderEmployeeIdentity()}
        </div>
      );
    }

    // العرض الافتراضي النظيف في حال وجود أحداث عامة أخرى غير منسقة مسبقاً
    const cleanParts = detailsStr.split(' | ').map((p) => {
      return p
        .replace(/^New:\s*/i, '')
        .replace(/^Old:\s*/i, 'البيانات السابقة: ')
        .replace(/FullName:/gi, 'الاسم: ')
        .replace(/EmployeeCode:/gi, 'كود الموظف: ')
        .replace(/NationalId:/gi, 'الرقم القومي: ')
        .replace(/NationalID:/gi, 'الرقم القومي: ')
        .replace(/Key:/gi, 'رقم المنظومة: ')
        .replace(/\|/g, ' - ');
    });

    return (
      <div style={{ fontSize: '0.95rem' }}>
        {cleanParts.map((p, idx) => (
          <div key={idx} className="text-break">• {p}</div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
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
          {recentLogs.length > 0 ? (
            <div dir="rtl">
              <Table striped bordered hover responsive size="sm" className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '15%' }}>المستخدم</th>
                    <th style={{ width: '15%' }}>الإجراء</th>
                    <th style={{ width: '50%' }}>التفاصيل</th>
                    <th style={{ width: '20%' }}>الوقت والتاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log) => {
                    const userLabel = translateUser(log);
                    const badge = actionBadge(log.action);

                    const logDate = new Date(log.date);
                    const formattedDate = logDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
                    const formattedTime = logDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                    return (
                      <tr key={log.id} style={{ borderBottom: '2px solid #eef2f5' }}>
                        <td><strong className="text-secondary">{userLabel}</strong></td>
                        <td>
                          <Badge bg={badge.variant} className="fw-normal">{badge.text}</Badge>
                        </td>
                        <td style={{ fontSize: '0.95rem' }}>{formatDetails(log)}</td>
                        <td>
                          <div className="d-flex flex-column" style={{ fontSize: '0.85rem' }}>
                            <span className="fw-bold text-dark mb-1">
                              <i className="fa-regular fa-calendar-days ms-1 text-muted"></i> {formattedDate}
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                              <i className="fa-regular fa-clock ms-1"></i> {formattedTime}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-4 text-muted">لا توجد عمليات مسجلة حالياً.</div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminHome;