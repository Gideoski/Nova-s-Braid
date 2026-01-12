'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This component ensures a clean, immediate redirect to the /welcome page.
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/welcome');
  }, [router]);

  // Return a minimal loader or an empty div to prevent any layout flash.
  return null;
}
