'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  formatBudgetDisplay,
  parseBudgetInput,
} from '@/lib/utils/budget-input';
import { CreateResourceManual } from '@/lib/action/cloud-resource.action';

const providerOptions = [
  { value: 'AWS', label: 'AWS' },
  { value: 'AZURE', label: 'Azure' },
  { value: 'GCP', label: 'Google Cloud' },
  { value: 'ON_PREM', label: 'On-Premises' },
  { value: 'OTHER', label: 'Other' },
] as const;

const serviceOptions = [
  { value: 'EC2', label: 'EC2' },
  { value: 'RDS', label: 'RDS' },
  { value: 'S3', label: 'S3' },
  { value: 'LAMBDA', label: 'Lambda' },
  { value: 'EKS', label: 'EKS' },
  { value: 'CLOUDFRONT', label: 'CloudFront' },
  { value: 'OTHER', label: 'Other' },
] as const;

const regionOptions = [
  { value: 'us-east-1', label: 'us-east-1' },
  { value: 'us-west-2', label: 'us-west-2' },
  { value: 'ap-southeast-1', label: 'ap-southeast-1' },
  { value: 'global', label: 'global' },
] as const;

const projectOptions = [
  { value: 'ml-training-cluster', label: 'ML Training Cluster' },
  { value: 'production-infrastructure', label: 'Production Infrastructure' },
  { value: 'data-analytics-pipeline', label: 'Data Analytics Pipeline' },
  { value: 'customer-portal-backend', label: 'Customer Portal Backend' },
  { value: 'dev-staging-environment', label: 'Dev / Staging Environment' },
] as const;

const environmentOptions = [
  { value: 'DEV', label: 'Development' },
  { value: 'UAT', label: 'UAT' },
  { value: 'STAGING', label: 'Staging' },
  { value: 'PRODUCTION', label: 'Production' },
] as const;

const statusOptions = [
  { value: 'RUNNING', label: 'Running' },
  { value: 'STOPPED', label: 'Stopped' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'TERMINATED', label: 'Terminated' },
] as const;

const selectableOption = <T extends string>(
  values: readonly T[],
  message: string,
) =>
  z
    .union([z.enum(values as unknown as [T, ...T[]]), z.literal('')])
    .refine((value) => value !== '', { message });

const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message).optional().or(z.literal(''));

const cloudResourceSchema = z
  .object({
    provider: selectableOption(
      providerOptions.map((option) => option.value),
      'Provider is required',
    ),

    // จำเป็นเฉพาะตอน provider เป็น AWS เท่านั้น ตรวจสอบเพิ่มด้านล่างด้วย superRefine
    awsAccountId: z.string().optional().or(z.literal('')),

    resourceName: z
      .string()
      .trim()
      .min(1, 'Resource name is required')
      .max(100, 'Resource name must not exceed 100 characters'),

    service: selectableOption(
      serviceOptions.map((option) => option.value),
      'Service is required',
    ),

    instanceType: optionalText(100, 'Type must not exceed 100 characters'),

    // Region เป็น dropdown ของ AWS เมื่อ provider เป็น AWS และเป็น free text เมื่อไม่ใช่
    region: z
      .string()
      .trim()
      .min(1, 'Region is required')
      .max(50, 'Region must not exceed 50 characters'),

    projectId: z
      .union([
        z.enum(
          projectOptions.map((option) => option.value) as [
            string,
            ...string[],
          ],
        ),
        z.literal(''),
      ])
      .optional()
      .or(z.literal('')),

    environment: z
      .union([z.enum(['DEV', 'UAT', 'STAGING', 'PRODUCTION']), z.literal('')])
      .optional()
      .or(z.literal('')),

    status: z
      .union([
        z.enum(['RUNNING', 'STOPPED', 'PENDING', 'TERMINATED']),
        z.literal(''),
      ])
      .optional()
      .or(z.literal('')),

    monthlyCost: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine(
        (value) => !value || /^\d+(\.\d{1,2})?$/.test(value),
        'Enter a valid amount, e.g. 145.90',
      ),

    description: optionalText(
      500,
      'Description must not exceed 500 characters',
    ),
  })
  .superRefine((data, ctx) => {
    if (data.provider === 'AWS' && !data.awsAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select an AWS account',
        path: ['awsAccountId'],
      });
    }
  });

export type CloudResourceInput = z.infer<typeof cloudResourceSchema>;

const defaultValues: CloudResourceInput = {
  provider: 'AWS',
  awsAccountId: '',
  resourceName: '',
  service: '' as CloudResourceInput['service'],
  instanceType: '',
  region: '',
  projectId: '',
  environment: '',
  status: 'RUNNING',
  monthlyCost: '',
  description: '',
};

type AwsAccountOption = {
  id: string;
  awsAccountId: string;
  accountName: string;
};

type CloudResourceFormProps = {
  awsAccounts: AwsAccountOption[];
};

export default function CloudResourceForm({
  awsAccounts,
}: CloudResourceFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CloudResourceInput>({
    resolver: zodResolver(cloudResourceSchema),
    defaultValues,
  });

  const provider = watch('provider');
  const isAwsProvider = provider === 'AWS';

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset(defaultValues);
    }
  };

  const onSubmit = async (data: CloudResourceInput) => {
    setIsSubmitting(true);

    try {
      const result = await CreateResourceManual(data);

      if (!result.success) {
        toast.error('Failed to add resource', {
          description: result.message,
        });

        return;
      }

      toast.success('Cloud resource added');
      handleOpenChange(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <Plus />
            Add Resource
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Cloud Resource</DialogTitle>
            <DialogDescription>
              Provider, Resource Name, Service and Region are required. AWS
              Account is required only when Provider is AWS.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="mt-4">
            <Field data-invalid={!!errors.provider}>
              <FieldLabel htmlFor="provider">
                Provider <span className="text-destructive">*</span>
              </FieldLabel>
              <Controller
                control={control}
                name="provider"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);

                      if (value !== 'AWS') {
                        setValue('awsAccountId', '');
                      }
                    }}
                  >
                    <SelectTrigger
                      id="provider"
                      className="w-full"
                      aria-invalid={!!errors.provider}
                    >
                      <SelectValue placeholder="Select provider">
                        {(value: string) =>
                          value
                            ? (providerOptions.find(
                                (option) => option.value === value,
                              )?.label ?? value)
                            : 'Select provider'
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {providerOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.provider && (
                <FieldError errors={[{ message: errors.provider.message }]} />
              )}
            </Field>

            {isAwsProvider && (
              <Field data-invalid={!!errors.awsAccountId}>
                <FieldLabel htmlFor="awsAccountId">
                  AWS Account <span className="text-destructive">*</span>
                </FieldLabel>
                <Controller
                  control={control}
                  name="awsAccountId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="awsAccountId"
                        className="w-full"
                        aria-invalid={!!errors.awsAccountId}
                      >
                        <SelectValue placeholder="Select AWS account">
                          {(value: string) =>
                            value
                              ? (awsAccounts.find(
                                  (account) => account.id === value,
                                )?.accountName ?? value)
                              : 'Select AWS account'
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {awsAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.accountName} ({account.awsAccountId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.awsAccountId && (
                  <FieldError
                    errors={[{ message: errors.awsAccountId.message }]}
                  />
                )}
              </Field>
            )}

            <Field data-invalid={!!errors.resourceName}>
              <FieldLabel htmlFor="resourceName">
                Resource Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="resourceName"
                placeholder="e.g. prod-web-server-01"
                aria-invalid={!!errors.resourceName}
                {...register('resourceName')}
              />
              {errors.resourceName && (
                <FieldError
                  errors={[{ message: errors.resourceName.message }]}
                />
              )}
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.service}>
                <FieldLabel htmlFor="service">
                  Service <span className="text-destructive">*</span>
                </FieldLabel>
                <Controller
                  control={control}
                  name="service"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="service"
                        className="w-full"
                        aria-invalid={!!errors.service}
                      >
                        <SelectValue placeholder="Select service">
                          {(value: string) =>
                            value
                              ? (serviceOptions.find(
                                  (option) => option.value === value,
                                )?.label ?? value)
                              : 'Select service'
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {serviceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.service && (
                  <FieldError errors={[{ message: errors.service.message }]} />
                )}
              </Field>

              <Field data-invalid={!!errors.instanceType}>
                <FieldLabel htmlFor="instanceType">Type</FieldLabel>
                <Input
                  id="instanceType"
                  placeholder="e.g. p3.8xlarge"
                  aria-invalid={!!errors.instanceType}
                  {...register('instanceType')}
                />
                {errors.instanceType && (
                  <FieldError
                    errors={[{ message: errors.instanceType.message }]}
                  />
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.region}>
                <FieldLabel htmlFor="region">
                  Region <span className="text-destructive">*</span>
                </FieldLabel>
                {isAwsProvider ? (
                  <Controller
                    control={control}
                    name="region"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="region"
                          className="w-full"
                          aria-invalid={!!errors.region}
                        >
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {regionOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : (
                  <Input
                    id="region"
                    placeholder="e.g. eastus, europe-west1, dc-1"
                    aria-invalid={!!errors.region}
                    {...register('region')}
                  />
                )}
                {errors.region && (
                  <FieldError errors={[{ message: errors.region.message }]} />
                )}
              </Field>

              <Field data-invalid={!!errors.status}>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue placeholder="Select status">
                          {(value: string) =>
                            value
                              ? (statusOptions.find(
                                  (option) => option.value === value,
                                )?.label ?? value)
                              : 'Select status'
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.projectId}>
                <FieldLabel htmlFor="projectId">Project</FieldLabel>
                <Controller
                  control={control}
                  name="projectId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="projectId" className="w-full">
                        <SelectValue placeholder="Unassigned">
                          {(value: string) =>
                            value
                              ? (projectOptions.find(
                                  (option) => option.value === value,
                                )?.label ?? value)
                              : 'Unassigned'
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {projectOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field data-invalid={!!errors.environment}>
                <FieldLabel htmlFor="environment">Environment</FieldLabel>
                <Controller
                  control={control}
                  name="environment"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="environment" className="w-full">
                        <SelectValue placeholder="Select environment">
                          {(value: string) =>
                            value
                              ? (environmentOptions.find(
                                  (option) => option.value === value,
                                )?.label ?? value)
                              : 'Select environment'
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {environmentOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <Field data-invalid={!!errors.monthlyCost}>
              <FieldLabel htmlFor="monthlyCost">Monthly Cost</FieldLabel>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Controller
                  control={control}
                  name="monthlyCost"
                  render={({ field }) => (
                    <Input
                      id="monthlyCost"
                      inputMode="decimal"
                      placeholder="0.00"
                      className="pl-6"
                      aria-invalid={!!errors.monthlyCost}
                      value={formatBudgetDisplay(field.value)}
                      onChange={(e) =>
                        field.onChange(parseBudgetInput(e.target.value))
                      }
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </div>
              {errors.monthlyCost && (
                <FieldError
                  errors={[{ message: errors.monthlyCost.message }]}
                />
              )}
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Input
                id="description"
                placeholder="Short note about this resource"
                aria-invalid={!!errors.description}
                {...register('description')}
              />
              {errors.description && (
                <FieldError
                  errors={[{ message: errors.description.message }]}
                />
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Resource'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
