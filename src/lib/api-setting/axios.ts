import { useAuthStore } from '@/features/auth/store';
import Axios, { AxiosError } from 'axios';

export const api = Axios.create({
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: { code?: string } }>) => {
    const status = error.response?.status;
    const code = error.response?.data?.error?.code;
    const isUnauthenticated = status === 401 || code === 'NO_TOKEN';

    if (isUnauthenticated) {
      useAuthStore.getState().clearSession();
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login'
      ) {
        // Hard navigation, not router.push: this runs outside React's tree
        // (an axios interceptor) and we want a full reset after auth failure.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
