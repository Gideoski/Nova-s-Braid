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
    <div className="relative flex items-center justify-center h-screen w-screen bg-black overflow-hidden">
      <style jsx>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; transform: scale(0.95); }
          20%, 80% { opacity: 1; transform: scale(1); }
        }
        .splash-animation {
          animation: fadeInOut 5s ease-in-out forwards;
        }

        @keyframes sparkle {
          0%, 100% {
            text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px var(--primary), 0 0 40px var(--primary), 0 0 50px var(--primary);
          }
          50% {
            text-shadow: 0 0 20px #fff, 0 0 30px #fff, 0 0 40px var(--primary), 0 0 50px var(--primary), 0 0 60px var(--primary);
          }
        }
        
        .sparkle-text {
          font-family: 'Lora', serif;
          font-weight: 700;
          color: #fff;
          animation: sparkle 2s infinite alternate;
          text-align: center;
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
        <div className="absolute inset-0 flex items-center justify-center">
           <h1 className="sparkle-text text-4xl md:text-6xl p-4">
            NOVA'S BRAID GAME
          </h1>
        </div>
      </div>
    </div>
  );
}
