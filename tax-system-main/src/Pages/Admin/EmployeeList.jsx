import { useState, useEffect } from 'react';
import { Table, Button, Form, Badge, Card, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getEmployees, toggleEmployeeStatus } from '../../services/adminService';

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    // 1. تعريف الدالة جوه الـ useEffect مباشرة
    const fetchEmployees = async () => {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error("خطأ في جلب الموظفين", error);
      }
    };

    // 2. استدعاؤها فوراً في نفس المكان
    fetchEmployees();
  }, []); // المصفوفة فارغة تماماً ومستحيل تطلع إيرور هنا

  // دالة تغيير حالة الموظف
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleEmployeeStatus(id);
      
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => 
          emp.id === id ? { ...emp, isActive: !currentStatus } : emp
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("عذراً، تعذر تحديث حالة حساب الموظف في قاعدة البيانات.");
    }
  };

  return (
    <Container fluid className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-dark">👥 إدارة حسابات الموظفين</h4>
        <Button variant="dark" onClick={() => navigate('/admin/users')}>
          <i className="fa-solid fa-user-plus me-2"></i> إضافة موظف جديد
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Table hover responsive className="align-middle">
            <thead className="table-light">
              <tr>
                <th>كود الموظف</th>
                <th>الاسم بالكامل</th>
                <th>المسمى الوظيفي</th>
                <th>القسم</th>
                <th>اسم المستخدم</th>
                <th>حالة الحساب</th>
                <th>تغيير الحالة (Toggle)</th>
              </tr>
            </thead>
            <tbody>
              {employees && employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp.id || emp.employeeCode}>
                    <td><strong>{emp.employeeCode}</strong></td>
                    <td>{emp.fullName}</td>
                    <td>{emp.jobTitle}</td>
                    <td>{emp.department}</td>
                    <td>{emp.username}</td>
                    <td>
                      <Badge bg={emp.isActive ? 'success' : 'danger'}>
                        {emp.isActive ? 'نشط' : 'معلق'}
                      </Badge>
                    </td>
                    <td>
                      <Form.Check 
                        type="switch"
                        id={`custom-switch-${emp.id || emp.employeeCode}`}
                        checked={emp.isActive || false}
                        onChange={() => handleToggleStatus(emp.id, emp.isActive)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted p-4">لا يوجد موظفين مسجلين حالياً.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EmployeeList;