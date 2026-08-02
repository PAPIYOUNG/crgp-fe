import { EditPassword, EditProfile } from '@/lib/api/api-type';
import { authFetch } from '@/lib/api/auth-fetch';

export const userApi = {
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
