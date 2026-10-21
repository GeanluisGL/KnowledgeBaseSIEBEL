import axios from "axios";
import { clearToken, getToken } from "../utils/storage";

export const UNAUTHORIZED_EVENT = "auth:unauthorized";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !error.config?.url?.includes("/api/auth/login")
    ) {
      clearToken();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  }
);

export default api;
