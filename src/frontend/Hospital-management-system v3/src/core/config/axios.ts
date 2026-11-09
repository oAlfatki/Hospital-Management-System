import axios, { AxiosError } from 'axios';
import { ApiError } from '../Errors/ApiError';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
  withCredentials: true,
});

interface ErrorBody {
  message?: string;
  title?: string;
  detail?: string;
  response?: string;
  error?: string;
  errors?: Record<string, string[] | string>;
  success?: boolean;
  isSuccess?: boolean;
}
function apiError(data: ErrorBody | string | undefined, status: number): ApiError {
  if (typeof data === 'string') return new ApiError(data, status);
  const fields = data?.errors && Object.fromEntries(Object.entries(data.errors).map(([key, value]) => [key, Array.isArray(value) ? value : [value]]));
  const validation = fields && Object.values(fields).flat().join(' ');
  return new ApiError(validation || data?.detail || data?.message || data?.error || data?.title || data?.response || 'The request failed.', status, undefined, fields);
}
axiosInstance.interceptors.response.use(
  response => {
    if (response.data?.success === false || response.data?.isSuccess === false) throw apiError(response.data, response.status);
    return response;
  },
  (error: AxiosError<ErrorBody | string>) => {
    if (error.response) {
      if (error.response.status === 401 && !error.config?.url?.endsWith('/login')) window.dispatchEvent(new Event('hms:session-expired'));
      return Promise.reject(apiError(error.response.data, error.response.status));
    }
    return Promise.reject(new ApiError(error.code === 'ECONNABORTED' ? 'The server took too long to respond.' : 'Unable to connect to the server.', 0, 'NETWORK_ERROR'));
  },
);
export { axiosInstance as axios };
export default axiosInstance;
