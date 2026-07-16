import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/app/lib/util';
import { notoSans } from '@/app/style/font';

export const metadata: Metadata = {
  title: { template: '%s | CRGP', default: 'CRGP' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn('antialiased', 'font-sans', notoSans.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
