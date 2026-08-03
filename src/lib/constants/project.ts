import type {
  Department,
  ProjectSortField,
  ProjectStatus,
  SortOrder,
} from '@/lib/api/api-type';

export const departmentOptions: {
  value: Department;
  label: string;
}[] = [
  { value: 'IT', label: 'IT' },
  { value: 'ENGINEERING', label: 'Engineering' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'HUMAN_RESOURCES', label: 'Human Resources' },
  { value: 'SALES', label: 'Sales' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'OPERATIONS', label: 'Operations' },
  { value: 'SECURITY', label: 'Security' },
  { value: 'OTHER', label: 'Other' },
];

export const projectStatusOptions: {
  value: ProjectStatus;
  label: string;
}[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export const projectSortOptions: {
  label: string;
  sortBy: ProjectSortField;
  order: SortOrder;
}[] = [
  {
    label: 'Last updated',
    sortBy: 'updatedAt',
    order: 'desc',
  },
  {
    label: 'Newest created',
    sortBy: 'createdAt',
    order: 'desc',
  },
  {
    label: 'Oldest created',
    sortBy: 'createdAt',
    order: 'asc',
  },
  {
    label: 'Project name A–Z',
    sortBy: 'projectName',
    order: 'asc',
  },
  {
    label: 'Project name Z–A',
    sortBy: 'projectName',
    order: 'desc',
  },
  {
    label: 'Highest budget',
    sortBy: 'monthlyBudget',
    order: 'desc',
  },
  {
    label: 'Lowest budget',
    sortBy: 'monthlyBudget',
    order: 'asc',
  },
];
