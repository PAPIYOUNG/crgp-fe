import SideBarAuth from '@/components/layout/sidebar-auth';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(420px,30%)_1fr]">
      {/* ฝั่งซ้าย */}
      <SideBarAuth />

      {/* ฝั่งขวา */}
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
