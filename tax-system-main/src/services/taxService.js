// src/services/taxService.js
import api from "./apiClient";

export const getReviewerTaxTasks = async (query = {}) => {
  const params = new URLSearchParams();
  if (query.status) params.append("status", query.status);
  if (query.ownerName) params.append("ownerName", query.ownerName);
  if (query.pageNumber) params.append("pageNumber", query.pageNumber);
  if (query.pageSize) params.append("pageSize", query.pageSize);
  const { data } = await api.get(`/taxassessments/reviewer-tasks?${params.toString()}`);
  return data;
};

export const getReviewerTaskDetails = async (unitId) => {
  const { data } = await api.get(`/taxassessments/reviewer-tasks/${unitId}/details`);
  return data;
};

export const previewTaxCalculation = async (payload) => {
  const { data } = await api.post("/taxassessments/preview", payload);
  return data;
};

export const approveTaxCalculation = async (payload) => {
  const { data } = await api.post("/taxassessments/approve", payload);
  return data;
};

export const getUnitTaxAssessment = async (unitId, taxYear) => {
  const { data } = await api.get(`/taxassessments/unit/${unitId}/year/${taxYear}`);
  return data;
};

export const deleteUnitTaxAssessment = async (unitId, taxYear, deleteRelatedAppeals = false) => {
  const { data } = await api.delete(
    `/taxassessments/unit/${unitId}/year/${taxYear}?deleteRelatedAppeals=${deleteRelatedAppeals}`
  );
  return data;
};

export const revertApprovedAssessment = async (unitId, taxYear, deleteRelatedAppeals = false) => {
  const { data } = await api.post(
    `/taxassessments/unit/${unitId}/year/${taxYear}/revert?deleteRelatedAppeals=${deleteRelatedAppeals}`
  );
  return data;
};

export const hasAppealsForAssessment = async (unitId, taxYear) => {
  const { data } = await api.get(
    `/taxassessments/unit/${unitId}/year/${taxYear}/has-appeals`
  );
  return data?.hasAppeals ?? false;
};