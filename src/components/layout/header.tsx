'use client';

import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/lib/action/auth.action';
import Link from 'next/link';
import { Session } from 'next-auth';

const TitleItem = [
  { title: 'Dashboard', href: '/' },
  { title: 'Project', href: '/project' },
  { title: 'Cloud Resources', href: '/cloud-resources' },
  { title: 'AWS Accounts', href: '/aws-accounts' },
  { title: 'Cost Analysis', href: '/cost-analysis' },
  { title: 'Activity Logs', href: '/activity-logs' },
  { title: 'User Management', href: '/users' },
  { title: 'Setting', href: '/profile' },
];

type HeaderProps = {
  user: Session['user'];
};
export default function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const titleItem = TitleItem.find((item) => {
    if (item.href === '/') {
      return pathname === '/';
    }

    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });
  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold text-foreground">
          {titleItem?.title ?? 'Unknown'}
        </h1>
        <Button variant="ghost" className="relative size-10 rounded-full p-0">
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="flex items-center gap-2 rounded-md px-1.5 py-1 outline-none hover:bg-muted">
              <Avatar>
                <AvatarImage
                  src={user.avatarUrl ?? undefined}
                  alt={`${user.firstName} ${user.lastName}`}
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.firstName.split('')[0] + user.lastName.split('')[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">
                {user.firstName + ' ' + user.lastName}
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href="/profile" />}>
            <User />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={async () => {
              await logoutAction();
            }}
          >
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
