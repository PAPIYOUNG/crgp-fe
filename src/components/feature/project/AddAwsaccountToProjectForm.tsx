'use client';

import { useState } from 'react';
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { AwsAccountResponse } from '@/lib/api/api-type';
import { addAwsAccountToProjectAction } from '@/lib/action/project-awsaccount.action';

type AddAwsAccountToProjectFormProps = {
  projectId: string;
  awsAccounts: AwsAccountResponse[];
  linkedAwsAccountIds?: string[];
};

export default function AddAwsAccountToProjectForm({
  projectId,
  awsAccounts,
  linkedAwsAccountIds = [],
}: AddAwsAccountToProjectFormProps) {
  const [open, setOpen] = useState(false);
  const [selectedAwsAccountId, setSelectedAwsAccountId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableAwsAccounts = awsAccounts.filter(
    (account) => !linkedAwsAccountIds.includes(account.id),
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    setErrorMessage(null);

    if (!nextOpen) {
      setSelectedAwsAccountId('');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedAwsAccountId) {
      setErrorMessage('Please select an AWS account.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await addAwsAccountToProjectAction(projectId, {
        awsAccountId: selectedAwsAccountId,
      });

      if (!result.success) {
        setErrorMessage(result.message);
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
          <Button type="button">
            <Plus />
            Add AWS Account
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add AWS Account</DialogTitle>

            <DialogDescription>
              Select an existing AWS account to link to this project.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="mt-5">
            <Field data-invalid={!!errorMessage}>
              <FieldLabel>
                AWS Account <span className="text-destructive">*</span>
              </FieldLabel>

              <Select
                value={selectedAwsAccountId}
                onValueChange={(value) => {
                  setSelectedAwsAccountId(value ?? '');
                  setErrorMessage(null);
                }}
              >
                <SelectTrigger className="w-full" aria-invalid={!!errorMessage}>
                  <SelectValue placeholder="Select AWS account" />
                </SelectTrigger>

                <SelectContent>
                  {availableAwsAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountName} ({account.awsAccountId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errorMessage && (
                <FieldError errors={[{ message: errorMessage }]} />
              )}

              {availableAwsAccounts.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  All available AWS accounts are already linked to this project.
                </p>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              }
            />

            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !selectedAwsAccountId ||
                availableAwsAccounts.length === 0
              }
            >
              {isSubmitting ? 'Adding...' : 'Add Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
