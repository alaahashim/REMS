import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Container,
  Table,
  Spinner,
  Badge,
  Button,
  Pagination,
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import { useDataContext } from '../../context/DataContext';

// ─── خريطة تصفية الإجراءات ───────────────────────────────────────────────────
const ACTION_MAP_FILTER = {
  'إضافة': ['CREATE', 'INSERT'],
  'تعديل': ['UPDATE'],
  'حذف':   ['DELETE'],
};

const ROWS_PER_PAGE = 8;

// ─── مساعدات خارج المكوّن (لا تعتمد على state) ───────────────────────────────
const extractField = (text, field) => {
  const match = new RegExp(`${field}\\s*:\\s*([^,|\\n]+)`, 'i').exec(text || '');
  return match ? match[1].trim() : null;
};

const mapStatus = (value) => {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  if (/^(true|1)$/i.test(normalized))  return 'نشط';
  if (/^(false|0)$/i.test(normalized)) return 'معلق';
  return normalized;
};

const actionBadge = (raw) => {
  const action = (raw || '').toString().toUpperCase();
  if (action === 'CREATE' || action === 'INSERT')
    return { text: 'إضافة',         variant: 'success'  };
  if (action === 'UPDATE')
    return { text: 'تعديل',         variant: 'warning',  textClass: 'text-dark' };
  if (action === 'DELETE')
    return { text: 'حذف',           variant: 'danger'   };
  if (action === 'LOGIN')
    return { text: 'تسجيل دخول',   variant: 'primary'  };
  return   { text: action || 'نشاط', variant: 'secondary' };
};

const entityLabel = (entity) => {
  const map = {
    Employees: 'الموظفين',
    Employee:  'الموظف',
    Users:     'المستخدمين',
  };
  return map[entity] || entity || '-';
};

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────
const AuditLogs = () => {
  const { auditLogs, employees, refreshAuditLogs, refreshEmployees } = useDataContext();
  const logs = auditLogs ?? [];

  const [loading,       setLoading]       = useState(true);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [typedPage,     setTypedPage]     = useState(1);
  const [searchName,    setSearchName]    = useState('');
  const [actionFilter,  setActionFilter]  = useState('كل الإجراءات');
  const [dateFrom,      setDateFrom]      = useState('');
  const [dateTo,        setDateTo]        = useState('');

  // ─── تحميل البيانات ───────────────────────────────────────────────────────
  const loadLogs = async () => {
    setLoading(true);
    try {
      await Promise.all([
        refreshAuditLogs?.() ?? Promise.resolve(),
        refreshEmployees?.() ?? Promise.resolve(),
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

  // إعادة ضبط الصفحة عند تغيّر أي فلتر
  useEffect(() => {
    setCurrentPage(1);
    setTypedPage(1);
  }, [searchName, actionFilter, dateFrom, dateTo]);

  // مزامنة حقل الإدخال مع الصفحة الحالية
  useEffect(() => {
    setTypedPage(currentPage);
  }, [currentPage]);

  // ─── مساعدات تعتمد على بيانات المكوّن ───────────────────────────────────
  const translateUser = (log) => {
    if (!log) return '-';
    const action = (log.action || '').toString().toUpperCase();
    const entity = (log.entity || '').toString();

    if (
      (entity === 'Employees' || entity === 'Employee') &&
      (action === 'CREATE' || action === 'INSERT' || action === 'UPDATE')
    ) return 'مدير النظام';

    if (/^Employee #/i.test(log.user)) return 'مدير النظام';
    if (log.user === 'System')         return 'النظام';
    return log.user || 'مدير النظام';
  };

  /**
   * يبحث عن بيانات الموظف أولاً في القائمة الحية،
   * ثم يعود إلى تفاصيل السجلات التاريخية (للموظفين المحذوفين).
   */
  const findEmployeeDataGlobally = (targetId) => {
    if (!targetId) return { name: null, nationalId: null, empCode: null };

    if (employees?.length) {
      const emp = employees.find((e) => e.id?.toString() === targetId.toString());
      if (emp) {
        return {
          name:       emp.fullName || emp.name || null,
          nationalId: emp.nationalId                 || null,
          empCode:    emp.employeeCode               || null,
        };
      }
    }

    for (const log of logs) {
      const d      = log.details || '';
      const keyVal = extractField(d, 'Key') || extractField(d, 'Id');
      if (keyVal?.toString() !== targetId.toString()) continue;

      const name       = extractField(d, 'FullName') || extractField(d, 'Name');
      const nationalId = extractField(d, 'NationalId') || extractField(d, 'NationalID');
      const empCode    = extractField(d, 'EmployeeCode');

      if (name || nationalId || empCode) return { name, nationalId, empCode };
    }

    return { name: null, nationalId: null, empCode: null };
  };

  const formatDetails = (log) => {
    if (!log?.details)
      return <span className="text-muted">لا توجد تفاصيل</span>;

    const action     = (log.action || '').toString().toUpperCase();
    const detailsStr = log.details;

    let name       = extractField(detailsStr, 'FullName') || extractField(detailsStr, 'Name');
    let nationalId = extractField(detailsStr, 'NationalId') || extractField(detailsStr, 'NationalID');
    let empCode    = extractField(detailsStr, 'EmployeeCode');
    const keyVal   = extractField(detailsStr, 'Key') || extractField(detailsStr, 'Id');

    // تكملة الخانات الفارغة من المصادر الأخرى
    if ((!name || !nationalId || !empCode) && keyVal) {
      const global = findEmployeeDataGlobally(keyVal);
      if (!name)       name       = global.name;
      if (!nationalId) nationalId = global.nationalId;
      if (!empCode)    empCode    = global.empCode;
    }

    const EmployeeIdentity = () => (
      <>
        <strong className="text-dark">{name || 'غير معروف'}</strong>
        {nationalId && <> - الرقم القومي: <strong>{nationalId}</strong></>}
        {empCode    && ` (كود: ${empCode})`}
      </>
    );

    if (action === 'CREATE' || action === 'INSERT') {
      return <div>تم إنشاء حساب جديد للموظف: <EmployeeIdentity /></div>;
    }

    if (action === 'UPDATE') {
      const parts     = detailsStr.split(' | ').map((p) => p.trim());
      const oldPart   = parts.find((p) => /^Old:/i.test(p));
      const newPart   = parts.find((p) => /^New:/i.test(p));
      const oldStatus = oldPart ? extractField(oldPart, 'isActive') || extractField(oldPart, 'Status') : null;
      const newStatus = newPart ? extractField(newPart, 'isActive') || extractField(newPart, 'Status') : null;

      if (oldStatus || newStatus) {
        return (
          <div>
            تعديل حالة حساب الموظف: <EmployeeIdentity />
            {oldStatus && newStatus && (
              <span>
                {' '}(من{' '}
                <Badge bg="secondary" className="mx-1">{mapStatus(oldStatus)}</Badge>
                إلى{' '}
                <Badge bg="success"   className="mx-1">{mapStatus(newStatus)}</Badge>)
              </span>
            )}
          </div>
        );
      }

      return <div>تم تعديل بيانات الموظف: <EmployeeIdentity /></div>;
    }

    if (action === 'DELETE') {
      return <div>تم حذف حساب الموظف: <EmployeeIdentity /></div>;
    }

    return <div className="text-break">{detailsStr}</div>;
  };

  // ─── الفلترة والترتيب ────────────────────────────────────────────────────
  const filteredLogs = useMemo(() => {
    const query = searchName.trim().toLowerCase();

    return logs.filter((log) => {
      const userLabel     = translateUser(log).toLowerCase();
      const searchableText = `${userLabel} ${(log.details || '').toLowerCase()}`;

      if (query && !searchableText.includes(query)) return false;

      if (actionFilter !== 'كل الإجراءات') {
        const allowed = ACTION_MAP_FILTER[actionFilter] ?? [];
        if (!allowed.includes((log.action || '').toString().toUpperCase())) return false;
      }

      const logDate = new Date(log.date);
      if (dateFrom) {
        if (logDate < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (logDate > end) return false;
      }

      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs, searchName, actionFilter, dateFrom, dateTo]);

  const sortedLogs = useMemo(
    () => [...filteredLogs].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [filteredLogs],
  );

  // ─── ترقيم الصفحات ───────────────────────────────────────────────────────
  const totalPages   = Math.max(1, Math.ceil(sortedLogs.length / ROWS_PER_PAGE));
  const indexOfLast  = currentPage * ROWS_PER_PAGE;
  const currentRows  = sortedLogs.slice(indexOfLast - ROWS_PER_PAGE, indexOfLast);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleTypedPageSubmit = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const pageNum = parseInt(typedPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    } else {
      setTypedPage(currentPage);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="d-flex justify-content-center mt-3">
        <Pagination>
          <Pagination.Prev
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
              onKeyDown={handleTypedPageSubmit}
              className="form-control form-control-sm"
              style={{
                width: '45px',
                textAlign: 'center',
                height: '28px',
                margin: '0 5px',
                padding: '4px',
                direction: 'ltr',
              }}
            />
            <label className="mb-0" style={{ whiteSpace: 'nowrap' }}>من {totalPages}</label>
          </span>

          <Pagination.Next
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Container className="p-4">
      {/* ترويسة الصفحة */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold">سجل نظام التدقيق</h3>
        <Button variant="outline-secondary" size="sm" onClick={loadLogs}>
          <i className="fa-solid fa-rotate-right" /> تحديث
        </Button>
      </div>

      {/* شريط الفلاتر */}
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

      {/* جدول السجلات */}
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
                  const badge = actionBadge(log.action);
                  return (
                    <tr key={log.id} style={{ borderBottom: '2px solid #eef2f5' }}>
                      <td className="fw-bold text-muted">#{log.id}</td>

                      <td>
                        {log.date && (
                          <div className="d-flex flex-column gap-1" style={{ fontSize: '0.88rem' }}>
                            <div className="d-flex align-items-center text-nowrap">
                              <i
                                className="fa-regular fa-calendar-days text-muted"
                                style={{ marginLeft: '6px' }}
                              />
                              <strong>
                                {new Date(log.date).toLocaleDateString('ar-EG', {
                                  day: 'numeric', month: 'long', year: 'numeric',
                                })}
                              </strong>
                            </div>
                            <div className="d-flex align-items-center text-muted text-nowrap">
                              <i className="fa-regular fa-clock" style={{ marginLeft: '6px' }} />
                              <span>
                                {new Date(log.date).toLocaleTimeString('ar-EG', {
                                  hour: 'numeric', minute: '2-digit', hour12: true,
                                })}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      <td><strong>{translateUser(log)}</strong></td>

                      <td>
                        <Badge
                          bg={badge.variant}
                          className={`fw-normal ${badge.textClass || ''}`}
                        >
                          {badge.text}
                        </Badge>
                      </td>

                      <td>{entityLabel(log.entity)}</td>

                      <td
                        className="text-dark text-break"
                        style={{ fontSize: '0.95rem', minWidth: '480px', maxWidth: '750px', whiteSpace: 'normal' }}
                      >
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