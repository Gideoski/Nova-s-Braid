
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { MainNav } from "@/components/main-nav";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Instagram } from 'lucide-react';

export const metadata: Metadata = {
  title: "NOVA'S BRAID GAME",
  description: 'Professional braiding services by Nova. Available for all kinds of braids in ABUAD, Ado-Ekiti.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lora:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <div className="flex flex-col min-h-screen">
              <header className="bg-background/95 backdrop-blur-sm sticky top-0 z-50 w-full border-b">
                <div className="container flex h-20 items-center justify-between">
                  <Link href="/" className="flex items-center gap-2">
                     <div className="flex items-center justify-center h-10 w-10 border-2 border-foreground rounded-full">
                        <Instagram className="h-5 w-5 text-foreground" />
                    </div>
                  </Link>
                  <div className="hidden md:flex flex-1 justify-center">
                    <MainNav />
                  </div>
                  <div className="hidden md:flex justify-end">
                     <Button asChild>
                        <Link href="/appointments">Book Appointment</Link>
                      </Button>
                  </div>
                  <div className="md:hidden">
                    <MainNav />
                  </div>
                </div>
              </header>
              <main className="flex-1">{children}</main>
            </div>
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
