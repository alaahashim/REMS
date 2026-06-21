import api from "./apiClient";

const BASE = "/assignments";

// ==========================
// Assignments APIs
// ==========================

// جلب كل الربطات
export const getAssignments = async () => {
  const { data } = await api.get(BASE);
  return data;
};

// جلب ربطات شخص
export const getAssignmentByPersonId = async (personId) => {
  const { data } = await api.get(`${BASE}/person/${personId}`);
  return data;
};

// جلب ربط واحد
export const getAssignmentById = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`);
  return data;
};

// إنشاء عدة ربطات
export const createAssignments = async (payload) => {
  const { data } = await api.post(`${BASE}/bulk`, payload);
  return data;
};

// تحديث ربط
export const updateAssignment = async (id, payload) => {
  const { data } = await api.put(`${BASE}/${id}`, payload);
  return data;
};

// حذف ربط
export const deleteAssignment = async (id) => {
  const { data } = await api.delete(`${BASE}/${id}`);
  return data;
};


// ==========================
// Owners APIs (إضافة هنا)
// ==========================

const OWNER_BASE = "/owners";

// جلب كل الملاك + بحث
export const getOwners = async (search = "") => {
  const { data } = await api.get(OWNER_BASE, {
    params: search ? { search } : undefined,
  });
  return data;
};

// جلب مالك واحد
export const getOwnerById = async (id) => {
  const { data } = await api.get(`${OWNER_BASE}/${id}`);
  return data;
};

// إنشاء مالك جديد
export const createOwner = async (payload) => {
  const { data } = await api.post(OWNER_BASE, payload);
  return data;
};

export const getOwnerByNationalId = async (nationalId) => {
  const { data } = await api.get(`/owners/by-national-id/${nationalId}`);
  return data; 
}