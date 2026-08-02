import { z } from 'zod';

import { departmentSchema } from '@/lib/schema/edit-profile.schema';

const awsRegionSchema = z
  .string()
  .trim()
  .min(1, 'Default region is required')
  .max(50, 'Default region must not exceed 50 characters')
  .regex(
    /^[a-z]{2}(-gov)?-[a-z]+-\d$/,
    'Enter a valid AWS region, e.g. ap-southeast-1',
  );

export const createAwsAccountSchema = z.object({
  accountName: z
    .string()
    .trim()
    .min(1, 'Account name is required')
    .max(150, 'Account name must not exceed 150 characters'),

  awsAccountId: z
    .string()
    .trim()
    .regex(/^\d{12}$/, 'Enter a valid 12-digit AWS account ID'),

  ownerDepartment: departmentSchema,

  defaultRegion: awsRegionSchema,

  roleArn: z
    .string()
    .trim()
    .max(2048, 'Role ARN must not exceed 2048 characters')
    .refine(
      (value) => !value || /^arn:aws:iam::\d{12}:role\/.+$/.test(value),
      'Role ARN format is invalid',
    )
    .optional()
    .or(z.literal('')),

  isActive: z.boolean().optional(),
});

export type CreateAwsAccountInput = z.infer<typeof createAwsAccountSchema>;
