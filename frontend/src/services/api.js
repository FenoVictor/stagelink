import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  timeout: 120000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const RETRYABLE_STATUS = [502, 503, 504];
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 5000;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config || {};
    const retryCount = (config.retryCount || 0) + 1;
    const method = (config.method || "get").toUpperCase();
    const retryable =
      retryCount <= MAX_RETRIES &&
      error.code !== "ECANCELED" &&
      method === "get" &&
      (error.code === "ECONNABORTED" ||
        !error.response ||
        RETRYABLE_STATUS.includes(error.response.status));

    if (retryable) {
      config.retryCount = retryCount;
      const delay = RETRY_DELAY_MS * retryCount;
      return new Promise((resolve) => setTimeout(() => resolve(api(config)), delay));
    }

    if (!error.response) {
      toast.error("Impossible de contacter le serveur. Réessayez plus tard.");
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(error) {
  if (!error.response) return "Impossible de contacter le serveur. Réessayez plus tard.";
  if (error.response?.status === 429) return "Trop de tentatives. Réessayez dans 60 secondes.";
  return error.response?.data?.message || "Une erreur est survenue.";
}

export default api;
