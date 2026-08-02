import { z } from 'zod';

import {
  budgetCurrencySchema,
  selectableDepartmentSchema,
} from '@/lib/schema/create-project.schema';

export const projectStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']);

const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message).optional().or(z.literal(''));

export const editProjectSchema = z
  .object({
    projectName: z
      .string()
      .trim()
      .min(1, 'Project name is required')
      .max(100, 'Project name must not exceed 100 characters'),

    description: optionalText(
      500,
      'Description must not exceed 500 characters',
    ),

    businessDepartment: selectableDepartmentSchema,
    technicalDepartment: selectableDepartmentSchema,

    monthlyBudget: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine(
        (value) => !value || /^\d+(\.\d{1,2})?$/.test(value),
        'Enter a valid amount, e.g. 1500 or 1500.50',
      ),

    budgetCurrency: budgetCurrencySchema,
    status: projectStatusSchema,

    startDate: optionalText(10, 'Invalid start date'),
    endDate: optionalText(10, 'Invalid end date'),
  })
  .refine(
    (data) =>
      !data.startDate || !data.endDate || data.endDate >= data.startDate,
    {
      message: 'End date must be on or after the start date',
      path: ['endDate'],
    },
  );

export type EditProjectInput = z.infer<typeof editProjectSchema>;
