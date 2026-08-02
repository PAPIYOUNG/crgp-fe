'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Cloud,
  Database,
  DollarSign,
  FolderKanban,
  LayoutGrid,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';
import { logoutAction } from '@/lib/action/auth.action';

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/', icon: LayoutGrid }],
  },
  {
    label: 'Cloud Management',
    items: [
      { label: 'Projects', href: '/project', icon: FolderKanban },
      { label: 'Cloud Resources', href: '/cloud-resources', icon: Cloud },
      { label: 'AWS Accounts', href: '/aws-accounts', icon: Database },
    ],
  },
  {
    label: 'Financials',
    items: [
      { label: 'Cost Analysis', href: '/cost-analysis', icon: DollarSign },
    ],
  },
  {
    label: 'Operations',
    items: [{ label: 'Activity Logs', href: '/activity-logs', icon: Activity }],
  },
  {
    label: 'Administration',
    items: [
      { label: 'User Management', href: '/users', icon: Users },
      { label: 'Settings', href: '/profile', icon: Settings },
    ],
  },
];

export default function SidebarMenu() {
  const pathname = usePathname();

  return (
    <aside className=" flex min-h-screen w-72 shrink-0 flex-col bg-[#493985] px-5 py-8 text-white">
      <div className="flex items-center gap-3 px-2">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F6AA1C]">
          <Cloud className="size-5 text-[#493985]" />
        </div>

        <div>
          <h2 className="text-lg font-bold leading-none">CRGP</h2>
          <p className="mt-1 text-xs text-white/60">Cloud Governance</p>
        </div>
      </div>

      <nav className="mt-10 flex flex-1 flex-col gap-7 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-xs font-semibold tracking-wider text-white/40 uppercase">
              {group.label}
            </p>

            <div className="mt-3 flex flex-col gap-1">
              {group.items.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      isActive
                        ? 'flex items-center gap-3 rounded-xl border border-white/30 bg-white/10 px-3 py-2.5 text-sm font-bold text-white'
                        : 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-white/70 hover:bg-white/5 hover:text-white'
                    }
                  >
                    <item.icon
                      className={
                        isActive
                          ? 'size-4.5 text-[#F6AA1C]'
                          : 'size-4.5 text-white/70'
                      }
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div
        className="mt-6 border-t border-white/10 pt-5"
        onClick={async () => {
          await logoutAction();
        }}
      >
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-white/70 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-4.5" />
          Log out
        </button>
      </div>
    </aside>
  );
}
