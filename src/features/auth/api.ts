import { api } from '@/lib/api-setting/axios';
import type { AuthUser } from './store';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await api.post<{ data: LoginResponse }>(
    '/api/auth/login',
    payload
  );
  return res.data.data;
}
