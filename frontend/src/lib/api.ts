import axios from 'axios';

const dashboardApiUrl = process.env.NEXT_PUBLIC_DASHBOARD_API_URL;

if (!dashboardApiUrl) {
  throw new Error('Missing NEXT_PUBLIC_DASHBOARD_API_URL for frontend API client.');
}

export const api = axios.create({
  baseURL: dashboardApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
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
      console.warn('Unauthorized access -> interceptor caught 401');
    }
    return Promise.reject(error);
  }
);
