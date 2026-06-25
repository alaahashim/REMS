// src/services/taxService.js
import api from "./apiClient";

/**
 * جلب قائمة مهام المراجع مع فلترة + Paging
 * query = {
 *   status?: "PendingCalculation" | "Approved",
 *   ownerName?: string,
 *   pageNumber?: number,
 *   pageSize?: number
 * }
 */
export const getReviewerTaxTasks = async (query = {}) => {
  const params = new URLSearchParams();

  if (query.status) params.append("status", query.status);
  if (query.ownerName) params.append("ownerName", query.ownerName);
  if (query.pageNumber) params.append("pageNumber", query.pageNumber);
  if (query.pageSize) params.append("pageSize", query.pageSize);

  const { data } = await api.get(
    `/taxassessments/reviewer-tasks?${params.toString()}`
  );

  return data;
};

/**
 * جلب تفاصيل وحدة واحدة في شاشة المراجع
 */
export const getReviewerTaskDetails = async (unitId) => {
  const { data } = await api.get(
    `/taxassessments/reviewer-tasks/${unitId}/details`
  );
  return data;
};

/**
 * معاينة الحساب الضريبي قبل الاعتماد
 */
export const previewTaxCalculation = async (payload) => {
  const { data } = await api.post("/taxassessments/preview", payload);
  return data;
};

/**
 * اعتماد التقييم الضريبي
 */
export const approveTaxCalculation = async (payload) => {
  const { data } = await api.post("/taxassessments/approve", payload);
  return data;
};

/**
 * جلب تقييم محفوظ لوحدة وسنة محددة
 */
export const getUnitTaxAssessment = async (unitId, taxYear) => {
  const { data } = await api.get(
    `/taxassessments/unit/${unitId}/year/${taxYear}`
  );
  return data;
};