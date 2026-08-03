'use client';

import { useState } from 'react';
import { Trash } from 'lucide-react';
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

import { removeResourceFromProjectAction } from '@/lib/action/project-resource.action';

type RemoveResourceFromProjectFormProps = {
  projectId: string;
  resourceId: string;
  resourceName: string;
};

export default function RemoveResourceFromProjectForm({
  projectId,
  resourceId,
  resourceName,
}: RemoveResourceFromProjectFormProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setErrorMessage(null);
    }
  };

  const handleRemove = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await removeResourceFromProjectAction(
        projectId,
        resourceId,
      );

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

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
          <button
            type="button"
            className="text-red-600 transition-colors hover:text-red-800"
          >
            <Trash size={18} />
          </button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove Resource</DialogTitle>

          <DialogDescription>
            Are you sure you want to remove{' '}
            <span className="font-semibold text-foreground">
              {resourceName}
            </span>{' '}
            from this project?
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}

        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            }
          />

          <Button
            variant="destructive"
            disabled={isSubmitting}
            onClick={handleRemove}
          >
            {isSubmitting ? 'Removing...' : 'Remove Resource'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
