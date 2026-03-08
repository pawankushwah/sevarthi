import axios from 'axios';

// In production, set VITE_API_URL to your backend URL (e.g. https://sevarthi.onrender.com)
// In development, Vite proxy forwards /api → http://localhost:5000
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  if (localStorage.getItem('demoMode') === 'true') {
    config.headers['X-Demo-Mode'] = 'true';
  }
  
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
