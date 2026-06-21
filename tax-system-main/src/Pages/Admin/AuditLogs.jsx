import React, { useState, useEffect } from 'react';
import { Card, Table, Spinner, Badge, Button } from 'react-bootstrap';
import { getSystemLogs } from '../../services/adminService';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSystemLogs().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const refreshLogs = () => {
    setLoading(true);
    getSystemLogs().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="fw-bold">سجل نظام التدقيق (Audit Logs)</h3>
        <Button variant="outline-secondary" size="sm" onClick={refreshLogs}>
          <i className="fa-solid fa-rotate-right"></i> تحديث
        </Button>
      </div>

      <Card style={{ background: 'white', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div className="text-center p-5"><Spinner animation="border" /></div>
        ) : logs.length === 0 ? (
          <div className="text-center p-5 text-muted">لا توجد سجلات حالياً.</div>
        ) : (
          <Table responsive hover className="align-middle">
            <thead className="table-light">
              <tr>
                <th>LogID</th>
                <th>التاريخ والوقت</th>
                <th>اسم الموظف</th>
                <th>نوع الإجراء</th>
                <th>الجدول المتأثر</th>
                <th>تفاصيل العملية</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="fw-bold text-muted">#{log.id}</td>
                  <td style={{ fontSize: '0.9rem' }}>{new Date(log.date).toLocaleString('ar-EG')}</td>
                  <td><strong>{log.employeeName || log.user || '-'}</strong></td>
                  <td>
                    <Badge
                      bg={log.action === 'INSERT' ? 'success' : log.action === 'DELETE' ? 'danger' : 'warning'}
                      className="fw-normal"
                    >
                      {log.action}
                    </Badge>
                  </td>
                  <td>{log.entity || log.table || '-'}</td>
                  <td style={{ fontSize: '0.85rem', maxWidth: '200px' }} className="text-muted">{log.details || log.changeDetails || '-'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default AuditLogs;
