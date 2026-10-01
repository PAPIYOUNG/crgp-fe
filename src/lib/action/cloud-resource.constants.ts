import { CreateCloudResourceRequest } from '@/lib/api/api-type';

// ฟอร์มยังใช้ค่า Environment แบบเดิม (PRODUCTION) แต่ backend อ้างอิง Prisma enum (PROD)
export const ENVIRONMENT_TO_BACKEND: Record<
  string,
  CreateCloudResourceRequest['environment']
> = {
  DEV: 'DEV',
  UAT: 'UAT',
  STAGING: 'STAGING',
  PRODUCTION: 'PROD',
};

// ผกผันของ ENVIRONMENT_TO_BACKEND ไว้ตั้งค่าเริ่มต้นของฟอร์มแก้ไข
export const ENVIRONMENT_FROM_BACKEND: Record<string, string> = {
  DEV: 'DEV',
  UAT: 'UAT',
  STAGING: 'STAGING',
  PROD: 'PRODUCTION',
};

export type UpdateResourceManualInput = {
  projectId: string | null;
  environment: string | null;
  description: string | null;
};
