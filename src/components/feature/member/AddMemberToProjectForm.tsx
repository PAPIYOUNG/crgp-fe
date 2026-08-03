'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { addProjectMemberAction } from '@/lib/action/project-member.action';
import type { UserOption } from '@/lib/api/api-type';

type ProjectMemberRoleOption = 'MEMBER' | 'TECHNICAL_OWNER';

type AddMemberToProjectFormProps = {
  projectId: string;
  users: UserOption[];

  // userId ของคนที่อยู่ใน Project แล้ว ส่งมาเช็คไม่ให้ add ซ้ำ
  existingMemberUserIds?: string[];
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
];

export default function AddMemberToProjectForm({
  projectId,
  users,
  existingMemberUserIds = [],
}: AddMemberToProjectFormProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] =
    useState<ProjectMemberRoleOption>('MEMBER');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userError, setUserError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [rootError, setRootError] = useState<string | null>(null);

  const availableUsers = users.filter(
    (user) =>
      user.status === 'ACTIVE' && !existingMemberUserIds.includes(user.id),
  );

  const selectedUser = availableUsers.find(
    (user) => user.id === selectedUserId,
  );

  const selectedRoleOption = projectRoles.find(
    (role) => role.value === selectedRole,
  );

  const resetForm = () => {
    setSelectedUserId('');
    setSelectedRole('MEMBER');

    setUserError(null);
    setRoleError(null);
    setRootError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setUserError(null);
    setRoleError(null);
    setRootError(null);

    let invalid = false;

    if (!selectedUserId) {
      setUserError('Please select a user.');
      invalid = true;
    }

    if (!selectedRole) {
      setRoleError('Please select a project role.');
      invalid = true;
    }

    if (invalid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addProjectMemberAction(projectId, {
        userId: selectedUserId,
        memberRole: selectedRole,
      });

      if (!result.success) {
        if (result.status === 409) {
          setUserError(result.message);
        } else {
          setRootError(result.message);
        }

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
          <Button type="button">
            <Plus />
            Add Member
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Project Member</DialogTitle>

            <DialogDescription>
              Select an active user and assign their role in this project.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="mt-5">
            <Field data-invalid={!!userError}>
              <FieldLabel>
                User <span className="text-destructive">*</span>
              </FieldLabel>

              <Select
                value={selectedUserId}
                onValueChange={(value) => {
                  setSelectedUserId(value ?? '');
                  setUserError(null);
                  setRootError(null);
                }}
              >
                <SelectTrigger className="w-full" aria-invalid={!!userError}>
                  <SelectValue>
                    {selectedUser
                      ? `${selectedUser.firstName} ${selectedUser.lastName} (${selectedUser.email})`
                      : 'Select user'}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span>
                          {user.firstName} {user.lastName}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          {user.email} · {user.department}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {userError && <FieldError errors={[{ message: userError }]} />}

              {availableUsers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  There are no active users available to add.
                </p>
              )}
            </Field>

            <Field data-invalid={!!roleError}>
              <FieldLabel>
                Project Role <span className="text-destructive">*</span>
              </FieldLabel>

              <Select
                value={selectedRole}
                onValueChange={(value) => {
                  if (value === 'MEMBER' || value === 'TECHNICAL_OWNER') {
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

            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !selectedUserId ||
                !selectedRole ||
                availableUsers.length === 0
              }
            >
              {isSubmitting ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
