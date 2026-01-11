import Image from 'next/image';

export function SplashLogo() {
  return (
    <div className="flex flex-col items-center">
      <Image
        src="/images/gallery/Nova's braid logo.jpeg"
        alt="Nova's Braid Game Logo"
        width={300}
        height={300}
        className="rounded-full"
        priority
      />
    </div>
  );
}
