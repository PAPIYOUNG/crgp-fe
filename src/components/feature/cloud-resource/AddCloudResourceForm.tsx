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
import {
  addResourceToProjectAction,
  getAvailableResourcesAction,
} from '@/lib/action/project-resource.action';

type AwsAccountItem = {
  id: string;
  awsAccountId: string;
  accountName: string;
  defaultRegion: string;
};

type CloudResourceItem = {
  id: string;
  resourceName: string | null;
  resourceIdentifier: string;
  resourceType: string;
};
type AddCloudResourceFormProps = {
  projectId: string;
  awsAccounts: AwsAccountResponse[];
};

export default function AddCloudResourceForm({
  projectId,
  awsAccounts = [],
}: AddCloudResourceFormProps) {
  console.log('awsAccounts', awsAccounts);
  const [open, setOpen] = useState(false);
  const [selectedAwsAccountId, setSelectedAwsAccountId] = useState('');
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [resources, setResources] = useState<CloudResourceItem[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedAccount = awsAccounts.find(
    (a) => a.id === selectedAwsAccountId,
  );
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    setErrorMessage(null);

    if (!nextOpen) {
      setSelectedAwsAccountId('');
      setSelectedResourceId('');
      setResources([]);
      setErrorMessage(null);
    }
  };

  const handleAccountChange = async (awsAccountId: string) => {
    setSelectedAwsAccountId(awsAccountId);
    setSelectedResourceId('');
    setResources([]);
    setErrorMessage(null);

    setIsLoadingResources(true);

    try {
      const result = await getAvailableResourcesAction(awsAccountId);

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      setResources(result.items);
    } finally {
      setIsLoadingResources(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedResourceId) {
      setErrorMessage('Please select a resource.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await addResourceToProjectAction(
        projectId,
        selectedResourceId,
      );

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
            Add Resource
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Resource</DialogTitle>

            <DialogDescription>
              Select a linked AWS account, then choose a resource to add to this
              project.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="mt-5">
            <Field data-invalid={!!errorMessage}>
              <FieldLabel>
                AWS Account <span className="text-destructive">*</span>
              </FieldLabel>

              <Select
                value={selectedAwsAccountId}
                onValueChange={handleAccountChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {selectedAccount
                      ? `${selectedAccount.accountName} (${selectedAccount.awsAccountId})`
                      : 'Select AWS Account'}
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
            </Field>

            <Field>
              <FieldLabel>
                Cloud Resource <span className="text-destructive">*</span>
              </FieldLabel>

              <Select
                value={selectedResourceId}
                onValueChange={setSelectedResourceId}
                disabled={
                  !selectedAwsAccountId ||
                  isLoadingResources ||
                  resources.length === 0
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingResources
                        ? 'Loading resources...'
                        : 'Select Resource'
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {resources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.resourceName ?? resource.resourceIdentifier}
                      {' · '}
                      {resource.resourceType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {selectedAwsAccountId &&
              !isLoadingResources &&
              resources.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No available resources found for this AWS account.
                </p>
              )}

            {errorMessage && (
              <FieldError
                errors={[
                  {
                    message: errorMessage,
                  },
                ]}
              />
            )}
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
                isSubmitting || !selectedAwsAccountId || !selectedResourceId
              }
            >
              {isSubmitting ? 'Adding...' : 'Add Resource'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
