export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type SystemRole = 'ADMIN' | 'USER';

export type GetAllUsersResponse = UserResponse[];

export type UserResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;

  avatarUrl: string | null;

  role: 'ADMIN' | 'USER';
  department:
    | 'IT'
    | 'ENGINEERING'
    | 'FINANCE'
    | 'HUMAN_RESOURCES'
    | 'SALES'
    | 'MARKETING'
    | 'OPERATIONS'
    | 'SECURITY'
    | 'OTHER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
};

export type LoginResponse = {
  access_token: string;
  user: UserResponse;
};

export type EditProfile = {
  firstName: string;
  lastName: string;
  department: Department;
};

export type EditPassword = {
  currentPassword: string;
  newPassword: string;
};

export type ProjectStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export type Department =
  | 'IT'
  | 'ENGINEERING'
  | 'FINANCE'
  | 'HUMAN_RESOURCES'
  | 'SALES'
  | 'MARKETING'
  | 'OPERATIONS'
  | 'SECURITY'
  | 'OTHER';

export type ProjectCreatedBy = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type ProjectCount = {
  projectAwsAccounts: number;
  resources: number;
  members: number;
};

export type ProjectResponseItem = {
  id: string;
  projectName: string;
  projectCode: string;
  description: string | null;

  businessDepartment: Department;
  technicalDepartment: Department;

  monthlyBudget: string | null;
  budgetCurrency: string;

  status: ProjectStatus;

  startDate: string | null;
  endDate: string | null;

  createdById: string;
  createdAt: string;
  updatedAt: string;

  createdBy: ProjectCreatedBy;

  _count: ProjectCount;

  costMtd: string;
  budgetUsage: number;
  remainingBudget: string | null;
};

export type GetProjectsResponse = {
  items: ProjectResponseItem[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type CreateProjectRequest = {
  projectName: string;
  description: string | null;
  businessDepartment: Department;
  technicalDepartment: Department;
  monthlyBudget: string | null;
  budgetCurrency: string;
  startDate: string | null;
  endDate: string | null;
};

export type UpdateProjectRequest = {
  projectName?: string;
  description?: string;
  businessDepartment?: Department;
  technicalDepartment?: Department;
  monthlyBudget?: number;
  budgetCurrency?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
};

//Filter Project

export const projectStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;

export const projectSortFields = [
  'projectName',
  'createdAt',
  'updatedAt',
  'startDate',
  'endDate',
  'monthlyBudget',
  'status',
  'businessDepartment',
  'technicalDepartment',
] as const;

export type ProjectSortField = (typeof projectSortFields)[number];

export type SortOrder = 'asc' | 'desc';

export type GetProjectsQuery = {
  search?: string;
  businessDepartment?: Department;
  technicalDepartment?: Department;
  status?: ProjectStatus;
  sortBy?: ProjectSortField;
  order?: SortOrder;
  page?: number;
  limit?: number;
};

export type ProjectMemberRole = 'BUSINESS_OWNER' | 'TECHNICAL_OWNER' | 'MEMBER';

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  memberRole: ProjectMemberRole;
  joinedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
};

export type ProjectAwsAccountLink = {
  id: string;
  projectId: string;
  awsAccountId: string;
  linkedById: string;
  linkedAt: string;
  awsAccount: {
    id: string;
    awsAccountId: string;
    accountName: string;
    defaultRegion: string;
  };
};

export type ProjectResourceTag = {
  tagKey: string;
  tagValue: string;
};

export type ProjectResourceItem = {
  id: string;
  resourceName: string | null;
  resourceIdentifier: string;
  resourceType: string;
  region: string | null;
  awsAccount: CloudResourceAwsAccount | null;
  environment: string | null;
  tags: ProjectResourceTag[];
};

export type ProjectAwsAccountItem = {
  id: string;
  awsAccountId: string;
  accountName: string;
  defaultRegion: string;
};

export type ProjectStats = {
  resources: number;
  servicesCount: number;
  costMtd: string;
  costMtdChangePct: number;
  membersCount: number;
  ownersCount: number;
  editorsCount: number;
  budgetUsedPct: number;
  remainingBudget: string | null;
};

export type GetOneProjectResponse = {
  id: string;
  projectName: string;
  projectCode: string;
  description: string | null;
  businessDepartment: Department;
  technicalDepartment: Department;
  monthlyBudget: string | null;
  budgetCurrency: string;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;

  createdBy: ProjectCreatedBy;

  environment: Environment[];
  tags: string[];

  awsAccounts: ProjectAwsAccountItem[];
  members: ProjectMember[];
  resources: ProjectResourceItem[];

  stats: ProjectStats;
};

//Cloud Resource API Types
export type ResourceSource = 'MANUAL' | 'AWS_CONFIG';
export type Environment = 'DEV' | 'UAT' | 'STAGING' | 'PRODUCTION';

export type CloudResourceSortField =
  | 'resourceName'
  | 'resourceIdentifier'
  | 'resourceType'
  | 'region'
  | 'createdAt'
  | 'updatedAt'
  | 'lastSyncedAt';

export type CloudResourceAwsAccount = {
  id: string;
  awsAccountId: string;
  accountName: string;
};

export type CloudResourceResponse = {
  id: string;
  awsAccountId: string;
  projectId: string | null;

  resourceIdentifier: string;
  resourceArn: string | null;
  resourceName: string | null;
  resourceType: string;

  region: string;
  availabilityZone: string | null;
  resourceStatus: string | null;

  source: 'MANUAL' | 'AWS_CONFIG';
  environment: Environment | null;

  ownerId: string | null;
  description: string | null;
  configuration: Record<string, unknown> | null;

  awsCaptureTime: string | null;
  lastSyncedAt: string;

  isDeleted: boolean;
  deletedAt: string | null;

  createdAt: string;
  updatedAt: string;

  awsAccount: CloudResourceAwsAccount;
};

export type CloudResourcePagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
export type CloudResourceSummary = {
  EC2: number;
  RDS: number;
  S3: number;
  LAMBDA: number;
  EKS: number;
  LOAD_BALANCER: number;
  WAF: number;
  CDN: number;
  NETWORKING: number;
  OTHER: number;
};
export type GetCloudResourcesResponse = {
  items: CloudResourceResponse[];
  pagination: CloudResourcePagination;
  summary: CloudResourceSummary;
};

export type ResourceService =
  | 'EC2'
  | 'RDS'
  | 'S3'
  | 'LAMBDA'
  | 'EKS'
  | 'LOAD_BALANCER'
  | 'WAF'
  | 'CDN'
  | 'NETWORKING'
  | 'OTHER';
export type GetCloudResourcesQuery = {
  page?: number;
  limit?: number;

  search?: string;

  awsAccountId?: string;

  projectId?: string;
  ownerId?: string;

  service?: ResourceService;
  resourceType?: string;
  region?: string;

  source?: ResourceSource;
  environment?: Environment;

  isDeleted?: boolean;
  unassigned?: boolean;

  sortBy?: CloudResourceSortField;
  order?: SortOrder;
};
export type CloudResourceUpdateRequest = {
  projectId?: string | null;
  ownerId?: string | null;
  environment?: Environment | null;
  description?: string | null;
};

//ผูก Cloud Resource กับ Project
export type AddResourceToProjectRequest = {
  resourceId: string;
};

export type GetResourcesByAwsAccountRequest = {
  awsAccountId: string; // UUID ของ aws_accounts
};

export type CloudResourceOption = {
  id: string;
  resourceIdentifier: string;
  resourceName: string | null;
  resourceType: string;
  region: string;
  projectId: string | null;
  awsAccountId: string;
};

//AWS Account API Types
export type AwsConnectionStatus =
  | 'PENDING'
  | 'CONNECTED'
  | 'FAILED'
  | 'DISCONNECTED';

export type AwsAccountResponse = {
  id: string;
  awsAccountId: string;
  accountName: string;
  ownerDepartment: Department;
  defaultRegion: string;

  roleArn: string | null;
  externalId: string | null;

  connectionStatus: AwsConnectionStatus;
  verifiedAt: string | null;
  connectionError: string | null;

  isActive: boolean;

  lastConfigSyncedAt: string | null;
  lastCostSyncedAt: string | null;
  lastTagSyncedAt: string | null;

  createdAt: string;
  updatedAt: string;

  costMtd: string;
  totalCost: string;
  costCurrency: string;

  _count: {
    resources: number;
  };
};

export type GetAwsAccountsResponse = {
  items: AwsAccountResponse[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type AvailableAwsAccountResponse = {
  id: string;
  awsAccountId: string;
  accountName: string;
  ownerDepartment: Department;
  defaultRegion: string;
};

export type GetAvailableAwsAccountsResponse = {
  data: AvailableAwsAccountResponse[];
};

export type CreateAwsAccountRequest = {
  accountName: string;
  awsAccountId: string;
  ownerDepartment: Department;
  defaultRegion: string;
  roleArn?: string;
  isActive?: boolean;
};

export type UpdateAwsAccountRequest = {
  awsAccountId?: string;
  accountName?: string;
  ownerDepartment?: Department;
  defaultRegion?: string;
  roleArn?: string;
  isActive?: boolean;
};

export type VerifyAwsAccountResponse = {
  message: string;
  account: {
    id: string;
    awsAccountId: string;
    accountName: string;
    connectionStatus: AwsConnectionStatus;
    verifiedAt: string;
  };
  identity: {
    Account?: string;
    Arn?: string;
    UserId?: string;
  };
};

//Member project
export type AddProjectMemberRequest = {
  userId: string;
  memberRole: ProjectMemberRole;
};
export type UpdateProjectMemberRoleRequest = {
  memberRole: ProjectMemberRole;
};
export type UserOption = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: Department;
  status: 'ACTIVE' | 'INACTIVE';
};

//sync aws
export type SyncConfigResult = {
  syncJobId: string;
  accountId: string;
  received: number;
  created: number;
  updated: number;
  restored: number;
  deleted: number;
  syncedAt: string;
};

export type SyncTagResult = {
  syncJobId: string;
  accountId: string;
  received: number;
  matched: number;
  created: number;
  updated: number;
  deleted: number;
  skipped: number;
  failed: number;
  syncedAt: string;
};

export type SyncCostResult = {
  syncJobId: string;
  accountId: string;
  periodStart: string;
  periodEnd: string;
  received: number;
  created: number;
  updated: number;
  failed: number;
  syncedAt: string;
};

export type SyncAllAwsResponse = {
  message: string;
  awsAccountId: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;

  results: {
    config: SyncConfigResult;
    tags: SyncTagResult;
    cost: SyncCostResult;
  };
};

export type UserOptionResponse = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  department: Department;
};

export type GetOptionUsersResponse = UserOptionResponse[];
