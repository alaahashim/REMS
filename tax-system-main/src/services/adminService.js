import api from './apiClient';
import { formatAuditMessage, stripMarkup } from '../utils/auditLogFormatter';

const EMPLOYEES_URL = '/AdminEmployees';
const AUDIT_LOGS_URL = '/AuditLogs';

const normalizeAuditLog = (log) => {
  const dateValue = log.actionDate ?? log.createdAt ?? log.ActionDate ?? log.CreatedAt;
  const employeeId = log.employeeId ?? log.EmployeeId;
  const actionType = log.actionType ?? log.ActionType ?? '';
  const tableName = log.tableName ?? log.TableName ?? '';
  const keyValue = log.keyValue ?? log.KeyValue;
  const oldValues = log.oldValues ?? log.OldValues;
  const newValues = log.newValues ?? log.NewValues;
  const formattedMessage = log.formattedMessage ?? log.FormattedMessage ?? '';
  const actorName = log.actorName ?? log.ActorName ?? log.employeeName ?? log.EmployeeName;
  const targetEmployeeName = log.targetEmployeeName ?? log.TargetEmployeeName;
  const targetNationalId = log.targetNationalId ?? log.TargetNationalId;
  const targetEmployeeCode = log.targetEmployeeCode ?? log.TargetEmployeeCode;

  const detailsParts = [];
  if (keyValue) detailsParts.push(`Key: ${keyValue}`);
  if (oldValues) detailsParts.push(`Old: ${oldValues}`);
  if (newValues) detailsParts.push(`New: ${newValues}`);

  return {
    id: log.id ?? log.Id,
    date: dateValue,
    employeeId,
    user: actorName || (employeeId ? `Employee #${employeeId}` : 'System'),
    actorName,
    action: actionType,
    displayAction: log.displayAction ?? log.DisplayAction,
    entity: tableName,
    details: stripMarkup(detailsParts.join(' | ')),
    formattedMessage,
    message: formatAuditMessage({
      ...log,
      action: actionType,
      formattedMessage,
      targetEmployeeName,
      targetNationalId,
      targetEmployeeCode,
    }),
    targetEmployeeName,
    targetNationalId,
    targetEmployeeCode,
  };
};

const mapCreateUserPayload = (userData) => {
  const payload = new FormData();

  payload.append('EmployeeCode', String(userData.employeeCode || '').trim());
  payload.append('FullName', String(userData.name || '').trim());
  payload.append('NationalId', String(userData.nationalID || '').replace(/\D/g, '').slice(0, 14));
  payload.append('JobTitle', String(userData.jobTitle || '').trim());
  payload.append('Department', String(userData.role ?? userData.department ?? '').trim());
  payload.append('OfficeId', String(userData.officeId || '').trim());
  payload.append('Username', String(userData.username || '').trim());
  payload.append('Password', userData.password);
  payload.append('Email', String(userData.email || '').trim());
  payload.append('Phone', String(userData.phone || '').replace(/\D/g, '').slice(0, 11));

  if (userData.profilePicture instanceof File) {
    payload.append('profilePicture', userData.profilePicture);
  }

  return payload;
};

const extractResponseData = (response) => {
  if (!response) return null;
  if (response.data !== undefined) return response.data;
  return response;
};

export const addNewUser = async (userData) => {
  const payload = mapCreateUserPayload(userData);
  const response = await api.post(EMPLOYEES_URL, payload);
  return extractResponseData(response);
};

export const getEmployees = async (searchQuery = '') => {
  const response = await api.get(EMPLOYEES_URL, {
    params: searchQuery.trim() ? { searchQuery: searchQuery.trim() } : {},
  });
  const data = extractResponseData(response);
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
};

export const getEmployeeById = async (employeeId) => {
  const response = await api.get(`${EMPLOYEES_URL}/${employeeId}`);
  return extractResponseData(response);
};

export const toggleEmployeeStatus = async (employeeId, auditTrail = null) => {
  const response = await api.put(`${EMPLOYEES_URL}/toggle-status/${employeeId}`, auditTrail);
  return extractResponseData(response);
};

export const deleteEmployee = async (employeeId) => {
  const response = await api.delete(`${EMPLOYEES_URL}/${employeeId}`);
  return extractResponseData(response);
};

export const getSystemLogs = async (count = 50) => {
  const response = await api.get(`${AUDIT_LOGS_URL}/latest`, {
    params: { count },
  });
  const data = extractResponseData(response);
  const logs = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return logs.map(normalizeAuditLog);
};
