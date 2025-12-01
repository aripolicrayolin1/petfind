'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '../../lib/utils'; // Corregido: Importación relativa
import { PawPrint } from 'lucide-react';

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  const routes = [
    { href: '/', label: 'Inicio' },
    { href: '/adopt', label: 'Adoptar' },
    { href: '/shelters', label: 'Refugios' },
    { href: '/scan', label: 'Escanear QR' },
  ];

  return (
    <nav
      className={cn('hidden md:flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === route.href
              ? 'text-foreground font-semibold'
              : 'text-muted-foreground'
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
