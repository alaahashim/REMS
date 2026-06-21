import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5179/api",

  timeout: 15000,
});

// Helper: توحيد شكل الأخطاء القادمة من الباك
const normalizeBackendError = (error) => {
  const response = error?.response;
  const data = response?.data;

  const normalized = {
    status: response?.status || 0,
    message: "حدث خطأ غير متوقع",
    errors: [],
    traceId: data?.traceId || null,
    raw: data || null,
  };

  // لو السيرفر لم يرد أصلًا (network/server down/CORS...)
  if (!response) {
    normalized.message =
      error?.message || "تعذر الاتصال بالخادم. تأكد من تشغيل الـ API";
    return normalized;
  }

  // 1) Validation errors بالشكل المعتاد من ASP.NET
  // {
  //   title: "One or more validation errors occurred.",
  //   status: 400,
  //   errors: { PersonId: ["required"], UnitId: ["invalid"] }
  // }
  if (data?.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
    const allErrors = [];

    Object.entries(data.errors).forEach(([field, messages]) => {
      if (Array.isArray(messages)) {
        messages.forEach((msg) => {
          allErrors.push(`${field}: ${msg}`);
        });
      } else if (messages) {
        allErrors.push(`${field}: ${messages}`);
      }
    });

    normalized.message =
      data?.message ||
      data?.title ||
      "بيانات الإدخال غير صحيحة";
    normalized.errors = allErrors;
    return normalized;
  }

  // 2) لو errors عبارة عن array
  if (Array.isArray(data?.errors)) {
    normalized.message =
      data?.message ||
      data?.title ||
      "حدثت أخطاء في البيانات";
    normalized.errors = data.errors;
    return normalized;
  }

  // 3) Custom exception object من الباك
  normalized.message =
    data?.message ||
    data?.title ||
    error?.message ||
    "حدث خطأ غير متوقع";

  return normalized;
};

// Interceptor للـ responses
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const normalizedError = normalizeBackendError(error);

    // Console logging احترافي وواضح
    console.group("API ERROR");
    console.error("URL:", error?.config?.url);
    console.error("Method:", error?.config?.method?.toUpperCase());
    console.error("Status:", normalizedError.status);
    console.error("Message:", normalizedError.message);
    console.error("Errors:", normalizedError.errors);
    console.error("TraceId:", normalizedError.traceId);
    console.error("Raw Response:", normalizedError.raw);
    console.groupEnd();

    // سلوك خاص ببعض الأكواد
    if (normalizedError.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(normalizedError);
  }
);

export default api;