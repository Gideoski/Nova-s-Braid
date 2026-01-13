
'use client';

import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Instagram } from 'lucide-react';
import { MainNav } from "@/components/main-nav";

export function AppHeader() {
  return (
    <header className="bg-background/95 backdrop-blur-sm sticky top-0 z-50 w-full border-b">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
           <div className="flex items-center justify-center h-10 w-10 border-2 border-primary rounded-full">
              <Instagram className="h-5 w-5 text-primary" />
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
  );
}
