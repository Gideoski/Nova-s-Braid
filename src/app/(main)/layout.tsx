
import { MainNav } from "@/components/main-nav";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-background/95 backdrop-blur-sm sticky top-0 z-50 w-full border-b">
        <div className="container flex h-14 items-center">
          <Link href="/home" className="mr-auto flex items-center gap-2">
            <Logo />
          </Link>
          <MainNav />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
