'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/main');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-background splash-animation">
      <div className="text-center">
        <style jsx>{`
          @keyframes fadeInOut {
            0%, 100% { opacity: 0; transform: scale(0.95); }
            20%, 80% { opacity: 1; transform: scale(1); }
          }
          .splash-animation {
            animation: fadeInOut 5s ease-in-out forwards;
          }
        `}</style>
        <Logo />
      </div>
    </div>
  );
}
