'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/main');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative flex items-center justify-center h-screen w-screen bg-black">
      <style jsx>{`
        @keyframes fadeInOut {
          0%,
          100% {
            opacity: 0;
            transform: scale(0.95);
          }
          20%,
          80% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .splash-animation {
          animation: fadeInOut 5s ease-in-out forwards;
        }
      `}</style>
      <div className="splash-animation w-full h-full">
        <Image
          src="/images/gallery/Welcome page.jpeg"
          alt="NOVA'S BRAID GAME Welcome"
          layout="fill"
          objectFit="contain"
          priority
        />
      </div>
    </div>
  );
}
