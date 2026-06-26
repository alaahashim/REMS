import axios from 'axios';

// ─── ثوابت ───────────────────────────────────────────────────────────────────
const BASE_URL       = 'http://localhost:5179/api';
const EMPLOYEES_URL  = `${BASE_URL}/AdminEmployees`;
const AUDIT_LOGS_URL = `${BASE_URL}/AuditLogs`;

// ─── مساعدات داخلية ──────────────────────────────────────────────────────────

/** تطبيع سجل التدقيق القادم من الـ API إلى شكل موحد */
const normalizeAuditLog = (log) => {
  const dateValue  = log.actionDate  ?? log.createdAt  ?? log.ActionDate  ?? log.CreatedAt;
  const employeeId = log.employeeId  ?? log.EmployeeId;
  const actionType = log.actionType  ?? log.ActionType ?? '';
  const tableName  = log.tableName   ?? log.TableName  ?? '';
  const keyValue   = log.keyValue    ?? log.KeyValue;
  const oldValues  = log.oldValues   ?? log.OldValues;
  const newValues  = log.newValues   ?? log.NewValues;

  const detailsParts = [];
  if (keyValue)  detailsParts.push(`Key: ${keyValue}`);
  if (oldValues) detailsParts.push(`Old: ${oldValues}`);
  if (newValues) detailsParts.push(`New: ${newValues}`);

  return {
    id:         log.id ?? log.Id,
    date:       dateValue,
    employeeId,
    user:       employeeId ? `Employee #${employeeId}` : 'System',
    action:     actionType,
    entity:     tableName,
    details:    detailsParts.join(' | '),
  };
};

/** تحويل بيانات النموذج إلى الـ payload المطلوب للـ API */
const mapCreateUserPayload = (userData) => ({
  EmployeeCode: userData.employeeCode,
  FullName:     userData.name,
  NationalId:   userData.nationalID,
  JobTitle:     userData.jobTitle,
  Department:   userData.role ?? userData.department ?? '',
  OfficeId:     userData.officeId,
  Username:     userData.username,
  Password:     userData.password,
});

/** استخراج البيانات من استجابة axios بشكل آمن */
const extractResponseData = (response) => {
  if (!response) return null;
  if (response.data !== undefined) return response.data;
  return response;
};

// ─── الخدمات المُصدَّرة ───────────────────────────────────────────────────────

/** إضافة موظف جديد */
export const addNewUser = async (userData) => {
  const payload  = mapCreateUserPayload(userData);
  const response = await axios.post(EMPLOYEES_URL, payload);
  return extractResponseData(response);
};

/** جلب قائمة الموظفين مع دعم البحث الاختياري */
export const getEmployees = async (searchQuery = '') => {
  const response = await axios.get(EMPLOYEES_URL, {
    params: searchQuery.trim() ? { searchQuery: searchQuery.trim() } : {},
  });
  const data = extractResponseData(response);
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
};

/** تبديل حالة الموظف (نشط / معلق) */
export const toggleEmployeeStatus = async (employeeId) => {
  const response = await axios.put(`${EMPLOYEES_URL}/toggle-status/${employeeId}`);
  return extractResponseData(response);
};

/** جلب أحدث سجلات التدقيق من الـ API */
export const getSystemLogs = async (count = 50) => {
  const response = await axios.get(`${AUDIT_LOGS_URL}/latest`, {
    params: { count },
  });
  const data = extractResponseData(response);
  const logs = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return logs.map(normalizeAuditLog);
};