'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';

import { departments } from '@/lib/constants/department';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  CreateProjectInput,
  createProjectSchema,
} from '@/lib/schema/create-project.schema';
import { createProjectAction } from '@/lib/action/project.action';
import { currencyOptions } from '@/lib/constants/currency';
import {
  formatBudgetDisplay,
  parseBudgetInput,
} from '@/lib/utils/budget-input';

const defaultValues: CreateProjectInput = {
  projectName: '',
  description: '',
  businessDepartment: undefined as never,
  technicalDepartment: undefined as never,
  monthlyBudget: '',
  budgetCurrency: 'USD',
  startDate: '',
  endDate: '',
};

export default function CreateProjectForm() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues,
  });

  const currencySymbol =
    currencyOptions.find((c) => c.value === watch('budgetCurrency'))?.symbol ??
    '$';

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset(defaultValues);
    }
  };

  const onSubmit = async (data: CreateProjectInput) => {
    setIsSubmitting(true);

    try {
      await createProjectAction(data);
      handleOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <Plus />
            New Project
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Project Name, Owner Business Department and Owner Technical
              Department are required.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="mt-4">
            <Field data-invalid={!!errors.projectName}>
              <FieldLabel htmlFor="projectName">
                Project Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="projectName"
                placeholder="e.g. Customer Portal Revamp"
                aria-invalid={!!errors.projectName}
                {...register('projectName')}
              />
              {errors.projectName && (
                <FieldError
                  errors={[
                    {
                      message: errors.projectName.message,
                    },
                  ]}
                />
              )}
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Input
                id="description"
                placeholder="Short summary of the project"
                aria-invalid={!!errors.description}
                {...register('description')}
              />
              {errors.description && (
                <FieldError
                  errors={[
                    {
                      message: errors.description.message,
                    },
                  ]}
                />
              )}
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.businessDepartment}>
                <FieldLabel htmlFor="businessDepartment">
                  Owner Business Department{' '}
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <Controller
                  control={control}
                  name="businessDepartment"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="businessDepartment"
                        className="w-full"
                        aria-invalid={!!errors.businessDepartment}
                      >
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
                  )}
                />
                {errors.businessDepartment && (
                  <FieldError
                    errors={[
                      {
                        message: errors.businessDepartment.message,
                      },
                    ]}
                  />
                )}
              </Field>

              <Field data-invalid={!!errors.technicalDepartment}>
                <FieldLabel htmlFor="technicalDepartment">
                  Owner Technical Department{' '}
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <Controller
                  control={control}
                  name="technicalDepartment"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="technicalDepartment"
                        className="w-full"
                        aria-invalid={!!errors.technicalDepartment}
                      >
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
                  )}
                />
                {errors.technicalDepartment && (
                  <FieldError
                    errors={[
                      {
                        message: errors.technicalDepartment.message,
                      },
                    ]}
                  />
                )}
              </Field>
            </div>

            <Field data-invalid={!!errors.monthlyBudget}>
              <FieldLabel htmlFor="monthlyBudget">Monthly Budget</FieldLabel>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                    {currencySymbol}
                  </span>
                  <Controller
                    control={control}
                    name="monthlyBudget"
                    render={({ field }) => (
                      <Input
                        id="monthlyBudget"
                        inputMode="decimal"
                        placeholder="0.00"
                        className="pl-6"
                        aria-invalid={!!errors.monthlyBudget}
                        value={formatBudgetDisplay(field.value)}
                        onChange={(e) =>
                          field.onChange(parseBudgetInput(e.target.value))
                        }
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                </div>

                <Controller
                  control={control}
                  name="budgetCurrency"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-24 shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyOptions.map((currency) => (
                          <SelectItem
                            key={currency.value}
                            value={currency.value}
                          >
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {errors.monthlyBudget && (
                <FieldError
                  errors={[
                    {
                      message: errors.monthlyBudget.message,
                    },
                  ]}
                />
              )}
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.startDate}>
                <FieldLabel htmlFor="startDate">Start Date</FieldLabel>
                <Input
                  id="startDate"
                  type="date"
                  aria-invalid={!!errors.startDate}
                  {...register('startDate')}
                />
                {errors.startDate && (
                  <FieldError
                    errors={[
                      {
                        message: errors.startDate.message,
                      },
                    ]}
                  />
                )}
              </Field>

              <Field data-invalid={!!errors.endDate}>
                <FieldLabel htmlFor="endDate">End Date</FieldLabel>
                <Input
                  id="endDate"
                  type="date"
                  aria-invalid={!!errors.endDate}
                  {...register('endDate')}
                />
                {errors.endDate && (
                  <FieldError
                    errors={[
                      {
                        message: errors.endDate.message,
                      },
                    ]}
                  />
                )}
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
