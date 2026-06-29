import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Pagination,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import { useDataContext } from '../../context/DataContext';
import { formatAuditMessage, getAuditBadge } from '../../utils/auditLogFormatter';

const ROWS_PER_PAGE = 8;

const ACTION_FILTERS = {
  إضافة: ['CREATE', 'INSERT'],
  تعديل: ['UPDATE'],
  حذف: ['DELETE'],
};

const formatDate = (value) => {
  if (!value) return { date: '-', time: '-' };
  const date = new Date(value);

  return {
    date: date.toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('ar-EG', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  };
};

const entityLabel = (entity) => {
  const map = {
    Employees: 'الموظفون',
    Employee: 'الموظف',
    Users: 'المستخدمون',
  };

  return map[entity] || entity || '-';
};

const AuditLogs = () => {
  const { auditLogs, refreshAuditLogs } = useDataContext();
  const logs = auditLogs ?? [];

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [actionFilter, setActionFilter] = useState('كل الإجراءات');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      await refreshAuditLogs?.();
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
  }, [searchName, actionFilter, dateFrom, dateTo]);

  const filteredLogs = useMemo(() => {
    const query = searchName.trim().toLowerCase();

    return logs.filter((log) => {
      const message = formatAuditMessage(log);
      const searchableText = `${log.actorName || log.user || ''} ${message}`.toLowerCase();

      if (query && !searchableText.includes(query)) return false;

      if (actionFilter !== 'كل الإجراءات') {
        const allowed = ACTION_FILTERS[actionFilter] ?? [];
        if (!allowed.includes(String(log.action || '').toUpperCase())) return false;
      }

      const logDate = new Date(log.date);
      if (dateFrom && logDate < new Date(dateFrom)) return false;

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
    [filteredLogs],
  );

  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / ROWS_PER_PAGE));
  const currentRows = sortedLogs.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  );

  const resetFilters = () => {
    setSearchName('');
    setActionFilter('كل الإجراءات');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <Container className="p-3 p-md-4" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold mb-0">سجل نظام التدقيق</h3>
        <Button variant="outline-secondary" size="sm" onClick={loadLogs}>
          <i className="fa-solid fa-rotate-right ms-1" />
          تحديث
        </Button>
      </div>

      <Card className="mb-3 p-3 border-0 shadow-sm">
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

      <Card className="border-0 shadow-sm">
        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" />
          </div>
        ) : sortedLogs.length === 0 ? (
          <div className="text-center p-5 text-muted">لا توجد سجلات مطابقة.</div>
        ) : (
          <>
            <Table striped bordered hover responsive size="sm" className="align-middle mb-0">
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
                  const badge = getAuditBadge(log.action);
                  const logDate = formatDate(log.date);

                  return (
                    <tr key={log.id}>
                      <td className="fw-bold text-muted">#{log.id}</td>
                      <td>
                        <div className="d-flex flex-column gap-1 small">
                          <strong>{logDate.date}</strong>
                          <span className="text-muted">{logDate.time}</span>
                        </div>
                      </td>
                      <td className="fw-semibold">{log.actorName || log.user || 'Admin'}</td>
                      <td>
                        <Badge bg={badge.variant} className={`fw-normal ${badge.textClass || ''}`}>
                          {badge.text}
                        </Badge>
                      </td>
                      <td>{entityLabel(log.entity)}</td>
                      <td className="text-dark" style={{ minWidth: 420, wordBreak: 'break-word' }}>
                        {formatAuditMessage(log)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center py-3">
                <Pagination className="mb-0">
                  <Pagination.Prev
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    السابق
                  </Pagination.Prev>
                  <Pagination.Item active>{currentPage}</Pagination.Item>
                  <Pagination.Next
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    التالي
                  </Pagination.Next>
                </Pagination>
              </div>
            )}
          </>
        )}
      </Card>
    </Container>
  );
};

export default AuditLogs;
