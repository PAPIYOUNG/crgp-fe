'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { updateProjectMemberRoleAction } from '@/lib/action/project-member.action';
import type { ProjectMemberRole } from '@/lib/api/api-type';

type ProjectMemberRoleOption = ProjectMemberRole;

type EditMemberRoleToProjectFormProps = {
  projectId: string;
  userId: string;
  memberName: string;
  currentRole: ProjectMemberRoleOption;
};

const projectRoles: Array<{
  value: ProjectMemberRoleOption;
  label: string;
  description: string;
}> = [
  {
    value: 'MEMBER',
    label: 'Member',
    description: 'Can access and work with project resources.',
  },
  {
    value: 'TECHNICAL_OWNER',
    label: 'Technical Owner',
    description: 'Can manage project detail ,project resources and members.',
  },
  {
    value: 'BUSINESS_OWNER',
    label: 'Business Owner',
    description: 'Can manage project detail ,project resources and members.',
  },
];

export default function EditMemberRoleToProjectForm({
  projectId,
  userId,
  memberName,
  currentRole,
}: EditMemberRoleToProjectFormProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] =
    useState<ProjectMemberRoleOption>(currentRole);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [rootError, setRootError] = useState<string | null>(null);

  const selectedRoleOption = projectRoles.find(
    (role) => role.value === selectedRole,
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setSelectedRole(currentRole);
      setRoleError(null);
      setRootError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setRoleError(null);
    setRootError(null);

    if (!selectedRole) {
      setRoleError('Please select a project role.');
      return;
    }

    if (selectedRole === currentRole) {
      handleOpenChange(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateProjectMemberRoleAction(projectId, userId, {
        memberRole: selectedRole,
      });

      if (!result.success) {
        setRootError(result.message);
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
            aria-label={`Edit role for ${memberName}`}
            className="size-7 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Pencil className="size-4" />
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Member Role</DialogTitle>

            <DialogDescription>
              Change the project role for{' '}
              <span className="font-semibold text-foreground">
                {memberName}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="mt-5">
            <Field data-invalid={!!roleError}>
              <FieldLabel>
                Project Role <span className="text-destructive">*</span>
              </FieldLabel>

              <Select
                value={selectedRole}
                onValueChange={(value) => {
                  if (
                    value === 'MEMBER' ||
                    value === 'TECHNICAL_OWNER' ||
                    value === 'BUSINESS_OWNER'
                  ) {
                    setSelectedRole(value);
                    setRoleError(null);
                    setRootError(null);
                  }
                }}
              >
                <SelectTrigger className="w-full" aria-invalid={!!roleError}>
                  <SelectValue>
                    {selectedRoleOption?.label ?? 'Select role'}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {projectRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex flex-col">
                        <span>{role.label}</span>

                        <span className="text-xs text-muted-foreground">
                          {role.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {roleError && <FieldError errors={[{ message: roleError }]} />}
            </Field>
          </FieldGroup>

          {rootError && (
            <p className="mt-4 text-sm text-destructive">{rootError}</p>
          )}

          <DialogFooter className="mt-6">
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              }
            />

            <Button type="submit" disabled={isSubmitting || !selectedRole}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
