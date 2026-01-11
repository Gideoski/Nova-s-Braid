'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="h-screen w-full relative">
      <Image
        src="/images/gallery/Welcome page.jpeg"
        alt="Welcome to Nova's Braid Game"
        fill
        style={{ objectFit: 'contain' }}
        className="animation-fade-in"
        priority
      />
    </div>
  );
}
