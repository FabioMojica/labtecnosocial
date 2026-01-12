import axios from "axios";
import { authManager } from "../../utils/authManager";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, 
  withCredentials: true,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config; 
});
 

axiosInstance.interceptors.response.use(
  response => response,
  error => { 
    if (error.code === 'ECONNABORTED') {
      console.error("La petición tardó demasiado y se abortó");
    }

    const message = error.response?.data?.message;

    if (message === 'Sesión expirada por cambios en el perfil. Por favor vuelve a iniciar sesión.') {
      authManager.logout(true, 'profileChanged');
    }

    return Promise.reject(error);
  }
);
