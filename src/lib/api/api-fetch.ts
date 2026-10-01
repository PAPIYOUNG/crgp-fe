import { ApiError } from '@/lib/api/api-error';

export type ApiFetchOption = Omit<RequestInit, 'body'> & {
  body?: Record<string, unknown> | FormData;
  token?: string;
};
//RequestInit >> Typescript for fetch
//body fix string instead send JSON.stringify(...) every time

const API_URL = process.env.API_URL ?? 'http://localhost:8000';

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOption = {},
): Promise<T> {
  const { body, headers, token, ...init } = options;

  console.log('API_URL:', API_URL);
  console.log('Fetching:', `${API_URL}${path}`);
  // console.log('Method:', init.method);
  // console.log('Body:', body);

  const newHeaders = new Headers(headers); //Headers object
  if (token) {
    newHeaders.set('Authorization', `Bearer ${token}`);
  }

  if (body !== undefined && !(body instanceof FormData)) {
    newHeaders.set('content-type', 'application/json');
  }
  console.log('body', body);

  let newBody = undefined;
  if (!(body instanceof FormData)) {
    newBody = JSON.stringify(body);
  } else {
    newBody = body;
  }
  console.log('jsssssss');
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    body: newBody,
    headers: newHeaders,
  });
  console.log('response', response);
  //class ApiError (api-error.ts)
  if (!response.ok) {
    const errorBody = await response.json();
    console.log('OK');
    throw new ApiError(response.status, errorBody.message, errorBody.code);
  }
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}
