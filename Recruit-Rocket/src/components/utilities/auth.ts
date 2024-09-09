import axios from 'axios';

let refreshTokenPromise: Promise<string> | null = null;

export const refreshAccessToken = async () => {
  if (refreshTokenPromise) return refreshTokenPromise;

  refreshTokenPromise = new Promise(async (resolve, reject) => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await axios.post('/auth/refresh', { refresh_token: refreshToken });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      resolve(access_token);
    } catch (error) {
      reject(error);
    } finally {
      refreshTokenPromise = null;
    }
  });

  return refreshTokenPromise;
};

export const setupAxiosInterceptors = (axiosInstance: any) => {
  axiosInstance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const access_token = await refreshAccessToken();
          originalRequest.headers['Authorization'] = 'Bearer ' + access_token;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh token is invalid, logout the user
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};