'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This component ensures a clean, immediate redirect to the /welcome page
// without rendering any other layout elements first.
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/welcome');
  }, [router]);

  // Return a minimal loader or an empty div to prevent any layout flash.
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      {/* You can add a loader here if you want */}
    </div>
  );
}
