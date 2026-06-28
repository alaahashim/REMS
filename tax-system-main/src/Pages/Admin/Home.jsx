import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getEmployees, getSystemLogs } from '../../services/adminService';
import { useLanguage } from '../../context/LanguageContext'; 
import { useDynamicTranslation } from '../../utils/useDynamicTranslation'; 

const DynText = ({ text, lang }) => {
  const translated = useDynamicTranslation(text || '', lang);
  return <>{translated || '-'}</>;
};

const extractField = (text, field) => {
  const match = new RegExp(`${field}\\s*:\\s*([^,|\\n]+)`, 'i').exec(text || '');
  return match ? match[1].trim() : null;
};

const ACTION_BADGE_MAP = {
  CREATE: { text: 'إضافة',    variant: 'success'  },
  INSERT: { text: 'إضافة',    variant: 'success'  },
  UPDATE: { text: 'تعديل',    variant: 'warning'  },
  DELETE: { text: 'حذف',      variant: 'danger'   },
  LOGIN:  { text: 'تسجيل دخول',variant: 'primary'  },
  APPROVE:{ text: 'قبول',      variant: 'success'  },
};

const actionBadge = (action) =>
  ACTION_BADGE_MAP[(action || '').toString().toUpperCase()] ??
  { text: action || 'نشاط', variant: 'secondary' };

const AdminHome = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage(); 

  const [userCount,  setUserCount]  = useState(0);
  const [logs,       setLogs]       = useState([]);
  const [employees,  setEmployees]  = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const users = await getEmployees();
        setUserCount(users.length);
        setEmployees(users);
        const systemLogs = await getSystemLogs();
        setLogs(systemLogs);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    loadData();
  }, []);

  const recentLogs = [...(logs ?? [])]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const translateUser = (log) => {
    if (!log) return '-';
    const action = (log.action || '').toString().toUpperCase();
    if (action === 'UPDATE' || action === 'DELETE') return 'مدير النظام';
    const detailsStr = log.details || '';
    const nameMatch =
      /FullName:\s*([^,|]+)/i.exec(detailsStr) ||
      /Name:\s*([^,|]+)/i.exec(detailsStr)     ||
      /Username:\s*([^,|]+)/i.exec(detailsStr);
    if (nameMatch?.[1]) return nameMatch[1].trim();
    if (log.user === 'System') return 'النظام';
    return log.user || 'مدير النظام';
  };

  const formatDetails = (log) => {
    if (!log?.details)
      return <span className="text-muted">لا توجد تفاصيل</span>;

    const action     = (log.action || '').toString().toUpperCase();
    const detailsStr = log.details;

    let name       = extractField(detailsStr, 'FullName') || extractField(detailsStr, 'Name');
    let empCode    = extractField(detailsStr, 'EmployeeCode');
    let nationalId = extractField(detailsStr, 'NationalId') || extractField(detailsStr, 'NationalID');
    const keyVal   = extractField(detailsStr, 'Key') || extractField(detailsStr, 'Id');

    if (!name && !empCode && !nationalId && keyVal) {
      const emp = employees.find((e) => e.id?.toString() === keyVal.toString());
      if (emp) {
        name       = emp.fullName || emp.name || null;
        empCode    = emp.employeeCode || null;
        nationalId = emp.nationalId || null;
      }
    }

    const EmployeeIdentity = () => (
      <>
        <strong className="text-dark"><DynText text={name || 'موضح بالتفاصيل'} lang={lang} /></strong>
        {nationalId && <><span> | </span><span>الرقم القومي:</span>{' '}<strong><DynText text={nationalId} lang={lang} /></strong></>}
        {empCode && <><span> | </span><span>كود:</span>{' '}<strong>{empCode}</strong></>}
      </>
    );

    if (action === 'CREATE' || action === 'INSERT') {
      return <div><span>تم إنشاء حساب جديد للموظف:</span> <EmployeeIdentity /></div>;
    }

    if (action === 'UPDATE') {
      const isActiveRaw = extractField(detailsStr, 'IsActive');
      let statusChange  = null;

      if (isActiveRaw !== null) {
        const isNowActive = /^(true|1)$/i.test(isActiveRaw.trim());
        const statusNew   = isNowActive ? 'نشط' : 'معلق';
        const statusOld   = isNowActive ? 'معلق' : 'نشط';
        statusChange = (
          <span className="ms-1 text-primary fw-bold">
            {' '}(<span>من</span>{' '}
            <Badge bg="secondary" className="mx-1">{statusOld}</Badge>
            {' '}<span>إلى</span>{' '}
            <Badge bg="success" className="mx-1">{statusNew}</Badge>)
          </span>
        );
      }

      return (
        <div>
          <span>تعديل حالة حساب الموظف:</span> <EmployeeIdentity />
          {statusChange}
        </div>
      );
    }

    if (action === 'DELETE') {
      return <div><span>تم حذف حساب الموظف:</span> <EmployeeIdentity /></div>;
    }

    const cleanParts = detailsStr.split(' | ').map((p) =>
      p
        .replace(/^New:\s*/i,        '')
        .replace(/^Old:\s*/i,        'البيانات السابقة: ')
        .replace(/FullName:/gi,      'الاسم: ')
        .replace(/EmployeeCode:/gi,  'كود الموظف: ')
        .replace(/NationalId:/gi,    'الرقم القومي: ')
        .replace(/NationalID:/gi,    'الرقم القومي: ')
        .replace(/Key:/gi,           'رقم المنظومة: ')
        .replace(/\|/g,              ' - ')
    );

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
              <div className="text-primary opacity-25 fs-1"><i className="fa-solid fa-users" /></div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm border-start border-4 border-dark">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase mb-1">حالة النظام</h6>
                <h3 className="fw-bold mb-0 text-success">ممتازة</h3>
              </div>
              <div className="text-success opacity-25 fs-1"><i className="fa-solid fa-server" /></div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center">
          <span>أحدث العمليات المسجلة</span>
          <Button variant="outline-dark" size="sm" onClick={() => navigate('/admin/logs')}>
            عرض الكل
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
                    const badge       = actionBadge(log.action);
                    const logDate     = new Date(log.date);
                    const formattedDate = logDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
                    const formattedTime = logDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                    return (
                      <tr key={log.id} style={{ borderBottom: '2px solid #eef2f5' }}>
                        <td><strong className="text-secondary"><DynText text={translateUser(log)} lang={lang} /></strong></td>
                        <td><Badge bg={badge.variant} className="fw-normal">{badge.text}</Badge></td>
                        <td style={{ fontSize: '0.95rem' }}>{formatDetails(log)}</td>
                        <td>
                          <div className="d-flex flex-column" style={{ fontSize: '0.85rem' }}>
                            <span className="fw-bold text-dark mb-1">
                              <i className="fa-regular fa-calendar-days ms-1 text-muted" /> {' '}{formattedDate}
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                              <i className="fa-regular fa-clock ms-1" /> {' '}{formattedTime}
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