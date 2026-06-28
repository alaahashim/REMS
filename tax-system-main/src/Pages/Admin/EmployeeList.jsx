import { useEffect, useState } from 'react';
import { Table, Button, Form, Badge, Card, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toggleEmployeeStatus } from '../../services/adminService';
import { useDataContext } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext'; 
import { useDynamicTranslation } from '../../utils/useDynamicTranslation'; 

const DynText = ({ text, lang }) => {
  const translated = useDynamicTranslation(text || '', lang);
  return <>{translated || '-'}</>;
};

const getEmployeeRole = (employee) => {
  if (!employee) return '-';
  const rawRole = employee.Role || employee.role || employee.Department || employee.department || '';
  const roleText = String(rawRole).toLowerCase().trim();

  if (roleText.includes("admin")) return "مدير النظام";
  if (roleText.includes("data") || roleText.includes("entry")) return "مدخل بيانات";
  if (roleText.includes("review") || roleText.includes("audit") || roleText.includes("reviewer")) return "مُراجع";
  if (roleText.includes("financial") || roleText.includes("finance") || roleText.includes("مالي")) return "مالي";
  if (roleText.includes("manager") || roleText.includes("مأمورية")) return "مدير مأمورية";
  if (roleText.includes("committee") || roleText.includes("طعون")) return "لجنة الطعون";

  return rawRole || '-';
};

const EmployeeList = () => {
  const navigate = useNavigate();
  const { employees, refreshEmployees, refreshAuditLogs } = useDataContext();
  const { lang } = useLanguage(); 

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    refreshEmployees(debouncedSearchQuery).catch((error) => {
      console.error('Error fetching employees', error);
    });
  }, [refreshEmployees, debouncedSearchQuery]);

  const handleToggleStatus = async (id) => {
    try {
      await toggleEmployeeStatus(id);
      await Promise.all([refreshEmployees(debouncedSearchQuery), refreshAuditLogs()]);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('عذرا، تعذر تحديث حالة حساب الموظف في قاعدة البيانات.');
    }
  };

  return (
    <Container fluid className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-dark">إدارة حسابات الموظفين</h4>
        <Button variant="dark" onClick={() => navigate('/admin/users')}>
          <i className="fa-solid fa-user-plus me-2"></i> إضافة موظف جديد
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Row className="mb-3">
            <Col md={5} sm={12}>
              <Form.Control
                type="text"
                placeholder="بحث باسم أو الرقم القومي للموظف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Col>
          </Row>

          <Table hover responsive className="align-middle">
            <thead className="table-light">
              <tr>
                <th>كود الموظف</th>
                <th>الرقم القومي</th>
                <th>الاسم بالكامل</th>
                <th>المسمى الوظيفي</th>
                <th>الصلاحية</th>
                <th>اسم المستخدم</th>
                <th>حالة الحساب</th>
                <th>تغيير الحالة</th>
              </tr>
            </thead>
            <tbody className="table-hover">
              {employees && employees.length > 0 ? (
                employees.map((emp) => {
                  const isEmpActive = emp.isActive !== undefined ? emp.isActive : emp.IsActive;
                  return (
                    <tr key={emp.id || emp.employeeCode || emp.EmployeeCode}>
                      <td><strong>{emp.employeeCode || emp.EmployeeCode || '-'}</strong></td>
                      <td>{emp.nationalId || emp.NationalId || emp.nationalID || emp.NationalID || '-'}</td>
                      <td><DynText text={emp.fullName || emp.FullName} lang={lang} /></td>
                      <td><DynText text={emp.jobTitle || emp.JobTitle} lang={lang} /></td>
                      <td><DynText text={getEmployeeRole(emp)} lang={lang} /></td>
                      <td>{emp.username || emp.Username || '-'}</td>
                      <td>
                        <Badge bg={isEmpActive ? 'success' : 'danger'}>
                          {isEmpActive ? 'نشط' : 'معلق'}
                        </Badge>
                      </td>
                      <td>
                        <Form.Check
                          type="switch"
                          id={`custom-switch-${emp.id || emp.employeeCode || emp.EmployeeCode}`}
                          checked={isEmpActive || false}
                          onChange={() => handleToggleStatus(emp.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted p-4">لا يوجد موظفين مطابقين للبحث.</td>
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