import api from "./apiClient";

// =========================================
// Appeals
// =========================================

export const getAppeals = async (params = {}) => {
  const response = await api.get("/appeals", { params });
  return response.data;
};

export const getAppealById = async (id) => {
  const response = await api.get(`/appeals/${id}`);
  return response.data;
};

export const createAppeal = async (payload) => {
  const response = await api.post("/appeals", payload);
  return response.data;
};

export const updateAppeal = async (id, payload) => {
  const response = await api.put(`/appeals/${id}`, payload);
  return response.data;
};

export const deleteAppeal = async (id, removeAppealFee = false) => {
  const response = await api.delete(`/appeals/${id}`, {
    params: { removeAppealFee }
  });
  return response.data;
};

// =========================================
// Search Approved Assessments for Appeals
// =========================================

export const searchAssessmentsForAppeal = async ({
  search = "",
  taxYear = "",
  pageNumber = 1,
  pageSize = 8
} = {}) => {
  const response = await api.get("/appeals/assessment-lookup", {
    params: {
      search: search || undefined,
      taxYear: taxYear || undefined,
      pageNumber,
      pageSize
    }
  });
  return response.data;
};