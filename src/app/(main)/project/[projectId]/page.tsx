import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ChevronRight,
  Cloud,
  DollarSign,
  FolderClosed,
  Plus,
  Server,
  Users,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs';
import EditProjectForm from '@/components/feature/project/EditProjectForm';
import { ApiError } from '@/lib/api/api-error';
import { ProjectMemberRole, ProjectStatus } from '@/lib/api/api-type';
import { projectApi } from '@/lib/api/project.api';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Project',
};

export const dynamic = 'force-dynamic';

const statusConfig: Record<ProjectStatus, { dot: string; className: string }> =
  {
    ACTIVE: {
      dot: 'bg-green-500',
      className:
        'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    },
    ARCHIVED: {
      dot: 'bg-amber-500',
      className:
        'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    },
    INACTIVE: {
      dot: 'bg-muted-foreground',
      className: 'bg-muted text-muted-foreground',
    },
  };

const roleConfig: Record<
  ProjectMemberRole,
  { label: string; className: string }
> = {
  BUSINESS_OWNER: {
    label: 'Business Owner',
    className:
      'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  },
  TECHNICAL_OWNER: {
    label: 'Technical Owner',
    className:
      'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  },
  MEMBER: {
    label: 'Member',
    className: 'bg-muted text-muted-foreground',
  },
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function formatBudget(amount: string | null, currency: string) {
  if (!amount) return 'Not set';

  const value = Number(amount);
  if (Number.isNaN(value)) return `${amount} ${currency}`;

  return `${value.toLocaleString('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })} / month`;
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  footer,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  footer: React.ReactNode;
}) {
  return (
    <Card className="gap-1.5 px-5 py-4">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>

        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full',
            iconClassName,
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>

      <span className="text-2xl font-semibold">{value}</span>

      {footer}
    </Card>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  let project;
  try {
    project = await projectApi.getOneProject(projectId);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }

  const status = statusConfig[project.status];

  const members = project.members ?? [];
  const resources = project.resources ?? [];
  const projectAwsAccounts = project.projectAwsAccounts ?? [];
  const counts = project._count ?? {
    members: members.length,
    resources: resources.length,
    projectAwsAccounts: projectAwsAccounts.length,
  };

  const ownersCount = members.filter(
    (member) =>
      member.memberRole === 'BUSINESS_OWNER' ||
      member.memberRole === 'TECHNICAL_OWNER',
  ).length;
  const membersCount = members.length - ownersCount;

  const resourceTypeCount = new Set(
    resources.map((resource) => resource.resourceType),
  ).size;

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <Link
          href="/project"
          className="text-muted-foreground hover:text-foreground"
        >
          Projects
        </Link>
        <ChevronRight className="size-3.5 text-muted-foreground" />
        <span className="font-medium text-foreground">
          {project.projectName}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FolderClosed className="size-5" />
          </span>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">
                {project.projectName}
              </h1>

              <Badge className={cn('gap-1.5', status.className)}>
                <span className={cn('size-1.5 rounded-full', status.dot)} />
                {project.status === 'ACTIVE' ? 'Active' : project.status}
              </Badge>
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>
                Created by {project.createdBy.firstName}{' '}
                {project.createdBy.lastName}
              </span>
              <span className="text-border">•</span>
              <span>Updated {formatDate(project.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <EditProjectForm project={project} />
          <Button>
            <Plus />
            Add Resource
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Resources"
          value={String(counts.resources)}
          icon={Cloud}
          iconClassName="bg-primary/10 text-primary"
          footer={
            <span className="text-xs text-muted-foreground">
              across {resourceTypeCount} resource types
            </span>
          }
        />

        <StatCard
          label="Cost MTD"
          value="$0.00"
          icon={DollarSign}
          iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
          footer={
            <span className="text-xs text-muted-foreground">
              Cost tracking coming soon
            </span>
          }
        />

        <StatCard
          label="Members"
          value={String(counts.members)}
          icon={Users}
          iconClassName="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          footer={
            <span className="text-xs text-muted-foreground">
              {ownersCount} owner{ownersCount === 1 ? '' : 's'}, {membersCount}{' '}
              member{membersCount === 1 ? '' : 's'}
            </span>
          }
        />

        <StatCard
          label="Monthly Budget"
          value={formatBudget(project.monthlyBudget, project.budgetCurrency)}
          icon={Server}
          iconClassName="bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
          footer={
            <span className="text-xs text-muted-foreground">
              {counts.projectAwsAccounts} AWS account
              {counts.projectAwsAccounts === 1 ? '' : 's'} linked
            </span>
          }
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="resources">Resources</TabsTab>
          <TabsTab value="members">Members</TabsTab>
          <TabsTab value="activity">Activity</TabsTab>
        </TabsList>

        <TabsPanel value="overview">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left column */}
            <div className="space-y-6 lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-base font-semibold text-foreground">
                  Project Description
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {project.description ?? 'No description provided.'}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Business: {project.businessDepartment}
                  </Badge>
                  <Badge variant="outline">
                    Technical: {project.technicalDepartment}
                  </Badge>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-base font-semibold text-foreground">
                  AWS Accounts
                </h2>

                {projectAwsAccounts.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No AWS accounts linked yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {projectAwsAccounts.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {link.awsAccount.accountName}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {link.awsAccount.awsAccountId}
                          </p>
                        </div>

                        <Badge variant="outline">
                          {link.awsAccount.defaultRegion}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-base font-semibold text-foreground">
                  Project Details
                </h2>

                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Project Code</dt>
                    <dd className="mt-0.5 font-mono font-medium break-all text-foreground">
                      {project.projectCode}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="font-medium text-foreground">
                      {formatDate(project.createdAt)}
                    </dd>
                  </div>
                  {project.startDate && (
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Start Date</dt>
                      <dd className="font-medium text-foreground">
                        {formatDate(project.startDate)}
                      </dd>
                    </div>
                  )}
                  {project.endDate && (
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">End Date</dt>
                      <dd className="font-medium text-foreground">
                        {formatDate(project.endDate)}
                      </dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Budget</dt>
                    <dd className="font-medium text-foreground">
                      {formatBudget(
                        project.monthlyBudget,
                        project.budgetCurrency,
                      )}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Resources</dt>
                    <dd className="font-medium text-foreground">
                      {counts.resources} active
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card className="p-6">
                <h2 className="text-base font-semibold text-foreground">
                  Members
                </h2>

                {members.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No members yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {members.map((member) => {
                      const role = roleConfig[member.memberRole];

                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {member.user.firstName.charAt(0)}
                                {member.user.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {member.user.firstName} {member.user.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {member.user.email}
                              </p>
                            </div>
                          </div>

                          <Badge className={role.className}>{role.label}</Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </TabsPanel>

        <TabsPanel value="resources">
          <Card className="overflow-hidden py-0">
            {resources.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">
                No resources linked to this project yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource Type</TableHead>
                    <TableHead>Environment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-mono text-sm">
                        {resource.resourceType}
                      </TableCell>
                      <TableCell>{resource.environment ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsPanel>

        <TabsPanel value="members">
          <Card className="p-6">
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members yet.</p>
            ) : (
              <div className="space-y-4">
                {members.map((member) => {
                  const role = roleConfig[member.memberRole];

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {member.user.firstName.charAt(0)}
                            {member.user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {member.user.firstName} {member.user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.user.email}
                          </p>
                        </div>
                      </div>

                      <Badge className={role.className}>{role.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsPanel>

        <TabsPanel value="activity">
          <Card className="p-6 text-sm text-muted-foreground">
            Activity log will appear here. [Phase2]
          </Card>
        </TabsPanel>
      </Tabs>
    </div>
  );
}
