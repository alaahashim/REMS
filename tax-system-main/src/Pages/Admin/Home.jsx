import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Row, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getSystemLogs } from '../../services/adminService';
import { useDataContext } from '../../context/DataContext';
import { formatAuditMessage, getAuditBadge } from '../../utils/auditLogFormatter';

const formatDate = (value) => {
  if (!value) return { date: '-', time: '-' };
  const date = new Date(value);

  return {
    date: date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    time: date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
};

const AdminHome = () => {
  const navigate = useNavigate();
  const { employees, refreshEmployees } = useDataContext();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await refreshEmployees();
        setLogs(await getSystemLogs());
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadData();
  }, [refreshEmployees]);

  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="p-3 p-md-4" dir="rtl">
      <Row className="mb-4 g-3">
        <Col md={6}>
          <Card className="border-0 shadow-sm border-start border-4 border-primary">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">إجمالي المستخدمين</h6>
                <h3 className="fw-bold mb-0 text-primary">{employees.length}</h3>
              </div>
              <i className="fa-solid fa-users text-primary opacity-25 fs-1" />
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm border-start border-4 border-success">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">حالة النظام</h6>
                <h3 className="fw-bold mb-0 text-success">ممتازة</h3>
              </div>
              <i className="fa-solid fa-server text-success opacity-25 fs-1" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center">
          <span>أحدث العمليات المسجلة</span>
          <Button variant="outline-dark" size="sm" onClick={() => navigate('/admin/logs')}>
            عرض السجل الكامل
          </Button>
        </Card.Header>

        <Card.Body>
          {recentLogs.length > 0 ? (
            <Table striped bordered hover responsive size="sm" className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>المستخدم</th>
                  <th>الإجراء</th>
                  <th>التفاصيل</th>
                  <th>الوقت والتاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => {
                  const badge = getAuditBadge(log.action);
                  const logDate = formatDate(log.date);

                  return (
                    <tr key={log.id}>
                      <td className="fw-semibold">{log.actorName || log.user || 'Admin'}</td>
                      <td>
                        <Badge bg={badge.variant} className={`fw-normal ${badge.textClass || ''}`}>
                          {badge.text}
                        </Badge>
                      </td>
                      <td className="text-dark" style={{ wordBreak: 'break-word' }}>
                        {formatAuditMessage(log)}
                      </td>
                      <td>
                        <div className="d-flex flex-column small">
                          <strong>{logDate.date}</strong>
                          <span className="text-muted">{logDate.time}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <div className="text-center p-4 text-muted">لا توجد عمليات مسجلة حاليا.</div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminHome;
