'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Check, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { CloudResourceResponse, CloudResourceTag } from '@/lib/api/api-type';
import { UpdateResourceManual } from '@/lib/action/cloud-resource.action';
import { ENVIRONMENT_FROM_BACKEND } from '@/lib/action/cloud-resource.constants';
import {
  getServiceDisplay,
  getSourceDisplay,
  getStatusStyle,
  getTagComplianceStyle,
  providerLabels,
} from '@/lib/utils/cloud-resource-display';

const environmentOptions = [
  { value: 'DEV', label: 'Development' },
  { value: 'UAT', label: 'UAT' },
  { value: 'STAGING', label: 'Staging' },
  { value: 'PRODUCTION', label: 'Production' },
] as const;

type EditFormValues = {
  projectId: string;
  environment: string;
  description: string;
};

function formatDate(value: string | null) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString();
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="col-span-2 break-all text-foreground">{children}</dd>
    </div>
  );
}

// รวม tag จริงของ resource กับ required tag ที่ backend บอกว่าหาย (tagCompliance.missingTags)
// เพื่อให้เห็นแถว "Missing" โดยไม่ต้อง hardcode required tag key ฝั่ง frontend
function buildTagDisplayRows(
  tags: CloudResourceTag[],
  missingTags: string[],
): { tagKey: string; tagValue: string | null; isMissing: boolean }[] {
  const existingRows = tags.map((tag) => ({
    tagKey: tag.tagKey,
    tagValue: tag.tagValue,
    isMissing: false,
  }));

  const missingRows = missingTags.map((tagKey) => ({
    tagKey,
    tagValue: null,
    isMissing: true,
  }));

  return [...existingRows, ...missingRows];
}

type CloudResourceDetailDialogProps = {
  resource: CloudResourceResponse;
  projects: { id: string; projectName: string }[];
};

export function CloudResourceDetailDialog({
  resource,
  projects,
}: CloudResourceDetailDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isManual = resource.source === 'MANUAL';
  const service = getServiceDisplay(resource.resourceType);
  const source = getSourceDisplay(resource.source);
  const status = getStatusStyle(resource.resourceStatus);
  const compliance = getTagComplianceStyle(resource.tagCompliance.isCompliant);
  const tagRows = buildTagDisplayRows(
    resource.tags,
    resource.tagCompliance.missingTags,
  );

  const defaultValues: EditFormValues = {
    projectId: resource.projectId ?? '',
    environment: resource.environment
      ? (ENVIRONMENT_FROM_BACKEND[resource.environment] ?? '')
      : '',
    description: resource.description ?? '',
  };

  const {
    control,
    register,
    handleSubmit,
    reset,
  } = useForm<EditFormValues>({ defaultValues });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setMode('view');
      reset(defaultValues);
    }
  };

  const startEdit = () => {
    reset(defaultValues);
    setMode('edit');
  };

  const onSubmit = async (data: EditFormValues) => {
    setIsSubmitting(true);

    try {
      const result = await UpdateResourceManual(resource.id, {
        projectId: data.projectId || null,
        environment: isManual
          ? data.environment || null
          : defaultValues.environment || null,
        description: data.description || null,
      });

      if (!result.success) {
        toast.error('Failed to update resource', {
          description: result.message,
        });

        return;
      }

      toast.success('Cloud resource updated');
      setMode('view');
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="font-mono text-sm font-medium text-foreground hover:underline">
        {resource.resourceName ?? resource.resourceIdentifier}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        {mode === 'view' ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {resource.resourceName ?? resource.resourceIdentifier}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-wrap items-center gap-1.5">
              <Badge className={cn('gap-1.5', source.className)}>
                {source.label}
              </Badge>
              <Badge variant="outline" className={service.className}>
                {service.label}
              </Badge>
              <Badge className={cn('gap-1.5', status.className)}>
                <span className={cn('size-1.5 rounded-full', status.dot)} />
                {resource.resourceStatus ?? 'Unknown'}
              </Badge>
            </div>

            <dl className="divide-y divide-border">
              <DetailRow label="Resource ID">{resource.id}</DetailRow>
              <DetailRow label="Identifier">
                {resource.resourceIdentifier}
              </DetailRow>
              {resource.resourceArn && (
                <DetailRow label="ARN">{resource.resourceArn}</DetailRow>
              )}
              <DetailRow label="Type">{resource.resourceType}</DetailRow>
              <DetailRow label="Provider">
                {providerLabels[resource.provider] ?? resource.provider}
              </DetailRow>
              <DetailRow label="Region">
                {resource.region}
                {resource.availabilityZone
                  ? ` (${resource.availabilityZone})`
                  : ''}
              </DetailRow>
              <DetailRow label="Environment">
                {resource.environment ?? '—'}
              </DetailRow>
              <DetailRow label="AWS Account">
                {resource.awsAccount?.accountName ?? '—'}
              </DetailRow>
              <DetailRow label="Project">
                {resource.project?.projectName ?? 'Unassigned'}
              </DetailRow>
              <DetailRow label="Description">
                {resource.description ?? '—'}
              </DetailRow>
              <DetailRow label="Last Synced">
                {formatDate(resource.lastSyncedAt)}
              </DetailRow>
              <DetailRow label="Created">
                {formatDate(resource.createdAt)}
              </DetailRow>
              <DetailRow label="Updated">
                {formatDate(resource.updatedAt)}
              </DetailRow>
            </dl>

            <Separator />

            <div>
              <h3 className="mb-1 text-sm font-medium text-foreground">
                Tags
              </h3>

              {tagRows.length > 0 ? (
                <dl className="divide-y divide-border">
                  {tagRows.map((tag) => (
                    <DetailRow key={tag.tagKey} label={tag.tagKey}>
                      {tag.isMissing ? (
                        <span className="text-destructive">Missing</span>
                      ) : (
                        (tag.tagValue ?? '—')
                      )}
                    </DetailRow>
                  ))}
                </dl>
              ) : (
                <p className="py-1.5 text-sm text-muted-foreground">
                  No tags on this resource.
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">
                Tag Compliance
              </h3>

              <Badge className={cn('gap-1.5', compliance.className)}>
                {resource.tagCompliance.isCompliant ? (
                  <Check />
                ) : (
                  <X />
                )}
                {compliance.label}
              </Badge>

              <div className="flex items-center gap-3">
                <Progress
                  value={resource.tagCompliance.compliancePercentage}
                  className="flex-1"
                />
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {resource.tagCompliance.compliancePercentage}%
                </span>
              </div>

              {resource.tagCompliance.missingTags.length > 0 && (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    Missing Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {resource.tagCompliance.missingTags.map((tagKey) => (
                      <Badge
                        key={tagKey}
                        variant="outline"
                        className="border-red-200 text-red-700 dark:border-red-500/30 dark:text-red-400"
                      >
                        {tagKey}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {resource.tagCompliance.invalidTags.length > 0 && (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    Invalid Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {resource.tagCompliance.invalidTags.map((tagKey) => (
                      <Badge
                        key={tagKey}
                        variant="outline"
                        className="border-amber-200 text-amber-700 dark:border-amber-500/30 dark:text-amber-400"
                      >
                        {tagKey}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <DialogClose
                render={
                  <Button type="button" variant="outline">
                    Close
                  </Button>
                }
              />
              <Button type="button" onClick={startEdit}>
                <Pencil />
                Edit
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                Edit {resource.resourceName ?? resource.resourceIdentifier}
              </DialogTitle>
            </DialogHeader>

            <FieldGroup className="mt-4">
              <Field>
                <FieldLabel htmlFor="edit-projectId">Project</FieldLabel>
                <Controller
                  control={control}
                  name="projectId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="edit-projectId" className="w-full">
                        <SelectValue placeholder="Unassigned">
                          {(value: string) =>
                            value
                              ? (projects.find(
                                  (project) => project.id === value,
                                )?.projectName ?? value)
                              : 'Unassigned'
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.projectName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              {isManual && (
                <Field>
                  <FieldLabel htmlFor="edit-environment">
                    Environment
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="environment"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="edit-environment" className="w-full">
                          <SelectValue placeholder="Select environment">
                            {(value: string) =>
                              value
                                ? (environmentOptions.find(
                                    (option) => option.value === value,
                                  )?.label ?? value)
                                : 'Select environment'
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {environmentOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="edit-description">Description</FieldLabel>
                <Input
                  id="edit-description"
                  placeholder="Short note about this resource"
                  {...register('description')}
                />
              </Field>
            </FieldGroup>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode('view')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
