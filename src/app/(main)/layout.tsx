import { MainNav } from "@/components/main-nav";
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="md:hidden flex items-center justify-between p-2 border-b bg-background sticky top-0 z-20">
        <SidebarTrigger />
        <Link href="/home">
          <Logo />
        </Link>
        <div className="w-8" />
      </div>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
