'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pen } from 'lucide-react';

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

import { updateAwsAccountAction } from '@/lib/action/aws-account.action';
import type { AwsAccountResponse } from '@/lib/api/api-type';
import { departments } from '@/lib/constants/department';
import {
  type EditAwsAccountInput,
  editAwsAccountSchema,
} from '@/lib/schema/edit-aws-account.schema';

type EditAwsAccountFormProps = {
  account: AwsAccountResponse;
};

export default function EditAwsAccountForm({
  account,
}: EditAwsAccountFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: EditAwsAccountInput = {
    accountName: account.accountName,
    awsAccountId: account.awsAccountId,
    ownerDepartment: account.ownerDepartment,
    defaultRegion: account.defaultRegion,
    roleArn: account.roleArn ?? '',
    isActive: account.isActive,
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<EditAwsAccountInput>({
    resolver: zodResolver(editAwsAccountSchema),
    defaultValues,
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    clearErrors();

    if (nextOpen) {
      reset(defaultValues);
    }
  };

  const onSubmit = async (data: EditAwsAccountInput) => {
    setIsSubmitting(true);
    clearErrors('root');

    try {
      const result = await updateAwsAccountAction(account.id, data);

      if (!result.success) {
        if (result.status === 409) {
          setError('awsAccountId', {
            type: 'server',
            message: result.message,
          });
        } else {
          setError('root', {
            type: 'server',
            message: result.message,
          });
        }

        return;
      }

      handleOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary"
          >
            <Pen className="size-4" />
            Edit AWS Account
          </button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit AWS Account</DialogTitle>

            <DialogDescription>
              Review and update the AWS account details.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="mt-4">
            <Field data-invalid={!!errors.accountName}>
              <FieldLabel htmlFor={`accountName-${account.id}`}>
                Account Name
              </FieldLabel>

              <Input
                id={`accountName-${account.id}`}
                placeholder="e.g. Production"
                aria-invalid={!!errors.accountName}
                {...register('accountName')}
              />

              {errors.accountName && (
                <FieldError
                  errors={[{ message: errors.accountName.message }]}
                />
              )}
            </Field>

            <Field data-invalid={!!errors.awsAccountId}>
              <FieldLabel htmlFor={`awsAccountId-${account.id}`}>
                AWS Account ID
              </FieldLabel>

              <Input
                id={`awsAccountId-${account.id}`}
                inputMode="numeric"
                placeholder="e.g. 123456789012"
                aria-invalid={!!errors.awsAccountId}
                {...register('awsAccountId')}
              />

              {errors.awsAccountId && (
                <FieldError
                  errors={[{ message: errors.awsAccountId.message }]}
                />
              )}
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.ownerDepartment}>
                <FieldLabel>Owner Department</FieldLabel>

                <Controller
                  control={control}
                  name="ownerDepartment"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(value) => {
                        if (value) {
                          field.onChange(value);
                        }
                      }}
                    >
                      <SelectTrigger
                        className="w-full"
                        aria-invalid={!!errors.ownerDepartment}
                      >
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>

                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem
                            key={department.value}
                            value={department.value}
                          >
                            {department.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                {errors.ownerDepartment && (
                  <FieldError
                    errors={[
                      {
                        message: errors.ownerDepartment.message,
                      },
                    ]}
                  />
                )}
              </Field>

              <Field data-invalid={!!errors.defaultRegion}>
                <FieldLabel htmlFor={`defaultRegion-${account.id}`}>
                  Default Region
                </FieldLabel>

                <Input
                  id={`defaultRegion-${account.id}`}
                  placeholder="e.g. ap-southeast-1"
                  aria-invalid={!!errors.defaultRegion}
                  {...register('defaultRegion')}
                />

                {errors.defaultRegion && (
                  <FieldError
                    errors={[
                      {
                        message: errors.defaultRegion.message,
                      },
                    ]}
                  />
                )}
              </Field>
            </div>

            <Field data-invalid={!!errors.roleArn}>
              <FieldLabel htmlFor={`roleArn-${account.id}`}>
                Role ARN
              </FieldLabel>

              <Input
                id={`roleArn-${account.id}`}
                placeholder="arn:aws:iam::123456789012:role/CRGPReadOnlyRole"
                aria-invalid={!!errors.roleArn}
                {...register('roleArn')}
              />

              {errors.roleArn && (
                <FieldError errors={[{ message: errors.roleArn.message }]} />
              )}
            </Field>
          </FieldGroup>

          {errors.root?.message && (
            <p className="mt-4 text-sm text-destructive">
              {errors.root.message}
            </p>
          )}

          <DialogFooter className="mt-6">
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              }
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
