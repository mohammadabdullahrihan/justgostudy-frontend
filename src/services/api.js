import axios from 'axios';

// Create a configured Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if available in localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch global API errors, like token expiration
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If the server returns a 401 Unauthorized, we can clear invalid tokens
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Optional: Trigger a redirect or refresh context by emitting a custom event or letting state handle it
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-unauthorized'));
      }
    }

    // Parse user-friendly error message
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'An unexpected error occurred. Please try again.';

    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;

    return Promise.reject(customError);
  }
);

export default API;
