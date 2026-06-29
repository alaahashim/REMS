import React, { useState, useEffect, useMemo } from 'react';
import {
  Form, Button, Card, Container, Row, Col,
  Alert, Spinner, Table, InputGroup, Pagination,
  Modal, Badge,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { addNewUser, deleteEmployee, getEmployeeById, toggleEmployeeStatus } from '../../services/adminService';
import { useDataContext } from '../../context/DataContext';

// ─── ثوابت ───────────────────────────────────────────────────────────────────
const ROWS_PER_PAGE     = 5;

const ROLE_OPTIONS = [
  'كل الصلاحيات',
  'أدمن (مدير النظام)',
  'مدخل بيانات',
  'مراجع',
  'مالي',
  'مدير مأمورية',
  'لجنة الطعون',
];

const INITIAL_FORM = {
  name:         '',
  employeeCode: '',
  nationalID:   '',
  jobTitle:     '',
  officeId:     '',
  username:     '',
  password:     '',
  email:        '',
  phone:        '',
  profilePicture: null,
  role:         'Data Entry',
  isActive:     true,
};

// ─── مساعدات ثابتة خارج المكوّن ──────────────────────────────────────────────

/** تحويل صلاحية الموظف إلى عرض عربي موحد */
const getNormalizedArabicRole = (employee) => {
  if (!employee) return 'مدخل بيانات';
  const raw  = employee.role || employee.Role || employee.department || employee.Department || '';
  const text = String(raw).toLowerCase().trim();

  if (text.includes('admin'))                                          return 'أدمن (مدير النظام)';
  if (text.includes('data') || text.includes('entry'))                return 'مدخل بيانات';
  if (text.includes('review') || text.includes('audit') || text.includes('reviewer')) return 'مراجع';
  if (text.includes('finance') || text.includes('financial') || text.includes('مالي')) return 'مالي';
  if (text.includes('manager') || text.includes('مأمورية'))          return 'مدير مأمورية';
  if (text.includes('committee') || text.includes('طعون'))           return 'لجنة الطعون';

  return raw || 'مدخل بيانات';
};

/** هل الموظف نشط؟ */
const isEmployeeActive = (employee) => {
  const value = employee.status ?? employee.isActive ?? employee.IsActive;
  if (typeof value === 'string') return /^(true|1|active|نشط)$/i.test(value);
  return Boolean(value);
};

const getStatusLabel = (active) => (active ? 'نشط' : 'معطل');

const getEmployeeId = (employee) => employee?.id ?? employee?.Id;

const getEmployeeName = (employee) => employee?.fullName || employee?.FullName || employee?.name || employee?.Name || '-';

const getEmployeeField = (employee, ...keys) => {
  for (const key of keys) {
    const value = employee?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }

  return '';
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
};

/** كود الموظف كنص موحد */
const normalizeCodeValue = (value) => String(value ?? '').toUpperCase();

/** استخراج الرقم من نهاية الكود */
const extractCodeNumber = (code) => {
  const match = String(code).match(/(\d+)$/);
  return match ? Number(match[1]) : null;
};

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────
const UserManagement = () => {
  const navigate = useNavigate();
  const { employees, refreshEmployees, refreshAuditLogs, updateEmployeeInState } = useDataContext();

  const [showForm,          setShowForm]          = useState(false);
  const [loading,           setLoading]           = useState(false);
  const [message,           setMessage]           = useState({ text: '', type: '' });
  const [currentPage,       setCurrentPage]       = useState(1);
  const [typedPage,         setTypedPage]         = useState(1);
  const [showPassword,      setShowPassword]      = useState(false);
  const [showConfirmModal,  setShowConfirmModal]  = useState(false);
  const [targetEmployee,    setTargetEmployee]    = useState(null);
  const [showQuickView,     setShowQuickView]     = useState(false);
  const [quickViewEmployee, setQuickViewEmployee] = useState(null);
  const [quickViewLoading,  setQuickViewLoading]  = useState(false);
  const [quickViewError,    setQuickViewError]    = useState('');
  const [formData,          setFormData]          = useState(INITIAL_FORM);
  const [searchQuery,       setSearchQuery]       = useState('');
  const [jobTitleFilter,    setJobTitleFilter]    = useState('كل المسميات');
  const [roleFilter,        setRoleFilter]        = useState('كل الصلاحيات');

  // ─── تحميل الموظفين ────────────────────────────────────────────────────────
  useEffect(() => {
    refreshEmployees().catch((err) => {
      console.error('Error fetching employees:', err);
      setMessage({ text: 'تعذر جلب بيانات الموظفين.', type: 'danger' });
    });
  }, [refreshEmployees]);

  // إعادة ضبط الصفحة عند تغيّر الفلاتر
  useEffect(() => {
    setCurrentPage(1);
    setTypedPage(1);
  }, [searchQuery, jobTitleFilter, roleFilter]);

  // مزامنة حقل إدخال الصفحة
  useEffect(() => {
    setTypedPage(currentPage);
  }, [currentPage]);

  // ─── إجراءات الموظفين ──────────────────────────────────────────────────────
  const handleToggleStatus = (employee) => {
    const employeeId = getEmployeeId(employee);
    if (!employeeId) {
      setMessage({ text: 'تعذر تحديد رقم الموظف لتحديث الحالة.', type: 'danger' });
      return;
    }
    setTargetEmployee({
      id: employeeId,
      isActive: isEmployeeActive(employee),
      name: getEmployeeName(employee),
    });
    setShowConfirmModal(true);
  };

  const handleQuickView = async (employeeId) => {
    if (!employeeId) {
      setMessage({ text: 'تعذر تحديد رقم الموظف لعرض التفاصيل.', type: 'danger' });
      return;
    }

    setShowQuickView(true);
    setQuickViewEmployee(null);
    setQuickViewError('');
    setQuickViewLoading(true);

    try {
      const employee = await getEmployeeById(employeeId);
      const fetchedId = getEmployeeId(employee);

      if (String(fetchedId) !== String(employeeId)) {
        throw new Error('Employee details did not match the selected row.');
      }

      setQuickViewEmployee(employee);
    } catch (error) {
      console.error('Quick view failed', error);
      setQuickViewError('تعذر جلب تفاصيل الموظف المحدد.');
    } finally {
      setQuickViewLoading(false);
    }
  };

  const confirmToggleStatus = async () => {
    if (!targetEmployee) return;
    const previousStatus = targetEmployee.isActive;
    const nextStatus = !previousStatus;
    const oldStatusLabel = getStatusLabel(previousStatus);
    const newStatusLabel = getStatusLabel(nextStatus);
    const previousEmployee = employees.find((employee) => String(getEmployeeId(employee)) === String(targetEmployee.id));

    setShowConfirmModal(false);
    setLoading(true);

    updateEmployeeInState(targetEmployee.id, (employee) => ({
      ...employee,
      isActive: nextStatus,
      IsActive: nextStatus,
      status: nextStatus ? 'Active' : 'Disabled',
    }));

    try {
      const result = await toggleEmployeeStatus(targetEmployee.id, {
        employeeName: targetEmployee.name,
        oldStatus: oldStatusLabel,
        newStatus: newStatusLabel,
      });
      const responseEmployee = result?.data || result?.Data || result?.employee || result?.Employee || result;
      const updatedEmployee = responseEmployee && typeof responseEmployee === 'object' ? responseEmployee : null;

      updateEmployeeInState(targetEmployee.id, (employee) => ({
        ...employee,
        ...(updatedEmployee || {}),
        id: getEmployeeId(updatedEmployee) ?? getEmployeeId(employee),
        isActive: nextStatus,
        IsActive: nextStatus,
        status: nextStatus ? 'Active' : 'Disabled',
      }));

      await refreshAuditLogs();
      setMessage({ text: 'تم تحديث حالة الموظف بنجاح.', type: 'success' });
    } catch (error) {
      updateEmployeeInState(targetEmployee.id, previousEmployee || {
        isActive: previousStatus,
        IsActive: previousStatus,
        status: previousStatus ? 'Active' : 'Disabled',
      });
      console.error('Toggle status failed', error);
      setMessage({ text: 'تعذر تحديث حالة الموظف.', type: 'danger' });
    } finally {
      setLoading(false);
      setTargetEmployee(null);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الموظف نهائياً؟')) return;
    setLoading(true);
    try {
      await deleteEmployee(employeeId);
      await Promise.all([refreshEmployees(), refreshAuditLogs()]);
      setMessage({ text: 'تم حذف الموظف بنجاح.', type: 'success' });
    } catch (error) {
      console.error('Delete employee failed', error);
      setMessage({ text: 'تعذر حذف الموظف.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedFormData = {
      ...formData,
      name: formData.name.trim(),
      employeeCode: formData.employeeCode.trim(),
      nationalID: formData.nationalID.replace(/\D/g, '').slice(0, 14),
      jobTitle: formData.jobTitle.trim(),
      officeId: String(formData.officeId || '').trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      phone: formData.phone.replace(/\D/g, '').slice(0, 11),
      profilePicture: formData.profilePicture instanceof File ? formData.profilePicture : null,
      role: formData.role || 'Data Entry',
      isActive: Boolean(formData.isActive),
    };

    if (!normalizedFormData.name || !normalizedFormData.employeeCode || !normalizedFormData.jobTitle || !normalizedFormData.username || !normalizedFormData.password) {
      setMessage({ text: 'يرجى استكمال جميع الحقول المطلوبة.', type: 'danger' });
      return;
    }

    if (!/^\d{14}$/.test(normalizedFormData.nationalID)) {
      setMessage({ text: 'الرقم القومي يجب أن يتكون من 14 رقم.', type: 'danger' });
      return;
    }

    if (!/^\d{11}$/.test(normalizedFormData.phone)) {
      setMessage({ text: 'رقم الهاتف يجب أن يكون 11 رقمًا.', type: 'danger' });
      return;
    }

    if (!normalizedFormData.officeId) {
      setMessage({ text: 'يرجى اختيار المأمورية التابعة.', type: 'danger' });
      return;
    }

    if (!normalizedFormData.email) {
      setMessage({ text: 'يرجى إدخال البريد الإلكتروني.', type: 'danger' });
      return;
    }

    setLoading(true);
    try {
      await addNewUser(normalizedFormData);
      setMessage({ text: 'تم إضافة المستخدم بنجاح', type: 'success' });
      setShowForm(false);
      setFormData(INITIAL_FORM);
      await Promise.all([refreshEmployees(), refreshAuditLogs()]);
      setCurrentPage(1);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.message || 'حدث خطأ أثناء حفظ البيانات';
      setMessage({ text: errorMsg, type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  // ─── الفلترة والترتيب ────────────────────────────────────────────────────
  const filteredEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return employees.filter((emp) => {
      const nationalID = String(emp.nationalID || emp.nationalId || emp.NationalID || '').toLowerCase();
      const fullName   = String(emp.fullName   || emp.FullName   || '').toLowerCase();
      if (query && !fullName.includes(query) && !nationalID.includes(query)) return false;
      if (jobTitleFilter !== 'كل المسميات' && (emp.jobTitle || emp.JobTitle || '') !== jobTitleFilter) return false;
      if (roleFilter !== 'كل الصلاحيات' && getNormalizedArabicRole(emp) !== roleFilter) return false;
      return true;
    });
  }, [employees, searchQuery, jobTitleFilter, roleFilter]);

  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      const aCode = normalizeCodeValue(a.employeeCode ?? a.EmployeeCode ?? a.id ?? '');
      const bCode = normalizeCodeValue(b.employeeCode ?? b.EmployeeCode ?? b.id ?? '');
      const aNum  = extractCodeNumber(aCode);
      const bNum  = extractCodeNumber(bCode);

      if (aNum !== null && bNum !== null && aNum !== bNum) return bNum - aNum;
      if (aCode !== bCode) return bCode.localeCompare(aCode, undefined, { numeric: true, sensitivity: 'base' });
      return (b.id ?? 0) - (a.id ?? 0);
    });
  }, [filteredEmployees]);

  // ─── ترقيم الصفحات ───────────────────────────────────────────────────────
  const totalPages  = Math.max(1, Math.ceil(sortedEmployees.length / ROWS_PER_PAGE));
  const indexOfLast = currentPage * ROWS_PER_PAGE;
  const currentRows = sortedEmployees.slice(indexOfLast - ROWS_PER_PAGE, indexOfLast);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
      setTypedPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const goToTypedPage = () => {
    const pageNum = parseInt(typedPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    } else {
      setTypedPage(currentPage);
    }
  };

  const handlePaginationKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    e.currentTarget.blur();
  };

  const uniqueJobTitles = useMemo(() => {
    const titles = [...new Set(employees.map((emp) => emp.jobTitle || emp.JobTitle).filter(Boolean))];
    return titles.sort((a, b) => a.localeCompare(b, 'ar'));
  }, [employees]);

  // ─── مساعد تحديث نموذج الإضافة ───────────────────────────────────────────
  const setField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const quickViewDetails = quickViewEmployee ? [
    ['البريد الإلكتروني', getEmployeeField(quickViewEmployee, 'email', 'Email')],
    ['الهاتف', getEmployeeField(quickViewEmployee, 'phone', 'Phone')],
    ['تاريخ الانضمام', formatDate(getEmployeeField(quickViewEmployee, 'createdAt', 'CreatedAt'))],
    ['المأمورية', getEmployeeField(quickViewEmployee, 'officeId', 'OfficeId')],
    ['آخر تحديث بواسطة', getEmployeeField(quickViewEmployee, 'updatedByName', 'UpdatedByName')],
    ['أنشئ بواسطة', getEmployeeField(quickViewEmployee, 'createdByName', 'CreatedByName')],
  ] : [];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col md={10}>
          {/* زر العودة */}
          <div className="mb-3">
            <Button variant="secondary" onClick={() => navigate('/admin/home')}>
              <i className="fa-solid fa-arrow-right" /> عودة للرئيسية
            </Button>
          </div>

          {/* ────── عرض الجدول ────── */}
          {!showForm ? (
            <Card className="shadow-sm border-0 border-top border-5 border-dark">
              <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fa-solid fa-users me-2" /> قائمة الموظفين
                </h5>
                <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
                  <Button variant="primary" onClick={() => setShowForm(true)}>
                    + إضافة موظف جديد
                  </Button>
                </div>
              </Card.Header>

              <Card.Body>
                {message.text && <Alert variant={message.type}>{message.text}</Alert>}

                {/* شريط الفلاتر */}
                <Card className="mb-3 p-3 border-secondary border-opacity-10">
                  <Row className="g-3">
                    <Col md={4} sm={12}>
                      <Form.Group>
                        <Form.Label className="mb-1">بحث باسم أو الرقم القومي للموظف</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="بحث باسم أو الرقم القومي للموظف..."
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
                          {ROLE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card>

                {/* جدول الموظفين */}
                <Table responsive hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>الرقم (ID)</th>
                      <th>كود الموظف</th>
                      <th>الرقم القومي</th>
                      <th>الاسم الثلاثي</th>
                      <th>المسمى الوظيفي</th>
                      <th>اسم المستخدم</th>
                      <th>الصلاحية</th>
                      <th>حالة الحساب</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.length > 0 ? currentRows.map((emp) => {
                      const active = isEmployeeActive(emp);
                      const empId  = getEmployeeId(emp);
                      const employeeName = getEmployeeName(emp);
                      return (
                        <tr key={empId}>
                          <td>{empId}</td>
                          <td>{emp.employeeCode || emp.EmployeeCode || '-'}</td>
                          <td>{emp.nationalID   || emp.nationalId  || emp.NationalID || '-'}</td>
                          <td>
                            <Button
                              variant="link"
                              className="p-0 fw-semibold text-decoration-none"
                              onClick={() => empId && navigate(`/profile/${empId}`)}
                              disabled={!empId}
                            >
                              {employeeName}
                            </Button>
                          </td>
                          <td>{emp.jobTitle      || emp.JobTitle   || '-'}</td>
                          <td>{emp.username      || emp.Username   || '-'}</td>
                          <td>{getNormalizedArabicRole(emp)}</td>
                          <td>
                            <Badge bg={active ? 'success' : 'secondary'} className="fw-normal">
                              {getStatusLabel(active)}
                            </Badge>
                          </td>
                          <td className="text-nowrap">
                            <div className="d-flex gap-2">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                title="عرض سريع"
                                aria-label={`عرض تفاصيل ${employeeName}`}
                                onClick={() => handleQuickView(empId)}
                                disabled={!empId}
                              >
                                <i className="fa-solid fa-eye" />
                              </Button>
                              <Button
                                size="sm"
                                variant={active ? 'warning' : 'success'}
                                onClick={() => handleToggleStatus(emp)}
                                disabled={!empId}
                              >
                                {active ? 'تعطيل' : 'تفعيل'}
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDeleteEmployee(empId)}
                                disabled={!empId}
                              >
                                حذف
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="9" className="text-center text-muted py-4">
                          لا يوجد موظفين مطابقين للبحث أو الفلاتر.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                {/* ترقيم الصفحات */}
                {sortedEmployees.length > 0 && (
                  <div className="d-flex justify-content-between align-items-center gap-3 mt-3 flex-wrap">
                    <div className="text-muted small">
                      الصفحة {currentPage} من {totalPages}
                    </div>
                    <Pagination className="mb-0 align-items-center gap-2">
                      <Pagination.Item
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        السابقة
                      </Pagination.Item>

                      <Form.Control
                        type="number"
                        min="1"
                        max={totalPages}
                        value={typedPage}
                        onChange={(e) => setTypedPage(e.target.value)}
                        onKeyDown={handlePaginationKeyDown}
                        onBlur={goToTypedPage}
                        className="text-center fw-semibold"
                        aria-label="رقم الصفحة"
                        style={{ width: '72px' }}
                      />

                      <Pagination.Item
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        التالية
                      </Pagination.Item>
                    </Pagination>
                  </div>
                )}
              </Card.Body>
            </Card>

          ) : (
            /* ────── نموذج إضافة موظف ────── */
            <Card className="shadow-sm border-0 border-top border-5 border-dark">
              <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fa-solid fa-user-plus me-2" /> إضافة حساب موظف جديد (Employee)
                </h5>
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
                          onChange={(e) => setField('name', e.target.value)}
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
                          onChange={(e) => setField('employeeCode', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>الرقم القومي (National ID) <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]{14}"
                          maxLength={14}
                          placeholder="14 رقم"
                          required
                          value={formData.nationalID}
                          onChange={(e) => setField('nationalID', e.target.value.replace(/\D/g, '').slice(0, 14))}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>البريد الإلكتروني (Email) <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setField('email', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>رقم الهاتف (Phone) <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]{11}"
                          maxLength={11}
                          placeholder="11 رقم"
                          required
                          value={formData.phone}
                          onChange={(e) => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>صورة الملف الشخصي</Form.Label>
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={(e) => setField('profilePicture', e.target.files?.[0] || null)}
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
                          onChange={(e) => setField('jobTitle', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>المأمورية التابعة (OfficeID)</Form.Label>
                        <Form.Select value={formData.officeId} onChange={(e) => setField('officeId', e.target.value)}>
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
                          onChange={(e) => setField('username', e.target.value)}
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
                            onChange={(e) => setField('password', e.target.value)}
                          />
                          <Button
                            variant="outline-secondary"
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>الصلاحية العامة (Role)</Form.Label>
                        <Form.Select value={formData.role} onChange={(e) => setField('role', e.target.value)}>
                          <option value="Data Entry">مدخل بيانات</option>
                          <option value="Reviewer">مراجع</option>
                          <option value="Finance">مالي</option>
                          <option value="Manager">مدير مأمورية</option>
                          <option value="Admin">أدمن (مدير النظام)</option>
                          <option value="Committee">لجنة الطعون</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>حالة الحساب (Status)</Form.Label>
                        <Form.Select
                          value={formData.isActive ? '1' : '0'}
                          onChange={(e) => setField('isActive', e.target.value === '1')}
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

      <Modal
        show={showQuickView}
        onHide={() => setShowQuickView(false)}
        centered
        size="lg"
        dir="rtl"
      >
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title className="fw-bold">
            <i className="fa-solid fa-eye me-2" /> عرض سريع للموظف
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {quickViewLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : quickViewError ? (
            <Alert variant="danger" className="mb-0">{quickViewError}</Alert>
          ) : quickViewEmployee ? (
            <>
              <div className="d-flex justify-content-between align-items-start gap-3 mb-3 flex-wrap">
                <div>
                  <h5 className="fw-bold mb-1">{getEmployeeName(quickViewEmployee)}</h5>
                  <div className="text-muted small">ID: {getEmployeeId(quickViewEmployee)}</div>
                </div>
                <Badge bg={isEmployeeActive(quickViewEmployee) ? 'success' : 'secondary'} className="fw-normal">
                  {getStatusLabel(isEmployeeActive(quickViewEmployee))}
                </Badge>
              </div>

              <Row className="g-3">
                {quickViewDetails.map(([label, value]) => (
                  <Col md={6} key={label}>
                    <div className="border rounded-2 p-3 h-100 bg-light">
                      <div className="text-muted small mb-1">{label}</div>
                      <div className="fw-semibold">{value || '-'}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQuickView(false)}>
            إغلاق
          </Button>
          {quickViewEmployee && (
            <Button variant="primary" onClick={() => navigate(`/profile/${getEmployeeId(quickViewEmployee)}`)}>
              فتح الملف الشخصي
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* ────── Modal تأكيد تغيير الحالة ────── */}
      {showConfirmModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', direction: 'rtl' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div
                className="modal-header bg-dark text-white d-flex justify-content-between align-items-center w-100 px-3"
                style={{ direction: 'rtl' }}
              >
                <h5 className="modal-title m-0 fw-bold text-white">تأكيد الإجراء</h5>
                <button
                  type="button"
                  className="btn-close m-0 p-0"
                  onClick={() => setShowConfirmModal(false)}
                  style={{
                    filter: 'none', background: 'none',
                    fontSize: '1.8rem', color: '#ffffff',
                    opacity: '1', lineHeight: '1', border: 'none',
                  }}
                >
                  &times;
                </button>
              </div>

              <div className="modal-body text-end py-4">
                <p className="mb-0 fs-5 text-dark">
                  {targetEmployee?.isActive
                    ? 'هل أنت متأكد من تعطيل هذا الموظف؟'
                    : 'هل أنت متأكد من تفعيل هذا الموظف؟'}
                </p>
              </div>

              <div className="modal-footer d-flex justify-content-end gap-2 bg-light">
                <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                  إلغاء الأمر
                </Button>
                <Button variant="primary" onClick={confirmToggleStatus} disabled={loading}>
                  {loading ? <Spinner size="sm" animation="border" /> : 'تأكيد وموافق'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default UserManagement;
