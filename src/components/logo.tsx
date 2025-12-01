import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'flex items-center gap-2 text-primary transition-opacity hover:opacity-80',
        className
      )}
    >
      <PawPrint className="h-7 w-7 sm:h-8 sm:w-8" />
      <span className="text-2xl font-bold tracking-tight font-headline sm:text-3xl">
        PetFind
      </span>
    </Link>
  );
}
