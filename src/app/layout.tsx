import type { Metadata } from 'next';
import './globals.css';

import { notoSans } from '@/styles/font';
import { cn } from '@/lib/utils';

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
      className={cn('antialiased', 'font-sans', 'font-sans', notoSans.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
