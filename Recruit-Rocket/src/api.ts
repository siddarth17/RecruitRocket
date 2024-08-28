import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/',  // Note the trailing slash
  withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
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

// Add a response interceptor to handle redirects
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 307) {
      const originalRequest = error.config;
      originalRequest.url = error.response.headers.location;
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;