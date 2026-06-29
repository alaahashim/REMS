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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const clearSessionAndRedirect = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("tax_current_user");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

const handleResponseError = async (error) => {
  const originalRequest = error.config;
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

  if (normalizedError.status === 401 && !originalRequest._retry) {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      clearSessionAndRedirect();
      return Promise.reject(normalizedError);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        { timeout: 5000 }
      );

      const newToken = response.data.token || response.data.accessToken;
      const newRefreshToken = response.data.refreshToken;

      if (!newToken) throw new Error("No token returned from refresh endpoint");

      localStorage.setItem("token", newToken);
      if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      processQueue(null, newToken);
      isRefreshing = false;

      return api(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      isRefreshing = false;
      clearSessionAndRedirect();
      return Promise.reject(refreshErr);
    }
  }

  return Promise.reject(normalizedError);
};

api.interceptors.request.use(attachToken);
api.interceptors.response.use((response) => response, handleResponseError);

export { API_BASE_URL };
export default api;