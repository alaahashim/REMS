import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Spinner, Badge } from 'react-bootstrap';
//import { getEnrichedUnits } from '../../services/propertyService';
import { getUnits }
from '../../services/propertyService';
const ReviewerHome = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterKey, setFilterKey] = useState('pending'); // 'pending' (جديدة) or 'approved' (معتمدة)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const data = await getEnrichedUnits();
        const data = await getUnits();
    setTasks(data);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // فلترة البيانات (بدون بحث)
  const filteredTasks = tasks.filter(task => {
    let matchesFilter = false;
    if (filterKey === 'pending') matchesFilter = task.status === 'New'; // الوحدات الجديدة
    else if (filterKey === 'approved') matchesFilter = task.status === 'Approved'; // الوحدات المعتمدة
    else matchesFilter = true;
    return matchesFilter;
  });

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <h3 className="text-primary fw-bold">سجل مراجعة الوحدات (Unit Review)</h3>
          <p className="text-muted">حساب الضريبة على الوحدات المسجلة حديثاً</p>
        </Col>
      </Row>

      {/* القائمة */}
      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center border-bottom">
              <div>
                <span className="fw-bold">الوحدات <Badge bg="light" text="dark">{filteredTasks.length}</Badge></span>
              </div>
            </Card.Header>
            
            <div className="p-3 bg-light border-bottom">
              <Button 
                variant={filterKey === 'pending' ? 'primary' : 'outline-primary'} 
                className="me-2"
                onClick={() => setFilterKey('pending')}
              >
                بانتظار الحساب
              </Button>
              <Button 
                variant={filterKey === 'approved' ? 'success' : 'outline-success'} 
                onClick={() => setFilterKey('approved')}
              >
                معتمدة
              </Button>
            </div>

            <Card.Body className="p-0">
              {loading ? <div className="text-center p-5"><Spinner animation="border" /></div> : filteredTasks.length === 0 ? <div className="text-center py-5 text-muted">لا توجد وحدات</div> : (
                <Table hover responsive>
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>الوحدة (Unit)</th>
                      <th>العنوان (Property)</th>
                      <th>المالك</th>
                      <th>الاستخدام</th>
                      <th>الحالة</th>
                      <th className="text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task, index) => (
                      <tr key={task.id}>
                        <td>{index + 1}</td>
                        <td className="fw-bold text-primary">
                            {task.unitType} - دور {task.floor} <br/>
                            <small className="text-muted">{task.area} م²</small>
                        </td>
                        <td><small>{task.propertyAddress}</small></td>
                        <td>{task.ownerName}</td>
                        <td><Badge bg="light" text="dark" className="border">{task.usage}</Badge></td>
                        <td>
  <small className="text-muted">
    غير متاح حالياً
  </small>
</td>

<td>
  <span className="text-muted">
    غير مرتبط بعد
  </span>
</td>

<td>
  <Badge bg="light" text="dark" className="border">
    {task.usageType}
  </Badge>
</td>
{/*
////////////////////////////////////////////////////////////////////////
                          <small className="text-muted">{task.area} م²</small>
                        </td>
                        <td><small>{task.propertyAddress}</small></td>
                        <td>{task.ownerName}</td>
                        <td><Badge bg="light" text="dark" className="border">{task.usage}</Badge></td>*/}
                        <td>
                            {task.status === 'New' ? <Badge bg="warning">جديد</Badge> : 
                             <Badge bg="success">معتمد</Badge>}
                        </td>
                        <td className="text-center">
                            {task.status === 'New' ? (
                                <Button variant="primary" size="sm" onClick={() => navigate(`/reviewer/calc/${task.id}`)}>
                                    <i className="fa-solid fa-calculator"></i> حساب
                                </Button>
                            ) : (
                                <Button variant="outline-secondary" size="sm" disabled>تم</Button>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ReviewerHome;