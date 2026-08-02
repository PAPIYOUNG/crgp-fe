import { Metadata } from 'next';
import { Bell, KeyRound, Link2, Shield, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AvatarUpload from '@/components/feature/profile/AvatarUpload';
import EditProfileForm from '@/components/feature/profile/EditProfileForm';
import EditPasswordForm from '@/components/feature/profile/EditPasswordForm';
import { departments } from '@/lib/constants/department';

export const metadata: Metadata = {
  title: 'Profile',
};

export const SETTINGS_NAV = [
  { label: 'Profile', icon: User, active: true },
  { label: 'Security [Phase2 dev]', icon: Shield, active: false },
  { label: 'Notifications [Phase2 dev]', icon: Bell, active: false },
  { label: 'API Keys [Phase2 dev]', icon: KeyRound, active: false },
  { label: 'Integrations [Phase2 dev]', icon: Link2, active: false },
];

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { user } = session;
  return (
    <div className="p-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account preferences and platform configuration
        </p>
      </div>

      <div className="mt-8 flex items-start gap-8">
        <nav className="w-56 shrink-0">
          <div className="flex flex-col gap-1">
            {SETTINGS_NAV.map((item) => (
              <div
                key={item.label}
                className={
                  item.active
                    ? 'flex items-center gap-2.5 rounded-lg bg-[#493985]/10 px-3 py-2 text-sm font-semibold text-[#493985]'
                    : 'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              >
                <item.icon className="size-4" />
                {item.label}
              </div>
            ))}
          </div>
        </nav>

        <div className="flex-1 space-y-6">
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold">Profile Information</h2>
            <Separator className="mt-4" />

            <div className="mt-6 ml-5 flex items-center gap-10">
              <div className="relative shrink-0">
                <Avatar className="size-20">
                  <AvatarImage
                    src={user.avatarUrl ?? undefined}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="object-cover"
                  />

                  <AvatarFallback className="bg-[#2d2150] text-lg font-semibold text-white">
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <AvatarUpload
                  avatarUrl={user.avatarUrl}
                  fallback={`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}
                />
              </div>

              <div>
                <p className="text-sm font-medium">Profile Photo</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Your initials are used when no photo is set
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG or WebP. Maximum size 1 MB.
                </p>
              </div>
            </div>

            <EditProfileForm
              firstName={user.firstName}
              lastName={user.lastName}
              email={user.email}
              role={user.role}
              status={user.status}
              department={user.department}
              departments={departments}
            />
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <EditPasswordForm />
          </section>
        </div>
      </div>
    </div>
  );
}
