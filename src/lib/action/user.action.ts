'use server';

import { ApiError } from '@/lib/api/api-error';
import { EditPassword, EditProfile } from '@/lib/api/api-type';
import { userApi } from '@/lib/api/user.api';
import { signOut, unstable_update } from '@/lib/auth';

import { redirect } from 'next/navigation';

export async function uploadAvatarAction(file: File) {
  try {
    const avatarUrl = await userApi.uploadAvatar(file);
    await unstable_update({ user: { avatarUrl } }); //trigger ให้ jwt callback ใน Authjs ทำงาน เพื่อ update token ใน cookie
    //console.log(url);
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message,
        code: 'API_ERROR',
      };
    }
    throw error;
  }
  redirect('/profile');
}

export async function editProfileAction(input: EditProfile) {
  try {
    await userApi.editProfile(input);

    await unstable_update({
      user: {
        firstName: input.firstName,
        lastName: input.lastName,
        department: input.department,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message,
        code: 'API_ERROR',
      };
    }

    throw error;
  }

  redirect('/profile');
}

export async function editPasswordAction(input: EditPassword) {
  try {
    await userApi.editPassword(input);
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message,
        code: 'API_ERROR',
      };
    }

    throw error;
  }
  await signOut({
    redirect: false,
  });
  redirect('/login');
}
