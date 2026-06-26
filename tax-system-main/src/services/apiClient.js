// src/services/apiClient.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5179/api",
  timeout: 15000,
});

// إضافة التوكن تلقائياً إن وجد
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

  // Network / CORS / API down
  if (!response) {
    normalized.message =
      error?.message || "تعذر الاتصال بالخادم. تأكد من تشغيل الـ API";
    return normalized;
  }

  // ASP.NET validation format
  if (data?.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
    const allErrors = [];

    Object.entries(data.errors).forEach(([field, messages]) => {
      if (Array.isArray(messages)) {
        messages.forEach((msg) => allErrors.push(`${field}: ${msg}`));
      } else if (messages) {
        allErrors.push(`${field}: ${messages}`);
      }
    });

    normalized.message =
      data?.message ||
      data?.Message ||
      data?.title ||
      data?.Title ||
      "بيانات الإدخال غير صحيحة";

    normalized.errors = allErrors;
    return normalized;
  }

  // errors array
  if (Array.isArray(data?.errors) || Array.isArray(data?.Errors)) {
    normalized.message =
      data?.message ||
      data?.Message ||
      data?.title ||
      data?.Title ||
      "حدثت أخطاء في البيانات";

    normalized.errors = data?.errors || data?.Errors || [];
    return normalized;
  }

  // custom backend exception
  normalized.message =
    data?.message ||
    data?.Message ||
    data?.title ||
    data?.Title ||
    error?.message ||
    "حدث خطأ غير متوقع";

  return normalized;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError = normalizeBackendError(error);

    console.group("API ERROR");
    console.error("URL:", error?.config?.url);
    console.error("Method:", error?.config?.method?.toUpperCase());
    console.error("Status:", normalizedError.status);
    console.error("Message:", normalizedError.message);
    console.error("Errors:", normalizedError.errors);
    console.error("TraceId:", normalizedError.traceId);
    console.error("Raw Response:", normalizedError.raw);
    console.groupEnd();

    if (normalizedError.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(normalizedError);
  }
);

export default api;