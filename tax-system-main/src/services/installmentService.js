// src/services/installmentService.js

const API_BASE = '/api/installments';

// ============================================================
// جلب كل الأقساط لتقييم معين
// ============================================================
export const getInstallmentsByAssessment = async (assessmentId) => {
  const response = await fetch(`${API_BASE}/${assessmentId}`);

  if (!response.ok) throw new Error('فشل جلب الأقساط');

  return response.json(); // InstallmentDto[]
};

// ============================================================
// جلب الأقساط غير المدفوعة فقط
// ============================================================
export const getPendingInstallments = async (assessmentId) => {
  const response = await fetch(`${API_BASE}/${assessmentId}/pending`);

  if (!response.ok) throw new Error('فشل جلب الأقساط المستحقة');

  return response.json(); // InstallmentDto[]
};

// ============================================================
// توليد الأقساط (يُستدعى بعد اعتماد التقييم)
// ============================================================
export const generateInstallments = async (assessmentId) => {
  const response = await fetch(`${API_BASE}/${assessmentId}/generate`, {
    method: 'POST',
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'فشل توليد الأقساط');
  }

  return response.json();
};