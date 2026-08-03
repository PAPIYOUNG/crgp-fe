import Header from '@/components/layout/header';
import SidebarMenu from '@/components/layout/sidebar-menu';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Toaster } from 'sonner';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      <div className="w-full">
        <Header user={session?.user} />
        <div>{children}</div>
        <Toaster richColors position="top-center" />
      </div>
    </div>
  );
}
