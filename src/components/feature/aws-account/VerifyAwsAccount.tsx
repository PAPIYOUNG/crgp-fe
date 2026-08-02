'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
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
import {
  createAwsAccountAction,
  verifyAwsAccountAction,
} from '@/lib/action/aws-account.action';
import { AwsAccountResponse } from '@/lib/api/api-type';
import {
  VerifyAwsAccountInput,
  verifyAwsAccountSchema,
} from '@/lib/schema/verify-aws-account.schema';

type VerifyAwsAccountProps = {
  accounts: AwsAccountResponse[];
  variant?: 'button' | 'tile';
};

export default function VerifyAwsAccount({
  accounts,
  variant = 'button',
}: VerifyAwsAccountProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<AwsAccountResponse | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
    clearErrors,
  } = useForm<VerifyAwsAccountInput>({
    resolver: zodResolver(verifyAwsAccountSchema),
    defaultValues: {
      awsAccountId: '',
      roleArn: '',
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    clearErrors();

    if (!nextOpen) {
      reset({ roleArn: '' });
    }
  };

  const onSubmit = async (data: VerifyAwsAccountInput) => {
    setIsSubmitting(true);

    try {
      const result = await verifyAwsAccountAction(data);

      if (!result.success) {
        setError('root', {
          type: 'server',
          message: result.message,
        });
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
                Verify AWS Account
              </span>
              <span className="text-sm text-muted-foreground">
                Verify an AWS account before syncing.
              </span>
            </button>
          ) : (
            <Button>
              <Plus />
              Verify AWS Account
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Verify AWS Account</DialogTitle>
            <DialogDescription>
              Please enter the role ARN to verify the AWS account.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="mt-4">
            <Field data-invalid={!!errors.awsAccountId}>
              <FieldLabel>
                AWS Account <span className="text-destructive">*</span>
              </FieldLabel>

              <Select
                value={selectedAccount?.id ?? ''}
                onValueChange={(id) => {
                  if (!id) {
                    setSelectedAccount(null);

                    setValue('awsAccountId', '', {
                      shouldValidate: true,
                      shouldDirty: true,
                    });

                    setValue('roleArn', '');
                    return;
                  }
                  const account =
                    accounts.find((item) => item.id === id) ?? null;

                  setSelectedAccount(account);

                  setValue('awsAccountId', id, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });

                  setValue('roleArn', account?.roleArn ?? '', {
                    shouldValidate: false,
                    shouldDirty: false,
                  });

                  clearErrors('awsAccountId');
                }}
              >
                <SelectTrigger
                  className="w-full"
                  aria-invalid={!!errors.awsAccountId}
                >
                  <SelectValue placeholder="Select AWS Account" />
                </SelectTrigger>

                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountName} ({account.awsAccountId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.awsAccountId?.message && (
                <p className="text-xs text-destructive">
                  {errors.awsAccountId.message}
                </p>
              )}
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="ownerDepartment">
                  Owner Department
                </FieldLabel>
                <Input
                  value={selectedAccount?.ownerDepartment ?? ''}
                  readOnly
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="defaultRegion">Default Region</FieldLabel>
                <Input value={selectedAccount?.defaultRegion ?? ''} readOnly />
              </Field>

              <Field data-invalid={!!errors.roleArn}>
                <FieldLabel htmlFor="roleArn">
                  Role Arn <span className="text-destructive">*</span>
                </FieldLabel>

                <Input
                  id="roleArn"
                  placeholder="e.g. arn:aws:iam::123456789012:role/MyRole"
                  aria-invalid={!!errors.roleArn}
                  {...register('roleArn')}
                />
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
              {isSubmitting ? 'Verifying...' : 'Verify Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
