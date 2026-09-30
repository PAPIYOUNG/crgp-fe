import type { ResourceSource } from '@/lib/api/api-type';

export const serviceStats = [
  {
    key: 'EC2',
    label: 'EC2',
    className: 'text-orange-600 dark:text-orange-400',
  },
  {
    key: 'RDS',
    label: 'RDS',
    className: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'S3',
    label: 'S3',
    className: 'text-green-600 dark:text-green-400',
  },
  {
    key: 'LAMBDA',
    label: 'Lambda',
    className: 'text-orange-600 dark:text-orange-400',
  },
  {
    key: 'EKS',
    label: 'EKS',
    className: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    key: 'LOAD_BALANCER',
    label: 'Load Balancer',
    className: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    key: 'WAF',
    label: 'WAF',
    className: 'text-red-600 dark:text-red-400',
  },
  {
    key: 'CDN',
    label: 'CDN',
    className: 'text-violet-600 dark:text-violet-400',
  },
  {
    key: 'NETWORKING',
    label: 'Networking',
    className: 'text-purple-600 dark:text-purple-400',
  },
  {
    key: 'OTHER',
    label: 'Other',
    className: 'text-foreground',
  },
] as const;

export const providerLabels: Record<string, string> = {
  AWS: 'AWS',
  AZURE: 'Azure',
  GCP: 'Google Cloud',
  ON_PREM: 'On-Premises',
  OTHER: 'Other',
};

export const serviceLabels: Record<string, string> = {
  EC2: 'EC2',
  RDS: 'RDS',
  S3: 'S3',
  LAMBDA: 'Lambda',
  EKS: 'EKS',
  NETWORKING: 'Networking',
  ELASTICLOADBALANCING: 'Load Balancer',
  ELASTICLOADBALANCINGV2: 'Load Balancer',
  WAF: 'WAF',
  WAFV2: 'WAF',
  CLOUDFRONT: 'CloudFront',
  ROUTE53RESOLVER: 'Route53 Resolver',
  CASSANDRA: 'Cassandra',
  KMS: 'KMS',
  IAM: 'IAM',
  ATHENA: 'Athena',
};

export const serviceBadgeStyles: Record<string, string> = {
  EC2: 'border-orange-200 text-orange-700 dark:border-orange-500/30 dark:text-orange-400',

  RDS: 'border-blue-200 text-blue-700 dark:border-blue-500/30 dark:text-blue-400',

  S3: 'border-green-200 text-green-700 dark:border-green-500/30 dark:text-green-400',

  LAMBDA:
    'border-orange-200 text-orange-700 dark:border-orange-500/30 dark:text-orange-400',

  EKS: 'border-indigo-200 text-indigo-700 dark:border-indigo-500/30 dark:text-indigo-400',

  NETWORKING:
    'border-purple-200 text-purple-700 dark:border-purple-500/30 dark:text-purple-400',

  CASSANDRA:
    'border-violet-200 text-violet-700 dark:border-violet-500/30 dark:text-violet-400',

  KMS: 'border-blue-200 text-blue-700 dark:border-blue-500/30 dark:text-blue-400',

  IAM: 'border-amber-200 text-amber-700 dark:border-amber-500/30 dark:text-amber-400',

  ATHENA:
    'border-cyan-200 text-cyan-700 dark:border-cyan-500/30 dark:text-cyan-400',

  LOAD_BALANCER:
    'border-cyan-200 text-cyan-700 dark:border-cyan-500/30 dark:text-cyan-400',

  WAF: 'border-red-200 text-red-700 dark:border-red-500/30 dark:text-red-400',

  CDN: 'border-violet-200 text-violet-700 dark:border-violet-500/30 dark:text-violet-400',
};

export function getServiceSegment(resourceType: string) {
  return resourceType.split('::')[1]?.toUpperCase() ?? 'OTHER';
}

export function getStatCategory(resourceType: string) {
  switch (resourceType) {
    case 'AWS::EC2::Instance':
      return 'EC2';

    case 'AWS::RDS::DBInstance':
    case 'AWS::RDS::DBCluster':
      return 'RDS';

    case 'AWS::S3::Bucket':
      return 'S3';

    case 'AWS::Lambda::Function':
      return 'LAMBDA';

    case 'AWS::EKS::Cluster':
      return 'EKS';

    case 'AWS::ElasticLoadBalancing::LoadBalancer':
    case 'AWS::ElasticLoadBalancingV2::LoadBalancer':
      return 'LOAD_BALANCER';

    case 'AWS::WAF::WebACL':
    case 'AWS::WAFv2::WebACL':
      return 'WAF';

    case 'AWS::CloudFront::Distribution':
      return 'CDN';

    case 'AWS::EC2::RouteTable':
    case 'AWS::EC2::NetworkAcl':
    case 'AWS::EC2::SecurityGroup':
    case 'AWS::EC2::Subnet':
    case 'AWS::EC2::VPC':
    case 'AWS::EC2::InternetGateway':
    case 'AWS::EC2::NatGateway':
    case 'AWS::EC2::SubnetRouteTableAssociation':
    case 'AWS::Route53Resolver::ResolverRule':
    case 'AWS::Route53Resolver::ResolverRuleAssociation':
      return 'NETWORKING';

    default:
      return 'OTHER';
  }
}

export function getServiceDisplay(resourceType: string) {
  const category = getStatCategory(resourceType);

  const categoryLabel = serviceStats.find(
    (stat) => stat.key === category,
  )?.label;

  if (category !== 'OTHER' && categoryLabel) {
    return {
      label: categoryLabel,

      className:
        serviceBadgeStyles[category] ?? 'border-border text-muted-foreground',
    };
  }

  const segment = getServiceSegment(resourceType);

  return {
    label: serviceLabels[segment] ?? segment,

    className:
      serviceBadgeStyles[segment] ?? 'border-border text-muted-foreground',
  };
}

export function getSourceDisplay(source: ResourceSource) {
  if (source === 'MANUAL') {
    return {
      label: 'Manual',
      className:
        'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    };
  }

  return {
    label: 'Cloud-Sync',
    className:
      'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  };
}

export function getTagComplianceStyle(isCompliant: boolean) {
  if (isCompliant) {
    return {
      label: 'Compliant',
      className:
        'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    };
  }

  return {
    label: 'Non-Compliant',
    className: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  };
}

export function getStatusStyle(status: string | null) {
  const normalized = status?.toLowerCase() ?? '';

  if (
    ['running', 'available', 'active'].some((item) => normalized.includes(item))
  ) {
    return {
      dot: 'bg-green-500',

      className:
        'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    };
  }

  if (
    ['stopped', 'pending', 'stopping'].some((item) => normalized.includes(item))
  ) {
    return {
      dot: 'bg-amber-500',

      className:
        'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    };
  }

  if (
    ['terminated', 'error', 'failed', 'deleted'].some((item) =>
      normalized.includes(item),
    )
  ) {
    return {
      dot: 'bg-red-500',

      className: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    };
  }

  return {
    dot: 'bg-muted-foreground',

    className: 'bg-muted text-muted-foreground',
  };
}
