'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Scissors,
  Calendar,
  Settings,
  Contact,
  Menu as MenuIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/services', label: 'Services', icon: Scissors },
  { href: '/appointments', label: 'Appointments', icon: Calendar },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/contact', label: 'Feedback & Contact', icon: Contact },
];

export function MainNav() {
  const pathname = usePathname();

  const isCurrent = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <MenuIcon className="h-6 w-6" />
          <span className="sr-only">Open Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <div className="flex flex-col space-y-4 p-4">
          <h2 className="text-lg font-semibold">Menu</h2>
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors ${
                      isCurrent(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </SheetClose>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
