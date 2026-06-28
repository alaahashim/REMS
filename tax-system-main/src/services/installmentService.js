// src/services/installmentService.js
import api from "./apiClient";

// ============================================================
// جلب كل الأقساط لتقييم معين
// GET /installments/{assessmentId}
// Returns: InstallmentDto[]
// ============================================================
export const getInstallmentsByAssessment = async (assessmentId) => {
  const { data } = await api.get(`/installments/${assessmentId}`);
  return data;
};

// ============================================================
// جلب الأقساط غير المدفوعة فقط (Pending / Overdue)
// GET /installments/{assessmentId}/pending
// Returns: InstallmentDto[]
// ============================================================
export const getPendingInstallments = async (assessmentId) => {
  const { data } = await api.get(`/installments/${assessmentId}/pending`);
  return data;
};

// ============================================================
// توليد الأقساط (يُستدعى بعد اعتماد التقييم)
// POST /installments/{assessmentId}/generate
// ============================================================
export const generateInstallments = async (assessmentId) => {
  const { data } = await api.post(`/installments/${assessmentId}/generate`);
  return data;
};