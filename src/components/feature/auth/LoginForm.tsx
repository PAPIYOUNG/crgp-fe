'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, LockKeyhole, Mail, EyeOff, AlertCircleIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { LoginInput, LoginSchema } from '@/lib/schema/login.schema';
import { Label } from '@/components/ui/label';
import { loginAction } from '@/lib/action/auth.action';

export default function LoginForm() {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: LoginInput) => {
    startTransition(async () => {
      //console.log('Form submitted with data:', data);
      const result = await loginAction(data);

      if (result?.success === false) {
        setError('root', {
          message: result.message,
        });
      }
    });
  };

  return (
    <div className="w-full max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>

        <p className="mt-2 text-sm text-slate-500">
          Sign in to your CRGP workspace
        </p>
      </div>

      {errors.root && (
        <Alert
          variant="destructive"
          className="bg-destructive/8 border-destructive mb-4"
        >
          <AlertCircleIcon />
          <AlertTitle>Email or Password is invalid.</AlertTitle>
          <AlertDescription></AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup className="gap-4 mt-5">
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
                    className="h-14 rounded-2xl border-slate-200 pl-14 text-lg"
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
                    className="h-14 rounded-2xl border-slate-200 px-14 text-lg"
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

          <div className="flex items-center justify-between">
            <Controller
              control={control}
              name="rememberMe"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={field.name}
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked === true);
                    }}
                    className="data-[state=checked]:border-[#493985] data-[state=checked]:bg-[#493985]"
                  />

                  <Label
                    htmlFor={field.name}
                    className="font-medium text-slate-700"
                  >
                    Remember me
                  </Label>
                </div>
              )}
            />

            <Link
              href="#"
              className="text-sm font-semibold text-[#493985] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="h-14 w-full rounded-2xl bg-[#493985] text-lg font-bold hover:bg-[#3f3177]"
          >
            {isPending ? 'Logging you in...' : 'Sign in to CRGP'}
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-10 text-center text-lg text-slate-500">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-bold text-[#493985] hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
