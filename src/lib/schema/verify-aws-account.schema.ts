import z from 'zod';

export const verifyAwsAccountSchema = z.object({
  awsAccountId: z.string().uuid(),

  roleArn: z
    .string()
    .trim()
    .regex(/^arn:aws:iam::\d{12}:role\/.+$/, 'Invalid Role ARN'),
});

export type VerifyAwsAccountInput = z.infer<typeof verifyAwsAccountSchema>;
