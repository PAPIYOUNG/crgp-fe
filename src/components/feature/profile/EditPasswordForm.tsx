'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { editPasswordAction } from '@/lib/action/user.action';
import { EditPassword } from '@/lib/api/api-type';

import {
  EditPasswordInput,
  editPasswordSchema,
} from '@/lib/schema/edit-password.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

export default function EditPasswordForm() {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPasswordInput>({
    resolver: zodResolver(editPasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleCancel = () => {
    reset({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    setIsEditing(false);
  };

  const handleClickSave = (data: EditPasswordInput) => {
    const input: EditPassword = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    };
    startTransition(async () => {
      const result = await editPasswordAction(input);

      if (result?.success === false) {
        console.error(result.message);
      }
      reset();
      setIsEditing(false);
    });
  };

  return (
    <form onSubmit={handleSubmit(handleClickSave)}>
      <div className="flex items-center gap-2">
        <KeyRound className="size-4 text-muted-foreground" />
        <h2 className="text-base font-semibold">Reset Password</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Update your password to keep your account secure
      </p>
      <Separator className="mt-4" />
      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="col-span-2 space-y-2">
          <Label className="text-xs font-semibold tracking-wide uppercase">
            Current Password
          </Label>
          <Input
            type="password"
            placeholder="Enter current password"
            autoComplete="current-password"
            {...register('currentPassword')}
            disabled={!isEditing || isPending}
          />
          {errors.currentPassword && (
            <p className="text-xs text-red-500">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wide uppercase">
            New Password
          </Label>
          <Input
            type="password"
            placeholder="Enter new password"
            autoComplete="new-password"
            disabled={!isEditing || isPending}
            {...register('newPassword')}
          />
          {errors.newPassword && (
            <p className="text-xs text-red-500">{errors.newPassword.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            At least 8 characters, with a number and a symbol
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wide uppercase">
            Confirm New Password
          </Label>
          <Input
            type="password"
            placeholder="Re-enter new password"
            autoComplete="new-password"
            disabled={!isEditing || isPending}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
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
            Edit Password
          </Button>
        )}
      </div>
    </form>
  );
}
