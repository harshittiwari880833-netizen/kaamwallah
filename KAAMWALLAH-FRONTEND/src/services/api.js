import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('kaam_wallah_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Retry logic for safe API calls (GET)
    if (config && config.method === 'get' && (!config.retryCount || config.retryCount < 2)) {
      config.retryCount = (config.retryCount || 0) + 1;
      const delay = new Promise((resolve) => setTimeout(resolve, config.retryCount * 1000));
      await delay;
      return api(config);
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong';

    if (error.response?.status === 401) {
      window.localStorage.removeItem('kaam_wallah_token');
      window.dispatchEvent(new CustomEvent('kaamwallah:unauthorized'));
    }

    // Only show error toasts for real user actions (mutations) or if explicitly requested
    const isGet = config?.method === 'get';
    const forceShowError = config?.showError === true;

    if (!isGet || forceShowError) {
      window.dispatchEvent(
        new CustomEvent('kaamwallah:api-error', {
          detail: {
            message,
            status: error.response?.status ?? 500,
          },
        }),
      );
    }

    return Promise.reject(new Error(message));
  },
);

export default api;
