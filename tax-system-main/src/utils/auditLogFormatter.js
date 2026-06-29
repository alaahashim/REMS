const ACTION_LABELS = {
  CREATE: 'تم إضافة حساب الموظف',
  INSERT: 'تم إضافة حساب الموظف',
  UPDATE: 'تم تعديل حساب الموظف',
  DELETE: 'تم حذف حساب الموظف',
  LOGIN: 'تم تسجيل دخول الموظف',
};

export const stripMarkup = (value = '') =>
  String(value)
    .replace(/<[^>]*>/g, '')
    .replace(/\[object Object\]/g, '')
    .trim();

export const getAuditActionLabel = (action) => {
  const key = String(action || '').toUpperCase();
  return ACTION_LABELS[key] || 'تم تسجيل نشاط للموظف';
};

export const formatAuditMessage = (log) => {
  const backendMessage = stripMarkup(log?.formattedMessage || log?.FormattedMessage || '');
  if (backendMessage) return backendMessage;

  const action = log?.displayAction || getAuditActionLabel(log?.action || log?.ActionType);
  const name =
    log?.targetEmployeeName ||
    log?.TargetEmployeeName ||
    log?.fullName ||
    log?.name ||
    'غير معروف';
  const nationalId = log?.targetNationalId || log?.TargetNationalId;
  const employeeCode = log?.targetEmployeeCode || log?.TargetEmployeeCode;
  const tags = [];

  if (nationalId) tags.push(`الرقم القومي: ${nationalId}`);
  if (employeeCode) tags.push(`كود: ${employeeCode}`);

  return tags.length ? `${action} ${name} - ${tags.join(' | ')}.` : `${action} ${name}`;
};

export const getAuditBadge = (action) => {
  const key = String(action || '').toUpperCase();
  if (key === 'CREATE' || key === 'INSERT') return { text: 'إضافة', variant: 'success' };
  if (key === 'UPDATE') return { text: 'تعديل', variant: 'warning', textClass: 'text-dark' };
  if (key === 'DELETE') return { text: 'حذف', variant: 'danger' };
  if (key === 'LOGIN') return { text: 'تسجيل دخول', variant: 'primary' };
  return { text: 'نشاط', variant: 'secondary' };
};
