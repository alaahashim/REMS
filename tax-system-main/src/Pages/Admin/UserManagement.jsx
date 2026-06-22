import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner, Table, InputGroup, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { addNewUser, getEmployees, toggleEmployeeStatus } from '../../services/adminService';

const EMPLOYEES_API_URL = 'http://localhost:5179/api/AdminEmployees';

const roleMap = {
  Admin: 'أدمن (مدير النظام)',
  'Data Entry': 'مدخل بيانات',
  Reviewer: 'مراجع',
  Finance: 'مالي',
  Manager: 'مدير مأمورية',
  Committee: 'لجنة الطعون',
};

const UserManagement = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [typedPage, setTypedPage] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    employeeCode: '',
    jobTitle: '',
    officeId: '',
    username: '',
    password: '',
    role: 'مدخل بيانات',
    isActive: true,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [jobTitleFilter, setJobTitleFilter] = useState('كل المسميات');
  const [roleFilter, setRoleFilter] = useState('كل الصلاحيات');

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setMessage({ text: 'تعذر جلب بيانات الموظفين.', type: 'danger' });
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setTypedPage(1);
  }, [searchQuery, jobTitleFilter, roleFilter]);

  useEffect(() => {
    setTypedPage(currentPage);
  }, [currentPage]);

  const normalizeCodeValue = (value) => {
    if (!value) return '';
    return String(value).toUpperCase();
  };

  const extractCodeNumber = (code) => {
    const match = String(code).match(/(\d+)$/);
    return match ? Number(match[1]) : null;
  };

  const translatedRole = (employee) => {
    return roleMap[employee.role] || employee.role || employee.department || '-';
  };

  const isEmployeeActive = (employee) => {
    const value = employee.status ?? employee.isActive;
    if (typeof value === 'string') {
      return /^(true|1|active|نشط)$/i.test(value);
    }
    return Boolean(value);
  };

  const handleToggleStatus = async (employeeId, currentStatus) => {
    const confirmationMessage = currentStatus
      ? 'هل أنت متأكد من تعطيل هذا الموظف؟'
      : 'هل أنت متأكد من تفعيل هذا الموظف؟';

    if (!window.confirm(confirmationMessage)) return;

    setLoading(true);
    try {
      await toggleEmployeeStatus(employeeId);
      await loadEmployees();
      setMessage({ text: 'تم تحديث حالة الموظف بنجاح.', type: 'success' });
    } catch (error) {
      console.error('Toggle status failed', error);
      setMessage({ text: 'تعذر تحديث حالة الموظف.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الموظف نهائياً؟')) return;

    setLoading(true);
    try {
      await axios.delete(`${EMPLOYEES_API_URL}/${employeeId}`);
      await loadEmployees();
      setMessage({ text: 'تم حذف الموظف بنجاح.', type: 'success' });
    } catch (error) {
      console.error('Delete employee failed', error);
      setMessage({ text: 'تعذر حذف الموظف.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return employees.filter((employee) => {
      const employeeCode = String(employee.employeeCode || employee.id || '').toLowerCase();
      const fullName = String(employee.fullName || '').toLowerCase();
      const matchSearch = !query || fullName.includes(query) || employeeCode.includes(query);

      if (!matchSearch) return false;

      if (jobTitleFilter !== 'كل المسميات' && (employee.jobTitle || '') !== jobTitleFilter) {
        return false;
      }

      if (roleFilter !== 'كل الصلاحيات' && translatedRole(employee) !== roleFilter) {
        return false;
      }

      return true;
    });
  }, [employees, searchQuery, jobTitleFilter, roleFilter]);

  const sortedEmployees = useMemo(() => {
    const employeeSorter = (a, b) => {
      const aCode = normalizeCodeValue(a.employeeCode ?? a.id ?? '');
      const bCode = normalizeCodeValue(b.employeeCode ?? b.id ?? '');
      const aNum = extractCodeNumber(aCode);
      const bNum = extractCodeNumber(bCode);

      if (aNum !== null && bNum !== null) {
        if (bNum !== aNum) return bNum - aNum;
      }

      if (aCode !== bCode) {
        return bCode.localeCompare(aCode, undefined, { numeric: true, sensitivity: 'base' });
      }

      return (b.id ?? 0) - (a.id ?? 0);
    };

    return [...filteredEmployees].sort(employeeSorter);
  }, [filteredEmployees]);

  const totalPages = Math.max(1, Math.ceil(sortedEmployees.length / 5));
  const indexOfLastRow = currentPage * 5;
  const indexOfFirstRow = indexOfLastRow - 5;
  const currentRows = sortedEmployees.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
      setTypedPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePaginationKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const pageNum = parseInt(typedPage, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        setCurrentPage(pageNum);
      } else {
        setTypedPage(currentPage);
      }
    }
  };

  const uniqueJobTitles = useMemo(() => {
    const titles = [...new Set(employees.map((emp) => emp.jobTitle).filter(Boolean))];
    return titles.sort((a, b) => a.localeCompare(b, 'ar'));
  }, [employees]);

  const roleOptions = [
    'كل الصلاحيات',
    'أدمن (مدير النظام)',
    'مدخل بيانات',
    'مراجع',
    'مالي',
    'مدير مأمورية',
    'لجنة الطعون',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await addNewUser(formData);
      setMessage({ text: 'تم إضافة المستخدم بنجاح', type: 'success' });
      setShowForm(false);
      setFormData({
        name: '',
        employeeCode: '',
        jobTitle: '',
        officeId: '',
        username: '',
        password: '',
        role: 'مدخل بيانات',
        isActive: true,
      });
      await loadEmployees();
      setCurrentPage(1);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.message || 'حدث خطأ أثناء حفظ البيانات';
      setMessage({ text: errorMsg, type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col md={10}>
          <div style={{ marginBottom: '20px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/admin/home')}>
              <i className="fa-solid fa-arrow-right"></i> عودة للرئيسية
            </button>
          </div>

          {!showForm ? (
            <Card className="shadow-sm border-0 border-top border-5 border-dark">
              <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0"><i className="fa-solid fa-users me-2"></i> قائمة الموظفين</h5>
                <Button variant="primary" onClick={() => setShowForm(true)}>
                  + إضافة موظف جديد
                </Button>
              </Card.Header>
              <Card.Body>
                {message.text && <Alert variant={message.type}>{message.text}</Alert>}

                <Card className="mb-3 p-3 border-secondary border-opacity-10">
                  <Row className="g-3">
                    <Col md={4} sm={12}>
                      <Form.Group>
                        <Form.Label className="mb-1">بحث باسم أو كود الموظف</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="بحث باسم أو كود الموظف..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4} sm={12}>
                      <Form.Group>
                        <Form.Label className="mb-1">المسمى الوظيفي</Form.Label>
                        <Form.Select value={jobTitleFilter} onChange={(e) => setJobTitleFilter(e.target.value)}>
                          <option>كل المسميات</option>
                          {uniqueJobTitles.map((title) => (
                            <option key={title} value={title}>{title}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4} sm={12}>
                      <Form.Group>
                        <Form.Label className="mb-1">الصلاحية العامة</Form.Label>
                        <Form.Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                          {roleOptions.map((roleOption) => (
                            <option key={roleOption} value={roleOption}>{roleOption}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card>

                <Table responsive hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>الرقم (ID)</th>
                      <th>كود الموظف</th>
                      <th>الاسم الثلاثي</th>
                      <th>المسمى الوظيفي</th>
                      <th>اسم المستخدم</th>
                      <th>الصلاحية</th>
                      <th>حالة الحساب</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.length > 0 ? (
                      currentRows.map((employee) => {
                        const active = isEmployeeActive(employee);
                        return (
                          <tr key={employee.id || employee.employeeCode}>
                            <td>{employee.id}</td>
                            <td>{employee.employeeCode || '-'}</td>
                            <td>{employee.fullName || '-'}</td>
                            <td>{employee.jobTitle || '-'}</td>
                            <td>{employee.username || '-'}</td>
                            <td>{translatedRole(employee)}</td>
                            <td>{active ? 'نشط' : 'معلق'}</td>
                            <td className="text-nowrap">
                              <Button
                                size="sm"
                                variant={active ? 'warning' : 'success'}
                                className="me-2"
                                onClick={() => handleToggleStatus(employee.id || employee.employeeCode, active)}
                              >
                                {active ? 'تعطيل' : 'تفعيل'}
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDeleteEmployee(employee.id || employee.employeeCode)}
                              >
                                حذف
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center text-muted py-4">
                          لا يوجد موظفين مطابقين للبحث أو الفلاتر.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                {sortedEmployees.length > 0 && (
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 mt-3">
                    <Pagination className="mb-0">
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
                          onKeyDown={handlePaginationKeyDown}
                          className="form-control form-control-sm"
                          style={{
                            width: '45px',
                            textAlign: 'center',
                            height: '28px',
                            margin: '0 5px',
                            padding: '4px',
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
                )}
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm border-0 border-top border-5 border-dark">
              <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0"><i className="fa-solid fa-user-plus me-2"></i> إضافة حساب موظف جديد (Employee)</h5>
                <Button variant="secondary" onClick={() => setShowForm(false)}>
                  ← عودة لجدول الموظفين
                </Button>
              </Card.Header>
              <Card.Body>
                {message.text && <Alert variant={message.type}>{message.text}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>الاسم الثلاثي <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>كود الموظف (EmployeeCode) <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="مثال: EMP-005"
                          required
                          value={formData.employeeCode}
                          onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>المسمى الوظيفي (JobTitle)</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="مثال: مراجع ضرائب أول"
                          required
                          value={formData.jobTitle}
                          onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>المأمورية التابعة (OfficeID)</Form.Label>
                        <Form.Select
                          value={formData.officeId}
                          onChange={(e) => setFormData({ ...formData, officeId: e.target.value })}
                        >
                          <option value="">اختر المأمورية...</option>
                          <option value="1">مأمورية مدينة نصر - القاهرة</option>
                          <option value="2">مأمورية الدقي - الجيزة</option>
                          <option value="3">مأمورية الإسكندرية</option>
                          <option value="99">المركز الرئيسي</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>اسم المستخدم للنظام (Username) <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          required
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>كلمة المرور (Password) <span className="text-danger">*</span></Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          />
                          <Button
                            variant="outline-secondary"
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>الصلاحية العامة (Role)</Form.Label>
                        <Form.Select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                          <option value="مدخل بيانات">مدخل بيانات</option>
                          <option value="مراجع">مراجع</option>
                          <option value="مالي">مالي</option>
                          <option value="مدير مأمورية">مدير مأمورية</option>
                          <option value="أدمن (مدير النظام)">أدمن (مدير النظام)</option>
                          <option value="لجنة الطعون">لجنة الطعون</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>حالة الحساب (Status)</Form.Label>
                        <Form.Select
                          value={formData.isActive ? '1' : '0'}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.value === '1' })}
                        >
                          <option value="1">نشط (Active)</option>
                          <option value="0">معلق (Suspended)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button variant="primary" type="submit" className="w-100 py-3 fw-bold" disabled={loading}>
                    {loading ? <Spinner size="sm" animation="border" /> : 'حفظ وإنشاء الحساب'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default UserManagement;
