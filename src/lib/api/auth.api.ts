import { apiFetch } from '@/lib/api/api-fetch';
import { LoginResponse } from '@/lib/api/api-type';
import { RegisterRequest } from '@/lib/schema/register.schema';

export type LoginRequest = {
  email: string;
  password: string;
};

export const AuthApi = {
  register(data: RegisterRequest) {
    //void เพราะเราจะไม่ใช้อันที่ nest ส่งกลับมา เราจะสร้างใหม่ทับเอง
    return apiFetch<void>('/auth/register', {
      method: 'POST',
      body: data,
    });
  },

  login(data: LoginRequest) {
    //console.log('AuthApi.login called:', data);
    //return accesstoken,user
    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: data,
    });
  },
};
