'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, LockKeyhole, Mail, EyeOff, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DEPARTMENT_OPTIONS,
  RegisterInput,
  RegisterSchema,
} from '@/lib/schema/register.schema';
import { registerAction } from '@/lib/action/auth.action';

const DEPARTMENT_LABELS: Record<(typeof DEPARTMENT_OPTIONS)[number], string> = {
  IT: 'IT',
  ENGINEERING: 'Engineering',
  FINANCE: 'Finance',
  HUMAN_RESOURCES: 'Human Resources',
  SALES: 'Sales',
  MARKETING: 'Marketing',
  OPERATIONS: 'Operations',
  SECURITY: 'Security',
  OTHER: 'Other',
};

export default function RegisterForm() {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      department: undefined,
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: RegisterInput) => {
    startTransition(async () => {
      //console.log('Register submitted with data:', data);
      const result = await registerAction(data);
      if (result?.code === 'EMAIL_ALREADY_EXISTS') {
        setError('email', { message: result.message });
      }
    });
  };

  return (
    <div className="w-full max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">
          Create your account
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Join your team on the CRGP workspace
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup className="mt-5 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="firstName"
              render={({ field, fieldState }) => (
                <Field className="gap-2" data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-sm font-bold uppercase tracking-wide text-slate-700"
                  >
                    First name
                  </FieldLabel>

                  <div className="relative">
                    <User className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

                    <Input
                      {...field}
                      id={field.name}
                      type="text"
                      placeholder="Alex"
                      aria-invalid={fieldState.invalid}
                      className="h-10 rounded-2xl border-slate-200 pl-14 text-lg"
                    />
                  </div>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field, fieldState }) => (
                <Field className="gap-2" data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-sm font-bold uppercase tracking-wide text-slate-700"
                  >
                    Last name
                  </FieldLabel>

                  <div className="relative">
                    <User className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

                    <Input
                      {...field}
                      id={field.name}
                      type="text"
                      placeholder="Chen"
                      aria-invalid={fieldState.invalid}
                      className="h-10 rounded-2xl border-slate-200 pl-14 text-lg"
                    />
                  </div>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Field className="gap-2" data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-sm font-bold uppercase tracking-wide text-slate-700"
                >
                  Work email
                </FieldLabel>

                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    placeholder="alex.chen@acmecorp.io"
                    aria-invalid={fieldState.invalid}
                    className="h-10 rounded-2xl border-slate-200 pl-14 text-lg"
                  />
                </div>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <Field className="gap-2" data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-sm font-bold uppercase tracking-wide text-slate-700"
                  >
                    Password
                  </FieldLabel>

                  <div className="relative">
                    <LockKeyhole className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

                    <Input
                      {...field}
                      id={field.name}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      aria-invalid={fieldState.invalid}
                      className="h-10 rounded-2xl border-slate-200 px-14 text-lg"
                    />

                    <button
                      type="button"
                      aria-label="Show password"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Field className="gap-2" data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-sm font-bold uppercase tracking-wide text-slate-700"
                  >
                    Confirm password
                  </FieldLabel>

                  <div className="relative">
                    <LockKeyhole className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

                    <Input
                      {...field}
                      id={field.name}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      aria-invalid={fieldState.invalid}
                      className="h-10 rounded-2xl border-slate-200 px-14 text-lg"
                    />

                    <button
                      type="button"
                      aria-label="Show confirm password"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            control={control}
            name="department"
            render={({ field, fieldState }) => (
              <Field className="gap-2" data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-sm font-bold uppercase tracking-wide text-slate-700"
                >
                  Department
                </FieldLabel>

                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="h-10 w-full rounded-2xl border-slate-200 px-5 text-lg"
                  >
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>

                  <SelectContent>
                    {DEPARTMENT_OPTIONS.map((department) => (
                      <SelectItem key={department} value={department}>
                        {DEPARTMENT_LABELS[department]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button
            type="submit"
            disabled={isPending}
            className="h-12 w-full rounded-2xl bg-[#493985] text-lg font-bold hover:bg-[#3f3177] mt-4"
          >
            {isPending ? 'Creating your account...' : 'Create account'}
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-10 text-center text-lg text-slate-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-bold text-[#493985] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
