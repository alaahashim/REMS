// src/services/financeService.js
import api from "./apiClient";

// ============================================================
// SEARCH — البحث بالاسم أو الرقم القومي
// GET /finance/search?search=...
// Returns: FinanceSearchResponseDto | null
// ============================================================
// src/services/financeService.js
export const searchByNameOrId = async (searchTerm) => {
  const { data } = await api.get("/finance/search", {
    params: { search: searchTerm },
  });
  // الباك اند يرجع object واحد أو null — لا تغيير في الفرونت
  return data;
};
// ============================================================
// REGISTER PAYMENT — تسجيل سداد قسط/أقساط
// POST /finance/pay  →  CreatePaymentDto (body)
//
// CreatePaymentDto (Backend expects):
// {
//   installmentIds : number[],   ← مصفوفة وليس مفرداً
//   receiptNo      : string,
//   method         : 'Cash' | 'Fawry' | 'Bank' | 'InstaPay',
//   paymentDate    : string,     ← ISO date "2025-06-30"
//   employeeId     : number,
//   notes?         : string
// }

// ============================================================
export const registerPayment = async ({
  installmentIds,  // number[] — مصفوفة دائماً
  receiptNo,
  method,
  paymentDate,
  employeeId,
  notes = "",
}) => {
  const { data } = await api.post("/finance/pay", {
    installmentIds,
    receiptNo,
    method,
    paymentDate,
    employeeId,
    notes,
  });
  return data; // PaymentReceiptDto
};

// ============================================================
// PAYMENT HISTORY — سجل المدفوعات
// GET /finance/history
// Returns: PaymentHistoryDto[]
// ============================================================
//export const getPaymentHistory = async () => {
 // const { data } = await api.get("/finance/history");
  //return data;
//};

// ============================================================
// DASHBOARD — إحصائيات لوحة التحكم المالية
// GET /finance/dashboard
// Returns: FinanceDashboardDto = {
//   totalAssessments, paidAssessments, pendingAssessments,
//   overdueInstallments, totalCollected, remainingAmount
// }
// ============================================================
export const getFinanceDashboard = async () => {
  const { data } = await api.get("/finance/dashboard");
  return data;
};

// ============================================================
// UPDATE OVERDUE — تحديث حالة الأقساط المتأخرة
// POST /finance/update-overdue  (Admin / Cron)
// ============================================================
export const updateOverdueInstallments = async () => {
  const { data } = await api.post("/finance/update-overdue");
  return data;
};
// ============================================================
// EMPLOYEES PERFORMANCE
// GET /finance/manager/employees-performance
// ============================================================
export const getEmployeesPerformance = async () => {
  const { data } = await api.get(
    "/finance/manager/employees-performance"
  );

  return data;
};
// GET /finance/history?pageIndex=1&pageSize=8
// Returns: { items, totalCount, pageIndex, pageSize, totalPages }
export const getPaymentHistory = async (pageIndex = 1, pageSize = 8) => {
  const { data } = await api.get("/finance/history", {
    params: { pageIndex, pageSize },
  });
  return data; // PagedResult<PaymentHistoryDto>
};