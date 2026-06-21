import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getSystemLogs } from '../../services/adminService';

const AdminHome = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const storedUsers = JSON.parse(localStorage.getItem('tax_users')) || [];
        const systemLogs = await getSystemLogs();

        setUsers(storedUsers);
        setLogs(systemLogs);
      } catch (error) {
        console.error('Error loading admin dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((user) => user.status !== 'Inactive').length;

    const roleCounts = users.reduce((acc, user) => {
      const role = user.role || 'Unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    return {
      totalUsers,
      activeUsers,
      roleCounts,
      recentLogs: logs.slice(0, 5)
    };
  }, [users, logs]);

  return (
    <div style={{ padding: '20px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">لوحة تحكم الأدمن</h3>
          <p className="text-muted mb-0">نظرة عامة على المستخدمين والأنشطة الإدارية</p>
        </div>
        <Button variant="outline-primary" onClick={() => navigate('/admin/users')}>
          إدارة المستخدمين
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <Row className="g-3 mb-4">
            <Col md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="text-muted mb-1">إجمالي الموظفين</div>
                  <h3 className="fw-bold mb-0">{stats.totalUsers}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="text-muted mb-1">المستخدمون النشطون</div>
                  <h3 className="fw-bold mb-0 text-success">{stats.activeUsers}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="text-muted mb-1">عدد الأدوار</div>
                  <h3 className="fw-bold mb-0">{Object.keys(stats.roleCounts).length}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="text-muted mb-1">آخر سجلات</div>
                  <h3 className="fw-bold mb-0">{stats.recentLogs.length}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-3 mb-4">
            <Col lg={8}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Header className="bg-white fw-bold">أحدث النشاطات</Card.Header>
                <Card.Body>
                  <Table responsive hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>التاريخ</th>
                        <th>الموظف</th>
                        <th>الإجراء</th>
                        <th>الجهة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentLogs.map((log) => (
                        <tr key={log.id}>
                          <td>{new Date(log.date).toLocaleString('ar-EG')}</td>
                          <td>{log.employeeName || log.user || '-'}</td>
                          <td>
                            <Badge bg={log.action === 'INSERT' ? 'success' : log.action === 'DELETE' ? 'danger' : 'warning'}>
                              {log.action}
                            </Badge>
                          </td>
                          <td>{log.entity || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Header className="bg-white fw-bold">توزيع الأدوار</Card.Header>
                <Card.Body>
                  <div className="d-grid gap-2">
                    {Object.entries(stats.roleCounts).map(([role, count]) => (
                      <div key={role} className="border rounded p-3 d-flex justify-content-between align-items-center">
                        <span className="fw-semibold">{role}</span>
                        <Badge bg="primary" pill>{count}</Badge>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default AdminHome;
