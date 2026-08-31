import {
  EditPassword,
  EditProfile,
  GetAllUsersResponse,
  GetOptionUsersResponse,
} from '@/lib/api/api-type';
import { authFetch } from '@/lib/api/auth-fetch';

export const userApi = {
  async getAllUsers(): Promise<GetAllUsersResponse> {
    return authFetch<GetAllUsersResponse>('/user');
  },

  async getOptionUsers(): Promise<GetOptionUsersResponse> {
    return authFetch<GetOptionUsersResponse>('/user/options');
  },
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return authFetch('/user/avatar', { method: 'PATCH', body: formData });
  },

  async editProfile(input: EditProfile) {
    return authFetch('/user', { method: 'PATCH', body: input });
  },

  async editPassword(input: EditPassword) {
    return authFetch('/user/password', { method: 'PATCH', body: input });
  },
};
