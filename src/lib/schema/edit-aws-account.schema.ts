import { z } from 'zod';

import { departmentSchema } from '@/lib/schema/edit-profile.schema';

const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message).optional().or(z.literal(''));

export const editAwsAccountSchema = z.object({
  awsAccountId: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => !value || /^\d{12}$/.test(value),
      'Enter a valid 12-digit AWS account ID',
    ),

  accountName: optionalText(150, 'Account name must not exceed 150 characters'),

  ownerDepartment: departmentSchema.optional(),

  defaultRegion: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => !value || /^[a-z]{2}(-gov)?-[a-z]+-\d$/.test(value),
      'Enter a valid AWS region, e.g. ap-southeast-1',
    )
    .refine(
      (value) => !value || value.length <= 50,
      'Default region must not exceed 50 characters',
    ),

  roleArn: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => !value || /^arn:aws:iam::\d{12}:role\/.+$/.test(value),
      'Role ARN format is invalid',
    )
    .refine(
      (value) => !value || value.length <= 2048,
      'Role ARN must not exceed 2048 characters',
    ),

  isActive: z.boolean().optional(),
});

export type EditAwsAccountInput = z.infer<typeof editAwsAccountSchema>;
