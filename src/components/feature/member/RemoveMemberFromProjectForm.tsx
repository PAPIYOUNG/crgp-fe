'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
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

import { removeMemberFromProjectAction } from '@/lib/action/project-member.action';

type RemoveMemberFromProjectFormProps = {
  projectId: string;
  userId: string;
  memberName: string;
};

export default function RemoveMemberFromProjectForm({
  projectId,
  userId,
  memberName,
}: RemoveMemberFromProjectFormProps) {
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
      const result = await removeMemberFromProjectAction(projectId, userId);

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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remove ${memberName}`}
            className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove Project Member</DialogTitle>

          <DialogDescription>
            Are you sure you want to remove{' '}
            <span className="font-semibold text-foreground">{memberName}</span>{' '}
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
            {isSubmitting ? 'Removing...' : 'Remove Member'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
