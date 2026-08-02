'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { departments } from '@/lib/constants/department';
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
  CreateAwsAccountInput,
  createAwsAccountSchema,
} from '@/lib/schema/create-aws-account.schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createAwsAccountAction } from '@/lib/action/aws-account.action';

const defaultValues: CreateAwsAccountInput = {
  accountName: '',
  awsAccountId: '',
  ownerDepartment: undefined as never,
  defaultRegion: 'ap-southeast-1',
  roleArn: '',
  isActive: true,
};

export default function CreateAwsAccountForm({
  variant = 'button',
}: {
  variant?: 'button' | 'tile';
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
    clearErrors,
  } = useForm<CreateAwsAccountInput>({
    resolver: zodResolver(createAwsAccountSchema),
    defaultValues,
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    clearErrors();

    if (!nextOpen) {
      reset(defaultValues);
    }
  };

  const onSubmit = async (data: CreateAwsAccountInput) => {
    setIsSubmitting(true);

    try {
      const result = await createAwsAccountAction(data);

      if (!result.success) {
        if (result.code === 'AWS_ACCOUNT_ALREADY_EXISTS') {
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
          variant === 'tile' ? (
            <button
              type="button"
              className="flex h-full min-h-64 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-center transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Plus className="size-5" />
              </span>
              <span className="font-semibold text-foreground">
                Create AWS Account
              </span>
              <span className="text-sm text-muted-foreground">
                Add another account to CRGP
              </span>
            </button>
          ) : (
            <Button>
              <Plus />
              Create AWS Account
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create AWS Account</DialogTitle>
            <DialogDescription>
              Account Name and AWS Account ID are required.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="mt-4">
            <Field data-invalid={!!errors.accountName}>
              <FieldLabel htmlFor="accountName">
                Account Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="accountName"
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
              <FieldLabel htmlFor="awsAccountId">
                AWS Account ID <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="awsAccountId"
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
                <FieldLabel htmlFor="ownerDepartment">
                  Owner Department <span className="text-destructive">*</span>
                </FieldLabel>

                <Controller
                  control={control}
                  name="ownerDepartment"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="ownerDepartment"
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
                    errors={[{ message: 'Owner department is required' }]}
                  />
                )}
              </Field>

              <Field data-invalid={!!errors.defaultRegion}>
                <FieldLabel htmlFor="defaultRegion">
                  Default Region <span className="text-destructive">*</span>
                </FieldLabel>

                <Input
                  id="defaultRegion"
                  placeholder="e.g. ap-southeast-1"
                  aria-invalid={!!errors.defaultRegion}
                  {...register('defaultRegion')}
                />

                {errors.defaultRegion && (
                  <FieldError
                    errors={[{ message: errors.defaultRegion.message }]}
                  />
                )}
              </Field>
            </div>
          </FieldGroup>
          {errors.root?.message && (
            <p className="mt-4 text-sm text-destructive">
              {errors.root.message}
            </p>
          )}
          <DialogFooter className="mt-6">
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
