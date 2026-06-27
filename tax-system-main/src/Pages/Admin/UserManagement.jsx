import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Form, Button, Card, Container, Row, Col,
  Alert, Spinner, Table, InputGroup, Pagination,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { addNewUser, toggleEmployeeStatus } from '../../services/adminService';
import { useDataContext } from '../../context/DataContext';

// ─── ثوابت ───────────────────────────────────────────────────────────────────
const EMPLOYEES_API_URL = 'http://localhost:5179/api/AdminEmployees';
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
  const { employees, refreshEmployees, refreshAuditLogs } = useDataContext();

  const [showForm,          setShowForm]          = useState(false);
  const [loading,           setLoading]           = useState(false);
  const [message,           setMessage]           = useState({ text: '', type: '' });
  const [currentPage,       setCurrentPage]       = useState(1);
  const [typedPage,         setTypedPage]         = useState(1);
  const [showPassword,      setShowPassword]      = useState(false);
  const [showConfirmModal,  setShowConfirmModal]  = useState(false);
  const [targetEmployee,    setTargetEmployee]    = useState(null);
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
  const handleToggleStatus = (employeeId, currentStatus) => {
    setTargetEmployee({ id: employeeId, isActive: currentStatus });
    setShowConfirmModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!targetEmployee) return;
    setShowConfirmModal(false);
    setLoading(true);
    try {
      await toggleEmployeeStatus(targetEmployee.id);
      await Promise.all([refreshEmployees(), refreshAuditLogs()]);
      setMessage({ text: 'تم تحديث حالة الموظف بنجاح.', type: 'success' });
    } catch (error) {
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
      await axios.delete(`${EMPLOYEES_API_URL}/${employeeId}`);
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
    setLoading(true);
    try {
      await addNewUser(formData);
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

  const handlePaginationKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const pageNum = parseInt(typedPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    } else {
      setTypedPage(currentPage);
    }
  };

  const uniqueJobTitles = useMemo(() => {
    const titles = [...new Set(employees.map((emp) => emp.jobTitle || emp.JobTitle).filter(Boolean))];
    return titles.sort((a, b) => a.localeCompare(b, 'ar'));
  }, [employees]);

  // ─── مساعد تحديث نموذج الإضافة ───────────────────────────────────────────
  const setField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

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
                <Button variant="primary" onClick={() => setShowForm(true)}>
                  + إضافة موظف جديد
                </Button>
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
                      const empId  = emp.id || emp.employeeCode || emp.EmployeeCode;
                      return (
                        <tr key={empId}>
                          <td>{emp.id}</td>
                          <td>{emp.employeeCode || emp.EmployeeCode || '-'}</td>
                          <td>{emp.nationalID   || emp.nationalId  || emp.NationalID || '-'}</td>
                          <td>{emp.fullName      || emp.FullName   || '-'}</td>
                          <td>{emp.jobTitle      || emp.JobTitle   || '-'}</td>
                          <td>{emp.username      || emp.Username   || '-'}</td>
                          <td>{getNormalizedArabicRole(emp)}</td>
                          <td>{active ? 'نشط' : 'معلق'}</td>
                          <td className="text-nowrap">
                            <Button
                              size="sm"
                              variant={active ? 'warning' : 'success'}
                              className="me-2"
                              onClick={() => handleToggleStatus(empId, active)}
                            >
                              {active ? 'تعطيل' : 'تفعيل'}
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteEmployee(empId)}
                            >
                              حذف
                            </Button>
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
                  <div className="d-flex justify-content-center mt-3">
                    <Pagination className="mb-0">
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
                          onKeyDown={handlePaginationKeyDown}
                          className="form-control form-control-sm"
                          style={{ width: '45px', textAlign: 'center', height: '28px', margin: '0 5px', padding: '4px' }}
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