
'use client';

import { usePathname } from 'next/navigation';
import { AppHeader } from '@/components/app-header';

export function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWelcomePage = pathname === '/welcome';

  if (isWelcomePage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
