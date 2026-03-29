import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Stub: Get token from localStorage or Zustand store
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Stub: Redirect to login when authentication is implemented
      console.warn('Unauthorized access -> interceptor caught 401');
      // if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
