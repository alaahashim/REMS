const readStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const defaultEmployees = [
  { id: 1, name: 'موظف التحصيل', role: 'Finance' },
  { id: 2, name: 'مراجع الضرائب', role: 'Reviewer' },
  { id: 3, name: 'مدخل البيانات', role: 'Data Entry' }
];

const normalizeRole = (role = '') => {
  const value = role.toLowerCase();
  if (value.includes('finance')) return 'Finance';
  if (value.includes('review')) return 'Reviewer';
  if (value.includes('data')) return 'Data Entry';
  return role || 'Employee';
};

export const getEmployeesPerformance = () => {
  const users = readStorage('tax_users').map((user) => ({
    id: user.id,
    name: user.name || user.username || `موظف ${user.id}`,
    role: normalizeRole(user.role || user.jobTitle),
    isActive: user.isActive !== false
  }));

  const employees = users.length > 0 ? users : defaultEmployees;
  const properties = readStorage('properties');
  const payments = readStorage('tax_payments');
  const installments = readStorage('tax_installments');

  return employees
    .filter((employee) => employee.isActive !== false)
    .map((employee) => {
      const role = normalizeRole(employee.role);
      let tasksDone = 0;
      let score = 0;
      let totalCollected = 0;
      let details = 'لا توجد عمليات مسجلة بعد';

      if (role === 'Finance') {
        const employeePayments = payments.filter((payment) => String(payment.employeeId) === String(employee.id));
        const fallbackPayments = payments.length > 0 && employee.id === 1 ? payments : employeePayments;

        tasksDone = fallbackPayments.length;
        totalCollected = fallbackPayments.reduce((sum, payment) => sum + Number(payment.paidAmount || 0), 0);
        const validReceipts = fallbackPayments.filter((payment) => payment.receiptNo && Number(payment.paidAmount) > 0).length;
        score = tasksDone > 0 ? Math.round((validReceipts / tasksDone) * 100) : 0;
        details = `${totalCollected.toLocaleString('ar-EG')} ج.م محصلة`;
      }

      if (role === 'Reviewer') {
        const reviewedUnits = properties.flatMap((property) => property.units || [])
          .filter((unit) => ['Pending_Manager', 'Approved', 'Rejected', 'Paid'].includes(unit.status));
        const approvedOrPaid = reviewedUnits.filter((unit) => ['Approved', 'Paid'].includes(unit.status)).length;

        tasksDone = reviewedUnits.length;
        score = tasksDone > 0 ? Math.round((approvedOrPaid / tasksDone) * 100) : 0;
        details = `${approvedOrPaid} ملف معتمد من ${tasksDone}`;
      }

      if (role === 'Data Entry') {
        const createdProperties = properties.filter((property) => property.ownerName || property.units?.length);
        const completeProperties = createdProperties.filter((property) => property.ownerName && property.address && property.units?.length);

        tasksDone = createdProperties.length;
        score = tasksDone > 0 ? Math.round((completeProperties.length / tasksDone) * 100) : 0;
        details = `${completeProperties.length} ملف مكتمل من ${tasksDone}`;
      }

      const pendingInstallments = installments.filter((installment) => installment.status === 'Pending').length;

      return {
        id: employee.id,
        name: employee.name,
        role,
        tasksDone,
        score,
        totalCollected,
        details,
        pendingInstallments
      };
    });
};
