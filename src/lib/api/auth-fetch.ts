import { apiFetch, ApiFetchOption } from '@/lib/api/api-fetch';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

//Omit<ApiFetchOption,'token'> ไม่เอา token type เพราะ เราไม่ใส่ไป ค่อยมาดึงจาก session ตรงนี้

export async function authFetch<T>(
  path: string,
  option: Omit<ApiFetchOption, 'token'> = {},
): Promise<T> {
  const session = await auth(); //ดึง Token จาก Session
  if (!session?.user?.access_token) {
    redirect('/login');
  }

  const access_token = session.user.access_token;
  return apiFetch(path, { ...option, token: access_token });
}
