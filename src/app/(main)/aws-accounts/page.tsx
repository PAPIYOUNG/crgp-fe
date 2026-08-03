import { Metadata } from 'next';

import type {
  AwsAccountCardData,
  AwsAccountHealth,
} from '@/components/feature/aws-account/AwsAccountCard';
import CreateAwsAccountForm from '@/components/feature/aws-account/CreateAwsAccountForm';
import { AwsAccountApi } from '@/lib/api/aws-account.api';
import AwsAccountCard from '@/components/feature/aws-account/AwsAccountCard';
import VerifyAwsAccount from '@/components/feature/aws-account/VerifyAwsAccount';

export const metadata: Metadata = {
  title: 'AWS Accounts',
};

// CONNECTED + active + no error → HEALTHY
// PENDING                        → WARNING
// FAILED / DISCONNECTED / error  → CRITICAL
// inactive                       → CRITICAL

function getAwsAccountHealth(account: {
  connectionStatus: string;
  isActive: boolean;
  connectionError: string | null;
}): AwsAccountHealth {
  if (!account.isActive) {
    return 'CRITICAL';
  }

  if (
    account.connectionStatus === 'FAILED' ||
    account.connectionStatus === 'DISCONNECTED' ||
    account.connectionError
  ) {
    return 'CRITICAL';
  }

  if (account.connectionStatus === 'PENDING') {
    return 'WARNING';
  }

  return 'HEALTHY';
}
export default async function AwsAccountList() {
  const response = await AwsAccountApi.getAwsAccountList();

  const accounts = response.items.map((rawAccount) => ({
    rawAccount,

    cardData: {
      id: rawAccount.id,
      name: rawAccount.accountName,

      accountId: rawAccount.awsAccountId,
      owner: rawAccount.ownerDepartment,
      resourceCount: rawAccount._count.resources,
      defaultRegion: rawAccount.defaultRegion,

      health: getAwsAccountHealth(rawAccount),

      costMtd: Number(rawAccount.costMtd ?? 0),
      totalCost: Number(rawAccount.totalCost ?? 0),
      costCurrency: rawAccount.costCurrency ?? 'USD',

      resourcesHref: `/cloud-resources?awsAccountId=${rawAccount.id}`,
    } satisfies AwsAccountCardData,
  }));

  const healthyCount = accounts.filter(
    (account) => account.cardData.health === 'HEALTHY',
  ).length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            AWS Accounts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {accounts.length} account{accounts.length === 1 ? '' : 's'}{' '}
            connected
            {accounts.length > 0 && ` · ${healthyCount} healthy`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <CreateAwsAccountForm />
          <VerifyAwsAccount accounts={response.items} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map(({ cardData, rawAccount }) => (
          <AwsAccountCard
            key={rawAccount.id}
            account={cardData}
            rawAccount={rawAccount}
          />
        ))}

        <CreateAwsAccountForm variant="tile" />
      </div>
    </div>
  );
}
