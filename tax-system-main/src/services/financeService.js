// src/services/financeService.js
import api from "./apiClient";

// ============================================================
// SEARCH — البحث بالاسم أو الرقم القومي
// Returns: FinanceSearchResponseDto | null
// FinanceSearchResponseDto = {
//   assessmentId, unitId, ownerName, nationalId, address,
//   annualTax, totalDue, paymentPlan, paymentStatus,
//   installments: [{ id, installmentNumber, amount, dueDate, status }]
// }
// ============================================================
export const searchByNameOrId = async (searchTerm) => {
  const { data } = await api.get('/finance/search', {
    params: { search: searchTerm },
  });
  return data; // null إذا لم يوجد
};

// ============================================================
// REGISTER PAYMENT — تسجيل سداد قسط
// Payload: CreatePaymentDto
// Returns: PaymentReceiptDto = {
//   receiptNo, unitId, ownerName, address,
//   paidAmount, method, paymentDate, installmentNumber
// }
// ============================================================
export const registerPayment = async (payload) => {
  // payload shape:
  // {
  //   installmentId : number,
  //   paidAmount    : number,
  //   receiptNo     : string,
  //   method        : 'Cash' | 'Fawry' | 'Bank' | 'InstaPay',
  //   paymentDate   : string  (ISO date, e.g. "2025-06-30"),
  //   employeeId    : number,
  //   notes?        : string
  // }
  const { data } = await api.post('/finance/pay', payload);
  return data;
};

// ============================================================
// PAYMENT HISTORY — سجل المدفوعات (FinanceHome table)
// Returns: PaymentHistoryDto[]
// ============================================================
export const getPaymentHistory = async () => {
  const { data } = await api.get('/finance/history');
  return data;
};

// ============================================================
// DASHBOARD — إحصائيات لوحة التحكم المالية
// Returns: FinanceDashboardDto = {
//   totalAssessments, paidAssessments, pendingAssessments,
//   overdueInstallments, totalCollected, remainingAmount
// }
// ============================================================
export const getFinanceDashboard = async () => {
  const { data } = await api.get('/finance/dashboard');
  return data;
};

// ============================================================
// UPDATE OVERDUE — (يُستدعى من Admin أو Cron Job)
// ============================================================
export const updateOverdueInstallments = async () => {
  const { data } = await api.post('/finance/update-overdue');
  return data;
};