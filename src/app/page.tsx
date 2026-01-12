'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/welcome');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      {/* You can add a loader here if you want */}
    </div>
  );
}
