import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept request to attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('trippilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept response to normalize errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: error.message || 'Unable to connect to TripPilot travel server.',
    };
    return Promise.reject(customError);
  }
);

export default api;
