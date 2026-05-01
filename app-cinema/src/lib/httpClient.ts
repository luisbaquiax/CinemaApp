// lib/httpClient.ts
import axios from "axios";

const createClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((config) => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Interceptor de respuesta: si 401, limpiar sesión
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("auth");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const authClient   = createClient(import.meta.env.VITE_MS_AUTH_URL);
export const cinemaClient = createClient(import.meta.env.VITE_MS_CINEMA_URL);
export const adsClient    = createClient(import.meta.env.VITE_MS_ADS_URL);