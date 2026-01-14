
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu as MenuIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const navItems = [
  { href: '/main', label: 'Home'},
  { href: '/services', label: 'Services'},
  { href: '/gallery', label: 'Gallery'},
  { href: '/contact', label: 'Contact'},
  { href: '/settings', label: 'Settings'},
  { href: '/admin/appointments', label: 'Admin'},
];

export function MainNav() {
  const pathname = usePathname();

  const isCurrent = (href: string) => {
    if (href === '/main') {
      return pathname === '/main' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
    {/* Desktop Nav */}
    <nav className="hidden md:flex gap-6 text-lg font-medium">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`text-primary transition-colors hover:text-primary/80 ${
              isCurrent(item.href)
                ? 'underline underline-offset-4'
                : ''
            }`}
          >
            {item.label}
          </Link>
        ))}
    </nav>
    
    {/* Mobile Nav */}
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Open Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col space-y-4 p-4">
            <nav className="flex flex-col space-y-2">
              {[...navItems, { href: '/appointments', label: 'Book Appointment' }].map((item) => {
                return (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors ${
                        isCurrent(item.href)
                          ? 'bg-accent text-primary'
                          : 'text-primary hover:bg-accent'
                      }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
    </>
  );
}
