'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SplashLogo } from '@/components/splash-logo';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="animation-fade-in">
        <SplashLogo />
      </div>
    </div>
  );
}
