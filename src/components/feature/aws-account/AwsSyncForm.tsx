'use client';

import { useState, useTransition } from 'react';
import { CloudSync } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { syncAllAwsAction } from '@/lib/action/aws-sync.action';
import { cn } from '@/lib/utils';

type AwsSyncFormProps = {
  awsAccountId: string;
};

export default function AwsSyncForm({ awsAccountId }: AwsSyncFormProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSync = () => {
    // กด sync รอบใหม่ ต้องล้าง error เก่าก่อน
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const result = await syncAllAwsAction(awsAccountId);

        if (!result.success) {
          setErrorMessage(result.message);

          toast.error('AWS sync failed', {
            description: result.message,
          });

          return;
        }

        // สำเร็จต้องล้าง error ที่อาจค้างอยู่
        setErrorMessage(null);

        toast.success('AWS sync completed', {
          description:
            'AWS Config, resource tags, and cost data were synchronized successfully.',
          duration: 3000,
        });

        router.refresh();
      } catch {
        const message = 'An unexpected error occurred during AWS sync.';

        setErrorMessage(message);

        toast.error('AWS sync failed', {
          description: message,
        });
      }
    });
  };

  return (
    <div className="w-full">
      <Button
        type="button"
        onClick={handleSync}
        disabled={isPending}
        className="h-7 w-full rounded-full bg-[#493985] px-4 text-xs text-white shadow-sm hover:bg-[#3d2f72] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <CloudSync
          className={isPending ? 'size-3.5 animate-spin' : 'size-3.5'}
        />

        {isPending ? 'Syncing...' : 'Sync now'}
      </Button>

      {errorMessage && !isPending && (
        <p
          className={cn(
            'mt-2 min-h-5 text-xs leading-5 text-destructive',
            !errorMessage && 'invisible',
          )}
        >
          {errorMessage ?? 'No error'}
        </p>
      )}
    </div>
  );
}
