import React, { useState, useEffect, useMemo } from 'react';
import { Card, Container, Table, Spinner, Badge, Button, Pagination, Form, Row, Col } from 'react-bootstrap';
import { useDataContext } from '../../context/DataContext';

const actionMapFilter = {
  'إضافة': ['CREATE', 'INSERT'],
  'تعديل': ['UPDATE'],
  'حذف': ['DELETE'],
};

const AuditLogs = () => {
  // جلب الموظفين والسجلات من الـ Context لضمان ربط البيانات بدقة واحترافية
  const { auditLogs, employees, refreshAuditLogs, refreshEmployees } = useDataContext();
  const logs = auditLogs;
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [typedPage, setTypedPage] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [actionFilter, setActionFilter] = useState('كل الإجراءات');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      // جلب السجلات والموظفين معاً لضمان الربط الفوري للأسماء والأرقام القومية
      await Promise.all([
        refreshAuditLogs ? refreshAuditLogs() : Promise.resolve(),
        refreshEmployees ? refreshEmployees() : Promise.resolve()
      ]);
    } catch (error) {
      console.error('Failed to load audit logs data', error);
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setTypedPage(1);
  }, [searchName, actionFilter, dateFrom, dateTo]);

  useEffect(() => {
    setTypedPage(currentPage);
  }, [currentPage]);

  const translateUser = (log) => {
    if (!log) return '-';
    const action = (log.action || '').toString().toUpperCase();
    const entity = (log.entity || '').toString();
    if ((entity === 'Employees' || entity === 'Employee') && (action === 'CREATE' || action === 'INSERT' || action === 'UPDATE')) {
      return 'مدير النظام';
    }
    if (/^Employee #/i.test(log.user)) return 'مدير النظام';
    if (log.user === 'System') return 'النظام';
    return log.user || 'مدير النظام';
  };

  const mapStatus = (value) => {
    if (value === null || value === undefined) return null;
    const normalized = String(value).trim();
    if (/^(true|1)$/i.test(normalized)) return 'نشط';
    if (/^(false|0)$/i.test(normalized)) return 'معلق';
    return normalized;
  };

  const actionBadge = (raw) => {
    const action = (raw || '').toString().toUpperCase();
    if (action === 'CREATE' || action === 'INSERT') return { text: 'إضافة', variant: 'success' };
    if (action === 'UPDATE') return { text: 'تعديل', variant: 'warning', textClass: 'text-dark' };
    if (action === 'DELETE') return { text: 'حذف', variant: 'danger' };
    if (action === 'LOGIN') return { text: 'تسجيل دخول', variant: 'primary' };
    return { text: action || 'نشاط', variant: 'secondary' };
  };

  const entityMap = (entity) => {
    if (!entity) return '-';
    const map = {
      Employees: 'الموظفين',
      Employee: 'الموظف',
      Users: 'المستخدمين',
    };
    return map[entity] || entity;
  };

  const extractField = (text, field) => {
    const match = new RegExp(field + '\\s*:\\s*([^,|\\|\\n]+)', 'i').exec(text || '');
    return match ? match[1].trim() : null;
  };

  // وظيفة البحث الشامل والذكي والمزدوج لجلب بيانات الموظف كاملة في كل صف مع كل أكشن
  const findEmployeeDataGlobally = (targetId) => {
    if (!targetId) return { name: null, nationalId: null, empCode: null };

    // أولاً: البحث في قائمة الموظفين الحية الحالية (الأدق والأحدث)
    if (employees && employees.length > 0) {
      const emp = employees.find(e => e.id?.toString() === targetId.toString());
      if (emp) {
        return {
          name: emp.fullName || emp.name || null,
          nationalId: emp.nationalId || null,
          empCode: emp.employeeCode || null
        };
      }
    }

    // ثانياً: إذا لم يُعثر عليه (محذوف مثلاً)، نبحث عكسياً في تفاصيل السجلات القديمة
    for (const log of logs) {
      const detailsStr = log.details || '';
      const keyVal = extractField(detailsStr, 'Key') || extractField(detailsStr, 'Id');

      if (keyVal?.toString() === targetId.toString()) {
        const name = extractField(detailsStr, 'FullName') || extractField(detailsStr, 'Name');
        const nationalId = extractField(detailsStr, 'NationalId') || extractField(detailsStr, 'NationalID');
        const empCode = extractField(detailsStr, 'EmployeeCode');

        if (name || nationalId || empCode) {
          return { name, nationalId, empCode };
        }
      }
    }
    return { name: null, nationalId: null, empCode: null };
  };

  const formatDetails = (log) => {
    if (!log || !log.details) return <span className="text-muted">لا توجد تفاصيل</span>;

    const action = (log.action || '').toString().toUpperCase();
    const detailsStr = log.details;

    // محاولة استخراج البيانات مباشرة من تفاصيل الصف الحالي أولاً
    let name = extractField(detailsStr, 'FullName') || extractField(detailsStr, 'Name');
    let nationalId = extractField(detailsStr, 'NationalId') || extractField(detailsStr, 'NationalID');
    let empCode = extractField(detailsStr, 'EmployeeCode');
    const keyVal = extractField(detailsStr, 'Key') || extractField(detailsStr, 'Id');

    // تفعيل البحث الذكي المزدوج لملء الخانات الفارغة لضمان ظهور البيانات كاملة مع كل الأكشنز
    if ((!name || !nationalId || !empCode) && keyVal) {
      const globalData = findEmployeeDataGlobally(keyVal);
      if (!name) name = globalData.name;
      if (!nationalId) nationalId = globalData.nationalId;
      if (!empCode) empCode = globalData.empCode;
    }

    // صياغة الهوية الثابتة والاحترافية والموحدة في كل الخلايا
    const renderEmployeeIdentity = () => {
      return (
        <>
          <strong className="text-dark">{name || 'غير معروف'}</strong>
          {nationalId ? <> - الرقم القومي: <strong>{nationalId}</strong></> : ''}
          {empCode ? ` (كود: ${empCode})` : ''}
        </>
      );
    };

    // 1. صياغة عملية الإضافة النظيفة
    if (action === 'CREATE' || action === 'INSERT') {
      return (
        <div>
          تم إنشاء حساب جديد للموظف: {renderEmployeeIdentity()}
        </div>
      );
    }

    // 2. صياغة عملية التعديل (البيانات كاملة + تفاصيل التغيير إن وجدت)
    if (action === 'UPDATE') {
      const parts = detailsStr.split(' | ').map((part) => part.trim());
      const oldPart = parts.find((part) => /^Old:/i.test(part));
      const newPart = parts.find((part) => /^New:/i.test(part));

      const oldStatus = oldPart ? extractField(oldPart, 'isActive') || extractField(oldPart, 'Status') : null;
      const newStatus = newPart ? extractField(newPart, 'isActive') || extractField(newPart, 'Status') : null;

      if (oldStatus || newStatus) {
        return (
          <div>
            تعديل حالة حساب الموظف: {renderEmployeeIdentity()}
            {oldStatus && newStatus ? (
              <span> (من <Badge bg="secondary" className="mx-1">{mapStatus(oldStatus)}</Badge> إلى <Badge bg="success" className="mx-1">{mapStatus(newStatus)}</Badge>)</span>
            ) : null}
          </div>
        );
      }

      return (
        <div>
          تم تعديل بيانات الموظف: {renderEmployeeIdentity()}
        </div>
      );
    }

    // 3. صياغة عملية الحذف كاملة الهوية
    if (action === 'DELETE') {
      return (
        <div>
          تم حذف حساب الموظف: {renderEmployeeIdentity()}
        </div>
      );
    }

    return <div className="text-break">{detailsStr}</div>;
  };

  const filteredLogs = useMemo(() => {
    const query = searchName.trim().toLowerCase();

    return logs.filter((log) => {
      const userLabel = translateUser(log).toLowerCase();
      const searchableText = `${userLabel} ${(log.details || '').toLowerCase()}`;

      if (query && !searchableText.includes(query)) {
        return false;
      }

      if (actionFilter !== 'كل الإجراءات') {
        const allowed = actionMapFilter[actionFilter] || [];
        if (!allowed.includes((log.action || '').toString().toUpperCase())) {
          return false;
        }
      }

      const logDate = new Date(log.date);
      if (dateFrom) {
        const start = new Date(dateFrom);
        if (logDate < start) return false;
      }
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (logDate > end) return false;
      }

      return true;
    });
  }, [logs, searchName, actionFilter, dateFrom, dateTo]);

  const sortedLogs = useMemo(
    () => [...filteredLogs].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [filteredLogs]
  );

  const indexOfLastRow = currentPage * 8;
  const indexOfFirstRow = indexOfLastRow - 8;
  const currentRows = sortedLogs.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / 8));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('left-ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i += 1) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('right-ellipsis');
      pages.push(totalPages);
    }

    return (
      <div className="d-flex justify-content-center mt-3">
        <Pagination>
          <Pagination.Prev
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            الصفحة السابقة
          </Pagination.Prev>

          <span className="d-flex align-items-center mx-3" style={{ gap: '8px' }}>
            <label className="mb-0" style={{ whiteSpace: 'nowrap' }}>صفحة</label>
            <input
              type="text"
              value={typedPage}
              onChange={(e) => setTypedPage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const pageNum = parseInt(typedPage, 10);
                  if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                    setCurrentPage(pageNum);
                  } else {
                    setTypedPage(currentPage);
                  }
                }
              }}
              className="form-control form-control-sm"
              style={{
                width: '45px',
                textAlign: 'center',
                height: '28px',
                margin: '0 5px',
                padding: '4px',
                direction: 'ltr'
              }}
            />
            <label className="mb-0" style={{ whiteSpace: 'nowrap' }}>من {totalPages}</label>
          </span>

          <Pagination.Next
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            الصفحة التالية
          </Pagination.Next>
        </Pagination>
      </div>
    );
  };

  const resetFilters = () => {
    setSearchName('');
    setActionFilter('كل الإجراءات');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  return (
    <Container className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold">سجل نظام التدقيق</h3>
        <Button variant="outline-secondary" size="sm" onClick={loadLogs}>
          <i className="fa-solid fa-rotate-right"></i> تحديث
        </Button>
      </div>

      <Card className="mb-3 p-3">
        <Row className="g-3 align-items-end">
          <Col md={4} sm={12}>
            <Form.Group>
              <Form.Label className="mb-1">بحث عن موظف</Form.Label>
              <Form.Control
                type="text"
                placeholder="ابحث بالاسم، الرقم القومي، أو كود الموظف..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={3} sm={12}>
            <Form.Group>
              <Form.Label className="mb-1">نوع الإجراء</Form.Label>
              <Form.Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                <option>كل الإجراءات</option>
                <option>إضافة</option>
                <option>تعديل</option>
                <option>حذف</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={2} sm={6}>
            <Form.Group>
              <Form.Label className="mb-1">من تاريخ</Form.Label>
              <Form.Control
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={2} sm={6}>
            <Form.Group>
              <Form.Label className="mb-1">إلى تاريخ</Form.Label>
              <Form.Control
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={1} sm={12} className="d-grid">
            <Button variant="outline-secondary" onClick={resetFilters}>
              مسح
            </Button>
          </Col>
        </Row>
      </Card>

      <Card style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" />
          </div>
        ) : sortedLogs.length === 0 ? (
          <div className="text-center p-5 text-muted">لا توجد سجلات مطابقة.</div>
        ) : (
          <div dir="rtl">
            <Table striped bordered hover responsive size="sm" className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>الرقم</th>
                  <th>التاريخ والوقت</th>
                  <th>المستخدم</th>
                  <th>الإجراء</th>
                  <th>الكيان</th>
                  <th>تفاصيل العملية</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((log) => {
                  const userLabel = translateUser(log);
                  const badge = actionBadge(log.action);
                  return (
                    <tr key={log.id} style={{ borderBottom: '2px solid #eef2f5' }}>
                      <td className="fw-bold text-muted">#{log.id}</td>
                      
                      <td>
                        {log.date && (
                          <div className="d-flex flex-column gap-1" style={{ fontSize: '0.88rem' }}>
                            <div className="d-flex align-items-center text-nowrap">
                              <i className="fa-regular fa-calendar-days text-muted" style={{ marginLeft: '6px' }}></i>
                              <strong>
                                {new Date(log.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </strong>
                            </div>
                            <div className="d-flex align-items-center text-muted text-nowrap">
                              <i className="fa-regular fa-clock" style={{ marginLeft: '6px' }}></i>
                              <span>
                                {new Date(log.date).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit', hour12: true })}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      <td><strong>{userLabel}</strong></td>
                      <td>
                        <Badge bg={badge.variant} className={`fw-normal ${badge.textClass || ''}`}>
                          {badge.text}
                        </Badge>
                      </td>
                      <td>{entityMap(log.entity)}</td>
                      <td style={{ fontSize: '0.95rem', minWidth: '480px', maxWidth: '750px', whiteSpace: 'normal' }} className="text-dark text-break">
                        {formatDetails(log)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            {renderPagination()}
          </div>
        )}
      </Card>
    </Container>
  );
};

export default AuditLogs;