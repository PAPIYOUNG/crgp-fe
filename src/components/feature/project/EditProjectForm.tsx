'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';

import { departments } from '@/lib/constants/department';
import { currencyOptions } from '@/lib/constants/currency';
import {
  formatBudgetDisplay,
  parseBudgetInput,
} from '@/lib/utils/budget-input';
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

import { GetOneProjectResponse } from '@/lib/api/api-type';
import {
  EditProjectInput,
  editProjectSchema,
} from '@/lib/schema/edit-project.schema';
import { updateProjectAction } from '@/lib/action/project.action';

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ARCHIVED', label: 'Archived' },
] as const;

function toDefaultValues(project: GetOneProjectResponse): EditProjectInput {
  return {
    projectName: project.projectName,
    description: project.description ?? '',
    businessDepartment: project.businessDepartment,
    technicalDepartment: project.technicalDepartment,
    monthlyBudget: project.monthlyBudget ?? '',
    budgetCurrency: project.budgetCurrency === 'THB' ? 'THB' : ('USD' as const),
    status: project.status,
    startDate: project.startDate ? project.startDate.slice(0, 10) : '',
    endDate: project.endDate ? project.endDate.slice(0, 10) : '',
  };
}

export default function EditProjectForm({
  project,
}: {
  project: GetOneProjectResponse;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues = toDefaultValues(project);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditProjectInput>({
    resolver: zodResolver(editProjectSchema),
    defaultValues,
  });

  const currencySymbol =
    currencyOptions.find((c) => c.value === watch('budgetCurrency'))?.symbol ??
    '$';

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setErrorMessage(null);
      reset(defaultValues);
    }
  };

  const onSubmit = async (data: EditProjectInput) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await updateProjectAction(project.id, data);
      if (result?.success === false) {
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
          <Button variant="outline">
            <Pencil />
            Edit
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Project Name, Owner Business Department and Owner Technical
              Department are required.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="mt-4">
            <Field data-invalid={!!errors.projectName}>
              <FieldLabel htmlFor="edit-projectName">
                Project Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="edit-projectName"
                placeholder="e.g. Customer Portal Revamp"
                aria-invalid={!!errors.projectName}
                {...register('projectName')}
              />
              {errors.projectName && (
                <FieldError
                  errors={[{ message: errors.projectName.message }]}
                />
              )}
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="edit-description">Description</FieldLabel>
              <Input
                id="edit-description"
                placeholder="Short summary of the project"
                aria-invalid={!!errors.description}
                {...register('description')}
              />
              {errors.description && (
                <FieldError
                  errors={[{ message: errors.description.message }]}
                />
              )}
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.businessDepartment}>
                <FieldLabel htmlFor="edit-businessDepartment">
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
                        id="edit-businessDepartment"
                        className="w-full"
                        aria-invalid={!!errors.businessDepartment}
                      >
                        <SelectValue placeholder="Select department">
                          {(value: string) =>
                            departments.find((dept) => dept.value === value)
                              ?.label ?? value
                          }
                        </SelectValue>
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
                    errors={[{ message: errors.businessDepartment.message }]}
                  />
                )}
              </Field>

              <Field data-invalid={!!errors.technicalDepartment}>
                <FieldLabel htmlFor="edit-technicalDepartment">
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
                        id="edit-technicalDepartment"
                        className="w-full"
                        aria-invalid={!!errors.technicalDepartment}
                      >
                        <SelectValue placeholder="Select department">
                          {(value: string) =>
                            departments.find((dept) => dept.value === value)
                              ?.label ?? value
                          }
                        </SelectValue>
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
                    errors={[{ message: errors.technicalDepartment.message }]}
                  />
                )}
              </Field>
            </div>

            <Field data-invalid={!!errors.status}>
              <FieldLabel htmlFor="edit-status">Status</FieldLabel>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="edit-status" className="w-full">
                      <SelectValue placeholder="Select status">
                        {(value: string) =>
                          statusOptions.find((option) => option.value === value)
                            ?.label ?? value
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <FieldError errors={[{ message: errors.status.message }]} />
              )}
            </Field>

            <Field data-invalid={!!errors.monthlyBudget}>
              <FieldLabel htmlFor="edit-monthlyBudget">
                Monthly Budget
              </FieldLabel>
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
                        id="edit-monthlyBudget"
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
                  errors={[{ message: errors.monthlyBudget.message }]}
                />
              )}
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.startDate}>
                <FieldLabel htmlFor="edit-startDate">Start Date</FieldLabel>
                <Input
                  id="edit-startDate"
                  type="date"
                  aria-invalid={!!errors.startDate}
                  {...register('startDate')}
                />
                {errors.startDate && (
                  <FieldError
                    errors={[{ message: errors.startDate.message }]}
                  />
                )}
              </Field>

              <Field data-invalid={!!errors.endDate}>
                <FieldLabel htmlFor="edit-endDate">End Date</FieldLabel>
                <Input
                  id="edit-endDate"
                  type="date"
                  aria-invalid={!!errors.endDate}
                  {...register('endDate')}
                />
                {errors.endDate && (
                  <FieldError errors={[{ message: errors.endDate.message }]} />
                )}
              </Field>
            </div>
          </FieldGroup>

          {errorMessage && (
            <p className="mt-4 text-sm text-destructive">{errorMessage}</p>
          )}

          <DialogFooter className="mt-6">
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
