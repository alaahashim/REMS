import api from "./apiClient";

const BASE = "/exemptions";
// ============================================================
// خدمة طلبات الإعفاء (Exemptions)
// كل دالة هنا تقابل Endpoint مطابق في ExemptionsController
// ============================================================

// GET /api/exemptions  -> قائمة كل طلبات الإعفاء (ExemptionDto[])
export const getExemptions = async () => {
  const { data } = await api.get('/exemptions');
  return data;
};
//*********************************************************************** */
export const getExemptionsForHome = async () => {
  const { data } = await api.get('/exemptions/home');
  return data;
};

// GET /api/exemptions/{id} -> تفاصيل طلب إعفاء واحد (ExemptionDetailsDto)
export const getExemptionById = async (id) => {
  const { data } = await api.get(`/exemptions/${id}`);
  return data;
};

// تحويل بيانات الفورم (+ الملف إن وُجد) إلى FormData
// ملاحظة مهمة: الـ Controller الآن يستقبل [FromForm] وليس [FromBody]،
// لذلك يجب إرسال البيانات كـ multipart/form-data وليس JSON، حتى يتوافق مع الملف المرفق.
const buildExemptionFormData = (payload) => {
  const fd = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === 'file') return;
    if (value === null || value === undefined || value === '') return;
    fd.append(key, value);
  });

  if (payload.file) {
    fd.append('file', payload.file);
  }

  return fd;
};

// POST /api/exemptions -> إنشاء طلب إعفاء جديد
// payload: { OwnerId, UnitId, UnitNumber, ExemptionType, ExemptionDate, ExemptionStartDate,
//            ExemptionEndDate, LegalReference, ExemptionReason, InspectionResult, Notes, file }
// POST /api/exemptions -> إنشاء طلب إعفاء جديد
export const createExemption = async (payload) => {
  const fd = buildExemptionFormData(payload);
  const { data } = await api.post('/exemptions', fd);
  return data;
};

// PUT /api/exemptions/{id} -> تعديل طلب إعفاء
export const updateExemption = async (id, payload) => {
  const fd = buildExemptionFormData(payload);
  const { data } = await api.put(`/exemptions/${id}`, fd);
  return data;
};

// DELETE /api/exemptions/{id}
export const deleteExemption = async (id) => {
  const { data } = await api.delete(`/exemptions/${id}`);
  return data;
};