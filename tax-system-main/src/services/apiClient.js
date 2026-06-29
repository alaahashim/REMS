import axios from "axios";

const API_BASE_URL = "http://localhost:5179/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

const attachToken = (config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

const normalizeBackendError = (error) => {
  const response = error?.response;
  const data = response?.data;

  const normalized = {
    status: response?.status || 0,
    message: "Unexpected API error",
    errors: [],
    traceId: data?.traceId || null,
    raw: data || null,
  };

  if (!response) {
    normalized.message = error?.message || "Unable to connect to the API.";
    return normalized;
  }

  if (data?.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
    normalized.errors = Object.entries(data.errors).flatMap(([field, messages]) => {
      if (Array.isArray(messages)) {
        return messages.map((message) => `${field}: ${message}`);
      }

      return messages ? [`${field}: ${messages}`] : [];
    });

    normalized.message =
      data?.message ||
      data?.Message ||
      data?.title ||
      data?.Title ||
      "Validation failed";

    return normalized;
  }

  if (Array.isArray(data?.errors) || Array.isArray(data?.Errors)) {
    normalized.message =
      data?.message ||
      data?.Message ||
      data?.title ||
      data?.Title ||
      "Validation failed";
    normalized.errors = data?.errors || data?.Errors || [];
    return normalized;
  }

  normalized.message =
    data?.message ||
    data?.Message ||
    data?.title ||
    data?.Title ||
    error?.message ||
    "Unexpected API error";

  return normalized;
};

const handleResponseError = (error) => {
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
    localStorage.removeItem("tax_current_user");

    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  return Promise.reject(normalizedError);
};

api.interceptors.request.use(attachToken);
axios.interceptors.request.use(attachToken);

api.interceptors.response.use((response) => response, handleResponseError);
axios.interceptors.response.use((response) => response, handleResponseError);

export { API_BASE_URL };
export default api;
