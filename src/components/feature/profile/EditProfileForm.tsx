'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { Department } from '@/lib/api/api-type';
import {
  EditProfileInput,
  editProfileSchema,
} from '@/lib/schema/edit-profile.schema';
import { editProfileAction } from '@/lib/action/user.action';

type EditProfileFormProps = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  department: string;
  departments: readonly {
    value: string;
    label: string;
  }[];
};

export default function EditProfileForm({
  firstName,
  lastName,
  email,
  role,
  status,
  department,
  departments,
}: EditProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName,
      lastName,
      department: department as Department,
    },
  });

  const selectedDepartment = watch('department');

  const handleClickSave = (data: EditProfileInput) => {
    startTransition(async () => {
      const result = await editProfileAction(data);

      if (result?.success === false) {
        console.error(result.message);
      }
    });
  };

  const handleCancel = () => {
    reset({
      firstName,
      lastName,
      department: department as Department,
    });

    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSubmit(handleClickSave)}>
      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wide uppercase">
            First Name
          </Label>

          <Input
            {...register('firstName')}
            disabled={!isEditing || isPending}
          />

          {errors.firstName && (
            <p className="text-xs text-red-500">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wide uppercase">
            Last Name
          </Label>

          <Input {...register('lastName')} disabled={!isEditing || isPending} />

          {errors.lastName && (
            <p className="text-xs text-red-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Work Email
          </Label>

          <Input value={email} disabled />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Department
          </Label>

          <Select
            value={selectedDepartment}
            disabled={!isEditing || isPending}
            onValueChange={(value) => {
              if (!value) return;

              setValue('department', value as Department, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>

            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.value} value={dept.value}>
                  {dept.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {errors.department && (
            <p className="text-xs text-red-500">{errors.department.message}</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Platform Role
          </Label>

          <Input value={role} disabled />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Account Status
          </Label>

          <Input value={status} disabled />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={handleCancel}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#493985] text-white hover:bg-[#493985]/90"
            >
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            onClick={() => setIsEditing(true)}
            className="bg-[#493985] text-white hover:bg-[#493985]/90"
          >
            Edit Data
          </Button>
        )}
      </div>
    </form>
  );
}
