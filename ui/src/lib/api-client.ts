import { env } from "@/env.mjs";
import axios from "axios";

const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_BACKEND_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptors for auth
// apiClient.interceptors.request.use(
//   (config) => {
//     // Example: attach token
//     const token = localStorage.getItem("token");
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

export default apiClient;
