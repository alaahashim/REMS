import axios from 'axios';

const BASE_URL = 'http://localhost:5179/api';
const EMPLOYEES_URL = `${BASE_URL}/AdminEmployees`;
const AUDIT_LOGS_URL = `${BASE_URL}/AuditLogs`;

const normalizeAuditLog = (log) => {
  const dateValue = log.actionDate ?? log.createdAt ?? log.ActionDate ?? log.CreatedAt;
  const employeeId = log.employeeId ?? log.EmployeeId;
  const actionType = log.actionType ?? log.ActionType ?? '';
  const tableName = log.tableName ?? log.TableName ?? '';
  const keyValue = log.keyValue ?? log.KeyValue;
  const oldValues = log.oldValues ?? log.OldValues;
  const newValues = log.newValues ?? log.NewValues;

  const detailsParts = [];
  if (keyValue) detailsParts.push(`Key: ${keyValue}`);
  if (oldValues) detailsParts.push(`Old: ${oldValues}`);
  if (newValues) detailsParts.push(`New: ${newValues}`);

  return {
    id: log.id ?? log.Id,
    date: dateValue,
    employeeId,
    user: employeeId ? `Employee #${employeeId}` : 'System',
    action: actionType,
    entity: tableName,
    details: detailsParts.join(' | '),
  };
};

const mapCreateUserPayload = (userData) => ({
  EmployeeCode: userData.employeeCode,
  FullName: userData.name,
  NationalId: userData.nationalID,
  JobTitle: userData.jobTitle,
  Department: userData.role ?? userData.department ?? '',
  OfficeId: userData.officeId,
  Username: userData.username,
  Password: userData.password,
});

const extractResponseData = (response) => {
  if (!response) return null;
  if (response.data !== undefined) return response.data;
  return response;
};

export const addNewUser = async (userData) => {
  const payload = mapCreateUserPayload(userData);
  const response = await axios.post(EMPLOYEES_URL, payload);
  return extractResponseData(response);
};

export const getEmployees = async (searchQuery = '') => {
  const response = await axios.get(EMPLOYEES_URL, {
    params: searchQuery.trim() ? { searchQuery: searchQuery.trim() } : {},
  });
  const data = extractResponseData(response);
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
};

export const toggleEmployeeStatus = async (employeeId) => {
  const response = await axios.put(`${EMPLOYEES_URL}/toggle-status/${employeeId}`);
  return extractResponseData(response);
};

export const getSystemLogs = async (count = 50) => {
  const response = await axios.get(`${AUDIT_LOGS_URL}/latest`, {
    params: { count },
  });

  const data = extractResponseData(response);
  const logs = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return logs.map(normalizeAuditLog);
};
