'use client';

import { Logo } from '@/components/logo';
import { MainNav } from './main-nav';
import { UserNav } from './user-nav';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { UserNotifications } from '../user-notifications';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // This check ensures localStorage is only accessed on the client
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');

    const checkLogin = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    }
    window.addEventListener('storage', checkLogin);
    return () => window.removeEventListener('storage', checkLogin);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center">
        <Logo />
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-2">
          {isLoggedIn === null ? null : isLoggedIn ? (
            <>
              <UserNotifications />
              <UserNav />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Registrarse</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
